# projects/views.py
from rest_framework import viewsets, permissions, status
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
)
from .serializers import (
    ProjectSerializer,
    StepSerializer,
    ProgressLogSerializer,
    BillSerializer,
    InvoiceSerializer,
    VRVideoSerializer,
)


# ──────────────────────────────────────────────
# BOQ Parsing Utilities
# ──────────────────────────────────────────────
def parse_boq_file(file_path):
    """
    Parse a BOQ file using pandas and extract materials, quantities, and costs.
    Focus on description and quantity, with rates being optional.
    Handles multiple sheets and skips sheets without required columns.
    
    Args:
        file_path: Path to the BOQ file
    
    Returns:
        dict: Dictionary containing parsed materials and budget
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
                    quantity_patterns = ['qty', 'quantity', 'nos', 'number', 'amount', 'count']
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
                        
                        # Create a summary of construction phases for better step creation
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
                        
                        for _, row in df.iterrows():
                            material = str(row[material_col])
                            
                            # Skip empty or header-like rows
                            if not material.strip() or material.lower() in ['description', 'item', 'total', 'sl no', 'sl.no', 'sl. no.', 'sl no.', 'sl.no.']:
                                continue
                                
                            # Skip rows where material looks like a header (all uppercase, short text)
                            if len(material) < 15 and material.isupper() and not any(c.isdigit() for c in material):
                                continue
                                
                            # Skip NaN values in description
                            if material.lower() == 'nan' or pd.isna(material):
                                continue
                            
                            # Get quantity, defaulting to 1 if missing
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
                            if rate is not None and amount is None:
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
                                
                                # Categorize material into construction phase
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
                        
                        # Calculate phase budgets
                        phase_budgets = {}
                        for phase, items in construction_phases.items():
                            phase_budget = sum(item["amount"] for item in items)
                            phase_budgets[phase] = phase_budget
                        
                        return {
                            "materials": materials,
                            "budget": round(total_budget, 2) if total_budget else 0,
                            "construction_phases": construction_phases,
                            "phase_budgets": phase_budgets,
                            "columns": {
                                "material": material_col,
                                "quantity": quantity_col,
                                "unit": unit_col,
                                "rate": rate_col,
                                "amount": amount_col
                            },
                            "sheet_name": sheet_name
                        }
                except Exception as e:
                    print(f"Error parsing sheet {sheet_name}: {e}")
                    continue
            
            # If we get here, we couldn't find any valid sheets
            return {
                "materials": {},
                "budget": 0,
                "error": "Could not find any valid sheets with required columns (Description/Item/Material and Quantity). Please check your BOQ file format."
            }
                
        elif file_ext == '.csv':
            # Try to read CSV file
            df = pd.read_csv(file_path)
        elif file_ext == '.pdf':
            # For PDFs, we'd need more advanced parsing, return placeholder for now
            return {
                "materials": {"Note": "PDF parsing requires additional processing"},
                "budget": 0,
                "error": "PDF files are not supported. Please upload an Excel file."
            }
        else:
            # Unsupported format
            return {
                "materials": {"Error": "Unsupported file format"},
                "budget": 0,
                "error": "Unsupported file format. Please upload an Excel file (.xlsx or .xls)."
            }
        
        # This part is for CSV files or if we somehow reach here with Excel files
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
        quantity_patterns = ['qty', 'quantity', 'nos', 'number', 'amount', 'count']
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
        
        # Validate that we have the minimum required columns (only description and quantity)
        missing_columns = []
        if not material_col:
            missing_columns.append("Description/Item/Material")
        if not quantity_col:
            missing_columns.append("Quantity")
            
        if missing_columns:
            return {
                "materials": {},
                "budget": 0,
                "error": f"BOQ file is missing required columns: {', '.join(missing_columns)}. Please ensure your BOQ file has these columns."
            }
        
        # Process with identified columns (for CSV files)
        # Rest of the processing is the same as for Excel files
        # ... (same code as above)
        
    except Exception as e:
        # Log the error and return empty result
        print(f"Error parsing BOQ file: {e}")
        return {
            "materials": {"Error": f"Failed to parse BOQ: {str(e)}"},
            "budget": 0,
            "error": f"Failed to parse BOQ file: {str(e)}"
        }


def create_steps_from_boq(project, boq_data):
    """
    Create project steps based on construction phases from the BOQ data
    
    Args:
        project: Project object
        boq_data: Parsed BOQ data from parse_boq_file
    
    Returns:
        list: Created step IDs
    """
    from .models import Step
    
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
    
    created_steps = []
    
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
                expected_materials = [item["material"] for item in items]
                total_quantity = sum(item["details"].get("quantity", 0) for item in items)
                
                # Calculate budget for this room
                room_budget = sum(item["amount"] for item in items)
                
                # Create the step
                step = Step.objects.create(
                    project=project,
                    title=f"Finishing - {room_name}",
                    description=f"Finishing work for {room_name}",
                    order=room_order,
                    expected_materials=expected_materials,
                    expected_quantity=total_quantity,
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
        expected_materials = [item["material"] for item in materials]
        total_quantity = sum(item["details"].get("quantity", 0) for item in materials)
        
        # Get budget if available
        expected_budget = phase_budgets.get(phase_key, None)
        
        # Create the step
        step = Step.objects.create(
            project=project,
            title=title,
            description=f"Materials for {title}",
            order=order,
            expected_materials=expected_materials,
            expected_quantity=total_quantity,
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
    queryset = Project.objects.select_related('supervisor').all()  # Keep this for DRF to discover the model
    serializer_class = ProjectSerializer
    permission_classes = [IsAdminOrSupervisorOrReadOnly]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["name", "description"]
    ordering_fields = ["start_date", "estimated_end_date", "created"]
    ordering = ["-created"]
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    
    def get_queryset(self):
        # By default, exclude deleted projects
        return Project.objects.select_related('supervisor').filter(is_deleted=False)
    
    @action(detail=False, methods=['get'])
    def recycle_bin(self, request):
        """
        List all deleted projects (recycle bin)
        """
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
        project = self.get_object()
        project.soft_delete()
        return Response({"status": "project moved to recycle bin"}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """
        Restore a project from the recycle bin
        """
        # Override get_queryset to include deleted projects
        project = Project.objects.get(pk=pk)
        project.restore()
        serializer = self.get_serializer(project)
        return Response(serializer.data)
    
    @action(detail=True, methods=['delete'])
    def permanent_delete(self, request, pk=None):
        """
        Permanently delete a project from the recycle bin
        """
        # Override get_queryset to include deleted projects
        project = Project.objects.get(pk=pk)
        project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

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
            
            # Add phase information if available
            if "phase_budgets" in boq_data:
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
            
        serializer = self.get_serializer(step)
        return Response(serializer.data)


class ProgressLogViewSet(viewsets.ModelViewSet):
    queryset = ProgressLog.objects.select_related("step", "supervisor").all()
    serializer_class = ProgressLogSerializer
    permission_classes = [IsAdminOrSupervisorOrReadOnly]
    filter_backends = [OrderingFilter]
    ordering = ["-created"]

    def perform_create(self, serializer):
        """
        Automatically set the supervisor when creating a progress log
        """
        serializer.save(supervisor=self.request.user)


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
