# Planned Changes & Implementations

## 1. Role & Permissions Update (Worker vs Authority)
- **Backend (`authMiddleware` / Routes):** 
  - Restrict the `PUT /api/alerts/:id` (Resolution endpoint) to only accept the `WORKER` role. Remove the `AUTHORITY` role from this action.
- **Frontend (UI Components):**
  - Hide the "Resolve Issue" upload button/form for users with the `AUTHORITY` role.
  - Ensure the "Resolve Issue" feature is only visible and accessible to `WORKER` roles.

## 2. Authority Dashboard & Metrics
- **Frontend (Dashboard UI):**
  - Ensure `AUTHORITY` users have access to a high-level metrics dashboard.
  - Implement/Refine UI for `AUTHORITY` users to manually review alerts that are flagged with `NEEDS_HUMAN_REVIEW` by the AI system.

## 3. Documentation Updates
- **`Engineering steps.md` / `GuardianAI_Project_Report.md`:**
  - Update the "Functional Requirements" and "System Workflow" documentation to explicitly state that Workers resolve issues and Authorities monitor/review metrics.

*(Note: Add more tasks here as we discover them during the project)*
