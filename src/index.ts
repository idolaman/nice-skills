#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { startRecording, stopRecording, getActiveRecordings } from "./tools/recording.js";
import {
  browserNavigate,
  browserClick,
  browserType,
  browserScreenshot,
  browserWaitForText,
  browserClose,
} from "./tools/browser.js";
import {
  postmanOpen,
  postmanNewRequest,
  postmanSetMethod,
  postmanSetUrl,
  postmanSetBody,
  postmanSend,
  postmanClose,
} from "./tools/postman.js";

const server = new Server(
  {
    name: "nice-skills",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List all available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // Recording tools
      {
        name: "start_recording",
        description: "Start recording the screen. Returns a recording ID to use when stopping.",
        inputSchema: {
          type: "object",
          properties: {
            displayId: {
              type: "number",
              description: "Optional display ID to record (default: main display)",
            },
          },
        },
      },
      {
        name: "stop_recording",
        description: "Stop an active recording and save the video file.",
        inputSchema: {
          type: "object",
          properties: {
            recordingId: {
              type: "string",
              description: "The recording ID returned from start_recording",
            },
          },
          required: ["recordingId"],
        },
      },

      // Browser tools
      {
        name: "browser_navigate",
        description: "Open a browser and navigate to a URL. The browser window will be visible on screen.",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "The URL to navigate to",
            },
          },
          required: ["url"],
        },
      },
      {
        name: "browser_click",
        description: "Click an element on the page by CSS selector or visible text.",
        inputSchema: {
          type: "object",
          properties: {
            selector: {
              type: "string",
              description: "CSS selector of the element to click",
            },
            text: {
              type: "string",
              description: "Visible text of the element to click (alternative to selector)",
            },
          },
        },
      },
      {
        name: "browser_type",
        description: "Type text into an input field.",
        inputSchema: {
          type: "object",
          properties: {
            text: {
              type: "string",
              description: "The text to type",
            },
            selector: {
              type: "string",
              description: "CSS selector of the input element (optional - types into focused element if not provided)",
            },
          },
          required: ["text"],
        },
      },
      {
        name: "browser_screenshot",
        description: "Take a screenshot of the current browser state.",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Optional name for the screenshot file",
            },
          },
        },
      },
      {
        name: "browser_wait_for_text",
        description: "Wait for specific text to appear on the page.",
        inputSchema: {
          type: "object",
          properties: {
            text: {
              type: "string",
              description: "The text to wait for",
            },
            timeout: {
              type: "number",
              description: "Timeout in milliseconds (default: 10000)",
            },
          },
          required: ["text"],
        },
      },
      {
        name: "browser_close",
        description: "Close the browser.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },

      // Postman tools
      {
        name: "postman_open",
        description: "Launch the Postman application.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "postman_new_request",
        description: "Create a new request in Postman.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "postman_set_method",
        description: "Set the HTTP method for the current request.",
        inputSchema: {
          type: "object",
          properties: {
            method: {
              type: "string",
              description: "HTTP method (GET, POST, PUT, DELETE, etc.)",
              enum: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
            },
          },
          required: ["method"],
        },
      },
      {
        name: "postman_set_url",
        description: "Set the URL for the current request.",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "The request URL",
            },
          },
          required: ["url"],
        },
      },
      {
        name: "postman_set_body",
        description: "Set the request body (for POST, PUT, etc.).",
        inputSchema: {
          type: "object",
          properties: {
            body: {
              type: "string",
              description: "The request body content",
            },
          },
          required: ["body"],
        },
      },
      {
        name: "postman_send",
        description: "Send the current request in Postman.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "postman_close",
        description: "Close the Postman application.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      // Recording tools
      case "start_recording": {
        const displayId = (args as { displayId?: number }).displayId;
        const result = await startRecording(displayId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "stop_recording": {
        const recordingId = (args as { recordingId: string }).recordingId;
        const result = await stopRecording(recordingId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      // Browser tools
      case "browser_navigate": {
        const url = (args as { url: string }).url;
        const result = await browserNavigate(url);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "browser_click": {
        const { selector, text } = args as { selector?: string; text?: string };
        const result = await browserClick(selector, text);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "browser_type": {
        const { text, selector } = args as { text: string; selector?: string };
        const result = await browserType(text, selector);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "browser_screenshot": {
        const screenshotName = (args as { name?: string }).name;
        const result = await browserScreenshot(screenshotName);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "browser_wait_for_text": {
        const { text, timeout } = args as { text: string; timeout?: number };
        const result = await browserWaitForText(text, timeout);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "browser_close": {
        const result = await browserClose();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      // Postman tools
      case "postman_open": {
        const result = await postmanOpen();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "postman_new_request": {
        const result = await postmanNewRequest();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "postman_set_method": {
        const method = (args as { method: string }).method;
        const result = await postmanSetMethod(method);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "postman_set_url": {
        const url = (args as { url: string }).url;
        const result = await postmanSetUrl(url);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "postman_set_body": {
        const body = (args as { body: string }).body;
        const result = await postmanSetBody(body);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "postman_send": {
        const result = await postmanSend();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "postman_close": {
        const result = await postmanClose();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        return {
          content: [
            {
              type: "text",
              text: `Unknown tool: ${name}`,
            },
          ],
          isError: true,
        };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `Error executing ${name}: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Nice Skills MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
