# 表单

Autable 表单是 JavaScript 文件，必须导出 `render(api, root)` 函数。表单代码负责渲染控件，并返回默认目标表。

## 基本提交表单

```js
function render(api, root) {
  root.append(
    api.input({ field: "title", label: "Title" }),
    api.input({ field: "requester_email", label: "Requester email", type: "email" }),
    api.select({ field: "priority", label: "Priority", options: ["low", "normal", "high"] }),
    api.submit("Create ticket")
  );

  return { table: "tickets" };
}
```

`field` 是字段名。表单提交时会根据这些 field 组织输入值。

## 自定义动作

表单 API 暴露更基础的上下文能力，避免把业务流程写成复杂 DSL。

```js
function render(api, root) {
  root.append(
    api.input({ field: "email", label: "Email", type: "email" }),
    api.button("Search", async (ctx) => {
      const rows = await ctx.rows.list("contacts", {
        query: { field: "email", op: "=", value: ctx.value("email") },
        limit: 20
      });
      ctx.show(rows);
    })
  );

  return { table: "contacts" };
}
```

`ctx.show(rows)` 会用弹窗展示查询结果。

## 扫码输入

输入控件可以启用二维码/条形码扫描。

```js
function render(api, root) {
  root.append(
    api.input({
      field: "device_code",
      label: "Device code",
      scanner: true,
      onChange: async (ctx) => {
        const rows = await ctx.rows.list("devices", {
          query: { field: "device_code", op: "=", value: ctx.value("device_code") },
          limit: 10
        });
        ctx.show(rows);
      }
    })
  );

  return { table: "devices" };
}
```

扫码控件基于浏览器摄像头能力。需要 HTTPS 或 localhost 环境才能调用摄像头。

## 关联选择

`api.relation` 用来从另一个表里选择一条记录，并把被选记录的 `record_id` 写入当前表单字段。

```js
function render(api, root) {
  root.append(
    api.relation({
      field: "关联采购申请",
      label: "关联采购申请",
      table: "采购申请同步",
      view: "没有物流的采购申请",
      fields: ["申请单号", "供应商", "申请人"]
    }),
    api.submit("提交")
  );

  return { table: "物流登记" };
}
```

`fields` 控制关联选择弹窗里展示和搜索哪些字段，顺序按数组顺序。不配置 `fields` 时，默认展示目标表的所有未删除字段。

## 权限

表单不使用私有 API。发布后的表单仍然使用登录用户的权限：

- 用户需要有表单读取权限才能打开表单。
- 用户需要有目标表字段写权限才能写字段。
- 用户需要有记录创建权限才能新增行。
