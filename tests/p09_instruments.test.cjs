// P09 etapa 0 — testes dos instrumentos (não testam pistas do P09, que ainda não existem).
const test=require('node:test'),assert=require('node:assert/strict');
const I='../prototypes/p09-reference-circuit/instruments/';
const {loadP08}=require(I+'load-p08.cjs');
const {buildSurface}=require(I+'surface.cjs');
const {meshDiff,runCompare}=require(I+'compat.cjs');
const {coverage,transitions}=require(I+'geometry.cjs');
const {makeLapTimer}=require(I+'timing.cjs');
const {makeTracker}=require(I+'frame.cjs');
const {makeClassifier,p08IntentionalSegments}=require(I+'detach.cjs');
const {runPilot}=require(I+'pilot.cjs');
const {flatPad,measure}=require(I+'envelope.cjs');
const {determinism,SCENARIOS}=require(I+'determinism.cjs');
const {profileSubsystems,profilingIsTransparent}=require(I+'profile.cjs');
const {benchmark,stoppedStepCost}=require(I+'perf.cjs');

const {P,cfg,profile,air}=loadP08();
const C=new P.Course();
const segs=p08IntentionalSegments(C);

test('P09-0 · camada 2 reconstrói a malha do P08 bit a bit',()=>{
 const R=buildSurface(C.stations,C.zones);const d=meshDiff(C,R);
 assert.equal(d.triangles[0],d.triangles[1]);assert.equal(d.different,0);});

test('P09-0 · os 13 cenários equivalentes produzem estados físicos idênticos em todos os passos',()=>{
 const r=runCompare();assert.equal(r.malha.different,0);assert.equal(r.cenarios.length,13);
 for(const c of r.cenarios)assert.equal(c.identico,true,c.cenario+': primeira diferença no passo '+c.primeiraDiferenca);
 assert.equal(r.equivalente,true);});

test('P09-0 · validador geométrico: cobertura com tubo parcial, cobertura incompleta e transições abruptas',()=>{
 const cov=coverage(C,{every:4});assert.equal(cov.falhas,0);assert.equal(cov.completa,true);
 assert.ok(cov.porCategoria.tuboParcial.secoes>0&&cov.porCategoria.tuboParcial.amostras>0,'transições 0 < tube < 1 amostradas');
 assert.ok(cov.porCategoria.tuboFechado.secoes>0&&cov.porCategoria.plana.secoes>0);
 assert.ok(cov.erroNormalMax.plana<1&&cov.erroNormalMax.tuboFechado<1&&cov.erroNormalMax.tuboParcial<2,JSON.stringify(cov.erroNormalMax));
 assert.ok(cov.tuboParcialDecomposicao.erroNoPlanoDaSecao<1);
 // seção de tubo parcial impossível de amostrar → cobertura declarada incompleta, nunca 100 %
 const stub={stations:[{p:[0,0,0],f:[0,0,1],n:[0,1,0],r:[NaN,NaN,NaN],s:0,zone:0,gap:false,tube:.5}],surface:()=>null,tubeRadius:26};
 const bad=coverage(stub,{every:1});assert.equal(bad.completa,false);assert.ok(bad.naoAmostradas>0);assert.match(bad.observacao,/INCOMPLETA/);
 const t=transitions(C,{top:4}).maiores;assert.ok(t.some(j=>j.zone===5&&j.raioApos===190),'entrada do loop R=190');});

test('P09-0 · cronômetro: instante exato analítico e passagem à ré não conta volta',()=>{
 const line={p:[0,0,100],f:[0,0,1],r:[1,0,0],n:[0,1,0]};
 const t=makeLapTimer(line),z0=37.3,v=600;for(let k=0;k<=60;k++)t.sample([0,2.1,z0+v*k*P.DT],k*P.DT);
 assert.equal(t.crossings.length,1);assert.ok(Math.abs(t.crossings[0].time-(100-z0)/v)<1e-12);
 const r=makeLapTimer(line);const path=[90,95,101,99,95,99,102,106];path.forEach((z,i)=>r.sample([0,2.1,z],i*P.DT));
 assert.equal(r.laps(),1,'só a primeira passagem para a frente conta');assert.ok(r.warnings.some(w=>w.type==='sentido_contrario'));
 const off=makeLapTimer(line,{halfWidth:48});[90,110].forEach((z,i)=>off.sample([60,2.1,z],i*P.DT));assert.equal(off.laps(),0,'fora da largura não conta');});

