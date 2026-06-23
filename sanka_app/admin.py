from django.contrib import admin
from sanka_app.models import (
    Profile, KnowledgeNode, Conversation, Message, KnowledgeLink,
    ActivityLog, Notification, MediaResource, Document, LocalDictionary, LocalArchive, LocalAudio
)

@admin.register(LocalAudio)
class LocalAudioAdmin(admin.ModelAdmin):
    list_display = ('title', 'language', 'dialect', 'created_at')
    list_filter = ('language',)
    search_fields = ('title', 'description', 'transcript')

admin.site.register(Profile)
admin.site.register(KnowledgeNode)
admin.site.register(Conversation)
admin.site.register(Message)
admin.site.register(KnowledgeLink)
admin.site.register(ActivityLog)
admin.site.register(Notification)
admin.site.register(MediaResource)
admin.site.register(Document)
admin.site.register(LocalDictionary)
admin.site.register(LocalArchive)
