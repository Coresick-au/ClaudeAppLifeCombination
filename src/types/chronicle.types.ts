export type QuestionType = 'text' | 'textarea' | 'date' | 'select';

export interface ChapterQuestion {
  id: string;
  prompt: string;
  type: QuestionType;
  required: boolean;
  xp: number;
  timelineLabel: string;
  placeholder?: string;
  options?: string[];
}

export interface ChapterDefinition {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  questions: ChapterQuestion[];
  isCustom?: boolean;
}

export interface ChronicleAnswer {
  chapterId: string;
  questionId: string;
  value: string;
  answeredAt: string;
  photoUrl?: string;
  followUpQuestion?: string;
  followUpAnswer?: string;
  journalEntry?: string;
}

export interface ChronicleState {
  currentChapter: number;
  currentQuestion: number;
  xp: number;
  answers: Record<string, ChronicleAnswer>;
  achievements: string[];
  customChapters: ChapterDefinition[];
  customEvents: CustomEvent[];
  startedAt: string;
  lastPlayedAt: string;
}

export interface CustomEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  createdAt: string;
}

export type CharacterClass =
  | 'Blank Page'
  | 'Novice'
  | 'Journeyman'
  | 'Veteran'
  | 'Elder'
  | 'Legend';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (state: ChronicleState) => boolean;
}
