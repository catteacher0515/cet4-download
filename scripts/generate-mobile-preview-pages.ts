import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { buildPaperPreviewPagePath, papers } from "../src/data/cet4.ts";

const execFileAsync = promisify(execFile);
const PDFTOPPM_PATH = "/opt/homebrew/bin/pdftoppm";
const PDFINFO_PATH = "/opt/homebrew/bin/pdfinfo";

type PreviewManifest = Record<string, number>;

async function getPdfPageCount(pdfPath: string) {
  const { stdout } = await execFileAsync(PDFINFO_PATH, [pdfPath]);
  const matched = stdout.match(/^Pages:\s+(\d+)/m);

  if (!matched) {
    throw new Error(`无法读取 PDF 页数: ${pdfPath}`);
  }

  return Number(matched[1]);
}

async function generatePreviewPagesForPaper(previewRoot: string, pdfPath: string, pageCount: number) {
  await rm(previewRoot, { recursive: true, force: true });
  await mkdir(previewRoot, { recursive: true });

  const outputPrefix = resolve(previewRoot, "page");

  await execFileAsync(PDFTOPPM_PATH, [
    "-png",
    "-r",
    "110",
    pdfPath,
    outputPrefix
  ]);

  const files = (await readdir(previewRoot))
    .filter((file) => file.endsWith(".png"))
    .sort();

  if (files.length !== pageCount) {
    throw new Error(`分页预览图数量异常: ${pdfPath}，期望 ${pageCount}，实际 ${files.length}`);
  }
}

async function main() {
  const manifest: PreviewManifest = {};
  const publicDir = resolve(process.cwd(), "public");

  for (const paper of papers) {
    const pdfPath = resolve(publicDir, paper.pdfPath.replace(/^\//, ""));
    const firstPreviewPagePath = buildPaperPreviewPagePath(paper.year, paper.month, paper.setNumber, 1);
    const previewRoot = resolve(publicDir, dirname(firstPreviewPagePath.replace(/^\//, "")));
    const pageCount = await getPdfPageCount(pdfPath);

    await generatePreviewPagesForPaper(previewRoot, pdfPath, pageCount);

    manifest[paper.id] = pageCount;
    console.log(`generated mobile preview pages: ${paper.id} (${pageCount} pages)`);
  }

  const manifestPath = resolve(publicDir, "previews/mobile-preview-manifest.json");
  await mkdir(dirname(manifestPath), { recursive: true });
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");

  console.log(`wrote mobile preview manifest: ${manifestPath}`);
}

main().catch((error) => {
  console.error("generate mobile preview pages failed");
  console.error(error);
  process.exit(1);
});
