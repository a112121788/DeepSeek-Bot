# Backlog

状态日期：2026-10-13。规则见 `spec/00-lean-loop.md`。一次只取一个 `ready` 项。

## Ready

### `RL-004` - 发布 ebot v0.2.0：标签、Release 与 npm publish

| 字段 | 内容 |
|---|---|
| 状态 | ready |
| 优先级 | P0 |
| Outcome | 用户能从 GitHub Release 下载 `ebot-0.2.0.tgz` 或从 npm/git 标签安装 `0.2.0` |
| Scope | 在 `RL-002` 完成的基础上：`git tag v0.2.0`（指向 CHANGELOG `[0.2.0]` 小节所在提交）、推送 `main` 与标签到 Gitee origin、建 GitHub Release、`npm publish`（如在 npm 发布）。只在用户明确要求时执行。非目标：改代码或文档 |
| Evidence | `RL-002` 已把 changelog、版本号、README 示例收口为 0.2.0；本地 `v0.1.0`–`v0.1.3` 是上游标签，ebot 首个自有标签从 `v0.2.0` 起 |
| Acceptance | `git tag` 含指向收口提交的 `v0.2.0`；GitHub Release 与 npm 上出现 `0.2.0`；`origin/main` 包含收口提交 |
| Risk | 推送与发布会公开内容；npm 需要账号凭据；GitHub Release 建在 a112121788/DeepSeek-Bot，Gitee 推送到 eclouddev/ebot，两处远端都要更新 |
| Rollback | 远端删标签、删 Release、npm `unpublish`（有时限）；本地删标签后把小节移回 `[Unreleased]` |

### `LL-005` - 并入上游共享 Capabilities（设置 → 能力）

| 字段 | 内容 |
|---|---|
| 状态 | ready |
| 优先级 | P1 |
| Outcome | 用户得到上游 `[Unreleased]` 的共享能力：设置 → Capabilities 维护团队共享的 MCP 服务、技能与能力包；Bot 能给自己 attach/detach 能力（Main Bot 可管所有 Bot，非 Main Bot 改不了别人在用的能力）；Bot 本地添加的 MCP 命令需用户批准后才挂载；环境变量可用 `$DSH_SECRET_*` 引用已存密钥，值不进模型上下文 |
| Scope | 并入上游 `292b735..7e1c518`（PR #100，29 文件 +2741/−1036）：host 新增 `src/host/capabilities.js`，`tools.js` 加 5 个工具（`list/save/delete/attach/detach_capability`），`secrets/store/channel/groups/delivery/parts/roster/constants` 适配；client 新增 `src/client/capability-settings.js`，`bot-settings/settings/i18n/index` 适配；测试新增 `test/capabilities.test.js` 与 `dev/mcp-echo-server.mjs` 夹具、smoke 步骤。适配点：ebot 命名、文案中文优先（上游 i18n 已带中文条目）。非目标：不带未合并分支的功能（见 `LL-006`）；不动 `RL-004` 的发布流程 |
| Evidence | 上游 origin/main `7e1c518`（Merge PR #100）含完整实现与 427 行测试，上游 CHANGELOG `[Unreleased]` 有 Added 条目；ebot 全仓 grep `capability`（`ebot/src/host/`）无实现 |
| Acceptance | `npm test` 全过（含新能力测试）；`node scripts/build-client.mjs --check` 与 `npm run lint` 过；host 改动加跑 smoke；UI 里设置 → 能力能添加 MCP 服务/技能/能力包、attach 到 Bot 并看到状态（就绪/需要批准）变化，中文文案正确（浏览器验证） |
| Risk | 挂载依赖 `@deepseek-ai/dsh-mcp-client` 插件契约，单测基座仍锁 `0.2.0-rc.2`；本地 MCP 审批与密钥展开要在 Desktop 真机场景复核；上游若继续改此功能，下次同步再跟 |
| Rollback | `git revert` 本切片合并提交；`state.capabilities` 是新增 schema 字段，回退后旧代码自然忽略，无需数据迁移 |

## Done

### `RL-003` - 清理 CHANGELOG 与 README 的发布漂移（2026-10-13）

