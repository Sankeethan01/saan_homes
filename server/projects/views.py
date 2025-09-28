# projects/views.py
from rest_framework import viewsets, permissions, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.http import FileResponse
import json
import os
import pandas as pd
import numpy as np
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.http import FileResponse
import uuid
from django.utils import timezone
from datetime import datetime, timedelta
from .boq_template_generator import generate_boq_template

from .models import (
    Project,
    Step,
    ProgressLog,
    Bill,
    Invoice,
    VRVideo,
    SupervisorNote,
    ProgressLogMedia,
    ProjectMedia,
)
from .serializers import (
    ProjectSerializer,
    ProjectListSerializer,
    StepSerializer,
    ProgressLogSerializer,
    BillSerializer,
    InvoiceSerializer,
    VRVideoSerializer,
    SupervisorNoteSerializer,
    ProgressLogMediaSerializer,
    ProjectMediaSerializer,
)


# ──────────────────────────────────────────────
# File Cleanup Utilities
# ──────────────────────────────────────────────
def cleanup_old_temp_files(max_age_hours=24):
    """
    Clean up old temporary BOQ files from the temp_boq directory.
    
    Args:
        max_age_hours (int): Maximum age of files to keep in hours
    
    Returns:
        dict: Cleanup statistics
    """
    temp_boq_dir = os.path.join(settings.MEDIA_ROOT, 'temp_boq')
    
    if not os.path.exists(temp_boq_dir):
        return {'deleted': 0, 'size_freed': 0, 'errors': []}
    
    cutoff_time = datetime.now() - timedelta(hours=max_age_hours)
    deleted_count = 0
    size_freed = 0
    errors = []
    
    try:
        files = os.listdir(temp_boq_dir)
        for filename in files:
            file_path = os.path.join(temp_boq_dir, filename)
            
            if os.path.isfile(file_path):
                try:
                    stat = os.stat(file_path)
                    file_mtime = datetime.fromtimestamp(stat.st_mtime)
                    
                    if file_mtime < cutoff_time:
                        size_freed += stat.st_size
                        os.remove(file_path)
                        deleted_count += 1
                        print(f"Cleaned up old temp file: {filename}")
                except OSError as e:
                    errors.append(f"Error deleting {filename}: {e}")
        
        # Remove empty directory
        if not os.listdir(temp_boq_dir):
            os.rmdir(temp_boq_dir)
            print(f"Removed empty temp_boq directory")
            
    except OSError as e:
        errors.append(f"Error accessing temp_boq directory: {e}")
    
    return {
        'deleted': deleted_count,
        'size_freed': size_freed,
        'errors': errors
    }


# ──────────────────────────────────────────────
# BOQ Parsing Utilities
# ──────────────────────────────────────────────
def parse_boq_file(file_path):
    """
    Parse a BOQ file using pandas and extract materials, quantities, and costs.
    Handles structured BOQ files with multiple steps, each containing multiple materials.
    
    Args:
        file_path: Path to the BOQ file
    
    Returns:
        dict: Dictionary containing parsed materials, steps, and budget
    """
    try:
        file_ext = os.path.splitext(file_path)[1].lower()
        
        # Handle different file formats
        if file_ext in ['.xlsx', '.xls']:
            # Get all sheet names
            xls = pd.ExcelFile(file_path)
            sheet_names = xls.sheet_names
            
            # Skip the first sheet if there are multiple sheets (assuming it's a cover page)
            if len(sheet_names) > 1:
                sheet_names = sheet_names[1:]
                
            # Try to parse each sheet until we find one with valid data
            for sheet_name in sheet_names:
                try:
                    # Read the sheet
                    df = pd.read_excel(file_path, sheet_name=sheet_name)
                    
                    # Skip empty sheets
                    if df.empty:
                        continue
                        
                    # Clean up column names and data
                    df.columns = [str(col).strip().lower() for col in df.columns]
                    
                    # Try to identify relevant columns
                    material_col = None
                    quantity_col = None
                    unit_col = None
                    rate_col = None
                    amount_col = None
                    
                    # Common column name patterns
                    material_patterns = ['description', 'item', 'material', 'particulars', 'work']
                    quantity_patterns = ['qty', 'quantity', 'nos', 'number', 'count']
                    unit_patterns = ['unit', 'uom', 'measure', 'units']
                    rate_patterns = ['rate', 'price', 'unit price', 'unit rate', 'cost per']
                    amount_patterns = ['amount', 'total', 'cost', 'value', 'sum']
                    
                    # Find columns by pattern matching
                    for col in df.columns:
                        col_lower = col.lower()
                        
                        if not material_col and any(pattern in col_lower for pattern in material_patterns):
                            material_col = col
                        
                        if not quantity_col and any(pattern in col_lower for pattern in quantity_patterns):
                            quantity_col = col
                            
                        if not unit_col and any(pattern in col_lower for pattern in unit_patterns):
                            unit_col = col
                            
                        if not rate_col and any(pattern in col_lower for pattern in rate_patterns):
                            rate_col = col
                            
                        if not amount_col and any(pattern in col_lower for pattern in amount_patterns):
                            amount_col = col
                    
                    # If we found the required columns, process this sheet
                    if material_col and quantity_col:
                        # Process with identified columns
                        materials = {}
                        total_budget = 0
                        
                        # Track identified steps and their materials
                        steps = []
                        current_step = None
                        step_materials = []
                        
                        # Common step name patterns to identify step headers
                        step_patterns = [
                            'step', 'phase', 'stage', 'foundation', 'structure', 'wall', 
                            'roof', 'electrical', 'plumbing', 'finish', 'floor', 'paint'
                        ]
                        
                        # Fallback construction phases if no explicit steps are found
                        construction_phases = {
                            "foundation": [],
                            "structure": [],
                            "walls_roofing": [],
                            "electrical_plumbing": [],
                            "finishing": [],
                            "other": []
                        }
                        
                        # Keywords to identify construction phases
                        phase_keywords = {
                            "foundation": ["foundation", "footing", "excavation", "concrete base", "pile", "basement", "ground", "soil"],
                            "structure": ["column", "beam", "slab", "concrete", "rcc", "structure", "frame", "steel", "reinforcement"],
                            "walls_roofing": ["wall", "brick", "block", "roof", "ceiling", "masonry", "partition", "plaster"],
                            "electrical_plumbing": ["electrical", "wiring", "plumbing", "pipe", "conduit", "switch", "socket", "fixture", "sanitary", "water", "drain"],
                            "finishing": ["paint", "tile", "floor", "finish", "polish", "door", "window", "glass", "fitting", "furniture", 
                                         "bedroom", "living", "dining", "kitchen", "bathroom", "toilet", "hall", "room", "master", 
                                         "ceramic", "marble", "granite", "wood", "laminate", "carpet", "parquet", "vinyl", "epoxy"]
                        }
                        
                        # Process each row in the dataframe
                        for _, row in df.iterrows():
                            material = str(row[material_col])
                            
                            # Skip empty rows
                            if not material.strip() or material.lower() in ['description', 'item', 'total', 'sl no', 'sl.no', 'sl. no.', 'sl no.', 'sl.no.']:
                                continue
                                
                            # Skip NaN values in description
                            if material.lower() == 'nan' or pd.isna(material):
                                continue
                                
                            # Check if this row is a step header
                            is_step_header = False
                            if len(material) < 50:  # Step headers are typically short
                                material_lower = material.lower()
                                # Check if it matches step patterns
                                if any(pattern in material_lower for pattern in step_patterns):
                                    # Additional checks to confirm it's a header (e.g., no quantity or all caps)
                                    if pd.isna(row.get(quantity_col)) or material.isupper() or material_lower.startswith('step'):
                                        is_step_header = True
                            
                            if is_step_header:
                                # If we already have a step with materials, save it
                                if current_step and step_materials:
                                    step_budget = sum(item["amount"] for item in step_materials)
                                    steps.append({
                                        "title": current_step,
                                        "materials": step_materials,
                                        "budget": step_budget
                                    })
                                
                                # Start a new step
                                current_step = material.strip()
                                step_materials = []
                                continue
                            
                            # Process material row
                            try:
                                quantity = float(row[quantity_col]) if pd.notna(row.get(quantity_col, np.nan)) else 1
                            except (ValueError, TypeError):
                                # If conversion fails, try to clean the string and convert again
                                try:
                                    qty_str = str(row[quantity_col]).strip()
                                    # Remove any non-numeric characters except decimal point
                                    qty_str = ''.join(c for c in qty_str if c.isdigit() or c == '.')
                                    quantity = float(qty_str) if qty_str else 1
                                except (ValueError, TypeError):
                                    quantity = 1
                            
                            # Get unit if available
                            unit = str(row[unit_col]) if unit_col and pd.notna(row.get(unit_col, np.nan)) else ""
                            
                            # Get rate and amount (optional)
                            try:
                                rate = float(row[rate_col]) if rate_col and pd.notna(row.get(rate_col, np.nan)) else None
                            except (ValueError, TypeError):
                                rate = None
                                
                            try:
                                amount = float(row[amount_col]) if amount_col and pd.notna(row.get(amount_col, np.nan)) else None
                            except (ValueError, TypeError):
                                amount = None
                            
                            # If we have rate but no amount, calculate it
                            if rate is not None and amount is None and quantity is not None:
                                amount = rate * quantity
                            
                            # If we have neither rate nor amount, estimate based on quantity
                            if amount is None:
                                # Default rates based on common construction items (very rough estimates)
                                default_rates = {
                                    "sq.m": 50,   # Default rate per square meter
                                    "m2": 50,     # Default rate per square meter
                                    "sq.ft": 5,   # Default rate per square foot
                                    "cu.m": 100,  # Default rate per cubic meter
                                    "m3": 100,    # Default rate per cubic meter
                                    "kg": 2,      # Default rate per kg
                                    "nos": 20,    # Default rate per piece
                                    "lot": 5000,  # Default rate per lot
                                }
                                
                                # Try to determine unit from the unit field or material description
                                effective_unit = unit.lower() if unit else ""
                                if not effective_unit:
                                    # Try to extract unit from material description
                                    for unit_key in default_rates.keys():
                                        if unit_key in material.lower():
                                            effective_unit = unit_key
                                            break
                                
                                # Apply default rate based on unit if available, otherwise use a base rate
                                if effective_unit in default_rates:
                                    amount = quantity * default_rates[effective_unit]
                                else:
                                    # Default to $10 per unit if no specific rate can be determined
                                    amount = quantity * 10
                            
                            # Add to materials dictionary
                            if material.strip():
                                material_entry = {
                                    "quantity": quantity
                                }
                                
                                if unit:
                                    material_entry["unit"] = unit
                                    
                                if rate is not None:
                                    material_entry["rate"] = rate
                                    
                                materials[material] = material_entry
                                total_budget += amount if amount is not None else 0
                                
                                # Add to current step materials
                                if current_step:
                                    step_materials.append({
                                        "material": material,
                                        "details": material_entry,
                                        "amount": amount if amount is not None else 0
                                    })
                                else:
                                    # Categorize material into construction phase if no explicit steps
                                    material_lower = material.lower()
                                    assigned = False
                                    
                                    for phase, keywords in phase_keywords.items():
                                        if any(keyword in material_lower for keyword in keywords):
                                            construction_phases[phase].append({
                                                "material": material,
                                                "details": material_entry,
                                                "amount": amount if amount is not None else 0
                                            })
                                            assigned = True
                                            break
                                    
                                    if not assigned:
                                        construction_phases["other"].append({
                                            "material": material,
                                            "details": material_entry,
                                            "amount": amount if amount is not None else 0
                                        })
                        
                        # Add the last step if there is one
                        if current_step and step_materials:
                            step_budget = sum(item["amount"] for item in step_materials)
                            steps.append({
                                "title": current_step,
                                "materials": step_materials,
                                "budget": step_budget
                            })
                        
                        # Calculate phase budgets
                        phase_budgets = {}
                        for phase, items in construction_phases.items():
                            phase_budgets[phase] = sum(item["amount"] for item in items)
                        
                        # Prepare return data
                        result = {
                            "materials": materials,
                            "budget": total_budget,
                            "sheet_name": sheet_name,
                            "columns": {
                                "material": material_col,
                                "quantity": quantity_col,
                                "unit": unit_col,
                                "rate": rate_col,
                                "amount": amount_col
                            }
                        }
                        
                        # Add steps if found, otherwise use construction phases
                        if steps:
                            result["steps"] = steps
                        else:
                            result["construction_phases"] = construction_phases
                            result["phase_budgets"] = phase_budgets
                        
                        return result
                        
                except Exception as e:
                    print(f"Error parsing sheet {sheet_name}: {e}")
                    continue
            
            # If we get here, no valid sheets were found
            return {"error": "No valid data found in the Excel file"}
            
        else:
            return {"error": "Unsupported file format"}
            
    except Exception as e:
        print(f"Error parsing BOQ file: {e}")
        return {"error": f"Failed to parse BOQ file: {str(e)}"}


