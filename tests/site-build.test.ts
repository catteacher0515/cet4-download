import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

test.before(() => {
  execSync("npm run build", { stdio: "pipe" });
});

test("首页和关于页会出现在构建产物中", () => {
  const homeHtml = readFileSync(resolve(process.cwd(), "dist/index.html"), "utf8");
  const aboutHtml = readFileSync(resolve(process.cwd(), "dist/about/index.html"), "utf8");

  assert.match(homeHtml, /四级真题，直接下载/);
  assert.match(homeHtml, /真题下载/);
  assert.match(aboutHtml, /关于本站/);
});

test("真题下载页输出年份分组和 PDF 下载链接", () => {
  const papersHtml = readFileSync(resolve(process.cwd(), "dist/papers/index.html"), "utf8");

  assert.match(papersHtml, /site-shell--full-bleed/);
  assert.match(papersHtml, /papers-hero papers-hero--compact page-section/);
  assert.match(papersHtml, /papers-session papers-session--compact/);
  assert.match(papersHtml, /papers-grid papers-grid--three-up/);
  assert.match(papersHtml, /papers-section__head papers-section__head--center/);
  assert.match(papersHtml, /2025年 - 下半年/);
  assert.match(papersHtml, /2025年12月英语四级真题\(第1套\)/);
  assert.match(papersHtml, /2025年12月英语四级真题\(第2套\)/);
  assert.match(papersHtml, /2025年12月英语四级真题\(第3套\)/);
  assert.match(papersHtml, /下载 PDF/);
  assert.match(papersHtml, /papers\/2025\/12\/cet4-2025-12-set-01\.pdf/);
  assert.match(papersHtml, /papers\/2025\/12\/1\//);
  assert.doesNotMatch(papersHtml, /Coming Soon/);
});

test("试卷预览页输出在线预览和下载入口", () => {
  const previewHtml = readFileSync(resolve(process.cwd(), "dist/papers/2025/12/1/index.html"), "utf8");

  assert.match(previewHtml, /2025年12月英语四级真题\(第1套\)/);
  assert.match(previewHtml, /reader-pdfjs/);
  assert.match(previewHtml, /data-pdf-url="\/papers\/2025\/12\/cet4-2025-12-set-01\.pdf"/);
  assert.doesNotMatch(previewHtml, /reader-topbar/);
  assert.match(previewHtml, /reader-audio-bar/);
  assert.match(previewHtml, /reader-audio-bar__toggle/);
  assert.match(previewHtml, /reader-audio-bar__seek/);
  assert.match(previewHtml, /reader-audio-bar__time-current/);
  assert.doesNotMatch(previewHtml, /iframe/);
  assert.match(previewHtml, /听力音频/);
  assert.match(previewHtml, /audio/);
  assert.match(previewHtml, /audio\/2025\/12\/cet4-2025-12-set-01\.mp4/);
});

test("首页会强调真题下载与后续高频词汇扩展方向", () => {
  const homeHtml = readFileSync(resolve(process.cwd(), "dist/index.html"), "utf8");

  assert.match(homeHtml, /真题下载/);
  assert.match(homeHtml, /关于本站/);
});
