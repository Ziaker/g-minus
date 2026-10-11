/* P12 V2 — TELEMETRIA DERIVADA. Todo valor exibido como funcional vem daqui e é calculado do
   estado da simulação e dos registros de passagem (nenhum número fixo ou inventado). */
function crossTime(race,id,d){const k=(d-SIM.CROSS_ORIGIN)/SIM.CROSS_STEP,i=Math.floor(k),f=k-i,log=race.cross[id];if(i<0||i+1>=log.length)return NaN;const a=log[i],b=log[i+1];if(Number.isNaN(a))return NaN;if(Number.isNaN(b))return f<1e-9?a:NaN;return lerp(a,b,f);}
// intervalo real: tempo entre a passagem das duas naves pelo mesmo ponto (a nave de trás é 'behind')
function intervalBetween(race,st,front,behind){const t=raceTime(st);const tf=crossTime(race,front.id,behind.s);return Number.isNaN(tf)?NaN:Math.max(0,t-tf);}
function lapDistance(sh){return Math.max(0,sh.s-sh.lap*TRACK.L);}
// delta ao vivo contra a melhor volta anterior (ou a última), no mesmo ponto da volta
function liveDelta(race,st,sh,ref='best'){if(!sh.laps.length||sh.finished)return null;const idx=ref==='last'?sh.laps.length-1:sh.bestLapIdx;if(idx<0)return null;
 const x=lapDistance(sh),t0=crossTime(race,sh.id,idx*TRACK.L),tx=crossTime(race,sh.id,idx*TRACK.L+x);if(Number.isNaN(t0)||Number.isNaN(tx))return null;
 return (raceTime(st)-sh.lapStartT)-(tx-t0);}
const FEATURE_LABEL={corner:'Curva',loop:'Loop',jump:'Salto',dash:'Placa',recharge:'Recarga',edge:'Borda aberta',sector:'Setor',finish:'Chegada'};
function forecast(sh,range,lapsTotal){const L=TRACK.L,ls=wrap(sh.s,L),out=[],F=TRACK.features,lapIdx=Math.floor(sh.s/L);
 const push=(kind,s0,s1,data)=>{let d0=s0-ls;if(d0<-Math.max(0,(s1??s0)-s0))d0+=L;const len=Math.max(0,(s1??s0)-s0);if(d0+len<0||d0>range)return;out.push({kind,dist:d0,len,data:data||{}});};
 for(const [i,c] of F.corners.entries()){push('corner',c.s0,c.s1,{index:i,name:c.name,dir:c.dir,severity:c.severity,deg:c.deg,R:c.R,vApex:trackVlim((c.s0+c.s1)/2)*KMH});}
 push('loop',F.loop.s0,F.loop.s1,{name:'Loop Vertical'});push('jump',F.jump.lip,F.jump.land,{name:'Salto',gap:F.jump.gap});
 for(const d of F.dash)push('dash',d.s,d.s+d.len,{lane0:d.lane0,lane1:d.lane1});
 push('recharge',F.recharge.s0,F.recharge.s1,{laneMin:F.recharge.laneMin,laneMax:F.recharge.laneMax});push('edge',F.openEdge.s0,F.openEdge.s1,{side:F.openEdge.side});
 for(const sc of F.sectors)if(sc.index>1)push('sector',sc.s,null,{index:sc.index});
 const finishLap=lapIdx===lapsTotal-1;push(finishLap?'finish':'sector',0,null,{index:1,finish:finishLap});
 return out.sort((a,b)=>a.dist-b.dist);}
