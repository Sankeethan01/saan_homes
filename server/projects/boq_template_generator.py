"""
BOQ Template Generator

This module creates standardized BOQ templates in Excel format.
"""

import os
import pandas as pd
import numpy as np
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.utils import get_column_letter
from django.conf import settings
import uuid

def generate_boq_template(output_path=None):
    """
    Generate a standardized BOQ template in Excel format.
    
    Args:
        output_path (str, optional): Path where to save the template. 
                                    If None, saves to media/templates/ with a unique name.
    
    Returns:
        str: Path to the generated template file
    """
    # Create a new workbook
    wb = Workbook()
    
    # Create cover sheet
    cover = wb.active
    cover.title = "Instructions"
    
    # Style definitions
    header_font = Font(name='Arial', size=12, bold=True, color='FFFFFF')
    header_fill = PatternFill(start_color='1B4965', end_color='1B4965', fill_type='solid')
    header_alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
    border = Border(
        left=Side(style='thin', color='000000'),
        right=Side(style='thin', color='000000'),
        top=Side(style='thin', color='000000'),
        bottom=Side(style='thin', color='000000')
    )
    
    # Add title
    title_cell = cover.cell(row=1, column=1)
    title_cell.value = "SAAN HOMES - BOQ TEMPLATE INSTRUCTIONS"
    title_cell.font = Font(name='Arial', size=16, bold=True)
    title_cell.alignment = Alignment(horizontal='center', vertical='center')
    
    # Apply borders to all cells that will be merged in the title
    for col in range(1, 7):
        cover.cell(row=1, column=col).border = border
    
    # Merge title cells
    cover.merge_cells('A1:F1')
    
    # Add instructions
    instructions = [
        ["This template is designed for creating a Bill of Quantities (BOQ) for SAAN Homes projects."],
        ["Please follow these instructions to ensure your BOQ is processed correctly:"],
        [""],
        ["1. Each construction phase should be added as a separate step in the 'BOQ' sheet."],
        ["2. Do not modify the column headers or structure of the template."],
        ["3. Fill in all required fields: Item Description, Quantity, Unit, Rate."],
        ["4. The Amount will be calculated automatically (Quantity × Rate)."],
        ["5. Use the predefined units when possible (e.g., sq.m, m3, kg, etc.)."],
        ["6. Add a clear step title for each construction phase (e.g., 'STEP 1: FOUNDATION WORKS')."],
        ["7. Save the file as Excel (.xlsx) format before uploading."],
        [""],
        ["For any questions or assistance, please contact the SAAN Homes technical team."]
    ]
    
    for i, instruction in enumerate(instructions):
        row_num = i + 3
        
        # Set value and style before merging
        cell = cover.cell(row=row_num, column=1)
        cell.value = instruction[0]
        cell.alignment = Alignment(vertical='center', wrap_text=True)
        
        # Apply borders to all cells that will be merged
        for col in range(1, 7):
            cover.cell(row=row_num, column=col).border = border
        
        # Now merge cells
        cover.merge_cells(f'A{row_num}:F{row_num}')
    
    # Adjust column widths
    for col in range(1, 7):
        cover.column_dimensions[get_column_letter(col)].width = 15
    
    # Create BOQ sheet
    boq_sheet = wb.create_sheet(title="BOQ")
    
    # Add headers
    headers = ["Step/Phase", "Item Description", "Quantity", "Unit", "Rate", "Amount"]
    for col, header in enumerate(headers, start=1):
        cell = boq_sheet.cell(row=1, column=col)
        cell.value = header
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = header_alignment
        cell.border = border
    
    # Add example data with placeholder formulas
    # We'll calculate the actual cell references later
    examples = [
        ["STEP 1: FOUNDATION WORKS", "", "", "", "", ""],
        ["", "Excavation for foundation", 50, "cu.m", 15, ""],  # Formula will be added dynamically
        ["", "PCC for foundation", 25, "cu.m", 120, ""],
        ["", "RCC for foundation", 30, "cu.m", 180, ""],
        ["STEP 2: STRUCTURAL WORKS", "", "", "", "", ""],
        ["", "Column concrete", 15, "cu.m", 200, ""],
        ["", "Beam concrete", 20, "cu.m", 190, ""],
        ["", "Slab concrete", 40, "cu.m", 175, ""],
        ["STEP 3: WALL & ROOFING", "", "", "", "", ""],
        ["", "Brick masonry", 100, "sq.m", 45, ""],
        ["", "Plastering", 200, "sq.m", 20, ""],
    ]
    
    current_row = 2
    data_rows = []  # Track rows with actual data (not headers) for formula references
    
    for row_data in examples:
        # Check if this is a step header
        if row_data[0] and "STEP" in row_data[0]:
            # Set the value before merging cells
            boq_sheet.cell(row=current_row, column=1).value = row_data[0]
            boq_sheet.cell(row=current_row, column=1).font = Font(bold=True)
            boq_sheet.cell(row=current_row, column=1).alignment = Alignment(horizontal='left', vertical='center')
            
            # Apply borders to all cells that will be merged
            for col in range(1, 7):
                cell = boq_sheet.cell(row=current_row, column=col)
                cell.border = border
            
            # Now merge the cells
            boq_sheet.merge_cells(f'A{current_row}:F{current_row}')
        else:
            # Regular data row - store the row number for formula references
            data_rows.append(current_row)
            
            # Add values for columns 1-5
            for col_idx, value in enumerate(row_data[:5], start=1):
                cell = boq_sheet.cell(row=current_row, column=col_idx)
                cell.value = value
                cell.border = border
            
            # Add formula for column 6 (Amount = Quantity * Rate)
            amount_cell = boq_sheet.cell(row=current_row, column=6)
            amount_cell.value = f"=C{current_row}*E{current_row}"
            amount_cell.border = border
        
        current_row += 1
    
    # Add a total row
    total_row = current_row + 1
    boq_sheet.cell(row=total_row, column=1).value = "TOTAL"
    boq_sheet.cell(row=total_row, column=1).font = Font(bold=True)
    boq_sheet.cell(row=total_row, column=1).alignment = Alignment(horizontal='right', vertical='center')
    
    # Merge cells A-E for the total row
    for col in range(1, 6):
        boq_sheet.cell(row=total_row, column=col).border = border
    boq_sheet.merge_cells(f'A{total_row}:E{total_row}')
    
    # Add SUM formula for the total
    total_cell = boq_sheet.cell(row=total_row, column=6)
    
    # Create a formula that sums only the data rows (skipping headers)
    if data_rows:
        amount_cells = [f"F{row}" for row in data_rows]
        total_cell.value = f"=SUM({','.join(amount_cells)})"
    else:
        total_cell.value = "=0"
        
    total_cell.font = Font(bold=True)
    total_cell.border = border
    total_cell.fill = PatternFill(start_color='E6E6E6', end_color='E6E6E6', fill_type='solid')
    
    # Set column widths
    column_widths = [20, 40, 10, 10, 10, 15]
    for i, width in enumerate(column_widths, start=1):
        boq_sheet.column_dimensions[get_column_letter(i)].width = width
    
    # Create a units reference sheet
    units_sheet = wb.create_sheet(title="Units Reference")
    
    # Add headers
    units_headers = ["Unit", "Description", "Example Usage"]
    for col, header in enumerate(units_headers, start=1):
        cell = units_sheet.cell(row=1, column=col)
        cell.value = header
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = header_alignment
        cell.border = border
    
    # Add common units
    units_data = [
        ["sq.m", "Square Meter", "Flooring, plastering, painting"],
        ["m2", "Square Meter", "Same as sq.m"],
        ["cu.m", "Cubic Meter", "Concrete, excavation"],
        ["m3", "Cubic Meter", "Same as cu.m"],
        ["rm", "Running Meter", "Beams, pipes, cables"],
        ["kg", "Kilogram", "Steel, metal items"],
        ["nos", "Numbers/Count", "Fixtures, fittings, doors"],
        ["lot", "Lot/Lumpsum", "Labor, miscellaneous works"],
        ["sq.ft", "Square Feet", "Alternative area measurement"],
        ["ton", "Metric Ton", "Bulk materials (1000 kg)"],
    ]
    
    for row_idx, row_data in enumerate(units_data, start=2):
        for col_idx, value in enumerate(row_data, start=1):
            cell = units_sheet.cell(row=row_idx, column=col_idx)
            cell.value = value
            cell.border = border
    
    # Set column widths for units sheet
    units_column_widths = [10, 20, 40]
    for i, width in enumerate(units_column_widths, start=1):
        units_sheet.column_dimensions[get_column_letter(i)].width = width
    
    # Determine output path
    if output_path is None:
        # Create templates directory if it doesn't exist
        templates_dir = os.path.join(settings.MEDIA_ROOT, 'templates')
        os.makedirs(templates_dir, exist_ok=True)
        
        # Generate unique filename
        unique_id = str(uuid.uuid4())[:8]
        output_path = os.path.join(templates_dir, f'boq_template_{unique_id}.xlsx')
    
    # Save the workbook
    wb.save(output_path)
    
    return output_path

if __name__ == "__main__":
    # For testing purposes
    template_path = generate_boq_template()
    print(f"Template generated at: {template_path}")
