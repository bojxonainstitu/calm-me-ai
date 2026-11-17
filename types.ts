// ───────────────────────────────────────────────────────────────
// CALM ME AI — umumiy turlar (client + server)
// ───────────────────────────────────────────────────────────────

export type AgencyId = 'bojxona' | 'ypx' | 'ppx' | 'mg' | 'profilaktika';
export type TraineeStatus = 'kursant' | 'tinglovchi' | 'xodim';
export type PositionLevel = 'quyi' | 'orta' | 'yuqori';
export type Attire = 'forma' | 'fuqarolik';
export type Gender = 'erkak' | 'ayol';
export type Lang = 'uz-UZ' | 'ru-RU';

export interface TraineeProfile {
  agency: AgencyId;
  status: TraineeStatus;
  level: PositionLevel;
  attire: Attire;
  gender: Gender;
  lang: Lang;
}

export type ProvocationType = 'refusal' | 'filming' | 'connections' | 'crowd' | 'emotional' | 'insult';
export type Difficulty = 1 | 2 | 3;

export interface LegalRef {
  id: string;
  /** Hujjat nomi va rekvizitlari */
  act: string;
  /** Masalan: "8-modda" yoki "5, 7, 8-bandlar" */
  article: string;
  title: string;
  /** Oʻquv maqsadidagi qisqacha mazmun (rasmiy matn emas) */
  summary: string;
  url: string;
  /** verified — raqam va nom manba bilan solishtirilgan; review — instruktor tasdiqlashi tavsiya etiladi */
  confidence: 'verified' | 'review';
  /** Matnda ushbu moddani aniqlash uchun kalit raqam(lar)i, masalan ["194"] */
  match: string[];
}

export interface CitizenPersona {
  name: string;
  age: number;
  role: string;
  temperament: string;
  goal: string;
  voice: { gender: Gender; pitch: number; rate: number };
}

export interface DemoScript {
  deescalate: string[];
  neutral: string[];
  escalate: string[];
  resolved: string;
  breakdown: string;
}

export interface SampleLine {
  text: string;
  quality: 'good' | 'neutral' | 'bad';
}

export interface Scenario {
  id: string;
  title: string;
  shortTitle: string;
  agencies: AgencyId[];
  location: string;
  difficulty: Difficulty;
  provocation: ProvocationType;
  tactics: string[];
  citizen: CitizenPersona;
  brief: string;
  objective: string;
  initialAggression: number;
  openingLine: string;
  legalRefIds: string[];
  demoScript: DemoScript;
  sampleOfficerLines: SampleLine[];
  source?: 'library' | 'video';
  harderVariantOf?: string;
  /** Videodan yaratilgan ssenariylar uchun: eskalatsiya nuqtasi tavsifi */
  videoTrigger?: { timestampSec: number; description: string };
}

export interface CriteriaScores {
  etiquette: number;
  legal: number;
  stability: number;
}

export interface EvalFlag {
  kind: 'positive' | 'negative';
  code: string;
  label: string;
  critical?: boolean;
}

export interface Highlight {
  text: string;
  kind: 'positive' | 'negative';
}

export interface Evaluation {
  scores: CriteriaScores;
  overall: number;
  /** Manfiy — de-eskalatsiya, musbat — eskalatsiya */
  aggressionDelta: number;
  verdict: 'deescalate' | 'neutral' | 'escalate';
  flags: EvalFlag[];
  highlights: Highlight[];
  feedback: string;
  suggestion?: string;
  /** Xodim aslida tilga olgan moddalar */
  citedRefIds: string[];
  /** Ushbu vaziyatda tayanish tavsiya etiladigan moddalar */
  legalRefIds: string[];
  source: 'llm' | 'rules' | 'hybrid';
}

export interface Turn {
  id: string;
  speaker: 'officer' | 'citizen' | 'system';
  text: string;
  /** Sessiya boshidan beri ms */
  t: number;
  aggressionAfter?: number;
  evaluation?: Evaluation;
  responseTimeSec?: number;
  emotion?: string;
  micPeak?: number;
}

export type SessionStatus = 'briefing' | 'active' | 'resolved' | 'failed' | 'ended';

export interface SessionRecord {
  id: string;
  scenarioId: string;
  scenarioTitle: string;
  provocation: ProvocationType;
  difficulty: Difficulty;
  profile: TraineeProfile;
  startedAt: number;
  endedAt: number;
  turns: Turn[];
  outcome: Exclude<SessionStatus, 'briefing' | 'active'>;
  outcomeReason?: string;
  initialAggression: number;
  finalAggression: number;
  poiseIndex: number;
  mode: 'live' | 'demo';
  isSample?: boolean;
}

export interface CitizenReply {
  text: string;
  aggression: number;
  emotion: string;
  tactic?: string;
  source: 'llm' | 'demo';
}

export interface HistoryItem {
  speaker: 'officer' | 'citizen' | 'system';
  text: string;
}

export interface EvaluateRequest {
  scenario: Scenario;
  profile: TraineeProfile;
  utterance: string;
  history: HistoryItem[];
  aggression: number;
  turnIndex: number;
  micPeak?: number;
}

export interface SimulateRequest {
  scenario: Scenario;
  profile: TraineeProfile;
  history: HistoryItem[];
  aggression: number;
  evaluation: Evaluation;
  turnIndex: number;
}

export interface VideoAnalysis {
  title: string;
  summary: string;
  durationSec: number;
  triggerTimestampSec: number;
  triggerDescription: string;
  tactic: string;
  quote?: string;
  provocation: ProvocationType;
  facesBlurred: number;
  platesBlurred: number;
  privacyMethod: 'face-detector' | 'heuristic' | 'synthetic';
  timeline: { t: number; level: number; label?: string }[];
}

export interface VideoToSimResponse {
  analysis: VideoAnalysis;
  scenario: Scenario;
  source: 'llm' | 'demo';
}

export interface ScheduleEntry {
  id: string;
  provocation: ProvocationType;
  scenarioId: string;
  baseScenarioId: string;
  dueAt: number;
  score: number;
  reason: string;
  createdAt: number;
}
