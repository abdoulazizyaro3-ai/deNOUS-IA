from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

# ============================================
# 1. TABLE UTILISATEURS / CONTRIBUTEURS
# ============================================
class Profile(models.Model):
    """
    Profil utilisateur étendu
    """
    ROLE_CHOICES = [
        ('user', 'Utilisateur'),
        ('moderator', 'Modérateur'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.URLField(max_length=500, blank=True, null=True)
    full_name = models.CharField(max_length=255)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='contributor')
    country = models.CharField(max_length=100, blank=True, null=True)
    region = models.CharField(max_length=255, blank=True, null=True)
    ethnolinguistic_group = models.CharField(max_length=255, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    wisdom_points = models.IntegerField(default=0)
    level = models.IntegerField(default=1)
    rank = models.CharField(max_length=100, default='Apprenti')
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.full_name} - {self.role}"
    
    def to_dict(self):
        return {
            "id": self.user.id,
            "fullName": self.full_name,
            "avatar": self.avatar,
            "role": self.role,
            "country": self.country,
            "region": self.region,
            "ethnolinguisticGroup": self.ethnolinguistic_group,
            "bio": self.bio,
            "wisdomPoints": self.wisdom_points,
            "level": self.level,
            "rank": self.rank,
            "isVerified": self.is_verified,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


# ============================================
# 2. TABLE DES SAVOIRS / CONNAISSANCES
# ============================================
class KnowledgeNode(models.Model):
    """
    Nœud de connaissance - Savoir traditionnel
    """
    CATEGORY_CHOICES = [
        ('agriculture', '🌾 Agriculture & Élevage'),
        ('health', '💊 Pharmacopée & Santé'),
        ('culture', '🏛️ Tradition & Culture'),
        ('education', '🎓 Enseignement & Éducation'),
        ('history', '📜 Histoire & Épopées'),
        ('spirituality', '🕊️ Spiritualité & Croyances'),
        ('language', '🗣️ Langue & Oralité'),
        ('craft', '🛠️ Artisanat & Savoir-faire'),
    ]
    
    THEME_CHOICES = [
        ('agroecology', 'Agroécologie'),
        ('medicinal', 'Médecine traditionnelle'),
        ('proverb', 'Proverbe'),
        ('tale', 'Conte'),
        ('ritual', 'Rituel'),
        ('song', 'Chant'),
        ('dance', 'Danse'),
        ('recipe', 'Recette'),
        ('technique', 'Technique traditionnelle'),
    ]
    
    PERIOD_CHOICES = [
        ('ancient', 'Ancien'),
        ('medieval', 'Médiéval'),
        ('colonial', 'Période coloniale'),
        ('contemporary', 'Contemporain'),
        ('modern', 'Moderne'),
    ]
    
    node_id = models.CharField(max_length=255, primary_key=True)
    
    # Contenu principal
    title = models.CharField(max_length=255)
    description = models.TextField()
    raw_content = models.TextField(blank=True, null=True)
    translated_content = models.TextField(blank=True, null=True)
    
    # Catégorisation
    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES)
    theme = models.CharField(max_length=100, choices=THEME_CHOICES)
    subtheme = models.CharField(max_length=255, blank=True, null=True)
    
    # Origine géographique et culturelle
    country = models.CharField(max_length=100)
    region = models.CharField(max_length=255)
    city = models.CharField(max_length=255, blank=True, null=True)
    ethnolinguistic_group = models.CharField(max_length=255)
    language = models.CharField(max_length=100)
    dialect = models.CharField(max_length=100, blank=True, null=True)
    
    # Période
    period = models.CharField(max_length=100, choices=PERIOD_CHOICES, default='contemporary')
    year_estimated = models.CharField(max_length=20, blank=True, null=True)
    
    # Fiabilité et validation
    reliability_score = models.IntegerField(default=0)
    validation_status = models.CharField(max_length=50, default='pending', choices=[
        ('pending', 'En attente de validation'),
        ('verified', 'Validé par un aîné'),
        ('contested', 'Contesté'),
        ('rejected', 'Rejeté'),
    ])
    validated_by = models.ForeignKey(Profile, on_delete=models.SET_NULL, null=True, blank=True, related_name='validated_knowledge')
    validation_date = models.DateTimeField(blank=True, null=True)
    validation_notes = models.TextField(blank=True, null=True)
    
    # Source
    source_type = models.CharField(max_length=100, choices=[
        ('oral', 'Oral'),
        ('written', 'Écrit'),
        ('audiovisual', 'Audiovisuel'),
        ('mixed', 'Mixte'),
    ], default='oral')
    source = models.CharField(max_length=255)
    source_contact = models.CharField(max_length=255, blank=True, null=True)
    
    # Consentement
    consent_provided = models.BooleanField(default=True)
    consent_date = models.DateTimeField(auto_now_add=True)
    consent_notes = models.TextField(blank=True, null=True)
    
    # Profil du locuteur
    speaker_profile = models.JSONField(default=dict, blank=True)
    
    # Métadonnées
    tags = models.JSONField(default=list, blank=True)
    keywords = models.JSONField(default=list, blank=True)
    views_count = models.IntegerField(default=0)
    likes_count = models.IntegerField(default=0)
    shares_count = models.IntegerField(default=0)
    
    # Contributeur
    contributor = models.ForeignKey(Profile, on_delete=models.SET_NULL, null=True, blank=True, related_name='contributions')
    
    # Dates
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['country', 'language']),
            models.Index(fields=['category', 'theme']),
            models.Index(fields=['validation_status']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.country}"
    
    def to_dict(self):
        return {
            "id": self.node_id,
            "title": self.title,
            "description": self.description,
            "rawContent": self.raw_content,
            "translatedContent": self.translated_content,
            "category": self.category,
            "theme": self.theme,
            "subtheme": self.subtheme,
            "country": self.country,
            "region": self.region,
            "city": self.city,
            "ethnolinguisticGroup": self.ethnolinguistic_group,
            "language": self.language,
            "dialect": self.dialect,
            "period": self.period,
            "yearEstimated": self.year_estimated,
            "reliabilityScore": self.reliability_score,
            "validationStatus": self.validation_status,
            "validatedBy": self.validated_by.full_name if self.validated_by else None,
            "validationDate": self.validation_date.isoformat() if self.validation_date else None,
            "validationNotes": self.validation_notes,
            "sourceType": self.source_type,
            "source": self.source,
            "sourceContact": self.source_contact,
            "consentProvided": self.consent_provided,
            "speakerProfile": self.speaker_profile,
            "tags": self.tags,
            "keywords": self.keywords,
            "viewsCount": self.views_count,
            "likesCount": self.likes_count,
            "sharesCount": self.shares_count,
            "contributor": self.contributor.full_name if self.contributor else None,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
            "publishedAt": self.published_at.isoformat() if self.published_at else None,
        }


