'use strict';
/* ================= utilidades ================= */
const $=s=>document.querySelector(s);
const val=id=>{const e=document.getElementById(id);return e?e.value:'';};
const pad=n=>String(n).padStart(2,'0');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Math.random().toString(36).slice(2,10);
const sum=a=>a.reduce((x,y)=>x+(+y||0),0);
const cmp=(a,b)=>a<b?-1:a>b?1:0;
const D=s=>{const[y,m,d]=s.split('-').map(Number);return new Date(Date.UTC(y,m-1,d));};
const S=dt=>dt.toISOString().slice(0,10);
const add=(s,n)=>{const d=D(s);d.setUTCDate(d.getUTCDate()+n);return S(d);};
const dow=s=>D(s).getUTCDay();
const ddiff=(a,b)=>Math.round((D(b)-D(a))/864e5);
const range=(a,b)=>{const r=[];if(!a||!b)return r;for(let x=a;x<=b;x=add(x,1))r.push(x);return r;};
const addYears=(s,n)=>{const[y,m,d]=s.split('-').map(Number);let dt=new Date(Date.UTC(y+n,m-1,d));if(dt.getUTCMonth()!==m-1)dt=new Date(Date.UTC(y+n,m,0));return S(dt);};
const fmt=s=>s?`${s.slice(8,10)}/${s.slice(5,7)}/${s.slice(0,4)}`:'—';
const fmtS=s=>s?`${s.slice(8,10)}/${s.slice(5,7)}`:'';
const todayS=()=>{const n=new Date();return `${n.getFullYear()}-${pad(n.getMonth()+1)}-${pad(n.getDate())}`;};
const MESES=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const MES3=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const DSEM=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];const DS1=['D','S','T','Q','Q','S','S'];
const DSEMF=['DOMINGO','SEGUNDA-FEIRA','TERÇA-FEIRA','QUARTA-FEIRA','QUINTA-FEIRA','SEXTA-FEIRA','SÁBADO'];
const daysInMonth=ym=>{const[y,m]=ym.split('-').map(Number);return new Date(Date.UTC(y,m,0)).getUTCDate();};
const monthDays=ym=>range(ym+'-01',ym+'-'+pad(daysInMonth(ym)));
const ymAdd=(ym,n)=>{let[y,m]=ym.split('-').map(Number);m+=n;while(m>12){m-=12;y++}while(m<1){m+=12;y--}return `${y}-${pad(m)}`;};
const ymLabel=ym=>`${MESES[+ym.slice(5,7)-1]} ${ym.slice(0,4)}`;
const ymShort=ym=>`${MES3[+ym.slice(5,7)-1]}/${ym.slice(2,4)}`;
const tmin=t=>{const[h,m]=(t||'00:00').split(':').map(Number);return h*60+m;};
const spanH=(a,b)=>{let d=tmin(b)-tmin(a);if(d<=0)d+=1440;return d/60;};
const segsOf=(a,b)=>{const x=tmin(a),y=tmin(b);return y>x?[[x,y]]:[[x,1440],[0,y]];};
const overlapT=(a1,b1,a2,b2)=>segsOf(a1,b1).some(([s1,e1])=>segsOf(a2,b2).some(([s2,e2])=>s1<e2&&s2<e1));
const first=n=>String(n||'').split(' ')[0];
const short=n=>{const p=String(n||'').split(' ');return p.length>1?p[0]+' '+p[p.length-1]:p[0];};
const isNum=v=>typeof v==='number';

/* ================= feriados ================= */
function easter(y){const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),da=((h+l-7*m+114)%31)+1;return `${y}-${pad(mo)}-${pad(da)}`;}
function nationalHolidays(y){const e=easter(y);return{list:[[`${y}-01-01`,'Confraternização Universal'],[add(e,-2),'Sexta-feira Santa'],[`${y}-04-21`,'Tiradentes'],[`${y}-05-01`,'Dia do Trabalho'],[`${y}-09-07`,'Independência do Brasil'],[`${y}-10-12`,'N. Sra. Aparecida'],[`${y}-11-02`,'Finados'],[`${y}-11-15`,'Proclamação da República'],[`${y}-11-20`,'Dia da Consciência Negra'],[`${y}-12-25`,'Natal']],fac:[[add(e,-48),'Carnaval (segunda)'],[add(e,-47),'Carnaval (terça)'],[add(e,60),'Corpus Christi']]};}
const holCache={};
function holMap(y){if(holCache[y])return holCache[y];const m={};const{list,fac}=nationalHolidays(y);list.forEach(([d,n])=>m[d]=n);if(state.config.facultativos)fac.forEach(([d,n])=>m[d]=n);state.feriados.forEach(f=>{if(f.data&&f.data.startsWith(y+'-'))m[f.data]=f.nome||'Feriado';});return holCache[y]=m;}
const invalidateHol=()=>{for(const k in holCache)delete holCache[k];};
const isHol=s=>!!holMap(+s.slice(0,4))[s];
const holName=s=>holMap(+s.slice(0,4))[s];
const isWE=s=>{const w=dow(s);return w===0||w===6;};
const isWork=s=>!isWE(s)&&!isHol(s);
const prevWork=s=>{let x=add(s,-1);while(!isWork(x))x=add(x,-1);return x;};
const nextWork=s=>{let x=add(s,1);while(!isWork(x))x=add(x,1);return x;};
const satKey=d=>dow(d)===6?d:dow(d)===0?add(d,-1):d;

/* ================= estado ================= */
const LSU='gestao_equipe_ui_v1';
let state=null,dirty=false,saveTimer=null,M=null,IDX={},saveSt='saved',SC={};
const colab=id=>state.colaboradores.find(c=>c.id===id);
const sup=id=>state.supervisoes.find(s=>s.id===id);
const area=id=>state.areas.find(a=>a.id===id);
const activeColabs=()=>state.colaboradores.filter(c=>c.ativo!==false);
const areasSorted=()=>state.areas.slice().sort((a,b)=>(a.ordem??99)-(b.ordem??99)||cmp(a.nome,b.nome));
const FUNC={tecnico:'Técnico',supervisor:'Supervisor',gerente:'Gerente'};
const CODES={J3:['J3','Plantão J3 (08h–17h)'],FO:['FO','Folga'],BH:['BH','Banco de horas'],FA:['FA','Folga abonada'],AT:['AT','Atestado / ausência'],TR:['TR','Treinamento'],M:['M','Meio período 08h–12h']};
function migrate(s){s.config=s.config||{};['areas','supervisoes','colaboradores','feriados','ferias'].forEach(k=>{if(!Array.isArray(s[k]))s[k]=[];});['escala','acionados','histAgg'].forEach(k=>{if(!s[k]||typeof s[k]!=='object')s[k]={};});
  s.areas.forEach(a=>{a.j3Vagas=+a.j3Vagas||0;a.saVagas=a.saVagas==null?1:+a.saVagas;a.saModo=a.saModo||'fds';a.hSab=a.hSab??24;a.hDom=a.hDom??24;a.hFer=a.hFer??24;a.noturnoH=+a.noturnoH||0;a.noturnoIni=a.noturnoIni||'00:00';a.noturnoModo=a.noturnoModo||'todas';a.folgaJ3=a.folgaJ3!==false;a.folgaSA=a.folgaSA!==false;a.feriasMax=+a.feriasMax||1;});
  return s;}

/* ----- células da escala ----- */
const getV=(cid,d)=>{const m=state.escala[d.slice(0,7)];return m&&m[cid]?m[cid][d.slice(8)]:undefined;};
function setV(cid,d,v){const ym=d.slice(0,7),dd=d.slice(8);if(v==null||v===''){const m=state.escala[ym];if(m&&m[cid]){delete m[cid][dd];if(!Object.keys(m[cid]).length)delete m[cid];}setAc(cid,d,false);return;}const m=state.escala[ym]=state.escala[ym]||{};(m[cid]=m[cid]||{})[dd]=v;}
const isAc=(cid,d)=>{const m=state.acionados[d.slice(0,7)];return !!(m&&m[cid]&&m[cid][d.slice(8)]);};
function setAc(cid,d,on){const ym=d.slice(0,7),dd=d.slice(8);if(on){const m=state.acionados[ym]=state.acionados[ym]||{};(m[cid]=m[cid]||{})[dd]=1;}else{const m=state.acionados[ym];if(m&&m[cid]){delete m[cid][dd];if(!Object.keys(m[cid]).length)delete m[cid];}}}
const onVac=(cid,d)=>!!(IDX.vac[cid]&&IDX.vac[cid].has(d));
const hoursFor=(a,d)=>isHol(d)?+a.hFer:dow(d)===6?+a.hSab:dow(d)===0?+a.hDom:+a.noturnoH;
function areaPattern(a){const p=[];if(a.j3Vagas)p.push(`${a.j3Vagas} J3`);if(a.saVagas)p.push(`${a.saVagas} sobreaviso${a.saModo==='dia'?' por dia (sábado e domingo com pessoas diferentes)':''} — sáb ${a.hSab}h · dom ${a.hDom}h · feriado ${a.hFer}h`);if(a.noturnoH)p.push(`${NOTMODO[a.noturnoModo]} ${a.noturnoH}h (${a.noturnoIni}–${addH(a.noturnoIni,a.noturnoH)})`);return p.join(' · ');}
const NOTMODO={todas:'todas as noites de semana',depois:'noite do dia útil após o plantão',antes_depois:'noites do dia útil antes e depois do plantão'};
const addH=(t,h)=>{const m=(tmin(t)+h*60)%1440;return `${pad(Math.floor(m/60))}:${pad(m%60)}`;};
function colabsOfArea(aid,ym){const has=c=>!!(ym&&state.escala[ym]&&state.escala[ym][c.id]&&Object.keys(state.escala[ym][c.id]).length);return state.colaboradores.filter(c=>c.areaId===aid&&(has(c)||(c.ativo!==false&&(c.sa!==false||c.j3)))).sort((a,b)=>cmp(a.ativo===false?1:0,b.ativo===false?1:0)||cmp(a.nome,b.nome));}
const escalaveis=aid=>activeColabs().filter(c=>c.areaId===aid&&(c.sa!==false||c.j3));

function buildIdx(){IDX={vac:{}};state.ferias.forEach(f=>{const s=IDX.vac[f.colabId]=IDX.vac[f.colabId]||new Set();vacDays(f).forEach(d=>s.add(d));});SC={};ALLOC_V++;}

/* ================= blocos de plantão ================= */
function makeBlock(sat){let start=sat,end=add(sat,1);while(isHol(add(start,-1)))start=add(start,-1);while(isHol(add(end,1)))end=add(end,1);return{key:sat,start,end,dias:range(start,end),folgaAntes:prevWork(start),folgaDepois:nextWork(end)};}
function blocksOfMonth(ym){const r=[];let s=ym+'-01';while(dow(s)!==6)s=add(s,1);while(s.slice(0,7)===ym){r.push(makeBlock(s));s=add(s,7);}return r;}
function blocksAll(ym){const wb=blocksOfMonth(ym),pb=blocksOfMonth(ymAdd(ym,-1)),nb=blocksOfMonth(ymAdd(ym,1));const cov=new Set([...wb,...pb,...nb].flatMap(b=>b.dias));
  const iso=monthDays(ym).filter(d=>isHol(d)&&!isWE(d)&&!cov.has(d)).map(d=>({key:d,start:d,end:d,dias:[d],iso:true,folgaAntes:prevWork(d),folgaDepois:nextWork(d)}));
  return [...wb,...iso].sort((a,b)=>cmp(a.start,b.start));}
const diasLabel=d=>d.length?(d.length===1?`${DSEM[dow(d[0])]} ${fmtS(d[0])}`:`${DSEM[dow(d[0])]} ${fmtS(d[0])} a ${DSEM[dow(d[d.length-1])]} ${fmtS(d[d.length-1])}`):'';
function blockForDay(d){for(const ym of [d.slice(0,7),ymAdd(d.slice(0,7),-1)])for(const b of blocksAll(ym))if(b.dias.includes(d))return b;return null;}
const j3Days=b=>b.dias.filter(isWE);
function ownedDays(ym){const pb=new Set(blocksOfMonth(ymAdd(ym,-1)).flatMap(b=>b.dias));const own=new Set(monthDays(ym).filter(d=>!pb.has(d)));blocksAll(ym).forEach(b=>b.dias.forEach(d=>own.add(d)));return own;}
function nightTargets(a,ym){const md=monthDays(ym).filter(isWork);if(a.noturnoModo==='todas')return md;const bl=[...blocksOfMonth(ymAdd(ym,-1)),...blocksAll(ym),...blocksOfMonth(ymAdd(ym,1))];const t=new Set();bl.forEach(b=>{t.add(b.folgaDepois);if(a.noturnoModo==='antes_depois')t.add(b.folgaAntes);});return md.filter(d=>t.has(d));}
function inBlock(cid,b){const r={J3:false,SA:false,h:0};b.dias.forEach(d=>{const v=getV(cid,d);if(v==='J3')r.J3=true;else if(isNum(v)){r.SA=true;r.h+=v;}});return r;}

/* ================= gerador ================= */
/* folga de férias: sem plantão nos N dias antes do início das férias nem nos M dias após o retorno */
const vacBuf=()=>({antes:state.config.semPlantaoAntesFerias==null?3:+state.config.semPlantaoAntesFerias,depois:state.config.semPlantaoAposFerias==null?1:+state.config.semPlantaoAposFerias});
function nearVac(cid,start,end){const v=IDX.vac[cid];if(!v||!v.size)return null;const B=vacBuf();
  for(let i=1;i<=B.antes;i++){const d=add(end,i);if(v.has(d)&&!v.has(add(d,-1)))return{tipo:'antes',d};}
  for(let i=1;i<=B.depois;i++){const d=add(start,-i);if(v.has(d)&&!v.has(add(d,1)))return{tipo:'depois',d};}
  return null;}
/* ---------- folgas de plantão: dia certo e sem colisão ----------
   J3: folga ideal na sexta (antes) e na segunda (depois); duas folgas no mesmo dia só se forem de turnos diferentes.
   Sobreaviso: folga em qualquer dia útil, sem coincidir com outra folga da equipe. */
const turnoOf=c=>{const h=tmin(c.entrada||'08:00');return h>=1200||h<240?'noite':h>=720?'tarde':'manha';};
const TURNO_NOME={manha:'manhã',tarde:'tarde',noite:'noite'};
const FOLGA_COD=new Set(['FO','FA','BH']);
const folgasNoDia=(c,d)=>colabsOfArea(c.areaId,d.slice(0,7)).filter(x=>x.id!==c.id&&FOLGA_COD.has(getV(x.id,d)));
const diaLivre=(c,d)=>d&&isWork(d)&&getV(c.id,d)===undefined&&!onVac(c.id,d);
function folgaDias(b,lado){const r=[];for(let i=1;i<=7;i++){const d=lado==='antes'?add(b.start,-i):add(b.end,i);if(isWork(d))r.push(d);}return r;}
const ajusta=(d,passo)=>{for(let k=0;k<4&&d&&!isWork(d);k++)d=add(d,passo);return d;};
// J3: as duas folgas no mesmo dia da semana — sexta antes + sexta da semana seguinte, ou segunda da semana anterior + segunda depois.
// Assim uma folga fica junto do J3 e a outra emenda um fim de semana livre.
function paresJ3(b){const sat=b.key;return [{k:'sex',dias:[b.folgaAntes,ajusta(add(sat,6),-1)]},{k:'seg',dias:[ajusta(add(sat,-5),1),b.folgaDepois]}];}
function escolheFolgasJ3(c,b,alt){const livre=d=>diaLivre(c,d);const outras=d=>folgasNoDia(c,d);
  const score=p=>{if(!p.dias.every(livre))return 1e6;let sc=0;p.dias.forEach(d=>{const o=outras(d);if(o.some(x=>turnoOf(x)===turnoOf(c)))sc+=1000;sc+=o.length*10;});return sc;};
  const ps=paresJ3(b);if(alt)ps.reverse();const best=ps.slice().sort((x,y)=>score(x)-score(y))[0];
  if(score(best)<1000)return best.dias;
  // nenhum par sem colisão do mesmo turno: escolhe dia a dia
  return [escolheFolga(c,b,'antes','J3'),escolheFolga(c,b,'depois','J3')];}
function placeFolgasJ3(c,b,alt){const ds=escolheFolgasJ3(c,b,alt).filter(Boolean);ds.forEach(d=>setV(c.id,d,'FO'));return ds;}
function escolheFolga(c,b,lado,tipo){const pad0=lado==='antes'?b.folgaAntes:b.folgaDepois;const wk=folgaDias(b,lado);
  const livre=d=>diaLivre(c,d),nada=d=>!folgasNoDia(c,d).length,outroTurno=d=>!folgasNoDia(c,d).some(x=>turnoOf(x)===turnoOf(c));
  if(tipo==='J3'){const sexSeg=[...new Set([pad0,...(lado==='antes'?[wk.find(d=>dow(d)===5),wk.find(d=>dow(d)===1)]:[wk.find(d=>dow(d)===1),wk.find(d=>dow(d)===5)])].filter(Boolean))];const outros=wk.filter(d=>!sexSeg.includes(d));
    return sexSeg.find(d=>livre(d)&&nada(d))||sexSeg.find(d=>livre(d)&&outroTurno(d))||outros.find(d=>livre(d)&&nada(d))||outros.find(d=>livre(d)&&outroTurno(d))||(livre(pad0)?pad0:null);}
  // sobreaviso: qualquer dia útil da semana anterior, sem outra folga; segunda e sexta ficam por último (prioridade do J3)
  const meio=wk.filter(d=>dow(d)>=2&&dow(d)<=4),ponta=wk.filter(d=>dow(d)===1||dow(d)===5);const cand=[...new Set([...meio,...ponta,pad0])];
  return cand.find(d=>livre(d)&&nada(d))||cand.find(d=>livre(d)&&!folgasNoDia(c,d).some(x=>turnoOf(x)===turnoOf(c)))||(livre(pad0)?pad0:cand.find(livre))||null;}
function placeFolga(c,b,lado,tipo){const d=escolheFolga(c,b,lado,tipo);if(d)setV(c.id,d,'FO');return d;}
function limparMes(ym,aid){
  const cs=colabsOfArea(aid,ym);const own=ownedDays(ym);const prevBlocks=blocksOfMonth(ymAdd(ym,-1));
  const protect=new Set();prevBlocks.forEach(b=>cs.forEach(c=>{const r=inBlock(c.id,b);if(r.J3||r.SA)[b.folgaDepois,...folgaDias(b,'depois')].forEach(d=>protect.add(c.id+'|'+d));}));
  // folgas deste mês que caíram fora dele (semana anterior ao 1º plantão / semana seguinte ao último)
  const nxt=ymAdd(ym,1),nxtGerado=hasMonthData(nxt,aid),fora=[];blocksAll(ym).forEach(b=>cs.forEach(c=>{const r=inBlock(c.id,b);if(!(r.J3||r.SA))return;[...folgaDias(b,'antes'),...folgaDias(b,'depois')].forEach(d=>{if(!own.has(d)&&(d.slice(0,7)<ym||!nxtGerado))fora.push([c,d]);});}));
  let n=0;cs.forEach(c=>own.forEach(d=>{const v=getV(c.id,d);if(v==='J3'||isNum(v)||(v==='FO'&&!protect.has(c.id+'|'+d))){setV(c.id,d,null);n++;}}));
  fora.forEach(([c,d])=>{if(getV(c.id,d)==='FO'&&!protect.has(c.id+'|'+d)){setV(c.id,d,null);n++;}});return n;}
function gerarEscala(ym,aid){
  const a=area(aid);buildIdx();
  const cs=escalaveis(aid);const own=ownedDays(ym);const blocks=blocksAll(ym);const prevBlocks=blocksOfMonth(ymAdd(ym,-1));
  limparMes(ym,aid);
  const mStart=ym+'-01',h90Start=add(mStart,-90);
  const H={};cs.forEach(c=>H[c.id]={last:{J3:'',SA:''},wk:new Set(),h90:0,m:0,ms:{J3:0,SA:0},night:0,r:Math.random()});
  Object.keys(state.escala).forEach(m=>{const mm=state.escala[m];cs.forEach(c=>{const cells=mm[c.id];if(!cells)return;for(const dd in cells){const d=m+'-'+dd,v=cells[dd];if(m===ym&&own.has(d))continue;const h=H[c.id];
    if(v==='J3'){if(d<mStart&&d>h.last.J3)h.last.J3=d;h.wk.add(satKey(d));}
    else if(isNum(v)){if(!isWork(d)){if(d<mStart&&d>h.last.SA)h.last.SA=d;h.wk.add(satKey(d));}if(d>=h90Start&&d<mStart)h.h90+=v;}}});});
  const freeDays=(c,days)=>days.every(d=>getV(c.id,d)===undefined&&!onVac(c.id,d));
  const vacIn=(c,a1,b1)=>range(a1,b1).some(d=>onVac(c.id,d));
  const putFO=(c,d)=>{if(d&&getV(c.id,d)===undefined&&!onVac(c.id,d))setV(c.id,d,'FO');};
  const RP=(list,t,b,days)=>{const f=list.filter(c=>ruleOk(c,t,b,days||b.dias,H[c.id]));if(f.length)return f;const g=list.filter(c=>ruleOk(c,t,b,days||b.dias,H[c.id],true));return g.length?g:list;};
  const order=(t,b,list)=>RP(list,t,b).sort((x,y)=>{const hx=H[x.id],hy=H[y.id];const ax=(hx.wk.has(add(b.key,-7))||hx.wk.has(add(b.key,7)))?1:0,ay=(hy.wk.has(add(b.key,-7))||hy.wk.has(add(b.key,7)))?1:0;return hx.m-hy.m||hx.ms[t]-hy.ms[t]||ax-ay||cmp(hx.last[t],hy.last[t])||hx.h90-hy.h90||hx.r-hy.r;});
  const mark=(c,t,b)=>{const h=H[c.id];h.m++;h.ms[t]++;h.last[t]=b.start;h.wk.add(b.key);};
  const missing=[];
  for(const b of blocks){
    const used=new Set();
    const jd=j3Days(b);
    if(!b.iso&&jd.length)for(let i=0;i<a.j3Vagas;i++){
      const base=cs.filter(c=>c.j3&&!used.has(c.id)&&freeDays(c,jd)&&!vacIn(c,b.folgaAntes,b.folgaDepois));let ok=order('J3',b,base.filter(c=>!nearVac(c.id,b.start,b.end)));if(!ok.length)ok=order('J3',b,base);
      const c=ok[0];if(!c){missing.push(`${diasLabel(b.dias)}: sem colaborador para J3`);continue;}
      jd.forEach(d=>setV(c.id,d,'J3'));if(a.folgaJ3)placeFolgasJ3(c,b,H[c.id].r<.5);used.add(c.id);mark(c,'J3',b);
    }
    if(a.saModo==='dia'||b.iso){
      for(const d of b.dias)for(let i=0;i<a.saVagas;i++){
        let cand=cs.filter(c=>c.sa!==false&&freeDays(c,[d]));const cv=cand.filter(c=>!nearVac(c.id,b.start,b.end));if(cv.length)cand=cv;
        let ok=order('SA',b,cand.filter(c=>!used.has(c.id)));if(!ok.length)ok=order('SA',b,cand);
        const c=ok[0];if(!c){missing.push(`${DSEM[dow(d)]} ${fmtS(d)}: sem colaborador para sobreaviso`);continue;}
        setV(c.id,d,hoursFor(a,d));if(!used.has(c.id)){if(a.folgaSA&&!b.iso)placeFolga(c,b,'antes','SA');mark(c,'SA',b);}used.add(c.id);
      }
    }else{
      for(let i=0;i<a.saVagas;i++){
        const base=cs.filter(c=>c.sa!==false&&!used.has(c.id)&&freeDays(c,b.dias)&&!vacIn(c,b.folgaAntes,b.end));let ok=order('SA',b,base.filter(c=>!nearVac(c.id,b.start,b.end)));if(!ok.length)ok=order('SA',b,base);
        const c=ok[0];if(!c){missing.push(`${diasLabel(b.dias)}: sem colaborador para sobreaviso`);continue;}
        b.dias.forEach(d=>setV(c.id,d,hoursFor(a,d)));if(a.folgaSA)placeFolga(c,b,'antes','SA');used.add(c.id);mark(c,'SA',b);
      }
    }
  }
  if(a.noturnoH>0){
    const allB=[...prevBlocks,...blocks];
    const tg=new Set(nightTargets(a,ym));[...own].filter(d=>d.startsWith(ym)&&tg.has(d)).sort().forEach(d=>{
      if(cs.some(c=>isNum(getV(c.id,d))))return;
      const w=dow(d);let pref=[];
      if(w>=4){const nb=allB.find(b=>b.start>d&&ddiff(d,b.start)<=3);if(nb)pref=cs.filter(c=>isNum(getV(c.id,nb.dias[0])));}
      else{const pb=allB.filter(b=>b.end<d&&ddiff(b.end,d)<=3).pop();if(pb)pref=cs.filter(c=>isNum(getV(c.id,pb.end)));}
      let c=pref.find(c=>freeDays(c,[d])&&!nearVac(c.id,d,d)&&ruleOk(c,'N',null,[d],H[c.id]));
      if(!c){let ok=cs.filter(c=>c.sa!==false&&freeDays(c,[d]));const ov=ok.filter(c=>!nearVac(c.id,d,d));if(ov.length)ok=ov;ok=RP(ok,'N',null,[d]).sort((x,y)=>H[x.id].night-H[y.id].night||H[x.id].m-H[y.id].m||H[x.id].r-H[y.id].r);c=ok[0];}
      if(!c){missing.push(`${DSEM[w]} ${fmtS(d)}: noite sem sobreaviso`);return;}
      setV(c.id,d,a.noturnoH);H[c.id].night+=a.noturnoH;
    });
  }
  buildIdx();return missing;
}

/* ================= alertas ================= */
function worked(c,d){
  if(onVac(c.id,d))return false;const v=getV(c.id,d);
  if(v==='J3')return true;
  if(isNum(v))return isWork(d)?true:isAc(c.id,d);
  if(v==='FO'||v==='FA'||v==='AT'||v==='BH')return false;
  if(v)return true;
  return isWork(d);
}
function hasMonthData(ym,aid){const m=state.escala[ym];if(!m)return false;return state.colaboradores.some(c=>c.areaId===aid&&m[c.id]&&Object.values(m[c.id]).some(v=>v==='J3'||isNum(v)));}
function escalaAlerts(ym,aid){
  const a=area(aid);if(!a)return[];const out=[];
  if(!hasMonthData(ym,aid))return[{lvl:'info',msg:'Escala deste mês ainda não foi gerada.'}];
  const cs=colabsOfArea(aid,ym),blocks=blocksAll(ym);
  blocks.forEach(b=>{
    if(!b.iso&&a.j3Vagas)j3Days(b).forEach(d=>{const n=cs.filter(c=>getV(c.id,d)==='J3').length;if(n<a.j3Vagas)out.push({lvl:'err',msg:`${DSEM[dow(d)]} ${fmtS(d)}: faltam ${a.j3Vagas-n} J3`});});
    if(a.saVagas)b.dias.forEach(d=>{const n=cs.filter(c=>isNum(getV(c.id,d))).length;if(n<a.saVagas)out.push({lvl:'err',msg:`${DSEM[dow(d)]} ${fmtS(d)}${isHol(d)?' (feriado)':''}: faltam ${a.saVagas-n} em sobreaviso`});});
  });
  if(a.noturnoH){const miss=nightTargets(a,ym).filter(d=>!cs.some(c=>isNum(getV(c.id,d))));if(miss.length)out.push({lvl:'info',msg:`${miss.length} noite(s) de semana sem sobreaviso: ${miss.slice(0,6).map(fmtS).join(', ')}${miss.length>6?'…':''}`});}
  const bym=blocksOfMonth(ym);const nEsc=escalaveis(aid).length,small=nEsc<bym.length*((a.saModo==='dia'?2:1)*a.saVagas+a.j3Vagas);
  cs.forEach(c=>{
    const regs=bym.map(b=>inBlock(c.id,b));const j=regs.filter(r=>r.J3).length,s=regs.filter(r=>r.SA).length;
    if(!small&&j>1)out.push({lvl:'warn',msg:`${c.nome}: ${j} fins de semana de J3 no mês`});
    if(!small&&s>1)out.push({lvl:'warn',msg:`${c.nome}: ${s} fins de semana de sobreaviso no mês`});
    bym.forEach((b,i)=>{const r=regs[i];if(!small&&(r.J3||r.SA)&&i>0&&(regs[i-1].J3||regs[i-1].SA)&&ddiff(bym[i-1].key,b.key)===7)out.push({lvl:'info',msg:`${c.nome}: plantão em fins de semana seguidos (${fmtS(bym[i-1].key)} e ${fmtS(b.key)})`});
      if((r.J3||r.SA)&&b.dias.some(d=>onVac(c.id,d)&&(getV(c.id,d)==='J3'||isNum(getV(c.id,d)))))out.push({lvl:'err',msg:`${c.nome}: escalado em ${fmtS(b.key)} durante as férias`});
      if(r.J3||r.SA){const nv=nearVac(c.id,b.start,b.end);if(nv)out.push({lvl:'warn',msg:nv.tipo==='antes'?`${c.nome}: plantão em ${fmtS(b.key)} na véspera das férias (início ${fmtS(nv.d)})`:`${c.nome}: plantão em ${fmtS(b.key)} logo após o retorno das férias (${fmtS(nv.d)})`});}
      if(r.SA&&b.dias.some(d=>isAc(c.id,d))&&getV(c.id,b.folgaDepois)!=='FO')out.push({lvl:'warn',msg:`${c.nome}: sobreaviso de ${fmtS(b.key)} acionado sem folga pós-plantão (${fmtS(b.folgaDepois)})`});});
  });
  const esc=escalaveis(aid);const cnt=c=>bym.filter(b=>{const r=inBlock(c.id,b);return r.J3||r.SA;}).length;
  const zero=esc.filter(c=>cnt(c)===0&&!bym.every(b=>b.dias.some(d=>onVac(c.id,d)))),two=esc.filter(c=>cnt(c)>1);
  if(!small&&zero.length&&two.length)out.push({lvl:'warn',msg:`Distribuição desigual: ${two.map(c=>first(c.nome)).join(', ')} com 2+ fins de semana enquanto ${zero.map(c=>first(c.nome)).join(', ')} sem nenhum.`});
  esc.forEach(c=>monthDays(ym).forEach(d=>{if(isWork(d)&&isNum(getV(c.id,d))&&!onVac(c.id,d)&&onVac(c.id,add(d,1)))out.push({lvl:'warn',msg:`${c.nome}: sobreaviso noturno em ${fmtS(d)}, véspera das férias`});}));
  const from=add(ym+'-01',-8),to=add(ym+'-'+pad(daysInMonth(ym)),8);
  esc.forEach(c=>{let run=[];const flush=()=>{if(run.length>6&&run.some(d=>d.startsWith(ym)))out.push({lvl:'err',msg:`${c.nome}: ${run.length} dias seguidos trabalhados (${fmtS(run[0])} a ${fmtS(run[run.length-1])}) — lance uma folga`});run=[];};for(const d of range(from,to)){if(worked(c,d))run.push(d);else flush();}flush();});
  return out;
}

/* ================= histórico ================= */
function monthStat(cid,ym){const k=cid+'|'+ym;if(k in SC)return SC[k];const m=state.escala[ym];let r=null;
  if(m){const cells=m[cid]||{};let j3=0,sa=0;const wk=new Set();for(const dd in cells){const v=cells[dd],d=ym+'-'+dd;if(v==='J3'){j3++;wk.add(satKey(d));}else if(isNum(v)){sa+=v;if(!isWork(d))wk.add(satKey(d));}}r={j3,sa,fds:wk.size,src:'grid'};}
  else{const h=state.histAgg[cid]&&state.histAgg[cid][ym];if(h)r={j3:h.j3||0,sa:h.sa||0,fds:null,src:'agg'};}
  return SC[k]=r;}
function lastNext(cid){const t=todayS();let lJ='',lS='',nJ='',nS='';Object.keys(state.escala).forEach(ym=>{const cells=state.escala[ym][cid];if(!cells)return;for(const dd in cells){const d=ym+'-'+dd,v=cells[dd];if(v==='J3'){if(d<=t){if(d>lJ)lJ=d;}else if(!nJ||d<nJ)nJ=d;}else if(isNum(v)&&!isWork(d)){if(d<=t){if(d>lS)lS=d;}else if(!nS||d<nS)nS=d;}}});return{lJ,lS,nJ,nS};}

