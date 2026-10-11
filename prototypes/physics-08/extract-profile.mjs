import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const source=fs.readFileSync(root+'/prototypes/01_steering_profiles.html','utf8');
const between=(a,b)=>{const i=source.indexOf(a),j=source.indexOf(b,i);if(i<0||j<0)throw Error('P01 source marker missing: '+a);return source.slice(i,j);};
const defaults=vm.runInNewContext(between('const DEFAULTS =','const state =')+';DEFAULTS.C');
const limits=vm.runInNewContext(between('const LIMITS =','const DEFAULTS =')+';LIMITS');
const reference=JSON.parse(fs.readFileSync(root+'/docs/decisions/2026-10-10-prototype-01-profile-c-export.json','utf8'));
// Exact source values remain the fallback for lossy export strings. No ambiguous value is resolved here.
const baseline={...defaults};for(const [key,entry]of Object.entries(reference.params))if(!entry.precisionAmbiguous)baseline[key]=entry.value;
const pending=Object.entries(reference.params).filter(([,v])=>v.precisionAmbiguous).map(([key,v])=>({key,exportedText:v.exportedText,candidates:v.gridCandidates,retainedP01:defaults[key]}));
for(const p of pending)if(!p.candidates.some(v=>Math.abs(v-p.retainedP01)<1e-8))throw Error('Valor P01 fora dos candidatos do export: '+p.key);
const input=between("  const steerLeft = held.has('ArrowLeft');",'  // Track height & Airborne state');
const driving=between('  // Steering calculation','  if (state.track === \'straight\')');
const airborne=between('    const pitchRate = (cfg.airPitchControlRate','\n    if (player.onTrack && player.y <= hoverTarget');
const landing=between('  if (wasAirborne && !player.isAirborne && player.onTrack) {','\n  player.visualYaw =');
const energy=between('  const boostDrain = cfg.boostEnergyDrainRate','\n  const crossed =');
const boost=between('function boost() {','\nfunction sideAttack');
const profile=`/* Generated directly from P01. Do not hand-edit; run extract-profile.mjs. */
const P01Profile=(()=>{
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),wrapAngle=a=>Math.atan2(Math.sin(a),Math.cos(a)),expDecay=(k,dt)=>1-Math.exp(-k*dt);
const DEFAULT_C=${JSON.stringify(defaults)},BASELINE=${JSON.stringify(baseline)},LIMITS=${JSON.stringify(limits)},PENDING=${JSON.stringify(pending)};
const SOURCE_SHA256='${crypto.createHash('sha256').update(source).digest('hex')}';
const emit=()=>{},sound=()=>{},notice=()=>{};
function fresh(speed=0){return {x:0,z:0,y:0,yaw:0,yawRate:0,vx:0,vz:speed,speed,slip:0,drift:false,slide:false,driftAngle:0,driftTime:0,roll:0,pitch:0,steerFiltered:0,verticalVelocity:0,shield:100,boost:0,boostFree:false,sideTime:0,sideDuration:.31,sideDir:0,isAirborne:false,onTrack:true};}
function drive(player,cfg,held,dt,options={}){
const state={profile:'C',naturalStability:options.naturalStability??true,assist:false};
let tapSteerRemaining=player.tapSteerRemaining||0,tapSteerDir=player.tapSteerDir||0,tapThrottleRemaining=player.tapThrottleRemaining||0,tapStrafeRemaining=player.tapStrafeRemaining||0,tapStrafeDir=player.tapStrafeDir||0,latestInput;
for(const k of options.edges||[]){if(held.has(k))continue;if(['ArrowLeft','ArrowRight'].includes(k)){tapSteerDir=k==='ArrowLeft'?-1:1;tapSteerRemaining=Math.max(tapSteerRemaining,.055);}if(['KeyX','KeyW','ArrowUp'].includes(k))tapThrottleRemaining=Math.max(tapThrottleRemaining,.05);if(['KeyZ','KeyC'].includes(k)){tapStrafeDir=k==='KeyZ'?-1:1;tapStrafeRemaining=Math.max(tapStrafeRemaining,.07);}}
${input}
${driving}
Object.assign(player,{tapSteerRemaining,tapSteerDir,tapThrottleRemaining,tapStrafeRemaining,tapStrafeDir});return latestInput;
}
function fly(player,cfg,held,dt,roadSlope=0){const pitchUp=held.has('KeyS')||held.has('ArrowDown'),pitchDown=held.has('KeyW')||held.has('ArrowUp');
${airborne}
}
function land(player,cfg,landingVelocity,roadSlope){const wasAirborne=true,fx=Math.sin(player.yaw),fz=Math.cos(player.yaw);let shake=0;
${landing}
}
function activateBoost(player,cfg){const state={profiles:{C:cfg},profile:'C',paused:false};
${boost}
boost();
}
function tickEnergy(player,cfg,dt,regeneration=false){const state={regeneration};
${energy}
}
return{DEFAULT_C,BASELINE,LIMITS,PENDING,SOURCE_SHA256,fresh,drive,fly,land,activateBoost,tickEnergy};})();
if(typeof module!=='undefined')module.exports=P01Profile;
`;
new vm.Script(profile);
const dest=root+'/prototypes/physics-08/profile-c.generated.js';
if(process.argv.includes('--check')){if(fs.readFileSync(dest,'utf8')!==profile)throw Error('P01 extraction stale');}else fs.writeFileSync(dest,profile);
console.log('P01 routines extracted; unresolved exported values: '+pending.length);
