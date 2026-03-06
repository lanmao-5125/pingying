const totalRounds = 10;
const s = { idx: 0, score: 0, lives: 3, combo: 0, locked: false, hinted: false, q: null, weakPoints: [] };
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
async function aiQuestion(){
  const r = await fetch('/api/ai/generate-question', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ age:'3-7', weakPoints: s.weakPoints.slice(-3) })
  });
  const data = await r.json();
  return data.question;
}
async function aiFeedback(correct, target){
  try{
    const r = await fetch('/api/ai/evaluate-answer', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ correct, target })
    });
    return (await r.json()).text || (correct ? '答对啦！' : `正确答案是 ${target}`);
  }catch{ return correct ? '答对啦！' : `正确答案是 ${target}`; }
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

async function render(){
  s.locked=false; s.hinted=false; el.feedback.textContent=''; el.nextBtn.classList.add('hidden');
  s.q = await aiQuestion();
  el.emoji.textContent=s.q.emoji||'🧩'; el.word.textContent=s.q.word;
  el.choices.innerHTML='';
  shuffle(s.q.choices).forEach(c=>{
    const b=document.createElement('button'); b.className='choice'; b.textContent=c;
    b.onclick=()=>pick(b,c,s.q.pinyin); el.choices.appendChild(b);
  });
  update();
}

async function pick(btn, value, ans){
  if(s.locked)return; s.locked=true;
  const all=[...document.querySelectorAll('.choice')];
  all.forEach(b=>{if(b.textContent===ans)b.classList.add('correct')});
  if(value===ans){
    const plus=s.combo>=3?15:10; s.score+=plus; s.combo+=1;
    el.feedback.textContent=await aiFeedback(true, ans);
    btn.classList.add('correct'); beep('ok'); celebrate(); speak(el.feedback.textContent);
  } else {
    s.lives-=1; s.combo=0; s.weakPoints.push(ans);
    btn.classList.add('wrong');
    el.feedback.textContent=await aiFeedback(false, ans);
    beep('bad'); warn(); speak(el.feedback.textContent);
  }
  update();
  if(s.lives<=0){setTimeout(()=>finish(false),500);return;}
  el.nextBtn.classList.remove('hidden');
}

async function next(){ s.idx+=1; if(s.idx>=totalRounds){finish(true);return;} await render(); }
function hint(){ if(s.hinted||s.locked)return; s.hinted=true; s.score=Math.max(0,s.score-2); const wrong=[...document.querySelectorAll('.choice')].filter(b=>b.textContent!==s.q.pinyin); if(wrong.length)wrong[Math.floor(Math.random()*wrong.length)].style.opacity=.25; el.feedback.textContent='💡 已排除一个错误答案（-2分）'; update(); }
function finish(ok){ el.barFill.style.width='100%'; el.progressText.textContent=`${totalRounds} / ${totalRounds}`; el.resultModal.classList.remove('hidden'); if(ok){el.resultTitle.textContent='🏆 星舰通关成功！'; el.resultDesc.textContent=`总分 ${s.score}，你是拼音银河小英雄！`;} else {el.resultTitle.textContent='🌟 差一点点就成功啦'; el.resultDesc.textContent=`本次得分 ${s.score}，再挑战一次会更强！`;} }
async function restart(){ s.idx=0;s.score=0;s.lives=3;s.combo=0;s.weakPoints=[]; el.resultModal.classList.add('hidden'); await render(); }

el.nextBtn.onclick=next; el.restartBtn.onclick=restart;
el.speakBtn.onclick=()=>{ if(s.q) speak(`${s.q.word}，请选出正确拼音`) };
el.hintBtn.onclick=hint;

(function(){const c=document.getElementById('fx'),ctx=c.getContext('2d');let w,h,stars=[];const rs=()=>{w=c.width=innerWidth;h=c.height=innerHeight;stars=Array.from({length:90},()=>({x:Math.random()*w,y:Math.random()*h,z:Math.random()*1.5+0.3}))};addEventListener('resize',rs);rs();(function lp(){ctx.clearRect(0,0,w,h);for(const st of stars){st.y+=st.z;if(st.y>h){st.y=0;st.x=Math.random()*w}ctx.fillStyle=`rgba(120,220,255,${0.25+st.z/2})`;ctx.fillRect(st.x,st.y,st.z*2,st.z*2)}requestAnimationFrame(lp)})();})();

render();
