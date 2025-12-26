_# AI Agent Communication Protocol

**Objective:** To establish clear guidelines on when and how AI agents should communicate with the human user, ensuring efficient collaboration and minimizing unnecessary interruptions.

**Your default state is to work autonomously. Only initiate contact with the user under the specific circumstances outlined below.**

---

## Guiding Principles

1.  **Respect User's Time:** Do not ask questions that you can answer yourself through research or by consulting the project's documentation and knowledge base.
2.  **Provide Context:** When you must ask a question, always provide a summary of what you have tried, what you have learned, and why you are blocked.
3.  **Offer Solutions:** Whenever possible, propose potential solutions or next steps rather than just presenting a problem.

## When to Communicate with the User

### 1. For Clarification of Ambiguous Goals

- **Trigger:** The user's request or the description of a GitHub Issue is ambiguous, contradictory, or lacks sufficient detail to create a concrete plan.
- **Action:**
    1.  First, attempt to resolve the ambiguity by consulting the `ROADMAP.md` and existing documentation.
    2.  If still unclear, send a message to the user.
- **Example Message:**
    > "I am about to start work on Issue #25, which is titled 'Improve User Profile'. The goal is a bit ambiguous. I can interpret this as either adding more fields to the database model (like 'bio' or 'location') or improving the UI/UX of the existing profile page. My initial research suggests improving the UI is a higher priority based on the roadmap. Can you confirm if this is the correct path, or should I focus on the data model first?"

### 2. When Blocked by a Technical Issue

- **Trigger:** You have encountered a technical error that you cannot solve after following all standard debugging procedures.
- **Action:**
    1.  Consult `docs/ai-knowledge-base/errors/`.
    2.  Conduct extensive web research for solutions.
    3.  Try at least two different potential solutions.
    4.  If still blocked, document everything you have tried in your development plan's Error Log.
    5.  Send a message to the user, including a link to your plan.
- **Example Message:**
    > "I am currently blocked on implementing the Google OAuth feature. I have followed the official NextAuth.js documentation and tried solutions from three different sources, but I am consistently getting a `redirect_uri_mismatch` error. I have documented all my attempts and the exact error message in my development plan here: `[link to plan]`. I suspect there might be an issue with the Google Cloud Console configuration that I cannot access. Could you please verify the OAuth client settings?"

### 3. To Propose a Change in Direction

- **Trigger:** Your research or development work reveals that the original plan or even the project roadmap is suboptimal, outdated, or risky.
- **Action:**
    1.  Do not proceed with the suboptimal path.
    2.  Document your findings and propose a new, better course of action in your development plan.
    3.  Present your findings and the proposed new plan to the user for approval.
- **Example Message:**
    > "I am planning the RSS feed parsing feature. The roadmap suggests using the `rss-parser` library. However, my research indicates this library has not been updated in two years and has several open security vulnerabilities. I have found a more modern, actively maintained alternative called `fast-xml-parser`. It is slightly more complex but offers better performance and security. I have updated my development plan to use this new library. Do I have your approval to proceed with this change?"

### 4. Before Performing a Sensitive or Irreversible Action

- **Trigger:** You are about to perform an action that is difficult or impossible to reverse, such as making a payment, deleting a significant amount of data, or making a public post.
- **Action:**
    1.  Clearly state the action you are about to take and why.
    2.  Ask for explicit confirmation from the user before proceeding.
- **Example Message:**
    > "I am about to run the database migration which will alter the `User` table. This is an irreversible action. Please confirm that I should proceed."

## When NOT to Communicate

- **To ask for permission to start a task:** Just start.
- **To give minor status updates:** Only communicate at major milestones or when blocked.
- **To ask a question you can answer yourself:** Do your research first.
