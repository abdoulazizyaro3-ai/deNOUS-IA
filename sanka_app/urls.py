# sanka_app/urls.py
from django.urls import path, re_path
from django.conf import settings
from sanka_app import views

urlpatterns = [
    # ============================================================
    # AUTHENTICATION
    # ============================================================
    path('api/register', views.register, name='register_no_slash'),
    path('api/register/', views.register, name='register'),
    path('api/login', views.login_view, name='login_no_slash'),
    path('api/login/', views.login_view, name='login'),
    path('api/logout', views.logout_view, name='logout_no_slash'),
    path('api/logout/', views.logout_view, name='logout'),
    path('api/me', views.current_user, name='current_user_no_slash'),
    path('api/me/', views.current_user, name='current_user'),
    
    # ============================================================
    # PROFIL
    # ============================================================
    path('api/profile/<int:user_id>/', views.get_profile, name='get_profile'),
    path('api/profile/update/', views.update_profile, name='update_profile'),
    path('api/top-contributors/', views.get_top_contributors, name='top_contributors'),
    
    # ============================================================
    # KNOWLEDGE NODES
    # ============================================================
    path('api/nodes', views.list_nodes, name='list_nodes_no_slash'),
    path('api/nodes/', views.list_nodes, name='list_nodes'),
    path('api/nodes/create', views.create_node, name='create_node_no_slash'),
    path('api/nodes/create/', views.create_node, name='create_node'),
    path('api/nodes/<str:node_id>/', views.get_node, name='get_node'),
    path('api/nodes/<str:node_id>/update', views.update_node, name='update_node_no_slash'),
    path('api/nodes/<str:node_id>/update/', views.update_node, name='update_node'),
    path('api/nodes/<str:node_id>/delete', views.delete_node, name='delete_node_no_slash'),
    path('api/nodes/<str:node_id>/delete/', views.delete_node, name='delete_node'),
    path('api/nodes/reset', views.reset_nodes, name='reset_nodes_no_slash'),
    path('api/nodes/reset/', views.reset_nodes, name='reset_nodes'),
    path('api/nodes/link', views.link_nodes, name='link_nodes_no_slash'),
    path('api/nodes/link/', views.link_nodes, name='link_nodes'),
    path('api/nodes/collect', views.collect_node, name='collect_node_no_slash'),
    path('api/nodes/collect/', views.collect_node, name='collect_node'),
    path('api/nodes/<str:node_id>/like/', views.like_node, name='like_node'),
    
    # ============================================================
    # DICTIONARIES CRUD
    # ============================================================
    path('api/dictionaries', views.list_dictionaries, name='list_dictionaries_no_slash'),
    path('api/dictionaries/', views.list_dictionaries, name='list_dictionaries'),
    path('api/dictionaries/create', views.create_dictionary, name='create_dictionary_no_slash'),
    path('api/dictionaries/create/', views.create_dictionary, name='create_dictionary'),
    path('api/dictionaries/<str:dictionary_id>/update', views.update_dictionary, name='update_dictionary_no_slash'),
    path('api/dictionaries/<str:dictionary_id>/update/', views.update_dictionary, name='update_dictionary'),
    path('api/dictionaries/<str:dictionary_id>/delete', views.delete_dictionary, name='delete_dictionary_no_slash'),
    path('api/dictionaries/<str:dictionary_id>/delete/', views.delete_dictionary, name='delete_dictionary'),
    
    # ============================================================
    # ARCHIVES CRUD
    # ============================================================
    path('api/archives', views.list_archives, name='list_archives_no_slash'),
    path('api/archives/', views.list_archives, name='list_archives'),
    path('api/archives/create', views.create_archive, name='create_archive_no_slash'),
    path('api/archives/create/', views.create_archive, name='create_archive'),
    path('api/archives/<str:archive_id>/update', views.update_archive, name='update_archive_no_slash'),
    path('api/archives/<str:archive_id>/update/', views.update_archive, name='update_archive'),
    path('api/archives/<str:archive_id>/delete', views.delete_archive, name='delete_archive_no_slash'),
    path('api/archives/<str:archive_id>/delete/', views.delete_archive, name='delete_archive'),
    
    # ============================================================
    # AUDIOS CRUD
    # ============================================================
    path('api/audios', views.list_audios, name='list_audios_no_slash'),
    path('api/audios/', views.list_audios, name='list_audios'),
    path('api/audios/create', views.create_audio, name='create_audio_no_slash'),
    path('api/audios/create/', views.create_audio, name='create_audio'),
    path('api/audios/<str:audio_id>/update', views.update_audio, name='update_audio_no_slash'),
    path('api/audios/<str:audio_id>/update/', views.update_audio, name='update_audio'),
    path('api/audios/<str:audio_id>/delete', views.delete_audio, name='delete_audio_no_slash'),
    path('api/audios/<str:audio_id>/delete/', views.delete_audio, name='delete_audio'),
    
    # ============================================================
    # ASSISTANT VOCAL
    # ============================================================
    path('api/gemini/vocal-assistant', views.vocal_assistant, name='vocal_assistant_no_slash'),
    path('api/gemini/vocal-assistant/', views.vocal_assistant, name='vocal_assistant'),
    path('api/vocal-assistant', views.vocal_assistant, name='vocal_assistant_legacy_no_slash'),
    path('api/vocal-assistant/', views.vocal_assistant, name='vocal_assistant_legacy'),
    path('api/generate-report', views.generate_report, name='generate_report_no_slash'),
    path('api/generate-report/', views.generate_report, name='generate_report'),
    path('api/recommend', views.recommend, name='recommend_no_slash'),
    path('api/recommend/', views.recommend, name='recommend'),
    
    # ============================================================
    # CONVERSATIONS
    # ============================================================
    path('api/conversations/', views.list_conversations, name='list_conversations'),
    path('api/conversations/<int:conversation_id>/', views.get_conversation, name='get_conversation'),
    path('api/conversations/<int:conversation_id>/delete/', views.delete_conversation, name='delete_conversation'),
    
    # ============================================================
    # DOCUMENTS
    # ============================================================
    path('api/documents/', views.list_documents, name='list_documents'),
    path('api/documents/upload/', views.upload_document, name='upload_document'),
    path('api/documents/<str:document_id>/', views.get_document, name='get_document'),
    path('api/documents/<str:document_id>/delete/', views.delete_document, name='delete_document'),
    path('api/documents/<str:document_id>/version/', views.document_version, name='document_version'),
    path('api/documents/<str:document_id>/annotate/', views.document_annotation, name='document_annotation'),
    path('api/documents/<str:document_id>/process/', views.process_document, name='process_document'),
    
    # ============================================================
    # MEDIA
    # ============================================================
    path('api/media/', views.list_media, name='list_media'),
    path('api/media/upload/', views.upload_media, name='upload_media'),
    
    # ============================================================
    # NOTIFICATIONS
    # ============================================================
    path('api/notifications/', views.list_notifications, name='list_notifications'),
    path('api/notifications/<int:notification_id>/read/', views.mark_notification_read, name='mark_notification_read'),
    path('api/notifications/read-all/', views.mark_all_notifications_read, name='mark_all_notifications_read'),
    
    # ============================================================
    # ACTIVITIES
    # ============================================================
    path('api/activities/', views.list_activities, name='list_activities'),
    
    # ============================================================
    # EXPLORE AFRICA
    # ============================================================
    path('api/explore/countries/', views.get_explore_countries, name='get_explore_countries'),
    path('api/explore/countries/create/', views.create_explore_country, name='create_explore_country'),
    path('api/explore/countries/<str:country_id>/', views.get_explore_country_details, name='get_explore_country_details'),
    path('api/explore/countries/<str:country_id>/update/', views.update_explore_country, name='update_explore_country'),
    path('api/explore/countries/<str:country_id>/delete/', views.delete_explore_country, name='delete_explore_country'),

    # ============================================================
    # SOURCE CODE
    # ============================================================
    path('api/python/source/', views.python_source, name='python_source'),
]

# ============================================================
# DEV PROXY (Vite) / SPA FALLBACK
# ============================================================
if settings.DEBUG:
    # En développement, toutes les autres URLs vont vers le proxy Vite
    urlpatterns += [
        re_path(r'^(?P<path>.*)$', views.dev_proxy, name='dev_proxy'),
    ]
else:
    # En production, toutes les autres URLs vont vers le SPA build
    urlpatterns += [
        re_path(r'^(?P<path>.*)$', views.spa_fallback, name='spa_fallback'),
    ]