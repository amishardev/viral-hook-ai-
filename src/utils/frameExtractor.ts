interface ExtractionProgress {
  step: string;
  currentFrame: number;
  totalFrames: number;
}

export function calculateTargetFrames(durationSeconds: number): number {
  if (durationSeconds <= 15) return 12;
  if (durationSeconds <= 30) return 16;
  if (durationSeconds <= 60) return 20;
  if (durationSeconds <= 90) return 25;
  if (durationSeconds <= 120) return 30;
  return 40; // max limit
}

export function getGridLayout(frameCount: number) {
  if (frameCount <= 12) return { cols: 4, rows: 3 };
  if (frameCount <= 16) return { cols: 4, rows: 4 };
  if (frameCount <= 20) return { cols: 5, rows: 4 };
  if (frameCount <= 25) return { cols: 5, rows: 5 };
  if (frameCount <= 30) return { cols: 6, rows: 5 };
  return { cols: 8, rows: 5 }; // default for up to 40
}

/**
 * Programmatically extracts frames from a video and composes them into a single storyboard image.
 */
export async function generateStoryboard(
  videoFile: File,
  onProgress: (progress: ExtractionProgress) => void
): Promise<{ storyboardUrl: string; duration: number; framesList: string[] }> {
  return new Promise((resolve, reject) => {
    onProgress({ step: "loading-metadata", currentFrame: 0, totalFrames: 0 });

    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.controls = false;

    const sourceUrl = URL.createObjectURL(videoFile);
    video.src = sourceUrl;

    video.onloadedmetadata = async () => {
      try {
        const duration = video.duration;
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        const isVertical = videoHeight > videoWidth;

        // Configuration based on aspect ratio
        const frameW = isVertical ? 180 : 320;
        const frameH = isVertical ? 320 : 180;
        const targetFrames = calculateTargetFrames(duration);

        onProgress({ step: "extracting-frames", currentFrame: 0, totalFrames: targetFrames });

        const frames: string[] = [];
        const canvas = document.createElement("canvas");
        canvas.width = frameW;
        canvas.height = frameH;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          throw new Error("Unable to create 2D canvas context.");
        }

        // Seek and extract each frame
        for (let i = 0; i < targetFrames; i++) {
          const timestamp = (i / targetFrames) * duration;
          
          await new Promise<void>((seekResolve, seekReject) => {
            const timeout = setTimeout(() => {
              seekReject(new Error(`Timeout seeking frame ${i + 1}`));
            }, 6000);

            video.currentTime = timestamp;
            video.onseeked = () => {
              clearTimeout(timeout);
              seekResolve();
            };
            video.onerror = (e) => {
              clearTimeout(timeout);
              seekReject(new Error("Video seeking error"));
            };
          });

          // Draw and clip rounded corners
          ctx.clearRect(0, 0, frameW, frameH);
          ctx.save();
          
          // Draw rounded rectangle path
          const radius = 6;
          ctx.beginPath();
          ctx.moveTo(radius, 0);
          ctx.lineTo(frameW - radius, 0);
          ctx.quadraticCurveTo(frameW, 0, frameW, radius);
          ctx.lineTo(frameW, frameH - radius);
          ctx.quadraticCurveTo(frameW, frameH, frameW - radius, frameH);
          ctx.lineTo(radius, frameH);
          ctx.quadraticCurveTo(0, frameH, 0, frameH - radius);
          ctx.lineTo(0, radius);
          ctx.quadraticCurveTo(0, 0, radius, 0);
          ctx.closePath();
          ctx.clip();

          // Draw the video frame fitted
          ctx.drawImage(video, 0, 0, frameW, frameH);
          ctx.restore();

          // Convert to jpeg to save space
          const frameBase64 = canvas.toDataURL("image/jpeg", 0.85);
          frames.push(frameBase64);

          onProgress({
            step: "extracting-frames",
            currentFrame: i + 1,
            totalFrames: targetFrames
          });
        }

        // Compose into storyboard grid
        onProgress({ step: "composing-storyboard", currentFrame: targetFrames, totalFrames: targetFrames });

        const { cols, rows } = getGridLayout(targetFrames);
        const gap = 12;
        const labelHeight = 20;

        const storyboardCanvas = document.createElement("canvas");
        const boardW = cols * (frameW + gap) + gap;
        const boardH = rows * (frameH + gap + labelHeight) + gap;

        storyboardCanvas.width = boardW;
        storyboardCanvas.height = boardH;
        const sbCtx = storyboardCanvas.getContext("2d");

        if (!sbCtx) {
          throw new Error("Unable to create storyboard canvas context.");
        }

        // Fill background
        sbCtx.fillStyle = "#0a0a0f";
        sbCtx.fillRect(0, 0, boardW, boardH);

        // Load all extracted images and paint them to grid
        for (let i = 0; i < frames.length; i++) {
          const colIndex = i % cols;
          const rowIndex = Math.floor(i / cols);

          const x = gap + colIndex * (frameW + gap);
          const y = gap + rowIndex * (frameH + gap + labelHeight);

          const img = new Image();
          img.src = frames[i];
          await new Promise<void>((imgResolve) => {
            img.onload = () => {
              // Draw frame image
              sbCtx.drawImage(img, x, y, frameW, frameH);

              // Add a subtle border around the drawn frame
              sbCtx.strokeStyle = "#222233";
              sbCtx.lineWidth = 1;
              sbCtx.strokeRect(x, y, frameW, frameH);

              // Draw timestamp label beneath the frame
              const timestampSeconds = Math.round((i / targetFrames) * duration);
              sbCtx.fillStyle = "#8888aa";
              sbCtx.font = "bold 11px 'DM Mono', monospace";
              sbCtx.textAlign = "center";
              sbCtx.fillText(`${timestampSeconds}s`, x + frameW / 2, y + frameH + 14);

              imgResolve();
            };
          });
        }

        const storyboardUrl = storyboardCanvas.toDataURL("image/png");
        
        // Clean up object URL
        URL.revokeObjectURL(sourceUrl);

        resolve({
          storyboardUrl,
          duration: Math.round(duration),
          framesList: frames
        });

      } catch (err) {
        URL.revokeObjectURL(sourceUrl);
        reject(err);
      }
    };

    video.onerror = (e) => {
      URL.revokeObjectURL(sourceUrl);
      reject(new Error("Failed to load video file. Make sure it is a valid format."));
    };
  });
}