/* ================= férias ================= */
const vacDays=f=>f.dias>0&&f.inicio?range(f.inicio,add(f.inicio,f.dias-1)):[];
function basePeriods(c){const today=todayS(),res=[];
  if(c.admissao){const lim=state.ferias.filter(f=>f.colabId===c.id&&f.inicio).reduce((m,f)=>f.inicio>m?f.inicio:m,today);for(let k=0;k<70;k++){const ini=addYears(c.admissao,k);if(ini>lim)break;res.push({key:ini,ini,fim:add(addYears(c.admissao,k+1),-1),concFim:add(addYears(c.admissao,k+2),-1)});}}
  else{const y=+today.slice(0,4);for(let k=y;k<=y+1;k++)res.push({key:`${k}-01-01`,ini:`${k}-01-01`,fim:`${k}-12-31`,concFim:`${k+1}-12-31`});}
  return res;}
function periodos(c,all){
  const today=todayS();
  if(!c.admissao){
    const fr=state.ferias.filter(f=>f.colabId===c.id);const nums=fr.map(f=>/^ciclo-\d+$/.test(f.periodo||'')?+f.periodo.slice(6):0);const max=Math.max(0,...nums);
    const res=[];let open=false;
    for(let n=1;n<=max+1;n++){const key='ciclo-'+n,ff=fr.filter(f=>f.periodo===key);const gozo=sum(ff.map(f=>f.dias)),abono=sum(ff.map(f=>f.abono||0)),saldo=30-gozo-abono;
      let status;if(n<max)status='historico';else if(n===max){status=saldo>0?'aberto':'quitado';open=saldo>0;}else status=open?'proximo':'aberto';
      const ds=ff.filter(f=>f.dias>0).map(f=>[f.inicio,add(f.inicio,f.dias-1)]).sort();
      res.push({key,ciclo:n,ini:null,fim:null,concFim:null,fr:ff,gozo,abono,direito:30,saldo,status,label:`Ciclo ${n}`,uso:ds.length?`gozo ${fmtS(ds[0][0])}/${ds[0][0].slice(2,4)} a ${fmtS(ds[ds.length-1][1])}/${ds[ds.length-1][1].slice(2,4)}`:''});}
    return res.filter(p=>all||p.ciclo>=max);
  }
  const al=allocFerias(c);const base=al.ps;
  const res=base.map(p=>{const fr=state.ferias.filter(f=>f.colabId===c.id&&(al.parts[f.id]||[]).some(x=>x.k===p.key));const pt=fr.flatMap(f=>al.parts[f.id].filter(x=>x.k===p.key).map(x=>({...x,id:f.id})));const gozo=sum(pt.map(x=>x.d)),abono=sum(pt.map(x=>x.a)),direito=30,saldo=direito-gozo-abono;
    const hd=state.config.historicoDesde||'2025-01-01';
    const status=p.fim>=today?'aquisicao':p.fim<hd&&saldo>0?'historico':saldo<=0?'quitado':p.concFim<today?(p.fim>=(state.config.controleDesde||'2026-12-01')?'vencido':'verificar'):'aberto';
    return{...p,fr,pt,gozo,abono,direito,saldo,status};});
  // esconde os anos anteriores aos registros (antes da base de dados)
  const firstUsed=res.findIndex(p=>p.fr.length);const vis=firstUsed<0?res.slice(-3):res.slice(firstUsed);
  return vis.filter(p=>all||p.concFim>=today||(p.fr.length&&p.status!=='historico'&&p.status!=='quitado'));
}
// distribui as férias nos períodos aquisitivos a partir da admissão (30 dias por período, o mais antigo primeiro)
const ALLOC={};
function allocFerias(c){const k=c.id+'|'+c.admissao+'|'+state.ferias.length;if(ALLOC[k]&&ALLOC[k].v===ALLOC_V)return ALLOC[k];
  const ps=basePeriods(c),byKey={},rem={},parts={};ps.forEach(p=>{byKey[p.key]=p;rem[p.key]=30;});const today=todayS();
  const fr=state.ferias.filter(f=>f.colabId===c.id);const valid=(p,d)=>p.fim<d&&d<=p.concFim;const put=(f,key,d,a)=>{(parts[f.id]=parts[f.id]||[]).push({k:key,d,a});rem[key]-=d+a;};
  const dated=fr.filter(f=>f.dias>0&&f.inicio).sort((a,b)=>cmp(a.inicio,b.inicio));
  // primeiro período considerado: o que cobre a primeira férias registrada (anteriores ficam fora — antes da base de dados)
  let s0=0;if(dated.length){const d0=dated[0].inicio;const i=ps.findIndex(p=>valid(p,d0));s0=i>=0?i:Math.max(0,ps.findIndex(p=>p.ini<=d0&&d0<=p.fim));}
  // vendas sem data: no período informado (ou no último completo)
  fr.filter(f=>!(f.dias>0&&f.inicio)).forEach(f=>{const p=byKey[f.periodo]||ps.filter(p=>p.fim<today).pop()||ps[ps.length-1];if(p)put(f,p.key,+f.dias||0,+f.abono||0);});
  dated.forEach(f=>{const d=f.inicio,ab=+f.abono||0;let left=+f.dias||0;const st=byKey[f.periodo];
    if(st&&valid(st,d)&&rem[st.key]>=left+ab){put(f,st.key,left,ab);return;}
    // saldo mais antigo primeiro, dividindo entre períodos quando necessário
    const sl=ps.slice(s0);const el=[...sl.filter(p=>valid(p,d)),...sl.filter(p=>p.concFim<d),...sl.filter(p=>p.ini<=d&&d<=p.fim)];let a=ab;
    for(const p of el){if(left<=0)break;const r=rem[p.key];if(r<=0)continue;const t=Math.min(r,left+a);const ta=Math.min(a,t),td=t-ta;put(f,p.key,td,ta);left-=td;a-=ta;}
    if(left>0||a>0){const p=el[el.length-1]||ps.find(p=>p.ini<=d&&d<=p.fim)||ps[ps.length-1];put(f,p.key,left,a);}});
  const map={};Object.keys(parts).forEach(id=>{const pp=parts[id].filter(x=>x.d||x.a);map[id]=(pp[0]||parts[id][0]).k;parts[id]=pp.length?pp:parts[id];});
  return ALLOC[k]={v:ALLOC_V,ps,map,parts};}
let ALLOC_V=0;
const perOf=f=>{const c=colab(f.colabId);return c&&c.admissao?(allocFerias(c).map[f.id]||f.periodo):f.periodo;};
// grava no lançamento o período calculado (corrige períodos antigos ou de antes da admissão ser informada)
function normalizePeriods(c){if(!c||!c.admissao)return 0;ALLOC_V++;const al=allocFerias(c);let n=0;state.ferias.filter(f=>f.colabId===c.id).forEach(f=>{const k=al.map[f.id];if(k&&f.periodo!==k){f.periodo=k;n++;}});return n;}
const perLabel=k=>/^ciclo-/.test(k||'')?'Ciclo '+k.slice(6):'Aquisitivo '+fmt(k);
function reassignPeriods(c){normalizePeriods(c);}
const STATUS={aquisicao:['Em aquisição','b-fe'],aberto:['Disponível','b-ok'],vencido:['Vencido — confirmar','b-er'],quitado:['Quitado',''],historico:['Histórico (antes dos dados)',''],proximo:['Próximo ciclo','b-fe'],verificar:['Saldo antigo — verificar','b-wa']};
function saldoInfo(c){const ps=periodos(c).filter(p=>p.status==='aberto'||p.status==='vencido');const s=sum(ps.map(p=>p.saldo));const venc=ps.some(p=>p.status==='vencido');const soon=ps.some(p=>p.saldo>0&&p.concFim<=add(todayS(),90));return{s,venc,soon,est:!c.admissao};}
function groups(){
  const g=[];const lid=activeColabs().filter(c=>c.funcao==='supervisor'||c.funcao==='gerente').sort((a,b)=>cmp(a.funcao==='gerente'?0:1,b.funcao==='gerente'?0:1)||cmp(a.nome,b.nome));
  if(lid.length)g.push({key:'lid',nome:'Liderança — gerência e supervisores',members:lid,max:1});
  state.supervisoes.slice().sort((a,b)=>cmp(a.nome,b.nome)).forEach(s=>{const a=area(s.areaId);const r=colab(s.responsavelId);g.push({key:s.id,nome:`Supervisão ${s.nome}${a?' · '+a.nome:''}`,members:activeColabs().filter(c=>c.funcao==='tecnico'&&c.supervisaoId===s.id).sort((x,y)=>((area(x.areaId)?.ordem??99)-(area(y.areaId)?.ordem??99))||cmp(x.nome,y.nome)),max:+s.feriasMax||1,sup:s,areaId:s.areaId});});
  areasSorted().forEach(a=>{const m=activeColabs().filter(c=>c.funcao==='tecnico'&&!sup(c.supervisaoId)&&c.areaId===a.id).sort((x,y)=>cmp(x.nome,y.nome));if(m.length)g.push({key:'ar:'+a.id,nome:a.nome,members:m,max:+a.feriasMax||1,areaId:a.id});});
  const orf=activeColabs().filter(c=>c.funcao==='tecnico'&&!sup(c.supervisaoId)&&!area(c.areaId));if(orf.length)g.push({key:'none',nome:'Sem área definida',members:orf,max:999});
  return g.filter(x=>x.members.length);
}
const groupOf=c=>groups().find(g=>g.members.some(m=>m.id===c.id));
function conflictData(from,to){
  const byColab={},list=[];
  groups().forEach(g=>{const perDay={};g.members.forEach(c=>{(IDX.vac[c.id]||new Set()).forEach(d=>{if(d<from||d>to)return;(perDay[d]=perDay[d]||[]).push(c);});});
    const days=Object.keys(perDay).filter(d=>perDay[d].length>g.max).sort();
    days.forEach(d=>perDay[d].forEach(c=>(byColab[c.id]=byColab[c.id]||new Set()).add(d)));
    let cur=null;days.forEach(d=>{const n=perDay[d].map(c=>c.nome).sort().join(', ');if(cur&&cur.nomes===n&&add(cur.ate,1)===d)cur.ate=d;else{cur={grupo:g.nome,de:d,ate:d,nomes:n};list.push(cur);}});});
  return{byColab,list};
}
function teamConf(c,days,ignoreId){
  const g=groupOf(c);if(!g)return[];const set=new Set(days),perDay={},res={};
  state.ferias.forEach(f=>{if(f.id===ignoreId||f.colabId===c.id||!g.members.some(m=>m.id===f.colabId))return;vacDays(f).forEach(d=>{if(set.has(d))(perDay[d]=perDay[d]||new Set()).add(f.colabId);});});
  Object.keys(perDay).forEach(d=>{if(perDay[d].size+1>g.max)perDay[d].forEach(id=>{const r=res[id]=res[id]||{nome:colab(id)?.nome,de:d,ate:d};if(d<r.de)r.de=d;if(d>r.ate)r.ate=d;});});
  return Object.values(res);
}
function validarFerias(c,per,n,ignoreId){
  const errs=[],warns=[];const outros=per.fr.filter(f=>f.id!==ignoreId);const pt=f=>(per.pt||[]).filter(x=>x.id===f.id);const dOf=f=>per.pt?sum(pt(f).map(x=>x.d)):+f.dias||0,aOf=f=>per.pt?sum(pt(f).map(x=>x.a)):+f.abono||0;
  const frs=outros.filter(f=>dOf(f)>0).map(dOf);if(n.dias>0)frs.push(n.dias);
  const abonoT=sum(outros.map(aOf))+n.abono,gozoT=sum(frs),rem=per.direito-gozoT-abonoT,maxAb=Math.floor(per.direito/3);
  if(n.dias<0||n.abono<0||!Number.isInteger(n.dias)||!Number.isInteger(n.abono))errs.push('Informe números inteiros e positivos.');
  if(!n.dias&&!n.abono)errs.push('Informe os dias de gozo e/ou os dias vendidos.');
  if(n.dias>0&&!n.inicio)errs.push('Informe a data de início.');
  if(n.dias>0&&n.dias<5)errs.push('Cada período de gozo deve ter no mínimo 5 dias corridos (CLT, art. 134 §1º).');
  if(frs.length>3)errs.push('As férias podem ser divididas em no máximo 3 períodos (CLT, art. 134 §1º).');
  if(rem<0)errs.push(`Ultrapassa o saldo do período aquisitivo em ${-rem} dia(s).`);
  if(abonoT>maxAb)errs.push(`A venda (abono pecuniário) é limitada a ${maxAb} dias, 1/3 do direito (CLT, art. 143).`);
  if(rem>=0&&!frs.some(x=>x>=14)){const left=3-frs.length;if(rem<14||left<1)errs.push('Um dos períodos precisa ter no mínimo 14 dias corridos — com este lançamento isso deixa de ser possível (CLT, art. 134 §1º).');}
  if(rem>0&&rem<5){if(abonoT+rem<=maxAb)warns.push(`Restarão ${rem} dia(s), abaixo do mínimo de 5 para gozo: só poderão ser vendidos.`);else errs.push(`Restariam ${rem} dia(s), que não podem ser gozados (mín. 5) nem vendidos (limite ${maxAb}).`);}
  if(rem>=5&&frs.length>=3&&abonoT+rem>maxAb)errs.push('Não restará fração disponível para usar o saldo restante (máximo de 3 períodos).');
  if(!c.admissao)warns.push('Admissão não informada (mais de 1 ano de empresa): saldo controlado por ciclo anual. Informe a data para o cálculo exato do período aquisitivo.');
  let conf=[];
  if(n.dias>0&&n.inicio){const fim=add(n.inicio,n.dias-1);const w=dow(n.inicio);
    if(w===5||w===6||isHol(add(n.inicio,1))||isHol(add(n.inicio,2)))warns.push('Início nos 2 dias que antecedem feriado ou descanso semanal remunerado — vedado pela CLT (art. 134 §3º).');
    else if(!isWork(n.inicio))warns.push('Início em dia não útil.');
    const mine=new Set();state.ferias.filter(f=>f.colabId===c.id&&f.id!==ignoreId).forEach(f=>vacDays(f).forEach(d=>mine.add(d)));
    if(range(n.inicio,fim).some(d=>mine.has(d)))errs.push('Sobrepõe outro período de férias deste colaborador.');
    if(per.concFim&&fim>per.concFim)warns.push(`Termina após o fim do período concessivo (${fmt(per.concFim)}) — os dias excedentes devem ser pagos em dobro (CLT, art. 137).`);
    if(c.admissao&&n.inicio<=per.fim)warns.push(`O período aquisitivo só se completa em ${fmt(per.fim)} — isto seria concessão antecipada.`);
    const pl=range(n.inicio,fim).filter(d=>{const v=getV(c.id,d);return v==='J3'||isNum(v);});
    if(pl.length)warns.push(`Há plantão escalado em ${pl.length} dia(s) do período (${pl.slice(0,5).map(fmtS).join(', ')}${pl.length>5?'…':''}). Ajuste a escala.`);
    conf=teamConf(c,range(n.inicio,fim),ignoreId);}
  return{errs,warns,rem,gozoT,abonoT,conf,maxAb};
}
function feriasAVencer(){const lim=add(todayS(),150),out=[];activeColabs().filter(c=>c.admissao).forEach(c=>periodos(c).forEach(p=>{if((p.status==='aberto'||p.status==='vencido')&&p.saldo>0&&p.concFim<=lim)out.push({c,p,limite:add(p.concFim,-p.saldo+1)});}));return out.sort((a,b)=>cmp(a.p.concFim,b.p.concFim));}

/* ================= banco (Supabase) ================= */
const CFG=window.APP_CONFIG||{};
let sb=null,SESSION=null,PROFILE=null,SYNCED=null,syncing=false,lastLoad=0,USERS=null,AUDIT=null;
const ROLE=()=>(PROFILE&&PROFILE.role)||'leitura';
const isAdmin=()=>ROLE()==='admin';
const canEditAny=()=>isAdmin()||(ROLE()==='supervisor'&&!!PROFILE.supervisao_id);
const canEditColab=cid=>{if(isAdmin())return true;if(ROLE()!=='supervisor'||!PROFILE.supervisao_id)return false;const c=colab(cid);return !!c&&c.supervisaoId===PROFILE.supervisao_id;};
const ROLE_LABEL={admin:'Administrador',supervisor:'Supervisor',leitura:'Leitura'};
function deny(){toast(ROLE()==='leitura'?'Seu perfil é somente leitura — peça ao administrador para liberar edição.':'Você só pode alterar colaboradores da sua supervisão.');}
async function fetchAll(table){let out=[],from=0;for(;;){const{data,error}=await sb.from(table).select('*').range(from,from+999);if(error)throw error;out=out.concat(data);if(data.length<1000)break;from+=1000;}return out;}
const parseVal=v=>/^\d+(\.\d+)?$/.test(v)?+v:v;
async function loadAll(){
  const T=['areas','supervisoes','colaboradores','feriados','ferias','escala','hist_agg','config'];
  const [ar,su,co,fe,fr,es,ha,cf]=await Promise.all(T.map(fetchAll));
  const s={version:2,config:{},areas:ar.map(r=>r.dados),supervisoes:su.map(r=>r.dados),colaboradores:co.map(r=>({...r.dados,id:r.id,supervisaoId:r.supervisao_id||'',ativo:r.ativo})),feriados:fe.map(r=>({data:r.data,nome:r.nome})),ferias:fr.map(r=>({...r.dados,id:r.id,colabId:r.colab_id})),escala:{},acionados:{},histAgg:{}};
  cf.forEach(r=>s.config[r.chave]=r.valor);
  es.forEach(r=>{const ym=r.data.slice(0,7),dd=r.data.slice(8,10);const m=s.escala[ym]=s.escala[ym]||{};(m[r.colab_id]=m[r.colab_id]||{})[dd]=parseVal(r.valor);if(r.acionado){const a=s.acionados[ym]=s.acionados[ym]||{};(a[r.colab_id]=a[r.colab_id]||{})[dd]=1;}});
  ha.forEach(r=>{(s.histAgg[r.colab_id]=s.histAgg[r.colab_id]||{})[r.ym]={j3:r.j3==null?undefined:+r.j3,sa:r.sa==null?undefined:+r.sa};});
  state=migrate(s);invalidateHol();SYNCED=snapshot();lastLoad=Date.now();state.savedAt=lastLoad;
}
const PK={areas:'id',supervisoes:'id',colaboradores:'id',feriados:'data',ferias:'id',escala:'colab_id,data',config:'chave'};
function rowsOf(){
  const R={areas:{},supervisoes:{},colaboradores:{},feriados:{},ferias:{},escala:{},config:{}};
  state.areas.forEach(a=>R.areas[a.id]={id:a.id,dados:a});
  state.supervisoes.forEach(x=>R.supervisoes[x.id]={id:x.id,dados:x});
  state.colaboradores.forEach(c=>R.colaboradores[c.id]={id:c.id,supervisao_id:c.supervisaoId||null,ativo:c.ativo!==false,dados:c});
  state.feriados.forEach(f=>R.feriados[f.data]={data:f.data,nome:f.nome});
  state.ferias.forEach(f=>R.ferias[f.id]={id:f.id,colab_id:f.colabId,dados:f});
  for(const ym in state.escala)for(const cid in state.escala[ym])for(const dd in state.escala[ym][cid]){const d=ym+'-'+dd;R.escala[cid+'|'+d]={colab_id:cid,data:d,valor:String(state.escala[ym][cid][dd]),acionado:isAc(cid,d)};}
  for(const k in state.config)R.config[k]={chave:k,valor:state.config[k]};
  return R;}
function snapshot(){const R=rowsOf(),S={};for(const t in R){S[t]={};for(const k in R[t])S[t][k]=JSON.stringify(R[t][k]);}return S;}
function persistUI(){try{localStorage.setItem(LSU,JSON.stringify(ui));}catch(e){}}
function loadUI(){try{return JSON.parse(localStorage.getItem(LSU)||'{}')||{};}catch(e){return{};}}
function touch(){dirty=true;ALLOC_V++;invalidateHol();setStatus('dirty');clearTimeout(saveTimer);saveTimer=setTimeout(doSave,1200);}
async function doSave(){
  if(!dirty||!sb)return;if(syncing||M){clearTimeout(saveTimer);saveTimer=setTimeout(doSave,1500);return;}
  syncing=true;setStatus('saving');const R=rowsOf();let changed=0;
  try{
    for(const t in R){const up=[],del=[],snap={};
      for(const k in R[t]){const js=JSON.stringify(R[t][k]);snap[k]=js;if(SYNCED[t][k]!==js)up.push(R[t][k]);}
      for(const k in SYNCED[t])if(!(k in R[t]))del.push(k);
      for(let i=0;i<up.length;i+=500){const{error}=await sb.from(t).upsert(up.slice(i,i+500),{onConflict:PK[t]});if(error)throw error;}
      if(del.length){if(t==='escala'){const by={};del.forEach(k=>{const[c,d]=k.split('|');(by[c]=by[c]||[]).push(d);});for(const c in by)for(let i=0;i<by[c].length;i+=200){const{error}=await sb.from(t).delete().eq('colab_id',c).in('data',by[c].slice(i,i+200));if(error)throw error;}}
        else for(let i=0;i<del.length;i+=200){const{error}=await sb.from(t).delete().in(PK[t],del.slice(i,i+200));if(error)throw error;}}
      changed+=up.length+del.length;SYNCED[t]=snap;}
    dirty=false;state.savedAt=Date.now();setStatus('saved');
  }catch(e){console.error(e);const msg=String(e.message||e);setStatus('err');
    if(/row-level|permission|42501/i.test(msg)){toast('Alteração recusada pelo banco: sem permissão. Recarregando os dados.');dirty=false;await reloadData();}
    else toast('Não foi possível salvar: '+msg);}
  finally{syncing=false;}
}
async function reloadData(){try{await loadAll();render();}catch(e){toast('Erro ao recarregar: '+(e.message||e));}}
function setStatus(s){saveSt=s;const el=$('#savest');if(el)el.innerHTML=saveStatusHtml();}
function saveStatusHtml(){
  const m={dirty:['w','Salvando em instantes…'],saving:['w','Salvando…'],saved:['','Salvo no banco'],err:['e','Erro ao salvar — <button class="btn sm" data-act="saveNow">Tentar de novo</button>']};
  const[c,t]=m[saveSt]||m.saved;return `<span class="dot ${c}" title="${t.replace(/<[^>]+>/g,'')}"></span><span class="slbl">${t}</span><button class="btn sm" data-act="reload" title="Buscar alterações de outros usuários">↻</button>`;
}

/* ================= UI base ================= */
const ui=Object.assign({tab:'geral',ym:todayS().slice(0,7),areaId:'',year:+todayS().slice(0,4),fview:'12m',fArea:'',fSup:'',q:'',sub:'colab',cq:'',hy:+todayS().slice(0,4),hArea:'',hm:'sa',hn:'12',allAl:false},loadUI());
function toast(msg){const d=document.createElement('div');d.textContent=msg;$('#toast').appendChild(d);setTimeout(()=>d.remove(),3500);}
function openModal(m){M=m;drawModal();}
function closeModal(){M=null;$('#modal').innerHTML='';if(dirty){clearTimeout(saveTimer);saveTimer=setTimeout(doSave,1500);}}
function drawModal(){if(!M)return;$('#modal').innerHTML=`<div class="ov" data-act="ov"><div class="mdl ${M.wide?'wide':''} ${M.cls||''}">${M.render()}</div></div>`;}
const mHead=t=>`<div class="mh"><h3>${t}</h3><button class="x" data-act="close" aria-label="Fechar">×</button></div>`;
function confirmBox(title,msg,okLabel,fn,danger){openModal({render:()=>`${mHead(title)}<div class="mb"><p style="margin:0">${msg}</p></div><div class="mf"><span class="sp"></span><button class="btn" data-act="close">Cancelar</button><button class="btn pri" ${danger?'style="background:var(--er);border-color:var(--er)"':''} data-act="ok">${okLabel}</button></div>`,act(a){if(a==='close')closeModal();if(a==='ok'){closeModal();fn();}}});}
async function copyText(txt){try{await navigator.clipboard.writeText(txt);toast('Copiado — cole no Excel ou no WhatsApp');}catch(e){openModal({wide:true,render:()=>`${mHead('Copiar')}<div class="mb"><p class="hint">Selecione tudo e copie (Ctrl+C):</p><textarea readonly style="width:100%;height:320px;font-family:monospace;font-size:12px">${esc(txt)}</textarea></div>`,act(a){if(a==='close')closeModal();}});}}
const alertHtml=list=>list.map(x=>`<div class="alert ${x.lvl}">${x.lvl==='err'?'⛔':x.lvl==='warn'?'⚠️':'ℹ️'} <span>${esc(x.msg)}</span></div>`).join('');
function tagHtml(v,ac,vac){
  if(vac)return `<span class="tag t-FE">FE</span>`;
  if(v==null)return '';
  if(isNum(v))return `<span class="tag t-SA">${v}${ac?'⚡':''}</span>`;
  const cls={J3:'t-J3',FO:'t-F',BH:'t-BH',FA:'t-FA',AT:'t-AT',TR:'t-TR'}[v]||'t-X';
  return `<span class="tag ${cls}">${esc(v)}</span>`;
}

