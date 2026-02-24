import asyncio
import os
from huggingface_client import generate_animation

async def main():
    prompt = "Eat breakfast"
    print(f"Testing generation for prompt: '{prompt}'")
    
    try:
        path = await generate_animation(prompt)
        print(f"Result path: {path}")
        
        if os.path.exists(path):
            print(f"✅ File exists at: {path}")
            print(f"File size: {os.path.getsize(path)} bytes")
        else:
            print(f"❌ File NOT found at: {path}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