# ============================================
# 3. TABLE DES CONVERSATIONS
# ============================================
class Conversation(models.Model):
    """
    Conversation entre l'utilisateur et deNOUS AI
    """
    CONVERSATION_TYPE = [
        ('vocal', 'Vocal'),
        ('text', 'Text'),
        ('mixed', 'Mixte'),
    ]
    
    user = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='conversations')
    title = models.CharField(max_length=255, default='Nouvelle conversation')
    type = models.CharField(max_length=50, choices=CONVERSATION_TYPE, default='mixed')
    language = models.CharField(max_length=100, default='Français')
    detected_language = models.CharField(max_length=100, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    message_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} - {self.user.full_name}"
    
    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "type": self.type,
            "language": self.language,
            "detectedLanguage": self.detected_language,
            "isActive": self.is_active,
            "messageCount": self.message_count,
            "messages": [msg.to_dict() for msg in self.messages.all().order_by('created_at')],
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }


# ============================================
# 4. TABLE DES MESSAGES
# ============================================
class Message(models.Model):
    """
    Message individuel dans une conversation
    """
    SENDER_CHOICES = [
        ('user', 'Utilisateur'),
        ('ai', 'Assistant IA'),
        ('system', 'Système'),
    ]
    
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.CharField(max_length=50, choices=SENDER_CHOICES)
    content = models.TextField()
    translated_content = models.TextField(blank=True, null=True)
    language_detected = models.CharField(max_length=100, blank=True, null=True)
    is_audio = models.BooleanField(default=False)
    audio_duration = models.CharField(max_length=50, blank=True, null=True)
    audio_url = models.URLField(max_length=500, blank=True, null=True)
    
    referenced_knowledge = models.ManyToManyField(KnowledgeNode, blank=True, related_name='referenced_in_messages')
    
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.sender}: {self.content[:50]}..."
    
    def to_dict(self):
        return {
            "id": self.id,
            "sender": self.sender,
            "text": self.content,
            "translatedText": self.translated_content,
            "languageDetected": self.language_detected,
            "timestamp": self.created_at.strftime("%H:%M"),
            "isAudio": self.is_audio,
            "audioDuration": self.audio_duration,
            "audioUrl": self.audio_url,
            "referencedKnowledge": [node.to_dict() for node in self.referenced_knowledge.all()],
            "metadata": self.metadata,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


# ============================================
# 5. TABLE DES LIENS DE CONNAISSANCES
# ============================================
class KnowledgeLink(models.Model):
    """
    Liens entre les nœuds de connaissance
    """
    RELATION_TYPES = [
        ('related_to', 'Lié à'),
        ('derived_from', 'Dérivé de'),
        ('influenced_by', 'Influencé par'),
        ('similar_to', 'Similaire à'),
        ('contradicts', 'Contredit'),
        ('complements', 'Complète'),
        ('evolved_from', 'Évolué de'),
        ('variant_of', 'Variante de'),
    ]
    
    source_node = models.ForeignKey(KnowledgeNode, on_delete=models.CASCADE, related_name='outgoing_links')
    target_node = models.ForeignKey(KnowledgeNode, on_delete=models.CASCADE, related_name='incoming_links')
    relation_type = models.CharField(max_length=100, choices=RELATION_TYPES)
    description = models.TextField(blank=True, null=True)
    strength = models.IntegerField(default=50)
    created_by = models.ForeignKey(Profile, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['source_node', 'target_node', 'relation_type']
    
    def __str__(self):
        return f"{self.source_node.title} → {self.target_node.title} ({self.relation_type})"
    
    def to_dict(self):
        return {
            "source": self.source_node.node_id,
            "target": self.target_node.node_id,
            "type": self.relation_type,
            "description": self.description,
            "strength": self.strength,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


# ============================================
# 6. TABLE DES ACTIVITÉS / LOGS
# ============================================
class ActivityLog(models.Model):
    """
    Journal des activités des agents IA
    """
    ACTION_CHOICES = [
        ('orchestration', 'Orchestration'),
        ('routing', 'Routage'),
        ('validation', 'Validation'),
        ('translation', 'Traduction'),
        ('analysis', 'Analyse'),
        ('search', 'Recherche'),
        ('synthesis', 'Synthèse'),
    ]
    
    STATUS_CHOICES = [
        ('success', 'Succès'),
        ('pending', 'En cours'),
        ('failed', 'Échec'),
        ('warning', 'Avertissement'),
    ]
    
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, null=True, blank=True, related_name='activities')
    agent_name = models.CharField(max_length=255)
    agent_role = models.CharField(max_length=255)
    action = models.CharField(max_length=100, choices=ACTION_CHOICES)
    description = models.TextField()
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='success')
    metadata = models.JSONField(default=dict, blank=True)
    duration_ms = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.agent_name} - {self.action} - {self.status}"
    
    def to_dict(self):
        return {
            "agentName": self.agent_name,
            "role": self.agent_role,
            "action": self.action,
            "description": self.description,
            "status": self.status,
            "metadata": self.metadata,
            "durationMs": self.duration_ms,
            "timestamp": self.created_at.isoformat() if self.created_at else None,
        }


