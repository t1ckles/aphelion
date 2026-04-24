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

    // ── Quadrant names ───────────────────────
  quadrant_names: [
    // Guild cartographic designations
    'Solace Reach',       'The Ashward',          'Crucible Expanse',     'Void Margin',
    'Keth Basin',         'The Pale Fringe',       'Sunken Arc',           'Drift Terminus',
    'The Ironveil',       'Cinder Margin',         'Null Approach',        'The Bleakward',
    'Ossian Deep',        'Vael Corridor',         'The Shattered Fringe', 'Dross Expanse',
    'Thal Remnant',       'The Gyre Passage',      'Erebus Reach',         'Solen Threshold',
    'Narr Corridor',      'Caern Margin',          'The Ulvar Fringe',     'Sheth Expanse',
    'Morval Basin',       'Pelian Reach',          'The Ardis Veil',       'Brenn Threshold',
    'Calyx Approach',     'The Davan Margin',      'Elvar Passage',        'Fhoss Deep',
    'The Greth Corridor', 'Havan Reach',           'Ireth Fringe',         'Jorvak Basin',
    'The Kaeln Expanse',  'Lorit Margin',          'Mavan Passage',        'Nessik Threshold',
    'The Orvak Veil',     'Preth Approach',        'Queln Corridor',       'Ravet Reach',
    'The Sovak Deep',     'Taliss Fringe',         'Uvet Margin',          'Vandis Expanse',
    'The Wethis Basin',   'Xaeln Passage',         'The Yovak Threshold',  'Zethis Veil',
    'The Akseth Approach','Balet Corridor',        'Cresit Reach',         'The Delvak Fringe',
    'Veth Corridor',        'The Ossik Reach',        'Draven Threshold',      'Null Basin',
    'The Kelvak Fringe',    'Solus Margin',            'Aethon Passage',        'The Brone Deep',
    'Cael Expanse',         'The Irven Veil',          'Drossik Reach',         'Thalen Corridor',
    'The Ulveth Basin',     'Shalen Fringe',            'Gyron Margin',          'Vexar Threshold',
    'The Narith Deep',      'Caeron Passage',           'Ossian Veil',           'The Keln Approach',
    'Elveth Reach',         'The Morvak Corridor',      'Brethis Basin',         'Caleth Fringe',
    'The Drossian Margin',  'Soveth Passage',           'Talvak Threshold',      'The Uveth Deep',
    'Vandris Corridor',     'The Wethik Reach',         'Xaelneth Fringe',       'Yoval Basin',
    'The Zethik Approach',  'Aksoval Margin',           'Baleth Passage',        'The Cresith Veil',
    'Delvik Corridor',      'The Forvak Deep',          'Grethis Reach',         'Haveneth Fringe',
    'The Irevak Threshold', 'Jorveth Basin',            'Kaelneth Margin',       'The Lorvak Passage',
    'Maveth Corridor',      'The Nessith Reach',        'Orvalis Fringe',        'Prethik Deep',
    'The Quelnis Veil',     'Raveth Approach',          'The Sovak Margin',      'Talissen Corridor',
    'Uveron Passage',       'The Vandrik Threshold',    'Wethalis Basin',        'Xaelnith Reach',
    'The Yoveth Fringe',    'Zethalis Margin',          'Aksethen Arc',          'The Balethen Deep',
    'Cresiven Corridor',    'The Delvaris Passage',     'Forveth Basin',         'Grethalis Reach',
    'The Havenis Veil',     'Ireveth Fringe',           'Jorvaken Threshold',    'The Kaelnis Margin',
    'Loriven Approach',     'Mavalis Deep',             'The Nessikar Corridor', 'Orvaleth Passage',
    'Prethalis Basin',
    // Corporate administrative designations
    'Pelk Administrative Sector', 'Korveth Margin',          'The Reclamation Corridor',
    'Free Zone Epsilon',          'CCC Exclusion Sector',    'The Contested Passage',
    'Guild Survey District',      'Pelk Transit Zone',       'The Korvak Concession',
    'Colonial Mandate Seven',     'The Free Corridor',       'Voss Extraction Zone',
    'Hessen Administrative Reach','The Drade Concession',    'Pelk Outer Zone',
    'CCC Forward Sector',         'The Marek Margin',        'Guild Annex Fourteen',
    'The Brennan Corridor',       'Colonial Exclusion Zone', 'Voss Administrative Deep',
    'The Alcott Passage',         'Pelk Reclamation Sector', 'The Garrick Margin',
    'CCC Abandoned Sector',       'Free Zone Theta',         'The Contested Deep',
    'Guild Forward Survey',       'The Korveth Concession',  'Colonial Remnant Zone',
    'Pelk Outer Concession',       'The Voss Margin',              'CCC Remnant Sector',
    'Free Zone Kappa',             'Guild Annex Seven',            'The Brennan Extraction Zone',
    'Colonial Mandate Twelve',     'Pelk Transit Deep',            'The Alcott Concession',
    'CCC Forward Annex',           'The Garrick Extraction Zone',  'Voss Reclamation Corridor',
    'Hessen Outer Reach',          'The Drade Administrative Zone', 'Pelk Concession Nine',
    'CCC Contested Annex',         'The Marek Extraction Sector',  'Guild Survey Annex Three',
    'The Korvak Administrative',   'Colonial Forward Zone',        'Voss Outer Sector',
    'The Alcott Margin',           'Pelk Reclamation Deep',        'CCC Exclusion Annex',
    'Free Zone Lambda',            'The Brennan Administrative',   'Guild Annex Nineteen',
    'Colonial Mandate Three',      'The Garrick Corridor',         'Voss Transit Zone',
    'Hessen Reclamation Sector',   'The Drade Outer Margin',       'Pelk Administrative Deep',
    'CCC Forward Concession',      'The Marek Administrative',     'Guild Forward Annex',
    'The Korvak Extraction Zone',  'Colonial Remnant Sector',      'Voss Abandoned Deep',
    'Free Zone Omicron',           'The Brennan Outer Zone',       'Guild Annex Twenty-Two',
    'Colonial Mandate Nine',       'The Garrick Deep',             'Pelk Concession Fourteen',
    'CCC Reclamation Annex',       'The Marek Outer Corridor',     'Hessen Concession Zone',
    'The Alcott Administrative',   'Voss Forward Sector',          'Free Zone Sigma',
    'The Drade Extraction Annex',  'Guild Survey District Four',   'CCC Abandoned Annex',
    'Colonial Forward Concession', 'The Brennan Reclamation',      'Pelk Outer Administrative',
    'The Korvak Forward Sector',   'Voss Reclamation Deep',        'Hessen Extraction Annex',
    'Free Zone Delta',             'The Garrick Administrative',   'Guild Annex Thirty-One',
    'Colonial Mandate Fifteen',    'CCC Transit Zone',             'The Marek Reclamation',
    'Pelk Forward Concession',     'The Alcott Extraction Zone',   'Voss Administrative Corridor',
    'Hessen Forward Sector',       'The Drade Reclamation Annex',  'Guild Survey District Nine',
    'CCC Outer Administrative',    'Free Zone Tau',                'The Brennan Deep',
  ],

  // ── Fold corridor flavor ─────────────────
  fold_signatures: [
    'Fold signature detected — no astrographic data on file.',
    'Corridor signature present — destination uncharted.',
    'Veydric resonance detected — no Guild record found.',
    'Fold geometry signature acquired — destination unknown.',
    'Corridor present — no data. Proceed at risk.',
    'Resonance echo detected — uncharted space beyond.',
    'Fold signature on record — destination not in Guild network.',
    'Veydric trace detected — no astrographic survey on file.',
  ],

  // ── Fold sequence flavor lines ───────────
  fold_sequence: [
    'Spacetime compression: initializing',
    'Veydric resonance frequency: locking',
    'Fold tensor alignment: in progress',
    'Spacetime compression: nominal',
    'Corridor geometry: calculating',
    'Fold geometry: resolving',
    'Corridor signature: acquiring',
    'Tensor alignment: holding',
    'Veydric resonance: building',
    'Fold geometry: resolving',
    'Spacetime compression: critical',
    'Resonance lock: confirming',
    'Fold geometry: locked',
    'Drive housing: sealed',
    'Resonance chamber: pressurizing',
    'Fold cell: combusting',
    'Veydric matrix: expanding',
    'Corridor mouth: opening',
    'Spacetime membrane: thinning',
    'Transit window: opening',
    'Veydric field density: nominal',
    'Corridor approach vector: calculating',
    'Fold membrane: initializing',
    'Resonance cascade: building',
    'Spacetime fold: acquiring',
    'Drive coil temperature: rising',
    'Veydric matrix: aligning',
    'Corridor lock: in progress',
    'Fold tensor: stabilizing',
    'Transit geometry: resolving',
    'Resonance frequency: holding',
    'Spacetime gradient: nominal',
    'Corridor mouth: acquiring',
    'Drive housing pressure: rising',
    'Veydric burn rate: nominal',
    'Fold geometry: confirmed',
    'Spacetime density: shifting',
    'Corridor signature: holding',
    'Transit window: calculating',
    'Resonance chamber: sealed',
    'Fold cell oxidation: initiated',
    'Veydric cascade: expanding',
    'Spacetime membrane: responding',
    'Corridor approach: locked',
    'Drive coil: at threshold',
    'Fold tensor: locked',
    'Resonance peak: imminent',
    'Spacetime compression: deepening',
    'Veydric field: at maximum',
    'Corridor geometry: confirmed',
    'Transit aperture: widening',
    'Drive housing: nominal',
    'Fold membrane: thinning',
    'Resonance harmonic: locking',
    'Spacetime fold: deepening',
    'Corridor pressure: building',
    'Veydric matrix: saturating',
    'Fold geometry: final pass',
    'Transit window: confirmed',
    'Resonance lock: holding',
    'Spacetime density: critical',
    'Corridor mouth: dilating',
    'Drive coil discharge: imminent',
    'Fold cell: peak combustion',
    'Veydric resonance: peak',
    'Spacetime membrane: breaching',
    'Corridor aperture: open',
    'Transit geometry: locked',
    'Resonance cascade: complete',
    'Fold initiation: committed',
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
    'Burnt','Charred','Scorched','Blasted','Shattered','Splintered','Fractured','Riven','Sundered','Blighted','Withered','Wasted',
    'Spent','Stripped','Scoured','Flayed','Gutted','Hewn','Pitted','Gouged','Gored','Cleaved','Severed','Cleft','Split','Gnawed','Eroded',
    'Leached','Bleached','Faded','Dimmed','Dulled','Husked','Hollowed','Cored','Drained','Bled','Parched','Starved','Frozen','Calcined',
    'Vitrified','Ossified','Petrified','Hardened','Crusted','Scaled','Scabbed','Pocked','Cratered','Riddled','Pocked','Warped','Twisted',
    'Bent','Buckled','Staved','Sunken','Collapsed','Fallen','Ruined','Razed','Levelled','Scoured','Salted','Poisoned','Tainted','Cursed',
    'Forsaken','Abandoned','Forgotten','Erased','Unmarked','Unnamed','Silent','Airless','Lightless','Heatless','Lifeless','Joyless',
    'Graceless','Merciless','Restless','Endless','Boundless','Fathomless','Measureless','Trackless','Pathless','Rootless','Anchorless',
  ],

  harsh_geo: [
    // Terrain and void features
    'Belt','Rock','Reach','Field','Veil','Shore','Drift','Yard','Ridge','Shelf',
    'Basin','Flats','Point','Deep','Run','Waste','Hollow','Cut','Gap','Pass',
    'Sink','Pit','Maw','Throat','Edge','Rim','Wall','Floor','Breach','Fracture',
    'Seam','Vein','Shaft','Trench','Canyon','Gulch','Gorge','Chasm','Spine','Spur',
    'Rise','Drop','Scar','Fold','Bend','Span','Cross','Channel','Course','Drain',

    // Guild cartographic suffixes
    'Fault','Rift','Cleft','Divide','Parting','Cutline','Breakline','Faultline',
    'Riftline','Ridgeline','Driftline','Trackway','Shoreline','Basinway','Passway',

    // Compound place-names — Guild survey notation
    'Dustbelt','Ironbelt','Ashbelt','Cinderbelt','Voidbelt','Nullbelt',
    'Ashfield','Ironfield','Dustfield','Voidfield','Cinderfield','Nullfield',
    'Ashreach','Ironreach','Voidreach','Dustreach','Cinderreach','Nullreach',
    'Boneyard','Ironyard','Ashyard','Dustyard','Cinderyard','Graveyard',
    'Ashridge','Ironridge','Blackridge','Cinderridge','Voidridge','Coldridge',
    'Ashpit','Ironpit','Blackpit','Dustpit','Voidpit','Nullpit',
    'Ashhollow','Bonehollow','Dusthollow','Ironhollow','Voidhollow','Coldhollow',
    'Ironwall','Ashwall','Dustwall','Rimwall','Voidwall','Cinderwall',
    'Ironvein','Ashvein','Dustvein','Blackvein','Cindervein','Nullvein',
    'Ashbasin','Ironbasin','Dustbasin','Drybasin','Voidbasin','Coldbasin',
    'Ashflats','Ironflats','Saltflats','Dustflats','Voidflats','Cinderflats',
    'Ashtrench','Irontrench','Dusttrench','Voidtrench','Cindertrench','Nulltrench',
    'Ashchasm','Ironchasm','Dustchasm','Blackchasm','Voidchasm','Coldchasm',

    // Pilot slang — what contractors actually call places
    'Deadrun','Coldrun','Darkrun','Longrun','Farrun','Deeprun',
    'Lowpass','Highpass','Backpass','Throughpass','Coldpass','Darkpass',
    'Widereach','Farreach','Deepreach','Longreach','Coldreach','Darkreach',
    'Brokenridge','Splitridge','Coldridge','Jaggedridge','Scarredridge','Wornridge',
    'Widefield','Openfield','Deadfield','Greyfield','Blackfield','Coldfield',
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
    // Primary location types — what a place actually is
    'World','Station','Belt','Claim','Rock','Drift','Landing','Hold','Point','Rest',
    'Watch','Gate','Run','Post','Field','Yard','Pit','Well','Shelf','Ridge',
    'Basin','Flats','Shore','Edge','Keep','Chart','Arc','Span','Pass','Anchor',
    'Berth','Relay','Beacon','Outpost','Sector','Deep','Seam','Vein','Shaft','Trench',
    'Rift','Fault','Rise','Rim','Fork','Crossing','Circuit','Node','Link','Bridge',

    // Compound location names — Guild survey and pilot usage
    'Ironhold','Ashhold','Dusthold','Voidhold','Cinderhold','Nullhold','Coldhold','Blackhold',
    'Ironkeep','Ashkeep','Dustkeep','Voidkeep','Cinderkeep','Nullkeep','Coldkeep','Blackkeep',
    'Nullpoint','Voidpoint','Ashpoint','Ironpoint','Dustpoint','Cinderpoint','Coldpoint','Blackpoint',
    'Nullgate','Voidgate','Ashgate','Irongate','Dustgate','Cindergate','Coldgate','Blackgate',
    'Deepwell','Ashwell','Ironwell','Dustwell','Voidwell','Nullwell','Drywell','Coldwell',
    'Longrun','Deeprun','Ashrun','Ironrun','Dustrun','Voidrun','Dryrun','Coldrun',
    'Farreach','Longreach','Deepreach','Ashreach','Ironreach','Dustreach','Dryreach','Coldreach',
    'Lastwatch','Longwatch','Deepwatch','Ashwatch','Ironwatch','Dustwatch','Drywatch','Coldwatch',
    'Gatewatch','Edgewatch','Ridgewatch','Shorewatch','Fieldwatch','Driftwatch','Claimwatch','Beltwatch',
    'Gatepost','Edgepost','Ridgepost','Shorepost','Fieldpost','Driftpost','Claimpost','Beltpost',
    'Ridgeline','Shoreline','Faultline','Riftline','Driftline','Cutline','Breakline','Trackline',
    'Ridgeway','Shoreway','Edgeway','Driftway','Fieldway','Gateway','Claimway','Beltway',
    'Highgate','Lowgate','Frontgate','Backgate','Crossgate','Innergate','Outergate','Oldgate',
  ],

  // ── Bureaucratic prefixes ────────────────
  bureaucratic: [
    // What a place actually is — primary designations
    'Transfer','Outpost','Relay','Station','Depot','Freeport','Platform','Node',
    'Waypoint','Terminal','Junction','Hub','Post','Base','Installation','Facility',
    'Anchorage','Berth','Dock','Annex','Sector','District','Zone','Complex',
    'Compound','Substation','Branch','Division','Bureau','Directorate','Control',
    'Command','Registry','Archive','Array','Gateway','Switch','Beacon','Survey',

    // Compound designations — Guild and corporate usage
    'Transfer Point','Transfer Hub','Transit Hub','Cargo Post','Cargo Node',
    'Logistics Base','Customs Post','Inspection Point','Control Point',
    'Operations Base','Operations Center','Support Base','Support Post',
    'Supply Depot','Distribution Node','Freight Yard','Signal Post',
    'Beacon Station','Monitoring Post','Tracking Station','Survey Station',
    'Administrative Hub','Records Office','Permit Office','Licensing Post',
    'Command Post','Forward Base','Staging Post','Marshalling Yard',
    'Assembly Yard','Processing Yard','Holding Yard','Docking Ring',
    'Docking Bay','Mooring Point','Anchorage Ring','Gatehouse',

    // Feral and independent equivalents — what non-Guild places call themselves
    'The Nail','The Hook','The Hulk','The Anchor','The Pit','The Rack',
    'The Sump','The Catch','The Hold','The Notch','The Crimp','The Latch',
  ],

  // ── Ship name components ─────────────────
  ship_aspiration: [
    // What a ship reaches toward — single words
    'Pride','Horizon','Reach','Promise','Fortune','Hope','Venture','Dawn','Claim',
    'Glory','Dream','Ascent','Ambition','Resolve','Purpose','Compass','Course',
    'Vision','Prospect','Chance','Gamble','Pursuit','Quest','Arc','Heading',
    'Voyage','Advance','Drive','Endeavor','Will','Spirit','Courage','Honor',
    'Legacy','Patience','Perseverance','Spark','Beacon','Standard','Mandate',
    'Covenant','Bond','Summit','Threshold','Genesis','Impulse','Lift','Surge',
    'Longview','Farview','Spire','Radiance','Gleam','Lodestar','Polestar',
    'Waymark','Freehold','Patent','Warrant','Oath','Vow','Assurance','Anchor',

    // Two-word ship names — what contractors actually name their vessels
    'True North','Steady Course','Signal Fire','Guide Star','Compass Rose',
    'First Light','Far Reach','Long Claim','Open Horizon','Last Promise',
    'Deep Venture','Cold Resolve','Dark Ambition','Pale Fortune','Iron Will',
    'Quiet Courage','Still Hope','Free Passage','Hard Ascent','Fair Charter',
  ],

  ship_endurance: [
    // Single-word prefixes — what hard ships are called
    'Bitter','Iron','Broken','Last','Far','Dead','Heavy','Dark','Long','Cold',
    'Hard','Dry','Slow','Deep','Lost','Old','Worn','Pale','Hollow','Silent',
    'Spent','Scarred','Rough','Harsh','Lean','Bare','Raw','Grey','Bleak',
    'Black','Grim','Null','Void','Dust','Rust','Slag','Burnt','Cracked',
    'Weathered','Pitted','Warped','Torn','Ragged','Beaten','Driven','Bled',
    'Bound','Anchored','Stubborn','Dogged','Grinding','Straining','Loaded',

    // Compound prefixes — two words that feel earned
    'Hard Won','Long Run','Deep Watch','Far Bound','Last Light',
    'Dead Slow','Dead Still','Dead Quiet','Iron Worn','Salt Burnt',
    'Void Still','Grey Worn','Dust Choked','Salt Bitten','Far Flung',
    'Long Haul','Dead Cold','Hard Kept','Far Cast','Last Watch',
  ],

  ship_endurance_noun: [
    // What the journey actually is
    'End','Run','Watch','Trade','Passage','Crossing','Mile','Haul','Shift','Burn',
    'Road','March','Pull','Drag','Grind','Stretch','Leg','Turn','Lap','Circuit',
    'Loop','Track','Course','Transit','Traverse','Route','Trail','Span','Chain',
    'Relay','Duty','Stint','Tour','Vigil','Hold','Stand','Carry','Lift','Tow',
    'Heave','Burden','Freight','Advance','Stage','Phase','Segment','Orbit',

    // Two-word ship name completions — earned, not generated
    'First Leg','Last Leg','Long Leg','Deep Leg','Far Leg',
    'Anchor Watch','Graveyard Watch','Longwatch','Last Watch','Deep Watch',
    'Last Mile','Dead Mile','Long Mile','Cold Mile','Grey Mile',
    'End Run','Last Run','Long Run','Dead Run','Cold Run',
    'Long Haul','Dead Haul','Last Haul','Cold Haul','Hard Haul',
    'First Watch','Last Watch','Quiet Watch','Drift Watch','Edge Watch',
    'Long March','Last March','Dead March','Cold March','Hard March',
    'Dead End','Last End','Cold End','Hard End','Long End',
  ],

  ship_function: [
    // What the ship actually does — good as-is
    'Long Haul','Last Shift','Deep Trade','Station Runner','Far Burn',
    'Ore Runner','Void Passage','Rim Run','Dust Carrier','Dark Transit',
    'Cold Passage','Iron Crossing','Lost Mile','Silent Haul','Pale Runner',
    'Hollow Watch','Dead Stretch','Worn Road','Hard Grind','Outer Haul',
    'Border Run','Belt Trade','Slip Runner','Freeport Carrier','Sump Drifter',
    'Fuel Ferry','Bulk Runner','Short Hop','Far Relay','Hub Link',
    'Spine Line','Deep Relay','Quiet Trade','Circuit Haul','Station Link',
    'Anchor Run','Freight Passage','Duty Run','Ore Lift','Rock Train',
    'Slag Carrier','Scrap Tow','Dock Shuttle','Yard Mule','Port Runner',
    'Loop Runner','Ring Courier','Gate Runner','Reach Runner','Cold Chain',
    'Slow Line','Dead Run','Dust Run','Void Relay','Mail Run',
    'Packet Runner','Courier Run','Survey Runner','Beacon Runner','Chart Vessel',
    'Pioneer Line','Frontier Run','Rim Carrier','Supply Line','Relief Run',
    'Support Train','Advance Haul','Backfield Haul','Hinter Haul','Grain Haul',
  ],

  ship_prefix: [
    // Assayer's Guild registry prefixes
    'GDV',   // Guild Deep Vessel
    'GSV',   // Guild Survey Vessel
    'GRV',   // Guild Registry Vessel
    'GAV',   // Guild Assay Vessel
    'GCV',   // Guild Contracted Vessel
    'GFV',   // Guild Forward Vessel

    // Pelk Logistics prefixes
    'PLV',   // Pelk Logistics Vessel
    'PFV',   // Pelk Freight Vessel
    'PTV',   // Pelk Transit Vessel
    'PCF',   // Pelk Cargo Freighter
    'PRV',   // Pelk Relay Vessel

    // Colonial Colonies Command prefixes
    'CCV',   // Colonial Command Vessel
    'CMV',   // Colonial Military Vessel
    'CPV',   // Colonial Patrol Vessel
    'CFV',   // Colonial Forward Vessel
    'CTV',   // Colonial Transport Vessel

    // Independent and feral prefixes
    'ICV',   // Independent Contracted Vessel
    'IFV',   // Independent Free Vessel
    'IRV',   // Independent Registry Vessel
    'FRV',   // Feral Registry Vessel — rare, usually self-assigned
    'FSV',   // Feral Survey Vessel — mostly aspirational

    // Vessel class prefixes — cross-faction, based on what the ship is
    'DSV',   // Deep Survey Vessel
    'LSV',   // Light Survey Vessel — the player's class
    'MSV',   // Medium Survey Vessel
    'DFV',   // Deep Freight Vessel
    'LFV',   // Light Freighter Vessel
    'HFV',   // Heavy Freighter Vessel
    'SRV',   // Salvage Recovery Vessel
    'MRV',   // Mining Recovery Vessel
    'ORV',   // Ore Recovery Vessel
    'RCV',   // Reclamation Vessel
    'ACV',   // Armored Cargo Vessel
    'CSV',   // Combat Survey Vessel
    'ESV',   // Expeditionary Survey Vessel
    'RSV',   // Relay Station Vessel
    'OSV',   // Orbital Survey Vessel
    'BFV',   // Bulk Freighter Vessel
    'TCV',   // Transit Cargo Vessel
    'FCV',   // Fold Capable Vessel — prestigious designation
    'RAS',   // Registered Assay Ship — Guild premium designation
    'VHI',   // Veydrite Handling Installation — stationary or slow-moving
  ],

  ship_virtue: [
    // The classics — single word, full weight
    'Resolute','Dominion','Integrity','Vanguard','Endurance',
    'Steadfast','Reckoning','Vigilant','Relentless','Warrant',
    'Perseverance','Conviction','Defiance','Patience','Tenacity',
    'Forbearance','Constancy','Fortitude','Diligence','Temperance',

    // Single-word virtues — strong ship names
    'Fidelity','Honor','Courage','Valor','Discipline','Duty',
    'Mandate','Purpose','Guidance','Justice','Clemency','Caution',
    'Resolve','Accord','Covenant','Oath','Bond','Trust','Credit',
    'Merit','Bearing','Anchor','Bulwark','Bastion','Sentinel',
    'Guardian','Custodian','Haven','Refuge','Beacon','Charter',
    'Surety','Compact','Pact','Guarantee','Fidelity','Loyalty',
    'Service','Vocation','Calling','Outlook','Horizon','Watch',
    'Equity','Balance','Measure','Caution','Assurance','Promise',
    'Reliance','Standing','Esteem','Stature','Repute','Foundation',
    'Keystone','Cornerstone','Rampart','Harbor','Guide','Signal',

    // Two-word virtue names — what contractors name ships they trust
    'Steady Hand','Kept Oath','Kept Word','Good Faith','Due Diligence',
    'Quiet Resolve','Calm Watch','Long Patience','Firm Purpose','Even Hand',
    'Open Hand','Ready Hand','Good Service','Plain Dealing','Straight Course',
    'True Bearing','Sure Star','True Star','Guiding Star','Clear Sign',
    'Just Intent','Right Measure','Free Passage','Common Cause','Common Trust',
    'Public Faith','Steady Course','Due Course','Fair Dealing','Civic Duty',
    'Earnest Hand','Faithful Watch','Loyal Service','Bound Oath','Just Measure',

    // Single-word virtues — harder, more Aphelion-appropriate
    'Clarity','Candor','Sincerity','Probity','Rectitude',
    'Temperance','Moderation','Prudence','Sagacity','Discernment',
    'Acuity','Vigilance','Wariness','Scrutiny','Exactitude',
    'Precision','Thoroughness','Soundness','Reliability','Steadiness',
    'Persistence','Consistency','Continuity','Coherence','Cohesion',
    'Unity','Solidarity','Fellowship','Fraternity','Kinship',
    'Custodianship','Stewardship','Trusteeship','Wardenship','Keepership',
    'Deliverance','Redemption','Absolution','Restitution','Reparation',
    'Restoration','Preservation','Conservation','Sustainment','Maintenance',
  ],

  // ── Corp name components ─────────────────
  corp_industry: [
    // Primary designators — what a corp calls itself
    'Mercantile','Industries','Logistics','Combine','Resources','Holdings',
    'Colonial','Extraction','Transit','Arms','Heavy','Salvage','Reclamation',
    'Prospecting','Futures','Capital','Freight','Supply','Services','Group',
    'Consortium','Syndicate','Conglomerate','Alliance','Cartel','Trust',
    'Corporation','Enterprises','Partners','Ventures','Systems','Dynamics',
    'Operations','Development','Mining','Fabrication','Processing','Refining',
    'Manufacturing','Construction','Shipyards','Shipworks','Yards','Facilities',
    'Transport','Haulage','Brokerage','Distribution','Energy','Generation',
    'Survey','Exploration','Astrometrics','Charting','Telemetry','Analytics',
    'Maintenance','Sustainment','Overhaul','Refit','Authority','Exchange',
    'Aggregate','Bureau','Collective','Compact','Directorate','Division',
    'Foundation','Institute','League','Office','Registry','Secretariat',
    'Concern','Clearing','Custody','Depot','Works','Network','Platform',
    'Procurement','Provision','Reclamation','Retention','Settlement','Station',
    'Stockade','Tonnage','Underwriting','Valuation','Warehousing','Yield',

    // Two-word designators — corporate compound naming
    'Deep Survey','Heavy Works','Deepworks','Orbital Works','Bulk Freight',
    'Freight Lines','Cargo Systems','Supply Chain','Cold Chain','Port Services',
    'Terminal Services','Power Systems','Fuel Systems','Fuel Services',
    'Energy Holdings','Life Support','Habitat Systems','Colonial Holdings',
    'Colonial Supply','Colonial Logistics','Colonial Development','Frontier Holdings',
    'Frontier Ventures','Belt Holdings','Belt Mining','Outer Systems','Rim Systems',
    'Capital Group','Capital Partners','Capital Holdings','Asset Management',
    'Risk Management','Survey Guild','Prospecting Guild','Transit Union',
    'Shipping Cooperative','Freeport Authority','Zone Authority','Field Services',
    'Repair Yards','Service Yards','Dockyard Services','Orbital Services',
    'Station Services','Port Authority','Mercantile Trust','Trade Alliance',
    'Transit Consortium','Logistics Group','Resource Consortium','Freight Union',
    'Industrial Group','Carriers Association','Deep Extraction','Rim Logistics',
    'Void Transit','Belt Resources','Colonial Freight','Frontier Mining',
    'Outer Holdings','Dark Logistics','Cold Storage','Bulk Handling',
    'Deep Salvage','Ore Processing','Hull Works','Drive Systems','Cell Works',
    'Fold Transit','Survey Corps','Mapping Group','Signal Works','Relay Services',
    'Beacon Systems','Corridor Authority','Fold Authority','Guild Registry','Scrip Exchange',
    'Debt Recovery','Cargo Recovery','Wreck Salvage','Field Extraction','Heavy Lift',
    'Cold Logistics','Null Transit','Ash Recovery','Iron Works','Slag Processing',
    'Dust Extraction','Void Salvage','Rim Authority','Outer Authority','Belt Authority',
    'Free Transit','Open Freight','Common Carrier','Shared Logistics','Joint Venture',
    'Combined Arms','Combined Holdings','Combined Resources','Deep Holdings','Far Holdings',
  ],

  corp_scope: [
    // Geographic and political scope
    'United','Inner','Outer','Free','Colonial','Expeditionary','Reclamation',
    'Joint','Combined','Allied','Consolidated','Integrated','Associated',
    'Federated','Unified','Independent','Sovereign','Collective','Cooperative',
    'Mutual','Central','Regional','Frontier','Interstellar','Intersector',
    'Planetary','Orbital','Belt','Rim','Core','Periphery','Border','Corridor',
    'Gateway','Cluster','General','Common','Public','Chartered','Mandated',
    'Contested','Declining','Collapsed','Isolated','Established','Forbidden',
    'Feral','Dark','Cold','Void','Null','Deep','Far','Open','Closed','Hard',

    // Organizational scope
    'Primary','Principal','Strategic','Auxiliary','Parallel','Distributed',
    'Pioneer','Heritage','Flagship','Legacy','Successor','Founding','Anchor',
    'Mainline','Frontline','Baseline','Keystone','Cornerstone','Remnant',
    'Interim','Provisional','Emergency','Standing','Permanent','Temporary',
    'Forward','Rear','Lateral','Extended','Limited','General','Special',

    // Two-word scope descriptors
    'Inner Systems','Outer Systems','Colonial Systems','Frontier Systems',
    'Rim Systems','Free Zone','Open Corridor','Common Reach','Joint Venture',
    'Combined Arms','United Front','Allied Holdings','Deep Frontier',
    'Far Rim','Outer Belt','Inner Belt','Cold Frontier','Dark Periphery',
    'Void Rim','Free Corridor','Open Registry','Common Charter','Mutual Hold',
    'Deep Rim','Far Belt','Null Zone','Void Zone','Cold Periphery',
    'Dark Frontier','Far Frontier','Open Belt','Free Belt','Common Belt',
    'Joint Holdings','Allied Systems','United Holdings','Combined Systems',
    'Federated Holdings','Consolidated Rim','Integrated Belt','Associated Frontier',
    'Sovereign Reach','Independent Zone','Collective Frontier','Cooperative Belt',
    'Central Systems','Regional Holdings','Sector Holdings','Border Systems',
    'Gateway Systems','Cluster Holdings','Pioneer Systems','Heritage Holdings',
    'Legacy Systems','Successor Holdings','Forward Systems','Contested Reach',
    'Declining Zone','Isolated Sector','Established Reach','Collapsed Zone',
    'Feral Territory','Dark Corridor','Cold Reach','Void Sector','Null Reach',
    'Deep Sector','Far Sector','Hard Frontier','Open Reach','Closed Zone',
  ],
  corp_domain: [
    // What a corp actually does in Aphelion's universe
    'Systems','Traders','Colonies','Commerce','Resource','Transit',
    'Defense','Operations','Frontier','Orbital','Planetary','Stellar',
    'Interstellar','Regional','Logistics','Freight','Shipping','Transport',
    'Haulage','Distribution','Warehousing','Terminals','Ports','Dockyards',
    'Shipyards','Shipwrights','Aerospace','Navigation','Astrometrics','Survey',
    'Exploration','Cartography','Mining','Extraction','Refining','Processing',
    'Manufacturing','Fabrication','Construction','Infrastructure','Energy',
    'Power','Fuel','Life Support','Habitats','Mercantile','Trading',
    'Exchanges','Brokerage','Finance','Capital','Credit','Holdings',
    'Ventures','Trust','Consortium','Syndicate','Alliance','Security',
    'Intelligence','Surveillance','Analytics','Networks','Communications',
    'Telemetry','Signal','Relay','Platforms','Stations','Installations',
    'Foundries','Materials','Alloys','Structures','Mechanicals','Maintenance',
    'Overhaul','Repair','Colonial Affairs','Protective Services',
    'Procurement','Provisioning','Reclamation','Recovery','Clearance',
    'Armaments','Munitions','Ordnance','Ballistics','Hardwares',
    'Compounds','Reagents','Feedstock','Bulk Goods','Dry Goods',
    'Cold Goods','Hazardous','Classified','Restricted','Bonded',
    'Charter','Registry','Licensing','Permitting','Compliance',
    'Inspection','Certification','Assessment','Appraisal','Valuation',
    'Custody','Escrow','Guarantee','Indemnity','Surety',
    'Dispatch','Forwarding','Brokerage','Clearing','Settlement',
    'Commissioning','Decommissioning','Mothballing','Scrapping','Salvage',
    'Field Works','Ground Works','Hull Works','Drive Works','Cell Works',
    'Fold Systems','Beacon Systems','Guidance Systems','Targeting','Tracking',
    'Corridor Access','Fold Authority','Route Authority','Transit Rights','Docking Rights',

    // Two-word domains — what subsidiaries and divisions are called
    'Deep Space','Supply Chain','Risk Management','Data Systems','Belt Resources',
    'Rim Operations','Colonial Services','Colonial Development','Frontier Services',
    'Orbital Services','Orbital Platforms','Belt Operations','Deep Survey',
    'System Security','Sector Defense','Trade Networks','Exchange Systems',
    'Heavy Industries','Light Industries','Assembly Systems','Component Systems',
    'Field Services','Colonial Support','Frontier Support','Void Logistics',
    'Dark Freight','Cold Transit','Bulk Handling','Ore Transport','Cell Trade',
    'Fold Logistics','Hull Repair','Drive Repair','Station Works','Yard Works',
    'Wreck Recovery','Cargo Recovery','Debt Recovery','Hull Assessment','Drive Assessment',
    'Signal Works','Relay Networks','Beacon Networks','Navigation Rights','Survey Rights',
    'Void Freight','Rim Freight','Belt Freight','Deep Freight','Far Freight',
    'Cold Chain','Dry Freight','Bonded Freight','Restricted Transit','Classified Cargo',
  ],

  corp_authority: [
    // What governing bodies actually call themselves in Aphelion
    'Command','Authority','League','Union','Compact','Assembly','Bureau',
    'Commission','Council','Board','Institute','Foundation','Corporation',
    'Syndicate','Consortium','Cooperative','Agency','Directorate','Secretariat',
    'Office','Department','Administration','Committee','Taskforce','Chamber',
    'Alliance','Pact','Bloc','Confederation','Federation','Coalition','Order',
    'Guild','Registry','Exchange','Network','Cluster','Accord','Trust',
    'Mandate','Writ','Charter','Patent','Warrant','Seal','Sanction',
    'Dispensation','Concession','License','Franchise','Monopoly','Cartel',
    'Combine','Holding','Stewardship','Custodianship','Wardenship','Keepership',
    'Oversight','Scrutiny','Audit','Review','Inspection','Assessment','Survey',
    'Tribunal','Arbitration','Mediation','Adjudication','Resolution','Settlement',
    'Quorum','Delegation','Deputation','Mission','Embassy','Legation','Envoy',

    // Two-word authorities — what institutions are actually called
    'Port Authority','Transit Authority','Station Authority','Belt Authority',
    'Rim Authority','Sector Authority','Freeport Authority','Fold Authority',
    'Colonial Authority','Frontier Authority','Orbital Authority','Void Authority',
    'Trade Council','Security Council','Colonial Council','Frontier Commission',
    'Oversight Board','Review Board','Audit Board','Regulatory Board',
    'Licensing Office','Permits Bureau','Standards Institute','Clearing House',
    'Trade Guild','Shipping Guild','Survey Guild','Prospecting Guild',
    'Planning Commission','Development Authority','Harbor Board','Dock Board',
    'Terminal Authority','Colonial Office','Logistics Board','Resource Council',
    'Defense Directorate','Security Directorate','Operations Council',
    'Joint Authority','Joint Commission','Joint Directorate','Compact Authority',
    'Chamber of Commerce','Institute of Trade','Institute of Navigation',
    'College of Survey','Registry Office','Market Board','Rates Commission',
    'Customs Office','Inspection Board','Certification Board','Compliance Office',
    'Risk Council','Safety Board','Ethics Commission','Standards Board',
    'Infrastructure Board','Zoning Commission','Resource Board','Energy Commission',
    'Signal Authority','Relay Authority','Beacon Authority','Corridor Commission',
    'Wreck Authority','Salvage Board','Reclamation Authority','Recovery Commission',
    'Debt Commission','Credit Office','Scrip Authority','Exchange Board',
    'Cell Authority','Fold Commission','Drive Registry','Hull Registry',
    'Survey Commission','Cartography Board','Mapping Authority','Chart Registry',
    'Armament Board','Ordnance Commission','Security Commission','Defense Board',
    'Colonial Board','Frontier Board','Rim Commission','Belt Commission',
    'Outer Commission','Deep Commission','Void Authority','Null Commission',
    'Free Commission','Open Authority','Common Board','Mutual Commission',
    'Joint Registry','Combined Authority','Allied Commission','United Board'
  ],

     // The good originals — keep all of these
    'The Cargo Hold','Last Shift','The Depot','The Anchor','Dry Dock',
    'The Forward Mess','Miner\'s Rest','The Gyre','Transfer Lounge',
    'The Narrows','Hel\'s Gate','The Drift','Null Point','The Pale',
    'Void & Sons','The Bilge','Pressure Drop','The Airlock','Hard Vacuum',
    'The Bends','Decompression','The Overflow','Slag & Bone','The Residual',
    'Final Approach','The Docking Ring','Escape Velocity','The Black',
    'Perihelion','Event Horizon','The Singularity','The Remnant',
    'Last Contact','Signal Lost','The Dead Drop','Cold Storage',
    'The Manifest','The Long Watch','Grav Well','The Sump','Dockside',
    'The Scrapyard','The Gantry','The Holding Tank','Portside',
    'The Spillway','The Bulkhead','Spill & Spark','The Rusted Valve',
    'The Coil','The Spindle','Slipstream','The Keelplate','The Lockout',
    'The Spacer\'s Rest','The Night Shift','The Red Line','The Blue Shift',
    'The Third Watch','Graveyard Shift','The Slip','The Outer Ring',
    'The Last Berth','The Dented Hull','The Rusted Anchor','The Ballast',
    'The Offload','The Waystation','Final Call','The Layover',
    'The Dock Rats','Spacers\' Mess','The Crew Deck','The Porthole',
    'The Beacon','Beacon & Barrel','The Far Beacon','The Dogwatch',
    'The Midwatch','The Fuel Line','The Burn','Ignition','Dust & Echo',
    'The Outer Marker','The Far Edge','The Rimside','Belt Bar',
    'Rock & Rail','Rockhoppers\' Rest','The Quarry','The Freeport',
    'The Exchange','The Covenant','The Longshot','Outbound','The Far Line',
    'Dark & Stormy','The Quiet Zone','Redshift','The Cupola',
    'The Fixed Star','Starboard','The Dogwatch','The Clearing House',

    // New additions — lore-appropriate, feel inhabited
    'The Veydrite','Dust & Bones','The Ashward','The Pale Fringe',
    'The Ironveil','Cinder & Salt','The Null','The Void Bar',
    'Last Fold','The Dead Corridor','Cold Passage','The Collapsed',
    'Feral Settlement','The Contested','The Declining','Hard Vacuum Two',
    'The Established','The Isolated','No Beacon','Dark Corridor',
    'The Fold Point','After the Burn','The Reserve Tank','Empty Cells',
    'The Harrow','The Auger','Salvage Rights','Contested Claim',
    'The Survey Mark','Astrometric','The Chart Room','The Dead Star',
    'Ruin Site Seven','The Xeno','No Signal','Mass Unknown',
    'The Tainted','The Anomaly','Something Else','Does Not Resolve',
    'The Graveyard','Pilot\'s Rest','Dead Reckoning','Lost Contact',
    'The Black Corridor','Cold Side','The Warm Side','Shore Power',
    'The Docking Fee','Standing Tab','The Hostile','The Watched',
    'The Trusted','Known Quantity','Reputation Bar','The Guild Rate',
    'Scrip & Bone','Veydrite & Void','Iron & Ash','Salt & Cinder',
    'The Drift Bar','Corridor Nine','The Known','The Dark Side',
    'The Aphelion','The Perihelion','Between Burns','The Transit Window',
    'The Long Fold','Short Corridor','The Highway','Primary Bar',
    'Secondary Pass','The Blindfold','The Overdrive','Twelve Cells',
    'The Reserve','Emergency Rations','The Last Ten Kilos',
    'The Harrow-Seven','Auger & Ore','The Pod Bay','Full Pods',
    'The Refinery Cut','Yield Share','Fifteen Percent','The Feral Rate',
    'No Questions','The Extraction Run','The Removal','Targeted',
    'The Contract Board','Bulletin & Beer','The Accepted','The Abandoned',
    'Hull & Hammer','The Drive Bay','Fold Cell Bar','The Magazine',
    'Twenty Cells','Three Cells','The Emergency','The Last Cell'
  ],
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
  },

    // Generate a planet/moon/body name
  // Uses NAMES array for variety
  planetBody(rng) {
    const root = rng.pick(NAMES.first_masculine.concat(NAMES.first_feminine));
    return root;
  },

};
