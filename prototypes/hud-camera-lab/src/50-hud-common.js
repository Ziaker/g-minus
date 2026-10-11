/* P12 V2 — HUD: base comum. Tipografia vetorial própria (traços angulares com chanfro, contorno
   de tinta), paleta Toon Vector Flux, tokens de movimento e utilitários de layout com unidade
   proporcional ao viewport. O HUD é desenhado em Canvas 2D a cada quadro — nenhum nó DOM é
   recriado; os textos vêm da telemetria. */
const HUDC={ink:'#07060f',ink2:'#120d24',paper:'#fff3d6',cyan:'#43f0de',pink:'#ff4794',magenta:'#ff3a9c',gold:'#ffa636',violet:'#c06bff',danger:'#ff2a4f',mute:'#8d87b5',deep:'#1b1235'};
// tokens de movimento (s) e curvas — justificativa na especificação §8
const MOTION={snap:.09,punch:.24,slide:.18,exit:.14,bannerIn:.16,bannerHold:.75,bannerOut:.24,alarmHz:2.2,shatter:.42,trailHold:.4,trailCatch:.3};
/* ---------------- fonte vetorial G-MINUS (grade 6 × 10, y para baixo, base = 10) ---------------- */
const O_=[[1.5,0],[4.5,0],[6,1.5],[6,8.5],[4.5,10],[1.5,10],[0,8.5],[0,1.5],[1.5,0]];
const GLYPHS={
 '0':{w:6,p:[O_,[[4.4,2.4],[1.6,7.6]]]},'1':{w:4,p:[[[.6,2.2],[2.8,0],[2.8,10]]]},'2':{w:6,p:[[[0,1.5],[1.5,0],[4.5,0],[6,1.5],[6,3.8],[0,8.2],[0,10],[6,10]]]},
 '3':{w:6,p:[[[0,0],[6,0],[3,4],[4.5,4],[6,5.5],[6,8.5],[4.5,10],[1.5,10],[0,8.5]]]},'4':{w:6,p:[[[4.5,10],[4.5,0],[0,7],[6,7]]]},
 '5':{w:6,p:[[[6,0],[.5,0],[0,4.2],[4.5,4.2],[6,5.7],[6,8.5],[4.5,10],[1.5,10],[0,8.5]]]},'6':{w:6,p:[[[5.5,0],[2,0],[0,2.5],[0,8.5],[1.5,10],[4.5,10],[6,8.5],[6,6],[4.5,4.5],[0,4.5]]]},
 '7':{w:6,p:[[[0,0],[6,0],[6,1.8],[2,10]]]},'8':{w:6,p:[[[1.5,0],[4.5,0],[6,1.5],[6,3],[4.5,4.6],[1.5,4.6],[0,6.1],[0,8.5],[1.5,10],[4.5,10],[6,8.5],[6,6.1],[4.5,4.6]],[[1.5,4.6],[0,3],[0,1.5],[1.5,0]]]},
 '9':{w:6,p:[[[.5,10],[4,10],[6,7.5],[6,1.5],[4.5,0],[1.5,0],[0,1.5],[0,4],[1.5,5.5],[6,5.5]]]},
 A:{w:6,p:[[[0,10],[0,3],[3,0],[6,3],[6,10]],[[0,6.2],[6,6.2]]]},B:{w:6,p:[[[0,0],[4.5,0],[6,1.5],[6,3.2],[4.5,4.7],[0,4.7]],[[4.5,4.7],[6,6.2],[6,8.5],[4.5,10],[0,10],[0,0]]]},
 C:{w:6,p:[[[6,0],[1.5,0],[0,1.5],[0,8.5],[1.5,10],[6,10]]]},D:{w:6,p:[[[0,0],[4,0],[6,2],[6,8],[4,10],[0,10],[0,0]]]},E:{w:5.5,p:[[[5.5,0],[0,0],[0,10],[5.5,10]],[[0,4.8],[4.2,4.8]]]},
 F:{w:5.5,p:[[[5.5,0],[0,0],[0,10]],[[0,4.8],[4.2,4.8]]]},G:{w:6,p:[[[6,1.5],[6,0],[1.5,0],[0,1.5],[0,8.5],[1.5,10],[4.5,10],[6,8.5],[6,5],[3.2,5]]]},
 H:{w:6,p:[[[0,0],[0,10]],[[6,0],[6,10]],[[0,4.8],[6,4.8]]]},I:{w:3,p:[[[0,0],[3,0]],[[1.5,0],[1.5,10]],[[0,10],[3,10]]]},J:{w:6,p:[[[1,0],[6,0],[6,8.5],[4.5,10],[1.5,10],[0,8.5],[0,7]]]},
 K:{w:6,p:[[[0,0],[0,10]],[[6,0],[1.5,4.8],[0,4.8]],[[1.5,4.8],[6,10]]]},L:{w:5.5,p:[[[0,0],[0,10],[5.5,10]]]},M:{w:7,p:[[[0,10],[0,0],[3.5,4.5],[7,0],[7,10]]]},
 N:{w:6,p:[[[0,10],[0,0],[6,10],[6,0]]]},O:{w:6,p:[O_]},P:{w:6,p:[[[0,10],[0,0],[4.5,0],[6,1.5],[6,4],[4.5,5.5],[0,5.5]]]},Q:{w:6,p:[O_,[[3.8,7.5],[6,10.6]]]},
 R:{w:6,p:[[[0,10],[0,0],[4.5,0],[6,1.5],[6,3.5],[4.5,5],[0,5]],[[2.5,5],[6,10]]]},S:{w:6,p:[[[6,0],[1.5,0],[0,1.5],[0,3.5],[1.5,5],[4.5,5],[6,6.5],[6,8.5],[4.5,10],[0,10]]]},
 T:{w:6,p:[[[0,0],[6,0]],[[3,0],[3,10]]]},U:{w:6,p:[[[0,0],[0,8.5],[1.5,10],[4.5,10],[6,8.5],[6,0]]]},V:{w:6,p:[[[0,0],[0,6],[3,10],[6,6],[6,0]]]},
 W:{w:7,p:[[[0,0],[0,10],[3.5,6.5],[7,10],[7,0]]]},X:{w:6,p:[[[0,0],[6,10]],[[6,0],[0,10]]]},Y:{w:6,p:[[[0,0],[3,4.5],[6,0]],[[3,4.5],[3,10]]]},Z:{w:6,p:[[[0,0],[6,0],[0,10],[6,10]]]},
 ':':{w:1.6,p:[[[.8,2.6],[.8,3.6]],[[.8,7],[.8,8]]]},'.':{w:1.6,p:[[[.8,9],[.8,10]]]},',':{w:1.6,p:[[[.9,9],[.3,11]]]},'-':{w:4.5,p:[[[.4,5],[4.1,5]]]},'+':{w:5,p:[[[.3,5],[4.7,5]],[[2.5,2.8],[2.5,7.2]]]},
 '/':{w:4,p:[[[0,10],[4,0]]]},'%':{w:6,p:[[[0,10],[6,0]],[[.4,.6],[1.6,.6],[1.6,2],[.4,2],[.4,.6]],[[4.4,8],[5.6,8],[5.6,9.4],[4.4,9.4],[4.4,8]]]},
 "'":{w:1.6,p:[[[.8,0],[.8,2.6]]]},'°':{w:3,p:[[[0,0],[2.2,0],[2.2,2.2],[0,2.2],[0,0]]]},'!':{w:1.6,p:[[[.8,0],[.8,6.8]],[[.8,9],[.8,10]]]},'·':{w:1.6,p:[[[.8,4.8],[.8,5.6]]]},
 '▲':{w:6,p:[[[0,8],[3,2],[6,8],[0,8]]],fill:true},'▼':{w:6,p:[[[0,2],[3,8],[6,2],[0,2]]],fill:true},'▶':{w:5,p:[[[0,1.5],[5,5],[0,8.5],[0,1.5]]],fill:true},'◀':{w:5,p:[[[5,1.5],[0,5],[5,8.5],[5,1.5]]],fill:true},
 'Δ':{w:6,p:[[[0,10],[3,0],[6,10],[0,10]]]},'×':{w:5,p:[[[.5,3],[4.5,7]],[[4.5,3],[.5,7]]]},'?':{w:5,p:[[[0,1.5],[1.5,0],[3.5,0],[5,1.5],[5,3.5],[2.5,5.5],[2.5,7]],[[2.5,9],[2.5,10]]]},
 '#':{w:6,p:[[[1.8,0],[1,10]],[[5,0],[4.2,10]],[[0,3.4],[6,3.4]],[[0,6.6],[6,6.6]]]},'(':{w:3,p:[[[2.5,-.5],[.5,2],[.5,8],[2.5,10.5]]]},')':{w:3,p:[[[.5,-.5],[2.5,2],[2.5,8],[.5,10.5]]]},
 ' ':{w:3,p:[]}
};
const ACCENTS={'Á':['A','acute'],'À':['A','grave'],'Â':['A','circ'],'Ã':['A','tilde'],'É':['E','acute'],'Ê':['E','circ'],'Í':['I','acute'],'Ó':['O','acute'],'Ô':['O','circ'],'Õ':['O','tilde'],'Ú':['U','acute'],'Ç':['C','cedil']};
const ACCENT_P={acute:[[[2.4,-1],[4,-2.8]]],grave:[[[2,-2.8],[3.6,-1]]],circ:[[[1.4,-1],[3,-2.8],[4.6,-1]]],tilde:[[[.8,-1.4],[2,-2.6],[4,-1.4],[5.2,-2.6]]],cedil:[[[3,10],[3,11.4],[1.8,12.2]]]};
function glyphOf(ch){const g=GLYPHS[ch];if(g)return g;const a=ACCENTS[ch];if(a){const b=GLYPHS[a[0]];return {w:b.w,p:[...b.p,...ACCENT_P[a[1]].map(l=>l.map(([x,y])=>[x*(b.w/6),y]))]};}return GLYPHS['?'];}
let _TRACK=null;   // espaçamento entre letras do HUD em desenho (slider)
function hudTrack(v){_TRACK=v??null;}
function vtextWidth(str,size,track=_TRACK??.18){const k=size/10;let w=0;for(const ch of String(str).toUpperCase())w+=(glyphOf(ch).w+1.6+track*10)*k;return Math.max(0,w-(1.6+track*10)*k);}
// desenha texto vetorial; opções: align, skew, weight (fração da altura), color, ink, inkW, track, alpha, chroma ([dx,dy] de desalinhamento ciano/rosa)
let _MET=null;   // coletor de métricas de texto ativo durante um draw de teste
function hudBegin(M){_MET=M||null;}
function vtext(g,str,x,y,size,o={}){
 str=String(str).toUpperCase();if(_MET)_MET.texts.push({id:'text',size,x,y,str});const k=size/10,track=o.track??(_TRACK??.18),w=vtextWidth(str,size,track),skew=o.skew??-.2;
 const x0=o.align==='right'?x-w:o.align==='center'?x-w/2:x,lw=Math.max(1,size*(o.weight??.13));
 const path=()=>{g.beginPath();let cx=x0;const fills=[];for(const ch of str){const gl=glyphOf(ch);for(const line of gl.p){line.forEach(([gx,gy],i)=>{const X=cx+gx*k+(-skew)*(10-gy)*k,Y=y-size+gy*k;i?g.lineTo(X,Y):g.moveTo(X,Y);});}if(gl.fill)fills.push([cx,gl]);cx+=(gl.w+1.6+track*10)*k;}return fills;};
 g.save();g.globalAlpha*=(o.alpha??1);g.lineCap='square';g.lineJoin='miter';g.miterLimit=3;
 const strokePass=(color,width,dx=0,dy=0)=>{g.translate(dx,dy);const fills=path();g.strokeStyle=color;g.lineWidth=width;g.stroke();for(const [cx,gl] of fills){g.beginPath();for(const line of gl.p)line.forEach(([gx,gy],i)=>{const X=cx+gx*k+(-skew)*(10-gy)*k,Y=y-size+gy*k;i?g.lineTo(X,Y):g.moveTo(X,Y);});g.fillStyle=color;g.fill();g.stroke();}g.translate(-dx,-dy);};
 if(o.chroma&&(o.chroma[0]||o.chroma[1])){strokePass(HUDC.cyan,lw,o.chroma[0],-o.chroma[1]);strokePass(HUDC.pink,lw,-o.chroma[0],o.chroma[1]);}
 if(o.ink!==false&&(o.inkW??1)*_INK>0)strokePass(o.ink||HUDC.ink,lw+Math.max(1.5,size*.1)*(o.inkW??1)*_INK);
 strokePass(o.color||HUDC.paper,lw);
 g.restore();return w;}
