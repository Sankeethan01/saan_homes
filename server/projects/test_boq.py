import os
import pandas as pd
from django.conf import settings
from .views import parse_boq_file

def create_test_boq_file():
    """Create a test BOQ Excel file for testing"""
    # Sample BOQ data
    data = {
        'Item Description': [
            'Excavation work for foundation',
            'Concrete for foundation (M20)',
            'Brickwork for walls',
            'Plastering work',
            'Electrical wiring',
            'Plumbing fixtures',
            'Flooring tiles',
            'Painting work',
            'Windows and doors',
            'Roofing materials',
        ],
        'Quantity': [120, 45, 2500, 3500, 1, 1, 1200, 4500, 15, 1],
        'Unit': ['cu.m', 'cu.m', 'sq.ft', 'sq.ft', 'lot', 'lot', 'sq.ft', 'sq.ft', 'nos', 'lot'],
        'Rate': [350, 7500, 75, 25, 75000, 85000, 95, 18, 12000, 150000],
        'Amount': [42000, 337500, 187500, 87500, 75000, 85000, 114000, 81000, 180000, 150000],
    }
    
    # Create DataFrame
    df = pd.DataFrame(data)
    
    # Define the file path
    test_file_path = os.path.join(settings.MEDIA_ROOT, 'test_boq.xlsx')
    
    # Create the directory if it doesn't exist
    os.makedirs(os.path.dirname(test_file_path), exist_ok=True)
    
    # Save to Excel
    df.to_excel(test_file_path, index=False)
    
    print(f"Test BOQ file created at: {test_file_path}")
    return test_file_path

def test_parse_boq():
    """Test the BOQ parsing functionality"""
    # Create a test BOQ file
    test_file_path = create_test_boq_file()
    
    # Parse the BOQ file
    boq_data = parse_boq_file(test_file_path)
    
    # Print the parsed data
    print("\nParsed BOQ Data:")
    print(f"Total Budget: ${boq_data['budget']}")
    print("\nMaterials:")
    for material, details in boq_data['materials'].items():
        print(f"- {material}: {details}")
    
    return boq_data

def test_boq_parsing():
    """
    Test function to verify BOQ parsing functionality.
    This is a standalone script that can be run to test the BOQ parser.
    
    Usage:
    python manage.py shell
    >>> from projects.test_boq import test_boq_parsing
    >>> test_boq_parsing()
    """
    # Path to test BOQ file
    test_file = os.path.join(settings.MEDIA_ROOT, 'test_boq.xlsx')
    
    if not os.path.exists(test_file):
        print(f"Test file not found: {test_file}")
        print("Please create a test BOQ file at this location.")
        return
    
    print(f"Testing BOQ parsing with file: {test_file}")
    
    # Parse the BOQ file
    result = parse_boq_file(test_file)
    
    # Print the results
    print("\n===== PARSING RESULTS =====")
    
    if "error" in result:
        print(f"Error: {result['error']}")
        return
    
    print(f"Total Budget: {result['budget']}")
    print(f"Total Materials: {len(result['materials'])}")
    print(f"Columns Found: {result.get('columns', {})}")
    
    # Print phase information
    if "phase_budgets" in result:
        print("\n===== CONSTRUCTION PHASES =====")
        for phase, budget in result["phase_budgets"].items():
            if budget > 0:
                phase_name = phase.replace("_", " ").title()
                material_count = len(result["construction_phases"][phase])
                percentage = round((budget / result["budget"]) * 100, 2) if result["budget"] else 0
                print(f"{phase_name}: ${budget} ({percentage}%) - {material_count} materials")
    
    # Print sample materials
    print("\n===== SAMPLE MATERIALS =====")
    for i, (material, details) in enumerate(list(result["materials"].items())[:5]):
        print(f"{i+1}. {material}")
        print(f"   Quantity: {details.get('quantity', 'N/A')}")
        print(f"   Unit: {details.get('unit', 'N/A')}")
        print(f"   Rate: {details.get('rate', 'N/A')}")
        print()
    
    # Print construction phases breakdown
    print("\n===== DETAILED PHASE BREAKDOWN =====")
    for phase, materials in result["construction_phases"].items():
        if materials:
            phase_name = phase.replace("_", " ").title()
            print(f"\n{phase_name} ({len(materials)} items):")
            for i, item in enumerate(materials[:3]):  # Show first 3 items in each phase
                print(f"  {i+1}. {item['material']}: {item['details'].get('quantity', 'N/A')} {item['details'].get('unit', '')}")
            
            if len(materials) > 3:
                print(f"  ... and {len(materials) - 3} more items")
    
    return result

if __name__ == "__main__":
    # This will run when the script is executed directly
    print("This script should be run from Django shell.")
    print("python manage.py shell")
    print(">>> from projects.test_boq import test_boq_parsing")
    print(">>> test_boq_parsing()") 