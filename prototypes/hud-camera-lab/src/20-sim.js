/* P12 V2 — SIMULAÇÃO VISUAL DE CORRIDA (determinística, passo fixo 120 Hz).
   É um cenário de teste para HUD e câmera: NÃO aprova física (P08), IA, energia [31–40],
   combate (P10/P11) nem regras de eliminação [17, 34, 47]. Todos os números abaixo são valores
   de teste deste laboratório. As 30 naves usam desempenho idêntico entre modelos (decisão de
   naves cosméticas): só ritmo/estilo de pilotagem de demonstração variam por competidor. */
const SIM={
 GO:4,TOP_KMH:1290,BOOST_ADD:92,BOOST_DUR:2.3,BOOST_COST:14,BOOST_COOL:1.2,
 DASH_ADD:70,DASH_DUR:.8,ACC:52,DEC:75,LAT_OMEGA:2.4,LAT_VMAX:28,
 HALF_LEN:3.6,HALF_WID:2.3,                         // volume competitivo único para todas as naves
 SIDE_RANGE_S:8,SIDE_MIN_LAT:3.2,SIDE_MAX_LAT:9.5,SIDE_WIND:.3,SIDE_LUNGE:.38,SIDE_DMG:10,SIDE_COST:3,SIDE_COOL:3,
 SPIN_DUR:1.4,SPIN_RADIUS:8,SPIN_DMG:8,SPIN_COST:6,SPIN_COOL:8,
 COL_COOL:.6,BARRIER_DMG:4,BARRIER_COOL:.7,RECHARGE_RATE:24,
 CROSS_STEP:25,CROSS_ORIGIN:-240,GRID_FRONT:-14,GRID_ROW:18,SHIELD_MIN:1,
 CRIT_ENTER:15,CRIT_EXIT:20
};
const PERSONAS=['agressivo','defensivo','técnico','oportunista'];
const DEMO_PAINT=['#2468f6','#f8c32c','#218e54','#e8452c','#7a4fd0','#12b5c9','#ff7ab6','#9bd23c','#f2f2ec','#ff9f1c','#3a3f8f','#c0305a','#2fd6a0','#6e7d99','#d9b44a','#8a2be2','#1f9fff','#ff5a36','#4caf50','#b0b7c9','#e040a0','#00b8a9','#ffd166','#5865f2','#a3e635','#f97316','#14b8a6','#ec4899','#64748b','#facc15'];
const DIST_MAX_KEYS=k=>SIM.CROSS_ORIGIN+k*SIM.CROSS_STEP;
function createRace(opt={}){
 const seed=opt.seed??20261011,laps=opt.laps??3,count=opt.ships??30;
 const rng={s:seed>>>0};
 const models=[];for(const s of SHIPS)for(const v of VARIANT_CODES)models.push([s.id,v]);
 // grid aleatório [12]; o jogador ocupa uma posição de meio de pelotão sorteada pela semente
 const order=[...Array(count).keys()];for(let i=count-1;i>0;i--){const j=Math.floor(rngNext(rng)*(i+1));[order[i],order[j]]=[order[j],order[i]];}
 const playerSlot=Math.min(count-1,Math.floor(count*.45+rngNext(rng)*count*.25));
 const pi=order.indexOf(0);[order[pi],order[playerSlot]]=[order[playerSlot],order[pi]];
 const rivalSlot=Math.min(count-1,playerSlot+1+Math.floor(rngNext(rng)*2));const rivalId=order[rivalSlot];
 const statics=[],ships=[];
 for(let id=0;id<count;id++){
  const isPlayer=id===0,isRival=id===rivalId,[ship,variant]=isPlayer?['falcon','A']:models[(id*4+1)%9];
  const paint=isPlayer?'#2468f6':DEMO_PAINT[id%DEMO_PAINT.length];
  const livery={roles:{paint,secondary:'D',accent:'D',structure:'D',glass:'D',energy:'D',marking:'D'},pinkMix:.55,shadeMix:.68,hierarchy:0,saturation:0,glow:1};
  const persona=isRival?'agressivo':PERSONAS[Math.floor(rngNext(rng)*4)];
  const code=SHIP_MAP[ship].name.split(' ').map(w=>w[0]).join('')+'-'+variant+' '+String(id).padStart(2,'0');
  statics.push({id,ship,variant,livery,code,name:isPlayer?'VOCÊ':isRival?'RIVAL '+code:code,persona,isPlayer,isRival,
   pace:isPlayer?.994:isRival?.99:rngRange(rng,.952,.992),skill:isPlayer?1.02:rngRange(rng,.95,1.03),aggr:isRival?1:persona==='agressivo'?.8:persona==='oportunista'?.55:persona==='técnico'?.25:.15,
   laneBias:rngRange(rng,-.5,.5)});
  const slot=order.indexOf(id),row=Math.floor(slot/3),col=slot%3;
  ships.push({id,s:SIM.GRID_FRONT-row*SIM.GRID_ROW,lane:(col-1)*12,laneT:(col-1)*12,v:0,vLat:0,yaw:0,roll:0,shield:100,dmgFrom:100,dmgT:-99,dmgSide:0,
   boostT:0,boostCool:0,boosts:0,dashT:0,drifting:false,slip:0,driftT:0,
   side:0,sideT:0,sideDir:0,sideTarget:-1,sideCool:2+rngNext(rng)*4,sideHit:false,spinT:0,spinCool:6+rngNext(rng)*6,spinHits:0,stunT:0,spinOutT:0,
   air:false,airS0:0,airGap:0,airH:0,alt:0,lap:0,lapStartT:SIM.GO,lastLap:null,bestLap:null,bestLapIdx:-1,laps:[],sector:0,sectorStartT:SIM.GO,sectors:[null,null,null],lastSectors:[null,null,null],bestSectors:[null,null,null],
   crossK0:true,finished:false,finishT:null,place:0,rank:slot+1,acc:0,vCap:1e9,scriptAct:null,boostT0:-99,spinT0:-99,sideT0:-99,collT0:-99,collSide:0,collDmg:0,dashT0:-99,takeoffT0:-99,landT0:-99,takeoffS:0,inRecharge:false,crit:false,crossK:0,barrierCool:0,offEdge:0});
 }
 const M=Math.ceil((laps*TRACK.L-SIM.CROSS_ORIGIN+800)/SIM.CROSS_STEP);
 const race={seed,laps,count,rivalId,playerSlot,statics,
  state:{tick:0,rng:{s:rng.s},ships,order:ships.map(s=>s.id).sort((a,b)=>ships[a].rank-ships[b].rank),contact:new Float64Array(count*count),director:directorInit(),done:false,doneTick:-1,script:{}},
  events:[],recordedTick:-1,initial:null,snapshots:new Map(),cross:statics.map(()=>new Float64Array(M).fill(NaN)),tickEvents:[]};
 race.initial=snapshotState(race.state);
 return race;
}
const raceTime=st=>st.tick*SIM_DT;
function shipProgress(sh){return sh.s;}
// referencial do mundo para uma nave (posição + base ortonormal com deriva, rolagem e voo)
function shipPose(race,sh){
 const f=trackFrame(sh.s),st=race.statics[sh.id];
 let p=vec.madd(vec.madd(f.p,f.R,sh.lane),f.N,.9+sh.alt);
 let T=f.T,N=f.N,R=f.R;
 const yaw=sh.yaw;if(yaw){T=vec.rot(T,N,yaw);R=vec.cross(T,N);}   // yaw + = nariz para a esquerda
 if(sh.roll){N=vec.rot(N,T,sh.roll);R=vec.cross(T,N);}
 return {p,T,N,R,frame:f};
}
function emit(race,type,a,b,data){race.tickEvents.push({t:raceTime(race._st),tick:race._st.tick,type,a,b,data:data||null});}
// ------------------------------------------------------------------ roteiro do jogador
// Momentos de teste ligados à pista (não a tempos fixos), para que cada semente produza situações equivalentes.
const PLAYER_SCRIPT=[
 {id:'boost-l2a',lap:1,at:120,act:'boost'},{id:'boost-l2b',lap:1,at:620,act:'boost'},
 {id:'edge-l2',lap:1,from:()=>TRACK.features.openEdge.s0-250,to:()=>TRACK.features.openEdge.s1-120,act:'edge'},
 {id:'skip-recharge-l2',lap:1,from:()=>TRACK.features.recharge.s0-200,to:()=>TRACK.features.recharge.s1,act:'avoidRecharge'},
 {id:'scrape-l2',lap:1,from:()=>{const c=TRACK.features.corners.find(c=>c.name==='Curva Inclinada');return c.s1-260;},to:()=>{const c=TRACK.features.corners.find(c=>c.name==='Curva Inclinada');return c.s1+40;},act:'scrape'},
 {id:'boost-l2c',lap:1,at:()=>TRACK.features.dash[2].s-500,act:'boost'},
 {id:'duel-l2',lap:1,from:()=>TRACK.features.corners[2].s0-700,to:()=>TRACK.features.corners[3].s1,act:'duel'},
 {id:'burn-l3',lap:2,from:100,to:()=>TRACK.features.recharge.s0-400,act:'burn'},
 {id:'recharge-l3',lap:2,from:()=>TRACK.features.recharge.s0-300,to:()=>TRACK.features.recharge.s1,act:'recharge'},
 {id:'attack-l3',lap:2,from:()=>TRACK.features.corners.find(c=>c.name==='Esse Final D').s0-900,to:()=>TRACK.features.corners.find(c=>c.name==='Esse Final E').s1,act:'hunt'},
 {id:'boost-l3d',lap:2,at:()=>TRACK.L-1500,act:'boost'}
];
const scriptVal=v=>typeof v==='function'?v():v;
function raceStep(race,st=race.state){
 race._st=st;if(st.tick%SIM_HZ===0&&!race.snapshots.has(st.tick))race.snapshots.set(st.tick,snapshotState(st));   // estado ANTES do passo
 const t=raceTime(st),dt=SIM_DT,ships=st.ships,S=race.statics,L=TRACK.L,n=ships.length;
 race.tickEvents=[];
 for(const k of [3,2,1])if(st.tick===Math.round((SIM.GO-k)*SIM_HZ))emit(race,'countdown',-1,-1,{n:k});
 if(st.tick===Math.round(SIM.GO*SIM_HZ))emit(race,'go',-1,-1,null);
 const racing=t>=SIM.GO,player=ships[0],rival=ships[race.rivalId];
 // ordem atual (do mais avançado para trás) para vizinhança
 const order=st.order,rankIdx=new Int32Array(n);for(let q=0;q<n;q++)rankIdx[order[q]]=q;
 for(const sh of ships){const sd=S[sh.id];
  if(sh.boostCool>0)sh.boostCool-=dt;if(sh.sideCool>0)sh.sideCool-=dt;if(sh.spinCool>0)sh.spinCool-=dt;if(sh.barrierCool>0)sh.barrierCool-=dt;
  if(!racing){sh.v=0;continue;}
  const lapIdx=Math.floor(sh.s/L),lapS=wrap(sh.s,L),hw=trackHw(sh.s),fl=trackFlags(sh.s);
  // -------- alvo de velocidade
  let vTop=SIM.TOP_KMH/KMH*sd.pace;
  if(sh.finished)vTop*=.62;
  // elástico de teste do rival em torno do jogador (GDD [53] ainda não especificado)
  const pAct=player.scriptAct,beside=sd.isRival&&(pAct==='duel'||pAct==='hunt');
  if(sd.isRival&&!sh.finished&&!player.finished){const gap=player.s-(beside?0:8)-sh.s;vTop*=1+clamp(gap/(beside?160:500),-.08,.1);}
  if(!sd.isPlayer&&!sd.isRival&&!sh.finished){const gap=player.s-sh.s;vTop*=1+clamp(gap/9000,-.012,.012);} // pelotão mais compacto
  let vt=Math.min(vTop,trackVlim(sh.s+sh.v*.25)*sd.skill);
  if(sh.boostT>0){vt=vTop+SIM.BOOST_ADD;sh.boostT-=dt;if(sh.boostT<=0){sh.boostT=0;emit(race,'boostEnd',sh.id,-1,null);}}
  if(sh.dashT>0){vt=Math.max(vt,vTop)+SIM.DASH_ADD;sh.dashT-=dt;}
  if(sh.stunT>0){vt*=.8;sh.stunT-=dt;}
  if(sh.air)vt=sh.v;
  const acc=sh.v<vt?Math.min(SIM.ACC*(sh.v<120?1.35:1),(vt-sh.v)*1.8+4)+(sh.boostT>0?40:0):-Math.min(SIM.DEC,(sh.v-vt)*2.4+2);
  const v0=sh.v;sh.v=Math.max(0,sh.v+acc*dt);
  // -------- deriva: excesso de velocidade em curva fechada ou impulso em curva
  const k=trackCurv(sh.s),lim=trackVlim(sh.s)*sd.skill;
  const wantDrift=!sh.air&&Math.abs(k)>1/800&&sh.v>lim*.985;
  if(wantDrift&&!sh.drifting){sh.drifting=true;sh.driftT=0;emit(race,'driftStart',sh.id,-1,{dir:Math.sign(k)});}
  if(sh.drifting){sh.driftT+=dt;const target=clamp((sh.v-lim*.9)/(lim*.18),.2,1)*Math.sign(k);sh.slip=damp(sh.slip,target,6,dt);
   if(!wantDrift&&sh.driftT>.25){sh.drifting=false;emit(race,'driftEnd',sh.id,-1,{t:sh.driftT});}}
  else sh.slip=damp(sh.slip,0,5,dt);
  // -------- linha de corrida, ultrapassagem, recarga e roteiro (decisões a 40 Hz, escalonadas por nave)
  let laneT,script,vCap=1e9;const rz=TRACK.features.recharge;
  if((st.tick+sh.id)%3===0){
  const ahead=k?-Math.sign(k)*hw*.45:0;           // interior da curva (esquerda = faixa negativa)
  laneT=clamp(ahead+sd.laneBias*hw*.5,-hw+4,hw-4);
  if(fl&TF.dash||trackFlags(sh.s+250)&TF.dash)laneT=sd.laneBias*6;
  const inRZ=lapS>=rz.s0-250&&lapS<rz.s1;
  let wantRecharge=!sd.isPlayer&&sh.shield<58;
  // roteiro do jogador
  script=null;
  if(sd.isPlayer&&!sh.finished){for(const b of PLAYER_SCRIPT){if(b.lap!==lapIdx)continue;
    if(b.at!==undefined){const at=scriptVal(b.at);if(lapS>=at&&lapS<at+400&&!st.script[b.id]){if(sh.boostCool<=0&&sh.boostT<=0&&sh.shield>SIM.BOOST_COST+2){st.script[b.id]=1;startBoost(race,sh);}}}
    else if(lapS>=scriptVal(b.from)&&lapS<scriptVal(b.to)){script=b.act;if(!st.script[b.id]){st.script[b.id]=1;emit(race,'script',sh.id,-1,{id:b.id,act:b.act});}}}
   if(script==='burn'&&!sh.crit&&sh.boostCool<=0&&sh.boostT<=0&&sh.shield>SIM.BOOST_COST+1)startBoost(race,sh);
   if(script==='recharge')wantRecharge=sh.shield<70;
   if(script==='avoidRecharge')wantRecharge=false;
   if(script==='edge')laneT=hw-3.4;
   if(script==='scrape')laneT=hw+2;
  }
  if(inRZ&&wantRecharge)laneT=(rz.laneMin+rz.laneMax)/2;
  if(beside&&Math.abs(player.s-sh.s)<60){const side=player.lane>0?-1:1;laneT=clamp(player.lane+side*6.2,-hw+3,hw-3);}
  // evitação: nave à frente na mesma faixa e mais lenta
  {const idx=rankIdx[sh.id];
   // 1) nave à frente na mesma faixa: troca de faixa e controle de distância
   for(let q=idx-1;q>=0&&q>=idx-6;q--){const o=ships[order[q]];const ds_=o.s-sh.s;if(ds_>80)break;if(ds_<=0||o.air!==sh.air)continue;
    if(Math.abs(o.lane-sh.lane)<5.4&&sh.v>o.v-4){
     if(!script||script==='recharge'||script==='hunt'){const room=o.lane>sh.lane?-1:1,alt=clamp(o.lane+room*7,-hw+3,hw-3);laneT=Math.abs(alt-o.lane)>5.4?alt:clamp(o.lane-room*7,-hw+3,hw-3);}
     if(ds_<45)vCap=Math.min(vCap,o.v+(ds_-14)*.9);}}
   // 2) não fechar a porta: naves lado a lado limitam o alvo lateral
   if(sh.side!==2)for(let q=Math.max(0,idx-4);q<=Math.min(n-1,idx+4);q++){const o=ships[order[q]];if(o===sh||Math.abs(o.s-sh.s)>13||o.air!==sh.air)continue;const dl=o.lane-sh.lane,want=laneT-sh.lane;
    if(Math.sign(dl)===Math.sign(want)&&Math.abs(dl)<Math.abs(want)+5.2)laneT=o.lane-Math.sign(dl)*5.4;}
  }
   sh.laneT=laneT;sh.vCap=vCap;sh.scriptAct=script;}
  else{laneT=sh.laneT;vCap=sh.vCap;script=sh.scriptAct;}
  vt=Math.min(vt,vCap);if(sh.v>vt){sh.v=Math.max(vt,sh.v-SIM.DEC*dt);}
  // ataque lateral (fases: telegrafia → investida → recuperação)
  if(sh.side===1){sh.sideT+=dt;if(sh.sideT>=SIM.SIDE_WIND){sh.side=2;sh.sideT=0;sh.sideT0=t;sh.vLat=sh.sideDir*24;emit(race,'sideLunge',sh.id,sh.sideTarget,{dir:sh.sideDir});}}
  else if(sh.side===2){sh.sideT+=dt;laneT=sh.lane+sh.sideDir*6;const tg=ships[sh.sideTarget];
   if(!sh.sideHit&&tg&&Math.abs(tg.s-sh.s)<SIM.HALF_LEN*2&&Math.abs(tg.lane-sh.lane)<SIM.HALF_WID*2+.6&&!tg.air){sh.sideHit=true;hitShip(race,tg,SIM.SIDE_DMG,-sh.sideDir,'side',sh.id);tg.vLat+=sh.sideDir*16;tg.spinOutT=tg.shield<40?.7:0;tg.stunT=.45;emit(race,'sideHit',sh.id,tg.id,{dir:sh.sideDir,dmg:SIM.SIDE_DMG});}
   if(sh.sideT>=SIM.SIDE_LUNGE){if(!sh.sideHit)emit(race,'sideMiss',sh.id,sh.sideTarget,{dir:sh.sideDir});sh.side=0;sh.sideT=0;sh.sideTarget=-1;sh.sideCool=SIM.SIDE_COOL;}}
  else if((st.tick+sh.id)%6===0&&sh.sideCool<=0&&!sh.air&&!sh.finished&&sh.spinT<=0&&sh.shield>SIM.SIDE_COST+8){
   // escolha de alvo
   let best=-1,bd=1e9;const idx=rankIdx[sh.id];
   for(let q=Math.max(0,idx-3);q<=Math.min(n-1,idx+3);q++){const o=ships[order[q]];if(o===sh||o.finished||o.air)continue;const dsx=Math.abs(o.s-sh.s),dl=o.lane-sh.lane;
    if(dsx<SIM.SIDE_RANGE_S&&Math.abs(dl)>SIM.SIDE_MIN_LAT&&Math.abs(dl)<SIM.SIDE_MAX_LAT&&dsx+Math.abs(dl)<bd){bd=dsx+Math.abs(dl);best=o.id;}}
   const dt6=dt*6;let p=sd.aggr*.22*dt6;if(sd.isRival&&best===0)p=(pAct==='duel'?5:2.2)*dt6;if(sd.isPlayer)p=script==='hunt'&&best>=0?(best===race.rivalId?6:2.5)*dt6:0;
   if(!sd.isPlayer&&best===0&&lapIdx<1&&!(sd.isRival&&pAct==='duel'))p*=.15;                  // primeira volta: disputa sem assédio constante ao jogador
   if(best>=0&&rngNext(st.rng)<p){sh.side=1;sh.sideT=0;sh.sideTarget=best;sh.sideDir=Math.sign(ships[best].lane-sh.lane)||1;sh.sideHit=false;sh.shield=Math.max(SIM.SHIELD_MIN,sh.shield-SIM.SIDE_COST);emit(race,'sideWindup',sh.id,best,{dir:sh.sideDir});}
  }
  // ataque giratório
  if(sh.spinT>0){sh.spinT-=dt;for(const o of ships){if(o===sh||o.air||(sh.spinHits&(1<<o.id)))continue;const d=Math.hypot(o.s-sh.s,o.lane-sh.lane);if(d<SIM.SPIN_RADIUS){sh.spinHits|=(1<<o.id);const dir=Math.sign(o.lane-sh.lane)||1;hitShip(race,o,SIM.SPIN_DMG,-dir,'spin',sh.id);o.vLat+=dir*12;o.stunT=.35;emit(race,'spinHit',sh.id,o.id,{dir,dmg:SIM.SPIN_DMG});}}
   if(sh.spinT<=0){sh.spinT=0;emit(race,'spinEnd',sh.id,-1,null);}}
  else if((st.tick+sh.id)%6===3&&sh.spinCool<=0&&!sh.air&&!sh.finished&&sh.side===0&&sh.shield>SIM.SPIN_COST+10){
   let near=0;const idx=rankIdx[sh.id];for(let q=Math.max(0,idx-4);q<=Math.min(n-1,idx+4);q++){const o=ships[order[q]];if(o!==sh&&!o.air&&Math.abs(o.s-sh.s)<SIM.SPIN_RADIUS&&Math.hypot(o.s-sh.s,o.lane-sh.lane)<SIM.SPIN_RADIUS*.9)near++;}
   const p=sd.isPlayer?(script==='hunt'&&near>=1?3*dt*6:0):near>=2?sd.aggr*.18*dt*6:0;
   if(near&&rngNext(st.rng)<p){sh.spinT=SIM.SPIN_DUR;sh.spinT0=t;sh.spinHits=0;sh.spinCool=SIM.SPIN_COOL;sh.shield=Math.max(SIM.SHIELD_MIN,sh.shield-SIM.SPIN_COST);emit(race,'spinStart',sh.id,-1,{near});}}
  // impulso (IA): a partir da volta 2, em reta, com escudo suficiente
  if((st.tick+sh.id)%6===1&&!sd.isPlayer&&lapIdx>=1&&!sh.finished&&sh.boostT<=0&&sh.boostCool<=0&&Math.abs(k)<1/1500&&sh.shield>48&&!sh.air){if(rngNext(st.rng)<(.05+sd.aggr*.12)*dt*6)startBoost(race,sh);}
  // -------- dinâmica lateral (mola crítica limitada)
  sh.laneT=laneT;
  if(!sh.air){const [nl,nv]=springStep(sh.lane,sh.vLat,laneT,SIM.LAT_OMEGA*(sh.stunT>0?.5:1),dt);sh.vLat=clamp(nv,-SIM.LAT_VMAX,SIM.LAT_VMAX);sh.lane=sh.lane+sh.vLat*dt;}
  const flags=trackFlags(sh.s),lim2=hw-SIM.HALF_WID;
  if(sh.lane>lim2||sh.lane<-lim2){const side=Math.sign(sh.lane);const open=(side>0&&!(flags&TF.barrierR))||(side<0&&!(flags&TF.barrierL));
   if(!open||sh.air){sh.lane=side*lim2;if(sh.vLat*side>0)sh.vLat=-sh.vLat*.3;if(!sh.air&&sh.barrierCool<=0){sh.barrierCool=SIM.BARRIER_COOL;sh.v*=.94;sh.collT0=t;sh.collSide=side;sh.collDmg=SIM.BARRIER_DMG;hitShip(race,sh,SIM.BARRIER_DMG,side,'barrier',-1);emit(race,'barrier',sh.id,-1,{side,dmg:SIM.BARRIER_DMG});}}
   else{// borda aberta: o laboratório não decide queda/eliminação; a nave é contida na linha da borda
    sh.lane=side*lim2;sh.vLat=Math.min(0,sh.vLat*side)*side;sh.offEdge+=dt;}}
  // -------- avanço longitudinal, salto e voltas
  const s0=sh.s;sh.s+=sh.v*dt;
  const J=TRACK.features.jump,ls0=wrap(s0,L),ls1=wrap(sh.s,L);
  if(!sh.air&&ls0<J.lip&&ls1>=J.lip&&racing){sh.air=true;sh.takeoffT0=t;sh.takeoffS=sh.s-(ls1-J.lip);sh.airS0=sh.s-(ls1-J.lip);sh.airGap=J.gap;sh.airH=6+sh.v*.02;emit(race,'takeoff',sh.id,-1,{v:sh.v,h:sh.airH});}
  if(sh.air){const u=(sh.s-sh.airS0)/sh.airGap;if(u>=1){sh.air=false;sh.landT0=t;sh.alt=0;sh.v*=.985;emit(race,'landing',sh.id,-1,{v:sh.v});}else sh.alt=sh.airH*4*u*(1-u);}
  // placas de aceleração
  if(!sh.air&&(flags&TF.dash)&&sh.dashT<=0){for(const d of TRACK.features.dash){if(ls1>=d.s&&ls1<d.s+d.len&&sh.lane>=d.lane0&&sh.lane<=d.lane1){sh.dashT=SIM.DASH_DUR;sh.dashT0=t;emit(race,'dash',sh.id,-1,null);break;}}}
  // recarga
  const rech=!sh.air&&(flags&TF.recharge)&&sh.lane>=rz.laneMin-1&&sh.lane<=rz.laneMax+1;
  if(rech&&!sh.inRecharge)emit(race,'rechargeIn',sh.id,-1,null);if(!rech&&sh.inRecharge)emit(race,'rechargeOut',sh.id,-1,{shield:sh.shield});
  sh.inRecharge=!!rech;if(rech)sh.shield=Math.min(100,sh.shield+SIM.RECHARGE_RATE*dt);
  // limiar crítico com histerese
  if(!sh.crit&&sh.shield<SIM.CRIT_ENTER){sh.crit=true;emit(race,'shieldCritical',sh.id,-1,{on:true,shield:sh.shield});}
  if(sh.crit&&sh.shield>SIM.CRIT_EXIT){sh.crit=false;emit(race,'shieldCritical',sh.id,-1,{on:false,shield:sh.shield});}
  // registro de passagem (intervalos reais entre naves)
  const log=race.cross[sh.id];if(sh.crossK0){sh.crossK0=false;while(sh.crossK<log.length&&DIST_MAX_KEYS(sh.crossK)<=s0)sh.crossK++;}   // posições do grid não geram passagens
  while(sh.crossK<log.length&&DIST_MAX_KEYS(sh.crossK)<=sh.s){const d=DIST_MAX_KEYS(sh.crossK);log[sh.crossK]=t+dt*((d-s0)/Math.max(1e-9,sh.s-s0));sh.crossK++;}
  // setores e voltas
  if(!sh.finished&&sh.s>=0){const third=L/3,sec=Math.floor(sh.s/third),old=Math.floor(Math.max(0,s0)/third);
   if(s0<0&&sh.s>=0){sh.lapStartT=t+dt*((0-s0)/(sh.s-s0));sh.sectorStartT=sh.lapStartT;emit(race,'lapStart',sh.id,-1,{lap:1});}
   else if(sec>old){const tc=t+dt*((sec*third-s0)/(sh.s-s0)),si=old%3,stime=tc-sh.sectorStartT;sh.sectors[si]=stime;if(sh.bestSectors[si]===null||stime<sh.bestSectors[si])sh.bestSectors[si]=stime;sh.sectorStartT=tc;emit(race,'sector',sh.id,-1,{sector:si+1,time:stime,best:sh.bestSectors[si]===stime});
    if(si===2){const lt=tc-sh.lapStartT;sh.lap++;sh.laps.push(lt);sh.lastLap=lt;const best=sh.bestLap===null||lt<sh.bestLap;if(best){sh.bestLap=lt;sh.bestLapIdx=sh.lap-1;}sh.lastSectors=sh.sectors.slice();sh.sectors=[null,null,null];sh.lapStartT=tc;
     emit(race,'lap',sh.id,-1,{lap:sh.lap,time:lt,best,delta:sh.laps.length>1?lt-Math.min(...sh.laps.slice(0,-1)):null});
     if(sh.lap>=race.laps){sh.finished=true;sh.finishT=tc;emit(race,'finish',sh.id,-1,{time:tc-SIM.GO});}
     else if(sh.lap===race.laps-1)emit(race,'finalLap',sh.id,-1,null);}}}
  sh.acc=(sh.v-v0)/dt;
  // -------- pose visual: deriva, giro, rolagem
  sh.yaw=sh.slip*.38;                                   // + = nariz para a esquerda (mesma convenção do drift do 04 V2)
  if(sh.spinOutT>0){sh.spinOutT-=dt;sh.yaw+=TAU*(1-Math.max(0,sh.spinOutT)/.7);}
  sh.roll=clamp(-sh.vLat*.012,-.35,.35)*(sh.air?.4:1);
 }
 // -------- colisões entre vizinhos ordenados (resposta pontual com intervalo por par)
 const cc=st.contact;   // instante até o qual o par está em intervalo de contato
 const ord=[...order].sort((a,b)=>ships[b].s-ships[a].s||a-b);
 for(let a=0;a<ord.length;a++){const A=ships[ord[a]];for(let b=a+1;b<ord.length;b++){const B=ships[ord[b]];const dsx=A.s-B.s;if(dsx>SIM.HALF_LEN*2)break;if(A.air!==B.air||!racing)continue;const dl=B.lane-A.lane;
   if(Math.abs(dl)<SIM.HALF_WID*2){const key=Math.min(A.id,B.id)*n+Math.max(A.id,B.id),push=(SIM.HALF_WID*2-Math.abs(dl))*.5,dir=Math.sign(dl)||1;
    A.lane-=dir*push;B.lane+=dir*push;
    const rv=Math.abs(A.v-B.v)+Math.abs(A.vLat-B.vLat)*1.2;
    if(cc[key]<=t&&rv>7){cc[key]=t+SIM.COL_COOL;const dmg=Math.min(12,1+rv*.1);
     const tv=(A.v+B.v)/2;A.v=lerp(A.v,tv,.25);B.v=lerp(B.v,tv,.25);A.vLat-=dir*6;B.vLat+=dir*6;
     A.collT0=B.collT0=t;A.collSide=dir;B.collSide=-dir;A.collDmg=B.collDmg=dmg;hitShip(race,A,dmg,dir,'collision',B.id);hitShip(race,B,dmg,-dir,'collision',A.id);emit(race,'collision',A.id,B.id,{dir,dmg,rv});}}}}
 // -------- classificação: chegada por tempo exato; demais por progresso
 const rank=[...order].sort((a,b)=>{const A=ships[a],B=ships[b];if(A.finished||B.finished){if(A.finished&&B.finished)return A.finishT-B.finishT||a-b;return A.finished?-1:1;}return B.s-A.s||a-b;});
 for(let i=0;i<rank.length;i++){const sh=ships[rank[i]];if(sh.rank!==i+1&&racing){if(rank[i]===0)emit(race,'position',0,-1,{from:sh.rank,to:i+1});}sh.rank=i+1;if(sh.finished&&!sh.place)sh.place=i+1;}
 // ultrapassagens que envolvem o jogador (quem passou quem)
 if(racing){const prev=st.order;const pPrev=prev.indexOf(0),pNow=rank.indexOf(0);if(pNow<pPrev){for(let q=pNow+1;q<=pPrev;q++)emit(race,'overtake',0,rank[q],null);}else if(pNow>pPrev){for(let q=pPrev;q<pNow;q++)emit(race,'overtaken',rank[q],0,null);}}
 st.order=rank;
 directorTick(race,st.director);
 // registro imutável de eventos
 if(st.tick>race.recordedTick){for(const e of race.tickEvents)race.events.push(e);race.recordedTick=st.tick;}
 st.tick++;
 if(!st.done&&player.finished&&ships.every(s=>s.finished||raceTime(st)>player.finishT+40)){st.done=true;st.doneTick=st.tick;}
}
function startBoost(race,sh){sh.boostT0=raceTime(race._st);sh.boostT=SIM.BOOST_DUR;sh.boostCool=SIM.BOOST_DUR+SIM.BOOST_COOL;sh.boosts++;sh.shield=Math.max(SIM.SHIELD_MIN,sh.shield-SIM.BOOST_COST);emit(race,'boostStart',sh.id,-1,{cost:SIM.BOOST_COST,shield:sh.shield});}
function hitShip(race,sh,dmg,side,kind,by){if(sh.finished)dmg=0;const t=raceTime(race._st);
 // trilha de dano: valor antes do impacto (para a barra "fantasma" do HUD)
 if(t-sh.dmgT>.6)sh.dmgFrom=sh.shield;sh.dmgT=t;sh.dmgSide=side;sh.shield=Math.max(SIM.SHIELD_MIN,sh.shield-dmg);sh.lastHitKind=kind;sh.lastHitBy=by;}
