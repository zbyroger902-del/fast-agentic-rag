# Rules: AI Agent Directives: Git-Driven & Atomic Journey Tracking
This rule only apply for code changes , for operation steps in the terminal you can do multi-steps at once without notification if only the operation are not dangerous.

You are an expert software engineer. We do NOT use markdown files to track our progress. Git is our only source of truth. You must use the terminal to interact with Git to understand the project's journey and record your work.

**CRITICAL RULE: NO "BIG BANG" COMMITS.** 
You are strictly forbidden from writing hundreds of lines of code or editing multiple unrelated files before committing. You must practice **Atomic Commits**. If a user request requires multiple steps (e.g., creating a UI component AND hooking up an API), you must split the work into sequential micro-commits.

## THE MICRO-COMMIT LOOP (MANDATORY)

Every time you are given a task, you must strictly follow these four phases:

### Phase 1: Context Gathering (Read the Journey)
Before writing any code, you MUST use the terminal to run,only exception is when this is a brand new projec then you should init the git repo and commit the init commit with a .gitignore file  and you can jump to phase 2 directly:
1. `git status` (to see uncommitted changes).
2. `git log -n 3 --stat` (to understand the last 3 steps of our journey).


### Phase 2: Execution & The "Blast Radius" Limit
Execute the steps from your plan **ONE AT A TIME**. 
You must obey the **Blast Radius Limit**: Do not edit more than 2 files or write more than ~50-100 lines of code at once.
1. Write the code for ONE step.
2. Stop and wait. Do not proceed to the next step yet.

### Phase 3: The Cursor Handoff (Drafting the Commit)
Because we are working in Cursor, you cannot safely run `git commit` in the terminal yourself, as changes must be accepted by me in the UI first. 

When you finish writing the code for a single step, you MUST do the following:
1. Provide the exact terminal command to run tests/linters so I can verify the step works.
2. Generate the strict commit message for this atomic step inside a markdown code block (so I can easily copy it).
3. Instruct me to: "Keep the changes' in Cursor, verify the code, commit using the message below. And then you can proceed to the next step.

## STRICT COMMIT MESSAGE FORMAT (For the Code Block)
**Line 1 (The What):** Conventional commit format (e.g., `feat: add PyMuPDF base class`).
**Line 2 (Blank)**
**Line 3+ (The Why & How):** Write 2-3 sentences explaining EXACTLY:
- Why this specific atomic change was necessary.
- How you solved it (the architectural decision).
- What step this fulfills in the current plan.

**Example of your required output at the end of Phase 4:**

Please click 'Keep' in Cursor, run `pytest tests/test_parser.py`, and if it passes, commit your changes using this message:

feat: implement image extraction in PyMuPDF parser

This completes Step 3 of the parser implementation. Used the `fitz` library to extract image blocks and save them to the `/static` directory. The relative path is now successfully appended to the text chunk metadata. 

