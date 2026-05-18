import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const localesDir = resolve(__dirname, "../src/shared/i18n/locales");

const languages = ["en", "sk", "cs", "de", "uk"];

function getKeys(obj, prefix = "") {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null) {
      keys.push(...getKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys.sort();
}

const allKeys = {};
for (const lang of languages) {
  const data = JSON.parse(readFileSync(resolve(localesDir, `${lang}.json`), "utf-8"));
  allKeys[lang] = new Set(getKeys(data));
}

const reference = "en";
const refKeys = allKeys[reference];
let hasError = false;

for (const lang of languages) {
  if (lang === reference) continue;
  const langKeys = allKeys[lang];

  const missing = [...refKeys].filter((k) => !langKeys.has(k));
  const extra = [...langKeys].filter((k) => !refKeys.has(k));

  if (missing.length > 0) {
    console.error(`\n${lang}: missing ${missing.length} key(s):`);
    missing.forEach((k) => console.error(`  - ${k}`));
    hasError = true;
  }
  if (extra.length > 0) {
    console.warn(`\n${lang}: ${extra.length} extra key(s) not in ${reference}:`);
    extra.forEach((k) => console.warn(`  + ${k}`));
  }
}

if (!hasError) {
  console.log("All translation files have matching keys.");
} else {
  process.exit(1);
}