# ============================================
# 7. TABLE DES NOTIFICATIONS
# ============================================
class Notification(models.Model):
    """
    Notifications utilisateur
    """
    NOTIFICATION_TYPES = [
        ('validation', 'Validation de savoir'),
        ('contribution', 'Nouvelle contribution'),
        ('achievement', 'Récompense'),
        ('system', 'Système'),
        ('message', 'Message'),
    ]
    
    user = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    link = models.CharField(max_length=500, blank=True, null=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.user.full_name}"
    
    def to_dict(self):
        return {
            "id": self.id,
            "type": self.type,
            "title": self.title,
            "message": self.message,
            "isRead": self.is_read,
            "link": self.link,
            "metadata": self.metadata,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


# ============================================
# 8. TABLE DES RESSOURCES MULTIMÉDIA
# ============================================
class MediaResource(models.Model):
    """
    Ressources multimédias (audio, vidéo, images)
    """
    MEDIA_TYPES = [
        ('audio', 'Audio'),
        ('video', 'Vidéo'),
        ('image', 'Image'),
        ('document', 'Document'),
    ]
    
    knowledge_node = models.ForeignKey(KnowledgeNode, on_delete=models.CASCADE, related_name='media_resources', null=True, blank=True)
    title = models.CharField(max_length=255)
    media_type = models.CharField(max_length=50, choices=MEDIA_TYPES)
    url = models.URLField(max_length=500)
    thumbnail_url = models.URLField(max_length=500, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    duration = models.CharField(max_length=50, blank=True, null=True)
    size_bytes = models.BigIntegerField(default=0)
    format = models.CharField(max_length=50, blank=True, null=True)
    uploaded_by = models.ForeignKey(Profile, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} - {self.media_type}"
    
    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "mediaType": self.media_type,
            "url": self.url,
            "thumbnailUrl": self.thumbnail_url,
            "description": self.description,
            "duration": self.duration,
            "sizeBytes": self.size_bytes,
            "format": self.format,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


# ============================================
# 9. TABLE DES DOCUMENTS
# ============================================
class Document(models.Model):
    """
    Stockage de documents (PDF, Word, textes, images, etc.)
    """
    DOCUMENT_TYPES = [
        ('pdf', 'PDF'),
        ('word', 'Word'),
        ('text', 'Texte'),
        ('image', 'Image'),
        ('spreadsheet', 'Tableur'),
        ('presentation', 'Présentation'),
        ('audio_transcript', 'Transcription audio'),
        ('video_transcript', 'Transcription vidéo'),
        ('archive', 'Archive'),
        ('other', 'Autre'),
    ]
    
    DOCUMENT_CATEGORIES = [
        ('research', 'Recherche'),
        ('education', 'Éducation'),
        ('tradition', 'Tradition'),
        ('history', 'Histoire'),
        ('legal', 'Légal'),
        ('administrative', 'Administratif'),
        ('personal', 'Personnel'),
        ('reference', 'Référence'),
        ('translation', 'Traduction'),
    ]
    
    document_id = models.CharField(max_length=255, primary_key=True)
    
    # Informations de base
    title = models.CharField(max_length=500)
    description = models.TextField(blank=True, null=True)
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPES)
    category = models.CharField(max_length=50, choices=DOCUMENT_CATEGORIES, default='reference')
    
    # Fichier et stockage
    file = models.FileField(upload_to='documents/%Y/%m/%d/', max_length=500)
    file_name = models.CharField(max_length=500)
    file_size = models.BigIntegerField(default=0)
    file_extension = models.CharField(max_length=20, blank=True, null=True)
    mime_type = models.CharField(max_length=100, blank=True, null=True)
    checksum = models.CharField(max_length=255, blank=True, null=True)
    
    # URL alternative
    external_url = models.URLField(max_length=500, blank=True, null=True)
    
    # Miniature / aperçu
    thumbnail_url = models.URLField(max_length=500, blank=True, null=True)
    preview_text = models.TextField(blank=True, null=True)
    
    # Métadonnées du document
    author = models.CharField(max_length=255, blank=True, null=True)
    author_email = models.EmailField(blank=True, null=True)
    organization = models.CharField(max_length=255, blank=True, null=True)
    language = models.CharField(max_length=100, blank=True, null=True)
    original_language = models.CharField(max_length=100, blank=True, null=True)
    
    # Date du document original
    document_date = models.DateField(blank=True, null=True)
    document_year = models.CharField(max_length=20, blank=True, null=True)
    document_period = models.CharField(max_length=100, blank=True, null=True)
    
    # Contexte culturel
    country = models.CharField(max_length=100, blank=True, null=True)
    region = models.CharField(max_length=255, blank=True, null=True)
    ethnolinguistic_group = models.CharField(max_length=255, blank=True, null=True)
    
    # Tags et classification
    tags = models.JSONField(default=list, blank=True)
    keywords = models.JSONField(default=list, blank=True)
    
    # Liens vers d'autres entités
    knowledge_node = models.ForeignKey(
        KnowledgeNode, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='documents'
    )
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='documents'
    )
    
    # Uploader
    uploaded_by = models.ForeignKey(
        Profile, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='uploaded_documents'
    )
    
    # Statut et validation
    STATUS_CHOICES = [
        ('draft', 'Brouillon'),
        ('pending', 'En attente'),
        ('verified', 'Validé'),
        ('published', 'Publié'),
        ('archived', 'Archivé'),
    ]
    
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='draft')
    is_public = models.BooleanField(default=False)
    is_confidential = models.BooleanField(default=False)
    consent_obtained = models.BooleanField(default=False)
    consent_date = models.DateTimeField(blank=True, null=True)
    
    # Métriques
    views_count = models.IntegerField(default=0)
    downloads_count = models.IntegerField(default=0)
    
    # Métadonnées supplémentaires
    metadata = models.JSONField(default=dict, blank=True)
    
    # Dates
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['document_type', 'category']),
            models.Index(fields=['country', 'language']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
            models.Index(fields=['knowledge_node']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} ({self.document_type})"
    
    def to_dict(self):
        return {
            "id": self.document_id,
            "title": self.title,
            "description": self.description,
            "documentType": self.document_type,
            "category": self.category,
            "fileName": self.file_name,
            "fileSize": self.file_size,
            "fileExtension": self.file_extension,
            "mimeType": self.mime_type,
            "fileUrl": self.file.url if self.file else None,
            "externalUrl": self.external_url,
            "thumbnailUrl": self.thumbnail_url,
            "previewText": self.preview_text,
            "author": self.author,
            "authorEmail": self.author_email,
            "organization": self.organization,
            "language": self.language,
            "originalLanguage": self.original_language,
            "documentDate": self.document_date.isoformat() if self.document_date else None,
            "documentYear": self.document_year,
            "documentPeriod": self.document_period,
            "country": self.country,
            "region": self.region,
            "ethnolinguisticGroup": self.ethnolinguistic_group,
            "tags": self.tags,
            "keywords": self.keywords,
            "knowledgeNode": self.knowledge_node.node_id if self.knowledge_node else None,
            "conversationId": self.conversation.id if self.conversation else None,
            "uploadedBy": self.uploaded_by.full_name if self.uploaded_by else None,
            "status": self.status,
            "isPublic": self.is_public,
            "isConfidential": self.is_confidential,
            "consentObtained": self.consent_obtained,
            "viewsCount": self.views_count,
            "downloadsCount": self.downloads_count,
            "metadata": self.metadata,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
            "uploadedAt": self.uploaded_at.isoformat() if self.uploaded_at else None,
            "processedAt": self.processed_at.isoformat() if self.processed_at else None,
        }


# ============================================
# 10. TABLE DES VERSIONS DE DOCUMENTS
# ============================================
class DocumentVersion(models.Model):
    """
    Gestion des versions d'un document
    """
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='versions')
    version_number = models.IntegerField(default=1)
    version_notes = models.TextField(blank=True, null=True)
    
    file = models.FileField(upload_to='documents/versions/%Y/%m/%d/', max_length=500)
    file_size = models.BigIntegerField(default=0)
    checksum = models.CharField(max_length=255, blank=True, null=True)
    
    changes = models.JSONField(default=dict, blank=True)
    
    created_by = models.ForeignKey(Profile, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['document', 'version_number']
        ordering = ['-version_number']
    
    def __str__(self):
        return f"{self.document.title} - v{self.version_number}"
    
    def to_dict(self):
        return {
            "versionNumber": self.version_number,
            "versionNotes": self.version_notes,
            "fileUrl": self.file.url if self.file else None,
            "fileSize": self.file_size,
            "checksum": self.checksum,
            "changes": self.changes,
            "createdBy": self.created_by.full_name if self.created_by else None,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


# ============================================
# 11. TABLE DES ANNOTATIONS DE DOCUMENTS
# ============================================
class DocumentAnnotation(models.Model):
    """
    Annotations faites sur les documents
    """
    ANNOTATION_TYPES = [
        ('highlight', 'Surlignage'),
        ('comment', 'Commentaire'),
        ('translation', 'Traduction'),
        ('note', 'Note'),
        ('correction', 'Correction'),
        ('tag', 'Tag'),
    ]
    
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='annotations')
    created_by = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='document_annotations')
    
    annotation_type = models.CharField(max_length=50, choices=ANNOTATION_TYPES)
    content = models.TextField()
    
    page_number = models.IntegerField(blank=True, null=True)
    start_offset = models.IntegerField(blank=True, null=True)
    end_offset = models.IntegerField(blank=True, null=True)
    bounding_box = models.JSONField(default=dict, blank=True)
    
    metadata = models.JSONField(default=dict, blank=True)
    is_resolved = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.annotation_type} - {self.created_by.full_name}"
    
    def to_dict(self):
        return {
            "id": self.id,
            "type": self.annotation_type,
            "content": self.content,
            "pageNumber": self.page_number,
            "startOffset": self.start_offset,
            "endOffset": self.end_offset,
            "boundingBox": self.bounding_box,
            "createdBy": self.created_by.full_name,
            "isResolved": self.is_resolved,
            "metadata": self.metadata,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }


