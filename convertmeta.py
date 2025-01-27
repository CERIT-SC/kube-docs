#!/usr/bin/python3

import sys
import json
import re
import os

def convert_meta(input_file):
    with open(input_file, 'r') as f:
        content = f.read()

    # Extract the object from export default with more flexible matching
    obj_match = re.search(
        r'export\s+default\s+(\{.*?\})\s*;?\s*$',
        content,
        re.DOTALL | re.MULTILINE
    )
    
    if not obj_match:
        raise ValueError("Could not find export default object")

    # Extract ordered keys using regex
    keys = []
    pattern = re.compile(r'''["']([^"']+)["']\s*:''')
    for match in pattern.finditer(obj_match.group(1)):
        keys.append(match.group(1))

    # Create and write JSON output
    output = {"pages": keys}
    with open(input_file, 'w') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    dir_name = os.path.dirname(input_file)
    new_file = os.path.join(dir_name, 'meta.json')
    # Remove new_file if it exists to allow rename
    if os.path.exists(new_file):
        os.remove(new_file)
    os.rename(input_file, new_file)

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: python convert_meta.py input._meta.js")
        sys.exit(1)
    
    try:
        convert_meta(sys.argv[1])
        print("Successfully created meta.json")
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)
