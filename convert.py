#!/usr/bin/python3

import sys
import re

def process_mdx(filename):
    with open(filename, 'r') as f:
        lines = f.readlines()

    # Remove component imports
    filtered_lines = []
    for line in lines:
        stripped = line.strip()
        if stripped.startswith('import'):
            # Check for nextra/components or TipWarning from /components/Tip
            if "'nextra/components'" in line or \
               re.match(r'import\s*{.*TipWarning.*}\s*from\s*[\'"]/components/Tip[\'"]', stripped):
                continue
        filtered_lines.append(line)

    # Replace first top-level heading with front matter
    found_heading = False
    new_lines = []
    for line in filtered_lines:
        if not found_heading:
            match = re.match(r'^#\s+(.*)$', line)
            if match:
                title = match.group(1).strip()
                new_lines.extend(['---\n', f'title: {title}\n', '---\n'])
                found_heading = True
                continue
        new_lines.append(line)

    content = ''.join(new_lines)
    
    # Convert TipWarning components to Callout
    content = re.sub(r'<TipWarning\b[^>]*>', '<Callout type="warning">', content)
    content = re.sub(r'</TipWarning>', '</Callout>', content)
    
    # Write modified content back to file
    with open(filename, 'w') as f:
        f.write(content)

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: python mdx_modifier.py <filename.mdx>")
        sys.exit(1)
    process_mdx(sys.argv[1])
