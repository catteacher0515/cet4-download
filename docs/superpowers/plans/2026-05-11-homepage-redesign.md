# Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把首页改成极简入口页，只保留价值说明、唯一主按钮和轻量最近更新信息条。

**Architecture:** 继续沿用 Astro 静态页面结构，不拆组件，只修改首页模板、首页样式和构建测试断言。最近更新继续复用 `papers[0]`，避免新增数据层复杂度。

**Tech Stack:** Astro, TypeScript, Node test runner, global CSS

---

### Task 1: 更新首页构建断言

**Files:**
- Modify: `tests/site-build.test.ts`

- [ ] **Step 1: 写出新的首页断言**

期望首页构建产物包含：

- `四级真题`
- `直接下载`
- `进入真题下载页`
- `最近更新`
- `查看最新真题`

并且不再包含：

- `站点承诺`
- `最新真题预览`

- [ ] **Step 2: 运行测试并确认首页断言先失败**

Run: `npm run test -- tests/site-build.test.ts`

- [ ] **Step 3: 记录失败原因**

预期失败原因：首页仍然输出旧的 Hero 与旧区块文案。

### Task 2: 实现首页新结构

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: 删除旧首页区块**

移除：

- `站点承诺`
- `真题下载 / 关于本站` 双入口卡片
- `最新真题预览`

- [ ] **Step 2: 写入新的首页结构**

保留：

- 双行标题
- 一段副文案
- 一个主按钮
- 最近更新信息条

### Task 3: 实现首页样式

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: 删除首页对旧网格结构的依赖**

降低 `hero-grid`、`entry-grid`、`preview-grid` 对首页的主导作用。

- [ ] **Step 2: 新增首页专用样式**

补充：

- 首页首屏容器
- 双行标题
- 主按钮
- 最近更新信息条

### Task 4: 完整校验

**Files:**
- Modify: `tests/site-build.test.ts`
- Modify: `src/pages/index.astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: 运行首页定向测试**

Run: `npm run test -- tests/site-build.test.ts`

- [ ] **Step 2: 运行全量测试**

Run: `npm run test`

- [ ] **Step 3: 运行构建**

Run: `npm run build`
