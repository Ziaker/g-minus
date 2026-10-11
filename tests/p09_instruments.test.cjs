// P09 etapa 0 — testes dos instrumentos (não testam pistas do P09, que ainda não existem).
const test=require('node:test'),assert=require('node:assert/strict');
const I='../prototypes/p09-reference-circuit/instruments/';
const {loadP08}=require(I+'load-p08.cjs');
const {buildSurface}=require(I+'surface.cjs');
const {meshDiff}=require(I+'compat.cjs');
const {coverage,transitions}=require(I+'geometry.cjs');
const {makeLapTimer}=require(I+'timing.cjs');
const {makeTracker}=require(I+'frame.cjs');
const {makeClassifier}=require(I+'detach.cjs');
const {runPilot}=require(I+'pilot.cjs');
const {flatPad,measure}=require(I+'envelope.cjs');

const {P,cfg,profile,air}=loadP08();
const C=new P.Course();
const intentional=st=>st.zone===7||st.zone===8;

test('P09-0 · camada 2 reconstrói a malha do P08 bit a bit',()=>{
 const R=buildSurface(C.stations,C.zones);const d=meshDiff(C,R);
 assert.equal(d.triangles[0],d.triangles[1]);assert.equal(d.different,0);});

test('P09-0 · estados físicos idênticos passo a passo na malha reconstruída (parede e rampa com boost)',()=>{
 const R=buildSurface(C.stations,C.zones);
 for(const [zone,speed,inp] of [[4,300,s=>({throttle:true,steer:Math.sin(s.time*3)>0?1:-1})],[7,230,s=>({throttle:true,boost:s.tick===120,keys:s.contact?[]:['ArrowUp']})]]){
  const a=P.fresh(C,'A',cfg,zone,speed,8,profile),b=P.fresh(R,'A',cfg,zone,speed,8,profile);
  for(let k=0;k<500;k++){P.step(C,a,cfg,inp(a),profile,{air});P.step(R,b,cfg,inp(b),profile,{air});
   assert.equal(JSON.stringify({...a,trace:0}),JSON.stringify({...b,trace:0}),'zona '+zone+' passo '+k);}}});

test('P09-0 · validador geométrico: cobertura total e transições abruptas detectadas',()=>{
 const cov=coverage(C,{every:4});assert.equal(cov.falhas,0);assert.ok(cov.erroNormalMax<1,'erro de normal '+cov.erroNormalMax);
 const t=transitions(C,{top:4}).maiores;assert.ok(t.some(j=>j.zone===5&&j.raioApos===190),'entrada do loop R=190');});

test('P09-0 · cronômetro: instante exato analítico e passagem à ré não conta volta',()=>{
 const line={p:[0,0,100],f:[0,0,1],r:[1,0,0],n:[0,1,0]};
 const t=makeLapTimer(line),z0=37.3,v=600;for(let k=0;k<=60;k++)t.sample([0,2.1,z0+v*k*P.DT],k*P.DT);
 assert.equal(t.crossings.length,1);assert.ok(Math.abs(t.crossings[0].time-(100-z0)/v)<1e-12);
 const r=makeLapTimer(line);const path=[90,95,101,99,95,99,102,106];path.forEach((z,i)=>r.sample([0,2.1,z],i*P.DT));
 assert.equal(r.laps(),1,'só a primeira passagem para a frente conta');assert.ok(r.warnings.some(w=>w.type==='sentido_contrario'));
 const off=makeLapTimer(line,{halfWidth:48});[90,110].forEach((z,i)=>off.sample([60,2.1,z],i*P.DT));assert.equal(off.laps(),0,'fora da largura não conta');});

function classify(zone,speed,ticks,input){const tr=makeTracker(C),cl=makeClassifier(C,tr,{intentional});const s=P.fresh(C,'A',cfg,zone,speed,8,profile);
 for(let k=0;k<ticks&&!s.stopped;k++)cl.step(s,cfg,input(s,k),profile,{air});return cl;}

test('P09-0 · classificador: borda, limite de reação, trecho intencional e impulso de teste',()=>{
 const wall=classify(4,300,400,()=>({throttle:true}));assert.equal(wall.events[0].cause,'saida_borda');
 const tube=classify(6,250,600,(s,k)=>({throttle:true,keys:k>=40&&k<160?['ArrowRight']:[]}));
 assert.ok(tube.events.length>0&&tube.events.every(e=>e.cause==='limite_reacao'&&e.reactionNeeded>cfg.magnet));
 const ramp=classify(7,230,600,()=>({throttle:true}));assert.equal(ramp.events[0].cause,'intencional');
 const rel=classify(0,180,120,(s,k)=>({throttle:true,release:k===30}));assert.equal(rel.events[0].cause,'liberacao_teste');
 for(const c of [wall,tube,ramp,rel])assert.equal(c.summary().candidatosInjustificados,0);});

test('P09-0 · piloto de teste: parede 90° → loop com atraso de 250 ms; sem direção não completa',()=>{
 const end=C.zones[6].station-3;
 const ok=runPilot(C,{zone:4,speed:500,untilStation:end,pilot:{delayMs:250},intentional});assert.equal(ok.concluiu,true);assert.equal(ok.desprendimentos.total,0);
 const none=runPilot(C,{zone:4,speed:500,untilStation:end,pilot:{deadband:1e9},intentional,maxTicks:600});assert.notEqual(none.concluiu,true);});

test('P09-0 · envelope de curva: velocidade estabilizada e raio decrescente com a direção',()=>{
 const pad=flatPad(),a=measure(pad,500,.25),b=measure(pad,500,.5),c=measure(pad,500,1);
 assert.ok(a.estabilizada&&b.estabilizada);assert.ok(a.raio>b.raio&&b.raio>c.raio);assert.ok(b.raio>400&&b.raio<900,'R '+b.raio);
 assert.ok([a,b,c].every(x=>x.emContato));});
