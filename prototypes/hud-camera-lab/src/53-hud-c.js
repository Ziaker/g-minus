/* P12 V2 — HUD C · APEX LINE (tempo). Precisão competitiva: uma faixa de previsão mostra os próximos
   segundos de pista (curvas por severidade, loop, salto, placas, recarga, borda aberta, setores),
   delta ao vivo contra a melhor volta no mesmo ponto, setores coloridos, intervalos medidos e um
   cluster de instrumentos tabular. Módulos secundários recolhem em cruzeiro (por proximidade da
   próxima curva, sem estado oculto). Marcadores de frenagem/ápice no mundo são opcionais. */
const HUD_C={id:'C',name:'Apex Line',tag:'precisão competitiva · tempo',
 intent:'A estrada à frente vira linha do tempo: a faixa de previsão mostra curvas por severidade, loop, salto, placas e perigos em segundos até a chegada; delta ao vivo, setores e intervalos medidos dizem se você está ganhando tempo. Minimalista, mas com identidade: régua técnica, numerais tabulares, marcadores na pista.',
 params:[HP('scale','Escala',.7,1.4,.01,1,'×'),HP('opacity','Opacidade',.4,1,.01,1),HP('forecastSeconds','Janela da previsão (tempo)',2,12,.1,7,'s'),HP('forecastRange','Alcance máximo da previsão',800,4000,50,2400,'m','janela em distância; também limita o modo tempo'),
  HP('stripWidth','Largura da faixa de previsão',.35,.9,.01,.5,'× tela'),HP('rivalWindow','Janela do módulo rival',.3,3,.05,1,'s'),HP('dimLevel','Opacidade em cruzeiro',.15,.9,.01,.4),HP('safeArea','Margem de segurança',0,8,.1,3,'%')],
 toggles:{autoHide:true,radar:true,trackMarkers:true},selects:{deltaRef:['best','last'],forecastMode:['time','distance']},
 layout(w,h,cfg){const U=hudUnit(w,h,cfg.scale),u=U.u,sb=safeBox(w,h,cfg.safeArea),sw=Math.min(sb.w-40*u,(U.tall?.92:cfg.stripWidth)*w);
  if(!U.tall)return {u,tall:false,sb,strip:{x:w/2-sw/2,y:sb.y+26*u,w:sw,h:54*u},pos:{x:sb.x+8*u,y:sb.y+56*u},timing:{x:sb.x+sb.w-8*u,y:sb.y+40*u},cluster:{x:w/2,y:sb.y+sb.h-20*u,w:Math.min(560*u,sb.w*.5)},radar:{x:sb.x+90*u,y:sb.y+sb.h-90*u,r:78*u},rival:{x:sb.x+sb.w-8*u,y:h*.5},alerts:{x:w/2,y:sb.y+150*u}};
  return {u,tall:true,sb,strip:{x:w/2-sw/2,y:sb.y+190*u,w:sw,h:54*u},pos:{x:sb.x+8*u,y:sb.y+56*u},timing:{x:sb.x+sb.w-8*u,y:sb.y+40*u},cluster:{x:w/2,y:sb.y+sb.h-20*u,w:sb.w*.9},radar:{x:sb.x+80*u,y:sb.y+sb.h-260*u,r:70*u},rival:{x:sb.x+sb.w-8*u,y:h*.55},alerts:{x:w/2,y:sb.y+320*u}};},
 world(A,M,cfg){if(!cfg.trackMarkers)return;const T=M.tele,P=M.st.ships[0];if(T.phase!=='race')return;
  const next=T.forecast.find(f=>f.kind==='corner'&&f.dist>0&&f.data.severity>=2&&f.dist<1500);if(!next)return;
  // ponto de frenagem: primeiro ponto à frente em que o limite de curva cai abaixo da velocidade atual
  let brake=null;for(let d=0;d<next.dist+next.len*.5;d+=8){if(trackVlim(P.s+d)*KMH<T.speed*.985){brake=d;break;}}
  const line=(d,lane0,lane1,col,al,wd)=>{const f=trackFrame(P.s+d),a=vec.madd(vec.madd(f.p,f.R,lane0),f.N,.12),b=vec.madd(vec.madd(f.p,f.R,lane1),f.N,.12),ab=vec.madd(a,f.T,wd),bb=vec.madd(b,f.T,wd);A.quad(a,b,bb,ab,col,al);};
  if(brake!==null&&brake>20){const f=trackFrame(P.s+brake);line(brake,-f.hw+2,f.hw-2,HUDV.gold,.8,1.6);line(brake+4,-f.hw+2,f.hw-2,HUDV.ink,.6,.8);}
  const ap=next.dist+next.len*.5,fa=trackFrame(P.s+ap),lane=-next.data.dir*fa.hw*.62;
  for(let k=0;k<3;k++){const d=ap-12+k*8,f=trackFrame(P.s+d),c=vec.madd(vec.madd(f.p,f.R,lane),f.N,.14),side=next.data.dir>0?-1:1;
   A.quad(vec.madd(c,f.R,side*2.6),vec.madd(c,f.T,2.4),vec.madd(c,f.R,-side*2.6),vec.madd(c,f.T,.4),HUDV.cyan,.75);}},
 draw(g,w,h,M,cfg,MET){hudBegin(MET);try{this._draw(g,w,h,M,cfg,MET);}finally{hudBegin(null);}},
 _draw(g,w,h,M,cfg,MET){const L=this.layout(w,h,cfg),u=L.u,T=M.tele,t=M.t;g.save();g.globalAlpha=cfg.opacity;
  const v=Math.max(30,T.speed/KMH),inCorner=T.forecast.find(f=>f.kind==='corner'&&f.dist<=0&&f.dist+f.len>0),nextCorner=T.forecast.find(f=>f.kind==='corner'&&f.dist>0),tCorner=inCorner?0:nextCorner?nextCorner.dist/v:99;
  const busy=M.msgs.length>0||T.nearby.some(o=>o.threat||o.dist<25)||T.drift.on||T.crit||T.phase!=='race';
  const dim=cfg.autoHide&&!busy?lerp(1,cfg.dimLevel,clamp((tCorner-3)/2,0,1)):1;
  const box=(x,y,bw,bh,al=.78)=>{g.fillStyle='rgba(7,6,15,'+al+')';g.fillRect(x,y,bw,bh);};
  // ---------- faixa de previsão
  {const S=L.strip,timeMode=cfg.forecastMode==='time',span=timeMode?Math.min(cfg.forecastSeconds,cfg.forecastRange/v):cfg.forecastRange,X=d=>S.x+clamp((timeMode?d/v:d)/span,0,1)*S.w,rowY=S.y+S.h*.5;
   box(S.x-10*u,S.y-8*u,S.w+20*u,S.h+16*u);g.fillStyle='#ffffff10';g.fillRect(S.x,rowY-1*u,S.w,2*u);
   for(let k=0;k<=span;k+=timeMode?1:500){const x=S.x+k/span*S.w;g.fillStyle='rgba(255,243,214,.35)';g.fillRect(x,S.y+S.h-8*u,1.5*u,8*u);if(k>0&&k<span)stext(g,timeMode?k+'s':(k/1000).toFixed(1)+'km',x,S.y+S.h+14*u,14*u,{align:'center',color:HUDC.mute,ink:false});}
   const range=timeMode?span*v:span,Dof=x=>timeMode?(x-S.x)/S.w*span*v:(x-S.x)/S.w*span;
   // traço de curvatura (esquerda para cima) com preenchimento por severidade + perfil de altitude
   const N=Math.max(40,Math.round(S.w/(4*u))),half=S.h/2-5*u,P=M.st.ships[0],y0=trackFrame(P.s).p[1];let prevX=null,prevY=null,prevE=null;
   g.save();g.beginPath();g.rect(S.x,S.y-4*u,S.w,S.h+8*u);g.clip();
   for(let i=0;i<=N;i++){const x=S.x+i/N*S.w,d=Dof(x),k=trackCurv(P.s+d),ak=Math.abs(k),yk=rowY-clamp(k*430,-1,1)*half;
    const col=ak>1/480?HUDC.pink:ak>1/720?HUDC.gold:ak>1/1400?HUDC.paper:null;if(col){g.globalAlpha=cfg.opacity*.42;g.fillStyle=col;g.fillRect(x,Math.min(rowY,yk),S.w/N+.5,Math.abs(yk-rowY));g.globalAlpha=cfg.opacity;}
    const e=trackFrame(P.s+d).p[1]-y0,ye=rowY-clamp(e/60,-1,1)*half*.9;
    if(prevX!==null){g.strokeStyle=HUDC.paper;g.lineWidth=2*u;g.beginPath();g.moveTo(prevX,prevY);g.lineTo(x,yk);g.stroke();if(i%2===0){g.strokeStyle=HUDC.cyan;g.globalAlpha=cfg.opacity*.95;g.lineWidth=2*u;g.beginPath();g.moveTo(prevX,prevE);g.lineTo(x,ye);g.stroke();g.globalAlpha=cfg.opacity;}}
    prevX=x;prevY=yk;prevE=ye;}
   g.restore();
   for(const f of T.forecast){if(f.dist>range)continue;const x0=X(Math.max(0,f.dist)),x1=X(Math.max(0,f.dist+f.len));
    if(f.kind==='corner'){const sev=f.data.severity,col=sev>=4?HUDC.pink:sev===3?HUDC.gold:HUDC.paper,xa=X(Math.max(0,f.dist+f.len/2));if(sev>=2&&xa>S.x+8*u&&xa<S.x+S.w-8*u){box(xa-10*u,S.y-22*u,20*u,16*u,.9);g.strokeStyle=col;g.lineWidth=1.5*u;g.strokeRect(xa-10*u,S.y-22*u,20*u,16*u);stext(g,String(sev),xa,S.y-9*u,14*u,{align:'center',color:col,ink:false,weight:800});}}
    else if(f.kind==='loop'){g.fillStyle=HUDC.cyan;g.globalAlpha=cfg.opacity*.25;g.fillRect(x0,S.y,Math.max(3*u,x1-x0),S.h);g.globalAlpha=cfg.opacity;featureIcon(g,'loop',Math.max(S.x+10*u,x0+10*u),S.y-14*u,16*u,{},HUDC.cyan);}
    else if(f.kind==='jump'){g.fillStyle=HUDC.violet;g.globalAlpha=cfg.opacity*.25;g.fillRect(x0,S.y,Math.max(3*u,x1-x0),S.h);g.globalAlpha=cfg.opacity;featureIcon(g,'jump',Math.max(S.x+10*u,x0+10*u),S.y-14*u,16*u,{},HUDC.violet);}
    else if(f.kind==='dash'){featureIcon(g,'dash',x0+6*u,S.y+S.h-8*u,12*u,{},HUDC.gold);}
    else if(f.kind==='recharge'){g.fillStyle=HUDC.cyan;g.globalAlpha=cfg.opacity*.45;g.fillRect(x0,S.y+S.h-4*u,Math.max(3*u,x1-x0),4*u);g.globalAlpha=cfg.opacity;featureIcon(g,'recharge',Math.max(S.x+8*u,x0+8*u),S.y-14*u,12*u,{},HUDC.cyan);}
    else if(f.kind==='edge'){for(let x=Math.max(S.x,x0);x<Math.min(S.x+S.w,x1);x+=12*u)poly(g,[[x,S.y],[x+6*u,S.y],[x+2*u,S.y+6*u],[x-4*u,S.y+6*u]],HUDC.gold);}
    else if(f.kind==='sector'||f.kind==='finish'){g.fillStyle=f.kind==='finish'?HUDC.gold:HUDC.paper;g.fillRect(x0,S.y,2*u,S.h);stext(g,f.kind==='finish'?'CHEGADA':'S'+f.data.index,x0+4*u,S.y+S.h-4*u,14*u,{color:f.kind==='finish'?HUDC.gold:HUDC.mute,ink:false,weight:700});}}
   if(!L.tall){stext(g,'CURVA E▲ D▼',S.x-16*u,rowY-half+10*u,14*u,{align:'right',color:HUDC.paper,ink:false});stext(g,'ALTITUDE',S.x-16*u,rowY+half,14*u,{align:'right',color:HUDC.cyan,ink:false});}
   g.fillStyle=HUDC.cyan;g.fillRect(S.x-2*u,S.y-6*u,3*u,S.h+12*u);
   const focus=inCorner||nextCorner;if(focus&&focus.dist<range){const c=focus.data,adv=c.vApex,over=T.speed-adv,inside=focus===inCorner;
    const txt=(c.dir>0?'◀ ':'▶ ')+c.name.toUpperCase()+'  ·  SEV '+c.severity+'  ·  '+(inside?'NA CURVA · SAÍDA EM '+Math.round(focus.dist+focus.len)+' M':Math.round(focus.dist)+' M  ·  '+(focus.dist/v).toFixed(1)+' S');
    stext(g,txt,S.x,S.y+S.h+34*u,15*u,{color:c.severity>=4?HUDC.pink:HUDC.paper,weight:700});
    stext(g,adv>1450?'SEM LIMITE DE CURVA':'ÁPICE '+Math.round(adv)+' KM/H',S.x+S.w,S.y+S.h+34*u,15*u,{align:'right',color:over>40?HUDC.gold:HUDC.cyan,weight:700});noteText(MET,'forecastDetail',15*u,S.x,S.y+S.h+34*u,S.w);}
   noteBox(MET,'strip',S.x-10*u,S.y-8*u,S.w+20*u,S.h+50*u);}
  // ---------- posição e intervalos
  {const P=L.pos;g.save();g.globalAlpha*=dim<1?lerp(1,dim,.5):1;vtext(g,'P'+ordinal(T.rank),P.x,P.y,56*u,{color:T.rank<=3?HUDC.gold:HUDC.paper,skew:0,inkW:.8});stext(g,'/'+T.total,P.x+vtextWidth('P'+ordinal(T.rank),56*u,.18)+8*u,P.y,18*u,{color:HUDC.mute});
   const row=(lbl,gp,code,y,col)=>{stext(g,lbl,P.x,y,14*u,{color:HUDC.mute,weight:700,ink:false});stext(g,Number.isFinite(gp)?gp.toFixed(2)+' S':'—',P.x+76*u,y,16*u,{color:col,weight:700});stext(g,code||'',P.x+150*u,y,14*u,{color:HUDC.mute,ink:false});};
   g.globalAlpha=cfg.opacity*dim;box(P.x-6*u,P.y+12*u,262*u,50*u,.6);row('À FRENTE',T.ahead?T.ahead.gap:NaN,T.ahead&&T.ahead.code,P.y+30*u,HUDC.paper);row('ATRÁS',T.behind?T.behind.gap:NaN,T.behind&&T.behind.code,P.y+52*u,HUDC.paper);
   g.restore();noteText(MET,'position',56*u,P.x,P.y,0);noteText(MET,'interval',16*u,P.x,P.y+30*u,0);noteBox(MET,'pos',P.x-6*u,P.y-56*u,250*u,120*u);}
  // ---------- tempo de volta, delta e setores
  {const Tm=L.timing,x=Tm.x,y=Tm.y,W2=300*u;box(x-W2,y-28*u,W2,152*u,.66);
   stext(g,'VOLTA '+T.lap+'/'+T.laps,x-W2+12*u,y-8*u,14*u,{color:T.lap===T.laps?HUDC.pink:HUDC.cyan,weight:800,ink:false});
   vtext(g,fmtLap(T.lapTime),x-12*u,y+30*u,34*u,{align:'right',color:HUDC.paper,skew:0,inkW:.7});
   const d=T.delta,dcol=d===null?HUDC.mute:d<0?HUDC.cyan:HUDC.pink;stext(g,'Δ '+(d===null?'— sem referência':fmtGap(d))+(d!==null?'  vs '+(cfg.deltaRef==='best'?'melhor':'última'):''),x-12*u,y+56*u,17*u,{align:'right',color:dcol,weight:800});
   const sw=(W2-36*u)/3;for(let i=0;i<3;i++){const sx=x-W2+12*u+i*(sw+6*u),sy=y+70*u,cur=i===T.sector&&T.phase==='race',tm=T.sectors[i]!==null?T.sectors[i]:null,last=T.lastSectors[i],best=T.bestSectors[i];
    let col='#2a2640';if(tm!==null){col=best!==null&&Math.abs(tm-best)<1e-6&&last!==null?HUDC.violet:last!==null&&tm<last?HUDC.cyan:last===null?HUDC.paper:HUDC.gold;}
    g.fillStyle=col;g.fillRect(sx,sy,sw,10*u);if(cur){const prog=clamp(wrap(M.st.ships[0].s,TRACK.L)/(TRACK.L/3)-i,0,1);g.fillStyle=HUDC.paper;g.globalAlpha=cfg.opacity*.5;g.fillRect(sx,sy,sw*prog,10*u);g.globalAlpha=cfg.opacity;}
    stext(g,'S'+(i+1)+' '+(tm!==null?tm.toFixed(2):cur?'···':last!==null?last.toFixed(2):'—'),sx,sy+26*u,14*u,{color:tm!==null?HUDC.paper:HUDC.mute,ink:false});}
   g.save();g.globalAlpha=cfg.opacity*dim;stext(g,'ÚLT '+fmtLap(T.lastLap),x-W2+12*u,y+114*u,14*u,{color:HUDC.mute,ink:false});stext(g,'MELHOR '+fmtLap(T.bestLap),x-12*u,y+114*u,14*u,{align:'right',color:HUDC.violet,ink:false});g.restore();
   noteText(MET,'lapTime',34*u,x,y+30*u,0);noteText(MET,'delta',17*u,x,y+56*u,0);noteText(MET,'sector',14*u,x,y+96*u,0);noteBox(MET,'timing',x-W2,y-28*u,W2,152*u);}
  // ---------- cluster: velocidade tabular, régua, tendência, escudo e orçamento de impulsos
  {const C=L.cluster,cx=C.x,by=C.y,bw=C.w,x0=cx-bw/2;
   vtext(g,fmtSpeed(T.speed).padStart(4,' '),cx+70*u,by-74*u,64*u,{align:'right',color:T.boost.active?HUDC.pink:HUDC.paper,skew:0,inkW:.7,track:.3});stext(g,'KM/H',cx+80*u,by-76*u,14*u,{color:HUDC.cyan,weight:800});
   const tr=clamp(T.acc/40,-1,1);if(Math.abs(tr)>.08){const ax=cx+82*u,ay=by-98*u;poly(g,tr>0?[[ax,ay],[ax+10*u,ay-12*u*Math.abs(tr)-4*u],[ax+20*u,ay]]:[[ax,ay-14*u],[ax+10*u,ay-2*u+0*u],[ax+20*u,ay-14*u]],tr>0?HUDC.cyan:HUDC.gold);}
   const sy=by-50*u;g.fillStyle='rgba(7,6,15,.75)';g.fillRect(x0,sy,bw,12*u);const fs=clamp(T.speed/1700,0,1);g.fillStyle=T.boost.active?HUDC.pink:HUDC.paper;g.fillRect(x0,sy+2*u,bw*fs,8*u);
   for(let k=0;k<=17;k++){const x=x0+bw*k/17;g.fillStyle=k%5===0?HUDC.paper:'rgba(255,243,214,.4)';g.fillRect(x,sy-(k%5===0?7:4)*u,1.5*u,(k%5===0?7:4)*u);if(k%5===0)stext(g,String(k*100),x,sy-10*u,14*u,{align:'center',color:HUDC.mute,ink:false});}
   if(T.vlim<1450&&T.phase==='race'){const x=x0+bw*clamp(T.vlim/1700,0,1);g.fillStyle=HUDC.gold;g.fillRect(x-1.5*u,sy-3*u,3*u,18*u);}
   const shy=by-24*u;g.fillStyle='rgba(7,6,15,.75)';g.fillRect(x0,shy,bw,12*u);const sf=T.shield/100,tf=T.shieldFrom/100;if(tf>sf){g.fillStyle='rgba(255,243,214,'+(1-clamp(T.dmgAge/.9,0,1))+')';g.fillRect(x0+bw*sf,shy+2*u,bw*(tf-sf),8*u);}
   g.save();if(T.crit)g.globalAlpha*=.55+.45*alarm(t);g.fillStyle=T.crit?HUDC.danger:T.shield<30?HUDC.gold:HUDC.cyan;g.fillRect(x0,shy+2*u,bw*sf,8*u);g.restore();
   if(T.boost.unlocked)for(let k=1;k*SIM.BOOST_COST<=100;k++){const x=x0+bw*(SIM.SHIELD_MIN+k*SIM.BOOST_COST)/100;g.fillStyle=HUDC.ink;g.fillRect(x-1*u,shy,2*u,12*u);}
   stext(g,'ESCUDO '+Math.round(T.shield)+'%',x0,shy+28*u,14*u,{color:T.crit?HUDC.danger:HUDC.paper,weight:700,ink:false});stext(g,T.boost.unlocked?'IMPULSOS '+T.boost.count+(T.boost.active?'  ·  ATIVO '+(T.boost.frac*SIM.BOOST_DUR).toFixed(1)+' S':''):'IMPULSO NA VOLTA 2',x0+bw,shy+28*u,14*u,{align:'right',color:T.boost.active?HUDC.pink:HUDC.cyan,weight:700,ink:false});
   if(T.drift.on){const dy=by-140*u;stext(g,'DESLIZE '+Math.abs(T.drift.angle).toFixed(1)+'°',cx,dy,14*u,{align:'center',color:HUDC.cyan,weight:800});g.fillStyle='rgba(7,6,15,.75)';g.fillRect(cx-90*u,dy+6*u,180*u,6*u);g.fillStyle=HUDC.cyan;g.fillRect(cx,dy+6*u,clamp(T.drift.slip,-1,1)*90*u,6*u);g.fillStyle=HUDC.paper;g.fillRect(cx-1,dy+3*u,2,12*u);}
   if(T.air.on)stext(g,'NO AR · '+T.air.alt.toFixed(1)+' M',cx,by-118*u,14*u,{align:'center',color:HUDC.violet,weight:800});
   noteText(MET,'speed',64*u,cx,by-74*u,0);noteText(MET,'shield',14*u,x0,shy+28*u,0);noteBox(MET,'cluster',x0,by-140*u,bw,150*u);}
  // ---------- módulo rival (contextual: só dentro da janela)
  {const gap=T.rival.gap;if(Number.isFinite(gap)&&Math.abs(gap)<cfg.rivalWindow&&T.phase==='race'){const R=L.rival,a=1-clamp((Math.abs(gap)-cfg.rivalWindow*.8)/(cfg.rivalWindow*.2),0,1),x=R.x-260*u*ease.outCubic(a);
    box(x,R.y-34*u,260*u,72*u,.8*a);g.fillStyle=HUDC.gold;g.fillRect(x,R.y-34*u,4*u,72*u);stext(g,'RIVAL '+T.rival.code,x+14*u,R.y-12*u,14*u,{color:HUDC.gold,weight:800,ink:false,alpha:a});
    stext(g,(gap>0?'À FRENTE +':'ATRÁS -')+Math.abs(gap).toFixed(2)+' S',x+14*u,R.y+10*u,18*u,{color:HUDC.paper,weight:800,alpha:a});const cl=T.rival.closing*KMH*(gap>0?1:-1);stext(g,(cl>0?'APROXIMANDO ':'AFASTANDO ')+Math.abs(cl).toFixed(0)+' KM/H',x+14*u,R.y+28*u,14*u,{color:cl>0?HUDC.cyan:HUDC.mute,ink:false,alpha:a});noteText(MET,'rival',18*u,x,R.y,0);}}
  // ---------- radar mínimo (somente naves, anéis de 50/100/200 m)
  if(cfg.radar){const R=L.radar,rr=R.r,me=M.ships[0].pose;g.save();g.globalAlpha=cfg.opacity*dim;g.beginPath();g.arc(R.x,R.y,rr,0,TAU);g.fillStyle='rgba(7,6,15,.6)';g.fill();for(const k of [.25,.5,1]){g.beginPath();g.arc(R.x,R.y,rr*k,0,TAU);g.strokeStyle='rgba(255,243,214,.2)';g.lineWidth=1;g.stroke();}
   const sc=rr/200;for(const S of M.ships){if(S.sh.id===0)continue;const [x,y]=relPlanar(me,S.pose.p);if(Math.hypot(x,y)>200)continue;const o=T.nearby.find(o=>o.id===S.sh.id);g.fillStyle=o&&o.threat?HUDC.pink:M.race.statics[S.sh.id].isRival?HUDC.gold:HUDC.paper;g.fillRect(R.x+x*sc-2*u,R.y-y*sc-2*u,4*u,4*u);}
   poly(g,[[R.x,R.y-7*u],[R.x+5*u,R.y+5*u],[R.x-5*u,R.y+5*u]],HUDC.cyan);g.restore();noteBox(MET,'radar',R.x-rr,R.y-rr,2*rr,2*rr);}
  // ---------- banner único de alerta (maior prioridade) + largada/chegada
  {const top=M.msgs.filter(o=>!['dash'].includes(o.m.type));let y=L.alerts.y;
   for(const o of top.slice(0,2)){const m=o.m,f=1-ease.inCubic(clamp(o.exit,0,1)),ent=ease.outCubic(clamp(o.age/MOTION.slide,0,1));if(f<=0)continue;
    let txt=MSG[m.type].label,col=m.prio===0?HUDC.danger:m.prio===1?HUDC.cyan:HUDC.paper;
    if(m.type==='countdown'){txt=String(m.data.n);}if(m.type==='go')txt='GO';if(m.type==='position'){const d=m.data.from-m.data.to;if(!d)continue;txt='P'+ordinal(m.data.to)+'  '+(d>0?'+':'-')+Math.abs(d);col=d>0?HUDC.cyan:HUDC.gold;}
    if(m.type==='lap')txt='VOLTA '+m.data.lap+'  '+fmtLap(m.data.time)+(m.data.delta!==null?'  Δ '+fmtGap(m.data.delta):'')+(m.data.best&&m.data.lap>1?'  MELHOR':'');if(m.type==='hitTaken')txt='IMPACTO  -'+Math.round(m.data.dmg);if(m.type==='hitLanded')txt='ACERTO  +'+Math.round(m.data.dmg);
    if(m.type==='edge')txt='BORDA ABERTA  '+Math.max(0,m.data.dist).toFixed(1)+' M';if(m.type==='corner')txt=(m.data.dir>0?'◀ ':'▶ ')+m.data.name.toUpperCase();if(m.type==='threat')txt='ATAQUE '+(m.data.side>0?'▶':'◀');if(m.type==='finish')txt='CHEGADA  P'+ordinal(T.place||T.rank)+'  '+fmtLap(T.finishTime);
    const big=m.type==='countdown'||m.type==='go';
    if(big){const n=m.type==='go'?3:3-m.data.n+1,bx=w/2-130*u,by2=h*.36;for(let i=0;i<3;i++){g.fillStyle=i<n?(m.type==='go'?HUDC.cyan:HUDC.danger):'rgba(7,6,15,.8)';g.fillRect(bx+i*90*u,by2,70*u,24*u);g.strokeStyle=HUDC.paper;g.lineWidth=2*u;g.strokeRect(bx+i*90*u,by2,70*u,24*u);}vtext(g,txt,w/2,by2+110*u,72*u,{align:'center',color:m.type==='go'?HUDC.cyan:HUDC.paper,skew:0,alpha:f});noteText(MET,'countdown',72*u,w/2,by2,0);continue;}
    const size=(m.prio===0?26:21)*u,tw=vtextWidth(txt,size,.22)+50*u,hh=size+16*u,yy=y+(1-ent)*-10*u;g.save();g.globalAlpha*=f;box(w/2-tw/2,yy,tw,hh,.85);g.fillStyle=col;g.fillRect(w/2-tw/2,yy+hh-3*u,tw*(m.prio===0?1:clamp(1-(o.age/Math.max(.1,m.t1-m.t0)),0,1)),3*u);g.restore();
    vtext(g,txt,w/2,yy+hh/2+size/2,size,{align:'center',color:col,skew:0,alpha:f,inkW:.5,track:.22});noteText(MET,'alert:'+m.type,size,w/2,yy,tw);y+=hh+6*u;}
   const fin=M.msgs.find(o=>o.m.type==='finish');if(fin&&fin.age>.6){const a=clamp((fin.age-.6)/.3,0,1),x=w/2-200*u,y0=h*.42;box(x,y0,400*u,170*u,.85*a);stext(g,'CLASSIFICAÇÃO (CENÁRIO DE TESTE)',w/2,y0+24*u,14*u,{align:'center',color:HUDC.mute,ink:false,alpha:a});
    T.standings.slice(0,5).forEach((id,i)=>{const sd=M.race.statics[id],sh=M.st.ships[id];stext(g,String(i+1).padStart(2,' ')+'   '+(id===0?'VOCÊ':sd.code),x+24*u,y0+52*u+i*22*u,15*u,{color:id===0?HUDC.cyan:HUDC.paper,ink:false,alpha:a});stext(g,sh.finished?fmtLap(sh.finishT-SIM.GO):'—',x+376*u,y0+52*u+i*22*u,15*u,{align:'right',color:HUDC.paper,ink:false,alpha:a});});}}
  g.restore();}
};
