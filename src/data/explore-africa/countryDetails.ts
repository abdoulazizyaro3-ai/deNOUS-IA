export interface LanguageItem {
  name: string;
  percentage: string;
  type: string; // e.g., "Officielle", "Nationale", "Véhiculaire", "Régionale"
}

export interface DemographicData {
  total: string;
  density: string;
  medianAge: string;
  urbanRatio: string;
  ethnicGroups: string[];
  lifeExpectancy: string;
}

export interface EconomyData {
  gdp: string;
  gdpGrowth: string;
  currency: string;
  mainSectors: string[];
  keyExports: string;
}

export interface CountryDetails {
  history: string;
  culture: string;
  gastronomy: string;
  keyFacts: string[];
  demographics: DemographicData;
  economy: EconomyData;
  languages: LanguageItem[];
}

export const countriesDetails: Record<string, CountryDetails> = {
  burkina_faso: {
    history: "Ancien empire Mossi puissant, d'abord protectorat français sous le nom de Haute-Volta, le Burkina Faso obtient son indépendance politique le 5 août 1960. En 1984, sous la présidence de Thomas Sankara, le pays est rebaptisé 'Burkina Faso', ce qui signifie 'La patrie des hommes intègres'. C'est une nation fière, profondément ancrée dans les valeurs d'honneur et de solidarité.",
    culture: "Carrefour artistique de l'Afrique, le Burkina accueille le FESPACO (Festival Panafricain du Cinéma de Ouagadougou). C'est également là que se déroulent la Semaine Nationale de la Culture (SNC) à Bobo-Dioulasso et le Salon International de l'Artisanat de Ouagadougou (SIAO).",
    gastronomy: "Le pilier central de l'alimentation est le 'Tô', une pâte cuite énergique à base de mil ou de sorgho, servie avec de succulentes sauces chaudes (gombo, oseille, feuilles de baobab). On y déguste aussi le poulet bicyclette et le dolo (bière de mil traditionnelle).",
    keyFacts: [
      "Ouagadougou est la capitale incontestée du 7ème art africain en organisant le FESPACO depuis plus de 50 ans.",
      "La cour royale de Tiébélé présente des habitats traditionnels en terre kasséna décorés de splendides fresques géométriques peintes à la main.",
      "Les caïmans de Sabou cohabitent en harmonie absolue avec les villageois, ne montrant aucune agressivité envers les humains."
    ],
    demographics: {
      total: "22,8 Millions d'habitants",
      density: "83 hab/km²",
      medianAge: "17,6 ans",
      urbanRatio: "31% de population urbaine",
      ethnicGroups: ["Mossi (~52%)", "Peul (~8%)", "Lobi", "Bobo", "Gourounsi", "Sénoufo"],
      lifeExpectancy: "62 ans de moyenne"
    },
    economy: {
      gdp: "20,5 Milliards USD",
      gdpGrowth: "+5,2%",
      currency: "Franc CFA (XOF)",
      mainSectors: ["Agriculture (Coton, Sésame)", "Mines (Or - 1er produit d'exportation)", "Élevage pastoral"],
      keyExports: "Or brut, Coton brut, Noix d'anacarde, Graines de sésame"
    },
    languages: [
      { name: "Mooré", percentage: "53%", type: "Nationale majoritaire" },
      { name: "Dioula", percentage: "15%", type: "Véhiculaire commerciale" },
      { name: "Fulfuldé (Peul)", percentage: "9%", type: "Nationale" },
      { name: "Gourmanchéma", percentage: "6%", type: "Nationale" },
      { name: "Français", percentage: "20%", type: "Officielle administrative" }
    ]
  },
  senegal: {
    history: "Le Sénégal possède un passé historique d'une profondeur exceptionnelle, marqué par de grands empires et par la mémoire de l'esclavage sur l'île de Gorée. Après avoir accueilli le comptoir de Saint-Louis, le pays obtient son indépendance en 1960 avec pour premier président le poète-académicien Léopold Sédar Senghor.",
    culture: "La culture sénégalaise brille mondialement à travers la 'Teranga', qui définit la chaleureuse hospitalité, le respect mutuel et le plaisir de recevoir. Le plan musical est guidé par le Mbalax, un rythme palpitant propulsé par des percussions Sabar et popularisé par la légende mondiale Youssou N'Dour.",
    gastronomy: "Son joyau national est le 'Thiéboudienne' (Ceebu Jën), un ragoût de riz rouge parfumé mijoté avec du poisson frais, des légumes et du tamarin sucré-salé, classé par l'UNESCO. Les gourmets aiment aussi le 'Yassa' au poulet caramélisé aux oignons.",
    keyFacts: [
      "L'île de Gorée abrite la célèbre Maison des Esclaves et sa 'Porte du non-retour', lieu de mémoire et de pèlerinage mondial.",
      "Le lac Retba (ou Lac Rose) possède une couleur rose unique due à des micro-organismes réagissant à son taux de salinité extrême.",
      "Les griots, gardiens séculaires de la mémoire orale, repères d'Histoire, étaient autrefois enterrés dans le tronc des baobabs."
    ],
    demographics: {
      total: "17,3 Millions d'habitants",
      density: "88 hab/km²",
      medianAge: "18,5 ans",
      urbanRatio: "49% de population urbaine",
      ethnicGroups: ["Wolof (38.7%)", "Pulaar/Tocouleur (26.2%)", "Sérère (15.0%)", "Diola (4%)", "Mandingue"],
      lifeExpectancy: "68 ans de moyenne"
    },
    economy: {
      gdp: "27,6 Milliards USD",
      gdpGrowth: "+5,6%",
      currency: "Franc CFA (XOF)",
      mainSectors: ["Services tertiaires & Télécoms", "Pêche & Exportations maritimes", "Tourisme & Hôtellerie", "Agriculture (Arachide)"],
      keyExports: "Or brut, Produits pétroliers raffinés, Poisson et crustacés, Acide phosphorique"
    },
    languages: [
      { name: "Wolof", percentage: "85%", type: "Véhiculaire omniprésente" },
      { name: "Pulaar", percentage: "24%", type: "Nationale" },
      { name: "Sérère", percentage: "13%", type: "Nationale" },
      { name: "Diola", percentage: "6%", type: "Nationale" },
      { name: "Français", percentage: "30%", type: "Officielle administrative" }
    ]
  },
  maroc: {
    history: "Le Maroc est un royaume millénaire façonné par des dynasties d'envergure (Almoravides, Almohades, Alaouites) qui ont relié l'Andalousie aux confins du Sahara. Protecteur acharné de son indépendance à travers les âges, le Maroc a restauré sa souveraineté pleine en 1956 sous l'égide du roi Mohammed V.",
    culture: "Une fantastique convergence d'influences berbères, arabo-musulmanes et sahariennes. Le pays s'exprime majestueusement à travers l'artisanat d'art comme le zellige et les tapis berbères, et par ses festivals renommés comme celui de musique Gnaoua à Essaouira.",
    gastronomy: "Mondialement réputée pour sa subtilité culinaire sucrée-salée. Ses emblèmes sont les Couscous rassembleurs, les Tajines fondants mijotés en plat de terre, la délicate Pastilla croustillante au pigeon et à l'amande, et l'incontournable thé vert à la menthe douce.",
    keyFacts: [
      "La ville de Fès abrite l'Université d'Al Karaouine, reconnue comme la plus ancienne institution universitaire active au monde.",
      "Le village suspendu de Chefchaouen, dans les montagnes du Rif, est entièrement paré de nuances de bleu indigo hypnotiques.",
      "La célèbre place Jemaa el-Fna de Marrakech est classée chef-d'œuvre du patrimoine oral immémorial par l'UNESCO."
    ],
    demographics: {
      total: "37,4 Millions d'habitants",
      density: "84 hab/km²",
      medianAge: "29,2 ans",
      urbanRatio: "64% de population urbaine",
      ethnicGroups: ["Arabes-Berbères (~99%)", "Gnaoua", "Sahraouis"],
      lifeExpectancy: "76 ans de moyenne"
    },
    economy: {
      gdp: "134 Milliards USD",
      gdpGrowth: "+3,1%",
      currency: "Dirham Marocain (MAD)",
      mainSectors: ["Industrie Automobile & Aéronautique", "Mines (1er producteur d'engrais et phosphates)", "Tourisme culturel & Balnéaire", "Agriculture d'exportation"],
      keyExports: "Voitures particulières, Engrais phosphatés, Câblage électrique, Vêtements et bonneterie"
    },
    languages: [
      { name: "Darija (Marocain)", percentage: "90%", type: "Langue maternelle usuelle" },
      { name: "Amazigh (Tamazight)", percentage: "35%", type: "Officielle (D'origine berbère)" },
      { name: "Arabe Littéraire", percentage: "100%", type: "Officielle nationale" },
      { name: "Français", percentage: "50%", type: "Langue professionnelle & des affaires" },
      { name: "Espagnol", percentage: "5%", type: "Régionale (Nord & Sud-Ouest)" }
    ]
  },
  egypt: {
    history: "L'Égypte est l'une des plus anciennes civilisations continues de notre planète, née sur les rives fertiles du fleuve Nil il y a plus de 5 000 ans. Des pharaons fondateurs des grandes pyramides de Gizeh aux dynasties d'Égypte médiévale, le pays est devenu une république moderne souveraine en 1952.",
    culture: "De l'héritage colossal des tombeaux de Louxor à la création littéraire contemporaine fructueuse, l'Égypte est le cœur artistique de sa région. Naguib Mahfouz y a décroché le prix Nobel, tandis que les refrains d'Oum Kalthoum ont conquis la planète entière.",
    gastronomy: "La gastronomie égyptienne est généreuse et centrée sur les dons fertiles du fleuve. Le plat national est le 'Koshari', un mélange surprenant et savoureux de riz, lentilles, macaroni et pois chiches, arrosé de sauce tomate piquante à l'ail et d'oignons frits croustillants.",
    keyFacts: [
      "La Grande Pyramide de Khéops à Gizeh est la seule des sept merveilles de l'Antiquité classique parvenue intacte jusqu'à nous.",
      "Le canal de Suez, creusé à main d'homme et inauguré en 1869, connecte directement la mer Méditerranée à la mer Rouge.",
      "L'ancienne bibliothèque d'Alexandrie était le plus grand érudit flambeau intellectuel et philosophique de la Méditerranée antique."
    ],
    demographics: {
      total: "110 Millions d'habitants",
      density: "110 hab/km²",
      medianAge: "24,8 ans",
      urbanRatio: "43% de population urbaine",
      ethnicGroups: ["Égyptiens de souche (~99%)", "Nubiens", "Bédouins", "Berbères (Siwa)"],
      lifeExpectancy: "71 ans de moyenne"
    },
    economy: {
      gdp: "476 Milliards USD",
      gdpGrowth: "+4,2%",
      currency: "Livre Égyptienne (EGP)",
      mainSectors: ["Services maritimes (Canal de Suez)", "Tourisme archéologique", "Énergie & Gaz naturel", "Agriculture maraîchère"],
      keyExports: "Gaz naturel liquéfié, Pétrole raffiné, Engrais azotés, Or, Fruits frais"
    },
    languages: [
      { name: "Arabe Égyptien (Massri)", percentage: "99%", type: "Langue nationale parlée" },
      { name: "Arabe Standard", percentage: "100%", type: "Officielle administrative" },
      { name: "Anglais", percentage: "40%", type: "Langue éducative et commerciale" },
      { name: "Copte", percentage: "1%", type: "Liturgique (Chrétienne d'Égypte)" }
    ]
  },
  rdc: {
    history: "La République Démocratique du Congo est l'héritière directe du Royaume du Kongo précolonial. Tragiquement rattachée à la Couronne belge, elle s'affranchit de haute lutte en 1960 sous l'impulsion courageuse du leader historique Patrice Lumumba, instaurant une ère de fierté.",
    culture: "Le Congo est une véritable superpuissance artistique africaine. C'est le berceau de la Rumba Congolaise (inscrite à l'UNESCO). C'est aussi la patrie de la SAPE, mouvement esthétique où les dandys célèbrent de magnifiques tenues de haute couture comme philosophie pacifique.",
    gastronomy: "Une table riche et forestière, nourrie du fleuve et de la forêt. Le plat roi est le Poulet à la Moambe, préparé avec une onctueuse sève cuite de graines de palme, accompagné de Chikwangue (pain de manioc fermenté enveloppé dans des feuilles vertes).",
    keyFacts: [
      "La RDC abrite le deuxième poumon vert continu mondial : la gigantesque forêt tropicale humide du bassin du fleuve Congo.",
      "Le pays est le sanctuaire endémique mondial des bonobos et des okapis, espèces animales uniques hautement protégées.",
      "La SAPE (Société des Ambianceurs et des Personnes Élégantes) élève le chic vestimentaire à un art théâtral spectaculaire."
    ],
    demographics: {
      total: "102 Millions d'habitants",
      density: "45 hab/km²",
      medianAge: "17,0 ans",
      urbanRatio: "46% de population urbaine",
      ethnicGroups: ["Luba (~18%)", "Mongo (~13.5%)", "Kongo (~12.4%)", "Mangbetu-Azande", "Plus de 200 ethnies distinctes"],
      lifeExpectancy: "60 ans de moyenne"
    },
    economy: {
      gdp: "64,7 Milliards USD",
      gdpGrowth: "+6,1%",
      currency: "Franc Congolais (CDF)",
      mainSectors: ["Mines (1er producteur de Cobalt, diamants, cuivre & coltan)", "Foresterie", "Agriculture (Café, Huile de palme)"],
      keyExports: "Cuivre raffiné, Cobalt brut, Diamants d'industrie, Or, Pétrole brut"
    },
    languages: [
      { name: "Lingala", percentage: "45%", type: "Nationale véhiculaire & populaire" },
      { name: "Swahili", percentage: "35%", type: "Nationale (Est & Sud)" },
      { name: "Kikongo", percentage: "15%", type: "Nationale (Sud-Ouest)" },
      { name: "Tshiluba", percentage: "10%", type: "Nationale (Centre Kasaï)" },
      { name: "Français", percentage: "48%", type: "Officielle administrative" }
    ]
  },
  south_africa: {
    history: "Peuplée par les San et Khoïkhoï, l'Afrique du Sud a subi des siècles de colonisation hollandaise et britannique. Le pays a conquis sa destinée en démantelant pacifiquement le régime d'apartheid en 1994, élisant Nelson Mandela au rang de président de la Nation Arc-en-Ciel.",
    culture: "Une diversité extraordinaire illustrée par ses nombreuses langues officielles. Sa culture rayonne à travers les formidables chorales polyphoniques d'Isicathamiya, les peintures murales colorées Ndébélé, et l'omniprésence du concept spirituel de l' 'Ubuntu'.",
    gastronomy: "Le pivot de la convivialité est le 'Braai', un rituel rassembleur de barbecue au feu de bois pour griller des saucisses Boerewors. Le 'Bobotie'—un gratin de viande hachée épicée, abricots secs, amandes et d'un nappage d'œufs dorés au four—est adoré.",
    keyFacts: [
      "L'Afrique du Sud dispose de trois capitales : Pretoria (administrative), Le Cap (législative) et Bloemfontein (judiciaire).",
      "Le parc national Kruger est une réserve de classe mondiale permettant d'admirer les mythiques 'Big Five' en totale liberté.",
      "La célèbre Table Mountain, montagne plate emblématique qui domine Le Cap, figure parmi les merveilles mondiales naturelles."
    ],
    demographics: {
      total: "60,6 Millions d'habitants",
      density: "49 hab/km²",
      medianAge: "28,0 ans",
      urbanRatio: "68% de population urbaine",
      ethnicGroups: ["Noirs d'ethnies bantoues (81%)", "Métis (9%)", "Blancs d'Afrique (8%)", "Asiatiques/Indiens (2%)"],
      lifeExpectancy: "65 ans de moyenne"
    },
    economy: {
      gdp: "405 Milliards USD",
      gdpGrowth: "+1,8%",
      currency: "Rand Sud-africain (ZAR)",
      mainSectors: ["Services Financiers & Bourse", "Mines haut de gamme (Or, Platine, Diamants)", "Automobile", "Viticulture & Agroalimentaire", "Tourisme"],
      keyExports: "Platine brut, Or brut, Charbon de terre, Minerais de fer, Voitures routières, Diamants"
    },
    languages: [
      { name: "IsiZulu (Zoulou)", percentage: "23%", type: "Officielle majoritaire" },
      { name: "IsiXhosa (Xhosa)", percentage: "16%", type: "Officielle" },
      { name: "Afrikaans", percentage: "13.5%", type: "Officielle" },
      { name: "Sepedi", percentage: "9%", type: "Officielle" },
      { name: "English (Anglais)", percentage: "10%", type: "Officielle nationale & commerciale" }
    ]
  },
  cote_divoire: {
    history: "Terre historique de royaumes, la Côte d'Ivoire acquiert sereinement sa souveraineté en 1960 sous l'impulsion de Félix Houphouët-Boigny. En orchestrant un boom agricole fondé sur le binôme café-cacao, il en fit le pays leader économique d'Afrique de l'Ouest francophone.",
    culture: "D'une effervescence débordante, elle se démarque par un grand sens de la dérision amicale, sa langue urbaine de liaison—le Nouchi—et d'incroyables vagues musicales planétaires comme le Zouglou nostalgique et le trépidant Coupé-Décalé d'Abidjan.",
    gastronomy: "Extrêmement piquante et festive! Le plat roi est l' 'Attiéké' (semoule aérienne de manioc cuite à la vapeur à la saveur légèrement acidulée), servie avec du poulet ou poisson braisés au charbon ardents, de fines tranches de piment, oignons et tomates.",
    keyFacts: [
      "Yamoussoukro héberge la Basilique Notre-Dame de la Paix, reconnue officiellement la plus grande église catholique mondiale.",
      "La Côte d'Ivoire produit à elle seule environ 40% des fèves de cacao mondiales, dominant ainsi le marché du chocolat.",
      "Le Nouchi, né dans les marchés d'Abidjan à la fin des années 70, est devenu un argot parlé par toute la jeunesse d'Afrique de l'ouest."
    ],
    demographics: {
      total: "29,4 Millions d'habitants",
      density: "91 hab/km²",
      medianAge: "18,9 ans",
      urbanRatio: "52% de population urbaine",
      ethnicGroups: ["Akan (Baoulé, Agni... ~42.1%)", "Mandé du Nord (Dioula... ~27.5%)", "Gour (Sénoufo... ~17.6%)", "Krou (Bété...)"],
      lifeExpectancy: "58 ans de moyenne"
    },
    economy: {
      gdp: "70 Milliards USD",
      gdpGrowth: "+6,5%",
      currency: "Franc CFA (XOF)",
      mainSectors: ["Agriculture (1er producteur mondial de Cacao & Cajou, Noix de coco)", "Pétrole brut (Offshore)", "Transit portuaire d'Abidjan"],
      keyExports: "Fèves de cacao et chocolat, Noix d'anacarde, Or brut, Pétrole brut, Caoutchouc naturel"
    },
    languages: [
      { name: "Dioula", percentage: "70%", type: "Véhiculaire omniprésente nationale" },
      { name: "Baoulé", percentage: "15%", type: "Nationale courante" },
      { name: "Sénoufo", percentage: "10%", type: "Nationale" },
      { name: "Français", percentage: "45%", type: "Officielle (Administration & Éducation)" }
    ]
  },
  kenya: {
    history: "La vallée du Grand Rift kenyan est scientifiquement qualifiée de 'berceau de l'humanité' pour ses ossements hominidés de millions d'années. Après des siècles d'essor culturel maritime de culture swahilie, le pays se libère de l'Empire britannique en 1963.",
    culture: "Une mosaïque de 40 groupes ethniques. Les Maasaï, fiers guerriers nomades, sont connus pour leurs somptueux bijoux en perles multicolores et leur saut vertical. Le Kenya est précurseur de la protection de l'écosystème animal sauvage mondial.",
    gastronomy: "Centrée sur l'essentiel. Le plat de base est l' 'Ugali' (purée compacte et fumante obtenue à partir de farine de maïs blanc), traditionnellement partagée à la main avec du 'Sukuma Wiki' (chou vert sauté doux) et parfois du 'Nyama Choma' (barbecue).",
    keyFacts: [
      "La réserve nationale du Masai Mara est le théâtre grandiose annuel de la spectaculaire migration de millions de gnous.",
      "Le Kenya produit des coureurs et marathoniens de fond de calibre mondial détenant des records de vitesse planétaires.",
      "La bienveillante expression 'Hakuna Matata' ('Aucun souci' en swahili) fait partie de la chaleureuse vie hospitalière courante."
    ],
    demographics: {
      total: "55 Millions d'habitants",
      density: "94 hab/km²",
      medianAge: "20,1 ans",
      urbanRatio: "28% de population urbaine",
      ethnicGroups: ["Kikuyu (~17.1%)", "Luhya (~14.3%)", "Kalenjin (~13.4%)", "Luo (~10.7%)", "Kamba (~9.8%)", "Maasaï"],
      lifeExpectancy: "67 ans de moyenne"
    },
    economy: {
      gdp: "115 Milliards USD",
      gdpGrowth: "+5,5%",
      currency: "Shilling Kenyan (KES)",
      mainSectors: ["Horticulture & Thé (1er exportateur mondial de Thé noir et fleurs)", "Technologies financières de pointe (M-Pesa)", "Safaris & Ecotourisme"],
      keyExports: "Thé noir de spécialité, Fleurs coupées fraîches, Café d'altitude, Légumineuses, Produits pétroliers raffinés"
    },
    languages: [
      { name: "Kiswahili (Swahili)", percentage: "100%", type: "Officielle nationale d'unité" },
      { name: "English (Anglais)", percentage: "75%", type: "Officielle administrative & professionnelle" },
      { name: "Kikuyu", percentage: "20%", type: "Nationale régionale" },
      { name: "Luo", percentage: "12%", type: "Nationale régionale" }
    ]
  }
};
