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

function buildIdx(){IDX={vac:{}};state.ferias.forEach(f=>{const s=IDX.vac[f.colabId]=IDX.vac[f.colabId]||new Set();vacDays(f).forEach(d=>s.add(d));});SC={};}

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
function gerarEscala(ym,aid){
  const a=area(aid);buildIdx();
  const cs=escalaveis(aid);const own=ownedDays(ym);const blocks=blocksAll(ym);const prevBlocks=blocksOfMonth(ymAdd(ym,-1));
  const protect=new Set();prevBlocks.forEach(b=>cs.forEach(c=>{const r=inBlock(c.id,b);if(r.J3||r.SA)protect.add(c.id+'|'+b.folgaDepois);}));
  cs.forEach(c=>own.forEach(d=>{const v=getV(c.id,d);if(v==='J3'||isNum(v)||(v==='FO'&&!protect.has(c.id+'|'+d)))setV(c.id,d,null);}));
  const mStart=ym+'-01',h90Start=add(mStart,-90);
  const H={};cs.forEach(c=>H[c.id]={last:{J3:'',SA:''},wk:new Set(),h90:0,m:0,ms:{J3:0,SA:0},night:0,r:Math.random()});
  Object.keys(state.escala).forEach(m=>{const mm=state.escala[m];cs.forEach(c=>{const cells=mm[c.id];if(!cells)return;for(const dd in cells){const d=m+'-'+dd,v=cells[dd];if(m===ym&&own.has(d))continue;const h=H[c.id];
    if(v==='J3'){if(d<mStart&&d>h.last.J3)h.last.J3=d;h.wk.add(satKey(d));}
    else if(isNum(v)){if(!isWork(d)){if(d<mStart&&d>h.last.SA)h.last.SA=d;h.wk.add(satKey(d));}if(d>=h90Start&&d<mStart)h.h90+=v;}}});});
  const freeDays=(c,days)=>days.every(d=>getV(c.id,d)===undefined&&!onVac(c.id,d));
  const vacIn=(c,a1,b1)=>range(a1,b1).some(d=>onVac(c.id,d));
  const putFO=(c,d)=>{if(d&&getV(c.id,d)===undefined&&!onVac(c.id,d))setV(c.id,d,'FO');};
  const order=(t,b,list)=>list.sort((x,y)=>{const hx=H[x.id],hy=H[y.id];const ax=(hx.wk.has(add(b.key,-7))||hx.wk.has(add(b.key,7)))?1:0,ay=(hy.wk.has(add(b.key,-7))||hy.wk.has(add(b.key,7)))?1:0;return hx.m-hy.m||hx.ms[t]-hy.ms[t]||ax-ay||cmp(hx.last[t],hy.last[t])||hx.h90-hy.h90||hx.r-hy.r;});
  const mark=(c,t,b)=>{const h=H[c.id];h.m++;h.ms[t]++;h.last[t]=b.start;h.wk.add(b.key);};
  const missing=[];
  for(const b of blocks){
    const used=new Set();
    const jd=j3Days(b);
    if(!b.iso&&jd.length)for(let i=0;i<a.j3Vagas;i++){
      const ok=order('J3',b,cs.filter(c=>c.j3&&!used.has(c.id)&&freeDays(c,jd)&&!vacIn(c,b.folgaAntes,b.folgaDepois)));
      const c=ok[0];if(!c){missing.push(`${diasLabel(b.dias)}: sem colaborador para J3`);continue;}
      jd.forEach(d=>setV(c.id,d,'J3'));if(a.folgaJ3){putFO(c,b.folgaAntes);putFO(c,b.folgaDepois);}used.add(c.id);mark(c,'J3',b);
    }
    if(a.saModo==='dia'||b.iso){
      for(const d of b.dias)for(let i=0;i<a.saVagas;i++){
        const cand=cs.filter(c=>c.sa!==false&&freeDays(c,[d]));
        let ok=order('SA',b,cand.filter(c=>!used.has(c.id)));if(!ok.length)ok=order('SA',b,cand);
        const c=ok[0];if(!c){missing.push(`${DSEM[dow(d)]} ${fmtS(d)}: sem colaborador para sobreaviso`);continue;}
        setV(c.id,d,hoursFor(a,d));if(!used.has(c.id)){if(a.folgaSA&&!b.iso)putFO(c,b.folgaAntes);mark(c,'SA',b);}used.add(c.id);
      }
    }else{
      for(let i=0;i<a.saVagas;i++){
        const ok=order('SA',b,cs.filter(c=>c.sa!==false&&!used.has(c.id)&&freeDays(c,b.dias)&&!vacIn(c,b.folgaAntes,b.end)));
        const c=ok[0];if(!c){missing.push(`${diasLabel(b.dias)}: sem colaborador para sobreaviso`);continue;}
        b.dias.forEach(d=>setV(c.id,d,hoursFor(a,d)));if(a.folgaSA)putFO(c,b.folgaAntes);used.add(c.id);mark(c,'SA',b);
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
      let c=pref.find(c=>freeDays(c,[d]));
      if(!c){const ok=cs.filter(c=>c.sa!==false&&freeDays(c,[d])).sort((x,y)=>H[x.id].night-H[y.id].night||H[x.id].m-H[y.id].m||H[x.id].r-H[y.id].r);c=ok[0];}
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
      if(r.SA&&b.dias.some(d=>isAc(c.id,d))&&getV(c.id,b.folgaDepois)!=='FO')out.push({lvl:'warn',msg:`${c.nome}: sobreaviso de ${fmtS(b.key)} acionado sem folga pós-plantão (${fmtS(b.folgaDepois)})`});});
  });
  const esc=escalaveis(aid);const cnt=c=>bym.filter(b=>{const r=inBlock(c.id,b);return r.J3||r.SA;}).length;
  const zero=esc.filter(c=>cnt(c)===0&&!bym.every(b=>b.dias.some(d=>onVac(c.id,d)))),two=esc.filter(c=>cnt(c)>1);
  if(!small&&zero.length&&two.length)out.push({lvl:'warn',msg:`Distribuição desigual: ${two.map(c=>first(c.nome)).join(', ')} com 2+ fins de semana enquanto ${zero.map(c=>first(c.nome)).join(', ')} sem nenhum.`});
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
  if(c.admissao){for(let k=0;k<70;k++){const ini=addYears(c.admissao,k);if(ini>today)break;res.push({key:ini,ini,fim:add(addYears(c.admissao,k+1),-1),concFim:add(addYears(c.admissao,k+2),-1)});}}
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
  const res=basePeriods(c);const keys=new Set(res.map(p=>p.key));
  state.ferias.filter(f=>f.colabId===c.id).forEach(f=>{if(keys.has(f.periodo)||!/^\d{4}-\d{2}-\d{2}$/.test(f.periodo||''))return;keys.add(f.periodo);const ini=f.periodo;res.push({key:ini,ini,fim:add(addYears(ini,1),-1),concFim:add(addYears(ini,2),-1)});});
  res.sort((a,b)=>cmp(a.ini,b.ini));
  return res.map(p=>{const fr=state.ferias.filter(f=>f.colabId===c.id&&f.periodo===p.key);const gozo=sum(fr.map(f=>f.dias)),abono=sum(fr.map(f=>f.abono||0)),direito=30,saldo=direito-gozo-abono;
    const hd=state.config.historicoDesde||'2025-01-01';
    const status=p.fim>=today?'aquisicao':p.fim<hd?'historico':saldo<=0?'quitado':p.concFim<today?(p.fim>=(state.config.controleDesde||'2026-12-01')?'vencido':'verificar'):'aberto';
    return{...p,fr,gozo,abono,direito,saldo,status};}).filter(p=>all||p.concFim>=today||(p.fr.length&&p.status!=='historico'));
}
const perLabel=k=>/^ciclo-/.test(k||'')?'Ciclo '+k.slice(6):'Aquisitivo '+fmt(k);
function reassignPeriods(c){
  const ps=basePeriods(c);if(!ps.length)return;const rem={};ps.forEach(p=>rem[p.key]=30);
  state.ferias.filter(f=>f.colabId===c.id).sort((a,b)=>cmp(a.inicio||'9',b.inicio||'9')).forEach(f=>{const need=(+f.dias||0)+(+f.abono||0),d=f.inicio||todayS();
    let p=ps.find(p=>p.fim<d&&p.concFim>=d&&rem[p.key]>=need)||ps.find(p=>p.fim<d&&rem[p.key]>=need)||ps.filter(p=>p.ini<=d).pop()||ps[0];f.periodo=p.key;rem[p.key]-=need;});
}
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
  const errs=[],warns=[];const outros=per.fr.filter(f=>f.id!==ignoreId);
  const frs=outros.filter(f=>f.dias>0).map(f=>+f.dias);if(n.dias>0)frs.push(n.dias);
  const abonoT=sum(outros.map(f=>f.abono||0))+n.abono,gozoT=sum(frs),rem=per.direito-gozoT-abonoT,maxAb=Math.floor(per.direito/3);
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
function touch(){dirty=true;invalidateHol();setStatus('dirty');clearTimeout(saveTimer);saveTimer=setTimeout(doSave,1200);}
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
  const[c,t]=m[saveSt]||m.saved;return `<span class="dot ${c}"></span><span>${t}</span><button class="btn sm" data-act="reload" title="Buscar alterações de outros usuários">↻</button>`;
}

