# 内容维护说明

## 新增一套真题时要做的事

1. 把 PDF 放到 `public/papers/<year>/<month>/`
2. 如果听力音频已经准备好，把音频放到 `public/audio/<year>/<month>/`
3. 在 `src/data/cet4.ts` 里新增一条记录
4. 运行 `npm run validate:content`
5. 运行 `npm run test`
6. 运行 `npm run build`

## 当前命名规范

- PDF：`cet4-<year>-<month>-set-<nn>.pdf`
- 音频：`cet4-<year>-<month>-set-<nn>.mp3`

## 当前 MVP 边界

- 当前先提供真题 PDF
- 听力音频入口后续逐步补齐
- 不提供答案版
- 不提供解析版
- 不提供批量下载

## 后续扩展方向

- 增加更多年份
- 在 `/papers` 页面增加批量下载入口
- 单独实现 `/vocabulary` 页面
