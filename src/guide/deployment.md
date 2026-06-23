# 部署与发布

Autable 可以作为单文件 Go binary 分发，也可以在开发期分别运行后端和前端。

## 嵌入前端

```sh
cd web
npm install
cd ..
./scripts/embed-web.sh
go build -o autable ./cmd/autable
```

`embed-web.sh` 会把 `web/dist` 复制到 Go 的 embed 目录。随后编译出的 binary 会同时服务 API 和前端页面。

## 数据目录

生产环境需要明确备份 `data.path`：

- `system.sqlite`
- 每个 `<database>.sqlite`
- `leveldb`

这些是运行数据，不应该提交到 Git。

## Repository 同步

`repository.path` 是 Autable 管理的 Git 工作目录，保存：

- `metadata/main.yml`
- `workflow/<database>/<workflow>.js`
- `form/<database>/<form>.js`

配置中必须提供：

```yaml
repository:
  path: "/repository"
  remote_url: "https://YOUR_PAT@github.com/example/autable-repository.git"
  remote_branch: "main"
  sync:
    debounce: "2s"
    push_timeout: "30s"
    author_name: "autable"
    author_email: "autable@example.local"
```

启动时，如果 `repository.path` 不存在，Autable 会先 clone `repository.remote_url`。如果远端 repository 完全为空，Autable 会初始化本地分支，并在第一次业务定义变更后 push 到远端。

运行后，Autable 会把 `metadata/`、`workflow/`、`form/` 的本地变更自动 commit + push 到 `repository.remote_branch`。它不会自动 pull 或 rebase 远端变更；如果远端发生了外部写入，需要人工处理后再恢复自动推送。

`config.yml` 是本地运行配置，可能包含 OIDC `client_secret`，应该放在部署环境自己的配置路径里，不要提交到 repository。

## Release 规则

项目 release 通过 Git tag 表示版本。正常推送 `main` 会创建下一个 patch tag 和 GitHub Release，不会把版本号提交回 `main`。

发布产物目标平台：

- Linux amd64
- Linux arm64
- Windows amd64
- macOS arm64

## 运行服务

```sh
./autable -config /path/to/config.yml
```

将 `server.address` 放到反向代理后时，需要同步配置 OIDC provider 的 redirect URL。
