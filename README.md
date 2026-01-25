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
