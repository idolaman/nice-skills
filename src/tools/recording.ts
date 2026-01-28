import { spawn, ChildProcess, execSync } from "child_process";
import { mkdirSync, existsSync } from "fs";
import { join } from "path";
import { RecordingResult, Recording } from "../types.js";

const activeRecordings = new Map<string, Recording>();

function generateRecordingId(): string {
  return `rec_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

function getRecordingsDir(): string {
  const dir = join(process.cwd(), "recordings");
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function checkScreenCaptureAvailable(): boolean {
  try {
    // Check if screencapture is available (macOS)
    execSync("which screencapture", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

function checkFfmpegAvailable(): boolean {
  try {
    execSync("which ffmpeg", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

export async function startRecording(
  displayId?: number
): Promise<RecordingResult> {
  const recordingId = generateRecordingId();
  const outputPath = join(
    getRecordingsDir(),
    `${recordingId}.mov`
  );

  let process: ChildProcess;

  if (checkScreenCaptureAvailable()) {
    // Use macOS screencapture for video recording
    // -v: video mode
    // -C: show cursor
    // -k: no audio (can be changed)
    // -G: capture main display
    const args = ["-v", "-C"];

    if (displayId !== undefined) {
      args.push("-D", displayId.toString());
    }

    args.push(outputPath);

    process = spawn("screencapture", args, {
      stdio: ["pipe", "pipe", "pipe"],
      detached: false,
    });
  } else if (checkFfmpegAvailable()) {
    // Fallback to ffmpeg for screen recording
    const args = [
      "-f", "avfoundation",
      "-framerate", "30",
      "-i", displayId !== undefined ? `${displayId}:none` : "1:none",
      "-c:v", "libx264",
      "-preset", "ultrafast",
      "-y",
      outputPath.replace(".mov", ".mp4"),
    ];

    process = spawn("ffmpeg", args, {
      stdio: ["pipe", "pipe", "pipe"],
      detached: false,
    });
  } else {
    return {
      success: false,
      message: "No screen recording tool available. Install ffmpeg or use macOS with screencapture.",
    };
  }

  const recording: Recording = {
    id: recordingId,
    process,
    outputPath,
    startTime: new Date(),
  };

  activeRecordings.set(recordingId, recording);

  // Handle process errors
  process.on("error", (err) => {
    console.error(`Recording ${recordingId} error:`, err);
    activeRecordings.delete(recordingId);
  });

  // Wait a moment to ensure recording started
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Check if process is still running
  if (process.exitCode !== null) {
    activeRecordings.delete(recordingId);
    return {
      success: false,
      message: "Failed to start recording - process exited immediately",
    };
  }

  return {
    success: true,
    message: `Recording started with ID: ${recordingId}`,
    data: {
      recordingId,
      outputPath,
    },
  };
}

export async function stopRecording(
  recordingId: string
): Promise<RecordingResult> {
  const recording = activeRecordings.get(recordingId);

  if (!recording) {
    return {
      success: false,
      message: `No active recording found with ID: ${recordingId}`,
    };
  }

  const { process, outputPath, startTime } = recording;

  // Send SIGINT to gracefully stop screencapture (Ctrl+C)
  // For screencapture, we need to send a specific signal
  try {
    // Try sending Ctrl+C via stdin for screencapture
    if (process.stdin) {
      process.stdin.write("\x03");
    }

    // Also send SIGINT
    process.kill("SIGINT");
  } catch {
    // Process might already be terminated
  }

  // Wait for process to exit
  await new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      try {
        process.kill("SIGKILL");
      } catch {
        // Ignore
      }
      resolve();
    }, 5000);

    process.on("exit", () => {
      clearTimeout(timeout);
      resolve();
    });
  });

  activeRecordings.delete(recordingId);

  const duration = (new Date().getTime() - startTime.getTime()) / 1000;

  // Check if file was created
  if (!existsSync(outputPath)) {
    // Check for mp4 version (ffmpeg case)
    const mp4Path = outputPath.replace(".mov", ".mp4");
    if (existsSync(mp4Path)) {
      return {
        success: true,
        message: `Recording saved to: ${mp4Path}`,
        data: {
          recordingId,
          outputPath: mp4Path,
          duration,
        },
      };
    }
    return {
      success: false,
      message: "Recording file was not created",
    };
  }

  return {
    success: true,
    message: `Recording saved to: ${outputPath}`,
    data: {
      recordingId,
      outputPath,
      duration,
    },
  };
}

export function getActiveRecordings(): string[] {
  return Array.from(activeRecordings.keys());
}