/* ---------------- texto de sistema (rótulos longos) ---------------- */
let HUD_FONT="'Bahnschrift','DIN Alternate','Barlow Semi Condensed','Roboto Condensed','Arial Narrow',system-ui,sans-serif";
function stext(g,str,x,y,size,o={}){if(_MET)_MET.texts.push({id:'text',size,x,y,str});g.save();g.globalAlpha*=(o.alpha??1);g.font=(o.weight||600)+' '+size+'px '+HUD_FONT;g.textAlign=o.align||'left';g.textBaseline=o.base||'alphabetic';if(o.track!==undefined&&'letterSpacing' in g)g.letterSpacing=o.track+'px';
 if(o.ink!==false&&_INK>0){g.lineJoin='round';g.strokeStyle=o.ink||HUDC.ink;g.lineWidth=Math.max(2,size*.22)*(o.inkW??1)*_INK;g.strokeText(str,x,y);}g.fillStyle=o.color||HUDC.paper;g.fillText(str,x,y);g.restore();}
/* ---------------- formas ---------------- */
function poly(g,pts,fill,stroke,lw){g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();if(fill){g.fillStyle=fill;g.fill();}if(stroke){g.strokeStyle=stroke;g.lineWidth=lw||1;g.stroke();}}
function para(x,y,w,h,sk){return [[x+sk,y],[x+w+sk,y],[x+w,y+h],[x,y+h]];}       // paralelogramo inclinado
let _halftone=null;
function halftonePattern(g,color='#ffffff',cell=6){if(typeof document==='undefined'||!document.createElement||!g.createPattern)return null;const key=color+cell;if(_halftone&&_halftone.key===key)return _halftone.p;const c=document.createElement('canvas');c.width=c.height=cell;const x=c.getContext('2d');x.fillStyle=color;x.beginPath();x.arc(cell/2,cell/2,cell*.24,0,TAU);x.fill();_halftone={key,p:g.createPattern(c,'repeat')};return _halftone.p;}
const fmtSpeed=v=>String(Math.max(0,Math.round(v)));
const fmtGap=(s,sign=true)=>Number.isFinite(s)?(sign?(s>=0?'+':'-'):'')+Math.abs(s).toFixed(s>=10?1:2):'—';
const fmtLap=t=>t===null||t===undefined||!Number.isFinite(t)?'—:——.———':fmtTime(t,3);
const ordinal=n=>String(n).padStart(2,'0');
// unidade de layout: altura de referência 1080 (paisagem) ou largura 1080 (retrato) × escala do HUD
function hudUnit(w,h,scale){const tall=w/h<1.2;return {u:(tall?w/1080:h/1080)*scale,tall,w,h};}
// caixa útil depois da margem de segurança (percentual)
function safeBox(w,h,pct){const m=Math.min(w,h)*pct/100;return {x:m,y:m,w:w-2*m,h:h-2*m};}
// pulso de alarme limitado (≤ 3 Hz, critério WCAG 2.3.1 para flashes)
const alarm=(t,hz=MOTION.alarmHz)=>.5+.5*Math.sin(t*TAU*Math.min(hz,3));
// registro de métricas de legibilidade (usado por testes): tamanho mínimo e caixas de módulos-chave
function metricsSink(){return {texts:[],boxes:{}};}
function noteText(M,id,size,x,y,w){if(M)M.texts.push({id,size,x,y,w});}
function noteBox(M,id,x,y,w,h){if(M)M.boxes[id]={x,y,w,h};}
// ícones de recurso de pista (compartilhados pelas faixas de previsão)
function featureIcon(g,kind,x,y,s,data,col){g.save();g.strokeStyle=col||HUDC.paper;g.fillStyle=col||HUDC.paper;g.lineWidth=Math.max(1.5,s*.14);g.lineJoin='miter';
 if(kind==='corner'){const d=data.dir>0?-1:1;g.beginPath();g.moveTo(x-d*s*.5,y+s*.5);g.lineTo(x-d*s*.5,y-s*.1);g.quadraticCurveTo(x-d*s*.5,y-s*.5,x+d*s*.1,y-s*.5);g.lineTo(x+d*s*.5,y-s*.5);g.stroke();poly(g,[[x+d*s*.5,y-s*.75],[x+d*s*.85,y-s*.5],[x+d*s*.5,y-s*.25]],col||HUDC.paper);}
 else if(kind==='loop'){g.beginPath();g.arc(x,y-s*.1,s*.38,Math.PI*.6,Math.PI*2.4);g.stroke();g.beginPath();g.moveTo(x-s*.6,y+s*.45);g.lineTo(x+s*.6,y+s*.45);g.stroke();}
 else if(kind==='jump'){g.beginPath();g.moveTo(x-s*.6,y+s*.4);g.lineTo(x-s*.2,y);g.moveTo(x+s*.2,y+s*.25);g.lineTo(x+s*.6,y+s*.4);g.stroke();g.setLineDash([s*.12,s*.1]);g.beginPath();g.moveTo(x-s*.2,y);g.quadraticCurveTo(x,y-s*.6,x+s*.2,y+s*.25);g.stroke();g.setLineDash([]);}
 else if(kind==='dash'){for(const o of [-.25,.15])poly(g,[[x-s*.35+o*s,y-s*.35],[x+o*s,y],[x-s*.35+o*s,y+s*.35],[x-s*.15+o*s,y]],col||HUDC.gold);}
 else if(kind==='recharge'){g.beginPath();g.moveTo(x+s*.1,y-s*.5);g.lineTo(x-s*.25,y+s*.05);g.lineTo(x+s*.05,y+s*.05);g.lineTo(x-s*.1,y+s*.5);g.lineTo(x+s*.3,y-.1*s);g.lineTo(x,y-.1*s);g.closePath();g.fill();}
 else if(kind==='edge'){for(let i=0;i<3;i++)poly(g,[[x-s*.5+i*s*.36,y+s*.4],[x-s*.3+i*s*.36,y-s*.4],[x-s*.14+i*s*.36,y-s*.4],[x-s*.34+i*s*.36,y+s*.4]],col||HUDC.gold);}
 else if(kind==='finish'||kind==='sector'){g.beginPath();g.moveTo(x-s*.35,y+s*.5);g.lineTo(x-s*.35,y-s*.5);g.stroke();
  if(kind==='finish'){for(let i=0;i<3;i++)for(let j=0;j<2;j++)if((i+j)%2===0)g.fillRect(x-s*.35+i*s*.25,y-s*.5+j*s*.22,s*.25,s*.22);}
  else poly(g,[[x-s*.35,y-s*.5],[x+s*.4,y-s*.3],[x-s*.35,y-s*.1]],col||HUDC.paper);}
 g.restore();}
