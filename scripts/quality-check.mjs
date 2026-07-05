import assert from "node:assert/strict";
import fs from "node:fs";

const emailPattern = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}|mailto:/;
const publicContactFiles = [
  "src/app/contact/page.tsx",
  "src/components/layout/Footer.tsx",
  "src/components/sections/contact/ContactForm.tsx",
  "src/app/llms.txt/route.ts",
  "src/app/llms-full.txt/route.ts",
];

for (const file of publicContactFiles) {
  assert.equal(emailPattern.test(fs.readFileSync(file, "utf8")), false, `${file} exposes an email address`);
}

const contactRoute = fs.readFileSync("src/app/api/contact/route.ts", "utf8");
assert.match(contactRoute, /process\.env\.CONTACT_TO/, "contact recipients must remain env-overridable");
assert.doesNotMatch(contactRoute, emailPattern, "contact recipient must stay in env, not source");
assert.match(contactRoute, /contact delivery is not configured/, "production contact delivery must fail when no provider is configured");

console.log("quality-check: ok");
