/* P12 V2 — CORE: vetores, RNG com semente, easing, molas e hash de estado.
   Depende somente de clamp/lerp/TAU do bloco geométrico aprovado do P05 (embutido antes). */
const LAB_SCHEMA='gminus.p12v2.hud-camera-lab',LAB_VERSION=2;
const SIM_HZ=120,SIM_DT=1/SIM_HZ;
const KMH=3.6;                       // 1 u = 1 m (escala oficial, docs/decisions/2026-10-11-world-scale-1u-1m.md)
const vec={
 add:(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],
 sub:(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],
 scale:(a,k)=>[a[0]*k,a[1]*k,a[2]*k],
 madd:(a,b,k)=>[a[0]+b[0]*k,a[1]+b[1]*k,a[2]+b[2]*k],
 dot:(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],
 cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],
 len:a=>Math.hypot(a[0],a[1],a[2]),
 norm:a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l];},
 lerp:(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t],
 // rotação de Rodrigues em torno de um eixo unitário
 rot:(v,k,ang)=>{const c=Math.cos(ang),s=Math.sin(ang),d=k[0]*v[0]+k[1]*v[1]+k[2]*v[2],x=[k[1]*v[2]-k[2]*v[1],k[2]*v[0]-k[0]*v[2],k[0]*v[1]-k[1]*v[0]];return [v[0]*c+x[0]*s+k[0]*d*(1-c),v[1]*c+x[1]*s+k[1]*d*(1-c),v[2]*c+x[2]*s+k[2]*d*(1-c)];},
 // remove de v a componente ao longo de n (n unitário) e normaliza
 ortho:(v,n)=>{const d=v[0]*n[0]+v[1]*n[1]+v[2]*n[2];return vec.norm([v[0]-n[0]*d,v[1]-n[1]*d,v[2]-n[2]*d]);},
 angle:(a,b)=>Math.acos(clamp(vec.dot(vec.norm(a),vec.norm(b)),-1,1))
};
// gerador mulberry32 com estado explícito (serializável nos snapshots)
function rngNext(r){let a=(r.s=(r.s+0x6D2B79F5)|0);let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}
const rngRange=(r,a,b)=>a+(b-a)*rngNext(r);
// ruído determinístico por índice (sem estado), para tremor de câmera e detalhes de cenário
function hashNoise(seed,i){let x=Math.imul((seed^Math.imul(i|0,374761393))>>>0,668265263);x=Math.imul(x^(x>>>13),1274126177);return((x^(x>>>16))>>>0)/4294967296;}
function smoothNoise(seed,t){const i=Math.floor(t),f=t-i,u=f*f*(3-2*f);return lerp(hashNoise(seed,i),hashNoise(seed,i+1),u)*2-1;}
const ease={
 linear:t=>t,
 outCubic:t=>1-Math.pow(1-clamp(t,0,1),3),
 inCubic:t=>Math.pow(clamp(t,0,1),3),
 inOutCubic:t=>{t=clamp(t,0,1);return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;},
 outExpo:t=>{t=clamp(t,0,1);return t>=1?1:1-Math.pow(2,-10*t);},
 outBack:(t,k=1.70158)=>{t=clamp(t,0,1)-1;return 1+(k+1)*t*t*t+k*t*t;},
 smooth:t=>{t=clamp(t,0,1);return t*t*(3-2*t);}
};
// mola criticamente amortecida (solução exata, estável para qualquer dt)
function springStep(x,v,target,omega,dt){const e=Math.exp(-omega*dt),d=x-target,j=v+omega*d;return [target+(d+j*dt)*e,(v-omega*j*dt)*e];}
// aproximação exponencial independente da taxa de quadros
const damp=(a,b,rate,dt)=>b+(a-b)*Math.exp(-rate*dt);
const dampVec=(a,b,rate,dt)=>{const k=Math.exp(-rate*dt);return [b[0]+(a[0]-b[0])*k,b[1]+(a[1]-b[1])*k,b[2]+(a[2]-b[2])*k];};
const wrap=(x,m)=>((x%m)+m)%m;
// envelope ataque/sustentação/liberação para animações de interface (tempo de simulação)
function envelope(age,attack,hold,release){if(age<0)return 0;if(age<attack)return attack>0?age/attack:1;if(age<attack+hold)return 1;const r=(age-attack-hold)/Math.max(1e-6,release);return r>=1?0:1-r;}
// hash FNV-1a de valores numéricos quantizados (verificação de determinismo)
function stateHash(values){let h=2166136261>>>0;for(const v of values){const q=Math.round(v*1e6);h=Math.imul(h^(q&0xffff),16777619)>>>0;h=Math.imul(h^((q/65536)|0)&0xffff,16777619)>>>0;}return h.toString(16).padStart(8,'0');}
const fmtTime=(t,digits=3)=>{if(!Number.isFinite(t))return '--:--.---';const neg=t<0;t=Math.abs(t);const m=Math.floor(t/60),s=t-m*60;return (neg?'-':'')+String(m).padStart(1,'0')+':'+s.toFixed(digits).padStart(digits+3,'0');};
const deepClone=o=>JSON.parse(JSON.stringify(o));
