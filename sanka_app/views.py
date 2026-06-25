# sanka_app/views.py
import os
import json
import uuid
import hashlib
import requests
from dotenv import load_dotenv
from django.db import models
from django.conf import settings
from django.http import JsonResponse, HttpResponse, StreamingHttpResponse, FileResponse, Http404
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.utils import timezone
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User

from sanka_app.models import (
    KnowledgeNode, KnowledgeLink, Profile, Conversation, Message,
    Document, DocumentVersion, DocumentAnnotation, DocumentProcessing,
    MediaResource, Notification, ActivityLog
)

# Import des agents depuis le package
from agents import (
    run_coordinator_agent,
    run_collector_agent,
    run_structurer_agent,
    run_analyst_agent,
    run_vocal_agent,
    run_exploitation_agent
)

# =====================================================================
# CONFIGURATION GEMINI
# =====================================================================

_gemini_client = None
_openai_client = None
_clients_initialized = False

def get_ai_client():
    global _gemini_client, _openai_client, _clients_initialized
    if not _clients_initialized:
        try:
            load_dotenv()
            # Supprimer GOOGLE_API_KEY de l'environnement pour forcer l'utilisation de GEMINI_API_KEY
            if "GOOGLE_API_KEY" in os.environ:
                del os.environ["GOOGLE_API_KEY"]
        except Exception:
            pass
        try:
            from google import genai
            key = os.environ.get("GEMINI_API_KEY")
            if key and key != "MY_GEMINI_API_KEY" and key.strip() != "":
                _gemini_client = genai.Client(api_key=key)
                print("Successfully lazy-initialized Gemini SDK.")
            else:
                print("No valid GEMINI_API_KEY env variable found.")
        except ImportError:
            print("google-genai python package is not installed.")
        except Exception as e:
            print(f"Error initializing Gemini client: {e}")

        try:
            import openai
            key = os.environ.get("OPENAI_API_KEY")
            if key and key != "MY_OPENAI_API_KEY" and key.strip() != "":
                _openai_client = openai.OpenAI(api_key=key)
                print("Successfully lazy-initialized OpenAI SDK.")
            else:
                print("No valid OPENAI_API_KEY env variable found.")
        except ImportError:
            print("openai python package is not installed.")
        except Exception as e:
            print(f"Error initializing OpenAI client: {e}")

        _clients_initialized = True
    return {
        "gemini": _gemini_client,
        "openai": _openai_client
    }


# =====================================================================
# AUTHENTICATION VIEWS
# =====================================================================

@csrf_exempt
def register(request):
    """Register a new user with profile"""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    
    try:
        data = json.loads(request.body)
    except Exception:
        return JsonResponse({"error": "Invalid JSON body"}, status=400)
    
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    full_name = data.get("fullName", username)
    country = data.get("country")
    region = data.get("region")
    ethnolinguistic_group = data.get("ethnolinguisticGroup")
    
    if not username or not email or not password:
        return JsonResponse({"error": "Username, email and password required"}, status=400)
    
    if User.objects.filter(username=username).exists():
        return JsonResponse({"error": "Username already exists"}, status=400)
    
    if User.objects.filter(email=email).exists():
        return JsonResponse({"error": "Email already exists"}, status=400)
    
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password
    )
    
    profile = Profile.objects.create(
        user=user,
        full_name=full_name,
        country=country,
        region=region,
        ethnolinguistic_group=ethnolinguistic_group,
        role="user",
        rank="Apprenti"
    )
    
    return JsonResponse({
        "success": True,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "profile": profile.to_dict()
        }
    }, status=201)


@csrf_exempt
def login_view(request):
    """Login user"""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    
    try:
        data = json.loads(request.body)
    except Exception:
        return JsonResponse({"error": "Invalid JSON body"}, status=400)
    
    username = data.get("username")
    password = data.get("password")
    
    if not username or not password:
        return JsonResponse({"error": "Username and password required"}, status=400)
    
    user = authenticate(request, username=username, password=password)
    
    if user is None:
        return JsonResponse({"error": "Invalid credentials"}, status=401)
    
    login(request, user)
    
    try:
        profile = Profile.objects.get(user=user)
    except Profile.DoesNotExist:
        return JsonResponse({"error": "Profile not found"}, status=404)
    
    return JsonResponse({
        "success": True,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "profile": profile.to_dict()
        }
    })


@csrf_exempt
def logout_view(request):
    """Logout user"""
    logout(request)
    return JsonResponse({"success": True})


def current_user(request):
    """Get current authenticated user"""
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Not authenticated"}, status=401)
    
    try:
        profile = Profile.objects.get(user=request.user)
    except Profile.DoesNotExist:
        return JsonResponse({"error": "Profile not found"}, status=404)
    
    return JsonResponse({
        "user": {
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
            "profile": profile.to_dict()
        }
    })


# =====================================================================
# PROFILE VIEWS
# =====================================================================

def get_profile(request, user_id):
    """Get user profile"""
    try:
        user = User.objects.get(id=user_id)
        profile = Profile.objects.get(user=user)
    except (User.DoesNotExist, Profile.DoesNotExist):
        return JsonResponse({"error": "User not found"}, status=404)
    
    return JsonResponse({"profile": profile.to_dict()})


@csrf_exempt
def update_profile(request):
    """Update current user profile"""
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Not authenticated"}, status=401)
    
    if request.method not in ["PUT", "PATCH"]:
        return JsonResponse({"error": "Method not allowed"}, status=405)
    
    try:
        data = json.loads(request.body)
    except Exception:
        return JsonResponse({"error": "Invalid JSON body"}, status=400)
    
    try:
        profile = Profile.objects.get(user=request.user)
    except Profile.DoesNotExist:
        return JsonResponse({"error": "Profile not found"}, status=404)
    
    # Update fields
    if "fullName" in data:
        profile.full_name = data["fullName"]
    if "avatar" in data:
        profile.avatar = data["avatar"]
    if "country" in data:
        profile.country = data["country"]
    if "region" in data:
        profile.region = data["region"]
    if "ethnolinguisticGroup" in data:
        profile.ethnolinguistic_group = data["ethnolinguisticGroup"]
    if "bio" in data:
        profile.bio = data["bio"]
    if "role" in data:
        profile.role = data["role"]
        
    profile.save()
    
    return JsonResponse({
        "success": True,
        "profile": profile.to_dict()
    })

def list_users(request):
    """List all users (Admin only)"""
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Not authenticated"}, status=401)
    
    try:
        profile = Profile.objects.get(user=request.user)
    except Profile.DoesNotExist:
        return JsonResponse({"error": "Profile not found"}, status=404)
        
    if profile.role not in ["admin", "moderator"] and not request.user.is_superuser:
        return JsonResponse({"error": "Forbidden: Admin access required"}, status=403)
        
    users = User.objects.all().select_related("profile")
    user_list = []
    for u in users:
        try:
            p = u.profile
            p_dict = p.to_dict()
        except Profile.DoesNotExist:
            p_dict = {}
            
        user_list.append({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "is_superuser": u.is_superuser,
            "profile": p_dict
        })
        
    return JsonResponse({"users": user_list})


