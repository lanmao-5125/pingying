const totalRounds = 10;
const localBank = [
  { word:'猫', pinyin:'māo', emoji:'🐱', choices:['māo','miāo','máo','mào'] },
  { word:'狗', pinyin:'gǒu', emoji:'🐶', choices:['gǒu','gōu','gòu','guǒ'] },
  { word:'鱼', pinyin:'yú', emoji:'🐟', choices:['yú','yǔ','yù','yúe'] },
  { word:'鸟', pinyin:'niǎo', emoji:'🐦', choices:['niǎo','niào','liǎo','niáo'] },
  { word:'牛', pinyin:'niú', emoji:'🐮', choices:['niú','niǔ','niù','liú'] },
  { word:'羊', pinyin:'yáng', emoji:'🐑', choices:['yáng','yǎng','yàng','liáng'] },
  { word:'马', pinyin:'mǎ', emoji:'🐴', choices:['mǎ','má','mà','mā'] },
  { word:'兔', pinyin:'tù', emoji:'🐰', choices:['tù','tǔ','tú','dù'] },
  { word:'花', pinyin:'huā', emoji:'🌸', choices:['huā','huá','huǎ','huà'] },
  { word:'草', pinyin:'cǎo', emoji:'🌿', choices:['cǎo','cāo','cào','chǎo'] },
  { word:'树', pinyin:'shù', emoji:'🌳', choices:['shù','shǔ','shū','sù'] },
  { word:'山', pinyin:'shān', emoji:'⛰️', choices:['shān','sān','shǎn','shàn'] },
  { word:'河', pinyin:'hé', emoji:'🏞️', choices:['hé','hè','hě','kē'] },
  { word:'云', pinyin:'yún', emoji:'☁️', choices:['yún','yǔn','yùn','yóng'] },
  { word:'雨', pinyin:'yǔ', emoji:'🌧️', choices:['yǔ','yù','yū','yú'] },
  { word:'雪', pinyin:'xuě', emoji:'❄️', choices:['xuě','xué','xūě','xiě'] },
  { word:'风', pinyin:'fēng', emoji:'🌬️', choices:['fēng','féng','fěng','fèng'] },
  { word:'火', pinyin:'huǒ', emoji:'🔥', choices:['huǒ','huō','huó','hǔo'] },
  { word:'水', pinyin:'shuǐ', emoji:'💧', choices:['shuǐ','suǐ','shuí','shuì'] },
  { word:'日', pinyin:'rì', emoji:'☀️', choices:['rì','rǐ','rī','lì'] },
  { word:'月', pinyin:'yuè', emoji:'🌙', choices:['yuè','yǔe','yuě','yue'] },
  { word:'星', pinyin:'xīng', emoji:'⭐', choices:['xīng','xíng','xǐng','xìng'] },
  { word:'车', pinyin:'chē', emoji:'🚗', choices:['chē','cē','chě','chè'] },
  { word:'船', pinyin:'chuán', emoji:'🚢', choices:['chuán','chuǎn','chuàn','cuán'] },
  { word:'门', pinyin:'mén', emoji:'🚪', choices:['mén','mēn','mèn','měn'] },
  { word:'窗', pinyin:'chuāng', emoji:'🪟', choices:['chuāng','chuáng','chuǎng','chuàng'] },
  { word:'桌', pinyin:'zhuō', emoji:'🪑', choices:['zhuō','zuō','zhuó','zhuǒ'] },
  { word:'书', pinyin:'shū', emoji:'📚', choices:['shū','sū','shú','shǔ'] },
  { word:'笔', pinyin:'bǐ', emoji:'✏️', choices:['bǐ','bí','bì','pǐ'] },
  { word:'球', pinyin:'qiú', emoji:'⚽', choices:['qiú','qiúe','qǔ','jiú'] },
  { word:'米', pinyin:'mǐ', emoji:'🍚', choices:['mǐ','mí','mì','nǐ'] },
  { word:'面', pinyin:'miàn', emoji:'🍜', choices:['miàn','mián','mian','niàn'] },
  { word:'果', pinyin:'guǒ', emoji:'🍎', choices:['guǒ','gǔo','guō','gōu'] },
  { word:'茶', pinyin:'chá', emoji:'🍵', choices:['chá','chā','chǎ','chà'] },
  { word:'手', pinyin:'shǒu', emoji:'✋', choices:['shǒu','shóu','sǒu','shòu'] },
  { word:'足', pinyin:'zú', emoji:'🦶', choices:['zú','zǔ','zù','zhú'] },
  { word:'眼', pinyin:'yǎn', emoji:'👀', choices:['yǎn','yàn','yān','yán'] },
  { word:'耳', pinyin:'ěr', emoji:'👂', choices:['ěr','ér','ěrh','er'] },
  { word:'口', pinyin:'kǒu', emoji:'👄', choices:['kǒu','kòu','kōu','gǒu'] },
  { word:'鼻', pinyin:'bí', emoji:'👃', choices:['bí','bǐ','bì','pí'] }
];
const s = { idx: 0, score: 0, lives: 3, combo: 0, locked: false, hinted: false, q: null, weakPoints: [], recentWords: [] };
let nextQPromise = null;
let nextQCache = null;
let autoNextTimer = null;
let rewardHideTimer = null;

