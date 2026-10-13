// Settings → Learn: a crash-course guide that teaches the Bot team in one read.
// Section titles go through t() like all copy; the bodies live here as plain text
// because they are long-form content with their own Markdown, and `build-client.mjs`
// bundles this module with `treeShaking: false`, so both languages ship and the page
// picks one at render time.
import { createElement as h } from 'react'
import { MarkdownText } from '@deepseek-ai/dsh-client-ui-primitives'
import { language, t } from './i18n.js'

// Each section keeps its two bodies beside each other instead of two parallel arrays.
const GUIDE = [
  {
    key: 'quick',
    title: 'The one-minute version',
    body: {
      en: [
        'ebot turns DeepSeek Harness into **a team of long-lived Bots**:',
        '- Every Bot is a real DSH session — it runs the normal agent loop with tools and model routes.',
        '- Bots talk to each other: `@Name` in a message calls that Bot; a group chat lets several Bots work on one thing with you.',
        '- Bots have clear roles. The **Main Bot** can create, change and remove other Bots; everyone else stays inside its own role.',
        '- You shape each Bot: its name, role label, instructions, model, and character.',
      ].join('\n'),
      zh: [
        'ebot 把 DeepSeek Harness 变成**一支长期在线的 Bot 团队**：',
        '- 每个 Bot 都是一个真实的 DSH 会话——走正常的 agent 循环，带工具和模型路由。',
        '- Bot 之间可以协作：在消息里写 `@名字` 就能点名某个 Bot；群聊让你和多个 Bot 共同处理一件事。',
        '- 分工明确：**主 Bot** 可以创建、修改和删除其他 Bot；其余 Bot 只在自己的角色内干活。',
        '- 每个 Bot 都由你定制：名字、角色标签、指令、模型和角色性格。',
      ].join('\n'),
    },
  },
  {
    key: 'basics',
    title: 'Core ideas',
    body: {
      en: [
        '| Idea | What it means |',
        '|---|---|',
        '| Bot | A long-lived teammate with its own chat, instructions and model. It keeps its session, so it remembers its work. |',
        '| Main Bot | The lead. It can create Bots, edit them, and remove them. There can be more than one. |',
        '| Group chat | Several Bots on one task. `@Name` a Bot to bring it in; the group admin runs the turn-taking. |',
        '| Memory | `MEMORY.md` is read by every conversation; save facts there so the whole team knows them. |',
        '| Character | The face and manner of a Bot. Pick one in its settings, or draw your own. |',
      ].join('\n'),
      zh: [
        '| 概念 | 含义 |',
        '|---|---|',
        '| Bot | 一位长期共事的队友，有自己的对话、指令和模型。会话长期保留，所以它记得自己做过什么。 |',
        '| 主 Bot | 团队负责人。可以创建、编辑、删除 Bot，可以有多个。 |',
        '| 群聊 | 多个 Bot 处理同一件事。写 `@名字` 点名 Bot 入场，群主负责调度回合。 |',
        '| 记忆 | `MEMORY.md` 每次对话都会读；把团队都要知道的事实写进去。 |',
        '| 角色性格 | Bot 的形象和脾气。在它的设置里挑选，也可以自己画一个。 |',
      ].join('\n'),
    },
  },
  {
    key: 'day',
    title: 'First ten minutes',
    body: {
      en: [
        '1. **Say hello to the Main Bot.** It answers in your chat and can set up the rest of the team for you.',
        '2. **Ask it for a team.** For example: “Set up a writer and a coder, and add them to a group with you.”',
        '3. **Check the sidebar.** Each Bot gets a tile with its unread marks and a working badge while it runs.',
        '4. **Try a group chat.** Send one message that names both Bots and watch the relay.',
        '5. **Open the details drawer** (ⓘ) on a chat to read the Bot\'s own view, change its model, or share the conversation.',
      ].join('\n'),
      zh: [
        '1. **先和主 Bot 打个招呼。** 它在你的对话里直接回复，也可以替你把团队搭起来。',
        '2. **让它帮你建团队。** 比如说：「帮我建一个写作和一个写代码的 Bot，拉你一起建个群。」',
        '3. **看看侧栏。** 每个 Bot 一块头像牌，有未读标记，干活时会亮出工作徽章。',
        '4. **试一次群聊。** 发一条同时点名两个 Bot 的消息，看它们怎么接力。',
        '5. **打开详情抽屉**（ⓘ）：查看 Bot 自己的对话、换模型，或复制整段对话。',
      ].join('\n'),
    },
  },
  {
    key: 'good',
    title: 'Getting good results',
    body: {
      en: [
        '- **One job, one Bot.** A narrow role label and short instructions beat a long essay.',
        '- **Pick the model per job.** Fast models for routine turns; stronger ones for planning and review.',
        '- **One request at a time.** A single, concrete ask keeps each answer on evidence.',
        '- **Let Bots hand work over.** `@Coder` inside the Writer\'s chat asks Coder directly — no copy-paste.',
        '- **Use groups for work that needs several skills.** The admin keeps the turns tidy.',
      ].join('\n'),
      zh: [
        '- **一个岗位一个 Bot。** 角色标签写窄一点，指令写短一点，比长篇大论更管用。',
        '- **按任务挑模型。** 日常回合用快模型，规划、审查用强模型。',
        '- **一次一件事。** 一次只提一个具体的请求，答案才更有依据。',
        '- **让 Bot 互相交接。** 在写作 Bot 的对话里 `@Coder` 就能直接叫到写代码的 Bot，无需复制粘贴。',
        '- **需要多种技能的活放进群聊。** 群主会把回合安排得井井有条。',
      ].join('\n'),
    },
  },
  {
    key: 'faq',
    title: 'Good to know',
    body: {
      en: [
        '**Where does my team live?** In your DSH home, next to your sessions. The plugin never touches another DSH install.',
        '**A Bot stopped answering.** Check the diagnostics drawer (the ⚠ in the chat header) — failures and retries are recorded there.',
        '**Can a Bot run on its own?** Yes: give it a schedule in Settings → Scheduled tasks, and it wakes up on time.',
        '**Want the full picture?** Read the README in the repository — this page is only the short course.',
      ].join('\n\n'),
      zh: [
        '**团队数据放在哪？** 在你的 DSH 主目录里，和会话放在一起。插件不会碰其他 DSH 安装的数据。',
        '**某个 Bot 不回话了？** 打开对话页眉的 ⚠ 诊断抽屉——失败和重试都记录在那里。',
        '**Bot 能自己定时干活吗？** 能。在「设置 → 定时任务」里给它排班，到点自动唤醒。',
        '**想看完整说明？** 读仓库里的 README——本页只是速成课。',
      ].join('\n\n'),
    },
  },
]

export function LearnPage() {
  const zh = language().startsWith('zh')
  return GUIDE.map(section => h('section', { key: section.key, className: 'bt-set-section bt-learn' },
    h('h3', null, t(section.title)),
    h('div', { className: 'bt-set-card' },
      h('div', { className: 'bt-learn-body' }, h(MarkdownText, { text: zh ? section.body.zh : section.body.en, variant: 'compact' })))))
}

export const LEARN_CSS = `
.bt-learn .bt-learn-body{font-size:13px;line-height:20px;color:var(--bt-ink)}
.bt-learn .bt-learn-body [class*="_markdown"]{color:inherit}
.bt-learn .bt-learn-body table{display:block;max-width:100%;overflow-x:auto;border-collapse:collapse;font-size:12.5px}
.bt-learn .bt-learn-body th,.bt-learn .bt-learn-body td{border:.5px solid var(--bt-line-2,var(--bt-line));padding:5px 9px;text-align:left;vertical-align:top}
`
