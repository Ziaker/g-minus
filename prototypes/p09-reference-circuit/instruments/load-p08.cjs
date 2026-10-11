/* P09 etapa 0 — carregador somente leitura da física aprovada do P08 (revisão 4).
   Executa profile-c.generated.js e core.js num contexto isolado, como physics08.test.cjs.
   Nenhum arquivo do P08 é alterado; o P09 apenas consome a API exportada. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const P08_DIR=path.resolve(__dirname,'../../physics-08');
let cached=null;
function loadP08(){
 if(cached)return cached;
 const ctx={module:{exports:{}},structuredClone};
 for(const file of ['profile-c.generated.js','core.js'])vm.runInNewContext(fs.readFileSync(path.join(P08_DIR,file),'utf8'),ctx,{filename:file});
 const P=ctx.module.exports,config=P.newConfig();
 cached={P,V:P.V,config,cfg:config.params.A,profile:config.profile,air:config.air};
 return cached;
}
module.exports={loadP08,P08_DIR};
