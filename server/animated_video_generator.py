import os
import time
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from moviepy.editor import ImageSequenceClip
import math
import random

def create_animated_brush_teeth_video(prompt, output_path, duration=3.0, fps=24):
    """Create an animated video of a character brushing teeth"""
    frames = []
    total_frames = int(duration * fps)
    
    for frame_num in range(total_frames):
        # Create canvas
        img = Image.new('RGB', (720, 1280), color=(240, 248, 255))  # Light blue background
        draw = ImageDraw.Draw(img)
        
        # Progress through animation (0 to 1)
        progress = frame_num / total_frames
        
        # Character head and body
        center_x, center_y = 360, 400
        
        # Draw head (circle)
        head_radius = 80
        draw.ellipse([center_x - head_radius, center_y - head_radius, 
                     center_x + head_radius, center_y + head_radius], 
                     fill=(253, 230, 138), outline=(0, 0, 0), width=2)  # Yellow head
        
        # Draw body
        body_width, body_height = 120, 200
        draw.rectangle([center_x - body_width//2, center_y + head_radius,
                       center_x + body_width//2, center_y + head_radius + body_height],
                       fill=(147, 197, 253), outline=(0, 0, 0), width=2)  # Blue shirt
        
        # Animated eyes (blinking occasionally)
        eye_blink = 1 if (frame_num % 60) < 55 else 0.1  # Blink every ~2.5 seconds
        eye_y = center_y - 20
        
        # Left eye
        draw.ellipse([center_x - 30, eye_y - 10, center_x - 10, eye_y + 10 * eye_blink],
                     fill=(17, 24, 39))  # Dark eyes
        
        # Right eye  
        draw.ellipse([center_x + 10, eye_y - 10, center_x + 30, eye_y + 10 * eye_blink],
                     fill=(17, 24, 39))
        
        # Animated mouth (for brushing)
        mouth_width = 40 + math.sin(progress * 8 * math.pi) * 10  # Moving mouth
        mouth_height = 15
        draw.ellipse([center_x - mouth_width//2, center_y + 15,
                     center_x + mouth_width//2, center_y + 15 + mouth_height],
                     fill=(239, 68, 68))  # Red mouth
        
        # Draw teeth (white rectangles inside mouth)
        for i in range(6):
            tooth_x = center_x - 25 + i * 8
            tooth_y = center_y + 20
            draw.rectangle([tooth_x, tooth_y, tooth_x + 6, tooth_y + 8],
                          fill=(255, 255, 255), outline=(200, 200, 200), width=1)
        
        # Animated arm holding toothbrush
        brush_motion = math.sin(progress * 6 * math.pi) * 30  # Brushing motion
        arm_x = center_x + 60 + brush_motion
        arm_y = center_y + 40
        
        # Draw arm
        draw.rectangle([arm_x, arm_y, arm_x + 80, arm_y + 20],
                       fill=(253, 230, 138), outline=(0, 0, 0), width=2)  # Skin color
        
        # Draw toothbrush
        brush_length = 60
        brush_width = 8
        draw.rectangle([arm_x + 60, arm_y - 5, arm_x + 60 + brush_length, arm_y + 25],
                       fill=(59, 130, 246), outline=(0, 0, 0), width=2)  # Blue toothbrush
        
        # Draw bristles (animated)
        bristle_motion = math.sin(progress * 12 * math.pi) * 3
        bristle_x = arm_x + 60 + brush_length
        bristle_y = arm_y + 10 + bristle_motion
        
        # Toothbrush head
        draw.rectangle([bristle_x, bristle_y - 8, bristle_x + 15, bristle_y + 8],
                       fill=(255, 255, 255), outline=(0, 0, 0), width=1)
        
        # Bristle lines
        for i in range(8):
            bristle_line_y = bristle_y - 6 + i * 1.5
            draw.line([bristle_x + 2, bristle_line_y, bristle_x + 13, bristle_line_y],
                     fill=(200, 200, 200), width=1)
        
        # Add foam/bubbles (animated)
        for i in range(5):
            bubble_x = center_x - 20 + i * 8 + brush_motion * 0.5
            bubble_y = center_y + 35 + math.sin(progress * 10 * math.pi + i) * 5
            bubble_size = 3 + math.sin(progress * 8 * math.pi + i * 2) * 2
            
            draw.ellipse([bubble_x - bubble_size, bubble_y - bubble_size,
                         bubble_x + bubble_size, bubble_y + bubble_size],
                         fill=(255, 255, 255, 180), outline=(200, 200, 200), width=1)
        
        # Add some sparkles to show clean teeth
        if frame_num % 15 == 0:  # Every few frames
            sparkle_x = center_x + random.randint(-40, 40)
            sparkle_y = center_y + random.randint(-30, 30)
            # Draw a simple sparkle as a small circle
            draw.ellipse([sparkle_x - 3, sparkle_y - 3, sparkle_x + 3, sparkle_y + 3],
                        fill=(251, 191, 36), outline=(245, 158, 11), width=1)
        
        # Convert to numpy array for moviepy
        frame_array = np.array(img)
        frames.append(frame_array)
    
    # Create video from frames
    clip = ImageSequenceClip(frames, fps=fps)
    clip.write_videofile(output_path, codec="libx264", audio=False, verbose=False, logger=None)
    return output_path

def create_animated_wash_hands_video(prompt, output_path, duration=3.0, fps=24):
    """Create an animated video of a character washing hands"""
    frames = []
    total_frames = int(duration * fps)
    
    for frame_num in range(total_frames):
        img = Image.new('RGB', (720, 1280), color=(240, 249, 255))  # Clean bathroom background
        draw = ImageDraw.Draw(img)
        
        progress = frame_num / total_frames
        
        # Draw sink
        sink_x, sink_y = 200, 500
        sink_width, sink_height = 320, 120
        
        # Sink basin
        draw.ellipse([sink_x, sink_y, sink_x + sink_width, sink_y + sink_height],
                    fill=(255, 255, 255), outline=(156, 163, 175), width=4)
        
        # Faucet
        faucet_x = sink_x + sink_width // 2
        draw.rectangle([faucet_x - 10, sink_y - 80, faucet_x + 10, sink_y],
                      fill=(192, 192, 192), outline=(128, 128, 128), width=2)
        
        # Water stream (animated)
        water_flow = math.sin(progress * 8 * math.pi) * 5
        water_x = faucet_x + water_flow
        draw.line([faucet_x, sink_y - 80, water_x, sink_y + sink_height // 2],
                 fill=(147, 197, 253), width=6)
        
        # Water droplets (animated)
        for i in range(6):
            drop_x = water_x + math.sin(progress * 10 * math.pi + i) * 8
            drop_y = sink_y + sink_height // 2 + i * 15 + math.cos(progress * 12 * math.pi + i) * 5
            drop_size = 2 + math.sin(progress * 15 * math.pi + i) * 1
            
            draw.ellipse([drop_x - drop_size, drop_y - drop_size,
                         drop_x + drop_size, drop_y + drop_size],
                        fill=(59, 130, 246), outline=(37, 99, 235), width=1)
        
        # Character hands (animated washing motion)
        hand_center_x = sink_x + sink_width // 2
        hand_center_y = sink_y + sink_height // 2
        
        # Washing motion
        wash_motion = math.sin(progress * 12 * math.pi) * 20
        rub_motion = math.cos(progress * 16 * math.pi) * 10
        
        # Left hand
        left_hand_x = hand_center_x - 30 + wash_motion
        left_hand_y = hand_center_y + rub_motion
        
        # Right hand
        right_hand_x = hand_center_x + 30 - wash_motion
        right_hand_y = hand_center_y - rub_motion
        
        # Draw hands (animated)
        hand_size = 15
        draw.ellipse([left_hand_x - hand_size, left_hand_y - hand_size,
                     left_hand_x + hand_size, left_hand_y + hand_size],
                    fill=(253, 230, 138), outline=(0, 0, 0), width=2)
        
        draw.ellipse([right_hand_x - hand_size, right_hand_y - hand_size,
                     right_hand_x + hand_size, right_hand_y + hand_size],
                    fill=(253, 230, 138), outline=(0, 0, 0), width=2)
        
        # Soap bubbles (animated)
        for i in range(10):
            bubble_x = hand_center_x + math.sin(progress * 8 * math.pi + i) * 40
            bubble_y = hand_center_y + math.cos(progress * 6 * math.pi + i) * 30
            bubble_size = max(1, 1 + math.sin(progress * 20 * math.pi + i) * 2)
            
            # Ensure bubble stays within image bounds (720x1280)
            bubble_x = max(bubble_size, min(bubble_x, 720 - bubble_size))
            bubble_y = max(bubble_size, min(bubble_y, 1280 - bubble_size))
            
            draw.ellipse([bubble_x - bubble_size, bubble_y - bubble_size,
                         bubble_x + bubble_size, bubble_y + bubble_size],
                        fill=(255, 255, 255), outline=(147, 197, 253), width=1)
        
        # Character head (visible above sink)
        head_x = sink_x + sink_width // 2
        head_y = sink_y - 150
        head_radius = 50
        
        draw.ellipse([head_x - head_radius, head_y - head_radius,
                     head_x + head_radius, head_y + head_radius],
                    fill=(253, 230, 138), outline=(0, 0, 0), width=3)
        
        # Eyes (focused on washing)
        eye_y = head_y - 10
        draw.ellipse([head_x - 20, eye_y - 6, head_x - 8, eye_y + 6],
                    fill=(17, 24, 39))
        draw.ellipse([head_x + 8, eye_y - 6, head_x + 20, eye_y + 6],
                    fill=(17, 24, 39))
        
        # Concentration expression
        draw.line([head_x - 15, head_y + 15, head_x - 5, head_y + 20],
                 fill=(239, 68, 68), width=2)
        draw.line([head_x + 5, head_y + 20, head_x + 15, head_y + 15],
                 fill=(239, 68, 68), width=2)
        
        # Soap dispenser (animated)
        dispenser_x = sink_x + sink_width + 50
        dispenser_y = sink_y - 60
        
        draw.rectangle([dispenser_x - 15, dispenser_y - 30, dispenser_x + 15, dispenser_y],
                      fill=(255, 255, 255), outline=(156, 163, 175), width=2)
        
        # Soap pump animation
        pump_motion = math.sin(progress * 6 * math.pi) * 5
        pump_y = dispenser_y - 15 - pump_motion
        draw.rectangle([dispenser_x - 8, pump_y - 10, dispenser_x + 8, pump_y + 10],
                      fill=(192, 192, 192), outline=(128, 128, 128), width=1)
        
        # Add "Washing Hands!" text
        if progress > 0.3:
            try:
                font = ImageFont.truetype("arial.ttf", 36)
            except:
                font = ImageFont.load_default()
            
            draw.text((360, 200), "Washing Hands! 🧼", fill=(37, 99, 235),
                     font=font, anchor="mm")
        
        frame_array = np.array(img)
        frames.append(frame_array)
    
    clip = ImageSequenceClip(frames, fps=fps)
    clip.write_videofile(output_path, codec="libx264", audio=False, verbose=False, logger=None)
    return output_path

def create_animated_play_video(prompt, output_path, duration=3.0, fps=24):
    """Create an animated video of a character playing"""
    frames = []
    total_frames = int(duration * fps)
    
    for frame_num in range(total_frames):
        img = Image.new('RGB', (720, 1280), color=(254, 243, 199))  # Playful yellow background
        draw = ImageDraw.Draw(img)
        
        progress = frame_num / total_frames
        
        # Animated background elements (toys, etc.)
        # Bouncing ball
        ball_x = 150 + math.sin(progress * 4 * math.pi) * 100
        ball_y = 900 - abs(math.sin(progress * 4 * math.pi)) * 200
        ball_radius = 25 + math.sin(progress * 8 * math.pi) * 5
        
        draw.ellipse([ball_x - ball_radius, ball_y - ball_radius,
                     ball_x + ball_radius, ball_y + ball_radius],
                    fill=(239, 68, 68), outline=(185, 28, 28), width=3)
        
        # Toy blocks (animated)
        for i in range(3):
            block_x = 500 + i * 60 + math.sin(progress * 3 * math.pi + i) * 20
            block_y = 850 - math.cos(progress * 5 * math.pi + i) * 30
            block_size = 40
            
            # Block body
            draw.rectangle([block_x - block_size//2, block_y - block_size//2,
                           block_x + block_size//2, block_y + block_size//2],
                          fill=(34, 197, 94), outline=(22, 163, 74), width=2)
            
            # Block letter/number
            draw.text((block_x, block_y), str(i+1), fill=(255, 255, 255),
                     anchor="mm")
        
        # Character (animated - jumping/running)
        char_x = 360 + math.sin(progress * 6 * math.pi) * 80
        char_y = 500 - abs(math.sin(progress * 6 * math.pi)) * 100
        
        # Head
        head_radius = 70
        draw.ellipse([char_x - head_radius, char_y - head_radius,
                     char_x + head_radius, char_y + head_radius],
                    fill=(253, 230, 138), outline=(0, 0, 0), width=3)
        
        # Animated eyes (excited)
        eye_size = 8 + math.sin(progress * 10 * math.pi) * 2
        eye_y = char_y - 15
        
        draw.ellipse([char_x - 25, eye_y - eye_size, char_x - 10, eye_y + eye_size],
                    fill=(17, 24, 39))
        draw.ellipse([char_x + 10, eye_y - eye_size, char_x + 25, eye_y + eye_size],
                    fill=(17, 24, 39))
        
        # Big smile (animated)
        smile_size = 30 + math.sin(progress * 8 * math.pi) * 5
        draw.arc([char_x - smile_size, char_y + 5, char_x + smile_size, char_y + 25],
                start=0, end=180, fill=(239, 68, 68), width=4)
        
        # Body (animated jumping)
        body_height = 100 + math.sin(progress * 6 * math.pi) * 20
        draw.rectangle([char_x - 40, char_y + head_radius,
                       char_x + 40, char_y + head_radius + body_height],
                      fill=(147, 197, 253), outline=(59, 130, 246), width=3)
        
        # Animated arms (waving/jumping)
        arm_motion = math.sin(progress * 12 * math.pi) * 40
        
        # Left arm (animated waving)
        left_arm_x = char_x - 70 + arm_motion
        left_arm_y = char_y + 40 - abs(math.sin(progress * 6 * math.pi)) * 30
        
        draw.line([char_x - 40, char_y + 60, left_arm_x, left_arm_y],
                 fill=(253, 230, 138), width=10)
        
        # Right arm
        right_arm_x = char_x + 70 - arm_motion
        right_arm_y = char_y + 40 - abs(math.sin(progress * 6 * math.pi)) * 30
        
        draw.line([char_x + 40, char_y + 60, right_arm_x, right_arm_y],
                 fill=(253, 230, 138), width=10)
        
        # Animated legs (running/jumping)
        leg_motion = math.sin(progress * 8 * math.pi) * 30
        
        # Left leg
        left_leg_x = char_x - 25 + leg_motion
        left_leg_y = char_y + head_radius + body_height
        
        draw.line([char_x - 20, char_y + head_radius + body_height, left_leg_x, left_leg_y + 60],
                 fill=(253, 230, 138), width=12)
        
        # Right leg
        right_leg_x = char_x + 25 - leg_motion
        right_leg_y = char_y + head_radius + body_height
        
        draw.line([char_x + 20, char_y + head_radius + body_height, right_leg_x, right_leg_y + 60],
                 fill=(253, 230, 138), width=12)
        
        # Add "Play Time!" text
        if progress > 0.2:
            try:
                font = ImageFont.truetype("arial.ttf", 42)
            except:
                font = ImageFont.load_default()
            
            draw.text((360, 200), "Play Time! 🎈", fill=(239, 68, 68),
                     font=font, anchor="mm")
        
        frame_array = np.array(img)
        frames.append(frame_array)
    
    clip = ImageSequenceClip(frames, fps=fps)
    clip.write_videofile(output_path, codec="libx264", audio=False, verbose=False, logger=None)
    return output_path

def create_animated_read_video(prompt, output_path, duration=3.0, fps=24):
    """Create an animated video of a character reading - REDESIGNED for clarity"""
    frames = []
    total_frames = int(duration * fps)
    
    for frame_num in range(total_frames):
        # Warm, cozy reading background
        img = Image.new('RGB', (720, 1280), color=(255, 250, 240))
        draw = ImageDraw.Draw(img)
        
        progress = frame_num / total_frames
        
        # === LARGE, CLEAR BOOK IN CENTER ===
        book_center_x = 360
        book_center_y = 640
        book_width = 400
        book_height = 280
        
        # Book cover/spine (red for visibility)
        draw.rectangle([book_center_x - book_width//2 - 10, book_center_y - book_height//2,
                       book_center_x - book_width//2, book_center_y + book_height//2],
                      fill=(220, 53, 69), outline=(185, 28, 28), width=3)
        
        # Left page (white)
        draw.rectangle([book_center_x - book_width//2, book_center_y - book_height//2,
                       book_center_x - 10, book_center_y + book_height//2],
                      fill=(255, 255, 255), outline=(100, 100, 100), width=3)
        
        # Right page (white) - animated page turn
        page_turn = math.sin(progress * 3 * math.pi) * 8
        draw.rectangle([book_center_x + 10, book_center_y - book_height//2,
                       book_center_x + book_width//2 + page_turn, book_center_y + book_height//2],
                      fill=(255, 255, 255), outline=(100, 100, 100), width=3)
        
        # === CLEAR TEXT LINES ON PAGES ===
        # Left page text
        for i in range(8):
            line_y = book_center_y - 100 + i * 25
            line_width = 140 - (i % 2) * 20  # Vary line lengths
            draw.rectangle([book_center_x - book_width//2 + 30, line_y,
                          book_center_x - book_width//2 + 30 + line_width, line_y + 3],
                          fill=(50, 50, 50))
        
        # Right page text
        for i in range(8):
            line_y = book_center_y - 100 + i * 25
            line_width = 140 - (i % 2) * 20
            draw.rectangle([book_center_x + 30, line_y,
                          book_center_x + 30 + line_width, line_y + 3],
                          fill=(50, 50, 50))
        
        # === BOOK ICON/EMOJI AT TOP ===
        try:
            icon_font = ImageFont.truetype("arial.ttf", 80)
        except:
            icon_font = ImageFont.load_default()
        draw.text((360, 200), "📖", font=icon_font, anchor="mm")
        
        # === CHARACTER READING ===
        char_x = 360
        char_y = 400
        
        # Head
        head_radius = 60
        draw.ellipse([char_x - head_radius, char_y - head_radius,
                     char_x + head_radius, char_y + head_radius],
                    fill=(253, 230, 138), outline=(0, 0, 0), width=3)
        
        # Eyes looking down at book (animated blinking)
        blink = 1 if (frame_num % 80) < 75 else 0.2
        eye_y = char_y - 15
        draw.ellipse([char_x - 25, eye_y - 8, char_x - 10, eye_y - 8 + 16 * blink],
                    fill=(17, 24, 39))
        draw.ellipse([char_x + 10, eye_y - 8, char_x + 25, eye_y - 8 + 16 * blink],
                    fill=(17, 24, 39))
        
        # Gentle smile
        draw.arc([char_x - 20, char_y + 10, char_x + 20, char_y + 30],
                start=0, end=180, fill=(239, 68, 68), width=3)
        
        # Body
        draw.rectangle([char_x - 45, char_y + head_radius,
                       char_x + 45, char_y + head_radius + 100],
                      fill=(100, 150, 255), outline=(50, 100, 200), width=3)
        
        # Arms holding book sides
        # Left arm
        draw.line([char_x - 45, char_y + 80,
                  book_center_x - book_width//2 - 15, book_center_y],
                 fill=(253, 230, 138), width=12)
        
        # Right arm
        draw.line([char_x + 45, char_y + 80,
                  book_center_x + book_width//2 + 15, book_center_y],
                 fill=(253, 230, 138), width=12)
        
        # === CLEAR LABEL ===
        try:
            text_font = ImageFont.truetype("arial.ttf", 48)
        except:
            text_font = ImageFont.load_default()
        
        draw.text((360, 1100), "Reading a Book 📚", fill=(50, 100, 200),
                 font=text_font, anchor="mm")
        
        frame_array = np.array(img)
        frames.append(frame_array)
    
    clip = ImageSequenceClip(frames, fps=fps)
    clip.write_videofile(output_path, codec="libx264", audio=False, verbose=False, logger=None)
    return output_path


def create_animated_clean_video(prompt, output_path, duration=3.0, fps=24):
    """Create an animated video of a character cleaning"""
    frames = []
    total_frames = int(duration * fps)
    
    for frame_num in range(total_frames):
        img = Image.new('RGB', (720, 1280), color=(240, 253, 244))  # Clean green background
        draw = ImageDraw.Draw(img)
        
        progress = frame_num / total_frames
        
        # Cleaning supplies (animated)
        # Spray bottle
        bottle_x = 500
        bottle_y = 600 + math.sin(progress * 4 * math.pi) * 10
        
        # Bottle body
        draw.rectangle([bottle_x - 20, bottle_y - 60, bottle_x + 20, bottle_y],
                      fill=(255, 255, 255), outline=(156, 163, 175), width=2)
        
        # Spray trigger (animated)
        trigger_motion = math.sin(progress * 8 * math.pi) * 8
        trigger_x = bottle_x + trigger_motion
        trigger_y = bottle_y - 40
        
        draw.rectangle([trigger_x - 8, trigger_y - 15, trigger_x + 8, trigger_y + 5],
                      fill=(192, 192, 192), outline=(128, 128, 128), width=1)
        
        # Spray mist (animated)
        for i in range(5):
            spray_x = trigger_x + 15 + i * 12 + math.sin(progress * 12 * math.pi + i) * 6
            spray_y = trigger_y - 10 + math.cos(progress * 10 * math.pi + i) * 4
            spray_size = max(1, 1 + math.sin(progress * 15 * math.pi + i) * 2)
            
            # Ensure spray stays within image bounds (720x1280)
            spray_x = max(spray_size, min(spray_x, 720 - spray_size))
            spray_y = max(spray_size, min(spray_y, 1280 - spray_size))
            
            draw.ellipse([spray_x - spray_size, spray_y - spray_size,
                         spray_x + spray_size, spray_y + spray_size],
                        fill=(147, 197, 253), outline=(59, 130, 246), width=1)
        
        # Character cleaning
        char_x = 300 + math.sin(progress * 6 * math.pi) * 50
        char_y = 500
        
        # Head (focused on cleaning)
        head_radius = 70
        draw.ellipse([char_x - head_radius, char_y - head_radius,
                     char_x + head_radius, char_y + head_radius],
                    fill=(253, 230, 138), outline=(0, 0, 0), width=3)
        
        # Animated eyes (focused and determined)
        eye_focus = math.sin(progress * 5 * math.pi) * 3
        eye_y = char_y - 15
        
        draw.ellipse([char_x - 25, eye_y - 6, char_x - 10, eye_y + 6],
                    fill=(17, 24, 39))
        draw.ellipse([char_x + 10, eye_y - 6, char_x + 25, eye_y + 6],
                    fill=(17, 24, 39))
        
        # Determined expression
        draw.line([char_x - 15, char_y + 20, char_x - 5, char_y + 25],
                 fill=(239, 68, 68), width=2)
        draw.line([char_x + 5, char_y + 25, char_x + 15, char_y + 20],
                 fill=(239, 68, 68), width=2)
        
        # Body (cleaning posture)
        body_height = 120
        draw.rectangle([char_x - 50, char_y + head_radius,
                       char_x + 50, char_y + head_radius + body_height],
                      fill=(34, 197, 94), outline=(22, 163, 74), width=3)
        
        # Animated arms (cleaning motion)
        clean_motion = math.sin(progress * 10 * math.pi) * 30
        
        # Left arm (holding cloth)
        left_arm_x = char_x - 70 + clean_motion
        left_arm_y = char_y + 60 + math.sin(progress * 8 * math.pi) * 15
        
        draw.line([char_x - 50, char_y + 80, left_arm_x, left_arm_y],
                 fill=(253, 230, 138), width=10)
        
        # Cleaning cloth (animated)
        cloth_x = left_arm_x + 10
        cloth_y = left_arm_y + math.sin(progress * 12 * math.pi) * 8
        cloth_size = 20
        
        draw.ellipse([cloth_x - cloth_size, cloth_y - cloth_size,
                     cloth_x + cloth_size, cloth_y + cloth_size],
                    fill=(254, 243, 199), outline=(251, 191, 36), width=2)
        
        # Right arm (spraying)
        right_arm_x = char_x + 80 - clean_motion * 0.5
        right_arm_y = char_y + 60 + math.cos(progress * 8 * math.pi) * 10
        
        draw.line([char_x + 50, char_y + 80, right_arm_x, right_arm_y],
                 fill=(253, 230, 138), width=10)
        
        # Sparkles/shine effects (animated)
        for i in range(8):
            sparkle_x = 200 + math.sin(progress * 7 * math.pi + i) * 100
            sparkle_y = 700 + math.cos(progress * 9 * math.pi + i) * 50
            sparkle_size = 2 + math.sin(progress * 14 * math.pi + i) * 3
            
            if sparkle_size > 1:
                # Star shape (simplified)
                draw.ellipse([sparkle_x - sparkle_size, sparkle_y - sparkle_size,
                             sparkle_x + sparkle_size, sparkle_y + sparkle_size],
                            fill=(251, 191, 36), outline=(245, 158, 11), width=1)
        
        # Clean surface being worked on
        surface_x = 150
        surface_y = 750
        surface_width, surface_height = 300, 20
        
        # Surface (animated getting cleaner)
        clean_progress = progress * 0.8
        clean_width = surface_width * clean_progress
        
        # Dirty surface
        draw.rectangle([surface_x, surface_y, surface_x + surface_width, surface_y + surface_height],
                      fill=(156, 163, 175), outline=(107, 114, 128), width=2)
        
        # Clean part (animated)
        if clean_width > 0:
            draw.rectangle([surface_x, surface_y, surface_x + clean_width, surface_y + surface_height],
                          fill=(255, 255, 255), outline=(200, 200, 200), width=1)
        
        # Add "Cleaning Up!" text
        if progress > 0.3:
            try:
                font = ImageFont.truetype("arial.ttf", 38)
            except:
                font = ImageFont.load_default()
            
            draw.text((360, 200), "Cleaning Up! 🧽", fill=(34, 197, 94),
                     font=font, anchor="mm")
        
        frame_array = np.array(img)
        frames.append(frame_array)
    
    clip = ImageSequenceClip(frames, fps=fps)
    clip.write_videofile(output_path, codec="libx264", audio=False, verbose=False, logger=None)
    return output_path

def create_animated_wake_up_video(prompt, output_path, duration=3.0, fps=24):
    """Create an animated video of a character waking up"""
    frames = []
    total_frames = int(duration * fps)
    
    for frame_num in range(total_frames):
        img = Image.new('RGB', (720, 1280), color=(255, 248, 220))  # Warm morning background
        draw = ImageDraw.Draw(img)
        
        progress = frame_num / total_frames
        
        # Animated background (sunrise effect)
        sun_y = 1000 - int(progress * 300)  # Sun rising
        sun_x = 360
        
        # Draw sun
        sun_radius = 60
        draw.ellipse([sun_x - sun_radius, sun_y - sun_radius,
                     sun_x + sun_radius, sun_y + sun_radius],
                     fill=(251, 191, 36), outline=(245, 158, 11), width=3)
        
        # Sun rays (animated)
        for i in range(12):
            angle = (i * 30 + progress * 360) * math.pi / 180
            ray_length = 80 + math.sin(progress * 4 * math.pi + i) * 20
            ray_x = sun_x + math.cos(angle) * (sun_radius + 20)
            ray_y = sun_y + math.sin(angle) * (sun_radius + 20)
            ray_end_x = sun_x + math.cos(angle) * (sun_radius + ray_length)
            ray_end_y = sun_y + math.sin(angle) * (sun_radius + ray_length)
            
            draw.line([ray_x, ray_y, ray_end_x, ray_end_y],
                     fill=(251, 191, 36), width=3)
        
        # Character in bed (animated waking up)
        bed_x, bed_y = 200, 600
        bed_width, bed_height = 320, 150
        
        # Draw bed
        draw.rectangle([bed_x, bed_y, bed_x + bed_width, bed_y + bed_height],
                       fill=(147, 197, 253), outline=(59, 130, 246), width=3)
        draw.rectangle([bed_x, bed_y + bed_height - 20, bed_x + bed_width, bed_y + bed_height],
                       fill=(31, 41, 57), outline=(0, 0, 0), width=2)
        
        # Character head (animated - starts lying down, slowly sits up)
        head_x = bed_x + bed_width // 2
        head_start_y = bed_y + 50
        head_end_y = bed_y - 50
        
        # Easing function for smooth wake-up
        ease_progress = 1 - math.cos(progress * math.pi / 2)
        head_y = head_start_y + (head_end_y - head_start_y) * ease_progress
        
        head_radius = 70
        draw.ellipse([head_x - head_radius, head_y - head_radius,
                     head_x + head_radius, head_y + head_radius],
                     fill=(253, 230, 138), outline=(0, 0, 0), width=3)
        
        # Animated eyes (start closed, slowly open)
        eye_open_progress = max(0, (progress - 0.3) / 0.7)  # Eyes open after 30%
        eye_height = 15 * eye_open_progress
        
        draw.ellipse([head_x - 25, head_y - 10 - eye_height/2,
                     head_x - 10, head_y - 10 + eye_height/2],
                     fill=(17, 24, 39))
        
        draw.ellipse([head_x + 10, head_y - 10 - eye_height/2,
                     head_x + 25, head_y - 10 + eye_height/2],
                     fill=(17, 24, 39))
        
        # Animated smile (grows as character wakes up)
        smile_progress = max(0, (progress - 0.5) / 0.5)  # Smile after 50%
        smile_width = 30 * smile_progress
        
        if smile_progress > 0:
            draw.arc([head_x - smile_width, head_y + 5,
                     head_x + smile_width, head_y + 25],
                     start=0, end=180, fill=(239, 68, 68), width=3)
        
        # Blanket (animated - moves down as character sits up)
        blanket_y = bed_y + 20 + (1 - ease_progress) * 60
        blanket_height = bed_height - 40 - (1 - ease_progress) * 60
        
        draw.rectangle([bed_x + 20, blanket_y, bed_x + bed_width - 20, blanket_y + blanket_height],
                       fill=(167, 139, 250), outline=(139, 92, 246), width=2)
        
        # Add blanket pattern
        for i in range(5):
            pattern_y = blanket_y + i * (blanket_height / 5)
            draw.line([bed_x + 25, pattern_y, bed_x + bed_width - 25, pattern_y],
                     fill=(139, 92, 246), width=1)
        
        # Animated stretching arms
        stretch_progress = max(0, (progress - 0.4) / 0.6)  # Arms stretch after 40%
        arm_height = head_y + 30
        
        # Left arm (animated stretching up)
        left_arm_x = head_x - 60 - stretch_progress * 30
        left_arm_y = arm_height - stretch_progress * 40
        arm_length = 60 + stretch_progress * 40
        
        draw.line([head_x - 50, arm_height, left_arm_x, left_arm_y - arm_length],
                 fill=(253, 230, 138), width=8)
        
        # Right arm (animated stretching up)
        right_arm_x = head_x + 60 + stretch_progress * 30
        right_arm_y = arm_height - stretch_progress * 40
        
        draw.line([head_x + 50, arm_height, right_arm_x, right_arm_y - arm_length],
                 fill=(253, 230, 138), width=8)
        
        # Add "Good Morning!" text (fades in)
        text_alpha = max(0, (progress - 0.7) / 0.3)  # Text appears after 70%
        if text_alpha > 0:
            try:
                font = ImageFont.truetype("arial.ttf", 48)
            except:
                font = ImageFont.load_default()
            
            draw.text((360, 200), "Good Morning! 🌞", fill=(255, 140, 0),
                     font=font, anchor="mm")
        
        # Convert to numpy array
        frame_array = np.array(img)
        frames.append(frame_array)
    
    # Create video
    clip = ImageSequenceClip(frames, fps=fps)
    clip.write_videofile(output_path, codec="libx264", audio=False, verbose=False, logger=None)
    return output_path

def create_animated_dress_video(prompt, output_path, duration=3.0, fps=24):
    """Create an animated video of a character getting dressed"""
    frames = []
    total_frames = int(duration * fps)
    
    for frame_num in range(total_frames):
        img = Image.new('RGB', (720, 1280), color=(248, 250, 252))  # Light gray background
        draw = ImageDraw.Draw(img)
        
        progress = frame_num / total_frames
        
        # Character center
        center_x, center_y = 360, 450
        
        # Draw head
        head_radius = 80
        draw.ellipse([center_x - head_radius, center_y - head_radius,
                     center_x + head_radius, center_y + head_radius],
                     fill=(253, 230, 138), outline=(0, 0, 0), width=3)
        
        # Animated eyes (focused on dressing)
        eye_y = center_y - 20
        focus_offset = math.sin(progress * 4 * math.pi) * 5
        
        draw.ellipse([center_x - 30, eye_y - 8, center_x - 10, eye_y + 8],
                     fill=(17, 24, 39))
        draw.ellipse([center_x + 10, eye_y - 8, center_x + 30, eye_y + 8],
                     fill=(17, 24, 39))
        
        # Animated mouth (concentration expression)
        mouth_width = 25 + math.sin(progress * 6 * math.pi) * 3
        draw.ellipse([center_x - mouth_width//2, center_y + 15,
                     center_x + mouth_width//2, center_y + 25],
                     fill=(239, 68, 68), outline=(185, 28, 28), width=2)
        
        # Body (animated - shirt being put on)
        body_width, body_height = 120, 180
        body_visibility = min(1.0, progress * 1.5)  # Shirt appears gradually
        
        if body_visibility > 0:
            # Shirt color with animation
            shirt_color = (34, 197, 94) if int(progress * 8) % 2 == 0 else (59, 130, 246)
            draw.rectangle([center_x - body_width//2, center_y + head_radius,
                           center_x + body_width//2, center_y + head_radius + int(body_height * body_visibility)],
                          fill=shirt_color, outline=(0, 0, 0), width=3)
            
            # Shirt buttons (animated)
            if body_visibility > 0.5:
                for i in range(4):
                    button_y = center_y + head_radius + 30 + i * 30
                    if button_y < center_y + head_radius + int(body_height * body_visibility):
                        draw.ellipse([center_x - 5, button_y - 5, center_x + 5, button_y + 5],
                                   fill=(255, 255, 255), outline=(0, 0, 0), width=1)
        
        # Animated arms (putting on shirt)
        arm_motion = math.sin(progress * 3 * math.pi) * 40
        
        # Left arm
        left_arm_x = center_x - 80 - arm_motion
        left_arm_y = center_y + 100 + math.sin(progress * 4 * math.pi) * 20
        
        draw.line([center_x - 60, center_y + 120, left_arm_x, left_arm_y],
                 fill=(253, 230, 138), width=12)
        
        # Right arm
        right_arm_x = center_x + 80 + arm_motion
        right_arm_y = center_y + 100 + math.cos(progress * 4 * math.pi) * 20
        
        draw.line([center_x + 60, center_y + 120, right_arm_x, right_arm_y],
                 fill=(253, 230, 138), width=12)
        
        # Shirt sleeves (animated)
        if body_visibility > 0.3:
            sleeve_length = 40 + math.sin(progress * 4 * math.pi) * 20
            
            # Left sleeve
            draw.line([center_x - 60, center_y + 120, center_x - 60 - sleeve_length, center_y + 140],
                     fill=shirt_color, width=15)
            
            # Right sleeve
            draw.line([center_x + 60, center_y + 120, center_x + 60 + sleeve_length, center_y + 140],
                     fill=shirt_color, width=15)
        
        # Pants (animated)
        pants_visibility = max(0, (progress - 0.3) * 1.5)
        if pants_visibility > 0:
            pants_height = 100 * pants_visibility
            draw.rectangle([center_x - 50, center_y + head_radius + body_height,
                           center_x + 50, center_y + head_radius + body_height + pants_height],
                          fill=(59, 130, 246), outline=(29, 78, 216), width=3)
            
            # Pants legs
            if pants_visibility > 0.5:
                leg_length = 60 * (pants_visibility - 0.5) * 2
                draw.rectangle([center_x - 45, center_y + head_radius + body_height + pants_height - 20,
                               center_x - 15, center_y + head_radius + body_height + pants_height + leg_length],
                              fill=(59, 130, 246), outline=(29, 78, 216), width=2)
                
                draw.rectangle([center_x + 15, center_y + head_radius + body_height + pants_height - 20,
                               center_x + 45, center_y + head_radius + body_height + pants_height + leg_length],
                              fill=(59, 130, 246), outline=(29, 78, 216), width=2)
        
        # Add "Getting Dressed!" text
        if progress > 0.6:
            try:
                font = ImageFont.truetype("arial.ttf", 42)
            except:
                font = ImageFont.load_default()
            
            draw.text((360, 200), "Getting Dressed! 👕", fill=(34, 197, 94),
                     font=font, anchor="mm")
        
        frame_array = np.array(img)
        frames.append(frame_array)
    
    clip = ImageSequenceClip(frames, fps=fps)
    clip.write_videofile(output_path, codec="libx264", audio=False, verbose=False, logger=None)
    return output_path

def create_animated_bath_video(prompt, output_path, duration=3.0, fps=24):
    """Create an animated video of a character taking a bath"""
    frames = []
    total_frames = int(duration * fps)
    
    for frame_num in range(total_frames):
        img = Image.new('RGB', (720, 1280), color=(219, 234, 254))  # Light blue bathroom
        draw = ImageDraw.Draw(img)
        
        progress = frame_num / total_frames
        
        # Draw bathtub
        tub_x, tub_y = 150, 600
        tub_width, tub_height = 420, 200
        
        # Bathtub outline
        draw.rectangle([tub_x, tub_y, tub_x + tub_width, tub_y + tub_height],
                      fill=(255, 255, 255), outline=(156, 163, 175), width=4)
        
        # Water in tub (animated)
        water_level = tub_height - 40 - math.sin(progress * 4 * math.pi) * 10
        water_level = max(20, min(water_level, tub_height - 20))  # Ensure valid water level
        draw.rectangle([tub_x + 10, tub_y + water_level, tub_x + tub_width - 10, tub_y + tub_height - 10],
                      fill=(59, 130, 246), outline=(37, 99, 235), width=2)
        
        # Water ripples (animated)
        for i in range(5):
            ripple_x = tub_x + 50 + i * 70 + math.sin(progress * 6 * math.pi + i) * 15
            ripple_y = tub_y + water_level + math.cos(progress * 8 * math.pi + i) * 5
            ripple_size = 3 + math.sin(progress * 10 * math.pi + i) * 2
            
            draw.ellipse([ripple_x - ripple_size, ripple_y - ripple_size,
                         ripple_x + ripple_size, ripple_y + ripple_size],
                        fill=(147, 197, 253), outline=(59, 130, 246), width=1)
        
        # Character in bath (head and shoulders)
        char_x = tub_x + tub_width // 2
        char_head_y = tub_y + max(water_level - 30, 10)  # Ensure head is above water
        
        # Head
        head_radius = 60
        draw.ellipse([char_x - head_radius, char_head_y - head_radius,
                     char_x + head_radius, char_head_y + head_radius],
                    fill=(253, 230, 138), outline=(0, 0, 0), width=3)
        
        # Animated eyes (relaxed/closed)
        eye_relax = math.sin(progress * 2 * math.pi) * 0.5 + 0.5
        eye_height = max(2, int(12 * eye_relax))  # Ensure minimum height
        eye_y = char_head_y - 15
        
        # Ensure eye coordinates are valid
        left_eye_top = max(0, eye_y - eye_height//2)
        left_eye_bottom = max(left_eye_top + 1, eye_y + eye_height//2)
        right_eye_top = max(0, eye_y - eye_height//2)
        right_eye_bottom = max(right_eye_top + 1, eye_y + eye_height//2)
        
        draw.ellipse([char_x - 20, left_eye_top, char_x - 5, left_eye_bottom],
                    fill=(17, 24, 39))
        draw.ellipse([char_x + 5, right_eye_top, char_x + 20, right_eye_bottom],
                    fill=(17, 24, 39))
        
        # Relaxed smile
        smile_size = 20 + math.sin(progress * 3 * math.pi) * 5
        draw.arc([char_x - smile_size, char_head_y + 5, char_x + smile_size, char_head_y + 20],
                start=0, end=180, fill=(239, 68, 68), width=3)
        
        # Animated arms (washing motion)
        wash_motion = math.sin(progress * 8 * math.pi) * 30
        
        # Left arm (partially visible above water)
        left_arm_x = max(tub_x + 10, char_x - 80 + wash_motion)  # Keep within tub bounds
        left_arm_y = char_head_y + 40 + math.sin(progress * 6 * math.pi) * 10
        
        draw.line([char_x - 50, char_head_y + 30, left_arm_x, left_arm_y],
                 fill=(253, 230, 138), width=10)
        
        # Right arm
        right_arm_x = min(tub_x + tub_width - 10, char_x + 80 - wash_motion)  # Keep within tub bounds
        right_arm_y = char_head_y + 40 + math.cos(progress * 6 * math.pi) * 10
        
        draw.line([char_x + 50, char_head_y + 30, right_arm_x, right_arm_y],
                 fill=(253, 230, 138), width=10)
        
        # Soap bubbles (animated)
        for i in range(8):
            bubble_x = tub_x + 30 + i * 50 + math.sin(progress * 5 * math.pi + i) * 20
            bubble_y = tub_y + water_level - 20 + math.cos(progress * 7 * math.pi + i) * 15
            bubble_size = max(1, 2 + math.sin(progress * 12 * math.pi + i) * 3)  # Ensure minimum size
            
            # Ensure bubble is within valid bounds
            if (bubble_y > tub_y and bubble_y < tub_y + water_level and 
                bubble_x > tub_x and bubble_x < tub_x + tub_width and
                bubble_size > 0):
                draw.ellipse([bubble_x - bubble_size, bubble_y - bubble_size,
                             bubble_x + bubble_size, bubble_y + bubble_size],
                            fill=(255, 255, 255), outline=(147, 197, 253), width=1)
        
        # Washcloth/towel (animated)
        cloth_x = tub_x + tub_width + 30
        cloth_y = tub_y + 50 + math.sin(progress * 4 * math.pi) * 10
        cloth_width, cloth_height = 40, 60
        
        draw.rectangle([cloth_x, cloth_y, cloth_x + cloth_width, cloth_y + cloth_height],
                      fill=(254, 243, 199), outline=(251, 191, 36), width=2)
        
        # Add "Bath Time!" text
        if progress > 0.4:
            try:
                font = ImageFont.truetype("arial.ttf", 40)
            except:
                font = ImageFont.load_default()
            
            draw.text((360, 200), "Bath Time! 🛁", fill=(37, 99, 235),
                     font=font, anchor="mm")
        
        frame_array = np.array(img)
        frames.append(frame_array)
    
    clip = ImageSequenceClip(frames, fps=fps)
    clip.write_videofile(output_path, codec="libx264", audio=False, verbose=False, logger=None)
    return output_path

def create_animated_eat_breakfast_video(prompt, output_path, duration=3.0, fps=24):
    """Create an animated video of a character eating breakfast"""
    frames = []
    total_frames = int(duration * fps)
    
    for frame_num in range(total_frames):
        img = Image.new('RGB', (720, 1280), color=(255, 253, 208))  # Warm breakfast background
        draw = ImageDraw.Draw(img)
        
        progress = frame_num / total_frames
        
        # Draw table/breakfast scene
        table_y = 800
        table_height = 100
        draw.rectangle([0, table_y, 720, table_y + table_height],
                       fill=(139, 69, 19), outline=(101, 67, 33), width=3)
        
        # Draw plate
        plate_center_x, plate_center_y = 360, 700
        plate_radius = 80
        draw.ellipse([plate_center_x - plate_radius, plate_center_y - plate_radius,
                     plate_center_x + plate_radius, plate_center_y + plate_radius],
                     fill=(255, 255, 255), outline=(200, 200, 200), width=4)
        
        # Draw food on plate (animated - gets smaller as eating progresses)
        food_radius = 50 * (1 - progress * 0.8)  # Food disappears as eating progresses
        if food_radius > 5:
            draw.ellipse([plate_center_x - food_radius, plate_center_y - food_radius,
                         plate_center_x + food_radius, plate_center_y + food_radius],
                         fill=(251, 191, 36), outline=(245, 158, 11), width=2)
            
            # Food details (pancake stack)
            for i in range(3):
                pancake_y = plate_center_y - 10 + i * 8
                pancake_radius = food_radius - 10 - i * 5
                if pancake_radius > 0:
                    draw.ellipse([plate_center_x - pancake_radius, pancake_y - pancake_radius,
                                 plate_center_x + pancake_radius, pancake_y + pancake_radius],
                                 fill=(255, 228, 181), outline=(222, 184, 135), width=1)
        
        # Draw character
        char_center_x, char_center_y = 360, 450
        
        # Draw head
        head_radius = 80
        draw.ellipse([char_center_x - head_radius, char_center_y - head_radius,
                     char_center_x + head_radius, char_center_y + head_radius],
                     fill=(253, 230, 138), outline=(0, 0, 0), width=3)
        
        # Animated eyes (looking at food)
        eye_direction = progress * 10  # Eyes move toward food
        eye_y = char_center_y - 20
        
        # Left eye
        draw.ellipse([char_center_x - 30 + eye_direction, eye_y - 8,
                     char_center_x - 10 + eye_direction, eye_y + 8],
                     fill=(17, 24, 39))
        
        # Right eye
        draw.ellipse([char_center_x + 10 + eye_direction, eye_y - 8,
                     char_center_x + 30 + eye_direction, eye_y + 8],
                     fill=(17, 24, 39))
        
        # Animated mouth (chewing motion)
        chew_size = 12 + math.sin(progress * 8 * math.pi) * 6  # Chewing animation
        mouth_y = char_center_y + 15
        
        draw.ellipse([char_center_x - chew_size//2, mouth_y - chew_size//2,
                     char_center_x + chew_size//2, mouth_y + chew_size//2],
                     fill=(239, 68, 68), outline=(185, 28, 28), width=2)
        
        # Draw body
        body_width, body_height = 100, 150
        draw.rectangle([char_center_x - body_width//2, char_center_y + head_radius,
                       char_center_x + body_width//2, char_center_y + head_radius + body_height],
                       fill=(59, 130, 246), outline=(29, 78, 216), width=3)
        
        # Animated arm reaching for food
        arm_motion = math.sin(progress * 6 * math.pi) * 20  # Arm movement
        arm_x = char_center_x + 70 + arm_motion
        arm_y = char_center_y + 60
        
        # Draw arm
        draw.rectangle([arm_x, arm_y, arm_x + 80, arm_y + 25],
                       fill=(253, 230, 138), outline=(0, 0, 0), width=2)
        
        # Draw fork/spoon (animated)
        utensil_x = arm_x + 70
        utensil_y = arm_y + 12
        utensil_length = 50
        
        draw.rectangle([utensil_x, utensil_y - 3, utensil_x + utensil_length, utensil_y + 3],
                       fill=(192, 192, 192), outline=(128, 128, 128), width=1)
        
        # Fork head (animated slightly)
        fork_y = utensil_y + math.sin(progress * 4 * math.pi) * 2
        draw.ellipse([utensil_x + utensil_length - 10, fork_y - 8,
                     utensil_x + utensil_length + 5, fork_y + 8],
                     fill=(192, 192, 192), outline=(128, 128, 128), width=2)
        
        # Add eating enjoyment indicators
        if progress > 0.3:  # Show enjoyment after some eating
            # Happy cheeks
            cheek_radius = 5
            draw.ellipse([char_center_x - 60, char_center_y - 10,
                         char_center_x - 50, char_center_y],
                         fill=(255, 182, 193), outline=(255, 105, 180), width=1)
            
            draw.ellipse([char_center_x + 50, char_center_y - 10,
                         char_center_x + 60, char_center_y],
                         fill=(255, 182, 193), outline=(255, 105, 180), width=1)
        
        # Add "Yum!" text
        if progress > 0.5:
            try:
                font = ImageFont.truetype("arial.ttf", 36)
            except:
                font = ImageFont.load_default()
            
            yum_alpha = min(255, int((progress - 0.5) * 2 * 255))
            draw.text((char_center_x, char_center_y - 120), "Yum! 😋",
                     fill=(255, 140, 0), font=font, anchor="mm")
        
        # Convert to numpy array
        frame_array = np.array(img)
        frames.append(frame_array)
    
    # Create video
    clip = ImageSequenceClip(frames, fps=fps)
    clip.write_videofile(output_path, codec="libx264", audio=False, verbose=False, logger=None)
    return output_path

# Map of animation functions
ANIMATION_FUNCTIONS = {
    'brush_teeth': create_animated_brush_teeth_video,
    'wake_up': create_animated_wake_up_video,
    'eat_breakfast': create_animated_eat_breakfast_video,
    'dress': create_animated_dress_video,
    'bath': create_animated_bath_video,
    'wash_hands': create_animated_wash_hands_video,
    'play': create_animated_play_video,
    'read': create_animated_read_video,
    'clean': create_animated_clean_video,
}

def create_animated_video(prompt, output_path, duration=3.0, fps=24):
    """Create an animated video based on the prompt"""
    prompt_lower = prompt.lower()
    
    # Determine which animation to create based on prompt
    if any(word in prompt_lower for word in ['brush', 'tooth', 'teeth', 'toothbrush']):
        return ANIMATION_FUNCTIONS['brush_teeth'](prompt, output_path, duration, fps)
    elif any(word in prompt_lower for word in ['wake', 'morning', 'get up', 'rise']):
        return ANIMATION_FUNCTIONS['wake_up'](prompt, output_path, duration, fps)
    elif any(word in prompt_lower for word in ['eat', 'food', 'breakfast', 'meal', 'break', 'lunch', 'dinner']):
        return ANIMATION_FUNCTIONS['eat_breakfast'](prompt, output_path, duration, fps)
    elif any(word in prompt_lower for word in ['dress', 'cloth', 'wear', 'put on', 'shirt', 'pants', 'shoes', 'socks']):
        return ANIMATION_FUNCTIONS['dress'](prompt, output_path, duration, fps)
    elif any(word in prompt_lower for word in ['bath', 'shower', 'tub']):
        return ANIMATION_FUNCTIONS['bath'](prompt, output_path, duration, fps)
    elif any(word in prompt_lower for word in ['wash hand', 'hand wash', 'soap', 'clean hand']):
        return ANIMATION_FUNCTIONS['wash_hands'](prompt, output_path, duration, fps)
    elif any(word in prompt_lower for word in ['play', 'game', 'toy', 'fun', 'run', 'jump', 'dance']):
        return ANIMATION_FUNCTIONS['play'](prompt, output_path, duration, fps)
    elif any(word in prompt_lower for word in ['read', 'book', 'story', 'page']):
        return ANIMATION_FUNCTIONS['read'](prompt, output_path, duration, fps)
    elif any(word in prompt_lower for word in ['clean', 'tidy', 'organize', 'pick up', 'put away']):
        return ANIMATION_FUNCTIONS['clean'](prompt, output_path, duration, fps)
    else:
        # Default animation - bouncing character
        return create_default_animated_video(prompt, output_path, duration, fps)

def create_default_animated_video(prompt, output_path, duration=3.0, fps=24):
    """Create a default animated video with bouncing character"""
    frames = []
    total_frames = int(duration * fps)
    
    for frame_num in range(total_frames):
        img = Image.new('RGB', (720, 1280), color=(240, 248, 255))
        draw = ImageDraw.Draw(img)
        
        progress = frame_num / total_frames
        
        # Bouncing character
        center_x, center_y = 360, 400
        bounce_height = abs(math.sin(progress * 4 * math.pi)) * 100
        char_y = center_y - bounce_height
        
        # Draw character
        head_radius = 60
        draw.ellipse([center_x - head_radius, char_y - head_radius,
                     center_x + head_radius, char_y + head_radius],
                     fill=(253, 230, 138), outline=(0, 0, 0), width=3)
        
        # Eyes
        draw.ellipse([center_x - 20, char_y - 15, center_x - 5, char_y - 5],
                     fill=(17, 24, 39))
        draw.ellipse([center_x + 5, char_y - 15, center_x + 20, char_y - 5],
                     fill=(17, 24, 39))
        
        # Smile
        smile_size = 20 + math.sin(progress * 4 * math.pi) * 5
        draw.arc([center_x - smile_size, char_y + 5, center_x + smile_size, char_y + 20],
                 start=0, end=180, fill=(239, 68, 68), width=3)
        
        # Body
        body_height = 80 + math.sin(progress * 4 * math.pi) * 10
        draw.rectangle([center_x - 40, char_y + head_radius,
                       center_x + 40, char_y + head_radius + body_height],
                       fill=(147, 197, 253), outline=(59, 130, 246), width=3)
        
        # Arms (animated waving)
        arm_angle = progress * 2 * math.pi
        left_arm_x = center_x - 60 + math.sin(arm_angle) * 10
        left_arm_y = char_y + 40 + math.cos(arm_angle) * 10
        
        draw.line([center_x - 40, char_y + 60, left_arm_x, left_arm_y],
                 fill=(253, 230, 138), width=8)
        
        right_arm_x = center_x + 60 + math.sin(arm_angle + math.pi) * 10
        right_arm_y = char_y + 40 + math.cos(arm_angle + math.pi) * 10
        
        draw.line([center_x + 40, char_y + 60, right_arm_x, right_arm_y],
                 fill=(253, 230, 138), width=8)
        
        # Display prompt
        try:
            font = ImageFont.truetype("arial.ttf", 32)
        except:
            font = ImageFont.load_default()
        
        draw.text((center_x, 700), prompt, fill=(30, 30, 30), font=font, anchor="mm")
        
        frame_array = np.array(img)
        frames.append(frame_array)
    
    clip = ImageSequenceClip(frames, fps=fps)
    clip.write_videofile(output_path, codec="libx264", audio=False, verbose=False, logger=None)
    return output_path