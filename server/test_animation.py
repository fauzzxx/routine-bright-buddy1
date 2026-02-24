import asyncio
import os
import sys

# Add the current directory to the path so we can import our modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from huggingface_client import generate_animation

async def test_animations():
    """Test various routine task animations"""
    
    test_prompts = [
        "Brush your teeth",
        "Eat breakfast", 
        "Get dressed",
        "Take a bath",
        "Wash your hands",
        "Play with toys",
        "Read a book",
        "Clean up toys",
        "Go to sleep"
    ]
    
    print("Testing animation generation for routine tasks...")
    print("=" * 50)
    
    for prompt in test_prompts:
        print(f"\n🎬 Testing: {prompt}")
        try:
            # Test animation generation
            result = await generate_animation(prompt)
            if result and os.path.exists(result):
                file_size = os.path.getsize(result)
                print(f"   ✅ Success! Generated: {result}")
                print(f"   📁 File size: {file_size:,} bytes")
            else:
                print(f"   ❌ Failed: No file generated")
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
    
    print("\n" + "=" * 50)
    print("Animation test complete!")

if __name__ == "__main__":
    asyncio.run(test_animations())