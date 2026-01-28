# Nice Skills - Visual Verification Tool for Claude Code

An MCP (Model Context Protocol) server that enables Claude Code to visually verify features by recording the screen while performing automated verification actions.

## Features

- **Screen Recording** - Record the screen to capture verification sessions
- **Browser Automation** - Control a browser via Playwright for web UI verification
- **Postman Automation** - Control Postman via AppleScript for API verification
- **`/verify` Skill** - Claude Code skill that guides the verification workflow

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Claude Code                          │
│  ┌─────────────────┐    ┌─────────────────────────────┐ │
│  │  /verify skill  │───▶│  MCP Server Tools           │ │
│  │  (instructions) │    │  - start_recording()        │ │
│  └─────────────────┘    │  - stop_recording()         │ │
│                         │  - browser_navigate()       │ │
│                         │  - browser_click()          │ │
│                         │  - browser_type()           │ │
│                         │  - postman_*()              │ │
│                         └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Installation

### Quick Install (Recommended)

In Claude Code, run these two commands:

```
/plugin marketplace add yourusername/nice-skills
/plugin install nice-skills
```

That's it! The MCP server and `/verify` skill are automatically configured.

### Manual Installation

If you prefer manual setup or need to customize:

#### 1. Clone and Build

```bash
git clone https://github.com/yourusername/nice-skills.git
cd nice-skills
npm install
npx playwright install chromium
npm run build
```

#### 2. Install Plugin from Local Path

In Claude Code:
```
/plugin add /path/to/nice-skills
```

#### 3. Or Configure Manually

Add to `~/.claude.json`:

```json
{
  "mcpServers": {
    "nice-skills": {
      "command": "node",
      "args": ["/path/to/nice-skills/dist/index.js"]
    }
  }
}
```

Copy the skill:
```bash
mkdir -p ~/.claude/skills/verify
cp skills/verify/SKILL.md ~/.claude/skills/verify/SKILL.md
```

## Usage

After building a feature with Claude Code, run:

```
/verify
```

Claude Code will:
1. Analyze what was built
2. Start screen recording
3. Perform automated verification (browser or Postman)
4. Stop recording and report results

You can also just ask Claude naturally:
> "Verify the login form I just built"
> "Test the API endpoint and record it"

## Available MCP Tools

### Screen Recording
| Tool | Description |
|------|-------------|
| `start_recording` | Begin recording the screen |
| `stop_recording` | Stop and save the recording |

### Browser Automation
| Tool | Description |
|------|-------------|
| `browser_navigate` | Open browser and go to URL |
| `browser_click` | Click element by selector or text |
| `browser_type` | Type text into input fields |
| `browser_screenshot` | Capture current state |
| `browser_wait_for_text` | Wait for text to appear |
| `browser_close` | Close the browser |

### Postman Automation (macOS only)
| Tool | Description |
|------|-------------|
| `postman_open` | Launch Postman |
| `postman_new_request` | Create new request |
| `postman_set_method` | Set HTTP method |
| `postman_set_url` | Set request URL |
| `postman_set_body` | Set request body |
| `postman_send` | Send the request |
| `postman_close` | Close Postman |

## Example Verification Scenarios

### Web UI Verification

After building a login form:

1. Recording starts
2. Browser opens to the login page
3. Username and password are entered
4. Login button is clicked
5. Success message is verified
6. Screenshot is captured
7. Recording stops

### API Verification

After building a REST endpoint:

1. Recording starts
2. Postman opens
3. Request is configured (method, URL, body)
4. Request is sent
5. Response is displayed
6. Recording stops

## Development

```bash
# Watch mode for development
npm run dev

# Build
npm run build

# Run the server directly
npm start
```

## Output

- Recordings are saved to `./recordings/` as `.mov` files
- Screenshots are saved to `./recordings/screenshots/` as `.png` files

## Requirements

- **macOS**: Required for `screencapture` and Postman AppleScript automation
- **Node.js 18+**: Required for the MCP server
- **Screen Recording Permission**: Grant in System Settings > Privacy & Security > Screen Recording
- **Accessibility Permission**: Grant for Postman automation in System Settings > Privacy & Security > Accessibility

## Troubleshooting

### Screen Recording Not Working

1. Ensure screen recording permission is granted to Terminal/your IDE
2. Check that `screencapture` is available: `which screencapture`

### Postman Automation Not Working

1. Ensure Postman is installed
2. Grant accessibility permissions to Terminal/your IDE
3. Postman automation uses keyboard shortcuts which may change between versions

### Browser Not Opening

1. Ensure Playwright is installed: `npx playwright install chromium`
2. Check that the browser can be launched headless first for debugging

## License

MIT
