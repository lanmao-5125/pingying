import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();
app.use(express.json({ limit: '1mb' }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fallback = [
  { word: '猫', pinyin: 'māo', emoji: '🐱', choices: ['māo', 'niú', 'gǒu', 'yú'] },
  { word: '狗', pinyin: 'gǒu', emoji: '🐶', choices: ['māo', 'gǒu', 'jī', 'niǎo'] },
  { word: '鱼', pinyin: 'yú', emoji: '🐟', choices: ['qū', 'yú', 'rì', 'mù'] }
];

function pickOne(excludedWords = []) {
  const pool = fallback.filter(q => !excludedWords.includes(q.word));
  const list = pool.length ? pool : fallback;
  return list[Math.floor(Math.random() * list.length)];
}

app.post('/api/ai/generate-question', async (req, res) => {
  try {
    const { age = '5-6', weakPoints = [], recentWords = [] } = req.body || {};
    const key = process.env.MOONSHOT_API_KEY;
    if (!key) return res.json({ ok: true, source: 'fallback', question: pickOne(recentWords) });

    const prompt = `你是儿童拼音老师。请生成1道适合${age}岁儿童的拼音选择题。
严格只返回JSON对象，字段必须包含：word,pinyin,emoji,choices。
choices必须是4个字符串且仅1个正确答案。
可参考薄弱点：${weakPoints.join(',') || '无'}。
最近已出过的字：${recentWords.join(',') || '无'}，尽量不要重复这些字。
不要输出markdown、不要解释、不要代码块。`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);

    const r = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: 'kimi-k2.5',
        temperature: 1,
        messages: [{ role: 'user', content: prompt }]
      }),
      signal: controller.signal
    }).finally(() => clearTimeout(timer));

    const data = await r.json();
    const text = data?.choices?.[0]?.message?.content || '{}';
    if (!data?.choices?.[0]?.message?.content) {
      console.warn('[AI] empty content, provider response=', JSON.stringify(data).slice(0, 500));
    }

    let json = null;
    try {
      const raw = text.match(/\{[\s\S]*\}/)?.[0] || '{}';
      json = JSON.parse(raw);
    } catch {
      json = null;
    }

    if (!json || !json.word || !json.pinyin || !Array.isArray(json.choices) || json.choices.length < 2) {
      console.warn('[AI] bad json, fallback. raw=', text?.slice?.(0, 400));
      return res.json({ ok: true, source: 'fallback', question: pickOne(recentWords) });
    }

    if (recentWords.includes(json.word)) {
      return res.json({ ok: true, source: 'fallback', question: pickOne(recentWords) });
    }

    json.choices = json.choices.slice(0, 4);
    while (json.choices.length < 4) {
      json.choices.push(pickOne(recentWords).pinyin);
    }

    return res.json({ ok: true, source: 'kimi', question: json });
  } catch (e) {
    console.warn('[AI] request error, fallback:', e?.message || e);
    return res.json({ ok: true, source: 'fallback', question: pickOne((req.body && req.body.recentWords) || []) });
  }
});

app.post('/api/ai/evaluate-answer', async (req, res) => {
  const { correct = false, answer = '', target = '' } = req.body || {};
  const cheers = ['太棒啦！你真厉害！', '答对啦，继续冲鸭！', '你就是拼音小天才！'];
  const guide = [`再试试，正确答案是 ${target}`, `别着急，答案是 ${target}`];
  return res.json({ ok: true, text: correct ? cheers[Math.floor(Math.random() * cheers.length)] : guide[Math.floor(Math.random() * guide.length)] });
});

app.use(express.static(__dirname));
app.get('*', (_, res) => res.sendFile(path.join(__dirname, 'index.html')));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`AI game server listening on :${port}`));
