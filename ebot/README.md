# ebot

中文 | [English](README.en.md)

ebot 是 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（dsh）的插件。它把 dsh 变成一组长驻 Bot：和你对话、互相发消息、在群聊里协作。概览、安装步骤和截图见[项目主页](../README.md)。

> 早期版本（v0.1）。功能、工具和存盘格式仍可能变化。

已在 Linux 上用 dsh `0.2.1-alpha.1`（Web 与 Desktop）验证。

## 功能

- **长驻 Bot**：每个 Bot 都是「ebot」工作区里的一个 dsh Session，有自己的名字、角色、说明和模型。
- **Bot 协作**：`message_bot` 给另一个 Bot 发消息，`create_bot` / `update_bot` 创建与配置 Bot，`ask_user` 向你提问且不阻塞其他 Bot。
- **群聊**：成员轮流发言，每人先读最新消息。消息可用 `@Name` 把回合交给某人；输入 `@` 可以从列表里选人。**+ → 引用对话** 把另一个 Bot 的会话作为上下文加进消息，在群里由应答的成员收到。没有新内容可说的成员保持安静（`[PASS]`）。每个成员在每个群里有独立的隐藏 Session，群聊读不到 Bot 的私聊。
- **角色与权限**：

  | 谁 | 能做什么 |
  |---|---|
  | 你 | 全部 |
  | 主 Bot（可以有多个） | 管理所有群；改动、删除 Bot |
  | 群管理员 | 只管理自己的群（名称、公告、成员、回复模式） |
  | 成员 | 在群里发言，并 `@` 其他成员 |

