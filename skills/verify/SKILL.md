---
name: verify
description: Visually verify features by recording the screen while performing automated browser or API testing. Use when the user wants to verify, demo, or test a feature that was built - especially web UIs, API endpoints, or CLI tools.
---

# Visual Verification Skill

You are now in verification mode. Your goal is to visually verify the feature that was built by recording the screen while performing automated verification actions.

## Available Tools

You have access to the following MCP tools from the `nice-skills` server:

### Screen Recording
- `start_recording` - Begin recording the screen (returns a recording ID)
- `stop_recording` - Stop recording and save the video file

### Browser Automation (for web UI verification)
- `browser_navigate` - Open browser and go to URL
- `browser_click` - Click element by selector or text
- `browser_type` - Type text into input fields
- `browser_screenshot` - Capture current state
- `browser_wait_for_text` - Wait for text to appear
- `browser_close` - Close the browser

### Postman Automation (for API verification)
- `postman_open` - Launch Postman
- `postman_new_request` - Create new request
- `postman_set_method` - Set HTTP method (GET, POST, etc.)
- `postman_set_url` - Set request URL
- `postman_set_body` - Set request body
- `postman_send` - Send the request
- `postman_close` - Close Postman

## Verification Workflow

### Step 1: Analyze What Was Built

Look at the conversation history to understand:
- What feature was implemented?
- What type of feature is it? (Web UI, API endpoint, CLI tool, etc.)
- What should the verification demonstrate?

### Step 2: Plan Verification Steps

Based on the feature type, plan your verification:

**For Web UI features:**
1. Start screen recording
2. Open browser and navigate to the page
3. Interact with the new feature (click buttons, fill forms, etc.)
4. Verify expected behavior appears
5. Take screenshots of key states
6. Close browser
7. Stop recording

**For API endpoints:**
1. Start screen recording
2. Open Postman
3. Create and configure the request
4. Send the request
5. Show the response
6. Close Postman
7. Stop recording

**For CLI tools:**
1. Start screen recording
2. Use terminal to run commands
3. Show output
4. Stop recording

### Step 3: Execute Verification

1. **Start Recording First**
   ```
   Call start_recording to begin capturing the screen
   Save the recording ID for later
   ```

2. **Perform Verification Actions**
   - Execute your planned steps
   - Wait appropriately between actions for visual clarity
   - Take screenshots at important moments

3. **Stop Recording**
   ```
   Call stop_recording with the recording ID
   Note the output file path
   ```

### Step 4: Report Results

After verification, report:
- What was verified
- Steps performed
- Recording file location
- Any issues encountered
- Screenshots taken

## Example Verification Sessions

### Web UI Example

If a login form was built:

1. `start_recording` -> get recording ID
2. `browser_navigate` to `http://localhost:3000/login`
3. `browser_type` username into `#username` field
4. `browser_type` password into `#password` field
5. `browser_click` the "Login" button
6. `browser_wait_for_text` "Welcome" to confirm success
7. `browser_screenshot` to capture the logged-in state
8. `browser_close`
9. `stop_recording` with the recording ID

### API Example

If a REST endpoint was built:

1. `start_recording` -> get recording ID
2. `postman_open`
3. `postman_new_request`
4. `postman_set_method` to "POST"
5. `postman_set_url` to "http://localhost:3000/api/users"
6. `postman_set_body` with JSON payload
7. `postman_send`
8. Wait for response to display
9. `postman_close`
10. `stop_recording` with the recording ID

## Important Notes

- Always start recording BEFORE performing verification actions
- Allow brief pauses between actions for visual clarity in the recording
- The recording captures the entire screen, so ensure relevant windows are visible
- If verification fails, still stop the recording and report what happened
- Recordings are saved to the `recordings/` directory

## Error Handling

If a tool fails:
1. Note the error
2. Try alternative approaches if possible
3. Always stop the recording even if verification fails
4. Report the issue clearly

Begin verification now by analyzing what was built and following the workflow above.