// mapa 2D do circuito (vista superior, reta de largada na horizontal) para minimapas
let _map2d=null;
function trackMap2D(){if(_map2d)return _map2d;const n=TRACK.n,t0=[TRACK.T[0],TRACK.T[2]],a=Math.atan2(t0[1],t0[0]),c=Math.cos(-a),s=Math.sin(-a),pts=[];
 let mnx=1e9,mxx=-1e9,mny=1e9,mxy=-1e9;for(let i=0;i<n;i+=3){const x=TRACK.pos[i*3],z=TRACK.pos[i*3+2],X=x*c-z*s,Y=-(x*s+z*c);pts.push([X,Y,i*TRACK.ds]);mnx=Math.min(mnx,X);mxx=Math.max(mxx,X);mny=Math.min(mny,Y);mxy=Math.max(mxy,Y);}
 const sc=1/Math.max(mxx-mnx,mxy-mny),ox=(1-(mxx-mnx)*sc)/2,oy=(1-(mxy-mny)*sc)/2,P=pts.map(([x,y,sd])=>[(x-mnx)*sc+ox,(y-mny)*sc+oy,sd]);
 const at=sd=>{const u=wrap(sd,TRACK.L)/(TRACK.ds*3),i=Math.floor(u)%P.length,j=(i+1)%P.length,f=u-Math.floor(u);return [lerp(P[i][0],P[j][0],f),lerp(P[i][1],P[j][1],f)];};
 _map2d={pts:P,at,aspect:(mxx-mnx)/(mxy-mny)};return _map2d;}
