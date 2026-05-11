import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

test("首页和关于页会出现在构建产物中", () => {
  execSync("npm run build", { stdio: "pipe" });

  const homeHtml = readFileSync(resolve(process.cwd(), "dist/index.html"), "utf8");
  const aboutHtml = readFileSync(resolve(process.cwd(), "dist/about/index.html"), "utf8");

  assert.match(homeHtml, /四级真题，直接下载/);
  assert.match(homeHtml, /真题下载/);
  assert.match(aboutHtml, /关于本站/);
});
