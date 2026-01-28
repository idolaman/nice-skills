import { execSync, exec } from "child_process";
import { PostmanResult } from "../types.js";

function runAppleScript(script: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(`osascript -e '${script.replace(/'/g, "'\"'\"'")}'`, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message));
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function postmanOpen(): Promise<PostmanResult> {
  try {
    const script = `
      tell application "Postman"
        activate
      end tell
    `;
    await runAppleScript(script);

    // Wait for Postman to fully launch
    await delay(2000);

    return {
      success: true,
      message: "Postman opened",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Failed to open Postman: ${errorMessage}. Make sure Postman is installed.`,
    };
  }
}

export async function postmanNewRequest(): Promise<PostmanResult> {
  try {
    // Use keyboard shortcut to create new request
    const script = `
      tell application "System Events"
        tell process "Postman"
          keystroke "n" using {command down}
        end tell
      end tell
    `;
    await runAppleScript(script);

    await delay(1000);

    return {
      success: true,
      message: "New request created in Postman",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Failed to create new request: ${errorMessage}`,
    };
  }
}

export async function postmanSetMethod(
  method: string
): Promise<PostmanResult> {
  try {
    const methodUpper = method.toUpperCase();

    // Click on method dropdown and select method
    // This uses accessibility to find and click the method dropdown
    const script = `
      tell application "System Events"
        tell process "Postman"
          -- Focus the method dropdown (typically the first popup button)
          set methodButton to first pop up button of first group of first window
          click methodButton
          delay 0.3
          -- Type the method to filter/select
          keystroke "${methodUpper}"
          delay 0.2
          keystroke return
        end tell
      end tell
    `;
    await runAppleScript(script);

    await delay(500);

    return {
      success: true,
      message: `Method set to: ${methodUpper}`,
      data: {
        method: methodUpper,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Failed to set method: ${errorMessage}`,
    };
  }
}

export async function postmanSetUrl(url: string): Promise<PostmanResult> {
  try {
    // Focus URL field and type URL
    const script = `
      tell application "System Events"
        tell process "Postman"
          -- Tab to URL field or use keyboard shortcut
          keystroke "l" using {command down}
          delay 0.2
          -- Clear existing and type new URL
          keystroke "a" using {command down}
          keystroke "${url.replace(/"/g, '\\"')}"
        end tell
      end tell
    `;
    await runAppleScript(script);

    await delay(500);

    return {
      success: true,
      message: `URL set to: ${url}`,
      data: {
        url,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Failed to set URL: ${errorMessage}`,
    };
  }
}

export async function postmanSetBody(body: string): Promise<PostmanResult> {
  try {
    // Navigate to body tab and set content
    const script = `
      tell application "System Events"
        tell process "Postman"
          -- Click Body tab (or use keyboard navigation)
          key code 48 using {command down} -- Tab through sections
          delay 0.3
          -- Type body content
          keystroke "${body.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"
        end tell
      end tell
    `;
    await runAppleScript(script);

    await delay(500);

    return {
      success: true,
      message: "Body content set",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Failed to set body: ${errorMessage}`,
    };
  }
}

export async function postmanSend(): Promise<PostmanResult> {
  try {
    // Send request using keyboard shortcut
    const script = `
      tell application "System Events"
        tell process "Postman"
          keystroke return using {command down}
        end tell
      end tell
    `;
    await runAppleScript(script);

    // Wait for response
    await delay(2000);

    return {
      success: true,
      message: "Request sent",
      data: {
        status: "sent",
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Failed to send request: ${errorMessage}`,
    };
  }
}

export async function postmanClose(): Promise<PostmanResult> {
  try {
    const script = `
      tell application "Postman"
        quit
      end tell
    `;
    await runAppleScript(script);

    return {
      success: true,
      message: "Postman closed",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Failed to close Postman: ${errorMessage}`,
    };
  }
}
