# 工作流

Autable 工作流是 JavaScript 文件，通过内置节点访问系统能力。业务逻辑写在 JavaScript 中，节点负责提供稳定边界。

## 基本结构

```js
function instances(info) {
  return {
    schedule: "time.schedule",
    upsert_ticket: "table.row.upsert"
  };
}

function trigger(info) {
  return {
    instance: "schedule",
    params: { every: "1h" }
  };
}

function run(info) {
  const result = info.instance("upsert_ticket").exec({
    table: "tickets",
    match_field: "external_id",
    values: info.inputs.record
  });

  return { operation: result.operation };
}
```

## instances

`instances(info)` 声明本 workflow 会使用哪些节点。

简单写法：

```js
function instances(info) {
  return {
    echo: "echo"
  };
}
```

带变量和密钥：

```js
function instances(info) {
  return {
    robot: {
      node: "dingtalk.robot.send",
      variables: [{ name: "channel", type: "string" }],
      secrets: [{ name: "access_token", type: "string" }]
    }
  };
}
```

## trigger

`trigger(info)` 定义触发方式。当前常见触发包括定时和表格记录变化。

```js
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

## run

`run(info)` 是实际执行逻辑。它可以读取输入、调用节点、返回输出。

```js
function run(info) {
  const incoming = info.inputs.records || [];
  let changed = 0;

  for (const item of incoming) {
    const result = info.instance("upsert_ticket").exec({
      table: "tickets",
      match_field: "external_id",
      values: item
    });
    if (result.operation !== "noop") {
      changed += 1;
    }
  }

  return { checked: incoming.length, changed };
}
```

## 权限主体

workflow 可以作为权限系统里的主体。workflow 节点不走私有 API，而是使用公开 API 能力和 workflow 自己被授予的权限。

例如，一个 workflow 想写 `tickets` 表，需要给 `workflow:<id>` 授予：

- 字段写权限。
- 记录新增权限。
- 如果要删除记录，还需要记录删除权限。

## 稳定序列化

JavaScript runtime 内置 `stableStringify(value)`，用于稳定地把对象转成字符串。对象 key 顺序不同但值相同的场景，应该用它避免误判为变化。

