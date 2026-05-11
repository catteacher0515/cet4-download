# 四级真题工具站 MVP 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 从当前空仓库出发，搭建一个基于 Astro 的四级真题工具站 MVP，包含首页、真题下载页、关于页、隐藏的高频词汇预留页，以及一套可验证的真题数据与资源校验流程。

**Architecture:** 站点采用 Astro 静态站结构，页面和内容数据分离。真题资源放在 `public/` 下，真题元数据放在 `src/data/cet4.ts`，页面通过共享布局和卡片组件渲染；构建前先跑资源校验，测试层同时覆盖数据结构和产出后的静态页面 HTML。

**Tech Stack:** Astro、TypeScript、Node.js 内置测试、`tsx`

---

## 文件结构

### 新建文件

- `package.json`：项目脚本与依赖
- `.gitignore`：忽略构建产物与依赖目录
- `astro.config.mjs`：Astro 基础配置
- `tsconfig.json`：TypeScript 配置
- `src/env.d.ts`：Astro 类型声明
- `src/styles/global.css`：全站基础视觉样式
- `src/data/cet4.ts`：真题数据模型、示例数据、分组函数
- `src/layouts/BaseLayout.astro`：全站布局与导航
- `src/components/PaperCard.astro`：真题卡片组件
- `src/pages/index.astro`：首页
- `src/pages/papers.astro`：真题下载页
- `src/pages/about.astro`：关于页
- `src/pages/vocabulary.astro`：高频词汇预留页
- `scripts/validate-content.ts`：构建前资源校验脚本
- `tests/cet4-data.test.ts`：数据与分组测试
- `tests/site-build.test.ts`：构建产物页面测试
- `docs/content-maintenance.md`：后续新增年份时的维护说明

### 运行时需要额外放入的资源文件

- `public/papers/2025/12/cet4-2025-12-set-01.pdf`
- `public/audio/2025/12/cet4-2025-12-set-01.mp3`

### 说明

- 当前目录还不是 git 仓库，所以计划的第一步会先执行 `git init`
- `高频词汇` 页面在 MVP 中保留路由，但默认不出现在导航中
- MVP 只落一套演示真题，先把数据结构、页面结构、验证链路跑通

### Task 1: 初始化仓库与 Astro 基础骨架

**Files:**
- Create: `.gitignore`
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `src/env.d.ts`
- Create: `src/pages/index.astro`

- [ ] **Step 1: 初始化 git 仓库**

Run:

```bash
git init -b main
```

Expected: 输出 `Initialized empty Git repository` 或等价成功信息。

- [ ] **Step 2: 初始化 npm 工程并安装基础依赖**

Run:

```bash
npm init -y
npm install astro
npm install -D typescript tsx
```

Expected: 当前目录生成 `package.json` 和 `package-lock.json`，终端输出安装成功信息且无 `ERR!`。

- [ ] **Step 3: 写入基础忽略规则**

Create `.gitignore`:

```gitignore
node_modules
dist
.astro
.DS_Store
.superpowers
```

- [ ] **Step 4: 写入 Astro 和 TypeScript 基础配置**

Create `astro.config.mjs`:

```js
import { defineConfig } from "astro/config";

export default defineConfig({});
```

Create `tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

Create `src/env.d.ts`:

```ts
/// <reference types="astro/client" />
```

- [ ] **Step 5: 配置脚本并放一个最小首页，确保构建链路先打通**

Modify `package.json` to:

```json
{
  "name": "cet4-download",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "tsx --test tests/**/*.test.ts",
    "validate:content": "tsx scripts/validate-content.ts",
    "check": "astro check && npm run test"
  },
  "dependencies": {
    "astro": "^5.0.0"
  },
  "devDependencies": {
    "tsx": "^4.0.0",
    "typescript": "^5.0.0"
  }
}
```

Create `src/pages/index.astro`:

```astro
---
---

<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>四级真题工具站</title>
  </head>
  <body>
    <main>
      <h1>四级真题工具站</h1>
      <p>基础骨架已创建，后续任务会替换成正式页面。</p>
    </main>
  </body>
