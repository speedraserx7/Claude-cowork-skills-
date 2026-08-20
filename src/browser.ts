import { chromium, type BrowserContext, type Page } from 'playwright';
import path from 'node:path';

let context: BrowserContext | null = null;
let page: Page | null = null;

function envBool(name: string, fallback: boolean) {
  const value = process.env[name];
  if (value == null) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

export async function getPage(): Promise<Page> {
  if (page && !page.isClosed()) return page;

  const userDataDir = path.resolve(process.env.BROWSER_PROFILE_DIR ?? '.browser-profile');
  context = await chromium.launchPersistentContext(userDataDir, {
    headless: envBool('BROWSER_HEADLESS', false),
    viewport: {
      width: Number(process.env.BROWSER_VIEWPORT_WIDTH ?? 1440),
      height: Number(process.env.BROWSER_VIEWPORT_HEIGHT ?? 1000)
    }
  });

  page = context.pages()[0] ?? await context.newPage();
  return page;
}

export async function closeBrowser() {
  await context?.close();
  context = null;
  page = null;
}