/* ================= layout v3 ================= */
const SVGI=p=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const IC={
  geral:SVGI('<path d="M3 11l9-7 9 7v9H3z"/><path d="M9 20v-6h6v6"/>'),
  escala:SVGI('<rect x="3" y="5" width="18" height="16"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M8 14h2M14 14h2M8 17h2"/>'),
  historico:SVGI('<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>'),
  ferias:SVGI('<path d="M12 3a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9z"/><path d="M12 12v8"/><path d="M9 20h6"/>'),
  cadastros:SVGI('<circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M17 8h4M19 6v4"/>'),
  config:SVGI('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>'),
  users:SVGI('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 2.9-6 6.5-6s6.5 2.5 6.5 6"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2 .6 3.5 2.6 3.5 6"/>'),
  clock:SVGI('<circle cx="12" cy="13" r="8"/><path d="M12 9v4.5l3 2"/>'),
  shield:SVGI('<path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/>'),
  alert:SVGI('<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.1"/>'),
  beach:SVGI('<path d="M12 3a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9z"/><path d="M12 12v8M9 20h6"/>'),
  bolt:SVGI('<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>'),
  trend:SVGI('<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>'),
  flag:SVGI('<path d="M5 21V4h11l-2 4 2 4H5"/>'),
  doc:SVGI('<path d="M6 3h9l3 3v15H6z"/><path d="M9 11h6M9 15h6"/>'),
  sun:SVGI('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
  moon:SVGI('<path d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5z"/>'),
  swap:SVGI('<path d="M7 7h13l-3-3M17 17H4l3 3"/>')
};
function pageHead(title,ghost,sub,tools){return `<div class="pagehead" data-ghost="${esc(ghost)}"><div><h1>${title}</h1><div class="sub">${sub||''}</div></div>${tools?`<div class="tools">${tools}</div>`:''}</div><div class="wrap">`;}
const secdiv=(n,t,ds)=>`<div class="secdiv"><div class="n">${n}</div><div><h2>${t}</h2>${ds?`<div class="ds">${ds}</div>`:''}</div><div class="ln"></div></div>`;
function ringSvg(segs){const R=118,C=2*Math.PI*R,vs=segs.filter(s=>s.v>0),tot=sum(vs.map(s=>s.v))||1;let off=0;const gap=vs.length>1?3:0;
  return `<svg class="hub-ring" viewBox="0 0 300 300" aria-hidden="true"><circle cx="150" cy="150" r="${R}" fill="none" stroke="var(--glassline)" stroke-width="12"/>`+vs.map(s=>{const L=s.v/tot*C;const el=`<circle cx="150" cy="150" r="${R}" fill="none" stroke="${s.c}" stroke-width="12" stroke-dasharray="${Math.max(0,L-gap).toFixed(1)} ${C.toFixed(1)}" stroke-dashoffset="${(-off).toFixed(1)}" transform="rotate(-90 150 150)"><title>${esc(s.t||'')}</title></circle>`;off+=L;return el;}).join('')+'</svg>';}
const hubIt=(ic,lbl,v,s,o={})=>`<div class="hub-it ${o.act?'clk':''}" ${o.act?`data-act="${o.act}" ${o.data||''}`:''}><div class="hub-hd">${IC[ic]||''}<span>${lbl}</span></div><div class="hub-bd"><span class="hub-v ${o.cls||''}">${v}</span><span class="hub-s">${s||''}</span></div></div>`;
const hub=(left,core,right)=>`<div class="hub"><div class="hub-col hub-l">${left.join('')}</div><div class="hub-core">${ringSvg(core.segs)}<div class="hub-in"><div class="k">${core.k}</div><div class="v">${core.v}</div><div class="s">${core.s||''}</div>${core.pill||''}</div></div><div class="hub-col hub-r">${right.join('')}</div></div>`;
const AREA_COR=['#FFD919','#85A7FF','#C0A1FF','#79D988','#FFB987','#ef4444','#8583A8','#5A11EE','#2E2D39','#00A6A6'];
const areaShort=n=>String(n||'').replace(/ - SPO - /,' ').replace(/Infraestrutura/g,'Infra').split(' - ').slice(0,2).join(' ');
const areaCor=id=>{const i=areasSorted().findIndex(a=>a.id===id);return AREA_COR[(i<0?0:i)%AREA_COR.length];};
const fmtN=n=>(+n||0).toLocaleString('pt-BR',{maximumFractionDigits:1});
const pct=n=>(n>0?'+':'')+Math.round(n*100)+'%';
function temaAtual(){return document.documentElement.dataset.theme==='dark'?'dark':'light';}
function setTema(t){document.documentElement.dataset.theme=t;try{localStorage.setItem('ge_tema',t);}catch(e){}}
const temaHtml=()=>`<div class="tema" title="Tema da tela"><button data-act="tema" data-v="light" class="${temaAtual()==='light'?'on':''}" aria-label="Tema claro">${IC.sun}</button><button data-act="tema" data-v="dark" class="${temaAtual()==='dark'?'on':''}" aria-label="Tema escuro">${IC.moon}</button></div>`;
const TABS=[['geral','Visão geral'],['escala','Escala'],['historico','Histórico'],['ferias','Férias'],['cadastros','Cadastros'],['config','Configurações']];
const tabsFor=()=>ROLE()==='leitura'?TABS.filter(([k])=>!['historico','cadastros','config'].includes(k)):TABS;
const tabOk=k=>tabsFor().some(([x])=>x===k);

/* ---------- Visão geral ---------- */
function coberturaMes(ym){let need=0,fill=0;areasSorted().forEach(a=>{const cs=colabsOfArea(a.id,ym);blocksAll(ym).forEach(b=>{
  if(!b.iso&&a.j3Vagas)j3Days(b).forEach(d=>{need+=a.j3Vagas;fill+=Math.min(a.j3Vagas,cs.filter(c=>getV(c.id,d)==='J3').length);});
  if(a.saVagas)b.dias.forEach(d=>{need+=a.saVagas;fill+=Math.min(a.saVagas,cs.filter(c=>isNum(getV(c.id,d))).length);});});
  if(a.noturnoH)nightTargets(a,ym).forEach(d=>{need++;if(cs.some(c=>isNum(getV(c.id,d))))fill++;});});return{need,fill};}
function rGeral(){
  const ym=todayS().slice(0,7);
  let alerts=[];areasSorted().forEach(a=>escalaAlerts(ym,a.id).forEach(x=>{if(x.lvl!=='info')alerts.push({...x,msg:`[${a.nome}] ${x.msg}`});}));
  const errs=alerts.filter(a=>a.lvl==='err').length;
  const conf=conflictData(todayS(),add(todayS(),365)).list;const venc=feriasAVencer();
  const nb=makeBlock(nextBlockKey());
  const rows=areasSorted().map(a=>{const p=blockPeople(a.id,nb);const nm=c=>`<div><b>${esc(short(c.nome))}</b> <span class="muted small">${esc(c.telefone||'')}</span></div>`;
    return `<tr><td class="small"><b>${esc(a.nome)}</b></td><td>${p.J3.map(nm).join('')||(a.j3Vagas?'<span class="badge b-er">vago</span>':'<span class="muted small">—</span>')}</td><td>${p.SA.map(x=>`<div><b>${esc(short(x.c.nome))}</b> <span class="badge b-sa">${x.days.map(d=>DS1[dow(d)]+' '+getV(x.c.id,d)+'h').join(' · ')}</span> <span class="muted small">${esc(x.c.telefone||'')}</span></div>`).join('')||'<span class="badge b-er">vago</span>'}</td></tr>`;}).join('');
  const hrs=sum(activeColabs().map(c=>monthStat(c.id,ym)?.sa||0)),j3d=sum(activeColabs().map(c=>monthStat(c.id,ym)?.j3||0));
  const emFerias=activeColabs().filter(c=>onVac(c.id,todayS()));
  const cob=coberturaMes(ym),cp=cob.need?Math.round(cob.fill/cob.need*100):0;
  const pill=cp>=100?'<span class="pill p-ok">Escala completa</span>':cp>=90?'<span class="pill p-at">Faltam vagas</span>':'<span class="pill p-er">Escala incompleta</span>';
  return pageHead('Visão geral','Geral',`${DSEM[dow(todayS())]}, ${fmt(todayS())} · Planta Interna SP · escala de ${ymLabel(ym).toLowerCase()}`,`${shareBtnGeral()}<button class="btn" data-act="copyWk" data-k="${nb.key}">⧉ Mensagem do fim de semana</button>`)+
  `<div class="esc-titulo">Resultado consolidado <b>Planta Interna SP — ${ymLabel(ym)}</b></div>`+
  hub([hubIt('users','Colaboradores ativos',activeColabs().length,`${activeColabs().filter(c=>c.funcao==='tecnico').length} técnicos · ${state.areas.length} áreas de plantão`),
       hubIt('clock','Sobreaviso no mês',fmtN(hrs)+' h','horas à disposição lançadas na escala',{act:'tab',data:'data-v="escala"'}),
       hubIt('shield','Plantão J3',j3d,'dias de J3 (08h–17h) no mês')],
      {segs:[{v:cob.fill,c:'#79D988',t:'Vagas preenchidas'},{v:cob.need-cob.fill,c:'#ef4444',t:'Vagas sem plantonista'}],k:'Cobertura da escala',v:cp+'%',s:`${cob.fill} de ${cob.need} vagas de plantão preenchidas`,pill},
      [hubIt('alert','Alertas da escala',alerts.length,errs?`${errs} críticos — veja abaixo`:'nenhum crítico',{cls:errs?'er':alerts.length?'at':'ok',act:'tab',data:'data-v="escala"'}),
       hubIt('flag','Conflitos de férias',conf.length,'sobreposições nos próximos 12 meses',{cls:conf.length?'er':'ok',act:'tab',data:'data-v="ferias"'}),
       hubIt('beach','De férias hoje',emFerias.length,emFerias.map(c=>short(c.nome)).join(', ')||'ninguém')])+
  secdiv(1,'Próximo fim de semana',`${diasLabel(nb.dias)}${nb.dias.some(isHol)?' · com feriado emendado':''}`)+
  `<div class="card"><h3>Plantonistas · ${diasLabel(nb.dias)} <button class="btn sm push" data-act="copyWk" data-k="${nb.key}">Copiar mensagem</button></h3><div class="tw"><table class="t"><thead><tr><th>Área</th><th>J3 (08h–17h)</th><th>Sobreaviso</th></tr></thead><tbody>${rows}</tbody></table></div></div>`+
  secdiv(2,'Pontos de atenção','alertas da escala do mês e conflitos de férias')+
  `<div class="cols"><div class="card"><h3>Alertas da escala · ${ymLabel(ym)}</h3>${alerts.length?alertHtml(alerts.slice(0,12))+(alerts.length>12?`<p class="hint">+${alerts.length-12} alertas na aba Escala</p>`:''):'<div class="alert ok">Escala dentro das regras.</div>'}</div>
   <div class="card"><h3>Conflitos de férias</h3>${conf.length?`<div class="tw"><table class="t"><thead><tr><th>Período</th><th>Grupo</th><th>Quem</th></tr></thead><tbody>${conf.map(x=>`<tr><td><span class="badge b-er">${fmtS(x.de)}${x.ate!==x.de?' – '+fmtS(x.ate):''}/${x.de.slice(2,4)}</span></td><td class="small">${esc(x.grupo)}</td><td class="small">${esc(x.nomes)}</td></tr>`).join('')}</tbody></table></div>`:'<div class="alert ok">Nenhuma sobreposição nos próximos 12 meses.</div>'}</div></div>`+
  secdiv(3,'Férias a vencer','saldos que precisam ser programados nos próximos 150 dias')+
  `<div class="card"><h3>Férias a vencer</h3>${venc.length?`<div class="tw"><table class="t"><thead><tr><th>Colaborador</th><th>Saldo</th><th>Iniciar até</th><th>Vence</th><th></th></tr></thead><tbody>${venc.map(v=>`<tr><td><b>${esc(v.c.nome)}</b></td><td><span class="badge ${v.p.status==='vencido'?'b-er':'b-wa'}">${v.p.saldo} d</span></td><td class="small">${fmt(v.limite)}</td><td class="small">${fmt(v.p.concFim)}</td><td>${canEditColab(v.c.id)?`<button class="btn sm" data-act="newFer" data-c="${v.c.id}">Lançar</button>`:''}</td></tr>`).join('')}</tbody></table></div>`:'<div class="alert ok">Nenhum saldo vencendo nos próximos 150 dias.</div>'}</div>`;
}

/* ---------- Histórico (dashboard) ---------- */
function histMonths(){const cur=todayS().slice(0,7),y=+cur.slice(0,4);const all=[...new Set([...Object.keys(state.escala),...Object.values(state.histAgg).flatMap(o=>Object.keys(o))])].filter(m=>m<=cur).sort();
  const p=ui.hp||'12';let a,b=cur;
  if(p==='ano')a=`${y}-01`;else if(p==='anoant'){a=`${y-1}-01`;b=`${y-1}-12`;}else if(p==='tudo')a=all[0]||cur;else a=ymAdd(cur,1-(+p));
  const r=[];for(let m=a;m<=b;m=ymAdd(m,1))r.push(m);return r;}
const HP={'3':'3 meses','6':'6 meses','12':'12 meses',ano:'Ano atual',anoant:'Ano anterior',tudo:'Tudo'};
const HM={sa:['Horas de sobreaviso','h'],j3:['Dias de J3','d'],fds:['Plantões (fds/feriados)','']};
function rHistEscala(){
  const months=histSel(),cur=todayS().slice(0,7),metric=ui.hm||'sa',mlab=HM[metric];
  const inSup=inSupSel;
  const val=(cid,m,k=metric)=>{const s=monthStat(cid,m);if(!s)return 0;return (k==='fds'?s.fds:s[k])||0;};
  const tot=(cid,k)=>sum(months.map(m=>val(cid,m,k)));
  const scopeAreas=selAreas();
  const peopleOf=aid=>state.colaboradores.filter(c=>c.areaId===aid&&inSup(c)&&(c.ativo!==false||months.some(m=>monthStat(c.id,m))));
  const P=scopeAreas.flatMap(a=>peopleOf(a.id));
  const areaTot=a=>{const ps=peopleOf(a.id);return{h:sum(ps.map(c=>tot(c.id,'sa'))),f:sum(ps.map(c=>tot(c.id,'fds'))),n:ps.filter(c=>c.ativo!==false).length};};
  const allTot={h:sum(areasSorted().map(a=>areaTot(a).h))};
  const H=sum(P.map(c=>tot(c.id,'sa'))),J=sum(P.map(c=>tot(c.id,'j3'))),F=sum(P.map(c=>tot(c.id,'fds')));
  const act=P.filter(c=>c.ativo!==false&&(c.sa!==false||c.j3));
  // equilíbrio do rodízio: desvio de cada pessoa vs média da própria área
  const amean={};scopeAreas.forEach(a=>{const ps=act.filter(c=>c.areaId===a.id);amean[a.id]=ps.length?sum(ps.map(c=>tot(c.id)))/ps.length:0;});
  const band=c=>{const m=amean[c.areaId];if(!m)return 'ok';const d=Math.abs(tot(c.id)-m)/m;return d<=.2?'ok':d<=.4?'at':'er';};
  const bc={ok:0,at:0,er:0};act.forEach(c=>bc[band(c)]++);const eqp=act.length?Math.round(bc.ok/act.length*100):0;
  const eqPill=eqp>=70?'<span class="pill p-ok">No equilíbrio</span>':eqp>=50?'<span class="pill p-at">Atenção</span>':'<span class="pill p-er">Desequilibrado</span>';
  let ac=0;P.forEach(c=>months.forEach(m=>{const o=state.acionados[m]&&state.acionados[m][c.id];if(o)ac+=Object.keys(o).length;}));
  let fd=0;const fp=new Set();P.forEach(c=>{const s=IDX.vac[c.id];if(!s)return;s.forEach(d=>{if(months.includes(d.slice(0,7))){fd++;fp.add(c.id);}});});
  const top=act.slice().sort((a,b)=>tot(b.id,'sa')-tot(a.id,'sa'))[0];
  const topDev=top&&amean[top.areaId]&&metric==='sa'?(tot(top.id,'sa')-amean[top.areaId])/amean[top.areaId]:null;
  const mH=months.filter(m=>m<cur);const avgM=mH.length?sum(mH.map(m=>sum(P.map(c=>val(c.id,m,'sa')))))/mH.length:0;const curH=sum(P.map(c=>val(c.id,cur,'sa')));
  const scopeName=scopeLabel();const supName=supLabel();
  const pLabel=months.length?`${ymShort(months[0])} – ${ymShort(months[months.length-1])}`:'';
  // escopo
  const crumb=`<div class="breadcrumb"><span>${esc(scopeName)}${esc(supName)}</span><span class="r">${periodoLabel(months)} · ${act.length} colaboradores escaláveis</span></div>`;
  const chips=fbar(filtrosComuns([msel('hm','Métrica',Object.entries(HM).map(([k,[l]])=>({v:k,l})),{single:true})]));
  const meta=`<div class="metabar"><b>Referência do rodízio</b><span>Carga de cada pessoa comparada à média da própria área:</span><span class="pill p-ok">até ±20% equilibrado</span><span class="pill p-at">±20–40% atenção</span><span class="pill p-er">acima de ±40%</span></div>`;
  // evolução
  const series=months.map(m=>{const by={};scopeAreas.forEach(a=>by[a.id]=sum(peopleOf(a.id).map(c=>val(c.id,m))));return{m,by,t:sum(Object.values(by)),j3:sum(P.map(c=>val(c.id,m,'j3')))};});
  const mx=Math.max(1,...series.map(s=>s.t)),avgS=series.length?sum(series.map(s=>s.t))/series.length:0;
  const chart=`<div class="chart">${series.map(s=>`<div class="cb" data-act="goYm" data-v="${s.m}" title="${ymLabel(s.m)}: ${fmtN(s.t)} ${mlab[1]} — clique para abrir a escala">${s.t?`<span class="vl">${fmtN(s.t)}</span>`:''}<div class="stk" style="height:${(s.t/mx*88).toFixed(1)}%">${scopeAreas.map(a=>s.by[a.id]?`<i style="height:${(s.by[a.id]/s.t*100).toFixed(2)}%;background:${areaCor(a.id)}" title="${esc(a.nome)}: ${fmtN(s.by[a.id])}"></i>`:'').join('')}</div></div>`).join('')}${avgS?`<div class="avg" style="bottom:${(avgS/mx*0.88*220).toFixed(0)}px"><span>média ${fmtN(avgS)}</span></div>`:''}</div><div class="cx">${series.map(s=>`<span>${ymShort(s.m)}</span>`).join('')}</div>${metric!=='j3'?`<div class="cx j3">${series.map(s=>`<span title="dias de J3">${s.j3?'J3 '+s.j3:''}</span>`).join('')}</div>`:''}`;
  const lgd=scopeAreas.length>1?`<div class="lgd">${scopeAreas.map(a=>`<span><i style="background:${areaCor(a.id)}"></i>${esc(areaShort(a.nome))}</span>`).join('')}</div>`:'';
  // ranking
  const rk=act.slice().sort((a,b)=>tot(b.id)-tot(a.id));const rmx=Math.max(1,...rk.map(c=>tot(c.id)),...Object.values(amean));
  const bcor={ok:'#79D988',at:'#FFB987',er:'#ef4444'};
  const rank=`<div class="hbars">${rk.map(c=>{const v=tot(c.id),b=band(c),m=amean[c.areaId];return `<div class="hb" title="${esc(c.nome)} · ${esc(area(c.areaId)?.nome||'')} · média da área ${fmtN(m)}"><span class="nm"><b>${esc(short(c.nome))}</b> <span class="muted small">${esc(areaShort(area(c.areaId)?.nome))}</span></span><span class="tr"><i style="width:${(v/rmx*100).toFixed(1)}%;background:${bcor[b]}"></i>${m?`<span class="mk" style="left:${(m/rmx*100).toFixed(1)}%"></span>`:''}</span><b>${fmtN(v)}${mlab[1]?' '+mlab[1]:''}</b></div>`;}).join('')||'<p class="muted">Sem colaboradores no filtro.</p>'}</div><div class="lgd"><span><i style="background:#79D988"></i>equilibrado</span><span><i style="background:#FFB987"></i>atenção</span><span><i style="background:#ef4444"></i>fora da faixa</span><span><i style="background:var(--txt);width:2px"></i>média da área</span></div>`;
  // cards por área
  const lc=`<div class="lcards">${scopeAreas.map(a=>{const ps=peopleOf(a.id),pa=act.filter(c=>c.areaId===a.id);const h=sum(ps.map(c=>tot(c.id,'sa'))),f=sum(ps.map(c=>tot(c.id,'fds'))),j=sum(ps.map(c=>tot(c.id,'j3')));const tp=pa.slice().sort((x,y)=>tot(y.id,'sa')-tot(x.id,'sa'))[0];const ok=pa.filter(c=>band(c)==='ok').length;
    return `<div class="lcard" data-act="hArea" data-v="${a.id}"><span class="bar" style="background:${areaCor(a.id)}"></span><h4>${esc(a.nome)}</h4><div class="lnum">${fmtN(h)} h</div><div class="muted small">${f} plantões${j?` · ${j} dias de J3`:''} · maior carga: ${tp?esc(short(tp.nome)):'—'}</div><div class="mets"><div><b>${pa.length}</b>pessoas</div><div><b>${pa.length?fmtN(h/pa.length):0} h</b>por pessoa</div><div><b>${pa.length?Math.round(ok/pa.length*100):0}%</b>equilíbrio</div></div></div>`;}).join('')}</div>`;
  return histHead(`<button class="btn" data-act="copyHist">⇩ Copiar para Excel</button>`)+
  chips+crumb+meta+
  `<div class="esc-titulo">Resultado consolidado <b>${esc(scopeName)} — ${ui.hAreas.length?'Áreas':'Consolidado'}${esc(supName)}</b></div>`+
  hub([hubIt('clock','Horas de sobreaviso',fmtN(H)+' h',`média de ${fmtN(months.length?H/months.length:0)} h/mês · ${act.length?fmtN(H/act.length):0} h por pessoa`,{act:'hm',data:'data-v="sa"'}),
       hubIt('shield','Plantão J3',J+' dias',J?`${Math.round(J/2)} fins de semana de J3`:'sem J3 no período/escopo',{act:'hm',data:'data-v="j3"'}),
       hubIt('doc','Plantões',F,`fins de semana e feriados · média ${act.length?fmtN(F/act.length):0} por pessoa`,{act:'hm',data:'data-v="fds"'})],
      {segs:[{v:bc.ok,c:'#79D988',t:'Equilibrado'},{v:bc.at,c:'#FFB987',t:'Atenção'},{v:bc.er,c:'#ef4444',t:'Fora da faixa'}],k:'Equilíbrio do rodízio',v:eqp+'%',s:`${bc.ok} de ${act.length} colaboradores na faixa de ±20% da média da área (${mlab[0].toLowerCase()})`,pill:eqPill},
      [hubIt('bolt','Acionamentos',ac,'dias de sobreaviso com acionamento (HE) registrados',{cls:ac?'at':''}),
       hubIt('trend','Maior carga',top?esc(short(top.nome)):'—',top?`${fmtN(tot(top.id,'sa'))} h${topDev!=null?` · ${pct(topDev)} vs média da área`:''}`:''),
       hubIt('flag','Mês atual',fmtN(curH)+' h',avgM?`${ymShort(cur)} · média mensal ${fmtN(avgM)} h (${pct((curH-avgM)/avgM)})`:ymShort(cur),{cls:avgM&&curH>avgM*1.2?'er':''}),
       hubIt('beach','Férias no período',fd+' dias',`${fp.size} colaboradores com férias`)])+
  secdiv(1,'Evolução no período',`${mlab[0]} por mês${scopeAreas.length>1?', por área':''} · clique numa barra para abrir a escala do mês`)+
  `<div class="card"><h3>${mlab[0]} por mês · ${esc(scopeName)}</h3>${chart}${lgd}</div>`+
  secdiv(2,'Quem puxa o resultado',`${mlab[0]} por colaborador no período, comparado à média da própria área`)+
  `<div class="card"><h3>Distribuição por colaborador · ${pLabel}</h3>${rank}</div>`+
  secdiv(3,'Gestão por área','clique numa área para filtrar o painel')+lc+
  secdiv(4,'Detalhamento mês a mês','tabela completa, igual à aba METODO')+histTable(months,metric,scopeAreas,inSup);
}
function histTable(months,metric,aList,inSup){
  const cur=todayS().slice(0,7);const lab=HM[metric][0];
  const val=(cid,m)=>{const s=monthStat(cid,m);if(!s)return null;return metric==='fds'?s.fds:s[metric];};
  const last3=[0,1,2].map(i=>ymAdd(cur,-i)),yr=months.filter(m=>m.startsWith(cur.slice(0,4))&&m<=cur);let body='',mx=1;
  const rowsBy=aList.map(a=>({a,cs:state.colaboradores.filter(c=>c.areaId===a.id&&inSup(c)&&(c.ativo!==false||months.some(m=>val(c.id,m)))).sort((x,y)=>cmp(x.ativo===false?1:0,y.ativo===false?1:0)||cmp(x.nome,y.nome))}));
  rowsBy.forEach(({cs})=>cs.forEach(c=>months.forEach(m=>{const v=val(c.id,m);if(v>mx)mx=v;})));
  rowsBy.forEach(({a,cs})=>{if(!cs.length)return;body+=`<tr class="grp"><td class="nm">${esc(a.nome)}</td><td colspan="${months.length+5}"></td></tr>`;
    cs.forEach(c=>{const ln=lastNext(c.id);const vals=months.map(m=>val(c.id,m));const s3=sum(last3.map(m=>val(c.id,m)||0)),sy=sum(yr.map(m=>val(c.id,m)||0));
      body+=`<tr style="${c.ativo===false?'opacity:.55':''}"><td class="nm"><b>${esc(c.nome)}</b>${c.ativo===false?' <small>inativo</small>':''}</td>${vals.map((v,i)=>{const src=monthStat(c.id,months[i])?.src;const al=v?Math.min(.9,.15+v/mx*.75):0;return `<td style="${v?`background:rgba(${metric==='j3'?'192,161,255':'255,217,25'},${al.toFixed(2)});color:#2E2D39;font-weight:${al>.5?700:500}`:''}" title="${ymLabel(months[i])}${src==='agg'?' · aba METODO':''}">${v||''}${src==='agg'&&v?'*':''}</td>`;}).join('')}
      <td class="tot">${s3||''}</td><td class="tot">${sy||''}</td><td class="small">${ln.lJ?fmtS(ln.lJ)+'/'+ln.lJ.slice(2,4):'—'}</td><td class="small">${ln.lS?fmtS(ln.lS)+'/'+ln.lS.slice(2,4):'—'}</td><td class="small">${[ln.nJ&&'J3 '+fmtS(ln.nJ),ln.nS&&'SA '+fmtS(ln.nS)].filter(Boolean).join(' · ')||'—'}</td></tr>`;});});
  return `<div class="gridwrap" data-keep="hist"><table class="g hist"><thead><tr><th class="nm">${lab}</th>${months.map(m=>`<th style="min-width:46px">${ymShort(m)}</th>`).join('')}<th>Últ. 3<br>meses</th><th>Ano<br>${cur.slice(0,4)}</th><th>Último<br>J3</th><th>Último<br>SA</th><th style="min-width:110px">Próximo</th></tr></thead><tbody>${body}</tbody></table></div><p class="hint">* valor vindo da aba METODO_ESCALA_TX_CAPITAL (meses sem escala detalhada).</p>`;
}

function render(){
  const keep=[...document.querySelectorAll('[data-keep]')].map(e=>[e.dataset.keep,e.scrollLeft,e.scrollTop]);const wy=window.scrollY;
  if(ui.areaId&&!area(ui.areaId))ui.areaId='';
  buildIdx();
  if(!tabOk(ui.tab))ui.tab='geral';
  const views={geral:rGeral,escala:rEscala,historico:rHist,ferias:rFerias,cadastros:rCad,config:rConfig};
  $('#root').innerHTML=`<header class="site"><div class="brand"><div class="logo-img" role="img" aria-label="V.tal"></div><span class="bsep"></span><span class="btit"><b>Gestão Equipe</b><small>Planta Interna SP</small></span></div><nav class="nav">${tabsFor().map(([k,l])=>`<a class="${ui.tab===k?'on':''}" data-act="tab" data-v="${k}" title="${l}">${IC[k]}<span class="lbl">${l}</span></a>`).join('')}</nav><div class="hright"><div class="save" id="savest">${saveStatusHtml()}</div>${temaHtml()}<div class="usr"><b title="${esc(PROFILE?.email||'')}">${esc(PROFILE?.nome||PROFILE?.email||'')}</b><span class="badge b-sa">${ROLE_LABEL[ROLE()]}</span><button class="btn sm gh" data-act="logout">Sair</button></div></div></header><main>${(views[ui.tab]||rGeral)()}</div></main><div class="ftr"><span>Gestão Equipe · Planta Interna SP · V.tal</span><span>Dados no banco · sincronizado ${state.savedAt?new Date(state.savedAt).toLocaleString('pt-BR'):''}</span></div>`;
  keep.forEach(([k,l,t])=>{const e=document.querySelector(`[data-keep="${k}"]`);if(e){e.scrollLeft=l;e.scrollTop=t;}});window.scrollTo(0,wy);
}

/* ---------- Visão geral ---------- */
function nextBlockKey(){let s=todayS();if(dow(s)===0)s=add(s,-1);while(dow(s)!==6)s=add(s,1);return s;}
function blockPeople(aid,b){const res={J3:[],SA:[]};colabsOfArea(aid,b.key.slice(0,7)).forEach(c=>{const r=inBlock(c.id,b);if(r.J3)res.J3.push(c);if(r.SA)res.SA.push({c,h:r.h,days:b.dias.filter(d=>isNum(getV(c.id,d)))});});return res;}
/* ---------- Escala ---------- */
function rEscala(){
  if(!state.areas.length)return `<div class="card empty">Cadastre uma área em <b>Cadastros → Áreas</b>.</div>`;
  const ym=ui.ym,days=monthDays(ym);const aList=ui.areaId?[area(ui.areaId)]:areasSorted();
  let alerts=[];aList.forEach(a=>escalaAlerts(ym,a.id).forEach(x=>alerts.push(aList.length>1?{...x,msg:`[${a.nome}] ${x.msg}`}:x)));
  alerts.sort((x,y)=>({err:0,warn:1,info:2}[x.lvl])-({err:0,warn:1,info:2}[y.lvl]));
  const shown=ui.allAl?alerts:alerts.slice(0,6);
  const head1=days.map(d=>`<th class="${isHol(d)?'hol':isWE(d)?'we':''}" title="${esc(holName(d)||'')}">${+d.slice(8)}</th>`).join('');
  const head2=days.map(d=>`<th class="${isHol(d)?'hol':isWE(d)?'we':''}">${DS1[dow(d)]}</th>`).join('');
  let body='';let tot=0;
  aList.forEach(a=>{const cs=colabsOfArea(a.id,ym);
    body+=`<tr class="grp"><td class="nm" title="${esc(a.nome)}">${esc(a.nome)}</td><td colspan="${days.length+3}" class="small muted" style="font-weight:400">${esc(areaPattern(a))}</td></tr>`;
    cs.forEach(c=>{let h=0,j=0;const wk=new Set();
      const tds=days.map(d=>{const v=getV(c.id,d),vac=onVac(c.id,d);if(isNum(v)){h+=v;if(!isWork(d))wk.add(satKey(d));}if(v==='J3'){j++;wk.add(satKey(d));}
        const cls=isHol(d)?'hol':isWE(d)?'we':'';return `<td class="cd ${cls}" data-act="cell" data-c="${c.id}" data-d="${d}">${tagHtml(v,isAc(c.id,d),vac)}</td>`;}).join('');
      tot+=h;
      body+=`<tr style="${c.ativo===false?'opacity:.55':''}"><td class="nm" title="${esc(c.nome)} · ${esc(c.matricula)}"><b>${esc(c.nome)}</b><small>${esc(c.matricula||'')} · ${esc(c.entrada||'')}–${esc(c.saida||'')} · ${esc(c.telefone||'')}</small></td>${tds}<td class="tot">${j||''}</td><td class="tot">${h?h+'h':''}</td><td class="tot">${wk.size||''}</td></tr>`;});
  });
  const wbl=blocksAll(ym);
  const wk=wbl.map(b=>{const lines=aList.map(a=>{const p=blockPeople(a.id,b);if(!p.J3.length&&!p.SA.length)return '';return `<div class="row"><span class="small muted" style="min-width:90px;max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${esc(a.nome)}">${esc(areaShort(a.nome))}</span><div>${p.J3.map(c=>`<span class="badge b-j3">J3</span> ${esc(short(c.nome))}`).join('<br>')}${p.J3.length&&p.SA.length?'<br>':''}${p.SA.map(x=>`<span class="badge b-sa">${x.h}h</span> ${esc(short(x.c.nome))}`).join('<br>')}</div></div>`;}).join('');
    return `<div class="wkc"><h4><span>${diasLabel(b.dias)}${b.dias.some(isHol)?' <span class="badge b-wa">feriado</span>':''}</span><button class="btn sm" data-act="copyWk" data-k="${b.key}">Copiar</button></h4>${lines||'<span class="muted small">Sem plantonistas lançados</span>'}</div>`;}).join('');
  return pageHead('Escala de plantão','Escala','Mesmo formato da planilha: número na célula = horas de sobreaviso no dia. Clique numa célula para lançar, trocar ou marcar acionamento.')+metaBanner(ym)+`
  <div class="bar"><div class="mnav"><button class="btn" data-act="ym" data-v="-1">‹</button><b>${ymLabel(ym)}</b><button class="btn" data-act="ym" data-v="1">›</button></div>
  <select data-ui="areaId"><option value="">Todas as áreas</option>${areasSorted().map(x=>`<option value="${x.id}" ${x.id===ui.areaId?'selected':''}>${esc(x.nome)}</option>`).join('')}</select><span class="sp"></span>
  <button class="btn needs-edit" data-act="newSN">+ Sobreaviso em vários dias</button>${shareBtn()}<button class="btn" data-act="copyTsv">Copiar para Excel</button><button class="btn dan needs-edit" data-act="limpar" title="Remove sobreavisos, J3 e folgas de plantão do mês (mantém férias, BH, FA e atestados)">✕ Limpar escala</button><button class="btn pri needs-edit" data-act="gen">⚙ Gerar escala ${ui.areaId?'da área':'de todas as áreas'}</button></div>
  ${alerts.length?`<div class="card"><h3>Alertas (${alerts.filter(a=>a.lvl==='err').length} críticos · ${alerts.filter(a=>a.lvl==='warn').length} atenção · ${alerts.filter(a=>a.lvl==='info').length} info)</h3>${alertHtml(shown)}${alerts.length>6?`<button class="btn sm" data-act="allAl">${ui.allAl?'Mostrar menos':`Ver todos os ${alerts.length}`}</button>`:''}</div>`:'<div class="alert ok">✅ Escala dentro das regras.</div>'}
  ${orientacoesHtml()}<div class="legend"><span><i class="tag t-SA">24</i>Horas de sobreaviso (⚡ acionado)</span><span><i class="tag t-J3">J3</i>Plantão 08h–17h</span><span><i class="tag t-F">FO</i>Folga</span><span><i class="tag t-FE">FE</i>Férias</span><span><i class="tag t-BH">BH</i>Banco de horas</span><span><i class="tag t-FA">FA</i>Folga abonada</span><span><i class="tag t-AT">AT</i>Atestado</span><span><i class="tag t-X">M</i>Outros</span></div>
  <div class="gridwrap" data-keep="grid"><table class="g"><thead><tr><th class="nm" rowspan="2">Colaborador</th>${head1}<th rowspan="2">J3<br>dias</th><th rowspan="2">Horas<br>SA</th><th rowspan="2">Plan-<br>tões</th></tr><tr>${head2}</tr></thead><tbody>${body}<tr class="foot"><td class="nm"><b>Total de horas</b></td><td colspan="${days.length+1}"></td><td class="tot">${tot.toLocaleString('pt-BR')}h</td><td></td></tr></tbody></table></div>
  <div class="card" style="margin-top:16px"><h3>Plantonistas por fim de semana e feriado</h3><div class="wk">${wk}</div></div>`;
}

function openCell(cid,d){
  const c=colab(cid),a=area(c.areaId)||{hSab:24,hDom:24,hFer:24,noturnoH:4,j3Vagas:0};const vac=onVac(cid,d);
  const b=blockForDay(d);
  openModal({render(){const v=getV(cid,d);const quick=[...new Set([a.noturnoH,4,5,6,9,12,24].filter(Boolean))].sort((x,y)=>x-y);
    const st=b?inBlock(cid,b):null;
    return `${mHead(`${esc(short(c.nome))} · ${DSEM[dow(d)]} ${fmt(d)}`)}<div class="mb">
    ${holName(d)?`<div class="alert info">ℹ️ Feriado: ${esc(holName(d))}</div>`:''}
    ${vac?`<div class="alert warn">🏖️ Colaborador de férias neste dia. <button class="btn sm" data-act="fer">Abrir férias</button></div>`:''}
    <p class="hint" style="margin-top:0">Atual: ${v==null?'vazio':isNum(v)?`<b>${v}h de sobreaviso</b>`:`<b>${esc((CODES[v]||[v,v])[1])}</b>`}</p>
    <div class="opt"><h4>Sobreaviso no dia (horas)</h4><div class="bar" style="margin:0">${quick.map(h=>`<button class="btn ${v===h?'pri':''}" data-act="h" data-v="${h}">${h}h</button>`).join('')}<input type="number" id="c_h" min="1" max="24" placeholder="outra" style="width:80px"><button class="btn" data-act="hx">OK</button></div>
    ${isNum(v)&&!isWork(d)?`<label class="chk" style="margin-top:10px"><input type="checkbox" id="c_ac" ${isAc(cid,d)?'checked':''}> Foi acionado neste dia (trabalhou em regime de HE)</label>${isAc(cid,d)&&b?`<p class="hint">Folga pós-plantão: ${getV(cid,b.folgaDepois)==='FO'?`<span class="badge b-fo">lançada em ${fmtS(b.folgaDepois)}</span>`:`<button class="btn sm" data-act="folgaPos">Lançar FO em ${DSEM[dow(b.folgaDepois)]} ${fmtS(b.folgaDepois)}</button>`}</p>`:''}`:''}</div>
    <div class="opt"><h4>Outros lançamentos</h4><div class="bar" style="margin:0">${Object.entries(CODES).map(([k,[l,t]])=>`<button class="btn ${v===k?'pri':''}" data-act="code" data-v="${k}" title="${esc(t)}">${l} <span class="muted small">${esc(t)}</span></button>`).join('')}${v!=null?'<button class="btn dan" data-act="clear">Limpar</button>':''}</div></div>
    ${b?`<div class="opt"><h4>Fim de semana inteiro · ${diasLabel(b.dias)}</h4><p class="hint">Lança o padrão da área (${a.hSab}h sáb · ${a.hDom}h dom · ${a.hFer}h feriado) e as folgas automaticamente.</p><div class="bar" style="margin:0">
      ${a.j3Vagas&&!b.iso?`<button class="btn" data-act="blkJ3">Escalar J3 ${a.folgaJ3?'+ folgas':''}</button>`:''}<button class="btn" data-act="blkSA">Escalar sobreaviso ${a.folgaSA&&!b.iso?'+ folga prévia':''}</button>${st&&(st.J3||st.SA)?'<button class="btn dan" data-act="blkDel">Tirar do plantão deste fim de semana</button>':''}</div></div>`:''}
    <div class="bar" style="margin:6px 0 0"><button class="btn sm" data-act="sn">Lançar sobreaviso em vários dias…</button></div></div>`;},
   act(x,el){const done=(msg)=>{touch();closeModal();render();if(msg)toast(msg);};
     if(x==='close')closeModal();
     else if(x==='fer'){const f=state.ferias.find(f=>f.colabId===cid&&vacDays(f).includes(d));closeModal();if(f)openFerias(cid,null,f.id);}
     else if(x==='h'){setV(cid,d,+el.dataset.v);done();}
     else if(x==='hx'){const h=+val('c_h');if(!(h>0&&h<=24)){toast('Informe de 1 a 24 horas');return;}setV(cid,d,h);done();}
     else if(x==='code'){setV(cid,d,el.dataset.v);done();}
     else if(x==='clear'){setV(cid,d,null);done();}
     else if(x==='folgaPos'){setV(cid,b.folgaDepois,'FO');done('Folga pós-plantão lançada');}
     else if(x==='blkJ3'){b.dias.forEach(dd=>{const vv=getV(cid,dd);if(vv==='J3'||isNum(vv))setV(cid,dd,null);});j3Days(b).forEach(dd=>setV(cid,dd,'J3'));if(a.folgaJ3)placeFolgasJ3(c,b);done('J3 lançado');}
     else if(x==='blkSA'){b.dias.forEach(dd=>{if(getV(cid,dd)==='J3')setV(cid,dd,null);setV(cid,dd,hoursFor(a,dd));});if(a.folgaSA&&!b.iso)placeFolga(c,b,'antes','SA');done('Sobreaviso lançado');}
     else if(x==='blkDel'){b.dias.forEach(dd=>{const vv=getV(cid,dd);if(vv==='J3'||isNum(vv))setV(cid,dd,null);});[...new Set([b.folgaAntes,b.folgaDepois,...folgaDias(b,'antes'),...folgaDias(b,'depois')])].forEach(f=>{if(getV(cid,f)==='FO')setV(cid,f,null);});done('Removido do plantão');}
     else if(x==='sn'){closeModal();openSN(cid,d);}},
   change(el){if(el.id==='c_ac'){setAc(cid,d,el.checked);touch();if(el.checked&&b&&getV(cid,b.folgaDepois)==null){setV(cid,b.folgaDepois,'FO');toast(`Acionado — folga pós-plantão lançada em ${fmtS(b.folgaDepois)}`);}drawModal();render();}}});
}
function openSN(cid,d0){
  const c0=cid?colab(cid):activeColabs().find(c=>canEditColab(c.id)&&c.sa!==false);const a0=c0?area(c0.areaId):null;
  const t={cid:c0?.id||'',ini:d0||ui.ym+'-01',fim:d0?add(d0,4):ui.ym+'-05',hIni:a0?.noturnoIni||'00:00',h:a0?.noturnoH||4,uteis:true,over:false};
  const read=()=>{t.cid=val('s_col');t.ini=val('s_ini');t.fim=val('s_fim');t.hIni=val('s_hi');t.h=+val('s_h');t.uteis=$('#s_ut').checked;t.over=$('#s_ov').checked;};
  const daysOf=()=>range(t.ini,t.fim).filter(d=>!t.uteis||isWork(d));
  const prev=()=>{const c=colab(t.cid);if(!c)return'';if(!t.ini||!t.fim||t.fim<t.ini)return '<div class="alert err">⛔ Data final deve ser igual ou posterior à inicial.</div>';
    const ds=daysOf();const busy=ds.filter(d=>getV(c.id,d)!=null&&!isNum(getV(c.id,d))),vac=ds.filter(d=>onVac(c.id,d));const w=[];
    if(t.h>0&&t.h<24&&c.entrada&&c.saida&&overlapT(t.hIni,addH(t.hIni,t.h),c.entrada,c.saida))w.push(['err',`${t.hIni}–${addH(t.hIni,t.h)} sobrepõe a jornada de ${c.entrada}–${c.saida}.`]);
    if(vac.length)w.push(['warn',`${vac.length} dia(s) de férias serão ignorados.`]);if(busy.length)w.push(['warn',`${busy.length} dia(s) com outro lançamento (FO, BH…) ${t.over?'serão substituídos':'serão mantidos'}.`]);
    const n=ds.filter(d=>!onVac(c.id,d)&&(t.over||getV(c.id,d)==null||isNum(getV(c.id,d)))).length;
    return `<div class="sumbox"><div><span>Dias</span><b>${n}</b></div><div><span>Janela</span><b>${t.hIni}–${addH(t.hIni,t.h)}</b></div><div class="big"><span>Total</span><b>${n*t.h}h</b></div></div>${w.map(([l,m])=>`<div class="alert ${l}">${l==='err'?'⛔':'⚠️'} ${esc(m)}</div>`).join('')}`;};
  openModal({render(){const cs=activeColabs().filter(c=>canEditColab(c.id)).sort((a,b)=>cmp(a.nome,b.nome));return `${mHead('Sobreaviso em vários dias')}<div class="mb">
    <div class="fg"><label>Colaborador<select id="s_col">${cs.map(c=>`<option value="${c.id}" ${c.id===t.cid?'selected':''}>${esc(c.nome)} (${esc(c.entrada)}–${esc(c.saida)})</option>`).join('')}</select></label></div>
    <div class="fg"><label>De<input type="date" id="s_ini" value="${t.ini}"></label><label>Até<input type="date" id="s_fim" value="${t.fim}"></label><label>Início<input type="time" id="s_hi" value="${t.hIni}"></label><label>Horas por dia<input type="number" id="s_h" min="1" max="24" value="${t.h}"></label></div>
    <label class="chk"><input type="checkbox" id="s_ut" ${t.uteis?'checked':''}> Somente dias úteis</label><label class="chk"><input type="checkbox" id="s_ov" ${t.over?'checked':''}> Substituir outros lançamentos (FO, BH…)</label>
    <div id="s_prev">${prev()}</div></div><div class="mf"><span class="sp"></span><button class="btn" data-act="close">Cancelar</button><button class="btn pri" data-act="save">Lançar</button></div>`;},
   input(){read();$('#s_prev').innerHTML=prev();},change(){read();$('#s_prev').innerHTML=prev();},
   act(x){if(x==='close')closeModal();if(x==='save'){read();const c=colab(t.cid);if(!c||!t.ini||!t.fim||t.fim<t.ini||!(t.h>0&&t.h<=24)){toast('Verifique colaborador, datas e horas');return;}
     if(t.h<24&&overlapT(t.hIni,addH(t.hIni,t.h),c.entrada,c.saida)){toast('Horário sobrepõe a jornada de trabalho');return;}
     let n=0;daysOf().forEach(d=>{if(onVac(c.id,d))return;const v=getV(c.id,d);if(v==null||isNum(v)||t.over){setV(c.id,d,t.h);n++;}});touch();closeModal();render();toast(`${n} dia(s) lançados (${n*t.h}h)`);}}});
}
function weekendMsg(key){
  const b=key.length===10&&dow(key)!==6?blocksAll(key.slice(0,7)).find(x=>x.key===key)||makeBlock(key):makeBlock(key);
  const aList=ui.tab==='escala'&&ui.areaId?[area(ui.areaId)]:areasSorted();
  const parts=aList.map(a=>{const p=blockPeople(a.id,b);if(!p.J3.length&&!p.SA.length)return '';
    return `*${a.nome}*\n`+p.J3.map(c=>`🔵 J3 08h–17h: ${c.nome} — ${c.telefone}`).join('\n')+(p.J3.length?'\n':'')+p.SA.map(x=>`🟠 Sobreaviso ${x.days.map(d=>DSEM[dow(d)]+' '+getV(x.c.id,d)+'h').join(', ')}: ${x.c.nome} — ${x.c.telefone}`).join('\n');}).filter(Boolean);
  return `*PLANTÃO ${diasLabel(b.dias).toUpperCase()}*${b.dias.some(isHol)?` (feriado: ${b.dias.filter(isHol).map(holName).join(', ')})`:''}\n\n${parts.join('\n\n')}`;
}
function escalaTsv(){const ym=ui.ym,days=monthDays(ym);const aList=ui.areaId?[area(ui.areaId)]:areasSorted();const L=[];
  L.push(['',MESES[+ym.slice(5)-1].toUpperCase(),'','',...days.map(d=>DSEMF[dow(d)]),'QUANTITATIVO DE HORAS'].join('\t'));
  L.push(['','','','',...days.map(d=>+d.slice(8)),''].join('\t'));
  let tot=0;
  aList.forEach(a=>{L.push(a.nome);colabsOfArea(a.id,ym).forEach(c=>{let h=0;const cells=days.map(d=>{if(onVac(c.id,d))return 'F';const v=getV(c.id,d);if(isNum(v))h+=v;return v==null?'':v;});tot+=h;L.push([c.nome,`${c.entrada} as ${c.saida} hs`,c.matricula,c.telefone,...cells,h].join('\t'));});});
  L.push(['','','','',...days.map(()=>''),tot].join('\t'));
  return L.join('\n');}

/* ---------- Histórico ---------- */
function histTsv(){const months=histSel();const m=ui.hm;const L=[['Colaborador','Área',...months.map(ymShort)].join('\t')];
  selAreas().forEach(a=>state.colaboradores.filter(c=>c.areaId===a.id&&inSupSel(c)).forEach(c=>{const v=months.map(x=>{const s=monthStat(c.id,x);return s?(m==='fds'?s.fds:s[m])||'':'';});if(v.some(Boolean)||c.ativo!==false)L.push([c.nome,a.nome,...v].join('\t'));}));return L.join('\n');}

/* ---------- Férias ---------- */
function monthSegs(ym){const segs=[];let cur=[];monthDays(ym).forEach(d=>{cur.push(d);if(dow(d)===0){segs.push(cur);cur=[];}});if(cur.length)segs.push(cur);return segs;}
function rFerias(){
  const roll=ui.fview!=='ano';const y=ui.year,startYm=roll?todayS().slice(0,7):`${y}-01`;const months=Array.from({length:12},(_,i)=>ymAdd(startYm,i));const from=months[0]+'-01',to=months[11]+'-'+pad(daysInMonth(months[11])),today=todayS();const cd=conflictData(from,to);
  const lbl=roll?`${ymShort(months[0])} – ${ymShort(months[11])}`:String(y);
  let gs=groups();
  if(ui.fSup)gs=gs.filter(g=>g.key===ui.fSup);
  if(ui.fArea)gs=gs.map(g=>({...g,members:g.members.filter(m=>m.funcao==='gerente'||m.areaId===ui.fArea)}));
  const q=(ui.q||'').toLowerCase();if(q)gs=gs.map(g=>({...g,members:g.members.filter(m=>(m.nome+' '+m.matricula).toLowerCase().includes(q))}));
  gs=gs.filter(g=>g.members.length);
  const segs=months.map(monthSegs);
  const h1=months.map((m,i)=>`<th class="m" colspan="${segs[i].length}">${MESES[+m.slice(5)-1]}${roll&&(i===0||m.endsWith('-01'))?' '+m.slice(0,4):''}</th>`).join('');
  const h2=segs.map(ss=>ss.map((s,j)=>`<th class="${j===ss.length-1?'m':''}" title="${fmtS(s[0])} a ${fmtS(s[s.length-1])}">${s.length>=3?'S'+(j+1):''}</th>`).join('')).join('');
  const totalSegs=sum(segs.map(s=>s.length));
  let body='';
  gs.forEach(g=>{body+=`<tr class="grp"><td class="nm">${esc(g.nome)}</td><td colspan="${totalSegs}" class="small muted">${g.max>1&&g.max<999?`máx. ${g.max} simultâneos`:''}</td></tr>`;
    g.members.forEach(c=>{const vs=IDX.vac[c.id]||new Set(),cs=cd.byColab[c.id]||new Set();const si=saldoInfo(c);
      body+=`<tr><td class="nm" data-act="newFer" data-c="${c.id}" title="Lançar férias"><span style="display:flex;gap:6px;align-items:center"><span style="flex:1;overflow:hidden;text-overflow:ellipsis"><b>${esc(c.nome)}</b> <small>${esc(c.funcao!=='tecnico'?FUNC[c.funcao]:(area(c.areaId)?.nome||'').split(' - ')[0])}</small></span><span class="badge ${si.venc?'b-er':si.soon?'b-wa':si.s?'b-ok':''}" title="Saldo disponível${si.est?' no ciclo anual (admissão não informada)':''}">${si.s}d</span></span></td>`+
      segs.map(ss=>ss.map((s,j)=>{const hasV=s.some(d=>vs.has(d)),hasC=s.some(d=>cs.has(d));const tip=hasV?vacTip(c,s,hasC):'';
        return `<td class="fc ${j===ss.length-1?'me':''}" data-act="ferCell" data-c="${c.id}" data-d="${s[0]}" ${tip?`title="${esc(tip)}"`:''}><div class="seg">${s.map(d=>`<i class="${cs.has(d)?'c':vs.has(d)?'v':isHol(d)?'h':isWE(d)?'w':''}${d===today?' t':''}"></i>`).join('')}</div></td>`;}).join('')).join('')+`</tr>`;});});
  const list=cd.list,launches=state.ferias.filter(f=>{const d=f.inicio||f.periodo;return d>=from&&d<=to;}).sort((a,b)=>cmp(a.inicio||a.periodo,b.inicio||b.periodo));
  return pageHead('Painel de férias','Férias','Visão gerencial por semana. Técnicos da mesma supervisão de férias ao mesmo tempo, ou supervisores e gerente juntos, aparecem em vermelho. Clique numa linha ou semana para lançar.')+`
  <div class="bar"><select data-ui="fview"><option value="12m" ${roll?'selected':''}>Próximos 12 meses</option><option value="ano" ${roll?'':'selected'}>Ano civil</option></select>${roll?'':`<div class="mnav"><button class="btn" data-act="fy" data-v="-1">‹</button><b style="min-width:60px">${y}</b><button class="btn" data-act="fy" data-v="1">›</button></div>`}
  <select data-ui="fArea"><option value="">Todas as áreas</option>${areasSorted().map(a=>`<option value="${a.id}" ${ui.fArea===a.id?'selected':''}>${esc(a.nome)}</option>`).join('')}</select>
  ${state.supervisoes.length?`<select data-ui="fSup"><option value="">Todas as supervisões</option><option value="lid" ${ui.fSup==='lid'?'selected':''}>Liderança</option>${state.supervisoes.map(s=>`<option value="${s.id}" ${ui.fSup===s.id?'selected':''}>${esc(s.nome)}</option>`).join('')}</select>`:''}
  <input id="fq" data-uiq="q" placeholder="Buscar colaborador…" value="${esc(ui.q||'')}" style="width:200px"><span class="sp"></span><button class="btn pri needs-edit" data-act="newFer">+ Lançar férias</button></div>
  <div class="legend"><span><i style="width:14px;height:12px;background:var(--lilac);display:inline-block;border-radius:2px"></i>Férias</span><span><i style="width:14px;height:12px;background:var(--neg);display:inline-block;border-radius:2px"></i>Conflito</span><span><i style="width:14px;height:12px;background:#e8eab8;display:inline-block;border-radius:2px"></i>Feriado</span><span>Saldo disponível ao lado do nome</span></div>
  <div class="fpwrap" data-keep="fp">${gs.length?`<table class="fp"><thead><tr><th class="nm" rowspan="2">Colaborador</th>${h1}</tr><tr>${h2}</tr></thead><tbody>${body}</tbody></table>`:'<div class="empty">Nenhum colaborador para os filtros escolhidos.</div>'}</div>
  <div class="cols" style="margin-top:16px">
   <div class="card"><h3>Conflitos · ${lbl} ${list.length?`<span class="badge b-er">${list.length}</span>`:''}</h3>${list.length?`<div class="tw"><table class="t"><thead><tr><th>Período</th><th>Grupo</th><th>Quem</th></tr></thead><tbody>${list.map(x=>`<tr><td><span class="badge b-er">${fmtS(x.de)}${x.ate!==x.de?' – '+fmtS(x.ate):''}</span></td><td class="small">${esc(x.grupo)}</td><td class="small">${esc(x.nomes)}</td></tr>`).join('')}</tbody></table></div>`:'<div class="alert ok">✅ Nenhuma sobreposição no período.</div>'}</div>
   <div class="card"><h3>Lançamentos · ${lbl}</h3>${launches.length?`<div class="tw"><table class="t"><thead><tr><th>Colaborador</th><th>Gozo</th><th>Dias</th><th>Venda</th><th></th></tr></thead><tbody>${launches.map(f=>{const c=colab(f.colabId);const fim=f.dias>0?add(f.inicio,f.dias-1):null;const conf=fim&&range(f.inicio,fim).some(d=>(cd.byColab[f.colabId]||new Set()).has(d));return `<tr><td><b>${esc(c?.nome||'?')}</b>${f.obs?`<div class="muted small">${esc(f.obs)}</div>`:''}</td><td class="small">${fim?`${fmtS(f.inicio)} a ${fmtS(fim)}`:'—'} ${conf?'<span class="badge b-er">conflito</span>':''}</td><td>${f.dias||0}</td><td>${f.abono||0}</td><td style="white-space:nowrap">${canEditColab(f.colabId)?`<button class="btn sm" data-act="editFer" data-id="${f.id}">Editar</button> <button class="btn sm dan" data-act="delFer" data-id="${f.id}">Excluir</button>`:''}</td></tr>`;}).join('')}</tbody></table></div>`:'<p class="muted small" style="margin:0">Nenhum lançamento no período.</p>'}</div></div>`;
}
function vacTip(c,s,hasC){const fs=state.ferias.filter(f=>f.colabId===c.id&&vacDays(f).some(d=>d>=s[0]&&d<=s[s.length-1]));return fs.map(f=>`Férias ${fmtS(f.inicio)} a ${fmtS(add(f.inicio,f.dias-1))} (${f.dias} dias)`).join(' · ')+(hasC?' · ⚠ CONFLITO':'');}

function openFerias(cid,preIni,editId){
  const t={cid:cid||'',per:null,inicio:preIni||'',dias:'',abono:0,obs:'',editId:editId||null};
  if(editId){const f=state.ferias.find(x=>x.id===editId);if(!f)return;Object.assign(t,{cid:f.colabId,per:perOf(f),inicio:f.inicio,dias:f.dias,abono:f.abono||0,obs:f.obs||''});}
  const pickPer=()=>{const c=colab(t.cid);if(!c){t.per=null;return;}const ps=periodos(c);if(t.per&&ps.some(p=>p.key===t.per))return;const p=ps.find(p=>(p.status==='vencido'||p.status==='aberto')&&p.saldo>=5)||ps.find(p=>p.status==='aquisicao'||p.status==='proximo')||ps[ps.length-1];t.per=p?p.key:null;};
  pickPer();
  const nums=()=>({inicio:t.inicio,dias:t.dias===''?0:Math.floor(+t.dias),abono:t.abono===''?0:Math.floor(+t.abono)});
  const preview=()=>{const c=colab(t.cid);if(!c)return '<p class="muted">Selecione um colaborador.</p>';const per=periodos(c,true).find(p=>p.key===t.per);if(!per)return '<p class="muted">Selecione o período aquisitivo.</p>';
    const n=nums(),v=validarFerias(c,per,n,t.editId);const fim=n.dias>0&&n.inicio?add(n.inicio,n.dias-1):null,ret=fim?nextWork(fim):null;
    const prevUsed=per.direito-(per.saldo+(t.editId?(per.pt?sum(per.pt.filter(x=>x.id===t.editId).map(x=>x.d+x.a)):sum(per.fr.filter(f=>f.id===t.editId).map(f=>(+f.dias||0)+(+f.abono||0)))):0));
    const pc=x=>Math.max(0,x)/per.direito*100;
    return `<div class="sumbox"><div><span>Gozo</span><b>${fim?`${fmtS(n.inicio)} a ${fmt(fim)}`:'—'}</b></div><div><span>Retorno ao trabalho</span><b>${ret?DSEM[dow(ret)]+', '+fmt(ret):'—'}</b></div><div><span>Gozo + venda</span><b>${n.dias} + ${n.abono} dias</b></div><div class="big ${v.rem<0?'neg':''}"><span>Saldo remanescente</span><b>${v.rem} dia${Math.abs(v.rem)===1?'':'s'}</b></div></div>
    <div class="sbar"><i style="width:${pc(prevUsed)}%;background:#9D9C92"></i><i style="width:${pc(n.dias)}%;background:#AD96DC"></i><i style="width:${pc(n.abono)}%;background:#F1FF00"></i></div>
    <div class="legend"><span>Já programado (${Math.max(0,prevUsed)})</span><span>■ <b style="color:#7a62b8">Este gozo</b> (${n.dias})</span><span>■ <b>Venda</b> (${n.abono})</span><span>Restante (${Math.max(0,v.rem)})</span></div>
    ${v.errs.map(m=>`<div class="alert err">⛔ ${esc(m)}</div>`).join('')}${v.conf.map(x=>`<div class="alert err">🟥 Conflito: <b>${esc(x.nome)}</b> estará de férias de ${fmtS(x.de)} a ${fmtS(x.ate)} (mesmo grupo).</div>`).join('')}${v.warns.map(m=>`<div class="alert warn">⚠️ ${esc(m)}</div>`).join('')}`;};
  const canSave=()=>{const c=colab(t.cid);if(!c)return false;const per=periodos(c).find(p=>p.key===t.per);if(!per)return false;return !validarFerias(c,per,nums(),t.editId).errs.length;};
  const read=()=>{if($('#f_ini')){t.inicio=val('f_ini');t.dias=val('f_dias');t.abono=val('f_ab');t.obs=val('f_obs');}};
  openModal({wide:true,render(){
    const opts=groups().map(g=>({...g,members:g.members.filter(c=>canEditColab(c.id))})).filter(g=>g.members.length).map(g=>`<optgroup label="${esc(g.nome)}">${g.members.map(c=>`<option value="${c.id}" ${c.id===t.cid?'selected':''}>${esc(c.nome)} — ${esc(c.matricula||'')}</option>`).join('')}</optgroup>`).join('');
    const c=colab(t.cid);let perHtml='',hist='';
    if(c){const ps=periodos(c,!!t.allPer);
      perHtml=`<h4 style="margin:14px 0 6px;font-size:13px">Períodos aquisitivos ${c.admissao?`<span class="muted small">(admissão ${fmt(c.admissao)} · 30 dias por período, o saldo mais antigo é usado primeiro)</span> <a class="small" data-act="allPer" style="cursor:pointer">${t.allPer?'mostrar só os atuais':'ver todos os períodos'}</a>`:'<span class="badge b-wa">admissão não informada — ciclo anual (mais de 1 ano de empresa)</span>'}</h4><div class="tw"><table class="t"><thead><tr><th></th><th>Período</th><th>Gozar até</th><th>Direito</th><th>Gozo</th><th>Venda</th><th>Saldo</th><th>Situação</th></tr></thead><tbody>${ps.map(p=>`<tr class="click ${p.key===t.per?'sel':''}" data-act="per" data-v="${p.key}"><td><input type="radio" ${p.key===t.per?'checked':''} tabindex="-1"></td><td>${p.label?`<b>${p.label}</b> <span class="muted small">${p.uso||'sem gozo lançado'}</span>`:`${fmt(p.ini)} – ${fmt(p.fim)}`}</td><td>${p.concFim?fmt(p.concFim):'—'}</td><td>${p.direito}</td><td>${p.gozo}</td><td>${p.abono}</td><td><b>${p.saldo}</b></td><td><span class="badge ${STATUS[p.status][1]}">${STATUS[p.status][0]}</span></td></tr>`).join('')}</tbody></table></div>`;
      const fs=state.ferias.filter(f=>f.colabId===c.id).sort((a,b)=>cmp(b.inicio||b.periodo||'',a.inicio||a.periodo||''));
      if(fs.length)hist=`<h4 style="margin:16px 0 6px;font-size:13px">Lançamentos de ${esc(first(c.nome))}</h4><div class="tw"><table class="t"><tbody>${fs.map(f=>`<tr ${f.id===t.editId?'class="sel"':''}><td class="small">${(()=>{const c2=colab(f.colabId),pp=c2&&c2.admissao?(allocFerias(c2).parts[f.id]||[]):[];return pp.length>1?pp.map(x=>`${perLabel(x.k)} (${x.d+x.a}d)`).join(' + '):perLabel(perOf(f));})()}${f.obs?' · '+esc(f.obs):''}</td><td>${f.dias>0?`${fmt(f.inicio)} a ${fmt(add(f.inicio,f.dias-1))}`:'—'}</td><td>${f.dias||0} dias${f.abono?` + ${f.abono} vendidos`:''}</td><td style="text-align:right">${f.id===t.editId?'<span class="badge b-fe">editando</span>':`<button class="btn sm" data-act="edit" data-id="${f.id}">Editar</button> <button class="btn sm dan" data-act="delf" data-id="${f.id}">Excluir</button>`}</td></tr>`).join('')}</tbody></table></div>`;}
    return `${mHead(t.editId?'Editar férias':'Lançar férias')}<div class="mb">
    <div class="fg"><label>Colaborador<select id="f_col"><option value="">Selecione…</option>${opts}</select></label></div>${perHtml}
    ${c?`<div class="fg" style="margin-top:14px"><label>Início do gozo<input type="date" id="f_ini" value="${t.inicio||''}"></label><label>Dias de gozo<input type="number" id="f_dias" min="0" max="30" value="${t.dias}" placeholder="ex.: 15"></label><label>Dias vendidos (abono)<input type="number" id="f_ab" min="0" max="10" value="${t.abono}"></label><label>Observação<input id="f_obs" value="${esc(t.obs)}" placeholder="Opcional"></label></div><div id="f_prev">${preview()}</div>${hist}`:''}</div>
    <div class="mf"><span class="hint">Até 3 períodos · um ≥ 14 dias · demais ≥ 5 · venda até 1/3</span><span class="sp"></span><button class="btn" data-act="close">Cancelar</button><button class="btn pri" id="f_save" data-act="save" ${canSave()?'':'disabled'}>${t.editId?'Salvar alterações':'Lançar férias'}</button></div>`;},
   input(){read();const p=$('#f_prev');if(p)p.innerHTML=preview();const b=$('#f_save');if(b)b.disabled=!canSave();},
   change(el){if(el.id==='f_col'){read();t.cid=el.value;t.per=null;t.editId=null;pickPer();drawModal();}else this.input();},
   act(x,el){read();if(x==='close')closeModal();
     else if(x==='per'){t.per=el.dataset.v;drawModal();}
     else if(x==='allPer'){t.allPer=!t.allPer;drawModal();}
     else if(x==='edit'){const f=state.ferias.find(z=>z.id===el.dataset.id);Object.assign(t,{per:perOf(f),inicio:f.inicio,dias:f.dias,abono:f.abono||0,obs:f.obs||'',editId:f.id});drawModal();}
     else if(x==='delf'){state.ferias=state.ferias.filter(z=>z.id!==el.dataset.id);touch();buildIdx();drawModal();render();toast('Lançamento excluído');}
     else if(x==='save'){if(!canSave())return;const n=nums();const rec={colabId:t.cid,periodo:t.per,inicio:n.dias>0?n.inicio:'',dias:n.dias,abono:n.abono,obs:t.obs};
       if(t.editId)Object.assign(state.ferias.find(z=>z.id===t.editId),rec);else state.ferias.push({id:uid(),...rec});
       const c=colab(t.cid);normalizePeriods(c);const per=periodos(c,true).find(p=>p.fr.some(f=>f.id===(t.editId||state.ferias[state.ferias.length-1].id)))||periodos(c).find(p=>p.key===t.per);touch();closeModal();render();toast(`Férias salvas · saldo remanescente: ${per?per.saldo:0} dias`);}}});
}

/* ---------- Cadastros ---------- */
function rCad(){
  const tabs=[['colab','Colaboradores'],['area','Áreas e padrões de plantão'],['sup','Supervisões'],...(isAdmin()?[['usuarios','Usuários e acessos']]:[])];
  let html='';
  if(ui.sub==='colab'){const q=(ui.cq||'').toLowerCase();const cs=state.colaboradores.filter(c=>!q||(c.nome+' '+c.matricula+' '+(area(c.areaId)?.nome||'')).toLowerCase().includes(q)).sort((a,b)=>cmp(a.ativo===false?1:0,b.ativo===false?1:0)||((area(a.areaId)?.ordem??99)-(area(b.areaId)?.ordem??99))||cmp(a.nome,b.nome));
    html=`<div class="bar"><input id="cq" data-uiq="cq" placeholder="Buscar por nome, matrícula, área…" value="${esc(ui.cq||'')}" style="width:280px"><span class="sp"></span><button class="btn pri needs-admin" data-act="newColab">+ Novo colaborador</button></div>
    <div class="card" style="padding:0"><div class="tw"><table class="t"><thead><tr><th>Nome</th><th>Matrícula</th><th>Supervisão</th><th>Área de plantão</th><th>Cargo</th><th>Cidade</th><th>Telefone</th><th>Horário</th><th>Admissão</th><th>Escala</th><th>Férias</th><th></th></tr></thead><tbody>${cs.map(c=>{const si=saldoInfo(c);return `<tr style="${c.ativo===false?'opacity:.5':''}" title="${esc(c.obsCad||'')}"><td><b>${esc(c.nome)}</b>${c.ativo===false?' <span class="badge">inativo</span>':''}</td><td>${esc(c.matricula)}</td><td class="small">${c.funcao!=='tecnico'?`<span class="badge b-j3">${FUNC[c.funcao]}</span>`:esc(sup(c.supervisaoId)?.nome||'—')}</td><td class="small">${c.funcao==='gerente'?'Gerência':esc(area(c.areaId)?.nome||'—')}</td><td class="small" title="${esc(c.email||'')}">${esc(c.cargo||'—')}</td><td class="small">${esc(c.cidade||'')}</td><td style="white-space:nowrap">${esc(c.telefone)}</td><td style="white-space:nowrap">${esc(c.entrada)}–${esc(c.saida)}</td><td>${c.admissao?fmt(c.admissao):'<span class="muted small">+1 ano</span>'}</td><td>${c.j3?'<span class="badge b-j3">J3</span> ':''}${c.sa!==false?'<span class="badge b-sa">SA</span>':''}</td><td><span class="badge ${si.venc?'b-er':si.soon?'b-wa':si.s?'b-ok':''}">${si.s}d</span></td><td style="white-space:nowrap"><button class="btn sm needs-admin" data-act="editColab" data-id="${c.id}">Editar</button></td></tr>`;}).join('')}</tbody></table></div></div>`;}
  if(ui.sub==='area')html=`<div class="bar"><span class="sp"></span><button class="btn pri needs-admin" data-act="newArea">+ Nova área</button></div><div class="card" style="padding:0"><div class="tw"><table class="t"><thead><tr><th>Área</th><th>J3 / fds</th><th>Sobreaviso</th><th>Sáb / Dom / Feriado</th><th>Noites de semana</th><th>Folgas automáticas</th><th>Ativos</th><th></th></tr></thead><tbody>${areasSorted().map(a=>`<tr><td><b>${esc(a.nome)}</b></td><td>${a.j3Vagas||'—'}</td><td>${a.saVagas} ${a.saModo==='dia'?'por dia':'por fds'}</td><td>${a.hSab}h / ${a.hDom}h / ${a.hFer}h</td><td class="small">${a.noturnoH?`${a.noturnoH}h ${a.noturnoIni}–${addH(a.noturnoIni,a.noturnoH)} · ${NOTMODO[a.noturnoModo]}`:'—'}</td><td class="small">${[a.j3Vagas&&a.folgaJ3?'J3: antes e depois':'',a.folgaSA?'SA: antes':''].filter(Boolean).join(' · ')||'—'}</td><td>${activeColabs().filter(c=>c.areaId===a.id).length}</td><td style="white-space:nowrap"><button class="btn sm needs-admin" data-act="editArea" data-id="${a.id}">Editar</button> <button class="btn sm dan needs-admin" data-act="delArea" data-id="${a.id}">Excluir</button></td></tr>`).join('')}</tbody></table></div></div><p class="hint">Padrões inferidos dos últimos meses da planilha. Ajuste aqui se algo mudou — o gerador segue estas regras.</p>`;
  if(ui.sub==='sup')html=`<div class="alert info">ℹ️ <span>Os conflitos de férias dos técnicos são verificados dentro de cada supervisão, até o limite de férias simultâneas definido aqui. Supervisores e gerente formam o grupo Liderança.</span></div><div class="bar"><span class="sp"></span><button class="btn pri needs-admin" data-act="newSup">+ Nova supervisão</button></div><div class="card" style="padding:0"><div class="tw"><table class="t"><thead><tr><th>Supervisão</th><th>Área</th><th>Responsável</th><th>Férias simultâneas</th><th>Técnicos</th><th></th></tr></thead><tbody>${state.supervisoes.map(s=>`<tr><td><b>${esc(s.nome)}</b></td><td>${esc(area(s.areaId)?.nome||'Várias')}</td><td>${esc(colab(s.responsavelId)?.nome||'—')}</td><td>${s.feriasMax||1}</td><td>${activeColabs().filter(c=>c.funcao==='tecnico'&&c.supervisaoId===s.id).length}</td><td style="white-space:nowrap"><button class="btn sm needs-admin" data-act="editSup" data-id="${s.id}">Editar</button> <button class="btn sm dan needs-admin" data-act="delSup" data-id="${s.id}">Excluir</button></td></tr>`).join('')||'<tr><td colspan="5" class="empty">Nenhuma supervisão cadastrada.</td></tr>'}</tbody></table></div></div>`;
  if(ui.sub==='usuarios'&&isAdmin())html=usersHtml();
  return pageHead('Cadastros','Cadastros','Colaboradores, áreas (com o padrão de plantão de cada uma), supervisões e acessos.')+`<div class="subtabs">${tabs.map(([k,l])=>`<button class="${ui.sub===k?'on':''}" data-act="sub" data-v="${k}">${l}</button>`).join('')}</div>${html}`;
}
function openColab(id){
  const e=id?colab(id):null;const t=e?{...e}:{id:'c'+uid(),nome:'',matricula:'',funcao:'tecnico',areaId:areasSorted()[0]?.id||null,supervisaoId:'',telefone:'',entrada:'08:00',saida:'17:00',admissao:'',j3:false,sa:true,ativo:true};
  const read=()=>{t.nome=val('c_nome').trim();t.matricula=val('c_mat').trim().toUpperCase();t.funcao=val('c_fun');t.areaId=val('c_area')||null;t.supervisaoId=val('c_sup');t.telefone=val('c_tel');t.cargo=val('c_car');t.email=val('c_em');t.cidade=val('c_cid');t.entrada=val('c_ent');t.saida=val('c_sai');t.admissao=val('c_adm');t.j3=$('#c_j3').checked;t.sa=$('#c_sa').checked;t.ativo=$('#c_at').checked;};
  openModal({render(){const sups=state.supervisoes.filter(s=>!s.areaId||!t.areaId||s.areaId===t.areaId);return `${mHead(e?'Editar colaborador':'Novo colaborador')}<div class="mb">
    <div class="fg"><label>Nome completo<input id="c_nome" value="${esc(t.nome)}"></label><label>Matrícula<input id="c_mat" value="${esc(t.matricula)}"></label></div>
    <div class="fg"><label>Área<select id="c_area"><option value="">—</option>${areasSorted().map(a=>`<option value="${a.id}" ${a.id===t.areaId?'selected':''}>${esc(a.nome)}</option>`).join('')}</select></label><label>Função<select id="c_fun">${Object.entries(FUNC).map(([k,l])=>`<option value="${k}" ${t.funcao===k?'selected':''}>${l}</option>`).join('')}</select></label><label>Supervisão<select id="c_sup"><option value="">—</option>${sups.map(s=>`<option value="${s.id}" ${s.id===t.supervisaoId?'selected':''}>${esc(s.nome)}</option>`).join('')}</select></label></div>
    <div class="fg"><label>Cargo<input id="c_car" value="${esc(t.cargo||'')}"></label><label>E-mail<input id="c_em" value="${esc(t.email||'')}"></label><label>Cidade / lotação<input id="c_cid" value="${esc(t.cidade||'')}"></label></div>
    <div class="fg"><label>Telefone<input id="c_tel" value="${esc(t.telefone)}"></label><label>Entrada<input type="time" id="c_ent" value="${esc(t.entrada)}"></label><label>Saída<input type="time" id="c_sai" value="${esc(t.saida)}"></label><label>Data de admissão<input type="date" id="c_adm" value="${esc(t.admissao)}"></label></div>
    <div style="display:flex;gap:18px;flex-wrap:wrap"><label class="chk"><input type="checkbox" id="c_j3" ${t.j3?'checked':''}> Faz J3</label><label class="chk"><input type="checkbox" id="c_sa" ${t.sa!==false?'checked':''}> Faz sobreaviso</label><label class="chk"><input type="checkbox" id="c_at" ${t.ativo!==false?'checked':''}> Ativo</label></div>
    <p class="hint">A data de admissão define os períodos aquisitivos. Ao informar, as férias já lançadas são redistribuídas nos períodos corretos.</p></div>
    <div class="mf">${e?'<button class="btn dan" data-act="del">Excluir</button>':''}<span class="sp"></span><button class="btn" data-act="close">Cancelar</button><button class="btn pri" data-act="save">Salvar</button></div>`;},
   change(el){if(el.id==='c_area'){read();const sp=sup(t.supervisaoId);if(sp&&sp.areaId&&sp.areaId!==t.areaId)t.supervisaoId='';drawModal();}},
   act(x){if(x==='close')closeModal();
     if(x==='del'){closeModal();confirmBox('Excluir colaborador?',`<b>${esc(e.nome)}</b> e todo o histórico de escala e férias serão removidos. Para manter o histórico, desmarque “Ativo”.`,'Excluir',()=>{state.colaboradores=state.colaboradores.filter(z=>z.id!==e.id);state.ferias=state.ferias.filter(f=>f.colabId!==e.id);Object.values(state.escala).forEach(m=>delete m[e.id]);Object.values(state.acionados).forEach(m=>delete m[e.id]);delete state.histAgg[e.id];touch();render();},true);}
     if(x==='save'){read();if(!t.nome){toast('Informe o nome');return;}if(t.matricula&&state.colaboradores.some(c=>c.id!==t.id&&c.matricula===t.matricula)){toast('Matrícula já cadastrada');return;}
     const admChanged=!e||e.admissao!==t.admissao;if(e)Object.assign(e,t);else state.colaboradores.push(t);if(admChanged&&t.admissao)reassignPeriods(e||t);touch();closeModal();render();toast('Colaborador salvo');}}});
}
function openArea(id){
  const e=id?area(id):null;const t=e?{...e}:{id:'a'+uid(),nome:'',ordem:state.areas.length,j3Vagas:0,saVagas:1,saModo:'fds',hSab:24,hDom:24,hFer:24,noturnoH:0,noturnoIni:'00:00',folgaJ3:true,folgaSA:true,feriasMax:1};
  openModal({render:()=>`${mHead(e?'Editar área':'Nova área')}<div class="mb"><div class="fg"><label>Nome da área<input id="a_nome" value="${esc(t.nome)}"></label></div>
    <h4 style="margin:4px 0 8px;font-size:13px">Fim de semana e feriados</h4>
    <div class="fg"><label>Plantonistas J3 por fds<input type="number" id="a_j3" min="0" max="5" value="${t.j3Vagas}"></label><label>Sobreaviso: quantas pessoas<input type="number" id="a_sa" min="0" max="5" value="${t.saVagas}"></label><label>Distribuição do sobreaviso<select id="a_mod"><option value="fds" ${t.saModo==='fds'?'selected':''}>Mesma pessoa no fds inteiro</option><option value="dia" ${t.saModo==='dia'?'selected':''}>Uma pessoa por dia</option></select></label></div>
    <div class="fg"><label>Horas no sábado<input type="number" id="a_hs" min="1" max="24" value="${t.hSab}"></label><label>Horas no domingo<input type="number" id="a_hd" min="1" max="24" value="${t.hDom}"></label><label>Horas em feriado<input type="number" id="a_hf" min="1" max="24" value="${t.hFer}"></label></div>
    <h4 style="margin:4px 0 8px;font-size:13px">Noites de dias úteis</h4>
    <div class="fg"><label>Horas por noite (0 = não tem)<input type="number" id="a_nh" min="0" max="12" value="${t.noturnoH}"></label><label>Início da janela<input type="time" id="a_ni" value="${esc(t.noturnoIni)}"></label><label>Quais noites<select id="a_nm">${Object.entries(NOTMODO).map(([k,l])=>`<option value="${k}" ${t.noturnoModo===k?'selected':''}>${l}</option>`).join('')}</select></label></div>
    <div style="display:flex;gap:18px;flex-wrap:wrap;margin-bottom:10px"><label class="chk"><input type="checkbox" id="a_fj" ${t.folgaJ3?'checked':''}> Folga antes e depois do J3</label><label class="chk"><input type="checkbox" id="a_fs" ${t.folgaSA?'checked':''}> Folga antes do sobreaviso</label></div>
    <div class="fg"><label>Férias simultâneas permitidas na área<input type="number" id="a_fm" min="1" max="20" value="${t.feriasMax||1}"></label></div>
    <p class="hint">Noites: a noite antes do plantão vai para quem faz o fim de semana seguinte e a noite depois para quem fez o anterior (se estiver de folga, passa para outro da área) — como vocês fazem hoje.</p></div>
    <div class="mf"><span class="sp"></span><button class="btn" data-act="close">Cancelar</button><button class="btn pri" data-act="save">Salvar</button></div>`,
   act(x){if(x==='close')closeModal();if(x==='save'){Object.assign(t,{nome:val('a_nome').trim(),j3Vagas:Math.max(0,+val('a_j3')||0),saVagas:Math.max(0,+val('a_sa')||0),saModo:val('a_mod'),hSab:+val('a_hs')||24,hDom:+val('a_hd')||24,hFer:+val('a_hf')||24,noturnoH:Math.max(0,+val('a_nh')||0),noturnoIni:val('a_ni')||'00:00',noturnoModo:val('a_nm'),folgaJ3:$('#a_fj').checked,folgaSA:$('#a_fs').checked,feriasMax:Math.max(1,+val('a_fm')||1)});if(!t.nome){toast('Informe o nome');return;}if(e)Object.assign(e,t);else state.areas.push(t);touch();closeModal();render();}}});
}
function openSup(id){
  const e=id?sup(id):null;const t=e?{...e}:{id:'s'+uid(),nome:'',areaId:'',responsavelId:'',feriasMax:1};
  openModal({render:()=>`${mHead(e?'Editar supervisão':'Nova supervisão')}<div class="mb"><div class="fg"><label>Nome<input id="s_nome" value="${esc(t.nome)}"></label><label>Área<select id="s_area"><option value="">Várias áreas</option>${areasSorted().map(a=>`<option value="${a.id}" ${a.id===t.areaId?'selected':''}>${esc(a.nome)}</option>`).join('')}</select></label><label>Férias simultâneas permitidas<input type="number" id="s_fm" min="1" max="20" value="${t.feriasMax||1}"></label></div>
    <div class="fg"><label>Responsável<select id="s_resp"><option value="">—</option>${state.colaboradores.filter(c=>c.ativo!==false).sort((a,b)=>cmp(a.nome,b.nome)).map(c=>`<option value="${c.id}" ${c.id===t.responsavelId?'selected':''}>${esc(c.nome)}</option>`).join('')}</select></label></div></div>
    <div class="mf"><span class="sp"></span><button class="btn" data-act="close">Cancelar</button><button class="btn pri" data-act="save">Salvar</button></div>`,
   act(x){if(x==='close')closeModal();if(x==='save'){t.nome=val('s_nome').trim();t.areaId=val('s_area');t.responsavelId=val('s_resp');t.feriasMax=Math.max(1,+val('s_fm')||1);if(!t.nome){toast('Informe o nome');return;}if(e)Object.assign(e,t);else state.supervisoes.push(t);const r=colab(t.responsavelId);if(r&&r.funcao==='tecnico')r.funcao='supervisor';touch();closeModal();render();}}});
}

/* ---------- Configurações ---------- */
function rConfig(){
  const y=ui.hy;const{list,fac}=nationalHolidays(y);const custom=state.feriados.filter(f=>f.data.startsWith(y+'-')).sort((a,b)=>cmp(a.data,b.data));
  return pageHead('Configurações','Ajustes','Feriados, regras do gerador, backup e histórico de alterações.')+`
  <div class="cols"><div class="card"><h3>Feriados de ${y}</h3><div class="bar"><div class="mnav"><button class="btn sm" data-act="hy" data-v="-1">‹</button><b style="min-width:60px">${y}</b><button class="btn sm" data-act="hy" data-v="1">›</button></div><label class="chk"><input type="checkbox" data-chg="togFac" ${isAdmin()?'':'disabled'} ${state.config.facultativos?'checked':''}> Considerar Carnaval e Corpus Christi</label></div>
   <div class="tw"><table class="t"><tbody>${list.concat(state.config.facultativos?fac:[]).sort((a,b)=>cmp(a[0],b[0])).map(([d,n])=>`<tr><td style="width:120px">${DSEM[dow(d)]} ${fmtS(d)}</td><td>${esc(n)}</td><td class="muted small">nacional</td><td></td></tr>`).join('')}${custom.map(f=>`<tr><td>${DSEM[dow(f.data)]} ${fmtS(f.data)}</td><td>${esc(f.nome)}</td><td><span class="badge b-fe">local</span></td><td><button class="btn sm dan needs-admin" data-act="delHol" data-v="${f.data}">Remover</button></td></tr>`).join('')}</tbody></table></div>
   <div class="bar needs-admin" style="margin-top:12px"><input type="date" id="h_d"><input id="h_n" placeholder="Nome (ex.: Aniversário de SP)" style="flex:1;min-width:160px"><button class="btn" data-act="addHol">Adicionar feriado local</button></div></div>
  <div class="card"><h3>Backup dos dados</h3><p class="hint" style="margin-top:0">Os dados ficam no banco (Supabase), com histórico. O backup em JSON serve como cópia extra.</p>
   <div class="bar"><button class="btn" data-act="exportJson">Copiar backup (JSON)</button><label class="btn needs-admin" style="flex-direction:row;font-size:14px">Importar arquivo…<input type="file" accept=".json,application/json" data-chg="importFile" style="display:none"></label></div>
   <div class="needs-admin"><textarea id="imp" placeholder="…ou cole aqui o conteúdo do backup" style="width:100%;height:80px;font-family:monospace;font-size:12px"></textarea><div class="bar" style="margin-top:8px"><button class="btn" data-act="importPaste">Importar texto colado</button></div></div></div>
  ${ROLE()!=='leitura'?`<div class="card"><h3>Histórico de alterações</h3><p class="hint" style="margin-top:0">Toda alteração fica registrada no banco com usuário, data e o valor anterior.</p>${AUDIT?auditHtml():'<button class="btn" data-act="loadAudit">Carregar últimas alterações</button>'}</div>`:''}
  ${metasCard()}<div class="card"><h3>Regras do gerador</h3><div class="fg"><label>Sem plantão nos dias antes das férias<input type="number" min="0" max="10" data-chg="cfgNum" data-k="semPlantaoAntesFerias" value="${vacBuf().antes}" ${isAdmin()?'':'disabled'}></label><label>Sem plantão nos dias após o retorno<input type="number" min="0" max="10" data-chg="cfgNum" data-k="semPlantaoAposFerias" value="${vacBuf().depois}" ${isAdmin()?'':'disabled'}></label></div><p class="hint">Ex.: com 3 dias, quem sai de férias na segunda não pega o plantão do fim de semana anterior nem a noite de sexta. Se a equipe não tiver outra pessoa disponível, o gerador escala assim mesmo e mostra um alerta.</p></div>
  ${regrasCard()}<div class="card"><h3>Regras fixas do sistema</h3><ul class="rules small">
   <li><b>Véspera e retorno de férias</b>: sem plantão nos ${vacBuf().antes} dia(s) antes do início das férias e no(s) ${vacBuf().depois} dia(s) após o retorno, quando houver outra pessoa disponível.</li>
   <li><b>Formato</b>: igual à planilha — número na célula = horas de sobreaviso no dia; J3, FO, BH, FA, AT como siglas. Férias vêm do módulo de férias (FE).</li>
   <li><b>Folgas do J3</b>: as duas folgas caem no mesmo dia da semana — <b>sexta com sexta</b> (sexta antes do J3 + sexta da semana seguinte) ou <b>segunda com segunda</b> (segunda da semana anterior + segunda depois do J3) — para emendar ao menos um fim de semana livre. Na mesma equipe, duas folgas no mesmo dia só em exceção e nunca do mesmo turno (turno pelo horário de entrada). Equipes diferentes não se afetam.</li><li><b>Folgas do sobreaviso</b>: qualquer dia útil da semana anterior, sem coincidir com outra folga da equipe; segunda e sexta ficam por último, porque a prioridade é de quem folga pelo J3.</li>
   <li><b>Padrão por área</b>: quantidade de J3 e sobreaviso por fim de semana, horas de sábado/domingo/feriado, noites de semana e folgas automáticas.</li>
   <li><b>Feriado emendado</b> (sexta ou segunda) entra no plantão do fim de semana; feriado isolado no meio da semana vira um plantão próprio.</li>
   <li><b>Rodízio</b>: primeiro quem tem menos plantões no mês, depois quem tem menos do mesmo regime, depois quem está há mais tempo sem aquele regime (pelo histórico) e com menos horas nos últimos 90 dias. Evita fins de semana seguidos e nunca escala quem está de férias.</li>
   <li><b>J3</b>: sábado e domingo 08h–17h, FO no dia útil antes e depois. <b>Sobreaviso</b>: FO no dia útil antes; se acionado (⚡), FO no dia útil seguinte.</li>
   <li><b>7 dias</b>: alerta quando passa de 6 dias seguidos trabalhados (sobreaviso de fim de semana conta só se acionado).</li>
   <li><b>Férias (CLT)</b>: até 3 períodos, um ≥ 14 dias, demais ≥ 5; venda até 1/3; não iniciar nos 2 dias antes de feriado/DSR; gozo dentro do período concessivo.</li></ul></div></div>`;
}

/* ================= ações ================= */
const ACT={
  tab(el){if(!tabOk(el.dataset.v))return;ui.tab=el.dataset.v;try{history.replaceState(null,'','#'+ui.tab);}catch(e){}persistUI();render();window.scrollTo(0,0);},
  sub(el){ui.sub=el.dataset.v;persistUI();render();},
  ym(el){ui.ym=ymAdd(ui.ym,+el.dataset.v);persistUI();render();},
  fy(el){ui.year+=+el.dataset.v;persistUI();render();},
  hy(el){ui.hy+=+el.dataset.v;render();},
  allAl(){ui.allAl=!ui.allAl;render();},
  saveNow(){clearTimeout(saveTimer);doSave();},
  gen(){const aList=ui.areaId?[area(ui.areaId)]:areasSorted();const has=aList.some(a=>hasMonthData(ui.ym,a.id));
    const run=()=>{let miss=[];aList.forEach(a=>miss.push(...gerarEscala(ui.ym,a.id)));touch();render();toast(miss.length?`Escala gerada · ${miss.length} vaga(s) sem plantonista (veja os alertas)`:'Escala gerada respeitando as regras');};
    if(has)confirmBox('Gerar a escala novamente?',`Os sobreavisos, J3 e folgas (FO) de <b>${ymLabel(ui.ym)}</b> em <b>${ui.areaId?esc(area(ui.areaId).nome):'todas as áreas'}</b> serão refeitos. Férias, BH, FA e atestados são mantidos.`,'Gerar novamente',run);else run();},
  cell(el){openCell(el.dataset.c,el.dataset.d);},
  copyTsv(){copyText(escalaTsv());},
  copyHist(){copyText(histTsv());},
  copyWk(el){copyText(weekendMsg(el.dataset.k));},
  newSN(){openSN(null,null);},
  newFer(el){openFerias(el.dataset.c||'');},
  ferCell(el){const d=el.dataset.d;const f=state.ferias.find(f=>f.colabId===el.dataset.c&&vacDays(f).some(x=>x>=d&&x<=add(d,6)&&x.slice(0,7)===d.slice(0,7)));if(f)return openFerias(el.dataset.c,null,f.id);let s=d;while(!isWork(s)||dow(s)===5)s=add(s,1);openFerias(el.dataset.c,s);},
  editFer(el){const f=state.ferias.find(x=>x.id===el.dataset.id);if(f)openFerias(f.colabId,null,f.id);},
  delFer(el){confirmBox('Excluir lançamento de férias?','O saldo do período aquisitivo será devolvido.','Excluir',()=>{state.ferias=state.ferias.filter(f=>f.id!==el.dataset.id);touch();render();},true);},
  newColab(){openColab();},editColab(el){openColab(el.dataset.id);},
  newArea(){openArea();},editArea(el){openArea(el.dataset.id);},
  delArea(el){const a=area(el.dataset.id);if(state.colaboradores.some(c=>c.areaId===a.id)){toast('Mova os colaboradores desta área antes de excluí-la');return;}confirmBox('Excluir área?',esc(a.nome),'Excluir',()=>{state.areas=state.areas.filter(x=>x!==a);touch();render();},true);},
  newSup(){openSup();},editSup(el){openSup(el.dataset.id);},
  delSup(el){const s=sup(el.dataset.id);confirmBox('Excluir supervisão?',esc(s.nome),'Excluir',()=>{state.supervisoes=state.supervisoes.filter(x=>x!==s);state.colaboradores.forEach(c=>{if(c.supervisaoId===s.id)c.supervisaoId='';});touch();render();},true);},
  togFac(el){state.config.facultativos=el.checked;touch();render();},
  addHol(){const d=val('h_d'),n=val('h_n').trim();if(!d){toast('Informe a data');return;}state.feriados=state.feriados.filter(f=>f.data!==d);state.feriados.push({data:d,nome:n||'Feriado local'});ui.hy=+d.slice(0,4);touch();render();toast('Feriado adicionado');},
  delHol(el){state.feriados=state.feriados.filter(f=>f.data!==el.dataset.v);touch();render();},
  exportJson(){copyText(JSON.stringify(state));},
  importFile(el){const f=el.files&&el.files[0];if(!f)return;const r=new FileReader();r.onload=()=>doImport(r.result);r.readAsText(f);},
  importPaste(){doImport(val('imp'));}
};
Object.assign(ACT,{
  tema:el=>{setTema(el.dataset.v);render();},
  hArea:el=>{ui.hAreas=el.dataset.v?[el.dataset.v]:[];persistUI();render();window.scrollTo(0,0);},
  hp:el=>{ui.hp=el.dataset.v;persistUI();render();},
  hSup:el=>{ui.hSup=el.dataset.v;persistUI();render();},
  hm:el=>{ui.hm=el.dataset.v;persistUI();render();},
  goYm:el=>{ui.ym=el.dataset.v;ui.areaId=ui.hAreas.length===1?ui.hAreas[0]:'';ui.tab='escala';persistUI();render();window.scrollTo(0,0);},
  limpar:()=>{const aList=ui.areaId?[area(ui.areaId)]:areasSorted();confirmBox('Limpar a escala?',`Serão removidos os sobreavisos, J3 e folgas de plantão (FO) de <b>${ymLabel(ui.ym)}</b> em <b>${ui.areaId?esc(area(ui.areaId).nome):'todas as áreas'}</b>. Férias, BH, FA, atestados e treinamentos são mantidos. As alterações ficam no histórico de alterações.`,'Limpar escala',()=>{buildIdx();let n=0;aList.forEach(a=>n+=limparMes(ui.ym,a.id));buildIdx();touch();render();toast(`${n} lançamento(s) removidos`);},true);},
  cfgNum:el=>{const v=Math.max(0,Math.min(10,Math.floor(+el.value||0)));state.config[el.dataset.k]=v;touch();toast('Regra atualizada — vale para as próximas gerações');},
  logout:async()=>{if(dirty)await doSave();await sb.auth.signOut();},
  reload:()=>{if(dirty){toast('Aguarde salvar as alterações');return;}reloadData().then(()=>toast('Dados atualizados'));},
  lmode:el=>renderLogin(el.dataset.v),
  loadAudit:async()=>{const{data,error}=await sb.from('audit_log').select('*').order('at',{ascending:false}).limit(200);if(error){toast(error.message);return;}AUDIT=data;render();},
  loadUsers:()=>loadUsers(),
  delUser:el=>{const u=USERS.find(x=>x.id===el.dataset.id);confirmBox('Remover acesso?',`${esc(u.email)} perderá o acesso. A conta de login continua existindo no Supabase, mas sem perfil não consegue ver dados.`,'Remover',async()=>{const{error}=await sb.from('profiles').delete().eq('id',u.id);if(error)return toast(error.message);await loadUsers();},true);}
});
['setRole','setUserSup'].forEach(k=>ACT[k]=async el=>{const id=el.dataset.id,f=k==='setRole'?{role:el.value}:{supervisao_id:el.value||null};const{error}=await sb.from('profiles').update(f).eq('id',id);if(error){toast(error.message);await loadUsers();return;}toast('Acesso atualizado');const u=USERS.find(x=>x.id===id);Object.assign(u,f);if(id===PROFILE.id){Object.assign(PROFILE,f);document.body.className='role-'+PROFILE.role;}render();});
['cfgNum','newColab','editColab','newArea','editArea','delArea','newSup','editSup','delSup','togFac','addHol','delHol','importFile','importPaste'].forEach(k=>{const f=ACT[k];ACT[k]=(el,e)=>{if(!isAdmin()){if(el&&el.type==='checkbox')el.checked=!el.checked;return deny();}return f(el,e);};});
(()=>{const f={cell:ACT.cell,ferCell:ACT.ferCell,editFer:ACT.editFer,delFer:ACT.delFer,newFer:ACT.newFer,newSN:ACT.newSN,gen:ACT.gen};
  ACT.cell=el=>canEditColab(el.dataset.c)?f.cell(el):deny();
  ACT.ferCell=el=>canEditColab(el.dataset.c)?f.ferCell(el):deny();
  ACT.newFer=el=>(el.dataset.c?canEditColab(el.dataset.c):canEditAny())?f.newFer(el):deny();
  ACT.editFer=el=>{const x=state.ferias.find(z=>z.id===el.dataset.id);return x&&canEditColab(x.colabId)?f.editFer(el):deny();};
  ACT.delFer=el=>{const x=state.ferias.find(z=>z.id===el.dataset.id);return x&&canEditColab(x.colabId)?f.delFer(el):deny();};
  ACT.newSN=el=>canEditAny()?f.newSN(el):deny();
  ACT.limpar=(()=>{const f=ACT.limpar;return el=>{const aList=ui.areaId?[area(ui.areaId)]:areasSorted();const ok=isAdmin()||(ROLE()==='supervisor'&&aList.every(a=>colabsOfArea(a.id,ui.ym).every(c=>canEditColab(c.id))));return ok?f(el):toast(isAdmin()?'':'Para limpar, escolha uma área onde todos os plantonistas são da sua supervisão (ou peça ao administrador).');};})();
  ACT.gen=el=>{const aList=ui.areaId?[area(ui.areaId)]:areasSorted();const ok=isAdmin()||(ROLE()==='supervisor'&&aList.every(a=>escalaveis(a.id).every(c=>canEditColab(c.id))));return ok?f.gen(el):toast(isAdmin()?'':'Para gerar, escolha uma área onde todos os plantonistas são da sua supervisão (ou peça ao administrador).');};
})();
async function loadUsers(){const{data,error}=await sb.from('profiles').select('*').order('created_at');if(error){toast(error.message);return;}USERS=data;render();}
function usersHtml(){
  if(!USERS){loadUsers();return '<p class="muted">Carregando usuários…</p>';}
  return `<div class="alert info">ℹ️ <span>Qualquer pessoa com e-mail <b>@vtal.com</b> pode criar conta (nome, e-mail, telefone e senha) e entra como <b>Leitura</b> — vê Visão geral, Escala e Férias. Aqui você libera <b>Supervisor</b> (edita escala e férias da supervisão vinculada) ou <b>Administrador</b> (edita tudo e gerencia acessos).</span></div>
  <div class="card" style="padding:0"><div class="tw"><table class="t"><thead><tr><th>Usuário</th><th>E-mail</th><th>Telefone</th><th>Perfil</th><th>Supervisão (para perfil Supervisor)</th><th>Desde</th><th></th></tr></thead><tbody>${USERS.map(u=>`<tr><td><b>${esc(u.nome||'')}</b>${u.id===PROFILE.id?' <span class="badge">você</span>':''}</td><td class="small">${esc(u.email)}</td><td class="small" style="white-space:nowrap">${esc(u.telefone||'—')}</td>
    <td><select data-chg="setRole" data-id="${u.id}">${Object.entries(ROLE_LABEL).map(([k,l])=>`<option value="${k}" ${u.role===k?'selected':''}>${l}</option>`).join('')}</select></td>
    <td><select data-chg="setUserSup" data-id="${u.id}" ${u.role==='supervisor'?'':'disabled'}><option value="">—</option>${state.supervisoes.map(s=>`<option value="${s.id}" ${u.supervisao_id===s.id?'selected':''}>${esc(s.nome)}</option>`).join('')}</select></td>
    <td class="small">${fmt((u.created_at||'').slice(0,10))}</td><td>${u.id===PROFILE.id?'':`<button class="btn sm dan" data-act="delUser" data-id="${u.id}">Remover</button>`}</td></tr>`).join('')}</tbody></table></div></div>`;
}
function auditHtml(){const T={escala:'Escala',ferias:'Férias',colaboradores:'Colaborador',areas:'Área',supervisoes:'Supervisão',feriados:'Feriado',config:'Configuração'};
  const desc=r=>{const a=r.antes||{},d=r.depois||{};if(r.tabela==='escala'){const[cid,dt]=(r.chave||'').split('|');return `${esc(colab(cid)?.nome||cid)} · ${fmt(dt)}: ${esc(a.valor??'vazio')} → ${esc(r.op==='DELETE'?'vazio':d.valor)}${d.acionado?' ⚡':''}`;}
    if(r.tabela==='ferias'){const x=(d.dados||a.dados)||{};return `${esc(colab(x.colabId)?.nome||'')} · ${x.inicio?fmt(x.inicio):''} ${x.dias||0} dias${x.abono?' + '+x.abono+' vendidos':''}`;}
    const x=(d.dados||a.dados)||{};return esc(x.nome||d.nome||a.nome||r.chave||'');};
  return `<div class="tw" style="max-height:420px;overflow:auto"><table class="t"><thead><tr><th>Quando</th><th>Quem</th><th>O quê</th><th>Ação</th><th>Detalhe</th></tr></thead><tbody>${AUDIT.map(r=>`<tr><td class="small" style="white-space:nowrap">${new Date(r.at).toLocaleString('pt-BR')}</td><td class="small">${esc(r.email||'sistema')}</td><td>${T[r.tabela]||r.tabela}</td><td><span class="badge ${r.op==='DELETE'?'b-er':r.op==='INSERT'?'b-ok':'b-wa'}">${{INSERT:'incluiu',UPDATE:'alterou',DELETE:'removeu'}[r.op]}</span></td><td class="small">${desc(r)}</td></tr>`).join('')||'<tr><td colspan="5" class="muted">Nenhuma alteração registrada ainda.</td></tr>'}</tbody></table></div><button class="btn sm" data-act="loadAudit" style="margin-top:8px">Atualizar</button>`;}
function doImport(txt){let o;try{o=JSON.parse(txt);}catch(e){toast('Conteúdo inválido');return;}if(!o||!Array.isArray(o.colaboradores)){toast('Backup inválido');return;}confirmBox('Importar backup?',`${o.colaboradores.length} colaboradores substituirão os dados atuais.`,'Importar',()=>{state=migrate(o);touch();render();toast('Backup importado');});}

document.addEventListener('click',e=>{const el=e.target.closest('[data-act]');if(!el)return;const a=el.dataset.act;
  if(el.closest('#modal')){if(a==='ov'){if(e.target===el)closeModal();return;}if(M&&M.act)M.act(a,el);return;}
  if(ACT[a])ACT[a](el,e);});
document.addEventListener('change',e=>{const el=e.target;if(el.closest('#modal')){if(M&&M.change)M.change(el);return;}
  if(el.dataset.ui){ui[el.dataset.ui]=el.value;persistUI();render();}else if(el.dataset.chg&&ACT[el.dataset.chg])ACT[el.dataset.chg](el);});
document.addEventListener('input',e=>{const el=e.target;if(el.closest('#modal')){if(M&&M.input)M.input(el);return;}
  if(el.dataset.uiq){ui[el.dataset.uiq]=el.value;const id=el.id;render();const n=document.getElementById(id);if(n){n.focus();const L=n.value.length;try{n.setSelectionRange(L,L);}catch(x){}}}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&M)closeModal();});
