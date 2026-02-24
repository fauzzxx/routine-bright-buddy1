// Client-side AI-style video generator
// Renders routine flashcards into a canvas and records a short WebM video using MediaRecorder
// Returns an object with a blob URL (if supported) or a fallback external URL

export interface VideoFrameSpec {
  title: string;
  description: string;
  icon?: string;
}

function detectAnimation(title: string): 'brush_teeth' | 'sleep' | 'eat' | 'dress' | 'bath' | 'wash_hands' | 'play' | 'read' | 'clean' | null {
  const t = title.toLowerCase();
  if (/(brush|tooth|teeth|toothbrush|dental)/.test(t)) return 'brush_teeth';
  if (/(sleep|bed|bedtime|nap|go to bed|rest)/.test(t)) return 'sleep';
  if (/(eat|food|meal|breakfast|lunch|dinner|snack|bite|chew)/.test(t)) return 'eat';
  if (/(dress|cloth|wear|put on|shirt|pants|shoes|socks|jacket)/.test(t)) return 'dress';
  if (/(bath|shower|wash|clean|scrub|soap)/.test(t) && !/(hand|face)/.test(t)) return 'bath';
  if (/(wash.*hand|hand.*wash|soap.*hand|hand.*soap)/.test(t)) return 'wash_hands';
  if (/(play|game|toy|fun|run|jump|dance|sing)/.test(t)) return 'play';
  if (/(read|book|story|page|letter)/.test(t)) return 'read';
  if (/(clean|tidy|organize|pick up|put away|toy.*away)/.test(t)) return 'clean';
  return null;
}

