assert.ok(html.includes('href="./technical.html"'));
assert.ok(technicalHtml.includes('Generate with Kokoro browser & play'));
assert.ok(technicalHtml.includes('Reveal meaning oracle'));
assert.ok(technicalHtml.includes('id="passive-vocabulary"'));
assert.ok(technicalHtml.includes('id="shadowing-script"'));
assert.ok(technicalHtml.includes('id="attempt-ack"'));
assert.ok(technicalHtml.includes('id="reveal-oracle" class="primary" disabled'));
assert.ok(technicalHtml.includes('id="receipt" hidden'));
assert.ok(technicalHtml.includes('id="playback-rate"'));
assert.ok(!technicalHtml.includes('\\\\n'),'Technical HTML must not contain literal backslash-n insertion artifacts');
const technicalIds=[...technicalHtml.matchAll(/\\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(technicalIds).size,technicalIds.length,'Duplicate technical HTML IDs');
for(const match of technicalJs.matchAll(/\\$\\('([^']+)'\\)/g))assert.ok(technicalIds.includes(match[1]),`Missing technical element ${match[1]}`);
assert.ok(technicalJs.includes("'kokoro-web'"));
assert.ok(technicalJs.includes("$('oracle').hidden=false"));
assert.ok(technicalJs.includes("transcriptVisible=true"));
assert.ok(technicalJs.includes("pass.shadowingScript"));
assert.ok(technicalJs.includes("if(!practice.attemptAcknowledged)return"));
assert.ok(technicalJs.includes("ACTIVE_PRACTICED"));
assert.ok(technicalJs.includes("hasGenerativeTechnique"));
assert.ok(technicalJs.includes("semantic-retell")&&technicalJs.includes("premise-mutation"));
assert.ok(technicalJs.includes("practice receipt only; not mastery"));
assert.ok(technicalJs.includes("passive_recognized"));
assert.ok(!/localStorage|fetch\(/.test(technicalJs),'Technical drafts must stay local and narration must use StudioNarrator');
assert.ok(html.includes('id="panel-speak" role="tabpanel" aria-labelledby="tab-speak" hidden'));
assert.ok(html.includes('id="panel-write" role="tabpanel" aria-labelledby="tab-write" hidden'));
assert.ok(!/localStorage|fetch\(/.test(js),'No app upload or persistent browser storage is intended');
assert.ok(!/<details[^>]+id="transcript"[^>]+open/.test(html),'Transcript must start closed');
// Minimal DOM harness exercises shared state and failure paths. It is not browser/audio QA.
class El {
 constructor(id=''){this.id=id;this.value='';this.children=[];this.attrs={};this.dataset={};this.checked=false;this.hidden=false;this.open=false;this.events={};this.classList={add(){},remove(){}};this.parentElement={textContent:'self-review'};}
 append(...values){this.children.push(...values)} replaceChildren(...values){this.children=values;this.textContent=''} setAttribute(k,v){this.attrs[k]=v} removeAttribute(k){delete this.attrs[k]} addEventListener(k,fn){this.events[k]=fn} pause(){} focus(){} click(){} remove(){} showModal(){this.open=true} close(){this.open=false}
}
const els=Object.fromEntries(ids.map(id=>[id,new El(id)]));
const checkEls=Array.from({length:4},()=>new El());
const tabs=['listen','speak','write'].map(name=>{els['tab-'+name].dataset.mode=name;return els['tab-'+name]});