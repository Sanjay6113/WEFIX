import { test, expect } from "@playwright/test";
test("configured admin login, navigation, validation, and logout", async ({
  page,
}) => {
  test.skip(
    !process.env.TEST_ADMIN_EMAIL || !process.env.TEST_ADMIN_PASSWORD,
    "Set dedicated staging admin credentials to exercise authenticated browser flows.",
  );
  await page.goto("/admin/login");
  await page
    .getByLabel("Email", { exact: true })
    .fill(process.env.TEST_ADMIN_EMAIL!);
  await page
    .getByLabel("Password", { exact: true })
    .fill(process.env.TEST_ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Overview", exact: true }),
  ).toBeVisible();
  for (const [path, title] of [
    ["clients", "Clients"],
    ["orders", "Orders"],
    ["pricing", "Pricing"],
    ["gallery", "Gallery"],
    ["whatsapp", "WhatsApp"],
  ]) {
    await page.goto(`/admin/${path}`);
    await expect(
      page.getByRole("heading", { name: title, exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBeTruthy();
  }
  await page.getByText("Build My PC", { exact: true }).click();
  const editor = page
    .locator("details")
    .filter({ has: page.locator("summary", { hasText: "Build My PC" }) });
  await editor.locator("textarea").fill("Invalid {secret}");
  await editor.getByRole("button", { name: "Save message" }).click();
  await expect(editor.getByRole("alert")).toContainText(
    "Unsupported placeholder",
  );
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.goto("/admin/orders");
  await expect(page).toHaveURL(/\/admin\/login/);
});
