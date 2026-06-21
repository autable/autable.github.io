# Autable 官网

这是 Autable 的中文官网和文档站，基于 VitePress。

## 开发

```sh
npm install
npm run dev
```

## 构建

```sh
npm run build
```

构建产物位于 `docs/`。

## 部署

推送到 `main` 后，GitHub Actions 会构建 `docs/` 并部署到 GitHub Pages。

如果在 GitHub 仓库设置里手动配置 Pages 发布目录，请选择 `/docs`。
