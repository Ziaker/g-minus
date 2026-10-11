const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const root=path.resolve(__dirname,'../..'),out=path.join(root,'docs/evidence/physics-08/revision-4');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('file://'+path.join(root,'prototypes/08_3d_physics_lab.html'));await page.waitForFunction(()=>window.__P08?.renderer().ok);await page.evaluate(()=>__P08.setPaused(true));
  assert.equal(await page.evaluate(()=>__P08.getConfig().air.boostControl),1.3);
  await page.locator('[data-air="boostControl"]').fill('1');await page.locator('[data-air="boostControl"]').dispatchEvent('input');assert.equal(await page.evaluate(()=>__P08.getConfig().air.boostControl),1);
  await page.locator('[data-air="boostControl"]').fill('1.3');await page.locator('[data-air="boostControl"]').dispatchEvent('input');
  const setup=()=>{const b=bodies.A;b.p=[-200,300,100];b.v=[0,-85,180];b.up=[0,1,0];b.f=[0,0,1];b.contact=false;b.event='VOO';};
  await page.evaluate(setup);await page.locator('#view').focus();await page.keyboard.down('ArrowDown');await page.keyboard.press('KeyA');await page.evaluate(()=>__P08.step(100));await page.keyboard.up('ArrowDown');
  const dive=await page.evaluate(()=>__P08.getBodies().A);assert.ok(dive.v[1]<-90,JSON.stringify(dive.v));assert.equal(dive.diveCap,110.5);assert.equal(dive.contact,false);assert.ok(dive.driver.pitch<0);assert.ok(dive.energy<100);await page.screenshot({path:path.join(out,'01-boost-down.png')});
  await page.evaluate(()=>{__P08.reset();});await page.evaluate(setup);await page.locator('#view').focus();await page.keyboard.down('ArrowUp');await page.keyboard.press('KeyA');await page.evaluate(()=>__P08.step(240));await page.keyboard.up('ArrowUp');
  const climb=await page.evaluate(()=>__P08.getBodies().A);assert.ok(climb.v[1]>80);assert.ok(climb.p[1]>300);await page.screenshot({path:path.join(out,'02-boost-up.png')});
  assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>__P08.renderer().error),0);const evidence={browser:await browser.version(),errors,dive:{position:dive.p,velocity:dive.v,cap:dive.diveCap,pitch:dive.driver.pitch,energy:dive.energy},climb:{position:climb.p,velocity:climb.v,cap:climb.diveCap},status:await page.evaluate(()=>__P08.getConfig().status)};fs.writeFileSync(path.join(out,'air-down-browser.json'),JSON.stringify(evidence,null,2));console.log(JSON.stringify(evidence));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
