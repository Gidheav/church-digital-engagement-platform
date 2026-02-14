================================================================================
                     AUTO-SAVE DIAGNOSTIC GUIDE
                   "Why isn't my draft being created?"
================================================================================

**STATUS:** Comprehensive logging has been added to both PostCreate.tsx and 
useAutoSave.ts to capture every step of the draft creation process.

**YOUR TASK:** Follow these steps exactly to identify where the failure is 
occurring.

================================================================================
STEP 1: PREPARE YOUR BROWSER CONSOLE
================================================================================

1. Open Chrome DevTools:
   - Press F12 or Ctrl+Shift+I
   - Click the "Console" tab

2. At the top right, click the filter icon (🔍 with dropdown)
   - Type: [AUTO-SAVE]
   - This will ONLY show auto-save related logs
   - You can also type [DIAGNOSTIC] to see all diagnostics

3. Make sure "Info" messages are visible:
   - Click the level filters at top of console
   - Ensure "Info" is checked (should be green)

4. Leave the console open in your browser

================================================================================
STEP 2: PREPARE YOUR NETWORK TAB
================================================================================

1. Click the "Network" tab in DevTools

2. Click the red circle (clear) button to start fresh

3. Add a filter for "draft":
   - Top of Network tab, in the filter box, type "draft"
   - This will ONLY show requests related to drafts

4. Leave this open so we can see all draft API calls

================================================================================
STEP 3: RUN THE TEST
================================================================================

IMPORTANT: Follow these steps EXACTLY

1. Start with a FRESH page load:
   - Go to the app home page
   - Press Ctrl+F5 (hard refresh to clear cache)
   - Wait for page to fully load
   - You should see in Network tab: content-types requests, series requests

2. Click "Create New Post" button
   - IMMEDIATELY look at the Console tab
   - You should see messages appearing in real-time

3. WAIT 3 SECONDS without typing anything
   - The console should show several diagnostic messages
   - The Network tab should show if any requests were made to /drafts/

4. Look at the Console output
   - Find lines that start with:
     * 🟢 [DIAGNOSTIC]
     * 🚀 [AUTO-SAVE]
     * ❌ [AUTO-SAVE]
     * ❓ [useAutoSave]

5. IMPORTANT: Do NOT type anything yet
   - We're just testing if the initial draft is created

================================================================================
STEP 4: CAPTURE THE LOGS
================================================================================

Let me know EXACTLY what you see in the console. Copy and paste the messages
that appear, in ORDER. They should look something like:

EXPECTED OUTPUT (if working):
---
🟢 [DIAGNOSTIC] PostCreate.useEffect triggered
   userId: abc123def456
   draftCreated: false
   initialDraftId: null
🚀 [AUTO-SAVE] Creating initial draft on mount
   Calling draftService.createDraft()...
   Auth tokens exist: true
✅ [AUTO-SAVE] Draft created successfully
   Draft ID: xxxxx-yyyy-zzzz-wwww
   Full response: {id: "xxxx...", user: "abc123...", ...}
---

OR IF FAILING:
---
🟢 [DIAGNOSTIC] PostCreate.useEffect triggered
   userId: [empty or null?]
   draftCreated: false
   initialDraftId: null
❌ [DIAGNOSTIC] No userId found - user not authenticated
---

Tell me what you actually see.

================================================================================
STEP 5: CHECK YOUR AUTHENTICATION
================================================================================

In the Console tab, at the bottom where it says ">" (the input), type:

localStorage.getItem('auth_tokens')

Press Enter.

You should see output like:
{"access": "eyJ0eXAiOiJKV1QiLCJhbGc...", "refresh": "...", "user_id": "..."}

