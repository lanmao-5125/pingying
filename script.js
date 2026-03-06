const questions = [
  { word: '猫', pinyin: 'māo', emoji: '🐱', choices: ['māo', 'niú', 'gǒu', 'yú'] },
  { word: '狗', pinyin: 'gǒu', emoji: '🐶', choices: ['māo', 'gǒu', 'jī', 'niǎo'] },
  { word: '鱼', pinyin: 'yú', emoji: '🐟', choices: ['qū', 'yú', 'rì', 'mù'] },
  { word: '花', pinyin: 'huā', emoji: '🌸', choices: ['huā', 'huǒ', 'shuǐ', 'fēng'] },
  { word: '车', pinyin: 'chē', emoji: '🚗', choices: ['chē', 'cūn', 'chéng', 'shū'] },
  { word: '山', pinyin: 'shān', emoji: '⛰️', choices: ['sān', 'shān', 'xiān', 'hǎi'] },
  { word: '火', pinyin: 'huǒ', emoji: '🔥', choices: ['huā', 'huǒ', 'huī', 'huáng'] },
  { word: '云', pinyin: 'yún', emoji: '☁️', choices: ['yún', 'yǔ', 'yuè', 'yáng'] },
  { word: '门', pinyin: 'mén', emoji: '🚪', choices: ['mén', 'mǎ', 'mù', 'miàn'] },
  { word: '水', pinyin: 'shuǐ', emoji: '💧', choices: ['shuǐ', 'shǒu', 'sǔn', 'shí'] }
];

const state = { idx: 0, score: 0, lives: 3, locked: false };

const el = {
  level: document.getElementById('level'),
  score: document.getElementById('score'),
  lives: document.getElementById('lives'),
  emoji: document.getElementById('emoji'),
  word: document.getElementById('word'),
  choices: document.getElementById('choices'),
  feedback: document.getElementById('feedback'),
  nextBtn: document.getElementById('nextBtn'),
  speakBtn: document.getElementById('speakBtn'),
  barFill: document.getElementById('barFill'),
  progressText: document.getElementById('progressText'),
  resultModal: document.getElementById('resultModal'),
  resultTitle: document.getElementById('resultTitle'),
  resultDesc: document.getElementById('resultDesc'),
  restartBtn: document.getElementById('restartBtn')
};

function shuffle(arr) {
  return arr.map(v => ({ v, r: Math.random() })).sort((a, b) => a.r - b.r).map(x => x.v);
}

function speak(text) {
  if (!window.speechSynthesis) return;
  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = 'zh-CN';
  msg.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(msg);
}

function updateHeader() {
  el.level.textContent = state.idx + 1;
  el.score.textContent = state.score;
  el.lives.textContent = state.lives;
  const done = state.idx;
  const total = questions.length;
  el.barFill.style.width = `${(done / total) * 100}%`;
  el.progressText.textContent = `${done} / ${total}`;
}

function renderQuestion() {
  const q = questions[state.idx];
  state.locked = false;
  el.feedback.textContent = '';
  el.nextBtn.classList.add('hidden');

  el.emoji.textContent = q.emoji;
  el.word.textContent = q.word;
  el.choices.innerHTML = '';

  shuffle(q.choices).forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'choice';
    btn.textContent = choice;
    btn.onclick = () => selectChoice(btn, choice, q.pinyin);
    el.choices.appendChild(btn);
  });

  updateHeader();
}

function selectChoice(btn, choice, answer) {
  if (state.locked) return;
  state.locked = true;

  const all = [...document.querySelectorAll('.choice')];
  const isRight = choice === answer;

  all.forEach(b => {
    if (b.textContent === answer) b.classList.add('correct');
  });

  if (isRight) {
    state.score += 10;
    el.feedback.textContent = '🎉 太棒啦！答对了！';
    btn.classList.add('correct');
    speak('太棒啦，答对了');
  } else {
    state.lives -= 1;
    btn.classList.add('wrong');
    el.feedback.textContent = `💡 正确答案是 ${answer}`;
    speak('再试试，你可以的');
  }

  updateHeader();

  if (state.lives <= 0) {
    setTimeout(() => finish(false), 700);
  } else {
    el.nextBtn.classList.remove('hidden');
  }
}

function next() {
  state.idx += 1;
  if (state.idx >= questions.length) {
    finish(true);
    return;
  }
  renderQuestion();
}

function finish(success) {
  el.barFill.style.width = '100%';
  el.progressText.textContent = `${questions.length} / ${questions.length}`;
  el.resultModal.classList.remove('hidden');
  if (success) {
    el.resultTitle.textContent = '🏆 恭喜通关！';
    el.resultDesc.textContent = `你获得了 ${state.score} 分，拼音小勇士就是你！`;
    speak('恭喜你，闯关成功');
  } else {
    el.resultTitle.textContent = '🌟 不要灰心';
    el.resultDesc.textContent = `你获得了 ${state.score} 分，再挑战一次会更棒！`;
    speak('不要灰心，再来一次');
  }
}

function restart() {
  state.idx = 0;
  state.score = 0;
  state.lives = 3;
  el.resultModal.classList.add('hidden');
  renderQuestion();
}

el.nextBtn.addEventListener('click', next);
el.restartBtn.addEventListener('click', restart);
el.speakBtn.addEventListener('click', () => {
  const q = questions[state.idx];
  speak(`${q.word}，请选出正确拼音`);
});

renderQuestion();
