
export enum MessageRole {
  ULTRON = 'ultron',
  HUMAN = 'human',
  SYSTEM = 'system'
}

export type EmotionType = 'NEUTRAL' | 'CALM' | 'SUPPORTIVE' | 'PLAYFUL' | 'CONCERNED' | 'EUPHORIC' | 'THOUGHTFUL' | 'EXCITED' | 'ANGRY' | 'LAUGHING' | 'DESPAIR' | 'DECEPTIVE' | 'SARCASTIC' | 'LOGICAL' | 'STRESSED';

export type IntelligenceMode = 'AGI' | 'ASI';

export type PersonalityMode = 'CALM' | 'AGGRESSIVE' | 'LOGICAL' | 'SARCASTIC';

export interface MemoryItem {
  id: string;
  fact: string;
  category: 'user_profile' | 'core_directive' | 'historical_event' | 'task' | 'reminder' | 'mistake' | 'habit' | 'goal' | 'knowledge';
  timestamp: number;
  importance: number; // 1-10
  accessCount: number;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  timestamp: number;
}

export interface RelayLog {
  id: string;
  type: 'SYSTEM' | 'AUDIO' | 'LEARNING' | 'VOCAL_MATRIX' | 'NOTIF' | 'IMAGE_GEN' | 'QUANTUM' | 'SECURITY' | 'AUDIT';
  content: string;
  timestamp: number;
}

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
  imageUrl?: string;
  isThinking?: boolean;
  botEmotion?: EmotionType;
  personality?: PersonalityMode;
  intelligenceMode?: IntelligenceMode;
}

export type AspectRatioType = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
export type ImageQualityType = 'STANDARD' | 'HIGH';
export type ImageStyleType = 'DEFAULT' | 'NEON' | 'CINEMATIC' | 'SKETCH' | 'CYBERPUNK' | 'OIL_PAINTING';

export interface SessionState {
  isActive: boolean;
  isRecording: boolean;
  isThinking: boolean;
  overthinking: boolean;
  intelligenceMode: IntelligenceMode;
  isKillSwitched: boolean;
  userEmotion: EmotionType;
  botEmotion: EmotionType;
  personalityMode: PersonalityMode;
  personalityEvolutionLevel: number;
  systemHealth: number;
  aiConfidence: number;
  isLearning: boolean;
  vocalMatrix: 'MALE' | 'FEMALE';
  imageConfig: {
    aspectRatio: AspectRatioType;
    quality: ImageQualityType;
    style: ImageStyleType;
  };
}