Tell me:
- Do you see that output or an error?
- Is it a long string starting with {"access"?
- Or does it say "null"?

================================================================================
STEP 6: CHECK YOUR BROWSER NETWORK
================================================================================

After Step 3, look at your Network tab (the one filtered for "draft"):

You should see ONE or MORE of these requests:
- POST /api/v1/admin/content/drafts/
  Status: 201 Created ✅ (good)
  Status: 400 Bad Request ❌ (something wrong with data)
  Status: 401 Unauthorized ❌ (not authenticated)
  Status: 500 Server Error ❌ (server problem)

Tell me:
- Do you see ANY request to /drafts/?
- If yes, what is the status code?
- If no, why not?

If you DO see a request that failed (4xx or 5xx):
- Click on it
- Click the "Response" tab
- Copy and paste what you see

================================================================================
STEP 7: THE CHECKLIST
================================================================================

Fill in each answer:

1. Does Console show "❌ [DIAGNOSTIC] No userId found"?
   YES / NO

2. Does Console show "✅ [AUTO-SAVE] Draft created successfully"?
   YES / NO

3. Does Network tab show POST to /drafts/?
   YES / NO

4. If Network shows the request, what is the Status code?
   (e.g., 201, 400, 401, 500)

5. If the POST failed, what does the Response tab show?
   (Paste the error message)

6. localStorage shows auth_tokens?
   YES / NO

================================================================================
STEP 8: PROVIDE THESE DETAILS
================================================================================

Reply with:

** CONSOLE LOGS (copy everything from console) **
[Paste what you see]

** NETWORK TAB (screenshot or description) **
[Describe what requests you see and their status codes]

** CHECKLIST ANSWERS **
1. userId found? [YES/NO]
2. Draft created successfully? [YES/NO]
3. POST to /drafts/ visible? [YES/NO]
4. Status code of POST: [___]
5. Error message: [___]
6. Auth tokens exist? [YES/NO]

================================================================================
WHAT DO THE LOGS MEAN?
================================================================================

🟢 [DIAGNOSTIC] - Basic information about component state
🚀 [AUTO-SAVE] - Starting a save operation
✅ [AUTO-SAVE] - Save succeeded
❌ [AUTO-SAVE] - Save failed
💾 [AUTO-SAVE] - Saving to backup (localStorage)
⚠️  [UNLOAD] - Page is being unloaded
📤 [UNLOAD] - Sending final save
🟠 [useAutoSave] - Hook-level diagnostic
📝 [useAutoSave] - Updating existing draft
🆕 [useAutoSave] - Creating new draft
📡 [useAutoSave] - Working offline
❓ [useAutoSave] - Unexpected condition

================================================================================
LIKELY SCENARIOS & WHAT TO LOOK FOR
================================================================================

SCENARIO 1: "userId not found" message
→ Problem: User not authenticated
→ Fix: Try logging out and back in
→ Check: In Network tab, do you see a login request?

SCENARIO 2: "POST /drafts/" shows 401 Unauthorized
→ Problem: Auth token invalid or expired
→ Fix: Clear localStorage, log in again
→ Check: Did you get new tokens?

SCENARIO 3: "POST /drafts/" shows 400 Bad Request
→ Problem: Invalid data being sent
→ Fix: Check the Response tab for error details
→ Check: Does the backend expect different field names?

SCENARIO 4: "POST /drafts/" shows 500 Server Error
→ Problem: Backend error
→ Fix: Check Django server logs
→ Check: Is the draft endpoint working?

SCENARIO 5: No "POST /drafts/" request appears
→ Problem: draftService.createDraft() not being called
→ Fix: Check if console shows any error before the POST
→ Check: Is the function even being invoked?

================================================================================
NEXT STEPS AFTER PROVIDING LOGS
================================================================================

Once you provide the console logs and checklist answers, I can:

1. Pinpoint the EXACT failure location
2. Provide a targeted fix
3. Test that the fix works
4. Deploy to production

The diagnostic logs will show us exactly what's happening at each step.

================================================================================
QUICK COPY-PASTE FOR CONSOLE
================================================================================

If you want to check things quickly in console, copy-paste these one at a time:

Check auth tokens exist:
localStorage.getItem('auth_tokens')

Check draft service exists:
typeof window.draftService

Check if user ID loaded:
JSON.parse(localStorage.getItem('auth_tokens')).user_id

Check online status:
navigator.onLine

Check for draft backups in localStorage:
Object.keys(localStorage).filter(k => k.includes('draft'))

================================================================================
