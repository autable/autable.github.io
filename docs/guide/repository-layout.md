# 仓库布局

Autable 把用户可维护的业务定义放在 Git repository 里。

## 推荐结构

```text
repository.path/
  config.yml
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

Git repository 保存的是人会维护的结构和代码。SQLite、LevelDB、session、历史记录不属于这个目录。