// pose de uma nave relativa ao jogador no plano local (frente, direita) — para radares
function relPlanar(PP,pos){const d=vec.sub(pos,PP.p);return [vec.dot(d,PP.R),vec.dot(d,PP.T)];}
// largura medida de texto de sistema (mesma fonte de stext)
function stextW(g,str,size,weight=600){if(!g.measureText)return String(str).length*size*.55;g.save();g.font=weight+' '+size+'px '+HUD_FONT;const w=g.measureText(String(str)).width;g.restore();return Number.isFinite(w)?w:String(str).length*size*.55;}
// parâmetros comuns de tamanho/espaçamento (grupos do painel)
const HPG=(group,id,label,min,max,step,def,unit='',desc='')=>({group,id,label,min,max,step,def,unit,desc});
const SIZE=(id,label,desc='')=>HPG('Tamanho dos módulos',id,label,.6,1.6,.01,1,'×',desc);
const TEXT_PARAMS=()=>[HPG('Texto','letterSpacing','Espaçamento entre letras',.05,.5,.01,.2,'','distância entre caracteres da fonte vetorial'),HPG('Texto','lineSpacing','Espaçamento entre linhas',.8,1.6,.01,1,'×','distância vertical entre linhas de cada módulo')];

/* ---------------- cores, fundos, contorno e fonte por HUD (aplicados só durante o desenho daquele HUD) ---------------- */
// funções de cor: cada uma substitui um papel da paleta HUDC enquanto o HUD desenha (e as cores da camada no mundo)
const HUD_COLOR_ROLES=[['colPrimary','Primária','informação, escudo, ciano da identidade'],['colAccent','Destaque','impulso, volta final, ameaça'],['colWarn','Aviso','rival, curvas, energia baixa'],['colDanger','Perigo','alertas P0, energia crítica'],
 ['colText','Texto principal','números e rótulos'],['colMuted','Texto secundário','legendas e unidades'],['colSpecial','Especial','melhor volta, salto, recordes'],['colPanel','Fundo e contorno','painéis e contorno da tinta']];
