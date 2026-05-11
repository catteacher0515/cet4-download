# 内容维护说明

## 目标

这个站点后续最常见的维护动作，不是改页面，而是新增真题。

当前已经固定了两条维护链路：

- 单套导入：`准备 PDF -> 生成预览图 -> 补充数据 -> 校验 -> 构建 -> 发布`
- 半年三套批量导入：`准备 3 个 PDF -> 一次性生成 3 套资源 -> 自动写入 3 条数据 -> 校验 -> 构建 -> 发布`

## 目录与命名规范

### PDF

- 存放目录：`public/papers/<year>/<month>/`
- 文件名：`cet4-<year>-<month>-set-<nn>.pdf`

示例：

- `public/papers/2025/12/cet4-2025-12-set-01.pdf`
- `public/papers/2025/12/cet4-2025-12-set-02.pdf`
- `public/papers/2025/12/cet4-2025-12-set-03.pdf`

### 预览图

- 存放目录：`public/previews/<year>/<month>/`
- 文件名：`cet4-<year>-<month>-set-<nn>.png`

预览图使用 PDF 首页自动生成，不手工命名。

### 数据记录

数据文件：`src/data/cet4.ts`

每条记录当前至少需要：

- `id`
- `year`
- `month`
- `setNumber`
- `title`
- `pdfPath`
- `previewImagePath`

## 新增一套真题的标准步骤

### 1. 准备原始 PDF

先拿到单套真题的 PDF 文件。

例如本地有一个文件：

```bash
/absolute/path/to/source.pdf
```

### 2. 运行维护脚本

执行：

```bash
npm run prepare:paper -- 2026 6 1 /absolute/path/to/source.pdf
```

参数说明：

- 第 1 个参数：年份，例如 `2026`
- 第 2 个参数：月份，只能是 `6` 或 `12`
- 第 3 个参数：套数，只能是 `1`、`2`、`3`
- 第 4 个参数：原始 PDF 文件路径

这个脚本会自动完成两件事：

1. 把 PDF 复制到标准目录
2. 使用 `pdftoppm` 生成首页预览图

脚本执行成功后，会打印：

- 标准化后的 PDF 路径
- 标准化后的预览图路径
- 对应的 `id`
- 对应的 `title`

## 新增一个半年三套真题的标准步骤

如果你手上已经有同一个半年对应的 3 套 PDF，更推荐直接走批量导入。

执行：

```bash
npm run prepare:session -- 2026 12 /absolute/path/to/set-1.pdf /absolute/path/to/set-2.pdf /absolute/path/to/set-3.pdf
```

如果希望导入完成后自动顺手跑校验，也可以执行：

```bash
npm run prepare:session -- 2026 12 /absolute/path/to/set-1.pdf /absolute/path/to/set-2.pdf /absolute/path/to/set-3.pdf --verify
```

参数说明：

- 第 1 个参数：年份，例如 `2026`
- 第 2 个参数：月份，只能是 `6` 或 `12`
- 第 3-5 个参数：第 1、2、3 套 PDF 的原始路径
- 可选参数：`--verify`，导入完成后自动执行 `validate:content -> test -> build`

这个脚本会自动：

1. 把 3 套 PDF 复制到标准目录
2. 为 3 套 PDF 生成各自的首页预览图
3. 自动把 3 条记录写入 `src/data/cet4.ts`
4. 如果带了 `--verify`，自动顺序执行校验和构建

这个命令更符合真实维护场景，因为四级一个半年通常就是 3 套题一起补。

## 3. 补充数据记录

单套导入时，脚本不会直接改 `src/data/cet4.ts`，这里仍然需要人工补录。

你需要在 `papers` 数组中新增一条记录，格式参考：

```ts
{
  ...buildPaperAssetPaths(2026, 6, 1),
  year: 2026,
  month: 6,
  setNumber: 1
}
```

如果是通过 `prepare:session` 批量导入，脚本会直接自动写入 3 条记录。

## 4. 本地校验

如果没有使用 `--verify`，新增后按顺序执行：

```bash
npm run validate:content
npm run test
npm run build
```

这三个命令分别验证：

1. PDF 和预览图文件是否存在
2. 数据结构、分组和构建产物是否正常
3. 站点是否可以成功静态构建

## 5. 发布到 GitHub

确认页面正常后，再执行 git 提交和推送。

## 推荐维护顺序

四级每半年通常对应 3 套题，推荐默认使用：

```bash
npm run prepare:session -- <year> <month> <set1.pdf> <set2.pdf> <set3.pdf>
```

只有在你手上暂时只有单套 PDF 时，再退回 `prepare:paper`。

## 当前依赖

预览图生成依赖：

- `pdftoppm`

当前脚本使用的路径是：

```bash
/opt/homebrew/bin/pdftoppm
```

如果后续这台机器上的路径变化了，需要同步修改 `scripts/prepare-paper.ts`。

## 当前 MVP 边界

- 当前先提供真题 PDF 下载
- 当前提供试卷在线预览
- 听力音频后续再补
- 不提供答案版
- 不提供解析版
- 不提供批量下载

## 后续建议

维护流程跑顺之后，下一步最值得补的是：

1. 加上听力音频的资源准备流程
2. 支持“批量导入后自动跑校验”
3. 让 `prepare:paper` 单套模式也支持自动写入
