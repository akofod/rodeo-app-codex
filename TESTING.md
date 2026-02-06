# Testing

This project uses Vitest for unit tests and Playwright for end-to-end tests.

## Quick Commands

- `npm run test` - run Vitest unit tests
- `npm run test:watch` - run Vitest in watch mode
- `npm run test:e2e` - run Playwright end-to-end tests
- `npm run test:all` - run unit + e2e tests

## First-time Setup

- `npm install`
- `npx playwright install`

## Notes

- Some unit tests may emit React warnings about `form action` props or `next/image` `priority` attributes. These are expected in jsdom and do not indicate failures.
- Playwright uses `npm run dev` under the hood and will reuse an existing server on `http://localhost:3000`.