function telemetry(race,st,opt={}){
 const ships=st.ships,P=ships[0],t=raceTime(st),S=race.statics,L=TRACK.L;
 const phase=t<SIM.GO?'grid':P.finished?'finished':'race';
 const order=st.order,rank=P.rank,lapIdx=Math.floor(Math.max(0,P.s)/L);
 const ahead=rank>1?ships[order[rank-2]]:null,behind=rank<order.length?ships[order[rank]]:null;
 const nearby=[];
 for(const o of ships){if(o===P)continue;const ds=o.s-P.s;if(Math.abs(ds)>400)continue;
  nearby.push({id:o.id,code:S[o.id].code,isRival:S[o.id].isRival,ds,dl:o.lane-P.lane,dist:Math.hypot(ds,o.lane-P.lane),closing:(P.v-o.v)*(ds>0?1:-1),shield:o.shield,
   threat:o.side>0&&o.sideTarget===0,threatPhase:o.side,threatT:o.sideT,threatDir:o.side>0?o.sideDir:0,spin:o.spinT>0,boost:o.boostT>0,air:o.air,rank:o.rank});}
 nearby.sort((a,b)=>a.dist-b.dist);
 // janelas de ataque reais (mesmos limites da simulação)
 let sideL=-1,sideR=-1,spinN=0;for(const o of nearby){const ads=Math.abs(o.ds),adl=Math.abs(o.dl);if(ads<SIM.SIDE_RANGE_S&&adl>SIM.SIDE_MIN_LAT&&adl<SIM.SIDE_MAX_LAT){if(o.dl<0&&sideL<0)sideL=o.id;if(o.dl>0&&sideR<0)sideR=o.id;}if(o.dist<SIM.SPIN_RADIUS)spinN++;}
 const R=ships[race.rivalId],rivalGap=R.s>=P.s?intervalBetween(race,st,R,P):-intervalBetween(race,st,P,R);
 const hw=trackHw(P.s),oe=TRACK.features.openEdge,ls=wrap(P.s,L);
 const sectorIdx=P.s<0?0:Math.floor(wrap(P.s,L)/(L/3));
 const dmgAge=t-P.dmgT;
 return {t,raceT:t-SIM.GO,phase,countdown:t<SIM.GO?Math.ceil(SIM.GO-t):0,
  speed:P.v*KMH,acc:P.acc,vlim:trackVlim(P.s)*KMH,
  shield:P.shield,shieldFrom:dmgAge<1.2?Math.max(P.shield,P.dmgFrom):P.shield,dmgAge,dmgSide:P.dmgSide,dmgKind:P.lastHitKind||null,
  boost:{active:P.boostT>0,frac:P.boostT/SIM.BOOST_DUR,unlocked:lapIdx>=1,cost:SIM.BOOST_COST,count:Math.max(0,Math.floor((P.shield-SIM.SHIELD_MIN)/SIM.BOOST_COST)),cool:Math.max(0,P.boostCool-P.boostT)},
  dash:P.dashT>0,rank,total:ships.length,lap:Math.min(race.laps,lapIdx+1),laps:race.laps,lapsDone:P.lap,
  lapTime:phase==='grid'?0:P.finished?P.laps[P.laps.length-1]:t-P.lapStartT,lastLap:P.lastLap,bestLap:P.bestLap,delta:liveDelta(race,st,P,opt.deltaRef||'best'),
  sector:sectorIdx,sectors:P.sectors.slice(),lastSectors:P.lastSectors.slice(),bestSectors:P.bestSectors.slice(),
  ahead:ahead?{id:ahead.id,code:S[ahead.id].code,gap:intervalBetween(race,st,ahead,P),isRival:S[ahead.id].isRival}:null,
  behind:behind?{id:behind.id,code:S[behind.id].code,gap:intervalBetween(race,st,P,behind),isRival:S[behind.id].isRival}:null,
  leaderGap:rank>1?intervalBetween(race,st,ships[order[0]],P):0,
  nearby,sideL,sideR,spinN,
  rival:{id:R.id,code:S[R.id].code,ds:R.s-P.s,gap:rivalGap,closing:P.v-R.v,shield:R.shield},
  standings:order.slice(),
  forecast:forecast(P,opt.forecastRange||4000,race.laps),
  drift:{on:P.drifting,slip:P.slip,angle:P.slip*.38/D2R},
  air:{on:P.air,alt:P.alt},
  edge:{inZone:ls>oe.s0-P.v*1.2&&ls<oe.s1,dist:hw-SIM.HALF_WID-P.lane,side:1},
  lane:P.lane,hw,recharge:P.inRecharge,
  spin:P.spinT>0,side:P.side,sideDir:P.sideDir,
  finished:P.finished,place:P.place,finishTime:P.finishT!==null?P.finishT-SIM.GO:null,
  crit:P.crit,
  intensity:clamp(clamp((P.v*KMH-700)/800,0,1)*.45+(P.boostT>0?.3:0)+(nearby.some(o=>o.threat)?.35:0)+(P.crit?.3:0)+(lapIdx===race.laps-1?.15:0),0,1)};
}
