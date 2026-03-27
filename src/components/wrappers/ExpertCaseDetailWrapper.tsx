import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ExpertCaseDetail } from '../ExpertCaseDetail';
import { EXPERT_CASES } from '../../data';
import { useApp } from '../../contexts/AppContext';

export const ExpertCaseDetailWrapper: React.FC = () => {
  const { expertId, caseId } = useParams<{ expertId: string; caseId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const app = useApp();
  const { userStats, handleTrackInteraction } = app;

  const autoFocusMedia = location.state?.autoFocusMedia as any;
  const expertCase = EXPERT_CASES[caseId || ''];

  if (!expertCase) return <div className="flex items-center justify-center h-full text-slate-400">案例加载中...</div>;

  return (
    <ExpertCaseDetail 
      expertCase={expertCase} 
      onClose={() => navigate(`/expert/${expertId}`)} 
      autoFocusMedia={autoFocusMedia}
      onTrackInteraction={(type) => handleTrackInteraction(expertCase.id, type)}
      initialIsBookmarked={userStats.bookmarks?.includes(expertCase.id)}
      initialIsLiked={userStats.likes?.includes(expertCase.id)}
    />
  );
};
