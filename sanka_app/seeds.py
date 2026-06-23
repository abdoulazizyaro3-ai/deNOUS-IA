# sanka_app/seeds.py
from sanka_app.models import KnowledgeNode, KnowledgeLink, Profile
from django.contrib.auth.models import User
from django.utils import timezone
import uuid


def seed_database():
    """
    Remplit la base de données avec des données initiales.
    """
    print("🌱 Début du seeding de la base de données...")
    
    # Clear existing data
    KnowledgeNode.objects.all().delete()
    KnowledgeLink.objects.all().delete()
    print("🗑️ Données existantes supprimées")
    
    # ============================================================
    # 1. CRÉATION D'UN PROFIL ADMIN PAR DÉFAUT
    # ============================================================
    try:
        admin_user, created = User.objects.get_or_create(
            username="admin",
            defaults={
                "email": "admin@denous.ai",
                "is_staff": True,
                "is_superuser": True
            }
        )
        if created:
            admin_user.set_password("admin123")
            admin_user.save()
            
            Profile.objects.create(
                user=admin_user,
                full_name="Administrateur deNOUS AI",
                role="moderator",
                country="Mali",
                region="Bamako",
                wisdom_points=1000,
                level=5,
                rank="Sage Suprême",
                is_verified=True
            )
            print("👤 Profil administrateur créé")
    except Exception as e:
        print(f"⚠️ Erreur création admin: {e}")
    
    # ============================================================
    # 2. DONNÉES DES NŒUDS DE CONNAISSANCE
    # ============================================================
    nodes_data = [
        {
            "id": "zai-method",
            "title": "🌾 Méthode Agricole du Zaï",
            "category": "traditionnelle",
            "theme": "agriculture",
            "description": "Technique ancestrale de restauration des sols arides inventée et affinée en Afrique de l'Ouest (notamment au Burkina Faso par Yacouba Sawadogo). Elle consiste à creuser des poquets (petits trous) de 20-30 cm de diamètre durant la saison sèche et d'y placer du compost. Cela attire les termites sauvages qui creusent des galeries, facilitant l'infiltration d'eau lors des premières pluies et préservant l'humidité pour le mil ou le sorgho.",
            "language": "Mooré",
            "region": "Secteur Or de Yatenga",
            "country": "Burkina Faso",
            "ethnolinguistic_group": "Mossi",
            "period": "Contemporaine (popularisée depuis ~1980)",
            "reliability_score": 98,
            "source": "Yacouba Sawadogo (L'homme qui arrêta le désert)",
            "source_type": "témoignage humain",
            "consent_provided": True,
            "speaker_age": "76",
            "speaker_gender": "Masculin",
            "speaker_role": "Sage & Agriculteur récipiendaire",
            "details": "Cette technique résiliente a permis de reverdir plus de 3 millions d'hectares de terres dégradées au Sahel. Le Zaï forestier permet de planter également des arbres fertilisants à côté des céréales. Elle est aujourd'hui enseignée dans les écoles d'agronomie comme modèle d'adaptation climatique."
        },
        {
            "id": "kurukan-fuga",
            "title": "📜 Charte de Kurukan Fuga",
            "category": "historique",
            "theme": "governance",
            "description": "Proclamée en 1236 après la bataille de Kirina par l'empereur Soundiata Keïta, cette charte constitue la première constitution de l'Empire du Mali et l'une des plus anciennes déclarations de droits de l'homme au monde. Transmise oralement par les confréries de griots, elle régit la paix sociale, la liberté individuelle, l'égalité des clans, et proscrit les abus de pouvoir.",
            "language": "Mandinka",
            "region": "Kangaba (Kurukan Fuga)",
            "country": "Mali",
            "ethnolinguistic_group": "Mandingue",
            "period": "Précoloniale (~1236)",
            "reliability_score": 96,
            "source": "Société des Griots de Kangaba / UNESCO",
            "source_type": "tradition orale",
            "consent_provided": True,
            "speaker_age": "Inconnue",
            "speaker_gender": "Collectif",
            "speaker_role": "Griots Traditionalistes",
            "details": "La charte comporte 44 articles touchant à la paix sociale, l'écologie (protection des forêts), la propriété, et la responsabilité civique. Elle fut inscrite sur la liste du patrimoine culturel immatériel de l'humanité de l'UNESCO en 2009."
        },
        {
            "id": "artemisia-afra",
            "title": "🌿 Tradition médicinale de l'Artemisia Afra",
            "category": "traditionnelle",
            "theme": "health",
            "description": "Plante vivace africaine connue localement sous le nom de 'Lengana' ou 'Umhlonyane' (Xhosa/Zulu). Elle s'utilise traditionnellement en infusion ou décoction des feuilles pour apaiser les bronches, la grippe, la toux, la fièvre et pour lutter contre le paludisme. Elle incarne la pharmacopée traditionnelle sud-africaine et est-africaine hautement protégée.",
            "language": "IsiZulu",
            "region": "Limpopo / Kwazulu-Natal",
            "country": "Afrique du Sud",
            "ethnolinguistic_group": "Nguni (Zulu et Xhosa)",
            "period": "Ancestrale",
            "reliability_score": 92,
            "source": "Conseil des tradipraticiens du Mpumalanga",
            "source_type": "savoirs traditionnels",
            "consent_provided": True,
            "speaker_age": "64",
            "speaker_gender": "Féminin",
            "speaker_role": "Sangoma / Guérisseuse communautaire",
            "details": "Un protocole de Nagoya strict régit son exploitation commerciale afin d'assurer que les retombées bénéficient financièrement et équitablement aux communautés gardiennes de ce savoir. Des recherches modernes confirment ses propriétés antipaludiques."
        },
        {
            "id": "timbuktu-manuscripts",
            "title": "📚 Manuscrits Scientifiques de Tombouctou",
            "category": "historique",
            "theme": "history",
            "description": "Vaste collection de centaines de milliers de manuscrits médiévaux couvrant l'astronomie, la médecine, le droit, les mathématiques et la théologie rédigés par des savants d'Afrique subsaharienne à l'Université de Sankoré. Beaucoup sont transcrits en Ajami (langues locales comme le Songhaï ou le Tamasheq écrites en caractères arabes).",
            "language": "Songhai / Ajami",
            "region": "Bibliothèque Mamma Haidara, Tombouctou",
            "country": "Mali",
            "ethnolinguistic_group": "Songhaï / Touareg",
            "period": "Précoloniale (~14-16e siècle)",
            "reliability_score": 95,
            "source": "Institut des Hautes Études et de Recherches Islamiques Ahmed Baba",
            "source_type": "archives historiques",
            "consent_provided": True,
            "speaker_age": "Inconnue",
            "speaker_gender": "Collectif",
            "speaker_role": "Savants Historiques",
            "details": "Ces manuscrits prouvent de façon irréfutable l'existence d'une riche tradition académique et scientifique universitaire rigoureuse au cœur du Sahel bien avant la période moderne. Des projets de numérisation sont en cours pour les préserver."
        },
        {
            "id": "geez-script",
            "title": "✍️ Système d'écriture Gé'ez",
            "category": "historique",
            "theme": "linguistics",
            "description": "Le Gé'ez est le système d'écriture originel de l'Éthiopie et de l'Érythrée, l'un des rares alphabets originels natifs encore activement utilisés en Afrique. Il s'agit d'un alphasyllabaire (abugida) développé il y a plus de 2000 ans, qui sert à retranscrire le gé'ez classique, l'amharique et le tigrigna.",
            "language": "Amharique",
            "region": "Aksum / Lalibela",
            "country": "Éthiopie",
            "ethnolinguistic_group": "Semito-Cushitic",
            "period": "Précoloniale (~1er siècle av. J.-C.)",
            "reliability_score": 99,
            "source": "Bibliothèque de Lalibela / Patriarcat Orthodoxe d'Addis-Abeba",
            "source_type": "archives historiques",
            "consent_provided": True,
            "speaker_age": "Inconnue",
            "speaker_gender": "Collectif",
            "speaker_role": "Traditionalistes Littéraires",
            "details": "L'écriture gé'ez comporte 26 caractères de base, chacun se déclinant en 7 formes différentes pour retranscrire l'association d'une consonne et d'une voyelle. C'est un système d'écriture fascinant utilisé pour la liturgie orthodoxe éthiopienne."
        },
        {
            "id": "ifa-wisdom",
            "title": "🕯️ Système divinatoire de l'Ifá",
            "category": "traditionnelle",
            "theme": "culture",
            "description": "Le système Ifá est un corpus littéraire de philosophie, de poésie et de spiritualité transmis oralement, utilisé par le peuple Yoruba et d'autres groupes d'Afrique de l'Ouest. Composé de 256 volumes (Odu), il relate de l'ordre cosmique, de l'éthique humaine, de la médecine naturelle et des solutions aux disputes sociétales.",
            "language": "Yoruba",
            "region": "Ogun / Ile-Ife",
            "country": "Nigeria",
            "ethnolinguistic_group": "Yoruba",
            "period": "Ancienne",
            "reliability_score": 94,
            "source": "Académie du Babalawo Adebayo, État d'Osun",
            "source_type": "tradition orale",
            "consent_provided": True,
            "speaker_age": "80",
            "speaker_gender": "Masculin",
            "speaker_role": "Babalawo (Grand Prêtre de sagesse)",
            "details": "Le Ifá agit comme une encyclopédie thérapeutique et philosophique vivante. Classé au patrimoine de l'UNESCO comme Chef-d'œuvre du patrimoine oral et immatériel de l'humanité."
        },
        {
            "id": "shea-butter",
            "title": "🧈 Savoir-faire du Beurre de Karité",
            "category": "traditionnelle",
            "theme": "craft",
            "description": "Le beurre de karité est extrait des noix de l'arbre Vitellaria paradoxa, originaire des savanes d'Afrique de l'Ouest. Les femmes rurales maîtrisent un processus complexe de cueillette, décorticage, torréfaction, broyage et barattage manuel pour obtenir cette matière grasse précieuse utilisée en cosmétique, en cuisine et en pharmacopée.",
            "language": "Bambara",
            "region": "Sikasso / Koutiala",
            "country": "Mali",
            "ethnolinguistic_group": "Bambara / Sénoufo",
            "period": "Ancestrale",
            "reliability_score": 91,
            "source": "Coopérative des Femmes de Koutiala",
            "source_type": "savoir-faire traditionnel",
            "consent_provided": True,
            "speaker_age": "58",
            "speaker_gender": "Féminin",
            "speaker_role": "Cheffe de coopérative",
            "details": "Le karité est un pilier de l'économie féminine rurale. Le beurre est commercialisé à l'export, mais les communautés gardent un droit de regard sur l'utilisation des terres et la récolte durable des fruits sauvages."
        },
        {
            "id": "djembe-rhythm",
            "title": "🥁 Rythmes Sacrés du Djembé",
            "category": "traditionnelle",
            "theme": "culture",
            "description": "Le djembé est un tambour en forme de gobelet originaire de l'Empire du Mali, joué principalement par les ethnies Mandingue. Chaque rythme traditionnel a une signification sociale précise : danse de récolte, rites de passage, cérémonies de guérison, ou appel à la communauté. La transmission se fait de maître à élève dans les 'dendromes' (maisons de tambours).",
            "language": "Bambara / Malinké",
            "region": "Ségou / Kita",
            "country": "Mali",
            "ethnolinguistic_group": "Mandingue",
            "period": "Traditionnelle",
            "reliability_score": 93,
            "source": "Famille Kouyaté - Maître de Djembé",
            "source_type": "tradition orale",
            "consent_provided": True,
            "speaker_age": "72",
            "speaker_gender": "Masculin",
            "speaker_role": "Griot / Maître Tambourinaire",
            "details": "Le djembé traditionnel est sculpté dans un seul tronc de bois (lenké) et tendu avec des cordes de chèvre. Les rythmes sont appelés 'rythmes de la savane'. L'UNESCO reconnaît ces pratiques comme un pan vivant de l'humanité."
        },
        {
            "id": "medicinal-garden",
            "title": "🌱 Jardin Médicinal des Sages Mossis",
            "category": "traditionnelle",
            "theme": "health",
            "description": "Connaissance des plantes médicinales chez les Mossis du Burkina Faso, structurée autour d'un jardin sacré où l'on cultive neem, moringa, et espèces locales utilisées pour les fièvres, les infections, les troubles digestifs et les soins post-partum.",
            "language": "Mooré",
            "region": "Plateau Central, Kaya",
            "country": "Burkina Faso",
            "ethnolinguistic_group": "Mossi",
            "period": "Ancestrale",
            "reliability_score": 90,
            "source": "Aîné Boukari de Kaya",
            "source_type": "savoirs traditionnels",
            "consent_provided": True,
            "speaker_age": "68",
            "speaker_gender": "Masculin",
            "speaker_role": "Herboriste et Sage",
            "details": "Les feuilles de moringa sont utilisées contre la malnutrition, et les extraits de neem contre les parasites. Ce jardin est un modèle de résilience climatique dans le Sahel."
        }
    ]

    # Création des nœuds
    for item in nodes_data:
        node = KnowledgeNode.objects.create(
            node_id=item["id"],
            title=item["title"],
            category=item["category"],
            theme=item["theme"],
            description=item["description"],
            language=item["language"],
            region=item["region"],
            country=item["country"],
            ethnolinguistic_group=item["ethnolinguistic_group"],
            period=item["period"],
            reliability_score=item["reliability_score"],
            source=item["source"],
            source_type=item["source_type"],
            consent_provided=item["consent_provided"],
            speaker_profile={
                "age": item.get("speaker_age"),
                "gender": item.get("speaker_gender"),
                "role": item.get("speaker_role")
            },
            raw_content=item.get("details", "")
        )
    print(f"📚 {len(nodes_data)} nœuds de connaissance créés")

    # ============================================================
    # 3. DONNÉES DES LIENS
    # ============================================================
    links_data = [
        {
            "source": "kurukan-fuga",
            "target": "timbuktu-manuscripts",
            "relation_type": "regional_synergy",
            "description": "La Charte de Kurukan Fuga a défini le socle de liberté de circulation intellectuelle au Mali, favorisant l'épanouissement de l'Université de Sankoré à Tombouctou."
        },
        {
            "source": "ifa-wisdom",
            "target": "artemisia-afra",
            "relation_type": "medical_philosophy",
            "description": "Ifá préconise l'équilibre spirituel et corporel via l'utilisation sacrée des plantes amères de type Artemisia pour purifier le sang."
        },
        {
            "source": "timbuktu-manuscripts",
            "target": "geez-script",
            "relation_type": "literary_connection",
            "description": "Rapports d'influences documentés et d'échanges de manuscrits en caractères originaux entre l'Éthiopie chrétienne et les universités islamiques sahéliennes."
        },
        {
            "source": "zai-method",
            "target": "medicinal-garden",
            "relation_type": "ecological_complement",
            "description": "Le Zaï permet de restaurer la fertilité des sols pour accueillir les jardins médicinaux dans le Sahel."
        },
        {
            "source": "shea-butter",
            "target": "medicinal-garden",
            "relation_type": "local_economy",
            "description": "Le beurre de karité issu des terres réhabilitées par les femmes est utilisé dans la pharmacopée pour soigner les peaux et préparer les onguents médicinaux."
        },
        {
            "source": "djembe-rhythm",
            "target": "kurukan-fuga",
            "relation_type": "cultural_heritage",
            "description": "Les rythmes sacrés du djembé accompagnent la récitation des articles de la Charte de Kurukan Fuga lors des grandes cérémonies traditionnelles."
        }
    ]

    # Création des liens
    for item in links_data:
        try:
            source_node = KnowledgeNode.objects.get(node_id=item["source"])
            target_node = KnowledgeNode.objects.get(node_id=item["target"])
            
            KnowledgeLink.objects.create(
                source_node=source_node,
                target_node=target_node,
                relation_type=item["relation_type"],
                description=item["description"]
            )
        except KnowledgeNode.DoesNotExist as e:
            print(f"⚠️ Lien ignoré: nœud {item['source']} ou {item['target']} introuvable")
    
    print(f"🔗 {len(links_data)} liens de connaissance créés")

    # ============================================================
    # 5. DONNÉES DES DICTIONNAIRES DE LANGUES LOCALES
    # ============================================================
    try:
        from sanka_app.models import LocalDictionary
        LocalDictionary.objects.all().delete()
        print("🗑️ Dictionnaires existants supprimés")
        
        dictionary_data = [
            {
                "id": "dict-dioula-bambara",
                "title": "Lexique et Alphabet Dioula / Bambara",
                "language": "bambara",
                "description": "Alphabet officiel et vocabulaire de base en Bambara et Dioula pour l'assistant vocal. Contient les règles d'expression, salutations et lexique agricole.",
                "extracted_text": """
                ALPHABET BAMBARA / DIOULA :
                Voyelles: a, e, ɛ (è), i, o, ɔ (o ouvert), u (ou). Les voyelles peuvent être nasalisées (an, en, ɛn, in, on, ɔn, un).
                Consonnes: b, c (tsh), d, f, g, h, j (dj), k, l, m, n, ɲ (gn), ŋ (ng), p, r, s, t, w, y.
                
                SALUTATIONS DE BASE :
                - Bonjour (le matin) : "I ni sogoma" (singulier) / "Aw ni sogoma" (pluriel).
                - Bonsoir / Bonne après-midi : "I ni tle" (singulier) / "Aw ni tle".
                - Bonne nuit : "I ni wuula" (singulier) / "Aw ni wuula".
                - Comment ça va ? : "Hɛrɛ sira ?" (Tu as passé la nuit en paix ?) ou "K'an bɛn ?" (À bientôt).
                - Merci : "I ni ce" (singulier) / "Aw ni ce".
                - S'il te plaît : "Sabali".
                - Oui : "Ɔwɔ" ou "Ayiwa".
                - Non : "Ayi".
                - Bienvenue : "I niama" ou "Aw bisimilah".
                
                LEXIQUE AGRICOLE :
                - Champ : "Foro"
                - Terre / Sol : "Dugukolo"
                - Eau : "Ji"
                - Pluie : "Sanji"
                - Semence / Graine : "Kise"
                - Maïs : "Kabalo"
                - Mil : "Gno" ou "Nyɔ"
                - Coton : "Kori"
                - Récolte : "Karaso" ou "Sumaroko"
                - Travail : "Baara"
                - Culture / Agriculture : "Senekɛ"
                - Paysan / Agriculteur : "Senekɛla"
                - Engrais / Compost : "Forobolo" ou "Nogo"
                - Arbre : "Jiri"
                """
            },
            {
                "id": "dict-moore",
                "title": "Lexique et Alphabet Mooré",
                "language": "moore",
                "description": "Alphabet officiel et glossaire de base en Mooré (langue des Mossis) pour les salutations traditionnelles, l'agroécologie et la pharmacopée.",
                "extracted_text": """
                ALPHABET MOORÉ :
                Voyelles: a, e, ɛ, i, o, ɔ, u, ɩ, ʋ. Elles peuvent être longues ou nasalisées.
                Consonnes: b, d, f, g, h, k, l, m, n, p, r, s, t, w, y, z, gy, ky.
                
                SALUTATIONS DE BASE :
                - Bonjour (le matin) : "Ne yibeogo" (singulier et pluriel).
                - Bonsoir / Après-midi : "Ne zaabre".
                - Comment ça va ? : "Laafi be ?" (La paix est-elle là ?)
                - Réponse : "Laafi bala" (La paix seulement).
                - Merci : "Barka" (Bénédiction / Merci).
                - S'il te plaît : "M pʋsira barka" ou "M pʋsira".
                - Oui : "Nye".
                - Non : "Ayo".
                - Bienvenue : "Ne reego".
                
                LEXIQUE DE L'AGROÉCOLOGIE & TRADITIONS :
                - Champ : "Pugo"
                - Terre / Sol : "Tenga"
                - Eau : "Koom"
                - Pluie : "Saaga"
                - Semence : "Bile"
                - Mil / Sorgho : "Kaze"
                - Maïs : "Kama"
                - Arbre / Plante : "Tiga"
                - Médecine / Plante médicinale : "Tiiya"
                - Guérisseur / Sage : "Tiim-soba"
                - Méthode du Zaï : "Zaï" (Technique de creuser des trous pour cultiver).
                - Travail : "Tuumde"
                """
            }
        ]
        
        for item in dictionary_data:
            LocalDictionary.objects.create(
                dictionary_id=item["id"],
                title=item["title"],
                language=item["language"],
                description=item["description"],
                extracted_text=item["extracted_text"]
            )
        print(f"📚 {len(dictionary_data)} dictionnaires linguistiques de démonstration créés")
    except Exception as e:
        print(f"⚠️ Erreur création dictionnaires: {e}")
        
    print("✅ Seeding terminé avec succès !")
    print("🌍 Base de données prête pour deNOUS AI")


if __name__ == "__main__":
    seed_database()