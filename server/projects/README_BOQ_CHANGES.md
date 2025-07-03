# BOQ Parsing Enhancements

This document outlines the changes made to the BOQ (Bill of Quantities) parsing functionality in the project management system.

## Overview of Changes

The BOQ parsing functionality has been enhanced to better handle structured BOQ files with explicit steps and multiple materials per step. The system now supports two parsing modes:

1. **Explicit Step Detection**: The parser now detects step headers in the BOQ file and groups materials under each step.
2. **Construction Phase Fallback**: If no explicit steps are found, the system falls back to the previous approach of categorizing materials into predefined construction phases.

## Key Improvements

### 1. Enhanced `parse_boq_file` Function

- Added detection of step headers in BOQ files using common patterns like 'step', 'phase', 'foundation', etc.
- Improved material parsing to include quantity, unit, and rate information
- Structured the output to include explicit steps when detected
- Maintained backward compatibility with the construction phase approach

### 2. Updated `create_steps_from_boq` Function

- Now prioritizes explicit steps found in the BOQ file
- Creates project steps directly from the BOQ structure when available
- Preserves detailed material information including quantity, unit, and rate
- Falls back to the previous construction phase approach if no explicit steps are found

### 3. Modified `preview_boq` API Endpoint

- Updated to handle both explicit steps and construction phases
- Provides step information in the preview response when available

## Expected BOQ File Format

The enhanced parser works best with BOQ files structured as follows:

1. **Column Headers**:
   - Material/Description/Item
   - Quantity
   - Unit
   - Rate
   - Amount/Total

2. **Step Structure**:
   - Step headers should be short descriptions that include keywords like 'step', 'phase', 'foundation', etc.
   - Materials should be listed under each step with their quantities, units, and rates

## Example BOQ Structure

```
Step 1: Foundation Work
Concrete for foundation | 10 | cu.m | 100 | 1000
Reinforcement steel | 500 | kg | 2 | 1000
...

Step 2: Structural Framework
Concrete for columns | 5 | cu.m | 120 | 600
Steel for beams | 300 | kg | 2.5 | 750
...
```

## Testing

To test the new BOQ parsing functionality:

1. Upload a BOQ file with explicit step headers
2. The system should detect the steps and create project steps accordingly
3. Each step should contain detailed material information

If no explicit steps are found, the system will fall back to categorizing materials into predefined construction phases. 