const STEPS=["Recebido","Em análise","Orçamento aprovado","Em conserto","Pronto"];
const MSGS=["Aparelho recebido na loja.","O técnico está avaliando o defeito.","Você aprovou o orçamento.","O reparo está em andamento.","Pronto! Pode vir buscar."];
const BLOCKS=[
 {t:"Lançamento",d:"Dias 1 a 3",g:["Repositório público com README do desafio","Post de abertura no TikTok, Instagram e LinkedIn","Combinado por escrito entre os dois devs"]},
 {t:"Base técnica",d:"Dias 4 a 7",g:["Login do admin e cadastro do negócio","Banco com RLS ativo","Teste de isolamento: empresa A não lê dados da B"]},
 {t:"Fluxo principal",d:"Dias 8 a 11",g:["Cadastrar aparelho ou veículo e gerar link e QR Code","Dono muda a etapa do serviço no painel","Cliente vê a mudança em menos de 3 segundos"]},
 {t:"Portal do cliente",d:"Dias 12 a 14",g:["Página pública sem criar conta","Layout responsivo no celular","Entender o status em até 20 segundos","Botão para avisar o cliente pelo WhatsApp"]},
 {t:"Demo pública",d:"Dias 14 a 17",g:["Deploy no GitHub Pages com dados fictícios","README com instalação em menos de 15 minutos","Link da demo divulgado pedindo feedback"]},
 {t:"Comunidade",d:"Contínuo",g:["Um post de progresso por semana","Issues abertas para sugestões","10 feedbacks reais recebidos","3 melhorias feitas a partir deles"]},
 {t:"Primeiros usuários",d:"Dias 18 a 30",g:["Demo oferecida a 3 negócios","1 negócio usando por 3 dias seguidos"]}
];
const CRIT=[["Uso real e feedback",30],["Segurança (isolamento)",20],["Experiência no celular",15],["Código e README",10]];
const FUNC=25;
const KEY="duelo-rastreia-v1";
let S={};try{S=JSON.parse(localStorage.getItem(KEY))||{}}catch(e){}
S.c=S.c||{};S.n=S.n||{};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const $=id=>document.getElementById(id);

/* tracker */
let cur=0;
function drawTracker(){
  $("steps").innerHTML=STEPS.map((s,i)=>`<li class="${i<cur?"done":i===cur?"done now":""}">${s}</li>`).join("");
  $("trMsg").textContent=MSGS[cur];
  $("trBtn").textContent=cur===STEPS.length-1?"Reiniciar demo":"Avançar etapa";
}
function next(){cur=(cur+1)%STEPS.length;drawTracker()}
$("trBtn").onclick=()=>{clearInterval(timer);next()};
drawTracker();
const still=matchMedia("(prefers-reduced-motion: reduce)").matches;
const timer=still?0:setInterval(next,2400);

/* blocks */
$("blocks").innerHTML=BLOCKS.map((b,i)=>`<div class="block"><h3>${b.t}</h3><p class="when">${b.d}</p>`+
 b.g.map((g,j)=>{const id=`${i}-${j}`;return `<div class="goal"><span>${g}</span>
 <label><input type="checkbox" class="gk" data-d="k" data-id="${id}" ${S.c["k"+id]?"checked":""}>Kayo</label>
 <label><input type="checkbox" class="gv" data-d="v" data-id="${id}" ${S.c["v"+id]?"checked":""}>Vitor</label></div>`}).join("")+`</div>`).join("");
const total=BLOCKS.reduce((n,b)=>n+b.g.length,0);
const pct=d=>Math.round(Object.keys(S.c).filter(k=>k[0]===d&&S.c[k]).length/total*100);
document.querySelectorAll(".goal input").forEach(el=>el.onchange=()=>{S.c[el.dataset.d+el.dataset.id]=el.checked;save();update()});

/* date */
$("startDate").value=S.start||"";
$("startDate").onchange=e=>{S.start=e.target.value;save();update()};
function dayInfo(){
  if(!S.start)return"Escolha a data de início para ver em que dia o desafio está.";
  const d=Math.floor((new Date()-new Date(S.start+"T00:00:00"))/864e5)+1;
  if(d<1)return`O desafio começa em ${1-d} dia(s).`;
  return d<=14?`Hoje é o dia ${d} de 14.`:`Prazo do MVP encerrado: dia ${d}. Fase de comunidade e primeiros usuários.`;
}

