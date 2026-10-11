/* P12 V2 — CONFIGURAÇÃO: um único contrato para interface e API. Importação estrita e atômica:
   o texto é validado por inteiro e convertido num objeto novo; só então o estado é trocado.
   Nenhum JSON concede aprovação. */
const HUDS={A:HUD_A,B:HUD_B,C:HUD_C};
const IDS=['A','B','C'];
const VIEW_MODES=['single','split','hud3','cam3','matrix'],ASPECTS=['fill','16:9','21:9','9:16'],RATES=[.25,.5,1];
const LAB_STATUS='EM AVALIAÇÃO — P12 V2 NÃO APROVADO · ESTE JSON NÃO CONCEDE APROVAÇÃO';
const VFX_OPTIONS={drift:['A','B','C','E'],collision:['B','D'],flight:['C','D'],light:['world','camera']};
const RECOMMENDED=[{id:'AA',hud:'A',camera:'A',name:'Arcade épico',why:'Linguagem cinética com câmera de sensação: o HUD reage às mesmas forças que a câmera exagera.'},{id:'BB',hud:'B',camera:'B',name:'Combate tático',why:'Câmera elevada mostra o pelotão que o anel de ameaças e os colchetes descrevem.'},{id:'CC',hud:'C',camera:'C',name:'Competição precisa',why:'A câmera preditiva mostra o ápice que a faixa de previsão anuncia.'}];
function hudDefaults(id){const H=HUDS[id],o={};for(const p of H.params)o[p.id]=p.def;for(const [k,v] of Object.entries(H.toggles||{}))o[k]=v;for(const [k,v] of Object.entries(H.selects||{}))o[k]=v[0];return o;}
function defaultConfig(){return {schema:LAB_SCHEMA,version:LAB_VERSION,status:LAB_STATUS,geometry:'prototype-05/v1',artDirection:'D-TOON-VECTOR-FLUX',paintSystem:'B',vfxBaseline:'prototype-04-v2/approved-calibration',
 selection:{hud:'A',camera:'A',view:'single',aspect:'fill',left:{hud:'A',camera:'A'},right:{hud:'C',camera:'C'}},
 hud:{A:hudDefaults('A'),B:hudDefaults('B'),C:hudDefaults('C')},camera:{A:{...CAM_DEFAULTS.A},B:{...CAM_DEFAULTS.B},C:{...CAM_DEFAULTS.C}},
 vfx:{drift:'A',collision:'B',flight:'C',boost:{A:true,D:true,E:true},speedLines:true,light:'world'},
 race:{seed:20261011,laps:3,ships:30},playback:{scenario:'start',time:0,rate:1}};}
const isObj=o=>o!==null&&typeof o==='object'&&!Array.isArray(o);
function exact(o,keys,where){if(!isObj(o))throw Error(where+': deve ser um objeto');for(const k of Object.keys(o))if(!keys.includes(k))throw Error(where+': chave desconhecida "'+k+'"');for(const k of keys)if(!(k in o))throw Error(where+': chave obrigatória ausente "'+k+'"');}
function num(v,min,max,where,int=false){if(typeof v!=='number'||!Number.isFinite(v))throw Error(where+': deve ser número finito');if(v<min||v>max)throw Error(where+': '+v+' fora de ['+min+', '+max+']');if(int&&!Number.isInteger(v))throw Error(where+': deve ser inteiro');return v;}
function bool(v,where){if(typeof v!=='boolean')throw Error(where+': deve ser booleano');return v;}
function oneOf(v,list,where){if(!list.includes(v))throw Error(where+': valor inválido "'+v+'"');return v;}
function parseHud(id,o,where){const H=HUDS[id],keys=[...H.params.map(p=>p.id),...Object.keys(H.toggles||{}),...Object.keys(H.selects||{})];exact(o,keys,where);const out={};
 for(const p of H.params)out[p.id]=num(o[p.id],p.min,p.max,where+'.'+p.id);for(const k of Object.keys(H.toggles||{}))out[k]=bool(o[k],where+'.'+k);for(const [k,v] of Object.entries(H.selects||{}))out[k]=oneOf(o[k],v,where+'.'+k);return out;}
function parseCam(id,o,where){const defs=camParamDefs(id);exact(o,defs.map(d=>d.id),where);const out={};for(const d of defs)out[d.id]=num(o[d.id],d.min,d.max,where+'.'+d.id);return out;}
function parseConfigText(text){let o;try{o=JSON.parse(text);}catch(e){throw Error('JSON sintaticamente inválido — '+e.message);}return parseConfigObject(o);}
function parseConfigObject(o){const ref=defaultConfig();exact(o,Object.keys(ref),'configuração');
 for(const k of ['schema','version','status','geometry','artDirection','paintSystem','vfxBaseline'])if(o[k]!==ref[k])throw Error(k+': contrato fixo é '+JSON.stringify(ref[k]));
 const S=o.selection;exact(S,Object.keys(ref.selection),'selection');const sel={hud:oneOf(S.hud,IDS,'selection.hud'),camera:oneOf(S.camera,IDS,'selection.camera'),view:oneOf(S.view,VIEW_MODES,'selection.view'),aspect:oneOf(S.aspect,ASPECTS,'selection.aspect')};
 for(const side of ['left','right']){exact(S[side],['hud','camera'],'selection.'+side);sel[side]={hud:oneOf(S[side].hud,IDS,'selection.'+side+'.hud'),camera:oneOf(S[side].camera,IDS,'selection.'+side+'.camera')};}
 exact(o.hud,IDS,'hud');exact(o.camera,IDS,'camera');const hud={},camera={};for(const id of IDS){hud[id]=parseHud(id,o.hud[id],'hud.'+id);camera[id]=parseCam(id,o.camera[id],'camera.'+id);}
 const V=o.vfx;exact(V,Object.keys(ref.vfx),'vfx');exact(V.boost,['A','D','E'],'vfx.boost');
 const vfx={drift:oneOf(V.drift,VFX_OPTIONS.drift,'vfx.drift'),collision:oneOf(V.collision,VFX_OPTIONS.collision,'vfx.collision'),flight:oneOf(V.flight,VFX_OPTIONS.flight,'vfx.flight'),boost:{A:bool(V.boost.A,'vfx.boost.A'),D:bool(V.boost.D,'vfx.boost.D'),E:bool(V.boost.E,'vfx.boost.E')},speedLines:bool(V.speedLines,'vfx.speedLines'),light:oneOf(V.light,VFX_OPTIONS.light,'vfx.light')};
 const R=o.race;exact(R,['seed','laps','ships'],'race');const race={seed:num(R.seed,1,2147483647,'race.seed',true),laps:num(R.laps,1,5,'race.laps',true),ships:num(R.ships,12,30,'race.ships',true)};
 const P=o.playback;exact(P,['scenario','time','rate'],'playback');const playback={scenario:oneOf(P.scenario,SCENARIOS.map(s=>s.id),'playback.scenario'),time:num(P.time,0,900,'playback.time'),rate:oneOf(P.rate,RATES,'playback.rate')};
 return {...ref,selection:sel,hud,camera,vfx,race,playback};}
