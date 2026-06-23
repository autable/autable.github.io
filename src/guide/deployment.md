# 部署

生产环境推荐使用 Docker 镜像运行 Autable。镜像内包含后端和已经构建好的前端，容器内默认配置路径是 `/etc/autable/config.yml`。

## Docker 运行

准备部署目录：

```sh
mkdir -p /opt/autable
cd /opt/autable
```

创建 `/opt/autable/config.yml`：

```yaml
server:
  address: "0.0.0.0:8080"
  public_url: "https://autable.example.com"

data:
  path: "/data"

repository:
  path: "/repository/autable"
  remote_url: "https://YOUR_PAT@github.com/example/autable-repository.git"
  remote_branch: "main"
  sync:
    debounce: "2s"
    push_timeout: "30s"
    author_name: "autable"
    author_email: "autable@example.local"

backup:
  enabled: true
  interval: "24h"
  include_leveldb: true
  s3:
    endpoint: "https://s3.example.com"
    region: "us-east-1"
    bucket: "autable-backups"
    prefix: "prod/"
    access_key_id: "..."
    secret_access_key: "..."
    force_path_style: true

auth:
  password:
    enabled: true
  oidc:
    enabled: false
    providers: []
```

启动容器：

```sh
docker run -d \
  --name autable \
  --restart unless-stopped \
  -p 8080:8080 \
  -v /opt/autable/config.yml:/etc/autable/config.yml:ro \
  -v autable-data:/data \
  -v autable-repository:/repository \
  ghcr.io/autable/autable:latest
```

将服务放到反向代理后时，`server.public_url` 必须填写用户实际访问的外部 HTTPS 地址。启用 OIDC 时，Autable 会用它生成固定 callback URL，例如 `https://autable.example.com/api/auth/oidc/dingtalk/callback`，不会从反向代理请求头动态推断。

## 数据目录

生产环境需要备份 `data.path` 指向的目录。Docker 部署中它对应 volume `autable-data`，包含：

- `system.sqlite`
- 每个 `<database>.sqlite`
- `leveldb`

这些是运行数据，不应该提交到 Git。

## 备份

生产环境建议启用内置 S3-compatible 备份，而不是只依赖宿主机 volume 快照。

```yaml
backup:
  enabled: true
  interval: "24h"
  include_leveldb: true
  s3:
    endpoint: "https://s3.example.com"
    region: "us-east-1"
    bucket: "autable-backups"
    prefix: "prod/"
    access_key_id: "..."
    secret_access_key: "..."
    force_path_style: true
```

Autable 会定时生成 `.tar.gz` 备份包并上传到对象存储。备份包包含 manifest、`system.sqlite`、每个业务数据库的 SQLite 文件，以及可选的 `leveldb/`。

备份不需要停机：

- SQLite 通过 online backup API 导出一致快照。
- LevelDB 通过 snapshot 读取一致视图，再写出一个新的 LevelDB 目录。

因此，备份包中的每个数据库自身是可恢复、内部一致的。当前备份不承诺 SQLite 和 LevelDB 严格来自同一个全局时间点；两者之间可能存在很小时间差。

如果没有启用内置备份，也需要对 `data.path` 指向的 Docker volume 做外部备份。外部直接拷贝运行中的数据文件时，要确保快照工具能提供文件系统级一致性。

## Repository 同步

`repository.path` 是 Autable 管理的 Git 工作目录。Docker 部署中建议把 volume 挂到 `/repository`，再把 `repository.path` 设置为 `/repository/autable`，这样首次启动时目标目录不存在，Autable 可以自动 clone 或初始化空远端。

这里保存：

- `metadata/main.yml`
- `workflow/<database>/<workflow>.js`
- `form/<database>/<form>.js`

`repository.remote_url` 和 `repository.remote_branch` 必须提供。启动时，如果 `repository.path` 不存在，Autable 会先 clone `repository.remote_url`。如果远端 repository 完全为空，Autable 会初始化本地分支，并在第一次业务定义变更后 push 到远端。

运行后，Autable 会把 `metadata/`、`workflow/`、`form/` 的本地变更自动 commit + push 到 `repository.remote_branch`。它不会自动 pull 或 rebase 远端变更；如果远端发生了外部写入，需要人工处理后再恢复自动推送。

`config.yml` 是本地运行配置，可能包含 OIDC `client_secret` 或 Git PAT，应该放在部署环境自己的配置路径里，不要提交到 repository。

## 镜像版本

快速试用可以使用：

```text
ghcr.io/autable/autable:latest
```

生产环境建议固定到 release tag，例如：

```text
ghcr.io/autable/autable:vX.Y.Z
```

## 自行构建镜像

需要从源码构建镜像时，在项目根目录运行：

```sh
docker build -t autable:local .
```

构建过程会先打包前端，再把静态资源嵌入后端 binary。