# ============================================
# 12. TABLE DE TRAITEMENT IA DES DOCUMENTS
# ============================================
class DocumentProcessing(models.Model):
    """
    Suivi du traitement IA des documents
    """
    PROCESSING_TYPES = [
        ('ocr', 'OCR - Reconnaissance de texte'),
        ('translation', 'Traduction automatique'),
        ('summarization', 'Résumé automatique'),
        ('keyword_extraction', 'Extraction de mots-clés'),
        ('sentiment_analysis', 'Analyse de sentiment'),
        ('ner', 'Reconnaissance d\'entités'),
        ('speech_to_text', 'Transcription audio'),
        ('text_to_speech', 'Synthèse vocale'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('processing', 'En traitement'),
        ('completed', 'Terminé'),
        ('failed', 'Échec'),
    ]
    
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='processings')
    processing_type = models.CharField(max_length=50, choices=PROCESSING_TYPES)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='pending')
    
    result = models.JSONField(default=dict, blank=True)
    output_text = models.TextField(blank=True, null=True)
    
    processing_time_ms = models.IntegerField(default=0)
    confidence_score = models.FloatField(default=0.0)
    
    error_message = models.TextField(blank=True, null=True)
    error_stack = models.TextField(blank=True, null=True)
    
    metadata = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.processing_type} - {self.status}"
    
    def to_dict(self):
        return {
            "id": self.id,
            "processingType": self.processing_type,
            "status": self.status,
            "result": self.result,
            "outputText": self.output_text,
            "processingTimeMs": self.processing_time_ms,
            "confidenceScore": self.confidence_score,
            "errorMessage": self.error_message,
            "metadata": self.metadata,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "startedAt": self.started_at.isoformat() if self.started_at else None,
            "completedAt": self.completed_at.isoformat() if self.completed_at else None,
        }


