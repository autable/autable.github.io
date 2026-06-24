# 启用 AI

Autable 的 AI 功能用于辅助修改已经存在的 `workflow.js` 或 `form.js`。前端会把当前脚本、metadata、相关表单/工作流脚本、Autable 参考文档和 workflow node 文档发送给独立的 AI worker。用户需要在界面中查看 AI 返回的完整脚本，并点击“允许修改”后才会写回编辑器；保存仍然使用原有保存按钮。

AI 默认关闭，需要同时启动 Autable 主服务和 `ai-worker`，再在 `config.yml` 中打开开关。

## 配置

在 Autable 的 `config.yml` 中增加：

```yaml
ai:
  enabled: true
  worker_url: "http://ai-worker:3090"
```

- `enabled`：是否在前端显示 AI 入口，并允许后端转发 AI 请求。
- `worker_url`：Autable 主服务访问 AI worker 的地址。Docker Compose 中通常是 `http://ai-worker:3090`；本机调试通常是 `http://127.0.0.1:3090`。

如果 `enabled: true` 但没有配置 `worker_url`，也可以用环境变量指定：

```sh
AUTABLE_AI_WORKER_URL=http://127.0.0.1:3090
```

## Docker Compose

推荐把 AI worker 和 Autable 放在同一个 Compose 网络里：

```yaml
services:
  autable:
    image: ghcr.io/autable/autable:latest
    ports:
      - "8080:8080"
    volumes:
      - ./config.yml:/etc/autable/config.yml:ro
      - autable-data:/data
      - autable-repository:/repository
    depends_on:
      - ai-worker

  ai-worker:
    image: ghcr.io/autable/autable-ai-worker:latest
    environment:
      CODEX_HOME: /tmp/autable-codex-home

volumes:
  autable-data:
  autable-repository:
```

`CODEX_HOME` 用来保存 Codex/ChatGPT 的设备码登录状态。上面的 `/tmp/autable-codex-home` 是容器内临时目录，容器重建后会丢失登录状态。企业内部临时使用时这样最简单；如果希望重启后保留登录状态，可以把它挂到一个专用 volume。

## 本机调试

先启动 AI worker：

```sh
cd ai-worker
npm install
npm run dev
```

再启动 Autable，并让配置指向本机 worker：

```yaml
ai:
  enabled: true
  worker_url: "http://127.0.0.1:3090"
```

或者：

```sh
AUTABLE_AI_WORKER_URL=http://127.0.0.1:3090 go run ./cmd/autable -config config.yml
```

本机调试时如果要设置 `CODEX_HOME`，请使用专门给 Autable AI worker 的目录，不要直接复用个人 `~/.codex`。worker 会写入最小 Codex 配置，让设备码登录使用文件存储，并让 Codex turn 不弹出交互式 approval。

## 登录和使用

打开 workflow 或 form 编辑页后，点击 `AI`：

1. 点击“ChatGPT 登录”。
2. 在打开的页面完成设备码登录。
3. 回到 Autable，点击刷新确认已登录。
4. 选择可用模型和思考强度。
5. 输入修改要求，生成建议。
6. 审核返回的完整 JavaScript 内容，确认后点击“允许修改”。
7. 使用页面原有保存按钮保存脚本。

当前设计只修改已经存在的 workflow 或 form。新建脚本时，先在 Autable 里手动创建并保存一次，再使用 AI 修改。
