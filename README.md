# 拼音星际闯关（AI版）

适合 3-7 岁小朋友的拼音闯关小游戏，已接入 Kimi 2.5 能力：
- AI 动态出题（按薄弱点调整）
- AI 鼓励式反馈
- 酷炫科幻风 UI + 连击 + 提示机制

## 本地运行

```bash
npm install
cp .env.example .env
npm start
```

打开 `http://localhost:3000`

## 环境变量

创建 `.env`：

```env
PORT=3000
MOONSHOT_API_KEY=你的_key
```

> 未配置 `MOONSHOT_API_KEY` 时会自动使用内置 fallback 题库，不影响基本游玩。

## 主要接口

- `POST /api/ai/generate-question`
- `POST /api/ai/evaluate-answer`
