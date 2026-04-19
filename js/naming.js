// ============================================
//  APHELION — Naming System
//  naming.js
//
//  Generates all names in the galaxy.
//  Every name is deterministic — same seed,
//  same name, every time.
//
//  Depends on: rng.js
// ============================================

const NAMES = {

  // ── Personal names ───────────────────────
  first_masculine: [
    'Adric','Alaric','Albin','Alton','Ansel','Arvid','Asher','Astor','Baird','Barin','Bastian','Beric','Blaine','Brann','Brice','Calder','Carden','Cassian','Cedric','Corin',
    'Dain','Darian','Darrow','Dax','Declan','Derin','Dorian','Eamon','Edric','Elric','Emeric','Enric','Eogan','Erland','Evren','Faron','Fenric','Ferris','Finnian','Galen',
    'Garrick','Garen','Garth','Gavric','Hadrian','Halric','Harlan','Henrik','Heron','Iagan','Ilias','Isen','Jarek','Jerrik','Kaelen','Kaine','Kellan','Kieran','Korin','Larkin',
    'Leoric','Lucan','Merek','Marius','Narek','Niall','Oren','Orlan','Orson','Osric','Perrin','Quinlan','Roderic','Ronan','Soren','Stellan','Theron','Torin','Ulric','Varen',
    'Varric','Wulfric','Yarik','Zorin','Alden','Alric','Amric','Andor','Arlen','Armon','Arthus','Aster','Axton','Balen','Bardon','Baros','Belric','Berrin','Bors','Branik',
    'Brevin','Caelen','Caiden','Caric','Carver','Cavan','Ciro','Corvin','Cyran','Dalen','Damar','Darien','Daven','Delric','Denor','Draven','Edrin','Eland','Elion','Elmar',
    'Enar','Erion','Eryx','Fendrel','Fintan','Gethin','Gilden','Gorin','Hadric','Heston','Icar','Igan','Ivoren','Jalen','Jareth','Jorik','Kaelor','Kaeson','Kalen','Kelric',
    'Kerin','Korrin','Lethan','Loran','Lothar','Lucien','Malric','Marden','Merin','Miro','Naren','Nestor','Noric','Oric','Orien','Orik','Parnell','Perric','Quorin','Raelin',
    'Ranik','Renric','Rethan','Roric','Saren','Selric','Senan','Talen','Tarian','Tavor','Theric','Toren','Traven','Ulan','Ulren','Valen','Varin','Velric','Verin','Warrin',
    'Wystan','Xavian','Yorin','Zarek','Aeris','Alven','Aris','Arvon','Baelin','Baern','Baric','Belan','Beron','Borin','Brenic','Caelis','Calen','Carin','Cethan','Coren',
    'Daric','Delan','Deron','Dorin','Eiran','Elan','Eran','Faren','Feron','Galric','Garen','Gethan','Goric','Halen','Haren','Heric','Iren','Ivar','Jaren','Joric','Karel',
    'Keron','Kiran','Laren','Leron','Lorin','Meren','Meron','Nalen','Neron','Norin','Perin','Qaren','Ralen','Reron','Rorin','Seron','Sorin','Teron','Uren','Veron','Vorin',
    'Weren','Xaren','Yaren','Zaren','Adan','Aleron','Amren','Anric','Ardan','Aric','Arven','Asric','Baren','Barren','Benric','Berran','Berric','Brenan','Caeric','Carren',
    'Coran','Cyran','Darric','Denric','Dorrin','Dranic','Edan','Eric','Fenric','Feric','Garic','Gerren','Haric','Iric','Jaric','Karic','Keric','Loric','Maric','Meric',
    'Naric','Peric','Qoric','Raric','Saric','Soric','Taric','Toric','Uric','Varic','Waric','Xaric','Yaric','Zaric',    
    'Kael','Vael','Rael','Sael','Dael','Mael','Nael','Tael','Fael','Gael','Hael','Jael','Lael','Pael','Zael','Aethan','Baeth','Caeth','Daeth','Faeth','Gaeth','Haeth','Jaeth','Kaeth','Laeth',
    'Morven','Torven','Korven','Vorven','Dorven','Norven','Sorven','Arven','Erven','Irven','Orven','Urven','Valenor','Kalenor','Talenor','Ralenor','Salenor','Dalenor','Malenor','Nalenor',
    'Drake','Draven','Draeven','Draek','Draegor','Draevenor','Vraen','Vraelor','Kraen','Kraelor','Graen','Graelor','Thane','Thalen','Tharen','Thoric','Thorin','Thrain','Tharek','Tharic',
    'Malek','Marek','Morak','Marok','Merok','Mirak','Murak','Vorak','Varok','Velok','Valok','Zorak','Zarek','Zorik','Zarik','Zoren','Zorren','Zorvan','Zorric','Zorlen',
    'Grim','Grimm','Grimar','Grimor','Grimaric','Grimvald','Grimnar','Grimric','Grimlor','Grimven','Grimdor','Grimsen','Grimvar','Grimthal','Grimvek','Grimorik','Grimdan','Grimrek',
    'Voss','Varr','Varn','Varek','Varlen','Varro','Varic','Varric','Varnen','Varion','Varlek','Varthen','Vargrim','Varok','Varzen','Variel','Varion','Varrek','Varos','Varenik',
    'Riven','Rivor','Rivak','Rivlen','Rivorik','Rivnar','Rivric','Riveth','Rivdan','Rivok','Rivorim','Rivethan','Rivkar','Rivorn','Rivvar','Rivzen','Rivdor','Rivmor',
    'Kaedor','Kaedric','Kaedran','Kaedros','Kaedvar','Kaedmon','Kaedrik','Kaedorn','Kaedricus','Kaedval','Kaedren','Kaedrican','Kaedthor','Kaedvorn','Kaedrosen','Kaedricor',
    'Drevan','Drevic','Drevon','Drevak','Drevnar','Drevor','Drevric','Drevlen','Drevorn','Drevos','Dreveth','Drevdan','Drevkar','Drevmon','Drevsen','Drevrican','Drevthor',
    'Tarn','Tarnik','Tarnor','Tarnic','Tarnen','Tarnak','Tarnorik','Tarneth','Tarndor','Tarnval','Tarnric','Tarnok','Tarnmon','Tarnsen','Tarnvek','Tarnorim',
    'Brek','Brekan','Brekor','Brekic','Brekar','Breken','Brekvar','Brekorim','Brekdan','Brekmon','Breksan','Breklen','Brekthor','Brekos','Brekric',
    'Aldric','Aldren','Aldor','Aldrican','Aldros','Aldven','Aldvar','Aldricor','Aldmon','Aldricus','Aldrenor','Aldricen','Aldorn','Aldrican','Aldrosen','Aldvek','Aldmor',
    'Emric','Emran','Emros','Emrik','Emron','Emvar','Emrican','Emthor','Emvek','Emdan','Emricor','Emmon','Emricus','Emrenor','Emrosen',
    'Callan','Callor','Callen','Callric','Callorim','Callvar','Callthor','Callmon','Callvek','Calldor','Callrican','Callros','Callren','Callorik',
    'Idris','Idran','Idros','Idrik','Idron','Idvar','Idrican','Idthor','Idvek','Iddan','Idmon','Idrosen','Idricus','Orren','Orric','Orron','Orrik','Orran','Orrvar','Orrthor','Orrmon','Orrvek','Orrdan','Orrros','Orrlen',    
    'Sven','Svenor','Svenric','Svenar','Svenik','Svenvar','Sventhor','Svenmon','Svenvek','Svendan','Svenros','Xander','Xandor','Xandric','Xandran','Xandros','Xandvar','Xandthor','Xandmon','Xandvek','Xandorim','Xandricus',    
    'Yoren','Yorik','Yoran','Yorric','Yorvar','Yorthor','Yormon','Yorvek','Yordan','Yorros','Brennan','Brenor','Brenric','Brenar','Brenik','Brenvar','Brenthor','Brenmon','Brenvek','Brendan','Brenros'
  ],

  first_feminine: [
    'Adra','Aela','Aeris','Aila','Alena','Alira','Alma','Alva','Amara','Anara','Anya','Arden','Aria','Arla','Arva','Asra','Astra','Avela','Avera','Avra',
    'Baela','Bara','Brena','Bria','Brina','Brya','Caela','Calia','Caren','Cassa','Celia','Cira','Clara','Cyra','Dara','Daria','Dela','Delia','Drena','Drua',
    'Eira','Elara','Elia','Elira','Elva','Emra','Ena','Enya','Era','Eria','Esra','Evara','Fara','Felia','Fira','Gaela','Gara','Grena','Grya','Haela',
    'Hara','Hela','Hira','Iara','Idra','Ilia','Ira','Iria','Isla','Ivara','Jara','Jela','Jora','Kaela','Kara','Karia','Kela','Kira','Kyra','Laela',
    'Lara','Laria','Lena','Lira','Lysa','Maela','Mara','Maren','Maria','Mira','Myra','Naela','Nara','Nela','Neria','Neva','Nira','Nyra','Ola','Orla',
    'Oria','Osra','Paela','Pella','Pera','Petra','Pyra','Qira','Quen','Quera','Raela','Rana','Rella','Rena','Ria','Rivena','Rora','Ryra','Saela','Sana',
    'Saria','Sela','Senna','Serra','Sira','Syra','Taela','Tara','Tavia','Tera','Tira','Tyra','Ula','Ura','Uria','Ursa','Vaela','Vala','Valda','Vara',
    'Vela','Vera','Vira','Vyra','Wrenna','Wyra','Xara','Xena','Xira','Yara','Yela','Yera','Yira','Yva','Zara','Zela','Zera','Zira','Zyra',
    'Aelra','Aelina','Aelira','Aelora','Aelara','Aelena','Aelirae','Aelvara','Aelwyn','Aelith','Aelorae','Aeliraen','Aelmar','Aelvra','Aelwen',
    'Baelra','Baelina','Baelira','Baelora','Baelara','Baelwyn','Baelith','Baelorae','Baeliraen','Baelvra',
    'Caelra','Caelina','Caelira','Caelora','Caelara','Caelwyn','Caelith','Caelorae','Caeliraen','Caelvra',
    'Daelra','Daelina','Daelira','Daelora','Daelara','Daelwyn','Daelith','Daelorae','Daeliraen','Daelvra',
    'Morra','Morena','Morira','Morwen','Morva','Morraen','Morvra','Morwyn','Morlen','Moriel','Morika','Morraeth','Morwynna','Morikae','Morveth',
    'Torra','Torena','Torira','Torwen','Torva','Torraen','Torvra','Torwyn','Torlen','Toriel','Torika','Torraeth',
    'Vorra','Vorena','Vorira','Vorwen','Vorva','Vorraen','Vorvra','Vorwyn','Vorlen','Voriel','Vorika',
    'Dreva','Drevara','Drevina','Drevira','Drevora','Dreveth','Drevaraen','Drevika','Drevorae','Drevwyn','Drevlen',
    'Riven','Rivena','Rivara','Rivina','Rivira','Rivora','Riveth','Rivaraen','Rivika','Rivorae','Rivwyn',
    'Vara','Varena','Varina','Varira','Varora','Vareth','Varika','Varwyn','Varlen','Varorae',
    'Grimra','Grimena','Grimira','Grimora','Grimeth','Grimara','Grimika','Grimwyn','Grimvra','Grimorae','Grimraen',
    'Brenna','Brenara','Brenina','Brenira','Brenora','Breneth','Brenika','Brenwyn','Brenvra',
    'Kaela','Kaelra','Kaelina','Kaelira','Kaelora','Kaelara','Kaelwyn','Kaelith','Kaelorae','Kaeliraen',
    'Maela','Maelra','Maelina','Maelira','Maelora','Maelara','Maelwyn','Maelith',
    'Naela','Naelra','Naelina','Naelira','Naelora','Naelara','Naelwyn','Naelith',
    'Zara','Zarana','Zarina','Zarira','Zarora','Zareth','Zarika','Zarwyn','Zarvra','Zarorae','Zarra',
    'Xara','Xarana','Xarina','Xarira','Xarora','Xareth','Xarika','Xarwyn',
    'Valda','Valara','Valina','Valira','Valora','Valeth','Valika','Valwyn','Valvra','Valorae',
    'Tavia','Tavara','Tavina','Tavira','Tavora','Taveth','Tavika','Tavwyn',
    'Senna','Senara','Senina','Senira','Senora','Seneth','Senika','Senwyn',
    'Brynn','Bryna','Brynna','Brynera','Brynika','Brynvra',
    'Orla','Orlana','Orlina','Orlira','Orlora','Orleth','Orlika','Orlwyn',
    'Petra','Petrana','Petrina','Petrira','Petrora','Petreth','Petrika',
    'Nadia','Nadira','Nadirae','Nadrena','Nadwyn','Nadeth',
    'Vera','Verana','Verina','Verira','Verora','Vereth','Verika','Verwyn',
    'Asha','Ashara','Ashina','Ashira','Ashora','Asheth','Ashika','Ashwyn',
    'Cassia','Cassara','Cassina','Cassira','Cassora','Casset','Cassika','Casswyn',
    'Finala','Serika','Talira','Velina','Corra','Elyra','Myrena','Nysera','Olyra','Pryra',
    'Qyra','Rysera','Sylera','Tyrena','Ulyra','Vysera','Wylera','Xyrena','Ylyra','Zysera'
  ],

  surname_compound: [
    'Calder','Voss','Korr','Hale','Marek','Draven','Solus','Vey','Tye','Rennick','Thorne','Garrick','Aldric','Solen','Varke','Hessen','Drade','Korvak','Maren','Pelk',
    'Alcott','Brennan','Contis','Drest','Erkan','Farren','Graith','Hovan','Innes','Jarvik','Kessler','Lorcan','Mortis','Navan','Odren','Praith','Quellan','Ravek','Sorren','Tarvan',
    'Ulric','Vandris','Weston','Xaren','Yevak','Zoran','Ashford','Blackwood','Crane','Duskmore',
    'Ironvale','Darkmoor','Grimward','Stonefall','Ravencrest','Dreadmere','Frostvale','Stormholt','Blackthorn','Emberfall','Ashenford','Graveholt','Nightmere','Steelhaven','Shadowfen',
    'Bloodmere','Ironcrest','Stormvale','Grimholt','Duskfall','Frostmere','Ravenholt','Stonecrest','Darkvale','Embermoor','Ashenvale','Gravecrest','Nightfall','Steelmoor','Shadowvale',
    'Varkell','Korven','Dravik','Malrec','Sorvak','Tharven','Gorvath','Velkor','Zerrek','Morvane','Kelvorn','Draeth','Vorren','Karveth','Tarnok','Brelvak','Orvane','Nereth','Zorvane','Kelrik',
    'Blackmere','Darkcrest','Grimvale','Stoneward','Ravenmoor','Dreadvale','Frostholt','Stormmere','Blackvale','Embercrest','Ashenmoor','Gravevale','Nightcrest','Steelvale','Shadowmoor',
    'Highcrest','Lowvale','Westfall','Eastmere','Northcrest','Southvale','Redmoor','Whitevale','Greycrest','Goldmere','Silvervale','Bronzefall','Ironmoor','Oakvale','Pinecrest',
    'Korrick','Vossen','Halen','Marell','Dravon','Solvik','Veylan','Tyren','Rennor','Tharn','Garron','Aldren','Solnar','Varkon','Hessik','Dranor','Korveth','Marrek','Pelkor','Alcor',
    'Brennock','Contar','Dresk','Ervane','Farrek','Graeven','Hovar','Innok','Jarrek','Kessel','Lorvik','Mortek','Navrek','Odvik','Praven','Quorik','Raveth','Sorrik','Tarvek','Ulvik',
    'Vandor','Westar','Xarvik','Yevran','Zorvik','Ashenfall','Blackfall','Craneholt','Duskvale','Nightford','Grimford','Stoneford','Ravenford','Darkford','Emberford','Ashforde','Graveford','Steelford','Shadowford',
    'Frostford','Stormford','Ironford','Oakford','Pineford','Redford','Whiteford','Greyford','Goldford','Silverford','Bronzeford',
    'Dreadcrest','Grimcrest','Stonecrest','Ravencrest','Darkcrest','Embercrest','Ashencrest','Gravecrest','Nightcrest','Steelcrest','Shadowcrest','Frostcrest','Stormcrest','Ironcrest',
    'Valecrest','Moorcrest','Fallcrest','Fordcrest','Hillcrest','Woodcrest','Brookcrest','Fieldcrest','Marshcrest','Dalecrest',
    'Nightbane','Grimbane','Stonebane','Ravenbane','Dreadbane','Frostbane','Stormbane','Ironbane','Ashbane','Shadowbane','Bloodbane','Steelbane',
    'Grimward','Stoneward','Ravenward','Dreadward','Frostward','Stormward','Ironward','Ashward','Shadowward','Steelward',
    'Blackspire','Darkspire','Grimspire','Stormspire','Frostspire','Ironspire','Ashenspire','Shadowspire','Steelspire',
    'Duskbane','Nightward','Graveward','Emberward','Ashenward','Stormwarde','Frostwarde','Ironwarde','Shadowwarde','Steelwarde',
    'Korstone','Vossvale','Halewood','Marecrest','Dravenmoor','Solusvale','Veycrest','Tyewood','Rennickvale','Thornecrest',
    'Garrickmoor','Aldricvale','Solencrest','Varkewood','Hessenvale','Drademoor','Korvakvale','Marencrest','Pelkwood',
    'Alcottvale','Brennancrest','Contiswood','Drestvale','Erkanmoor','Farrenvale','Graithcrest','Hovanwood','Innesvale','Jarvikmoor',
    'Kesslervale','Lorcancrest','Mortiswood','Navanvale','Odrenmoor','Praithvale','Quellancrest','Ravekwood','Sorrenvale','Tarvanmoor',
    'Ulricvale','Vandriscrest','Westonwood','Xarenvale','Yevakmoor','Zoranvale','Ashfordcrest','Blackwoodvale','Cranewood','Duskmorevale'
  ],

  surname_root: [
    'Voss','Cald','Korr','Hal','Mar','Drav','Sol','Vey','Tye','Renn','Thorn','Garr','Ald','Var','Hess','Alc','Bren','Cont','Dres','Erk',
    'Farr','Gra','Hov','Inn','Jarv','Kess','Lorc','Mort','Nav','Odr',
    'Vossar','Vossen','Vossik','Vossan','Vosser','Vossir','Vossel','Vossor','Vossun','Vossae','Vossin','Vossarim','Vosseth','Vossara','Vossyr',
    'Caldar','Calden','Caldik','Caldan','Calder','Caldir','Caldel','Caldor','Caldun','Caldae','Caldin','Caldarim','Caldeth','Caldara','Caldyr',
    'Korrar','Korren','Korrik','Korran','Korrer','Korrir','Korrel','Korror','Korrun','Korrae','Korrin','Korrarim','Korreth','Korrara','Korryr',
    'Halar','Halen','Halik','Halan','Haler','Halir','Halel','Halor','Halun','Halae','Halin','Halarim','Haleth','Halara','Halyr',
    'Marar','Maren','Marik','Maran','Marer','Marir','Marel','Maror','Marun','Marae','Marin','Mararim','Mareth','Marara','Maryr',
    'Dravar','Draven','Dravik','Dravan','Draver','Dravir','Dravel','Dravor','Dravun','Dravae','Dravin','Dravarim','Draveth','Dravara','Dravyr',
    'Solar','Solen','Solik','Solan','Soler','Solir','Solel','Solor','Solun','Solae','Solin','Solarim','Soleth','Solara','Solyr',
    'Veyar','Veyen','Veyik','Veyan','Veyer','Veyir','Veyel','Veyor','Veyun','Veyae','Veyin','Veyarim','Veyeth','Veyara','Veyyr',
    'Tyear','Tyen','Tyeik','Tyean','Tyeer','Tyeir','Tyeel','Tyeor','Tyeun','Tyeae','Tyein','Tyearim','Tyeeth','Tyeara','Tyeyr',
    'Rennar','Rennen','Rennik','Rennan','Renner','Rennir','Rennel','Rennor','Rennun','Rennae','Rennin','Rennarim','Renneth','Rennara','Rennyr',
    'Thornar','Thornen','Thornik','Thornan','Thorner','Thornir','Thornel','Thornor','Thornun','Thornae','Thornin','Thornarim','Thorneth','Thornara','Thornyr',
    'Garrar','Garren','Garrik','Garran','Garrer','Garrir','Garrel','Garror','Garrun','Garrae','Garrin','Garrarim','Garreth','Garrara','Garryr',
    'Aldar','Alden','Aldik','Aldan','Alder','Aldir','Aldel','Aldor','Aldun','Aldae','Aldin','Aldarim','Aldeth','Aldara','Aldyr',
    'Varar','Varen','Varik','Varan','Varer','Varir','Varel','Varor','Varun','Varae','Varin','Vararim','Vareth','Varara','Varyr',
    'Hessar','Hessen','Hessik','Hessan','Hesser','Hessir','Hessel','Hessor','Hessun','Hessae','Hessin','Hessarim','Hesseth','Hessara','Hessyr',
    'Alcar','Alcen','Alcik','Alcan','Alcer','Alcir','Alcel','Alcor','Alcun','Alcae','Alcin','Alcarim','Alceth','Alcara','Alcyr',
    'Brenar','Brennen','Brenik','Brenan','Brener','Brenir','Brenel','Brenor','Brenun','Brenae','Brenin','Brenarim','Breneth','Brenara','Brenyr',
    'Contar','Conten','Contik','Contan','Conter','Contir','Contel','Contor','Contun','Contae','Contin','Contarim','Conteth','Contara','Contyr',
    'Dresar','Dresen','Dresik','Dresan','Dreser','Dresir','Dresel','Dresor','Dresun','Dresae','Dresin','Dresarim','Dreseth','Dresara','Dresyr',
    'Erkar','Erken','Erkik','Erkan','Erker','Erkir','Erkel','Erkor','Erkun','Erkae','Erkin','Erkarim','Erketh','Erkara','Erkyr',
    'Farrar','Farren','Farrik','Farran','Farrer','Farrir','Farrel','Farror','Farrun','Farrae','Farrin','Farrarim','Farreth','Farrara','Farryr',
    'Graar','Graen','Graik','Graan','Graer','Grair','Grael','Graor','Graun','Graae','Grain','Graarim','Graeth','Graara','Grayr',
    'Hovar','Hoven','Hovik','Hovan','Hover','Hovir','Hovel','Hovor','Hovun','Hovae','Hovin','Hovarim','Hoveth','Hovara','Hovyr',
    'Innar','Innen','Innik','Innan','Inner','Innir','Innel','Innor','Innun','Innae','Innin','Innarim','Inneth','Innara','Innyr',
    'Jarvar','Jarven','Jarvik','Jarvan','Jarver','Jarvir','Jarvel','Jarvor','Jarvun','Jarvae','Jarvin','Jarvarim','Jarveth','Jarvara','Jarvyr',
    'Kessar','Kessen','Kessik','Kessan','Kesser','Kessir','Kessel','Kessor','Kessun','Kessae','Kessin','Kessarim','Kesseth','Kessara','Kessyr',
    'Lorcar','Lorcen','Lorcik','Lorcan','Lorcer','Lorcir','Lorcel','Lorcor','Lorcun','Lor cae','Lorcin','Lorcarim','Lorceth','Lorcara','Lorcyr',
    'Mortar','Morten','Mortik','Mortan','Morter','Mortir','Mortel','Mortor','Mortun','Mortae','Mortin','Mortarim','Morteth','Mortara','Mortyr',
    'Navar','Naven','Navik','Navan','Naver','Navir','Navel','Navor','Navun','Navae','Navin','Navarim','Naveth','Navara','Navyr',
    'Odrar','Odren','Odrik','Odran','Odrer','Odrir','Odrel','Odror','Odrun','Odrae','Odrin','Odrarim','Odreth','Odrara','Odryr',
    'Vosskai','Caldun','Korrash','Halvek','Maruun','Dravash','Solkai','Veyrun','Tyekar','Rennash','Thornkai','Garrun','Aldash','Varuun','Hesskai',
    'Alcresh','Brenkai','Contash','Dreskai','Erkash','Farrkai','Grash','Hovkai','Innkai','Jarvash','Kesskai','Lorcash','Mortkai','Navash','Odrkai'
  ],

  surname_suffix: [
    'ick', 'en', 'us', 'ak', 'ek',
    'an', 'is', 'or', 'ath', 'el',
    'on', 'ard', 'eth', 'ix', 'ov',
    'yan', 'kin', 'wyn', 'ford', 'more'
  ],

  // ── Callsigns ────────────────────────────
  callsigns: [
    'Dutch','Brick','Chief','Wick','Rook','Sparrow','Ghost','Sable','Crow','Flint','Slow','Lucky','Dead','Seven','Patch','Grim','Hollow','Rust','Pale','Null',
    'Cinder','Ash','Bone','Wire','Hex','Drift','Static','Void','Ember','Shade','Thorn','Wraith','Slate','Mote','Haze','Soot','Weld','Keel','Splice','Rivet',
    'Bilge','Torque','Flux','Vent','Lock','Hammer','Nail','Bolt','Screw','Hatch',
    'Iron','Steel','Lead','Stone','Dust','Smoke','Oil','Gear','Chain','Cog','Spark','Furnace','Kiln','Anvil','Forge','Breaker','Drill','Latch','Clamp','Seal',
    'Gauge','Piston','Rotor','Valve','Nozzle','Injector','Manifold','Tread','Track','Axle','Strut','Frame','Brace','Plate','Shard','Splinter','Crack','Fracture','Grind','Scrap',
    'Echo','Signal','Pulse','Wave','Carrier','Relay','Beacon','Ping','Noise','Silence','Whisper','Chatter','Burst','Glitch','Cipher','Code','Key','Kernel','Stack','Thread',
    'Packet','Proxy','Node','Link','Bridge','Tunnel','Gate','Port','Channel','Band','Array','Grid','Vector','Axis','Core','Shell','Frame','Loop','Trace','Mark',
    'Dune','Sand','Spice','Mirage','Nomad','Caravan','Sirocco','Zephyr','Gale','Storm','Tempest','Dustoff','Drifter','Wander','Stray','Outrider','Path','Trail','Trackless','Horizon',
    'Sunfall','Daybreak','Nightfall','Dawnbreak','Highsun','Lowlight','Eclipse','Umbra','Penumbra','Corona','Flare','Burn','Scorch','Char','Blister','Crust','Salt','Brine','Tide','Current',
    'Kepler','Orion','Vega','Altair','Rigel','Deneb','Sirius','Arcturus','Nova','Quasar','Pulsar','Nebula','Comet','Meteor','Astro','Orbit','Apogee','Perigee','Zenith','Nadir',
    'Helix','Spiral','Arc','Chord','Phase','Shift','Driftline','Slip','Vector','Delta','Sigma','Omega','Lambda','Gamma','Beta','Alpha','Prime','Zero','One','Two',
    'Black','White','Grey','Red','Blue','Green','Yellow','Orange','Violet','Indigo','Crimson','Scarlet','Amber','Ivory','Onyx','Obsidian','Jet','Coal','Silver','Gold',
    'Fang','Claw','Talons','Beak','Horn','Tusk','Hide','Pelt','Spine','Skull','Jaw','Rib','Spur','Quill','Scale','Fin','Gill','Wing','Feather','Hidebound',
    'Breaker','Crusher','Shatter','Snap','Crush','Smash','Strike','Hit','Impact','Force','Drive','Push','Pull','Drag','Lift','Drop','Fall','Rise','Climb','Dive',
    'Anchor','Ballast','Hull','Deck','Mast','Sail','Rig','Knot','Line','Hook','Sink','Float','Wake','Foam','Spray','Reef','Shoal','Harbor','Dock','Pier',
    'Spine','Core','Heart','Mind','Nerve','Pulse','Vein','Blood','Breath','Eye','Hand','Grip','Step','Stride','Reach','Hold','Breakline','Hardstop','Softstep','Longwatch',
    'Cold','Hot','Warm','Cool','Dry','Wet','Sharp','Blunt','Clean','Dirty','Fast','Slowburn','Quick','Steady','Sure','Loose','Tight','Open','Closed','Locked',
    'North','South','East','West','Up','Down','Left','Right','Forward','Back','Above','Below','Near','Far','Inside','Outside','Across','Beyond','Between','Within',
    'Razor','Edge','Point','Tip','Blade','Shear','Cut','Slice','Nick','Scar','Mark','Brand','Stamp','Etch','Carve','Score','Trace','Line','Gridline','Baseline',
    'Watcher','Seeker','Finder','Runner','Walker','Driver','Rider','Gunner','Loader','Fixer','Builder','Breaker','Keeper','Warden','Guard','Scout','Snare','Trap','Latchkey','Deadbolt',
    'Ashfall','Dustfall','Nightwind','Stormwake','Ironwake','Steelwind','Ghostline','Voidline','Driftmark','Heatline','Coldline','Hardline','Redline','Blackline','Lifeline','Faultline','Ridgeline','Shoreline','Frontline','Backline',
    'Scrim','Film','Layer','Coat','Shell','Skin','Hide','Veil','Mask','Cowl','Hood','Visor','Lens','Scope','Sight','Aim','Lockon','Trackon','Holdfast','Standby',
    'BreakerOne','BreakerTwo','HammerOne','HammerTwo','AnvilOne','AnvilTwo','ForgeOne','ForgeTwo','KilnOne','KilnTwo','VectorOne','VectorTwo','SignalOne','SignalTwo','RelayOne','RelayTwo','EchoOne','EchoTwo','GhostOne','GhostTwo',
    'Dunehawk','Sandcrow','Dustwolf','Ironcrow','Steelhawk','Voidcrow','Nightwolf','Stormcrow','Ashwolf','Cinderhawk','Grimcrow','Shadehawk','Wraithcrow','Sablehawk','Rookhawk','Flinthawk','Embercrow','Rusthawk','Palehawk','Nullcrow',
    'Hardcase','Softshell','Deadeye','Longshot','Shortstop','Quickfix','Slowhand','Surefoot','Coldhand','Hotwire','Redhand','Blackhand','Greyhand','Ironhand','Steelfist','Stonefist','Dustfist','Nightfist','Voidfist','Ashfist',
    'Gridlock','Deadlock','Airlock','Padlock','Spinlock','Corelock','Hardlock','Softlock','Keylock','Chainlock','Ironlock','Steellock','Voidlock','Ghostlock','Nightlock','Stormlock','Heatlock','Coldlock','Fluxlock','PhaseLock',
    'Slipstream','Downrange','Uplink','Downlink','Crossfeed','Backfeed','Overrun','Underrun','Fallback','Pushforward','Breakcontact','Holdline','Standdown','Stepup','Stepdown','Rollout','Rollin','Cutover','Cutback','Runout'
  ],

  // ── Ancient place name roots ─────────────
  ancient_root: [
    'Veydris','Korrath','Hiigara','Thal','Erebus','Solus','Gyre','Vexis','Aethon','Keth','Narr','Ossian','Vael','Dross','Ithek','Caern','Ulvar','Sheth','Morvak','Pelian',
    'Ardis','Brenn','Calyx','Davan','Elvar','Fhoss','Greth','Havan','Ireth','Jorvak','Kaeln','Lorith','Mavan','Nessik','Orvak','Preth','Queln','Raveth','Sovak','Taliss',
    'Uveth','Vandis','Wethis','Xaeln','Yovak','Zethis','Athek','Belvak','Corith','Delvak','Ethiss','Forvak','Gaveth','Helvak','Irvak','Jethis','Kelvak','Leveth','Melvak','Nethis',
    'Orveth','Pelvak','Queth','Relvak','Selvak','Telvak','Urvak','Vethis','Welvak','Xethis','Yelvak','Zelvak','Akseth','Baleth','Cresith',
    'Vaedris','Vaedron','Vaedrak','Vaedrisen','Vaedrith','Vaedros','Vaedrex','Vaedral','Vaedric','Vaedronis',
    'Korran','Korrik','Korren','Korrus','Korreth','Korrin','Korrathis','Korral','Korrion','Korraneth',
    'Hiigaran','Hiigaris','Hiigaros','Hiigarik','Hiigareth','Hiigarum','Hiigaral','Hiigarion','Hiigarn','Hiigarae',
    'Thalek','Thalen','Thalos','Thalor','Thaleth','Thalix','Thalum','Thalir','Thalorim','Thalethis',
    'Erebos','Erevan','Erevik','Ereth','Erexis','Erelon','Erekar','Erethis','Erevanor','Erexisen',
    'Solan','Solath','Solvik','Solreth','Solvar','Solkar','Solthis','Solveth','Solrik','Solanis',
    'Gyren','Gyreth','Gyros','Gyrik','Gyrath','Gyrel','Gyrenis','Gyroth','Gyron','Gyrex',
    'Vexar','Vexen','Vexor','Vexis','Vexath','Vexon','Vexir','Vexeth','Vexarim','Vexorath',
    'Aethar','Aethen','Aethor','Aethis','Aethreth','Aethvar','Aethonel','Aethir','Aethos','Aethrix',
    'Kethar','Kethen','Kethor','Kethis','Kethreth','Kethvar','Kethon','Kethir','Kethos','Kethrix',
    'Narrik','Narren','Narroth','Narris','Narreth','Narron','Narriketh','Narrum','Narral','Narrion',
    'Ossar','Ossen','Ossor','Ossis','Ossreth','Ossvar','Osson','Ossir','Ossos','Ossrix',
    'Vaelar','Vaelen','Vaelor','Vaelis','Vaelreth','Vaelvar','Vaelon','Vaelir','Vaelos','Vaelrix',
    'Drossen','Drossar','Drossik','Drosseth','Drossor','Drossum','Drossal','Drossion','Drossis','Drosseth',
    'Ithekar','Itheken','Ithekor','Ithekis','Ithekreth','Ithekvar','Ithekon','Ithekir','Ithekos','Ithekrix',
    'Caernar','Caernen','Caernor','Caernis','Caerneth','Caernvar','Caernon','Caernir','Caernos','Caernrix',
    'Ulvaris','Ulvaren','Ulvaron','Ulvarik','Ulvarath','Ulvarum','Ulvaral','Ulvarion','Ulvaris','Ulvaroth',
    'Shethar','Shethen','Shethor','Shethis','Shethreth','Shethvar','Shethon','Shethir','Shethos','Shethrix',
    'Morvakar','Morvaken','Morvakor','Morvakis','Morvakreth','Morvakvar','Morvakon','Morvakir','Morvakos','Morvakrix',
    'Pelianar','Pelianen','Pelianor','Pelianis','Pelianeth','Pelianvar','Pelianon','Pelianir','Pelianos','Pelianrix',
    'Ardisar','Ardisen','Ardisor','Ardisis','Ardiseth','Ardisvar','Ardison','Ardisir','Ardisos','Ardisrix',
    'Brennar','Brennen','Brennor','Brennis','Brenneth','Brennvar','Brennon','Brennir','Brennos','Brennrix',
    'Calyxar','Calyxen','Calyxor','Calyxis','Calyxeth','Calyxvar','Calyxon','Calyxir','Calyxos','Calyxrix',
    'Davannar','Davannen','Davannor','Davannis','Davanneth','Davannvar','Davannon','Davannir','Davannos','Davannrix',
    'Elvaris','Elvaren','Elvaror','Elvaris','Elvareth','Elvarvar','Elvaron','Elvarir','Elvaros','Elvarrix',
    'Fhossar','Fhossen','Fhossor','Fhossis','Fhosseth','Fhossvar','Fhosson','Fhossir','Fhossos','Fhossrix',
    'Grethar','Grethen','Grethor','Grethis','Grethreth','Grethvar','Grethon','Grethir','Grethos','Grethrix',
    'Havanar','Havanen','Havanor','Havanis','Havaneth','Havanvar','Havanon','Havanir','Havanos','Havanrix',
    'Irethar','Irethen','Irethor','Irethis','Irethreth','Irethvar','Irethon','Irethir','Irethos','Irethrix',
    'Jorvakar','Jorvaken','Jorvakor','Jorvakis','Jorvakreth','Jorvakvar','Jorvakon','Jorvakir','Jorvakos','Jorvakrix',
    'Kaelnar','Kaelnen','Kaelnor','Kaelnis','Kaelneth','Kaelnvar','Kaelnon','Kaelnir','Kaelnos','Kaelnrix',
    'Lorithar','Lorithen','Lorithor','Lorithis','Loritheth','Lorithvar','Lorithon','Lorithir','Lorithos','Lorithrix',
    'Mavanar','Mavanen','Mavanor','Mavanis','Mavaneth','Mavanvar','Mavanon','Mavanir','Mavanos','Mavanrix',
    'Nessikar','Nessiken','Nessikor','Nessikis','Nessiketh','Nessikvar','Nessikon','Nessikir','Nessikos','Nessikrix',
    'Orvakar','Orvaken','Orvakor','Orvakis','Orvaketh','Orvakvar','Orvakon','Orvakir','Orvakos','Orvakrix',
    'Prethar','Prethen','Prethor','Prethis','Pretheth','Prethvar','Prethon','Prethir','Prethos','Prethrix',
    'Quelnar','Quelnen','Quelnor','Quelnis','Quelneth','Quelnvar','Quelnon','Quelnir','Quelnos','Quelnrix',
    'Ravethar','Ravethen','Ravethor','Ravethis','Ravetheth','Ravethvar','Ravethon','Ravethir','Ravethos','Ravethrix',
    'Sovakar','Sovaken','Sovakor','Sovakis','Sovaketh','Sovakvar','Sovakon','Sovakir','Sovakos','Sovakrix',
    'Talissar','Talissen','Talissor','Talissis','Talisseth','Talissvar','Talisson','Talissir','Talissos','Talissrix',
    'Uvethar','Uvethen','Uvethor','Uvethis','Uvetheth','Uvethvar','Uvethon','Uvethir','Uvethos','Uvethrix',
    'Vandisar','Vandisen','Vandisor','Vandisis','Vandiseth','Vandisvar','Vandison','Vandisir','Vandisos','Vandisrix',
    'Wethisar','Wethisen','Wethisor','Wethisis','Wethiseth','Wethisvar','Wethison','Wethisir','Wethisos','Wethisrix',
    'Xaelnar','Xaelnen','Xaelnor','Xaelnis','Xaelneth','Xaelnvar','Xaelnon','Xaelnir','Xaelnos','Xaelnrix',
    'Yovakar','Yovaken','Yovakor','Yovakis','Yovaketh','Yovakvar','Yovakon','Yovakir','Yovakos','Yovakrix',
    'Zethisar','Zethisen','Zethisor','Zethisis','Zethiseth','Zethisvar','Zethison','Zethisir','Zethisos','Zethisrix',
    'Athekar','Atheken','Athekor','Athekis','Atheketh','Athekvar','Athekon','Athekir','Athekos','Athekrix',
    'Belvakar','Belvaken','Belvakor','Belvakis','Belvaketh','Belvakvar','Belvakon','Belvakir','Belvakos','Belvakrix',
    'Corithar','Corithen','Corithor','Corithis','Coritheth','Corithvar','Corithon','Corithir','Corithos','Corithrix',
    'Delvakar','Delvaken','Delvakor','Delvakis','Delvaketh','Delvakvar','Delvakon','Delvakir','Delvakos','Delvakrix',
    'Ethissar','Ethissen','Ethissor','Ethissis','Ethisseth','Ethissvar','Ethisson','Ethissir','Ethissos','Ethissrix',
    'Forvakar','Forvaken','Forvakor','Forvakis','Forvaketh','Forvakvar','Forvakon','Forvakir','Forvakos','Forvakrix',
    'Gavethar','Gavethen','Gavethor','Gavethis','Gavetheth','Gavethvar','Gavethon','Gavethir','Gavethos','Gavethrix',
    'Helvakar','Helvaken','Helvakor','Helvakis','Helvaketh','Helvakvar','Helvakon','Helvakir','Helvakos','Helvakrix',
    'Irvakar','Irvaken','Irvakor','Irvakis','Irvaketh','Irvakvar','Irvakon','Irvakir','Irvakos','Irvakrix',
    'Jethisar','Jethisen','Jethisor','Jethisis','Jethiseth','Jethisvar','Jethison','Jethisir','Jethisos','Jethisrix',
    'Kelvakar','Kelvaken','Kelvakor','Kelvakis','Kelvaketh','Kelvakvar','Kelvakon','Kelvakir','Kelvakos','Kelvakrix',
    'Levethar','Levethen','Levethor','Levethis','Levetheth','Levethvar','Levethon','Levethir','Levethos','Levethrix',
    'Melvakar','Melvaken','Melvakor','Melvakis','Melvaketh','Melvakvar','Melvakon','Melvakir','Melvakos','Melvakrix',
    'Nethisar','Nethisen','Nethisor','Nethisis','Nethiseth','Nethisvar','Nethison','Nethisir','Nethisos','Nethisrix',
    'Orvethar','Orvethen','Orvethor','Orvethis','Orvetheth','Orvethvar','Orvethon','Orvethir','Orvethos','Orvethrix',
    'Pelvakar','Pelvaken','Pelvakor','Pelvakis','Pelvaketh','Pelvakvar','Pelvakon','Pelvakir','Pelvakos','Pelvakrix',
    'Quethar','Quethen','Quethor','Quethis','Quetheth','Quethvar','Quethon','Quethir','Quethos','Quethrix',
    'Relvakar','Relvaken','Relvakor','Relvakis','Relvaketh','Relvakvar','Relvakon','Relvakir','Relvakos','Relvakrix',
    'Selvakar','Selvaken','Selvakor','Selvakis','Selvaketh','Selvakvar','Selvakon','Selvakir','Selvakos','Selvakrix',
    'Telvakar','Telvaken','Telvakor','Telvakis','Telvaketh','Telvakvar','Telvakon','Telvakir','Telvakos','Telvakrix',
    'Urvakar','Urvaken','Urvakor','Urvakis','Urvaketh','Urvakvar','Urvakon','Urvakir','Urvakos','Urvakrix',
    'Vethisar','Vethisen','Vethisor','Vethisis','Vethiseth','Vethisvar','Vethison','Vethisir','Vethisos','Vethisrix',
    'Welvakar','Welvaken','Welvakor','Welvakis','Welvaketh','Welvakvar','Welvakon','Welvakir','Welvakos','Welvakrix',
    'Xethisar','Xethisen','Xethisor','Xethisis','Xethiseth','Xethisvar','Xethison','Xethisir','Xethisos','Xethisrix',
    'Yelvakar','Yelvaken','Yelvakor','Yelvakis','Yelvaketh','Yelvakvar','Yelvakon','Yelvakir','Yelvakos','Yelvakrix',
    'Zelvakar','Zelvaken','Zelvakor','Zelvakis','Zelvaketh','Zelvakvar','Zelvakon','Zelvakir','Zelvakos','Zelvakrix',
    'Aksethar','Aksethen','Aksethor','Aksethis','Aksetheth','Aksethvar','Aksethon','Aksethir','Aksethos','Aksethrix',
    'Balethar','Balethen','Balethor','Balethis','Balethether','Balethvar','Balethon','Balethir','Balethos','Balethrix',
    'Cresithar','Cresithen','Cresithor','Cresithis','Cresitheth','Cresithvar','Cresithon','Cresithir','Cresithos','Cresithrix'
  ],

  // ── Modern place descriptors ─────────────
  harsh_condition: [
    'Dust','Iron','Scar','Bone','Ash','Void','Dead','Broken','Dark','Pale','Rust','Slag','Cinder','Grim','Null','Bitter','Cold','Dry','Empty','Foul',
    'Grey','Hard','Lost','Mute','Old','Raw','Salt','Torn','Used','Worn','Black','Bleak','Cracked','Dull','Flat','Hollow','Jagged','Lean','Naked','Scarred',
    'Burnt','Charred','Scorched','Blasted','Shattered','Splintered','Fractured','Riven','Sundered','Blighted','Withered','Wasted','Spent','Drained','Barren','Seared','Pitted','Warped','Bent','Twisted',
    'Crushed','Ground','Pulverized','Eroded','Weathered','Faded','Dim','Stale','Sour','Rank','Rotten','Spoiled','Corroded','Oxidized','Tainted','Poisoned','Infected','Blown','Stripped','Flensed',
    'Airless','Sunburnt','Windtorn','Sandblasted','Dustchoked','Heatbaked','Frostbitten','Icebound','Stormtorn','Rainlashed','Saltbitten','Brineworn','Waveworn','Tideworn','Drifted','Buried','Exposed','Open','Unshielded','Unmoored',
    'Unbound','Unheld','Unseen','Unmarked','Unkind','Unforgiving','Relentless','Endless','Ceaseless','Unbroken','Unyielding','Unforged','Unmade','Unlit','Unfed','Unwatered','Unrested','Unhealed','Unmended','Unfixed',
    'Deadset','Deadcold','Deadwind','Deadstone','Deadwater','Voidtouched','Voidscarred','Voidburnt','Voidhollow','Voidworn','Ashfall','Ashchoked','Ashworn','Ashbound','Ashen','Ashbitten','Ashscarred','Ashdull','Ashgrey','Ashblack',
    'Ironscarred','Ironbound','Ironworn','Ironcold','Irondry','Irondull','Ironslag','Ironsplit','Irontorn','Ironspent','Boneset','Bonewhite','Bonecold','Boneworn','Bonehollow','Bonescarred','Bonedry','Bonelean','Bonebrittle','Boneraw',
    'Rustbitten','Rustworn','Rustscarred','Rusthollow','Rustsplit','Rustbound','Rustdry','Rustcold','Rustdull','Rustwaste','Slagbound','Slagworn','Slagscarred','Slagburnt','Slagblack','Slagcold','Slagdry','Slagcracked','Slagrough','Slagbitter',
    'Cinderfall','Cinderworn','Cinderburnt','Cinderscarred','Cinderdry','Cinderblack','Cinderdull','Cinderbitter','Cinderthin','Cinderflat','Grimdark','Grimcold','Grimdry','Grimworn','Grimscarred','Grimhollow','Grimflat','Grimbleak','Grimbitter','Grimlost',
    'Nullvoid','Nullcold','Nulldry','Nullworn','Nullflat','Nullsilent','Nullgrey','Nullblack','Nullhollow','Nullspent','Bittercold','Bitterdry','Bitterwind','Bitterash','Bitterslag','Bittervoid','Bitterend','Bitterdust','Bitterstone','Bitterwaste',
    'Coldiron','Colddust','Coldvoid','Coldstone','Coldslag','Coldash','Coldscar','Coldworn','Coldempty','Coldbarren','Drydust','Drysalt','Drywind','Dryvoid','Dystone','Dryslag','Dryash','Dryscar','Drybarren','Dryspent',
    'Emptyvoid','Emptydust','Emptyash','Emptystone','Emptysky','Emptywind','Emptyworn','Emptybarren','Emptycold','Emptydead','Foulwind','Foulair','Fouldust','Foulash','Foulvoid','Foulstone','Foulblack','Foulgrey','Foulrot','Foulwaste',
    'Greydust','Greyash','Greystone','Greywind','Greyvoid','Greyworn','Greyflat','Greycold','Greybleak','Greyempty','Hardstone','Hardiron','Harddust','Hardvoid','Hardslag','Hardash','Hardscar','Hardworn','Hardbarren','Hardcold',
    'Lostdust','Lostash','Loststone','Lostvoid','Lostwind','Lostgrey','Lostblack','Lostcold','Lostbarren','Lostempty','Muted','Muteash','Mutedust','Mutestone','Mutevoid','Mutewind','Mutegrey','Muteblack','Mutecold','Muteempty',
    'Oldstone','Oldiron','Olddust','Oldash','Oldvoid','Oldworn','Oldscar','Oldgrey','Oldblack','Oldcold','Rawiron','Rawdust','Rawash','Rawstone','Rawvoid','Rawworn','Rawscar','Rawbarren','Rawcold','Rawopen',
    'Saltdust','Saltash','Saltstone','Saltvoid','Saltwind','Saltworn','Saltbarren','Saltflat','Saltgrey','Saltbleak','Torndust','Tornash','Tornstone','Tornvoid','Tornwind','Tornworn','Tornscar','Tornbarren','Torncold','Tornopen',
    'Useddust','Usedash','Usedstone','Usedvoid','Usedwind','Usedworn','Usedscar','Usedbarren','Usedcold','Usedflat','Worndust','Wornash','Wornstone','Wornvoid','Wornwind','Wornscar','Wornbarren','Worncold','Wornflat','Wornthin',
    'Blackdust','Blackash','Blackstone','Blackvoid','Blackwind','Blackworn','Blackscar','Blackbarren','Blackcold','Blackflat','Bleakdust','Bleakash','Bleakstone','Bleakvoid','Bleakwind','Bleakworn','Bleakscar','Bleakbarren','Bleakcold','Bleakflat',
    'Crackeddust','Crackedash','Crackedstone','Crackedvoid','Crackedwind','Crackedworn','Crackedscar','Crackedbarren','Crackedcold','Crackedflat','Dulldust','Dullash','Dullstone','Dullvoid','Dullwind','Dullworn','Dullscar','Dullbarren','Dullcold','Dullflat',
    'Flatdust','Flatash','Flatstone','Flatvoid','Flatwind','Flatworn','Flatscar','Flatbarren','Flatcold','Flatgrey','Hollowdust','Hollowash','Hollowstone','Hollowvoid','Hollowwind','Hollowworn','Hollowscar','Hollowbarren','Hollowcold','Hollowempty',
    'Jaggeddust','Jaggedash','Jaggedstone','Jaggedvoid','Jaggedwind','Jaggedworn','Jaggedscar','Jaggedbarren','Jaggedcold','Jaggedsharp','Leandust','Leanash','Leanstone','Leanvoid','Leanwind','Leanworn','Leanscar','Leanbarren','Leancold','Leanthin',
    'Nakeddust','Nakedash','Nakedstone','Nakedvoid','Nakedwind','Nakedworn','Nakedscar','Nakedbarren','Nakedcold','Nakedopen','Scarreddust','Scarredash','Scarredstone','Scarredvoid','Scarredwind','Scarredworn','Scarredbarren','Scarredcold','Scarredrough','Scarreddeep'
  ],

  harsh_geo: [
    'Belt','Rock','Reach','Field','Veil','Shore','Drift','Yard','Ridge','Shelf','Basin','Flats','Point','Deep','Run','Waste','Hollow','Cut','Gap','Pass',
    'Sink','Pit','Sump','Maw','Throat','Edge','Rim','Wall','Floor','Ceiling','Breach','Fracture','Seam','Vein','Shaft','Trench','Canyon','Gulch','Gorge','Chasm',
    'Spine','Spur','Rise','Drop','Fall','Scar','Line','Mark','Divide','Split','Fold','Bend','Turn','Span','Cross','Bridge','Causeway','Way','Track','Route',
    'Channel','Course','Flow','Drain','Spill','Wash','Runoff','Cutline','Breakline','Ridgeline','Fault','Faultline','Rift','Riftline','Clef','Cleaver','Splitway','Parting','Divideway','Crosscut',
    'Bar','Bank','Shelfedge','Lip','Crest','Crown','Cap','Face','Front','Back','Side','Flank','Heel','Toe','Base','Foot','Head','Crownline','Ridgeroot','Peak',
    'Summit','Top','Bottom','Underside','Overhang','Ledge','Step','Terrace','Bench','Plate','Slab','Sheet','Crust','Skin','Layer','Strata','Band','Strip','Zone','Sector',
    'Grid','Gridline','Block','Plot','Parcel','Lot','Section','Quarter','Range','Marking','Survey','Stake','Post','Marker','Beacon','Signal','Node','Pointline','Vector','Axis',
    'Plane','Fieldline','Mesh','Lattice','Frame','Skeleton','Outline','Boundary','Border','Limit','Perimeter','Ring','Loop','Circuit','Spanline','Crossline','Cutmark','Trackway','Driftline','Runline',
    'Beltway','Rockfall','Reachline','Fieldway','Veilline','Shoreline','Driftway','Yardline','Ridgeline','Shelfline','Basinway','Flatsline','Pointline','Deepway','Runline',
    'Wasteway','Hollowway','Cutway','Gapline','Passway','Sinkline','Pitline','Sumpline','Mawline','Throatline','Edgeline','Rimline','Wallline','Floorline','Ceilingline',
    'Breachway','Fractureline','Seamline','Veinline','Shaftway','Trenchline','Canyonline','Gulchline','Gorgeline','Chasmline',
    'Dustbelt','Stonebelt','Ironbelt','Ashbelt','Voidbelt','Rustbelt','Slagbelt','Cinderbelt','Grimbelt','Nullbelt',
    'Rockfield','Stonefield','Ashfield','Dustfield','Voidfield','Ironfield','Rustfield','Cinderfield','Grimfield','Nullfield',
    'Shardreach','Voidreach','Ashreach','Dustreach','Ironreach','Rustreach','Cinderreach','Grimreach','Nullreach','Stonereach',
    'Graveyard','Boneyard','Ironyard','Ashyard','Dustyard','Rustyard','Slagyard','Cinderyard','Grimyard','Nullyard',
    'Blackridge','Ashridge','Ironridge','Stoneridge','Dustridge','Rustridge','Cinderridge','Grimridge','Nullridge','Voidridge',
    'Deeppit','Blackpit','Ashpit','Ironpit','Dustpit','Rustpit','Cinderpit','Grimpit','Nullpit','Voidpit',
    'Darkhollow','Ashhollow','Bonehollow','Dusthollow','Ironhollow','Rusthollow','Cinderhollow','Grimhollow','Nullhollow','Voidhollow',
    'Rimwall','Stonewall','Ironwall','Ashwall','Dustwall','Rustwall','Cinderwall','Grimwall','Nullwall','Voidwall',
    'Edgecut','Stonecut','Ironcut','Ashcut','Dustcut','Rustcut','Cindercut','Grimcut','Nullcut','Voidcut',
    'Faulttrench','Ashtrench','Irontrench','Dusttrench','Rusttrench','Cindertrench','Grimtrench','Nulltrench','Voidtrench','Stonetrench',
    'Blackchasm','Ashchasm','Ironchasm','Dustchasm','Rustchasm','Cinderchasm','Grimchasm','Nullchasm','Voidchasm','Stonechasm',
    'Drybasin','Ashbasin','Ironbasin','Dustbasin','Rustbasin','Cinderbasin','Grimbasin','Nullbasin','Voidbasin','Stonebasin',
    'Saltflats','Ashflats','Ironflats','Dustflats','Rustflats','Cinderflats','Grimflats','Nullflats','Voidflats','Stoneflats',
    'Spineway','Ridgeway','Cutway','Passway','Driftway','Runway','Trackway','Routeway','Spanway','Crossway',
    'Underpass','Overpass','Sidepass','Lowpass','Highpass','Throughpass','Backpass','Frontpass','Midpass','Endpass',
    'Sinkhole','Pithole','Sumphole','Mawhole','Throathole','Edgehole','Rimhole','Wallhole','Floorhole','Ceilinghole',
    'Breakhole','Fracturehole','Seamhole','Veinhole','Shafthole','Trenchhole','Canyonhole','Gulchhole','Gorgehole','Chasmhole',
    'Ironvein','Ashvein','Dustvein','Rustvein','Cindervein','Grimvein','Nullvein','Voidvein','Stonevein','Blackvein',
    'Seamline','Veinline','Faultline','Riftline','Cutline','Breakline','Driftline','Runline','Trackline','Ridgeline',
    'Deepreach','Longreach','Farreach','Widefield','Openfield','Deadfield','Greyfield','Blackfield','Ashfieldline','Voidfieldline',
    'Lowridge','Highridge','Brokenridge','Splitridge','Crackedridge','Jaggedridge','Scarredridge','Wornridge','Bare ridge','Cold ridge'
  ],

  // ── Spatial descriptors ──────────────────
  spatial: [
    'Prime', 'Drift', 'Expanse', 'Veil', 'Cluster',
    'Passage', 'Reach', 'Corridor', 'Deep', 'Null',
    'Remnant', 'Threshold', 'Margin', 'Fringe', 'Scar',
    'Approach', 'Anchorage', 'Ascent', 'Bleed', 'Break',
    'Crossing', 'Descent', 'Divide', 'Edge', 'Fall',
    'Gate', 'Gulf', 'Hollow', 'Junction', 'Keep',
    'Limit', 'Mark', 'Node', 'Offset', 'Outreach',
    'Perimeter', 'Quarter', 'Relay', 'Separation', 'Transit',
    'Union', 'Vertex', 'Watch', 'Zone', 'Arc',
    'Band', 'Bearing', 'Bound', 'Branch', 'Burn',
    'Channel', 'Chart', 'Circuit', 'Claim', 'Coast',
    'Column', 'Compass', 'Confluence', 'Contact', 'Course',
    'Cover', 'Current', 'Curve', 'Cut', 'Dark'
  ],

  // ── Possession words ─────────────────────
  possession: [
    'World','Station','Reach','Belt','Claim','Rock','Drift','Landing','Hold','Point','Rest','Watch','Gate','Run','Post',
    'Field','Yard','Pit','Well','Shelf','Ridge','Basin','Flats','Shore','Edge','Mark','Keep','Chart','Arc','Way',
    'Span','Cross','Pass','Route','Track','Line','Loop','Ring','Circuit','Grid','Node','Link','Bridge','Crossing','Fork',
    'Turn','Bend','Cut','Break','Split','Divide','Bound','Limit','Border','Frame','Shell','Core','Crown','Base','Root',
    'Anchor','Harbor','Dock','Port','Berth','Moor','Tether','Latch','Lock','Seal','Hatch','Airlock','Bulkhead','Spine','Keel',
    'Hull','Deck','Mast','Array','Relay','Beacon','Signal','Uplink','Downlink','Channel','Band','Vector','Axis','Plane','Sector',
    'Outpost','Forward','Rear','Front','Linehold','Stronghold','Waypost','Guidepost','Watchpost','Guardpost','Relaypost','Driftpost','Edgepost','Gatepost','Fieldpost',
    'Base','Camp','Encampment','Site','Zone','Sector','Block','Parcel','Lot','Range','Quarter','Survey','Stake','Marker','Beaconpoint',
    'Deep','Shallows','Rise','Drop','Fall','Shelfedge','Ridgeline','Fault','Rift','Seam','Vein','Shaft','Trench','Cutline','Breakline',
    'Runoff','Wash','Spill','Drain','Course','Channelway','Flow','Spillway','Catch','Catchment','Basinway','Flatline','Shoreline','Edgeline','Rim',
    'Claimhold','Rockhold','Drifthold','Gatehold','Fieldhold','Yardhold','Pithold','Wellhold','Shelhold','Ridgehold',
    'Stationkeep','Worldkeep','Gatekeep','Fieldkeep','Watchkeep','Edgekeep','Ridgekeep','Basinkeep','Flatskeep','Shorekeep',
    'Chartline','Wayline','Arcline','Markline','Runline','Gateway','Fieldway','Ridgeway','Shoreway','Edgeway',
    'Pitway','Wellway','Shelfway','Basinway','Flatsway','Driftway','Rockway','Claimway','Beltway','Reachway',
    'Ironhold','Ashhold','Dusthold','Voidhold','Rusthold','Cinderhold','Grimhold','Nullhold','Stonehold','Blackhold',
    'Ironkeep','Ashkeep','Dustkeep','Voidkeep','Rustkeep','Cinderkeep','Grimkeep','Nullkeep','Stonekeep','Blackkeep',
    'Gatewatch','Edgewatch','Ridgewatch','Shorewatch','Fieldwatch','Yardwatch','Pitwatch','Wellwatch','Shelfwatch','Basinwatch',
    'Flatswatch','Driftwatch','Rockwatch','Claimwatch','Beltwatch','Reachwatch','Stationwatch','Worldwatch','Postwatch','Runwatch',
    'Markpost','Gatepost','Edgepost','Ridgepost','Shorepost','Fieldpost','Yardpost','Pitpost','Wellpost','Shelfpost',
    'Basinpost','Flatspost','Driftpost','Rockpost','Claimpost','Beltpost','Reachpost','Stationpost','Worldpost','Runpost',
    'Worldline','Stationline','Reachline','Beltline','Claimline','Rockline','Driftline','Landingline','Holdline','Pointline',
    'Restline','Watchline','Gateline','Runline','Postline','Fieldline','Yardline','Pitline','Wellline','Shelfline',
    'Ridgecrest','Basincrest','Flatscrest','Shorecrest','Edgecrest','Markcrest','Keepcrest','Chartcrest','Arccrest','Waycrest',
    'Pointcrest','Gatecrest','Fieldcrest','Yardcrest','Pitcrest','Wellcrest','Shelfcrest','Runcrest','Postcrest','Watchcrest',
    'Nullpoint','Voidpoint','Ashpoint','Dustpoint','Ironpoint','Rustpoint','Cinderpoint','Grimpoint','Stonepoint','Blackpoint',
    'Nullgate','Voidgate','Ashgate','Dustgate','Irongate','Rustgate','Cindergate','Grimgate','Stonegate','Blackgate',
    'Deepwell','Drywell','Ashwell','Dustwell','Ironwell','Rustwell','Cinderwell','Grimwell','Nullwell','Voidwell',
    'Longrun','Shortrun','Deeprun','Dryrun','Ashrun','Dustrun','Ironrun','Rustrun','Cinderrun','Grimrun',
    'Lastwatch','Firstwatch','Longwatch','Shortwatch','Deepwatch','Drywatch','Ashwatch','Dustwatch','Ironwatch','Rustwatch',
    'Farreach','Nearreach','Longreach','Shortreach','Deepreach','Dryreach','Ashreach','Dustreach','Ironreach','Rustreach',
    'Highgate','Lowgate','Frontgate','Backgate','Sidegate','Crossgate','Innergate','Outergate','Westgate','Eastgate',
    'Northgate','Southgate','Upgate','Downgate','Midgate','Endgate','Oldgate','Newgate','Lastgate','Firstgate'
  ],

  // ── Bureaucratic prefixes ────────────────
  bureaucratic: [
    'Transfer', 'Outpost', 'Relay', 'Station', 'Depot',
    'Freeport', 'Platform', 'Node', 'Waypoint', 'Checkpoint',
    'Terminal', 'Junction', 'Hub', 'Post', 'Base',
    'Installation', 'Facility', 'Anchorage', 'Berth', 'Dock',
    'Annex','Sector','District','Region','Zone','Quarter','Module','Complex','Compound','Center',
    'Substation','Branch','Division','Office','Bureau','Directorate','Section','Sector Hub','Control','Command',
    'Processing','Transfer Point','Transfer Hub','Transit Point','Transit Hub','Cargo Post','Cargo Node','Cargo Station','Logistics Base','Logistics Node',
    'Customs Post','Inspection Point','Screening Node','Registry','Registry Node','Registry Station','Control Point','Control Station','Control Node','Control Hub',
    'Operations Base','Operations Node','Operations Center','Operations Hub','Operations Station','Support Base','Support Node','Support Station','Support Hub','Support Post',
    'Service Depot','Supply Depot','Supply Node','Supply Station','Supply Hub','Distribution Node','Distribution Center','Distribution Hub','Freight Yard','Freight Node',
    'Array','Grid','Network Node','Switch','Router','Gateway','Access Point','Link Station','Signal Post','Signal Node',
    'Beacon Station','Beacon Node','Monitoring Post','Monitoring Station','Monitoring Node','Tracking Station','Tracking Node','Telemetry Station','Telemetry Node','Survey Station',
    'Administrative Post','Administrative Hub','Administrative Center','Administration Node','Clerical Office','Records Office','Records Node','Records Station','Archive','Archive Node',
    'Archive Station','Filing Center','Permit Office','Permit Post','Permit Node','Licensing Office','Licensing Post','Licensing Node','Customs Office','Customs Node',
    'Command Post','Command Node','Command Station','Forward Post','Forward Base','Forward Node','Forward Station','Staging Post','Staging Base','Staging Node',
    'Marshalling Yard','Marshalling Node','Marshalling Station','Assembly Yard','Assembly Node','Assembly Station','Processing Yard','Processing Hub','Processing Station','Holding Yard',
    'Docking Node','Docking Ring','Docking Arm','Docking Bay','Slip','Berthway','Pier','Harbor Node','Harbor Station','Harbor Post',
    'Anchorage Node','Anchorage Ring','Mooring Point','Mooring Node','Mooring Station','Quay','Bulkhead','Lock','Airlock','Gatehouse'
  ],

  // ── Ship name components ─────────────────
  ship_aspiration: [
    'Pride','Horizon','Reach','Promise','Fortune',
    'Hope','Venture','Future','Dawn','Claim',
    'Glory','Dream','Ascent','Ambition','Resolve',
    'Purpose','Compass','Charter','Course','Bearing',
    'Vision','Prospect','Chance','Gamble','Design',
    'Intention','Pursuit','Quest','Aim','Arc',
    'Vector','Heading','Line','Track','Trail',
    'Path','Voyage','Odyssey','Pilgrimage','Advance',
    'Progress','Drive','Strive','Endeavor','Effort',
    'Will','Spirit','Courage','Valor','Honor',
    'Merit','Title','Tenure','Legacy','Birthright',
    'Patience','Perseverance','Stature','Esteem','Aspiration',
    'Spark','Signal','Beacon','Star','Light',
    'Flare','Halo','Crown','Standard','Banner',
    'Charge','Mandate','Edict','Decree','Accord',
    'Treaty','Pact','Compact','Covenant','Bond',
    'Summit','Crest','Pinnacle','Highwater','Zenith',
    'Apex','Cusp','Threshold','Gateway','Opening',
    'First','Genesis','Origin','Impulse','Impulse',
    'Impulse Line','Prime','Source','Seed','Spring',
    'Lift','Carry','Ascent Line','Uplift','Rise',
    'Climb','Escalation','Surge','Uprise','Upshot',
    'Vector Line','Bearing Line','Course Line','Forward Line','Longview',
    'Farview','Starview','Skyline','Spire','Crownline',
    'Brightwork','Radiance','Lustre','Shine','Gleam',
    'Brilliance','Glimmer','Glimpse','Gleamline','Glow',
    'Signal Fire','Signal Light','Guidelight','Guide Star','Guide Line',
    'True Line','True North','True Course','Steady Course','Steady Line',
    'Patron','Oath','Vow','Promise Line','Guarantee',
    'Assurance','Surety','Anchor','Lodestar','Polestar',
    'Northlight','Southlight','Eastlight','Westlight','Waylight',
    'Firebrand','Standard Bearer','Waymark','Sign','Mark',
    'Claimline','Claim Right','Freehold','Holding','Charterhold',
    'Charter Right','Titlehold','Patent','Grant','Writ',
    'Commission','License','Permit','Warrant','Seal',
    'Stamp','Signet','Insignia','Device','Badge',
    'Endeavor Line','Horizon Line','Fortune Line','Future Line','Dawn Line',
    'Glory Line','Dream Line','Ascent Line','Ambition Line','Resolve Line',
    'Purpose Line','Compass Rose','Charter Line','Course Line','Bearing Line',
    'Venture Line','Hope Line','Reach Line','Pride Line','Promise Line'
  ],

  ship_endurance: [
    'Bitter','Iron','Broken','Last','Far',
    'Dead','Heavy','Dark','Long','Cold',
    'Hard','Dry','Slow','Deep','Lost',
    'Old','Worn','Pale','Hollow','Silent',
    'Spent','Used','Scarred','Scored','Marked',
    'Rough','Harsh','Lean','Bare','Raw',
    'Sour','Grey','Bleak','Black','Grim',
    'Null','Void','Dust','Rust','Slag',
    'Choked','Starved','Parched','Frozen','Burnt',
    'Charred','Seared','Cracked','Weathered','Pitted',
    'Warped','Bent','Twisted','Torn','Frayed',
    'Ragged','Beaten','Driven','Bled','Bruised',
    'Bound','Tethered','Chained','Lashed','Moored',
    'Anchored','Fixed','Pinned','Set','Stuck',
    'Stalled','Idle','Dormant','Waiting','Watching',
    'Wakeful','Tiring','Endless','Ceaseless','Relentless',
    'Low','Spent-Out','Overrun','Underway','Stayed',
    'Stubborn','Dogged','Crawling','Dragging','Hauling',
    'Grinding','Groaning','Creaking','Straining','Burdened',
    'Loaded','Freighted','Ballasted','Weighted','Deep-Laden',
    'Hardscrap','Hardwon','Hardkept','Hardrun','Hardroad',
    'Longrun','Longroad','Longwatch','Longhaul','Longmarch',
    'Deepwatch','Deeproad','Deeprun','Farbound','Farflung',
    'Farcast','Fargoing','Lastlight','Lastrun','Lastwatch',
    'Deadquiet','Deadslow','Deadcold','Deadset','Deadstill',
    'Deadrun','Deadwatch','Deadreach','Deadroad','Deadline',
    'Ironbound','Ironworn','Ironscar','Ironold','Ironslow',
    'Ironhard','Ironcold','Ironbare','Irondry','Ironlong',
    'Blackcold','Blackdeep','Blacklong','Blackhard','Blackdry',
    'Blackslow','Blackworn','Blackold','Blackscarred','Blackrun',
    'Greycold','Greylong','Greydry','Greyslow','Greyworn',
    'Greyold','Greyscarred','Greyrun','Greydeep','Greysilent',
    'Dustchoked','Dustcold','Dustdry','Dustslow','Dustworn',
    'Dustold','Dustscarred','Dustrun','Dustdeep','Dustsilent',
    'Saltbitten','Saltworn','Saltscarred','Saltcold','Saltdry',
    'Saltburnt','Saltwaste','Saltdeep','Saltlong','Saltsilent',
    'Voidcold','Voiddry','Voidslow','Voidworn','Voidold',
    'Voidscarred','Voidrun','Voiddeep','Voidsilent','Voidstill',
    'Grimworn','Grimold','Grimscarred','Grimrun','Grimdeep',
    'Grimsilent','Grimslow','Grimcold','Grimdry','Grimlong'
  ],

  ship_endurance_noun: [
    'End', 'Run', 'Watch', 'Trade', 'Passage',
    'Crossing', 'Mile', 'Haul', 'Shift', 'Burn',
    'Road', 'March', 'Pull', 'Push', 'Drag',
    'Grind', 'Stretch', 'Leg', 'Turn', 'Lap',
    'Circuit','Cycle','Loop','Orbit','Track',
    'Course','Transit','Traverse','Transit Line','Line',
    'Route','Way','Trail','Trace','Path',
    'Spur','Branch','Trackway','Wayline','Runline',
    'Span','Bridge','Link','Chain','Relay',
    'Shiftwatch','Duty','Stint','Tour','Rotation',
    'Schedule','Watchturn','Posting','Posting Run','Shiftline',
    'Dutyline','Guard','Vigil','Hold','Stand',
    'Carry','Lift','Tow','Towline','Towshot',
    'Heave','Heave Line','Heft','Burden','Load',
    'Burden Line','Freight','Freight Run','Dragline','Pullline',
    'Pushline','Grindline','Haulline','Marchline','Roadline',
    'Voyage','Transit Arc','Transit Pass','Track Pass','Course Pass',
    'Passline','Crossline','Crosscut','Overrun','Underrun',
    'Fallback','Advance','Pushforward','Drawback','Set',
    'Offset','Step','Stride','Stage','Phase',
    'Segment','Section','Division','Slice','Cut',
    'Lot','Parcel','Block','Zone','Sector',
    'Tier','Layer','Band','Strip','Ring',
    'Shell','Frame','Skeleton','Spanline','Segment Run',
    'Stage Run','First Leg','Last Leg','Long Leg','Short Leg',
    'Deep Leg','Outer Leg','Inner Leg','Far Leg','Near Leg',
    'Watch Leg','Trade Leg','Drift Leg','Dust Leg','Void Leg',
    'Line Leg','Edge Leg','Rim Leg','Reach Leg','Gate Leg',
    'Anchor Watch','Graveyard Watch','Dogwatch','Midwatch','Longwatch',
    'First Watch','Last Watch','Quiet Watch','Storm Watch','Dust Watch',
    'Ice Watch','Heat Watch','Deep Watch','Drift Watch','Edge Watch',
    'Gate Watch','Reach Watch','Field Watch','Yard Watch','Pit Watch',
    'Milerun','Long Mile','Last Mile','Dead Mile','Dry Mile',
    'Cold Mile','Grey Mile','Black Mile','Salt Mile','Dust Mile',
    'Road Mile','Grind Mile','Trade Mile','Watch Mile','Gate Mile',
    'Field Mile','Edge Mile','World Mile','Station Mile','Belt Mile',
    'End Run','End Watch','End Road','End March','End Shift',
    'End Haul','End Turn','End Leg','End Lap','End Stretch',
    'Long End','Last End','Dead End','Cold End','Dust End',
    'Salt End','Void End','Black End','Grey End','Hard End'
  ],

  ship_function: [
    'Long Haul', 'Last Shift', 'Deep Trade', 'Station Runner',
    'Far Burn', 'Ore Runner', 'Void Passage', 'Rim Run',
    'Dust Carrier', 'Hull Forward', 'Dark Transit', 'Cold Passage',
    'Iron Crossing', 'Lost Mile', 'Silent Haul', 'Pale Runner',
    'Hollow Watch', 'Dead Stretch', 'Worn Road', 'Hard Grind',
    'Outer Haul','Border Run','Belt Trade','Slip Runner','Freeport Carrier',
    'Sump Drifter','Grain Haul','Fuel Ferry','Bulk Runner','Cargo Line',
    'Stack Runner','Backline Transit','Short Hop','Far Relay','Hub Link',
    'Spoke Runner','Spine Line','Hinter Haul','Deep Relay','Quiet Trade',
    'Circuit Haul','Outer Circuit','Station Link','Anchor Run','Harbor Line',
    'Customs Runner','Relay Trade','Bond Carrier','Charter Line','Contract Run',
    'Lease Haul','Freight Passage','Block Route','Parcel Run','Wayleave Line',
    'Workline Haul','Duty Run','Shift Line','Grind Route','Watch Circuit',
    'Coal Run','Ore Lift','Ore Drop','Rock Train','Slag Carrier',
    'Scrap Tow','Hull Tow','Grave Tow','Frame Ferry','Bay Shifter',
    'Dock Shuttle','Pier Ferry','Yard Mule','Stack Mule','Stack Pusher',
    'Yard Pusher','Slip Tender','Berth Tender','Port Runner','Pier Runner',
    'Orbital Bus','Transit Skiff','Anchor Shuttle','Waypoint Service','Loop Runner',
    'Perimeter Patrol','Ring Courier','Inner Loop','Outer Loop','Spoke Shuttle',
    'Spine Tram','Transit Tram','Hub Shuttle','Bridge Ferry','Gate Runner',
    'Gate Haul','Gate Link','Gate Service','Reach Runner','Reach Haul',
    'Cold Chain','Cold Route','Dry Chain','Dry Route','Slow Line',
    'Long Watch','Long Passage','Long Circuit','Last Passage','Last Relay',
    'Last Trade','Dead Run','Dead Line','Dust Run','Dust Line',
    'Void Line','Void Relay','Void Trade','Ash Line','Ash Haul',
    'Season Haul','Cycle Run','Shift Haul','Turnover Run','Quarter Line',
    'Rotation Line','Stint Haul','Stretch Run','Leg Runner','Stage Carrier',
    'Step Runner','March Line','Road Train','Road Runner','Trace Haul',
    'Trail Line','Spur Haul','Side Track','Branch Line','Back Road',
    'Common Carrier','Contract Carrier','Charter Carrier','Line Vessel','Service Vessel',
    'Route Vessel','Way Vessel','Trade Vessel','Circuit Vessel','Relay Vessel',
    'Depot Tender','Station Tender','Anchor Tender','Belt Tender','Field Tender',
    'Reach Tender','Ridge Tender','Edge Tender','Shore Tender','Harbor Tender',
    'Standard Haul','Rated Carry','Schedule Run','Timetable Line','Mail Run',
    'Packet Line','Packet Runner','Courier Line','Courier Run','Message Runner',
    'Dispatch Line','Dispatch Boat','Notice Runner','Ledger Line','Record Run',
    'Survey Line','Survey Runner','Marker Boat','Beacon Runner','Chart Vessel',
    'Pioneer Line','Advance Haul','Frontier Run','Border Service','Rim Carrier',
    'Rim Passage','Rim Line','Fringe Service','Outland Haul','Trace Service',
    'Dust Fringe','Periphery Run','Hinter Line','Backfield Haul','Reachfeed',
    'Long Feed','Supply Line','Relief Run','Support Train','Reserve Haul'
  ],

  ship_prefix: [
    'UEC', 'CFV', 'ISV', 'TCV', 'ICV', 'RAS', 'VHI',
    'DSV', 'FTV', 'OCV', 'RCV', 'STV', 'WCV', 'XCV',
    'CSV','MSV','SSV','NSV','RSV','RMS','HMV','HMS','USV','TSV',
    'LTV','MTV','GTV','LSV','PSV','LMV','ARV','ERV','RNV','CNV',
    'UGV','UNV','UHV','UDF','UCS','ACV','ADV','AEV','ASF','ASV',
    'BTV','BCV','BDV','CAV','CIV','CLV','CMV','CPV','CRV','CTV',
    'DVF','ECV','EFV','ELV','ENV','EPV','ESV','ETV','EUV','FCV',
    'FGV','FIV','FLV','FRV','FSV','FTS','FWV','GCv','GSV','GTV',
    'HCV','HDV','HEV','HLV','HRV','HSV','HTV','ICF','IDV','IFV',
    'IGV','ILV','IMV','IPV','IRV','ITV','JCV','KCV','LCV','LDV',
    'LHV','LMF','LPV','LRV','LSF','LTV','MCV','MDF','MEV','MFV',
    'MGV','MLV','MMV','MPV','MRV','MSF','MTF','NCV','NDF','NEV',
    'NFV','NGV','NLV','NPV','NRV','NSV','NTV','OCF','ODF','OEV',
    'OFV','OGV','OLV','OMV','OPV','ORV','OSV','OTV','PCV','PDF',
    'PEV','PFV','PGV','PLV','PMV','PPV','PRV','PSV','PTV','QCV',
    'RCF','RDF','REV','RFV','RGV','RLV','RMV','RPV','RSV','RTV',
    'SCV','SDF','SEV','SFV','SGV','SLV','SMV','SPV','SRV','SSV',
    'STF','TDF','TEV','TFV','TGV','TLV','TMV','TPV','TRV','TSV',
    'UCV','VCV','WDF','WEV','WFV','WGV','WLV','WMV','WPV','WRV',
    'WSV','WTV','XDF','XEV','XFV','XGV','XLV','XMV','XPV','XRV'
  ],

  ship_virtue: [
    'Resolute', 'Dominion', 'Integrity', 'Vanguard', 'Endurance',
    'Steadfast', 'Reckoning', 'Vigilant', 'Relentless', 'Warrant',
    'Perseverance', 'Conviction', 'Defiance', 'Patience', 'Tenacity',
    'Forbearance', 'Constancy', 'Fortitude', 'Diligence', 'Temperance',   
    'Fidelity','Honor','Courage','Valor','Discipline',
    'Service','Duty','Mandate','Charge','Purpose',
    'Guidance','Balance','Equity','Justice','Clemency',
    'Measure','Caution','Resolve','Assurance','Promise',
    'Accord','Compact','Pact','Charter','Treaty',
    'Covenant','Guarantee','Surety','Oath','Bond',
    'Trust','Confidence','Reliance','Credit','Standing',
    'Merit','Esteem','Stature','Bearing','Repute',
    'Constancy','Stability','Anchor','Foundation','Keystone',
    'Cornerstone','Bulwark','Bastion','Rampart','Watch',
    'Outlook','Horizon','Purposeful','Intent','Design',
    'Pursuit','Vocation','Calling','Chargehold','Steady Hand',
    'Guardian','Sentinel','Custodian','Protector','Ward',
    'Harbor','Refuge','Haven','Harborlight','Guide',
    'Beacon','Signal','Northlight','Truecourse','Clearway',
    'Free Passage','Due Process','Equity Line','Fair Dealing','Measure Line',
    'Patience Line','Enduring','Unbroken','Unbowed','Unbent',
    'Unbound','Unshaken','Unshifting','Unmoving','Unfaltering',
    'Abiding','Lasting','Persistent','Careful','Thorough',
    'Exact','Precise','Sound','Reliable','Constant',
    'Temperate','Measured','Moderate','Balanced','Considerate',
    'Mindful','Watchful','Alert','Ready','Prepared',
    'Deliberate','Earnest','Faithful','Loyal','Committed',
    'Bound Oath','Kept Oath','Kept Word','Good Faith','Due Diligence',
    'Vantage','Vanguard Line','Steady Course','True Bearing','Just Measure',
    'Fair Chance','Common Cause','Common Wealth','Common Trust','Civic Duty',
    'Civic Honor','Public Faith','Public Trust','Mandated','Commissioned',
    'Accredited','Chartered','Registered','Ratified','Confirmed',
    'Enduring Light','Steady Light','Sure Star','True Star','Guiding Star',
    'Clear Sign','Just Intent','Quiet Resolve','Calm Watch','Long Patience',
    'Firm Purpose','Right Measure','Even Hand','Open Hand','Ready Hand',
    'Good Service','Plain Dealing','Straight Course','Right-of-Way','Due Course'
  ],

  // ── Corp name components ─────────────────
  corp_industry: [
    'Mercantile', 'Industries', 'Logistics', 'Combine',
    'Resources', 'Holdings', 'Colonial', 'Extraction',
    'Transit', 'Arms', 'Heavy', 'Deep Survey',
    'Salvage', 'Reclamation', 'Prospecting', 'Futures',
    'Capital', 'Freight', 'Supply', 'Services',
    'Group','Consortium','Syndicate','Conglomerate','Alliance',
    'Cartel','Trust','Corporation','Enterprises','Partners',
    'Ventures','Interstellar','Systems','Dynamics','Solutions',
    'Operations','Development','Management','Initiatives','Programs',
    'Mining','Fabrication','Processing','Refining','Manufacturing',
    'Assembly','Construction','Shipyards','Aerospace','Shipworks',
    'Extraction Group','Resource Group','Resource Works','Heavy Works','Deepworks',
    'Orbital Works','Yards','Facilities','Complex','Installations',
    'Transport','Haulage','Transit Lines','Lift & Transit','Towing',
    'Tow & Salvage','Bulk Freight','Bulk Transit','Freight Lines','Cargo Systems',
    'Distribution','Distribution Networks','Forwarding','Brokerage','Clearing',
    'Supply Chain','Cold Chain','Port Services','Terminal Services','Harbor Services',
    'Energy','Power Systems','Reactors','Fuel Systems','Fuel Services',
    'Power & Light','Generation','Grid Services','Transmission','Energy Holdings',
    'Extraction & Energy','Resource & Energy','Fuel Logistics','Energy Transit','Power Transit',
    'Cryogenics','Thermal Systems','Environmental','Life Support','Habitat Systems',
    'Colonial Holdings','Colonial Services','Colonial Ventures','Colonial Supply','Colonial Logistics',
    'Colonial Development','Frontier Holdings','Frontier Logistics','Frontier Ventures','Rim Holdings',
    'Belt Holdings','Belt Logistics','Belt Mining','Outland Holdings','Outer Systems',
    'Rim Systems','Periphery Systems','Frontier Systems','Colonial Capital','Colonial Trust',
    'Capital Group','Capital Partners','Capital Management','Capital Holdings','Capital Markets',
    'Asset Management','Portfolio Holdings','Securities','Financial','Financial Services',
    'Credit','Equities','Futures & Options','Forward Markets','Guarantee',
    'Insurance','Underwriting','Risk Management','Treasury','Investment',
    'Survey','Exploration','Survey & Mapping','Astrometrics','Charting',
    'Navigation Systems','Navigation Services','Guidance Systems','Tracking','Telemetry',
    'Signal & Control','Network Systems','Data Systems','Information Systems','Analytics',
    'Compliance','Oversight','Regulatory Services','Audit Services','Inspection',
    'Habitat','Terraforming','Environmentals','Life Systems','Support Services',
    'Maintenance','Field Services','Reliability','Operations Support','Sustainment',
    'Fabrication & Repair','Repair Yards','Service Yards','Overhaul','Refit',
    'Dockyard Services','Orbital Services','Platform Services','Station Services','Port Authority',
    'Mercantile Trust','Mercantile Group','Mercantile Exchange','Trade Group','Trade Alliance',
    'Transit Consortium','Logistics Group','Resource Consortium','Industrial Group','Freight Union',
    'Prospecting Guild','Survey Guild','Transit Union','Stevedores','Dockworkers',
    'Carriers Association','Shipping Cooperative','Freeport Authority','Zone Authority','Terminal Authority'
  ],

  corp_scope: [
    'United', 'Inner', 'Outer', 'Free', 'Colonial',
    'Expeditionary', 'Reclamation', 'Joint', 'Combined', 'Allied',
    'Consolidated', 'Integrated', 'Associated', 'Federated', 'Unified',
    'Independent', 'Sovereign', 'Collective', 'Cooperative', 'Mutual', 
    'Central','Regional','Sector','Zonal','Provincial',
    'Territorial','Frontier','Metropolitan','Interstellar','Intersector',
    'Pan‑System','Pan‑Regional','Systemic','Trans‑System','Trans‑Sector',
    'Global','Planetary','Orbital','Belt','Rim',
    'Core','Periphery','Interior','Exterior','Border',
    'Frontier Line','Interface','Gateway','Corridor','Axis',
    'Network','Grid','Matrix','Framework','Cluster',
    'Division','Branch','Local','District','Area',
    'General','Universal','Common','Public','Civic',
    'National','Federal','Confederal','Consortium','Bloc',
    'League','Compact','Accord','Union','Council',
    'Assembly','Alliance','Partnership','Syndicate','Combine',
    'Incorporated','Affiliated','Aligned','Harmonized','Coordinated',
    'Cohesive','Linked','Connected','Interlocked','Interlinked',
    'Structured','Organized','Administered','Chartered','Mandated',
    'Authorized','Licensed','Registered','Recognized','Accredited',
    'Primary','Secondary','Tertiary','Principal','Major',
    'Minor','Strategic','Tactical','Operational','Support',
    'Auxiliary','Complementary','Supplemental','Parallel','Joint‑Venture',
    'Shared','Pooled','Distributed','Decentralized','Centralized',
    'Upstream','Midstream','Downstream','Inbound','Outbound',
    'Linehaul','Feeder','Trunk','Branchline','Cross‑Sector',
    'Cross‑Border','Inter‑Regional','Multi‑Sector','Multi‑System','Multi‑Phase',
    'End‑to‑End','Full‑Scope','Limited','Extended','Expanded',
    'Legacy','Successor','Founding','Charter','Pioneer',
    'Heritage','Flagship','Premier','Primary Line','Core Line',
    'Mainline','Backline','Frontline','Baseline','Horizon',
    'Anchor','Keystone','Cornerstone','Pillar','Framework',
    'Worker','Member','Stakeholder','Client','Customer',
    'Investor','Partner','Patron','Member‑Owned','User‑Owned',
    'Producer','Consumer','Joint‑Stake','Dual‑Stake','Tri‑Sector',
    'Cross‑Holding','Shared‑Equity','Equal‑Share','Balanced','Equitable',
    'Unified Systems','United Systems','Federated Systems','Associated Systems','Aligned Systems',
    'Integrated Systems','Consolidated Systems','Joint Systems','Combined Systems','Allied Systems',
    'Collective Systems','Mutual Systems','Cooperative Systems','Independent Systems','Sovereign Systems',
    'Inner Systems','Outer Systems','Colonial Systems','Frontier Systems','Rim Systems'
  ],

  corp_domain: [
    'Systems', 'Traders', 'Colonies', 'Commerce',
    'Resource', 'Transit', 'Defense', 'Operations',
    'Frontier', 'Orbital', 'Deep Space', 'Planetary',
    'Stellar', 'Interstellar', 'Regional', 'Galactic',
    'Logistics','Freight','Shipping','Transport',
    'Haulage','Distribution','Supply Chain','Warehousing',
    'Terminals','Ports','Dockyards','Shipyards',
    'Shipwrights','Aerospace','Astronautics','Navigation',
    'Astrometrics','Survey','Exploration','Cartography',
    'Mining','Extraction','Refining','Processing',
    'Manufacturing','Fabrication','Construction','Infrastructure',
    'Energy','Power','Fuel','Reactors',
    'Life Support','Habitats','Environments','Terraforming',
    'Agriculture','AgriSystems','BioSystems','Hydroponics',
    'Mercantile','Trading','Exchanges','Brokerage',
    'Clearinghouse','Finance','Capital','Securities',
    'Futures','Derivatives','Insurance','Underwriting',
    'Credit','Holdings','Ventures','Investments',
    'Trust','Consortium','Syndicate','Alliance',
    'Security','Protective Services','Risk Management','Compliance',
    'Intelligence','Surveillance','Monitoring','Analytics',
    'Data Systems','Networks','Communications','Telemetry',
    'Signal','Relay','Grid','Platforms',
    'Stations','Installations','Complexes','Facilities',
    'Colonial Affairs','Colonial Services','Colonial Support','Colonial Development',
    'Frontier Services','Frontier Operations','Frontier Development','Frontier Support',
    'Orbital Services','Orbital Operations','Orbital Platforms','Orbital Support',
    'Belt Operations','Belt Resources','Rim Operations','Rim Services',
    'Deep Space Operations','Deep Space Logistics','Deep Space Survey','Deep Space Support',
    'Planetary Services','Planetary Operations','Planetary Systems','Planetary Resources',
    'System Operations','System Logistics','System Security','System Development',
    'Sector Operations','Sector Logistics','Sector Defense','Sector Development',
    'Cluster Operations','Cluster Holdings','Cluster Logistics','Cluster Commerce',
    'Zone Operations','Zone Development','Zone Logistics','Zone Security',
    'Trade Networks','Commerce Networks','Market Systems','Exchange Systems',
    'Clearing Systems','Payment Systems','Settlement Systems','Custody Services',
    'Asset Services','Portfolio Services','Advisory','Consulting',
    'Management','Strategy','Solutions','Integration',
    'Support','Services Group','Operations Group','Resource Group',
    'Industrial','Foundries','Heavy Industries','Light Industries',
    'Manufacturing Group','Fabrication Group','Assembly Systems','Component Systems',
    'Materials','Alloys','Composites','Structures',
    'Mechanicals','Automation','Robotics','Drones',
    'Maintenance','Overhaul','Repair','Lifecycle Services'
  ],

  corp_authority: [
    'Command', 'Authority', 'League', 'Union',
    'Compact', 'Assembly', 'Bureau', 'Commission',
    'Council', 'Board', 'Institute', 'Foundation',
    'Corporation', 'Syndicate', 'Consortium', 'Cooperative',
    'Agency','Directorate','Secretariat','Office','Department',
    'Administration','Ministry','Committee','Panel','Taskforce',
    'Working Group','Forum','Chamber','Senate','Councilorate',
    'Advisory Board','Steering Committee','Management Board','Supervisory Board','Control Board',
    'Trust','Holding Company','Joint Authority','Joint Board','Joint Committee',
    'Joint Commission','Joint Council','Joint Taskforce','Joint Directorate','Joint Office',
    'Interstellar Council','Sector Council','Regional Council','Trade Council','Security Council',
    'Standards Council','Regulatory Board','Oversight Board','Review Board','Audit Board',
    'Alliance','Pact','Bloc','Confederation','Federation',
    'Compact Authority','Accord Council','Treaty Commission','Joint League','Coalition',
    'Network','Cluster','Axis','Circle','Order',
    'Guild','Chamber of Commerce','Trade Guild','Shipping Guild','Freeport Authority',
    'Registry','Registrar','Clearing House','Exchange','Market Board',
    'Rates Commission','Tariff Board','Licensing Office','Permits Bureau','Standards Institute',
    'Certification Board','Classification Society','Rating Agency','Credit Bureau','Compliance Office',
    'Oversight Authority','Ethics Commission','Safety Board','Security Office','Risk Council',
    'Planning Commission','Development Authority','Port Authority','Transit Authority','Station Authority',
    'Harbor Board','Dock Board','Terminal Authority','Zoning Commission','Infrastructure Board',
    'Colonial Office','Colonial Authority','Colonial Council','Frontier Commission','Frontier Authority',
    'Orbital Authority','Belt Authority','Rim Authority','Sector Authority','Systems Authority',
    'Research Council','Science Board','Technical Committee','Engineering Directorate','Standards Institute',
    'Innovation Forum','Advisory Council','Policy Board','Strategic Council','Operations Council',
    'Logistics Board','Resource Council','Energy Commission','Defense Directorate','Security Directorate',
    'Environmental Council','Safety Commission','Health Board','Welfare Board','Social Council',
    'Foundation Trust','Endowment Board','Grant Council','Scholarship Foundation','Institute of Trade',
    'Institute of Systems','Institute of Logistics','Institute of Commerce','Institute of Colonies','Academy',
    'Academy of Sciences','Academy of Navigation','College of Survey','School of Administration','School of Governance',
    'Center','Center for Systems','Center for Logistics','Center for Governance','Policy Center',
    'Syndicate Board','Syndicate Council','Consortium Board','Consortium Council','Consortium Office',
    'Corporate Union','Corporate League','Corporate Council','Corporate Board','Corporate Assembly',
    'Shareholders Council','Stakeholder Council','Partners Board','Executive Board','Executive Council',
    'Management Committee','Operations Committee','Strategy Committee','Risk Committee','Audit Committee'
  ],

  // ── Bar and establishment names ──────────
  establishment: [
    'The Cargo Hold', 'Last Shift', 'The Depot', 'The Anchor',
    'Dry Dock', 'The Forward Mess', 'Miner\'s Rest', 'The Gyre',
    'Transfer Lounge', 'The Narrows', 'Hel\'s Gate', 'The Drift',
    'Null Point', 'The Pale', 'Void & Sons',
    'The Bilge', 'Pressure Drop', 'The Airlock', 'Hard Vacuum', 'The Bends',
    'Decompression', 'The Overflow', 'Slag & Bone', 'The Residual',
    'Final Approach', 'The Docking Ring', 'Escape Velocity', 'The Black',
    'Perihelion', 'The Aphelion', 'Event Horizon', 'The Singularity',
    'Dark Matter', 'The Remnant', 'Last Contact', 'Signal Lost',
    'The Dead Drop', 'Cold Storage', 'The Manifest', 'Cargo Bay Nine',
    'The Long Watch','Grav Well','The Sump','Dockside',
    'The Scrapyard','The Gantry','Orbital Taproom','The Holding Tank',
    'Portside','The Spillway','The Yardarm','The Bulkhead',
    'Spill & Spark','The Rusted Valve','The Coil','The Spindle',
    'Slipstream','The Keelplate','The Lockout','The Spacer\'s Rest',
    'The Transit Bar','The Transfer Gate','Spacers\' Union','The Night Shift',
    'The Long Cycle','The Red Line','The Blue Shift','The Third Watch',
    'The Midshift','Graveyard Shift','The Slip','Dock Twelve',
    'The Outer Ring','Inner Ring Tap','The Last Berth','The Dented Hull',
    'The Rusted Anchor','The Broken Cleat','The Ballast','The Offload',
    'The Cargo Net','Crates & Casks','The Pallet','The Manifesto',
    'The Customs Bar','The Tariff House','The Waybill','The Ledger',
    'Tonnage & Taps','The Freight House','The Waystation',
    'The Staging Area','The Queue','The Turnaround','The Holding Pattern',
    'Final Call','Last Call Dock','The Layover','The Waiting Room',
    'The Gate Bar','Concourse Nine','Terminal Lounge','Gate Seventeen',
    'The Dock Rats','Spacers\' Mess','The Crew Deck','Deck Seven',
    'The Observation Lounge','The Cupola','The Porthole',
    'The Visual Port','The Beacon','The Signal Lamp',
    'Beacon & Barrel','The Far Beacon','The Range Light','Waymark',
    'The Fixed Star','Starboard','Port & Starboard','The Sail Locker',
    'The Chain Locker','The Dogwatch','The Midwatch',
    'The Fuel Line','The Oxidizer','The Injector','The Burn',
    'Ignition','The Reaction Mass','Delta‑V','The Maneuver Node',
    'Course Correction','The Transfer Window','Apogee Lounge',
    'Perigee Lounge','The Inclination','The Vector Bar',
    'The Stack','Stage & Barrel','Stage Separation','The Fairing',
    'The Payload Bay','The Gimbal','Roll & Pitch',
    'Dust & Echo','The Outer Marker','The Far Edge','The Periphery',
    'The Rimside','Belt Bar','The Belt Station','Rock & Rail',
    'Rockhoppers\' Rest','The Quarry','The Break Bulk',
    'The Loading Arm','The Cradle','The Crib','The Slip Rail',
    'The Yard Light','The Winch','Chain & Chock','Block & Tackle',
    'Hook & Line','The Tie‑Down','The Strake','The Sheath',
    'The Freeport','The Customs Seal','Bonded Hold',
    'The Ledger Line','The Clearing House','Credit & Cask',
    'The Margin Call','The Futures Bar','Spot & Forward',
    'The Exchange','The Tally','The Float','The Reserve',
    'The Dividend','The Warrant Room','The Covenant',
    'Claim & Title','Charter & Clause','Bill of Lading',
    'Stamp & Seal','The Notary','The Registry Bar','Dockmaster\'s Table',
    'Dark & Stormy','The Quiet Zone','The Buffer',
    'The Safe Margin','Soft Capture','Hard Capture',
    'Soft Dock','The Soft Seal','The Umbilical',
    'The Truss','Node & Nodule','The Hub','Spoke & Barrel',
    'The Crossbrace','Strut & Stave','The Frame','Rib & Beam',
    'The Lattice','The Array','Panel & Pint','The Radiator',
    'The Longshot','Escape Burn','Outbound','The Far Line',
    'Departure Lounge','The Manifold','Valve & Vent',
    'The Pressure Hull','The Skin','The Ringwall',
    'The Plating','Rivet & Resin','The Patch Job',
    'Sealant & Spirits','The Service Crawl','The Access Panel',
    'The Maintenance Bay','The Tool Crib','The Locker Room',
    'The Ready Room','The Briefing Room','The Green Line','Redshift'
  ]
};