function classify(zone,speed,ticks,input,intentionalSegments=segs){const tr=makeTracker(C),cl=makeClassifier(C,tr,{intentionalSegments});const s=P.fresh(C,'A',cfg,zone,speed,8,profile);
 for(let k=0;k<ticks&&!s.stopped;k++)cl.step(s,cfg,input(s,k),profile,{air});return cl;}

test('P09-0 · classificador: borda, limite de reação, trecho intencional e impulso de teste',()=>{
 const wall=classify(4,300,400,()=>({throttle:true}));assert.equal(wall.events[0].cause,'saida_borda');
 const tube=classify(6,250,600,(s,k)=>({throttle:true,keys:k>=40&&k<160?['ArrowRight']:[]}));
 assert.ok(tube.events.length>0&&tube.events.every(e=>e.cause==='limite_reacao'&&e.reactionNeeded>cfg.magnet));
 const ramp=classify(7,230,600,()=>({throttle:true}));const e=ramp.events[0];
 assert.equal(e.cause,'intencional');assert.equal(e.trecho.id,'p08-borda-e-lacuna');assert.ok(e.trecho.motivo.length>0);assert.equal(e.posicao.length,3);
 assert.ok(e.station>=segs[0].from&&e.station<=segs[0].to);
 const rel=classify(0,180,120,(s,k)=>({throttle:true,release:k===30}));assert.equal(rel.events[0].cause,'liberacao_teste');
 for(const c of [wall,tube,ramp,rel])assert.equal(c.summary().candidatosInjustificados,0);});

test('P09-0 · classificador: intencional só em trecho marcado, nunca pela zona inteira',()=>{
 // sem trecho marcado, a mesma decolagem não é intencional (sem superfície = candidato a injustificado)
 const unmarked=classify(7,230,600,()=>({throttle:true}),[]);assert.equal(unmarked.events[0].cause,'sem_superficie');assert.equal(unmarked.events[0].unjustifiedCandidate,true);
 // saída lateral dentro de um trecho marcado continua sendo saída pela borda
 const wide=[{id:'rampa-inteira',from:C.zones[7].station,to:C.zones[9].station-1,kind:'rampa_lancamento',motivo:'teste'}];
 const side=classify(7,230,400,()=>({throttle:true,steer:1}),wide);assert.equal(side.events[0].cause,'saida_borda');
 assert.equal(side.events[0].trecho.id,'rampa-inteira','contexto do trecho registrado');assert.equal(side.events[0].mecanismoEsperado,false);
 // teste negativo: perda inadequada (limite de reação) dentro de um trecho marcado continua sendo limite de reação
 const tubeSeg=[{id:'teste-tubo-marcado',from:C.zones[6].station,to:C.zones[7].station-1,kind:'salto',motivo:'teste negativo'}];
 const tube=classify(6,250,600,(s,k)=>({throttle:true,keys:k>=40&&k<160?['ArrowRight']:[]}),tubeSeg);
 assert.ok(tube.events.length>0);for(const e of tube.events){assert.equal(e.cause,'limite_reacao');assert.equal(e.causaFisica,'limite_reacao');
  assert.equal(e.mecanismoEsperado,false);assert.equal(e.trecho.id,'teste-tubo-marcado');}
 // a decolagem real na borda marcada corresponde ao mecanismo declarado
 const ramp=classify(7,230,600,()=>({throttle:true}));assert.equal(ramp.events[0].mecanismoEsperado,true);assert.equal(ramp.events[0].causaFisica,'sem_superficie');
 // trechos sem tipo válido ou sem motivo são rejeitados
 assert.throws(()=>makeClassifier(C,makeTracker(C),{intentionalSegments:[{id:'x',from:1,to:2,kind:'zona',motivo:'m'}]}));
 assert.throws(()=>makeClassifier(C,makeTracker(C),{intentionalSegments:[{id:'x',from:1,to:2,kind:'lacuna',motivo:''}]}));});

