from django.contrib import admin
from sanka_app.models import (
    Profile, KnowledgeNode, Conversation, Message, KnowledgeLink,
    ActivityLog, Notification, MediaResource, Document, DocumentVersion,
    DocumentAnnotation, DocumentProcessing, LocalDictionary, LocalArchive,
    ExploreCountry, ExploreLandmark,
    ExploreDemography, ExploreEconomy, ExploreLanguage
)

class ExploreDemographyInline(admin.StackedInline):
    model = ExploreDemography
    can_delete = False
    verbose_name_plural = "Démographie"

class ExploreEconomyInline(admin.StackedInline):
    model = ExploreEconomy
    can_delete = False
    verbose_name_plural = "Économie"

class ExploreLanguageInline(admin.TabularInline):
    model = ExploreLanguage
    extra = 1

class ExploreLandmarkInline(admin.StackedInline):
    model = ExploreLandmark
    extra = 1

@admin.register(ExploreCountry)
class ExploreCountryAdmin(admin.ModelAdmin):
    list_display = ('name', 'capital', 'population')
    search_fields = ('name', 'capital')
    inlines = [ExploreDemographyInline, ExploreEconomyInline, ExploreLanguageInline, ExploreLandmarkInline]

@admin.register(ExploreDemography)
class ExploreDemographyAdmin(admin.ModelAdmin):
    list_display = ('country', 'total', 'density')
    search_fields = ('country__name',)

@admin.register(ExploreEconomy)
class ExploreEconomyAdmin(admin.ModelAdmin):
    list_display = ('country', 'gdp', 'currency')
    search_fields = ('country__name',)

@admin.register(ExploreLanguage)
class ExploreLanguageAdmin(admin.ModelAdmin):
    list_display = ('name', 'country', 'percentage')
    search_fields = ('name', 'country__name')

@admin.register(ExploreLandmark)
class ExploreLandmarkAdmin(admin.ModelAdmin):
    list_display = ('name', 'country')
    search_fields = ('name', 'country__name')

admin.site.register(Profile)
admin.site.register(KnowledgeNode)
admin.site.register(Conversation)
admin.site.register(Message)
admin.site.register(KnowledgeLink)
admin.site.register(ActivityLog)
admin.site.register(Notification)
admin.site.register(MediaResource)
admin.site.register(Document)
admin.site.register(DocumentVersion)
admin.site.register(DocumentAnnotation)
admin.site.register(DocumentProcessing)
admin.site.register(LocalDictionary)
admin.site.register(LocalArchive)
