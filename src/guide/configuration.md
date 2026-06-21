# 配置

Autable 的配置文件是 YAML。配置重点是两类路径：运行数据路径和 Git-managed repository 路径。

`config.yml` 是本地运行配置，可能包含 OIDC `client_secret` 等敏感信息，不应该提交进 Git repository。实际业务定义才放在 `repository.path` 指向的 Git 目录里。

## 基本结构

```yaml
server:
  address: "127.0.0.1:8080"

data:
  path: "./data"

repository:
  path: "./examples"

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
        redirect_url: "http://127.0.0.1:8080/api/auth/oidc/example/callback"
```

## server

`server.address` 是后端监听地址。嵌入前端后，同一个地址会服务 API 和 Web UI。

## data.path

`data.path` 是运行数据根目录。Autable 会从这个目录派生：

- `system.sqlite`：用户、权限、workflow/form 记录等系统数据。
- `leveldb`：row/workflow 历史记录。
- `<database>.sqlite`：每个业务数据库对应一个 SQLite 文件。

这比单独配置多个数据库路径更清晰，也更容易备份。

## repository.path

`repository.path` 指向用户管理的 Git 目录。这里保存业务结构和代码：

- `metadata/main.yml`
- `workflow/<database>/<workflow>.js`
- `form/<database>/<form>.js`

这些文件应该进入 Git。`config.yml` 和运行数据目录不应该进入 Git。

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
        redirect_url: "https://autable.example.com/api/auth/oidc/company/callback"
```

OIDC 登录会验证 ID token，并用 HttpOnly cookie 保存登录会话。

## 开发期规则

Autable 仍处于 demo/快速迭代阶段。当前规则是：

- breaking change 可以发生。
- 不为旧数据结构写兼容逻辑。
- 旧的生成数据需要手动删除，例如 `data/`、单个 SQLite 文件、LevelDB 目录。
- 必需配置缺失时应明确失败，不做静默 fallback。
