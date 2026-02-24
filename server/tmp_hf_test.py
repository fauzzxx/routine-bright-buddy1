import os
import sys
from huggingface_hub import InferenceClient

def main():
    provider = os.getenv('HF_PROVIDER','replicate')
    model = os.getenv('HF_MODEL','Wan-AI/Wan2.2-TI2V-5B')
    token = os.getenv('HF_TOKEN')
    print('Provider:', provider)
    print('Model:', model)
    print('Token set:', bool(token))
    try:
        client = InferenceClient(provider=provider, token=token, timeout=120)
        print('Calling text_to_video...')
        out = client.text_to_video('Put on pajamas. Change into comfy PJs', model=model)
        if isinstance(out, bytes):
            print('Received bytes length:', len(out))
        elif isinstance(out, dict):
            print('Received dict keys:', list(out.keys()))
            v = out.get('video', b'')
            print('Video bytes length:', len(v))
        else:
            print('Received type:', type(out))
    except Exception as e:
        print('ERROR:', type(e).__name__, str(e))
        return 1
    return 0

if __name__ == '__main__':
    raise SystemExit(main())