test('P09-0 · piloto de teste: parede 90° → loop com atraso de 250 ms; sem direção não completa',()=>{
 const end=C.zones[6].station-3;
 const ok=runPilot(C,{zone:4,speed:500,untilStation:end,pilot:{delayMs:250},intentionalSegments:segs});assert.equal(ok.concluiu,true);assert.equal(ok.desprendimentos.total,0);
 const none=runPilot(C,{zone:4,speed:500,untilStation:end,pilot:{deadband:1e9},intentionalSegments:segs,maxTicks:600});assert.notEqual(none.concluiu,true);});

test('P09-0 · envelope de curva: velocidade estabilizada e raio decrescente com a direção',()=>{
 const pad=flatPad(),a=measure(pad,500,.25),b=measure(pad,500,.5),c=measure(pad,500,1);
 assert.ok(a.estabilizada&&b.estabilizada);assert.ok(a.raio>b.raio&&b.raio>c.raio);assert.ok(b.raio>400&&b.raio<900,'R '+b.raio);
 assert.ok([a,b].every(x=>x.contatoContinuo&&x.validoParaEnvelope&&x.desprendimentos===0));
 // direção plena a 500 u/s: contato contínuo, mas velocidade não estabilizada → registrado como diagnóstico, inválido
 assert.equal(c.contatoContinuo,true);assert.equal(c.estabilizada,false);assert.equal(c.validoParaEnvelope,false);
 assert.deepEqual(c.motivosInvalidade,['velocidade_nao_estabilizada']);assert.ok(Number.isFinite(c.raio));});

test('P09-0 · envelope: desprendimento seguido de pouso invalida o ponto mesmo terminando apoiado',()=>{
 const pad=flatPad(),r=measure(pad,300,.25,{perturb:k=>k===5?{release:true}:{}});
 assert.equal(r.emContatoNoFim,true,'cenário de regressão: termina apoiado');
 assert.equal(r.contatoContinuo,false);assert.equal(r.validoParaEnvelope,false);
 assert.equal(r.desprendimentos,1);assert.equal(r.pousos,1);assert.ok(r.passosSemContato>0);
 assert.deepEqual(r.eventosContato.map(e=>e.evento),['desprendimento','pouso']);assert.ok(r.motivosInvalidade.includes('perda_de_contato'));});

test('P09-0 · determinismo: passo fixo de 120 Hz com agendamento de 30, 60, 120 Hz e irregular (simulação, sem navegador)',()=>{
 const r=determinism({scenarios:SCENARIOS.slice(1,3),diagnostic:false});
 for(const c of r.cenarios)for(const [cad,v] of Object.entries(c.porPasso))assert.equal(v.iguais,true,c.cenario+' '+cad+' passo '+v.primeiroPasso);
 assert.equal(r.deterministico,true);});

test('P09-0 · perfilamento por subsistema: não altera a simulação e separa a consulta de superfície',()=>{
 assert.equal(profilingIsTransparent(),true);
 const p=profileSubsystems({n:2,ticks:60,warmup:10});const names=p.subsistemas.map(x=>x.subsistema);
 for(const k of ['consultaSuperficie','gradeEspacial_daConsulta','gradeEspacial_daColisao','perfilC_drive'])assert.ok(names.includes(k),k);
 assert.ok(names.some(n=>n.startsWith('restante')));assert.ok(p.naoExisteNestaEtapa.includes('colisão nave × nave'));
 assert.equal(p.mediaPorPasso.ativas,2);});

test('P09-0 · validade do benchmark: estados contados e nave parada não conta como ativa',()=>{
 const st=stoppedStepCost(20000);assert.equal(st.estadoInalterado,true);assert.ok(st.nsPorPasso<5000);
 const b=benchmark({n:4,mode:'pilotado',ticks:60,warmup:10});const m=b.mediaPorPasso;
 assert.ok(Math.abs(m.ativas+m.paradas-4)<1e-9);assert.ok(Math.abs(m.emContato+m.noAr-m.ativas)<1e-9);assert.ok(m.emContato>=3,'pilotado deve ficar em contato: '+m.emContato);
 assert.ok(b.passosPorEstado.contato>0&&b.msPorPassoDeNave.contato>0);});
