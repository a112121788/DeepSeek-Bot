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

### `RL-002` - 发布 ebot 0.2.0：changelog 收口、版本号与标签

| 字段 | 内容 |
|---|---|
| 状态 | ready |
| 优先级 | P0 |
| Outcome | 用户从 Releases 安装的 `ebot-0.2.0.tgz`、git 安装的 `#v0.2.0` 与 npm 版本三处同号；`[Unreleased]` 收成带日期的 `0.2.0` 小节 |
| Scope | `CHANGELOG.md`：`[Unreleased]` 收进 `[0.2.0] - <发布日期>`；补一条 Added「包更名为 ebot、上游 0.1.1–0.1.3 并入、Gitee 连接器」已在现有条目里，如缺再补；版本链接区加 `[0.2.0]: …/compare/v0.1.3...v0.2.0`。`ebot/package.json`、`ebot/package-lock.json` 的版本改为 `0.2.0`。根 `README.md`/`README.en.md` 与 `ebot/README.md`/`README.en.md` 的安装示例 `0.1.3`/`v0.1.3` 全部改为 `0.2.0`/`v0.2.0`。合并后跑 `npm test`。**发布动作**：`git tag v0.2.0`、推送标签、GitHub Release、`npm publish`，只在用户明确要求时执行。非目标：改产品代码 |
| Evidence | 本轮事实核对：本地 `v0.1.0`–`v0.1.3` 全是上游标签（随 `ded4110` 带入）；CHANGELOG 已有上游 `[0.1.3]` 小节（`v0.1.2...v0.1.3`，指向 Fei2411）；`[Unreleased]` compare 链接已写 `v0.1.3...HEAD`；`[Unreleased]` 含包名迁移与上游整体并入，属 minor 级变更。用户请求「规划新版本」并把下一版定为 0.2.0 |
| Acceptance | `node -p "require('./ebot/package.json').version"` 打印 `0.2.0`；`grep -rn "0\.1\.3" README*.md ebot/README*.md` 只剩上游历史小节引用；`npm test` 通过；`git tag` 有 `v0.2.0` 且指向 CHANGELOG 小节所在提交（仅当用户要求发布） |
| Risk | 标签先于验证会把未核对的变更标成已发布；`v0.1.3` 已被上游占用，重复使用会让两处发布混淆；npm 发布需要账号凭据 |
| Rollback | 删掉未推送的 `v0.2.0` 标签，把 `[0.2.0]` 小节移回 `[Unreleased]`，版本号改回 `0.1.3`；已推送的标签与 Release 需在远端删除 |

### `RL-003` - 清理 CHANGELOG 与 README 的发布漂移

| 字段 | 内容 |
|---|---|
| 状态 | ready |
| 优先级 | P1 |
| Outcome | 读者在 CHANGELOG 里看到一致的版本叙事：上游小节指向 Fei2411 仓库、ebot 小节指向 a112121788 仓库；README.zh.md 的安装说明与实际安装命令一致 |
| Scope | `CHANGELOG.md` 末尾链接区：给 `[0.1.2]` 及更早小节补 Fei2411 地址（`[0.1.2]: https://github.com/Fei2411/DeepSeek-Bot/compare/...`）；`[0.1.3]` 保持指向上游发布（跟随 `5efb408`），或在 ebot 首个版本小节处注明「0.1.3 及更早为上游 DS Bot 的发布」。`README.zh.md` 第 28 行按 `README.md` 的 ebot 事实重写（`ebot-0.2.0.tgz`、`github:a112121788/DeepSeek-Bot#v0.2.0&path:/ebot`），并同步 `README.en.md`。非目标：改产品代码、改 spec |
| Evidence | 本轮事实核对：`README.zh.md:28` 仍是上游文案；CHANGELOG 链接区 `[0.1.x]` 小节缺仓库前缀或指向上游，与 ebot 仓库叙事混用 |
| Acceptance | `grep -n "compare/v0.1" CHANGELOG.md` 的每一行都带正确的仓库地址；`README.zh.md` 与 `README.md` 的安装示例同号且都指向 a112121788 仓库 |
| Risk | 改错历史小节链接会让老版本下载地址失效；只改 ebot 仓库侧的引用，不动 Fei2411 上游仓库本身 |
| Rollback | 还原 `CHANGELOG.md` 与两个 README 的对应段落 |

## Done

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

无（发布序列已提为 ready）。

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
