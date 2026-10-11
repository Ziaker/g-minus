/* P12 V2 — HUD A · FLUX RUSH (emoção). Linguagem de impressão/mangá cinética: numerais vetoriais
   gigantes com tinta e desalinhamento ciano/rosa proporcional à aceleração, lâmina de velocidade,
   tanque de energia que estilhaça, carimbos e linhas de foco. Poucos módulos, muito grandes;
   o centro da imagem (nave e pista) fica livre. */
const HUD_A={id:'A',name:'Flux Rush',tag:'arcade maximalista · emoção',
 intent:'Velocidade como espetáculo gráfico: numerais com tinta e desalinhamento de impressão que reagem à aceleração, lâmina de velocidade, energia em células que estilhaçam, carimbos de posição e faixas diagonais de volta. Pouca informação simultânea, muito legível, centro livre.',
 params:[HPG('Geral','scale','Tamanho do HUD',.5,2,.01,1,'×','multiplica todos os módulos; os tamanhos por módulo se somam a ele'),HPG('Geral','opacity','Opacidade',.4,1,.01,1),HPG('Geral','safeArea','Margem de segurança',0,8,.1,3,'%'),
  SIZE('sizeSpeed','Velocímetro e lâmina'),SIZE('sizePosition','Posição'),SIZE('sizeEnergy','Painel de energia e volta'),SIZE('sizeMap','Minimapa'),SIZE('sizeAlerts','Adesivos de alerta'),SIZE('sizeBanner','Faixas de volta, largada e chegada'),SIZE('sizeCombat','Marcas de combate e rival'),
  ...TEXT_PARAMS(),...STYLE_PARAMS(false),
  HPG('Estilo e movimento','kinetic','Intensidade cinética',0,1.5,.01,1,'×','amplitude de socos, deslizes e estilhaços'),HPG('Estilo e movimento','inkWeight','Peso da tinta',0,2,.01,1,'×'),
  HPG('Estilo e movimento','misregistration','Desalinhamento de impressão',0,2,.01,1,'×','deslocamento ciano/rosa por aceleração e impulso'),HPG('Estilo e movimento','focusLines','Linhas de foco',0,1,.01,.6,'','intensidade na periferia em alta velocidade'),HPG('Estilo e movimento','halftone','Retícula',0,1,.01,.55),
  HPG('Estilo e movimento','bannerHold','Duração das faixas',.6,1.8,.01,1,'×')],
 colors:hudColorDefaults(),
 toggles:{showSpeed:true,showPosition:true,showEnergy:true,showLap:true,minimap:true,showCombat:true,showBanner:true,showAlerts:true,showEffects:true},selects:{font:['condensed','wide','mono']},
 layout(w,h,cfg){const U=hudUnit(w,h,cfg.scale),u=U.u,sb=safeBox(w,h,cfg.safeArea),mp=u*cfg.sizeMap,e=u*cfg.sizeEnergy;
  const cell=U.tall?Math.min(24*e,(sb.w-200*e)/20-5*e):24*e;
  if(!U.tall)return {u,tall:false,sb,speed:{x:sb.x+sb.w,y:sb.y+sb.h},energy:{x:sb.x+22*e,y:sb.y+14*e,cell},pos:{x:sb.x+16*u,y:sb.y+sb.h-26*u},map:{x:sb.x+sb.w-300*mp,y:sb.y+8*mp,w:300*mp,h:210*mp}};
  return {u,tall:true,sb,speed:{x:sb.x+sb.w,y:sb.y+sb.h},energy:{x:sb.x+22*e,y:sb.y+14*e,cell},pos:{x:sb.x+sb.w-10*u,y:sb.y+sb.h*.42,right:true},map:{x:sb.x+10*mp,y:sb.y+sb.h-420*u,w:240*mp,h:170*mp}};},
 world(){},   // conceito de tela: nenhum elemento espacial (o rival é marcado em tela, ancorado à projeção)
 draw(g,w,h,M,cfg,MET){hudBegin(MET);try{this._draw(g,w,h,M,cfg,MET);}finally{hudBegin(null);}},
 _draw(g,w,h,M,cfg,MET){const G0=g,vis=hudVis(g);
  const L=this.layout(w,h,cfg),u=L.u,T=M.tele,t=M.t,K=cfg.kinetic,ink=cfg.inkWeight,mis=cfg.misregistration,ls=cfg.lineSpacing;
  const e=u*cfg.sizeEnergy,p=u*cfg.sizePosition,s=u*cfg.sizeSpeed,mp=u*cfg.sizeMap,al=u*cfg.sizeAlerts,bn=u*cfg.sizeBanner,cb=u*cfg.sizeCombat;
  hudTrack(cfg.letterSpacing);g.save();g.globalAlpha=cfg.opacity;
  const chroma=k=>[mis*k*u,mis*k*.6*u],VW=(str,size)=>vtextWidth(str,size);
  g=vis(cfg.showEffects);
  // ---------- linhas de foco (periferia; nunca no terço central)
  if(cfg.focusLines>0&&(T.speed>1050||T.boost.active)){const I=cfg.focusLines*clamp(.25+T.intensity*.9,0,1),n=Math.round(36+60*I),slot=Math.floor(t*12),cx=w/2,cy=h*.47,R0=Math.hypot(w,h)*.62,R1=Math.min(w,h)*(.46-.06*I);
   g.save();g.fillStyle=HUDC.paper;for(let i=0;i<n;i++){const a=hashNoise(slot,i)*TAU,len=hashNoise(slot+7,i),r1=R1+len*Math.min(w,h)*.12,wd=(.004+hashNoise(slot+3,i)*.01);g.globalAlpha=cfg.opacity*(.05+.17*I)*hashNoise(slot+9,i);
    g.beginPath();g.moveTo(cx+Math.cos(a-wd)*R0,cy+Math.sin(a-wd)*R0);g.lineTo(cx+Math.cos(a)*r1,cy+Math.sin(a)*r1);g.lineTo(cx+Math.cos(a+wd)*R0,cy+Math.sin(a+wd)*R0);g.fill();}g.restore();}
  const msgs=M.msgs,find=type=>msgs.find(o=>o.m.type===type);
  // ---------- impacto recebido: explosão direcional na borda + vinheta curta
  for(const o of msgs.filter(o=>o.m.type==='hitTaken')){const a=o.age,side=o.m.data.side>=0?1:-1,f=1-clamp(a/1.1,0,1);if(f<=0)continue;const ex=side>0?w:0,ey=h*.5;
   g.save();g.globalAlpha=cfg.opacity*f*.55;const grd=g.createLinearGradient(ex,0,ex-side*w*.22,0);grd.addColorStop(0,HUDC.danger);grd.addColorStop(1,rgbaOf(HUDC.danger,0));g.fillStyle=grd;g.fillRect(side>0?w*.78:0,0,w*.22,h);g.restore();
   const R=(70+50*K*ease.outBack(clamp(a/.18,0,1)))*cb,cx=ex-side*R*1.15,cy=ey-30*cb,pts=[];for(let i=0;i<20;i++){const r=i%2?R*.48:R*(.85+.25*hashNoise(o.m.id,i)),an=i/20*TAU;pts.push([cx+Math.cos(an)*r,cy+Math.sin(an)*r]);}
   g.save();g.globalAlpha=cfg.opacity*f;poly(g,pts,HUDC.pink,HUDC.ink,(5+3*ink)*cb);g.restore();
   vtext(g,'-'+Math.round(o.m.data.dmg),cx,cy+18*cb,46*cb,{align:'center',color:HUDC.paper,inkW:ink,chroma:chroma(3),alpha:f});noteText(MET,'hit',46*cb,cx,cy,0);}
  // ---------- ameaça: emanata em zigue-zague na borda do atacante + "!!" perto da nave
  for(const th of T.nearby.filter(o=>o.threat)){const prog=th.threatPhase===1?clamp(th.threatT/SIM.SIDE_WIND,0,1):1,side=th.dl>=0?1:-1,x0=side>0?w:0;
   g.save();g.strokeStyle=HUDC.danger;g.lineWidth=(4+3*ink)*cb;g.globalAlpha=cfg.opacity*(.45+.55*prog)*(.6+.4*alarm(t,3));for(let k=0;k<4+Math.round(prog*4);k++){const y=h*(.24+k*.075),len=(60+90*prog)*cb*(1+.3*K);g.beginPath();g.moveTo(x0,y);for(let z=1;z<=4;z++)g.lineTo(x0-side*len*z/4,y+(z%2?-14:14)*cb);g.stroke();}g.restore();
   const pp=M.proj(M.player.p);if(pp&&pp.inside)vtext(g,'!!',pp.x+side*90*cb,pp.y-60*cb,64*cb*(1+.25*K*Math.sin(prog*Math.PI)),{align:'center',color:HUDC.danger,inkW:ink*1.4,chroma:chroma(2)});}
  // ---------- borda aberta: listras de perigo no lado aberto
  const edge=find('edge');if(edge){const x0=w-28*cb,f=1-clamp(edge.exit,0,1),pul=.55+.45*alarm(t);g.save();g.globalAlpha=cfg.opacity*f*pul;g.beginPath();g.rect(x0,0,28*cb,h);g.clip();g.fillStyle=HUDC.ink;g.fillRect(x0,0,28*cb,h);for(let y=-40*cb;y<h+40*cb;y+=36*cb){poly(g,[[x0,y],[x0+28*cb,y-24*cb],[x0+28*cb,y-6*cb],[x0,y+18*cb]],HUDC.gold);}g.restore();}
  g=G0;
  // ---------- painel de energia e volta: layout em fluxo (cada linha abaixo da anterior, larguras medidas)
  const E=L.energy,cw=E.cell,ch=32*e,gap=5*e,sk=10*e,sh=T.shield,from=T.shieldFrom,crit=T.crit,low=sh<30;
  const yLabel=E.y+18*e,yBar=yLabel+16*e*ls,barEnd=E.x+20*(cw+gap),valSize=40*e,valX=barEnd+sk+18*e,valW=VW(String(Math.round(sh)),valSize);
  const yBoost=yBar+ch+30*e*ls,yLapLabel=yBoost+40*e*ls,yLap=yLapLabel+(48+18*ls)*e,lapTxt=T.lap+'/'+T.laps,lapW=VW(lapTxt,48*e),timeX=E.x+lapW+(28+48*.2)*e,timeW=VW(fmtLap(T.lapTime),34*e);
  const hist=T.lastLap!==null,yHist=yLap+30*e*ls,lastTxt=hist?'ÚLT '+fmtLap(T.lastLap):'',bestTxt=T.bestLap!==null?'MELHOR '+fmtLap(T.bestLap):'';
  const panelR=Math.max(valX+valW+18*e,timeX+timeW+26*e),panelB=(hist?yHist:yLap)+18*e*ls;
  g=vis(cfg.showEnergy||cfg.showLap);{const px=E.x-22*e,py=E.y-14*e,pw=panelR-px,ph=panelB-py,psk=26*e,off=(6+4*mis)*e;
   g.save();g.globalAlpha*=.9;poly(g,para(px+off,py+off,pw,ph,-psk),T.crit?HUDC.danger:HUDC.pink);poly(g,para(px,py,pw,ph,-psk),hudBg(.78),HUDC.ink,(4+3*ink)*e);
   const pat=halftonePattern(g,mixHex(HUDC.ink,HUDC.violet,.3),Math.max(4,Math.round(6*e)));if(pat&&cfg.halftone>0){g.save();g.beginPath();para(px,py,pw,ph,-psk).forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.clip();g.globalAlpha*=cfg.halftone;g.fillStyle=pat;g.fillRect(px-psk,py,pw+2*psk,ph);g.restore();}
   g.restore();noteBox(MET,'panel',px,py,pw+off,ph+off);}
  g=vis(cfg.showEnergy);{vtext(g,'ENERGIA',E.x,yLabel,18*e,{color:crit?HUDC.danger:HUDC.gold,inkW:ink});noteText(MET,'energyLabel',18*e,E.x,yLabel,0);
   const y0=yBar,shake=T.dmgAge<.16?(1-T.dmgAge/.16)*8*e*K*(hashNoise(Math.floor(t*60),1)-.5):0;
   for(let i=0;i<20;i++){const x=E.x+i*(cw+gap)+shake,v=clamp(sh/5-i,0,1),tr=clamp(from/5-i,0,1);
    poly(g,para(x,y0,cw,ch,sk),hudBg(.7),HUDC.ink,(2+2*ink)*e);
    if(tr>v&&T.dmgAge<.85){const fa=1-clamp((T.dmgAge-MOTION.trailHold)/.45,0,1);g.save();g.globalAlpha*=fa;poly(g,para(x+cw*v,y0,cw*(tr-v),ch,sk*(tr-v)),HUDC.paper);g.restore();}
    if(v>0){const col=crit?HUDC.danger:low?HUDC.pink:sh<50?HUDC.gold:HUDC.paper;g.save();if(crit)g.globalAlpha*=.55+.45*alarm(t);poly(g,para(x,y0,cw*v,ch,sk*v),col);g.restore();}}
   if(T.dmgAge<MOTION.shatter&&from>sh){const a=T.dmgAge/MOTION.shatter;for(let i=Math.floor(sh/5);i<Math.ceil(from/5);i++)for(let k=0;k<3;k++){const x=E.x+i*(cw+gap)+cw*.5,dx=(hashNoise(i*7+k,3)-.5)*90*e*K*a,dy=(-40*hashNoise(i,k+5)*a+160*a*a)*e*K;g.save();g.globalAlpha*=1-a;poly(g,[[x+dx,y0+dy],[x+dx+10*e,y0+dy+4*e],[x+dx+3*e,y0+dy+12*e]],HUDC.paper,HUDC.ink,1.5*e);g.restore();}}
   const right=E.x+(sh/5)*(cw+gap);
   if(T.boost.unlocked&&T.boost.count>0){const left=E.x+((sh-T.boost.cost)/5)*(cw+gap);g.save();g.strokeStyle=HUDC.cyan;g.lineWidth=2.5*e;g.beginPath();g.moveTo(left+sk,y0-3*e);g.lineTo(left+sk,y0-8*e);g.lineTo(right+sk,y0-8*e);g.lineTo(right+sk,y0-3*e);g.stroke();g.restore();}
   vtext(g,String(Math.round(sh)),valX,y0+ch,valSize,{color:crit?HUDC.danger:low?HUDC.pink:HUDC.paper,inkW:ink,chroma:chroma(T.dmgAge<.3?3:0)});
   const lockTxt=!T.boost.unlocked?'IMPULSO NA VOLTA 2':T.boost.active?'IMPULSO ATIVO':T.boost.count>0?'▶ ×'+T.boost.count+' IMPULSO'+(T.boost.count>1?'S':''):'SEM IMPULSO';
   vtext(g,lockTxt,E.x+sk,yBoost,18*e,{color:T.boost.active?HUDC.pink:HUDC.cyan,inkW:ink});noteText(MET,'boostInfo',18*e,E.x,yBoost,0);
   noteBox(MET,'energy',E.x,E.y,panelR-E.x,yBoost-E.y);}
  g=vis(cfg.showLap);{vtext(g,'VOLTA',E.x,yLapLabel,18*e,{color:HUDC.cyan,inkW:ink});vtext(g,lapTxt,E.x,yLap,48*e,{color:T.lap===T.laps?HUDC.pink:HUDC.paper,inkW:ink,chroma:chroma(1)});
   vtext(g,fmtLap(T.lapTime),timeX,yLap,34*e,{color:HUDC.paper,inkW:ink});
   if(hist){stext(g,lastTxt,E.x+2*e,yHist,16*e,{color:HUDC.mute,inkW:ink*.8});if(bestTxt)stext(g,bestTxt,E.x+2*e+stextW(g,lastTxt,16*e)+22*e,yHist,16*e,{color:HUDC.violet,inkW:ink*.8});}
   noteText(MET,'lap',48*e,E.x,yLap,0);noteText(MET,'lapTime',34*e,timeX,yLap,0);noteBox(MET,'lap',E.x,yLapLabel-18*e,panelR-E.x,(hist?yHist:yLap)-yLapLabel+18*e);}
  const panelBottom=panelB+(6+4*mis)*e,panelRight=panelR+(6+4*mis)*e;
  g=vis(cfg.showPosition);
  // ---------- posição gigante com soco de troca
  {const P=L.pos,pm=find('position'),big=170*p;let sc=1,dir=0;if(pm){const a=pm.age;dir=Math.sign(pm.m.data.from-pm.m.data.to);if(a<MOTION.punch)sc=lerp(1+.42*K,1,ease.outBack(a/MOTION.punch,2.4));}
   const txt=ordinal(T.rank),al_=P.right?'right':'left',wnum=VW(txt,big),tot='/'+T.total,totW=VW(tot,40*p);
   g.save();g.translate(P.x,P.y);g.scale(sc,sc);
   if(pm&&pm.age<.32){const f=1-pm.age/.32,cxr=(P.right?-1:1)*wnum*.5;g.save();g.strokeStyle=dir>0?HUDC.cyan:HUDC.pink;g.lineWidth=5*p;g.globalAlpha*=f;for(let i=0;i<12;i++){const an=i/12*TAU,r0=big*.65,r1=big*(.9+.4*K*(1-f));g.beginPath();g.moveTo(cxr+Math.cos(an)*r0,-big*.5+Math.sin(an)*r0);g.lineTo(cxr+Math.cos(an)*r1,-big*.5+Math.sin(an)*r1);g.stroke();}g.restore();}
   vtext(g,txt,0,0,big,{align:al_,color:T.rank<=3?HUDC.gold:HUDC.paper,inkW:ink*1.3,chroma:chroma(sc>1.01?5:1.2),skew:-.24});
   // "/30" encostado à base dos numerais, depois da largura medida + inclinação
   vtext(g,tot,P.right?-wnum-14*p:wnum+big*.06+16*p,0,40*p,{align:P.right?'right':'left',color:HUDC.mute,inkW:ink});g.restore();
   if(pm&&pm.m.data.from!==pm.m.data.to){const d=pm.m.data.from-pm.m.data.to,a=pm.age,f=a<1.2?1:1-clamp((a-1.2)/.3,0,1),stTxt=(d>0?'▲+':'▼-')+Math.abs(d),stW=VW(stTxt,40*p)+44*p;
    // adesivo acima dos numerais, sem cobri-los
    const sx=P.right?P.x-stW:P.x+8*p,sy=P.y-big-18*p+(1-ease.outCubic(clamp(a/.2,0,1)))*30*p*K;
    g.save();g.globalAlpha*=f;poly(g,para(sx,sy-58*p,stW,58*p,14*p),d>0?HUDC.cyan:HUDC.pink,HUDC.ink,4*p*Math.max(.5,ink));g.restore();vtext(g,stTxt,sx+stW/2+7*p,sy-9*p,40*p,{align:'center',color:HUDC.ink,ink:false,alpha:f});}
   const bw=wnum+big*.06+16*p+totW;noteText(MET,'position',big,P.x,P.y,0);noteBox(MET,'position',P.right?P.x-bw:P.x,P.y-big,bw,big);}
  g=vis(cfg.showSpeed);
  // ---------- velocidade: lâmina em arco + numerais
  {const S=L.speed,cx=S.x-290*s,cy=S.y-74*s,r0=252*s,r1=288*s,N=30,frac=clamp(T.speed/1700,0,1),lit=frac*N,a0=Math.PI*1.02,a1=Math.PI*1.86,boost=T.boost.active,drift=T.drift.on;
   for(let i=0;i<N;i++){const A=lerp(a0,a1,i/N)+.008,B=lerp(a0,a1,(i+1)/N)-.008,kmh=(i+.5)/N*1700,on=i<lit,part=clamp(lit-i,0,1);
    const pt=(a,r)=>[cx+Math.cos(a)*r,cy+Math.sin(a)*r],q=[pt(A,r0),pt(B,r0+(r1-r0)*.15),pt(B,r1),pt(A,r1-(r1-r0)*.1)];
    poly(g,q,hudBg(.72),HUDC.ink,(2+2*ink)*s);
    if(on){let col=kmh>1350?HUDC.pink:kmh>1100?HUDC.gold:HUDC.paper;if(boost){const wave=.5+.5*Math.sin(t*14-i*.55);col=wave>.7?HUDC.paper:HUDC.pink;}
     const Bp=lerp(A,B,part),q2=[pt(A,r0),pt(Bp,r0+(r1-r0)*.15*part),pt(Bp,r1),pt(A,r1-(r1-r0)*.1)];poly(g,q2,col);}}
   for(const k of [0,500,1000,1500]){const a=lerp(a0,a1,k/1700),q=[cx+Math.cos(a)*(r1+24*s),cy+Math.sin(a)*(r1+24*s)];vtext(g,String(k),q[0],q[1]+7*s,14*s,{align:'center',color:HUDC.mute,inkW:ink*.7});}
   const acc=clamp(Math.abs(T.acc)/45,0,1),num=116*s,yNum=S.y-34*s-22*s*ls;
   vtext(g,fmtSpeed(T.speed),S.x-44*s,yNum,num,{align:'right',color:boost?HUDC.pink:T.dash?HUDC.cyan:HUDC.paper,inkW:ink*1.4,chroma:chroma(1.5+acc*5+(boost?6:0)),skew:-.22});
   vtext(g,'KM/H',S.x-46*s,yNum+(16+22)*s*ls,22*s,{align:'right',color:HUDC.cyan,inkW:ink});
   noteText(MET,'speed',num,S.x-44*s,yNum,0);noteBox(MET,'speed',cx-r1-30*s,cy-r1-30*s,S.x-(cx-r1-30*s),S.y-(cy-r1-30*s));
   if(drift){const ang=Math.abs(T.drift.angle),dt_='DRIFT '+ang.toFixed(0)+'°',tw=VW(dt_,28*s)+44*s,x=cx-r1*.35,y=cy-r1-40*s;poly(g,para(x-tw,y-40*s,tw,50*s,12*s),HUDC.ink,HUDC.cyan,2.5*s);vtext(g,dt_,x-tw/2+6*s,y-3*s,28*s,{align:'center',color:HUDC.cyan,ink:false});
    const bw=tw-24*s;g.fillStyle=HUDC.pink;g.fillRect(x-tw/2,y+16*s,clamp(T.drift.slip,-1,1)*bw/2,7*s);noteText(MET,'drift',28*s,x,y,0);}
   if(T.air.on){vtext(g,'NO AR '+T.air.alt.toFixed(0)+' M',cx+r1*.2,cy-r1-50*s,26*s,{align:'right',color:HUDC.gold,inkW:ink});}
   const dm=find('dash');if(dm&&dm.age<.6){const f=1-dm.age/.6;vtext(g,'DASH!',cx+40*s,cy-r1+40*s-30*s*(1-f)*K,40*s,{align:'center',color:HUDC.gold,inkW:ink,alpha:f,chroma:chroma(3)});}}
  g=G0;
  // ---------- minimapa (adesivo do circuito)
  if(cfg.minimap){const B=L.map,m2=trackMap2D(),pad=10*mp,sc=Math.min((B.w-2*pad),(B.h-2*pad)),ox=B.x+pad+(B.w-2*pad-sc)/2,oy=B.y+pad+(B.h-2*pad-sc)/2,P=q=>[ox+q[0]*sc,oy+q[1]*sc];
   g.save();g.lineJoin='round';g.beginPath();m2.pts.forEach((q,i)=>{const [x,y]=P(q);i?g.lineTo(x,y):g.moveTo(x,y);});g.closePath();g.strokeStyle=HUDC.ink;g.lineWidth=(9+3*ink)*mp;g.stroke();g.strokeStyle=HUDC.paper;g.lineWidth=3.5*mp;g.stroke();
   const lp=P(m2.at(TRACK.features.loop.s0));g.strokeStyle=HUDC.cyan;g.lineWidth=2.5*mp;g.beginPath();g.arc(lp[0],lp[1]-6*mp,7*mp,0,TAU);g.stroke();
   const sf=P(m2.at(0));g.fillStyle=HUDC.paper;g.fillRect(sf[0]-2*mp,sf[1]-9*mp,4*mp,18*mp);
   for(const S of M.ships){const id=S.sh.id;if(id===0)continue;const [x,y]=P(m2.at(S.sh.s));const st=M.race.statics[id];if(st.isRival){g.strokeStyle=HUDC.gold;g.lineWidth=3*mp;g.beginPath();g.arc(x,y,7*mp,0,TAU);g.stroke();}else{g.fillStyle=S.sh.rank===1?HUDC.gold:HUDC.mute;g.beginPath();g.arc(x,y,3.4*mp,0,TAU);g.fill();}}
   const me=M.ships[0].sh,[px,py]=P(m2.at(me.s)),nx=P(m2.at(me.s+60)),an=Math.atan2(nx[1]-py,nx[0]-px);g.translate(px,py);g.rotate(an);poly(g,[[12*mp,0],[-8*mp,-8*mp],[-4*mp,0],[-8*mp,8*mp]],HUDC.pink,HUDC.ink,2.5*mp);g.restore();
   noteBox(MET,'map',B.x,B.y,B.w,B.h);}
  g=vis(cfg.showCombat);
  // ---------- rival ancorado à nave (projeção) ou seta na borda
  const rv=find('rivalNear');{const R=M.ships[M.race.rivalId];const show=rv||Math.abs(T.rival.ds)<160;if(show&&R){const q=M.proj(vec.madd(R.pose.p,R.pose.N,4));const gp=T.rival.gap;const txt='RIVAL '+(Number.isFinite(gp)?fmtGap(gp)+' S':'');
   if(q&&q.inside){const x=q.x,y=q.y-30*cb,tw=VW(txt,24*cb)+44*cb;g.save();g.strokeStyle=HUDC.gold;g.lineWidth=3*cb;g.beginPath();g.moveTo(x,q.y-8*cb);g.lineTo(x+40*cb,y-20*cb);g.stroke();g.restore();poly(g,para(x+40*cb,y-58*cb,tw,42*cb,10*cb),HUDC.gold,HUDC.ink,(3+ink*2)*cb);vtext(g,txt,x+40*cb+tw/2+5*cb,y-25*cb,24*cb,{align:'center',color:HUDC.ink,ink:false});noteText(MET,'rival',24*cb,x,y,0);}
   else if(rv){const behind=T.rival.ds<0,x=w/2,y=behind?h-L.sb.y-40*cb:panelBottom+40*cb;vtext(g,(behind?'▼ ':'▲ ')+txt,x,y,26*cb,{align:'center',color:HUDC.gold,inkW:ink});}}}
  // ---------- acerto causado: carimbo junto ao alvo
  for(const o of msgs.filter(o=>o.m.type==='hitLanded')){const S=M.ships[o.m.data.target],f=1-clamp((o.age-.7)/.4,0,1),pp=S&&M.proj(vec.madd(S.pose.p,S.pose.N,3));const x=pp&&pp.inside?pp.x:w/2,y=pp&&pp.inside?pp.y-40*cb:h*.38;const sc=lerp(1.6,1,ease.outBack(clamp(o.age/.2,0,1),2));
   vtext(g,'HIT! +'+Math.round(o.m.data.dmg),x,y,46*cb*sc,{align:'center',color:HUDC.cyan,inkW:ink*1.3,chroma:chroma(3),alpha:f});}
  // ---------- curva severa: chevrons grandes do lado da curva
  const cm=find('corner');if(cm){const left=cm.m.data.dir>0,f=1-cm.exit,cw2=VW('◀',62*al)+14*al,x=left?L.sb.x+60*al:L.sb.x+L.sb.w-60*al,y=h*.4;
   for(let i=0;i<3;i++){const on=(Math.floor(t*6)+i)%3===0?1:.45;vtext(g,left?'◀':'▶',left?x+i*cw2:x-i*cw2,y,62*al,{align:left?'left':'right',color:HUDC.gold,inkW:ink,alpha:f*on});}
   vtext(g,cm.m.data.name,x,y+(24+20)*al*ls,24*al,{align:left?'left':'right',color:HUDC.paper,inkW:ink,alpha:f});noteText(MET,'corner',24*al,x,y,0);}
  g=vis(cfg.showBanner);
  // ---------- faixas de volta / volta final / largada / chegada
  const banner=(o,big,sub,col)=>{const hold=MOTION.bannerHold*cfg.bannerHold,a=o.age,tin=MOTION.bannerIn,tout=MOTION.bannerOut,pr=a<tin?ease.outCubic(a/tin):a<tin+hold?1:1-ease.inCubic((a-tin-hold)/tout);if(pr<=0)return;
   const bh=120*bn,y=Math.max(panelBottom+20*bn,h*.26),sk=60*bn,x0=lerp(-w,0,pr);g.save();g.globalAlpha*=clamp(pr,0,1);poly(g,[[x0-sk,y+bh],[x0+w+sk,y+bh],[x0+w+sk*2,y],[x0,y]],hudBg(.78));poly(g,[[x0-sk,y+bh],[x0+w+sk,y+bh],[x0+w+sk,y+bh-8*bn],[x0-sk,y+bh-8*bn]],col);
   const pat=halftonePattern(g,col,Math.max(4,Math.round(6*bn)));if(pat){g.fillStyle=pat;g.globalAlpha*=.35*cfg.halftone+.1;g.fillRect(0,y,w,bh-8*bn);}g.restore();
   vtext(g,big,w/2-(1-pr)*w*.3,y+bh*.72,84*bn,{align:'center',color:col,inkW:ink*1.3,chroma:chroma(2.5),alpha:clamp(pr,0,1)});if(sub)stext(g,sub,w/2,y+bh+(24+14)*bn*ls,24*bn,{align:'center',color:HUDC.paper,alpha:clamp(pr,0,1)});noteText(MET,'banner',84*bn,w/2,y,0);};
  const lapM=find('lap'),lapGap='     ';
  if(lapM&&T.phase!=='finished'&&lapM.m.data.lap<T.laps){const d=lapM.m.data,fin=d.lap+1===T.laps;banner(lapM,(fin?'VOLTA FINAL ':'VOLTA ')+(d.lap+1)+'/'+T.laps,['VOLTA '+d.lap+'  '+fmtLap(d.time),d.delta!==null?'Δ '+fmtGap(d.delta):null,d.best&&d.lap>1?'MELHOR VOLTA':null].filter(Boolean).join(lapGap),fin?HUDC.pink:HUDC.cyan);}
  const fl=find('finalLap');if(fl&&!lapM)banner(fl,'VOLTA FINAL',null,HUDC.pink);
  const cd=find('countdown');if(cd){const a=cd.age,sc=lerp(1.8,1,ease.outBack(clamp(a/.22,0,1),2.2)),f=1-clamp((a-.75)/.2,0,1);vtext(g,String(cd.m.data.n),w/2,h*.42,240*bn*sc,{align:'center',color:HUDC.paper,inkW:ink*1.5,chroma:chroma(4),alpha:f});noteText(MET,'countdown',240*bn,w/2,h*.42,0);}
  const go=find('go');if(go){const a=go.age,sc=lerp(.6,1,ease.outBack(clamp(a/.2,0,1),3)),f=1-clamp((a-.9)/.3,0,1);g.save();g.globalAlpha*=f;g.strokeStyle=HUDC.gold;g.lineWidth=6*bn;for(let i=0;i<16;i++){const an=i/16*TAU,r0=160*bn,r1=(220+200*a)*bn*K;g.beginPath();g.moveTo(w/2+Math.cos(an)*r0,h*.36+Math.sin(an)*r0);g.lineTo(w/2+Math.cos(an)*r1,h*.36+Math.sin(an)*r1);g.stroke();}g.restore();vtext(g,'GO!',w/2,h*.42,280*bn*sc,{align:'center',color:HUDC.pink,inkW:ink*1.5,chroma:chroma(6),alpha:f});}
  const fin=find('finish');if(fin){banner({age:Math.min(fin.age,MOTION.bannerIn+.5)},'CHEGADA',null,HUDC.gold);const a=fin.age,yP=h*.62;if(a>.5){const pr=ease.outBack(clamp((a-.5)/.25,0,1),2);vtext(g,'P'+ordinal(T.place||T.rank),w/2,yP,150*bn*pr,{align:'center',color:(T.place||T.rank)<=3?HUDC.gold:HUDC.paper,inkW:ink*1.4,chroma:chroma(3)});stext(g,'TEMPO TOTAL  '+fmtLap(T.finishTime),w/2,yP+(26+22)*bn*ls,26*bn,{align:'center',alpha:clamp((a-.7)/.3,0,1)});}
   if(a>1.2){const rows=T.standings.slice(0,3),y0=yP+(26+22)*bn*ls+44*bn*ls;rows.forEach((id,i)=>{const sd=M.race.statics[id],sh_=M.st.ships[id];stext(g,(i+1)+'    '+(id===0?'VOCÊ':sd.code)+'    '+(sh_.finished?fmtLap(sh_.finishT-SIM.GO):'—'),w/2,y0+i*32*bn*ls,22*bn,{align:'center',color:id===0?HUDC.cyan:HUDC.paper,alpha:clamp((a-1.2-i*.12)/.25,0,1)});});stext(g,'RESULTADO DE TESTE · NÃO É A COREOGRAFIA FINAL',w/2,y0+3*32*bn*ls+12*bn,14*bn,{align:'center',color:HUDC.mute});}}
  g=vis(cfg.showAlerts);
  // ---------- adesivos de alerta (canal de texto; P0 sempre). Ficam à direita do painel se couberem; senão, abaixo dele.
  {const list=msgs.filter(o=>['threat','critical','edge','rivalNear','boostReady','recharge','airborne'].includes(o.m.type));let y=null;
   for(const o of list){const m=o.m,pr=m.prio,ent=ease.outBack(clamp(o.age/MOTION.slide,0,1),1.2+K),f=1-ease.inCubic(clamp(o.exit,0,1));if(f<=0)continue;
    const collapsed=pr===0&&o.age>1.8&&m.type!=='threat';const txt=m.type==='threat'?'ATAQUE '+(m.data.side>0?'▶':'◀')+(m.data.rival?' RIVAL':''):m.type==='edge'?'BORDA ABERTA ▶ '+Math.max(0,m.data.dist).toFixed(1)+' M':m.type==='rivalNear'?(m.data.ahead?'RIVAL À FRENTE':'RIVAL ATRÁS'):MSG[m.type].label;
    const size=(collapsed?26:pr===0?44:pr===1?34:pr===2?30:24)*al,tw=VW(txt,size)+64*al,hh=size+30*al;
    if(y===null){const x0=w/2-tw/2;y=x0>panelRight+16*u&&!L.tall?L.sb.y+hh*.5+10*al:panelBottom+hh*.5+18*al;}
    const x=w/2-tw/2,yy=y-hh*.5+(1-ent)*-40*al,fill=pr===0?HUDC.danger:pr===1?HUDC.cyan:pr===2?HUDC.paper:HUDC.ink,tc=pr===3?HUDC.cyan:pr===0?HUDC.paper:HUDC.ink;
    g.save();g.globalAlpha*=f*(pr===0?(.7+.3*alarm(t)):1);poly(g,para(x,yy,tw,hh,14*al),fill,HUDC.ink,(3+2*ink)*al);g.restore();vtext(g,txt,w/2+7*al,yy+hh/2+size/2,size,{align:'center',color:tc,ink:pr===0?HUDC.ink:false,inkW:ink*.6,alpha:f});
    noteText(MET,'alert:'+m.type,size,w/2,yy,tw);y+=hh+12*al*ls;}}
  g=G0;g.restore();hudTrack(null);}
};
