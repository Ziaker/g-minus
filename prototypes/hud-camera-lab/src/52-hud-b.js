/* P12 V2 — HUD B · VECTOR TACTICAL (espaço). Leitura espacial do combate: anel de ameaças projetado
   na pista em volta da nave (WebGL, com profundidade), alcance real do giro, janelas reais de ataque
   lateral, trajetória telegrafada de investidas, colchetes sobre adversários, radar relativo da
   pista, medidor de potência em que cada bloco de escudo é um impulso, e escada tática de posições
   com intervalos medidos. O combate aparece dentro da corrida, não como minijogo. */
const HUD_B={id:'B',name:'Vector Tactical',tag:'interface tática · espaço',
 intent:'O combate é lido no espaço em volta da nave: anel de ameaças no chão, alcance real do Spin, janelas reais de Side Attack, linha de investida telegrafada e colchetes sobre os rivais. Recursos são mostrados como munição: cada bloco do escudo é um impulso.',
 params:[HPG('Geral','scale','Tamanho do HUD',.5,2,.01,1,'×','multiplica todos os módulos; os tamanhos por módulo se somam a ele'),HPG('Geral','opacity','Opacidade',.4,1,.01,1),HPG('Geral','safeArea','Margem de segurança',0,8,.1,3,'%'),
  SIZE('sizeHead','Cabeçalho (posição e volta)'),SIZE('sizeLadder','Escada tática'),SIZE('sizeGauge','Medidor de potência'),SIZE('sizeRadar','Radar'),SIZE('sizeBrackets','Rótulos dos colchetes'),SIZE('sizeAlerts','Chamadas táticas'),SIZE('sizeCombat','Dano e ataque iminente'),
  ...TEXT_PARAMS(),...STYLE_PARAMS(true),
  HPG('Leitura espacial','threatRange','Alcance de ameaças',40,200,1,110,'m','raio de leitura do anel'),HPG('Leitura espacial','ringRadius','Raio do anel',6,16,.1,10.5,'m'),HPG('Leitura espacial','worldOpacity','Opacidade da camada no mundo',0,1,.01,.85),
  HPG('Leitura espacial','bracketRange','Alcance dos colchetes',40,320,1,180,'m'),HPG('Leitura espacial','radarRange','Alcance do radar',120,600,5,280,'m'),HPG('Leitura espacial','ladderRows','Linhas da escada',1,4,1,2,'±','posições mostradas acima e abaixo de você'),
  HPG('Leitura espacial','damagePersist','Persistência do indicador de dano',.4,2.5,.05,1.2,'s')],
 colors:hudColorDefaults(),
 toggles:{showHead:true,showLadder:true,showGauge:true,radar:true,showBrackets:true,showThreats:true,showDamage:true,showAlerts:true,attackAssist:true},selects:{radarMode:['local','circuit'],font:['condensed','wide','mono']},
 layout(w,h,cfg){const U=hudUnit(w,h,cfg.scale),u=U.u,sb=safeBox(w,h,cfg.safeArea),ra=u*cfg.sizeRadar,ga=u*cfg.sizeGauge,rr=118*ra;
  if(!U.tall)return {u,tall:false,sb,radar:{x:sb.x+rr+12*u,y:sb.y+sb.h-rr-12*u,r:rr},gauge:{x:w/2,y:sb.y+sb.h-(30+40*cfg.lineSpacing)*ga,r:150*ga},ladder:{x:sb.x+sb.w,y:sb.y+8*u},head:{x:sb.x+8*u,y:sb.y+8*u}};
  return {u,tall:true,sb,radar:{x:sb.x+sb.w-rr-12*u,y:sb.y+sb.h-rr-360*u,r:rr*.92},gauge:{x:w/2,y:sb.y+sb.h-(30+40*cfg.lineSpacing)*ga,r:150*ga},ladder:{x:sb.x+sb.w,y:sb.y+190*u},head:{x:sb.x+8*u,y:sb.y+8*u}};},
 // ---------- camada no mundo (profundidade real; desenhada no passe WebGL do viewport)
 world(A,M,cfg){const T=M.tele,P=M.st.ships[0];if(T.phase==='grid'||P.finished)return;const op=cfg.worldOpacity;if(op<=0)return;
  const f=trackFrame(P.s),hov=.25,c=vec.madd(vec.madd(f.p,f.R,P.lane),f.N,hov),Rr=cfg.ringRadius,C=HUDV.cyan,K=HUDV.pink,G=HUDV.gold;
  const at=(ang,r,up=0)=>vec.madd(vec.madd(vec.madd(c,f.T,Math.cos(ang)*r),f.R,Math.sin(ang)*r),f.N,up);
  // anel base + 12 setores de proximidade (ângulo 0 = frente)
  const sect=new Array(12).fill(0),hot=new Array(12).fill(0),riv=new Array(12).fill(0);
  for(const o of T.nearby){if(o.dist>cfg.threatRange)continue;const a=Math.atan2(o.dl,o.ds),k=wrap(Math.round(a/(TAU/12)),12),w=1-o.dist/cfg.threatRange;sect[k]=Math.max(sect[k],w);if(o.threat)hot[k]=1;if(o.isRival)riv[k]=Math.max(riv[k],w);}
  for(let i=0;i<48;i++){const a0=i/48*TAU,a1=(i+.6)/48*TAU;A.quad(at(a0,Rr),at(a1,Rr),at(a1,Rr-.22),at(a0,Rr-.22),C,.55*op);}
  for(let k=0;k<12;k++){const v=Math.max(sect[k],hot[k]);if(v<=.02)continue;const a0=(k-.42)*TAU/12,a1=(k+.42)*TAU/12,col=hot[k]?K:riv[k]>.02?G:C,th=.35+1.5*v;
   for(let j=0;j<6;j++){const b0=lerp(a0,a1,j/6),b1=lerp(a0,a1,(j+1)/6);A.quad(at(b0,Rr+.15),at(b1,Rr+.15),at(b1,Rr+.15+th),at(b0,Rr+.15+th),col,(.35+.6*v)*op*(hot[k]?(.7+.3*alarm(M.t,3)):1));}}
  // alcance real do Spin (SIM.SPIN_RADIUS) tracejado; preenchido quando há alvo dentro
  const sr=SIM.SPIN_RADIUS;for(let i=0;i<40;i+=2){const a0=i/40*TAU,a1=(i+1)/40*TAU;A.quad(at(a0,sr),at(a1,sr),at(a1,sr-.15),at(a0,sr-.15),T.spinN?K:C,(T.spinN?.8:.3)*op);}
  if(T.spinN&&cfg.attackAssist)for(let i=0;i<24;i++){const a0=i/24*TAU,a1=(i+1)/24*TAU;A.tri(c,at(a0,sr-.2),at(a1,sr-.2),K,.12*op*(.6+.4*alarm(M.t,2)));}
  // janelas reais de Side Attack (alcance lateral 3,2–9,5 m; ±8 m longitudinal)
  if(cfg.attackAssist)for(const [id,side] of [[T.sideL,-1],[T.sideR,1]]){if(id<0)continue;for(let k=0;k<3;k++){const d=SIM.SIDE_MIN_LAT+1+k*1.8,p0=vec.madd(vec.madd(c,f.R,side*d),f.T,1.4),p1=vec.madd(vec.madd(c,f.R,side*(d+1.2)),f.T,0),p2=vec.madd(vec.madd(c,f.R,side*d),f.T,-1.4),p3=vec.madd(vec.madd(c,f.R,side*(d+.5)),f.T,0);A.quad(p0,p1,p2,p3,C,.85*op);}}
  // marcas no chão sob adversários próximos + linha de investida telegrafada
  for(const o of T.nearby){if(o.dist>cfg.bracketRange)continue;const sh=M.st.ships[o.id],fo=trackFrame(sh.s),q=vec.madd(vec.madd(fo.p,fo.R,sh.lane),fo.N,hov+sh.alt),col=o.threat?K:o.isRival?G:C,s=2.2;
   A.tri(vec.madd(q,fo.T,s*1.4),vec.madd(vec.madd(q,fo.T,-s),fo.R,-s),vec.madd(vec.madd(q,fo.T,-s),fo.R,s),col,(o.threat?.75:.35)*op);
   if(o.threat){const target=vec.madd(c,f.R,-o.threatDir*1.5);for(let j=0;j<8;j+=2){const a=vec.lerp(q,target,j/8),b=vec.lerp(q,target,(j+1)/8);A.stroke(a,b,.7,K,.85*op);}}}
 },
 draw(g,w,h,M,cfg,MET){hudBegin(MET);try{this._draw(g,w,h,M,cfg,MET);}finally{hudBegin(null);}},
 _draw(g,w,h,M,cfg,MET){const G0=g,vis=hudVis(g);const L=this.layout(w,h,cfg),u=L.u,T=M.tele,t=M.t,ls=cfg.lineSpacing;
  const hd=u*cfg.sizeHead,ld=u*cfg.sizeLadder,ga=u*cfg.sizeGauge,ra=u*cfg.sizeRadar,br=u*cfg.sizeBrackets,al=u*cfg.sizeAlerts,cb=u*cfg.sizeCombat;
  hudTrack(cfg.letterSpacing);g.save();g.globalAlpha=cfg.opacity;
  const stroke=(pts,col,lw)=>{g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.strokeStyle=HUDC.ink;g.lineWidth=lw+3*u;g.stroke();g.strokeStyle=col;g.lineWidth=lw;g.stroke();};
  const P=M.st.ships[0];
  g=vis(cfg.showBrackets);
  // ---------- colchetes sobre adversários (até 6 mais próximos + rival); rótulos empilham quando não cabem lado a lado
  let list=T.nearby.filter(o=>o.dist<cfg.bracketRange).slice(0,6);const rv=T.nearby.find(o=>o.isRival&&o.dist<cfg.bracketRange);if(rv&&!list.includes(rv))list.push(rv);
  let labelled=0;for(const o of list){const S=M.ships[o.id],c=M.proj(vec.madd(S.pose.p,S.pose.N,1.2));if(!c||!c.inside)continue;const e=M.proj(vec.madd(vec.madd(S.pose.p,S.pose.R,4),S.pose.N,1.2));const half=clamp(e?Math.abs(e.x-c.x):20,14*u,90*u),hh=half*.62;
   const col=o.threat?HUDC.pink:o.isRival?HUDC.gold:o.shield<30?HUDC.gold:HUDC.cyan,arm=Math.max(6*u,half*.35),lw=(o.threat?3:2)*u,pul=o.threat?.6+.4*alarm(t,3):1;
   g.save();g.globalAlpha*=pul;for(const [sx,sy] of [[-1,-1],[1,-1],[1,1],[-1,1]]){const x=c.x+sx*half,y=c.y+sy*hh;stroke([[x-sx*arm,y],[x,y],[x,y-sy*arm]],col,lw);}g.restore();
   const fs=14*br,lab=(o.isRival?'RIVAL ':'')+o.code,dist=Math.round(o.dist)+' M '+(o.closing>3?'▲':o.closing<-3?'▼':'·'),full=o.threat||o.isRival||labelled<4,yTop=c.y-hh-8*br;
   if(full){labelled++;const lw1=stextW(g,lab,fs,700),lw2=stextW(g,dist,fs);
    if(lw1+lw2+14*br<=2*half){stext(g,lab,c.x-half,yTop,fs,{color:col,weight:700});stext(g,dist,c.x+half,yTop,fs,{color:HUDC.paper,align:'right'});}
    else{stext(g,dist,c.x-half,yTop,fs,{color:HUDC.paper});stext(g,lab,c.x-half,yTop-(fs+6*br)*ls,fs,{color:col,weight:700});}}
   else stext(g,Math.round(o.dist)+' M',c.x,yTop,fs,{color:HUDC.mute,align:'center'});
   if(o.dist<150){const bw=half*2;g.fillStyle=HUDC.ink;g.fillRect(c.x-half,c.y+hh+5*br,bw,4*br);g.fillStyle=o.shield<30?HUDC.gold:HUDC.cyan;g.fillRect(c.x-half,c.y+hh+5*br,bw*o.shield/100,4*br);}
   if(o.threat)vtext(g,'ATK',c.x,c.y+hh+(9+20)*br*ls,20*br,{align:'center',color:HUDC.pink});else if(o.shield<30&&o.dist<60)stext(g,'VULNERÁVEL',c.x,c.y+hh+(9+16)*br*ls,fs,{align:'center',color:HUDC.gold,weight:700});
   noteText(MET,'bracket',fs,c.x,c.y,0);}
  g=vis(cfg.showThreats);
  // ---------- ameaças fora da tela: setas na borda com distância (frente = topo, trás = base)
  if(T.phase==='race')for(const o of T.nearby){if(o.dist>cfg.threatRange)continue;if(!(o.threat||o.dist<40))continue;const S=M.ships[o.id],c=M.proj(vec.madd(S.pose.p,S.pose.N,1.2));if(c&&c.inside)continue;
   const len=Math.hypot(o.dl,o.ds)||1,cx=w/2,cy=h*.55,R=Math.min(w,h)*.42,x=clamp(cx+o.dl/len*R*1.6,40*cb,w-40*cb),y=clamp(cy-o.ds/len*R,90*cb,h-60*cb);
   g.save();g.translate(x,y);g.rotate(Math.atan2(y-cy,x-cx));poly(g,[[18*cb,0],[-10*cb,-12*cb],[-4*cb,0],[-10*cb,12*cb]],o.threat?HUDC.pink:HUDC.cyan,HUDC.ink,2.5*cb);g.restore();stext(g,Math.round(o.dist)+' M',x,y+(14+16)*cb*ls,14*cb,{align:'center',color:o.threat?HUDC.pink:HUDC.paper});}
  g=vis(cfg.showDamage);
  // ---------- indicador direcional de dano (cunha em volta do centro)
  if(T.dmgAge<cfg.damagePersist){const f=1-T.dmgAge/cfg.damagePersist,side=T.dmgSide>=0?1:-1,cx=w/2,cy=h*.52,R=Math.min(w,h)*.33,a0=side>0?-.5:Math.PI-.5,a1=a0+1;
   g.save();g.globalAlpha*=f;g.beginPath();g.arc(cx,cy,R,a0,a1);g.arc(cx,cy,R-22*cb,a1,a0,true);g.closePath();g.fillStyle=HUDC.pink;g.fill();g.strokeStyle=HUDC.ink;g.lineWidth=3*cb;g.stroke();g.restore();
   stext(g,'-'+Math.round(Math.max(0,T.shieldFrom-T.shield))+'  '+(T.dmgKind==='barrier'?'BARREIRA':T.dmgKind==='side'?'LATERAL':T.dmgKind==='spin'?'GIRO':'COLISÃO'),cx+side*(R+16*cb),cy+6*cb,16*cb,{align:side>0?'left':'right',color:HUDC.pink,weight:700,alpha:f});}
  g=vis(cfg.showThreats);
  // ---------- ataque iminente: tempo até o contato (da fase real do atacante)
  for(const o of T.nearby.filter(o=>o.threat)){const rem=o.threatPhase===1?SIM.SIDE_WIND-o.threatT:Math.max(0,SIM.SIDE_LUNGE-o.threatT),side=o.dl>=0?1:-1,x=w/2+side*Math.min(w*.28,330*cb),y=h*.42;
   const txt='ATAQUE '+(side>0?'▶':'◀')+'  '+rem.toFixed(2)+' S',tw=vtextWidth(txt,24*cb)+56*cb,x0=side>0?x-tw/2:x+tw/2,x1=side>0?x+tw/2:x-tw/2;
   poly(g,[[x0,y-30*cb],[x1,y-30*cb],[x1+side*22*cb,y],[x1,y+30*cb],[x0,y+30*cb]],hudBg(.85),HUDC.pink,3*cb);
   vtext(g,txt,x,y+11*cb,24*cb,{align:'center',color:HUDC.pink});noteText(MET,'threat',24*cb,x,y,0);}
  g=vis(cfg.showHead);
  // ---------- cabeçalho: posição, volta, tempo — linhas em fluxo, larguras medidas
  let headR,headB;
  {const H=L.head,x0=H.x+16*hd,ps='P'+ordinal(T.rank),pSize=58*hd,y1=H.y+12*hd+pSize,pw=vtextWidth(ps,pSize)+pSize*.12,tot='/'+T.total;
   const lapLbl='VOLTA '+T.lap+'/'+T.laps,lapSize=22*hd,y2=y1+(lapSize+18*hd)*ls,lw=vtextWidth(lapLbl,lapSize)+lapSize*.12,timeTxt=fmtLap(T.lapTime),tx=x0+lw+26*hd,tw=vtextWidth(timeTxt,lapSize)+lapSize*.12;
   const best=T.bestLap!==null?'MELHOR  '+fmtLap(T.bestLap):'',y3=y2+(15+14)*hd*ls;
   headR=Math.max(x0+pw+12*hd+stextW(g,tot,22*hd),tx+tw,x0+(best?stextW(g,best,15*hd):0))+18*hd;headB=(best?y3:y2)+14*hd*ls;
   chamfer(g,H.x,H.y,headR-H.x,headB-H.y,16*hd,rgbaOf(HUDC.cyan,.55),hudBg(.55),1.5*u);
   vtext(g,ps,x0,y1,pSize,{color:T.rank<=3?HUDC.gold:HUDC.paper,skew:-.12});stext(g,tot,x0+pw+12*hd,y1,22*hd,{color:HUDC.mute});
   vtext(g,lapLbl,x0,y2,lapSize,{color:HUDC.cyan,skew:-.12});vtext(g,timeTxt,tx,y2,lapSize,{color:HUDC.paper,skew:-.12});
   if(best)stext(g,best,x0,y3,15*hd,{color:HUDC.violet});noteText(MET,'position',pSize,x0,y1,0);noteText(MET,'lap',lapSize,x0,y2,0);noteBox(MET,'head',H.x,H.y,headR-H.x,headB-H.y);}
  g=vis(cfg.showLadder);
  // ---------- escada tática: colunas medidas (posição | código | escudo | intervalo)
  let ladL,ladB;
  {const Ld=L.ladder,n=Math.round(cfg.ladderRows),ranks=[];const r0=Math.max(1,T.rank-n),r1=Math.min(T.total,T.rank+n);if(r0>1)ranks.push(1);for(let r=r0;r<=r1;r++)ranks.push(r);
   const fs=15*ld,rs=18*ld,pad=14*ld,row=32*ld*ls,title='ESCADA TÁTICA · INTERVALO',codes=ranks.map(r=>T.standings[r-1]===0?'VOCÊ':M.race.statics[T.standings[r-1]].code);
   const rankW=vtextWidth('30',rs),codeW=Math.max(...codes.map(c=>stextW(g,c,fs,800))),barW=44*ld,gapW=stextW(g,'-00.00',fs);
   const inner=rankW+12*ld+codeW+16*ld+barW+16*ld+gapW,W2=Math.max(inner,stextW(g,title,14*ld,700))+2*pad,x0=Ld.x-W2,yT=Ld.y+pad+14*ld,gapRows=r0>2?1:0,hTot=(yT-Ld.y)+10*ld*ls+ranks.length*row+gapRows*18*ld*ls+pad;
   ladL=x0;ladB=Ld.y+hTot;
   chamfer(g,x0,Ld.y,W2,hTot,14*ld,rgbaOf(HUDC.cyan,.45),hudBg(.35),1.5*u);stext(g,title,x0+pad,yT,14*ld,{color:HUDC.mute,weight:700});
   let y=yT+10*ld*ls;const cRank=x0+pad+rankW,cCode=cRank+12*ld,cBar=cCode+codeW+16*ld,cGap=x0+W2-pad;
   ranks.forEach((r,i)=>{if(i>0&&r-ranks[i-1]>1){stext(g,'⋯',cCode,y+12*ld,fs,{color:HUDC.mute});y+=18*ld*ls;}const id=T.standings[r-1],me=id===0,sd=M.race.statics[id],sh=M.st.ships[id];
    let gp=0;if(!me){gp=sh.s>P.s?-intervalBetween(M.race,M.st,sh,P):intervalBetween(M.race,M.st,P,sh);}
    const near=T.nearby.find(o=>o.id===id),atk=near&&near.threat,base=y+row*.5+fs*.36;g.fillStyle=me?rgbaOf(HUDC.cyan,.18):hudBg(.6);g.fillRect(x0+pad*.5,y+2*ld,W2-pad,row-4*ld);if(me){g.fillStyle=HUDC.cyan;g.fillRect(x0+pad*.5,y+2*ld,4*ld,row-4*ld);}
    vtext(g,String(r),cRank,base+1*ld,rs,{align:'right',color:me?HUDC.cyan:HUDC.paper,skew:0,inkW:.5});stext(g,codes[i],cCode,base,fs,{color:atk?HUDC.pink:sd.isRival?HUDC.gold:me?HUDC.cyan:HUDC.paper,weight:me?800:600,ink:false});
    if(near&&near.dist<150&&!me){g.fillStyle=HUDC.ink;g.fillRect(cBar,base-fs*.42,barW,5*ld);g.fillStyle=sh.shield<30?HUDC.gold:HUDC.cyan;g.fillRect(cBar,base-fs*.42,barW*sh.shield/100,5*ld);}
    stext(g,me?'—':(Number.isFinite(gp)?(gp>0?'+':'-')+Math.abs(gp).toFixed(2):'—'),cGap,base,fs,{align:'right',color:HUDC.paper,ink:false});
    noteText(MET,'ladder',fs,x0,y,W2);y+=row;});noteBox(MET,'ladder',x0,Ld.y,W2,hTot);}
  g=vis(cfg.showGauge);
  // ---------- medidor de potência: velocidade (arco externo) + escudo em blocos de impulso (arco interno)
  {const G=L.gauge,cx=G.x,cy=G.y,r=G.r,a0=Math.PI*1.08,a1=Math.PI*1.92,spdF=clamp(T.speed/1700,0,1);
   g.lineCap='butt';g.beginPath();g.arc(cx,cy,r,a0,a1);g.strokeStyle=HUDC.ink;g.lineWidth=16*ga;g.stroke();g.beginPath();g.arc(cx,cy,r,a0,lerp(a0,a1,spdF));g.strokeStyle=T.boost.active?HUDC.pink:HUDC.cyan;g.lineWidth=10*ga;g.stroke();
   for(let k=0;k<=17;k++){const a=lerp(a0,a1,k/17),big=k%5===0;g.beginPath();g.moveTo(cx+Math.cos(a)*(r+9*ga),cy+Math.sin(a)*(r+9*ga));g.lineTo(cx+Math.cos(a)*(r+(big?20:14)*ga),cy+Math.sin(a)*(r+(big?20:14)*ga));g.strokeStyle=HUDC.paper;g.lineWidth=(big?2.5:1.2)*ga;g.stroke();}
   const vl=clamp(T.vlim/1700,0,1),av=lerp(a0,a1,vl);if(T.vlim<1400){g.beginPath();g.moveTo(cx+Math.cos(av)*(r-12*ga),cy+Math.sin(av)*(r-12*ga));g.lineTo(cx+Math.cos(av)*(r+24*ga),cy+Math.sin(av)*(r+24*ga));g.strokeStyle=HUDC.gold;g.lineWidth=3*ga;g.stroke();}
   const blocks=Math.floor(100/SIM.BOOST_COST),bw=(a1-a0)/(blocks+.5),ri=r-30*ga;for(let i=0;i<blocks;i++){const b0=a0+i*bw+.02,b1=b0+bw-.04,v=clamp((T.shield-SIM.SHIELD_MIN)/SIM.BOOST_COST-i,0,1),tr=clamp((T.shieldFrom-SIM.SHIELD_MIN)/SIM.BOOST_COST-i,0,1);
    g.beginPath();g.arc(cx,cy,ri,b0,b1);g.strokeStyle=HUDC.ink;g.lineWidth=18*ga;g.stroke();if(tr>v){g.beginPath();g.arc(cx,cy,ri,lerp(b0,b1,v),lerp(b0,b1,tr));g.strokeStyle=rgbaOf(HUDC.paper,1-clamp(T.dmgAge/.8,0,1));g.lineWidth=12*ga;g.stroke();}
    if(v>0){g.beginPath();g.arc(cx,cy,ri,b0,lerp(b0,b1,v));g.strokeStyle=T.crit?HUDC.danger:v<1?HUDC.gold:HUDC.paper;g.lineWidth=12*ga;g.stroke();}}
   // pilha de texto de baixo para cima: escudo · KM/H · velocidade
   // o número fica no centro do arco (abaixo do eixo, onde a corda é larga) e cabe dentro do arco interno: tamanho ajustado pela corda disponível (referência fixa '8888')
   const ySpd=cy+20*ga,yKmh=ySpd+20*ga*ls,yShield=yKmh+20*ga*ls,Ri=ri-15*ga;let spdSz=54*ga;
   for(;spdSz>26*ga;spdSz-=ga){const top=cy-ySpd+spdSz;if(top<Ri&&vtextWidth('8888',spdSz)<=2*Math.sqrt(Ri*Ri-top*top))break;}
   vtext(g,fmtSpeed(T.speed),cx,ySpd,spdSz,{align:'center',color:T.boost.active?HUDC.pink:HUDC.paper,skew:-.1});stext(g,'KM/H',cx,yKmh,14*ga,{align:'center',color:HUDC.cyan,weight:700});
   stext(g,'ESCUDO '+Math.round(T.shield)+'%  ·  '+(T.boost.unlocked?T.boost.count+' IMPULSO'+(T.boost.count===1?'':'S'):'IMPULSO NA VOLTA 2'),cx,yShield,14*ga,{align:'center',color:T.crit?HUDC.danger:HUDC.paper,weight:700});
   if(T.drift.on){const sx=cx+r+44*ga,lbl='DESLIZE '+Math.abs(T.drift.angle).toFixed(0)+'°';stext(g,lbl,sx,cy-62*ga,14*ga,{color:HUDC.cyan,weight:700});g.fillStyle=HUDC.ink;g.fillRect(sx,cy-62*ga+10*ga*ls,90*ga,6*ga);g.fillStyle=HUDC.cyan;g.fillRect(sx+45*ga,cy-62*ga+10*ga*ls,clamp(T.drift.slip,-1,1)*45*ga,6*ga);}
   noteText(MET,'speed',spdSz,cx,ySpd,0);noteText(MET,'shield',14*ga,cx,yShield,0);noteBox(MET,'gauge',cx-r-26*ga,cy-r-26*ga,2*r+52*ga,yShield+6*ga-(cy-r-26*ga));}
  g=G0;
  // ---------- radar relativo (pista real em volta) ou circuito
  if(cfg.radar){const R=L.radar,rr=R.r,me=M.ships[0].pose;g.save();g.beginPath();g.arc(R.x,R.y,rr,0,TAU);g.fillStyle=hudBg(.72);g.fill();g.strokeStyle=HUDC.cyan;g.lineWidth=2*ra;g.stroke();g.clip();
   if(cfg.radarMode==='local'){const rng=cfg.radarRange,sc=rr/(rng*.62),oy=R.y+rr*.32,map=q=>{const [x,y]=relPlanar(me,q);return [R.x+x*sc,oy-y*sc];};
    for(let k=1;k<=3;k++){g.beginPath();g.arc(R.x,oy,k*rng/3*sc*.62,0,TAU);g.strokeStyle=rgbaOf(HUDC.cyan,.18);g.lineWidth=1;g.stroke();}
    for(const side of [-1,1]){g.beginPath();for(let d=-rng*.45;d<=rng;d+=8){const f=trackFrame(P.s+d),q=vec.madd(f.p,f.R,side*f.hw),[x,y]=map(q);d<=-rng*.45+1e-6?g.moveTo(x,y):g.lineTo(x,y);}g.strokeStyle=HUDC.paper;g.lineWidth=2*ra;g.stroke();}
    for(const S of M.ships){const d=S.sh.s-P.s;if(d<-rng*.6||d>rng*1.1)continue;const [x,y]=map(S.pose.p),o=T.nearby.find(o=>o.id===S.sh.id),me2=S.sh.id===0;const col=me2?HUDC.paper:o&&o.threat?HUDC.pink:M.race.statics[S.sh.id].isRival?HUDC.gold:HUDC.cyan,sz=(me2?9:6)*ra;
     poly(g,[[x,y-sz],[x+sz*.7,y+sz*.8],[x-sz*.7,y+sz*.8]],col,HUDC.ink,1.5*ra);}
    stext(g,Math.round(rng)+' M',R.x,R.y-rr+22*ra,14*ra,{align:'center',color:HUDC.mute});}
   else{const m2=trackMap2D(),sc=rr*1.5,P2=q=>[R.x-sc/2+q[0]*sc,R.y-sc/2+q[1]*sc];g.beginPath();m2.pts.forEach((q,i)=>{const [x,y]=P2(q);i?g.lineTo(x,y):g.moveTo(x,y);});g.closePath();g.strokeStyle=HUDC.paper;g.lineWidth=2*ra;g.stroke();
    for(const S of M.ships){const [x,y]=P2(m2.at(S.sh.s));g.fillStyle=S.sh.id===0?HUDC.pink:M.race.statics[S.sh.id].isRival?HUDC.gold:HUDC.cyan;g.beginPath();g.arc(x,y,(S.sh.id===0?5:2.6)*ra,0,TAU);g.fill();}}
   g.restore();noteBox(MET,'radar',R.x-rr,R.y-rr,2*rr,2*rr);}
  g=vis(cfg.showAlerts);
  // ---------- canal de texto (chamadas táticas): acima, entre cabeçalho e escada; abaixo deles se não couber
  {let y=null;for(const o of M.msgs){const m=o.m;
    const f=1-ease.inCubic(clamp(o.exit,0,1)),ent=ease.outCubic(clamp(o.age/MOTION.slide,0,1));if(f<=0)continue;
    let txt=MSG[m.type].label,col=m.prio===0?HUDC.danger:m.prio===1?HUDC.cyan:m.prio===2?HUDC.paper:HUDC.mute;
    if(m.type==='countdown')txt=String(m.data.n);if(m.type==='go')txt='GO';if(m.type==='position'){const d=m.data.from-m.data.to;if(!d)continue;txt='POSIÇÃO  '+(d>0?'▲ +':'▼ -')+Math.abs(d)+'  ·  P'+ordinal(m.data.to);col=d>0?HUDC.cyan:HUDC.pink;}
    if(m.type==='lap')txt='VOLTA '+m.data.lap+'  ·  '+fmtLap(m.data.time)+(m.data.delta!==null?'  ·  Δ '+fmtGap(m.data.delta):'');if(m.type==='finish')txt='CHEGADA  ·  P'+ordinal(T.place||T.rank)+'  ·  '+fmtLap(T.finishTime);
    if(m.type==='hitTaken')txt='IMPACTO  -'+Math.round(m.data.dmg)+(m.data.count>1?'  ×'+m.data.count:'');if(m.type==='hitLanded')txt='ACERTO  +'+Math.round(m.data.dmg)+'  '+M.race.statics[m.data.target].code;if(m.type==='rivalNear')txt='RIVAL '+(m.data.ahead?'À FRENTE':'ATRÁS')+'  '+fmtGap(Math.abs(T.rival.gap||0),false)+' S';
    if(m.type==='edge')txt='BORDA ABERTA ▶  '+Math.max(0,m.data.dist).toFixed(1)+' M';if(m.type==='corner')txt='CURVA '+(m.data.dir>0?'◀':'▶')+'  '+m.data.name.toUpperCase();if(m.type==='threat')txt='ATAQUE '+(m.data.side>0?'▶':'◀')+(m.data.rival?'  ·  RIVAL':'');
    const big=m.type==='countdown'||m.type==='go',size=(big?96:m.prio===0?28:22)*al,tw=vtextWidth(txt,size)+48*al,hh=size+22*al;
    if(y===null){const fits=w/2-tw/2>headR+16*u&&w/2+tw/2<ladL-16*u&&!L.tall;y=fits?L.sb.y+10*al:Math.max(headB,L.tall?0:ladB)+16*al;}
    const yy=y+(1-ent)*-16*al;
    g.save();g.globalAlpha*=f*(m.prio===0?.75+.25*alarm(t):1);if(!big){g.fillStyle=hudBg(.82);g.fillRect(w/2-tw/2,yy,tw,hh);g.strokeStyle=col;g.lineWidth=2*al;g.strokeRect(w/2-tw/2,yy,tw,hh);g.fillStyle=col;g.fillRect(w/2-tw/2,yy,6*al,hh);}g.restore();
    vtext(g,txt,w/2+3*al,yy+hh/2+size/2,size,{align:'center',color:col,skew:-.08,alpha:f,inkW:big?1.2:.6});noteText(MET,'alert:'+m.type,size,w/2,yy,tw);y+=hh+10*al*ls;}}
  g=G0;g.restore();hudTrack(null);}
};
// moldura chanfrada (linguagem vetorial tática)
function chamfer(g,x,y,w,h,c,stroke,fill,lw){const pts=[[x+c,y],[x+w,y],[x+w,y+h-c],[x+w-c,y+h],[x,y+h],[x,y+c]];poly(g,pts,fill,stroke,lw);}
const HUDV={cyan:[.26,.94,.87],pink:[1,.28,.58],gold:[1,.65,.21],paper:[1,.95,.82],ink:[.03,.02,.06]};
