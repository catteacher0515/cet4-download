import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import { groupPapersBySession, papers } from "../src/data/cet4";

const rootDir = resolve(process.cwd());

test("papers 至少包含一条演示数据", () => {
  assert.ok(papers.length >= 1);
});

test("papers 使用 year-month-setNumber 进行分组", () => {
  const groups = groupPapersBySession(papers);
  assert.equal(groups.length, 1);
  assert.equal(groups[0]?.label, "2025 年 12 月");
  assert.equal(groups[0]?.papers.length, 1);
});

test("每条真题记录都至少指向存在的 PDF 文件", async () => {
  for (const paper of papers) {
    await access(resolve(rootDir, "public", paper.pdfPath.replace(/^\//, "")));

    if (paper.audioPath) {
      await access(resolve(rootDir, "public", paper.audioPath.replace(/^\//, "")));
    }
  }
});