const rewardMedia = {
  '猫':'🐱','狗':'🐶','鱼':'🐟','鸟':'🐦','牛':'🐮','羊':'🐑','马':'🐴','兔':'🐰','花':'🌸','草':'🌿','树':'🌳',
  '山':'⛰️','河':'🏞️','云':'☁️','雨':'🌧️','雪':'❄️','风':'🌬️','火':'🔥','水':'💧','日':'☀️','月':'🌙','星':'⭐',
  '车':'🚗','船':'🚢','门':'🚪','窗':'🪟','桌':'🪑','书':'📚','笔':'✏️','球':'⚽','米':'🍚','面':'🍜','果':'🍎',
  '茶':'🍵','手':'✋','足':'🦶','眼':'👀','耳':'👂','口':'👄','鼻':'👃'
};
const albumUnlocked = new Set(JSON.parse(localStorage.getItem('albumUnlocked') || '[]'));
const $ = id => document.getElementById(id);
const el = {
  level: $('level'), score: $('score'), lives: $('lives'), combo: $('combo'),
  emoji: $('emoji'), word: $('word'), choices: $('choices'), feedback: $('feedback'),
  nextBtn: $('nextBtn'), speakBtn: $('speakBtn'), hintBtn: $('hintBtn'),
  barFill: $('barFill'), progressText: $('progressText'), mission: $('mission'),
  resultModal: $('resultModal'), resultTitle: $('resultTitle'), resultDesc: $('resultDesc'), restartBtn: $('restartBtn'),
  celebrationLayer: $('celebration-layer'), rewardCard: $('rewardCard'), rewardImg: $('rewardImg'), rewardText: $('rewardText'),
  albumBtn: $('albumBtn'), albumModal: $('albumModal'), albumGrid: $('albumGrid'), closeAlbumBtn: $('closeAlbumBtn')
};

function shuffle(a){return [...a].sort(()=>Math.random()-0.5)}
function speak(text){
  if(!window.speechSynthesis)return;
  const msg=new SpeechSynthesisUtterance(text);
  msg.lang='zh-CN'; msg.rate=.9;
  speechSynthesis.cancel(); speechSynthesis.speak(msg);
}
function pickLocalQuestion(){
  const pool = localBank.filter(q => !s.recentWords.slice(-12).includes(q.word));
  const list = pool.length ? pool : localBank;
  return JSON.parse(JSON.stringify(list[Math.floor(Math.random() * list.length)]));
}

function isValidQuestion(q){
  return q && typeof q.word==='string' && typeof q.pinyin==='string' && Array.isArray(q.choices) && q.choices.length>=2;
}

async function aiQuestion(){
  const r = await fetch('/api/ai/generate-question', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ age:'3-7', weakPoints: s.weakPoints.slice(-5), recentWords: s.recentWords.slice(-12) })
  });
  const data = await r.json();
  return data.question;
}

