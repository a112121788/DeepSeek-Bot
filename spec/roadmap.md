# Roadmap

状态日期：2026-10-13。**ebot `v0.2.0` 已发布**（`RL-004` done）：附注标签 `v0.2.0` 指向收口提交 `7ab5677`，已推 Gitee（eclouddev/ebot）与 GitHub（a112121788/ebot，仓库已由 DeepSeek-Bot 改名），GitHub Release 挂 `ebot-0.2.0.tgz`（https://github.com/a112121788/ebot/releases/tag/v0.2.0）。npm publish 因本机无凭据拆到 `RL-005`（ready）。本地 `v0.1.0`–`v0.1.3` 标签全部是上游 DS Bot 的发布标签，ebot 自己的发布标签从 `v0.2.0` 起。已验证的 DSH 为 `0.2.1-alpha.1`（单测基座 `ebot/dev/harness` 锁 `0.2.0-rc.2`）。

## 北极星

一个人在自己的电脑上，用 DSH Desktop 或 DSH Web 带一支长期存在的 Bot 团队：每个 Bot 是一个 DSH 会话，有角色、记忆和自己的模型；总管可以建团队和群聊；结果可以检查，数据留在本机。

成功信号：用户对总管说一件事，总管建好 Bot 和群聊，群里把活做完，用量和记忆都能在界面里对上。

## 非目标

- 不做第二个 Agent 运行时，不改 DeepSeek Harness。
- 不把团队数据放到用户自己的电脑之外。
- 不在密钥上做“看起来加密了”的半套方案；当前限制写在 CHANGELOG 的 Known limitations。
- 本控制台不排发布日期，也不代替 `CHANGELOG.md`。

## Now

ebot `v0.2.0` 已发布（`RL-004` done）：标签指向收口提交 `7ab5677`，Gitee/GitHub 双远端标签、GitHub Release（tarball）就位；`RL-005`（npm publish，等用户 npm 登录）与 `LL-005`（并入上游共享 Capabilities）在 ready 队列，一次只取一项。

`0.2.0` 含：

- 上游 0.1.1–0.1.3 全部并入：@提及列表、+ → 引用对话、总管可停止成员回合、审批不阻塞群回合、Bot 间消息在下一步送达、长任务进度播报、每个 Bot 能改自己的设置，及上游 0.1.3 的全部修复。
- 文档：从本地检出用 `dsh plugin add .` 安装。
- 设置 → 连接器：Gitee 与 GitHub 并列，令牌存为 `GITEE_TOKEN`，`gitee: false` 可隐藏。
- 包名、源码目录和界面名称是 `ebot`。
- 新团队的总管默认名「总管」、角色「幕僚长」；已有团队保留原名。
- README 与界面中文优先。

收口提交 `7ab5677` 之后的 Learn 页（`a90d574` 新增、`743a10e` 随之移除 Feedback 页）记在 CHANGELOG `[Unreleased]`，属下一版本周期，随 `LL-005` 一并发布。

## Next

按风险而不是按功能清单：

1. `0.2.0` 发布后：与上游的下次同步切片，主体是共享 Capabilities（上游 `[Unreleased]`，`ready` 队列的 `LL-005`，分叉点现为 `7e1c518`），同步时重查上游 0.1.4 起的行为差异。
2. 保持与已验证 DSH 版本的插件契约；DSH 升级单独切片，不混进功能改动。单测基座仍是 `0.2.0-rc.2`，升基座单独做。
3. CHANGELOG 里的已知限制：Bot 浏览器只在 Desktop、密钥不加密、同一 DSH home 只有一个写入者、群聊费 token。每一条单独开切片，不打包成“体验优化”。
4. 与上游的下次同步（分叉点 `7e1c518` 之后的新增）：上游的 `README.zh.md` 若被带回，再次丢弃（ebot 的中文文档是根 `README.md`，见 `RL-003`）。上游 `devin/follow-through`、`devin/group-tasks` 两条未合并分支的方向记录在 backlog `LL-006`（draft），进 main 后再评估。

## Later

- 打开外部 pull request（`CONTRIBUTING.md` 写明当前不收 PR）。
- 密钥的存储方式，若要改，先写威胁模型和回滚，再动代码。
- Bot 浏览器超出“只读页面”的能力。缺 DSH 能力时停在 issue，不打 Harness 补丁。

## 质量门槛

- `ebot/` 下 `npm test` 和 `node scripts/build-client.mjs --check` 通过，改动才算完成。
- 改 `ebot/index.js` 或 `ebot/src/host/` 时加 smoke，并停掉 bench。
- 不提交密钥和用户 DSH 数据。
- 用户可见变更写入 `CHANGELOG.md`。

## 风险

| 风险 | 说明 |
|---|---|
| DSH 仍是 alpha | 新的 DSH 可能弄坏插件。版本绑定写在 README 和 About。 |
| 双端共享 home | 第二个 DSH 只读。测试不要指向 `~/.dsh`。 |
| 密钥明文 | 已知限制。切片不得把令牌写进日志、反馈包或仓库。 |
| 群聊 token | 成员轮流读群。不要用“让所有 Bot 都回复”来验收。 |