@csrf_exempt
def update_user_role(request, target_id):
    """Update another user's role (Admin only)"""
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Not authenticated"}, status=401)
        
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
        
    try:
        current_profile = Profile.objects.get(user=request.user)
    except Profile.DoesNotExist:
        return JsonResponse({"error": "Profile not found"}, status=404)
        
    if current_profile.role not in ["admin", "moderator"] and not request.user.is_superuser:
        return JsonResponse({"error": "Forbidden: Admin access required"}, status=403)
        
    try:
        data = json.loads(request.body)
        new_role = data.get("role")
    except Exception:
        return JsonResponse({"error": "Invalid JSON body"}, status=400)
        
    if not new_role or new_role not in ["visitor", "user", "admin", "moderator"]:
        return JsonResponse({"error": "Invalid role specified"}, status=400)
        
    try:
        target_user = User.objects.get(id=target_id)
        target_profile = Profile.objects.get(user=target_user)
        
        target_profile.role = new_role
        target_profile.save()
        
        # Sync with Django superuser status if admin
        if new_role == "admin":
            target_user.is_superuser = True
            target_user.is_staff = True
        else:
            target_user.is_superuser = False
            target_user.is_staff = False
        target_user.save()
            
        return JsonResponse({
            "success": True, 
            "user": {
                "id": target_user.id,
                "username": target_user.username,
                "profile": target_profile.to_dict()
            }
        })
    except (User.DoesNotExist, Profile.DoesNotExist):
        return JsonResponse({"error": "Target user not found"}, status=404)


def get_top_contributors(request):
    """Get top contributors by wisdom points"""
    limit = int(request.GET.get("limit", 10))
    profiles = Profile.objects.order_by("-wisdom_points")[:limit]
    
    return JsonResponse({
        "contributors": [p.to_dict() for p in profiles]
    })


# =====================================================================
# KNOWLEDGE NODE VIEWS
# =====================================================================

def list_nodes(request):
    """Retrieve all nodes and links in the database."""
    nodes = [n.to_dict() for n in KnowledgeNode.objects.select_related('validated_by', 'contributor').all()]
    links = [l.to_dict() for l in KnowledgeLink.objects.select_related('source_node', 'target_node').all()]
    return JsonResponse({
        "nodes": nodes,
        "links": links
    })


def get_node(request, node_id):
    """Get a single knowledge node by ID"""
    try:
        node = KnowledgeNode.objects.get(node_id=node_id)
        node.views_count += 1
        node.save()
        return JsonResponse({"node": node.to_dict()})
    except KnowledgeNode.DoesNotExist:
        return JsonResponse({"error": "Node not found"}, status=404)


@csrf_exempt
def reset_nodes(request):
    """Clear and re-seed database with default elements."""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    from sanka_app.seeds import seed_database
    try:
        seed_database()
        return JsonResponse({"success": True, "message": "Database re-seeded."})
    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)


@csrf_exempt
def link_nodes(request):
    """Formulate a semantic connection between two existing nodes."""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    
    try:
        data = json.loads(request.body)
    except Exception:
        return JsonResponse({"error": "Invalid JSON body"}, status=400)
    
    source = data.get("source")
    target = data.get("target")
    relation_type = data.get("type")
    description = data.get("description", "")
    strength = data.get("strength", 50)
    
    if not source or not target or not relation_type:
        return JsonResponse({"error": "Source, target, and relation type are required"}, status=400)
    
    try:
        source_node = KnowledgeNode.objects.get(node_id=source)
        target_node = KnowledgeNode.objects.get(node_id=target)
    except KnowledgeNode.DoesNotExist:
        return JsonResponse({"error": "Source or target node not found"}, status=404)
    
    # Check if link already exists
    existing_link = KnowledgeLink.objects.filter(
        source_node=source_node,
        target_node=target_node,
        relation_type=relation_type
    ).first()
    
    if existing_link:
        return JsonResponse({"error": "Link already exists"}, status=409)
    
    created_by = None
    if request.user.is_authenticated:
        try:
            created_by = Profile.objects.get(user=request.user)
        except Profile.DoesNotExist:
            pass
    
    link = KnowledgeLink.objects.create(
        source_node=source_node,
        target_node=target_node,
        relation_type=relation_type,
        description=description,
        strength=strength,
        created_by=created_by
    )
    return JsonResponse({"success": True, "link": link.to_dict()})


