import { ChildProcess } from "child_process";

export interface Recording {
  id: string;
  process: ChildProcess;
  outputPath: string;
  startTime: Date;
}

export interface BrowserSession {
  id: string;
  browser: unknown; // Playwright Browser type
  page: unknown; // Playwright Page type
}

export interface ToolResult {
  success: boolean;
  message: string;
  data?: unknown;
}

export interface RecordingResult extends ToolResult {
  data?: {
    recordingId?: string;
    outputPath?: string;
    duration?: number;
  };
}

export interface BrowserResult extends ToolResult {
  data?: {
    sessionId?: string;
    url?: string;
    title?: string;
    screenshotPath?: string;
    textFound?: boolean;
  };
}

export interface PostmanResult extends ToolResult {
  data?: {
    method?: string;
    url?: string;
    status?: string;
  };
}
