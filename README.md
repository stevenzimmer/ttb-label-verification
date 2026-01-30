## Getting Started

First, create a `.env.local` file and add your OpenAI API key:

```bash
OPENAI_API_KEY=your_api_key_here
```

Install packages and then run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The prototype can be demoed at `ttb.webdevzim.com`.

## Prototype choices

-   **Direct OpenAI SDK usage**

    -   This prototype calls the OpenAI API directly using the OpenAI SDK. This keeps the build lightweight and allows rapid iteration within the one-week timebox. (Future state: on-prem / allow-listed inference endpoint for more info)

-   **No database or persistence**

    -   All label state, accept/reject decisions, and application data live only in client memory (React state).
    -   Accept/reject “save” actions are simulated with a short timeout in `components/label-context.tsx`.
    -   Avoids standing up a database, migration strategy, and the security scope that comes with long‑term storage.
    -   Persisting label data would require image hosting, access controls, and encryption at rest/in transit for label images and derived text.

-   **No observability/metrics pipeline**

    -   The UI shows extraction timing for reviewer feedback, but there is no centralized logging, tracing, or metrics capture.
    -   Avoids configuring log sinks, retention, alerting, or dashboards (and any compliance review for telemetry).

-   **No authentication/authorization**

    -   Prototype assumes a trusted internal user; no user management or role‑based access controls were added.
    -   Runs as a standalone proof‑of‑concept to avoid authorization and integration work during the timebox.

-   **Simplified matching logic**
    -   Field comparisons use exact and normalized string matching rather than richer domain rules for units, synonyms, and formatting variants. (See Future state: AI-assisted field matching endpoint for more info)

## Image capture guidance

The extractor is resilient to imperfect photos, but it can only read what is visible. Practical expectations:

-   **Skew:** Mild to moderate skew is acceptable as long as all text is visible and not cut off.
-   **Glare:** Glare is acceptable if it does not cover or wash out text. If text remains readable to a human, it is generally extractable.
-   **Crop:** Do not crop out label edges that contain required fields; anything cut off cannot be extracted.

## Future state: on-prem / allow-listed inference endpoint

For a production deployment in TTB’s Azure environment, I would use Azure OpenAI with Private Link (Private Endpoint) and disable public network access. This keeps model traffic on private network paths, aligns better with federal security controls, and reduces reliance on public internet egress. The app would run inside a VNet and resolve the Azure OpenAI endpoint through a private DNS zone.

Pros:

-   Keeps the current OpenAI-style pipeline with minimal code changes.
-   Higher accuracy than a pure local OCR fallback.

Cons:

-   More infrastructure and operational work.
-   Requires security approvals and procurement lead time.

## Future state: AI-assisted field matching endpoint

To improve field matching accuracy (especially unit and formatting variants), add a dedicated API endpoint that compares extracted label fields to application data using the OpenAI SDK and returns a structured match result per field.

### Goal

Resolve the field matching requirement between extracted label fields and application data with:

-   normalization for common unit variants (e.g., `750 mL` vs `750ml`, `45% ABV` vs `45% Alc./Vol.`),
-   a three‑state result per field: `match`, `no_match`, or `review`,
-   and a clear rationale that can drive the Status column in the comparison table.

### Matching logic (high‑level)

-   Use a model prompt that:
    -   normalizes units, punctuation, and casing,
    -   applies domain‑specific equivalences (ABV vs Alc./Vol., mL vs ml),
    -   returns a strict `match | no_match | review` per field,
    -   includes short rationales for `review` or `no_match`.
-   Keep the output schema strict (Zod schema via `responses.parse`) to ensure the UI receives consistent statuses.

## Future State: Evals-Driven Quality Loop

To move from a prototype to a reliable, regression-safe system, this app can adopt a lightweight evals program that measures extraction and comparison quality over a curated gold dataset.

### What the evals would measure

-   Field-level extraction accuracy (exact match + normalized match)
-   Required-field pass rate (all required fields match)
-   Confidence calibration (high confidence should correlate with correctness)
-   Rejection quality (rejected labels should align with actual non-compliance)

### How the evals would run

-   Maintain a small gold dataset of label images plus ground-truth application data (including hard cases).
-   Run `/api/validate-label` over the dataset and score results using the same comparison logic used in the UI.
-   Store baseline metrics in a JSON snapshot and fail CI when metrics drop below thresholds.

### Why this matters

-   Prevents silent regressions as prompts or comparison logic change.
-   Provides concrete quality targets for stakeholders and reviewers.
-   Enables faster iteration because changes are validated automatically.

## Design system choices

Given the one-week timeline, the UI leans on out-of-the-box components to move quickly while keeping the interface consistent and accessible.

-   **Component library**

    -   Built with the shadcn/ui component patterns (see `components/ui/*`) plus Tailwind utility classes for layout and spacing.
    -   This avoided building a bespoke design system and allowed rapid, consistent UI assembly.

-   **Visual style**
    -   Neutral palette with status colors (emerald/amber/red) to emphasize validation outcomes without heavy visual complexity.
    -   Drawer-based detail panels keep the main workflow focused while still exposing deep review context.