def create_steps_from_boq(project, boq_data):
    """
    Create project steps based on either explicit steps found in the BOQ file
    or construction phases from the BOQ data
    
    Args:
        project: Project object
        boq_data: Parsed BOQ data from parse_boq_file
    
    Returns:
        list: Created step IDs
    """
    from .models import Step, Project
    
    # Ensure we have a valid project instance
    if not isinstance(project, Project):
        print(f"ERROR: Invalid project object passed to create_steps_from_boq: {type(project)}")
        if isinstance(project, str) and project.startswith('http'):
            print(f"ERROR: Received URL instead of project object: {project}")
            return []
        elif isinstance(project, dict):
            print(f"ERROR: Received dict instead of project object: {project}")
            # Try to get the project by ID
            project_id = project.get('id')
            if project_id:
                try:
                    project = Project.objects.get(id=project_id)
                    print(f"Successfully retrieved project from ID: {project.name} (ID: {project.id})")
                except Project.DoesNotExist:
                    print(f"ERROR: Project with ID {project_id} does not exist")
                    return []
            else:
                return []
    
    print(f"Creating steps from BOQ data for project: {project.name} (ID: {project.id})")
    print(f"BOQ data keys: {list(boq_data.keys())}")
    
    created_steps = []
    
    # Check if we have explicit steps from the BOQ file
    if "steps" in boq_data and boq_data["steps"]:
        print(f"Found {len(boq_data['steps'])} explicit steps in BOQ data")
        
        # Create steps directly from the BOQ file structure
        for order, step_data in enumerate(boq_data["steps"], 1):
            print(f"Processing step {order}: {step_data.get('title', 'Unnamed Step')}")
            
            # Extract material details
            materials = []
            for material_item in step_data["materials"]:
                material_name = material_item["material"]
                material_details = material_item["details"]
                materials.append({
                    "name": material_name,
                    "quantity": material_details.get("quantity", 0),
                    "unit": material_details.get("unit", ""),
                    "rate": material_details.get("rate", 0)
                })
            
            print(f"Step {order} has {len(materials)} materials")
            
            try:
                # Create the step
                step = Step.objects.create(
                    project=project,
                    title=step_data["title"],
                    description=f"Materials for {step_data['title']}",
                    order=order,
                    expected_materials=materials,
                    expected_budget=step_data["budget"],
                    is_completed=False,
                    progress=0
                )
                
                print(f"Created step with ID: {step.id}")
                created_steps.append(step.id)
            except Exception as e:
                print(f"Error creating step {order}: {str(e)}")
        
        print(f"Created {len(created_steps)} steps from explicit BOQ steps")
        return created_steps
    
    # Fallback to construction phases if no explicit steps
    # Get construction phases from BOQ data
    construction_phases = boq_data.get('construction_phases', {})
    phase_budgets = boq_data.get('phase_budgets', {})
    
    print(f"Fallback to construction phases. Found {len(construction_phases)} phases")
    for phase, items in construction_phases.items():
        print(f"Phase '{phase}' has {len(items)} materials")
    
    # Define phase order and display names
    phase_order = {
        "foundation": 1,
        "structure": 2,
        "walls_roofing": 3,
        "electrical_plumbing": 4,
        "finishing": 5,
        "other": 6
    }
    
    phase_display_names = {
        "foundation": "Foundation Work",
        "structure": "Structural Framework",
        "walls_roofing": "Walls and Roofing",
        "electrical_plumbing": "Electrical and Plumbing",
        "finishing": "Finishing Work",
        "other": "Other Construction Activities"
    }
    
    # Special handling for finishing items - group by room types
    finishing_items = construction_phases.get("finishing", [])
    room_groups = {}
    
    # Common room types to look for
    room_types = ["bedroom", "living", "dining", "kitchen", "bathroom", "toilet", "hall", "room", "master"]
    
    # Group finishing items by room type
    for item in finishing_items:
        material = item["material"].lower()
        assigned = False
        
        for room_type in room_types:
            if room_type in material:
                if room_type not in room_groups:
                    room_groups[room_type] = []
                room_groups[room_type].append(item)
                assigned = True
                break
        
        if not assigned:
            if "other_rooms" not in room_groups:
                room_groups["other_rooms"] = []
            room_groups["other_rooms"].append(item)
    
    # Create steps for each construction phase
    for phase_key, materials in construction_phases.items():
        if not materials:  # Skip empty phases
            continue
            
        # Special handling for finishing phase
        if phase_key == "finishing" and room_groups:
            # Create steps for each room type
            room_order = 5  # Start with finishing phase order
            
            for room_type, items in room_groups.items():
                if not items:  # Skip empty room types
                    continue
                    
                # Format room type name
                if room_type == "other_rooms":
                    room_name = "Other Rooms"
                else:
                    room_name = room_type.replace("_", " ").title()
                
                # Extract material descriptions and quantities
                expected_materials = []
                for item in items:
                    material_name = item["material"]
                    material_details = item["details"]
                    expected_materials.append({
                        "name": material_name,
                        "quantity": material_details.get("quantity", 0),
                        "unit": material_details.get("unit", ""),
                        "rate": material_details.get("rate", 0)
                    })
                
                # Calculate budget for this room
                room_budget = sum(item["amount"] for item in items)
                
                # Create the step
                step = Step.objects.create(
                    project=project,
                    title=f"Finishing - {room_name}",
                    description=f"Finishing work for {room_name}",
                    order=room_order,
                    expected_materials=expected_materials,
                    expected_budget=room_budget,
                    is_completed=False,
                    progress=0
                )
                
                created_steps.append(step.id)
                room_order += 0.1  # Increment order slightly for next room
            
            # Skip the regular finishing phase creation
            continue
            
        # Get phase details
        order = phase_order.get(phase_key, 99)
        title = phase_display_names.get(phase_key, phase_key.replace('_', ' ').title())
        
        # Extract material descriptions and quantities
        expected_materials = []
        for item in materials:
            material_name = item["material"]
            material_details = item["details"]
            expected_materials.append({
                "name": material_name,
                "quantity": material_details.get("quantity", 0),
                "unit": material_details.get("unit", ""),
                "rate": material_details.get("rate", 0)
            })
        
        # Get budget if available
        expected_budget = phase_budgets.get(phase_key, None)
        
        # Create the step
        step = Step.objects.create(
            project=project,
            title=title,
            description=f"Materials for {title}",
            order=order,
            expected_materials=expected_materials,
            expected_budget=expected_budget,
            is_completed=False,
            progress=0
        )
        
        created_steps.append(step.id)
    
    return created_steps