/* score */
function scoreTable(){
  const rows=CRIT.map(([n,w],i)=>`<tr><td>${n} (${w}%)</td>${["k","v"].map(d=>`<td><input type="number" min="0" max="10" step="0.5" data-n="${d}${i}" value="${S.n[d+i]??""}" placeholder="0-10" aria-label="${n} ${d==="k"?"Kayo":"Vitor"}"></td>`).join("")}</tr>`).join("");
  $("score").innerHTML=`<thead><tr><th>Critério</th><th class="k">Kayo</th><th class="v">Vitor</th></tr></thead><tbody>
  <tr><td>Funcionalidade (${FUNC}%)</td><td id="fk"></td><td id="fv"></td></tr>${rows}</tbody>
  <tfoot><tr><td>Total (0 a 10)</td><td id="tk" class="k"></td><td id="tv" class="v"></td></tr></tfoot>`;
  document.querySelectorAll("#score input").forEach(el=>el.oninput=()=>{
    const v=Math.min(10,Math.max(0,parseFloat(el.value)));S.n[el.dataset.n]=isNaN(v)?"":v;save();update()});
}
function total10(d){
  let s=pct(d)/10*FUNC;
  CRIT.forEach(([,w],i)=>{s+=(parseFloat(S.n[d+i])||0)*w});
  return(s/100).toFixed(2);
}
function update(){
  for(const d of["k","v"]){
    const p=pct(d);$("bar"+d.toUpperCase()).style.width=p+"%";$("pct"+d.toUpperCase()).textContent=p+"%";
    $("f"+d).textContent=(p/10).toFixed(1);$("t"+d).textContent=total10(d);
  }
  $("dayInfo").textContent=dayInfo();
}
scoreTable();update();

/* votação */
const SUPABASE_URL="https://kjazvvaeakhcbspytdac.supabase.co";   // ex.: https://xxxx.supabase.co (veja supabase.sql)
const SUPABASE_KEY="sb_publishable_2LLG7bX-YXwv5BthxzlkjA_IQDzsD0a";   // chave anon pública
const VCATS=[["ui","Interface mais bonita e fácil de usar"],["idea","Melhor ideia e funcionalidades"],["use","Qual você usaria no dia a dia"]];
const NAMES={k:"Kayo",v:"Vitor"};
S.vid=S.vid||(crypto.randomUUID?crypto.randomUUID():String(Math.random()).slice(2)+Date.now());
S.mine=S.mine||{};S.lv=S.lv||[];save();
const remote=!!(SUPABASE_URL&&SUPABASE_KEY);
const H={apikey:SUPABASE_KEY,Authorization:"Bearer "+SUPABASE_KEY,"Content-Type":"application/json"};
let rows=[];
async function loadVotes(){
  if(!remote){rows=S.lv;return}
  try{const r=await fetch(`${SUPABASE_URL}/rest/v1/votes?select=category,dev&limit=10000`,{headers:H});
    if(r.ok)rows=await r.json();}catch(e){}
}
async function vote(cat,dev){
  if(S.mine[cat])return;
  if(remote){
    try{const r=await fetch(`${SUPABASE_URL}/rest/v1/votes`,{method:"POST",headers:{...H,Prefer:"return=minimal"},body:JSON.stringify({voter_id:S.vid,category:cat,dev})});
      if(!r.ok&&r.status!==409){$("voteNote").textContent="Não foi possível registrar o voto agora. Tente de novo.";return}
    }catch(e){$("voteNote").textContent="Sem conexão. Tente de novo.";return}
  }else S.lv.push({category:cat,dev});
  S.mine[cat]=dev;save();await loadVotes();drawVotes();
}
function drawVotes(){
  const cnt={k:0,v:0};
  $("votes").innerHTML=VCATS.map(([c,t])=>{
    const k=rows.filter(r=>r.category===c&&r.dev==="k").length,v=rows.filter(r=>r.category===c&&r.dev==="v").length;
    cnt.k+=k;cnt.v+=v;const tot=k+v||1,m=S.mine[c];
    const btn=(d,n)=>`<button class="vbtn ${d} ${m===d?"mine":""}" data-c="${c}" data-d="${d}" ${m?"disabled":""}>${NAMES[d]}<b>${n}</b><div class="bar"><i style="width:${Math.round(n/tot*100)}%"></i></div></button>`;
    return `<div class="vcard"><h3>${t}</h3><div class="vrow">${btn("k",k)}${btn("v",v)}</div></div>`}).join("");
  document.querySelectorAll(".vbtn").forEach(b=>b.onclick=()=>vote(b.dataset.c,b.dataset.d));
  const diff=Math.abs(cnt.k-cnt.v),lead=cnt.k>cnt.v?"k":"v",back=lead==="k"?"v":"k";
  $("cheer").textContent=cnt.k+cnt.v===0?"Nenhum voto ainda. Seja o primeiro a escolher.":
    diff===0?"Empate em votos. Quem entregar a próxima melhoria desempata.":
    `${NAMES[lead]} lidera por ${diff} voto${diff>1?"s":""}. ${NAMES[back]}, ainda dá para virar.`;
  $("voteNote").textContent=remote?"Votos compartilhados com todos os visitantes.":"Modo local: os votos ficam só neste navegador até você configurar o Supabase (veja supabase.sql).";
}
loadVotes().then(drawVotes);
if(remote)setInterval(()=>loadVotes().then(drawVotes),20000);
