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
