/* P09 etapa 0 — carregador somente leitura da física aprovada do P08 (revisão 4).
   Executa profile-c.generated.js e core.js num contexto isolado, como physics08.test.cjs.
   Nenhum arquivo do P08 é alterado; o P09 apenas consome a API exportada. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const P08_DIR=path.resolve(__dirname,'../../physics-08');
let cached=null;
// Cria uma instância nova e independente do P08 (contexto vm próprio). Usada pelo perfilamento,
// que instrumenta funções em tempo de execução sem afetar a instância compartilhada nem os arquivos.
function createP08(){
 const ctx={module:{exports:{}},structuredClone};
 for(const file of ['profile-c.generated.js','core.js'])vm.runInNewContext(fs.readFileSync(path.join(P08_DIR,file),'utf8'),ctx,{filename:file});
 const P=ctx.module.exports,config=P.newConfig();
 return {P,V:P.V,config,cfg:config.params.A,profile:config.profile,air:config.air};
}
function loadP08(){if(!cached)cached=createP08();return cached;}
module.exports={loadP08,createP08,P08_DIR};
