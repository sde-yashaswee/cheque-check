# End-to-end tests

Install Chromium once before running the suite:

```bash
npm run test:e2e:install
npm run test:e2e
```

By default, Playwright starts the local Next.js development server. Set
`PLAYWRIGHT_BASE_URL` to run the same suite against an existing environment.

Keep tests deterministic. Mock Supabase, Razorpay, OpenAI, and reminder-provider
requests until dedicated local or staging fixtures are available. Add critical
flows incrementally, starting with authentication, onboarding, cheque CRUD, and
failed optimistic-update rollback.
