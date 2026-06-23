# 快速开始

本页使用 Docker 运行 Autable。启动前需要准备一个 Git repository，用来保存表结构、表单和工作流脚本。

## 环境要求

- Docker。
- 一个 Git 远端仓库地址。可以是空仓库。
- 如果远端仓库需要认证，准备一个可 push 的 HTTPS PAT。

## 准备配置

创建一个本地目录保存 Autable 的运行配置：

```sh
mkdir -p autable
cd autable
```

写入 `config.yml`：

```yaml
server:
  address: "0.0.0.0:8080"

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

auth:
  password:
    enabled: true
  oidc:
    enabled: false
    providers: []
```

`repository.remote_url` 和 `repository.remote_branch` 必须填写。`remote_url` 可以包含 HTTPS PAT；Autable 只把它用于认证，本地 Git config、错误日志和同步状态会对凭证脱敏。

## 启动

```sh
docker run --rm \
  --name autable \
  -p 8080:8080 \
  -v "$PWD/config.yml:/etc/autable/config.yml:ro" \
  -v autable-data:/data \
  -v autable-repository:/repository \
  ghcr.io/autable/autable:latest
```

打开 `http://127.0.0.1:8080`，使用密码登录注册第一个用户，然后创建数据库、表、字段、视图、工作流和表单。

第一次启动时，如果 `/repository/autable` 不存在，Autable 会先 clone `repository.remote_url`。如果远端 repository 是空的，Autable 会初始化本地分支，并在第一次保存业务定义后 push 到远端。

启动后 Autable 只把本地变更 commit + push 到远端，不会自动 pull、fetch、merge 或 rebase 远端变更。

## 保存什么

运行数据保存在 Docker volume `autable-data`，包括用户、权限、业务行数据和历史记录。

业务定义保存在 Docker volume `autable-repository` 下的 Git worktree，包括：

- `metadata/main.yml`
- `workflow/<database>/<workflow>.js`
- `form/<database>/<form>.js`

保存表结构、工作流或表单后，Autable 会 debounce 这些变更，自动 commit 并 push 到 `repository.remote_branch`。

## 下一步

- 阅读 [配置](./configuration.md) 理解 `data.path`、`repository.path` 和自动 Git 同步。
- 阅读 [仓库布局](./repository-layout.md) 理解 Git 管理哪些文件。
- 阅读 [表单](./forms.md) 和 [工作流](./workflows.md) 编写业务逻辑。
