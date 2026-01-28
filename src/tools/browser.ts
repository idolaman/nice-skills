import { chromium, Browser, Page, BrowserContext } from "playwright";
import { mkdirSync, existsSync } from "fs";
import { join } from "path";
import { BrowserResult } from "../types.js";

let browser: Browser | null = null;
let context: BrowserContext | null = null;
let page: Page | null = null;

function getScreenshotsDir(): string {
  const dir = join(process.cwd(), "recordings", "screenshots");
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

async function ensureBrowser(): Promise<{ browser: Browser; page: Page }> {
  if (!browser || !browser.isConnected()) {
    browser = await chromium.launch({
      headless: false, // We want to see and record the browser
      args: ["--start-maximized"],
    });
    context = await browser.newContext({
      viewport: null, // Use full window size
    });
    page = await context.newPage();
  }

  if (!page || page.isClosed()) {
    if (!context) {
      context = await browser.newContext({ viewport: null });
    }
    page = await context.newPage();
  }

  return { browser, page };
}

export async function browserNavigate(url: string): Promise<BrowserResult> {
  try {
    const { page } = await ensureBrowser();

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    const title = await page.title();
    const currentUrl = page.url();

    return {
      success: true,
      message: `Navigated to: ${currentUrl}`,
      data: {
        url: currentUrl,
        title,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Failed to navigate: ${errorMessage}`,
    };
  }
}

export async function browserClick(
  selector?: string,
  text?: string
): Promise<BrowserResult> {
  try {
    if (!page || page.isClosed()) {
      return {
        success: false,
        message: "No browser session active. Call browser_navigate first.",
      };
    }

    if (text) {
      // Click by text content
      await page.getByText(text, { exact: false }).first().click({
        timeout: 10000,
      });
    } else if (selector) {
      // Click by selector
      await page.click(selector, {
        timeout: 10000,
      });
    } else {
      return {
        success: false,
        message: "Either selector or text must be provided",
      };
    }

    // Wait a moment for any navigation/animation
    await page.waitForTimeout(500);

    return {
      success: true,
      message: `Clicked element${selector ? ` (${selector})` : ""}${text ? ` with text "${text}"` : ""}`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Failed to click: ${errorMessage}`,
    };
  }
}

export async function browserType(
  text: string,
  selector?: string
): Promise<BrowserResult> {
  try {
    if (!page || page.isClosed()) {
      return {
        success: false,
        message: "No browser session active. Call browser_navigate first.",
      };
    }

    if (selector) {
      // Type into specific element
      await page.fill(selector, text, { timeout: 10000 });
    } else {
      // Type into currently focused element
      await page.keyboard.type(text);
    }

    return {
      success: true,
      message: `Typed text${selector ? ` into ${selector}` : ""}`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Failed to type: ${errorMessage}`,
    };
  }
}

export async function browserScreenshot(
  name?: string
): Promise<BrowserResult> {
  try {
    if (!page || page.isClosed()) {
      return {
        success: false,
        message: "No browser session active. Call browser_navigate first.",
      };
    }

    const filename = name || `screenshot_${Date.now()}`;
    const screenshotPath = join(getScreenshotsDir(), `${filename}.png`);

    await page.screenshot({
      path: screenshotPath,
      fullPage: false,
    });

    return {
      success: true,
      message: `Screenshot saved to: ${screenshotPath}`,
      data: {
        screenshotPath,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Failed to take screenshot: ${errorMessage}`,
    };
  }
}

export async function browserWaitForText(
  text: string,
  timeout?: number
): Promise<BrowserResult> {
  try {
    if (!page || page.isClosed()) {
      return {
        success: false,
        message: "No browser session active. Call browser_navigate first.",
      };
    }

    await page.getByText(text, { exact: false }).first().waitFor({
      state: "visible",
      timeout: timeout || 10000,
    });

    return {
      success: true,
      message: `Found text: "${text}"`,
      data: {
        textFound: true,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Text not found within timeout: ${errorMessage}`,
      data: {
        textFound: false,
      },
    };
  }
}

export async function browserClose(): Promise<BrowserResult> {
  try {
    if (browser && browser.isConnected()) {
      await browser.close();
    }
    browser = null;
    context = null;
    page = null;

    return {
      success: true,
      message: "Browser closed",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Failed to close browser: ${errorMessage}`,
    };
  }
}