# ──────────────────────────────────────────────
# Permissions
# ──────────────────────────────────────────────
class IsAdminOrSupervisorOrReadOnly(permissions.BasePermission):
    """
    Allow read access to authenticated users.
    Only allow write access to ADMIN or SUPERVISOR.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
            
        if request.method in permissions.SAFE_METHODS:
            return True
            
        return request.user.role in ("ADMIN", "SUPERVISOR")


# ──────────────────────────────────────────────
# ViewSets
# ──────────────────────────────────────────────
class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.select_related('supervisor').prefetch_related(
        'steps', 
        'steps__logs', 
        'steps__invoice'
    ).all()  # Optimize with prefetch_related
    serializer_class = ProjectSerializer
    permission_classes = [IsAdminOrSupervisorOrReadOnly]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["name", "description"]
    ordering_fields = ["start_date", "estimated_end_date", "created"]
    ordering = ["-created"]
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    
    @action(detail=False, methods=['get'], url_path='boq-template', permission_classes=[permissions.AllowAny])
    def boq_template(self, request):
        """
        Generate and serve a standardized BOQ template for download
        Public endpoint - no authentication required
        """
        template_path = None
        template_file = None
        
        try:
            # Generate the template
            template_path = generate_boq_template()
            
            # Open the file
            template_file = open(template_path, 'rb')
            
            # Serve the file for download
            response = FileResponse(
                template_file,
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = f'attachment; filename="SAAN_HOMES_BOQ_TEMPLATE.xlsx"'
            
            # Use FileResponse's streaming to handle the file, then delete it after sending
            response._resource_closers.append(lambda: self._cleanup_template(template_path, template_file))
            
            return response
        except Exception as e:
            # Clean up in case of error
            if template_file:
                try:
                    template_file.close()
                except:
                    pass
                    
            if template_path and os.path.exists(template_path):
                try:
                    os.remove(template_path)
                except:
                    pass
                    
            return Response(
                {"error": f"Failed to generate BOQ template: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _cleanup_template(self, file_path, file_obj):
        """Helper method to clean up template files after they've been served"""
        try:
            # Close the file if it's still open
            if file_obj and not file_obj.closed:
                file_obj.close()
                
            # Delete the file from disk
            if file_path and os.path.exists(file_path):
                os.remove(file_path)
                print(f"Template file deleted: {file_path}")
        except Exception as e:
            print(f"Error cleaning up template file: {str(e)}")
    
    def get_serializer_class(self):
        """Use a lightweight serializer for list views"""
        if self.action == 'list':
            return ProjectListSerializer
        return ProjectSerializer
    
    def get_queryset(self):
        # By default, exclude deleted projects with optimized queries
        return Project.objects.select_related('supervisor').prefetch_related(
            'steps', 
            'steps__logs', 
            'steps__invoice'
        ).filter(is_deleted=False)
    
    @action(detail=False, methods=['get'], url_path='recycle-bin')
    def recycle_bin(self, request):
        """
        List all deleted projects (recycle bin)
        """
        # Only admins should be able to access recycle bin
        if request.user.role != 'ADMIN':
            return Response(
                {"error": "Only administrators can access the recycle bin"}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        deleted_projects = Project.objects.select_related('supervisor').filter(is_deleted=True)
        page = self.paginate_queryset(deleted_projects)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(deleted_projects, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def soft_delete(self, request, pk=None):
        """
        Move a project to the recycle bin (soft delete)
        """
        # Only admins should be able to soft delete projects
        if request.user.role != 'ADMIN':
            return Response(
                {"error": "Only administrators can delete projects"}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        project = self.get_object()
        project.soft_delete()
        return Response({"status": "project moved to recycle bin"}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """
        Restore a project from the recycle bin
        """
        # Only admins should be able to restore projects
        if request.user.role != 'ADMIN':
            return Response(
                {"error": "Only administrators can restore projects"}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        try:
            # Get the project including deleted ones
            project = Project.objects.get(pk=pk, is_deleted=True)
            project.restore()
            serializer = self.get_serializer(project)
            return Response(serializer.data)
        except Project.DoesNotExist:
            return Response(
                {"error": "Project not found in recycle bin"}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['delete'])
    def permanent_delete(self, request, pk=None):
        """
        Permanently delete a project from the recycle bin
        """
        # Only admins should be able to permanently delete projects
        if request.user.role != 'ADMIN':
            return Response(
                {"error": "Only administrators can permanently delete projects"}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        try:
            # Get the project including deleted ones
            project = Project.objects.get(pk=pk, is_deleted=True)
            project.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Project.DoesNotExist:
            return Response(
                {"error": "Project not found in recycle bin"}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['post'], url_path='preview-boq')
    def preview_boq(self, request):
        """
        Preview BOQ file before project creation
        """
        if 'boq_file' not in request.FILES:
            return Response(
                {"error": "No BOQ file provided"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        boq_file = request.FILES['boq_file']
        
        # Validate file extension
        file_ext = os.path.splitext(boq_file.name)[1].lower()
        if file_ext not in ['.xlsx', '.xls']:
            return Response(
                {
                    "error": "Invalid file format. Only Excel files (.xlsx, .xls) are supported.",
                    "template_url": f"{request.build_absolute_uri('/')[:-1]}/api/projects/boq-template/"
                }, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create a unique filename to avoid conflicts
        unique_filename = f"{uuid.uuid4()}_{boq_file.name}"
        temp_path = default_storage.save(f'temp_boq/{unique_filename}', ContentFile(boq_file.read()))
        full_temp_path = os.path.join(settings.MEDIA_ROOT, temp_path)
        
        try:
            # Check if this is our standardized template
            is_standard_template = False
            try:
                xls = pd.ExcelFile(full_temp_path)
                if "BOQ" in xls.sheet_names and "Units Reference" in xls.sheet_names:
                    is_standard_template = True
            except:
                pass
                
            # Parse the BOQ file
            boq_data = parse_boq_file(full_temp_path)
            
            # Check for parsing errors
            if "error" in boq_data:
                return Response(
                    {
                        "error": boq_data["error"],
                        "template_url": f"{request.build_absolute_uri('/')[:-1]}/api/projects/boq-template/",
                        "message": "Please use our standardized BOQ template for better results."
                    }, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            # Add flag indicating if this was our standard template
            boq_data["is_standard_template"] = is_standard_template
            
            # Prepare response with summary data
            response_data = {
                "total_budget": boq_data["budget"],
                "material_count": len(boq_data["materials"]),
                "columns_found": boq_data.get("columns", {}),
            }
            
            # Add sheet name if available
            if "sheet_name" in boq_data:
                response_data["sheet_name"] = boq_data["sheet_name"]
            
            # Check if we have explicit steps from the BOQ
            if "steps" in boq_data:
                response_data["steps"] = []
                for step in boq_data["steps"]:
                    response_data["steps"].append({
                        "name": step["title"],
                        "budget": step["budget"],
                        "material_count": len(step["materials"])
                    })
            # Otherwise, use construction phases
            elif "phase_budgets" in boq_data:
                response_data["phases"] = []
                for phase, budget in boq_data["phase_budgets"].items():
                    if budget > 0:
                        phase_name = phase.replace("_", " ").title()
                        response_data["phases"].append({
                            "name": phase_name,
                            "budget": budget,
                            "percentage": round((budget / boq_data["budget"]) * 100, 2) if boq_data["budget"] else 0,
                            "material_count": len(boq_data["construction_phases"][phase])
                        })
            
            # Add sample materials (first 5)
            sample_materials = []
            for material, details in list(boq_data["materials"].items())[:5]:
                material_data = {
                    "name": material,
                    "details": details
                }
                sample_materials.append(material_data)
                
            response_data["sample_materials"] = sample_materials
            
            return Response(response_data)
            
        except Exception as e:
            return Response(
                {"error": f"Failed to parse BOQ file: {str(e)}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        finally:
            # Clean up the temp file - use try/except to handle potential file access issues
            try:
                if os.path.exists(full_temp_path):
                    os.close(os.open(full_temp_path, os.O_RDONLY))  # Ensure file is closed
                    os.remove(full_temp_path)
            except Exception as e:
                print(f"Warning: Could not delete temporary file {full_temp_path}: {e}")

    def create(self, request, *args, **kwargs):
        """
        Custom create method to handle multiple file uploads and BOQ parsing
        """
        # Clean up old temporary files before processing new ones
        cleanup_stats = cleanup_old_temp_files(max_age_hours=24)
        if cleanup_stats['deleted'] > 0:
            print(f"Cleaned up {cleanup_stats['deleted']} old temp files, freed {cleanup_stats['size_freed']} bytes")
        
        # Validate required fields
        required_fields = ['name', 'start_date', 'estimated_end_date']
        for field in required_fields:
            if not request.data.get(field):
                return Response(
                    {"error": f"Field '{field}' is required"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Validate BOQ file
        if 'boq_file' not in request.FILES:
            return Response(
                {
                    "error": "BOQ file is required",
                    "template_url": f"{request.build_absolute_uri('/')[:-1]}/api/projects/boq-template/"
                }, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        boq_file = request.FILES['boq_file']
        file_ext = os.path.splitext(boq_file.name)[1].lower()
        if file_ext not in ['.xlsx', '.xls']:
            return Response(
                {
                    "error": "Invalid BOQ file format. Only Excel files (.xlsx, .xls) are supported.",
                    "template_url": f"{request.build_absolute_uri('/')[:-1]}/api/projects/boq-template/"
                }, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Handle project images
        project_images = []
        images_json = request.data.get('images')
        
        if images_json:
            try:
                image_filenames = json.loads(images_json)
                
                # Process each image file
                for i in range(len(image_filenames)):
                    image_key = f'project_image_{i}'
                    if image_key in request.FILES:
                        image_file = request.FILES[image_key]
                        # Save image to media path and store the path
                        file_path = f'projects/images/{image_filenames[i]}'
                        project_images.append(file_path)
            except json.JSONDecodeError:
                pass
        
        # Create a mutable copy of request.data
        data = request.data.copy()
        
        # Add images list to data
        if project_images:
            data['images'] = json.dumps(project_images)
        
        # Create the project
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        project = self.perform_create(serializer)
        
        # Parse BOQ file if available
        if 'boq_file' in request.FILES:
            boq_file = request.FILES['boq_file']
            
            # Create a unique filename to avoid conflicts
            unique_filename = f"{uuid.uuid4()}_{boq_file.name}"
            temp_path = default_storage.save(f'temp_boq/{unique_filename}', ContentFile(boq_file.read()))
            full_temp_path = os.path.join(settings.MEDIA_ROOT, temp_path)
            
            try:
                print(f"Processing BOQ file for project: {project.name} (ID: {project.id})")
                
                # Check if this is our standardized template for optimized parsing
                is_standard_template = False
                try:
                    xls = pd.ExcelFile(full_temp_path)
                    if "BOQ" in xls.sheet_names and "Units Reference" in xls.sheet_names:
                        is_standard_template = True
                        print(f"Using optimized parsing for standardized template: {boq_file.name}")
                except Exception as e:
                    print(f"Error checking if file is standard template: {str(e)}")
                
                # Parse the BOQ file
                print(f"Parsing BOQ file: {full_temp_path}")
                boq_data = parse_boq_file(full_temp_path)
                
                if "error" in boq_data:
                    print(f"Error in BOQ parsing: {boq_data['error']}")
                    raise Exception(boq_data["error"])
                
                print(f"BOQ parsing successful. Data keys: {list(boq_data.keys())}")
                
                # Ensure we have a valid project instance before creating steps
                if not project or not hasattr(project, 'id'):
                    print(f"ERROR: Invalid project object: {project}")
                    raise Exception("Invalid project object, cannot create steps")
                
                # Create steps based on BOQ data
                print(f"Creating steps from BOQ data for project ID: {project.id}")
                try:
                    step_ids = create_steps_from_boq(project, boq_data)
                    print(f"Steps created: {len(step_ids)}")
                    
                    if not step_ids:
                        print("WARNING: No steps were created from the BOQ data")
                except Exception as step_error:
                    print(f"ERROR creating steps: {step_error}")
                    raise
                
                # No need to store the BOQ file after successful parsing
                # The steps and materials are now in the database
                
            except Exception as e:
                print(f"Error processing BOQ: {e}")
                print(f"Exception type: {type(e)}")
                import traceback
                traceback.print_exc()
            finally:
                # Clean up the temp file - use try/except to handle potential file access issues
                try:
                    if os.path.exists(full_temp_path):
                        os.remove(full_temp_path)
                        print(f"Temporary BOQ file deleted: {full_temp_path}")
                except (OSError, PermissionError) as e:
                    print(f"Warning: Could not delete temporary file {full_temp_path}: {e}")
                except Exception as e:
                    print(f"Unexpected error deleting temporary file {full_temp_path}: {e}")
                    
                # Also clean up the stored BOQ file since we don't need it anymore
                # (The data has been extracted and stored in the database)
                try:
                    if project.boq_file and hasattr(project.boq_file, 'path'):
                        boq_file_path = project.boq_file.path
                        # Clear the reference in the model first
                        project.boq_file = None
                        project.save(update_fields=['boq_file'])
                        
                        # Then delete the physical file
                        if os.path.exists(boq_file_path):
                            os.remove(boq_file_path)
                            print(f"Stored BOQ file deleted after successful processing: {boq_file_path}")
                        else:
                            print(f"BOQ file not found at path: {boq_file_path}")
                    else:
                        print("No BOQ file reference found in project model")
                except (OSError, PermissionError) as e:
                    print(f"Warning: Could not delete stored BOQ file: {e}")
                except Exception as e:
                    print(f"Unexpected error deleting stored BOQ file: {e}")
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def perform_create(self, serializer):
        """
        Override to return the created instance
        
        This method is called by the create method to save the project instance.
        We need to return the saved instance so that create_steps_from_boq can use it.
        """
        project = serializer.save()
        print(f"Project saved successfully: {project.name} (ID: {project.id})")
        return project

    @action(detail=False, methods=['get'])
    def supervisor_projects(self, request):
        """
        Get projects assigned to the current supervisor
        """
        if request.user.role != "SUPERVISOR":
            return Response(
                {"error": "Only supervisors can access this endpoint"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Use optimized queryset with prefetch_related to avoid N+1 queries
        projects = Project.objects.select_related('supervisor').prefetch_related(
            'steps', 
            'steps__logs', 
            'steps__invoice'
        ).filter(supervisor=request.user, is_deleted=False)
        
        serializer = self.get_serializer(projects, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def supervisor_stats(self, request):
        """
        Get project statistics for supervisor dashboard
        """
        if request.user.role != "SUPERVISOR":
            return Response(
                {"error": "Only supervisors can access this endpoint"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get all projects assigned to this supervisor with prefetched steps
        projects = Project.objects.filter(supervisor=request.user, is_deleted=False).prefetch_related('steps')
        
        # Calculate statistics
        total_projects = projects.count()
        ongoing_projects = projects.filter(is_completed=False).count()
        completed_projects = projects.filter(is_completed=True).count()
        
        # Calculate upcoming projects (projects that haven't started yet)
        today = timezone.now().date()
        upcoming_projects = projects.filter(start_date__gt=today).count()
        
        # Calculate project types distribution
        project_types = {}
        for project in projects:
            project_type = project.project_type
            if project_type in project_types:
                project_types[project_type] += 1
            else:
                project_types[project_type] = 1
        
        # Calculate average progress using the same logic as serializer
        total_progress = 0
        projects_with_progress = 0
        for project in projects:
            steps = project.steps.all()
            total_steps = len(steps)
            if total_steps > 0:
                completed_steps = sum(1 for step in steps if step.is_approved)
                progress = int((completed_steps / total_steps) * 100)
                total_progress += progress
                projects_with_progress += 1
        
        average_progress = total_progress / projects_with_progress if projects_with_progress > 0 else 0
        
        # Get recent activities (last 5 projects updated)
        recent_projects = projects.order_by('-updated')[:5]
        recent_activities = []
        
        for project in recent_projects:
            # Calculate progress for this project
            steps = project.steps.all()
            total_steps = len(steps)
            progress = 0
            if total_steps > 0:
                completed_steps = sum(1 for step in steps if step.is_approved)
                progress = int((completed_steps / total_steps) * 100)
            
            activity = {
                'id': str(project.id),
                'activity': f'Project "{project.name}" updated',
                'project': project.name,
                'time': project.updated.strftime('%Y-%m-%d %H:%M'),
                'type': 'info',
                'progress': progress
            }
            recent_activities.append(activity)
        
        stats = {
            'total': total_projects,
            'ongoing': ongoing_projects,
            'completed': completed_projects,
            'upcoming': upcoming_projects,
            'average_progress': round(average_progress, 1),
            'project_types': project_types,
            'recent_activities': recent_activities
        }
        
        return Response(stats)

    @action(detail=False, methods=['get'])
    def steps(self, request):
        project = self.get_object()
        steps = project.steps.all()
        from .serializers import StepSerializer
        return Response(StepSerializer(steps, many=True).data)


class StepViewSet(viewsets.ModelViewSet):
    queryset = Step.objects.select_related("project").all()
    serializer_class = StepSerializer
    permission_classes = [IsAdminOrSupervisorOrReadOnly]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["title"]
    ordering_fields = ["order", "is_approved", "actual_completed"]
    ordering = ["order"]
    
    def get_queryset(self):
        """
        Filter steps by project if project_id is provided in query parameters
        """
        qs = super().get_queryset()
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        step = self.get_object()
        step.is_approved = True
        step.actual_completed = timezone.now().date()  # Set actual completion date
        step.status = 'APPROVED'
        step.save()
        # Update project progress
        project = step.project
        total_steps = project.steps.count() or 1
        completed_steps = project.steps.filter(is_approved=True).count()
        # Note: Project model does not have a persisted 'progress' field; compute on the fly in serializers
        progress_percent = int((completed_steps / total_steps) * 100)
        # Return updated step payload to simplify client updates
        from .serializers import StepSerializer
        return Response({
            "status": "Step approved",
            "progress": progress_percent,
            "step": StepSerializer(step).data,
        })


class ProgressLogViewSet(viewsets.ModelViewSet):
    queryset = ProgressLog.objects.select_related("step", "supervisor").prefetch_related("media_files").all()
    serializer_class = ProgressLogSerializer
    permission_classes = [IsAdminOrSupervisorOrReadOnly]
    filter_backends = [OrderingFilter]
    ordering = ["-created"]
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def perform_create(self, serializer):
        """
        Automatically set the supervisor when creating a progress log
        """
        progress_log = serializer.save(supervisor=self.request.user)
        
        # Handle multiple media files
        files = self.request.FILES.getlist('media')
        for file in files:
            # Determine media type based on file extension
            file_ext = os.path.splitext(file.name)[1].lower()
            media_type = 'DOCUMENT'
            
            if file_ext in ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']:
                media_type = 'IMAGE'
            elif file_ext in ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm']:
                media_type = 'VIDEO'
            elif file_ext in ['.mp4', '.avi', '.mov'] and 'vr' in file.name.lower():
                media_type = 'VR'
            
            # Create media file record
            ProgressLogMedia.objects.create(
                progress_log=progress_log,
                file=file,
                media_type=media_type,
                filename=file.name,
                file_size=file.size
            )


class ProgressLogMediaViewSet(viewsets.ModelViewSet):
    queryset = ProgressLogMedia.objects.select_related("progress_log").all()
    serializer_class = ProgressLogMediaSerializer
    permission_classes = [IsAdminOrSupervisorOrReadOnly]
    filter_backends = [OrderingFilter]
    ordering = ["-uploaded_at"]
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def perform_create(self, serializer):
        """
        Handle media file upload for progress logs
        """
        file = self.request.FILES.get('file')
        progress_log_id = self.request.data.get('progress_log')
        
        if not file or not progress_log_id:
            raise serializers.ValidationError("File and progress_log are required")
        
        try:
            progress_log = ProgressLog.objects.get(id=progress_log_id)
        except ProgressLog.DoesNotExist:
            raise serializers.ValidationError("Progress log not found")
        
        # Determine media type based on file extension
        file_ext = os.path.splitext(file.name)[1].lower()
        media_type = 'DOCUMENT'
        
        if file_ext in ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']:
            media_type = 'IMAGE'
        elif file_ext in ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm']:
            media_type = 'VIDEO'
        elif file_ext in ['.mp4', '.avi', '.mov'] and 'vr' in file.name.lower():
            media_type = 'VR'
        
        serializer.save(
            progress_log=progress_log,
            file=file,
            media_type=media_type,
            filename=file.name,
            file_size=file.size
        )


class ProjectMediaViewSet(viewsets.ModelViewSet):
    queryset = ProjectMedia.objects.select_related("project", "uploaded_by").all()
    serializer_class = ProjectMediaSerializer
    permission_classes = [IsAdminOrSupervisorOrReadOnly]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["title", "description", "filename", "project__name"]
    ordering = ["-uploaded_at"]
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    
    def get_queryset(self):
        qs = super().get_queryset()
        # Include deleted for detail actions that must operate on deleted items
        if getattr(self, "action", None) in ("restore", "purge", "destroy"):
            return qs
        only_deleted = self.request.query_params.get("only_deleted") in ("1", "true", "True")
        include_deleted = self.request.query_params.get("include_deleted") in ("1", "true", "True")
        if only_deleted:
            return qs.filter(is_deleted=True)
        if include_deleted:
            base = qs
        else:
            base = qs.filter(is_deleted=False)
        
        # Extra filters: by project and step when provided
        project_id = self.request.query_params.get("project")
        step_id = self.request.query_params.get("step")
        if project_id:
            base = base.filter(project_id=project_id)
        if step_id:
            base = base.filter(step_id=step_id)
        return base
    
    def perform_create(self, serializer):
        """
        Save ProjectMedia and, if a step is provided, also create a ProgressLog and
        attach the same file as a ProgressLogMedia so it shows up step-wise.
        """
        instance: ProjectMedia = serializer.save(uploaded_by=self.request.user)
        
        # If this media is tied to a specific step, mirror it into Progress Logs
        step = getattr(instance, "step", None)
        try:
            if step:
                # Create a concise log message
                msg = instance.description or instance.title or f"Media uploaded: {instance.filename}"
                log = ProgressLog.objects.create(step=step, message=msg)
                
                # Determine media type from the ProjectMedia instance
                media_type = instance.media_type or 'DOCUMENT'
                
                # Create a ProgressLogMedia entry reusing the same stored file
                ProgressLogMedia.objects.create(
                    progress_log=log,
                    file=instance.file,
                    media_type=media_type,
                    filename=instance.filename or (instance.file.name if instance.file else ''),
                    file_size=instance.file_size or (instance.file.size if instance.file else 0),
                )
        except Exception:
            # If any mirroring error occurs, we still keep ProjectMedia; avoid breaking the upload.
            pass
    
    def get_queryset(self):
        qs = super().get_queryset()
        # Include deleted for detail actions that must operate on deleted items
        if getattr(self, "action", None) in ("restore", "purge", "destroy"):
            return qs
        only_deleted = self.request.query_params.get("only_deleted") in ("1", "true", "True")
        include_deleted = self.request.query_params.get("include_deleted") in ("1", "true", "True")
        if only_deleted:
            return qs.filter(is_deleted=True)
        if include_deleted:
            return qs
        return qs.filter(is_deleted=False)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()  # soft-delete via model
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=["POST"], url_path="restore")
    def restore(self, request, pk=None):
        instance = self.get_object()
        if instance.is_deleted:
            instance.is_deleted = False
            instance.deleted_at = None
            instance.save(update_fields=["is_deleted", "deleted_at"])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=True, methods=["DELETE"], url_path="purge")
    def purge(self, request, pk=None):
        instance = self.get_object()
        instance.hard_delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['get'], url_path='recycle-bin')
    def recycle_bin(self, request):
        """
        List all deleted project media (recycle bin)
        """
        # Only admins should be able to access recycle bin
        if request.user.role != 'ADMIN':
            return Response(
                {"error": "Only administrators can access the recycle bin"}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        deleted_media = ProjectMedia.objects.select_related("project", "uploaded_by").filter(is_deleted=True)
        page = self.paginate_queryset(deleted_media)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(deleted_media, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def submit_to_admin(self, request, pk=None):
        """Mark a project media item as submitted to admin and return updated object."""
        instance = self.get_object()
        if not getattr(instance, 'is_submitted_to_admin', False):
            instance.is_submitted_to_admin = True
            instance.save(update_fields=["is_submitted_to_admin"])
        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)


class BillViewSet(viewsets.ModelViewSet):
    queryset = Bill.objects.select_related("step").all()
    serializer_class = BillSerializer
    permission_classes = [IsAdminOrSupervisorOrReadOnly]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["step__title", "pdf"]
    ordering = ["-uploaded_at"]
    
    @action(detail=False, methods=['post'], url_path='process-pdf')
    def process_pdf(self, request):
        """
        Process PDF file to extract text and parse bill data
        """
        try:
            pdf_file = request.FILES.get('pdf')
            if not pdf_file:
                return Response({"error": "No PDF file provided"}, status=400)
            
            # For now, we'll implement a basic text extraction
            # In production, you would use libraries like PyPDF2, pdfplumber, or OCR services
            
            import PyPDF2
            import io
            
            # Read PDF content
            pdf_content = pdf_file.read()
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_content))
            
            # Extract text from all pages
            full_text = ""
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                full_text += page.extract_text() + "\n"
            
            # Parse the text to extract bill items
            items = self.parse_bill_text(full_text)
            
            # Calculate total
            total = sum(item.get('total', 0) for item in items)
            
            return Response({
                "raw_text": full_text,
                "items": items,
                "total": total,
                "status": "success"
            })
            
        except Exception as e:
            return Response({
                "error": f"Failed to process PDF: {str(e)}",
                "status": "error"
            }, status=500)
    
    def parse_bill_text(self, text):
        """
        Parse bill text to extract line items
        """
        items = []
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        
        # Patterns to match bill items
        patterns = [
            # Pattern: Description Quantity Rate Amount
            r'^(.+?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)$',
            # Pattern: Description Qty x Rate = Amount  
            r'^(.+?)\s+(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*=\s*(\d+(?:\.\d+)?)$',
            # Pattern: Description, Quantity, Rate, Amount
            r'^(.+?),\s*(\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)$',
        ]
        
        for line in lines:
            for pattern in patterns:
                import re
                match = re.match(pattern, line)
                if match:
                    description = match.group(1).strip()
                    quantity = float(match.group(2))
                    rate = float(match.group(3))
                    amount = float(match.group(4))
                    
                    # Validate the extracted data
                    if (description and len(description) > 2 and 
                        quantity > 0 and rate > 0 and amount > 0):
                        items.append({
                            "itemName": description,
                            "description": description,
                            "quantity": quantity,
                            "unit": "pcs",
                            "unitPrice": rate,
                            "total": amount
                        })
                        break
        
        # If no structured items found, try to find total amount
        if not items:
            import re
            total_match = re.search(r'(?:total|amount|sum)[:\s]*(\d+(?:\.\d+)?)', text, re.IGNORECASE)
            if total_match:
                total = float(total_match.group(1))
                items.append({
                    "itemName": "Bill Total",
                    "description": "Total amount from bill",
                    "quantity": 1,
                    "unit": "bill",
                    "unitPrice": total,
                    "total": total
                })
        
        return items
    
    def get_queryset(self):
        qs = super().get_queryset()
        # Include deleted for detail actions that must operate on deleted items
        if getattr(self, "action", None) in ("restore", "purge", "destroy"):
            return qs
        only_deleted = self.request.query_params.get("only_deleted") in ("1", "true", "True")
        include_deleted = self.request.query_params.get("include_deleted") in ("1", "true", "True")
        if only_deleted:
            return qs.filter(is_deleted=True)
        if include_deleted:
            return qs
        return qs.filter(is_deleted=False)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()  # soft-delete via model
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=["POST"], url_path="restore")
    def restore(self, request, pk=None):
        instance = self.get_object()
        if instance.is_deleted:
            instance.is_deleted = False
            instance.deleted_at = None
            instance.save(update_fields=["is_deleted", "deleted_at"])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=True, methods=["DELETE"], url_path="purge")
    def purge(self, request, pk=None):
        instance = self.get_object()
        instance.hard_delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['get'], url_path='recycle-bin')
    def recycle_bin(self, request):
        """
        List all deleted bills (recycle bin)
        """
        # Only admins should be able to access recycle bin
        if request.user.role != 'ADMIN':
            return Response(
                {"error": "Only administrators can access the recycle bin"}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        deleted_bills = Bill.objects.select_related("step").filter(is_deleted=True)
        page = self.paginate_queryset(deleted_bills)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(deleted_bills, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        bill = serializer.save(uploaded_by=self.request.user)
        
        # Process PDF to extract OCR data if not already provided
        if not bill.ocr_data or not bill.ocr_data.get('items'):
            try:
                # Extract text from PDF
                import PyPDF2
                import io
                
                pdf_content = bill.pdf.read()
                pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_content))
                
                # Extract text from all pages
                full_text = ""
                for page_num in range(len(pdf_reader.pages)):
                    page = pdf_reader.pages[page_num]
                    full_text += page.extract_text() + "\n"
                
                # Parse the text to extract bill items
                items = self.parse_bill_text(full_text)
                total = sum(item.get('total', 0) for item in items)
                
                # Update bill with extracted OCR data
                bill.ocr_data = {
                    'items': items,
                    'total': total,
                    'raw_text': full_text
                }
                bill.save(update_fields=['ocr_data'])
                
            except Exception as e:
                print(f"Error processing PDF OCR: {e}")
                # Keep original ocr_data if processing fails
        
        # Auto-generate invoice if not already exists for this step
        if not hasattr(bill.step, 'invoice'):
            from .models import Invoice
            # Extract line items from OCR data if available
            line_items = []
            if bill.ocr_data and 'items' in bill.ocr_data:
                for item in bill.ocr_data['items']:
                    # Normalize fields from various OCR shapes
                    description = item.get('description') or item.get('itemName') or 'Item'
                    qty = item.get('quantity') or item.get('qty') or 1
                    rate = item.get('rate') or item.get('unitPrice') or 0
                    amount = item.get('amount') or (rate or 0) * (qty or 0)
                    line_items.append({
                        'description': description,
                        'quantity': qty,
                        'rate': rate,
                        'amount': amount,
                    })
            else:
                # Create a default line item from the bill
                total_val = bill.ocr_data.get('total', 0) if bill.ocr_data else 0
                line_items.append({
                    'description': f'Bill for {bill.step.title}',
                    'quantity': 1,
                    'rate': total_val,
                    'amount': total_val,
                })
            
            Invoice.objects.create(
                step=bill.step,
                data={
                    'amount': bill.ocr_data.get('total', 0) if bill.ocr_data else 0,
                    'description': f'Invoice for {bill.step.title}',
                    'bill_id': str(bill.id),
                    'line_items': line_items,
                    'invoice_number': f"INV-{bill.step.project.name[:3].upper()}-{bill.step.order:03d}-{timezone.now().strftime('%Y%m%d')}",
                    'invoice_date': timezone.now().date(),
                    'due_date': (timezone.now() + timezone.timedelta(days=30)).date(),
                    'status': 'DRAFT'
                },
                is_approved=False
            )
        else:
            # Update existing invoice with new bill data
            invoice = bill.step.invoice
            if bill.ocr_data and 'total' in bill.ocr_data:
                invoice.data['amount'] = bill.ocr_data['total']
                invoice.data['bill_id'] = str(bill.id)
                invoice.save()

    @action(detail=True, methods=['post'])
    def submit_to_admin(self, request, pk=None):
        bill = self.get_object()
        bill.is_submitted_to_admin = True
        bill.save()

        # Update invoice status if it exists
        if hasattr(bill.step, 'invoice'):
            invoice = bill.step.invoice
            invoice.data['status'] = 'SUBMITTED'
            invoice.save()

        # (Optional: notification code here)
        return Response({'status': 'submitted'})

    @action(detail=True, methods=['post'])
    def reprocess_ocr(self, request, pk=None):
        """Re-process OCR for a bill on the server side"""
        bill = self.get_object()
        
        if not bill.pdf:
            return Response(
                {"error": "No PDF file found for this bill"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            # Import basic text processing
            import re
            
            file_path = os.path.join(settings.MEDIA_ROOT, str(bill.pdf))
            
            if not os.path.exists(file_path):
                return Response(
                    {"error": "PDF file not found on server"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # For now, we'll use a simple approach - read the file as text
            # This works for text-based PDFs
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    full_text = f.read()
            except UnicodeDecodeError:
                # If it's a binary PDF, we'll need to use a different approach
                # For now, return an error suggesting to use the client-side OCR
                return Response({
                    'status': 'error',
                    'message': 'Binary PDF detected. Please use client-side OCR processing.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Parse the text to find totals
            lines = full_text.split('\n')
            total = 0
            strict_total = 0
            
            # Look for total patterns - improved patterns
            total_patterns = [
                r'\b(grand\s*total|total\s*amount|total|net\s*total|final\s*total|balance\s*due|amount\s*due)\b\s*:?\s*([-₹$€]?[\d,]+(?:\.[\d]{2})?)\s*$',
                r'\b(grand\s*total|total\s*amount|total|net\s*total|final\s*total|balance\s*due|amount\s*due)\b\s*:?\s*([-₹$€]?[\d,]+(?:\.[\d]{2})?)\s*(?:LKR|Rs|₹)?\s*$',
                r'^[-₹$€]?\s*([\d,]+(?:\.[\d]{2})?)\s*(?:LKR|Rs|₹)?\s*$',  # Line with just amount
                r'\b(grand\s*total|total\s*amount|total|net\s*total|final\s*total|balance\s*due|amount\s*due)\b.*?([-₹$€]?[\d,]+(?:\.[\d]{2})?)\s*$',
                r'([-₹$€]?[\d,]+(?:\.[\d]{2})?)\s*(?:LKR|Rs|₹)?\s*$'
            ]
            
            # Strict parser for labeled totals (Grand Total / Subtotal / Tax)
            try:
                joined = "\n".join(lines)
                # Grand Total
                m_gt = re.search(r"grand\s*total\s*:\s*(?:rs\.?|inr|₹)?\s*([\d,]+(?:\.\d{1,2})?)", joined, re.IGNORECASE)
                if m_gt:
                    strict_total = float(re.sub(r"[\s,]", "", m_gt.group(1)))
                else:
                    # Compute from subtotal + tax
                    m_sub = re.search(r"sub\s*total\s*:\s*(?:rs\.?|inr|₹)?\s*([\d,]+(?:\.\d{1,2})?)", joined, re.IGNORECASE)
                    m_tax = re.search(r"tax\s*\(?\s*(\d{1,3})%?\s*\)?\s*:\s*(?:rs\.?|inr|₹)?\s*([\d,]+(?:\.\d{1,2})?)", joined, re.IGNORECASE)
                    if m_sub and m_tax:
                        sub_v = float(re.sub(r"[\s,]", "", m_sub.group(1)))
                        tax_v = float(re.sub(r"[\s,]", "", m_tax.group(2)))
                        strict_total = sub_v + tax_v
            except Exception:
                strict_total = 0

            # Search from bottom to top for total (most likely to be at the end)
            for line in reversed(lines):
                clean_line = line.strip()
                for pattern in total_patterns:
                    match = re.search(pattern, clean_line, re.IGNORECASE)
                    if match:
                        amount_str = match.group(2) if len(match.groups()) > 1 else match.group(1)
                        # Clean the amount string - remove commas and spaces
                        amount_str = re.sub(r'[,\s]', '', amount_str)
                        try:
                            amount = float(amount_str)
                            if amount > total:
                                total = amount
                                # If we found a good match, break early
                                if amount > 0:
                                    break
                        except ValueError:
                            continue
                if total > 0:
                    break
            
            # Infer tax from text if present
            inferred_tax = 0.0
            try:
                tax_line = next((ln for ln in reversed(lines) if re.search(r'\btax\b', ln, re.IGNORECASE)), None)
                if tax_line:
                    amt_match = re.search(r'([\d,]+(?:\.[\d]{2})?)\s*(?:LKR|Rs|₹)?\s*$', tax_line)
                    pct_match = re.search(r'(\d{1,3})%\s*', tax_line)
                    if amt_match:
                        inferred_tax = float(re.sub(r'[,\s]', '', amt_match.group(1)))
                    elif pct_match:
                        # store as percentage marker; client can recompute
                        inferred_tax = float(pct_match.group(1)) / 100.0
            except Exception:
                inferred_tax = 0.0

            # Sanitize raw text to remove control characters that break JSON/DB (e.g., \u0000)
            try:
                import re as _re_sanitize
                clean_text = _re_sanitize.sub(r'[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]', '', full_text or '')
            except Exception:
                clean_text = full_text or ''

            # Prefer strict_total when available
            if strict_total > 0:
                total = strict_total

            # Update the bill with new OCR data
            if total > 0:
                bill.ocr_data = {
                    'total': total,
                    'raw_text': clean_text,
                    'items': [],
                    'confidence': 0.8,
                    'issues': [],
                    'meta': {'pages': 1, 'fileName': os.path.basename(str(bill.pdf)), 'inferred_tax': inferred_tax}
                }
                bill.save()
                
                return Response({
                    'status': 'success',
                    'total': total,
                    'message': f'OCR re-processed successfully. Total: {total}'
                })
            else:
                return Response({
                    'status': 'warning',
                    'message': 'OCR completed but no total amount found'
                }, status=status.HTTP_200_OK)
                
        except Exception as e:
            return Response(
                {"error": f"Error re-processing OCR: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def by_step(self, request):
        """Get all bills for a specific step"""
        step_id = request.query_params.get('step')
        if not step_id:
            return Response(
                {"error": "Step ID is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        bills = Bill.objects.filter(step_id=step_id).order_by('-uploaded_at')
        serializer = self.get_serializer(bills, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download the PDF file for a specific bill"""
        bill = self.get_object()
        
        if not bill.pdf:
            return Response(
                {"error": "No PDF file found for this bill"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            file_path = os.path.join(settings.MEDIA_ROOT, str(bill.pdf))
            print(f"Attempting to download file: {file_path}")
            
            if not os.path.exists(file_path):
                print(f"File not found: {file_path}")
                return Response(
                    {"error": "PDF file not found on server"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Return the file as a response
            response = FileResponse(open(file_path, 'rb'), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="{os.path.basename(str(bill.pdf))}"'
            response['Access-Control-Allow-Origin'] = '*'
            response['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
            print(f"Successfully serving file: {file_path}")
            return response
            
        except Exception as e:
            print(f"Error downloading file: {str(e)}")
            return Response(
                {"error": f"Error downloading file: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.select_related("step", "step__project").prefetch_related("step__bills").all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAdminOrSupervisorOrReadOnly]
    filter_backends = [OrderingFilter]
    ordering = ["-created"]

    def get_queryset(self):
        """Filter invoices based on user role"""
        queryset = super().get_queryset()
        user = self.request.user
        
        if user.role == 'SUPERVISOR':
            # Supervisors can only see invoices for their projects
            queryset = queryset.filter(step__project__supervisor=user)
        elif user.role == 'ADMIN':
            # Admins can see all invoices
            pass
        else:
            # Other users see no invoices
            queryset = queryset.none()
            
        return queryset

    @action(detail=True, methods=['post'])
    def set_items(self, request, pk=None):
        """Replace invoice line items and recompute total amount from items."""
        invoice = self.get_object()
        items = request.data.get('items')
        if not isinstance(items, list):
            return Response({"error": "'items' must be a list"}, status=status.HTTP_400_BAD_REQUEST)
        # sanitize and coerce numeric fields
        clean_items = []
        total = 0.0
        for item in items:
            description = str(item.get('description', '') or '').strip() or 'Item'
            try:
                quantity = float(item.get('quantity', 1) or 1)
            except (TypeError, ValueError):
                quantity = 1.0
            try:
                rate = float(item.get('rate', 0) or 0)
            except (TypeError, ValueError):
                rate = 0.0
            amount = item.get('amount')
            try:
                amount = float(amount) if amount is not None else quantity * rate
            except (TypeError, ValueError):
                amount = quantity * rate
            total += amount
            clean_items.append({
                'description': description,
                'quantity': quantity,
                'rate': rate,
                'amount': amount,
            })
        # update invoice data
        data = invoice.data or {}
        data['line_items'] = clean_items
        data['amount'] = round(total, 2)
        # preserve other fields (invoice_number, status, etc.)
        invoice.data = data
        invoice.save()
        return Response(self.get_serializer(invoice).data)

    @action(detail=True, methods=['get'])
    def verify(self, request, pk=None):
        """Return computed totals, OCR totals, and difference for this invoice without mutating state."""
        invoice = self.get_object()
        serializer = self.get_serializer(invoice)
        return Response({
            'invoice_id': str(invoice.id),
            'items': serializer.data.get('items'),
            'computed_total': serializer.data.get('computed_total'),
            'ocr_total': serializer.data.get('ocr_total'),
            'difference': serializer.data.get('difference'),
            'is_consistent': serializer.data.get('is_consistent'),
            'status': serializer.data.get('status_display'),
        })

    @action(detail=True, methods=['post'])
    def submit_to_admin(self, request, pk=None):
        """Submit invoice to admin for approval"""
        invoice = self.get_object()
        invoice.data['status'] = 'SUBMITTED'
        invoice.save()
        return Response({'status': 'submitted'})

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve invoice (admin only)"""
        if request.user.role != 'ADMIN':
            return Response(
                {"error": "Only admins can approve invoices"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        invoice = self.get_object()
        invoice.data['status'] = 'APPROVED'
        invoice.is_approved = True
        invoice.save()
        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject invoice (admin only)"""
        if request.user.role != 'ADMIN':
            return Response(
                {"error": "Only admins can reject invoices"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        invoice = self.get_object()
        invoice.data['status'] = 'REJECTED'
        invoice.is_approved = False
        invoice.save()
        return Response({'status': 'rejected'})

    @action(detail=False, methods=['get'])
    def by_step(self, request):
        """Get invoice for a specific step"""
        step_id = request.query_params.get('step')
        if not step_id:
            return Response(
                {"error": "Step ID is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            invoice = Invoice.objects.get(step_id=step_id)
            serializer = self.get_serializer(invoice)
            return Response(serializer.data)
        except Invoice.DoesNotExist:
            return Response(
                {"error": "Invoice not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def by_project(self, request):
        """Get all invoices for a specific project"""
        project_id = request.query_params.get('project')
        if not project_id:
            return Response(
                {"error": "Project ID is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        invoices = Invoice.objects.filter(step__project_id=project_id).order_by('-created')
        serializer = self.get_serializer(invoices, many=True)
        return Response(serializer.data)


class VRVideoViewSet(viewsets.ModelViewSet):
    queryset = VRVideo.objects.select_related("project").all()
    serializer_class = VRVideoSerializer
    permission_classes = [IsAdminOrSupervisorOrReadOnly]
    filter_backends = [OrderingFilter]
    ordering = ["-uploaded"]


class SupervisorNoteViewSet(viewsets.ModelViewSet):
    serializer_class = SupervisorNoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        project_id = self.request.query_params.get('project')
        queryset = SupervisorNote.objects.all()

        if user.role == 'SUPERVISOR':
            queryset = queryset.filter(supervisor=user)

        if project_id:
            queryset = queryset.filter(project__id=project_id)

        return queryset

    def perform_create(self, serializer):
        serializer.save(supervisor=self.request.user)

    def perform_update(self, serializer):
        serializer.save(supervisor=self.request.user)
