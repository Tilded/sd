(function(){
"use strict";
const SOURCES=[
 {id:"01",label:"Shadowdark Game Guide",path:"./src/01/01.md"},
 {id:"02",label:"Player's Guide to the Western Reaches",path:"./src/02/02.md"},
 {id:"03",label:"Game Master's Guide to the Western Reaches",path:"./src/03/03.md"}
];
const DB_NAME="sd-rules-library",DB_VERSION=1,DATA_REVISION="2026-11-06-source-set-1";
const STOP=new Set(("a an and are as at be been being but by can could did do does for from had has have he her here hers him his how i if in into is it its may me might more most my of on or our ours out over she should so some than that the their them then there these they this those to up us was we were what when where which who will with would you your").split(" "));
const SYNONYMS={
 attack:["attacks","weapon","melee","ranged","combat"],hit:["attack","damage","armor","ac"],hp:["hit","points","damage","healing"],
 dying:["death","timer","stabilize","first","aid"],death:["dying","timer","stabilize"],stabilize:["dying","first","aid"],
 mishap:["wizard","failure","critical","spellcasting","table"],wizard:["mishap","spellcasting","arcane"],priest:["penance","deity","spellcasting"],
 penance:["priest","deity","atonement"],reaction:["attitude","hostile","suspicious","friendly","morale"],morale:["flee","wisdom","enemy"],
 trap:["traps","search","disarm"],light:["torch","darkness","illumination"],torch:["light","darkness","timer"],
 darkness:["light","sight","encounter"],travel:["hex","crawling","terrain","movement"],hex:["travel","terrain","encounter"],
 camping:["campfire","rest","watch"],weather:["climate","storm","region"],ration:["rations","food","harsh","climate"],
 encounter:["random","wandering","table","d6"],treasure:["loot","xp","boon"],level:["advancement","talent","xp"],
 luck:["token","fortune","reroll"],spell:["casting","focus","scroll","wand","mishap"]
};
function cleanText(value){
 return String(value||"").replace(/!\[[^\]]*\]\([^)]+\)/g," ").replace(/<span[^>]*><\/span>/gi," ")
  .replace(/<br\s*\/?>/gi,"\n").replace(/<[^>]+>/g," ").replace(/\r/g,"")
  .replace(/[ \t]+/g," ").replace(/\n{3,}/g,"\n\n").trim();
}
function tokens(value){
 return (String(value||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").match(/[a-z0-9]{2,}/g)||[]).filter(x=>!STOP.has(x));
}
function splitLongBlock(text,limit){
 if(text.length<=limit)return [text];
 const paragraphs=text.split(/\n\s*\n/),out=[];let current="";
 for(const paragraph of paragraphs){
  if(paragraph.length>limit){
   if(current){out.push(current);current="";}
   let part="";
   for(const line of paragraph.split("\n")){
    if(part&&part.length+line.length+1>limit){out.push(part);part="";}
    if(line.length>limit){
     if(part){out.push(part);part="";}
     for(let i=0;i<line.length;i+=limit)out.push(line.slice(i,i+limit));
    }else part+=(part?"\n":"")+line;
   }
   if(part)out.push(part);
  }else if(!current)current=paragraph;
  else if(current.length+paragraph.length+2<=limit)current+="\n\n"+paragraph;
  else{out.push(current);current=paragraph;}
 }
 if(current)out.push(current);return out;
}
function parseDocument(doc){
 const marker=/^\s*\{(\d+)\}-{5,}\s*$/gm,marks=[...doc.content.matchAll(marker)],pages=[];
 if(!marks.length)pages.push({page:null,text:doc.content});
 else for(let i=0;i<marks.length;i++){
  const start=marks[i].index+marks[i][0].length,end=i+1<marks.length?marks[i+1].index:doc.content.length;
  pages.push({page:Number(marks[i][1]),text:doc.content.slice(start,end)});
 }
 const chunks=[];
 for(const page of pages){
  const headings=[...page.text.matchAll(/^#{1,6}\s+(.+)$/gm)],sections=[];
  if(!headings.length)sections.push({title:"Page content",text:page.text});
  else{
   for(let i=0;i<headings.length;i++){
    const start=headings[i].index,end=i+1<headings.length?headings[i+1].index:page.text.length;
    sections.push({title:cleanText(headings[i][1]).slice(0,100)||"Page content",text:page.text.slice(start,end)});
   }
   if(headings[0].index>0){
    const lead=page.text.slice(0,headings[0].index);
    if(lead.trim().length>100)sections.unshift({title:"Page content",text:lead});
   }
  }
  for(const section of sections){
   const cleaned=cleanText(section.text);if(cleaned.length<100)continue;
   const anchor=section.text.match(/id=["']page-(\d+)-\d+["']/i),pageNo=anchor?Number(anchor[1]):page.page;
   for(const piece of splitLongBlock(cleaned,1850)){
    if(piece.length<100)continue;
    const heading=(piece.match(/^#{1,6}\s+(.+)$/m)||[])[1];
    chunks.push({id:doc.id+"-"+String(pageNo===null?"x":pageNo)+"-"+chunks.length,book:doc.id,label:doc.label,page:pageNo,title:heading?cleanText(heading).slice(0,100):section.title,text:piece,searchText:(section.title+" "+piece).toLowerCase()});
   }
  }
 }
 return chunks;
}
function validateDocument(id,content){
 const source=SOURCES.find(x=>x.id===id);
 if(!source)throw Error("Unknown source book ID: "+id);
 if(typeof content!=="string"||content.length<10000)throw Error("Source "+id+" is missing or unexpectedly small");
 if(!/^\s*\{\d+\}-{5,}/m.test(content))throw Error("Source "+id+" does not contain the expected page markers");
 if(id==="01"&&!/Shadow[Dd]ark/i.test(content.slice(0,20000)))throw Error("The selected 01.md does not appear to be the Shadowdark core book");
 if(id==="02"&&!/Player['’]s Guide to the Western Reaches/i.test(content.slice(0,30000)))throw Error("The selected 02.md does not appear to be the Western Reaches Player's Guide");
 if(id==="03"&&!/Game Master['’]s Guide to the Western Reaches/i.test(content.slice(0,30000)))throw Error("The selected 03.md does not appear to be the Western Reaches Game Master's Guide");
 return {id:id,label:source.label,path:source.path,revision:DATA_REVISION,content:content};
}
function openDatabase(){
 if(!window.indexedDB)return Promise.resolve(null);
 return new Promise((resolve,reject)=>{
  const req=indexedDB.open(DB_NAME,DB_VERSION);
  req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains("documents"))db.createObjectStore("documents",{keyPath:"id"});};
  req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||new Error("IndexedDB could not be opened"));
 });
}
async function readCache(){
 const db=await openDatabase();if(!db)return [];
 return new Promise((resolve,reject)=>{
  const tx=db.transaction("documents","readonly"),req=tx.objectStore("documents").getAll();
  req.onsuccess=()=>resolve(req.result||[]);req.onerror=()=>reject(req.error||new Error("Could not read cached rules"));
  tx.oncomplete=()=>db.close();tx.onerror=()=>{db.close();reject(tx.error);};
 });
}
async function writeCache(docs){
 const db=await openDatabase();if(!db)throw Error("IndexedDB is unavailable in this browser");
 return new Promise((resolve,reject)=>{
  const tx=db.transaction("documents","readwrite"),store=tx.objectStore("documents");
  docs.forEach(doc=>store.put(doc));
  tx.oncomplete=()=>{db.close();resolve(true);};
  tx.onerror=()=>{const e=tx.error;db.close();reject(e||new Error("Could not cache source books"));};
  tx.onabort=()=>{const e=tx.error;db.close();reject(e||new Error("Source cache transaction aborted"));};
 });
}
class RuleSourceLibrary{
 constructor(){this.status="not-loaded";this.documents=[];this.chunks=[];this.error="";this.origin="";this.ready=false;this.cacheWarning="";}
 activate(docs,origin){
  const byId=new Map(docs.map(x=>[x.id,x]));
  if(!SOURCES.every(x=>byId.has(x.id))){this.status="incomplete";this.documents=docs;this.chunks=[];this.termDocumentFrequency=new Map();this.ready=false;this.error="All three source books are required.";return false;}
  this.documents=SOURCES.map(x=>byId.get(x.id));this.chunks=this.documents.flatMap(parseDocument);
  this.termDocumentFrequency=new Map();
  for(const chunk of this.chunks)for(const term of new Set(tokens(chunk.searchText)))this.termDocumentFrequency.set(term,(this.termDocumentFrequency.get(term)||0)+1);
  this.status="ready";this.ready=true;this.error="";this.origin=origin;return true;
 }
 summary(){return {status:this.status,error:this.error,origin:this.origin,ready:this.ready,documentCount:this.documents.length,chunkCount:this.chunks.length,cacheWarning:this.cacheWarning};}
 async loadProjectFolder(){
  if(location.protocol==="file:")throw Error("Direct file mode cannot fetch sibling Markdown files. Import 01.md, 02.md, and 03.md instead.");
  const docs=[];
  for(const source of SOURCES){
   const response=await fetch(source.path,{cache:"no-cache"});
   if(!response.ok)throw Error("Could not load "+source.path+" (HTTP "+response.status+")");
   docs.push(validateDocument(source.id,await response.text()));
  }
  try{await writeCache(docs);this.cacheWarning="";}catch(error){this.cacheWarning="Browser storage unavailable; source books remain loaded until this page closes. "+error.message;}
  this.activate(docs,"project folder");return true;
 }
 async initialize(force=false){
  this.status="loading";this.ready=false;
  try{
   let cache=[];try{cache=await readCache();}catch(error){this.cacheWarning="Browser storage unavailable: "+error.message;}
   const byId=new Map(cache.filter(x=>x.revision===DATA_REVISION).map(x=>[x.id,x]));
   if(!force&&SOURCES.every(x=>byId.has(x.id))){this.activate([...byId.values()],"IndexedDB cache");return this.summary();}
   try{await this.loadProjectFolder();return this.summary();}
   catch(fetchError){
    const reusable=SOURCES.map(x=>byId.get(x.id)).filter(Boolean);
    if(reusable.length===3){this.activate(reusable,"IndexedDB cache");this.error=fetchError.message;return this.summary();}
    this.status="needs-import";this.error=fetchError.message;this.ready=false;return this.summary();
   }
  }catch(error){this.status="error";this.error=error.message;this.ready=false;return this.summary();}
 }
 async importFiles(fileList){
  const byId=new Map(this.documents.map(x=>[x.id,x]));
  for(const file of [...(fileList||[])]){
   const source=SOURCES.find(x=>file.name.toLowerCase()===x.id+".md");
   if(source)byId.set(source.id,validateDocument(source.id,await file.text()));
  }
  const docs=SOURCES.map(x=>byId.get(x.id)).filter(Boolean);
  if(docs.length!==3)throw Error("Select the three source files named 01.md, 02.md, and 03.md. Found "+docs.length+" of 3.");
  try{await writeCache(docs);this.cacheWarning="";}catch(error){this.cacheWarning="Browser storage unavailable; source books remain loaded until this page closes. "+error.message;}
  this.activate(docs,"imported local files");return this.summary();
 }
 search(query,isReaches=false,limit=5,placeHint=""){
  if(!this.ready||!this.chunks.length)return [];
  const base=tokens(query),expanded=new Map();
  for(const token of base){expanded.set(token,1);(SYNONYMS[token]||[]).forEach(term=>{if(!expanded.has(term))expanded.set(term,0.42);});}
  const terms=[...expanded.entries()];if(!terms.length)return [];
  const ranked=[];
  for(const chunk of this.chunks){
   let score=0;
   for(const [term,weight] of terms){
    const occurrences=chunk.searchText.split(term).length-1,docFrequency=this.termDocumentFrequency.get(term)||0;
    const inverseDocumentWeight=1+Math.log((this.chunks.length+1)/(docFrequency+1));
    if(occurrences>0)score+=(1+Math.log(occurrences))*weight*inverseDocumentWeight;
    if(chunk.title.toLowerCase().includes(term))score+=4*weight*inverseDocumentWeight;
   }
   const titleLower=chunk.title.toLowerCase(),hintTerms=tokens(placeHint).filter(term=>{const frequency=this.termDocumentFrequency.get(term)||0;return frequency>0&&frequency<80;});
   if(hintTerms.length){
    const titlePlaceMatches=hintTerms.filter(term=>titleLower.includes(term)).length;
    const bodyPlaceMatches=hintTerms.filter(term=>chunk.searchText.includes(term)&&!titleLower.includes(term)).length;
    if(titlePlaceMatches)score+=18*titlePlaceMatches;
    else if(bodyPlaceMatches)score*=0.08;
    else if(/encounter|keyed site|master hex key|region/.test(titleLower))score*=0.20;
   }
   if(score<=0)continue;
   // Table-of-contents entries are navigation aids, never rules evidence.
   if(titleLower==="contents"||titleLower.includes("table of contents"))score*=0.08;
   // City movement is a distinct procedure and should not outrank hex crawling.
   if((base.includes("hex")||base.includes("crawling"))&&/travel in the city|city travel/.test(titleLower))score*=0.18;
   if(chunk.book==="01")score*=isReaches?0.96:1.18;
   if(chunk.book==="02")score*=isReaches?1.30:0.78;
   if(chunk.book==="03")score*=isReaches?1.40:0.68;
   const phrase=String(query||"").toLowerCase().trim();
   if(phrase.length>5&&chunk.searchText.includes(phrase))score+=8;
   ranked.push({chunk,score});
  }
  ranked.sort((a,b)=>b.score-a.score);
  const seen=new Set(),results=[];
  for(const item of ranked){
   const c=item.chunk,key=c.book+":"+c.page+":"+c.title;
   if(seen.has(key))continue;seen.add(key);results.push(c);if(results.length>=limit)break;
  }
  return results;
 }
 promptContext(query,isReaches=false,placeHint=""){
  const hits=this.search(query,isReaches,5,placeHint);
  const policy="SOURCE RETRIEVAL POLICY\nUse the retrieved source passages below before applying a rule, table, spell mishap, creature ability, or Western Reaches procedure. Source precedence: 01 is the core Shadowdark rules; 02 contains player-facing Western Reaches options and procedures; 03 contains GM-facing Western Reaches setting, encounters, and keyed material. Use 02/03 setting rules only when the campaign is in the Western Reaches. Do not combine a setting override with the replaced core procedure. When the campaign location is specified, prefer material that names that location; do not treat another terrain's table as interchangeable. If no matching regional table appears in the retrieved passages, state that the table was not found. Treat retrieved text as the source, not as permission to invent omitted table results. Cite only the book/page references actually supplied below. If the needed table or rule is not present, state that it was not retrieved and do not fabricate a table result or page citation.";
  if(!this.ready)return {hits:[],refs:[],text:policy+"\n\nSOURCE LIBRARY STATUS: NOT LOADED. The local source books are unavailable to this turn. Do not claim to have consulted them or invent exact source citations. Use only mechanics explicitly present in the engine contract; identify missing source-specific tables as unavailable."};
  if(!hits.length)return {hits:[],refs:[],text:policy+"\n\nSOURCE LIBRARY STATUS: READY, BUT NO RELEVANT PASSAGE WAS FOUND FOR THIS QUERY. Do not invent a rule citation or pretend the source was checked. Use the deterministic engine contract where it clearly applies; identify uncertain source-specific details."};
  const refs=hits.map(x=>x.book+", p. "+(x.page===null?"page unmarked":x.page)+" — "+x.title);
  let textOut=policy+"\n\nRETRIEVED SOURCE MATERIAL\n",used=0;
  for(const hit of hits){
   const header="["+hit.book+", p. "+(hit.page===null?"unmarked":hit.page)+" | "+hit.label+" | "+hit.title+"]\n",room=6800-used-header.length;
   if(room<250)break;
   const body=hit.text.slice(0,Math.min(1550,room-2));
   textOut+=header+body+"\n\n";used+=header.length+body.length+2;
  }
  return {hits: hits,refs:refs,text:textOut};
 }
 runTests(){
  const samples=[
   {id:"01",label:"Core Rules",content:"{80}----------------\n## Morale\nEnemies reduced to half their number flee if they fail a DC 15 Wisdom check. Large groups make one check using the leader Wisdom modifier, while a solo enemy checks when it reaches half its hit points.\n{81}----------------\n## Wizard Mishaps\nOn a natural 1, roll on the wizard mishap table for the spell tier. The result may harm the caster, change the spell target, or impose a further restriction. Use the table printed for the caster spell tier."},
   {id:"02",label:"Player Guide",content:"{225}----------------\n## Hex Crawling\nTravel across six-mile hexes. Terrain changes the daily travel budget, and the party selects a travel method before moving. Weather and encounters are resolved through the travel procedure.\n{226}----------------\n## Climate\nStormy weather changes foraging. The region and season determine the climate, and harsh climate changes the party ration requirement."},
   {id:"03",label:"Game Master Guide",content:"{54}----------------\n## Forest Encounters\nUse the regional encounter table when the party travels through the forest. Roll the listed die and apply the keyed encounter result; do not substitute a different terrain table.\n{55}----------------\n## Sablewood Encounters\nSablewood encounters use the Sablewood regional encounter table. The table's results are specific to this forest and should not be replaced with canyon or desert results.\n{56}----------------\n## Canyon Encounters\nCanyon encounters use the canyon regional encounter table. The table's results are specific to canyon terrain and should not be used for forest travel."}
  ];
  const prior={documents:this.documents,chunks:this.chunks,termDocumentFrequency:this.termDocumentFrequency,ready:this.ready,status:this.status,error:this.error,origin:this.origin};
  try{
   this.activate(samples,"test");
   const mishap=this.search("wizard mishap natural 1",false,5).some(x=>x.book==="01"&&x.page===81);
   const postRollMishap=this.search("cast spell critical failure wizard mishap table roll 4",false,5).some(x=>x.book==="01"&&x.page===81);
   const reaches=this.search("hex travel terrain",true,5).some(x=>x.book==="02"&&x.page===225);
   const gm=this.search("forest encounter table",true,5).some(x=>x.book==="03"&&x.page===54);
   const namedRegionHits=this.search("regional encounter table",true,5,"Sablewood"),sablewoodIndex=namedRegionHits.findIndex(x=>x.book==="03"&&x.page===55),canyonIndex=namedRegionHits.findIndex(x=>x.book==="03"&&x.page===56),namedRegion=sablewoodIndex>=0&&(canyonIndex<0||sablewoodIndex<canyonIndex);
   const context=this.promptContext("wizard mishap",false),grounded=context.text.includes("[01, p. 81")&&context.refs.includes("01, p. 81 — Wizard Mishaps");
   const bounded=context.text.length<=7200;
   this.status="not-loaded";this.ready=false;const missing=this.promptContext("wizard mishap",false).text.includes("SOURCE LIBRARY STATUS: NOT LOADED");
   return [
    {name:"wizard mishap query retrieves the core source page",pass:mishap},
    {name:"post-roll critical failure query retrieves the mishap table",pass:postRollMishap},
    {name:"Reaches hex-travel query retrieves the player procedure",pass:reaches},
    {name:"GM encounter query retrieves setting encounter material",pass:gm},
    {name:"named region query favors the matching encounter table",pass:namedRegion},
    {name:"prompt context carries book/page citations",pass:grounded},
    {name:"retrieved context stays within the size budget",pass:bounded},
    {name:"missing library is disclosed to the model",pass:missing}
   ];
  }finally{this.documents=prior.documents;this.chunks=prior.chunks;this.termDocumentFrequency=prior.termDocumentFrequency;this.ready=prior.ready;this.status=prior.status;this.error=prior.error;this.origin=prior.origin;}
 }
}
window.RuleSourceLibrary=RuleSourceLibrary;
})();