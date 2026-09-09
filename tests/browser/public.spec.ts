import { test, expect } from "@playwright/test";
test("public browsing and PC WhatsApp enquiry work without an account", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Your Tech Advisors for Life." }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Office Quiet/ }).click();
  await page
    .getByRole("textbox", { name: "Name", exact: true })
    .fill("Browser Test & Client");
  const href = await page
    .getByRole("link", { name: "Send to WhatsApp" })
    .getAttribute("href");
  expect(href).toContain("https://wa.me/");
  expect(new URL(href!).searchParams.get("text")).toContain(
    "Browser Test & Client",
  );
  expect(new URL(href!).searchParams.get("text")).toContain("Office");
  await expect(
    page.getByRole("link", { name: "Admin", exact: true }),
  ).toHaveAttribute("href", "/admin");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  expect(errors).toEqual([]);
  await page.screenshot({
    path: testInfo.outputPath("homepage.png"),
    fullPage: true,
  });
});
test("protected routes never expose admin data to anonymous visitors", async ({
  page,
}) => {
  for (const path of [
    "/admin",
    "/admin/clients",
    "/admin/orders",
    "/admin/pricing",
    "/admin/gallery",
    "/admin/whatsapp",
    "/admin/reset-password",
  ]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(
      page.getByRole("heading", { name: "Admin login" }),
    ).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Admin navigation" }),
    ).toHaveCount(0);
  }
});
test("tracker removes demos and invalid links reveal no private data", async ({
  page,
}) => {
  await page.goto("/check-status");
  await expect(page.getByText(/Open the private tracking link/)).toBeVisible();
  await expect(page.getByRole("textbox")).toHaveCount(0);
  await expect(page.getByText("WF-1042")).toHaveCount(0);
  const response = await page.goto(`/check-status/${"a".repeat(64)}`);
  await expect(
    page.getByRole("heading", { name: "Tracking unavailable" }),
  ).toBeVisible();
  expect(response?.headers()["referrer-policy"]).toBe("no-referrer");
  expect(response?.headers()["cache-control"]).toContain("no-store");
  expect(response?.headers()["x-robots-tag"]).toContain("noindex");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
});
test("gallery remains available with accessible modal keyboard handling", async ({
  page,
}) => {
  await page.goto("/gallery");
  await expect(
    page.getByRole("heading", { name: "WeFix Gallery" }),
  ).toBeVisible();
  const opener = page
    .getByRole("button", { name: /^Open / })
    .filter({ has: page.locator("img") })
    .first();
  if (!(await opener.count())) {
    test.skip(true, "No published images in this configured gallery.");
    return;
  }
  await opener.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(page.locator(".media-lightbox-close")).toBeFocused();
  await page.keyboard.press("Tab");
  expect(
    await dialog.evaluate((el) => el.contains(document.activeElement)),
  ).toBeTruthy();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
});
