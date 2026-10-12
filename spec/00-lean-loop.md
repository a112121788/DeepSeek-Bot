# Lean Loop

交付控制台。产品说明仍以根目录 `README.md`、`ebot/README.md` 和 `CHANGELOG.md` 为准。这里只记录怎么切片、何时停、怎样算做完。

流程：

```text
Intake -> Slice -> Plan -> Implement -> Verify -> Document -> Review -> Decide
```

一次只做一个 ready 切片。预计超过 2 天就拆开。不在同一轮里同时改架构、数据模型、界面、发布和文档清理。

## 事实源

1. 当前请求、`AGENTS.md`、`CONTRIBUTING.md` 里的硬规则。
2. `spec/roadmap.md`、`spec/backlog.md`，以及 README / CHANGELOG。
3. `ebot/` 源码、测试和构建脚本。

文档和源码不一致时，以源码为准，并在同一切片里改文档，或在 backlog 里记下漂移。

## 项目硬约束

来自 `AGENTS.md`，切片不得违反：

- 只做 DSH 插件。不改 DeepSeek Harness，不依赖 DSH 安装目录里的文件。
- 不写入、不打印、不提交密钥、令牌、cookie 或 `DSH_HOME` 内容。测试用 `ebot/dev/mock-llm.mjs`。
- 不复制其他产品的代码、文案、图标或图形。
- `ebot/client.js` 由 `ebot/src/client/` 生成。改客户端后跑 `npm run build`，两处一起提交。不要手改 `client.js`。
- 测试数据只放在 `.dsh-test-<name>/`。不要指向 `~/.dsh` 或用户正在跑的 DSH。
- 不给界面层新增单元测试。界面验收用浏览器或端到端。现有 `ebot/test/` 里的非界面测试保持原样。
- 面向用户的文案键保持英文；中文是登记翻译。改根目录或 `ebot/` 的 `README.md` 时，同步对应的 `README.en.md`。

## Definition of Ready

可以自动执行的条目必须有：

| 字段 | 要求 |
|---|---|
| Outcome | 谁受益，完成后发生什么变化 |
| Scope | 涉及的文件或模块，以及明确的非目标 |
| Acceptance | 至少一条可执行检查或可观察证明 |
| Evidence | spec、issue、代码入口或失败测试 |
| Risk | 安全、兼容、数据、性能或发布风险 |
| Rollback | 如何禁用、回退或降级 |

缺字段时先补 backlog，不写产品代码。

## Definition of Done

1. diff 与 Scope 一致。
2. Acceptance 里的检查已跑过，或写明没跑的原因。
3. 契约、命令或用户可见行为变了，就同步 README / CHANGELOG。
4. `spec/backlog.md` 留下 done、blocked 或 split，以及证据。
5. 回滚路径明确。

只在用户要求时提交。

## 停止规则

- 同类失败连续两次：停止，列出 3–5 个替代方案，不继续原路径。
- 破坏性命令、凭据、发布、指向用户自己的 DSH 数据：先问。
- 需要 DSH 没有的能力：停，写 issue 说明，不给 Harness 打补丁。
- 工作树里有本切片之外的改动：不覆盖，先记入 handoff。

## 验证矩阵

命令在 `ebot/` 下执行。DSH 检出在 `../deepseek-harness`，或由 `DSH_HARNESS` 指向，版本与 README 中的测试版本一致。

| 改动 | 最小验证 |
|---|---|
| 仅 spec / docs | 读 diff；路径和链接能对上现有文件 |
| `ebot/src/client/` | `npm run build`，再 `npm test`（含 `client.js` 是否过期） |
| `ebot/index.js` 或 `ebot/src/host/` | `npm test`，以及空闲端口上的 smoke：`dev/bench.sh <name> <port> <port2> reset`，然后 `node dev/smoke.mjs`，结束时 `dev/bench.sh <name> <port> <port2> stop` |
| 其他插件逻辑 | `npm test`；若客户端包可能变脏，再跑 `node scripts/build-client.mjs --check` |
| 界面行为 | 浏览器或端到端手测；不新增 UI 单测 |

每次 bench 用空闲端口，并停掉自己启动的 bench 和进程。

## Handoff

循环做不完时，在 `spec/backlog.md` 追加：

```markdown
### Handoff - ID

- 目标：
- 已完成：
- 已改文件：
- 已验证：
- 未验证 / 原因：
- 当前阻塞：
- 下一步：
- 回滚点：
```
