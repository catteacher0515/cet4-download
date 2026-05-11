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

export const papers: Cet4Paper[] = [
  {
    id: "cet4-2025-12-set-01",
    year: 2025,
    month: 12,
    setNumber: 1,
    title: "2025年12月英语四级真题(第1套)",
    pdfPath: "/papers/2025/12/cet4-2025-12-set-01.pdf",
    previewImagePath: "/previews/2025/12/cet4-2025-12-set-01.png"
  },
  {
    id: "cet4-2025-12-set-02",
    year: 2025,
    month: 12,
    setNumber: 2,
    title: "2025年12月英语四级真题(第2套)",
    pdfPath: "/papers/2025/12/cet4-2025-12-set-02.pdf",
    previewImagePath: "/previews/2025/12/cet4-2025-12-set-02.png"
  },
  {
    id: "cet4-2025-12-set-03",
    year: 2025,
    month: 12,
    setNumber: 3,
    title: "2025年12月英语四级真题(第3套)",
    pdfPath: "/papers/2025/12/cet4-2025-12-set-03.pdf",
    previewImagePath: "/previews/2025/12/cet4-2025-12-set-03.png"
  }
];

export type PaperSessionGroup = {
  id: string;
  label: string;
  year: number;
  month: 6 | 12;
  papers: Cet4Paper[];
};

export function groupPapersBySession(items: Cet4Paper[]): PaperSessionGroup[] {
  const sorted = [...items].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    if (a.month !== b.month) return b.month - a.month;
    return a.setNumber - b.setNumber;
  });

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