| 字段 | 内容 |
|---|---|
| 状态 | done |
| Outcome | 读者在仓库里看到一致的版本叙事：ebot 的中文文档只有根 `README.md`，上游 `[0.1.3]` 小节标明来源，从 `ds-bot` 迁移的读者在 `0.2.0` 小节就能看到迁移提示 |
| Scope | 与原计划两处偏差：① `README.zh.md` 整个文件是上游 DS Bot 原样残留（`git diff 5efb408` 无差异，装 `ds-bot`、默认名 Chief），零引用；ebot 的双语结构是 `README.md`（中）↔ `README.en.md`（英），只重写第 28 行会留下自相矛盾的上游文档，故删除整个文件。② CHANGELOG 链接区核对后本就正确（`[0.1.x]` 指向 Fei2411，`[0.2.0]`/`[Unreleased]` 指向 a112121788），无需修改；改为在 `[0.1.3]` 小节加一句来源注记，在 `[0.2.0]` 小节补一条从上游 `ds-bot` 迁移的 Changed 条目。非目标：改产品代码、改 spec 之外的文档 |
| Evidence | `git log --follow README.zh.md` 全部为上游提交（顶到 `41710f6`）；`git diff 5efb408 -- README.zh.md` 为空；全仓 grep 无 `README.zh` 引用 |
| Acceptance | `npm test` 418/418；`node scripts/build-client.mjs --check` 通过（工作树里他人改动 `ebot/client.js` 未被本切片触碰，检查仍干净）；根目录无 `README.zh.md`，四个 README/CHANGELOG 无 `README.zh` 引用（grep 退出码 1） |
| Risk | 上游贡献者按旧路径找中文文档会 404，语言头「中文 \| English」已在 `README.md`/`README.en.md` 顶部指路；下次上游同步若带回 `README.zh.md`，同步切片需再次丢弃 |
| Rollback | `git revert` 本切片提交恢复该文件；CHANGELOG 两处编辑按 diff 还原 |

### `LL-007` - 设置里新增「学习」页：速成指南（2026-10-13）

| 字段 | 内容 |
|---|---|
| 状态 | done |
| 优先级 | P1 |
| Outcome | 新用户打开 设置 → 学习 能一次读完速成指南（速览、核心概念、前十分钟、用好团队、常见问题），中文界面显示中文、英文界面显示英文 |
| Scope | 新增 `ebot/src/client/learn.js`（指南内容 + LearnPage + LEARN_CSS，Markdown 用平台组件 `MarkdownText` 渲染）；`ebot/src/client/settings.js` 注册 `learn` 页（排在 General 后）；`ebot/src/client/icons.js` 新增 `BookIcon`；`ebot/src/client/i18n.js` 加 6 个词条；`ebot/src/client/index.js` 注入 LEARN_CSS；`ebot/client.js` 重新生成；`CHANGELOG.md` 记一笔。非目标：改 host 侧、改其它页面、指南放独立 .md 文件（客户端 bundle 内嵌字符串，避免 fetch 相对路径问题） |
| Evidence | 用户请求「增加学习菜单，打开学习，里面是速成指南md」；项目无既有速成指南文件，故新写 |
| Acceptance | `npm test` 418/418；`node scripts/build-client.mjs --check` 通过；`npm run lint` 16 条警告与基线一致；mock bench + Playwright 浏览器验证：中文界面「学习」页五节齐全（表格/加粗/代码/列表渲染正常）、滚动到底完整、切通用/关于再回来正常、英文界面（locale preference=en）Learn 页英文内容齐全，无 pageerror |
| Risk | 指南文案随功能演进可能过时（与 README/CHANGELOG 的表述需保持一致）；bench 曾误用全局 npm 安装的 dsh 作 DSH_HARNESS，pnpm 改写了其 node_modules（已手工修复并验证 `dsh --version` 正常；建议尽快补一个真正的 deepseek-harness checkout） |
| Rollback | revert 本轮提交即移除学习页；client.js 随构建再生 |

### `RL-002` - 发布 ebot 0.2.0：changelog 收口、版本号与标签（2026-10-13）