# ============================================
# 10. TABLE DES DICTIONNAIRES LOCAUX
# ============================================
class LocalDictionary(models.Model):
    """
    Table dictionnaire pour stocker les fichiers PDF des dictionnaires
    des langues locales et leurs alphabets.
    """
    LANGUAGE_CHOICES = [
        ('dioula', 'Dioula'),
        ('bambara', 'Bambara'),
        ('moore', 'Mooré'),
        ('french', 'Français'),
    ]
    
    dictionary_id = models.CharField(max_length=255, primary_key=True)
    title = models.CharField(max_length=500)
    language = models.CharField(max_length=50, choices=LANGUAGE_CHOICES)
    description = models.TextField(blank=True, null=True)
    
    file = models.FileField(upload_to='dictionaries/%Y/%m/%d/', max_length=500, blank=True, null=True)
    file_name = models.CharField(max_length=500, blank=True, null=True)
    file_size = models.BigIntegerField(default=0)
    
    extracted_text = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['language']),
        ]
        ordering = ['language', 'title']
        
    def __str__(self):
        return f"{self.title} ({self.get_language_display()})"
        
    def to_dict(self):
        return {
            "id": self.dictionary_id,
            "title": self.title,
            "language": self.language,
            "description": self.description,
            "fileUrl": self.file.url if self.file else None,
            "fileName": self.file_name,
            "fileSize": self.file_size,
            "extractedText": self.extracted_text,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }


