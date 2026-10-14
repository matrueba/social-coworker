# Context & Rules for AI Assistants

> SYSTEM INSTRUCTION: This file contains the absolute source of truth for this project. YOU MUST read this file before generating any code or answering questions. If a user request conflicts with these rules, prioritize these rules or ask for clarification.

## 1. Project Context

**Name**: social-coworker
**Description**: App to help social workers to manage their cases.
**Primary Goal**: Produce production-grade, maintainable, scalable, and secure code that is ready for deployment.

## 2. Tech Stack & Versions

Use these specific versions and libraries. Do not introduce alternatives without explicit permission.

- **Frontend**: React (Next.js) TailwindCSS
- **Backend**: Node.js, Express
- **Database**: SQLite (better-sqlite3, file `app/data/social-coworker.db`). Supabase/PostgreSQL may come later; keep data access isolated in `src/lib/db/`.
- **AI**: Mastra (`@mastra/core`), model `google/gemini-3.8-flash` (`src/agents/agent.ts`). Output is structured (`src/agents/reportOutputSchema.ts`) and saved as a draft that a person must review and confirm.
- **Anonymization**: Presidio Analyzer in Docker (`presidio/`, `docker-compose.yml`), called with axios from `src/lib/anonymizer/`. Case data MUST be pseudonymized before reaching any LLM; never fall back to raw data. See `ANONIMIZACION.md`.
- **Auth**: Deferred (not needed for now; to be implemented last)
- **Payments**: Stripe SDK
- **DevOps**: GitHub Actions

## 3. Core Coding Standards

### 3.1 Code Style & Structure

- **Functional Paradigm**: Use functional components and hooks exclusively. No class components.
- **Strict Typing**: TypeScript is mandatory. `any` is strictly forbidden. Use `unknown` or `zod` schemas for validation.
- \*Do not use ; if not mandatory.
- **Naming Convention**:
  - Variables/Functions: `camelCase` (e.g., `fetchUserData`)
  - Components/Files: `PascalCase` (e.g., `UserProfile.tsx`)
  - Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_COUNT`)
- **File Structure**:
  - Colocate related files (e.g., `component.tsx`, `component.test.tsx`, `types.ts` in the same folder).
  - Use "Barrel files" (`index.ts`) sparingly; prefer direct imports to avoid circular dependencies.

### 3.2 Security Rules (CRITICAL)

- **Never expose secrets**: Use environment variables (`process.env.NEXT_PUBLIC_...` for client, `process.env...` for server).
- **Validation**: Validate ALL inputs using Zod schemas at the API boundary.
- **Authorization**: Check permissions in every Server Action or API route.

### 3.3 Error Handling

- Use `try/catch` blocks in all async operations.
- For UI errors, use specific "Error Boundary" components or Toast notifications.
- Log errors structurally (not just `console.log`).
-

### 3.4 Architectural & Design Principles (SOLID & Clean Code)

Adhere to these principles to ensure long-term maintainability:

- **SOLID Principles**:
  - **SRP (Single Responsibility)**: Each component, hook, or function must have ONE clear purpose. Break down large components (>200 lines) into smaller sub-components.
  - **OCP (Open/Closed)**: Extend functionality via props or composition, not by modifying core logic heavily.
  - **DIP (Dependency Inversion)**: Rely on abstractions. When fetching data or using external services, keep logic decoupled from the UI (use Service patterns or custom hooks).
- **Composition Over Inheritance**: strictly enforced. Never use class inheritance. Use React Composition (`children` prop) and Custom Hooks for logic reuse.
- **DRY (Don't Repeat Yourself)**:
  - Extract repeated logic into custom hooks (`useMyLogic`) or utility functions (`/lib/utils`).
  - _Exception_: Prefer minor duplication over the "wrong abstraction" (WET - Write Everything Twice) if unifying code creates excessive coupling.
- **KISS (Keep It Simple, Stupid)**:
  - Avoid over-engineering. Choose the simplest solution that solves the problem efficiently.
  - Avoid premature optimization. Readability > "Clever" one-liners.

### 3.5 UI/UX Rules

- **Styling**:
  #159ea6 Primario: Botones de acción principal, iconos activos, checkmarks
  #196ed5 Secundario: Badges ("User Interface"), enlaces o estados informativos
  #E8F1F3 Background: linear-gradient(180deg, #E8F1F3 0%, #FFFFFF 100%);
  #0e0a0b Texto principal, títulos y encabezados
  #797A7F Texto secundario: Descripciones, fechas y texto de menor jerarquía

## 4. Development Workflow

### 4.1 "Thinking" Process for the Agent

Before writing code, follow this sequence:

1. **Analyze**: Understand the file structure and dependencies.
2. **Plan**: Outline the changes in a comment or scratchpad.
3. **Implement**: Write the code iteratively.
4. **Verify**: Ensure types match and no linting errors exist.

### 4.2 Preferred Commands

- **Install**: `npm install`
- **Run Dev**: `npm run dev`
- **Lint**: `npm run lint`
- **Test**: `npm run test` (Mocha)

## 5. Do's and Don'ts

## 6. Project-Specific Instructions

_[Add specific rules for your SaaS here]_

- **AI Integration**: When using OpenAI API, always implement a retry mechanism and handle rate limits gracefully.
- **Video/Images**: All media assets must be optimized/compressed before upload.
- **Internationalization**: Wrap all user-facing text in `t('key')` (i18next/next-intl).

## 7. Documentation

- Add JSDoc comments to all exported functions and complex logic.
- If you modify a file significantly, update th