</html>
```

- [ ] **Step 6: 跑一次基础构建**

Run:

```bash
npm run build
```

Expected: 终端出现 `build completed` 或等价成功信息，`dist/index.html` 已生成。

- [ ] **Step 7: 提交基础骨架**

Run:

```bash
git add .gitignore package.json package-lock.json astro.config.mjs tsconfig.json src/env.d.ts src/pages/index.astro
git commit -m "chore: bootstrap astro site"
```

Expected: 生成第一条提交记录。

### Task 2: 建立真题数据模型、资源目录和构建前校验

**Files:**
- Create: `src/data/cet4.ts`
- Create: `scripts/validate-content.ts`
- Create: `tests/cet4-data.test.ts`
- Create: `public/papers/2025/12/cet4-2025-12-set-01.pdf`
- Create: `public/audio/2025/12/cet4-2025-12-set-01.mp3`
- Modify: `package.json`

- [ ] **Step 1: 先写失败的数据测试**

Create `tests/cet4-data.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { access } from "node:fs/promises";
import { resolve } from "node:path";
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

test("每条真题记录都指向存在的 PDF 和音频文件", async () => {
  for (const paper of papers) {
    await access(resolve(rootDir, "public", paper.pdfPath.replace(/^\//, "")));
    await access(resolve(rootDir, "public", paper.audioPath.replace(/^\//, "")));
  }
});
```

- [ ] **Step 2: 运行测试，确认当前失败**

Run:

```bash
npm run test -- tests/cet4-data.test.ts
```

Expected: FAIL，报错原因应为 `Cannot find module '../src/data/cet4'` 或资源文件不存在。

- [ ] **Step 3: 写入真题数据模型和分组函数**

Create `src/data/cet4.ts`:

```ts
export type Cet4Paper = {
  id: string;
  year: number;
  month: 6 | 12;
  setNumber: number;
  title: string;
  pdfPath: string;
  audioPath: string;
  audioDuration: string;
};

export const papers: Cet4Paper[] = [
  {
    id: "cet4-2025-12-set-01",
    year: 2025,
    month: 12,
    setNumber: 1,
    title: "2025 年 12 月四级真题（第 1 套）",
    pdfPath: "/papers/2025/12/cet4-2025-12-set-01.pdf",
    audioPath: "/audio/2025/12/cet4-2025-12-set-01.mp3",
    audioDuration: "14:28"
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
```

- [ ] **Step 4: 写入构建前资源校验脚本**

Create `scripts/validate-content.ts`:

```ts
import { access } from "node:fs/promises";
import { resolve } from "node:path";
import { papers } from "../src/data/cet4";

const publicDir = resolve(process.cwd(), "public");

async function main() {
  for (const paper of papers) {
    const pdfPath = resolve(publicDir, paper.pdfPath.replace(/^\//, ""));
    const audioPath = resolve(publicDir, paper.audioPath.replace(/^\//, ""));

    await access(pdfPath);
    await access(audioPath);
  }

  console.log(`validated ${papers.length} paper record(s)`);
}

main().catch((error) => {
  console.error("content validation failed");
  console.error(error);
  process.exit(1);
});
```

Modify `package.json` scripts to:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "tsx --test tests/**/*.test.ts",
    "validate:content": "tsx scripts/validate-content.ts",
    "prebuild": "npm run validate:content",
    "check": "astro check && npm run test"
  }
}
```

- [ ] **Step 5: 放入真实的演示资源文件**

Copy your real demo assets to:

```text
public/papers/2025/12/cet4-2025-12-set-01.pdf
public/audio/2025/12/cet4-2025-12-set-01.mp3
```

Expected: 这两个文件路径真实存在。此步不要放占位文本文件，直接放后续要在站上使用的真实资源。

- [ ] **Step 6: 重新运行数据测试并验证通过**

Run:

```bash
npm run test -- tests/cet4-data.test.ts
npm run validate:content
```

Expected: 测试通过；校验脚本输出 `validated 1 paper record(s)`。

- [ ] **Step 7: 提交数据与校验基础**

Run:

```bash
git add package.json package-lock.json src/data/cet4.ts scripts/validate-content.ts tests/cet4-data.test.ts public/papers public/audio
git commit -m "feat: add paper data and content validation"
```

Expected: 生成第二条提交记录。

### Task 3: 搭建共享布局、全局样式与首页/关于页/预留页

**Files:**
- Create: `src/styles/global.css`
- Create: `src/layouts/BaseLayout.astro`
- Modify: `src/pages/index.astro`
- Create: `src/pages/about.astro`
- Create: `src/pages/vocabulary.astro`

- [ ] **Step 1: 先写页面构建结果测试**

Append to `tests/site-build.test.ts`:

```ts
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
```

- [ ] **Step 2: 运行页面测试，确认当前失败**

Run:

```bash
npm run test -- tests/site-build.test.ts
```

Expected: FAIL，原因应为首页文案或 `dist/about/index.html` 不存在。

- [ ] **Step 3: 写入全局样式**

Create `src/styles/global.css`:

```css
:root {
  --bg: #f6f1e8;
  --panel: rgba(255, 251, 245, 0.96);
  --ink: #1f1b17;
  --muted: #6f6455;
  --line: rgba(74, 56, 29, 0.12);
  --accent: #a25033;
  --accent-dark: #1f1d19;
  --max-width: 1180px;
  color-scheme: light;
}

* {
  box-sizing: border-box;
}

html {
  font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  background: #f4eee4;
  color: var(--ink);
}

body {
  margin: 0;
  min-width: 320px;
  background:
    radial-gradient(circle at top left, rgba(220, 182, 140, 0.18), transparent 24%),
    linear-gradient(180deg, #fbf7f0 0%, #f5eee3 100%);
}

a {
  color: inherit;
  text-decoration: none;
}

img {
  display: block;
  max-width: 100%;
}

.site-shell {
  width: min(var(--max-width), calc(100% - 32px));
  margin: 24px auto 48px;
  background: var(--panel);
  border: 1px solid rgba(74, 56, 29, 0.08);
  border-radius: 28px;
  box-shadow: 0 22px 60px rgba(60, 42, 20, 0.08);
  overflow: hidden;
}

.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 22px 28px;
  border-bottom: 1px solid var(--line);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}

.brand-mark {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 6px rgba(162, 80, 51, 0.12);
}

.site-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.site-nav a {
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid var(--line);
  font-size: 14px;
  color: var(--muted);
}

.site-nav a[aria-current="page"] {
  background: var(--accent-dark);
  color: #fff8ef;
  border-color: var(--accent-dark);
}

.page-section {
  padding: 28px;
}

.hero-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 24px;
}

.hero-title {
  margin: 0 0 12px;
  font-size: clamp(2.4rem, 5vw, 4.4rem);
  line-height: 0.98;
  letter-spacing: -0.04em;
}

.hero-copy,
.page-copy {
  margin: 0;
  color: var(--muted);
  line-height: 1.8;
  font-size: 16px;
}

.panel {
  padding: 22px;
  background: rgba(255, 253, 249, 0.82);
  border: 1px solid var(--line);
  border-radius: 22px;
}

.entry-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-top: 22px;
}

.entry-card {
  padding: 18px;
  border-radius: 20px;
  border: 1px solid var(--line);
  background: rgba(245, 237, 225, 0.58);
}

.entry-card h2,
.section-title,
.page-title {
  margin: 0 0 10px;
}

.section-title,
.page-title {
  font-size: 32px;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 18px;
  margin-top: 18px;
}

.site-footer {
  padding: 20px 28px 28px;
  color: var(--muted);
  font-size: 13px;
}

@media (max-width: 860px) {
  .site-shell {
    width: min(var(--max-width), calc(100% - 20px));
    margin-top: 12px;
  }

  .site-header,
  .page-section,
  .site-footer {
    padding-left: 18px;
    padding-right: 18px;
  }

  .hero-grid,
  .entry-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 4: 写入共享布局**

Create `src/layouts/BaseLayout.astro`:

```astro
---
import "../styles/global.css";

type NavItem = {
  href: string;
  label: string;
};

interface Props {
  title: string;
  description: string;
  pathname: string;
}

const { title, description, pathname } = Astro.props;

const navItems: NavItem[] = [
  { href: "/", label: "首页" },
  { href: "/papers", label: "真题下载" },
  { href: "/about", label: "关于本站" }
];
---

<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
  </head>
  <body>
    <div class="site-shell">
      <header class="site-header">
        <div class="brand">
          <span class="brand-mark"></span>
          <span>CET-4 TOOL SITE</span>
        </div>

        <nav class="site-nav" aria-label="主导航">
          {navItems.map((item) => (
            <a href={item.href} aria-current={pathname === item.href ? "page" : undefined}>
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <main>
        <slot />
      </main>

      <footer class="site-footer">
        不登录，不跳网盘，直接提供真题 PDF 与对应听力音频。
      </footer>
    </div>
  </body>
</html>
```

- [ ] **Step 5: 写入正式首页、关于页和高频词汇预留页**

Replace `src/pages/index.astro` with:

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import { papers } from "../data/cet4";

const latestPaper = papers[0];
---

<BaseLayout
  title="四级真题工具站"
  description="提供四级真题 PDF 直接下载与听力在线播放。"
  pathname="/"
>
  <section class="page-section hero-grid">
    <div>
      <h1 class="hero-title">四级真题，直接下载。</h1>
      <p class="hero-copy">
        不登录，不跳网盘，不做无关拦截。这个站点只做一件事：让你更快拿到四级真题 PDF，并在当前页面直接播放对应听力。
      </p>
    </div>

    <div class="panel">
      <h2 class="section-title">站点承诺</h2>
      <p class="page-copy">
        首页负责给你入口，真题下载页负责让你直接完成操作。后续如果扩展高频词汇，也会作为独立页面存在，不混进下载流程里。
      </p>
    </div>
  </section>

  <section class="page-section">
    <div class="entry-grid">
      <a class="entry-card" href="/papers">
        <h2>真题下载</h2>
        <p class="page-copy">按年份与套数查看真题，在卡片中直接播放听力并下载 PDF。</p>
      </a>

      <a class="entry-card" href="/about">
        <h2>关于本站</h2>
        <p class="page-copy">查看站点定位、维护方式和后续会扩展的方向。</p>
      </a>
    </div>
  </section>

  <section class="page-section">
    <h2 class="section-title">最新真题预览</h2>
    <div class="preview-grid">
      <article class="entry-card">
        <h2>{latestPaper.title}</h2>
        <p class="page-copy">当前演示资源：{latestPaper.audioDuration} 听力音频 + 真题 PDF 下载。</p>
      </article>
    </div>
  </section>
</BaseLayout>
```

Create `src/pages/about.astro`:

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
---

<BaseLayout
  title="关于本站"
  description="了解四级真题工具站的定位与维护方式。"
  pathname="/about"
>
  <section class="page-section">
    <h1 class="page-title">关于本站</h1>
    <p class="page-copy">
      这个站点的目标不是做复杂功能，而是把四级真题 PDF 和对应听力音频以最少阻力交给用户。
    </p>
  </section>

  <section class="page-section">
    <div class="panel">
      <h2 class="section-title">维护方式</h2>
      <p class="page-copy">
        每年新增 6 月和 12 月资料时，只需要补资源文件和一条真题记录。后续如新增高频词汇，会用独立页面承载。
      </p>
    </div>
  </section>
</BaseLayout>
```

Create `src/pages/vocabulary.astro`:

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
---

<BaseLayout
  title="高频词汇"
  description="四级高频词汇页面预留。"
  pathname="/vocabulary"
>
  <section class="page-section">
    <h1 class="page-title">高频词汇</h1>
    <p class="page-copy">
      这个页面在 MVP 阶段只做路由预留，等有真实内容后再加入正式导航。
    </p>
  </section>
</BaseLayout>
```

- [ ] **Step 6: 运行页面测试并确认通过**

Run:

```bash
npm run test -- tests/site-build.test.ts
```

Expected: PASS，`dist/index.html` 和 `dist/about/index.html` 都存在且包含预期文案。

- [ ] **Step 7: 提交共享布局与基础页面**

Run:

```bash
git add src/styles/global.css src/layouts/BaseLayout.astro src/pages/index.astro src/pages/about.astro src/pages/vocabulary.astro tests/site-build.test.ts
git commit -m "feat: add shared layout and entry pages"
```

Expected: 生成第三条提交记录。

### Task 4: 实现真题卡片组件与真题下载页

**Files:**
- Create: `src/components/PaperCard.astro`
- Create: `src/pages/papers.astro`
- Modify: `src/styles/global.css`
- Modify: `tests/site-build.test.ts`

- [ ] **Step 1: 先写失败的真题页测试**

Append to `tests/site-build.test.ts`:

```ts
test("真题下载页输出音频播放器和 PDF 下载链接", () => {
  execSync("npm run build", { stdio: "pipe" });

  const papersHtml = readFileSync(resolve(process.cwd(), "dist/papers/index.html"), "utf8");

  assert.match(papersHtml, /2025 年 12 月/);
  assert.match(papersHtml, /播放听力/);
  assert.match(papersHtml, /下载 PDF/);
  assert.match(papersHtml, /audio\/2025\/12\/cet4-2025-12-set-01\.mp3/);
  assert.match(papersHtml, /papers\/2025\/12\/cet4-2025-12-set-01\.pdf/);
});
```

- [ ] **Step 2: 运行真题页测试，确认当前失败**

Run:

```bash
npm run test -- tests/site-build.test.ts
```

Expected: FAIL，原因应为 `dist/papers/index.html` 不存在。

- [ ] **Step 3: 写入真题卡片组件**

Create `src/components/PaperCard.astro`:

```astro
---
import type { Cet4Paper } from "../data/cet4";

interface Props {
  paper: Cet4Paper;
}

const { paper } = Astro.props;
---

<article class="paper-card">
  <div class="paper-card__sheet" aria-hidden="true"></div>

  <div class="paper-card__body">
    <div class="paper-card__head">
      <div>
        <p class="paper-card__eyebrow">SET {String(paper.setNumber).padStart(2, "0")}</p>
        <h2 class="paper-card__title">第 {paper.setNumber} 套</h2>
      </div>
      <span class="paper-card__badge">READY</span>
    </div>

    <p class="paper-card__meta">{paper.title}</p>

    <div class="paper-card__audio">
      <div class="paper-card__audio-head">
        <span>听力播放器</span>
        <span>{paper.audioDuration}</span>
      </div>

      <audio controls preload="none" style="width: 100%;">
        <source src={paper.audioPath} type="audio/mpeg" />
        你的浏览器暂不支持音频播放，请直接下载后使用。
      </audio>
    </div>

    <div class="paper-card__actions">
      <a class="paper-card__button paper-card__button--secondary" href={paper.audioPath}>
        播放听力
      </a>
      <a class="paper-card__button paper-card__button--primary" href={paper.pdfPath} download>
        下载 PDF
      </a>
    </div>
  </div>
</article>
```

- [ ] **Step 4: 写入真题下载页**

Create `src/pages/papers.astro`:

```astro
---
import PaperCard from "../components/PaperCard.astro";
import { groupPapersBySession, papers } from "../data/cet4";
import BaseLayout from "../layouts/BaseLayout.astro";

const groups = groupPapersBySession(papers);
---

<BaseLayout
  title="真题下载"
  description="按年份查看四级真题，直接播放听力并下载 PDF。"
  pathname="/papers"
>
  <section class="page-section">
    <h1 class="page-title">真题下载</h1>
    <p class="page-copy">
      按年份和套数整理。每张卡片内直接完成两件事：播放听力、下载 PDF。
    </p>
  </section>

  {groups.map((group) => (
    <section class="page-section">
      <div class="papers-section__head">
        <h2 class="section-title">{group.label}</h2>
        <p class="page-copy">{group.papers.length} 套真题</p>
      </div>

      <div class="papers-grid">
        {group.papers.map((paper) => (
          <PaperCard paper={paper} />
        ))}
      </div>
    </section>
  ))}

  <section class="page-section">
    <div class="panel">
      <p class="page-copy">
        MVP 边界：当前只提供真题 PDF 和对应听力音频，不包含答案版、解析版和批量下载。
      </p>
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 5: 补充真题页样式**

Append to `src/styles/global.css`:

```css
.papers-section__head {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 16px;
  margin-bottom: 18px;
}

.papers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.paper-card {
  border-radius: 24px;
  border: 1px solid var(--line);
  background: linear-gradient(180deg, rgba(255, 252, 247, 0.98), rgba(248, 242, 232, 0.98));
  overflow: hidden;
}

.paper-card__sheet {
  min-height: 180px;
  background:
    linear-gradient(180deg, rgba(244, 235, 221, 0.56), rgba(255, 252, 247, 0.2)),
    repeating-linear-gradient(
      180deg,
      rgba(74, 56, 29, 0.03) 0,
      rgba(74, 56, 29, 0.03) 1px,
      transparent 1px,
      transparent 18px
    );
}

.paper-card__body {
  padding: 20px;
}

.paper-card__head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: start;
}

.paper-card__eyebrow {
  margin: 0 0 8px;
  color: var(--muted);
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.paper-card__title {
  margin: 0;
  font-size: 36px;
  line-height: 1;
}

.paper-card__badge {
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(162, 80, 51, 0.28);
  color: var(--accent);
  font-size: 12px;
}

.paper-card__meta {
  margin: 12px 0 16px;
  color: var(--muted);
  line-height: 1.75;
}

.paper-card__audio {
  margin-bottom: 16px;
  padding: 14px;
  border-radius: 16px;
  background: rgba(242, 233, 220, 0.72);
  border: 1px solid rgba(74, 56, 29, 0.08);
}

.paper-card__audio-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  color: #574d40;
  font-size: 14px;
}

.paper-card__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.paper-card__button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  min-height: 48px;
  border-radius: 14px;
  font-weight: 700;
}

.paper-card__button--secondary {
  border: 1px solid var(--line);
  background: rgba(255, 252, 247, 0.98);
  color: var(--ink);
}

.paper-card__button--primary {
  background: var(--accent-dark);
  color: #fff8ef;
}

@media (max-width: 560px) {
  .papers-section__head,
  .paper-card__actions {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 6: 运行页面测试并确认真题页通过**

Run:

```bash
npm run test -- tests/site-build.test.ts
```

Expected: PASS；`dist/papers/index.html` 包含年份标题、音频资源路径和 PDF 下载链接。

- [ ] **Step 7: 提交真题页实现**

Run:

```bash
git add src/components/PaperCard.astro src/pages/papers.astro src/styles/global.css tests/site-build.test.ts
git commit -m "feat: add papers page and paper card"
```

Expected: 生成第四条提交记录。

### Task 5: 补充维护文档并完成最终验收

**Files:**
- Create: `docs/content-maintenance.md`
- Modify: `tests/site-build.test.ts`

- [ ] **Step 1: 为维护说明写一个失败的内容断言**

Append to `tests/site-build.test.ts`:

```ts
test("首页会强调真题下载与后续高频词汇扩展方向", () => {
  execSync("npm run build", { stdio: "pipe" });

  const homeHtml = readFileSync(resolve(process.cwd(), "dist/index.html"), "utf8");

  assert.match(homeHtml, /真题下载/);
  assert.match(homeHtml, /关于本站/);
});
```

- [ ] **Step 2: 运行最终页面测试，确认当前仍然通过**

Run:

```bash
npm run test -- tests/site-build.test.ts
```

Expected: PASS；这一步是锁定首页作为站点入口的定位。

- [ ] **Step 3: 写入后续维护说明文档**

Create `docs/content-maintenance.md`:

```md
# 内容维护说明

## 新增一套真题时要做的事

1. 把 PDF 放到 `public/papers/<year>/<month>/`
2. 把音频放到 `public/audio/<year>/<month>/`
3. 在 `src/data/cet4.ts` 里新增一条记录
4. 运行 `npm run validate:content`
5. 运行 `npm run test`
6. 运行 `npm run build`

## 当前命名规范

- PDF：`cet4-<year>-<month>-set-<nn>.pdf`
- 音频：`cet4-<year>-<month>-set-<nn>.mp3`

## 当前 MVP 边界

- 只提供真题 PDF
- 只提供对应听力音频
- 不提供答案版
- 不提供解析版
- 不提供批量下载

## 后续扩展方向

- 增加更多年份
- 在 `/papers` 页面增加批量下载入口
- 单独实现 `/vocabulary` 页面
```

- [ ] **Step 4: 跑完整验收链路**

Run:

```bash
npm run validate:content
npm run test
npm run build
```

Expected: 三个命令全部通过；`dist/` 下至少存在 `index.html`、`about/index.html`、`papers/index.html`、`vocabulary/index.html`。

- [ ] **Step 5: 提交维护文档和最终验收状态**

Run:

```bash
git add docs/content-maintenance.md tests/site-build.test.ts
git commit -m "docs: add maintenance guide for paper updates"
```

Expected: 生成第五条提交记录。

## 计划自检

### Spec 覆盖

- 多页面结构：Task 3、Task 4
- 首页作为入口页：Task 3
- 真题下载页作为核心操作页：Task 4
- 高频词汇预留页：Task 3
- 真题数据与资源目录分离：Task 2
- 音频播放与 PDF 下载两个独立动作：Task 4
- MVP 只做一套演示真题：Task 2、Task 4
- 构建前校验与最小测试闭环：Task 2、Task 5
- 后续维护方式沉淀：Task 5

### Placeholder 扫描

- 计划中没有 `TODO`、`TBD`、`implement later` 之类占位语句
- 每个需要改代码的步骤都给了明确文件和代码内容
- 每个执行步骤都给了可直接运行的命令与预期结果

### 类型一致性

- 真题类型统一使用 `Cet4Paper`
- 分组函数统一使用 `groupPapersBySession`
- 页面统一从 `src/data/cet4.ts` 读取数据