/* ================= UI base ================= */
const ui=Object.assign({tab:'geral',ym:todayS().slice(0,7),areaId:'',year:+todayS().slice(0,4),fview:'12m',fArea:'',fSup:'',q:'',sub:'colab',cq:'',hy:+todayS().slice(0,4),hArea:'',hm:'sa',hn:'12',allAl:false},loadUI());
function toast(msg){const d=document.createElement('div');d.textContent=msg;$('#toast').appendChild(d);setTimeout(()=>d.remove(),3500);}
function openModal(m){M=m;drawModal();}
function closeModal(){M=null;$('#modal').innerHTML='';if(dirty){clearTimeout(saveTimer);saveTimer=setTimeout(doSave,1500);}}
function drawModal(){if(!M)return;$('#modal').innerHTML=`<div class="ov" data-act="ov"><div class="mdl ${M.wide?'wide':''}">${M.render()}</div></div>`;}
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

function render(){
  const keep=[...document.querySelectorAll('[data-keep]')].map(e=>[e.dataset.keep,e.scrollLeft,e.scrollTop]);const wy=window.scrollY;
  if(ui.areaId&&!area(ui.areaId))ui.areaId='';
  buildIdx();
  const tabs=[['geral','Visão geral'],['escala','Escala'],['historico','Histórico'],['ferias','Férias'],['cadastros','Cadastros'],['config','Configurações']];
  const views={geral:rGeral,escala:rEscala,historico:rHist,ferias:rFerias,cadastros:rCad,config:rConfig};
  $('#root').innerHTML=`<header><div class="brand"><div class="logo-img" role="img" aria-label="V.tal"></div><span class="sep"></span><div class="tt"><b>GESTÃO EQUIPE</b><span>PLANTA INTERNA SP</span></div></div><nav>${tabs.map(([k,l])=>`<button class="${ui.tab===k?'on':''}" data-act="tab" data-v="${k}">${l}</button>`).join('')}</nav><div class="save" id="savest">${saveStatusHtml()}</div><div class="usr"><span title="${esc(PROFILE?.email||'')}">${esc(PROFILE?.nome||PROFILE?.email||'')}</span><span class="badge b-sa">${ROLE_LABEL[ROLE()]}</span><button class="btn sm" data-act="logout">Sair</button></div></header><main>${(views[ui.tab]||rGeral)()}</main><div class="ftr"><span>Gestão Equipe · Planta Interna SP</span><span>Dados no banco · sincronizado ${state.savedAt?new Date(state.savedAt).toLocaleString('pt-BR'):''}</span></div>`;
  keep.forEach(([k,l,t])=>{const e=document.querySelector(`[data-keep="${k}"]`);if(e){e.scrollLeft=l;e.scrollTop=t;}});window.scrollTo(0,wy);
}

