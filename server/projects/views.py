# projects/views.py
from rest_framework import viewsets, permissions, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
import json
import os
import pandas as pd
import numpy as np
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import uuid
from django.utils import timezone

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
    from .models import Step
    
    created_steps = []
    
    # Check if we have explicit steps from the BOQ file
    if "steps" in boq_data and boq_data["steps"]:
        # Create steps directly from the BOQ file structure
        for order, step_data in enumerate(boq_data["steps"], 1):
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
            
            # Create the step
            step = Step.objects.create(
                project=project,
                title=step_data["title"],
                description=f"Materials for {step_data['title']}",
                order=order,
                expected_materials=materials,
                expected_budget=step_data["budget"]
            )
            
            created_steps.append(step.id)
        
        return created_steps
    
    # Fallback to construction phases if no explicit steps
    # Get construction phases from BOQ data
    construction_phases = boq_data.get('construction_phases', {})
    phase_budgets = boq_data.get('phase_budgets', {})
    
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
    room_types = ["bedroom", "living", "dining", "kitchen", "bathroom", "toilet", "hall", "master"]
    
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
                    expected_budget=room_budget
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
            expected_budget=expected_budget
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
    queryset = Project.objects.select_related('supervisor').prefetch_related('steps').all()  # Optimize with prefetch_related
    serializer_class = ProjectSerializer
    permission_classes = [IsAdminOrSupervisorOrReadOnly]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["name", "description"]
    ordering_fields = ["start_date", "estimated_end_date", "created"]
    ordering = ["-created"]
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    
    def get_queryset(self):
        # By default, exclude deleted projects with optimized queries
        return Project.objects.select_related('supervisor').prefetch_related('steps', 'steps__logs').filter(is_deleted=False)
    
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
                {"error": "Invalid file format. Only Excel files (.xlsx, .xls) are supported."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create a unique filename to avoid conflicts
        unique_filename = f"{uuid.uuid4()}_{boq_file.name}"
        temp_path = default_storage.save(f'temp_boq/{unique_filename}', ContentFile(boq_file.read()))
        full_temp_path = os.path.join(settings.MEDIA_ROOT, temp_path)
        
        try:
            # Parse the BOQ file
            boq_data = parse_boq_file(full_temp_path)
            
            # Check for parsing errors
            if "error" in boq_data:
                return Response(
                    {"error": boq_data["error"]}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
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
                {"error": "BOQ file is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        boq_file = request.FILES['boq_file']
        file_ext = os.path.splitext(boq_file.name)[1].lower()
        if file_ext not in ['.xlsx', '.xls']:
            return Response(
                {"error": "Invalid BOQ file format. Only Excel files (.xlsx, .xls) are supported."}, 
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
                # Parse the BOQ file
                boq_data = parse_boq_file(full_temp_path)
                
                # Create steps based on BOQ data
                create_steps_from_boq(project, boq_data)
                
            except Exception as e:
                print(f"Error processing BOQ: {e}")
            finally:
                # Clean up the temp file - use try/except to handle potential file access issues
                try:
                    if os.path.exists(full_temp_path):
                        os.close(os.open(full_temp_path, os.O_RDONLY))  # Ensure file is closed
                        os.remove(full_temp_path)
                except Exception as e:
                    print(f"Warning: Could not delete temporary file {full_temp_path}: {e}")
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def perform_create(self, serializer):
        """Override to return the created instance"""
        return serializer.save()

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
        
        projects = Project.objects.filter(supervisor=request.user)
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


class StepViewSet(viewsets.ModelViewSet):
    queryset = Step.objects.select_related("project").all()
    serializer_class = StepSerializer
    permission_classes = [IsAdminOrSupervisorOrReadOnly]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["title"]
    ordering_fields = ["order", "is_approved", "actual_completed"]
    ordering = ["order"]
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """
        Mark a step as approved by admin
        """
        step = self.get_object()
        
        # Set approval status
        step.is_approved = True
        
        # Set actual completion date if not already set
        if not step.actual_completed and 'actual_completed' in request.data:
            step.actual_completed = request.data['actual_completed']
        elif not step.actual_completed:
            step.actual_completed = timezone.now().date()
            
        step.save()
        
        # Update project progress
        project = step.project
        total_steps = project.steps.count()
        completed_steps = project.steps.filter(is_approved=True).count()
        
        if total_steps > 0:
            project.progress = int((completed_steps / total_steps) * 100)
            
            # If all steps are completed, mark project as completed
            if completed_steps == total_steps:
                project.is_completed = True
                
            project.save()
        
        # --- Auto-generate invoice if not exists ---
        from .models import Invoice
        if not hasattr(step, 'invoice'):
            Invoice.objects.create(
                step=step,
                data={
                    'amount': float(step.expected_budget) if step.expected_budget else 0,
                    'description': f'Invoice for {step.title}'
                },
                is_approved=False
            )
        # --- End auto-generate invoice ---
        
        serializer = self.get_serializer(step)
        return Response(serializer.data)


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
    filter_backends = [OrderingFilter]
    ordering = ["-uploaded_at"]
    parser_classes = (MultiPartParser, FormParser)  # ✅ remove JSONParser here

    def create(self, request, *args, **kwargs):
        print("📥 create() called")  # ✅ Confirm it's running

        file = request.FILES.get('file')
        project_id = request.data.get('project')
        title = request.data.get('title', '')
        description = request.data.get('description', '')
        step_id = request.data.get('step')

        if not file or not project_id:
            return Response({'error': 'File and project are required.'}, status=400)

        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return Response({'error': 'Project not found.'}, status=404)

        step = None
        if step_id:
            try:
                step = Step.objects.get(id=step_id, project=project)
            except Step.DoesNotExist:
                return Response({'error': 'Step not found for this project.'}, status=404)

        file_ext = os.path.splitext(file.name)[1].lower()
        media_type = 'DOCUMENT'
        if file_ext in ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']:
            media_type = 'IMAGE'
        elif file_ext in ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm']:
            media_type = 'VIDEO'
        if file_ext in ['.mp4', '.avi', '.mov'] and 'vr' in file.name.lower():
            media_type = 'VR'

        data = {
            'project': project.id,
            'file': file,
            'media_type': media_type,
            'title': title,
            'description': description,
            'filename': file.name,
            'file_size': file.size,
            'step': step.id if step else None,
        }

        serializer = self.get_serializer(data=data)
        if not serializer.is_valid():
            print("🔥 Serializer errors:", serializer.errors)
            return Response(serializer.errors, status=400)

        media_instance = serializer.save(uploaded_by=request.user, step=step)

        if step:
            progress_log = ProgressLog.objects.create(
                step=step,
                supervisor=request.user,
                message=description or f"Media uploaded: {file.name}",
            )
            ProgressLogMedia.objects.create(
                progress_log=progress_log,
                file=file,
                media_type=media_type,
                filename=file.name,
                file_size=file.size,
            )

        return Response(serializer.data, status=201)


    @action(detail=False, methods=['get'])
    def by_project(self, request):
        """
        Get all media files for a specific project
        """
        project_id = request.query_params.get('project')
        if not project_id:
            return Response(
                {"error": "Project ID is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return Response(
                {"error": "Project not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        media_files = ProjectMedia.objects.filter(project=project)
        serializer = self.get_serializer(media_files, many=True)
        return Response(serializer.data)


class BillViewSet(viewsets.ModelViewSet):
    queryset = Bill.objects.select_related("step").all()
    serializer_class = BillSerializer
    permission_classes = [IsAdminOrSupervisorOrReadOnly]
    filter_backends = [OrderingFilter]
    ordering = ["-uploaded_at"]


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.select_related("step").all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAdminOrSupervisorOrReadOnly]
    filter_backends = [OrderingFilter]
    ordering = ["-created"]


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