@csrf_exempt
def collect_node(request):
    """Ingest raw content, clean it, structure it via modular agents, and save to DB."""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    
    try:
        data = json.loads(request.body)
    except Exception:
        return JsonResponse({"error": "Invalid JSON body"}, status=400)
    
    raw_content = data.get("rawContent")
    if not raw_content or raw_content.strip() == "":
        return JsonResponse({"error": "Le contenu textuel brut à analyser est obligatoire."}, status=400)
    
    client = get_ai_client()
    
    try:
        # Get contributor
        contributor = None
        if request.user.is_authenticated:
            try:
                contributor = Profile.objects.get(user=request.user)
            except Profile.DoesNotExist:
                pass
        
        # 1. Run Collector Agent
        cleaned_result = run_collector_agent(
            client,
            raw_content,
            {
                "language": data.get("language"),
                "source": data.get("source")
            }
        )
        
        # 2. Run Structurer Agent
        # On passe les données collectées (liste) ou le contenu brut si vide
        collected_items = cleaned_result.get("collectedData") or []
        structurer_input = collected_items if collected_items else raw_content

        structurer_result = run_structurer_agent(
            client,
            structurer_input,
            {
                "title": data.get("title"),
                "category": data.get("category"),
                "theme": data.get("theme"),
                "region": data.get("region"),
                "country": data.get("country"),
                "ethnolinguisticGroup": data.get("ethnolinguisticGroup"),
                "period": data.get("period"),
                "consent": data.get("consent"),
                "speakerAge": data.get("speakerAge"),
                "speakerGender": data.get("speakerGender"),
                "source": data.get("source")
            }
        )

        # Extraire le premier item structuré selon le type de retour
        if structurer_result.get("type") == "collection":
            items = structurer_result.get("items", [])
            finalized_node_data = items[0] if items else {}
        else:
            finalized_node_data = structurer_result.get("item") or {}

        # Generate ID if not provided
        node_id = finalized_node_data.get("id") or f"savoir_{uuid.uuid4().hex[:12]}"
        
        # Save structured node to DB
        node = KnowledgeNode.objects.create(
            node_id=node_id,
            title=finalized_node_data["title"],
            category=finalized_node_data["category"],
            theme=finalized_node_data["theme"],
            description=finalized_node_data["description"],
            raw_content=cleaned_result.get("cleanedText", raw_content),
            translated_content=finalized_node_data.get("translatedContent", ""),
            language=finalized_node_data["language"],
            region=finalized_node_data["region"],
            country=finalized_node_data["country"],
            ethnolinguistic_group=finalized_node_data["ethnolinguisticGroup"],
            period=finalized_node_data["period"],
            reliability_score=finalized_node_data["reliabilityScore"],
            source=finalized_node_data["source"],
            source_type=finalized_node_data["sourceType"],
            consent_provided=finalized_node_data["consentProvided"],
            speaker_profile={
                "age": finalized_node_data.get("speakerProfile", {}).get("age", ""),
                "gender": finalized_node_data.get("speakerProfile", {}).get("gender", ""),
                "role": finalized_node_data.get("speakerProfile", {}).get("role", "")
            },
            contributor=contributor
        )
        
        # Auto-link with existing items
        potential_match = KnowledgeNode.objects.filter(
            ~models.Q(node_id=node_id) & 
            (models.Q(theme=node.theme) | models.Q(country=node.country))
        ).first()
        
        if potential_match:
            desc = "Rapproché sémantiquement par l'IA sur la base du paramètre: "
            if potential_match.theme == node.theme:
                desc += f"Thème ({node.theme})"
            else:
                desc += f"Géographie ({node.country})"
            
            KnowledgeLink.objects.create(
                source_node=node,
                target_node=potential_match,
                relation_type="auto_semantic_connection",
                description=desc,
                strength=70
            )
        
        # Log activity
        ActivityLog.objects.create(
            agent_name="Collecteur Principal",
            agent_role="Ingestion",
            action="synthesis",
            description=f"Collecte du savoir: {node.title}",
            status="success"
        )
        
        return JsonResponse({
            "success": True,
            "node": node.to_dict(),
            "cleanedData": cleaned_result,
            "structuredData": finalized_node_data
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({"error": "Erreur lors du traitement multi-agents: " + str(e)}, status=500)


@csrf_exempt
def like_node(request, node_id):
    """Like a knowledge node"""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    
    try:
        node = KnowledgeNode.objects.get(node_id=node_id)
        node.likes_count += 1
        node.save()
        return JsonResponse({"success": True, "likes": node.likes_count})
    except KnowledgeNode.DoesNotExist:
        return JsonResponse({"error": "Node not found"}, status=404)


# =====================================================================
# VOCAL ASSISTANT VIEWS (AVEC COORDINATEUR)
# =====================================================================

@csrf_exempt
def vocal_assistant(request):
    """
    Vocal assistant chatbot with full agent orchestration via coordinator.
    """
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    
    try:
        data = json.loads(request.body)
    except Exception:
        return JsonResponse({"error": "Invalid JSON body"}, status=400)
    
    text_prompt = data.get("textPrompt")
    if not text_prompt or text_prompt.strip() == "":
        return JsonResponse({"error": "Veuillez fournir un texte ou message de parole."}, status=400)
    
    client = get_ai_client()
    
    try:
        # Récupérer tous les nœuds pour le contexte
        all_nodes = [n.to_dict() for n in KnowledgeNode.objects.all()]
        
        # Définir les agents disponibles
        agents = {
            "collector": run_collector_agent,
            "structurer": run_structurer_agent,
            "analyst": run_analyst_agent,
            "exploitation": run_exploitation_agent,
            "vocal": run_vocal_agent
        }
        
        # Métadonnées
        metadata = {
            "language": data.get("language", "Français"),
            "persona": data.get("persona", "citizen"),
            "country": data.get("country"),
            "theme": data.get("theme"),
            "channel": data.get("channel", "vocal"),
            "intent": data.get("intent"),
            "all_nodes": all_nodes
        }
        
        # Récupérer l'ID de conversation
        conversation_id = data.get("conversationId")
        if conversation_id:
            try:
                conversation = Conversation.objects.get(id=conversation_id)
                metadata["conversation"] = conversation
                metadata["conversation_id"] = conversation_id
            except Conversation.DoesNotExist:
                pass
        
        # Exécuter le coordinateur
        result = run_coordinator_agent(
            client=client,
            user_query=text_prompt,
            metadata=metadata,
            agents=agents
        )
        
        # Sauvegarder la conversation si utilisateur authentifié
        if request.user.is_authenticated and result.get("agentResult"):
            try:
                profile = Profile.objects.get(user=request.user)
                save_conversation(profile, text_prompt, result, data.get("channel", "vocal"))
            except Profile.DoesNotExist:
                pass
        
        # Flatten agentResult to root for frontend compatibility
        if "agentResult" in result and isinstance(result["agentResult"], dict):
            for k, v in result["agentResult"].items():
                if k not in result:
                    result[k] = v

        return JsonResponse(result)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({"error": "Erreur lors du traitement par l'assistant IA: " + str(e)}, status=500)


def save_conversation(profile, user_text, result, channel):
    """Sauvegarde la conversation en base de données."""
    try:
        agent_result = result.get("agentResult", {})
        answer_text = agent_result.get("answerText") or agent_result.get("reportText") or ""
        
        if not answer_text:
            return
        
        # Créer ou récupérer la conversation
        conversation_id = result.get("metadata", {}).get("conversation_id")
        if conversation_id:
            try:
                conversation = Conversation.objects.get(id=conversation_id, user=profile)
            except Conversation.DoesNotExist:
                conversation = Conversation.objects.create(
                    user=profile,
                    title=user_text[:50] if len(user_text) > 50 else user_text,
                    type=channel,
                    language=agent_result.get("detectedLanguage", "Français")
                )
        else:
            conversation = Conversation.objects.create(
                user=profile,
                title=user_text[:50] if len(user_text) > 50 else user_text,
                type=channel,
                language=agent_result.get("detectedLanguage", "Français")
            )
        
        # Message utilisateur
        user_message = Message.objects.create(
            conversation=conversation,
            sender="user",
            content=user_text,
            language_detected=agent_result.get("detectedLanguage"),
            is_audio=channel == "vocal"
        )
        
        # Message IA
        ai_message = Message.objects.create(
            conversation=conversation,
            sender="ai",
            content=answer_text,
            translated_content=agent_result.get("translatedText"),
            language_detected=agent_result.get("detectedLanguage")
        )
        
        # Mettre à jour le compteur
        conversation.message_count = conversation.messages.count()
        conversation.detected_language = agent_result.get("detectedLanguage")
        conversation.save()
        
    except Exception as e:
        print(f"[Save] Erreur sauvegarde conversation: {e}")


# =====================================================================
# CONVERSATION VIEWS
# =====================================================================

def list_conversations(request):
    """List all conversations for the current user"""
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Not authenticated"}, status=401)
    
    try:
        profile = Profile.objects.get(user=request.user)
        conversations = Conversation.objects.filter(user=profile, is_active=True).prefetch_related('messages', 'messages__referenced_knowledge')
        return JsonResponse({
            "conversations": [c.to_dict() for c in conversations]
        })
    except Profile.DoesNotExist:
        return JsonResponse({"error": "Profile not found"}, status=404)


def get_conversation(request, conversation_id):
    """Get a specific conversation with all messages"""
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Not authenticated"}, status=401)
    
    try:
        profile = Profile.objects.get(user=request.user)
        conversation = Conversation.objects.get(id=conversation_id, user=profile)
        return JsonResponse({"conversation": conversation.to_dict()})
    except (Profile.DoesNotExist, Conversation.DoesNotExist):
        return JsonResponse({"error": "Conversation not found"}, status=404)


@csrf_exempt
def delete_conversation(request, conversation_id):
    """Delete (soft) a conversation"""
    if request.method != "DELETE":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Not authenticated"}, status=401)
    
    try:
        profile = Profile.objects.get(user=request.user)
        conversation = Conversation.objects.get(id=conversation_id, user=profile)
        conversation.is_active = False
        conversation.save()
        return JsonResponse({"success": True})
    except (Profile.DoesNotExist, Conversation.DoesNotExist):
        return JsonResponse({"error": "Conversation not found"}, status=404)


# =====================================================================
# DOCUMENT VIEWS
# =====================================================================

def list_documents(request):
    """List all documents"""
    documents = Document.objects.select_related('knowledge_node', 'conversation', 'uploaded_by').all()
    
    # Filter by user
    user_id = request.GET.get("userId")
    if user_id and request.user.is_authenticated:
        try:
            profile = Profile.objects.get(user_id=user_id)
            documents = documents.filter(uploaded_by=profile)
        except Profile.DoesNotExist:
            pass
    
    # Filter by knowledge node
    node_id = request.GET.get("nodeId")
    if node_id:
        try:
            node = KnowledgeNode.objects.get(node_id=node_id)
            documents = documents.filter(knowledge_node=node)
        except KnowledgeNode.DoesNotExist:
            pass
    
    # Filter by type
    doc_type = request.GET.get("type")
    if doc_type:
        documents = documents.filter(document_type=doc_type)
    
    # Filter by status
    status = request.GET.get("status")
    if status:
        documents = documents.filter(status=status)
    
    return JsonResponse({
        "documents": [d.to_dict() for d in documents]
    })


def get_document(request, document_id):
    """Get a specific document"""
    try:
        document = Document.objects.get(document_id=document_id)
        document.views_count += 1
        document.save()
        return JsonResponse({"document": document.to_dict()})
    except Document.DoesNotExist:
        return JsonResponse({"error": "Document not found"}, status=404)


@csrf_exempt
def upload_document(request):
    """Upload a new document"""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Not authenticated"}, status=401)
    
    try:
        profile = Profile.objects.get(user=request.user)
    except Profile.DoesNotExist:
        return JsonResponse({"error": "Profile not found"}, status=404)
    
    # Get form data
    title = request.POST.get("title")
    description = request.POST.get("description")
    document_type = request.POST.get("documentType")
    category = request.POST.get("category", "reference")
    language = request.POST.get("language")
    country = request.POST.get("country")
    region = request.POST.get("region")
    ethnolinguistic_group = request.POST.get("ethnolinguisticGroup")
    author = request.POST.get("author")
    organization = request.POST.get("organization")
    tags = request.POST.get("tags", "[]")
    knowledge_node_id = request.POST.get("knowledgeNodeId")
    conversation_id = request.POST.get("conversationId")
    
    if not title:
        return JsonResponse({"error": "Title is required"}, status=400)
    
    if "file" not in request.FILES:
        return JsonResponse({"error": "File is required"}, status=400)
    
    file = request.FILES["file"]
    
    # Generate document ID
    doc_id = f"doc_{uuid.uuid4().hex[:12]}"
    
    # Compute file size
    file_size = file.size
    
    # Compute checksum
    file_content = file.read()
    checksum = hashlib.md5(file_content).hexdigest()
    file.seek(0)
    
    # Get file extension
    file_extension = file.name.split(".")[-1].lower() if "." in file.name else ""
    
    # Parse tags
    try:
        tags_list = json.loads(tags) if isinstance(tags, str) else tags
    except:
        tags_list = []
    
    # Get knowledge node
    knowledge_node = None
    if knowledge_node_id:
        try:
            knowledge_node = KnowledgeNode.objects.get(node_id=knowledge_node_id)
        except KnowledgeNode.DoesNotExist:
            pass
    
    # Get conversation
    conversation = None
    if conversation_id:
        try:
            conversation = Conversation.objects.get(id=conversation_id)
        except Conversation.DoesNotExist:
            pass
    
    # Create document
    document = Document.objects.create(
        document_id=doc_id,
        title=title,
        description=description,
        document_type=document_type or "other",
        category=category,
        file=file,
        file_name=file.name,
        file_size=file_size,
        file_extension=file_extension,
        checksum=checksum,
        language=language,
        country=country,
        region=region,
        ethnolinguistic_group=ethnolinguistic_group,
        author=author,
        organization=organization,
        tags=tags_list,
        knowledge_node=knowledge_node,
        conversation=conversation,
        uploaded_by=profile,
        status="pending",
        is_public=False,
        consent_obtained=True,
        consent_date=timezone.now()
    )
    
    return JsonResponse({
        "success": True,
        "document": document.to_dict()
    }, status=201)


@csrf_exempt
def delete_document(request, document_id):
    """Delete a document"""
    if request.method != "DELETE":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Not authenticated"}, status=401)
    
    try:
        profile = Profile.objects.get(user=request.user)
        document = Document.objects.get(document_id=document_id)
        
        # Check permission
        if document.uploaded_by != profile and profile.role != "moderator":
            return JsonResponse({"error": "Permission denied"}, status=403)
        
        document.delete()
        return JsonResponse({"success": True})
    except (Profile.DoesNotExist, Document.DoesNotExist):
        return JsonResponse({"error": "Document not found"}, status=404)


@csrf_exempt
def document_version(request, document_id):
    """Add a new version to a document"""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Not authenticated"}, status=401)
    
    try:
        profile = Profile.objects.get(user=request.user)
        document = Document.objects.get(document_id=document_id)
        
        if "file" not in request.FILES:
            return JsonResponse({"error": "File is required"}, status=400)
        
        file = request.FILES["file"]
        version_notes = request.POST.get("versionNotes", "")
        
        # Count existing versions
        version_count = document.versions.count()
        
        # Create new version
        version = DocumentVersion.objects.create(
            document=document,
            version_number=version_count + 1,
            version_notes=version_notes,
            file=file,
            file_size=file.size,
            checksum=hashlib.md5(file.read()).hexdigest(),
            created_by=profile
        )
        
        return JsonResponse({
            "success": True,
            "version": version.to_dict()
        })
    except (Profile.DoesNotExist, Document.DoesNotExist):
        return JsonResponse({"error": "Document not found"}, status=404)


@csrf_exempt
def document_annotation(request, document_id):
    """Add an annotation to a document"""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Not authenticated"}, status=401)
    
    try:
        data = json.loads(request.body)
    except Exception:
        return JsonResponse({"error": "Invalid JSON body"}, status=400)
    
    try:
        profile = Profile.objects.get(user=request.user)
        document = Document.objects.get(document_id=document_id)
    except (Profile.DoesNotExist, Document.DoesNotExist):
        return JsonResponse({"error": "Document not found"}, status=404)
    
    annotation = DocumentAnnotation.objects.create(
        document=document,
        created_by=profile,
        annotation_type=data.get("type", "comment"),
        content=data.get("content", ""),
        page_number=data.get("pageNumber"),
        start_offset=data.get("startOffset"),
        end_offset=data.get("endOffset"),
        bounding_box=data.get("boundingBox", {}),
        metadata=data.get("metadata", {})
    )
    
    return JsonResponse({
        "success": True,
        "annotation": annotation.to_dict()
    }, status=201)


@csrf_exempt
def process_document(request, document_id):
    """Process a document with AI (OCR, translation, etc.)"""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    
    try:
        data = json.loads(request.body)
    except Exception:
        return JsonResponse({"error": "Invalid JSON body"}, status=400)
    
    try:
        document = Document.objects.get(document_id=document_id)
    except Document.DoesNotExist:
        return JsonResponse({"error": "Document not found"}, status=404)
    
    processing_type = data.get("processingType")
    if not processing_type:
        return JsonResponse({"error": "Processing type required"}, status=400)
    
    # Create processing task
    processing = DocumentProcessing.objects.create(
        document=document,
        processing_type=processing_type,
        status="pending"
    )
    
    return JsonResponse({
        "success": True,
        "processing": processing.to_dict()
    }, status=202)


# =====================================================================
# MEDIA VIEWS
# =====================================================================

def list_media(request):
    """List media resources"""
    media = MediaResource.objects.all()
    
    media_type = request.GET.get("type")
    if media_type:
        media = media.filter(media_type=media_type)
    
    node_id = request.GET.get("nodeId")
    if node_id:
        try:
            node = KnowledgeNode.objects.get(node_id=node_id)
            media = media.filter(knowledge_node=node)
        except KnowledgeNode.DoesNotExist:
            pass
    
    return JsonResponse({
        "media": [m.to_dict() for m in media]
    })


@csrf_exempt
def upload_media(request):
    """Upload a media resource"""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Not authenticated"}, status=401)
    
    try:
        profile = Profile.objects.get(user=request.user)
    except Profile.DoesNotExist:
        return JsonResponse({"error": "Profile not found"}, status=404)
    
    title = request.POST.get("title")
    media_type = request.POST.get("mediaType")
    url = request.POST.get("url")
    description = request.POST.get("description")
    knowledge_node_id = request.POST.get("knowledgeNodeId")
    
    if not title or not media_type or not url:
        return JsonResponse({"error": "Title, mediaType and url are required"}, status=400)
    
    knowledge_node = None
    if knowledge_node_id:
        try:
            knowledge_node = KnowledgeNode.objects.get(node_id=knowledge_node_id)
        except KnowledgeNode.DoesNotExist:
            pass
    
    media = MediaResource.objects.create(
        title=title,
        media_type=media_type,
        url=url,
        description=description,
        knowledge_node=knowledge_node,
        uploaded_by=profile
    )
    
    return JsonResponse({
        "success": True,
        "media": media.to_dict()
    }, status=201)


# =====================================================================
# NOTIFICATION VIEWS
# =====================================================================

def list_notifications(request):
    """List notifications for current user"""
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Not authenticated"}, status=401)
    
    try:
        profile = Profile.objects.get(user=request.user)
        notifications = Notification.objects.filter(user=profile)
        
        # Filter unread
        unread_only = request.GET.get("unreadOnly", "false").lower() == "true"
        if unread_only:
            notifications = notifications.filter(is_read=False)
        
        return JsonResponse({
            "notifications": [n.to_dict() for n in notifications]
        })
    except Profile.DoesNotExist:
        return JsonResponse({"error": "Profile not found"}, status=404)


@csrf_exempt
def mark_notification_read(request, notification_id):
    """Mark a notification as read"""
    if request.method not in ["PUT", "PATCH"]:
        return JsonResponse({"error": "Method not allowed"}, status=405)
    
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Not authenticated"}, status=401)
    
    try:
        profile = Profile.objects.get(user=request.user)
        notification = Notification.objects.get(id=notification_id, user=profile)
        notification.is_read = True
        notification.save()
        return JsonResponse({"success": True})
    except (Profile.DoesNotExist, Notification.DoesNotExist):
        return JsonResponse({"error": "Notification not found"}, status=404)


@csrf_exempt
def mark_all_notifications_read(request):
    """Mark all notifications as read"""
    if request.method not in ["PUT", "PATCH"]:
        return JsonResponse({"error": "Method not allowed"}, status=405)
    
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Not authenticated"}, status=401)
    
    try:
        profile = Profile.objects.get(user=request.user)
        Notification.objects.filter(user=profile, is_read=False).update(is_read=True)
        return JsonResponse({"success": True})
    except Profile.DoesNotExist:
        return JsonResponse({"error": "Profile not found"}, status=404)


# =====================================================================
# RECOMMENDATION VIEWS
# =====================================================================

def recommend(request):
    """Returns a filtered list of recommendations."""
    theme = request.GET.get("theme")
    
    items = [
        {
            "id": "rec-1",
            "title": "Planification Agricole Précoce (Zaï)",
            "theme": "agriculture",
            "origin": "Burkina Faso / Sahel",
            "content": "La saison sèche approche. Commencez dès maintenant à délimiter les poquets de Zaï d'un diamètre de 30cm sur les sols arides (Zippellé) pour laisser murir le compost organique avant les semailles.",
            "actionLabel": "Découvrir la fiche technique du Zaï",
        },
        {
            "id": "rec-2",
            "title": "Préservation Ethnobotanique de l'Artemisia",
            "theme": "health",
            "origin": "Afrique du Sud",
            "content": "Pour préserver les populations sauvages d'Artemisia Afra (Umhlonyane), privilégiez la récolte par taille douce des sommités fleuries sans arracher la racine de la plante.",
            "actionLabel": "Consulter la charte Nagoya locale",
        },
        {
            "id": "rec-3",
            "title": "Intégration d'écriture classique en classe",
            "theme": "education",
            "origin": "Éthiopie / Corne de l'Afrique",
            "content": "Associez les caractères de base du Gé'ez aux devoirs d'expression graphique pour stimuler la perception géométrique et la fierté historique des plus jeunes apprenants.",
            "actionLabel": "Télécharger l'abugida Gé'ez d'initiation",
        },
        {
            "id": "rec-4",
            "title": "Gouvernance et résolutions de conflits durables",
            "theme": "governance",
            "origin": "Mali",
            "content": "Inspirez-vous de l'Article 24 de la Charte de Kurukan Fuga pour instaurer des comités de médiation paritaires basés sur l'écoute active s'appuyant sur l'humour traditionnel de cousinage (Sanankouya).",
            "actionLabel": "Lire les 44 Articles de Kurukan Fuga",
        }
    ]
    
    if theme and theme != "all":
        items = [i for i in items if i["theme"] == theme]
    
    return JsonResponse(items, safe=False)


# =====================================================================
# ACTIVITY LOG VIEWS
# =====================================================================

def list_activities(request):
    """List activity logs"""
    limit = int(request.GET.get("limit", 50))
    activities = ActivityLog.objects.all()[:limit]
    
    return JsonResponse({
        "activities": [a.to_dict() for a in activities]
    })


# =====================================================================
# REPORT VIEWS
# =====================================================================

@csrf_exempt
def generate_report(request):
    """Generates custom Markdown strategic study using all agents."""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    
    try:
        data = json.loads(request.body)
    except Exception:
        return JsonResponse({"error": "Invalid JSON body"}, status=400)
    
    topic = data.get("topic")
    if not topic:
        return JsonResponse({"error": "Le sujet du rapport d'analyse est obligatoire"}, status=400)
    
    client = get_ai_client()
    
    try:
        all_nodes = [n.to_dict() for n in KnowledgeNode.objects.all()]
        
        # Définir les agents
        agents = {
            "collector": run_collector_agent,
            "structurer": run_structurer_agent,
            "analyst": run_analyst_agent,
            "exploitation": run_exploitation_agent
        }
        
        # Métadonnées
        metadata = {
            "language": data.get("language", "Français"),
            "persona": data.get("persona", "researcher"),
            "country": data.get("country"),
            "theme": data.get("theme"),
            "intent": "report",
            "report_mode": True,
            "all_nodes": all_nodes,
            "nodeIds": data.get("nodeIds", [])
        }
        
        # Exécuter le coordinateur
        result = run_coordinator_agent(
            client=client,
            user_query=topic,
            metadata=metadata,
            agents=agents
        )
        
        # Flatten agentResult to root for frontend compatibility
        if "agentResult" in result and isinstance(result["agentResult"], dict):
            for k, v in result["agentResult"].items():
                if k not in result:
                    result[k] = v
        return JsonResponse(result)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({"error": "Erreur lors de la génération du rapport: " + str(e)}, status=500)

# =====================================================================


# =====================================================================
# EXPLORE AFRICA API
# =====================================================================

@csrf_exempt
def get_explore_countries(request):
    """
    Récupère la liste de tous les pays pour la page Explorer l'Afrique,
    avec leurs informations générales et leurs landmarks.
    """
    from sanka_app.models import ExploreCountry
    countries = ExploreCountry.objects.all().prefetch_related('landmarks')
    
    countries_data = {}
    for country in countries:
        countries_data[country.id_name] = country.to_dict()
        
    return JsonResponse(countries_data)

@csrf_exempt
def get_explore_country_details(request, country_id):
    """
    Récupère les détails avancés d'un pays spécifique
    """
    from sanka_app.models import ExploreCountry
    try:
        country = ExploreCountry.objects.get(id_name=country_id)
        # to_dict returns everything we need!
        data = country.to_dict()
        details = {
            "history": data.get("history", ""),
            "culture": data.get("culture", ""),
            "gastronomy": data.get("gastronomy", ""),
            "keyFacts": data.get("keyFacts", []),
            "demographics": data.get("demographics", {}),
            "economy": data.get("economy", {}),
            "languages": data.get("languages", []),
        }
        return JsonResponse(details)
    except ExploreCountry.DoesNotExist:
        return JsonResponse({"error": "Pays non trouvé"}, status=404)

@csrf_exempt
def create_explore_country(request):
    import json
    from sanka_app.models import ExploreCountry, ExploreDemography, ExploreEconomy, ExploreLanguage, ExploreLandmark
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            country = ExploreCountry.objects.create(
                id_name=data.get("id", f"c_{data.get('name', '').lower().replace(' ', '_')}"),
                name=data.get("name", ""),
                local_greeting=data.get("localGreeting", ""),
                local_greeting_explanation=data.get("localGreetingExplanation", ""),
                capital=data.get("capital", ""),
                currency=data.get("currency", ""),
                population=data.get("population", ""),
                tagline=data.get("tagline", ""),
                flag_emoji=data.get("flagEmoji", ""),
                overview=data.get("overview", ""),
                history=data.get("history", ""),
                culture=data.get("culture", ""),
                gastronomy=data.get("gastronomy", ""),
                key_facts=data.get("keyFacts", [])
            )

            # Demography
            if data.get("demographics"):
                d = data["demographics"]
                ExploreDemography.objects.create(
                    country=country,
                    total=d.get("total", ""),
                    density=d.get("density", ""),
                    median_age=d.get("medianAge", ""),
                    urban_ratio=d.get("urbanRatio", ""),
                    life_expectancy=d.get("lifeExpectancy", ""),
                    ethnic_groups=", ".join(d.get("ethnicGroups", []))
                )

            # Economy
            if data.get("economy"):
                e = data["economy"]
                ExploreEconomy.objects.create(
                    country=country,
                    gdp=e.get("gdp", ""),
                    gdp_growth=e.get("gdpGrowth", ""),
                    currency=e.get("currency", ""),
                    main_sectors=", ".join(e.get("mainSectors", [])),
                    key_exports=e.get("keyExports", "")
                )

            # Languages
            if data.get("languages"):
                for lang in data["languages"]:
                    ExploreLanguage.objects.create(
                        country=country,
                        name=lang.get("name", ""),
                        percentage=lang.get("percentage", ""),
                        language_type=lang.get("type", "")
                    )

            # Landmarks
            if data.get("landmarks"):
                for lm in data["landmarks"]:
                    ExploreLandmark.objects.create(
                        country=country,
                        name=lm.get("name", ""),
                        description=lm.get("description", ""),
                        image=lm.get("image", ""),
                        image_1=lm.get("image1", ""),
                        image_2=lm.get("image2", ""),
                        image_3=lm.get("image3", ""),
                        image_4=lm.get("image4", ""),
                        image_5=lm.get("image5", ""),
                        detailed_description=lm.get("detailedDescription", ""),
                        why_visit=lm.get("whyVisit", ""),
                        practical_tips=lm.get("practicalTips", "")
                    )

            return JsonResponse({"success": True})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Method non autorisée"}, status=405)

@csrf_exempt
def update_explore_country(request, country_id):
    import json
    from sanka_app.models import ExploreCountry, ExploreDemography, ExploreEconomy, ExploreLanguage, ExploreLandmark
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            country = ExploreCountry.objects.get(id_name=country_id)
            country.name = data.get("name", country.name)
            country.local_greeting = data.get("localGreeting", country.local_greeting)
            country.local_greeting_explanation = data.get("localGreetingExplanation", country.local_greeting_explanation)
            country.capital = data.get("capital", country.capital)
            country.currency = data.get("currency", country.currency)
            country.population = data.get("population", country.population)
            country.tagline = data.get("tagline", country.tagline)
            country.flag_emoji = data.get("flagEmoji", country.flag_emoji)
            country.overview = data.get("overview", country.overview)
            country.history = data.get("history", country.history)
            country.culture = data.get("culture", country.culture)
            country.gastronomy = data.get("gastronomy", country.gastronomy)
            country.key_facts = data.get("keyFacts", country.key_facts)
            country.save()

            if "demographics" in data:
                d = data["demographics"]
                ExploreDemography.objects.update_or_create(
                    country=country,
                    defaults={
                        "total": d.get("total", ""),
                        "density": d.get("density", ""),
                        "median_age": d.get("medianAge", ""),
                        "urban_ratio": d.get("urbanRatio", ""),
                        "life_expectancy": d.get("lifeExpectancy", ""),
                        "ethnic_groups": ", ".join(d.get("ethnicGroups", [])) if isinstance(d.get("ethnicGroups"), list) else d.get("ethnicGroups", "")
                    }
                )

            if "economy" in data:
                e = data["economy"]
                ExploreEconomy.objects.update_or_create(
                    country=country,
                    defaults={
                        "gdp": e.get("gdp", ""),
                        "gdp_growth": e.get("gdpGrowth", ""),
                        "currency": e.get("currency", ""),
                        "main_sectors": ", ".join(e.get("mainSectors", [])) if isinstance(e.get("mainSectors"), list) else e.get("mainSectors", ""),
                        "key_exports": e.get("keyExports", "")
                    }
                )

            if "languages" in data:
                country.explore_languages.all().delete()
                for lang in data["languages"]:
                    ExploreLanguage.objects.create(
                        country=country,
                        name=lang.get("name", ""),
                        percentage=lang.get("percentage", ""),
                        language_type=lang.get("type", "")
                    )

            if "landmarks" in data:
                country.landmarks.all().delete()
                for lm in data["landmarks"]:
                    ExploreLandmark.objects.create(
                        country=country,
                        name=lm.get("name", ""),
                        description=lm.get("description", ""),
                        image=lm.get("image", ""),
                        image_1=lm.get("image1", ""),
                        image_2=lm.get("image2", ""),
                        image_3=lm.get("image3", ""),
                        image_4=lm.get("image4", ""),
                        image_5=lm.get("image5", ""),
                        detailed_description=lm.get("detailedDescription", ""),
                        why_visit=lm.get("whyVisit", ""),
                        practical_tips=lm.get("practicalTips", "")
                    )

            return JsonResponse({"success": True})
        except ExploreCountry.DoesNotExist:
            return JsonResponse({"error": "Pays non trouvé"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Method non autorisée"}, status=405)

@csrf_exempt
def delete_explore_country(request, country_id):
    from sanka_app.models import ExploreCountry
    if request.method == "POST" or request.method == "DELETE":
        try:
            country = ExploreCountry.objects.get(id_name=country_id)
            country.delete()
            return JsonResponse({"success": True})
        except ExploreCountry.DoesNotExist:
            return JsonResponse({"error": "Pays non trouvé"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Method non autorisée"}, status=405)


# =====================================================================
# STATIC FILE / DEV PROXY SERVICES
# =====================================================================

def python_source(request):
    """Retrieve raw python agent code from exploitation_agent.py."""
    try:
        file_path = os.path.join(settings.BASE_DIR, "sanka_app", "agents", "exploitation_agent.py")
        with open(file_path, "r", encoding="utf-8") as f:
            code = f.read()
        return JsonResponse({"code": code})
    except Exception:
        return JsonResponse({"code": "# Python Agent missing or custom written"})


def dev_proxy(request, path=""):
    """Reverse proxies frontend requests to Vite dev server on port 5173."""
    vite_url = f"http://localhost:5173/{path}"
    if request.GET:
        vite_url += f"?{request.GET.urlencode()}"
    
    headers = {k: v for k, v in request.headers.items() if k.lower() not in ('host', 'content-length')}
    
    try:
        response = requests.request(
            method=request.method,
            url=vite_url,
            headers=headers,
            data=request.body,
            stream=True,
            timeout=10
        )
        
        django_response = StreamingHttpResponse(
            response.iter_content(chunk_size=4096),
            status=response.status_code
        )
        
        hop_by_hop_headers = {
            'connection',
            'keep-alive',
            'proxy-authenticate',
            'proxy-authorization',
            'te',
            'trailers',
            'transfer-encoding',
            'upgrade',
        }
        for k, v in response.headers.items():
            if k.lower() not in hop_by_hop_headers:
                django_response[k] = v
        
        return django_response
    except requests.exceptions.RequestException as e:
        return HttpResponse(
            f"Vite development server is not running or unreachable at {vite_url}. Please ensure you run 'npm run dev' to start Vite on port 5173. Details: {e}",
            status=502
        )


def spa_fallback(request, path=""):
    """Serves compiled static assets or defaults to index.html for React routing."""
    dist_dir = os.path.join(settings.BASE_DIR, 'dist')
    
    if path:
        file_path = os.path.join(dist_dir, path)
        if os.path.commonpath([dist_dir, os.path.abspath(file_path)]) == dist_dir:
            if os.path.isfile(file_path):
                return FileResponse(open(file_path, 'rb'))
    
    index_path = os.path.join(dist_dir, 'index.html')
    if os.path.exists(index_path):
        return FileResponse(open(index_path, 'rb'))
    
    raise Http404("Index file not found in build directory. Please build the frontend first via 'npm run build'.")



# ============================================================
# DATABASE CRUD ENDPOINTS (ADMIN BOARD)
# ============================================================

@csrf_exempt
def create_node(request):
    """Create a new KnowledgeNode"""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    try:
        data = json.loads(request.body)
        node_id = data.get("id") or f"node_{uuid.uuid4().hex[:12]}"
        
        if KnowledgeNode.objects.filter(node_id=node_id).exists():
            return JsonResponse({"error": f"ID {node_id} existe déjà."}, status=409)
            
        node = KnowledgeNode.objects.create(
            node_id=node_id,
            title=data["title"],
            category=data.get("category", "traditionnelle"),
            theme=data.get("theme", "culture"),
            description=data["description"],
            raw_content=data.get("rawContent", ""),
            language=data.get("language", "Français"),
            country=data.get("country", "Mali"),
            region=data.get("region", "Général"),
            ethnolinguistic_group=data.get("ethnolinguisticGroup", "Général"),
            reliability_score=int(data.get("reliabilityScore", 80)),
            source=data.get("source", "Admin"),
            consent_provided=True
        )
        return JsonResponse({"success": True, "node": node.to_dict()}, status=201)
    except KeyError as ke:
        return JsonResponse({"error": f"Champ obligatoire manquant: {str(ke)}"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def update_node(request, node_id):
    """Update an existing KnowledgeNode"""
    if request.method not in ["PUT", "POST"]:
        return JsonResponse({"error": "Method not allowed"}, status=405)
    try:
        node = KnowledgeNode.objects.get(node_id=node_id)
        data = json.loads(request.body)
        
        node.title = data.get("title", node.title)
        node.category = data.get("category", node.category)
        node.theme = data.get("theme", node.theme)
        node.description = data.get("description", node.description)
        node.raw_content = data.get("rawContent", node.raw_content)
        node.language = data.get("language", node.language)
        node.country = data.get("country", node.country)
        node.region = data.get("region", node.region)
        node.ethnolinguistic_group = data.get("ethnolinguisticGroup", node.ethnolinguistic_group)
        node.reliability_score = int(data.get("reliabilityScore", node.reliability_score))
        node.source = data.get("source", node.source)
        
        node.save()
        return JsonResponse({"success": True, "node": node.to_dict()})
    except KnowledgeNode.DoesNotExist:
        return JsonResponse({"error": "Savoir non trouvé"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def delete_node(request, node_id):
    """Delete a KnowledgeNode"""
    if request.method not in ["DELETE", "POST"]:
        return JsonResponse({"error": "Method not allowed"}, status=405)
    try:
        node = KnowledgeNode.objects.get(node_id=node_id)
        node.delete()
        return JsonResponse({"success": True})
    except KnowledgeNode.DoesNotExist:
        return JsonResponse({"error": "Savoir non trouvé"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

# Dictionnaires
def list_dictionaries(request):
    """List all LocalDictionaries"""
    from sanka_app.models import LocalDictionary
    dicts = [d.to_dict() for d in LocalDictionary.objects.all()]
    return JsonResponse({"dictionaries": dicts})

@csrf_exempt
def create_dictionary(request):
    """Create a new LocalDictionary (supporting both JSON and Multipart/FormData for file upload)"""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    try:
        from sanka_app.models import LocalDictionary
        
        if request.content_type and request.content_type.startswith("multipart/form-data"):
            title = request.POST.get("title")
            language = request.POST.get("language")
            description = request.POST.get("description", "")
            extracted_text = request.POST.get("extractedText", "")
            dict_id = request.POST.get("id") or f"dict_{uuid.uuid4().hex[:12]}"
            pdf_file = request.FILES.get("file")
        else:
            data = json.loads(request.body)
            title = data.get("title")
            language = data.get("language")
            description = data.get("description", "")
            extracted_text = data.get("extractedText", "")
            dict_id = data.get("id") or f"dict_{uuid.uuid4().hex[:12]}"
            pdf_file = None

        if not title or not language:
            return JsonResponse({"error": "Le titre et la langue sont obligatoires."}, status=400)

        if LocalDictionary.objects.filter(dictionary_id=dict_id).exists():
            return JsonResponse({"error": f"ID {dict_id} existe déjà."}, status=409)

        d = LocalDictionary.objects.create(
            dictionary_id=dict_id,
            title=title,
            language=language,
            description=description,
            extracted_text=extracted_text,
            file=pdf_file,
            file_name=pdf_file.name if pdf_file else None,
            file_size=pdf_file.size if pdf_file else 0
        )
        return JsonResponse({"success": True, "dictionary": d.to_dict()}, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def update_dictionary(request, dictionary_id):
    """Update an existing LocalDictionary"""
    if request.method not in ["PUT", "POST"]:
        return JsonResponse({"error": "Method not allowed"}, status=405)
    try:
        from sanka_app.models import LocalDictionary
        d = LocalDictionary.objects.get(dictionary_id=dictionary_id)

        if request.content_type and request.content_type.startswith("multipart/form-data"):
            d.title = request.POST.get("title", d.title)
            d.language = request.POST.get("language", d.language)
            d.description = request.POST.get("description", d.description)
            d.extracted_text = request.POST.get("extractedText", d.extracted_text)
            pdf_file = request.FILES.get("file")
            if pdf_file:
                d.file = pdf_file
                d.file_name = pdf_file.name
                d.file_size = pdf_file.size
        else:
            data = json.loads(request.body)
            d.title = data.get("title", d.title)
            d.language = data.get("language", d.language)
            d.description = data.get("description", d.description)
            d.extracted_text = data.get("extractedText", d.extracted_text)

        d.save()
        return JsonResponse({"success": True, "dictionary": d.to_dict()})
    except LocalDictionary.DoesNotExist:
        return JsonResponse({"error": "Dictionnaire non trouvé"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def delete_dictionary(request, dictionary_id):
    """Delete a LocalDictionary"""
    if request.method not in ["DELETE", "POST"]:
        return JsonResponse({"error": "Method not allowed"}, status=405)
    try:
        from sanka_app.models import LocalDictionary
        d = LocalDictionary.objects.get(dictionary_id=dictionary_id)
        d.delete()
        return JsonResponse({"success": True})
    except LocalDictionary.DoesNotExist:
        return JsonResponse({"error": "Dictionnaire non trouvé"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# ============================================================
# ARCHIVES CRUD ENDPOINTS (ADMIN BOARD)
# ============================================================

def list_archives(request):
    """List all LocalArchives"""
    from sanka_app.models import LocalArchive
    archives = [a.to_dict() for a in LocalArchive.objects.all()]
    return JsonResponse({"archives": archives})

@csrf_exempt
def create_archive(request):
    """Create a new LocalArchive"""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    try:
        from sanka_app.models import LocalArchive
        
        if request.content_type and request.content_type.startswith("multipart/form-data"):
            description = request.POST.get("description", "")
            doc_type = request.POST.get("documentType", "historique")
            provenance = request.POST.get("provenance", "")
            archive_id = request.POST.get("id") or f"archive_{uuid.uuid4().hex[:12]}"
            pdf_file = request.FILES.get("file")
        else:
            data = json.loads(request.body)
            description = data.get("description", "")
            doc_type = data.get("documentType", "historique")
            provenance = data.get("provenance", "")
            archive_id = data.get("id") or f"archive_{uuid.uuid4().hex[:12]}"
            pdf_file = None

        if not provenance or not doc_type:
            return JsonResponse({"error": "Le type de document et la provenance sont obligatoires."}, status=400)

        if LocalArchive.objects.filter(archive_id=archive_id).exists():
            return JsonResponse({"error": f"ID {archive_id} existe déjà."}, status=409)

        a = LocalArchive.objects.create(
            archive_id=archive_id,
            description=description,
            document_type=doc_type,
            provenance=provenance,
            file=pdf_file,
            file_name=pdf_file.name if pdf_file else None,
            file_size=pdf_file.size if pdf_file else 0
        )
        return JsonResponse({"success": True, "archive": a.to_dict()}, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def update_archive(request, archive_id):
    """Update an existing LocalArchive"""
    if request.method not in ["PUT", "POST"]:
        return JsonResponse({"error": "Method not allowed"}, status=405)
    try:
        from sanka_app.models import LocalArchive
        a = LocalArchive.objects.get(archive_id=archive_id)

        if request.content_type and request.content_type.startswith("multipart/form-data"):
            a.description = request.POST.get("description", a.description)
            a.document_type = request.POST.get("documentType", a.document_type)
            a.provenance = request.POST.get("provenance", a.provenance)
            pdf_file = request.FILES.get("file")
            if pdf_file:
                a.file = pdf_file
                a.file_name = pdf_file.name
                a.file_size = pdf_file.size
        else:
            data = json.loads(request.body)
            a.description = data.get("description", a.description)
            a.document_type = data.get("documentType", a.document_type)
            a.provenance = data.get("provenance", a.provenance)

        a.save()
        return JsonResponse({"success": True, "archive": a.to_dict()})
    except LocalArchive.DoesNotExist:
        return JsonResponse({"error": "Archive non trouvée"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def delete_archive(request, archive_id):
    """Delete a LocalArchive"""
    if request.method not in ["DELETE", "POST"]:
        return JsonResponse({"error": "Method not allowed"}, status=405)
    try:
        from sanka_app.models import LocalArchive
        a = LocalArchive.objects.get(archive_id=archive_id)
        a.delete()
        return JsonResponse({"success": True})
    except LocalArchive.DoesNotExist:
        return JsonResponse({"error": "Archive non trouvée"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)