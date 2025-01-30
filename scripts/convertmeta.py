#!/usr/bin/python3

import sys
import json
import re
import os

def convert_meta(input_file):
    with open(input_file, 'r') as f:
        content = f.read()

    # Find the first occurrence of '{' to locate the start of the object
    brace_index = content.find('{')
    if brace_index == -1:
        raise ValueError("Could not find opening brace in the exported object")

    # Extract content from the first '{' onwards and clean trailing semicolon/whitespace
    json_str = content[brace_index:].strip().rstrip(';').strip()

    # Parse the JSON content
    try:
        obj = json.loads(json_str)
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse JSON: {e}")

    # Extract keys in order (assuming Python 3.7+ where dict preserves insertion order)
    keys = list(obj.keys())

    # Create and write JSON output
    output = {"pages": keys}
    with open(input_file, 'w') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    # Rename the file to meta.json
    dir_name = os.path.dirname(input_file)
    new_file = os.path.join(dir_name, 'meta.json')
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
