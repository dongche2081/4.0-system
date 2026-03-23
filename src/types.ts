export type BusinessStage = '初创生存期' | '快速扩张期' | '稳定成熟期' | '组织变革期';
export type TeamStatus = '高压冲刺中' | '人心浮动中' | '内耗血栓化' | '人才紧缺中';
export type LeadershipStyle = '强势结果导向' | '温和关系导向' | '授权放权型' | '严密监控型';
export type ManagementMode = '华为实战模式' | '互联网敏捷模式';

export interface ProfileContext {
  businessStage: BusinessStage; // 团队生命周期
  teamStatus: TeamStatus;       // 现状描述
  leadershipStyle: LeadershipStyle;
  managementMode: ManagementMode;
  // V2.0 深度维度
  span: number;                 // 管理幅度（人）
  levels: number;               // 管理层级
  composition: string[];        // 人才密度画像
  pressure: number;             // 环境压强 (1-10)
  decisionMode: string;         // 决策授权模型
  memo?: string;                // 现状补充文字
}

// 模块一：重新定义的四大视图
export type AppView = 'home' | 'practice' | 'chat' | 'history' | 'case-detail' | 'expert-profile' | 'topic-detail' | 'profile' | 'diagnose-engine' | 'diagnose-consent' | 'diagnose-start';

export interface Expert {
  id: string;
  name: string;
  title: string;
  avatar: string;
  bio: string;
  quote: string;
  points: number;
  contentCount: number;
  stats: {
    prescriptions: number;
    likes: number;
    clicks: number;
    plays: number;
    bookmarks: number;
    comments: number;
  };
  topics: string[];
  resume: string[];
  tags: string[];
  caseDocument?: string;
  audioTitle?: string;
  videoTitle?: string;
}

export interface Topic {
  id: string;
  title: string;
  type: '组织必修' | '战友最痛';
  isHot?: boolean; // 模块二：左列-组织必修(Hot)
  isTop10?: boolean; // 模块二：中列-Top 10
  relatedIds?: string[]; // 模块三.4：手动配置关联话题
  caseStudy?: string; // 实战案例
  videoUrl?: string;
  audioUrl?: string;
  relatedQuestionIds?: string[];
}

export interface ExpertCase {
  id: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  expertId: string;
  expertName: string;
  background?: string;
  difficulty?: string;
  expertInsight?: string;
  expertProfile: {
    id: string;
    name: string;
    avatar: string;
    title: string;
    resume: string[];
  };
}

export interface UserStats {
  points: number;
  medals: string[];
  experience: string;
  scale: string;
  domain: string;
  bookmarks: string[];
  likes: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  isInitial?: boolean;
}

export interface HistoryItem {
  id: string;
  query: string;
  aiResponse: string;
  timestamp: number;
  context: ProfileContext;
  prescription?: Prescription;
  topicId?: string;
  isDeepDiagnosis?: boolean;
  diagnosticContext?: DiagnosticContext;
  chatHistory?: ChatMessage[];
}

export interface ImpactMetrics {
  morale: number;      // 士气
  efficiency: number;  // 效率
  retention: number;   // 保留率
}

export interface SimulationOption {
  id: string;
  text: string;
  isError: boolean;
  consequence?: string;
  impact?: ImpactMetrics; // V2.0 新增：量化指标
  feedback?: string;
}

export interface SimulationScenario {
  id: string;
  description: string;
  options: SimulationOption[];
}

export interface DiagnosticContext {
  intentStage: string;
  riskAssessment: string;
  interventionProgress: string;
  details: string;
  teamContext: ProfileContext;
}

export interface Prescription {
  truth: string;
  summary?: string;
  script: { opening: string; responses: string[]; closing: string; };
  redLines: string[];
}
