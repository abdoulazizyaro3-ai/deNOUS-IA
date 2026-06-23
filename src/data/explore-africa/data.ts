export interface Landmark {
  id: string;
  name: string;
  category: "touristic" | "landscape" | "forest" | "modern" | "commercial" | "cultural";
  categoryLabel: string;
  image: string;
  description: string;
  location: string;
  price?: string;
  rating?: number;
  tag?: string;
  dateRange?: string;
  lat?: number;
  lng?: number;
}

export interface CountryData {
  id: string;
  name: string;
  localGreeting: string;
  localGreetingExplanation: string;
  capital: string;
  currency: string;
  population: string;
  tagline: string;
  overview: string;
  flagEmoji: string;
  landmarks: Landmark[];
}

export const countriesData: Record<string, CountryData> = {
  burkina_faso: {
    id: "burkina_faso",
    name: "Burkina Faso",
    localGreeting: "Fo laafi / Ne y windiga",
    localGreetingExplanation: "Salutations traditionnelles chaleureuses. 'Fo laafi' en Dioula s'enquiert de votre santé ('Comment vas-tu ?'), et 'Ne y windiga' en Mooré souhaite une excellente journée sous le soleil bienveillant du Burkina.",
    capital: "Ouagadougou",
    currency: "Franc CFA (XOF)",
    population: "22,8 Millions",
    tagline: "La patrie des hommes intègres aux richesses culturelles uniques",
    flagEmoji: "🇧🇫",
    overview: "Situé au cœur de l'Afrique de l'Ouest, le Burkina Faso est un carrefour culturel et artistique vibrant. Célèbre pour son hospitalité sans bornes, sa royauté traditionnelle Mossi respectée, son cinéma mondial avec le FESPACO et son artisanat d'art exceptionnel, il offre des paysages géologiques et naturels à couper le souffle.",
    landmarks: [
      {
        id: "bk_sindou",
        name: "Les Pics de Sindou",
        category: "touristic",
        categoryLabel: "Site Touristique Naturel",
        image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1200&auto=format&fit=crop",
        description: "Spectaculaires aiguilles de grès marron sculptées par l'érosion éolienne. Ce paysage lunaire était autrefois un lieu de refuge sacré pour les peuples Sénoufo.",
        location: "Sindou, Région des Cascades",
        price: "1 000 XOF",
        rating: 4.9,
        tag: "Visite Guidée",
        dateRange: "Nov - Avril",
        lat: 10.6622,
        lng: -5.1633
      },
      {
        id: "bk_karfiguela",
        name: "Les Cascades de Karfiguéla",
        category: "touristic",
        categoryLabel: "Site Touristique Naturel",
        image: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=1200&auto=format&fit=crop",
        description: "Une succession de chutes d'eau fraîches s'écoulant le long de falaises rocheuses au milieu de manguiers denses et de cocotiers majestueux, idéales pour la baignade.",
        location: "Banfora, Sud-Ouest du Burkina",
        price: "500 XOF",
        rating: 4.8,
        tag: "Baignade Libre",
        dateRange: "Toute l'année",
        lat: 10.6789,
        lng: -4.8157
      },
      {
        id: "bk_tiebele",
        name: "La Cour Royale de Tiébélé",
        category: "touristic",
        categoryLabel: "Patrimoine de l'UNESCO",
        image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?q=80&w=1200&auto=format&fit=crop",
        description: "Un village fortifié royal kasséna unique, orné de fresques géométriques traditionnelles peintes à la main par les femmes du village.",
        location: "Tiébélé, Centre-Sud",
        price: "2 000 XOF",
        rating: 4.9,
        tag: "Art Ancestral",
        dateRange: "Oct - Mai",
        lat: 11.1000,
        lng: -1.0333
      },
      {
        id: "bk_sabou",
        name: "Les Caïmans Sacrés de Sabou",
        category: "touristic",
        categoryLabel: "Site Touristique Culturel",
        image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1200&auto=format&fit=crop",
        description: "Une mare mythique peuplée de crocodiles centenaires totalement inoffensifs. Selon la légende, ils sauvèrent un ancêtre fondateur de la soif, devenant ainsi totémiques et sacrés.",
        location: "Sabou, Route de Bobo-Dioulasso",
        price: "1 500 XOF",
        rating: 4.7,
        tag: "Crocodiles Sacrés",
        dateRange: "Toute l'année",
        lat: 12.0654,
        lng: -2.2356
      },
      {
        id: "bk_fabedougou",
        name: "Les Dômes de Fabedougou",
        category: "touristic",
        categoryLabel: "Site Touristique Naturel",
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
        description: "De majestueuses structures de grès naturel en forme de pyramides sculptées par l'érosion pluviale et éolienne depuis des millions d'années.",
        location: "Banfora, Région des Cascades",
        price: "1 000 XOF",
        rating: 4.8,
        tag: "Formations Rocheuses",
        dateRange: "Nov - Mai",
        lat: 10.7425,
        lng: -4.7562
      },
      {
        id: "bk_roodwoko",
        name: "Grand Marché Rood-Woko",
        category: "commercial",
        categoryLabel: "Grand Centre Commercial",
        image: "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?q=80&w=1200&auto=format&fit=crop",
        description: "Le cœur économique historique de Ouagadougou. Un labyrinthe animé remplis de tissus Faso Dan Fani, de vannerie, d'épices d'or et de cuir de qualité.",
        location: "Ouagadougou, Centre-Ville",
        price: "Entrée Libre",
        rating: 4.7,
        tag: "Artisanat & Épices",
        dateRange: "Toute l'année",
        lat: 12.3683,
        lng: -1.5216
      },
      {
        id: "bk_artisanal",
        name: "Village Artisanal de Ouagadougou",
        category: "commercial",
        categoryLabel: "Centre Commercial d'Art",
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop",
        description: "Plus de 500 artisans burkinabés d'exception réunis pour faire briller le bronze, la sculpture sur bois, le tissage et la maroquinerie du pays.",
        location: "Ouagadougou, Route de Fada",
        price: "Accès Gratuit",
        rating: 4.9,
        tag: "Créations Uniques",
        dateRange: "Toute l'année",
        lat: 12.3789,
        lng: -1.4876
      },
      {
        id: "bk_siao",
        name: "Parc d'Exposition du SIAO",
        category: "commercial",
        categoryLabel: "Foire Commerciale Continentale",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop",
        description: "Hôte du Salon International de l'Artisanat d'Art de Ouagadougou, le plus grand rassemblement de créateurs d'Afrique.",
        location: "Ouagadougou, Boulevard France-Afrique",
        price: "1 000 XOF",
        rating: 4.9,
        tag: "Achat Direct",
        dateRange: "Saison SIAO",
        lat: 12.3650,
        lng: -1.5030
      },
      {
        id: "bk_m_bobo",
        name: "Grand Marché de Bobo-Dioulasso",
        category: "commercial",
        categoryLabel: "Marché Traditionnel & Artisanal",
        image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=1200&auto=format&fit=crop",
        description: "Marché légendaire aux arcades coloniales où s'échangent d'incroyables instruments de musique (djembés, balafons) et du beurre de karité brut.",
        location: "Bobo-Dioulasso, Kénédougou",
        price: "Entrée Libre",
        rating: 4.6,
        tag: "Instruments & Karité",
        dateRange: "Toute l'année",
        lat: 11.1764,
        lng: -4.2917
      },
      {
        id: "bk_fespaco",
        name: "Festival du FESPACO",
        category: "cultural",
        categoryLabel: "Cinéma & Arts Africains",
        image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop",
        description: "Le Festival Panafricain du Cinéma de Ouagadougou est le plus grand événement du 7ème art sur le continent, récompensant l'excellence cinématographique par le prestigieux Étalon d'or de Yennenga.",
        location: "Ouagadougou, Salles Neerwaya & Capitole",
        price: "1 000 XOF",
        rating: 4.9,
        tag: "Cinéma Mondial",
        dateRange: "Février - Mars",
        lat: 12.3700,
        lng: -1.5300
      },
      {
        id: "bk_snc",
        name: "Semaine Nationale de la Culture (SNC)",
        category: "cultural",
        categoryLabel: "Festival Folklorique & Danses",
        image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop",
        description: "Une célébration majeure des arts vivants de toutes les régions burkinabès : danses traditionnelles, luttes rituelles, musique de balafon et théâtre populaire.",
        location: "Bobo-Dioulasso, Maison de la Culture",
        price: "500 XOF",
        rating: 4.8,
        tag: "Danses & Musiques",
        dateRange: "Mars - Avril",
        lat: 11.1812,
        lng: -4.2980
      }
    ]
  },
  senegal: {
    id: "senegal",
    name: "Sénégal",
    localGreeting: "Na Nga Def",
    localGreetingExplanation: "Salutation Wolof chaleureuse signifiant 'Comment vas-tu ?', à laquelle on répond 'Mangi fi rek' (Je suis là, en paix).",
    capital: "Dakar",
    currency: "Franc CFA (XOF)",
    population: "17,3 Millions",
    tagline: "Le pays de la Teranga (l'hospitalité légendaire)",
    flagEmoji: "🇸🇳",
    overview: "Bordé par l'océan Atlantique, le Sénégal est une terre de convivialité, d'art de vivre et d'histoire. Du cœur vibrant de Dakar aux îles paisibles, il offre une alliance parfaite de traditions et de modernité.",
    landmarks: [
      {
        id: "sen_goree",
        name: "L'Île de Gorée",
        category: "touristic",
        categoryLabel: "Site Touristique & Historique",
        image: "https://images.unsplash.com/photo-1599818817291-a1859c6b8c4d?q=80&w=1200&auto=format&fit=crop",
        description: "Un lieu mémoire classé par l'UNESCO, symbole de la traite négrière avec ses façades aux couleurs pastel ornées de bougainvilliers éclatants.",
        location: "Au large de Dakar"
      },
      {
        id: "sen_lompoul",
        name: "Le Désert de Lompoul",
        category: "landscape",
        categoryLabel: "Plaines & Dunes",
        image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1200&auto=format&fit=crop",
        description: "Une magnifique cuvette d'or s'étendant sur des kilomètres, offrant des plaines de sable ocre d'une beauté saisissante et des nuits sous les étoiles.",
        location: "Région de Louga"
      },
      {
        id: "sen_casamance",
        name: "Les Forêts de Casamance",
        category: "forest",
        categoryLabel: "Forêt & Mangrove",
        image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200&auto=format&fit=crop",
        description: "Une végétation tropicale luxuriante nourrie par d'immenses fleuves, truffée de mangroves majestueuses et d'imposants fromagers (arbres géants).",
        location: "Casamance, Sud du Sénégal"
      },
      {
        id: "sen_seaplaza",
        name: "Sea Plaza & Corniche Ouest",
        category: "modern",
        categoryLabel: "Espace Commercial Moderne",
        image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1200&auto=format&fit=crop",
        description: "Le temple du shopping dakarois en bordure de l'océan Atlantique, symbole de l'élégance, de l'Afrique émergente et de l'architecture urbaine contemporaine.",
        location: "Dakar"
      },
      {
        id: "sen_jazz",
        name: "Festival International de Jazz de Saint-Louis",
        category: "cultural",
        categoryLabel: "Musique & Rythmes d'Afrique",
        image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=1200&auto=format&fit=crop",
        description: "Le plus prestigieux festival de jazz d'Afrique subsaharienne réunissant des légendes de la musique mondiale, mêlée aux sonorités contemporaines locales de kora et sabar.",
        location: "Saint-Louis, Sénégal",
        price: "Gratuit / Payant",
        rating: 4.9,
        tag: "Jazz & Blues",
        dateRange: "Mai"
      },
      {
        id: "sen_dak_art",
        name: "Biennale Dak'Art",
        category: "cultural",
        categoryLabel: "Art Contemporain Africain",
        image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1200&auto=format&fit=crop",
        description: "Une vitrine bisannuelle majeure de créations contemporaines d'art visuel, d'installations, de designs d'éminents créateurs d'Afrique et de sa diaspora.",
        location: "Dakar, Palais de Justice & Galeries",
        price: "Accès Libre",
        rating: 4.8,
        tag: "Exposition Publique",
        dateRange: "Mai - Juin"
      }
    ]
  },
  maroc: {
    id: "maroc",
    name: "Maroc",
    localGreeting: "Ahlan wa Sahlan",
    localGreetingExplanation: "Expression arabe accueillante signifiant 'Bienvenue dans notre famille'.",
    capital: "Rabat",
    currency: "Dirham Marocain (MAD)",
    population: "37,4 Millions",
    tagline: "Un empire des sens entre mer, montagnes et déserts",
    flagEmoji: "🇲🇦",
    overview: "Riche de dynasties successives, le Maroc fusionne l'art arabo-andalou, berbère et saharien. Ses souks dynamiques, ses palais ciselés et ses sommets enneigés de l'Atlas en font une merveille intemporelle.",
    landmarks: [
      {
        id: "mar_chefchaouen",
        name: "La Médina de Chefchaouen",
        category: "touristic",
        categoryLabel: "Site Touristique",
        image: "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1200&auto=format&fit=crop",
        description: "La perle bleue du Rif. Une ville de montagne aux ruelles entièrement peintes de nuances d'indigo et de bleu céleste.",
        location: "Chaouen, Nord du Maroc"
      },
      {
        id: "mar_dades",
        name: "Les Gorges du Dadès",
        category: "landscape",
        categoryLabel: "Vallées & Canyons",
        image: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?q=80&w=1200&auto=format&fit=crop",
        description: "Une succession de canyons spectaculaires bordés de falaises de couleur ocre rouge, sculptées par les vents et la rivière Dadès.",
        location: "Haute Vallée du Dadès"
      },
      {
        id: "mar_cedres",
        name: "La Forêt de Cèdres de l'Atlas",
        category: "forest",
        categoryLabel: "Forêt de Montagne",
        image: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1200&auto=format&fit=crop",
        description: "Un écosystème montagnard unique abritant des cèdres millénaires et les célèbres macaques de Barbarie, s'épanouissant sous la neige en hiver.",
        location: "Azrou, Moyen Atlas"
      },
      {
        id: "mar_moroccomall",
        name: "Morocco Mall",
        category: "modern",
        categoryLabel: "Espace Commercial Moderne",
        image: "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?q=80&w=1200&auto=format&fit=crop",
        description: "L'un des plus grands centres commerciaux d'Afrique, doté d'un aquarium géant de 1 million de litres et de galeries au design ultra-futuriste.",
        location: "Casablanca"
      },
      {
        id: "mar_gnaoua",
        name: "Festival Gnaoua d'Essaouira",
        category: "cultural",
        categoryLabel: "Musiques Métissées & Traditions",
        image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop",
        description: "Un rassemblement légendaire célébrant la musique spirituelle Gnaoua aux sonorités de guembri, mêlée de jazz et de world music face aux remparts de la ville fortifiée d'Essaouira.",
        location: "Essaouira, Côte de l'Atlantique",
        price: "Accès Gratuit",
        rating: 4.9,
        tag: "Incontournable",
        dateRange: "Juin"
      }
    ]
  },
  egypt: {
    id: "egypt",
    name: "Égypte",
    localGreeting: "Marhaban",
    localGreetingExplanation: "Une invitation amicale à entrer en paix et à partager la générosité locale.",
    capital: "Le Caire",
    currency: "Livre Égyptienne (EGP)",
    population: "110 Millions",
    tagline: "Le berceau des civilisations le long du Nil",
    flagEmoji: "🇪🇬",
    overview: "Avec ses 5 000 ans d'histoire écrite, l'Égypte envoûte par ses monuments pharaoniques monumentaux juxtaposés à des centres métropolitains d'une folle énergie.",
    landmarks: [
      {
        id: "egy_pyramids",
        name: "Les Pyramides de Gizeh",
        category: "touristic",
        categoryLabel: "Site Touristique",
        image: "https://images.unsplash.com/photo-1503177119275-0aa32b31d468?q=80&w=1200&auto=format&fit=crop",
        description: "La dernière des sept merveilles du monde antique encore debout, dominant fièrement le plateau saharien face au Sphinx.",
        location: "Plateau de Gizeh, Le Caire"
      },
      {
        id: "egy_desert",
        name: "Le Désert Blanc",
        category: "landscape",
        categoryLabel: "Plaines Sculptées & Oasis",
        image: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?q=80&w=1200&auto=format&fit=crop",
        description: "Des plaines surréalistes de craie blanche immaculée façonnées par le vent, créant des structures calcaires en forme de champignons géants.",
        location: "Dépression de Farafra"
      },
      {
        id: "egy_siwa",
        name: "L'Oasis de Siwa",
        category: "forest",
        categoryLabel: "Forêt de Palmiers & Oasis",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop",
        description: "Un paradis vert secret au milieu des sables brûlants, couvert de centaines de milliers de palmiers-dattiers et d'oliviers encerclant des sources d'eau salée thérapeutiques.",
        location: "Désert Libyque, Ouest de l'Égypte"
      },
      {
        id: "egy_mall",
        name: "Mall of Arabia",
        category: "modern",
        categoryLabel: "Espace Commercial Moderne",
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop",
        description: "Un bijou architectural moderne, combinant des espaces de loisirs intérieurs, de vastes dômes lumineux et des fontaines dansantes spectaculaires.",
        location: "Ville du 6 Octobre, Le Caire"
      },
      {
        id: "egy_film_fest",
        name: "Festival du Film du Caire (CIFF)",
        category: "cultural",
        categoryLabel: "Art Cinématographique & Rituels",
        image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1200&auto=format&fit=crop",
        description: "L'un des plus anciens et prestigieux festivals de cinéma compétitifs du monde arabe, célébrant la richesse de la production égyptienne et le cinéma d'auteur mondial.",
        location: "Opéra du Caire, Zamalek",
        price: "150 EGP",
        rating: 4.8,
        tag: "Cinéma Égyptien",
        dateRange: "Novembre"
      }
    ]
  },
  rdc: {
    id: "rdc",
    name: "RDC (Congo)",
    localGreeting: "Mbote",
    localGreetingExplanation: "Salutation chaleureuse en Lingala pour souhaiter paix et bienveillance à son interlocuteur.",
    capital: "Kinshasa",
    currency: "Franc Congolais (CDF)",
    population: "99 Millions",
    tagline: "Le poumon vert de l'Afrique et le cœur battant du continent",
    flagEmoji: "🇨🇩",
    overview: "La République Démocratique du Congo abrite la deuxième plus grande forêt tropicale humide de la planète et un fleuve Congo monumental. C'est synonyme d'énergie créatrice, de rumba légendaire et de richesses géologiques phénoménales.",
    landmarks: [
      {
        id: "rdc_virunga",
        name: "Parc National des Virunga",
        category: "touristic",
        categoryLabel: "Site Touristique & Réserve",
        image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1200&auto=format&fit=crop",
        description: "Le plus ancien parc national d'Afrique, refuge des célèbres gorilles de montagne au pied de volcans spectaculaires toujours actifs.",
        location: "Nord-Kivu"
      },
      {
        id: "rdc_ruzizi",
        name: "La Vallée de la Ruzizi",
        category: "landscape",
        categoryLabel: "Vallées & Plaines",
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
        description: "Une splendide vallée tectonique verdoyante reliant le lac Kivu au lac Tanganyika, encadrée de collines ondulantes.",
        location: "Sud-Kivu"
      },
      {
        id: "rdc_bassin",
        name: "La Grande Forêt du Bassin du Congo",
        category: "forest",
        categoryLabel: "Forêt Primaire Équatoriale",
        image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=1200&auto=format&fit=crop",
        description: "Le deuxième puits de carbone du monde. Une canopée impénétrable d'arbres géants, abritant des bonobos, des éléphants de forêt et des fleuves sauvages.",
        location: "Bassin Central du Congo"
      },
      {
        id: "rdc_kin_plaza",
        name: "Kin Plaza Mall & Place Gare",
        category: "modern",
        categoryLabel: "Espace Commercial Moderne",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop",
        description: "Complexe architectural de grand standing au cœur des affaires de 'Kin la Belle', reflétant le boom de la classe moyenne et la vitalité congolaise.",
        location: "Kinshasa Gombe"
      },
      {
        id: "rdc_amani",
        name: "Festival Amani",
        category: "cultural",
        categoryLabel: "Musique & Engagement Social",
        image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1200&auto=format&fit=crop",
        description: "Un vibrant événement annuel réunissant des dizaines de milliers de personnes pour danser sur les rythmes de la rumba et du ndombolo, promouvant le vivre-ensemble et la paix.",
        location: "Goma & Région du Kivu",
        price: "1$ US / jour",
        rating: 4.9,
        tag: "Musique pour la Paix",
        dateRange: "Février"
      }
    ]
  },
  south_africa: {
    id: "south_africa",
    name: "Afrique du Sud",
    localGreeting: "Sawubona",
    localGreetingExplanation: "Salutation zouloue profonde signifiant 'Je te vois'. Elle invite à honorer la présence de l'autre.",
    capital: "Prétoria",
    currency: "Rand Sud-Africain (ZAR)",
    population: "60 Millions",
    tagline: "La nation arc-en-ciel où les océans se rencontrent",
    flagEmoji: "🇿🇦",
    overview: "L'Afrique du Sud séduit par sa diversité extrême : des safaris mondialement connus du parc Kruger aux métropoles vibrantes comme Johannesburg et Le Cap, entourées de vignobles réputés et de deux océans majeurs.",
    landmarks: [
      {
        id: "rsa_table",
        name: "La Montagne de la Table",
        category: "touristic",
        categoryLabel: "Site Touristique Majeur",
        image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=1200&auto=format&fit=crop",
        description: "Une structure géologique vertigineuse au sommet plat dominant majestueusement la ville côtière du Cap et l'Atlantique.",
        location: "Le Cap, Afrique du Sud"
      },
      {
        id: "rsa_blyde",
        name: "Le Canyon de la Blyde River",
        category: "landscape",
        categoryLabel: "Vallées & Canyons",
        image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200&auto=format&fit=crop",
        description: "L'un des plus grands canyons verts au monde, offrant des panoramas vertigineux sur des ravins de pierres rouges tapissés de forêts subtropicales.",
        location: "Mpumalanga, Drakensberg"
      },
      {
        id: "rsa_tsitsikamma",
        name: "La Forêt d'Arbres Géants de Tsitsikamma",
        category: "forest",
        categoryLabel: "Forêt Primaire & Côtière",
        image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200&auto=format&fit=crop",
        description: "Une forêt atlantique luxuriante et sauvage en bord d'océan, célèbre pour ses ponts suspendus tumultueux et ses bois de Yellowwood centenaires.",
        location: "Route des Jardins (Garden Route)"
      },
      {
        id: "rsa_mallofafrica",
        name: "Mall of Africa",
        category: "modern",
        categoryLabel: "Espace Commercial Moderne",
        image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1200&auto=format&fit=crop",
        description: "Chef-d'œuvre architectural érigé en une seule phase, s'inspirant des géologies d'Afrique, offrant une esthétique d'acier et de dômes futuristes.",
        location: "Midrand, Johannesburg"
      },
      {
        id: "rsa_arts_festival",
        name: "Festival National des Arts de Makhanda",
        category: "cultural",
        categoryLabel: "Théâtre & Musique Multidisciplinaire",
        image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1200&auto=format&fit=crop",
        description: "Le plus grand festival pluridisciplinaire d'Afrique (théâtre, musique, arts visuels, artisanat d'art), offrant une plateforme d'expression sans filtre depuis 1974.",
        location: "Makhanda (Grahamstown), Eastern Cape",
        price: "Dépend des spectacles",
        rating: 4.8,
        tag: "Arts Visuels & Vivants",
        dateRange: "Juin - Juillet"
      }
    ]
  },
  cote_divoire: {
    id: "cote_divoire",
    name: "Côte d'Ivoire",
    localGreeting: "Akwaba",
    localGreetingExplanation: "Expression baoulé et universelle ivoirienne signifiant 'Bienvenue', portée par l'inoubliable sourire d'Abidjan.",
    capital: "Yamoussoukro",
    currency: "Franc CFA (XOF)",
    population: "28 Millions",
    tagline: "Le carrefour culturel et économique de l'Afrique de l'Ouest",
    flagEmoji: "🇨🇮",
    overview: "Premier producteur mondial de cacao, la Côte d'Ivoire rime avec douceurs lagunaires, gratte-ciels spectaculaires du Plateau, traditions vivaces et ambiance festive inégalée.",
    landmarks: [
      {
        id: "civ_yam",
        name: "La Basilique Notre-Dame de la Paix",
        category: "touristic",
        categoryLabel: "Site Touristique & Monument",
        image: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?q=80&w=1200&auto=format&fit=crop",
        description: "Le plus grand édifice religieux chrétien au monde, une prouesse architecturale alliant marbre précieux et vitraux de maîtres.",
        location: "Yamoussoukro"
      },
      {
        id: "civ_mont",
        name: "Les Plaines & Monts de Man",
        category: "landscape",
        categoryLabel: "Vallées & Montagnes",
        image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop",
        description: "Surnommée 'la ville aux 18 montagnes', elle dévoile des vallées noyées dans la brume matinale et des plaines agricoles d'altitude magnifiques.",
        location: "Région de l'ouest, Man"
      },
      {
        id: "civ_tai",
        name: "Le Parc National de Taï",
        category: "forest",
        categoryLabel: "Forêt Primaire Luxuriante",
        image: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1200&auto=format&fit=crop",
        description: "L'un des derniers vestiges de la forêt primaire d'Afrique de l'Ouest. Patrimoine de l'UNESCO, abritant des arbres hauts de 50m et des chimpanzés doués d'outils.",
        location: "Sud-ouest Ivoirien"
      },
      {
        id: "civ_cap",
        name: "Playce Marcory & Cap Sud",
        category: "modern",
        categoryLabel: "Espace Commercial Moderne",
        image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=1200&auto=format&fit=crop",
        description: "Symbole du dynamisme d'Abidjan, vitrine de la modernité ouest-africaine avec ses marques haut de gamme et ses espaces gastronomiques innovants.",
        location: "Abidjan Zone 4"
      },
      {
        id: "civ_femua",
        name: "FEMUA (Anoumabo)",
        category: "cultural",
        categoryLabel: "Musique & Concerts Sociaux",
        image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop",
        description: "Un immense festival de musique aux dimensions sociales d'envergure continentale et internationale créé par le groupe Magic System, offrant des concerts gratuits et construisant des écoles.",
        location: "Abidjan, Quartier d'Anoumabo",
        price: "Accès Gratuit",
        rating: 4.9,
        tag: "Incontournable",
        dateRange: "Avril"
      }
    ]
  },
  kenya: {
    id: "kenya",
    name: "Kenya",
    localGreeting: "Jambo / Habari",
    localGreetingExplanation: "Salutation swahili amicale. On répond souvent 'Nzuri' (Tout va bien) ou 'Hakuna Matata' (Aucun problème).",
    capital: "Nairobi",
    currency: "Shilling Kenyan (KES)",
    population: "54 Millions",
    tagline: "Le cœur sauvage des grands safaris d'Afrique",
    flagEmoji: "🇰🇪",
    overview: "Le Kenya est synonyme de paysages de cartes postales : la savane dorée du Masai Mara traversée par d'immenses troupeaux de gnous, les sommets glacés du Mont Kenya et les eaux turquoise de l'océan Indien.",
    landmarks: [
      {
        id: "ken_mara",
        name: "La Réserve du Masai Mara",
        category: "touristic",
        categoryLabel: "Site Touristique Naturel",
        image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?q=80&w=1200&auto=format&fit=crop",
        description: "Le théâtre de la grande migration annuelle des gnous et zèbres, sanctuaire inviolable des lions, guépards et éléphants.",
        location: "Sud-Ouest du Kenya"
      },
      {
        id: "ken_rift",
        name: "La Vallée du Grand Rift",
        category: "landscape",
        categoryLabel: "Vallées & Lacs",
        image: "https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=1200&auto=format&fit=crop",
        description: "Une immense tranchée tectonique parsemée de lacs alcalins roses occupés par des millions de flamants roses et d'imposantes falaises rocheuses.",
        location: "Traversée nationale"
      },
      {
        id: "ken_karura",
        name: "La Forêt Tropicale de Karura",
        category: "forest",
        categoryLabel: "Forêt Urbaine Majeure",
        image: "https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?q=80&w=1200&auto=format&fit=crop",
        description: "Un trésor vert au cœur de Nairobi sauvé par la prix Nobel Wangari Maathai, riche de grottes sacrées berbères, de cascades et de faune.",
        location: "Nairobi Nord"
      },
      {
        id: "ken_tworivers",
        name: "Two Rivers Mall",
        category: "modern",
        categoryLabel: "Espace Commercial Moderne",
        image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1200&auto=format&fit=crop",
        description: "Le plus grand centre d'affaires et de divertissement d'Afrique de l'Est, doté de dômes de verre géants, d'une grande roue et d'un fleuve aménagé.",
        location: "Limuru Road, Nairobi"
      },
      {
        id: "ken_lamu_festival",
        name: "Festival Culturel Swahili de Lamu",
        category: "cultural",
        categoryLabel: "Patrimoine & Traditions Swahili",
        image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?q=80&w=1200&auto=format&fit=crop",
        description: "Une immersion envoûtante dans le mode de vie séculaire préservé de l'archipel swahili : courses de dhows traditionnels, compétitions de dromadaires et henné.",
        location: "Île de Lamu, Côte Swahili",
        price: "Accès Libre",
        rating: 4.9,
        tag: "Incontournable",
        dateRange: "Novembre"
      }
    ]
  }
};
