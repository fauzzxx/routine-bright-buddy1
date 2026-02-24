#!/usr/bin/env python3
"""Simple test script for animation functions without external dependencies."""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from animated_video_generator import (
    create_animated_brush_teeth_video,
    create_animated_wake_up_video,
    create_animated_eat_breakfast_video,
    create_animated_dress_video,
    create_animated_bath_video,
    create_animated_wash_hands_video,
    create_animated_play_video,
    create_animated_read_video,
    create_animated_clean_video
)

def test_animations():
    """Test all animation functions."""
    animations = [
        ('brush_teeth', create_animated_brush_teeth_video, 'Animated character brushing teeth'),
        ('wake_up', create_animated_wake_up_video, 'Animated character waking up'),
        ('eat_breakfast', create_animated_eat_breakfast_video, 'Animated character eating breakfast'),
        ('dress', create_animated_dress_video, 'Animated character getting dressed'),
        ('bath', create_animated_bath_video, 'Animated character taking a bath'),
        ('wash_hands', create_animated_wash_hands_video, 'Animated character washing hands'),
        ('play', create_animated_play_video, 'Animated character playing'),
        ('read', create_animated_read_video, 'Animated character reading'),
        ('clean', create_animated_clean_video, 'Animated character cleaning'),
    ]
    
    print("Testing animation functions...")
    
    for name, func, description in animations:
        try:
            output_file = f"test_{name}.mp4"
            print(f"\nTesting {name}: {description}")
            
            # Create the animation
            result = func(description, output_file, duration=2.0, fps=12)  # Shorter duration for testing
            
            if result and os.path.exists(output_file):
                file_size = os.path.getsize(output_file)
                print(f"✓ {name} animation generated: {output_file} (size: {file_size} bytes)")
                
                # Check if file has reasonable size for a video
                if file_size > 1000:  # At least 1KB
                    print(f"  ✓ File appears to contain video content")
                else:
                    print(f"  ⚠ File may be too small for a proper video")
            else:
                print(f"✗ {name} animation failed to generate")
                
        except Exception as e:
            print(f"✗ {name} animation failed with error: {str(e)}")
            import traceback
            traceback.print_exc()
    
    print("\nAnimation testing complete!")

if __name__ == "__main__":
    test_animations()