class LocalArchive(models.Model):
    """
    Table archives pour stocker les documents PDF d'archives.
    """
    archive_id = models.CharField(max_length=255, primary_key=True)
    description = models.TextField(blank=True, null=True)
    document_type = models.CharField(max_length=255)  # e.g. "historique", "académique", "légal", etc.
    provenance = models.CharField(max_length=500)      # Provenance/source du document

    file = models.FileField(upload_to='archives/%Y/%m/%d/', max_length=500, blank=True, null=True)
    file_name = models.CharField(max_length=500, blank=True, null=True)
    file_size = models.BigIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['archive_id']

    def __str__(self):
        return f"{self.archive_id} - {self.document_type} ({self.provenance})"

    def to_dict(self):
        return {
            "id": self.archive_id,
            "description": self.description,
            "documentType": self.document_type,
            "provenance": self.provenance,
            "fileUrl": self.file.url if self.file else None,
            "fileName": self.file_name,
            "fileSize": self.file_size,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }


# ============================================
# 12. TABLE DES AUDIOS LOCAUX (ACCENTS & INFOS)
# ============================================
class LocalAudio(models.Model):
    """
    Table audio pour stocker les enregistrements vocaux utilisés par l'assistant vocal
    pour comprendre les accents locaux et acquérir de nouvelles informations (oralité).
    """
    LANGUAGE_CHOICES = [
        ('dioula', 'Dioula'),
        ('bambara', 'Bambara'),
        ('moore', 'Mooré'),
        ('french', 'Français'),
        ('other', 'Autre'),
    ]
    
    audio_id = models.CharField(max_length=255, primary_key=True)
    title = models.CharField(max_length=500)
    language = models.CharField(max_length=50, choices=LANGUAGE_CHOICES)
    dialect = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    
    audio_data = models.TextField(blank=True, null=True, help_text="Données audio en Base64")
    file_name = models.CharField(max_length=500, blank=True, null=True)
    file_size = models.BigIntegerField(default=0)
    duration = models.CharField(max_length=50, blank=True, null=True)
    
    transcript = models.TextField(blank=True, null=True, help_text="Transcription ou informations extraites de l'audio")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def to_dict(self):
        return {
            "id": self.audio_id,
            "title": self.title,
            "language": self.language,
            "dialect": self.dialect,
            "description": self.description,
            "audioData": self.audio_data,
            "fileName": self.file_name,
            "fileSize": self.file_size,
            "duration": self.duration,
            "transcript": self.transcript,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }

    class Meta:
        indexes = [
            models.Index(fields=['language']),
        ]
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.title} ({self.get_language_display()})"