function prefetchNextQuestion(){
  nextQPromise = aiQuestion()
    .then(q => {
      if (isValidQuestion(q)) nextQCache = q;
      return q;
    })
    .catch(() => null);
}
async function aiFeedback(correct, target){
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 800);
  try{
    const r = await fetch('/api/ai/evaluate-answer', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ correct, target }),
      signal: controller.signal
    });
    return (await r.json()).text || (correct ? '答对啦！' : `正确答案是 ${target}`);
  }catch{ return correct ? '答对啦！' : `正确答案是 ${target}`; }
  finally { clearTimeout(timer); }
}
function beep(type='ok'){
  try{const ctx=new (window.AudioContext||window.webkitAudioContext)(); const o=ctx.createOscillator(), g=ctx.createGain(); o.connect(g); g.connect(ctx.destination); o.frequency.value=type==='ok'?780:260; g.gain.value=.001; g.gain.exponentialRampToValueAtTime(.08,ctx.currentTime+.01); g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.2); o.start(); o.stop(ctx.currentTime+.22);}catch{}
}
function update(){
  el.level.textContent=s.idx+1; el.score.textContent=s.score; el.lives.textContent=s.lives; el.combo.textContent=s.combo;
  el.barFill.style.width=`${(s.idx/totalRounds)*100}%`; el.progressText.textContent=`${s.idx} / ${totalRounds}`;
  el.mission.textContent = s.combo>=3 ? '⚡ 超能连击已激活：答对额外加分！' : '任务：连续答对 3 题触发超能连击';
}
function celebrate(){const st=document.querySelector('.stage');st.classList.add('pulse');setTimeout(()=>st.classList.remove('pulse'),450)}
function warn(){const st=document.querySelector('.stage');st.classList.add('shake');setTimeout(()=>st.classList.remove('shake'),350)}