window.addEventListener('hashchange',()=>{const h=location.hash.slice(1);if(['geral','escala','historico','ferias','cadastros','config'].includes(h)&&h!==ui.tab){ui.tab=h;render();}});


/* =====================================================================
   VERSÃO 4 · filtros suspensos multi-seleção, consumo x meta,
   horas extras justificadas, destaque de meta na escala, compartilhar
   ===================================================================== */

/* ---------- filtro suspenso (multi-seleção) ---------- */
const MS={k:null};
// opts: [{v,l,s}] · ui[k] = [] significa "todos"
function msel(k,label,opts,o={}){
  const single=!!o.single,open=MS.k===k;
  const sel=single?ui[k]:(Array.isArray(ui[k])?ui[k]:[]);
  const on=single?opts.filter(x=>x.v===sel):opts.filter(x=>sel.includes(x.v));
  const resumo=single?(on[0]?.l||o.all||'—'):!on.length?(o.all||'Todos'):on.length<=2?on.map(x=>x.l).join(', '):`${on.length} de ${opts.length}`;
  const chk=x=>single?x.v===sel:(!sel.length||sel.includes(x.v));
  return `<div class="ms ${open?'open':''} ${!single&&on.length?'has':''}"><button type="button" class="ms-b" data-act="msOpen" data-k="${k}" aria-expanded="${open}"><span class="ms-l">${label}</span><span class="ms-v" title="${esc(resumo)}">${esc(resumo)}</span><span class="ms-c">▾</span></button>${open?`<div class="ms-p" role="listbox">${single?'':`<div class="ms-h"><a data-act="msAll" data-k="${k}">${esc(o.all||'Todos')}</a>${opts.length>8?`<span class="muted small">${opts.length} opções</span>`:''}</div>`}<div class="ms-list">${opts.map(x=>`<div class="ms-o ${chk(x)?'on':''}" data-act="msTog" data-k="${k}" data-v="${esc(x.v)}" ${single?'data-single="1"':''} role="option" aria-selected="${chk(x)}"><i class="ck ${single?'rd':''}"></i><span class="t">${esc(x.l)}</span>${x.s!=null?`<small>${esc(x.s)}</small>`:''}${single?'':`<a class="so" data-act="msOnly" data-k="${k}" data-v="${esc(x.v)}" title="Selecionar somente esta opção">só</a>`}</div>`).join('')}</div></div>`:''}</div>`;
}
const fbar=(items,right)=>`<div class="fbar">${items.join('')}${right?`<span class="sp"></span>${right}`:''}</div>`;
document.addEventListener('click',e=>{if(MS.k&&!e.target.closest('.ms')){MS.k=null;document.querySelectorAll('.ms.open').forEach(n=>{n.classList.remove('open');const p=n.querySelector('.ms-p');if(p)p.remove();});}},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&MS.k){MS.k=null;render();}});
const MS_OPTS={};// k -> lista completa (para "todos" ao desmarcar)
Object.assign(ACT,{
  msOpen:el=>{const k=el.dataset.k;MS.k=MS.k===k?null:k;render();},
  msAll:el=>{ui[el.dataset.k]=[];persistUI();render();},
  msOnly:(el,e)=>{e&&e.stopPropagation();ui[el.dataset.k]=[el.dataset.v];persistUI();render();},
  msTog:(el,e)=>{if(e&&e.target.closest('.so'))return;const k=el.dataset.k,v=el.dataset.v;
    if(el.dataset.single){ui[k]=v;MS.k=null;persistUI();render();return;}
    const all=(MS_OPTS[k]||[]).map(x=>x.v);let s=Array.isArray(ui[k])&&ui[k].length?ui[k].slice():all.slice();
    s=s.includes(v)?s.filter(x=>x!==v):[...s,v];if(!s.length||s.length>=all.length)s=[];ui[k]=s;persistUI();render();}
});
function opt(k,list){MS_OPTS[k]=list;return list;}

