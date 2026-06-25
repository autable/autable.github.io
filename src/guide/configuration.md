# 配置

Autable 的配置文件是 YAML。配置重点是两类路径：运行数据路径和 Git-managed repository 路径。

`config.yml` 是本地运行配置，可能包含 OIDC `client_secret` 等敏感信息，不应该提交进 Git repository。实际业务定义才放在 `repository.path` 指向的 Git 目录里。

## 基本结构

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
    providers:
      - name: "example"
        display_name: "Example SSO"
        issuer_url: "https://issuer.example.com"
        client_id: "client-id"
        client_secret: "client-secret"

debug:
  pprof_address: ""
```

## server

`server.address` 是服务监听地址。Docker 部署时通常使用 `0.0.0.0:8080`，再通过端口映射或反向代理暴露给用户。同一个地址会服务 API 和 Web UI。

`server.public_url` 是用户访问 Autable 的外部 URL。启用 OIDC 时必须配置，例如：

```yaml
server:
  public_url: "https://autable.example.com"
```

Autable 会用它生成固定 OIDC callback URL：

```text
https://autable.example.com/api/auth/oidc/<provider>/callback
```

这个 URL 不会从请求头、反向代理协议或 `Host` 动态推断。

## data.path

`data.path` 是运行数据根目录。Autable 会从这个目录派生：

- `system.sqlite`：用户、权限、workflow/form 记录等系统数据。
- `leveldb`：row/workflow 历史记录。
- `<database>.sqlite`：每个业务数据库对应一个 SQLite 文件。

这比单独配置多个数据库路径更清晰，也更容易备份。

## repository

`repository.path` 指向 Autable 管理的 Git 工作目录。这里保存业务结构和代码：

- `metadata/main.yml`
- `workflow/<database>/<workflow>.js`
- `form/<database>/<form>.js`

这些文件应该进入 Git。`config.yml` 和运行数据目录不应该进入 Git。

Docker 部署时建议把 volume 挂到 `/repository`，再把 `repository.path` 设置为 `/repository/autable`。这样首次启动时目标目录不存在，Autable 可以自动 clone；不要把一个全新的空 volume 直接作为 `repository.path`。

`repository.remote_url` 和 `repository.remote_branch` 是必填项。启动时：

- 如果 `repository.path` 不存在，Autable 会先从 `repository.remote_url` clone。
- 如果远端 repository 是空的，Autable 会在本地初始化 `repository.remote_branch`，第一次本地变更会把这个分支 push 到远端。
- 如果 `repository.path` 已存在，它必须已经是 Git worktree；普通目录会让启动失败。

启动后，Autable 只做本地到远端的同步：保存 metadata、workflow、form 后，会自动合并短时间内的变更，commit 并 push 到 `repository.remote_branch`。Autable 不会自动 pull、fetch、merge 或 rebase 远端变更。

`repository.remote_url` 可以包含 HTTPS PAT，例如：

```yaml
repository:
  remote_url: "https://YOUR_PAT@github.com/example/autable-repository.git"
```

PAT 只用于认证。Autable 写入本地 Git config 时会去掉凭证，错误日志和同步状态也会对 URL 凭证做脱敏。

`repository.sync` 控制自动提交和推送：

- `debounce`：保存后等待多久再合并提交，默认 `2s`。
- `push_timeout`：一次 commit + push 的超时时间，默认 `30s`。
- `author_name` / `author_email`：自动 commit 的 Git author。

commit message 会列出本次合并窗口内的用户操作和涉及文件。Git author 使用上面的固定配置，具体用户写在 commit message body 中。

## backup

`backup` 配置定时备份运行数据到 S3-compatible 对象存储。启用后必须配置 `backup.s3.bucket`。

```yaml
backup:
  enabled: true
  interval: "24h"
  include_leveldb: true
  tmp_dir: ""
  s3:
    endpoint: "https://s3.example.com"
    region: "us-east-1"
    bucket: "autable-backups"
    prefix: "prod/"
    access_key_id: "..."
    secret_access_key: "..."
    force_path_style: true
```

- `interval`：两次备份之间的间隔，默认 `24h`。
- `include_leveldb`：是否把 `data.path/leveldb` 纳入备份，默认 `true`。
- `tmp_dir`：临时打包目录；为空时使用系统临时目录。
- `s3.endpoint`：S3-compatible 服务地址。使用 AWS S3 时可以留空。
- `s3.region`：S3 region，默认 `us-east-1`。
- `s3.bucket`：备份上传目标 bucket，启用备份时必填。
- `s3.prefix`：对象 key 前缀，用于区分环境或实例。
- `s3.access_key_id` / `s3.secret_access_key`：对象存储凭证。
- `s3.force_path_style`：MinIO、部分私有云 S3 服务通常需要设为 `true`。

备份包是 `.tar.gz`，包含 manifest、`system.sqlite`、每个业务数据库的 SQLite 文件，以及可选的 `leveldb/` 目录。

备份过程不需要停机。SQLite 使用 online backup API 导出一致快照；LevelDB 使用 snapshot 读取一致视图，再写成一个新的 LevelDB 目录放入备份包。也就是说，备份包内每个数据库自身是可恢复、内部一致的。

需要注意的是，当前备份不承诺所有存储严格来自同一个全局时间点。SQLite 和 LevelDB 的快照可能存在很小时间差；如果业务要求全系统事务级一致性，需要在应用层额外引入备份屏障。

## auth

Autable 支持密码登录和 OIDC 登录。

### 密码登录

```yaml
auth:
  password:
    enabled: true
```

启用后用户可以用邮箱和密码注册/登录。

### OIDC 登录

```yaml
auth:
  oidc:
    enabled: true
    providers:
      - name: "company"
        display_name: "Company SSO"
        issuer_url: "https://sso.example.com"
        client_id: "autable"
        client_secret: "..."
```

OIDC 登录会验证 ID token，并用 HttpOnly cookie 保存登录会话。OIDC provider 中配置的 redirect/callback URL 应该是 `server.public_url` 派生出的固定地址，例如 `https://autable.example.com/api/auth/oidc/company/callback`。

## debug

`debug.pprof_address` 用于启用 Go pprof 调试服务，默认空字符串表示关闭。

```yaml
debug:
  pprof_address: "0.0.0.0:6060"
```

启用后会开放 `/debug/pprof/`、`/debug/pprof/heap`、`/debug/pprof/profile` 等 Go pprof 端点。pprof 可能暴露运行时信息，只应该在排障时临时打开，并通过 Docker 端口映射或防火墙限制为内网/本机访问。

## 开发期规则

Autable 仍处于 demo/快速迭代阶段。当前规则是：

- breaking change 可以发生。
- 不为旧数据结构写兼容逻辑。
- 旧的生成数据需要手动删除，例如 `data/`、单个 SQLite 文件、LevelDB 目录。
- 必需配置缺失时应明确失败，不做静默 fallback。