function makeRewardImage(word){
  const icon = rewardMedia[word] || '🌟';
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='360'>
    <defs><linearGradient id='g' x1='0' x2='1'><stop stop-color='#36f7ff'/><stop offset='1' stop-color='#ff4dd8'/></linearGradient></defs>
    <rect width='100%' height='100%' fill='url(#g)'/>
    <circle cx='540' cy='70' r='40' fill='#ffe66e88'/><circle cx='80' cy='300' r='56' fill='#ffffff22'/>
    <text x='50%' y='52%' text-anchor='middle' font-size='120'>${icon}</text>
    <text x='50%' y='82%' text-anchor='middle' font-size='56' fill='#fff' font-family='PingFang SC, Microsoft YaHei'>${word}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function renderAlbum(){
  if (!el.albumGrid) return;
  const words = [...new Set(localBank.map(q => q.word))];
  el.albumGrid.innerHTML = words.map(w => {
    const unlocked = albumUnlocked.has(w);
    const icon = rewardMedia[w] || '🌟';
    return `<div class="album-item ${unlocked ? '' : 'locked'}"><span class="icon">${icon}</span><span>${unlocked ? w : '???'}</span></div>`;
  }).join('');
}

function showReward(word){
  if (!el.rewardCard) return;
  clearTimeout(rewardHideTimer);
  el.rewardImg.src = makeRewardImage(word);
  el.rewardText.textContent = `太棒啦！${word}答对了，继续冲呀！`;
  el.rewardCard.classList.remove('hidden');
  albumUnlocked.add(word);
  localStorage.setItem('albumUnlocked', JSON.stringify([...albumUnlocked]));
  renderAlbum();
  rewardHideTimer = setTimeout(hideReward, 950);
}

function hideReward(){
  if (!el.rewardCard) return;
  clearTimeout(rewardHideTimer);
  el.rewardCard.classList.add('hidden');
}

function comboCelebration(combo){
  const layer = el.celebrationLayer;
  if (!layer) return;

  const fireworkCount = combo >= 10 ? 12 : combo >= 8 ? 8 : combo >= 5 ? 5 : 3;
  const confettiCount = combo >= 10 ? 180 : combo >= 8 ? 120 : combo >= 5 ? 72 : 48;

  for (let i = 0; i < fireworkCount; i++) {
    const ring = document.createElement('div');
    ring.className = 'firework-ring';
    ring.style.left = `${10 + Math.random() * 80}%`;
    ring.style.top = `${14 + Math.random() * 55}%`;
    ring.style.borderColor = ['#36f7ff','#ff4dd8','#ffe66e','#65ffae','#7a7cff'][i % 5];
    ring.style.boxShadow = `0 0 18px ${ring.style.borderColor},0 0 32px ${ring.style.borderColor}`;
    layer.appendChild(ring);
    setTimeout(() => ring.remove(), 700);
  }

  for (let i = 0; i < confettiCount; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = `${Math.random() * 100}%`;
    c.style.top = `${6 + Math.random() * 30}%`;
    c.style.background = ['#36f7ff','#ff4dd8','#ffe66e','#65ffae','#7a7cff'][Math.floor(Math.random()*5)];
    c.style.setProperty('--dx', `${(Math.random() - 0.5) * (combo >= 8 ? 420 : 260)}px`);
    c.style.setProperty('--dy', `${240 + Math.random() * (combo >= 8 ? 520 : 360)}px`);
    c.style.setProperty('--rot', `${Math.random() * 900 - 450}deg`);
    c.style.animationDelay = `${Math.random() * 140}ms`;
    layer.appendChild(c);
    setTimeout(() => c.remove(), 1500);
  }

  if (combo >= 5) {
    const banner = document.createElement('div');
    banner.className = 'combo-banner';
    banner.textContent = combo >= 10 ? `👑 传奇 ${combo} 连击！` : combo >= 8 ? `🔥 超神 ${combo} 连击！` : `⚡ ${combo} 连击，太厉害啦！`;
    layer.appendChild(banner);
    setTimeout(() => banner.remove(), 950);

    const wave = document.createElement('div');
    wave.className = 'aurora-wave';
    layer.appendChild(wave);
    setTimeout(() => wave.remove(), 980);
  }

  if (combo >= 8) {
    const flash = document.createElement('div');
    flash.className = 'screen-flash';
    layer.appendChild(flash);
    setTimeout(() => flash.remove(), 450);

    for (let i=0;i<28;i++) {
      const s = document.createElement('div');
      s.className = 'spark';
      s.style.left = `${20 + Math.random()*60}%`;
      s.style.top = `${18 + Math.random()*42}%`;
      s.style.color = ['#36f7ff','#ff4dd8','#ffe66e','#65ffae'][Math.floor(Math.random()*4)];
      s.style.setProperty('--dx', `${(Math.random()-0.5)*320}px`);
      s.style.setProperty('--dy', `${(Math.random()-0.5)*260}px`);
      layer.appendChild(s);
      setTimeout(()=>s.remove(),760);
    }
  }

  if (combo >= 10) {
    const em = ['🎉','🌟','🏆','✨','🚀'];
    for (let i=0;i<14;i++) {
      const f = document.createElement('div');
      f.className = 'float-emoji';
      f.textContent = em[Math.floor(Math.random()*em.length)];
      f.style.left = `${10 + Math.random()*80}%`;
      f.style.top = `${58 + Math.random()*24}%`;
      layer.appendChild(f);
      setTimeout(()=>f.remove(),1100);
    }
  }
}

async function render(){
  try{
    s.locked=true; s.hinted=false;
    hideReward();
    el.nextBtn.classList.add('hidden');
    el.choices.innerHTML='';

    // 秒切：优先用缓存AI题；没有就先用本地题立刻展示
    let q = nextQCache || null;
    if (!isValidQuestion(q)) q = pickLocalQuestion();

    s.q = q;
    nextQCache = null;
    nextQPromise = null;

    if (q?.word) {
      s.recentWords.push(q.word);
      s.recentWords = s.recentWords.slice(-6);
    }

    el.emoji.textContent=s.q.emoji||'🧩';
    el.word.textContent=s.q.word;
    el.feedback.textContent='';
    shuffle(s.q.choices).forEach(c=>{
      const b=document.createElement('button'); b.className='choice'; b.textContent=c;
      b.onclick=()=>pick(b,c,s.q.pinyin); el.choices.appendChild(b);
    });
    update();
  }catch(e){
    console.error('render failed:', e);
    s.q = pickLocalQuestion();
    el.emoji.textContent=s.q.emoji||'🧩';
    el.word.textContent=s.q.word;
    el.choices.innerHTML='';
    shuffle(s.q.choices).forEach(c=>{
      const b=document.createElement('button'); b.className='choice'; b.textContent=c;
      b.onclick=()=>pick(b,c,s.q.pinyin); el.choices.appendChild(b);
    });
    el.feedback.textContent='已切到极速模式';
    update();
  }finally{
    s.locked=false;
    prefetchNextQuestion();
  }
}

async function pick(btn, value, ans){
  if(s.locked)return; s.locked=true;
  const all=[...document.querySelectorAll('.choice')];
  all.forEach(b=>{if(b.textContent===ans)b.classList.add('correct')});

  const correct = value===ans;
  if(correct){
    const plus=s.combo>=3?15:10; s.score+=plus; s.combo+=1;
    el.feedback.textContent=`🎉 正确！+${plus} 分`;
    btn.classList.add('correct'); beep('ok'); celebrate();
    showReward(s.q.word);
    if (s.combo >= 3) comboCelebration(s.combo);
  } else {
    hideReward();
    s.lives-=1; s.combo=0; s.weakPoints.push(ans);
    btn.classList.add('wrong');
    el.feedback.textContent=`💡 正确答案是 ${ans}`;
    beep('bad'); warn();
  }

  update();
  if(s.lives<=0){setTimeout(()=>finish(false),500); s.locked=false; return;}

  // 再异步刷新成AI鼓励文案（不阻塞交互）
  aiFeedback(correct, ans).then(txt => {
    if (txt) {
      el.feedback.textContent = txt;
      speak(txt);
    }
  }).catch(()=>{});

  // 操作优化：答对自动进入下一关；答错保留手动“下一关”
  s.locked=false;
  if (correct) {
    el.nextBtn.classList.add('hidden');
    clearTimeout(autoNextTimer);
    autoNextTimer = setTimeout(() => { next(); }, 1100);
  } else {
    el.nextBtn.classList.remove('hidden');
  }
}

async function next(){
  if (s.locked) return;
  clearTimeout(autoNextTimer);
  s.idx+=1;
  if(s.idx>=totalRounds){finish(true);return;}
  await render();
}
function hint(){ if(s.hinted||s.locked)return; s.hinted=true; s.score=Math.max(0,s.score-2); const wrong=[...document.querySelectorAll('.choice')].filter(b=>b.textContent!==s.q.pinyin); if(wrong.length)wrong[Math.floor(Math.random()*wrong.length)].style.opacity=.25; el.feedback.textContent='💡 已排除一个错误答案（-2分）'; update(); }
function finish(ok){ clearTimeout(autoNextTimer); el.barFill.style.width='100%'; el.progressText.textContent=`${totalRounds} / ${totalRounds}`; el.resultModal.classList.remove('hidden'); if(ok){el.resultTitle.textContent='🏆 星舰通关成功！'; el.resultDesc.textContent=`总分 ${s.score}，你是拼音银河小英雄！`;} else {el.resultTitle.textContent='🌟 差一点点就成功啦'; el.resultDesc.textContent=`本次得分 ${s.score}，再挑战一次会更强！`;} }
async function restart(){ clearTimeout(autoNextTimer); s.idx=0;s.score=0;s.lives=3;s.combo=0;s.weakPoints=[];s.recentWords=[]; el.resultModal.classList.add('hidden'); prefetchNextQuestion(); await render(); }

el.nextBtn.onclick=next; el.restartBtn.onclick=restart;
el.speakBtn.onclick=()=>{ if(s.q) speak(`${s.q.word}，请选出正确拼音`) };
el.hintBtn.onclick=hint;
el.albumBtn.onclick=()=>{ renderAlbum(); el.albumModal.classList.remove('hidden'); };
el.closeAlbumBtn.onclick=()=>{ el.albumModal.classList.add('hidden'); };

(function(){const c=document.getElementById('fx'),ctx=c.getContext('2d');let w,h,stars=[];const rs=()=>{w=c.width=innerWidth;h=c.height=innerHeight;stars=Array.from({length:90},()=>({x:Math.random()*w,y:Math.random()*h,z:Math.random()*1.5+0.3}))};addEventListener('resize',rs);rs();(function lp(){ctx.clearRect(0,0,w,h);for(const st of stars){st.y+=st.z;if(st.y>h){st.y=0;st.x=Math.random()*w}ctx.fillStyle=`rgba(120,220,255,${0.25+st.z/2})`;ctx.fillRect(st.x,st.y,st.z*2,st.z*2)}requestAnimationFrame(lp)})();})();

renderAlbum();
prefetchNextQuestion();
render();
