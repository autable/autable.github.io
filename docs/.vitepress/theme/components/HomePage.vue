<script setup lang="ts">
const pillars = [
  {
    title: "Git 管理业务结构",
    text: "metadata.yml、workflow.js、form.js 都是仓库里的文件，能 review、能回滚、能让 AI 直接修改源代码。"
  },
  {
    title: "表格、表单、工作流一体化",
    text: "数据建模、录入界面、自动化同步在同一个权限和运行时里协作，不再拆成互不理解的系统。"
  },
  {
    title: "面向开发者和 AI",
    text: "JavaScript runtime、节点目录、稳定序列化、嵌入式前端，让自动化逻辑可以被清晰地生成和维护。"
  }
];

const workflows = [
  "定时拉取外部系统数据",
  "自动补齐缺失字段",
  "按业务唯一键 upsert",
  "记录变化后触发后续动作"
];
</script>

<template>
  <main class="home-page">
    <section class="hero">
      <div class="hero-visual" aria-hidden="true">
        <div class="product-surface">
          <div class="surface-rail">
            <span class="mark"></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div class="surface-nav">
            <strong>support</strong>
            <button class="active">工单</button>
            <button>工作流</button>
            <button>表单</button>
            <button>权限</button>
          </div>
          <div class="surface-main">
            <div class="surface-toolbar">
              <div>
                <span class="crumb">support / 工单</span>
                <h2>客户工单</h2>
              </div>
              <div class="toolbar-actions">
                <span>Filter</span>
                <span>Row</span>
              </div>
            </div>
            <div class="data-grid">
              <div class="grid-head">标题</div>
              <div class="grid-head">状态</div>
              <div class="grid-head">负责人</div>
              <div class="grid-head">更新时间</div>
              <div>设备无法启动</div>
              <div><span class="status status-hot">处理中</span></div>
              <div>售后组</div>
              <div>10:42</div>
              <div>采购申请同步</div>
              <div><span class="status">已同步</span></div>
              <div>系统</div>
              <div>10:35</div>
              <div>二维码入库</div>
              <div><span class="status status-cool">待确认</span></div>
              <div>仓库</div>
              <div>09:58</div>
            </div>
          </div>
          <div class="code-panel">
            <div class="code-tabs">
              <span>workflow.js</span>
              <span>metadata.yml</span>
            </div>
            <pre><code>function run(info) {
  const row = info.instance("upsert").exec({
    table: "tickets",
    match_field: "external_id",
    values: info.inputs.record
  });
  return { changed: row.operation !== "noop" };
}</code></pre>
          </div>
        </div>
      </div>
      <div class="hero-content">
        <p class="eyebrow">代码优先的多维表格平台</p>
        <h1>Autable</h1>
        <p class="lead">
          把表格、表单和工作流放回 Git 仓库。业务数据保存在 SQLite，变更历史保存在 LevelDB，
          结构和自动化逻辑用 YAML 与 JavaScript 管理，适合团队协作，也适合 AI 直接参与开发。
        </p>
        <div class="hero-actions">
          <a class="primary-action" href="/guide/quick-start">开始使用</a>
          <a class="secondary-action" href="/guide/what-is-autable">了解设计</a>
        </div>
      </div>
    </section>

    <section class="section intro">
      <div>
        <p class="section-label">为什么不是又一个 no-code 表格</p>
        <h2>Autable 的源头是代码，不是界面状态。</h2>
      </div>
      <p>
        传统多维表格把结构、表单、自动化藏在产品内部。Autable 把这些东西拆成可读、可提交、可 review 的文件：
        `metadata/main.yml` 定义表结构，`workflow/&lt;database&gt;/&lt;name&gt;.js` 定义自动化，
        `form/&lt;database&gt;/&lt;name&gt;.js` 定义录入和查询体验。
      </p>
    </section>

    <section class="pillars">
      <article v-for="pillar in pillars" :key="pillar.title">
        <h3>{{ pillar.title }}</h3>
        <p>{{ pillar.text }}</p>
      </article>
    </section>

    <section class="section split">
      <div>
        <p class="section-label">同步与自动化</p>
        <h2>工作流节点负责能力，JavaScript 负责业务。</h2>
        <p>
          节点提供稳定的系统能力：定时触发、表格增删改查、字段创建、钉钉 AI 表格读取。
          业务代码只需要组合节点，把一批数据同步到目标表，或者在记录变化后执行后续动作。
        </p>
      </div>
      <ul class="workflow-list">
        <li v-for="item in workflows" :key="item">{{ item }}</li>
      </ul>
    </section>

    <section class="doc-cta">
      <h2>从文档开始，把自己的业务表格放进 Git。</h2>
      <div class="doc-links">
        <a href="/guide/configuration">配置运行环境</a>
        <a href="/guide/forms">设计表单 API</a>
        <a href="/guide/workflows">编写工作流</a>
        <a href="/reference/nodes">查看节点参考</a>
      </div>
    </section>
  </main>
</template>

