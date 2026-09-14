import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PORT ?? 3000);
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${port}`;

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    // CI/sandbox images may ship Chromium at a fixed path; local machines use Playwright's own.
    ...(process.env.CHROMIUM_PATH
      ? { launchOptions: { executablePath: process.env.CHROMIUM_PATH } }
      : {}),
  },
  projects: [
    { name: "mobile-360", use: { ...devices["Pixel 5"], viewport: { width: 360, height: 780 } } },
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "pnpm start",
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