/* ---------- seleção comum do Histórico ---------- */
const curYm=()=>todayS().slice(0,7);
const ANO0=2023;
const anosOpts=()=>{const y=+todayS().slice(0,4),r=[];for(let a=y;a>=ANO0;a--)r.push({v:String(a),l:String(a)});return r;};
const mesesOpts=()=>MES3.map((m,i)=>({v:pad(i+1),l:m}));
if(!Array.isArray(ui.hAnos))ui.hAnos=[todayS().slice(0,4)];
['hMeses','hAreas','hSups','heArea','heCol','heCls','heTur'].forEach(k=>{if(!Array.isArray(ui[k]))ui[k]=[];});
if(!ui.hv)ui.hv='escala';
function histSel(o={}){const cur=curYm(),lastEsc=Object.keys(state.escala).sort().pop()||cur;const lim=o.futuro&&lastEsc>cur?lastEsc:cur;
  const anos=ui.hAnos.length?ui.hAnos.map(Number):anosOpts().map(x=>+x.v);const r=[];
  anos.slice().sort().forEach(y=>{for(let m=1;m<=12;m++){const ym=`${y}-${pad(m)}`;if(ym>lim)continue;if(ui.hMeses.length&&!ui.hMeses.includes(pad(m)))continue;if(o.min&&ym<o.min)continue;r.push(ym);}});return r;}
