import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { getPage } from './browser.js';
import { assertNotFinalAction } from './safety.js';

const server = new McpServer({ name: 'browser-agent-mcp', version: '0.1.0' });

server.tool('browser_open', 'Open a URL in the persistent browser session.', {
  url: z.string().url()
}, async ({ url }) => {
  const page = await getPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  return { content: [{ type: 'text', text: `Opened ${page.url()}\nTitle: ${await page.title()}` }] };
});

server.tool('browser_snapshot', 'Return a compact text snapshot of the current page.', {}, async () => {
  const page = await getPage();
  const body = await page.locator('body').innerText().catch(() => '');
  return { content: [{ type: 'text', text: `URL: ${page.url()}\nTITLE: ${await page.title()}\n\n${body.slice(0, 12000)}` }] };
});

server.tool('browser_click', 'Click an element by accessible role/name or visible text.', {
  name: z.string(),
  role: z.enum(['button', 'link', 'checkbox', 'radio', 'tab', 'menuitem']).optional(),
  explicitly_authorized: z.boolean().optional().default(false)
}, async ({ name, role, explicitly_authorized }) => {
  assertNotFinalAction(name, explicitly_authorized);
  const page = await getPage();
  if (role) await page.getByRole(role, { name, exact: false }).first().click();
  else await page.getByText(name, { exact: false }).first().click();
  return { content: [{ type: 'text', text: `Clicked: ${name}` }] };
});

server.tool('browser_type', 'Type into a field by accessible label or placeholder.', {
  field: z.string(),
  text: z.string(),
  submit: z.boolean().optional().default(false)
}, async ({ field, text, submit }) => {
  const page = await getPage();
  let locator = page.getByLabel(field, { exact: false }).first();
  if (await locator.count() === 0) locator = page.getByPlaceholder(field, { exact: false }).first();
  await locator.fill(text);
  if (submit) await locator.press('Enter');
  return { content: [{ type: 'text', text: `Entered text into: ${field}` }] };
});

server.tool('browser_select', 'Select a value from a native select.', {
  field: z.string(),
  value: z.string()
}, async ({ field, value }) => {
  const page = await getPage();
  const locator = page.getByLabel(field, { exact: false }).first();
  await locator.selectOption({ label: value }).catch(async () => locator.selectOption(value));
  return { content: [{ type: 'text', text: `Selected ${value} in ${field}` }] };
});

server.tool('browser_back', 'Navigate back one page.', {}, async () => {
  const page = await getPage();
  await page.goBack({ waitUntil: 'domcontentloaded' }).catch(() => null);
  return { content: [{ type: 'text', text: `URL: ${page.url()}` }] };
});

server.tool('browser_wait', 'Wait for page activity.', {
  ms: z.number().int().min(0).max(30000).optional().default(1000)
}, async ({ ms }) => {
  const page = await getPage();
  await page.waitForTimeout(ms);
  return { content: [{ type: 'text', text: `Waited ${ms}ms` }] };
});

server.tool('browser_screenshot', 'Capture a screenshot and return its local path.', {
  path: z.string().optional().default('browser-screenshot.png'),
  full_page: z.boolean().optional().default(false)
}, async ({ path, full_page }) => {
  const page = await getPage();
  await page.screenshot({ path, fullPage: full_page });
  return { content: [{ type: 'text', text: `Saved screenshot: ${path}` }] };
});

server.tool('browser_cart_review', 'Summarize likely cart items, quantities and totals without submitting checkout.', {}, async () => {
  const page = await getPage();
  const body = await page.locator('body').innerText().catch(() => '');
  const lines = body.split('\n').map((s) => s.trim()).filter(Boolean);
  const likely = lines.filter((line) => /(qty|quantity|subtotal|total|\$\d|cart)/i.test(line)).slice(0, 200);
  return { content: [{ type: 'text', text: [`URL: ${page.url()}`, ...likely].join('\n') }] };
});

await server.connect(new StdioServerTransport());