// ============================================
//  The Naming Engine
//  Call these functions to generate names.
// ============================================

const Naming = {

  // Generate a full personal name
  // gender: 'masculine', 'feminine', or 'any'
  // withCallsign: true/false (only for spacers/military)
  person(rng, gender = 'any', withCallsign = false) {
    const g = gender === 'any'
      ? rng.pick(['masculine', 'feminine'])
      : gender;

    const firstName = g === 'masculine'
      ? rng.pick(NAMES.first_masculine)
      : rng.pick(NAMES.first_feminine);

    // 60% chance of compound surname, 40% generated
    let surname;
    if (rng.chance(0.6)) {
      surname = rng.pick(NAMES.surname_compound);
    } else {
      const root = rng.pick(NAMES.surname_root);
      const suffix = rng.chance(0.4)
        ? rng.pick(NAMES.surname_suffix)
        : '';
      surname = root + suffix;
    }

    // Callsign — only sometimes, only for certain types
    let callsign = '';
    if (withCallsign && rng.chance(0.3)) {
      callsign = ` "${rng.pick(NAMES.callsigns)}"`;
    }

    return `${firstName}${callsign} ${surname}`;
  },

  // Generate a star system name
  // era: 'ancient', 'transitional', 'modern'
  starSystem(rng, era = 'ancient') {
    if (era === 'ancient') {
      // Compound-epic: Ancient root + spatial descriptor
      const root = rng.pick(NAMES.ancient_root);
      const spatial = rng.pick(NAMES.spatial);
      return `${root} ${spatial}`;
    }

    if (era === 'transitional') {
      // Possessive: Surname + possession word
      const surname = rng.pick(NAMES.surname_compound);
      const possession = rng.pick(NAMES.possession);
      return `${surname}'s ${possession}`;
    }

    // Modern: Bureaucratic + number
    const prefix = rng.pick(NAMES.bureaucratic);
    const number = rng.int(2, 99);
    return `${prefix}-${number}`;
  },

  // Generate a station name
  station(rng, era = 'modern') {
    if (era === 'ancient') {
      const root = rng.pick(NAMES.ancient_root);
      const spatial = rng.pick(['Relay', 'Station', 'Anchorage',
                                 'Platform', 'Array', 'Null']);
      return `${root} ${spatial}`;
    }

    if (era === 'transitional') {
      const surname = rng.pick(NAMES.surname_compound);
      const type = rng.pick(['Dock', 'Station', 'Port',
                               'Depot', 'Anchorage']);
      return `${surname} ${type}`;
    }

    // Modern: Bureaucratic numbered
    const prefix = rng.pick(NAMES.bureaucratic);
    const number = rng.int(2, 99);
    return `${prefix} ${number}`;
  },

  // Generate a ship name
  // register: 'personal','aspiration','function','endurance','military'
  ship(rng, register = null) {
    // If no register specified, pick one with weights
    const reg = register || rng.weighted(
      ['personal', 'aspiration', 'function', 'endurance', 'military'],
      [20, 25, 25, 20, 10]
    );

    if (reg === 'personal') {
      // A full human name — named after someone
      return Naming.person(rng, 'any', false);
    }

    if (reg === 'aspiration') {
      const surname = rng.pick(NAMES.surname_compound);
      const word = rng.pick(NAMES.ship_aspiration);
      return rng.chance(0.5)
        ? `${surname}'s ${word}`
        : `${surname} ${word}`;
    }

    if (reg === 'function') {
      const base = rng.pick(NAMES.ship_function);
      const number = rng.chance(0.4) ? ` ${rng.int(2, 99)}` : '';
      return `${base}${number}`;
    }

    if (reg === 'endurance') {
      const adj = rng.pick(NAMES.ship_endurance);
      const noun = rng.pick(NAMES.ship_endurance_noun);
      return `${adj} ${noun}`;
    }

    if (reg === 'military') {
      const prefix = rng.pick(NAMES.ship_prefix);
      const virtue = rng.pick(NAMES.ship_virtue);
      return `${prefix} ${virtue}`;
    }
  },

  // Generate a corporation name
  // archetype: 'family' or 'institutional'
  corporation(rng, archetype = null) {
    const arch = archetype || rng.pick(['family', 'institutional']);

    if (arch === 'family') {
      const surname = rng.pick(NAMES.surname_compound);
      const industry = rng.pick(NAMES.corp_industry);
      return `${surname} ${industry}`;
    }

    // Institutional
    const scope = rng.pick(NAMES.corp_scope);
    const domain = rng.pick(NAMES.corp_domain);
    const authority = rng.pick(NAMES.corp_authority);
    return `${scope} ${domain} ${authority}`;
  },

  // Generate a harsh frontier world name
  harshWorld(rng) {
    const condition = rng.pick(NAMES.harsh_condition);
    const geo = rng.pick(NAMES.harsh_geo);
    return `${condition} ${geo}`;
  },

  // Generate a bar or establishment name
  establishment(rng) {
    return rng.pick(NAMES.establishment);
  }

};