const selAreas=()=>ui.hAreas.length?areasSorted().filter(a=>ui.hAreas.includes(a.id)):areasSorted();
const inSupSel=c=>!ui.hSups.length||ui.hSups.includes(c.supervisaoId||'');
const scopeLabel=()=>ui.hAreas.length===1?(area(ui.hAreas[0])?.nome||''):ui.hAreas.length?`${ui.hAreas.length} áreas`:'Planta Interna SP';
const supLabel=()=>ui.hSups.length?' · Supervisão '+ui.hSups.map(s=>sup(s)?.nome||'Sem supervisão').join(', '):'';
const periodoLabel=ms=>ms.length?(ms.length===1?ymLabel(ms[0]):`${ymShort(ms[0])} – ${ymShort(ms[ms.length-1])} · ${ms.length} meses`):'sem meses no filtro';
function filtrosComuns(extra){
  return [msel('hAnos','Ano',opt('hAnos',anosOpts()),{all:'Todos os anos'}),
    msel('hMeses','Mês',opt('hMeses',mesesOpts()),{all:'Todos os meses'}),
    msel('hAreas','Área',opt('hAreas',areasSorted().map(a=>({v:a.id,l:areaShort(a.nome),s:''}))),{all:'Todas as áreas'}),
    msel('hSups','Supervisão',opt('hSups',[...state.supervisoes.map(s=>({v:s.id,l:s.nome})),{v:'',l:'Sem supervisão'}]),{all:'Todas'}),...(extra||[])];
}
const HV=[['escala','Escala e rodízio'],['consumo','Consumo de horas x meta'],['he','Horas extras justificadas']];
function histHead(tools){return pageHead('Histórico','Histórico','Planta Interna SP · escala, consumo de horas de sobreaviso e horas extras justificadas',tools)+`<div class="subtabs">${HV.map(([k,l])=>`<button class="${ui.hv===k?'on':''}" data-act="hv" data-v="${k}">${l}</button>`).join('')}</div>`;}
ACT.hv=el=>{ui.hv=el.dataset.v;MS.k=null;persistUI();render();};
function rHist(){return ui.hv==='consumo'?rHistConsumo():ui.hv==='he'?rHistHE():rHistEscala();}

/* ---------- metas de sobreaviso ---------- */
const META_DEF=[{desde:'2000-01',valor:2300},{desde:'2026-09',valor:2000}];
const metas=()=>{const m=state.config.metasSobreaviso;return (Array.isArray(m)&&m.length?m:META_DEF).slice().sort((a,b)=>cmp(a.desde,b.desde));};
const metaOf=ym=>{let v=null;metas().forEach(x=>{if(x.desde<=ym)v=+x.valor;});return v;};
function monthProfile(ym){const ds=monthDays(ym);const sat=ds.filter(d=>dow(d)===6).length,sun=ds.filter(d=>dow(d)===0).length;const hol=ds.filter(d=>isHol(d)&&!isWE(d));return{sat,sun,fds:Math.max(sat,sun),hol};}
function monthNotes(ym){const p=monthProfile(ym),r=[];if(p.fds>=5)r.push(`${p.fds} fins de semana`);if(p.hol.length)r.push(`${p.hol.length} feriado${p.hol.length>1?'s':''} em dia útil (${p.hol.map(d=>`${fmtS(d)} ${holName(d)}`).join(', ')})`);return r;}
function saMonth(ym,cs){let t=0,we=0,nt=0,j3=0,ac=0,fds=0;const m=state.escala[ym];
  cs.forEach(c=>{if(m){const cells=m[c.id];if(cells){const wk=new Set();for(const dd in cells){const v=cells[dd],d=ym+'-'+dd;if(isNum(v)){t+=v;if(isWork(d))nt+=v;else{we+=v;wk.add(satKey(d));}}else if(v==='J3'){j3++;wk.add(satKey(d));}}fds+=wk.size;}
      const a=state.acionados[ym]&&state.acionados[ym][c.id];if(a)ac+=Object.keys(a).length;}
    else{const h=state.histAgg[c.id]&&state.histAgg[c.id][ym];if(h){t+=h.sa||0;j3+=h.j3||0;}}});
  return{t,we,nt,j3,ac,fds,src:m?'grid':Object.keys(state.histAgg).length?'agg':'none'};}
function metaStatus(h,meta){if(!meta)return{cls:'',pill:''};const r=h/meta;return r>1?{cls:'er',pill:'<span class="pill p-er">Acima da meta</span>'}:r>=.95?{cls:'at',pill:'<span class="pill p-at">No limite</span>'}:{cls:'ok',pill:'<span class="pill p-ok">Dentro da meta</span>'};}

/* ---------- destaque de meta na aba Escala ---------- */
function metaBanner(ym){
  const all=state.colaboradores,s=saMonth(ym,all),meta=metaOf(ym),r=meta?s.t/meta:0,st=metaStatus(s.t,meta),notes=monthNotes(ym),p=monthProfile(ym);
  const over=meta&&s.t>meta;const ar=ui.areaId?area(ui.areaId):null;const sa=ar?saMonth(ym,all.filter(c=>c.areaId===ar.id)):null;
  const obs=over?`Acima da meta em <b>${fmtN(s.t-meta)} h</b>${notes.length?` — mês com ${notes.join(' e ')}.`:' — sem feriado em dia útil nem 5º fim de semana: revise noites e plantões extras.'}`:
    meta?`Saldo de <b>${fmtN(meta-s.t)} h</b> até a meta.${notes.length?` Atenção: mês com ${notes.join(' e ')}.`:''}`:'';
  return `<div class="metab ${st.cls}"><div class="mb-main"><div class="mb-k">Sobreaviso · ${ymLabel(ym)}</div><div class="mb-v">${fmtN(s.t)} h <small>/ meta ${meta?fmtN(meta)+' h':'—'}</small></div>
   <div class="mb-bar"><i style="width:${Math.min(100,r*100).toFixed(1)}%"></i>${r>1?`<b style="left:${(100/r).toFixed(1)}%"></b>`:''}</div><div class="mb-s">${meta?Math.round(r*100)+'% da meta':''} ${st.pill}</div></div>
   <div class="mb-side"><div><b>${fmtN(s.we)} h</b><span>fins de semana e feriados</span></div><div><b>${fmtN(s.nt)} h</b><span>noites de dias úteis</span></div><div><b>${p.fds}</b><span>fins de semana no mês</span></div><div><b>${p.hol.length}</b><span>feriado(s) em dia útil</span></div>${sa?`<div><b>${fmtN(sa.t)} h</b><span>${esc(areaShort(ar.nome))} (${s.t?Math.round(sa.t/s.t*100):0}% do total)</span></div>`:''}</div>
   ${obs?`<div class="mb-obs">${over?'⚠️':'ℹ️'} ${obs} <span class="muted">Meta da equipe toda: ${metas().map(x=>`${fmtN(x.valor)} h desde ${x.desde<'2001'?'o início':ymShort(x.desde)}`).join(' · ')}.</span></div>`:''}</div>`;
}

/* ---------- Histórico · consumo de horas x meta ---------- */
function rHistConsumo(){
  const months=histSel({futuro:true,min:'2024-01'}),cur=curYm(),aS=selAreas();const filtrado=ui.hAreas.length||ui.hSups.length;
  const P=state.colaboradores.filter(c=>aS.some(a=>a.id===c.areaId)&&inSupSel(c));
  const rows=months.map(m=>{const s=saMonth(m,P),byA={};aS.forEach(a=>byA[a.id]=saMonth(m,P.filter(c=>c.areaId===a.id)).t);const meta=metaOf(m);return{m,...s,byA,meta,notes:monthNotes(m),prof:monthProfile(m)};});
  const past=rows.filter(r=>r.m<=cur&&r.t>0),H=sum(rows.map(r=>r.t)),J=sum(rows.map(r=>r.j3)),WE=sum(rows.map(r=>r.we)),NT=sum(rows.map(r=>r.nt)),AC=sum(rows.map(r=>r.ac));
  const comMeta=rows.filter(r=>r.meta&&r.t>0),acima=comMeta.filter(r=>r.t>r.meta),dentro=comMeta.length-acima.length;
  const maior=rows.slice().sort((a,b)=>b.t-a.t)[0],rc=rows.find(r=>r.m===cur);
  const pp=comMeta.length?Math.round(dentro/comMeta.length*100):0;
  const pill=pp>=80?'<span class="pill p-ok">Na meta</span>':pp>=50?'<span class="pill p-at">Atenção</span>':'<span class="pill p-er">Estourando</span>';
  const mx=Math.max(1,...rows.map(r=>Math.max(r.t,filtrado?0:(r.meta||0))));const showV=rows.length<=18;
  const chart=`<div class="chart">${rows.map(r=>{const st=filtrado?{cls:''}:metaStatus(r.t,r.meta);return `<div class="cb ${r.m>cur?'fut':''}" data-act="goYm" data-v="${r.m}" title="${ymLabel(r.m)}: ${fmtN(r.t)} h${r.meta?` · meta ${fmtN(r.meta)} h`:''}${r.notes.length?' · '+r.notes.join(' · '):''}">${showV&&r.t?`<span class="vl ${st.cls}">${fmtN(r.t)}</span>`:''}<div class="stk" style="height:${(r.t/mx*88).toFixed(1)}%">${aS.map(a=>r.byA[a.id]?`<i style="height:${(r.byA[a.id]/r.t*100).toFixed(2)}%;background:${areaCor(a.id)}"></i>`:'').join('')}</div>${!filtrado&&r.meta?`<em class="mt ${st.cls}" style="bottom:${(r.meta/mx*88).toFixed(1)}%"></em>`:''}</div>`;}).join('')}</div><div class="cx">${rows.map(r=>`<span>${showV||r.m.endsWith('-01')||rows.length<=24?ymShort(r.m):''}</span>`).join('')}</div>`;
  const lgd=`<div class="lgd">${aS.map(a=>`<span><i style="background:${areaCor(a.id)}"></i>${esc(areaShort(a.nome))}</span>`).join('')}${filtrado?'':'<span><i style="background:var(--txt);height:2px"></i>meta do mês</span>'}<span class="muted">meses futuros: escala já lançada</span></div>`;
  const tbl=`<div class="tw"><table class="t"><thead><tr><th>Mês</th><th style="text-align:right">Sobreaviso</th><th style="text-align:right">Meta</th><th style="text-align:right">Uso</th><th style="text-align:right">Fds/feriado</th><th style="text-align:right">Noites</th><th style="text-align:right">J3 (dias)</th><th style="text-align:right">Acion.</th><th>Fins de semana · feriados</th><th>Observação</th></tr></thead><tbody>${rows.slice().reverse().map(r=>{const st=metaStatus(r.t,r.meta),over=r.meta&&r.t>r.meta;
    return `<tr><td><a data-act="goYm" data-v="${r.m}" style="cursor:pointer"><b>${ymLabel(r.m)}</b></a>${r.m>cur?' <span class="badge b-fe">planejado</span>':''}${r.src==='agg'?' <span class="badge">METODO</span>':''}</td><td style="text-align:right"><b>${fmtN(r.t)} h</b></td><td style="text-align:right" class="muted">${r.meta?fmtN(r.meta)+' h':'—'}</td><td style="text-align:right">${r.meta&&r.t?`<span class="badge ${over?'b-er':st.cls==='at'?'b-wa':'b-ok'}">${Math.round(r.t/r.meta*100)}%</span>`:'—'}</td><td style="text-align:right">${r.src==='grid'?fmtN(r.we)+' h':'—'}</td><td style="text-align:right">${r.src==='grid'?fmtN(r.nt)+' h':'—'}</td><td style="text-align:right">${r.j3||''}</td><td style="text-align:right">${r.ac||''}</td><td class="small">${r.prof.fds} fds${r.prof.hol.length?` · ${r.prof.hol.length} feriado(s)`:''}</td><td class="small">${over?`<b class="t-er">+${fmtN(r.t-r.meta)} h.</b> ${r.notes.length?esc(r.notes.join(' e ')):'Sem feriado nem 5º fim de semana — verificar noites e escalas extras'}`:r.notes.length&&r.t?`<span class="muted">${esc(r.notes.join(' e '))}</span>`:''}</td></tr>`;}).join('')}</tbody></table></div>`;
  return histHead(`<button class="btn" data-act="copyCons">⇩ Copiar para Excel</button>`)+fbar(filtrosComuns())+
  `<div class="breadcrumb"><span>${esc(scopeLabel())}${esc(supLabel())}</span><span class="r">${periodoLabel(months)} · consumo calculado pela escala lançada na ferramenta${rows.some(r=>r.src==='agg')?' (2024: aba METODO)':''}</span></div>`+
  `<div class="metabar"><b>Meta de sobreaviso</b><span>Horas de sobreaviso da equipe toda por mês:</span>${metas().map(x=>`<span class="pill p-at">${fmtN(x.valor)} h ${x.desde<'2001'?'até a próxima vigência':'a partir de '+ymShort(x.desde)}</span>`).join('')}${filtrado?'<span>· com filtro de área/supervisão a meta não se aplica (é da equipe inteira)</span>':''}</div>`+
  `<div class="esc-titulo">Resultado consolidado <b>${esc(scopeLabel())} — Consumo de horas</b></div>`+
  hub([hubIt('clock','Horas de sobreaviso',fmtN(H)+' h',`média de ${fmtN(rows.length?H/rows.length:0)} h/mês no filtro`),
       hubIt('shield','Plantão J3',J+' dias',`${fmtN(WE)} h em fins de semana/feriados · ${fmtN(NT)} h em noites`),
       hubIt('bolt','Acionamentos',AC,'dias de sobreaviso marcados como acionados (⚡)')],
      {segs:[{v:dentro,c:'#79D988'},{v:acima.length,c:'#ef4444'}],k:'Meses dentro da meta',v:filtrado?'—':pp+'%',s:filtrado?'meta vale para a equipe inteira — limpe os filtros de área/supervisão':`${dentro} de ${comMeta.length} meses com escala dentro da meta`,pill:filtrado?'':pill},
      [hubIt('alert','Meses acima da meta',filtrado?'—':acima.length,acima.length&&!filtrado?acima.slice(-3).map(r=>ymShort(r.m)).join(', '):'nenhum',{cls:acima.length&&!filtrado?'er':'ok'}),
       hubIt('trend','Maior consumo',maior&&maior.t?ymShort(maior.m):'—',maior&&maior.t?`${fmtN(maior.t)} h${maior.notes.length?' · '+maior.notes[0]:''}`:''),
       hubIt('flag','Mês atual',rc?fmtN(rc.t)+' h':'—',rc&&rc.meta?`meta ${fmtN(rc.meta)} h · ${Math.round(rc.t/rc.meta*100)}%`:'',{cls:rc&&rc.meta&&rc.t>rc.meta&&!filtrado?'er':'',act:'goYm',data:`data-v="${cur}"`})])+
  secdiv(1,'Consumo mês a mês','horas de sobreaviso por mês e por área, com a meta de cada mês · clique numa barra para abrir a escala')+`<div class="card"><h3>Sobreaviso por mês · ${esc(scopeLabel())}</h3>${chart}${lgd}</div>`+
  secdiv(2,'Meses e observações','meses acima da meta indicam se tiveram 5 fins de semana ou feriados em dia útil')+`<div class="card"><h3>Detalhamento · ${periodoLabel(months)}</h3>${tbl}</div>`;
}
ACT.copyCons=()=>{const P=state.colaboradores.filter(c=>selAreas().some(a=>a.id===c.areaId)&&inSupSel(c));const L=[['Mês','Sobreaviso (h)','Meta (h)','Uso %','Fds/feriado (h)','Noites (h)','J3 (dias)','Acionamentos','Fins de semana','Feriados em dia útil','Observação'].join('\t')];
  histSel({futuro:true,min:'2024-01'}).forEach(m=>{const s=saMonth(m,P),meta=metaOf(m),p=monthProfile(m);L.push([ymLabel(m),s.t,meta||'',meta?Math.round(s.t/meta*100)+'%':'',s.we,s.nt,s.j3,s.ac,p.fds,p.hol.length,monthNotes(m).join(' e ')].join('\t'));});copyText(L.join('\n'));};

/* ---------- Horas extras justificadas ---------- */
let HE=null,HE_ERR='',HE_LOADING=false;
async function loadHE(){if(HE_LOADING)return;HE_LOADING=true;try{const r=await fetchAll('horas_extras');HE=r.map(x=>({...x,horas:+x.horas}));HE_ERR='';}catch(e){HE=null;HE_ERR=e.message||String(e);}HE_LOADING=false;if(ui.tab==='historico')render();}
const heArea=r=>r.supervisao||(r.colab_id&&colab(r.colab_id)?areaShort(area(colab(r.colab_id).areaId)?.nome||''):'')||'Não informado';
const heMotivo=s=>String(s||'').toUpperCase().replace(/[.\-–;:]+$/,'').replace(/\s+/g,' ').trim()||'(sem motivo)';
const TURNO_COR={'Diurno':'#FFD919','Semi-Noturno':'#FFB987','Noturno':'#85A7FF','Madrugada':'#5A11EE','':'#8583A8'};
const CLS_COR=['#ef4444','#FFD919','#85A7FF','#79D988','#C0A1FF','#FFB987','#8583A8'];
function heRows(){if(!HE)return[];const ms=new Set(histSel());
  return HE.filter(r=>ms.has(r.data.slice(0,7))&&(!ui.heArea.length||ui.heArea.includes(heArea(r)))&&(!ui.heCol.length||ui.heCol.includes(r.colaborador))&&(!ui.heCls.length||ui.heCls.includes(r.classificacao))&&(!ui.heTur.length||ui.heTur.includes(r.turno||''))&&(!ui.hSups.length||(r.colab_id&&colab(r.colab_id)&&ui.hSups.includes(colab(r.colab_id).supervisaoId||''))));}
const grpSum=(rows,f)=>{const m={};rows.forEach(r=>{const k=f(r);(m[k]=m[k]||{k,h:0,n:0,rows:[]});m[k].h+=r.horas;m[k].n++;m[k].rows.push(r);});return Object.values(m).sort((a,b)=>b.h-a.h);};
const hh=n=>{const m=Math.round((+n||0)*60);return `${Math.floor(m/60)}h${pad(m%60)}`;};
// HE que caiu em dia de sobreaviso da pessoa (mesmo dia, ou madrugada seguinte a uma noite de sobreaviso)
function heEmSA(r){if(!r.colab_id)return null;const d=r.data;const m=state.escala[d.slice(0,7)];if(!m)return null;if(isNum(getV(r.colab_id,d)))return true;if(r.inicio&&tmin(r.inicio)<480&&isNum(getV(r.colab_id,add(d,-1))))return true;return false;}
ACT.heLimpar=()=>{['heArea','heCol','heCls','heTur','hSups'].forEach(k=>ui[k]=[]);persistUI();render();};
ACT.copyHE=()=>{const L=[['Data','Colaborador','Função','Motivo','Início','Término','Horas','Classificação','Turno','Cidade','Área (planilha)','Em sobreaviso'].join('\t')];heRows().forEach(r=>{const s=heEmSA(r);L.push([fmt(r.data),r.colaborador,r.funcao,String(r.motivo||'').replace(/\s+/g,' '),r.inicio,r.termino,String(r.horas).replace('.',','),r.classificacao,r.turno,r.cidade,heArea(r),s===null?'':s?'sim':'não'].join('\t'));});copyText(L.join('\n'));};

/* importação da planilha (admin) — aba Base */
function loadScript(src){return new Promise((ok,ko)=>{if(document.querySelector(`script[src="${src}"]`))return ok();const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=()=>ko(new Error('não foi possível carregar '+src));document.head.appendChild(s);});}
const nrm=s=>String(s||'').normalize('NFKD').replace(/[̀-ͯ]/g,'').toUpperCase().replace(/\s+/g,' ').trim();
const STOP=new Set(['DE','DA','DOS','DO','DAS','E']);
function matchColab(n){const N=nrm(n),t=new Set(N.split(' ').filter(x=>!STOP.has(x)));let best=null,bs=0;
  for(const c of state.colaboradores){const cn=nrm(c.nome);if(cn===N)return c.id;const ct=new Set(cn.split(' ').filter(x=>!STOP.has(x)));const sc=[...t].filter(x=>ct.has(x)).length;if(sc>bs&&sc>=2&&N.split(' ')[0]===cn.split(' ')[0]){best=c.id;bs=sc;}}return best;}
ACT.heImport=async el=>{if(!isAdmin())return deny();const f=el.files&&el.files[0];el.value='';if(!f)return;
  try{toast('Lendo a planilha…');await loadScript('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js');
    const wb=XLSX.read(await f.arrayBuffer(),{type:'array'});const ws=wb.Sheets['Base']||wb.Sheets[wb.SheetNames[0]];const rows=XLSX.utils.sheet_to_json(ws,{header:1,raw:true});
    const tm=v=>typeof v==='number'?Math.round((v%1)*1440)%1440:null;const hm=m=>m==null?'':`${pad(Math.floor(m/60))}:${pad(m%60)}`;const hoje=todayS();const out=[];
    for(const r of rows.slice(1)){const d=r[0];if(typeof d!=='number')continue;const p=XLSX.SSF.parse_date_code(d);if(!p)continue;const ds=`${p.y}-${pad(p.m)}-${pad(p.d)}`;if(ds<'2023-01-01'||ds>hoje)continue;
      const a=tm(r[5]),b=tm(r[6]);let h=typeof r[7]==='number'?(r[7]<3?r[7]*24:null):null;if(h==null&&a!=null&&b!=null)h=(((b-a)%1440)+1440)%1440/60;if(!h||h<=0||h>48)continue;
      const nome=String(r[2]||'').replace(/\s+/g,' ').trim();if(!nome)continue;let T=nrm(r[9]).replace('SEMI NOTURNO','SEMI-NOTURNO').replace('NOTURN0','NOTURNO');T=T&&T!=='NONE'?T.toLowerCase().replace(/(^|-)\w/g,x=>x.toUpperCase()):'';
      let sp=String(r[14]??'').trim();if(sp.startsWith('#')||sp==='None')sp='';if(sp==='Fo')sp='FO';const cid=String(r[11]??'').replace(/\s+/g,' ').trim();
      out.push({data:ds,colaborador:nome===nome.toUpperCase()?nome.toLowerCase().replace(/(^|\s)\S/g,x=>x.toUpperCase()):nome,colab_id:matchColab(nome),funcao:String(r[3]||'').trim(),motivo:String(r[4]||'').trim().slice(0,300),inicio:hm(a),termino:hm(b),horas:Math.round(h*1e4)/1e4,classificacao:String(r[8]||'').trim()||'Não classificado',turno:T,cidade:cid&&cid!=='None'?cid:'',supervisao:sp});}
    if(!out.length){toast('Nenhum lançamento válido (2023 em diante) encontrado na aba Base.');return;}
    const yrs={};out.forEach(o=>{const y=o.data.slice(0,4);yrs[y]=(yrs[y]||0)+o.horas;});
    confirmBox('Atualizar horas extras?',`Foram lidos <b>${out.length}</b> lançamentos (${Object.entries(yrs).map(([y,h])=>`${y}: ${fmtN(h)} h`).join(' · ')}). A base atual de 2023 em diante (${HE?HE.length:0} lançamentos) será substituída.`,'Substituir base',async()=>{
      toast('Gravando…');const J={};(HE||[]).filter(x=>x.justificativa).forEach(x=>J[x.data+'|'+nrm(x.colaborador)+'|'+x.inicio]=x);out.forEach(o=>{const j=J[o.data+'|'+nrm(o.colaborador)+'|'+o.inicio];if(j)['ba','estacao','justificativa','justificado_por','justificado_nome','justificado_em'].forEach(k=>o[k]=j[k]);});let r=await sb.from('horas_extras').delete().gte('data','2023-01-01');if(r.error)return toast(r.error.message);
      for(let i=0;i<out.length;i+=500){r=await sb.from('horas_extras').insert(out.slice(i,i+500));if(r.error)return toast('Erro ao gravar: '+r.error.message);}
      HE=null;await loadHE();toast(`Base de horas extras atualizada · ${out.length} lançamentos`);});
  }catch(e){toast('Erro ao ler a planilha: '+(e.message||e));}};

/* ---------- compartilhar a escala ---------- */
const SHARE={tipo:'fds',fone:true,ferias:true,resumo:true,ym:'',aid:''};
function feriasDoMes(ym,aList){const a=ym+'-01',b=ym+'-'+pad(daysInMonth(ym));const ids=new Set(aList?state.colaboradores.filter(c=>aList.some(x=>x.id===c.areaId)||c.funcao!=='tecnico').map(c=>c.id):state.colaboradores.map(c=>c.id));
  return state.ferias.filter(f=>f.dias>0&&f.inicio&&ids.has(f.colabId)&&f.inicio<=b&&add(f.inicio,f.dias-1)>=a).map(f=>({f,c:colab(f.colabId),ini:f.inicio,fim:add(f.inicio,f.dias-1)})).filter(x=>x.c).sort((x,y)=>cmp(x.ini,y.ini));}
function feriasBox(ym,aList){const fs=feriasDoMes(ym,aList),t=todayS();return `<div class="sh-sec"><h4>De férias em ${ymLabel(ym).toLowerCase()}</h4>${fs.length?`<table class="sh-t"><thead><tr><th>Colaborador</th><th>Área / função</th><th>Período</th><th>Dias</th><th>Retorno</th></tr></thead><tbody>${fs.map(x=>`<tr${x.ini<=t&&x.fim>=t?' class="now"':''}><td><b>${esc(x.c.nome)}</b>${x.ini<=t&&x.fim>=t?' <span class="sh-pill">de férias agora</span>':''}</td><td>${esc(x.c.funcao!=='tecnico'?FUNC[x.c.funcao]:areaShort(area(x.c.areaId)?.nome||''))}</td><td>${fmt(x.ini)} a ${fmt(x.fim)}</td><td>${x.f.dias}</td><td>${fmt(nextWork(x.fim))}</td></tr>`).join('')}</tbody></table>`:'<p class="sh-m">Ninguém de férias no mês.</p>'}</div>`;}
function shareHtml(){const ym=SHARE.ym,aList=SHARE.aid?[area(SHARE.aid)]:areasSorted(),fone=SHARE.fone;const tit=`Escala de plantão · ${ymLabel(ym)}`;const sub=`Planta Interna SP${SHARE.aid?' · '+esc(area(SHARE.aid).nome):''} · gerado em ${fmt(todayS())}`;
  let body='';
  if(SHARE.tipo==='full'){const days=monthDays(ym);
    body=`<table class="sh-g"><thead><tr><th class="nm">Colaborador</th>${days.map(d=>`<th class="${isHol(d)?'hol':isWE(d)?'we':''}">${+d.slice(8)}<br><small>${DS1[dow(d)]}</small></th>`).join('')}<th>Horas</th></tr></thead><tbody>${aList.map(a=>{const cs=colabsOfArea(a.id,ym);return `<tr class="grp"><td colspan="${days.length+2}">${esc(a.nome)}</td></tr>`+cs.map(c=>{let h=0;const tds=days.map(d=>{const v=getV(c.id,d),vac=onVac(c.id,d);if(isNum(v))h+=v;const lab=vac&&!v?'FE':v==null?'':String(v);const k=isNum(v)?'sa':v==='J3'?'j3':vac||v==='FE'?'fe':v?'ot':'';return `<td class="${isHol(d)?'hol':isWE(d)?'we':''}">${lab?`<span class="c ${k}">${lab}${isAc(c.id,d)?'⚡':''}</span>`:''}</td>`;}).join('');return `<tr><td class="nm"><b>${esc(short(c.nome))}</b>${fone&&c.telefone?`<small>${esc(c.telefone)}</small>`:''}</td>${tds}<td class="h">${h?h+'h':''}</td></tr>`;}).join('');}).join('')}</tbody></table>
    <div class="sh-lg"><span><i class="c sa">24</i>horas de sobreaviso</span><span><i class="c j3">J3</i>plantão 08h–17h</span><span><i class="c ot">FO</i>folga / BH / FA / AT</span><span><i class="c fe">FE</i>férias</span><span>⚡ acionado</span></div>`;}
  else{const bl=blocksAll(ym).filter(b=>b.dias.some(d=>d.slice(0,7)===ym));
    body=`<div class="sh-wk">${bl.map(b=>{const ln=aList.map(a=>{const p=blockPeople(a.id,b);if(!p.J3.length&&!p.SA.length)return '';return `<div class="sh-a"><div class="an">${esc(areaShort(a.nome))}</div>${p.J3.map(c=>`<div class="pp"><span class="c j3">J3</span><b>${esc(short(c.nome))}</b>${fone&&c.telefone?`<small>${esc(c.telefone)}</small>`:''}</div>`).join('')}${p.SA.map(x=>`<div class="pp"><span class="c sa">${x.h}h</span><b>${esc(short(x.c.nome))}</b><em>${x.days.map(d=>DSEM[dow(d)]).join(' · ')}</em>${fone&&x.c.telefone?`<small>${esc(x.c.telefone)}</small>`:''}</div>`).join('')}</div>`;}).join('');
      const hn=b.dias.filter(isHol).map(d=>holName(d));return `<div class="sh-b"><h5>${diasLabel(b.dias)}${hn.length?` <span class="sh-pill">${esc(hn.join(', '))}</span>`:''}</h5>${ln||'<p class="sh-m">Sem plantonistas lançados</p>'}</div>`;}).join('')}</div>`;}
  return `<div class="sheet ${SHARE.tipo}" id="shareSheet"><div class="sh-hd"><div class="sh-logo"></div><div><h3>${tit}</h3><div class="sh-m">${sub}</div></div><div class="sh-tg">${SHARE.tipo==='full'?'Escala completa':'Plantonistas por fim de semana e feriado'}</div></div>${SHARE.resumo?shareResumo(ym,aList):''}${body}${SHARE.ferias?feriasBox(ym,SHARE.aid?aList:null):''}<div class="sh-ft">Gestão Equipe · Planta Interna SP · V.tal</div></div>`;}
