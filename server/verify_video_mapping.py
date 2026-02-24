import asyncio
import os
import sys

# Add the current directory to sys.path so we can import modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from huggingface_client import generate_animation

async def verify():
    prompts = {
        "Brush your teeth": "brushing your teeth.mp4",
        "Read a book": "reading a book.mp4",
        "Wake up in the morning": "waking up.mp4",
        "Change clothes": "changing clothes.mp4",
        "Eat breakfast": "Eating breakfast.mp4",
        "Put on pajamas": "night clothes.mp4",
        "Wash your hands": "test_wash_hands.mp4" # Verify original mapping still works
    }

    print("Verifying video mappings...")
    for prompt, expected_filename in prompts.items():
        try:
            result_path = await generate_animation(prompt, out_dir="videos_test")
            actual_filename = os.path.basename(result_path)
            
            # The result filename might have a timestamp prefix/suffix, so we check if the expected content was copied
            # Actually, the logic in huggingface_client.py copies the source file to a new name
            # So we should check if the file exists and maybe check its size to compare with the source?
            # Or just rely on the logs printed by the function if we enabled logging.
            # But the function returns a new path.
            
            # Let's check if the file size matches the source file in the server dir
            source_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), expected_filename)
            if os.path.exists(source_path):
                source_size = os.path.getsize(source_path)
                if os.path.exists(result_path):
                    result_size = os.path.getsize(result_path)
                    if source_size == result_size:
                        print(f"[PASS] Prompt: '{prompt}' -> {actual_filename} (Size matched {expected_filename})")
                    else:
                        print(f"[FAIL] Prompt: '{prompt}' -> {actual_filename} (Size MISMATCH: Expected {source_size}, Got {result_size})")
                else:
                    print(f"[FAIL] Prompt: '{prompt}' -> Result file not found: {result_path}")
            else:
                print(f"[WARN] Source file not found: {source_path}")

        except Exception as e:
            print(f"[ERROR] Prompt: '{prompt}' failed: {e}")

if __name__ == "__main__":
    asyncio.run(verify())