| 字段 | 内容 |
|---|---|
| 状态 | done（发布动作拆到 `RL-004`，等用户指令） |
| Outcome | 仓库内的版本叙事全部指向 0.2.0：CHANGELOG 有带日期的 `[0.2.0]` 小节，包版本与四个 README 安装示例同号 |
| Scope | `CHANGELOG.md`（`[Unreleased]` 收成 `[0.2.0] - 2026-10-13`，补一条 Added「新团队总管默认名 总管/幕僚长」，版本链接加 `[0.2.0]: …/compare/v0.1.3...v0.2.0`）；`ebot/package.json`、`ebot/package-lock.json`（3、9 行）版本改 0.2.0；四个 README 的 `0.1.3.tgz`/`#v0.1.3` 示例改 0.2.0。非目标：打 tag、发 Release、npm publish（拆到 `RL-004`） |
| Evidence | 补条目的事实依据：上游 0.1.3 默认名是 `Chief`/`Chief of Staff`（`git show 5efb408:ds-bot/index.js`），「总管/幕僚长」来自本地提交 `ea7c4a5`，属本发布范围 |
| Acceptance | `node -p "require('./ebot/package.json').version"` → `0.2.0`；lockfile 两处字段 → `0.2.0 / 0.2.0`；四个 README 无 `0.1.3` 残留（grep 退出码 1）；`npm test` 418/418 |
| Risk | `ebot-0.2.0.tgz` 与 npm 包在 `RL-004` 发布前不存在，README 的离线安装示例暂时指向未发布产物 |
| Rollback | 版本号改回 0.1.3，`[0.2.0]` 小节移回 `[Unreleased]`，README 示例回退 |

### `RL-001` - 发版前核对（bot 与总管权限无回归）（2026-10-13）

| 字段 | 内容 |
|---|---|
| 状态 | done |
| Outcome | 发布者知道 `[Unreleased]` 里的安装说明、Gitee 连接器、总管自助设置和上游合并条目仍与源码一致，可以安全发版 |
| Scope | 读 `CHANGELOG.md`、`ebot/src/host/connectors.js`、`ebot/src/host/roster.js`、`index.js`、相关测试。零文档漂移，未改任何文件 |
| Evidence | 逐条核对 2026-10-13：Gitee 连接器（`connectors.js` CATALOG 并列条目、`GITEE_TOKEN`、`gitee: false` 隐藏）有 `connectors.test.js` 11 个测试覆盖；总管自助设置（`roster.js` `updateBot` 无权限门槛，对比 `updateRoom`）与 `index.js` 默认名「总管/幕僚长」有 `roster.test.js:206` 断言；本地检出安装说明与 `README.md:50` 一致。`npm test` 418/418；版本号仍为 `0.1.3` |
| Acceptance | `npm test` 通过（418 pass, 0 fail）；`node -p "require('./ebot/package.json').version"` 打印 `0.1.3` |
| Risk | 测试基座 `dev/harness` 锁 `0.2.0-rc.2`，与 README 宣称的 `0.2.1-alpha.1` 有版本差；两者都是既有事实，本项未改 |
| Rollback | 无代码与文档改动，无需回滚 |

### `LL-004` - 冒烟验证合并后的上游功能（2026-10-13）

| 字段 | 内容 |
|---|---|
| 状态 | done |
| Outcome | 合并后的插件在 mock 基座上完整跑通建团队、群聊回合、@接力、长对话压缩与交接 |
| Scope | `dev/bench.sh smoke` + `dev/smoke.mjs`；顺带修了 bench 在 npm 安装的 dsh 下无法启动的问题 |
| Evidence | `node dev/smoke.mjs smoke 3096`：全部 32 步通过；`npm test` 复跑仍 418/418 |
| Acceptance | smoke 全部步骤 ok；`dev/bench.sh smoke 3096 8796 stop` 后端口与进程无残留 |
| Risk | macOS 缺 GNU `setsid`，bench 需要 PATH 上有 setsid shim（本机已装 /usr/local/bin/setsid）；pnpm 11 默认 `strict-dep-builds`，`dev/harness/pnpm-workspace.yaml` 已写 `dangerouslyAllowAllBuilds: true` |
| Rollback | bench 修复独立提交 `371d0da`，可单独 revert |

### `LL-MERGE` - 并入上游 DS Bot 0.1.1–0.1.3 的新增功能（2026-10-13）

