# Backlog

状态日期：2026-10-13。规则见 `spec/00-lean-loop.md`。一次只取一个 `ready` 项。

## Ready

### `LL-001` - 核对未发布变更仍可测

`LL-003` 已把包版本改为 `0.1.3`。本项验收时把版本字段算进“文档与源码一致”，不要把版本改回 `0.1.2`。

| 字段 | 内容 |
|---|---|
| 状态 | ready |
| 优先级 | P0 |
| Outcome | 维护者知道 `[Unreleased]` 里的安装说明、Gitee 连接器、总管自助设置和上游合并条目仍与源码一致，且单元测试能过 |
| Scope | 读 `CHANGELOG.md`、`ebot/src/host/connectors.js`、`ebot/src/host/roster.js`、相关测试。只在发现文档与源码漂移时改文档。非目标：新功能、发布、改 DSH |
| Evidence | `CHANGELOG.md` 的 `[Unreleased]`；连接器与名册测试在 `ebot/test/connectors.test.js`、`ebot/test/roster.test.js` |
| Acceptance | 在 `ebot/` 运行 `npm test`。若本项改了 `src/client/`，再跑 `npm run build` |
| Risk | 测试依赖 `npm run harness` 安装到 `ebot/dev/harness/`（或 `DSH_HARNESS` 指向检出），版本须与 README 一致。失败时停，不改 Harness |
| Rollback | 仅文档漂移时还原对应 markdown。不改产品行为则无需回滚代码 |

## Done

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

### `LL-002` - 为下一次用户可见发布整理 changelog 条目

| 字段 | 内容 |
|---|---|
| 状态 | draft |
| 优先级 | P1 |
| Outcome | 发布者能从 `[Unreleased]` 切出 `0.1.3` 版本小节并打 `v0.1.3` |
| Scope | `CHANGELOG.md` 的版本小节和链接。非目标：本项之前不打 tag、不发 GitHub Release |
| Evidence | `CHANGELOG.md` 的 `[Unreleased]`；`ebot/package.json` 已是 `0.1.3` |
| Acceptance | 版本小节日期与 compare 链接指向 `v0.1.2...v0.1.3`；`git tag` 里出现 `v0.1.3` 只在用户要求发布时发生 |
| Risk | 标签先于验证会把未核对的变更标成已发布 |
| Rollback | 删掉未推送的 `v0.1.3` 标签，把小节移回 `[Unreleased]` |

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
