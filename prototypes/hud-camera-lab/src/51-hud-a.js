/* P12 V2 — HUD A · FLUX RUSH (emoção). Linguagem de impressão/mangá cinética: numerais vetoriais
   gigantes com tinta e desalinhamento ciano/rosa proporcional à aceleração, lâmina de velocidade,
   tanque de energia que estilhaça, carimbos e linhas de foco. Poucos módulos, muito grandes;
   o centro da imagem (nave e pista) fica livre. */
const HP=(id,label,min,max,step,def,unit='',desc='')=>({id,label,min,max,step,def,unit,desc});
const HUD_A={id:'A',name:'Flux Rush',tag:'arcade maximalista · emoção',
 intent:'Velocidade como espetáculo gráfico: numerais com tinta e desalinhamento de impressão que reagem à aceleração, lâmina de velocidade, energia em células que estilhaçam, carimbos de posição e faixas diagonais de volta. Pouca informação simultânea, muito legível, centro livre.',
 params:[HP('scale','Escala',.7,1.4,.01,1,'×'),HP('opacity','Opacidade',.4,1,.01,1),HP('kinetic','Intensidade cinética',0,1.5,.01,1,'×','amplitude de socos, deslizes e estilhaços'),HP('inkWeight','Peso da tinta',0,2,.01,1,'×'),
  HP('misregistration','Desalinhamento de impressão',0,2,.01,1,'×','deslocamento ciano/rosa por aceleração e impulso'),HP('focusLines','Linhas de foco',0,1,.01,.6,'','intensidade na periferia em alta velocidade'),HP('halftone','Retícula',0,1,.01,.55),
  HP('bannerHold','Duração das faixas',.6,1.8,.01,1,'×'),HP('safeArea','Margem de segurança',0,8,.1,3,'%')],
 toggles:{minimap:true},
 layout(w,h,cfg){const U=hudUnit(w,h,cfg.scale),u=U.u,sb=safeBox(w,h,cfg.safeArea);
  if(!U.tall)return {u,tall:false,sb,speed:{x:sb.x+sb.w,y:sb.y+sb.h},energy:{x:sb.x+10*u,y:sb.y+16*u,cell:24*u,ch:32*u},lap:{x:sb.x+12*u,y:sb.y+150*u},pos:{x:sb.x+16*u,y:sb.y+sb.h-26*u},map:{x:sb.x+sb.w-300*u,y:sb.y+8*u,w:300*u,h:210*u},alerts:{x:w/2,y:sb.y+128*u}};
  return {u,tall:true,sb,speed:{x:sb.x+sb.w,y:sb.y+sb.h},energy:{x:sb.x+10*u,y:sb.y+18*u,cell:Math.min(24*u,(sb.w-60*u)/20-5*u),ch:30*u},lap:{x:sb.x+12*u,y:sb.y+150*u},pos:{x:sb.x+sb.w-10*u,y:sb.y+300*u,right:true},map:{x:sb.x+10*u,y:sb.y+sb.h-420*u,w:240*u,h:170*u},alerts:{x:w/2,y:sb.y+330*u}};},
 world(){},   // conceito de tela: nenhum elemento espacial (o rival é marcado em tela, ancorado à projeção)
 draw(g,w,h,M,cfg,MET){hudBegin(MET);try{this._draw(g,w,h,M,cfg,MET);}finally{hudBegin(null);}},
 _draw(g,w,h,M,cfg,MET){
  const L=this.layout(w,h,cfg),u=L.u,T=M.tele,t=M.t,K=cfg.kinetic,ink=cfg.inkWeight,mis=cfg.misregistration;
  g.save();g.globalAlpha=cfg.opacity;
  const chroma=k=>[mis*k*u,mis*k*.6*u];
  // ---------- linhas de foco (periferia; nunca no terço central)
  if(cfg.focusLines>0&&(T.speed>1050||T.boost.active)){const I=cfg.focusLines*clamp(.25+T.intensity*.9,0,1),n=Math.round(36+60*I),slot=Math.floor(t*12),cx=w/2,cy=h*.47,R0=Math.hypot(w,h)*.62,R1=Math.min(w,h)*(.46-.06*I);
   g.save();g.fillStyle=HUDC.paper;for(let i=0;i<n;i++){const a=hashNoise(slot,i)*TAU,len=hashNoise(slot+7,i),r1=R1+len*Math.min(w,h)*.12,wd=(.004+hashNoise(slot+3,i)*.01);g.globalAlpha=cfg.opacity*(.05+.17*I)*hashNoise(slot+9,i);
    g.beginPath();g.moveTo(cx+Math.cos(a-wd)*R0,cy+Math.sin(a-wd)*R0);g.lineTo(cx+Math.cos(a)*r1,cy+Math.sin(a)*r1);g.lineTo(cx+Math.cos(a+wd)*R0,cy+Math.sin(a+wd)*R0);g.fill();}g.restore();}
  const msgs=M.msgs,find=type=>msgs.find(o=>o.m.type===type);
  // ---------- impacto recebido: explosão direcional na borda + vinheta curta
  for(const o of msgs.filter(o=>o.m.type==='hitTaken')){const a=o.age,side=o.m.data.side>=0?1:-1,f=1-clamp(a/1.1,0,1);if(f<=0)continue;const ex=side>0?w:0,ey=h*.5;
   g.save();g.globalAlpha=cfg.opacity*f*.55;const grd=g.createLinearGradient(ex,0,ex-side*w*.22,0);grd.addColorStop(0,HUDC.danger);grd.addColorStop(1,'rgba(255,42,79,0)');g.fillStyle=grd;g.fillRect(side>0?w*.78:0,0,w*.22,h);g.restore();
   const R=(70+50*K*ease.outBack(clamp(a/.18,0,1)))*u,cx=ex-side*R*1.15,cy=ey-30*u,pts=[];for(let i=0;i<20;i++){const r=i%2?R*.48:R*(.85+.25*hashNoise(o.m.id,i)),an=i/20*TAU;pts.push([cx+Math.cos(an)*r,cy+Math.sin(an)*r]);}
   g.save();g.globalAlpha=cfg.opacity*f;poly(g,pts,HUDC.pink,HUDC.ink,(5+3*ink)*u);g.restore();
   vtext(g,'-'+Math.round(o.m.data.dmg),cx,cy+18*u,46*u,{align:'center',color:HUDC.paper,inkW:ink,chroma:chroma(3),alpha:f});noteText(MET,'hit',46*u,cx,cy,0);}
  // ---------- ameaça: emanata em zigue-zague na borda do atacante + "!!" perto da nave
  for(const th of T.nearby.filter(o=>o.threat)){const prog=th.threatPhase===1?clamp(th.threatT/SIM.SIDE_WIND,0,1):1,side=th.dl>=0?1:-1,x0=side>0?w:0;
   g.save();g.strokeStyle=HUDC.danger;g.lineWidth=(4+3*ink)*u;g.globalAlpha=cfg.opacity*(.45+.55*prog)*(.6+.4*alarm(t,3));for(let k=0;k<4+Math.round(prog*4);k++){const y=h*(.24+k*.075),len=(60+90*prog)*u*(1+.3*K);g.beginPath();g.moveTo(x0,y);for(let z=1;z<=4;z++)g.lineTo(x0-side*len*z/4,y+(z%2?-14:14)*u);g.stroke();}g.restore();
   const pp=M.proj(M.player.p);if(pp&&pp.inside)vtext(g,'!!',pp.x+side*90*u,pp.y-60*u,64*u*(1+.25*K*Math.sin(prog*Math.PI)),{align:'center',color:HUDC.danger,inkW:ink*1.4,chroma:chroma(2)});}
  // ---------- borda aberta: listras de perigo no lado aberto
  const edge=find('edge');if(edge){const side=1,x0=side>0?w-28*u:0,f=1-clamp(edge.exit,0,1),pul=.55+.45*alarm(t);g.save();g.globalAlpha=cfg.opacity*f*pul;g.beginPath();g.rect(x0,0,28*u,h);g.clip();g.fillStyle=HUDC.ink;g.fillRect(x0,0,28*u,h);g.fillStyle=HUDC.gold;for(let y=-40*u;y<h+40*u;y+=36*u){poly(g,[[x0,y],[x0+28*u,y-24*u],[x0+28*u,y-6*u],[x0,y+18*u]],HUDC.gold);}g.restore();}
  // ---------- painel de quadrinho (tinta + sombra de impressão deslocada + retícula) sob energia e volta
  {const E=L.energy,pw=20*(E.cell+5*u)+150*u,ph=L.lap.y-E.y+120*u,px=E.x-22*u,py=E.y-40*u,sk=26*u,off=(6+4*mis)*u;
   g.save();g.globalAlpha*=.9;poly(g,para(px+off,py+off,pw,ph,-sk),T.crit?HUDC.danger:HUDC.pink);poly(g,para(px,py,pw,ph,-sk),'rgba(9,6,20,.78)',HUDC.ink,(4+3*ink)*u);
   const pat=halftonePattern(g,'#3b2266',Math.max(4,Math.round(6*u)));if(pat&&cfg.halftone>0){g.save();g.beginPath();para(px,py,pw,ph,-sk).forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.clip();g.globalAlpha*=cfg.halftone;g.fillStyle=pat;g.fillRect(px-sk,py,pw+2*sk,ph);g.restore();}
   g.restore();noteBox(MET,'panel',px,py,pw+off,ph+off);}
  // ---------- energia: 20 células inclinadas, trilha de dano e estilhaços
  {const E=L.energy,cw=E.cell,ch=E.ch,gap=5*u,sk=10*u,sh=T.shield,from=T.shieldFrom,crit=T.crit,low=sh<30;
   vtext(g,'ENERGIA',E.x,E.y,18*u,{color:crit?HUDC.danger:HUDC.gold,inkW:ink});noteText(MET,'energyLabel',18*u,E.x,E.y,0);
   const y0=E.y+10*u,shake=T.dmgAge<.16?(1-T.dmgAge/.16)*8*u*K*(hashNoise(Math.floor(t*60),1)-.5):0;
   for(let i=0;i<20;i++){const x=E.x+i*(cw+gap)+shake,v=clamp(sh/5-i,0,1),tr=clamp(from/5-i,0,1);
    poly(g,para(x,y0,cw,ch,sk),'rgba(7,6,15,.7)',HUDC.ink,(2+2*ink)*u);
    if(tr>v&&T.dmgAge<.85){const fa=1-clamp((T.dmgAge-MOTION.trailHold)/.45,0,1);g.save();g.globalAlpha*=fa;poly(g,para(x+cw*v,y0,cw*(tr-v),ch,sk*(tr-v)),HUDC.paper);g.restore();}
    if(v>0){const col=crit?HUDC.danger:low?HUDC.pink:sh<50?HUDC.gold:HUDC.paper;g.save();if(crit)g.globalAlpha*=.55+.45*alarm(t);poly(g,para(x,y0,cw*v,ch,sk*v),col);g.restore();}}
   // estilhaços das células perdidas nos últimos 0,42 s
   if(T.dmgAge<MOTION.shatter&&from>sh){const a=T.dmgAge/MOTION.shatter;for(let i=Math.floor(sh/5);i<Math.ceil(from/5);i++)for(let k=0;k<3;k++){const x=E.x+i*(cw+gap)+cw*.5,dx=(hashNoise(i*7+k,3)-.5)*90*u*K*a,dy=(-40*hashNoise(i,k+5)*a+160*a*a)*u*K;g.save();g.globalAlpha*=1-a;poly(g,[[x+dx,y0+dy],[x+dx+10*u,y0+dy+4*u],[x+dx+3*u,y0+dy+12*u]],HUDC.paper,HUDC.ink,1.5*u);g.restore();}}
   // custo de impulso (14 %) acima das últimas células, valor numérico e impulsos disponíveis abaixo
   const right=E.x+(sh/5)*(cw+gap),barEnd=E.x+20*(cw+gap),lockTxt=!T.boost.unlocked?'IMPULSO NA VOLTA 2':T.boost.active?'IMPULSO ATIVO':T.boost.count>0?'▶ ×'+T.boost.count+' IMPULSO'+(T.boost.count>1?'S':''):'SEM IMPULSO';
   if(T.boost.unlocked&&T.boost.count>0){const left=E.x+((sh-T.boost.cost)/5)*(cw+gap);g.save();g.strokeStyle=HUDC.cyan;g.lineWidth=2.5*u;g.beginPath();g.moveTo(left+sk,y0-4*u);g.lineTo(left+sk,y0-10*u);g.lineTo(right+sk,y0-10*u);g.lineTo(right+sk,y0-4*u);g.stroke();g.restore();}
   vtext(g,String(Math.round(sh)),barEnd+16*u,y0+ch,40*u,{color:crit?HUDC.danger:low?HUDC.pink:HUDC.paper,inkW:ink,chroma:chroma(T.dmgAge<.3?3:0)});
   vtext(g,lockTxt,E.x+sk,y0+ch+30*u,18*u,{color:T.boost.active?HUDC.pink:HUDC.cyan,inkW:ink});noteText(MET,'boostInfo',18*u,E.x,y0+ch+30*u,0);
   noteBox(MET,'energy',E.x,E.y-18*u,20*(cw+gap)+110*u,ch+60*u);}
  // ---------- volta e tempo
  {const P=L.lap;vtext(g,'VOLTA',P.x,P.y,18*u,{color:HUDC.cyan,inkW:ink});vtext(g,T.lap+'/'+T.laps,P.x,P.y+52*u,48*u,{color:T.lap===T.laps?HUDC.pink:HUDC.paper,inkW:ink,chroma:chroma(1)});
   vtext(g,fmtLap(T.lapTime),P.x+150*u,P.y+52*u,34*u,{color:HUDC.paper,inkW:ink});
   if(T.lastLap!==null)stext(g,'ÚLT '+fmtLap(T.lastLap)+(T.bestLap!==null?'   MELHOR '+fmtLap(T.bestLap):''),P.x+2*u,P.y+80*u,16*u,{color:HUDC.mute,inkW:ink*.8});
   noteText(MET,'lap',48*u,P.x,P.y+52*u,0);noteText(MET,'lapTime',34*u,P.x+150*u,P.y+52*u,0);noteBox(MET,'lap',P.x,P.y-18*u,420*u,100*u);}
  // ---------- posição gigante com soco de troca
  {const P=L.pos,pm=find('position'),big=170*u;let sc=1,dir=0;if(pm){const a=pm.age;dir=Math.sign(pm.m.data.from-pm.m.data.to);if(a<MOTION.punch)sc=lerp(1+.42*K,1,ease.outBack(a/MOTION.punch,2.4));}
   const txt=ordinal(T.rank),x=P.right?P.x:P.x,al=P.right?'right':'left';
   g.save();g.translate(x,P.y);g.scale(sc,sc);
   if(pm&&pm.age<.32){const f=1-pm.age/.32;g.save();g.strokeStyle=dir>0?HUDC.cyan:HUDC.pink;g.lineWidth=5*u;g.globalAlpha*=f;for(let i=0;i<12;i++){const an=i/12*TAU,r0=110*u,r1=(150+70*K*(1-f))*u;g.beginPath();g.moveTo(80*u+Math.cos(an)*r0,-80*u+Math.sin(an)*r0);g.lineTo(80*u+Math.cos(an)*r1,-80*u+Math.sin(an)*r1);g.stroke();}g.restore();}
   const wnum=vtext(g,txt,0,0,big,{align:al,color:T.rank<=3?HUDC.gold:HUDC.paper,inkW:ink*1.3,chroma:chroma(sc>1.01?5:1.2),skew:-.24});
   vtext(g,'/'+T.total,P.right?-wnum-8*u:wnum+14*u,-8*u,40*u,{align:P.right?'right':'left',color:HUDC.mute,inkW:ink});g.restore();
   if(pm&&pm.m.data.from!==pm.m.data.to){const d=pm.m.data.from-pm.m.data.to,a=pm.age,f=a<1.2?1:1-clamp((a-1.2)/.3,0,1);const sx=P.right?P.x-370*u:P.x+370*u,sy=P.y-130*u+(1-ease.outCubic(clamp(a/.2,0,1)))*30*u*K;
    g.save();g.globalAlpha*=f;poly(g,para(sx-10*u,sy-46*u,150*u,58*u,14*u),d>0?HUDC.cyan:HUDC.pink,HUDC.ink,4*u*Math.max(.5,ink));g.restore();vtext(g,(d>0?'▲+':'▼-')+Math.abs(d),sx+65*u,sy,40*u,{align:'center',color:HUDC.ink,ink:false,alpha:f});}
   noteText(MET,'position',big,P.x,P.y,0);noteBox(MET,'position',P.right?P.x-360*u:P.x,P.y-big*1.1,360*u,big*1.15);}
  // ---------- velocidade: lâmina em arco + numerais
  {const S=L.speed,cx=S.x-290*u,cy=S.y-74*u,r0=252*u,r1=288*u,N=30,frac=clamp(T.speed/1700,0,1),lit=frac*N,a0=Math.PI*1.02,a1=Math.PI*1.86,boost=T.boost.active,drift=T.drift.on;
   for(let i=0;i<N;i++){const A=lerp(a0,a1,i/N)+.008,B=lerp(a0,a1,(i+1)/N)-.008,kmh=(i+.5)/N*1700,on=i<lit,part=clamp(lit-i,0,1);
    const pt=(a,r)=>[cx+Math.cos(a)*r,cy+Math.sin(a)*r],q=[pt(A,r0),pt(B,r0+(r1-r0)*.15),pt(B,r1),pt(A,r1-(r1-r0)*.1)];
    poly(g,q,'rgba(7,6,15,.72)',HUDC.ink,(2+2*ink)*u);
    if(on){let col=kmh>1350?HUDC.pink:kmh>1100?HUDC.gold:HUDC.paper;if(boost){const wave=.5+.5*Math.sin(t*14-i*.55);col=wave>.7?HUDC.paper:HUDC.pink;}
     const Bp=lerp(A,B,part),q2=[pt(A,r0),pt(Bp,r0+(r1-r0)*.15*part),pt(Bp,r1),pt(A,r1-(r1-r0)*.1)];poly(g,q2,col);}}
   for(const k of [0,500,1000,1500]){const a=lerp(a0,a1,k/1700),p=[cx+Math.cos(a)*(r1+22*u),cy+Math.sin(a)*(r1+22*u)];vtext(g,String(k),p[0],p[1]+7*u,14*u,{align:'center',color:HUDC.mute,inkW:ink*.7});}
   const acc=clamp(Math.abs(T.acc)/45,0,1),num=116*u;
   vtext(g,fmtSpeed(T.speed),S.x-44*u,S.y-46*u,num,{align:'right',color:boost?HUDC.pink:T.dash?HUDC.cyan:HUDC.paper,inkW:ink*1.4,chroma:chroma(1.5+acc*5+(boost?6:0)),skew:-.22});
   vtext(g,'KM/H',S.x-46*u,S.y-12*u,22*u,{align:'right',color:HUDC.cyan,inkW:ink});
   noteText(MET,'speed',num,S.x-44*u,S.y-46*u,0);noteBox(MET,'speed',cx-r1-24*u,cy-r1-24*u,S.x-(cx-r1-24*u),S.y-(cy-r1-24*u));
   if(drift){const ang=Math.abs(T.drift.angle),x=cx-r1+150*u,y=cy-r1-40*u;poly(g,para(x-190*u,y-40*u,190*u,50*u,12*u),HUDC.ink,HUDC.cyan,2.5*u);vtext(g,'DRIFT '+ang.toFixed(0)+'°',x-95*u,y-5*u,28*u,{align:'center',color:HUDC.cyan,ink:false});
    const bw=170*u;g.fillStyle=HUDC.pink;g.fillRect(x-180*u+bw/2,y+16*u,clamp(T.drift.slip,-1,1)*bw/2,7*u);noteText(MET,'drift',28*u,x,y,0);}
   if(T.air.on){vtext(g,'NO AR '+T.air.alt.toFixed(0)+' M',cx,cy-r1-50*u,26*u,{align:'right',color:HUDC.gold,inkW:ink});}
   const dm=find('dash');if(dm&&dm.age<.6){const f=1-dm.age/.6;vtext(g,'DASH!',cx+40*u,cy-r1+40*u-30*u*(1-f)*K,40*u,{align:'center',color:HUDC.gold,inkW:ink,alpha:f,chroma:chroma(3)});}}
  // ---------- minimapa (adesivo do circuito)
  if(cfg.minimap&&!L.tall||cfg.minimap&&L.tall){const B=L.map,m2=trackMap2D(),pad=10*u,sc=Math.min((B.w-2*pad),(B.h-2*pad)),ox=B.x+pad+(B.w-2*pad-sc)/2,oy=B.y+pad+(B.h-2*pad-sc)/2,P=p=>[ox+p[0]*sc,oy+p[1]*sc];
   g.save();g.lineJoin='round';g.beginPath();m2.pts.forEach((p,i)=>{const [x,y]=P(p);i?g.lineTo(x,y):g.moveTo(x,y);});g.closePath();g.strokeStyle=HUDC.ink;g.lineWidth=(9+3*ink)*u;g.stroke();g.strokeStyle=HUDC.paper;g.lineWidth=3.5*u;g.stroke();
   const lp=P(m2.at(TRACK.features.loop.s0));g.strokeStyle=HUDC.cyan;g.lineWidth=2.5*u;g.beginPath();g.arc(lp[0],lp[1]-6*u,7*u,0,TAU);g.stroke();
   const sf=P(m2.at(0));g.fillStyle=HUDC.paper;g.fillRect(sf[0]-2*u,sf[1]-9*u,4*u,18*u);
   for(const S of M.ships){const id=S.sh.id;if(id===0)continue;const [x,y]=P(m2.at(S.sh.s));const st=M.race.statics[id];if(st.isRival){g.strokeStyle=HUDC.gold;g.lineWidth=3*u;g.beginPath();g.arc(x,y,7*u,0,TAU);g.stroke();}else{g.fillStyle=S.sh.rank===1?HUDC.gold:HUDC.mute;g.beginPath();g.arc(x,y,3.4*u,0,TAU);g.fill();}}
   const me=M.ships[0].sh,[px,py]=P(m2.at(me.s)),nx=P(m2.at(me.s+60)),an=Math.atan2(nx[1]-py,nx[0]-px);g.translate(px,py);g.rotate(an);poly(g,[[12*u,0],[-8*u,-8*u],[-4*u,0],[-8*u,8*u]],HUDC.pink,HUDC.ink,2.5*u);g.restore();
   noteBox(MET,'map',B.x,B.y,B.w,B.h);}
  // ---------- rival ancorado à nave (projeção) ou seta na borda
  const rv=find('rivalNear');{const R=M.ships[M.race.rivalId];const show=rv||Math.abs(T.rival.ds)<160;if(show&&R){const p=M.proj(vec.madd(R.pose.p,R.pose.N,4));const gap=T.rival.gap;const txt='RIVAL '+(Number.isFinite(gap)?fmtGap(gap)+'S':'');
   if(p&&p.inside){const x=p.x,y=p.y-30*u;g.save();g.strokeStyle=HUDC.gold;g.lineWidth=3*u;g.beginPath();g.moveTo(x,p.y-8*u);g.lineTo(x+40*u,y-20*u);g.stroke();g.restore();const tw=vtextWidth(txt,24*u)+40*u;poly(g,para(x+40*u,y-56*u,tw,40*u,10*u),HUDC.gold,HUDC.ink,(3+ink*2)*u);vtext(g,txt,x+40*u+tw/2+5*u,y-25*u,24*u,{align:'center',color:HUDC.ink,ink:false});noteText(MET,'rival',24*u,x,y,0);}
   else if(rv){const behind=T.rival.ds<0,x=w/2,y=behind?h-L.sb.y-40*u:L.sb.y+170*u;vtext(g,(behind?'▼ ':'▲ ')+txt,x,y,26*u,{align:'center',color:HUDC.gold,inkW:ink});}}}
  // ---------- acerto causado: carimbo junto ao alvo
  for(const o of msgs.filter(o=>o.m.type==='hitLanded')){const S=M.ships[o.m.data.target],f=1-clamp((o.age-.7)/.4,0,1),pp=S&&M.proj(vec.madd(S.pose.p,S.pose.N,3));const x=pp&&pp.inside?pp.x:w/2,y=pp&&pp.inside?pp.y-40*u:h*.38;const sc=lerp(1.6,1,ease.outBack(clamp(o.age/.2,0,1),2));
   vtext(g,'HIT! +'+Math.round(o.m.data.dmg),x,y,46*u*sc,{align:'center',color:HUDC.cyan,inkW:ink*1.3,chroma:chroma(3),alpha:f});}
  // ---------- curva severa: chevrons grandes do lado da curva
  const cm=find('corner');if(cm){const d=cm.m.data.dir>0?-1:1,f=1-cm.exit,x=d<0?L.sb.x+160*u:L.sb.x+L.sb.w-160*u,y=h*.36;for(let i=0;i<3;i++){const on=(Math.floor(t*6)+i)%3===0?1:.45;vtext(g,d<0?'◀':'▶',x+d*i*44*u*-1,y,62*u,{align:'center',color:HUDC.gold,inkW:ink,alpha:f*on});}vtext(g,cm.m.data.name,x,y+44*u,24*u,{align:'center',color:HUDC.paper,inkW:ink,alpha:f});noteText(MET,'corner',24*u,x,y,0);}
  // ---------- faixas de volta / volta final / largada / chegada
  const banner=(o,big,sub,col)=>{const hold=MOTION.bannerHold*cfg.bannerHold,a=o.age,tin=MOTION.bannerIn,tout=MOTION.bannerOut,p=a<tin?ease.outCubic(a/tin):a<tin+hold?1:1-ease.inCubic((a-tin-hold)/tout);if(p<=0)return;
   const y=h*.26,bh=120*u,sk=60*u,x0=lerp(-w,0,p);g.save();g.globalAlpha*=clamp(p,0,1);poly(g,[[x0-sk,y+bh],[x0+w+sk,y+bh],[x0+w+sk*2,y],[x0,y]],'rgba(7,6,15,.78)');poly(g,[[x0-sk,y+bh],[x0+w+sk,y+bh],[x0+w+sk,y+bh-8*u],[x0-sk,y+bh-8*u]],col);
   const pat=halftonePattern(g,col,Math.max(4,Math.round(6*u)));if(pat){g.fillStyle=pat;g.globalAlpha*=.35*cfg.halftone+.1;g.fillRect(0,y,w,bh-8*u);}g.restore();
   vtext(g,big,w/2-(1-p)*w*.3,y+bh*.72,84*u,{align:'center',color:col,inkW:ink*1.3,chroma:chroma(2.5),alpha:clamp(p,0,1)});if(sub)stext(g,sub,w/2,y+bh+30*u,24*u,{align:'center',color:HUDC.paper,alpha:clamp(p,0,1)});noteText(MET,'banner',84*u,w/2,y,0);};
  const lapM=find('lap');if(lapM&&T.phase!=='finished'&&lapM.m.data.lap<T.laps)banner(lapM,(lapM.m.data.lap+1===T.laps?'VOLTA FINAL ':'VOLTA ')+(lapM.m.data.lap+1)+'/'+T.laps,'VOLTA '+lapM.m.data.lap+' · '+fmtLap(lapM.m.data.time)+(lapM.m.data.delta!==null?'   Δ '+fmtGap(lapM.m.data.delta):'')+(lapM.m.data.best&&lapM.m.data.lap>1?'   MELHOR VOLTA':''),lapM.m.data.lap+1===T.laps?HUDC.pink:HUDC.cyan);
  const fl=find('finalLap');if(fl&&!lapM)banner(fl,'VOLTA FINAL',null,HUDC.pink);
  const cd=find('countdown');if(cd){const a=cd.age,sc=lerp(1.8,1,ease.outBack(clamp(a/.22,0,1),2.2)),f=1-clamp((a-.75)/.2,0,1);vtext(g,String(cd.m.data.n),w/2,h*.42,240*u*sc,{align:'center',color:HUDC.paper,inkW:ink*1.5,chroma:chroma(4),alpha:f});noteText(MET,'countdown',240*u,w/2,h*.42,0);}
  const go=find('go');if(go){const a=go.age,sc=lerp(.6,1,ease.outBack(clamp(a/.2,0,1),3)),f=1-clamp((a-.9)/.3,0,1);g.save();g.globalAlpha*=f;g.strokeStyle=HUDC.gold;g.lineWidth=6*u;for(let i=0;i<16;i++){const an=i/16*TAU,r0=160*u,r1=(220+200*a)*u*K;g.beginPath();g.moveTo(w/2+Math.cos(an)*r0,h*.36+Math.sin(an)*r0);g.lineTo(w/2+Math.cos(an)*r1,h*.36+Math.sin(an)*r1);g.stroke();}g.restore();vtext(g,'GO!',w/2,h*.42,280*u*sc,{align:'center',color:HUDC.pink,inkW:ink*1.5,chroma:chroma(6),alpha:f});}
  const fin=find('finish');if(fin){banner({age:Math.min(fin.age,MOTION.bannerIn+.5)},'CHEGADA',null,HUDC.gold);const a=fin.age;if(a>.5){const p=ease.outBack(clamp((a-.5)/.25,0,1),2);vtext(g,'P'+ordinal(T.place||T.rank),w/2,h*.6,150*u*p,{align:'center',color:(T.place||T.rank)<=3?HUDC.gold:HUDC.paper,inkW:ink*1.4,chroma:chroma(3)});stext(g,'TEMPO TOTAL '+fmtLap(T.finishTime),w/2,h*.6+50*u,26*u,{align:'center',alpha:clamp((a-.7)/.3,0,1)});}
   if(a>1.2){const rows=T.standings.slice(0,3);const y0=h*.72;rows.forEach((id,i)=>{const sd=M.race.statics[id],sh=M.st.ships[id];stext(g,(i+1)+'  '+sd.code+'  '+(sh.finished?fmtLap(sh.finishT-SIM.GO):'—'),w/2,y0+i*30*u,22*u,{align:'center',color:id===0?HUDC.cyan:HUDC.paper,alpha:clamp((a-1.2-i*.12)/.25,0,1)});});stext(g,'RESULTADO DE TESTE · NÃO É A COREOGRAFIA FINAL',w/2,y0+110*u,14*u,{align:'center',color:HUDC.mute});}}
  // ---------- adesivos de alerta (canal de texto; P0 sempre)
  {const list=msgs.filter(o=>['threat','critical','edge','hitTaken','rivalNear','boostReady','recharge','airborne'].includes(o.m.type)&&!(o.m.type==='hitTaken'));let y=L.alerts.y;
   for(const o of list){const m=o.m,p=m.prio,ent=ease.outBack(clamp(o.age/MOTION.slide,0,1),1.2+K),f=1-ease.inCubic(clamp(o.exit,0,1));if(f<=0)continue;
    const collapsed=p===0&&o.age>1.8&&m.type!=='threat';const txt=m.type==='threat'?'ATAQUE '+(m.data.side>0?'▶':'◀')+(m.data.rival?' RIVAL':''):m.type==='edge'?'BORDA ABERTA ▶ '+Math.max(0,m.data.dist).toFixed(1)+' M':m.type==='rivalNear'?(m.data.ahead?'RIVAL À FRENTE':'RIVAL ATRÁS'):MSG[m.type].label;
    const size=(collapsed?26:p===0?44:p===1?34:p===2?30:24)*u,tw=vtextWidth(txt,size)+60*u,hh=size+28*u,x=L.alerts.x-tw/2,yy=y-hh*.5+(1-ent)*-40*u;
    const fill=p===0?HUDC.danger:p===1?HUDC.cyan:p===2?HUDC.paper:HUDC.ink;const tc=p===3?HUDC.cyan:p===0?HUDC.paper:HUDC.ink;
    g.save();g.globalAlpha*=f*(p===0?(.7+.3*alarm(t)):1);poly(g,para(x,yy,tw,hh,14*u),fill,HUDC.ink,(3+2*ink)*u);g.restore();vtext(g,txt,L.alerts.x,yy+hh/2+size/2,size,{align:'center',color:tc,ink:p===0?HUDC.ink:false,inkW:ink*.6,alpha:f});
    noteText(MET,'alert:'+m.type,size,L.alerts.x,yy,tw);y+=hh+10*u;}}
  g.restore();}
};
