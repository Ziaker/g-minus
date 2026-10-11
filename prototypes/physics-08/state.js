const state={params:defaultParams(),liveries:defaultLiveries(),insp:{focus:'all',focusMode:'highlight',light:'fixed'},sim:{speed:0,throttle:0,slip:0,impact:.5,gravity:16,height:0},side:1,seed:8};
const $=id=>document.getElementById(id);
let fxProgram=null,fxBuffer=null,fxLoc={},diagnostic={fxVertices:0,overflow:0};
let config=P08.newConfig(),course=new P08.Course(),bodies={},accumulator=0,paused=false,comparison=false,scriptMode=false,keysHeld=new Set(),releaseQueued=false;
let lastTime=0,frameCount=0,sampleStart=0,fps=0,stepMs=0,renderMs=0,lastUi=0,simSteps=0,droppedTime=0,orbitYaw=.6,orbitPitch=.5,orbitDistance=55;
function resetPhysics(){bodies=Object.fromEntries(['A'].map(m=>[m,P08.fresh(course,m,config.params[m],config.zone,config.startSpeed,config.seed,config.profile)]));accumulator=0;keysHeld.clear();releaseQueued=false;}
resetPhysics();