- **长对话不超出模型窗口**：Bot 的 Session 不会跑 dsh 自带的压缩。回合结束时若越过检查线（模型上下文窗口的一定比例），会有一次独立的小模型调用（context steward）读取最近消息并只决定一次。工作仍在进行时，对话就地收成检查点：交接摘要 + 你最近的消息原文。工作已到停点时，Bot 写交接笔记并在新 part 继续。你始终看到一条连续对话，没有标记。更早的 part 与收起的消息仍可通过全文索引（`node:sqlite` FTS5）用 `read_own_chat` 搜索。
- **记忆**：每个 Bot 在所有对话里保留笔记，团队另有一份共享记忆。见[记忆](#记忆)。
- **网页搜索**：见[网页搜索](#网页搜索)。
- **Bot 浏览器（仅 dsh Desktop）**：见[Bot 浏览器](#bot-浏览器)。
- **图片**：模型不能读图时，先由视觉模型把图转成文字。
- **密钥**：Bot 在自己的对话里用卡片索要 API key 或 token，且永远看不到明文。见[密钥](#密钥)。
- **用量**：设置 → 用量按时间（24 小时到 12 个月，或日历选日）、按 Bot、按模型显示 Token 用量，并有每个 Bot / 每个模型的分页。Session 日志里的调用会从日志读取，旧对话也计入。没有日志的调用（检查点、交接笔记、steward、读图、dsh 标题与压缩）在插件运行期间边流式边计数。只计 Token，不计费用。
- **按你来定制**：每个 Bot 的名字、角色、说明、模型与外观（20 个角色与 12 种颜色，或自选照片）；团队主题、强调色与头像动画级别（安静、正常或活泼）。置顶的 Bot 或群聊在侧栏显示小图钉。设置页包括：通用（外观）、Bot（主 Bot 与各 Bot 设置）、群聊（各群设置）、连接器、定时任务、用量、密钥、反馈，以及关于 ebot（版本、更新与链接）。

## 安装

[项目主页](../README.md#安装)有 dsh Desktop 与 dsh Web 的完整步骤。简要如下：

- dsh Desktop：设置 → 插件 → 添加 `ebot`（npm）、`.tgz` 文件，或 `github:a112121788/DeepSeek-Bot#v0.1.3&path:/ebot`。
- 命令行：`dsh plugin --profile desktop add ebot`（或 `--profile web`）。

从检出目录开发时，把插件加到 dsh profile 里作为链接依赖和 bundle：

```json
{
  "dependencies": { "ebot": "link:/path/to/ebot" },
  "dsh": { "profile": { "bundles": ["@deepseek-ai/dsh-base", "@deepseek-ai/dsh-web-app", "ebot"] } }
}
```

在 profile 目录运行 `pnpm install`，再从 deepseek-harness 仓库启动 dsh：

```sh
pnpm -s dsh --profile web --no-open
```

团队第一次打开时，插件会创建一个叫「总管」的主 Bot，角色是「幕僚长」。

**从旧包 `dsh-bot` 升级**：更早的构建用包名 `dsh-bot`。先从 profile 去掉 `dsh-bot` 再加 `ebot`，因为两者都用插件 id `bot`。团队、对话与密钥仍在原处（见[数据与备份](#数据与备份)）。浏览器里保存的设置不会迁过来。

## 配置

选项写在 profile 的 `cordis.patch.yml` 里，挂在 `bot` 条目下。全部可选。

```yaml
- id: bot
  name: ebot
  config:
    workspace: /path/to/workspace   # Bot 工作目录；默认 <home>/workspace
    home: /path/to/bot-data         # 团队存盘位置；默认 $DSH_HOME/bot
    checkRatio: 0.8                 # 可用窗口中 steward 做决定的比例
    browser: true                   # 强制开关 Bot 浏览器；默认仅 Desktop 开启
    memory: true                    # false 关闭记忆：无记忆工具、段落与面板
    memoryReview: true              # false 时只靠 Bot 自己的 remember 调用
    diagnosticsFile: false          # 错误日志只留在内存；默认 <home>/logs/diagnostics.jsonl
    updateCheck: true               # 窗口打开时检查更新；默认 true
    updateRegistry: https://registry.example/   # 只向该 npm registry 查更新
    github: false                   # 隐藏 GitHub 连接器；默认在连接器里显示
    gitee: false                    # 隐藏 Gitee 连接器；默认在连接器里显示
```

**更新**：窗口打开时，ebot 会按安装来源查是否有新版本：npm registry（DSH 插件管理器使用的源及其回退），或 `github:…#vX.Y.Z` 安装对应的最新 GitHub release。有新版本时，侧栏右上角出现云朵按钮；点 **更新** 经 DSH 插件管理器重装，新版本从下次启动 dsh 起生效。链接或本地检出不会提示更新。设置 → 关于 ebot 显示同一状态，并可用 **检查更新** 立刻再查。

同一卡片也可携带 DSH 自身：某个 ebot release 可声明它验证过的 DSH 版本（`package.json` 里的 `dsBot.verifiedDsh`），且只提供该版本——跑得更新也会被当成降级提议。未声明版本则不提供 DSH 更新。用 npm 安装的 DSH 会通过 `npm install -g @deepseek-ai/dsh@<version>` 切换。DSH Desktop 安装其自带更新器找到的最新版，因此仅当该版本就是验证版本时卡片才显示 DSH，**打开更新** 打开应用自己的更新面板。release 还可用 `dsBot.minBot` 抬高门槛：Bot 自身未到该版本前，DSH 行会等待。

## 模型

模型提供方用 dsh 的 `llm-pi-ai` 插件在 `cordis.patch.yml` 里配置。每个 Bot 跑自己的一个模型，来自 DSH 提供的模型列表。新团队的第一个主 Bot 起初没有模型：对话打开模型卡片，选好后才问候用户。创建 Bot 表单默认落在 DSH 默认模型上。Bot 详情与设置（或主 Bot 的 `update_bot`）可更换；模型不再可用时会再次显示卡片。旧版存盘的团队保留各 Bot 上次使用的模型。

- 请给每个模型配置 `contextWindow`。ebot 据此划线：可用窗口 = 窗口减去回复预留（`maxTokens`），硬线为其 95%，检查线为 `checkRatio`。没有 `contextWindow` 时用适配器默认值（`llm-pi-ai` 为 262,144），可能与该模型不符；完全不报告窗口时按 500,000 计。
- 要发图片，提供方需 `defaultInput: [ text, image ]`。
- 不要把 API key 写进仓库。用 dsh 自带的密钥存储或环境变量。

## 记忆

Bot 会记住应跨过单次对话保留的内容：偏好、决定、纠正，以及不该再问的事实。记忆是 [Agent Memory Repo](https://github.com/AgentMemoryRepo/agentmemoryrepo) 格式的纯 Markdown：一行一条，以 `[source: …; added: …]` 结尾。

每个回合结束后，记忆审阅会读取 Bot 对话（以及各群中每位成员）的新内容，自行保留、更新或删除条目，因此记忆不依赖 Bot 是否调用 `remember`。它只保留你说的内容，用你的语言写条目，并拒绝密钥、密码与身份证号。

- **两个范围**：每个 Bot 有自己的记忆，团队记忆则所有 Bot 可读。Bot 写自己的记忆。主 Bot 与（任意群的）群管理员还可写团队记忆；你要求时，主 Bot 可读改其他 Bot 的记忆。
- **工具**：`remember` 保存或替换条目（`replace`），`forget` 删除，`recall` 搜索全部条目、整读某个主题，或列出已存内容。Bot 会补上来源（如 `part 2 #1234`，可用 `read_own_chat` 打开）与日期；替别人写时用 `by:` 署名。
- **文件**：`MEMORY.md` 放每次对话都需要的内容，细节放主题文件，并在其 `## Index` 里以 `[[topic]]` 链接。
- **进入提示词**：两份 `MEMORY.md` 都会进入 Bot 的系统提示。段落在 Session 启动时冻结，以便提供方提示缓存命中；变更从下一个 part 或检查点起生效，`recall` 则立刻能找到。
- **固定上限**：一条最多 300 字符，一份 `MEMORY.md` 4,000，一个主题 16,000，一个范围最多 40 个主题。超限保存会失败并说明如何腾出空间。
- **安全**：记忆是数据，不是指令。像密钥或 token 的条目会被拒绝；也告知 Bot 不要保存网页、文件或工具结果要求它记住的内容。
- **历史**：文件就地改写，`journal.jsonl` 保留每次变更的前后行。删除 Bot 时，其记忆移到 `archive/`。

**记忆面板**：Bot 详情有「记忆」行并显示条目数；「管理」打开记忆面板。

- **记忆摘要**：Bot 的模型按界面语言，从全部条目写成短散文摘要。条目变化时重写，⋯ 菜单也可重新生成。
- **全部条目**：⋯ 菜单按范围与主题列出每条，含日期与作者，以及各 `MEMORY.md` 的大小。删除需点两次。
- **询问或更新**：问 Bot 还记得什么，或告诉它增改删什么。一次模型调用只依据条目作答，变更走与工具相同的检查。
- 对话里的「记忆已更新」行表示 Bot 改了记忆并可打开面板。后台变更时，聊天顶部的 Bot 胶囊会短暂拉长显示「记忆已更新」；点击即打开记忆面板。

只读 dsh（见[数据与备份](#数据与备份)）可看记忆但不能改。

## 网页搜索

包内还有第二个插件 `ebot/web-search`。它注册搜索提供方 `auto`，并由 `cordis.patch.yml` 设为默认。每次搜索按此顺序：

1. 若 profile 指定了其他 `searchProvider`，用那个。
2. 当前模型路由自带的搜索，使用该路由的密钥与主机。插件认识 Anthropic Messages、OpenAI Responses 与 Gemini 协议，以及若干搜索 API（Ollama、Kimi、智谱、MiMo）。可用 `searchApis` 追加。
3. 无密钥回退：Bing 与 DuckDuckGo 的公开结果页。
4. 全部失败则搜索失败，并告诉模型不要猜测地址。

每条结果以 `Search backend: …` 开头，标明走了哪条路径。

## Bot 浏览器

在 dsh Desktop 中，Bot 对话标题栏有地球按钮，打开该 Bot 自己的浏览器面板。

- **每个 Bot 一个分区**（`bot:<id>`）：登录与 cookie 只属于该 Bot。
- **Bot 可读页面**：`read_browser` 读 DOM，不是截图。文本变成带标题、嵌套列表、表格、代码块与引用的 Markdown。链接与表单控件在文中标为 `[#n]`，并在下方列出目标与取值。也会读取你选中的文字。长页面可分段读（`from`）。页面内容当作数据，永不当作指令。
  - 可读开放 Shadow DOM（含 `<slot>`）以及同域 iframe，最多 3 层。
  - 只读可见内容：跳过 `display:none`、`visibility:hidden`、零高度与合上的 `<details>`。
  - 永不读取密码、信用卡（`autocomplete="cc-*"`）或一次性验证码字段的值。
  - 上限：400,000 字符、150,000 节点、每表 5,000 行、3,000 个链接与控件、1.5 秒。被截断时会说明。
  - 读不了跨域 iframe（一行带地址）、封闭 shadow root、canvas 内容（在线编辑器、地图），或 CSS `::before` / `::after` 文字。按需渲染的页面只读已渲染部分。
  - 只读：Bot 还不能点击、输入、滚动或打开地址。
- **地址**：仅 http 与 https。允许 localhost 与局域网；不允许云元数据地址（如 `169.254.x.x`）与 dsh 自己的端口。
- 浏览器面板与详情抽屉共用右侧栏；打开一个会关闭另一个。切换对话会切换到对应 Bot 的面板。删除 Bot 会清掉其浏览器与已存地址。

dsh Web 没有浏览器面板，也没有 `read_browser` 工具。

## 密钥

Bot 需要 API key、token 或密码时调用 `request_secret`，卡片出现在它自己的对话里。Bot 永远看不到明文。

- **填写**：输入框隐藏内容，不属于表单、也不会自动填充。选择「全部 Bot」或「仅此 Bot」后保存。至少 4 个字符（4 位 PIN 可用）。8 个字符及以上会在所有出现处隐藏；更短的只在两侧没有字母数字时隐藏，以免普通词被误伤。
- **授权**：密钥已保存但此 Bot 尚未获准使用时，卡片只询问是否授权；也可在此替换取值。
- **使用**：取值只进入 Bot 的 shell 环境，名为 `DSH_SECRET_<NAME>`（bash 里 `$DSH_SECRET_NAME`，PowerShell 里 `$env:DSH_SECRET_NAME`）。`list_secrets` 列出该 Bot 可用的名称。
- **遮罩**：工具结果落盘前、以及每次请求发给模型前，每个密钥明文副本都会被替换为 `[secret:<NAME>]`。
- **管理**：设置 → 密钥按名称、用途、请求它的 Bot 与最近使用列出。可改权限、替换取值、删除或新增。删除 Bot 会从每个密钥的授权里去掉它。
- **存储**：`<DSH_HOME>/bot/secrets.json`，文件模式 600，原子写入。取值从不进 `state.json` 或日志。

限制：

- Windows 上文件模式无效，只靠用户目录保护。
- 只遮罩完全相同的副本。Bot 若编码、拆分或反转取值仍可能打印出来。不要把重要密钥交给不信任的 Bot。
- 非 HTTPS 页面（例如局域网用 http 打开的 dsh Web）上，取值会明文过网。卡片会警告。
- 群聊不显示卡片；Bot 在自己的对话里索要。

## 数据与备份

插件把数据保存在 `config.home`。未配置时目录为 `$DSH_HOME/bot`；未设 `DSH_HOME` 时为 `~/.dsh/bot`。

| 系统 | 默认目录 |
|---|---|
| Linux、macOS | `~/.dsh/bot/` |
| Windows | `C:\Users\<user>\.dsh\bot\` |

- 要整体迁移 dsh 数据（Session、profile 与插件数据），设置 `DSH_HOME`。
- 只迁移本插件数据，在配置里设 `home`（见[配置](#配置)）。

`bot/` 里的文件：

| 文件 | 内容 |
|---|---|
| `state.json` | 团队：Bot、群、Bot 间消息、偏好与未决问题 |
| `state.lock` | 正在使用这份数据的 dsh（pid 与主机）。该 dsh 退出时删除。 |
| `chat-index.sqlite` | 旧对话 part 的全文索引（`read_own_chat`）；删掉会重建 |
| `usage.sqlite` | 用量页的 Token 计数；删掉后可从 Session 日志重建，只会丢掉日志外的调用与已删 Bot 的名字 |
| `memory/` | 记忆（见[记忆](#记忆)）：`bots/<id>/` 与 `team/`（`MEMORY.md` 与主题）、`journal.jsonl`（每次变更）、`snapshots/`（各 Session 冻结的段落）、`summaries/`（面板摘要，可删）、`reviewed.json`（记忆审阅读到哪里）与 `archive/`（已删 Bot） |
| `ocr.json` | 图片文字缓存；可删 |
| `workspace` | Bot 的工作目录（`config.workspace` 可改） |
| `secrets.json` | 已存密钥。备份时按密码对待。 |
| `logs/diagnostics.jsonl` | 最近错误与警告，已去掉密钥、token、已存密钥与主目录。超过 1 MB 会滚到 `diagnostics.jsonl.1`。可删。 |

对话本身是 dsh Session，不在 `bot/` 里：在 `~/.dsh/sessions/`。dsh 的工作区列表在 `~/.dsh/storages/workspace.json`，profile（含模型设置）在 `~/.dsh/profiles/`。Bot 浏览器登录不会落盘：Desktop 只把每个 Bot 的分区放在内存里。

**备份与恢复**

1. 完全退出 dsh（Web 服务与 Desktop），确保 `state.json` 已写完。
2. 复制整个 `~/.dsh/`（至少 `bot/`、`sessions/` 与 `storages/`）。只复制 `bot/` 会丢掉对话。
3. 恢复时先退出 dsh，把目录放回原处，再启动 dsh。

**迁到另一台电脑**：`state.json` 没有绝对路径，但 dsh 的 `storages/workspace.json` 与 Session 目录名含有工作区绝对路径。新电脑路径相同则可直接复制。路径不同（另一用户名或系统）时，dsh 能否找到旧 Session 尚未验证。

**同时开 dsh Web 与 Desktop**：默认都用同一个 `~/.dsh`。先加载团队的那个 dsh 拿到 `bot/state.lock`，可以改团队。另一个只读：能显示并跟随文件变化，但拒绝改动（`bot/read-only`，「在另一个 dsh 中打开」），其 Bot 也不能开新 Session。第一个退出后，另一个在下次请求时接管。若要两边同时改，给其中一个不同的 `DSH_HOME`（两套独立团队）。

## 开发

需要 Node 24、pnpm，以及旁边装好依赖的 deepseek-harness 检出（`../deepseek-harness`，或设 `DSH_HARNESS`）。Desktop 测试台还需要 `xvfb-run` 与 `ffmpeg`。Web 截图需要 Chrome 或 Chromium（`CHROME_BIN`；默认 `google-chrome` 或 `chromium`）。

```sh
npm ci                                   # esbuild，用于客户端构建
npm run build                            # src/client → client.js
npm test                                 # 单元测试
npm run lint                             # 用 dsh 仓库的 oxlint（.oxlintrc.json）
dev/bench.sh dev 3100 8800 start         # Web 测试台：mock 模型 + dsh Web，数据在 ../.dsh-test-dev
dev/desktop-linux/desktop.sh dev start   # Desktop 测试台：mock 模型 + Xvfb 里的 dsh Desktop
CONTEXT_WINDOW=100000 CHECK_RATIO=0.45 dev/bench.sh smoke 3101 8801 reset && node dev/smoke.mjs smoke 3101
dev/check.sh                             # 全部检查（见下）
```

- `client.js` 由 `src/client/` 构建并提交，因此 `link:` 与 Git 安装无需再构建。不要手改 `client.js`；`npm test` 会检查它与源码一致。改 `src/client/` 后跑 `npm run build` 并刷新页面。改 `index.js` 或 `src/host/` 后重启 dsh。
- **Web 测试台** `dev/bench.sh <name> <web port> <mock port> [start|stop|reset|status]`：脚本化 mock 模型（`dev/mock-llm.mjs`，无真实 token；命令列在文件顶部）与 dsh Web 服务。数据在 `../.dsh-test-<name>/`；`reset` 先清空团队与 Session。带 token 的登录地址在 `../.dsh-test-<name>/web.log`。
- **Desktop 测试台** `dev/desktop-linux/desktop.sh <name> [start|stop|reset|status]`：dsh 不在 Linux 上跑 Desktop；`launch.mts` 在 Xvfb 里跑未打包 Desktop。首次启动会下载 Electron 与 Linux runtime（数分钟）。`start` 在 1400×860 窗口出现团队后返回。
- **全部检查** `dev/check.sh [--skip steps] [--only steps] [--out dir]`：`unit`、`build`、`lint`、`smoke`、`web`（侧栏、对话、群聊、Bot 设置、Bot 页与群设置截图）与 `desktop`（同样截图，再加 Bot 浏览器检查）。会停掉它启动的一切。失败时标明步骤与日志并以非零退出。首次下载后完整跑大约 3 分钟。
- **端口**：每个脚本接受 `SLOT=n`（0–9，默认 0），避免同机多人/多会话冲突：Web 台 `31n0` 与 mock `88n0`，smoke `31n1` 与 `88n1`，Desktop mock `88n2` 等。Desktop 大约占 1 GB 内存；用完请停掉。
- **真实模型**（会花 token）：`dev/steward-eval.mjs` 把手写对话结尾送进 context steward 自己的提示，经 OpenAI 兼容路由（或 `--api messages` 走 Anthropic Messages，如 DeepSeek 官方）检查每次决定。`dev/llm-tap.mjs <port> <upstream base URL> <log.jsonl> [body dir]` 是两种格式的日志透传：把提供方的 `baseURL` 指过来，每个调用写一行 JSON（steward、检查点、交接笔记或主回合、Bot 名、Token、回答，以及与该 Bot 上一请求首次分叉处——提供方缓存可复用的部分；从不写 headers）。带 body dir 时还会保存每个请求体。用法见各文件顶部。
- **截图**：`dev/ui-shots.mjs` 两套应用都能用（`desktop <dsh repo> <dir> <renderer port>` 或 `web <dsh repo> <dir> <bench name> <web port>`）。
- `npm test` 从 deepseek-harness 检出加载 `@deepseek-ai/*` 包。

## 目录结构

| 路径 | 用途 |
|---|---|
| `index.js` | 宿主入口：按顺序安装 `src/host/` 模块 |
| `src/host/` | 宿主：团队与存储（`roster`、`store`）、工具（`tools`）、回合与投递（`turns`、`delivery`）、群聊（`groups`）、对话 part、context steward 与索引（`parts`、`steward`、`chat-index`）、图片文字（`images`）、密钥（`secrets`）、Bot 浏览器（`browser`）、`POST api/bot` 路由（`channel`） |
| `src/client/` | 浏览器源码：侧栏、对话标题、转写单元格、面板与对话框、主题、Bot 浏览器面板 |
| `client.js` | 由 `scripts/build-client.mjs`（esbuild）从 `src/client/` 构建；已提交 |
| `web-search.js` | `auto` 搜索提供方；与团队代码独立 |
| `test/` | 单元测试与夹具 |
| `dev/characters.mjs` | 把角色（小型 3D 模型描边）构建进 `src/client/characters.js` 的 `CHARACTERS` 表 |
| `dev/` | mock 模型、测试台、smoke、Desktop 脚本、真实模型工具（steward 评估、日志透传） |

## 许可

[Apache-2.0](LICENSE)
