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

const s = { idx: 0, score: 0, lives: 3, combo: 0, locked: false, hinted: false };
const $ = id => document.getElementById(id);
const el = {
  level: $('level'), score: $('score'), lives: $('lives'), combo: $('combo'),
  emoji: $('emoji'), word: $('word'), choices: $('choices'), feedback: $('feedback'),
  nextBtn: $('nextBtn'), speakBtn: $('speakBtn'), hintBtn: $('hintBtn'),
  barFill: $('barFill'), progressText: $('progressText'), mission: $('mission'),
  resultModal: $('resultModal'), resultTitle: $('resultTitle'), resultDesc: $('resultDesc'), restartBtn: $('restartBtn')
};

function shuffle(a){return [...a].sort(()=>Math.random()-0.5)}
function speak(text){
  if(!window.speechSynthesis)return;
  const msg=new SpeechSynthesisUtterance(text);
  msg.lang='zh-CN'; msg.rate=.9;
  speechSynthesis.cancel(); speechSynthesis.speak(msg);
}
function beep(type='ok'){
  try{
    const ctx=new (window.AudioContext||window.webkitAudioContext)();
    const o=ctx.createOscillator(), g=ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type='sine';
    o.frequency.value = type==='ok'?780:260;
    g.gain.value=.001; g.gain.exponentialRampToValueAtTime(.08,ctx.currentTime+.01);
    g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.2);
    o.start(); o.stop(ctx.currentTime+.22);
  }catch{}
}
function update(){
  el.level.textContent=s.idx+1; el.score.textContent=s.score;
  el.lives.textContent=s.lives; el.combo.textContent=s.combo;
  el.barFill.style.width=`${(s.idx/questions.length)*100}%`;
  el.progressText.textContent=`${s.idx} / ${questions.length}`;
  el.mission.textContent = s.combo>=3 ? '⚡ 超能连击已激活：答对额外加分！' : '任务：连续答对 3 题触发超能连击';
}
function celebrate(){
  const stage=document.querySelector('.stage');
  stage.classList.add('pulse'); setTimeout(()=>stage.classList.remove('pulse'),450);
}
function warn(){
  const stage=document.querySelector('.stage');
  stage.classList.add('shake'); setTimeout(()=>stage.classList.remove('shake'),350);
}
function render(){
  const q=questions[s.idx];
  s.locked=false; s.hinted=false;
  el.feedback.textContent=''; el.nextBtn.classList.add('hidden');
  el.emoji.textContent=q.emoji; el.word.textContent=q.word; el.choices.innerHTML='';
  shuffle(q.choices).forEach(c=>{
    const b=document.createElement('button');
    b.className='choice'; b.textContent=c;
    b.onclick=()=>pick(b,c,q.pinyin);
    el.choices.appendChild(b);
  });
  update();
}
function pick(btn, value, ans){
  if(s.locked)return; s.locked=true;
  const all=[...document.querySelectorAll('.choice')];
  all.forEach(b=>{ if(b.textContent===ans) b.classList.add('correct'); });
  if(value===ans){
    const plus = s.combo>=3 ? 15 : 10;
    s.score += plus; s.combo +=1;
    el.feedback.textContent=`🎉 正确！+${plus} 分`;
    btn.classList.add('correct'); beep('ok'); celebrate(); speak('答对了，真棒');
  }else{
    s.lives -=1; s.combo=0;
    btn.classList.add('wrong');
    el.feedback.textContent=`❌ 再想想～正确答案：${ans}`;
    beep('bad'); warn(); speak('再试试，你可以的');
  }
  update();
  if(s.lives<=0){setTimeout(()=>finish(false),550);return;}
  el.nextBtn.classList.remove('hidden');
}
function next(){
  s.idx +=1;
  if(s.idx>=questions.length){finish(true);return;}
  render();
}
function hint(){
  if(s.hinted || s.locked) return;
  s.hinted = true; s.score=Math.max(0,s.score-2);
  const q=questions[s.idx];
  const wrong=[...document.querySelectorAll('.choice')].filter(b=>b.textContent!==q.pinyin);
  if(wrong.length){
    wrong[Math.floor(Math.random()*wrong.length)].style.opacity=.25;
  }
  el.feedback.textContent='💡 已排除一个错误答案（-2分）';
  update();
}
function finish(ok){
  el.barFill.style.width='100%'; el.progressText.textContent=`${questions.length} / ${questions.length}`;
  el.resultModal.classList.remove('hidden');
  if(ok){
    el.resultTitle.textContent='🏆 星舰通关成功！';
    el.resultDesc.textContent=`总分 ${s.score}，你是拼音银河小英雄！`;
    speak('恭喜你，闯关成功');
  }else{
    el.resultTitle.textContent='🌟 差一点点就成功啦';
    el.resultDesc.textContent=`本次得分 ${s.score}，再挑战一次会更强！`;
    speak('不要灰心，再来一局');
  }
}
function restart(){ s.idx=0;s.score=0;s.lives=3;s.combo=0;el.resultModal.classList.add('hidden');render(); }

el.nextBtn.onclick=next;
el.restartBtn.onclick=restart;
el.speakBtn.onclick=()=>{const q=questions[s.idx]; speak(`${q.word}，请选出正确拼音`) };
el.hintBtn.onclick=hint;

// simple starfield fx
(function(){
  const c=document.getElementById('fx'),ctx=c.getContext('2d');
  let w,h,stars=[];
  const resize=()=>{w=c.width=innerWidth;h=c.height=innerHeight;stars=Array.from({length:90},()=>({x:Math.random()*w,y:Math.random()*h,z:Math.random()*1.5+0.3}));};
  addEventListener('resize',resize); resize();
  (function loop(){
    ctx.clearRect(0,0,w,h);
    for(const s of stars){
      s.y += s.z; if(s.y>h){s.y=0;s.x=Math.random()*w;}
      ctx.fillStyle=`rgba(120,220,255,${0.25+s.z/2})`;
      ctx.fillRect(s.x,s.y,s.z*2,s.z*2);
    }
    requestAnimationFrame(loop);
  })();
})();

render();