// ------------------------------------------------------------------ snapshots e busca
function snapshotState(st){return {tick:st.tick,rng:{s:st.rng.s},ships:st.ships.map(s=>({...s,laps:s.laps.slice(),sectors:s.sectors.slice(),lastSectors:s.lastSectors.slice(),bestSectors:s.bestSectors.slice()})),order:st.order.slice(),contact:Float64Array.from(st.contact),director:directorClone(st.director),done:st.done,doneTick:st.doneTick,script:{...st.script}};}
function restoreState(race,snap){const c=snapshotState(snap);race.state=c;}
// avança até o fim (ou até maxTicks); usado para pré-calcular a corrida e os marcadores da linha do tempo
function raceRun(race,maxTicks=Infinity,st=race.state){let k=0;while(!st.done&&k<maxTicks){raceStep(race,st);k++;}return st.done;}
function raceSeek(race,tick,onTick){tick=Math.max(0,Math.round(tick));let key=Math.floor(tick/SIM_HZ)*SIM_HZ;while(key>0&&!race.snapshots.has(key))key-=SIM_HZ;
 const base=race.snapshots.get(key)||race.initial;restoreState(race,base);
 while(race.state.tick<tick){raceStep(race);if(onTick)onTick(race);}}
function stateDigest(st){const v=[st.tick,st.rng.s];for(const s of st.ships)v.push(s.s,s.lane,s.v,s.vLat,s.shield,s.lap,s.rank,s.boostT,s.slip,s.alt,s.side,s.spinT);return stateHash(v);}
const eventsUpTo=(race,t)=>{let lo=0,hi=race.events.length;while(lo<hi){const m=(lo+hi)>>1;if(race.events[m].t<=t+1e-9)lo=m+1;else hi=m;}return lo;};
// ------------------------------------------------------------------ cenários reproduzíveis (marcadores na corrida canônica)
const SCENARIOS=[
 {id:'start',name:'Largada',desc:'Contagem, grid aleatório e primeira aceleração.',find:()=>0},
 {id:'traffic',name:'Tráfego intenso',desc:'Pelotão compacto na chicane estreita da volta 1.',find:r=>firstEv(r,e=>e.type==='overtake'&&e.t>SIM.GO+8,-1.5)},
 {id:'highspeed',name:'Alta velocidade',desc:'Impulso duplo na reta principal (volta 2).',find:r=>firstEv(r,e=>e.type==='boostStart'&&e.a===0,-1)},
 {id:'loop',name:'Loop vertical',desc:'Entrada no loop: referencial invertido, câmera e HUD.',find:r=>crossT(r,0,TRACK.L+TRACK.features.loop.s0)-1.2},
 {id:'jump',name:'Salto',desc:'Decolagem, voo e pouso no vão de 340 m.',find:r=>firstEv(r,e=>e.type==='takeoff'&&e.a===0,-1.6)},
 {id:'defense',name:'Defesa',desc:'O rival telegrafa um ataque lateral contra você.',find:r=>firstEv(r,e=>e.type==='sideWindup'&&e.b===0,-1.8)},
 {id:'impact',name:'Impacto',desc:'Raspagem na barreira na saída da curva inclinada.',find:r=>firstEv(r,e=>e.type==='barrier'&&e.a===0,-1.2)},
 {id:'edge',name:'Borda aberta',desc:'Trecho sem barreira: aviso de saída de pista.',find:r=>firstEv(r,e=>e.type==='script'&&e.a===0&&e.data.act==='edge',1)},
 {id:'lowenergy',name:'Baixa energia',desc:'Escudo crítico após impulsos; recarga na volta 3.',find:r=>firstEv(r,e=>e.type==='shieldCritical'&&e.a===0&&e.data.on,-1.4)},
 {id:'duel',name:'Disputa',desc:'Você caça o rival no Esse final (ataque lateral/giratório).',find:r=>firstEv(r,e=>(e.type==='sideWindup'||e.type==='spinStart')&&e.a===0,-2)},
 {id:'finallap',name:'Volta final',desc:'Transição para a última volta.',find:r=>firstEv(r,e=>e.type==='finalLap'&&e.a===0,-2.5)},
 {id:'finish',name:'Conclusão',desc:'Linha de chegada e resultado (cenário de teste).',find:r=>firstEv(r,e=>e.type==='finish'&&e.a===0,-5)}
];
function firstEv(r,pred,lead){const e=r.events.find(pred);return e?Math.max(0,e.t+lead):null;}
function crossT(r,id,d){const k=(d-SIM.CROSS_ORIGIN)/SIM.CROSS_STEP,i=Math.floor(k),f=k-i,log=r.cross[id];if(i<0||i+1>=log.length||Number.isNaN(log[i+1]))return null;return lerp(log[i],log[i+1],f);}