function shareText(){const ym=SHARE.ym,aList=SHARE.aid?[area(SHARE.aid)]:areasSorted();const L=[`*Escala de plantão · ${ymLabel(ym)}*`,`Planta Interna SP${SHARE.aid?' · '+area(SHARE.aid).nome:''}`,''];
  blocksAll(ym).filter(b=>b.dias.some(d=>d.slice(0,7)===ym)).forEach(b=>{L.push(`*${diasLabel(b.dias)}*${b.dias.some(isHol)?' ('+b.dias.filter(isHol).map(holName).join(', ')+')':''}`);aList.forEach(a=>{const p=blockPeople(a.id,b);if(!p.J3.length&&!p.SA.length)return;L.push(`_${areaShort(a.nome)}_`);p.J3.forEach(c=>L.push(`• J3 08h–17h: ${short(c.nome)}${SHARE.fone&&c.telefone?' · '+c.telefone:''}`));p.SA.forEach(x=>L.push(`• Sobreaviso ${x.h}h (${x.days.map(d=>DSEM[dow(d)]).join('/')}): ${short(x.c.nome)}${SHARE.fone&&x.c.telefone?' · '+x.c.telefone:''}`));});L.push('');});
  if(SHARE.ferias){const fs=feriasDoMes(ym,SHARE.aid?aList:null);L.push('*De férias no mês*');if(!fs.length)L.push('• ninguém');fs.forEach(x=>L.push(`• ${short(x.c.nome)}: ${fmtS(x.ini)} a ${fmtS(x.fim)} (${x.f.dias} dias)`));}
  return L.join('\n');}
async function sheetCanvas(){await loadScript('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js');const el=document.getElementById('shareSheet');
  return html2canvas(el,{backgroundColor:'#ffffff',scale:2,useCORS:true,width:el.scrollWidth,height:el.scrollHeight,windowWidth:el.scrollWidth+80,onclone:d=>{const s=d.getElementById('shareSheet');let p=s.parentElement;while(p){p.style.overflow='visible';p.style.maxHeight='none';p=p.parentElement;}}});}
function openShare(tipo,o={}){SHARE.tipo=tipo;SHARE.ym=o.ym||ui.ym;SHARE.aid=o.aid!==undefined?o.aid:ui.areaId;MS.k=null;render();openModal({wide:true,cls:'share',render:()=>`${mHead('Compartilhar escala')}<div class="mb"><div class="share-ctl"><div class="seg2"><button class="${SHARE.tipo==='full'?'on':''}" data-act="tipo" data-v="full">Escala completa</button><button class="${SHARE.tipo==='fds'?'on':''}" data-act="tipo" data-v="fds">Fins de semana e feriados</button></div><label class="chk"><input type="checkbox" data-k="fone" ${SHARE.fone?'checked':''}> Mostrar telefones</label><label class="chk"><input type="checkbox" data-k="ferias" ${SHARE.ferias?'checked':''}> Incluir férias do mês</label><label class="chk"><input type="checkbox" data-k="resumo" ${SHARE.resumo?'checked':''}> Resumo do mês</label></div><div class="share-prev">${shareHtml()}</div></div><div class="mf"><span class="hint">Imagem para WhatsApp/Teams, PDF pela impressão ou texto.</span><span class="sp"></span><button class="btn gh" data-act="txt">Copiar texto</button><button class="btn" data-act="print">Imprimir / PDF</button><button class="btn" data-act="cpimg">Copiar imagem</button><button class="btn pri" data-act="png">Baixar imagem</button></div>`,
  change(el){SHARE[el.dataset.k]=el.checked;drawModal();},
  async act(a,el){if(a==='close')return closeModal();if(a==='tipo'){SHARE.tipo=el.dataset.v;return drawModal();}
    if(a==='txt')return copyText(shareText());
    if(a==='print'){document.body.classList.add('printing',SHARE.tipo==='full'?'pr-land':'pr-port');const off=()=>{document.body.classList.remove('printing','pr-land','pr-port');window.removeEventListener('afterprint',off);};window.addEventListener('afterprint',off);setTimeout(()=>{window.print();setTimeout(off,1500);},50);return;}
    try{el.disabled=true;const cv=await sheetCanvas();const nome=`escala-${SHARE.tipo==='full'?'completa':'fins-de-semana'}-${SHARE.ym}.png`;
      if(a==='png'){const l=document.createElement('a');l.download=nome;l.href=cv.toDataURL('image/png');l.click();toast('Imagem baixada');}
      if(a==='cpimg'){const blob=await new Promise(r=>cv.toBlob(r,'image/png'));if(!window.ClipboardItem||!navigator.clipboard?.write)throw new Error('seu navegador não permite copiar imagem — use Baixar imagem');await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);toast('Imagem copiada — cole no WhatsApp ou Teams');}
    }catch(e){toast('Não foi possível gerar a imagem: '+(e.message||e));}finally{el.disabled=false;}}});}
function shareResumo(ym,aList){const cs=state.colaboradores.filter(c=>aList.some(a=>a.id===c.areaId));const s=saMonth(ym,cs),meta=SHARE.aid?null:metaOf(ym);
  let need=0,fill=0;aList.forEach(a=>{blocksAll(ym).forEach(b=>{const p=blockPeople(a.id,b);if(!b.iso){need+=a.j3Vagas;fill+=Math.min(a.j3Vagas,p.J3.length);}need+=a.saVagas;fill+=Math.min(a.saVagas,p.SA.length);});});
  if(!SHARE.aid){const cb=coberturaMes(ym);need=cb.need;fill=cb.fill;}
  const hoje=todayS(),fe=activeColabs().filter(c=>onVac(c.id,hoje)&&(!SHARE.aid||c.areaId===SHARE.aid||c.funcao!=='tecnico'));
  const k=(v,l,cls)=>`<div class="sh-k ${cls||''}"><b>${v}</b><span>${l}</span></div>`;
  return `<div class="sh-res">${k(fmtN(s.t)+' h',`sobreaviso no mês${meta?` · meta ${fmtN(meta)} h (${Math.round(s.t/meta*100)}%)`:''}`,meta&&s.t>meta?'er':'')}${k(s.j3,'dias de J3 (08h–17h)')}${k(need?Math.round(fill/need*100)+'%':'—',`cobertura · ${fill} de ${need} vagas`,need&&fill<need?'er':'')}${k(blocksAll(ym).length,'fins de semana / feriados')}${k(fe.length,'de férias hoje'+(fe.length?': '+fe.map(c=>short(c.nome)).join(', '):''))}</div>`;}
/* foto da visão geral, como está na tela */
async function fotoTela(nome){await loadScript('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js');const el=document.getElementById('root');const bg=getComputedStyle(document.body).backgroundColor||'#ffffff';
  document.body.classList.add('capturando');try{return await html2canvas(el,{backgroundColor:bg==='rgba(0, 0, 0, 0)'?'#ffffff':bg,scale:2,ignoreElements:n=>n.classList&&(n.classList.contains('btn')||n.classList.contains('ms')||n.classList.contains('site')||n.classList.contains('ftr')||n.tagName==='FOOTER'||n.tagName==='HEADER')});}finally{document.body.classList.remove('capturando');}}
async function shareTela(){toast('Gerando a foto da visão geral…');let cv;try{cv=await fotoTela();}catch(e){return toast('Não foi possível gerar a foto: '+(e.message||e));}
  const url=cv.toDataURL('image/png'),nome=`visao-geral-${todayS()}.png`;
  openModal({wide:true,cls:'share',render:()=>`${mHead('Foto da visão geral')}<div class="mb"><div class="share-prev"><img src="${url}" style="max-width:100%;display:block;margin:0 auto;border-radius:8px"></div></div><div class="mf"><span class="hint">A foto mostra a tela como está agora (${fmt(todayS())}).</span><span class="sp"></span><button class="btn" data-act="cpimg">Copiar imagem</button><button class="btn pri" data-act="png">Baixar imagem</button></div>`,
    async act(a){if(a==='close')return closeModal();if(a==='png'){const l=document.createElement('a');l.download=nome;l.href=url;l.click();toast('Imagem baixada');}
      if(a==='cpimg'){try{const blob=await new Promise(r=>cv.toBlob(r,'image/png'));await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);toast('Imagem copiada — cole no WhatsApp ou Teams');}catch(e){toast('Seu navegador não permite copiar imagem — use Baixar imagem');}}}});}
Object.assign(ACT,{shareG:el=>{MS.k=null;const v=el.dataset.v;if(v==='tela'){render();return shareTela();}openShare(v,{ym:todayS().slice(0,7),aid:''});},shareGMenu:()=>{MS.k=MS.k==='shareG'?null:'shareG';render();}});
const shareBtnGeral=()=>`<div class="ms share ${MS.k==='shareG'?'open':''}"><button type="button" class="btn" data-act="shareGMenu" title="Exportar imagem para compartilhar">↗ Compartilhar</button>${MS.k==='shareG'?`<div class="ms-p right"><div class="ms-list"><div class="ms-o" data-act="shareG" data-v="fds"><span class="t"><b>Plantonistas do mês</b><br><small class="muted">todos os fins de semana e feriados de ${ymLabel(todayS().slice(0,7)).toLowerCase()} + resumo + férias</small></span></div><div class="ms-o" data-act="shareG" data-v="full"><span class="t"><b>Escala completa do mês</b><br><small class="muted">todos os dias, todas as áreas</small></span></div><div class="ms-o" data-act="shareG" data-v="tela"><span class="t"><b>Foto da visão geral</b><br><small class="muted">a tela exatamente como está</small></span></div></div></div>`:''}</div>`;
Object.assign(ACT,{shareMenu:()=>{MS.k=MS.k==='share'?null:'share';render();},share:el=>openShare(el.dataset.v)});
const shareBtn=()=>`<div class="ms share ${MS.k==='share'?'open':''}"><button type="button" class="btn gh" data-act="shareMenu" title="Compartilhar a escala do mês">↗ Compartilhar</button>${MS.k==='share'?`<div class="ms-p right"><div class="ms-list"><div class="ms-o" data-act="share" data-v="full"><span class="t"><b>Escala completa</b><br><small class="muted">mês inteiro, todos os dias + férias</small></span></div><div class="ms-o" data-act="share" data-v="fds"><span class="t"><b>Plantonistas por fim de semana e feriado</b><br><small class="muted">J3 e sobreaviso de cada bloco + férias</small></span></div></div></div>`:''}</div>`;

/* ---------- metas em Configurações ---------- */
function metasCard(){const ms=metas();return `<div class="card"><h3>Meta de sobreaviso</h3><p class="hint" style="margin-top:0">Horas de sobreaviso da equipe toda por mês. Cada meta vale a partir do mês informado até a próxima.</p><div class="tw"><table class="t"><thead><tr><th>Vale a partir de</th><th>Meta (h/mês)</th><th></th></tr></thead><tbody>${ms.map((m,i)=>`<tr><td>${m.desde<'2001'?'início (sem data)':`<input type="month" value="${m.desde}" data-chg="metaSet" data-i="${i}" data-f="desde" ${isAdmin()?'':'disabled'}>`}</td><td><input type="number" min="0" step="50" value="${m.valor}" data-chg="metaSet" data-i="${i}" data-f="valor" style="width:110px" ${isAdmin()?'':'disabled'}></td><td>${i&&isAdmin()?`<button class="btn sm gh" data-act="metaDel" data-i="${i}">Remover</button>`:''}</td></tr>`).join('')}</tbody></table></div><div class="bar needs-admin" style="margin-top:10px"><button class="btn" data-act="metaAdd">+ Nova vigência</button></div></div>`;}
Object.assign(ACT,{
  metaSet:el=>{if(!isAdmin())return deny();const ms=metas();const m=ms[+el.dataset.i];if(el.dataset.f==='valor')m.valor=Math.max(0,+el.value||0);else if(/^\d{4}-\d{2}$/.test(el.value))m.desde=el.value;state.config.metasSobreaviso=ms;touch();render();toast('Meta atualizada');},
  metaAdd:()=>{if(!isAdmin())return deny();const ms=metas();ms.push({desde:ymAdd(curYm(),1),valor:ms[ms.length-1].valor});state.config.metasSobreaviso=ms;touch();render();},
  metaDel:el=>{if(!isAdmin())return deny();const ms=metas();ms.splice(+el.dataset.i,1);state.config.metasSobreaviso=ms;touch();render();}
});


/* =====================================================================
   VERSÃO 5 · horas extras: banco de horas x pago, sobreaviso pago,
   justificativas (BA / ESTAÇÃO / MOTIVO) e detalhamento
   ===================================================================== */
const DSEMX=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
// destino da HE: seg–sáb vai para o banco de horas; domingo e feriado é pago 100%
const heDest=r=>dow(r.data)===0||isHol(r.data)?'pago':'bh';
const DEST={bh:['Banco de horas','b-fe'],pago:['Pago 100%','b-ok']};
// texto da justificativa (a nova, se houver; senão o motivo da planilha)
const heJust=r=>r.justificativa?[r.ba,r.estacao,r.justificativa].filter(Boolean).join(' / '):String(r.motivo||'');
// fora do padrão BA / ESTAÇÃO / MOTIVO: sem número de BA/JM/chamado e sem código de estação
const padraoOk=m=>/\d{5,}/.test(m)||/\b[A-Z]{2,4}_[A-Z0-9.]{2,}/i.test(m)||/\b(JM|BRBN|SPBM|SPBE)\b/i.test(m);
const hePend=r=>!r.justificativa&&(!padraoOk(String(r.motivo||''))||r.classificacao==='Não classificado'||r.cidade==='Corrigir Lançamento');
const pendWhy=r=>[!padraoOk(String(r.motivo||''))&&'sem número de BA/JM/chamado nem código de estação',r.classificacao==='Não classificado'&&'sem classificação',r.cidade==='Corrigir Lançamento'&&'planilha marcou “Corrigir lançamento”'].filter(Boolean).join(' · ');
const canJust=r=>isAdmin()||(ROLE()==='supervisor'&&!!r.colab_id&&canEditColab(r.colab_id));
// dia de sobreaviso a que a HE pertence (mesmo dia, ou madrugada após noite de sobreaviso); '' = fora; null = sem escala
function hePl(r){if(!r.colab_id||!state.escala[r.data.slice(0,7)])return null;const v=getV(r.colab_id,r.data);
  if(isNum(v))return{t:'SA',d:r.data};if(v==='J3')return{t:'J3',d:r.data};
  const p=add(r.data,-1);if(r.inicio&&tmin(r.inicio)<480&&isNum(getV(r.colab_id,p)))return{t:'SA',d:p};return{t:'',d:null};}
// HE (todas, sem filtro de classificação/turno) somada por pessoa + dia de sobreaviso
function heSAIndex(){const m={};(HE||[]).forEach(r=>{const p=hePl(r);if(p&&p.t==='SA'){const k=r.colab_id+'|'+p.d;m[k]=(m[k]||0)+r.horas;}});return m;}
// sobreaviso pago = horas de sobreaviso do dia menos as horas de HE feitas nele
function saPagoCalc(people,months,idx){const out={lanc:0,troca:0,pago:0,byM:{},byC:{}};
  months.filter(m=>state.escala[m]).forEach(m=>{const mm=state.escala[m];const bm=out.byM[m]={lanc:0,troca:0,pago:0};
    people.forEach(c=>{const cells=mm[c.id];if(!cells)return;const bc=out.byC[c.id]=out.byC[c.id]||{lanc:0,troca:0,pago:0};
      for(const dd in cells){const v=cells[dd];if(!isNum(v))continue;const h=Math.min(v,idx[c.id+'|'+m+'-'+dd]||0);
        [out,bm,bc].forEach(o=>{o.lanc+=v;o.troca+=h;o.pago+=v-h;});}});});return out;}
function hePeople(){const ids=ui.heCol.length?new Set(HE.filter(r=>ui.heCol.includes(r.colaborador)).map(r=>r.colab_id).filter(Boolean)):null;
  const inA=ui.heArea.length?new Set(HE.filter(r=>ui.heArea.includes(heArea(r))).map(r=>r.colab_id).filter(Boolean)):null;
  return state.colaboradores.filter(c=>inSupSel(c)&&(!ids||ids.has(c.id))&&(!inA||inA.has(c.id)));}

