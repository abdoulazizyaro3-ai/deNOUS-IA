export interface DetailedLandmark {
  images: string[];
  detailedDescription: string;
  whyVisit: string;
  practicalTips: string[];
}

export const landmarkDetailedData: Record<string, DetailedLandmark> = {
  // --- BURKINA FASO ---
  bk_sindou: {
    images: [
      "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=1200&auto=format&fit=crop"
    ],
    detailedDescription: "Véritable merveille géologique sculptée par le vent et la pluie depuis des millions d'années, les Pics de Sindou se dressent fièrement au milieu d'un paysage de savane. Ce labyrinthe de roches calcaires gréseuses, autrefois forteresse naturelle sacrée protégeant les villageois Sénoufo des invasions, dégage une atmosphère mystique inoubliable.",
    whyVisit: "Pour sa géologie lunaire féerique de grès marron et son caractère spirituel encore honoré par les gardiens coutumiers.",
    practicalTips: [
      "Prévoyez des chaussures de marche robustes pour grimper entre les pics.",
      "Engagez impérativement un guide local Sénoufo pour comprendre les légendes sacrées.",
      "Idéal au coucher du soleil quand la roche prend une teinte dorée spectaculaire."
    ]
  },
  bk_karfiguela: {
    images: [
      "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200&auto=format&fit=crop"
    ],
    detailedDescription: "Nées du fleuve Comoé, ces chutes d'eau forment une oasis rafraîchissante unique au Burkina Faso. L'eau s'écoule le long de grandes dalles de pierre polie au milieu d'une forêt-galerie luxuriante composée de manguiers géants et de cocotiers. C'est le lieu idéal pour une halte paisible en plein cœur de la nature.",
    whyVisit: "Pour nager dans des piscines rocheuses d'eau douce entourées d'une jungle de manguiers parfumés.",
    practicalTips: [
      "Apportez votre maillot de bain et une serviette (les zones de baignade sont douces).",
      "Profitez-en pour acheter des mangues fraîches vendues directement par les producteurs locaux.",
      "Visitez juste après la saison des pluies (octobre à décembre) pour un débit d'eau maximal."
    ]
  },
  bk_tiebele: {
    images: [
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?q=80&w=1200&auto=format&fit=crop"
    ],
    detailedDescription: "Inscrite au patrimoine mondial de l'UNESCO, la Cour Royale de Tiébélé expose les célèbres concessions en argile fortifiée du peuple Kasséna. Les femmes y dessinent à la main de sublimes fresques murales géométriques faites de latérite, de kaolin noir et d'enduit de gousses de néré, conférant aux habitations une résistance et une identité artistique exceptionnelles.",
    whyVisit: "Une occasion unique au monde d'admirer l'art architectural traditionnel matriarcal ouest-africain.",
    practicalTips: [
      "Demandez toujours l'autorisation avant de photographier les détails des portes d'écurie royales.",
      "Achetez des objets artisanaux locaux pour soutenir directement le groupement des femmes peintres.",
      "Le chapeau traditionnel local et une bonne crème solaire sont conseillés à Tiébélé."
    ]
  },
  bk_sabou: {
    images: [
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?q=80&w=1200&auto=format&fit=crop"
    ],
    detailedDescription: "La mare de Sabou abrite des caïmans considérés comme protecteurs sacrés par les habitants de la région. Nourris par les guides, ils cohabitent paisiblement avec la population locale depuis des siècles. Les visiteurs peuvent s'approcher de très près de ces redoutables reptiles en toute sécurité sous le regard bienveillant des sages initiés locaux.",
    whyVisit: "Vivre l'expérience magique de s'approcher et toucher la queue d'un crocodile totem sacré en pleine nature.",
    practicalTips: [
      "Suivez scrupuleusement les consignes et les déplacements recommandés par votre guide.",
      "Une petite contribution financière est demandée pour l'achat de poulets destinés au nourrissage.",
      "Respectez l'atmosphère de ferveur spirituelle sacrée des villageois autour de cette mare."
    ]
  },
  bk_fabedougou: {
    images: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=1200&auto=format&fit=crop"
    ],
    detailedDescription: "Situés près de Banfora, les dômes de Fabedougou sont de surprenants reliefs en formes d'obélisques et de pyramides de grès marron fondu. Sculptées à même le flanc de la montagne par des millénaires d'érosion, ces tourelles géologiques constituent une zone d'observation vertigineuse de toute la vallée des cascades.",
    whyVisit: "Faire de l'escalade légère et profiter d'un panorama panoramique hypnotique à 360° sur les plantations de canne à sucre.",
    practicalTips: [
      "Munissez-vous de bonnes baskets pour monter sur les dômes car le grès peut être glissant.",
      "Associez cette visite avec celle des Cascades de Karfiguéla situées à moins de 5 kilomètres.",
      "Prévoyez de l'eau car il n'y a aucune zone d'ombre à l'intérieur du champ de dômes."
    ]
  },
  bk_roodwoko: {
    images: [
      "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=1200&auto=format&fit=crop"
    ],
    detailedDescription: "Véritable poumon commercial du Burkina Faso, le Grand Marché Rood-Woko de Ouagadougou est une ruche bouillonnante. C'est l'endroit parfait pour dénicher du coton traditionnel Faso Dan Fani de haute qualité, des sandales en cuir naturel, du karité brut et des amandes locales savoureuses dans une ambiance incroyablement chaleureuse.",
    whyVisit: "S'imprégner de l'immense vitalité ouest-africaine et aiguiser l'art amical du marchandage pour l'artisanat.",
    practicalTips: [
      "Gardez vos affaires personnelles et portefeuilles dans des poches avant sécurisées.",
      "Prenez votre temps pour négocier sereinement les prix, toujours avec humour et grand sourire.",
      "Idéal en matinée lorsque l'atmosphère est plus fraîche et le choix de denrées optimal."
    ]
  },
  bk_artisanal: {
    images: [
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?q=80&w=1200&auto=format&fit=crop"
    ],
    detailedDescription: "Le Village Artisanal de Ouagadougou regroupe le fleuron des artistes du pays. Sculptures de bronze à la cire perdue, instruments de musique traditionnels fabriqués à la main, toiles de bogolan et sacs en cuir d'exception y sont créés en direct sous vos yeux. Chaque pièce achetée soutient équitablement les créateurs locaux.",
    whyVisit: "Découvrir les coulisses de fabrication du bronze d'art burkinabé, réputé dans le monde entier.",
    practicalTips: [
      "Certains artisans proposent d'expédier vos achats volumineux d'art par fret aérien.",
      "Demandez à observer un coulage de bronze à chaud si un atelier prépare une fusion.",
      "Les prix sont fixes et étiquetés dans tout le complexe, garantissant une rémunération équitable."
    ]
  },

  // --- SENEGAL ---
  sen_goree: {
    images: [
      "https://images.unsplash.com/photo-1599818817291-a1859c6b8c4d?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1200&auto=format&fit=crop"
    ],
    detailedDescription: "Tristement célèbre pour sa Maison des Esclaves et sa poignante 'Porte du non-retour', l'Île de Gorée, au large de Dakar, est aujourd'hui un sanctuaire de paix classé à l'UNESCO. Ses ruelles ombragées bordées de demeures coloniales aux murs ocre roses, jaunes et violets croulent sous des bougainvilliers éclatants.",
    whyVisit: "Vivre un pèlerinage historique mémoriel bouleversant doublé de la quiétude d'une île piétonne.",
    practicalTips: [
      "Prenez la chaloupe matinale au port de Dakar pour éviter l'affluence de la mi-journée.",
      "Prévoyez des pièces de monnaie pour remercier les guides bénévoles de la Maison des Esclaves.",
      "Goûtez à la succulente daurade grillée dans l'un des petits restaurants de la plage."
    ]
  },
  sen_lompoul: {
    images: [
      "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=1200&auto=format&fit=crop"
    ],
    detailedDescription: "En plein cœur du Sénégal sahélien, le désert de Lompoul surprend par l'intensité de ses grandes dunes de sable ocre doré. Ce petit désert de poche offre une sensation immédiate d'isolement saharien à seulement quelques heures de la capitale, propice aux ballades à dos de dromadaire au coucher du soleil.",
    whyVisit: "Passer une nuit magique sous des tentes mauritaniennes traditionnelles à la lueur des feux de camp.",
    practicalTips: [
      "Prenez des vêtements chauds pour la nuit car les températures chutent rapidement dans les dunes.",
      "N'oubliez pas d'emporter des lunettes de soleil pour vous protéger les yeux du vent de sable léger.",
      "Réservez un transfert en véhicule 4x4 car l'accès final depuis le village de Lompoul s'effectue sur piste."
    ]
  },
  sen_casamance: {
    images: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200&auto=format&fit=crop"
    ],
    detailedDescription: "Région tropicale s'étendant au sud du Sénégal, la Casamance est un enchaînement féerique de mangroves denses, d'immenses rizières verdoyantes et de forêts primaires majestueuses abritant d'impressionnants fromagers. La culture y est vivante avec des villages diolas très accueillants et fiers de leurs traditions rituelles.",
    whyVisit: "Parcourir en pirogue traditionnelle les bolongs d'eau salée à la rencontre de milliers d'oiseaux migrateurs.",
    practicalTips: [
      "Munissez-vous d'un spray anti-moustiques efficace pour vos promenades en forêt ou près des mangroves.",
      "Soyez respectueux des forêts sacrées locales, lieux hautement sacrés préservés par les rituels Diolas.",
      "Prenez le temps d'assister à un concert de kora joué à l'ombre d'un grand fromager."
    ]
  },

  // --- MAROC ---
  mar_chefchaouen: {
    images: [
      "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1200&auto=format&fit=crop"
    ],
    detailedDescription: "Accrochée aux versants des montagnes du Rif, la célèbre Médina de Chefchaouen captive par sa palette infinie de bleus intenses, d'indigo et d'azur. Peinte traditionnellement pour éloigner les insectes et conserver la fraîcheur des maisons pavées, cette cité de caractère dégage une poésie et une sérénité sans pareilles.",
    whyVisit: "Pour l'immense plaisir visuel de déambuler et se perdre dans un labyrinthe bleu hors du temps.",
    practicalTips: [
      "Prévoyez d'excellentes chaussures de marche en raison de ses nombreuses ruelles pavées en forte pente.",
      "L'escalade à la mosquée espagnole au coucher du soleil offre un panorama spectaculaire de toute la cité.",
      "N'hésitez pas à marchander aimablement de magnifiques tapis et lainages faits par les artisans du Rif."
    ]
  },
  mar_dades: {
    images: [
      "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200&auto=format&fit=crop"
    ],
    detailedDescription: "Les Gorges du Dadès dévoilent des paysages désertiques de canyons profonds teintés d'un sublime ocre rouge éclatant. Surnommées les 'doigts de singe' pour leurs surprenantes falaises plissées par la tectonique, elles sont traversées par une route escarpée mythique offrant des lacets vertigineux suspendus au-dessus de la vallée verdoyante.",
    whyVisit: "Traverser l'une des routes de montagne les plus sinueuses et grandioses du continent africain.",
    practicalTips: [
      "Préparez-vous à des virages serrés en épingle à cheveux si vous conduisez votre propre véhicule.",
      "Le printemps (mars à mai) est idéal pour admirer l'amandier en fleurs contrastant avec les canyons rouges.",
      "Arrêtez-vous dans une auberge de montagne pour déguster un délicieux tajine cuit au feu de bois."
    ]
  },

  // --- EGYPT ---
  egy_pyramids: {
    images: [
      "https://images.unsplash.com/photo-1503177119275-0aa32b31d468?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600577916048-804c9191e36c?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200&auto=format&fit=crop"
    ],
    detailedDescription: "Dernière merveille antique encore debout sur la planète, le complexe funéraire pharaonique de Gizeh regroupe les pyramides légendaires de Khéops, Khéphren et Mykérinos, gardées depuis plus de 4 500 ans par l'énigmatique Grand Sphinx de pierre. C'est l'essence même du génie bâtisseur de l'Égypte antique.",
    whyVisit: "Contempler en face le monument historique le plus célèbre de l'histoire humaine.",
    practicalTips: [
      "Achetez votre billet de bonne heure pour avoir une chance limitée de pénétrer dans la Grande Pyramide.",
      "Évitez les heures les plus chaudes (11h - 15h) en raison de l'exposition totale au rayonnement saharien.",
      "Prenez une ballade en calèche ou à dos de chameau pour de superbes perspectives photos désertiques éloignées."
    ]
  },
  egy_desert: {
    images: [
      "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=1200&auto=format&fit=crop"
    ],
    detailedDescription: "Le Désert Blanc offre l'un des spectacles de nature les plus magiques de la planète. Ici, d'incroyables monolithes de craie blanche immaculée émergent du désert doré, sculptés par la fureur du vent en formes bizarres ressemblant à des champignons géants, des vagues figées et des sphinx de calcaire.",
    whyVisit: "Dormir à la belle étoile au milieu d'un océan de craie d'un blanc d'albâtre scintillant comme de la neige.",
    practicalTips: [
      "Partez uniquement lors d'une expédition organisée par des guides bédouins locaux certifiés.",
      "La nuit est extrêmement froide en hiver : prévoyez un duvet de haute montagne très isolant.",
      "Au clair de lune, le paysage s'éclaire d'un reflet fantomatique blanc bleuté absolument inoubliable."
    ]
  },

  // --- RDC / CONGO ---
  rdc_virunga: {
    images: [
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200&auto=format&fit=crop"
    ],
    detailedDescription: "Inscrit au patrimoine mondial en péril, le Parc National des Virunga est la plus ancienne réserve d'Afrique. Il abrite une biodiversité prodigieuse au pied des grands volcans actifs de Nyiragongo et Nyamuragira. C'est l'un des tout derniers havres abritant les célèbres et grandioses gorilles de montagne sauvages.",
    whyVisit: "Vivre le frisson magique unique de regarder un gorille de montagne dans les yeux en pleine jungle.",
    practicalTips: [
      "La visite nécessite d'être en bonne forme physique et d'avoir un certificat de vaccination à jour.",
      "Le port du masque de protection hygiénique est obligatoire à proximité des gorilles de montagne pour préserver leur santé.",
      "Prévoyez des vêtements imperméables solides pour affronter la pluie équatoriale dense."
    ]
  },

  // --- SOUTH AFRICA ---
  rsa_table: {
    images: [
      "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1200&auto=format&fit=crop"
    ],
    detailedDescription: "Véritable merveille de la nature surplombant le port du Cap, Table Mountain étonne par son sommet plat s'étendant sur plus de trois kilomètres. Souvent nappée d'une épaisse brume blanche mystique appelée la 'nappe de la Table', cette forteresse offre un panorama d'exception sur l'océan Atlantique.",
    whyVisit: "Profiter d'une vue spectaculaire suspendue entre ciel et mer en haut d'une montagne vieille de 260 millions d'années.",
    practicalTips: [
      "Prenez le téléphérique rotatif ou grimpez à pied via le sentier réputé de Platteklip Gorge.",
      "Consultez la météo avant de partir : le téléphérique ferme immédiatement en cas de vents violents.",
      "Prévoyez un coupe-vent thermique léger car le vent souffle avec vigueur au sommet."
    ]
  },

  // --- COTE D'IVOIRE ---
  civ_yam: {
    images: [
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?q=80&w=1200&auto=format&fit=crop"
    ],
    detailedDescription: "Considéré par le Livre Guinness des records comme le plus vaste édifice religieux chrétien au monde, la Basilique Notre-Dame de la Paix de Yamoussoukro surprend par ses dimensions monumentales. Ses 7 000 m² de précieux vitraux artisanaux et ses impressionnantes colonnades en marbre d'Italie en font une prouesse unique.",
    whyVisit: "Pour admirer les jeux de lumière exceptionnels créés par les plus grands vitraux faits main d'Afrique.",
    practicalTips: [
      "Une tenue d'une grande décence et un comportement très respectueux sont exigés pour la visite.",
      "Privilégiez les visites guidées de la basilique organisées sur place pour découvrir tous ses secrets thermiques.",
      "Admirez le dôme illuminé la nuit, visible à des kilomètres à la ronde."
    ]
  },

  // --- KENYA ---
  ken_mara: {
    images: [
      "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1200&auto=format&fit=crop"
    ],
    detailedDescription: "Le Masai Mara est le théâtre mythique de la majestueuse Grande Migration, au cours de laquelle plus d'un million de gnous et de zèbres traversent les rivières infestées de crocodiles géants. Cette savane dorée abrite les plus fortes concentrations de lions et de guépards au monde.",
    whyVisit: "Vivre l'ultime expérience mythique de safari photo animalier au cœur de la savane africaine originelle.",
    practicalTips: [
      "La saison idéale pour la grande migration légendaire s'étend de juillet à octobre.",
      "Préparez des zooms photo puissants et lisez des conseils sur la photographie de faune sauvage.",
      "Soutenez les communautés locales Masaï en achetant leur artisanat de perles colorées d'exception."
    ]
  }
};