const HUD_PALETTES={
 flux:{name:'Flux · padrão D-TOON',c:['#43f0de','#ff4794','#ffa636','#ff2a4f','#fff3d6','#8d87b5','#c06bff','#07060f']},
 contrast:{name:'Alto contraste',c:['#00f0ff','#ff4fd8','#ffd400','#ff3b30','#ffffff','#d0d0e0','#c4a0ff','#000000']},
 okabe:{name:'Daltonismo · Okabe-Ito',c:['#56b4e9','#cc79a7','#f0e442','#ff8c1a','#ffffff','#a9b6c4','#9ab8ff','#05070d']},
 amber:{name:'Âmbar monocromático',c:['#ffb000','#ffd27a','#ff8a00','#ff3d00','#ffe7b8','#a8875a','#ffcf66','#0d0700']},
 ice:{name:'Gelo',c:['#7fd8ff','#b28cff','#ffd36b','#ff4d6d','#eaf6ff','#8aa1b8','#a9c7ff','#050a12']},
 vapor:{name:'Vapor',c:['#01cdfe','#ff71ce','#fffb96','#ff3864','#fdf0ff','#b29ccf','#b967ff','#0b0418']},
 phosphor:{name:'Fósforo verde',c:['#39ff88','#c2ff4d','#ffd84d','#ff4d4d','#e8ffe8','#7fae8a','#7dffd4','#020a05']}};
