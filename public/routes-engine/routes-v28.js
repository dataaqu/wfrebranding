/* Published service matrix, supplied by WEFORWARD. Geography is indicative. */
(()=>{
 const R=WF_ROUTES,build=R.build,fields=R.fieldsFor,forCountry=R.forCountry;
 const blocked=new Set(['RUS','IRN']);
 R.countries=R.countries.filter(c=>!blocked.has(c.id));
 const importLTL=new Set(['europe','turkey','china','ukraine']),exportLTL=new Set(['europe','armenia','azerbaijan']);
 Object.assign(WF_COUNTRY_CODES,{FLK:'FK',ATF:'TF',PSX:'PS',SDS:'SS',SGP:'SG',MLT:'MT',BHR:'BH',MDV:'MV',MUS:'MU',SYC:'SC',CPV:'CV',COM:'KM',STP:'ST',AND:'AD',MCO:'MC',LIE:'LI',SMR:'SM',VAT:'VA',ATG:'AG',BRB:'BB',DMA:'DM',GRD:'GD',KNA:'KN',LCA:'LC',VCT:'VC',WSM:'WS',TON:'TO',KIR:'KI',TUV:'TV',NRU:'NR',PLW:'PW',MHL:'MH',FSM:'FM',XKX:'XK'});
 R.flag=id=>{const iso=WF_COUNTRY_CODES[id];return iso?String.fromCodePoint(...[...iso].map(c=>127397+c.charCodeAt(0))):'🌐';};
 const option=(id,en,ka)=>({id,label:[en,ka]});
 const direction={key:'direction',label:['Direction','მიმართულება'],options:[option('import','To Georgia','საქართველოში'),option('export','From Georgia','საქართველოდან')]};
 const region=id=>R.families.find(f=>f.id===id)?.region;
 R.countryAvailable=(id,mode,opts={})=>{const c=R.countries.find(c=>c.id===id);if(!c)return false;if(['air','sea'].includes(mode))return true;if(mode==='rail')return c.id==='CHN';if(!R.families.some(f=>f.mode==='road'&&f.region===c.region))return false;if(opts.direction==='export')return exportLTL.has(c.region);return true;};
 R.fieldsFor=(id,values={})=>{
  const family=R.families.find(f=>f.id===id);let fs=fields(id,values).map(f=>({...f,options:[...f.options]}));
  fs.forEach(f=>{if(f.key==='country')f.options=f.options.filter(o=>!blocked.has(o.id)).map(o=>({...o,label:o.label.map(l=>R.flag(o.id)+' '+l)}));});
  if(family?.mode!=='road')return fs;
  const reg=region(id),isExport=values.direction==='export'&&exportLTL.has(reg),ltl=isExport?exportLTL.has(reg):importLTL.has(reg);
  const load={key:'load',label:['Shipment type','გადაზიდვის ტიპი'],options:[option('FTL','Full truck · FTL','სრული ტრაილერი · FTL'),...(ltl?[option('LTL','Groupage · LTL','ნაკრები · LTL')]:[])]};
  fs=fs.filter(f=>f.key!=='load'&&f.key!=='direction');
  return [...(exportLTL.has(reg)?[direction]:[]),load,...fs];
 };
 R.build=(id,values={})=>{
  const family=R.families.find(f=>f.id===id),v={...values};let notice=null;
  if(blocked.has(v.country)){v.country='DEU';notice=['This origin is not served. Select another country.','ამ ქვეყნიდან არ ვეზიდებით. აირჩიეთ სხვა ქვეყანა.'];}
  if(family?.mode!=='road'){const r=build(id,v);r.fields=R.fieldsFor(id,r.options);r.notice=notice;return r;}
  const reg=region(id),isExport=v.direction==='export'&&exportLTL.has(reg),ltl=isExport?exportLTL.has(reg):importLTL.has(reg);
  v.direction=isExport?'export':'import';v.load=v.load==='LTL'&&ltl?'LTL':v.load==='FTL'?'FTL':ltl?'LTL':'FTL';
  const r=build(id,v);r.options={...r.options,direction:v.direction,load:v.load};r.load=v.load;
  const c=R.countries.find(c=>c.id===v.country&&c.region===reg);
  if(c){r.country=c.id;r.options.country=c.id;if(reg==='europe'){r.legs[0]={...r.legs[0],from:{name:c.label,point:c.point},points:[c.point,...r.legs[0].points.slice(1)]};}r.title=[c.label[0]+' → Georgia',c.label[1]+' → საქართველო'];}
  if(isExport){r.legs=r.legs.map(l=>({...l,from:l.to,to:l.from,points:[...l.points].reverse()})).reverse();const name=c?.label||R.regions.find(x=>x.id===reg).label;r.title=['Georgia → '+name[0],'საქართველო → '+name[1]];r.details=['Export from Georgia. Collection, consolidation and delivery are coordinated for your shipment.','ექსპორტი საქართველოდან. ტვირთის აღება, კონსოლიდაცია და მიწოდება იგეგმება თქვენი გადაზიდვისთვის.'];}
  r.fields=R.fieldsFor(id,r.options);r.stops=[r.legs[0].from,...r.legs.map(l=>l.to)];r.notice=notice;
  r.serviceNote=v.load==='LTL'?(isExport?['LTL export · Armenia, Azerbaijan & Europe','LTL ექსპორტი · სომხეთი, აზერბაიჯანი და ევროპა']:['LTL import · Europe, Turkey, China & Ukraine','LTL იმპორტი · ევროპა, თურქეთი, ჩინეთი და უკრაინა']):['Full truckload · FTL','სრული ტრაილერი · FTL'];
  return r;
 };
 R.forCountry=(id,mode,opts={})=>{if(!R.countryAvailable(id,mode,opts))return null;const next=forCountry(id,mode);next.values={...next.values,country:id,...(mode==='road'?{direction:opts.direction||'import',load:opts.load}:{} )};return next;};
 R.families.filter(f=>f.mode==='road').forEach(f=>{f.label=f.label.map(s=>s.replace(/FTL \/ LTL/,importLTL.has(f.region)?'FTL / LTL':'FTL'));});
})();
