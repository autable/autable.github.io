# 表格与视图

表格是 Autable 的数据核心。每个业务数据库对应一个 SQLite 文件，每张用户表由 metadata 管理字段和视图。

## 字段

字段定义在 `metadata/main.yml` 中。

```yaml
fields:
  - name: title
    type: string
  - name: priority
    type: string
  - name: done
    type: string
```

当前字段类型以稳定和可同步为优先。字段类型创建后不可变。

## 系统字段

Autable 会为用户表使用带 `ct_` 前缀的系统字段，避免和用户字段冲突。例如：

- `ct_record_id`
- `ct_created_at`
- `ct_updated_at`

用户字段不要依赖无前缀系统字段。

## 软删除字段

字段删除会在 metadata 中标记 `deleted: true`。这样可以保留历史结构，避免误删后不可恢复。

## 视图

视图定义过滤、排序和展示入口。

```yaml
views:
  - name: active
    display_name: Active
    query:
      combinator: and
      rules:
        - field: status
          operator: "="
          value: Active
    sorts:
      - field: updated_at
        direction: desc
```

`all records` 是基础视图。只有 all records 允许直接新建行；其他视图只用于查看和过滤。

## 临时排序

表头排序是临时状态，不写回 metadata。前端会把排序请求传给后端，为后续分页加载保持一致行为。

## 行历史

行创建、更新、删除会写入历史记录。历史记录包含：

- 操作类型。
- 操作时间。
- 操作者。
- 当前值。
- diff 字段。

upsert 节点在发现字段值完全一致时会返回 `noop`，不会写入新的更新历史。

