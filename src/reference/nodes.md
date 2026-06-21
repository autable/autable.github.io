# Workflow Nodes

Workflow node 是 Autable 工作流访问系统能力的边界。节点输入输出应保持 JSON-compatible，避免业务脚本依赖 SDK 类型。

## echo

调试节点。返回输入值。

```js
function instances(info) {
  return { echo: "echo" };
}

function run(info) {
  return info.instance("echo").exec({ value: "hello" });
}
```

## time.schedule

定时触发节点。

```js
function instances(info) {
  return { schedule: "time.schedule" };
}

function trigger(info) {
  return {
    instance: "schedule",
    params: { every: "1h" }
  };
}
```

## table.record.changed

表格记录变化触发节点。支持按表、操作类型、字段过滤。

```js
function instances(info) {
  return { ticket_changed: "table.record.changed" };
}

function trigger(info) {
  return {
    instance: "ticket_changed",
    params: {
      table: "tickets",
      operations: ["create", "update"],
      fields: ["status", "priority"]
    }
  };
}
```

输入包含记录、操作、diff 和历史 key。

## table.field.create

为目标表补齐字段。常用于同步前自动确保目标结构存在。

```js
info.instance("ensure_fields").exec({
  table: "tickets",
  fields: {
    external_id: "string",
    title: "string",
    status: "string"
  }
});
```

字段名会经过校验，避免生成会破坏 SQL 的非法字段。

## table.row.create

创建记录。

```js
const created = info.instance("create_ticket").exec({
  table: "tickets",
  values: {
    title: "Printer offline",
    status: "open"
  }
});
```

需要 workflow subject 拥有目标表字段写权限和记录创建权限。

## table.row.list

读取记录。

```js
const result = info.instance("list_tickets").exec({
  table: "tickets",
  view: "open"
});
```

返回 `rows`。结果会按权限过滤不可读字段。

## table.row.update

更新指定记录。

```js
const updated = info.instance("update_ticket").exec({
  table: "tickets",
  record_id: 1,
  values: { status: "done" }
});
```

需要目标字段写权限。

## table.row.delete

删除指定记录。

```js
const deleted = info.instance("delete_ticket").exec({
  table: "tickets",
  record_id: 1
});
```

需要记录删除权限。

## table.row.upsert

根据匹配字段更新或创建记录。

```js
const result = info.instance("upsert_ticket").exec({
  table: "tickets",
  match_field: "external_id",
  values: {
    external_id: "T-1001",
    title: "Printer offline",
    status: "open"
  }
});
```

返回 `operation`：

- `create`
- `update`
- `noop`

当已存在记录的字段值和 upsert 值一致时，节点返回 `noop`，不会写更新历史。

## dingtalk.robot.send

发送钉钉机器人消息。

```js
function instances(info) {
  return {
    robot: {
      node: "dingtalk.robot.send",
      secrets: [{ name: "access_token", type: "string" }]
    }
  };
}
```

## dingtalk.notable.records.list

读取钉钉 AI 表格记录。后续钉钉相关 API 都应使用官方 `github.com/alibabacloud-go/dingtalk/` SDK 封装。

配置项：

- `app_key`
- `app_secret`
- `base_id`
- `sheet_id_or_name`
- `operator_id`

分页参数由 workflow JavaScript 在调用时传入：

- `max_results`
- `next_token`

示例：

```js
const page = info.instance("source").exec({
  max_results: 100,
  next_token: info.inputs.next_token || ""
});
```