// Generates highly styled, beautiful random but contextual fallbacks for other landmarks to save tokens
export function getLandmarkDetails(id: string, fallbackName: string, fallbackDesc: string): DetailedLandmark {
  if (landmarkDetailedData[id]) {
    return landmarkDetailedData[id];
  }

  // Generate nice category based images
  const categoryImages: Record<string, string[]> = {
    nature: [
      "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1200&auto=format&fit=crop"
    ],
    town: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop"
    ],
    festive: [
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop"
    ]
  };

  const isFestive = id.includes("fest") || id.includes("siao") || id.includes("fespaco") || id.includes("snc") || id.includes("amani") || id.includes("femua") || id.includes("jazz") || id.includes("art");
  const isTown = id.includes("mall") || id.includes("plaza") || id.includes("market") || id.includes("march") || id.includes("artisan") || id.includes("rood");
  
  const chosenImages = isFestive ? categoryImages.festive : isTown ? categoryImages.town : categoryImages.nature;

  return {
    images: chosenImages,
    detailedDescription: `${fallbackDesc} Ce lieu exceptionnel incarne la grande richesse de la région. Visiter ${fallbackName} permet d'entrer en connexion directe avec la ferveur vibrante de ses habitants, d'admirer des techniques ou des reliefs préservés uniques et d'immortaliser des moments mémorables au cours de votre voyage d'exploration d'Afrique.`,
    whyVisit: "Pour l'immersion intense et authentique au contact d'un patrimoine africain d'envergure mondiale.",
    practicalTips: [
      "Demandez des conseils avisés auprès d'un comptoir d'office de tourisme ou d'un guide officiel.",
      "Prévoyez les rands, rands CFA ou livres locales nécessaires pour régler les taxes d'entrée.",
      "Prenez soin de respecter l'écosystème local et les traditions sacrées en vigueur dans cette communauté."
    ]
  };
}
