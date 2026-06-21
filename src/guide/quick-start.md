# 快速开始

本页从源码运行 Autable。后续 release 会提供嵌入前端的单文件二进制。

## 环境要求

- Go 最新稳定版。
- Node.js 24。
- Git。
- SQLite 运行环境。

## 获取代码

```sh
git clone https://github.com/autable/autable.git
cd autable
```

## 安装前端依赖

```sh
cd web
npm install
cd ..
```

## 启动后端

示例配置位于 `examples/config.example.yml`。先复制成本地 `examples/config.yml`，再按需填写 OIDC secret 等运行配置。`config.yml` 不应该提交到 Git。

```sh
cp examples/config.example.yml examples/config.yml
go run ./cmd/autable -config examples/config.yml
```

第一次启动时，如果 repository 下没有 metadata，Autable 会创建基础文件。

## 启动前端开发服务器

```sh
cd web
npm run dev
```

默认开发服务器会代理后端 API。登录后可以创建数据库、表、字段、视图、工作流和表单。

## 构建嵌入式前端

Autable 支持把前端打包后嵌入 Go binary。

```sh
cd web
npm install
cd ..
./scripts/embed-web.sh
go build -o autable ./cmd/autable
```

生成的 `autable` binary 会同时服务 API 和前端页面。

## 验证

后端：

```sh
go test ./...
```

前端：

```sh
cd web
npm test
npm run build
npm run e2e
```

## 下一步

- 阅读 [配置](./configuration.md) 理解 `data.path` 和 `repository.path`。
- 阅读 [仓库布局](./repository-layout.md) 理解 Git 管理哪些文件。
- 阅读 [表单](./forms.md) 和 [工作流](./workflows.md) 编写业务逻辑。
