# Browser Agent MCP

A generic Playwright-powered MCP browser agent for authenticated web workflows such as shopping, account admin, form entry, research, and cart building.

## Safety model

The agent may browse, authenticate with user participation, search, select, edit carts, and prepare transactions. It must stop before irreversible or consequential actions such as placing an order or submitting payment unless the user explicitly authorizes that specific action.

## Setup

```bash
npm install
npx playwright install chromium
cp .env.example .env
npm run dev
```

The persistent Chromium profile is stored in `.browser-profile/` and is intentionally ignored by git.

## Initial tools

- `browser_open`
- `browser_snapshot`
- `browser_click`
- `browser_type`
- `browser_select`
- `browser_back`
- `browser_wait`
- `browser_screenshot`
- `browser_cart_review`

## First acceptance test

1. Open Walmart.
2. Select Walmart Supercenter #4356 at 7200 Arroyo Crossing Pkwy, Las Vegas, NV 89113.
3. Let the user complete login/2FA if Walmart requests it.
4. Build the requested grocery cart.
5. Surface substitutions or ambiguous products.
6. Stop with the cart ready for the user to review and check out.
