/* P12 V2 — HUD C · APEX LINE (tempo). Precisão competitiva: uma faixa de previsão mostra os próximos
   segundos de pista (curvas por severidade, loop, salto, placas, recarga, borda aberta, setores),
   delta ao vivo contra a melhor volta no mesmo ponto, setores coloridos, intervalos medidos e um
   cluster de instrumentos tabular. Módulos secundários recolhem em cruzeiro (por proximidade da
   próxima curva, sem estado oculto). Marcadores de frenagem/ápice no mundo são opcionais. */
const HUD_C={id:'C',name:'Apex Line',tag:'precisão competitiva · tempo',
 intent:'A estrada à frente vira linha do tempo: a faixa de previsão mostra curvas por severidade, loop, salto, placas e perigos em segundos até a chegada; delta ao vivo, setores e intervalos medidos dizem se você está ganhando tempo. Minimalista, mas com identidade: régua técnica, numerais tabulares, marcadores na pista.',
 params:[HPG('Geral','scale','Tamanho do HUD',.5,2,.01,1,'×','multiplica todos os módulos; os tamanhos por módulo se somam a ele'),HPG('Geral','opacity','Opacidade',.4,1,.01,1),HPG('Geral','safeArea','Margem de segurança',0,8,.1,3,'%'),
  SIZE('sizeStrip','Faixa de previsão'),SIZE('sizePos','Posição e intervalos'),SIZE('sizeTiming','Tempo, delta e setores'),SIZE('sizeCluster','Velocidade, escudo e impulsos'),SIZE('sizeRadar','Radar'),SIZE('sizeRival','Módulo rival'),SIZE('sizeAlerts','Alertas, largada e chegada'),
  ...TEXT_PARAMS(),...STYLE_PARAMS(true),
  HPG('Previsão e contexto','forecastSeconds','Janela da previsão (tempo)',2,12,.1,7,'s'),HPG('Previsão e contexto','forecastRange','Alcance máximo da previsão',800,4000,50,2400,'m','janela em distância; também limita o modo tempo'),
  HPG('Previsão e contexto','stripWidth','Largura da faixa de previsão',.35,.9,.01,.5,'× tela'),HPG('Previsão e contexto','rivalWindow','Janela do módulo rival',.3,3,.05,1,'s'),HPG('Previsão e contexto','dimLevel','Opacidade em cruzeiro',.15,.9,.01,.4)],
 colors:hudColorDefaults(),
 toggles:{showStrip:true,showPos:true,showTiming:true,showCluster:true,radar:true,showRival:true,showAlerts:true,autoHide:true,trackMarkers:true},selects:{deltaRef:['best','last'],forecastMode:['time','distance'],font:['condensed','wide','mono']},
 layout(w,h,cfg){const U=hudUnit(w,h,cfg.scale),u=U.u,sb=safeBox(w,h,cfg.safeArea),st=u*cfg.sizeStrip,pu=u*cfg.sizePos,tu=u*cfg.sizeTiming,cu=u*cfg.sizeCluster,ru=u*cfg.sizeRadar,au=u*cfg.sizeAlerts;
  const room=U.tall?sb.w:2*Math.min(w/2-(sb.x+290*pu+24*u),(sb.x+sb.w-8*tu-300*tu-24*u)-w/2)-20*st,sw=Math.max(Math.min(.25*w,sb.w-40*u),Math.min(sb.w-40*u,(U.tall?.92:cfg.stripWidth)*w,room)),ls=cfg.lineSpacing,blocksBottom=Math.max(sb.y+40*tu+(2+122*ls)*tu,sb.y+56*pu+(22+41*ls)*pu),sy=U.tall?Math.max(sb.y+190*u,blocksBottom+40*st):sb.y+26*st,strip={x:w/2-sw/2,y:sy,w:sw,h:54*st};
  const alertsY=Math.max(strip.y+strip.h+70*st,U.tall?sb.y+320*u:0);
  if(!U.tall)return {u,tall:false,sb,strip,pos:{x:sb.x+8*pu,y:sb.y+56*pu},timing:{x:sb.x+sb.w-8*tu,y:sb.y+40*tu},cluster:{x:w/2,y:sb.y+sb.h-20*cu,w:Math.min(560*cu,sb.w*.5)},radar:{x:sb.x+90*ru,y:sb.y+sb.h-90*ru,r:78*ru},rival:{x:sb.x+sb.w-8*u,y:h*.5},alerts:{x:w/2,y:alertsY}};
  return {u,tall:true,sb,strip,pos:{x:sb.x+8*pu,y:sb.y+56*pu},timing:{x:sb.x+sb.w-8*tu,y:sb.y+40*tu},cluster:{x:w/2,y:sb.y+sb.h-20*cu,w:Math.min(sb.w*.9,640*cu)},radar:{x:sb.x+80*ru,y:sb.y+sb.h-180*u-80*ru,r:70*ru},rival:{x:sb.x+sb.w-8*u,y:h*.55},alerts:{x:w/2,y:alertsY}};},
 world(A,M,cfg){if(!cfg.trackMarkers)return;const T=M.tele,P=M.st.ships[0];if(T.phase!=='race')return;
  const next=T.forecast.find(f=>f.kind==='corner'&&f.dist>0&&f.data.severity>=2&&f.dist<1500);if(!next)return;
  // ponto de frenagem: primeiro ponto à frente em que o limite de curva cai abaixo da velocidade atual
  let brake=null;for(let d=0;d<next.dist+next.len*.5;d+=8){if(trackVlim(P.s+d)*KMH<T.speed*.985){brake=d;break;}}
  const line=(d,lane0,lane1,col,al,wd)=>{const f=trackFrame(P.s+d),a=vec.madd(vec.madd(f.p,f.R,lane0),f.N,.12),b=vec.madd(vec.madd(f.p,f.R,lane1),f.N,.12),ab=vec.madd(a,f.T,wd),bb=vec.madd(b,f.T,wd);A.quad(a,b,bb,ab,col,al);};
  if(brake!==null&&brake>20){const f=trackFrame(P.s+brake);line(brake,-f.hw+2,f.hw-2,HUDV.gold,.8,1.6);line(brake+4,-f.hw+2,f.hw-2,HUDV.ink,.6,.8);}
  const ap=next.dist+next.len*.5,fa=trackFrame(P.s+ap),lane=-next.data.dir*fa.hw*.62;
  for(let k=0;k<3;k++){const d=ap-12+k*8,f=trackFrame(P.s+d),c=vec.madd(vec.madd(f.p,f.R,lane),f.N,.14),side=next.data.dir>0?-1:1;
   A.quad(vec.madd(c,f.R,side*2.6),vec.madd(c,f.T,2.4),vec.madd(c,f.R,-side*2.6),vec.madd(c,f.T,.4),HUDV.cyan,.75);}},
 draw(g,w,h,M,cfg,MET){hudBegin(MET);try{this._draw(g,w,h,M,cfg,MET);}finally{hudBegin(null);hudTrack(null);}},
 _draw(g,w,h,M,cfg,MET){const G0=g,vis=hudVis(g);const L=this.layout(w,h,cfg),u=L.u,T=M.tele,t=M.t,ls=cfg.lineSpacing;
  // unidades por módulo (sliders de tamanho)
  const st=u*cfg.sizeStrip,pu=u*cfg.sizePos,tu=u*cfg.sizeTiming,cu=u*cfg.sizeCluster,ru=u*cfg.sizeRadar,rv=u*cfg.sizeRival,au=u*cfg.sizeAlerts;
  hudTrack(cfg.letterSpacing);g.save();g.globalAlpha=cfg.opacity;
  const v=Math.max(30,T.speed/KMH),inCorner=T.forecast.find(f=>f.kind==='corner'&&f.dist<=0&&f.dist+f.len>0),nextCorner=T.forecast.find(f=>f.kind==='corner'&&f.dist>0),tCorner=inCorner?0:nextCorner?nextCorner.dist/v:99;
  const busy=M.msgs.length>0||T.nearby.some(o=>o.threat||o.dist<25)||T.drift.on||T.crit||T.phase!=='race';
  const dim=cfg.autoHide&&!busy?lerp(1,cfg.dimLevel,clamp((tCorner-3)/2,0,1)):1;
  const box=(x,y,bw,bh,al=.78)=>{g.fillStyle=hudBg(al);g.fillRect(x,y,bw,bh);};
  // medidas do bloco de posição (usadas também para evitar colisão com os rótulos da faixa)
  const PM=(()=>{const P=L.pos,big=56*pu,rk='P'+ordinal(T.rank),gaps=[T.ahead?T.ahead.gap:NaN,T.behind?T.behind.gap:NaN];
   const lblW=Math.max(stextW(g,'À FRENTE',14*pu,700),stextW(g,'ATRÁS',14*pu,700)),gapW=Math.max(stextW(g,'00.00 S',16*pu,700),...gaps.map(x=>Number.isFinite(x)?stextW(g,x.toFixed(2)+' S',16*pu,700):0));
   const c1=P.x+lblW+14*pu,c2=c1+gapW+14*pu,right=Math.max(c2+stextW(g,'WWW',14*pu)+8*pu,P.x+vtextWidth(rk,big)+10*pu+stextW(g,'/'+T.total,18*pu)+8*pu);
   const r1=P.y+12*pu+19*pu*ls,r2=r1+22*pu*ls;return {big,rk,c1,c2,right,r1,r2,bottom:r2+10*pu};})();
  // largura do bloco de tempo (medida antes, para a faixa de previsão não invadi-lo)
  const TM=(()=>{const d=T.delta,dtxt='Δ '+(d===null?'— sem referência':fmtGap(d))+(d!==null?'  vs '+(cfg.deltaRef==='best'?'melhor':'última'):''),lapTxt='VOLTA '+T.lap+'/'+T.laps;
   const secW=stextW(g,'S1 000.00',14*tu)+10*tu,W2=Math.max(300*tu,stextW(g,'Δ +00.00  vs melhor',17*tu,800)+24*tu,stextW(g,lapTxt,14*tu,800)+vtextWidth('0:00.000',34*tu)+48*tu,3*secW+36*tu,stextW(g,'ÚLT '+fmtLap(T.lastLap),14*tu)+stextW(g,'MELHOR '+fmtLap(T.bestLap),14*tu)+44*tu);return {dtxt,lapTxt,W2};})();
  g=vis(cfg.showStrip);
  // ---------- faixa de previsão
  {const S0=L.strip,hw=L.tall?S0.w/2:Math.max(.12*w,Math.min(S0.w/2,L.timing.x-TM.W2-26*st-w/2,w/2-PM.right-26*st)),S={...S0,x:w/2-hw,w:2*hw},timeMode=cfg.forecastMode==='time',span=timeMode?Math.min(cfg.forecastSeconds,cfg.forecastRange/v):cfg.forecastRange,X=d=>S.x+clamp((timeMode?d/v:d)/span,0,1)*S.w,rowY=S.y+S.h*.5;
   const yTick=S.y+S.h+14*st,yDetail=yTick+20*st*ls;
   box(S.x-10*st,S.y-8*st,S.w+20*st,S.h+16*st);g.fillStyle=rgbaOf(HUDC.paper,.06);g.fillRect(S.x,rowY-1*st,S.w,2*st);
   for(let k=0;k<=span;k+=timeMode?1:500){const x=S.x+k/span*S.w;g.fillStyle=rgbaOf(HUDC.paper,.35);g.fillRect(x,S.y+S.h-8*st,1.5*st,8*st);if(k>0&&k<span)stext(g,timeMode?k+'s':(k/1000).toFixed(1)+'km',x,yTick,14*st,{align:'center',color:HUDC.mute,ink:false});}
   const range=timeMode?span*v:span,Dof=x=>timeMode?(x-S.x)/S.w*span*v:(x-S.x)/S.w*span;
   // traço de curvatura (esquerda para cima) com preenchimento por severidade + perfil de altitude
   const N=Math.max(40,Math.round(S.w/(4*st))),half=S.h/2-5*st,P=M.st.ships[0],y0=trackFrame(P.s).p[1];let prevX=null,prevY=null,prevE=null;
   g.save();g.beginPath();g.rect(S.x,S.y-4*st,S.w,S.h+8*st);g.clip();
   for(let i=0;i<=N;i++){const x=S.x+i/N*S.w,d=Dof(x),k=trackCurv(P.s+d),ak=Math.abs(k),yk=rowY-clamp(k*430,-1,1)*half;
    const col=ak>1/480?HUDC.pink:ak>1/720?HUDC.gold:ak>1/1400?HUDC.paper:null;if(col){g.globalAlpha=cfg.opacity*.42;g.fillStyle=col;g.fillRect(x,Math.min(rowY,yk),S.w/N+.5,Math.abs(yk-rowY));g.globalAlpha=cfg.opacity;}
    const e=trackFrame(P.s+d).p[1]-y0,ye=rowY-clamp(e/60,-1,1)*half*.9;
    if(prevX!==null){g.strokeStyle=HUDC.paper;g.lineWidth=2*st;g.beginPath();g.moveTo(prevX,prevY);g.lineTo(x,yk);g.stroke();if(i%2===0){g.strokeStyle=HUDC.cyan;g.globalAlpha=cfg.opacity*.95;g.lineWidth=2*st;g.beginPath();g.moveTo(prevX,prevE);g.lineTo(x,ye);g.stroke();g.globalAlpha=cfg.opacity;}}
    prevX=x;prevY=yk;prevE=ye;}
   g.restore();
   for(const f of T.forecast){if(f.dist>range)continue;const x0=X(Math.max(0,f.dist)),x1=X(Math.max(0,f.dist+f.len));
    if(f.kind==='corner'){const sev=f.data.severity,col=sev>=4?HUDC.pink:sev===3?HUDC.gold:HUDC.paper,xa=X(Math.max(0,f.dist+f.len/2));if(sev>=2&&xa>S.x+8*st&&xa<S.x+S.w-8*st){box(xa-10*st,S.y-22*st,20*st,16*st,.9);g.strokeStyle=col;g.lineWidth=1.5*st;g.strokeRect(xa-10*st,S.y-22*st,20*st,16*st);stext(g,String(sev),xa,S.y-9*st,14*st,{align:'center',color:col,ink:false,weight:800});}}
    else if(f.kind==='loop'){g.fillStyle=HUDC.cyan;g.globalAlpha=cfg.opacity*.25;g.fillRect(x0,S.y,Math.max(3*st,x1-x0),S.h);g.globalAlpha=cfg.opacity;featureIcon(g,'loop',Math.max(S.x+10*st,x0+10*st),S.y-14*st,16*st,{},HUDC.cyan);}
    else if(f.kind==='jump'){g.fillStyle=HUDC.violet;g.globalAlpha=cfg.opacity*.25;g.fillRect(x0,S.y,Math.max(3*st,x1-x0),S.h);g.globalAlpha=cfg.opacity;featureIcon(g,'jump',Math.max(S.x+10*st,x0+10*st),S.y-14*st,16*st,{},HUDC.violet);}
    else if(f.kind==='dash'){featureIcon(g,'dash',x0+6*st,S.y+S.h-8*st,12*st,{},HUDC.gold);}
    else if(f.kind==='recharge'){g.fillStyle=HUDC.cyan;g.globalAlpha=cfg.opacity*.45;g.fillRect(x0,S.y+S.h-4*st,Math.max(3*st,x1-x0),4*st);g.globalAlpha=cfg.opacity;featureIcon(g,'recharge',Math.max(S.x+8*st,x0+8*st),S.y-14*st,12*st,{},HUDC.cyan);}
    else if(f.kind==='edge'){for(let x=Math.max(S.x,x0);x<Math.min(S.x+S.w,x1);x+=12*st)poly(g,[[x,S.y],[x+6*st,S.y],[x+2*st,S.y+6*st],[x-4*st,S.y+6*st]],HUDC.gold);}
    else if(f.kind==='sector'||f.kind==='finish'){g.fillStyle=f.kind==='finish'?HUDC.gold:HUDC.paper;g.fillRect(x0,S.y,2*st,S.h);stext(g,f.kind==='finish'?'CHEGADA':'S'+f.data.index,x0+4*st,S.y+S.h-4*st,14*st,{color:f.kind==='finish'?HUDC.gold:HUDC.mute,ink:false,weight:700});}}
   // legendas à esquerda da faixa, só quando não encostam no bloco de posição
   const lgW=Math.max(stextW(g,'CURVA E▲ D▼',14*st),stextW(g,'ALTITUDE',14*st));
   if(!L.tall&&S.x-16*st-lgW>PM.right+12*u){stext(g,'CURVA E▲ D▼',S.x-16*st,rowY-half+10*st,14*st,{align:'right',color:HUDC.paper,ink:false});stext(g,'ALTITUDE',S.x-16*st,rowY+half,14*st,{align:'right',color:HUDC.cyan,ink:false});}
   g.fillStyle=HUDC.cyan;g.fillRect(S.x-2*st,S.y-6*st,3*st,S.h+12*st);
   let stripBottom=S.y+S.h+8*st+(timeMode?14*st:14*st);
   const focus=inCorner||nextCorner;if(focus&&focus.dist<range){const c=focus.data,adv=c.vApex,over=T.speed-adv,inside=focus===inCorner;
    const txt=(c.dir>0?'◀ ':'▶ ')+c.name.toUpperCase()+'  ·  SEV '+c.severity+'  ·  '+(inside?'NA CURVA · SAÍDA EM '+Math.round(focus.dist+focus.len)+' M':Math.round(focus.dist)+' M  ·  '+(focus.dist/v).toFixed(1)+' S');
    const apx=adv>1450?'SEM LIMITE DE CURVA':'ÁPICE '+Math.round(adv)+' KM/H',fs=15*st,wl=stextW(g,txt,fs,700),wr=stextW(g,apx,fs,700),two=wl+wr+24*st>S.w,yAp=two?yDetail+20*st*ls:yDetail;
    stext(g,txt,S.x,yDetail,fs,{color:c.severity>=4?HUDC.pink:HUDC.paper,weight:700});
    stext(g,apx,two?S.x:S.x+S.w,yAp,fs,{align:two?'left':'right',color:over>40?HUDC.gold:HUDC.cyan,weight:700});noteText(MET,'forecastDetail',fs,S.x,yDetail,S.w);stripBottom=yAp+5*st;}
   noteBox(MET,'strip',S.x-10*st,S.y-8*st,S.w+20*st,Math.max(stripBottom,yDetail+5*st)-(S.y-8*st));}
  g=vis(cfg.showPos);
  // ---------- posição e intervalos
  {const P=L.pos;g.save();g.globalAlpha*=dim<1?lerp(1,dim,.5):1;vtext(g,PM.rk,P.x,P.y,PM.big,{color:T.rank<=3?HUDC.gold:HUDC.paper,skew:0,inkW:.8});stext(g,'/'+T.total,P.x+vtextWidth(PM.rk,PM.big)+10*pu,P.y,18*pu,{color:HUDC.mute});
   const row=(lbl,gp,code,y,col)=>{stext(g,lbl,P.x,y,14*pu,{color:HUDC.mute,weight:700,ink:false});stext(g,Number.isFinite(gp)?gp.toFixed(2)+' S':'—',PM.c1,y,16*pu,{color:col,weight:700});stext(g,code||'',PM.c2,y,14*pu,{color:HUDC.mute,ink:false});};
   g.globalAlpha=cfg.opacity*dim;box(P.x-8*pu,P.y+12*pu,PM.right-P.x+8*pu,PM.bottom-(P.y+12*pu),.6);row('À FRENTE',T.ahead?T.ahead.gap:NaN,T.ahead&&T.ahead.code,PM.r1,HUDC.paper);row('ATRÁS',T.behind?T.behind.gap:NaN,T.behind&&T.behind.code,PM.r2,HUDC.paper);
   g.restore();noteText(MET,'position',PM.big,P.x,P.y,0);noteText(MET,'interval',16*pu,P.x,PM.r1,0);noteBox(MET,'pos',P.x-8*pu,P.y-PM.big,PM.right-P.x+8*pu,PM.bottom-(P.y-PM.big));}
  g=vis(cfg.showTiming);
  // ---------- tempo de volta, delta e setores (em fluxo vertical; largura pelo conteúdo)
  {const Tm=L.timing,x=Tm.x,y=Tm.y,top=y-28*tu,yLbl=top+20*tu,yTime=yLbl+38*tu*ls,yDelta=yTime+26*tu*ls,yBar=yDelta+14*tu*ls,ySec=yBar+26*tu*ls,yLast=ySec+18*tu*ls,bot=yLast+10*tu;
   const d=T.delta,{dtxt,lapTxt,W2}=TM;
   box(x-W2,top,W2,bot-top,.66);
   stext(g,lapTxt,x-W2+12*tu,yLbl,14*tu,{color:T.lap===T.laps?HUDC.pink:HUDC.cyan,weight:800,ink:false});
   vtext(g,fmtLap(T.lapTime),x-12*tu,yTime,34*tu,{align:'right',color:HUDC.paper,skew:0,inkW:.7});
   const dcol=d===null?HUDC.mute:d<0?HUDC.cyan:HUDC.pink;stext(g,dtxt,x-12*tu,yDelta,17*tu,{align:'right',color:dcol,weight:800});
   const sw=(W2-36*tu)/3;for(let i=0;i<3;i++){const sx=x-W2+12*tu+i*(sw+6*tu),cur=i===T.sector&&T.phase==='race',tm=T.sectors[i]!==null?T.sectors[i]:null,last=T.lastSectors[i],best=T.bestSectors[i];
    let col=mixHex(HUDC.ink,HUDC.mute,.3);if(tm!==null){col=best!==null&&Math.abs(tm-best)<1e-6&&last!==null?HUDC.violet:last!==null&&tm<last?HUDC.cyan:last===null?HUDC.paper:HUDC.gold;}
    g.fillStyle=col;g.fillRect(sx,yBar,sw,10*tu);if(cur){const prog=clamp(wrap(M.st.ships[0].s,TRACK.L)/(TRACK.L/3)-i,0,1);g.fillStyle=HUDC.paper;g.globalAlpha=cfg.opacity*.5;g.fillRect(sx,yBar,sw*prog,10*tu);g.globalAlpha=cfg.opacity;}
    stext(g,'S'+(i+1)+' '+(tm!==null?tm.toFixed(2):cur?'···':last!==null?last.toFixed(2):'—'),sx,ySec,14*tu,{color:tm!==null?HUDC.paper:HUDC.mute,ink:false});}
   g.save();g.globalAlpha=cfg.opacity*dim;stext(g,'ÚLT '+fmtLap(T.lastLap),x-W2+12*tu,yLast,14*tu,{color:HUDC.mute,ink:false});stext(g,'MELHOR '+fmtLap(T.bestLap),x-12*tu,yLast,14*tu,{align:'right',color:HUDC.violet,ink:false});g.restore();
   noteText(MET,'lapTime',34*tu,x,yTime,0);noteText(MET,'delta',17*tu,x,yDelta,0);noteText(MET,'sector',14*tu,x,ySec,0);noteBox(MET,'timing',x-W2,top,W2,bot-top);}
  g=vis(cfg.showCluster);
  // ---------- cluster: velocidade tabular, régua, tendência, escudo e orçamento de impulsos (de baixo para cima)
  {const C=L.cluster,cx=C.x,by=C.y,bw=C.w,x0=cx-bw/2,yShTxt=by+4*cu,shy=yShTxt-28*cu*ls,sy=shy-26*cu*ls,ySpd=sy-30*cu*ls,spd=64*cu;
   vtext(g,fmtSpeed(T.speed).padStart(4,' '),cx+70*cu,ySpd,spd,{align:'right',color:T.boost.active?HUDC.pink:HUDC.paper,skew:0,inkW:.7,track:cfg.letterSpacing+.1});stext(g,'KM/H',cx+80*cu,ySpd-2*cu,14*cu,{color:HUDC.cyan,weight:800});
   const tr=clamp(T.acc/40,-1,1);if(Math.abs(tr)>.08){const ax=cx+82*cu,ay=ySpd-24*cu;poly(g,tr>0?[[ax,ay],[ax+10*cu,ay-12*cu*Math.abs(tr)-4*cu],[ax+20*cu,ay]]:[[ax,ay-14*cu],[ax+10*cu,ay-2*cu],[ax+20*cu,ay-14*cu]],tr>0?HUDC.cyan:HUDC.gold);}
   g.fillStyle=hudBg(.75);g.fillRect(x0,sy,bw,12*cu);const fs=clamp(T.speed/1700,0,1);g.fillStyle=T.boost.active?HUDC.pink:HUDC.paper;g.fillRect(x0,sy+2*cu,bw*fs,8*cu);
   for(let k=0;k<=17;k++){const x=x0+bw*k/17;g.fillStyle=k%5===0?HUDC.paper:rgbaOf(HUDC.paper,.4);g.fillRect(x,sy-(k%5===0?7:4)*cu,1.5*cu,(k%5===0?7:4)*cu);if(k%5===0)stext(g,String(k*100),x,sy-10*cu,14*cu,{align:'center',color:HUDC.mute,ink:false});}
   if(T.vlim<1450&&T.phase==='race'){const x=x0+bw*clamp(T.vlim/1700,0,1);g.fillStyle=HUDC.gold;g.fillRect(x-1.5*cu,sy-3*cu,3*cu,18*cu);}
   g.fillStyle=hudBg(.75);g.fillRect(x0,shy,bw,12*cu);const sf=T.shield/100,tf=T.shieldFrom/100;if(tf>sf){g.fillStyle=rgbaOf(HUDC.paper,1-clamp(T.dmgAge/.9,0,1));g.fillRect(x0+bw*sf,shy+2*cu,bw*(tf-sf),8*cu);}
   g.save();if(T.crit)g.globalAlpha*=.55+.45*alarm(t);g.fillStyle=T.crit?HUDC.danger:T.shield<30?HUDC.gold:HUDC.cyan;g.fillRect(x0,shy+2*cu,bw*sf,8*cu);g.restore();
   if(T.boost.unlocked)for(let k=1;k*SIM.BOOST_COST<=100;k++){const x=x0+bw*(SIM.SHIELD_MIN+k*SIM.BOOST_COST)/100;g.fillStyle=HUDC.ink;g.fillRect(x-1*cu,shy,2*cu,12*cu);}
   stext(g,'ESCUDO '+Math.round(T.shield)+'%',x0,yShTxt,14*cu,{color:T.crit?HUDC.danger:HUDC.paper,weight:700,ink:false});stext(g,T.boost.unlocked?'IMPULSOS '+T.boost.count+(T.boost.active?'  ·  ATIVO '+(T.boost.frac*SIM.BOOST_DUR).toFixed(1)+' S':''):'IMPULSO NA VOLTA 2',x0+bw,yShTxt,14*cu,{align:'right',color:T.boost.active?HUDC.pink:HUDC.cyan,weight:700,ink:false});
   let yTop=ySpd-spd-8*cu;
   if(T.drift.on){const dy=yTop-14*cu*ls;stext(g,'DESLIZE '+Math.abs(T.drift.angle).toFixed(1)+'°',cx,dy-8*cu,14*cu,{align:'center',color:HUDC.cyan,weight:800});g.fillStyle=hudBg(.75);g.fillRect(cx-90*cu,dy-2*cu,180*cu,6*cu);g.fillStyle=HUDC.cyan;g.fillRect(cx,dy-2*cu,clamp(T.drift.slip,-1,1)*90*cu,6*cu);g.fillStyle=HUDC.paper;g.fillRect(cx-1,dy-5*cu,2,12*cu);yTop=dy-8*cu-14*cu;}
   if(T.air.on){const ay=yTop-8*cu*ls;stext(g,'NO AR · '+T.air.alt.toFixed(1)+' M',cx,ay,14*cu,{align:'center',color:HUDC.violet,weight:800});yTop=ay-14*cu;}
   noteText(MET,'speed',spd,cx,ySpd,0);noteText(MET,'shield',14*cu,x0,yShTxt,0);noteBox(MET,'cluster',x0,yTop,bw,yShTxt+6*cu-yTop);}
  g=vis(cfg.showRival);
  // ---------- módulo rival (contextual: só dentro da janela; largura pelo conteúdo)
  {const gap=T.rival.gap;if(Number.isFinite(gap)&&Math.abs(gap)<cfg.rivalWindow&&T.phase==='race'){const R=L.rival,a=1-clamp((Math.abs(gap)-cfg.rivalWindow*.8)/(cfg.rivalWindow*.2),0,1);
    const cl=T.rival.closing*KMH*(gap>0?1:-1),l1='RIVAL '+T.rival.code,l2=(gap>0?'À FRENTE +':'ATRÁS -')+Math.abs(gap).toFixed(2)+' S',l3=(cl>0?'APROXIMANDO ':'AFASTANDO ')+Math.abs(cl).toFixed(0)+' KM/H';
    const bw=Math.max(260*rv,Math.max(stextW(g,l1,14*rv,800),stextW(g,l2,18*rv,800),stextW(g,l3,14*rv))+28*rv),top=R.y-34*rv,r1=top+22*rv,r2=r1+22*rv*ls,r3=r2+18*rv*ls,bh=r3+10*rv-top,x=R.x-bw*ease.outCubic(a);
    box(x,top,bw,bh,.8*a);g.fillStyle=HUDC.gold;g.fillRect(x,top,4*rv,bh);stext(g,l1,x+14*rv,r1,14*rv,{color:HUDC.gold,weight:800,ink:false,alpha:a});
    stext(g,l2,x+14*rv,r2,18*rv,{color:HUDC.paper,weight:800,alpha:a});stext(g,l3,x+14*rv,r3,14*rv,{color:cl>0?HUDC.cyan:HUDC.mute,ink:false,alpha:a});noteText(MET,'rival',18*rv,x,r2,0);noteBox(MET,'rival',x,top,bw,bh);}}
  g=G0;
  // ---------- radar mínimo (somente naves, anéis de 50/100/200 m)
  if(cfg.radar){const R=L.radar,rr=R.r,me=M.ships[0].pose;g.save();g.globalAlpha=cfg.opacity*dim;g.beginPath();g.arc(R.x,R.y,rr,0,TAU);g.fillStyle=hudBg(.6);g.fill();for(const k of [.25,.5,1]){g.beginPath();g.arc(R.x,R.y,rr*k,0,TAU);g.strokeStyle=rgbaOf(HUDC.paper,.2);g.lineWidth=1;g.stroke();}
   const sc=rr/200;for(const S of M.ships){if(S.sh.id===0)continue;const [x,y]=relPlanar(me,S.pose.p);if(Math.hypot(x,y)>200)continue;const o=T.nearby.find(o=>o.id===S.sh.id);g.fillStyle=o&&o.threat?HUDC.pink:M.race.statics[S.sh.id].isRival?HUDC.gold:HUDC.paper;g.fillRect(R.x+x*sc-2*ru,R.y-y*sc-2*ru,4*ru,4*ru);}
   poly(g,[[R.x,R.y-7*ru],[R.x+5*ru,R.y+5*ru],[R.x-5*ru,R.y+5*ru]],HUDC.cyan);g.restore();noteBox(MET,'radar',R.x-rr,R.y-rr,2*rr,2*rr);}
  g=vis(cfg.showAlerts);
  // ---------- banner único de alerta (maior prioridade) + largada/chegada
  {const top=M.msgs.filter(o=>!['dash'].includes(o.m.type));let y=L.alerts.y;const atr=cfg.letterSpacing+.02;
   for(const o of top.slice(0,2)){const m=o.m,f=1-ease.inCubic(clamp(o.exit,0,1)),ent=ease.outCubic(clamp(o.age/MOTION.slide,0,1));if(f<=0)continue;
    let txt=MSG[m.type].label,col=m.prio===0?HUDC.danger:m.prio===1?HUDC.cyan:HUDC.paper;
    if(m.type==='countdown'){txt=String(m.data.n);}if(m.type==='go')txt='GO';if(m.type==='position'){const d=m.data.from-m.data.to;if(!d)continue;txt='P'+ordinal(m.data.to)+'  '+(d>0?'+':'-')+Math.abs(d);col=d>0?HUDC.cyan:HUDC.gold;}
    if(m.type==='lap')txt='VOLTA '+m.data.lap+'  '+fmtLap(m.data.time)+(m.data.delta!==null?'  Δ '+fmtGap(m.data.delta):'')+(m.data.best&&m.data.lap>1?'  MELHOR':'');if(m.type==='hitTaken')txt='IMPACTO  -'+Math.round(m.data.dmg);if(m.type==='hitLanded')txt='ACERTO  +'+Math.round(m.data.dmg);
    if(m.type==='edge')txt='BORDA ABERTA  '+Math.max(0,m.data.dist).toFixed(1)+' M';if(m.type==='corner')txt=(m.data.dir>0?'◀ ':'▶ ')+m.data.name.toUpperCase();if(m.type==='threat')txt='ATAQUE '+(m.data.side>0?'▶':'◀');if(m.type==='finish')txt='CHEGADA  P'+ordinal(T.place||T.rank)+'  '+fmtLap(T.finishTime);
    const big=m.type==='countdown'||m.type==='go';
    if(big){const n=m.type==='go'?3:3-m.data.n+1,bx=w/2-125*au,by2=h*.36;for(let i=0;i<3;i++){g.fillStyle=i<n?(m.type==='go'?HUDC.cyan:HUDC.danger):hudBg(.8);g.fillRect(bx+i*90*au,by2,70*au,24*au);g.strokeStyle=HUDC.paper;g.lineWidth=2*au;g.strokeRect(bx+i*90*au,by2,70*au,24*au);}vtext(g,txt,w/2,by2+24*au+(14+72*ls)*au,72*au,{align:'center',color:m.type==='go'?HUDC.cyan:HUDC.paper,skew:0,alpha:f});noteText(MET,'countdown',72*au,w/2,by2,0);continue;}
    const size=(m.prio===0?26:21)*au,tw=vtextWidth(txt,size,atr)+50*au,hh=size+16*au*ls,yy=y+(1-ent)*-10*au;g.save();g.globalAlpha*=f;box(w/2-tw/2,yy,tw,hh,.85);g.fillStyle=col;g.fillRect(w/2-tw/2,yy+hh-3*au,tw*(m.prio===0?1:clamp(1-(o.age/Math.max(.1,m.t1-m.t0)),0,1)),3*au);g.restore();
    vtext(g,txt,w/2,yy+hh/2+size/2,size,{align:'center',color:col,skew:0,alpha:f,inkW:.5,track:atr});noteText(MET,'alert:'+m.type,size,w/2,yy,tw);y+=hh+6*au*ls;}
   const fin=M.msgs.find(o=>o.m.type==='finish');if(fin&&fin.age>.6){const a=clamp((fin.age-.6)/.3,0,1),fw=400*au,x=w/2-fw/2,y0=h*.42,step=22*au*ls,fh=52*au+4*step+30*au;box(x,y0,fw,fh,.85*a);stext(g,'CLASSIFICAÇÃO (CENÁRIO DE TESTE)',w/2,y0+24*au,14*au,{align:'center',color:HUDC.mute,ink:false,alpha:a});
    T.standings.slice(0,5).forEach((id,i)=>{const sd=M.race.statics[id],sh=M.st.ships[id];stext(g,String(i+1).padStart(2,' ')+'   '+(id===0?'VOCÊ':sd.code),x+24*au,y0+52*au+i*step,15*au,{color:id===0?HUDC.cyan:HUDC.paper,ink:false,alpha:a});stext(g,sh.finished?fmtLap(sh.finishT-SIM.GO):'—',x+fw-24*au,y0+52*au+i*step,15*au,{align:'right',color:HUDC.paper,ink:false,alpha:a});});}}
  g=G0;g.restore();hudTrack(null);}
};
