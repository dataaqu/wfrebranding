/* WEFORWARD sea service policy. LCL is China → Georgia only. */
(()=>{
 const R=window.WF_ROUTES;if(!R)return;
 const build=R.build,fields=R.fieldsFor,available=R.countryAvailable,forCountry=R.forCountry;
 const china=(id,v={})=>v.country==='CHN'||(!v.country&&id==='china-sea');
 const containerField=allowed=>({key:'load',label:['Shipment type','გადაზიდვის ტიპი'],options:[{id:'FCL',label:['Full container · FCL','სრული კონტეინერი · FCL']},...(allowed?[{id:'LCL',label:['Groupage · LCL','ნაკრები · LCL']}]:[])]});
 R.countryAvailable=(id,mode,opts={})=>available(id,mode,opts)&&!(mode==='sea'&&['ARM','AZE'].includes(id));
 R.fieldsFor=(id,v={})=>{
  const fs=fields(id,v);if(R.families.find(f=>f.id===id)?.mode!=='sea')return fs;
  const load=containerField(china(id,v));return fs.some(f=>f.key==='load')?fs.map(f=>f.key==='load'?load:f):[load,...fs];
 };
 R.build=(id,values={})=>{
  const sea=R.families.find(f=>f.id===id)?.mode==='sea';if(!sea)return build(id,values);
  let v={...values};if(['ARM','AZE'].includes(v.country)){v.country='DEU';v.load='FCL';}
  v.load=china(id,v)&&v.load==='LCL'?'LCL':'FCL';
  const r=build(id,v);r.load=v.load;r.options.load=v.load;r.fields=R.fieldsFor(id,r.options);
  r.serviceNote=china(id,r.options)?['China → Georgia · FCL & LCL','ჩინეთი → საქართველო · FCL და LCL']:['FCL · Maritime origins worldwide, except Russia & Iran. LCL is available from China only.','FCL · საზღვაო მიმართულებები მთელი მსოფლიოდან, რუსეთისა და ირანის გარდა. LCL მხოლოდ ჩინეთიდან.'];
  return r;
 };
 R.forCountry=(id,mode,opts={})=>R.countryAvailable(id,mode,opts)?forCountry(id,mode,opts):null;
})();
