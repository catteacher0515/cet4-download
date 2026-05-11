export type Cet4Paper = {
  id: string;
  year: number;
  month: 6 | 12;
  setNumber: number;
  title: string;
  pdfPath: string;
  previewImagePath?: string;
  audioPath?: string;
  audioDuration?: string;
};

export type PrepareSessionArgs = {
  year: number;
  month: 6 | 12;
  sourcePdfs: [string, string, string];
  verifyAfterImport: boolean;
};

export function formatPaperSetNumber(setNumber: number): string {
  return String(setNumber).padStart(2, "0");
}

export function formatPaperMonth(month: 6 | 12): string {
  return String(month).padStart(2, "0");
}

export function buildPaperAssetPaths(year: number, month: 6 | 12, setNumber: number) {
  const paddedMonth = formatPaperMonth(month);
  const paddedSetNumber = formatPaperSetNumber(setNumber);
  const baseName = `cet4-${year}-${paddedMonth}-set-${paddedSetNumber}`;

  return {
    id: baseName,
    title: `${year}年${month}月英语四级真题(第${setNumber}套)`,
    pdfPath: `/papers/${year}/${paddedMonth}/` + `${baseName}.pdf`,
    previewImagePath: `/previews/${year}/${paddedMonth}/` + `${baseName}.png`
  };
}

export function buildSessionAssetPlan(year: number, month: 6 | 12) {
  return [1, 2, 3].map((setNumber) => buildPaperAssetPaths(year, month, setNumber));
}

export function buildPaperRecordSnippet(year: number, month: 6 | 12, setNumber: number): string {
  return [
    "  {",
    `    ...buildPaperAssetPaths(${year}, ${month}, ${setNumber}),`,
    `    year: ${year},`,
    `    month: ${month},`,
    `    setNumber: ${setNumber}`,
    "  }"
  ].join("\n");
}

export function insertPaperRecords(source: string, snippets: string[]): string {
  const marker = "export const papers: Cet4Paper[] = [";
  const startIndex = source.indexOf(marker);

  if (startIndex === -1) {
    throw new Error("未找到 papers 数组定义");
  }

  for (const snippet of snippets) {
    const firstMeaningfulLine = snippet
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line.startsWith("...buildPaperAssetPaths"));

    if (firstMeaningfulLine && source.includes(firstMeaningfulLine)) {
      throw new Error(`记录已存在: ${firstMeaningfulLine}`);
    }
  }

  const arrayStart = startIndex + marker.length - 1;
  const arrayEnd = source.indexOf("\n];", arrayStart);

  if (arrayStart === -1 || arrayEnd === -1) {
    throw new Error("papers 数组结构不完整");
  }

  const before = source.slice(0, arrayStart + 1);
  const body = source.slice(arrayStart + 1, arrayEnd).trim();
  const after = source.slice(arrayEnd);
  const existingEntries = body ? [body] : [];
  const nextBody = [...existingEntries, ...snippets].join(",\n");

  return `${before}\n${nextBody}\n${after}`;
}

export function parsePrepareSessionArgs(args: string[]): PrepareSessionArgs {
  const verifyAfterImport = args.includes("--verify");
  const cleanedArgs = args.filter((arg) => arg !== "--verify");
  const [yearArg, monthArg, set1PdfArg, set2PdfArg, set3PdfArg] = cleanedArgs;

  if (!yearArg || !monthArg || !set1PdfArg || !set2PdfArg || !set3PdfArg) {
    throw new Error("prepare:session 参数不完整");
  }

  const year = Number(yearArg);
  const month = Number(monthArg) as 6 | 12;

  if (!Number.isInteger(year) || year < 2000) {
    throw new Error(`year 非法: ${yearArg}`);
  }

  if (month !== 6 && month !== 12) {
    throw new Error(`month 只能是 6 或 12，收到: ${monthArg}`);
  }

  return {
    year,
    month,
    sourcePdfs: [set1PdfArg, set2PdfArg, set3PdfArg],
    verifyAfterImport
  };
}

export function buildPrepareSessionVerificationCommands(): string[] {
  return ["npm run validate:content", "npm run test", "npm run build"];
}

export const papers: Cet4Paper[] = [
  {
    ...buildPaperAssetPaths(2025, 12, 1),
    year: 2025,
    month: 12,
    setNumber: 1
  },
  {
    ...buildPaperAssetPaths(2025, 12, 2),
    year: 2025,
    month: 12,
    setNumber: 2
  },
  {
    ...buildPaperAssetPaths(2025, 12, 3),
    year: 2025,
    month: 12,
    setNumber: 3
  }
];

export type PaperSessionGroup = {
  id: string;
  label: string;
  year: number;
  month: 6 | 12;
  papers: Cet4Paper[];
};

export function sortPapers(items: Cet4Paper[]): Cet4Paper[] {
  return [...items].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    if (a.month !== b.month) return b.month - a.month;
    return a.setNumber - b.setNumber;
  });
}

export function groupPapersBySession(items: Cet4Paper[]): PaperSessionGroup[] {
  const sorted = sortPapers(items);

  const groups = new Map<string, PaperSessionGroup>();

  for (const paper of sorted) {
    const key = `${paper.year}-${paper.month}`;

    if (!groups.has(key)) {
      groups.set(key, {
        id: key,
        label: `${paper.year} 年 ${paper.month} 月`,
        year: paper.year,
        month: paper.month,
        papers: []
      });
    }

    groups.get(key)!.papers.push(paper);
  }

  return Array.from(groups.values());
}
