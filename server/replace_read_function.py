import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Read the original file
file_dir = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(file_dir, 'animated_video_generator.py'), 'r', encoding='utf-8') as f:
    content = f.read()

# Read the new function
with open(os.path.join(file_dir, 'new_read_animation.py'), 'r', encoding='utf-8') as f:
    new_function = f.read()

# Find and replace the old function
start_marker = "def create_animated_read_video(prompt, output_path, duration=3.0, fps=24):"
end_marker = "def create_animated_clean_video(prompt, output_path, duration=3.0, fps=24):"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    # Replace the function
    new_content = content[:start_idx] + new_function + "\n\n" + content[end_idx:]
    
    # Write back
    with open(os.path.join(file_dir, 'animated_video_generator.py'), 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print("[SUCCESS] Successfully replaced the reading animation function!")
    print("[INFO] The new animation will show:")
    print("   - Large, clear book in the center")
    print("   - Visible text lines on pages")
    print("   - Character clearly holding and reading the book")
    print("   - Book emoji at top for instant recognition")
else:
    print("[ERROR] Could not find the function markers")
    print(f"Start found: {start_idx != -1}, End found: {end_idx != -1}")
