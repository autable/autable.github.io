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

## Repository 目录

`repository.path` 应该是一个可提交的 Git 目录，保存：

- `config.yml`
- `metadata/main.yml`
- `workflow/<database>/<workflow>.js`
- `form/<database>/<form>.js`

推荐为这个目录建立常规 Git 备份流程。

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