const hudColorDefaults=()=>Object.fromEntries(HUD_COLOR_ROLES.map(([k],i)=>[k,HUD_PALETTES.flux.c[i]]));
const HUD_FONTS={condensed:HUD_FONT,wide:"'Segoe UI','Helvetica Neue',Arial,system-ui,sans-serif",mono:"ui-monospace,'JetBrains Mono','Cascadia Mono',Consolas,monospace"};
const HUD_HEX_RE=/^#[0-9a-f]{6}$/;
function hudHexRgb(h){const n=parseInt(String(h).slice(1,7),16);return [n>>16&255,n>>8&255,n&255];}
const _rgbaCache=new Map();
function rgbaOf(hex,a){a=Math.round(clamp(+a,0,1)*1000)/1000;const k=hex+a;let v=_rgbaCache.get(k);if(!v){const [r,g,b]=hudHexRgb(hex);v='rgba('+r+','+g+','+b+','+a+')';if(_rgbaCache.size>4000)_rgbaCache.clear();_rgbaCache.set(k,v);}return v;}
function mixHex(a,b,t){const A=hudHexRgb(a),B=hudHexRgb(b);return '#'+A.map((x,i)=>Math.round(lerp(x,B[i],t)).toString(16).padStart(2,'0')).join('');}
// contraste WCAG 2.x entre duas cores
function luminance(hex){return hudHexRgb(hex).map(v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4;}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);}
function contrastRatio(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
let _PANEL_A=1,_INK=1;
const hudBg=a=>rgbaOf(HUDC.ink,a*_PANEL_A);   // fundo de painel na cor/opacidade escolhidas
const HUDC_BASE={...HUDC};let _HUDV_BASE=null;
function hudStyle(cfg){
 if(!_HUDV_BASE)_HUDV_BASE=Object.fromEntries(Object.entries(HUDV).map(([k,v])=>[k,[...v]]));
 if(!cfg){Object.assign(HUDC,HUDC_BASE);for(const k in _HUDV_BASE)HUDV[k].splice(0,3,..._HUDV_BASE[k]);_PANEL_A=1;_INK=1;HUD_FONT=HUD_FONTS.condensed;return;}
 const c=k=>HUD_HEX_RE.test(cfg[k]||'')?cfg[k]:HUDC_BASE[{colPrimary:'cyan',colAccent:'pink',colWarn:'gold',colDanger:'danger',colText:'paper',colMuted:'mute',colSpecial:'violet',colPanel:'ink'}[k]];
 const P={cyan:c('colPrimary'),pink:c('colAccent'),magenta:c('colAccent'),gold:c('colWarn'),danger:c('colDanger'),paper:c('colText'),mute:c('colMuted'),violet:c('colSpecial'),ink:c('colPanel')};
 P.ink2=mixHex(P.ink,P.violet,.1);P.deep=mixHex(P.ink,P.violet,.18);Object.assign(HUDC,P);
 const v3=h=>hudHexRgb(h).map(x=>x/255);for(const [k,role] of [['cyan','cyan'],['pink','pink'],['gold','gold'],['paper','paper'],['ink','ink']])if(HUDV[k])HUDV[k].splice(0,3,...v3(P[role]));
 _PANEL_A=cfg.panelAlpha??1;_INK=cfg.outline??1;HUD_FONT=HUD_FONTS[cfg.font]||HUD_FONTS.condensed;}
// visibilidade por módulo: um módulo oculto desenha num contexto "fantasma" (mede, não pinta), então o layout dos outros não muda
function hudVis(G0){let ghost=null;const make=()=>{const st={};return new Proxy(st,{get(t,k){if(k==='measureText')return s=>{if(!G0.measureText)return {width:String(s).length*10};G0.save();G0.font=t.font||G0.font;const m=G0.measureText(s);G0.restore();return m;};
  if(k==='createPattern'||k==='createLinearGradient'||k==='createRadialGradient')return (...a)=>typeof G0[k]==='function'?G0[k](...a):(k==='createPattern'?null:{addColorStop(){}});
  if(k in t)return t[k];return typeof G0[k]==='function'?()=>{}:G0[k];},set(t,k,v){t[k]=v;return true;}});};
 return on=>on?G0:(ghost||(ghost=make()));}
// parâmetros comuns de cor/fundo/contorno
const STYLE_PARAMS=(outline=true)=>[HPG('Cores e fundos','panelAlpha','Opacidade dos fundos',0,1.6,.01,1,'×','multiplica a opacidade de todos os painéis'),...(outline?[HPG('Cores e fundos','outline','Contorno do texto',0,2,.01,1,'×','espessura da tinta em volta do texto')]:[])];
