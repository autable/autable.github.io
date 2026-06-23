# 仓库布局

Autable 把用户可维护的业务定义放在 Git repository 里。`config.yml` 是本地运行配置，可能包含 OIDC secret，不属于这个 Git repository。

启动时 Autable 会根据配置中的 `repository.remote_url` 和 `repository.remote_branch` 准备这个目录：目录不存在就 clone；远端为空时会初始化本地分支；目录已存在时必须是 Git worktree。

## 推荐结构

```text
repository.path/
  metadata/
    main.yml
  workflow/
    support/
      ticket_change_summary.js
      hourly_ticket_sync.js
  form/
    support/
      create_ticket.js
      query_contacts.js
```

## metadata

`metadata/main.yml` 定义数据库、表、字段和视图。

示例：

```yaml
databases:
  - name: support
    tables:
      - name: tickets
        display_name: 工单
        fields:
          - name: title
            type: string
          - name: status
            type: string
          - name: requester_email
            type: string
        views:
          - name: open
            display_name: 未完成
            query:
              combinator: and
              rules:
                - field: status
                  operator: "!="
                  value: done
```

字段顺序就是用户界面里的顺序。需要重排字段时，Autable 会修改 YAML 中的字段位置。

## workflow

workflow 文件按数据库分目录：

```text
workflow/<database>/<workflow>.js
```

这种布局是为了让人能直接看懂结构，而不是用不可读 ID 管理文件。

## form

form 文件按数据库分目录：

```text
form/<database>/<form>.js
```

表单可以是提交模式、查询模式，也可以结合扫码输入自动触发动作。

## data 与 repository 分离

运行数据保存在 `data.path`，不要提交到 Git。

Git repository 保存的是人会维护的结构和代码。`config.yml`、SQLite、LevelDB、session、历史记录不属于这个目录。

## 自动同步

保存 metadata、workflow 或 form 后，Autable 会自动 commit 并 push 这些目录：

```text
metadata/
workflow/
form/
```

Autable 不会执行 `git add .`，因此 repository 根目录下的 `config.yml`、临时文件或其他未跟踪文件不会被自动提交。

多次保存会按 `repository.sync.debounce` 合并成一次 commit。commit message 会列出本次合并窗口内的用户操作和文件列表，例如：

```text
autable: sync repository changes

Changes:
- Ada <ada@example.com> saved workflow support/hourly_ticket_sync
  files:
  - workflow/support/hourly_ticket_sync.js
- Grace <grace@example.com> updated table metadata support/tickets
  files:
  - metadata/main.yml
```

Autable 只做本地到远端的推送，不自动 pull、merge 或 rebase。如果远端分支有新的提交导致 push 被拒绝，需要运维人员手动处理。
