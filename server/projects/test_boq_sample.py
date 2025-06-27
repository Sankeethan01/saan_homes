"""
Test script to test the BOQ.xlsx file.
Run with: python manage.py shell -c "from projects.test_boq_sample import test_sample_boq; test_sample_boq()"
"""

from .views import parse_boq_file

def test_sample_boq():
    """Test the BOQ.xlsx file"""
    try:
        result = parse_boq_file('media/BOQ.xlsx')
        
        print("===== BOQ PARSING RESULTS =====")
        
        if "error" in result:
            print(f"Error: {result['error']}")
            return
        
        print(f"Sheet used: {result.get('sheet_name', 'N/A')}")
        print(f"Total Budget: ${result.get('budget', 0)}")
        print(f"Total Materials: {len(result.get('materials', {}))}")
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
        for i, (material, details) in enumerate(list(result.get("materials", {}).items())[:5]):
            print(f"{i+1}. {material}")
            print(f"   Quantity: {details.get('quantity', 'N/A')}")
            print(f"   Unit: {details.get('unit', 'N/A')}")
            print(f"   Rate: {details.get('rate', 'N/A')}")
            print()
        
        # Print construction phases breakdown
        print("\n===== DETAILED PHASE BREAKDOWN =====")
        for phase, materials in result.get("construction_phases", {}).items():
            if materials:
                phase_name = phase.replace("_", " ").title()
                print(f"\n{phase_name} ({len(materials)} items):")
                for i, item in enumerate(materials[:3]):  # Show first 3 items in each phase
                    print(f"  {i+1}. {item['material']}: {item['details'].get('quantity', 'N/A')} {item['details'].get('unit', '')}")
                
                if len(materials) > 3:
                    print(f"  ... and {len(materials) - 3} more items")
    
    except Exception as e:
        print(f"Error testing BOQ file: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("This script should be run from Django shell.")
    print("python manage.py shell -c \"from projects.test_boq_sample import test_sample_boq; test_sample_boq()\"") 