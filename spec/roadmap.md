# Roadmap

状态日期：2026-10-13。包版本 `0.1.3`（尚未打 tag；已发布标签仍是 `v0.1.2`）。已验证的 DSH 为 `0.2.1-alpha.1`。上游 DS Bot 0.1.1–0.1.3 已并入（`ded4110`），本地适配（Gitee、中文优先、ebot 命名、总管默认名）保留。

## 北极星

一个人在自己的电脑上，用 DSH Desktop 或 DSH Web 带一支长期存在的 Bot 团队：每个 Bot 是一个 DSH 会话，有角色、记忆和自己的模型；总管可以建团队和群聊；结果可以检查，数据留在本机。

成功信号：用户对总管说一件事，总管建好 Bot 和群聊，群里把活做完，用量和记忆都能在界面里对上。

## 非目标

- 不做第二个 Agent 运行时，不改 DeepSeek Harness。
- 不把团队数据放到用户自己的电脑之外。
- 不在密钥上做“看起来加密了”的半套方案；当前限制写在 CHANGELOG 的 Known limitations。
- 本控制台不排发布日期，也不代替 `CHANGELOG.md`。

## Now

把未发布变更收成可验证的下一版，并让后续切片都从 `spec/backlog.md` 的 ready 队列进入。

未发布（见 `CHANGELOG.md` 的 `[Unreleased]`）：

- 上游 0.1.1–0.1.3 全部并入：@提及列表、+ → 引用对话、总管可停止成员回合、审批不阻塞群回合、Bot 间消息在下一步送达、长任务进度播报、每个 Bot 能改自己的设置，及上游 0.1.3 的全部修复。
- 文档：从本地检出用 `dsh plugin add .` 安装。
- 设置 → 连接器：Gitee 与 GitHub 并列，令牌存为 `GITEE_TOKEN`，`gitee: false` 可隐藏。
- 包名、源码目录和界面名称是 `ebot`。
- 新团队的总管默认名「总管」、角色「幕僚长」；已有团队保留原名。
- README 与界面中文优先。

## Next

按风险而不是按功能清单：

1. 确认未发布的 Gitee 连接器和总管权限没有回归（`LL-001`）。
2. 保持与已验证 DSH 版本的插件契约；DSH 升级单独切片，不混进功能改动。
3. CHANGELOG 里的已知限制：Bot 浏览器只在 Desktop、密钥不加密、同一 DSH home 只有一个写入者、群聊费 token。每一条单独开切片，不打包成“体验优化”。

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
