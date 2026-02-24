import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from animated_video_generator import create_animated_read_video

output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "test_read.mp4")
print(f"Regenerating {output_path} with the NEW, CLEAR reading animation...")
print("This will show a large book in the center with visible text lines.")
create_animated_read_video("Read a book", output_path)
print("Done! The animation now clearly shows someone reading a book.")
