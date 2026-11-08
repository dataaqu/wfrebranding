/* Geographic corridor illustrations. Waypoints are not navigation instructions. */
(() => {
 const S=(en,ka,lon,lat)=>({name:[en,ka],point:[lon,lat]});
 const p={
 europe:S('Europe · Rotterdam','ევროპა · როტერდამი',4.48,51.92),bulgaria:S('Bulgaria','ბულგარეთი',23.32,42.70),istanbul:S('Istanbul','სტამბული',28.98,41.01),istanbulPort:S('Istanbul · Port region','სტამბული · პორტი',28.68,40.97),sarp:S('Sarp · Border','სარფი · საზღვარი',41.55,41.52),georgia:S('Tbilisi · Georgia','თბილისი · საქართველო',44.8,41.72),poti:S('Poti · Georgia','ფოთი · საქართველო',41.65,42.15),
 china:S('China · Xi’an','ჩინეთი · სიანი',108.94,34.34),kazakhstan:S('Kazakhstan','ყაზახეთი',76.85,43.24),aktau:S('Aktau · Caspian port','აქტაუ · კასპიის პორტი',51.15,43.65),alat:S('Baku Port · Alat','ბაქოს პორტი · ალიათი',49.4,39.99),russia:S('Russia · Astrakhan','რუსეთი · ასტრახანი',48.04,46.35),baku:S('Azerbaijan','აზერბაიჯანი',49.85,40.4),gardabani:S('Gardabani','გარდაბანი',45.09,41.46),
 dubai:S('Dubai','დუბაი',55.27,25.2),saudi:S('Saudi Arabia · Riyadh','საუდის არაბეთი · რიადი',46.675,24.71),jordan:S('Jordan','იორდანია',35.93,31.95),syria:S('Syria','სირია',36.28,33.51),turkey:S('Türkiye','თურქეთი',37.38,37.07),
 jebel:S('Jebel Ali','ჯებელ ალი',55.05,25),jeddah:S('Jeddah','ჯედა',39.1667,21.4667),sohar:S('Sohar','სოჰარი',56.73,24.5),salalah:S('Salalah','სალალა',54.08,16.95),suez:S('Suez Canal','სუეცის არხი',32.3,31.26),cape:S('Cape of Good Hope','კეთილი იმედის კონცხი',18,-36.5),piraeus:S('Piraeus','პირეუსი',23.6167,37.9333),
 airChina:S('China · Shanghai','ჩინეთი · შანხაი',121.8,31.14),airEurope:S('Europe · Frankfurt','ევროპა · ფრანკფურტი',8.57,50.03),airDubai:S('Dubai','დუბაი',55.36,25.25),airAmerica:S('America · New York','ამერიკა · ნიუ-იორკი',-73.78,40.64),tbs:S('Tbilisi · Air gateway','თბილისი · აეროპორტი',44.95,41.67)
 };
 const leg=(mode,from,to,via=[],extra={})=>({mode,from,to,points:[from.point,...via,to.point],...extra});
 const landChina=[[103.8,36.1],[93.5,42.8],[87.6,43.8],[80.41,44.22]];
 const kazakhWest=[[69.59,42.32],[65.5,44.85],[61.67,46.8],[55.2,45.32]];
 const azRoad=[[48.6,40.5],[46.36,40.68],[45.03,41.33]];
 const turkeyRoad=[[31.6,40.7],[35.8,40.8],[39.7,41],[41.2,41.4]];
 const europeRoad=[[7.4,51],[9,49],[13,48.5],[16.37,48.2],[19.04,47.5],[20.46,44.8]];
 const dubaiSaudi=[[53.5,24.1],[51.6,24.1],[49.58,25.3]];
 const saudiJordan=[[43.9,27.5],[40,29.8],[37.34,31.33]];
 const gulfRoad=(from)=>[
  ...(from==='dubai'?[leg('road',p.dubai,p.saudi,dubaiSaudi)]:[]),leg('road',p.saudi,p.jordan,saudiJordan),leg('road',p.jordan,p.syria,[[36.1,32.5]]),leg('road',p.syria,p.turkey,[[36.7,34.7],[37.16,36.2]]),leg('road',p.turkey,p.georgia,[[37.02,39.75],[41.27,39.9],[42.8,41.0],[42.85,41.6],[43.1,41.8]])
 ];
 const northEuropeSea=[[3.7,52],[1.6,50.95],[-5.5,49.8],[-10,43],[-10,38],[-5.6,35.98]];
 const westMed=[[-4.5,36],[0,37],[5,37.8],[9,37.7],[11.3,37.2],[14,36.6],[18,36.2],[21.5,36.1],[23,36.2],[23.6,37.2]];
 const aegean=[[23.45,37.77],[23.7,37.45],[24.2,37.5],[25,38.2],[25.6,39.3],[26.19,40.02],[26.35,40.15],[26.65,40.39],[27.2,40.65]];
 const bosphorus=[[28.9,40.85],[29.03,40.98],[29.04,41.05],[29.08,41.12],[29.1,41.21],[29.14,41.25],[30.5,41.7],[34,42.6],[38,42.4]];
 const suezMed=[[32.2,31.6],[30.5,32.6],[27,34],[26.5,34.7],[27,35.4],[26.2,36.2],[24.5,37.2]];
 const canal=[[32.55,29.93],[32.57,30.08],[32.49,30.28],[32.35,30.6],[32.32,30.88]];
 const northRedSea=[[36,24],[34.2,27.1],[33.3,28.4],...canal];
 const redSea=[[43.35,12.5],[42.6,14.5],[40.5,17.5],[38.5,20],...northRedSea];
 const gulfExit=[[54.2,25.6],[55.5,26.4],[56.4,26.6],[56.8,25.7],[58.7,24],[60.2,22.5]];
 const toArabian=port=>port==='jebel'?gulfExit:port==='sohar'?[[58,24],[59.8,22.3]]:[[55,16.7]];
 const suezFrom=port=>[...toArabian(port),...(port==='salalah'?[[51,13.8]]:[[60,19],[56,14.8],[51,13.8]]),[46,12],...redSea];
 const capeFrom=port=>[...toArabian(port),[60,14],[60,0],[57,-23],[27,-36.5],[23,-37]];
 const capeMed=[[15,-36.5],[7,-30],[-2,-15],[-12,0],[-20,18],[-15,35],[-5.6,35.98],...westMed];
 const georgiaEnd=(from,last)=>last==='road'?leg('road',from,p.georgia,[[28.98,41.01],...turkeyRoad,p.sarp.point,[42.7,42.2]]):leg('sea',from,p.poti,bosphorus);
 const legacySeaFinish=(from,via,last='sea',approach=[])=>{
  if(via==='piraeus')return [leg('sea',from,p.piraeus,approach),leg('sea',p.piraeus,p.poti,[...aegean,[28.8,40.7],...bosphorus])];
  if(via==='both')return [leg('sea',from,p.piraeus,approach),leg('sea',p.piraeus,p.istanbulPort,aegean),georgiaEnd(p.istanbulPort,last)];
  return [leg('sea',from,p.istanbulPort,[...approach,p.piraeus.point,...aegean]),georgiaEnd(p.istanbulPort,last)];
 };
 // City and terminal anchors are illustrative; private warehouse street addresses are not implied.
 Object.assign(p,{
  bulgariaWH:S('Sofia · Warehouse','სოფია · საწყობი',23.3219,42.6977),italyWH:S('Treviso · Warehouse','ტრევიზო · საწყობი',12.245,45.6669),
  varna:S('Varna · Ferry port','ვარნა · საბორნე პორტი',27.87,43.19),burgas:S('Burgas · Drujba ferry','ბურგასი · Drujba ბორანი',27.47,42.48),batumi:S('Batumi','ბათუმი',41.65,41.65),kapikule:S('Kapıkule · Border','ქაფიქულე · საზღვარი',26.35,41.72),
  trieste:S('Trieste · Italy','ტრიესტე · იტალია',13.76,45.65),tekirdag:S('Tekirdağ · Martaş','ტეკირდაგი · მარდაში',27.94,40.98),sete:S('Sète · France','სეტი · საფრანგეთი',3.71,43.39),yalova:S('Yalova · Turkey','იალოვა · თურქეთი',29.4,40.71),
  yiwu:S('Yiwu · Warehouse','ივუ · საწყობი',120.07,29.31),khorgos:S('Khorgos · Warehouse / border','ხორგოსი · საწყობი / საზღვარი',80.41,44.22),dongguan:S('Dongguan · Warehouse','დუნგუანი · საწყობი',113.75,23.02),
  istanbulWH:S('Istanbul · Warehouse','სტამბული · საწყობი',28.98,41.01),ankaraWH:S('Ankara · Warehouse','ანკარა · საწყობი',32.85,39.93),turkeyPickup:S('Turkey · Any pickup city','თურქეთი · ნებისმიერი ქალაქი',35.2,39.2),
  ningbo:S('Ningbo · Beilun','ნინგბო · ბეილუნი',121.85,29.94),shanghai:S('Shanghai · Yangshan','შანხაი · იანგშანი',122.05,30.63),qingdao:S('Qingdao','ცინდაო',120.21,36.01),guangzhou:S('Guangzhou · Nansha','გუანჯოუ · ნანშა',113.67,22.65),xiamen:S('Xiamen','სიამენი',118.07,24.47),hongkong:S('Hong Kong','ჰონგ-კონგი',114.13,22.34),
  antwerp:S('Antwerp','ანტვერპენი',4.3,51.3),hamburg:S('Hamburg','ჰამბურგი',9.95,53.54),lehavre:S('Le Havre','ლე-ავრი',0.1,49.48),gibraltar:S('Strait of Gibraltar','გიბრალტარის სრუტე',-5.6,35.98),
  newyork:S('New York / New Jersey','ნიუ-იორკი / ნიუ-ჯერსი',-74.07,40.67),losangeles:S('Los Angeles','ლოს-ანჯელესი',-118.25,33.71),halifax:S('Halifax','ჰალიფაქსი',-63.57,44.64),vancouver:S('Vancouver','ვანკუვერი',-123.1,49.29),santos:S('Santos · Brazil','სანტოსი · ბრაზილია',-46.3,-23.98),callao:S('Callao · Peru','კალიაო · პერუ',-77.15,-12.05),panama:S('Panama Canal','პანამის არხი',-79.92,9.35),
  xian:S('Xi’an · Rail terminal','სიანი · რკინიგზის ტერმინალი',108.94,34.34),chongqing:S('Chongqing · Rail terminal','ჩუნცინი · რკინიგზის ტერმინალი',106.55,29.56),hefei:S('Hefei · Rail terminal','ჰეფეი · რკინიგზის ტერმინალი',117.23,31.82),
  shanghaiWH:S('Shanghai · Consolidation warehouse','შანხაი · საკონსოლიდაციო საწყობი',121.47,31.23),qingdaoWH:S('Qingdao · Consolidation warehouse','ცინდაო · საკონსოლიდაციო საწყობი',120.38,36.07),guangzhouWH:S('Guangzhou · Consolidation warehouse','გუანჯოუ · საკონსოლიდაციო საწყობი',113.26,23.13),
  airTurkey:S('Turkey · Istanbul','თურქეთი · სტამბული',28.75,41.26),airKazakhstan:S('Kazakhstan · Almaty','ყაზახეთი · ალმათი',77.04,43.35),airCanada:S('Canada · Toronto','კანადა · ტორონტო',-79.63,43.68),airSouthAmerica:S('South America · São Paulo','სამხრეთ ამერიკა · სან-პაულუ',-46.47,-23.43),airAfrica:S('Africa · Johannesburg','აფრიკა · იოჰანესბურგი',28.25,-26.13),airIndia:S('India · Delhi','ინდოეთი · დელი',77.1,28.56),airAsiaPacific:S('Asia Pacific · Singapore','აზია-წყნარი ოკეანე · სინგაპური',103.99,1.36),airOceania:S('Oceania · Sydney','ოკეანეთი · სიდნეი',151.18,-33.95),airSaudi:S('Saudi Arabia · Jeddah','საუდის არაბეთი · ჯედა',39.16,21.68),airOman:S('Oman · Muscat','ომანი · მუსკატი',58.28,23.59)
 });
 ['bulgariaWH','italyWH','yiwu','dongguan','khorgos','istanbulWH','ankaraWH','shanghaiWH','qingdaoWH','guangzhouWH'].forEach(k=>p[k].kind='warehouse');
 ['xian','chongqing','hefei'].forEach(k=>p[k].kind='terminal');
 const O=(id,en,ka)=>({id,label:[en,ka]});
 const field=(key,en,ka,options,extra={})=>({key,label:[en,ka],options,...extra});
 const roadLoad=field('load','Shipment type','გადაზიდვის ტიპი',[O('LTL','LTL · Shared trailer','LTL · ნაკრები ტვირთი'),O('FTL','FTL · Full trailer','FTL · სრული ტრაილერი')]);
 const seaLoad=field('load','Container load','კონტეინერის დატვირთვა',[O('FCL','FCL · Full container','FCL · სრული კონტეინერი'),O('LCL','LCL · Shared container','LCL · ნაკრები ტვირთი')]);
 const crossing=field('crossing','Overland corridor','სახმელეთო დერეფანი',[O('caspian','Via Aktau ferry','აქტაუს ბორნით'),O('russia','Via Russia','რუსეთის გავლით')],{cards:true});
 const passage=field('passage','Ocean passage','საზღვაო გზა',[O('suez','Suez Canal','სუეცის არხი'),O('cape','Around Africa','აფრიკის შემოვლით')]);
 const via=field('via','Connection port','გადატვირთვის პორტი',[O('piraeus','Greece · Piraeus','საბერძნეთი · პირეუსი'),O('istanbul','Turkey · Istanbul','თურქეთი · სტამბული')]);
 const portField=(options,label=['Departure port','გამგზავრების პორტი'])=>field('port',...label,options,{select:true});
 const chinaPorts=['ningbo','shanghai','qingdao','guangzhou','xiamen','hongkong'].map(k=>O(k,p[k].name[0],p[k].name[1]));
 const regions=[
  {id:'europe',label:['Europe','ევროპა'],point:[12,52],offset:[-22,-22],air:'Europe'},
  {id:'china',label:['China','ჩინეთი'],point:[103,38],offset:[-6,-6],air:'China'},
  {id:'uae',label:['United Arab Emirates','არაბთა გაერთიანებული საამიროები'],point:[54.3,24.3],offset:[45,37],air:'Dubai'},
  {id:'turkey',label:['Turkey','თურქეთი'],point:[35,39],offset:[-35,8],air:'Turkey'},
  {id:'usa',label:['USA','აშშ'],point:[-102,38],offset:[0,0],air:'America'},
  {id:'kazakhstan',label:['Kazakhstan','ყაზახეთი'],point:[68,49],offset:[12,-27],air:'Kazakhstan',transit:true},
  {id:'canada',label:['Canada','კანადა'],point:[-105,59],offset:[0,-5],air:'Canada'},
  {id:'south-america',label:['South America','სამხრეთ ამერიკა'],point:[-59,-15],offset:[0,8],air:'SouthAmerica'},
  {id:'saudi',label:['Saudi Arabia','საუდის არაბეთი'],point:[44,24],offset:[-30,60],air:'Saudi'},
  {id:'oman',label:['Oman','ომანი'],point:[57,20],offset:[55,66],air:'Oman'},
  {id:'africa',label:['Africa','აფრიკა'],point:[17,0],offset:[-17,4],air:'Africa',airOnly:true},
  {id:'india',label:['India','ინდოეთი'],point:[79,22],offset:[10,4],air:'India',airOnly:true},
  {id:'asia-pacific',label:['Asia Pacific','აზია-წყნარი ოკეანე'],point:[115,7],offset:[30,10],air:'AsiaPacific',airOnly:true},
  {id:'oceania',label:['Oceania','ოკეანეთი'],point:[135,-27],offset:[0,5],air:'Oceania',airOnly:true}
 ];
 const families=[
  {id:'europe-road',region:'europe',mode:'road',label:['Europe · FTL / LTL','ევროპა · FTL / LTL'],title:['Europe to Georgia','ევროპიდან საქართველოში']},
  {id:'china-road',region:'china',mode:'road',label:['China · FTL / LTL','ჩინეთი · FTL / LTL'],title:['China to Georgia','ჩინეთიდან საქართველოში']},
  {id:'turkey-road',region:'turkey',mode:'road',label:['Turkey · FTL / LTL','თურქეთი · FTL / LTL'],title:['Turkey to Georgia','თურქეთიდან საქართველოში']},
  {id:'dubai-road',region:'uae',mode:'road',label:['United Arab Emirates','არაბთა გაერთიანებული საამიროები'],title:['Dubai to Georgia','დუბაიდან საქართველოში']},
  {id:'saudi-road',region:'saudi',mode:'road',label:['Saudi Arabia','საუდის არაბეთი'],title:['Saudi Arabia to Georgia','საუდის არაბეთიდან საქართველოში']},
  {id:'china-sea',region:'china',mode:'sea',label:['China · FCL / LCL','ჩინეთი · FCL / LCL'],title:['China to Georgia by sea','ჩინეთიდან საქართველოში ზღვით']},
  {id:'europe-sea',region:'europe',mode:'sea',label:['Europe · FCL','ევროპა · FCL'],title:['European ports to Georgia','ევროპის პორტებიდან საქართველოში']},
  {id:'usa-sea',region:'usa',mode:'sea',label:['USA · FCL','აშშ · FCL'],title:['USA to Georgia','აშშ-დან საქართველოში']},
  {id:'canada-sea',region:'canada',mode:'sea',label:['Canada · FCL','კანადა · FCL'],title:['Canada to Georgia','კანადიდან საქართველოში']},
  {id:'south-america-sea',region:'south-america',mode:'sea',label:['South America · FCL','სამხრეთ ამერიკა · FCL'],title:['South America to Georgia','სამხრეთ ამერიკიდან საქართველოში']},
  {id:'jebel-sea',region:'uae',mode:'sea',label:['United Arab Emirates · Jebel Ali','არაბთა გაერთიანებული საამიროები · ჯებელ ალი'],title:['Jebel Ali to Georgia','ჯებელ ალიდან საქართველოში']},
  {id:'saudi-sea',region:'saudi',mode:'sea',label:['Saudi Arabia · Jeddah','საუდის არაბეთი · ჯედა'],title:['Jeddah to Georgia','ჯედადან საქართველოში']},
  {id:'oman-sea',region:'oman',mode:'sea',label:['Oman · Salalah / Sohar','ომანი · სალალა / სოჰარი'],title:['Oman to Georgia','ომანიდან საქართველოში']},
  {id:'dubai-jeddah',region:'uae',mode:'sea',label:['Dubai · Truck via Jeddah','დუბაი · მანქანით ჯედას გავლით'],title:['Dubai via Jeddah','დუბაი — ჯედას გავლით']},
  {id:'dubai-oman',region:'uae',mode:'sea',label:['Dubai · Truck via Oman','დუბაი · მანქანით ომანის გავლით'],title:['Dubai via Oman','დუბაი — ომანის გავლით']},
  {id:'china-rail',region:'china',mode:'rail',label:['China · Rail FCL / LCL','ჩინეთი · რკინიგზა FCL / LCL'],title:['China to Georgia by rail','ჩინეთიდან საქართველოში რკინიგზით']},
  {id:'air',region:'world',mode:'air',label:['Worldwide · Import / Export','მსოფლიო · იმპორტი / ექსპორტი'],title:['Worldwide air freight','მსოფლიო საჰაერო გადაზიდვები']}
 ];
 function fieldsFor(id,values={}){
  if(id==='europe-road'){
   const ltl=values.load!=='FTL';return [roadLoad,field('corridor','Choose your route','აირჩიე მარშრუტი',ltl?[
    {...O('bulgaria-ferry','Via Bulgaria + Black Sea ferry','ბულგარეთი + შავი ზღვის ბორანი'),description:['Sofia warehouse · Varna / Burgas · Batumi','სოფიის საწყობი · ვარნა / ბურგასი · ბათუმი']},
    {...O('bulgaria-road','Via Bulgaria + Turkey','ბულგარეთი + თურქეთი'),description:['Sofia warehouse · Kapıkule · Tbilisi','სოფიის საწყობი · ქაფიქულე · თბილისი']},
    {...O('italy-ferry','Via Italy + Turkey ferry','იტალია + თურქეთის ბორანი'),description:['Treviso warehouse · Trieste · Tekirdağ','ტრევიზოს საწყობი · ტრიესტე · ტეკირდაგი']}
   ]:[
    {...O('france-ferry','France + Turkey ferry','საფრანგეთი + თურქეთის ბორანი'),description:['Sète · Yalova · Tbilisi','სეტი · იალოვა · თბილისი']},
    {...O('italy-ferry','Italy + Turkey ferry','იტალია + თურქეთის ბორანი'),description:['Trieste · Tekirdağ · Tbilisi','ტრიესტე · ტეკირდაგი · თბილისი']},
    {...O('bulgaria-road','Via Bulgaria + Turkey','ბულგარეთი + თურქეთი'),description:['Bulgaria · Kapıkule · Tbilisi','ბულგარეთი · ქაფიქულე · თბილისი']},
    {...O('bulgaria-ferry','Bulgaria + Black Sea ferry','ბულგარეთი + შავი ზღვის ბორანი'),description:['Varna / Burgas · Batumi · Tbilisi','ვარნა / ბურგასი · ბათუმი · თბილისი']}
   ],{cards:true}),...((values.corridor||(ltl?'bulgaria-ferry':'france-ferry'))==='bulgaria-ferry'?[portField([O('varna','Varna · Ferry','ვარნა · ბორანი'),O('burgas','Burgas · Drujba','ბურგასი · Drujba')],['Bulgaria ferry port','ბულგარეთის საბორნე პორტი'])]:[])];
  }
  if(id==='china-road')return [roadLoad,...(values.load!=='FTL'?[field('warehouse','Consolidation warehouse','საკონსოლიდაციო საწყობი',['yiwu','khorgos','dongguan'].map(k=>O(k,p[k].name[0].split(' · ')[0],p[k].name[1].split(' · ')[0])),{select:true})]:[]),crossing];
  if(id==='turkey-road')return [roadLoad,...(values.load!=='FTL'?[field('warehouse','Consolidation warehouse','საკონსოლიდაციო საწყობი',[O('istanbul','Istanbul','სტამბული'),O('ankara','Ankara','ანკარა')])]:[])];
  if(id==='china-rail')return [seaLoad,...(values.load==='LCL'?[field('warehouse','LCL receiving warehouse','LCL ტვირთის მიმღები საწყობი',['shanghai','qingdao','guangzhou'].map(k=>O(k,p[k+'WH'].name[0].split(' · ')[0],p[k+'WH'].name[1].split(' · ')[0])),{select:true})]:[]),field('station','Departure rail terminal','გამგზავრების სადგური',['xian','chongqing','hefei'].map(k=>O(k,p[k].name[0].split(' · ')[0],p[k].name[1].split(' · ')[0])),{select:true})];
  if(id==='china-sea')return [seaLoad,portField(chinaPorts),via];
  if(id==='europe-sea')return [portField(['europe','antwerp','hamburg','lehavre'].map(k=>O(k,k==='europe'?'Rotterdam':p[k].name[0],k==='europe'?'როტერდამი':p[k].name[1]))),via];
  if(['usa-sea','canada-sea','south-america-sea'].includes(id))return [portField(({ 'usa-sea':['newyork','losangeles'],'canada-sea':['halifax','vancouver'],'south-america-sea':['santos','callao']})[id].map(k=>O(k,p[k].name[0],p[k].name[1]))),via];
  if(['jebel-sea','saudi-sea','dubai-jeddah'].includes(id))return [passage,via];
  if(['oman-sea','dubai-oman'].includes(id))return [portField([O('salalah','Salalah','სალალა'),O('sohar','Sohar','სოჰარი')]),passage,via];
  if(id==='air')return [field('direction','Direction','მიმართულება',[O('import','To Georgia','საქართველოში'),O('export','From Georgia','საქართველოდან')]),field('origin','Worldwide gateways','მსოფლიო მიმართულებები',regions.map(r=>O(r.air,...r.label)),{select:true})];
  return [];
 }
 function normalize(id,values){let o={};for(let pass=0;pass<3;pass++){const fields=fieldsFor(id,{...values,...o}),next={};fields.forEach(f=>next[f.key]=f.options.some(x=>x.id===(o[f.key]??values[f.key]))?(o[f.key]??values[f.key]):f.options[0].id);o=next;}return o;}
 const tbilisiRoad=from=>leg('road',from,p.georgia,[[42.03,42.15],[42.7,42.2],[43.6,42.05],[44.12,41.98]]);
 const blackFerry=from=>leg('ferry',from,p.batumi,[[29.1,42.5],[32,42.3],[36,42.1],[39.8,41.9]]);
 const italyFerry=()=>leg('ferry',p.trieste,p.tekirdag,[[13.4,45.25],[13.4,44],[16.8,41.5],[18.6,40.0],[19.5,37.9],[21.2,36.1],[23.1,36.05],[24,36.9],...aegean.slice(3)]);
 const franceFerry=()=>leg('ferry',p.sete,p.yalova,[[4,42],[6,40],[8,38.7],[9,37.7],[11.3,37.2],[14,36.6],[18,36.2],[21.5,36.1],[23,36.2],[24,36.9],...aegean.slice(3),[28,40.65],[28.7,40.7]]);
 const turkeyToGeorgia=from=>[leg('road',from,p.sarp,from===p.ankaraWH?[[35.8,40.8],[39.7,41],[41.2,41.4]]:from===p.turkeyPickup?[[37,39.75],[41.27,39.9],[41.5,40.8]]:from===p.yalova?[[29.52,40.75],[29.7,40.8],...turkeyRoad]:[[28.98,41.05],[29.03,41.05],[29.3,41.05],[29.7,40.8],...turkeyRoad]),tbilisiRoad(p.sarp)];
 const caspian=()=>leg('ferry',p.aktau,p.alat,[[51,42.4],[51,40.8],[50.8,40.1],[50.1,39.6],[49.6,39.8]]);
 const chinaToKhorgos=from=>leg('road',from,p.khorgos,from===p.yiwu?[[116.4,32.2],[108.94,34.34],[103.8,36.1],[93.5,42.8],[87.6,43.8]]:from===p.dongguan?[[112.98,28.2],[108.94,34.34],[103.8,36.1],[93.5,42.8],[87.6,43.8]]:landChina.slice(0,-1));
 const chinaAfterBorder=(mode,corridor)=>corridor==='russia'?[leg(mode,p.khorgos,p.kazakhstan),leg(mode,p.kazakhstan,p.russia,[[69.59,42.32],[65.5,44.85],[61.67,46.8],[55.2,47.2],[51.92,47.1],[49.5,46.7]]),leg(mode,p.russia,p.baku,[[47.1,45.1],[47.5,42.98],[48.5,41.85]]),leg(mode,p.baku,p.georgia,azRoad)]:[leg(mode,p.khorgos,p.kazakhstan),leg(mode,p.kazakhstan,p.aktau,kazakhWest),caspian(),leg(mode,p.alat,p.georgia,mode==='rail'?[[48.6,40.3],[46.36,40.68],[45.18,41.33],p.gardabani.point]:azRoad)];
 const finishSea=(from,hub,approach=[])=>[...legacySeaFinish(from,hub,'sea',approach),tbilisiRoad(p.poti)];
 const capeToGibraltar=[[15,-36.5],[7,-30],[-2,-15],[-12,0],[-20,18],[-15,35]];
 const fromCape=hub=>[leg('sea',p.cape,p.gibraltar,capeToGibraltar),...finishSea(p.gibraltar,hub,westMed)];
 const jeddahSouth=[[38.6,21.8],[38.5,20],[40.5,17.5],[42.6,14.5],[43.35,12.5],[46,12],[51,13],[57,10],[60,0],[57,-23],[27,-36.5],[23,-37]];
 const gulfSea=(port,opts)=>opts.passage==='cape'?[leg('sea',p[port],p.cape,port==='jeddah'?jeddahSouth:capeFrom(port)),...fromCape(opts.via)]:[leg('sea',p[port],p.suez,port==='jeddah'?[[38.6,21.8],...northRedSea]:suezFrom(port)),...finishSea(p.suez,opts.via,suezMed)];
 const chinaOcean={
  qingdao:[[121,35.5],[123.5,33.5],[123,29],[121,26],[119.5,24],[119,21]],shanghai:[[123,30.3],[123,29],[121,26],[119.5,24],[119,21]],ningbo:[[122.7,29.4],[123,28.5],[121,26],[119.5,24],[119,21]],
  guangzhou:[[113.9,22.2],[114.1,21.5],[115,20]],xiamen:[[118.3,24.2],[118.9,23.4],[118.5,21]],hongkong:[[114.3,22.1],[115,20]]
 };
 const singaporeMalacca=[[114,13],[109,6],[105,2],[104.45,1.22],[103.7,1.12],[102.8,1.5],[101.8,2.5],[100.5,3.5],[99,4.8],[97.5,6.4],[95,6.7],[88,3],[78,-2],[63,-13],[57,-23],[27,-36.5],[23,-37]];
 const europeanOcean={europe:northEuropeSea.slice(0,-1),antwerp:[[3.8,51.45],[3.3,51.5],[2.7,51.6],[1.6,50.95],[-5.5,49.8],[-10,43],[-10,38]],hamburg:[[9,53.9],[8.4,54.05],[6.8,54],[4.5,53.3],[2.8,51.7],[1.6,50.95],[-5.5,49.8],[-10,43],[-10,38]],lehavre:[[-1,49.7],[-5.5,49.8],[-10,43],[-10,38]]};
 const panamaFrom={losangeles:[[-118.4,33.3],[-118,29],[-112,22],[-106,16],[-96,12],[-88,9],[-83,7],[-80,7],[-79.5,8.5],[-79.53,8.9],[-79.65,9.05],[-79.8,9.15]],vancouver:[[-123.3,49.25],[-123.3,48.9],[-123.1,48.4],[-124.8,48.2],[-126,46],[-127,39],[-122,31],[-118,26],[-112,20],[-106,16],[-96,12],[-88,9],[-83,7],[-80,7],[-79.5,8.5],[-79.53,8.9],[-79.65,9.05],[-79.8,9.15]],callao:[[-78,-12],[-82,-6],[-83,0],[-82,5],[-80,7],[-79.5,8.5],[-79.53,8.9],[-79.65,9.05],[-79.8,9.15]]};
 const atlanticFrom={newyork:[[-74.05,40.5],[-73.8,40.3],[-71,39],[-53,38],[-30,37],[-15,36]],halifax:[[-63.4,44.3],[-59,42],[-45,40],[-30,38],[-15,36]],santos:[[-46.2,-24.2],[-43,-25],[-32,-14],[-26,2],[-20,23],[-15,35]]};
 function build(id,values={}){
  const family=families.find(f=>f.id===id)||families[0],o=normalize(family.id,values);let legs=[],details=['',''],region=family.region;
  switch(family.id){
   case'europe-road':{
    const ltl=o.load==='LTL',c=o.corridor;
    if(c==='bulgaria-ferry'){const port=p[o.port];legs=ltl?[leg('road',p.europe,p.bulgariaWH,europeRoad),leg('road',p.bulgariaWH,port,[[26.5,43]])]:[leg('road',p.europe,port,[...europeRoad,[25,43],[26.5,43]])];legs.push(blackFerry(port),tbilisiRoad(p.batumi));}
    if(c==='bulgaria-road'){const stop=ltl?p.bulgariaWH:p.bulgaria;legs=[leg('road',p.europe,stop,europeRoad),leg('road',stop,p.kapikule,[[25.9,42.1]]),leg('road',p.kapikule,p.istanbul,[[27.2,41.4]]),...turkeyToGeorgia(p.istanbul)];}
    if(c==='italy-ferry'){legs=ltl?[leg('road',p.europe,p.italyWH,[[8.5,49],[10.5,47],[11.3,46.5]]),leg('road',p.italyWH,p.trieste,[[12.3,45.5]])]:[leg('road',p.europe,p.trieste,[[8.5,49],[12,48],[13.5,46.5]])];legs.push(italyFerry(),...turkeyToGeorgia(p.tekirdag));}
    if(c==='france-ferry')legs=[leg('road',p.europe,p.sete,[[4.8,48],[4.8,45.8],[4.4,43.9]]),franceFerry(),...turkeyToGeorgia(p.yalova)];
    details=ltl?['Consolidation at the selected warehouse, then onward by trailer. Ferry options carry the loaded truck or trailer.','კონსოლიდაცია არჩეულ საწყობში და შემდგომი გადაზიდვა ტრაილერით. საბორნე მონაკვეთზე იტვირთება მანქანა ან ტრაილერი.']:['Full-trailer collection in Europe. Choose an overland or truck-ferry corridor to Tbilisi.','სრული ტრაილერის აღება ევროპაში. აირჩიე სახმელეთო ან საბორნე მარშრუტი თბილისამდე.'];break;
   }
   case'china-road':{const start=o.load==='LTL'?p[o.warehouse]:p.china;legs=[...(start===p.khorgos?[]:[chinaToKhorgos(start)]),...chinaAfterBorder('road',o.crossing)];details=['Yiwu, Dongguan or Khorgos consolidation for LTL. All trailers cross from China into Kazakhstan at Khorgos.','LTL კონსოლიდაცია ივუში, დუნგუანში ან ხორგოსში. ყველა ტრაილერი ყაზახეთში ხორგოსიდან გადადის.'];break;}
   case'turkey-road':{const start=o.load==='LTL'?(o.warehouse==='ankara'?p.ankaraWH:p.istanbulWH):p.turkeyPickup;legs=turkeyToGeorgia(start);details=o.load==='LTL'?['Collection into our Istanbul or Ankara warehouse, then direct road transport to Georgia.','ტვირთი გროვდება სტამბულის ან ანკარის საწყობში და იგზავნება პირდაპირ საქართველოში.']:['Full-trailer pickup from any city in Turkey. Add the exact collection address to your shipment brief.','სრული ტრაილერის აღება თურქეთის ნებისმიერი ქალაქიდან. ზუსტი მისამართი მიუთითე შეკვეთის ფორმაში.'];break;}
   case'dubai-road':legs=gulfRoad('dubai');break;
   case'saudi-road':legs=gulfRoad('saudi');break;
   case'china-sea':legs=[leg('sea',p[o.port],p.cape,[...chinaOcean[o.port],...singaporeMalacca]),...fromCape(o.via)];details=['Around Africa, through Gibraltar, via the selected Mediterranean hub to Poti. Final delivery continues by road to Tbilisi.','აფრიკის შემოვლით, გიბრალტარის სრუტით და არჩეული პორტის გავლით ფოთამდე. შემდეგ — ხმელეთით თბილისამდე.'];break;
   case'europe-sea':legs=[leg('sea',p[o.port],p.gibraltar,europeanOcean[o.port]),...finishSea(p.gibraltar,o.via,westMed)];details=['Representative Northern European ports. The selected shipping line determines the Mediterranean connection.','ჩრდილოეთ ევროპის პორტების მაგალითები. ხმელთაშუა ზღვის კავშირი დამოკიდებულია არჩეულ საზღვაო ხაზზე.'];break;
   case'usa-sea':case'canada-sea':case'south-america-sea':legs=panamaFrom[o.port]?[leg('sea',p[o.port],p.panama,panamaFrom[o.port]),leg('sea',p.panama,p.gibraltar,[[-79.6,10],[-77,15],[-74,19.9],[-72,22],[-60,28],[-40,34],[-15,36]])]:[leg('sea',p[o.port],p.gibraltar,atlanticFrom[o.port])];legs.push(...finishSea(p.gibraltar,o.via,westMed));details=['Atlantic gateways connect via Gibraltar; Pacific gateways use the Panama Canal. Illustrative connections to Poti, then road to Tbilisi.','ატლანტიკის პორტები უკავშირდება გიბრალტარს; წყნარი ოკეანის პორტები — პანამის არხით. ფოთიდან გაგრძელება ხმელეთით თბილისამდე.'];break;
   case'jebel-sea':legs=gulfSea('jebel',o);break;
   case'saudi-sea':legs=gulfSea('jeddah',o);break;
   case'oman-sea':legs=gulfSea(o.port,o);break;
   case'dubai-jeddah':legs=[leg('road',p.dubai,p.saudi,dubaiSaudi),leg('road',p.saudi,p.jeddah,[[43.1,22.6],[40.42,21.27]]),...gulfSea('jeddah',o)];break;
   case'dubai-oman':legs=[leg('road',p.dubai,p[o.port],o.port==='salalah'?[[55.76,24.2],[56.51,23.23],[57.53,22.93],[56.28,19.96],[54.03,17.67]]:[[56.13,24.79]]),...gulfSea(o.port,o)];break;
   case'china-rail':{const station=p[o.station],feed=station===p.xian?[]:station===p.chongqing?[[104.1,30.7],[104.8,33.4]]:[[113.6,34.7],[108.94,34.34]];legs=[...(o.load==='LCL'?[leg('road',p[o.warehouse+'WH'],station,[])]:[]),leg('rail',station,p.khorgos,[...feed,[103.8,36.1],[93.5,42.8],[87.6,43.8]]),...chinaAfterBorder('rail','caspian')];details=['Departures from Xi’an, Chongqing or Hefei. LCL cargo can first be received at Shanghai, Qingdao or Guangzhou consolidation warehouses.','გამგზავრება სიანიდან, ჩუნცინიდან ან ჰეფეიდან. LCL ტვირთი მიიღება შანხაის, ცინდაოს ან გუანჯოუს საკონსოლიდაციო საწყობებში.'];break;}
   case'air':{const other=p['air'+o.origin],arc=Math.min(90,Math.max(22,Math.abs(other.point[0]-p.tbs.point[0])*.45));legs=[o.direction==='export'?leg('air',p.tbs,other,[],{arc}):leg('air',other,p.tbs,[],{arc})];region=regions.find(r=>r.air===o.origin)?.id||'world';details=['Worldwide coverage. To and from Georgia. The map shows representative gateways; actual airport connections are arranged for your cargo.','მსოფლიო დაფარვა — საქართველოში და საქართველოდან. რუკაზე ნაჩვენებია საორიენტაციო აეროპორტები; კავშირები იგეგმება შენი ტვირთისთვის.'];break;}
  }
  const load=o.load||(family.mode==='sea'?'FCL':family.mode==='road'?'FTL':null);
  return {id:family.id,mode:family.mode,region,title:family.title,load,options:o,family,fields:fieldsFor(family.id,o),details,legs,stops:[legs[0].from,...legs.map(l=>l.to)]};
 }
 function forRegion(region,mode){if(mode==='air'){const r=regions.find(r=>r.id===region);return {id:'air',values:{origin:r?.air||'Europe'}};}if(region==='kazakhstan')return {id:mode==='rail'?'china-rail':'china-road',values:{}};const f=families.find(f=>f.region===region&&f.mode===mode)||families.find(f=>f.region===region);return f?{id:f.id,values:{}}:{id:'air',values:{origin:regions.find(r=>r.id===region)?.air||'Europe'}};}
 window.WF_ROUTES={families,regions,build,fieldsFor,forRegion,airCoverage:regions.map(r=>({region:r.id,...leg('air',p['air'+r.air],p.tbs,[],{arc:Math.min(90,Math.max(22,Math.abs(p['air'+r.air].point[0]-p.tbs.point[0])*.45))})})),optionKeys:['load','corridor','warehouse','station','crossing','passage','via','port','direction','origin']};
})();
