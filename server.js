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

function pickOne() { return fallback[Math.floor(Math.random() * fallback.length)]; }

app.post('/api/ai/generate-question', async (req, res) => {
  try {
    const { age = '5-6', weakPoints = [] } = req.body || {};
    const key = process.env.MOONSHOT_API_KEY;
    if (!key) return res.json({ ok: true, source: 'fallback', question: pickOne() });

    const prompt = `你是儿童拼音老师。为${age}岁儿童生成1道拼音选择题，JSON格式返回：{"word":"汉字","pinyin":"带声调","emoji":"一个emoji","choices":["选项1","选项2","选项3","选项4"]}。\n要求：用常见字，选项包含1个正确答案，最多参考薄弱点：${weakPoints.join(',') || '无'}。仅返回JSON，不要额外文字。`;

    const r = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: 'kimi-k2.5',
        temperature: 0.7,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await r.json();
    const text = data?.choices?.[0]?.message?.content || '{}';
    const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
    if (!json.word || !json.pinyin || !Array.isArray(json.choices)) throw new Error('bad json');
    return res.json({ ok: true, source: 'kimi', question: json });
  } catch (e) {
    return res.json({ ok: true, source: 'fallback', question: pickOne() });
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