/* ---------- Visão geral ---------- */
function nextBlockKey(){let s=todayS();if(dow(s)===0)s=add(s,-1);while(dow(s)!==6)s=add(s,1);return s;}
function blockPeople(aid,b){const res={J3:[],SA:[]};colabsOfArea(aid,b.key.slice(0,7)).forEach(c=>{const r=inBlock(c.id,b);if(r.J3)res.J3.push(c);if(r.SA)res.SA.push({c,h:r.h,days:b.dias.filter(d=>isNum(getV(c.id,d)))});});return res;}
function rGeral(){
  const ym=todayS().slice(0,7);
  let alerts=[];areasSorted().forEach(a=>escalaAlerts(ym,a.id).forEach(x=>{if(x.lvl!=='info')alerts.push({...x,msg:`[${a.nome}] ${x.msg}`});}));
  const conf=conflictData(todayS(),add(todayS(),365)).list;const venc=feriasAVencer();const semAdm=activeColabs().filter(c=>!c.admissao).length;
  const nb=makeBlock(nextBlockKey());
  const rows=areasSorted().map(a=>{const p=blockPeople(a.id,nb);const nm=c=>`<div><b>${esc(short(c.nome))}</b> <span class="muted small">${esc(c.telefone||'')}</span></div>`;
    return `<tr><td class="small"><b>${esc(a.nome)}</b></td><td>${p.J3.map(nm).join('')||(a.j3Vagas?'<span class="badge b-er">vago</span>':'<span class="muted small">—</span>')}</td><td>${p.SA.map(x=>`<div><b>${esc(short(x.c.nome))}</b> <span class="badge b-sa">${x.days.map(d=>DS1[dow(d)]+' '+getV(x.c.id,d)+'h').join(' · ')}</span> <span class="muted small">${esc(x.c.telefone||'')}</span></div>`).join('')||'<span class="badge b-er">vago</span>'}</td></tr>`;}).join('');
  const hrs=sum(activeColabs().map(c=>monthStat(c.id,ym)?.sa||0)),j3d=sum(activeColabs().map(c=>monthStat(c.id,ym)?.j3||0));
  const emFerias=activeColabs().filter(c=>onVac(c.id,todayS()));
  return `<h2>Visão geral</h2><p class="sub">${DSEM[dow(todayS())]}, ${fmt(todayS())} · ${ymLabel(ym).toLowerCase()}</p>
  <div class="kpis"><div class="kpi"><span>Colaboradores ativos</span><b>${activeColabs().length}</b></div>
  <div class="kpi"><span>Horas de sobreaviso no mês</span><b>${hrs.toLocaleString('pt-BR')}h</b></div>
  <div class="kpi"><span>Dias de J3 no mês</span><b>${j3d}</b></div>
  <div class="kpi ${alerts.some(a=>a.lvl==='err')?'r':alerts.length?'a':''}"><span>Alertas da escala</span><b>${alerts.length}</b></div>
  <div class="kpi ${conf.length?'r':''}"><span>Conflitos de férias (12 meses)</span><b>${conf.length}</b></div>
  <div class="kpi"><span>De férias hoje</span><b>${emFerias.length}</b></div></div>
  <div class="card"><h3>Plantonistas do próximo fim de semana · ${diasLabel(nb.dias)}${nb.dias.some(isHol)?' <span class="badge b-wa">feriado emendado</span>':''} <button class="btn sm" style="float:right" data-act="copyWk" data-k="${nb.key}">Copiar mensagem</button></h3><div class="tw"><table class="t"><thead><tr><th>Área</th><th>J3 (08h–17h)</th><th>Sobreaviso</th></tr></thead><tbody>${rows}</tbody></table></div></div>
  <div class="cols">
   <div class="card"><h3>Alertas da escala · ${ymLabel(ym)}</h3>${alerts.length?alertHtml(alerts.slice(0,12))+(alerts.length>12?`<p class="hint">+${alerts.length-12} alertas na aba Escala</p>`:''):'<div class="alert ok">✅ Escala dentro das regras.</div>'}<button class="btn sm" data-act="tab" data-v="escala">Abrir escala</button></div>
   <div class="card"><h3>Conflitos de férias</h3>${conf.length?`<div class="tw"><table class="t"><thead><tr><th>Período</th><th>Grupo</th><th>Quem</th></tr></thead><tbody>${conf.map(x=>`<tr><td><span class="badge b-er">${fmtS(x.de)}${x.ate!==x.de?' – '+fmtS(x.ate):''}/${x.de.slice(2,4)}</span></td><td class="small">${esc(x.grupo)}</td><td class="small">${esc(x.nomes)}</td></tr>`).join('')}</tbody></table></div>`:'<div class="alert ok">✅ Nenhuma sobreposição nos próximos 12 meses.</div>'}<button class="btn sm" data-act="tab" data-v="ferias">Abrir férias</button></div>
   <div class="card"><h3>Férias a vencer</h3>${semAdm?`<div class="alert info">ℹ️ <span>${semAdm} colaboradores sem data exata de admissão são controlados por ciclo anual (saldo do ano). Informe a admissão em Cadastros para entrar nesta lista com o prazo legal.</span></div>`:''}${venc.length?`<div class="tw"><table class="t"><thead><tr><th>Colaborador</th><th>Saldo</th><th>Iniciar até</th><th></th></tr></thead><tbody>${venc.map(v=>`<tr><td><b>${esc(v.c.nome)}</b></td><td><span class="badge ${v.p.status==='vencido'?'b-er':'b-wa'}">${v.p.saldo} d</span></td><td class="small">${fmt(v.limite)}</td><td><button class="btn sm" data-act="newFer" data-c="${v.c.id}">Lançar</button></td></tr>`).join('')}</tbody></table></div>`:(semAdm<activeColabs().length?'<div class="alert ok">✅ Nenhum saldo vencendo nos próximos 150 dias.</div>':'')}</div>
  </div>`;
}

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
  const wk=wbl.map(b=>{const lines=aList.map(a=>{const p=blockPeople(a.id,b);if(!p.J3.length&&!p.SA.length)return '';return `<div class="row"><span class="small muted" style="min-width:90px;max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${esc(a.nome)}">${esc(a.nome.split(' - ')[0])}</span><div>${p.J3.map(c=>`<span class="badge b-j3">J3</span> ${esc(short(c.nome))}`).join('<br>')}${p.J3.length&&p.SA.length?'<br>':''}${p.SA.map(x=>`<span class="badge b-sa">${x.h}h</span> ${esc(short(x.c.nome))}`).join('<br>')}</div></div>`;}).join('');
    return `<div class="wkc"><h4><span>${diasLabel(b.dias)}${b.dias.some(isHol)?' <span class="badge b-wa">feriado</span>':''}</span><button class="btn sm" data-act="copyWk" data-k="${b.key}">Copiar</button></h4>${lines||'<span class="muted small">Sem plantonistas lançados</span>'}</div>`;}).join('');
  return `<h2>Escala de plantão</h2><p class="sub">Mesmo formato da planilha: números são horas de sobreaviso no dia. Clique em qualquer célula para lançar, trocar ou marcar acionamento.</p>
  <div class="bar"><div class="mnav"><button class="btn" data-act="ym" data-v="-1">‹</button><b>${ymLabel(ym)}</b><button class="btn" data-act="ym" data-v="1">›</button></div>
  <select data-ui="areaId"><option value="">Todas as áreas</option>${areasSorted().map(x=>`<option value="${x.id}" ${x.id===ui.areaId?'selected':''}>${esc(x.nome)}</option>`).join('')}</select><span class="sp"></span>
  <button class="btn needs-edit" data-act="newSN">+ Sobreaviso em vários dias</button><button class="btn" data-act="copyTsv">Copiar para Excel</button><button class="btn pri needs-edit" data-act="gen">⚙ Gerar escala ${ui.areaId?'da área':'de todas as áreas'}</button></div>
  ${alerts.length?`<div class="card" style="padding:12px 14px"><h3 style="margin-bottom:8px">Alertas (${alerts.filter(a=>a.lvl==='err').length} críticos · ${alerts.filter(a=>a.lvl==='warn').length} atenção · ${alerts.filter(a=>a.lvl==='info').length} info)</h3>${alertHtml(shown)}${alerts.length>6?`<button class="btn sm" data-act="allAl">${ui.allAl?'Mostrar menos':`Ver todos os ${alerts.length}`}</button>`:''}</div>`:'<div class="alert ok">✅ Escala dentro das regras.</div>'}
  <div class="legend"><span><i class="tag t-SA">24</i>Horas de sobreaviso (⚡ acionado)</span><span><i class="tag t-J3">J3</i>Plantão 08h–17h</span><span><i class="tag t-F">FO</i>Folga</span><span><i class="tag t-FE">FE</i>Férias</span><span><i class="tag t-BH">BH</i>Banco de horas</span><span><i class="tag t-FA">FA</i>Folga abonada</span><span><i class="tag t-AT">AT</i>Atestado</span><span><i class="tag t-X">M</i>Outros</span></div>
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
     else if(x==='blkJ3'){b.dias.forEach(dd=>{const vv=getV(cid,dd);if(vv==='J3'||isNum(vv))setV(cid,dd,null);});j3Days(b).forEach(dd=>setV(cid,dd,'J3'));if(a.folgaJ3){[b.folgaAntes,b.folgaDepois].forEach(f=>{if(getV(cid,f)==null)setV(cid,f,'FO');});}done('J3 lançado');}
     else if(x==='blkSA'){b.dias.forEach(dd=>{if(getV(cid,dd)==='J3')setV(cid,dd,null);setV(cid,dd,hoursFor(a,dd));});if(a.folgaSA&&!b.iso&&getV(cid,b.folgaAntes)==null)setV(cid,b.folgaAntes,'FO');done('Sobreaviso lançado');}
     else if(x==='blkDel'){b.dias.forEach(dd=>{const vv=getV(cid,dd);if(vv==='J3'||isNum(vv))setV(cid,dd,null);});[b.folgaAntes,b.folgaDepois].forEach(f=>{if(getV(cid,f)==='FO')setV(cid,f,null);});done('Removido do plantão');}
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
function rHist(){
  const cur=todayS().slice(0,7);const maxYm=Object.keys(state.escala).sort().pop()||cur;const end=maxYm>cur?(maxYm>ymAdd(cur,2)?ymAdd(cur,2):maxYm):cur;
  const allMonths=[...new Set([...Object.keys(state.escala),...Object.values(state.histAgg).flatMap(o=>Object.keys(o))])].sort();
  const n=ui.hn==='all'?Math.max(1,ddiff(allMonths[0]+'-01',end+'-01')/30.4+1|0):+ui.hn;
  const months=Array.from({length:n},(_,i)=>ymAdd(end,i-n+1));
  const metric=ui.hm,lab={sa:'Horas de sobreaviso',j3:'Dias de J3 (plantão físico)',fds:'Plantões (fins de semana/feriados)'}[metric];
  const val=(cid,m)=>{const s=monthStat(cid,m);if(!s)return null;return metric==='fds'?s.fds:s[metric];};
  const last3=[0,1,2].map(i=>ymAdd(cur,-i)),yr=months.filter(m=>m.startsWith(cur.slice(0,4))&&m<=cur);
  const aList=ui.hArea?[area(ui.hArea)]:areasSorted();let body='';let mx=1;
  const rowsBy=aList.map(a=>({a,cs:state.colaboradores.filter(c=>c.areaId===a.id&&(c.ativo!==false||months.some(m=>val(c.id,m)))).sort((x,y)=>cmp(x.ativo===false?1:0,y.ativo===false?1:0)||cmp(x.nome,y.nome))}));
  rowsBy.forEach(({cs})=>cs.forEach(c=>months.forEach(m=>{const v=val(c.id,m);if(v>mx)mx=v;})));
  rowsBy.forEach(({a,cs})=>{if(!cs.length)return;body+=`<tr class="grp"><td class="nm">${esc(a.nome)}</td><td colspan="${months.length+5}"></td></tr>`;
    cs.forEach(c=>{const ln=lastNext(c.id);const vals=months.map(m=>val(c.id,m));const s3=sum(last3.map(m=>val(c.id,m)||0)),sy=sum(yr.map(m=>val(c.id,m)||0));
      body+=`<tr style="${c.ativo===false?'opacity:.55':''}"><td class="nm"><b>${esc(c.nome)}</b>${c.ativo===false?' <small>inativo</small>':''}</td>${vals.map((v,i)=>{const src=monthStat(c.id,months[i])?.src;const al=v?Math.min(.85,.12+v/mx*.73):0;return `<td style="${v?`background:rgba(${metric==='j3'?'173,150,220':'241,255,0'},${al.toFixed(2)});color:#212322;font-weight:${al>.5?700:400}`:''}" title="${ymLabel(months[i])}${src==='agg'?' · aba METODO':''}">${v||''}${src==='agg'&&v?'*':''}</td>`;}).join('')}
      <td class="tot">${s3||''}</td><td class="tot">${sy||''}</td><td class="small">${ln.lJ?fmtS(ln.lJ)+'/'+ln.lJ.slice(2,4):'—'}</td><td class="small">${ln.lS?fmtS(ln.lS)+'/'+ln.lS.slice(2,4):'—'}</td><td class="small">${[ln.nJ&&'J3 '+fmtS(ln.nJ),ln.nS&&'SA '+fmtS(ln.nS)].filter(Boolean).join(' · ')||'—'}</td></tr>`;});});
  return `<h2>Histórico</h2><p class="sub">Consolidado mês a mês a partir da escala (e da aba METODO para 2024). O gerador usa este histórico para decidir quem é o próximo.</p>
  <div class="bar"><select data-ui="hm"><option value="sa" ${metric==='sa'?'selected':''}>Horas de sobreaviso</option><option value="j3" ${metric==='j3'?'selected':''}>Dias de J3</option><option value="fds" ${metric==='fds'?'selected':''}>Plantões (fins de semana)</option></select>
  <select data-ui="hArea"><option value="">Todas as áreas</option>${areasSorted().map(a=>`<option value="${a.id}" ${ui.hArea===a.id?'selected':''}>${esc(a.nome)}</option>`).join('')}</select>
  <select data-ui="hn"><option value="6" ${ui.hn==='6'?'selected':''}>6 meses</option><option value="12" ${ui.hn==='12'?'selected':''}>12 meses</option><option value="24" ${ui.hn==='24'?'selected':''}>24 meses</option><option value="all" ${ui.hn==='all'?'selected':''}>Tudo</option></select><span class="sp"></span><button class="btn" data-act="copyHist">Copiar para Excel</button></div>
  <div class="gridwrap" data-keep="hist"><table class="g hist"><thead><tr><th class="nm">${lab}</th>${months.map(m=>`<th style="min-width:46px">${ymShort(m)}</th>`).join('')}<th>Últ. 3<br>meses</th><th>Ano<br>${cur.slice(0,4)}</th><th>Último<br>J3</th><th>Último<br>SA</th><th style="min-width:110px">Próximo</th></tr></thead><tbody>${body}</tbody></table></div>
  <p class="hint">* valor vindo da aba METODO_ESCALA_TX_CAPITAL (meses sem escala detalhada).</p>`;
}
function histTsv(){const cur=todayS().slice(0,7);const months=Array.from({length:12},(_,i)=>ymAdd(cur,i-11));const m=ui.hm;const L=[['Colaborador','Área',...months.map(ymShort)].join('\t')];
  areasSorted().filter(a=>!ui.hArea||a.id===ui.hArea).forEach(a=>state.colaboradores.filter(c=>c.areaId===a.id).forEach(c=>{const v=months.map(x=>{const s=monthStat(c.id,x);return s?(m==='fds'?s.fds:s[m])||'':'';});if(v.some(Boolean)||c.ativo!==false)L.push([c.nome,a.nome,...v].join('\t'));}));return L.join('\n');}

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
  return `<h2>Painel de férias</h2><p class="sub">Visão gerencial por semana. Técnicos da mesma supervisão de férias ao mesmo tempo, ou supervisores e gerente juntos, aparecem em vermelho. Clique numa linha ou semana para lançar.</p>
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
  if(editId){const f=state.ferias.find(x=>x.id===editId);if(!f)return;Object.assign(t,{cid:f.colabId,per:f.periodo,inicio:f.inicio,dias:f.dias,abono:f.abono||0,obs:f.obs||''});}
  const pickPer=()=>{const c=colab(t.cid);if(!c){t.per=null;return;}const ps=periodos(c);if(t.per&&ps.some(p=>p.key===t.per))return;const p=ps.find(p=>(p.status==='vencido'||p.status==='aberto')&&p.saldo>=5)||ps.find(p=>p.status==='aquisicao'||p.status==='proximo')||ps[ps.length-1];t.per=p?p.key:null;};
  pickPer();
  const nums=()=>({inicio:t.inicio,dias:t.dias===''?0:Math.floor(+t.dias),abono:t.abono===''?0:Math.floor(+t.abono)});
  const preview=()=>{const c=colab(t.cid);if(!c)return '<p class="muted">Selecione um colaborador.</p>';const per=periodos(c).find(p=>p.key===t.per);if(!per)return '<p class="muted">Selecione o período aquisitivo.</p>';
    const n=nums(),v=validarFerias(c,per,n,t.editId);const fim=n.dias>0&&n.inicio?add(n.inicio,n.dias-1):null,ret=fim?nextWork(fim):null;
    const prevUsed=per.direito-(per.saldo+(t.editId?sum(per.fr.filter(f=>f.id===t.editId).map(f=>(+f.dias||0)+(+f.abono||0))):0));
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
    if(c){const ps=periodos(c);
      perHtml=`<h4 style="margin:14px 0 6px;font-size:13px">Períodos aquisitivos ${c.admissao?`<span class="muted small">(admissão ${fmt(c.admissao)})</span>`:'<span class="badge b-wa">admissão não informada — ciclo anual (mais de 1 ano de empresa)</span>'}</h4><div class="tw"><table class="t"><thead><tr><th></th><th>Período</th><th>Gozar até</th><th>Direito</th><th>Gozo</th><th>Venda</th><th>Saldo</th><th>Situação</th></tr></thead><tbody>${ps.map(p=>`<tr class="click ${p.key===t.per?'sel':''}" data-act="per" data-v="${p.key}"><td><input type="radio" ${p.key===t.per?'checked':''} tabindex="-1"></td><td>${p.label?`<b>${p.label}</b> <span class="muted small">${p.uso||'sem gozo lançado'}</span>`:`${fmt(p.ini)} – ${fmt(p.fim)}`}</td><td>${p.concFim?fmt(p.concFim):'—'}</td><td>${p.direito}</td><td>${p.gozo}</td><td>${p.abono}</td><td><b>${p.saldo}</b></td><td><span class="badge ${STATUS[p.status][1]}">${STATUS[p.status][0]}</span></td></tr>`).join('')}</tbody></table></div>`;
      const fs=state.ferias.filter(f=>f.colabId===c.id).sort((a,b)=>cmp(b.inicio||b.periodo||'',a.inicio||a.periodo||''));
      if(fs.length)hist=`<h4 style="margin:16px 0 6px;font-size:13px">Lançamentos de ${esc(first(c.nome))}</h4><div class="tw"><table class="t"><tbody>${fs.map(f=>`<tr ${f.id===t.editId?'class="sel"':''}><td class="small">${perLabel(f.periodo)}${f.obs?' · '+esc(f.obs):''}</td><td>${f.dias>0?`${fmt(f.inicio)} a ${fmt(add(f.inicio,f.dias-1))}`:'—'}</td><td>${f.dias||0} dias${f.abono?` + ${f.abono} vendidos`:''}</td><td style="text-align:right">${f.id===t.editId?'<span class="badge b-fe">editando</span>':`<button class="btn sm" data-act="edit" data-id="${f.id}">Editar</button> <button class="btn sm dan" data-act="delf" data-id="${f.id}">Excluir</button>`}</td></tr>`).join('')}</tbody></table></div>`;}
    return `${mHead(t.editId?'Editar férias':'Lançar férias')}<div class="mb">
    <div class="fg"><label>Colaborador<select id="f_col"><option value="">Selecione…</option>${opts}</select></label></div>${perHtml}
    ${c?`<div class="fg" style="margin-top:14px"><label>Início do gozo<input type="date" id="f_ini" value="${t.inicio||''}"></label><label>Dias de gozo<input type="number" id="f_dias" min="0" max="30" value="${t.dias}" placeholder="ex.: 15"></label><label>Dias vendidos (abono)<input type="number" id="f_ab" min="0" max="10" value="${t.abono}"></label><label>Observação<input id="f_obs" value="${esc(t.obs)}" placeholder="Opcional"></label></div><div id="f_prev">${preview()}</div>${hist}`:''}</div>
    <div class="mf"><span class="hint">Até 3 períodos · um ≥ 14 dias · demais ≥ 5 · venda até 1/3</span><span class="sp"></span><button class="btn" data-act="close">Cancelar</button><button class="btn pri" id="f_save" data-act="save" ${canSave()?'':'disabled'}>${t.editId?'Salvar alterações':'Lançar férias'}</button></div>`;},
   input(){read();const p=$('#f_prev');if(p)p.innerHTML=preview();const b=$('#f_save');if(b)b.disabled=!canSave();},
   change(el){if(el.id==='f_col'){read();t.cid=el.value;t.per=null;t.editId=null;pickPer();drawModal();}else this.input();},
   act(x,el){read();if(x==='close')closeModal();
     else if(x==='per'){t.per=el.dataset.v;drawModal();}
     else if(x==='edit'){const f=state.ferias.find(z=>z.id===el.dataset.id);Object.assign(t,{per:f.periodo,inicio:f.inicio,dias:f.dias,abono:f.abono||0,obs:f.obs||'',editId:f.id});drawModal();}
     else if(x==='delf'){state.ferias=state.ferias.filter(z=>z.id!==el.dataset.id);touch();buildIdx();drawModal();render();toast('Lançamento excluído');}
     else if(x==='save'){if(!canSave())return;const n=nums();const rec={colabId:t.cid,periodo:t.per,inicio:n.dias>0?n.inicio:'',dias:n.dias,abono:n.abono,obs:t.obs};
       if(t.editId)Object.assign(state.ferias.find(z=>z.id===t.editId),rec);else state.ferias.push({id:uid(),...rec});
       const c=colab(t.cid),per=periodos(c).find(p=>p.key===t.per);touch();closeModal();render();toast(`Férias salvas · saldo remanescente: ${per?per.saldo:0} dias`);}}});
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
  return `<h2>Cadastros</h2><p class="sub">Colaboradores, áreas (com o padrão de plantão de cada uma) e supervisões.</p><div class="subtabs">${tabs.map(([k,l])=>`<button class="${ui.sub===k?'on':''}" data-act="sub" data-v="${k}">${l}</button>`).join('')}</div>${html}`;
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
  return `<h2>Configurações</h2><p class="sub">Feriados, backup e regras aplicadas.</p>
  <div class="cols"><div class="card"><h3>Feriados de ${y}</h3><div class="bar"><div class="mnav"><button class="btn sm" data-act="hy" data-v="-1">‹</button><b style="min-width:60px">${y}</b><button class="btn sm" data-act="hy" data-v="1">›</button></div><label class="chk"><input type="checkbox" data-chg="togFac" ${isAdmin()?'':'disabled'} ${state.config.facultativos?'checked':''}> Considerar Carnaval e Corpus Christi</label></div>
   <div class="tw"><table class="t"><tbody>${list.concat(state.config.facultativos?fac:[]).sort((a,b)=>cmp(a[0],b[0])).map(([d,n])=>`<tr><td style="width:120px">${DSEM[dow(d)]} ${fmtS(d)}</td><td>${esc(n)}</td><td class="muted small">nacional</td><td></td></tr>`).join('')}${custom.map(f=>`<tr><td>${DSEM[dow(f.data)]} ${fmtS(f.data)}</td><td>${esc(f.nome)}</td><td><span class="badge b-fe">local</span></td><td><button class="btn sm dan needs-admin" data-act="delHol" data-v="${f.data}">Remover</button></td></tr>`).join('')}</tbody></table></div>
   <div class="bar needs-admin" style="margin-top:12px"><input type="date" id="h_d"><input id="h_n" placeholder="Nome (ex.: Aniversário de SP)" style="flex:1;min-width:160px"><button class="btn" data-act="addHol">Adicionar feriado local</button></div></div>
  <div class="card"><h3>Backup dos dados</h3><p class="hint" style="margin-top:0">Os dados ficam no banco (Supabase), com histórico. O backup em JSON serve como cópia extra.</p>
   <div class="bar"><button class="btn" data-act="exportJson">Copiar backup (JSON)</button><label class="btn needs-admin" style="flex-direction:row;font-size:14px">Importar arquivo…<input type="file" accept=".json,application/json" data-chg="importFile" style="display:none"></label></div>
   <div class="needs-admin"><textarea id="imp" placeholder="…ou cole aqui o conteúdo do backup" style="width:100%;height:80px;font-family:monospace;font-size:12px"></textarea><div class="bar" style="margin-top:8px"><button class="btn" data-act="importPaste">Importar texto colado</button></div></div></div>
  ${ROLE()!=='leitura'?`<div class="card"><h3>Histórico de alterações</h3><p class="hint" style="margin-top:0">Toda alteração fica registrada no banco com usuário, data e o valor anterior.</p>${AUDIT?auditHtml():'<button class="btn" data-act="loadAudit">Carregar últimas alterações</button>'}</div>`:''}
  <div class="card"><h3>Regras aplicadas</h3><ul class="rules small">
   <li><b>Formato</b>: igual à planilha — número na célula = horas de sobreaviso no dia; J3, FO, BH, FA, AT como siglas. Férias vêm do módulo de férias (FE).</li>
   <li><b>Padrão por área</b>: quantidade de J3 e sobreaviso por fim de semana, horas de sábado/domingo/feriado, noites de semana e folgas automáticas.</li>
   <li><b>Feriado emendado</b> (sexta ou segunda) entra no plantão do fim de semana; feriado isolado no meio da semana vira um plantão próprio.</li>
   <li><b>Rodízio</b>: primeiro quem tem menos plantões no mês, depois quem tem menos do mesmo regime, depois quem está há mais tempo sem aquele regime (pelo histórico) e com menos horas nos últimos 90 dias. Evita fins de semana seguidos e nunca escala quem está de férias.</li>
   <li><b>J3</b>: sábado e domingo 08h–17h, FO no dia útil antes e depois. <b>Sobreaviso</b>: FO no dia útil antes; se acionado (⚡), FO no dia útil seguinte.</li>
   <li><b>7 dias</b>: alerta quando passa de 6 dias seguidos trabalhados (sobreaviso de fim de semana conta só se acionado).</li>
   <li><b>Férias (CLT)</b>: até 3 períodos, um ≥ 14 dias, demais ≥ 5; venda até 1/3; não iniciar nos 2 dias antes de feriado/DSR; gozo dentro do período concessivo.</li></ul></div></div>`;
}

