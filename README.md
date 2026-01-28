This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

-   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## README / Design Notes: Networking & Deployment Path (Suggested Text)

### Prototype networking choice (for speed):

This take-home prototype calls the OpenAI API directly using the OpenAI SDK. This keeps the build lightweight and allows rapid iteration within the one-week timebox.

### Known constraint in TTB environments:

In a locked-down government network, outbound HTTPS requests to third-party domains (e.g., public ML endpoints) may be blocked by firewall or proxy rules. If outbound traffic to the OpenAI API endpoint is restricted, AI extraction/verification will fail or time out.

### Production deployment approach (recommended):

For a production deployment in TTB’s Azure environment, I would use Azure OpenAI with Private Link (Private Endpoint) and disable public network access. This keeps model traffic on private network paths, aligns better with federal security controls, and reduces reliance on public internet egress. The app would run inside a VNet (or integrated via App Service VNet Integration) and resolve the Azure OpenAI endpoint through a private DNS zone.

### Fallback / resilience (optional if you implement):

If the AI endpoint is unreachable, the app can degrade gracefully by:

-   returning a clear “AI unavailable due to network restrictions” message, and/or
-   falling back to local OCR + rule checks for partial functionality.

Short “Assumptions” Bullet (even more concise)

-   Assumption: outbound HTTPS to the OpenAI API is permitted for this prototype.
-   Future state: deploy Azure OpenAI behind Private Link with public access disabled, accessed only from within the VNet.

## Requirements Coverage

### Features that satisfy the stated requirements

-   Batch uploads + batch processing
    -   Multiple file upload via `components/image-upload.tsx`
    -   “Extract text from all labels” with controlled concurrency and batch timing via `components/label-context.tsx:560` and surfaced in `components/label-cards.tsx`
-   Speed awareness for the ~5 second target
    -   Per-label processing times displayed in `components/label-extraction-drawer.tsx`
    -   Batch total + average time per label with red/green threshold feedback in `components/label-cards.tsx`
-   Clean, obvious UI for mixed tech comfort levels
    -   Straightforward upload surface and drawer-based details in `components/label-validator-wrapper.tsx`, `components/image-upload.tsx`, and `components/label-extraction-drawer.tsx`
-   Core field extraction aligned to common TTB elements
    -   Extraction schema includes brand, class/type, alcohol content, net contents, producer name/address, country of origin, and government warning in `lib/label-extraction-schema.ts`
    -   System prompt enforces “visible text only,” exact excerpts as evidence, and nulls for missing fields in `lib/system-prompt.ts`
    -   API route uses structured parsing with Zod in `app/api/validate-label/route.ts`
-   Field-by-field comparison workflow
    -   Field comparison table with per-field status in `components/field-by-field-comparison-table.tsx`
    -   “Judgment” matching for case/punctuation/apostrophe differences in `components/label-context.tsx:232`
-   Some conditional requirement logic (beyond naive matching)
    -   Imported beverage requirement for country of origin and conditional ABV requirement logic in `lib/label-requirements.ts`

### Gaps vs. the stated requirements and stakeholder concerns

-   Government warning exactness is under-validated
    -   Current logic checks only for the `GOVERNMENT WARNING:` prefix rather than the full required statement and formatting nuances in `components/label-context.tsx:254` and `components/field-by-field-comparison-table.tsx`
-   No persistence, audit trail, or real save path
    -   Accept/reject actions are simulated with a timeout and stored only in client state in `components/label-context.tsx:607` and `components/label-context.tsx:681`
-   Speed target is measured but not enforced
    -   The UI reports timing but there is no SLA/timeout handling or fallback behavior if extraction exceeds the threshold in `components/label-cards.tsx` and `components/label-context.tsx:560`
-   Limited robustness to poor image quality
    -   Images are resized before processing, but there is no de-skew, glare reduction, or OCR-specific preprocessing beyond resizing in `components/label-context.tsx:418`
-   Requirement logic is heuristic and may miss edge cases
    -   Beverage type inference and requirement decisions are regex-based and approximate the real TTB rules in `lib/label-requirements.ts`

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

-   Prevents silent regressions as prompts, OCR settings, or comparison logic change.
-   Provides concrete quality targets for stakeholders and reviewers.
-   Enables faster iteration because changes are validated automatically.
