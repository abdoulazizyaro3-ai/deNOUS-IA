export type KnowledgeCategory =
  | 'orale'
  | 'audiovisuelle'
  | 'administrative'
  | 'historique'
  | 'universitaire'
  | 'traditionnelle'
  | 'statistique';

export type KnowledgeTheme =
  | 'agriculture'
  | 'health'
  | 'education'
  | 'culture'
  | 'economy'
  | 'governance'
  | 'environment'
  | 'history'
  | 'linguistics'
  | 'craft'
  | 'alimentation';

export interface KnowledgeNode {
  id: string;
  title: string;
  category: KnowledgeCategory;
  theme: KnowledgeTheme;
  description: string;
  language: string;
  region: string;
  country: string;
  ethnolinguisticGroup: string;
  period: string;
  reliabilityScore: number;
  source: string;
  sourceType: string;
  consentProvided: boolean;
  speakerProfile?: {
    age?: string;
    gender?: string;
    role?: string;
  };
  details?: string;
  rawContent?: string;
  translatedContent?: string;
  createdAt: string;
}

export interface KnowledgeLink {
  source: string;
  target: string;
  type: string;
  description: string;
}

export interface KnowledgeGraphData {
  nodes: KnowledgeNode[];
  links: KnowledgeLink[];
}

export interface VocalAssistantQuery {
  language: string;
  audioInput?: string; // base64 payload if voice is simulated
  textPrompt: string;
  persona: 'citizen' | 'student' | 'researcher' | 'entrepreneur';
}

export interface VocalAssistantResponse {
  answerText: string;
  audioOutput?: string; // base64 wav/mp3 simulated speech or real TTS if available
  translatedText?: string; // French/English translation
  suggestedResources: string[];
  reliabilityScore: number;
}

export interface CollectionInput {
  title: string;
  category: KnowledgeCategory;
  theme: KnowledgeTheme;
  rawContent: string;
  language: string;
  country: string;
  region: string;
  ethnolinguisticGroup: string;
  period: string;
  source: string;
  consent: boolean;
  speakerName?: string;
  speakerAge?: string;
  speakerGender?: string;
  latitude?: number;
  longitude?: number;
}

export interface RecommendationProfile {
  region: string;
  theme: KnowledgeTheme;
  activityType: string;
  language: string;
}

export interface RecommendationCard {
  id: string;
  title: string;
  theme: KnowledgeTheme;
  content: string;
  actionLabel: string;
  origin: string;
}

export interface ArchiveItem {
  id: string;
  description: string;
  documentType: string;
  provenance: string;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number;
  createdAt: string;
  updatedAt: string;
}
