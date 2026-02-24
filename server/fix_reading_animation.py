import os

# Read the file
file_path = os.path.join(os.path.dirname(__file__), 'animated_video_generator.py')
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Comment out lines 481-485 (0-indexed: 480-484)
# Line 481: if glow_intensity > 0.6:
# Lines 482-485: the ellipse drawing code
if 'if glow_intensity > 0.6:' in lines[480]:
    print("Found the problematic code at line 481")
    lines[480] = '        # DISABLED: Light effect obscures the book\n'
    lines[481] = '        # if glow_intensity > 0.6:\n'
    lines[482] = '        #     light_radius = 60 + math.sin(progress * 5 * math.pi) * 10\n'
    lines[483] = '        #     draw.ellipse([book_x - light_radius, book_y - light_radius,\n'
    lines[484] = '        #                  book_x + light_radius, book_y + light_radius],\n'
    lines[485] = '        #                 fill=(251, 191, 36), outline=None, width=0)\n'
    
    # Write back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Successfully commented out the light effect code!")
else:
    print(f"Warning: Expected code not found at line 481. Found: {lines[480].strip()}")