function drawAnimatedBrushTeeth(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number
) {
  // Simple character head
  const cx = width * 0.5;
  const cy = height * 0.45;
  ctx.fillStyle = '#fde68a';
  ctx.beginPath();
  ctx.arc(cx, cy, 90, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#111827';
  ctx.beginPath();
  ctx.arc(cx - 30, cy - 20, 8, 0, Math.PI * 2);
  ctx.arc(cx + 30, cy - 20, 8, 0, Math.PI * 2);
  ctx.fill();

  // Mouth
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(cx - 30, cy + 10, 60, 12);

  // Arm oscillation near mouth
  const osc = Math.sin(progress * Math.PI * 2); // -1..1
  const armX = cx + 90 + osc * 20;
  const armY = cy + 10 + osc * 8;
  ctx.fillStyle = '#93c5fd';
  ctx.fillRect(armX - 10, armY - 10, 60, 16);

  // Toothbrush (long rectangle)
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(armX + 40, armY - 6, 70, 12);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(armX + 40, armY - 10, 12, 20);
}

function drawAnimatedSleep(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number
) {
  // Bed
  const bx = width * 0.2;
  const by = height * 0.6;
  const bw = width * 0.6;
  const bh = 80;
  ctx.fillStyle = '#93c5fd';
  ctx.fillRect(bx, by, bw, bh);
  ctx.fillStyle = '#1f2937';
  ctx.fillRect(bx, by + bh - 20, bw, 20);

  // Character moves into bed over progress
  const px = bx + bw * 0.2 + progress * bw * 0.5;
  const py = by - 40 + progress * 40;
  ctx.fillStyle = '#fde68a';
  ctx.beginPath();
  ctx.arc(px, py, 25, 0, Math.PI * 2);
  ctx.fill();

  // Blanket
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = '#a78bfa';
  ctx.fillRect(bx + bw * 0.15, by + 10, bw * Math.min(0.2 + progress * 0.7, 0.9), 60);
  ctx.globalAlpha = 1;

  // Zzz
  ctx.fillStyle = '#374151';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('Z', bx + bw * 0.8, by - 40);
  ctx.globalAlpha = 0.8;
  ctx.fillText('Z', bx + bw * 0.85, by - 60);
  ctx.globalAlpha = 0.6;
  ctx.fillText('Z', bx + bw * 0.9, by - 80);
  ctx.globalAlpha = 1;
}

function drawAnimatedEat(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number
) {
  // Table/Plate
  const plateX = width * 0.3;
  const plateY = height * 0.6;
  const plateSize = 120;

  // Plate
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(plateX + plateSize / 2, plateY + plateSize / 2, plateSize / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Food on plate (animated eating)
  const foodSize = (plateSize * 0.6) * (1 - progress * 0.8); // Food disappears as eating progresses
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(plateX + plateSize / 2, plateY + plateSize / 2, foodSize / 2, 0, Math.PI * 2);
  ctx.fill();

  // Character head eating
  const headX = width * 0.6;
  const headY = height * 0.4;
  ctx.fillStyle = '#fde68a';
  ctx.beginPath();
  ctx.arc(headX, headY, 60, 0, Math.PI * 2);
  ctx.fill();

  // Happy eating expression
  ctx.fillStyle = '#111827';
  ctx.beginPath();
  ctx.arc(headX - 20, headY - 15, 5, 0, Math.PI * 2);
  ctx.arc(headX + 20, headY - 15, 5, 0, Math.PI * 2);
  ctx.fill();

  // Chewing mouth (alternating size)
  const chewSize = 8 + Math.sin(progress * Math.PI * 8) * 4;
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(headX, headY + 10, chewSize, 0, Math.PI * 2);
  ctx.fill();

  // Arm reaching for food
  const armReach = Math.sin(progress * Math.PI * 4) * 10;
  ctx.fillStyle = '#93c5fd';
  ctx.fillRect(headX - 80 + armReach, headY + 20, 60, 12);
}

function drawAnimatedDress(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number
) {
  // Character body
  const bodyX = width * 0.5;
  const bodyY = height * 0.5;

  // Body base
  ctx.fillStyle = '#fde68a';
  ctx.fillRect(bodyX - 30, bodyY - 40, 60, 80);

  // Head
  ctx.beginPath();
  ctx.arc(bodyX, bodyY - 60, 25, 0, Math.PI * 2);
  ctx.fill();

  // Arms (animated dressing motion)
  const armMotion = Math.sin(progress * Math.PI * 2) * 20;
  ctx.fillStyle = '#93c5fd';
  ctx.fillRect(bodyX - 50 - armMotion, bodyY - 20, 40, 15);
  ctx.fillRect(bodyX + 10 + armMotion, bodyY - 20, 40, 15);

  // Clothing appearing (shirt)
  const shirtOpacity = Math.min(progress * 1.2, 1);
  ctx.globalAlpha = shirtOpacity;
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(bodyX - 35, bodyY - 45, 70, 90);

  // Buttons appearing
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 3; i++) {
    const buttonY = bodyY - 30 + i * 20;
    ctx.beginPath();
    ctx.arc(bodyX, buttonY, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Legs/pants
  ctx.globalAlpha = Math.min(progress * 1.5, 1);
  ctx.fillStyle = '#1f2937';
  ctx.fillRect(bodyX - 25, bodyY + 40, 50, 60);
}

function drawAnimatedBath(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number
) {
  // Bathtub
  const tubX = width * 0.2;
  const tubY = height * 0.5;
  const tubWidth = width * 0.6;
  const tubHeight = 100;

  // Tub outline
  ctx.fillStyle = '#e5e7eb';
  ctx.fillRect(tubX, tubY, tubWidth, tubHeight);

  // Water (animated waves)
  const waveHeight = Math.sin(progress * Math.PI * 4) * 5;
  ctx.fillStyle = '#3b82f6';
  ctx.globalAlpha = 0.7;
  ctx.fillRect(tubX + 10, tubY + 20 + waveHeight, tubWidth - 20, tubHeight - 40);
  ctx.globalAlpha = 1;

  // Bubbles (animated)
  for (let i = 0; i < 8; i++) {
    const bubbleX = tubX + 20 + (i * (tubWidth - 40) / 7);
    const bubbleY = tubY + 30 + Math.sin(progress * Math.PI * 2 + i) * 10;
    const bubbleSize = 5 + Math.sin(progress * Math.PI * 3 + i * 0.5) * 3;

    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Character head in bath
  const headX = tubX + tubWidth * 0.5;
  const headY = tubY + 30;
  ctx.fillStyle = '#fde68a';
  ctx.beginPath();
  ctx.arc(headX, headY, 35, 0, Math.PI * 2);
  ctx.fill();

  // Happy expression
  ctx.fillStyle = '#111827';
  ctx.beginPath();
  ctx.arc(headX - 12, headY - 10, 4, 0, Math.PI * 2);
  ctx.arc(headX + 12, headY - 10, 4, 0, Math.PI * 2);
  ctx.fill();

  // Smile
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(headX, headY + 5, 10, 0, Math.PI);
  ctx.stroke();
}

function drawAnimatedWashHands(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number
) {
  // Sink
  const sinkX = width * 0.3;
  const sinkY = height * 0.4;
  const sinkWidth = 200;
  const sinkHeight = 80;

  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(sinkX, sinkY, sinkWidth, sinkHeight);

  // Faucet
  ctx.fillStyle = '#6b7280';
  ctx.fillRect(sinkX + sinkWidth / 2 - 10, sinkY - 30, 20, 30);
  ctx.beginPath();
  ctx.arc(sinkX + sinkWidth / 2, sinkY - 30, 15, 0, Math.PI);
  ctx.fill();

  // Water stream (animated)
  const waterFlow = Math.sin(progress * Math.PI * 6) * 2;
  ctx.fillStyle = '#3b82f6';
  ctx.globalAlpha = 0.8;
  ctx.fillRect(sinkX + sinkWidth / 2 - 3, sinkY - 20 + waterFlow, 6, 40);
  ctx.globalAlpha = 1;

  // Hands washing (animated motion)
  const handMotion = Math.sin(progress * Math.PI * 8) * 15;
  const handX = sinkX + sinkWidth / 2;
  const handY = sinkY + 20;

  // Left hand
  ctx.fillStyle = '#fde68a';
  ctx.fillRect(handX - 30 - handMotion, handY, 25, 15);

  // Right hand
  ctx.fillRect(handX + 5 + handMotion, handY, 25, 15);

  // Soap bubbles
  for (let i = 0; i < 6; i++) {
    const bubbleX = handX - 20 + (i * 8) + handMotion;
    const bubbleY = handY - 10 + Math.sin(progress * Math.PI * 4 + i) * 5;
    const bubbleSize = 3 + Math.sin(progress * Math.PI * 6 + i) * 2;

    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawAnimatedPlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number
) {
  // Character jumping/playing
  const baseY = height * 0.7;
  const jumpHeight = Math.abs(Math.sin(progress * Math.PI * 4)) * 80;
  const charY = baseY - jumpHeight;
  const charX = width * 0.5;

  // Character body
  ctx.fillStyle = '#fde68a';
  ctx.fillRect(charX - 20, charY - 30, 40, 60);

  // Head
  ctx.beginPath();
  ctx.arc(charX, charY - 50, 25, 0, Math.PI * 2);
  ctx.fill();

  // Happy expression
  ctx.fillStyle = '#111827';
  ctx.beginPath();
  ctx.arc(charX - 10, charY - 55, 3, 0, Math.PI * 2);
  ctx.arc(charX + 10, charY - 55, 3, 0, Math.PI * 2);
  ctx.fill();

  // Big smile
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(charX, charY - 45, 12, 0, Math.PI);
  ctx.stroke();

  // Arms (animated playing motion)
  const armSwing = Math.sin(progress * Math.PI * 4) * 20;
  ctx.fillStyle = '#93c5fd';
  ctx.fillRect(charX - 35 - armSwing, charY - 25, 30, 12);
  ctx.fillRect(charX + 5 + armSwing, charY - 25, 30, 12);

  // Toy ball bouncing
  const ballY = height * 0.8 + Math.sin(progress * Math.PI * 6) * 30;
  const ballX = width * 0.3 + Math.cos(progress * Math.PI * 3) * 50;

  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(ballX, ballY, 20, 0, Math.PI * 2);
  ctx.fill();

  // Ball pattern
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(ballX, ballY, 15, 0, Math.PI);
  ctx.stroke();
}

function drawAnimatedRead(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number
) {
  // Book
  const bookX = width * 0.4;
  const bookY = height * 0.5;
  const bookWidth = 120;
  const bookHeight = 80;

  // Book pages
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(bookX, bookY, bookWidth, bookHeight);

  // Book cover
  ctx.fillStyle = '#8b5cf6';
  ctx.fillRect(bookX, bookY, bookWidth * 0.2, bookHeight);

  // Pages (animated page turning)
  const pageTurn = Math.sin(progress * Math.PI * 2) * 10;
  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(bookX + bookWidth * 0.2 + pageTurn, bookY + 5, bookWidth * 0.6 - 10, bookHeight - 10);

  // Character reading
  const headX = width * 0.3;
  const headY = height * 0.4;

  // Head
  ctx.fillStyle = '#fde68a';
  ctx.beginPath();
  ctx.arc(headX, headY, 35, 0, Math.PI * 2);
  ctx.fill();

  // Eyes focused on book (animated looking down)
  ctx.fillStyle = '#111827';
  const eyeOffset = 5 + Math.sin(progress * Math.PI * 4) * 2;
  ctx.beginPath();
  ctx.arc(headX - 12, headY - 5 + eyeOffset, 3, 0, Math.PI * 2);
  ctx.arc(headX + 12, headY - 5 + eyeOffset, 3, 0, Math.PI * 2);
  ctx.fill();

  // Reading glasses
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(headX - 8, headY - 5 + eyeOffset, 8, 0, Math.PI * 2);
  ctx.arc(headX + 8, headY - 5 + eyeOffset, 8, 0, Math.PI * 2);
  ctx.stroke();

  // Glasses bridge
  ctx.beginPath();
  ctx.moveTo(headX - 0, headY - 5 + eyeOffset);
  ctx.lineTo(headX + 0, headY - 5 + eyeOffset);
  ctx.stroke();
}

function drawAnimatedClean(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number
) {
  // Cleaning supplies
  const bucketX = width * 0.2;
  const bucketY = height * 0.7;

  // Bucket
  ctx.fillStyle = '#6b7280';
  ctx.fillRect(bucketX, bucketY, 60, 40);

  // Bucket handle
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(bucketX + 30, bucketY, 20, Math.PI, 0);
  ctx.stroke();

  // Character cleaning
  const charX = width * 0.5;
  const charY = height * 0.5;

  // Body
  ctx.fillStyle = '#fde68a';
  ctx.fillRect(charX - 15, charY - 20, 30, 60);

  // Head
  ctx.beginPath();
  ctx.arc(charX, charY - 40, 20, 0, Math.PI * 2);
  ctx.fill();

  // Cleaning arm motion (animated scrubbing)
  const scrubMotion = Math.sin(progress * Math.PI * 12) * 15;
  const armY = charY - 10;
  const armX = charX + 20 + scrubMotion;

  // Arm
  ctx.fillStyle = '#93c5fd';
  ctx.fillRect(armX, armY, 50, 10);

  // Cleaning cloth/sponge
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(armX + 40, armY - 5, 20, 20);

  // Motion lines showing cleaning action
  ctx.strokeStyle = '#9ca3af';
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.6;
  for (let i = 0; i < 3; i++) {
    const lineX = armX + 50 + i * 8;
    const lineY = armY + 5 + Math.sin(progress * Math.PI * 8 + i) * 5;
    ctx.beginPath();
    ctx.moveTo(lineX, lineY - 10);
    ctx.lineTo(lineX + 15, lineY + 10);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Sparkles showing cleaning effect
  for (let i = 0; i < 4; i++) {
    const sparkleX = charX + 80 + (i * 20);
    const sparkleY = charY - 20 + Math.sin(progress * Math.PI * 6 + i) * 10;
    const sparkleSize = 3 + Math.sin(progress * Math.PI * 4 + i) * 2;

    ctx.fillStyle = '#fbbf24';
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export async function generateRoutineVideo(
  routineTitle: string,
  frames: VideoFrameSpec[],
  options?: { width?: number; height?: number; secondsPerFrame?: number }
): Promise<{ url: string; mimeType: string; durationSec: number; isBlob: boolean }> {
  const width = options?.width ?? 1280;
  const height = options?.height ?? 720;
  const secondsPerFrame = options?.secondsPerFrame ?? 2;

  // Fallback for environments without MediaRecorder or canvas captureStream
  const fallbackUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(routineTitle + ' routine for kids')}`;
  const hasMediaRecorder = typeof MediaRecorder !== 'undefined';
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!hasMediaRecorder || !canvas || !ctx) {
    return { url: fallbackUrl, mimeType: 'text/html', durationSec: 0, isBlob: false };
  }

  canvas.width = width;
  canvas.height = height;
  // Ensure some browsers update the canvas stream by attaching it briefly to the DOM
  canvas.style.position = 'fixed';
  canvas.style.left = '-9999px';
  canvas.style.top = '-9999px';
  document.body.appendChild(canvas);

  // Helper to draw a single frame
  const drawFrame = (frame: VideoFrameSpec, progress: number) => {
    // Background gradient
    const grd = ctx.createLinearGradient(0, 0, width, height);
    grd.addColorStop(0, '#f0f7ff');
    grd.addColorStop(1, '#ffeef7');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, width, height);

    // Decorative circles
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#c3ddff';
    ctx.beginPath();
    ctx.arc(width * 0.2, height * 0.3, 120, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd7e8';
    ctx.beginPath();
    ctx.arc(width * 0.8, height * 0.7, 180, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Icon
    if (frame.icon) {
      ctx.font = '120px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(frame.icon, width / 2, height * 0.25);
    }

    // Title with slight slide-in based on progress
    const titleY = height * 0.45 - (1 - progress) * 20;
    ctx.font = 'bold 48px system-ui, Segoe UI, Roboto, Arial';
    ctx.fillStyle = '#111827';
    ctx.textAlign = 'center';
    ctx.fillText(frame.title, width / 2, titleY);

    // Description
    const descY = height * 0.55;
    ctx.font = '32px system-ui, Segoe UI, Roboto, Arial';
    ctx.fillStyle = '#374151';
    wrapText(ctx, frame.description, width / 2, descY, width * 0.8, 36);

    // Overlay simple character animations for known actions
    const anim = detectAnimation(frame.title);
    if (anim === 'brush_teeth') {
      drawAnimatedBrushTeeth(ctx, width, height, progress);
    } else if (anim === 'sleep') {
      drawAnimatedSleep(ctx, width, height, progress);
    } else if (anim === 'eat') {
      drawAnimatedEat(ctx, width, height, progress);
    } else if (anim === 'dress') {
      drawAnimatedDress(ctx, width, height, progress);
    } else if (anim === 'bath') {
      drawAnimatedBath(ctx, width, height, progress);
    } else if (anim === 'wash_hands') {
      drawAnimatedWashHands(ctx, width, height, progress);
    } else if (anim === 'play') {
      drawAnimatedPlay(ctx, width, height, progress);
    } else if (anim === 'read') {
      drawAnimatedRead(ctx, width, height, progress);
    } else if (anim === 'clean') {
      drawAnimatedClean(ctx, width, height, progress);
    }
  };

  // Wrap text helper for description lines
  function wrapText(
    context: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) {
    const words = text.split(' ');
    let line = '';
    let ty = y;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = context.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        context.fillText(line, x, ty);
        line = words[n] + ' ';
        ty += lineHeight;
      } else {
        line = testLine;
      }
    }
    context.fillText(line.trim(), x, ty);
  }

  const stream = (canvas as HTMLCanvasElement & { captureStream(fps?: number): MediaStream }).captureStream
    ? (canvas as HTMLCanvasElement & { captureStream(fps?: number): MediaStream }).captureStream(30)
    : null;
  if (!stream) {
    return { url: fallbackUrl, mimeType: 'text/html', durationSec: 0, isBlob: false };
  }

  // Choose a codec that is both recordable and playable in the current browser
  const testVideo = document.createElement('video');
  const canPlayVp9 = !!testVideo.canPlayType('video/webm;codecs=vp9');
  const canPlayVp8 = !!testVideo.canPlayType('video/webm;codecs=vp8');
  let mimeType = 'video/webm;codecs=vp8';
  if (canPlayVp9 && MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
    mimeType = 'video/webm;codecs=vp9';
  } else if (canPlayVp8 && MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
    mimeType = 'video/webm;codecs=vp8';
  } else if (MediaRecorder.isTypeSupported('video/webm')) {
    mimeType = 'video/webm';
  }
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 4_000_000 });
  const chunks: BlobPart[] = [];
  let receivedData = false;
  recorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) { chunks.push(e.data); receivedData = true; } };

  const totalFrames = frames.length;
  const frameDurationMs = secondsPerFrame * 1000;
  const totalDurationMs = totalFrames * frameDurationMs;

  // Use a small timeslice to ensure dataavailable fires
  recorder.start(250);

  const startTs = performance.now();
  let currentIndex = 0;

  await new Promise<void>((resolve) => {
    const step = (ts: number) => {
      const elapsed = ts - startTs;
      const frameIndex = Math.min(Math.floor(elapsed / frameDurationMs), totalFrames - 1);
      if (frameIndex !== currentIndex) currentIndex = frameIndex;
      const frameElapsed = elapsed - frameIndex * frameDurationMs;
      const progress = Math.min(1, frameElapsed / frameDurationMs);

      drawFrame(frames[currentIndex], progress);

      if (elapsed >= totalDurationMs) {
        resolve();
      } else {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  });

  // Flush any pending data and stop after a brief delay
  const blob: Blob = await new Promise((resolve) => {
    recorder.onstop = () => {
      // If no chunks were received, return an empty blob to avoid exceptions
      resolve(new Blob(receivedData ? chunks : [], { type: mimeType }));
    };
    try {
      recorder.requestData();
    } catch (e) {
      console.error("Error requesting data:", e);
    }
    setTimeout(() => {
      try {
        recorder.stop();
      } catch (e) {
        console.error("Error stopping recorder:", e);
      }
    }, 100);
  });

  let url: string;
  let isBlob = true;
  if (blob && blob.size > 0) {
    url = URL.createObjectURL(blob);
  } else {
    // Fallback if no bytes were recorded
    url = fallbackUrl;
    isBlob = false;
  }
  try {
    document.body.removeChild(canvas);
  } catch (e) {
    console.error("Error removing canvas:", e);
  }
  return { url, mimeType, durationSec: Math.round(totalDurationMs / 1000), isBlob };
}