/* ================= ações ================= */
const ACT={
  tab(el){ui.tab=el.dataset.v;try{history.replaceState(null,'','#'+ui.tab);}catch(e){}persistUI();render();window.scrollTo(0,0);},
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
  logout:async()=>{if(dirty)await doSave();await sb.auth.signOut();},
  reload:()=>{if(dirty){toast('Aguarde salvar as alterações');return;}reloadData().then(()=>toast('Dados atualizados'));},
  lmode:el=>renderLogin(el.dataset.v),
  loadAudit:async()=>{const{data,error}=await sb.from('audit_log').select('*').order('at',{ascending:false}).limit(200);if(error){toast(error.message);return;}AUDIT=data;render();},
  loadUsers:()=>loadUsers(),
  delUser:el=>{const u=USERS.find(x=>x.id===el.dataset.id);confirmBox('Remover acesso?',`${esc(u.email)} perderá o acesso. A conta de login continua existindo no Supabase, mas sem perfil não consegue ver dados.`,'Remover',async()=>{const{error}=await sb.from('profiles').delete().eq('id',u.id);if(error)return toast(error.message);await loadUsers();},true);}
});
['setRole','setUserSup'].forEach(k=>ACT[k]=async el=>{const id=el.dataset.id,f=k==='setRole'?{role:el.value}:{supervisao_id:el.value||null};const{error}=await sb.from('profiles').update(f).eq('id',id);if(error){toast(error.message);await loadUsers();return;}toast('Acesso atualizado');const u=USERS.find(x=>x.id===id);Object.assign(u,f);if(id===PROFILE.id){Object.assign(PROFILE,f);document.body.className='role-'+PROFILE.role;}render();});
['newColab','editColab','newArea','editArea','delArea','newSup','editSup','delSup','togFac','addHol','delHol','importFile','importPaste'].forEach(k=>{const f=ACT[k];ACT[k]=(el,e)=>{if(!isAdmin()){if(el&&el.type==='checkbox')el.checked=!el.checked;return deny();}return f(el,e);};});
(()=>{const f={cell:ACT.cell,ferCell:ACT.ferCell,editFer:ACT.editFer,delFer:ACT.delFer,newFer:ACT.newFer,newSN:ACT.newSN,gen:ACT.gen};
  ACT.cell=el=>canEditColab(el.dataset.c)?f.cell(el):deny();
  ACT.ferCell=el=>canEditColab(el.dataset.c)?f.ferCell(el):deny();
  ACT.newFer=el=>(el.dataset.c?canEditColab(el.dataset.c):canEditAny())?f.newFer(el):deny();
  ACT.editFer=el=>{const x=state.ferias.find(z=>z.id===el.dataset.id);return x&&canEditColab(x.colabId)?f.editFer(el):deny();};
  ACT.delFer=el=>{const x=state.ferias.find(z=>z.id===el.dataset.id);return x&&canEditColab(x.colabId)?f.delFer(el):deny();};
  ACT.newSN=el=>canEditAny()?f.newSN(el):deny();
  ACT.gen=el=>{const aList=ui.areaId?[area(ui.areaId)]:areasSorted();const ok=isAdmin()||(ROLE()==='supervisor'&&aList.every(a=>escalaveis(a.id).every(c=>canEditColab(c.id))));return ok?f.gen(el):toast(isAdmin()?'':'Para gerar, escolha uma área onde todos os plantonistas são da sua supervisão (ou peça ao administrador).');};
})();
async function loadUsers(){const{data,error}=await sb.from('profiles').select('*').order('created_at');if(error){toast(error.message);return;}USERS=data;render();}
function usersHtml(){
  if(!USERS){loadUsers();return '<p class="muted">Carregando usuários…</p>';}
  return `<div class="alert info">ℹ️ <span>Qualquer pessoa com e-mail <b>@vtal.com</b> pode criar conta e entra como <b>Leitura</b>. Aqui você libera <b>Supervisor</b> (edita escala e férias da supervisão vinculada) ou <b>Administrador</b> (edita tudo e gerencia acessos).</span></div>
  <div class="card" style="padding:0"><div class="tw"><table class="t"><thead><tr><th>Usuário</th><th>E-mail</th><th>Perfil</th><th>Supervisão (para perfil Supervisor)</th><th>Desde</th><th></th></tr></thead><tbody>${USERS.map(u=>`<tr><td><b>${esc(u.nome||'')}</b>${u.id===PROFILE.id?' <span class="badge">você</span>':''}</td><td class="small">${esc(u.email)}</td>
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

/* ================= login ================= */
let LOGIN={mode:'entrar',msg:'',err:''};
function renderLogin(mode,msg,err){if(mode)LOGIN.mode=mode;LOGIN.msg=msg||'';LOGIN.err=err||'';
  const f={entrar:`<form id="fLogin"><label>E-mail V.tal<input type="email" id="l_em" required placeholder="nome.sobrenome@vtal.com" autocomplete="username"></label><label>Senha<input type="password" id="l_pw" required autocomplete="current-password"></label><button class="btn pri" type="submit">Entrar</button></form><div class="lk"><a data-act="lmode" data-v="cadastro">Criar conta</a><a data-act="lmode" data-v="esqueci">Esqueci a senha</a></div>`,
    cadastro:`<form id="fCad"><label>Nome<input id="c_nm" required></label><label>E-mail V.tal<input type="email" id="c_em" required placeholder="nome.sobrenome@vtal.com" autocomplete="username"></label><label>Senha (mín. 8 caracteres)<input type="password" id="c_pw" required minlength="8" autocomplete="new-password"></label><label>Repita a senha<input type="password" id="c_pw2" required minlength="8" autocomplete="new-password"></label><button class="btn pri" type="submit">Criar conta</button><p class="hint">Toda conta nova entra com perfil <b>Leitura</b>. O administrador libera edição quando necessário.</p></form><div class="lk"><a data-act="lmode" data-v="entrar">Já tenho conta</a></div>`,
    esqueci:`<form id="fEsq"><label>E-mail V.tal<input type="email" id="e_em" required></label><button class="btn pri" type="submit">Enviar link para redefinir</button></form><div class="lk"><a data-act="lmode" data-v="entrar">Voltar</a></div>`,
    nova:`<form id="fNova"><label>Nova senha<input type="password" id="n_pw" required minlength="8" autocomplete="new-password"></label><label>Repita a nova senha<input type="password" id="n_pw2" required minlength="8" autocomplete="new-password"></label><button class="btn pri" type="submit">Salvar nova senha</button></form>`}[LOGIN.mode];
  const t={entrar:'Entrar',cadastro:'Criar conta',esqueci:'Redefinir senha',nova:'Nova senha'}[LOGIN.mode];
  $('#root').innerHTML=`<div class="login"><div class="lbox"><div class="lhead"><div class="logo-img"></div><div class="tt"><b>GESTÃO EQUIPE</b><span>PLANTA INTERNA SP</span></div></div><div class="lbody"><h3>${t}</h3>${LOGIN.err?`<div class="alert err">⛔ ${esc(LOGIN.err)}</div>`:''}${LOGIN.msg?`<div class="alert ok">✅ ${esc(LOGIN.msg)}</div>`:''}${f}</div></div><p class="lfoot">Acesso restrito a colaboradores V.tal</p></div>`;}
const vtal=e=>/^[^@\s]+@vtal\.com$/i.test(String(e).trim());
const authErr=m=>/Invalid login/i.test(m)?'E-mail ou senha incorretos.':/Email not confirmed/i.test(m)?'Confirme seu e-mail pelo link que enviamos antes de entrar.':/Database error|vtal/i.test(m)?'Cadastro permitido somente com e-mail @vtal.com.':/already registered/i.test(m)?'Este e-mail já tem conta. Use “Esqueci a senha” se precisar.':m;
document.addEventListener('submit',async e=>{const id=e.target.id;if(!/^f(Login|Cad|Esq|Nova)$/.test(id))return;e.preventDefault();const btn=e.target.querySelector('button[type=submit]');if(btn)btn.disabled=true;
  try{
    if(id==='fLogin'){const em=val('l_em').trim().toLowerCase();if(!vtal(em))return renderLogin(null,'','Use seu e-mail @vtal.com.');const{data,error}=await sb.auth.signInWithPassword({email:em,password:val('l_pw')});if(error)return renderLogin(null,'',authErr(error.message));await afterLogin(data.session);}
    if(id==='fCad'){const em=val('c_em').trim().toLowerCase();if(!vtal(em))return renderLogin(null,'','Cadastro permitido somente com e-mail @vtal.com.');if(val('c_pw')!==val('c_pw2'))return renderLogin(null,'','As senhas não conferem.');
      const{data,error}=await sb.auth.signUp({email:em,password:val('c_pw'),options:{data:{nome:val('c_nm').trim()},emailRedirectTo:location.origin+location.pathname}});if(error)return renderLogin(null,'',authErr(error.message));
      if(data.session)return afterLogin(data.session);renderLogin('entrar','Conta criada! Enviamos um link de confirmação para '+em+'. Depois de confirmar, entre com sua senha.');}
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