| 字段 | 内容 |
|---|---|
| 状态 | done |
| Outcome | ebot 获得上游 0.1.1–0.1.3 的全部功能与修复，保留 Gitee 连接器、中文优先与 ebot 命名 |
| Scope | 全仓合并；冲突取舍记录在合并提交 `ded4110` 与适配提交 `7e4a5f1` |
| Evidence | `git merge-base` 分叉点 `bdc5fda`，上游 111 个提交并入；`npm test` 418/418 |
| Acceptance | `npm test`、`node scripts/build-client.mjs --check`、`npm run lint`（警告数与合并前基线同为 16）全部通过 |
| Risk | 上游 0.1.4 之后的行为差异需在下次同步时重查 |
| Rollback | `git revert -m 1 ded4110` 回退整个合并 |

## Draft

### `LL-006` - 上游 follow-through / group-tasks 分支方向（待上游合入 main 后并入）

| 字段 | 内容 |
|---|---|
| 状态 | draft |
| 优先级 | P2 |
| Outcome | 上游两条未合并分支指向四个方向，待其进 main 后随同步切片并入：① 断电恢复——`inflight.json` 记录运行中回合与待投递消息，重启后续跑（`6f99e8c`）；② 文本工具调用修复——模型把工具调用写成文本时给一次重试机会（`49dc7ac`）；③ 群内任务分发——成员忙于工具时回合继续，工作状态在群、侧栏、Bot 自己聊天三处可见（`cf51255`、`4d4a998`）；④ 审批等待提醒——侧栏橙点、徽标与系统通知（`e145374`） |
| Scope | 等 `origin/main` 收录后再做 ready；并入时沿用 `LL-005` 的适配方式（ebot 命名、中文优先）。非目标：现在直接 cherry-pick 未合并分支 |
| Evidence | 上游 `origin/devin/follow-through`（854 行）与 `origin/devin/group-tasks`（含 follow-through，1581 行）分支提交说明 |
| Acceptance | 分支进 main 后按 `LL-005` 的验收形状重写本条 |
| Risk | 分支尚未合并，实现可能变化；提交说明里已见多次测试稳定性返工 |
| Rollback | 按提交 revert；不涉及 schema 时无数据回滚 |

## Draft 备注

draft 状态意味着证据未齐或上游未定形，不进 ready 队列。

## Blocked

无。

## Done

### `LL-003` - 包版本补丁号加一

| 字段 | 内容 |
|---|---|
| 状态 | done |
| 优先级 | P1 |
| Outcome | 维护者读到的包版本是 `0.1.3`，安装示例与之同号 |
| Scope | `ebot/package.json`、`ebot/package-lock.json` 的 name 版本；根与 `ebot/` 的 README 中文/英文安装示例；`CHANGELOG.md` 记一笔。非目标：打 tag、发 Release、把 `[Unreleased]` 收成版本小节 |
| Evidence | 用户请求「版本号加1」；已发布标签最高为 `v0.1.2` |
| Acceptance | `node -p "require('./ebot/package.json').version"` 打印 `0.1.3`；当前安装示例里不再出现 `0.1.2`；CHANGELOG 历史链接仍指向 `v0.1.2` |
| Risk | `v0.1.3` 标签和 `ebot-0.1.3.tgz` 还不存在，离线安装示例要等发布才可用 |
| Rollback | 把上述文件中的 `0.1.3` 改回 `0.1.2`，并删掉 CHANGELOG 里对应的 Changed 条目 |

### `LL-000` - 建立交付控制台

| 字段 | 内容 |
|---|---|
| 状态 | done |
| 优先级 | P0 |
| Outcome | 维护者打开 `spec/` 就能看到流程、北极星和下一个 ready 切片 |
| Scope | 新增 `spec/00-lean-loop.md`、`spec/roadmap.md`、`spec/backlog.md`。非目标：改插件代码、改 README、提交 |
| Evidence | `/lean-loop init`；仓库此前没有 roadmap / backlog |
| Acceptance | 三个文件存在；`LL-001` 字段齐全；未改 `ebot/` |
| Risk | 与 README 重复。控制台不复制安装步骤，产品事实仍以 README / CHANGELOG 为准 |
| Rollback | 删除 `spec/` 目录 |

## Icebox

- 打开外部 pull request。
- 密钥存储改造。
- Bot 浏览器超出只读。

## Handoff

无。