function rHistHE(){
  const tools=`${isAdmin()?`<label class="btn gh" title="Atualiza a base com a planilha Estudo de Horas Extras (.xlsx, aba Base). As justificativas já feitas são mantidas.">⇪ Atualizar planilha<input type="file" accept=".xlsx,.xlsm" data-chg="heImport" style="display:none"></label>`:''}<button class="btn" data-act="copyHE">⇩ Copiar para Excel</button>`;
  if(!HE){if(!HE_ERR&&!HE_LOADING)loadHE();return histHead(tools)+`<div class="card empty">${HE_ERR?`Não foi possível carregar as horas extras: ${esc(HE_ERR)}.<br><span class="small">Se a tabela ainda não existe, rode os arquivos <b>v4_passo1</b> a <b>v4_passo5</b> no SQL Editor do Supabase.</span>`:'Carregando horas extras…'}</div>`;}
  const months=histSel(),all=HE.filter(r=>months.includes(r.data.slice(0,7)));const R=heRows();
  const fil=filtrosComuns([msel('heArea','Área (planilha)',opt('heArea',grpSum(all,heArea).map(g=>({v:g.k,l:g.k,s:fmtN(g.h)+' h'}))),{all:'Todas'}),
    msel('heCol','Colaborador',opt('heCol',grpSum(all,r=>r.colaborador).map(g=>({v:g.k,l:g.k,s:fmtN(g.h)+' h'}))),{all:'Todos'}),
    msel('heCls','Classificação',opt('heCls',grpSum(all,r=>r.classificacao).map(g=>({v:g.k,l:g.k,s:fmtN(g.h)+' h'}))),{all:'Todas'}),
    msel('heTur','Turno',opt('heTur',grpSum(all,r=>r.turno||'').map(g=>({v:g.k,l:g.k||'Não informado',s:fmtN(g.h)+' h'}))),{all:'Todos'})]).filter((x,i)=>i!==2);
  // números principais
  const H=sum(R.map(r=>r.horas)),BH=sum(R.filter(r=>heDest(r)==='bh').map(r=>r.horas)),PG=H-BH;
  const X=R.map(r=>({r,p:hePl(r)})).filter(x=>x.p);const xIn=sum(X.filter(x=>x.p.t).map(x=>x.r.horas)),xOut=sum(X.filter(x=>!x.p.t).map(x=>x.r.horas)),xT=xIn+xOut;
  const idx=heSAIndex(),people=hePeople(),SP=saPagoCalc(people,months,idx);
  const pend=R.filter(hePend),pendH=sum(pend.map(r=>r.horas));
  const byCls=grpSum(R,r=>r.classificacao),byTur=grpSum(R,r=>r.turno||''),byCol=grpSum(R,r=>r.colaborador),byMot=grpSum(R,r=>heMotivo(heJust(r)));
  // gráfico: banco de horas x pago x sobreaviso pago por mês
  const pm=months.map(m=>{const rs=R.filter(r=>r.data.startsWith(m));const bh=sum(rs.filter(r=>heDest(r)==='bh').map(r=>r.horas)),pg=sum(rs.filter(r=>heDest(r)==='pago').map(r=>r.horas));const s=SP.byM[m]||{lanc:0,troca:0,pago:0};
    const xi=sum(rs.map(r=>{const p=hePl(r);return p&&p.t?r.horas:0;})),xo=sum(rs.map(r=>{const p=hePl(r);return p&&!p.t?r.horas:0;}));return{m,bh,pg,he:bh+pg,sa:s,xi,xo};});
  const mx=Math.max(1,...pm.map(x=>x.bh+x.pg+x.sa.pago)),showV=pm.length<=18,COR={bh:'#85A7FF',pg:'#ef4444',sp:'#C0A1FF'};
  const chartP=`<div class="chart">${pm.map(x=>{const t=x.bh+x.pg+x.sa.pago;return `<div class="cb" title="${ymLabel(x.m)} · banco de horas ${hh(x.bh)} · pago 100% ${hh(x.pg)} · sobreaviso pago ${fmtN(x.sa.pago)} h">${showV&&t?`<span class="vl">${fmtN(t)}</span>`:''}<div class="stk" style="height:${(t/mx*88).toFixed(1)}%">${t?[['bh',x.bh],['pg',x.pg],['sp',x.sa.pago]].map(([k,v])=>v?`<i style="height:${(v/t*100).toFixed(2)}%;background:${COR[k]}"></i>`:'').join(''):''}</div></div>`;}).join('')}</div><div class="cx">${pm.map(x=>`<span>${showV||x.m.endsWith('-01')?ymShort(x.m):''}</span>`).join('')}</div><div class="lgd"><span><i style="background:${COR.bh}"></i>HE seg–sáb → banco de horas</span><span><i style="background:${COR.pg}"></i>HE domingo/feriado → pago 100%</span><span><i style="background:${COR.sp}"></i>sobreaviso pago (sem HE no período)</span><span class="muted">sobreaviso calculado a partir de jan/2025 (escala dia a dia)</span></div>`;
  const tP=`<div class="tw"><table class="t"><thead><tr><th>Mês</th><th style="text-align:right">HE total</th><th style="text-align:right">Banco de horas</th><th style="text-align:right">Pago 100%</th><th style="text-align:right">Sobreaviso lançado</th><th style="text-align:right">Trocado por HE</th><th style="text-align:right">Sobreaviso pago</th><th style="text-align:right">HE no plantão</th><th style="text-align:right">HE fora</th></tr></thead><tbody>${pm.slice().reverse().map(x=>{const g=state.escala[x.m];const xt=x.xi+x.xo;return `<tr><td><b>${ymLabel(x.m)}</b></td><td style="text-align:right"><b>${fmtN(x.he)} h</b></td><td style="text-align:right">${fmtN(x.bh)} h</td><td style="text-align:right">${fmtN(x.pg)} h</td><td style="text-align:right">${g?fmtN(x.sa.lanc)+' h':'—'}</td><td style="text-align:right">${g?fmtN(x.sa.troca)+' h':'—'}</td><td style="text-align:right">${g?`<b>${fmtN(x.sa.pago)} h</b>`:'—'}</td><td style="text-align:right">${xt?Math.round(x.xi/xt*100)+'%':'—'}</td><td style="text-align:right">${xt?Math.round(x.xo/xt*100)+'%':'—'}</td></tr>`;}).join('')}</tbody></table></div>`;
  // evolução por turno, ano x mês, rankings
  const TUR=['Diurno','Semi-Noturno','Noturno','Madrugada',''];const series=months.map(m=>{const rs=R.filter(r=>r.data.startsWith(m));const by={};rs.forEach(r=>by[r.turno||'']=(by[r.turno||'']||0)+r.horas);return{m,t:sum(rs.map(r=>r.horas)),by};});
  const mx2=Math.max(1,...series.map(s=>s.t)),avg=series.length?H/series.length:0;
  const chart=`<div class="chart">${series.map(s=>`<div class="cb" title="${ymLabel(s.m)}: ${hh(s.t)}">${showV&&s.t?`<span class="vl">${fmtN(s.t)}</span>`:''}<div class="stk" style="height:${(s.t/mx2*88).toFixed(1)}%">${TUR.map(t=>s.by[t]?`<i style="height:${(s.by[t]/s.t*100).toFixed(2)}%;background:${TURNO_COR[t]}" title="${t||'Não informado'}: ${hh(s.by[t])}"></i>`:'').join('')}</div></div>`).join('')}${avg?`<div class="avg" style="bottom:${(avg/mx2*0.88*220).toFixed(0)}px"><span>média ${fmtN(avg)} h</span></div>`:''}</div><div class="cx">${series.map(s=>`<span>${showV||s.m.endsWith('-01')?ymShort(s.m):''}</span>`).join('')}</div><div class="lgd">${TUR.filter(t=>byTur.some(g=>g.k===t)).map(t=>`<span><i style="background:${TURNO_COR[t]}"></i>${t||'Não informado'}</span>`).join('')}</div>`;
  const anos=[...new Set(months.map(m=>m.slice(0,4)))].sort();const cell={};R.forEach(r=>{const k=r.data.slice(0,7);cell[k]=(cell[k]||0)+r.horas;});const cmx=Math.max(1,...Object.values(cell));
  const ymT=`<div class="tw"><table class="t hm"><thead><tr><th>Ano</th>${MES3.map(m=>`<th>${m}</th>`).join('')}<th>Total</th><th>Média/mês</th></tr></thead><tbody>${anos.map(y=>{const vs=MES3.map((_,i)=>cell[`${y}-${pad(i+1)}`]||0);const n=months.filter(m=>m.startsWith(y)).length;return `<tr><td><b>${y}</b></td>${vs.map(v=>`<td style="${v?`background:rgba(255,217,25,${(.12+v/cmx*.7).toFixed(2)});color:#2E2D39`:''}">${v?fmtN(v):''}</td>`).join('')}<td class="tot"><b>${fmtN(sum(vs))}</b></td><td class="tot">${n?fmtN(sum(vs)/n):''}</td></tr>`;}).join('')}</tbody></table></div>`;
  const bars=(list,n,lab)=>{const m=Math.max(1,...list.slice(0,n).map(g=>g.h));return `<div class="hbars">${list.slice(0,n).map((g,i)=>`<div class="hb" title="${esc(g.k)} · ${g.n} lançamentos"><span class="nm"><b>${esc(lab?lab(g):g.k)}</b></span><span class="tr"><i style="width:${(g.h/m*100).toFixed(1)}%;background:${CLS_COR[i%CLS_COR.length]}"></i></span><b>${fmtN(g.h)} h</b></div>`).join('')||'<p class="muted">Sem lançamentos no filtro.</p>'}</div>`;};
  const colBars=(()=>{const m=Math.max(1,...byCol.slice(0,25).map(g=>g.h));return `<div class="hbars">${byCol.slice(0,25).map(g=>{const c=g.rows[0].colab_id?colab(g.rows[0].colab_id):null;const bh=sum(g.rows.filter(r=>heDest(r)==='bh').map(r=>r.horas));return `<div class="hb" title="${esc(g.k)} · ${g.n} lançamentos · banco de horas ${fmtN(bh)} h · pago ${fmtN(g.h-bh)} h${c?'':' · fora do cadastro atual'}"><span class="nm"><b>${esc(short(g.k))}</b> <span class="muted small">${esc(c?areaShort(area(c.areaId)?.nome||''):heArea(g.rows[0]))}</span></span><span class="tr"><i style="width:${(bh/m*100).toFixed(1)}%;background:${COR.bh}"></i><i style="left:${(bh/m*100).toFixed(1)}%;width:${((g.h-bh)/m*100).toFixed(1)}%;background:${COR.pg}"></i></span><b>${fmtN(g.h)} h</b></div>`;}).join('')||'<p class="muted">Sem lançamentos no filtro.</p>'}</div><div class="lgd"><span><i style="background:${COR.bh}"></i>banco de horas</span><span><i style="background:${COR.pg}"></i>pago 100%</span></div>`;})();
  // por colaborador: BH, pago, sobreaviso pago
  const pc=people.map(c=>{const rs=R.filter(r=>r.colab_id===c.id);const bh=sum(rs.filter(r=>heDest(r)==='bh').map(r=>r.horas)),pg=sum(rs.filter(r=>heDest(r)==='pago').map(r=>r.horas));const s=SP.byC[c.id]||{lanc:0,troca:0,pago:0};const xi=sum(rs.map(r=>{const p=hePl(r);return p&&p.t?r.horas:0;})),xo=sum(rs.map(r=>{const p=hePl(r);return p&&!p.t?r.horas:0;}));return{c,bh,pg,he:bh+pg,s,xi,xo,pend:rs.filter(hePend).length};}).filter(x=>x.he||x.s.lanc).sort((a,b)=>(b.he+b.s.pago)-(a.he+a.s.pago));
  const pcT=`<div class="tw"><table class="t"><thead><tr><th>Colaborador</th><th style="text-align:right">HE</th><th style="text-align:right">Banco de horas</th><th style="text-align:right">Pago 100%</th><th style="text-align:right">Sobreaviso lançado</th><th style="text-align:right">Sobreaviso pago</th><th style="text-align:right">HE no plantão</th><th style="text-align:right">HE fora</th><th style="text-align:right">Fora do padrão</th></tr></thead><tbody>${pc.map(x=>`<tr><td><b>${esc(x.c.nome)}</b> <span class="muted small">${esc(areaShort(area(x.c.areaId)?.nome||''))}</span></td><td style="text-align:right"><b>${fmtN(x.he)} h</b></td><td style="text-align:right">${fmtN(x.bh)} h</td><td style="text-align:right">${fmtN(x.pg)} h</td><td style="text-align:right">${fmtN(x.s.lanc)} h</td><td style="text-align:right"><b>${fmtN(x.s.pago)} h</b></td><td style="text-align:right">${fmtN(x.xi)} h</td><td style="text-align:right">${x.xo?`<span class="badge ${x.xo>x.xi?'b-wa':''}">${fmtN(x.xo)} h</span>`:'—'}</td><td style="text-align:right">${x.pend?`<span class="badge b-er">${x.pend}</span>`:''}</td></tr>`).join('')||'<tr><td colspan="9" class="muted">Sem dados no filtro.</td></tr>'}</tbody></table></div>`;
  // detalhamento
  const q=nrm(ui.heQ||'');let D=R.slice();if(ui.hePend)D=D.filter(hePend);if(q)D=D.filter(r=>nrm(r.colaborador+' '+heJust(r)+' '+r.motivo).includes(q));
  D.sort((a,b)=>cmp(b.data,a.data)||cmp(b.inicio,a.inicio));const lim=ui.heLim||150;
  const det=`<div class="bar"><div class="seg2"><button class="${ui.hePend?'':'on'}" data-act="hePend" data-v="0">Todos (${R.length})</button><button class="${ui.hePend?'on':''}" data-act="hePend" data-v="1">Fora do padrão (${pend.length})</button></div><input id="heq" data-uiq="heQ" placeholder="Buscar colaborador, BA, estação ou motivo…" value="${esc(ui.heQ||'')}" style="flex:1;min-width:220px;max-width:420px"><span class="sp"></span><span class="muted small">${D.length} lançamentos · ${fmtN(sum(D.map(r=>r.horas)))} h</span></div>
   <div class="tw"><table class="t det"><thead><tr><th>Data</th><th>Dia</th><th>Colaborador</th><th>Período</th><th style="text-align:right">Horas</th><th>Plantão</th><th>Destino</th><th>Justificativa (BA / estação / motivo)</th><th></th></tr></thead><tbody>${D.slice(0,lim).map(r=>{const p=hePl(r),pd=hePend(r),de=DEST[heDest(r)];
     return `<tr class="${pd?'pend':''}"><td class="small" style="white-space:nowrap">${fmt(r.data)}</td><td class="small">${DSEMX[dow(r.data)]}${isHol(r.data)?` <span class="badge b-wa" title="${esc(holName(r.data))}">feriado</span>`:''}</td><td><b>${esc(short(r.colaborador))}</b><div class="muted small">${esc(r.classificacao)}</div></td><td class="small" style="white-space:nowrap">${esc(r.inicio||'?')}–${esc(r.termino||'?')}<div class="muted">${esc(r.turno||'')}</div></td><td style="text-align:right"><b>${hh(r.horas)}</b></td><td>${p===null?'<span class="muted small">—</span>':p.t==='SA'?`<span class="badge b-sa" title="sobreaviso de ${fmtS(p.d)}">sobreaviso</span>`:p.t==='J3'?'<span class="badge b-j3">J3</span>':'<span class="badge">fora</span>'}</td><td><span class="badge ${de[1]}">${de[0]}</span></td><td class="small jus">${pd?`<span class="badge b-er" title="${esc(pendWhy(r))}">fora do padrão</span> `:''}${esc(heJust(r))}${r.justificativa?`<div class="muted">justificado por ${esc(r.justificado_nome||'')}${r.justificado_em?' em '+fmt(String(r.justificado_em).slice(0,10)):''} · original: ${esc(r.motivo)}</div>`:''}</td><td>${canJust(r)?`<button class="btn sm ${pd?'pri':'gh'}" data-act="heJus" data-id="${r.id}">${r.justificativa?'Editar':'Justificar'}</button>`:''}</td></tr>`;}).join('')||'<tr><td colspan="9" class="muted">Nenhum lançamento para os filtros escolhidos.</td></tr>'}</tbody></table></div>${D.length>lim?`<div class="bar" style="margin-top:10px"><button class="btn" data-act="heMais">Mostrar mais ${Math.min(150,D.length-lim)} de ${D.length-lim}</button></div>`:''}`;
  const fCount=['heArea','heCol','heCls','heTur','hSups'].filter(k=>ui[k].length).length;
  const pp=xT?Math.round(xIn/xT*100):0;
  return histHead(tools)+fbar(fil,fCount?`<button class="btn sm gh" data-act="heLimpar">Limpar filtros (${fCount})</button>`:'')+
  `<div class="breadcrumb"><span>Controle de justificativa de horas (planilha Estudo de Horas Extras) · 2023 em diante</span><span class="r">${periodoLabel(months)} · ${R.length} lançamentos · base com ${HE.length}</span></div>`+
  `<div class="metabar"><b>Regra de pagamento</b><span class="pill p-at" style="background:#85A7FF;color:#000">HE seg–sáb → banco de horas</span><span class="pill p-er">HE domingo e feriado → pago 100%</span><span class="pill" style="background:#C0A1FF;color:#000">sobreaviso pago = sobreaviso lançado − HE feita nele</span></div>`+
  `<div class="esc-titulo">Resultado consolidado <b>Horas extras — ${ui.heArea.length===1?esc(ui.heArea[0]):ui.heCol.length===1?esc(ui.heCol[0]):'Consolidado'}</b></div>`+
  hub([hubIt('clock','Total de horas extras',fmtN(H)+' h',`${R.length} lançamentos · média de ${fmtN(months.length?H/months.length:0)} h/mês`),
       hubIt('doc','Banco de horas',fmtN(BH)+' h',H?`${Math.round(BH/H*100)}% das HE · feitas de segunda a sábado`:''),
       hubIt('flag','Pagas 100%',fmtN(PG)+' h',H?`${Math.round(PG/H*100)}% das HE · domingos e feriados`:'')],
      {segs:[{v:xIn,c:'#FFD919'},{v:xOut,c:'#8583A8'}],k:'HE no plantão / sobreaviso',v:xT?pp+'%':'—',s:xT?`${fmtN(xIn)} h no plantão · ${fmtN(xOut)} h fora (${100-pp}%)`:'cruzamento a partir de jan/2025',pill:''},
      [hubIt('shield','Sobreaviso pago',fmtN(SP.pago)+' h',SP.lanc?`de ${fmtN(SP.lanc)} h lançadas na escala`:'sem escala dia a dia no período'),
       hubIt('bolt','Sobreaviso trocado por HE',fmtN(SP.troca)+' h',SP.lanc?`${Math.round(SP.troca/SP.lanc*100)}% do sobreaviso virou HE (BH ou pago)`:''),
       hubIt('alert','Fora do padrão',pend.length,pend.length?`${fmtN(pendH)} h sem BA / estação / motivo — clique para ver`:'todas no padrão',{cls:pend.length?'er':'ok',act:'heVerPend'})])+
  secdiv(1,'Banco de horas, pagamento e sobreaviso','o que foi para o banco de horas, o que foi pago e quanto do sobreaviso foi pago por mês')+`<div class="card"><h3>Horas por destino · mês a mês</h3>${chartP}</div><div class="card"><h3>Detalhamento por mês</h3>${tP}</div>`+
  secdiv(2,'Evolução por turno','horas extras justificadas por mês, por turno de término')+`<div class="card"><h3>Horas extras por mês</h3>${chart}</div>`+
  secdiv(3,'Comparativo por ano','soma de horas por mês em cada ano escolhido no filtro')+`<div class="card"><h3>Ano x mês (horas)</h3>${ymT}</div>`+
  secdiv(4,'Quem e por quê','colaboradores, classificações e motivos mais frequentes')+`<div class="card"><h3>Por colaborador · top 25</h3>${colBars}</div><div class="cols"><div class="card"><h3>Por classificação</h3>${bars(byCls,10)}</div><div class="card"><h3>Motivos mais frequentes</h3>${bars(byMot,10,g=>g.k.length>60?g.k.slice(0,60)+'…':g.k)}</div></div>`+
  secdiv(5,'Por colaborador','banco de horas, pagamento, sobreaviso pago e HE dentro e fora do plantão')+`<div class="card"><h3>Resumo por colaborador</h3>${pcT}</div>`+
  `<div id="he-det"></div>`+secdiv(6,'Detalhamento das justificativas','cada lançamento com dia da semana, período, horas e justificativa · os fora do padrão BA / ESTAÇÃO / MOTIVO ficam em destaque')+`<div class="card"><h3>Lançamentos · ${periodoLabel(months)}</h3>${det}</div>`;
}
Object.assign(ACT,{
  hePend:el=>{ui.hePend=el.dataset.v==='1';ui.heLim=150;persistUI();render();},
  heVerPend:()=>{ui.hePend=true;ui.heLim=150;render();const e=document.getElementById('he-det');if(e)e.scrollIntoView({behavior:'smooth'});},
  heMais:()=>{ui.heLim=(ui.heLim||150)+150;render();},
  heJus:el=>{const r=(HE||[]).find(x=>String(x.id)===el.dataset.id);if(!r)return;if(!canJust(r))return deny();openJust(r);}
});
function openJust(r){
  const m=String(r.motivo||'');const baG=(m.match(/\b(BA|JM)[\s:\-]*\d{6,}/i)||m.match(/\d{8,}/)||[''])[0];const stG=(m.match(/\b[A-Z]{2,4}_[A-Z0-9.]{2,}/i)||[''])[0];
  openModal({render:()=>`${mHead('Justificar hora extra')}<div class="mb"><div class="jus-info"><b>${esc(r.colaborador)}</b> · ${DSEMX[dow(r.data)]}, ${fmt(r.data)} · ${esc(r.inicio)}–${esc(r.termino)} · <b>${hh(r.horas)}</b> · ${DEST[heDest(r)][0]}<div class="muted small">Lançado na planilha: “${esc(m)}” · ${esc(r.classificacao)}</div></div>
    <p class="hint">Padrão: <b>BA / ESTAÇÃO / MOTIVO</b>. Ex.: BA 212257605 / SPO_BRS / Falta de AC na estação, troca de retificador.</p>
    <div class="fg"><label>BA, JM ou chamado<input id="j_ba" value="${esc(r.ba||baG)}" placeholder="BA 212257605"></label><label>Estação<input id="j_st" value="${esc(r.estacao||stG)}" placeholder="SPO_BRS"></label></div>
    <label style="display:block;margin-top:10px">Motivo<textarea id="j_mo" style="width:100%;height:80px" placeholder="O que foi feito e por quê">${esc(r.justificativa||'')}</textarea></label>
    <div class="hint" id="j_pv"></div></div><div class="mf"><span class="sp"></span><button class="btn" data-act="close">Cancelar</button><button class="btn pri" data-act="ok">Salvar justificativa</button></div>`,
  input(){const e=document.getElementById('j_pv');if(e)e.textContent='Vai ficar: '+[val('j_ba').trim(),val('j_st').trim(),val('j_mo').trim()].filter(Boolean).join(' / ');},
  async act(a){if(a==='close')return closeModal();if(a!=='ok')return;
    const f={ba:val('j_ba').trim(),estacao:val('j_st').trim(),justificativa:val('j_mo').trim()};
    if(!f.justificativa)return toast('Descreva o motivo');if(!f.ba&&!f.estacao)return toast('Informe o BA/JM ou a estação');
    f.justificado_nome=PROFILE?.nome||PROFILE?.email||'';f.justificado_em=new Date().toISOString();f.justificado_por=PROFILE?.id||null;
    const{error}=await sb.from('horas_extras').update(f).eq('id',r.id);if(error)return toast('Não foi possível salvar: '+error.message);
    Object.assign(r,f);closeModal();render();toast('Justificativa salva');}});
}
ACT.copyHE=()=>{const L=[['Data','Dia da semana','Colaborador','Início','Término','Horas','Turno','Classificação','Plantão','Destino','Justificativa','Fora do padrão','Motivo original','Área (planilha)'].join('\t')];
  heRows().forEach(r=>{const p=hePl(r);L.push([fmt(r.data),DSEMX[dow(r.data)],r.colaborador,r.inicio,r.termino,String(r.horas).replace('.',','),r.turno,r.classificacao,p===null?'':p.t==='SA'?'sobreaviso':p.t==='J3'?'J3':'fora',DEST[heDest(r)][0],heJust(r).replace(/\s+/g,' '),hePend(r)?'sim':'',String(r.motivo||'').replace(/\s+/g,' '),heArea(r)].join('\t'));});copyText(L.join('\n'));};

/* =====================================================================
   REGRAS PERSONALIZADAS DA ESCALA (admin)
   ===================================================================== */
const REG_TIPOS={
  maxMes:'Limite de plantões no mês',
  intervalo:'Intervalo mínimo entre plantões',
  naoJuntos:'Não escalar no mesmo fim de semana',
  bloqueio:'Restrição de colaborador',
  texto:'Orientação (texto livre)'};
const REG_REGIME={todos:'qualquer plantão',J3:'J3',SA:'sobreaviso'};
const regras=()=>Array.isArray(state.config.regrasEscala)?state.config.regrasEscala:[];
const regrasAtivas=()=>regras().filter(r=>r.ativa!==false);
const cNome=id=>colab(id)?short(colab(id).nome):'(colaborador removido)';
function regraDesc(r){const ar=r.area?` · ${areaShort(area(r.area)?.nome||'área removida')}`:'';
  if(r.tipo==='maxMes')return `No máximo ${r.n} fim(ns) de semana de ${REG_REGIME[r.regime||'todos']} por pessoa no mês${ar}`;
  if(r.tipo==='intervalo')return `Mínimo de ${r.dias} dias entre um plantão de fim de semana e o próximo da mesma pessoa${ar}`;
  if(r.tipo==='naoJuntos')return `${cNome(r.c1)} e ${cNome(r.c2)} não ficam de plantão no mesmo fim de semana/feriado`;
  if(r.tipo==='bloqueio'){const p=[];if((r.dows||[]).length)p.push('às '+r.dows.map(d=>DSEMX[d].toLowerCase()).join(', '));if(r.de)p.push(`de ${fmt(r.de)}${r.ate?' a '+fmt(r.ate):' em diante'}`);return `${cNome(r.c)} sem ${REG_REGIME[r.regime||'todos']} ${p.join(' e ')||'(defina dias ou período)'}`;}
  return r.texto||'';}
// usado pelo gerador: a pessoa pode pegar este plantão sem quebrar uma regra?
function ruleOk(c,t,b,days,h,soHard){for(const r of regrasAtivas()){if(r.area&&c.areaId!==r.area)continue;if(soHard&&(r.tipo==='maxMes'||r.tipo==='intervalo'))continue;
  if(r.tipo==='maxMes'&&b&&h&&(r.regime==='todos'||!r.regime||r.regime===t)){const n=(!r.regime||r.regime==='todos')?h.m:h.ms[r.regime];if(n>=+r.n)return false;}
  if(r.tipo==='intervalo'&&b&&h){for(const k of h.wk){if(k!==b.key&&Math.abs(ddiff(k,b.key))<+r.dias)return false;}}
  if(r.tipo==='naoJuntos'&&(c.id===r.c1||c.id===r.c2)){const o=c.id===r.c1?r.c2:r.c1;if(days.some(d=>{const v=getV(o,d);return v==='J3'||isNum(v);}))return false;}
  if(r.tipo==='bloqueio'&&c.id===r.c&&(!r.regime||r.regime==='todos'||r.regime===t||(t==='N'&&r.regime==='SA'))){if(days.some(d=>(r.dows||[]).includes(dow(d))||(r.de&&d>=r.de&&(!r.ate||d<=r.ate))))return false;}}
  return true;}
// alertas das regras na aba Escala
function ruleAlerts(ym,aid){const out=[],rs=regrasAtivas().filter(r=>r.tipo!=='texto'&&(!r.area||r.area===aid));if(!rs.length||!hasMonthData(ym,aid))return out;
  const cs=colabsOfArea(aid,ym),bym=blocksOfMonth(ym);
  rs.forEach(r=>{
    if(r.tipo==='maxMes')cs.forEach(c=>{const n=bym.filter(b=>{const x=inBlock(c.id,b);return r.regime==='J3'?x.J3:r.regime==='SA'?x.SA:x.J3||x.SA;}).length;if(n>+r.n)out.push({lvl:'warn',msg:`Regra “${regraDesc(r)}”: ${c.nome} tem ${n}`});});
    if(r.tipo==='intervalo')cs.forEach(c=>{const ks=bym.filter(b=>{const x=inBlock(c.id,b);return x.J3||x.SA;}).map(b=>b.key);for(let i=1;i<ks.length;i++)if(ddiff(ks[i-1],ks[i])<+r.dias)out.push({lvl:'warn',msg:`Regra de intervalo (${r.dias} dias): ${c.nome} em ${fmtS(ks[i-1])} e ${fmtS(ks[i])}`});});
    if(r.tipo==='naoJuntos'&&cs.some(c=>c.id===r.c1||c.id===r.c2))blocksAll(ym).forEach(b=>{const on=id=>b.dias.some(d=>{const v=getV(id,d);return v==='J3'||isNum(v);});if(on(r.c1)&&on(r.c2))out.push({lvl:'warn',msg:`Regra: ${cNome(r.c1)} e ${cNome(r.c2)} juntos em ${diasLabel(b.dias)}`});});
    if(r.tipo==='bloqueio'&&cs.some(c=>c.id===r.c)){const bad=monthDays(ym).filter(d=>{const v=getV(r.c,d);const tt=v==='J3'?'J3':isNum(v)?'SA':null;if(!tt)return false;if(r.regime&&r.regime!=='todos'&&r.regime!==tt)return false;return (r.dows||[]).includes(dow(d))||(r.de&&d>=r.de&&(!r.ate||d<=r.ate));});if(bad.length)out.push({lvl:'warn',msg:`Regra: ${regraDesc(r)} — escalado em ${bad.map(fmtS).join(', ')}`});}
  });return out;}
function folgaAlerts(ym,aid){const out=[];if(!hasMonthData(ym,aid))return out;const cs=colabsOfArea(aid,ym);const ar=area(aid);
  monthDays(ym).filter(isWork).forEach(d=>{const f=cs.filter(c=>FOLGA_COD.has(getV(c.id,d)));if(f.length<2)return;const by={};f.forEach(c=>(by[turnoOf(c)]=by[turnoOf(c)]||[]).push(c));
    Object.entries(by).forEach(([t,l])=>{if(l.length>1)out.push({lvl:'warn',msg:`${DSEM[dow(d)]} ${fmtS(d)}: ${l.map(c=>first(c.nome)).join(' e ')} de folga no mesmo turno (${TURNO_NOME[t]})`});});
    if(Object.keys(by).length>1&&!Object.values(by).some(l=>l.length>1))out.push({lvl:'info',msg:`${DSEM[dow(d)]} ${fmtS(d)}: ${f.map(c=>`${first(c.nome)} (${TURNO_NOME[turnoOf(c)]})`).join(' e ')} de folga no mesmo dia — turnos diferentes, exceção aceita`});});
  return out;}
{const _ea=escalaAlerts;escalaAlerts=function(ym,aid){const a=_ea(ym,aid);return a.length===1&&a[0].lvl==='info'&&/não foi gerada/.test(a[0].msg)?a:a.concat(folgaAlerts(ym,aid),ruleAlerts(ym,aid));};}
function regrasCard(){const rs=regras();return `<div class="card"><h3>Regras personalizadas da escala ${rs.length?`<span class="badge">${regrasAtivas().length} ativas</span>`:''}</h3><p class="hint" style="margin-top:0">Use quando notar erros ou vícios na escala. As regras de limite, intervalo, “não juntos” e restrição são seguidas pelo <b>Gerar escala</b> (quando houver outra pessoa disponível) e viram alerta na aba Escala. Orientações em texto aparecem para quem monta a escala.</p>
  ${rs.length?`<div class="regs">${rs.map(r=>`<div class="reg ${r.ativa===false?'off':''}"><span class="badge ${r.tipo==='texto'?'':'b-sa'}">${REG_TIPOS[r.tipo]||r.tipo}</span><div class="rt"><b>${esc(regraDesc(r))}</b>${r.obs?`<div class="muted small">${esc(r.obs)}</div>`:''}<div class="muted small">${r.autor?`por ${esc(r.autor)}`:''}${r.criada?` em ${fmt(r.criada)}`:''}</div></div>${isAdmin()?`<label class="chk" title="Ativar/desativar"><input type="checkbox" data-chg="regTog" data-id="${r.id}" ${r.ativa!==false?'checked':''}> ativa</label><button class="btn sm gh" data-act="regEdit" data-id="${r.id}">Editar</button><button class="btn sm dan" data-act="regDel" data-id="${r.id}">Excluir</button>`:''}</div>`).join('')}</div>`:'<div class="alert ok">Nenhuma regra personalizada ainda.</div>'}
  <div class="bar needs-admin" style="margin-top:12px"><button class="btn pri" data-act="regNew">+ Nova regra</button></div></div>`;}
function openRegra(id){const old=regras().find(r=>r.id===id);const R0=old?JSON.parse(JSON.stringify(old)):{tipo:'maxMes',n:1,regime:'todos',dias:14,dows:[],ativa:true};
  const cOpts=sel=>`<option value="">— escolha —</option>`+activeColabs().slice().sort((a,b)=>cmp(a.nome,b.nome)).map(c=>`<option value="${c.id}" ${c.id===sel?'selected':''}>${esc(c.nome)} · ${esc(areaShort(area(c.areaId)?.nome||FUNC[c.funcao]||''))}</option>`).join('');
  const aOpts=sel=>`<option value="">Todas as áreas</option>`+areasSorted().map(a=>`<option value="${a.id}" ${a.id===sel?'selected':''}>${esc(a.nome)}</option>`).join('');
  const rOpts=sel=>Object.entries(REG_REGIME).map(([k,l])=>`<option value="${k}" ${k===(sel||'todos')?'selected':''}>${l}</option>`).join('');
  const read=()=>{const g=id=>document.getElementById(id);R0.tipo=val('r_tipo')||R0.tipo;['n','dias'].forEach(k=>{if(g('r_'+k))R0[k]=Math.max(1,+val('r_'+k)||1);});['regime','area','c','c1','c2','de','ate','texto','obs'].forEach(k=>{if(g('r_'+k))R0[k]=val('r_'+k).trim();});if(g('r_dows'))R0.dows=[...document.querySelectorAll('#r_dows input:checked')].map(i=>+i.value);};
  openModal({render:()=>{const t=R0.tipo;return `${mHead(old?'Editar regra':'Nova regra da escala')}<div class="mb"><label>Tipo de regra<select id="r_tipo" data-k="tipo">${Object.entries(REG_TIPOS).map(([k,l])=>`<option value="${k}" ${k===t?'selected':''}>${l}</option>`).join('')}</select></label>
    <div class="fg" style="margin-top:10px">${t==='maxMes'?`<label>Máximo de fins de semana por pessoa no mês<input type="number" id="r_n" min="1" max="5" value="${R0.n||1}"></label><label>Regime<select id="r_regime">${rOpts(R0.regime)}</select></label><label>Área<select id="r_area">${aOpts(R0.area)}</select></label>`:''}
    ${t==='intervalo'?`<label>Dias mínimos entre plantões<input type="number" id="r_dias" min="7" max="60" step="7" value="${R0.dias||14}"></label><label>Área<select id="r_area">${aOpts(R0.area)}</select></label>`:''}
    ${t==='naoJuntos'?`<label>Colaborador<select id="r_c1">${cOpts(R0.c1)}</select></label><label>Não junto com<select id="r_c2">${cOpts(R0.c2)}</select></label>`:''}
    ${t==='bloqueio'?`<label>Colaborador<select id="r_c">${cOpts(R0.c)}</select></label><label>Sem<select id="r_regime">${rOpts(R0.regime)}</select></label><label>A partir de<input type="date" id="r_de" value="${R0.de||''}"></label><label>Até (vazio = sem fim)<input type="date" id="r_ate" value="${R0.ate||''}"></label>`:''}</div>
    ${t==='bloqueio'?`<div style="margin-top:10px"><span class="small muted">Dias da semana (opcional)</span><div id="r_dows" class="dows">${DSEMX.map((d,i)=>`<label class="chk"><input type="checkbox" value="${i}" ${(R0.dows||[]).includes(i)?'checked':''}> ${d.slice(0,3)}</label>`).join('')}</div></div>`:''}
    ${t==='texto'?`<label style="display:block">Orientação<textarea id="r_texto" style="width:100%;height:80px" placeholder="Ex.: evitar escalar recém-admitidos sozinhos em feriado">${esc(R0.texto||'')}</textarea></label>`:''}
    <label style="display:block;margin-top:10px">Motivo / observação (opcional)<input id="r_obs" value="${esc(R0.obs||'')}" placeholder="Ex.: vício observado em out/26" style="width:100%"></label></div>
    <div class="mf"><span class="sp"></span><button class="btn" data-act="close">Cancelar</button><button class="btn pri" data-act="ok">${old?'Salvar':'Adicionar regra'}</button></div>`;},
  change(el){if(el.id==='r_tipo'){read();R0.tipo=el.value;drawModal();}},
  act(a){if(a==='close')return closeModal();if(a!=='ok')return;read();const t=R0.tipo;
    if(t==='naoJuntos'&&(!R0.c1||!R0.c2||R0.c1===R0.c2))return toast('Escolha dois colaboradores diferentes');
    if(t==='bloqueio'&&(!R0.c||(!(R0.dows||[]).length&&!R0.de)))return toast('Escolha o colaborador e os dias da semana ou o período');
    if(t==='texto'&&!R0.texto)return toast('Escreva a orientação');
    const keep={id:R0.id||uid(),tipo:t,ativa:R0.ativa!==false,obs:R0.obs||'',autor:R0.autor||PROFILE?.nome||PROFILE?.email||'',criada:R0.criada||todayS()};
    ({maxMes:['n','regime','area'],intervalo:['dias','area'],naoJuntos:['c1','c2'],bloqueio:['c','regime','de','ate','dows'],texto:['texto']})[t].forEach(k=>keep[k]=R0[k]);
    const rs=regras().slice();const i=rs.findIndex(r=>r.id===keep.id);if(i>=0)rs[i]=keep;else rs.push(keep);state.config.regrasEscala=rs;touch();closeModal();render();toast(old?'Regra atualizada':'Regra adicionada — vale para as próximas gerações');}});}
Object.assign(ACT,{
  regNew:()=>isAdmin()?openRegra():deny(),
  regEdit:el=>isAdmin()?openRegra(el.dataset.id):deny(),
  regDel:el=>{if(!isAdmin())return deny();const r=regras().find(x=>x.id===el.dataset.id);confirmBox('Excluir regra?',esc(regraDesc(r)),'Excluir',()=>{state.config.regrasEscala=regras().filter(x=>x.id!==r.id);touch();render();},true);},
  regTog:el=>{if(!isAdmin()){el.checked=!el.checked;return deny();}const r=regras().find(x=>x.id===el.dataset.id);if(r){r.ativa=el.checked;state.config.regrasEscala=regras().slice();touch();render();}}
});
const orientacoesHtml=()=>{const t=regrasAtivas();if(!t.length)return '';return `<details class="card orient"><summary><b>Regras da equipe</b> <span class="muted small">${t.length} ativa(s) · clique para ver</span></summary><ul class="rules small">${t.map(r=>`<li><span class="badge ${r.tipo==='texto'?'':'b-sa'}">${REG_TIPOS[r.tipo]}</span> ${esc(regraDesc(r))}${r.obs?` <span class="muted">— ${esc(r.obs)}</span>`:''}</li>`).join('')}</ul>${isAdmin()?'<a data-act="tab" data-v="config" class="small">Editar em Configurações</a>':''}</details>`;};

/* ================= login ================= */
let LOGIN={mode:'entrar',msg:'',err:''};
function renderLogin(mode,msg,err){if(mode)LOGIN.mode=mode;LOGIN.msg=msg||'';LOGIN.err=err||'';
  const f={entrar:`<form id="fLogin"><label>E-mail V.tal<input type="email" id="l_em" required placeholder="nome.sobrenome@vtal.com" autocomplete="username"></label><label>Senha<input type="password" id="l_pw" required autocomplete="current-password"></label><button class="btn pri" type="submit">Entrar</button></form><div class="lk"><a data-act="lmode" data-v="cadastro">Criar conta</a><a data-act="lmode" data-v="esqueci">Esqueci a senha</a></div>`,
    cadastro:`<form id="fCad"><label>Nome<input id="c_nm" required></label><label>E-mail V.tal<input type="email" id="c_em" required placeholder="nome.sobrenome@vtal.com" autocomplete="username"></label><label>Telefone (celular)<input type="tel" id="c_fone" required placeholder="(11) 90000-0000" autocomplete="tel"></label><label>Senha (mín. 8 caracteres)<input type="password" id="c_pw" required minlength="8" autocomplete="new-password"></label><label>Repita a senha<input type="password" id="c_pw2" required minlength="8" autocomplete="new-password"></label><button class="btn pri" type="submit">Criar conta</button><p class="hint">Toda conta nova entra com perfil <b>Leitura</b>. O administrador libera edição quando necessário.</p></form><div class="lk"><a data-act="lmode" data-v="entrar">Já tenho conta</a></div>`,
    esqueci:`<form id="fEsq"><label>E-mail V.tal<input type="email" id="e_em" required></label><button class="btn pri" type="submit">Enviar link para redefinir</button></form><div class="lk"><a data-act="lmode" data-v="entrar">Voltar</a></div>`,
    nova:`<form id="fNova"><label>Nova senha<input type="password" id="n_pw" required minlength="8" autocomplete="new-password"></label><label>Repita a nova senha<input type="password" id="n_pw2" required minlength="8" autocomplete="new-password"></label><button class="btn pri" type="submit">Salvar nova senha</button></form>`}[LOGIN.mode];
  const t={entrar:'Entrar',cadastro:'Criar conta',esqueci:'Redefinir senha',nova:'Nova senha'}[LOGIN.mode];
  $('#root').innerHTML=`<div class="login"><div class="lbox"><div class="lhead"><div class="logo-img"></div><span class="bsep" style="width:1px;height:28px;background:var(--line)"></span><span class="btit"><b>Gestão Equipe</b><small>Planta Interna SP</small></span></div><div class="lbody"><h3>${t}</h3>${LOGIN.err?`<div class="alert err">⛔ ${esc(LOGIN.err)}</div>`:''}${LOGIN.msg?`<div class="alert ok">✅ ${esc(LOGIN.msg)}</div>`:''}${f}</div></div><p class="lfoot">Acesso restrito a colaboradores V.tal</p></div>`;}
const vtal=e=>/^[^@\s]+@vtal\.com$/i.test(String(e).trim());
const authErr=m=>/Invalid login/i.test(m)?'E-mail ou senha incorretos.':/Email not confirmed/i.test(m)?'Confirme seu e-mail pelo link que enviamos antes de entrar.':/Database error|vtal/i.test(m)?'Cadastro permitido somente com e-mail @vtal.com.':/already registered/i.test(m)?'Este e-mail já tem conta. Use “Esqueci a senha” se precisar.':m;
document.addEventListener('submit',async e=>{const id=e.target.id;if(!/^f(Login|Cad|Esq|Nova)$/.test(id))return;e.preventDefault();const btn=e.target.querySelector('button[type=submit]');if(btn)btn.disabled=true;
  try{
    if(id==='fLogin'){const em=val('l_em').trim().toLowerCase();if(!vtal(em))return renderLogin(null,'','Use seu e-mail @vtal.com.');const{data,error}=await sb.auth.signInWithPassword({email:em,password:val('l_pw')});if(error)return renderLogin(null,'',authErr(error.message));await afterLogin(data.session);}
    if(id==='fCad'){const em=val('c_em').trim().toLowerCase();if(!vtal(em))return renderLogin(null,'','Cadastro permitido somente com e-mail @vtal.com.');if(val('c_pw')!==val('c_pw2'))return renderLogin(null,'','As senhas não conferem.');if(String(val('c_fone')).replace(/\D/g,'').length<10)return renderLogin(null,'','Informe o telefone com DDD.');
      const{data,error}=await sb.auth.signUp({email:em,password:val('c_pw'),options:{data:{nome:val('c_nm').trim(),telefone:val('c_fone').trim()},emailRedirectTo:location.origin+location.pathname}});if(error)return renderLogin(null,'',authErr(error.message));
      if(data.session)return afterLogin(data.session);const r2=await sb.auth.signInWithPassword({email:em,password:val('c_pw')});if(r2.data&&r2.data.session)return afterLogin(r2.data.session);renderLogin('entrar','Conta criada! Se o acesso pedir confirmação, use o link enviado para '+em+'. Depois entre com sua senha.');}
    if(id==='fEsq'){const em=val('e_em').trim().toLowerCase();if(!vtal(em))return renderLogin(null,'','Use seu e-mail @vtal.com.');const{error}=await sb.auth.resetPasswordForEmail(em,{redirectTo:location.origin+location.pathname});if(error)return renderLogin(null,'',authErr(error.message));renderLogin('entrar','Se o e-mail tiver conta, você receberá um link para criar uma nova senha.');}
    if(id==='fNova'){if(val('n_pw')!==val('n_pw2'))return renderLogin(null,'','As senhas não conferem.');const{error}=await sb.auth.updateUser({password:val('n_pw')});if(error)return renderLogin(null,'',authErr(error.message));history.replaceState(null,'',location.pathname);const{data}=await sb.auth.getSession();toast('Senha alterada');await afterLogin(data.session);}
  }finally{if(btn)btn.disabled=false;}
});
async function afterLogin(session){
  SESSION=session;$('#root').innerHTML='<div class="login"><div class="lbox"><div class="lbody"><p>Carregando dados…</p></div></div></div>';
  const{data:p,error}=await sb.from('profiles').select('*').eq('id',session.user.id).maybeSingle();
  if(error||!p){await sb.auth.signOut();return renderLogin('entrar','','Não encontramos seu perfil. O acesso é restrito a e-mails @vtal.com.');}
  PROFILE=p;document.body.className='role-'+p.role;
  try{await loadAll();}catch(e){return renderLogin('entrar','','Erro ao carregar os dados: '+(e.message||e));}
  if(p.role==='admin'){let n=0;state.colaboradores.forEach(c=>n+=normalizePeriods(c));if(n){touch();console.info('Períodos de férias corrigidos:',n);}}
  const h=location.hash.slice(1);if(['geral','escala','historico','ferias','cadastros','config'].includes(h))ui.tab=h;
  render();
}
window.addEventListener('focus',()=>{if(SESSION&&!dirty&&!M&&!syncing&&Date.now()-lastLoad>60000)reloadData();});
window.addEventListener('beforeunload',e=>{if(dirty||syncing){e.preventDefault();e.returnValue='';}});

/* ================= inicialização ================= */
(async function boot(){
  if(!CFG.SUPABASE_URL||!CFG.SUPABASE_ANON_KEY||!window.supabase){$('#root').innerHTML='<div class="login"><div class="lbox"><div class="lbody"><h3>Configuração pendente</h3><p>Preencha <code>config.js</code> com a URL e a chave pública do Supabase.</p></div></div></div>';return;}
  sb=window.supabase.createClient(CFG.SUPABASE_URL,CFG.SUPABASE_ANON_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  const recovery=/type=recovery/.test(location.hash);
  sb.auth.onAuthStateChange((ev)=>{if(ev==='PASSWORD_RECOVERY')renderLogin('nova');if(ev==='SIGNED_OUT'){SESSION=null;PROFILE=null;document.body.className='';renderLogin('entrar');}});
  const{data:{session}}=await sb.auth.getSession();
  if(session&&recovery)return renderLogin('nova');
  if(session)await afterLogin(session);else renderLogin('entrar');
})();
