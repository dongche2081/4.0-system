import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ExpertProfileView } from '../ExpertProfileView';
import type { Expert } from '../../types';

interface ExpertProfileViewWrapperProps {
  experts: Expert[];
  onBook: (id: string) => void;
  onViewCase: (caseId: string, expertId: string) => void;
}

export const ExpertProfileViewWrapper: React.FC<ExpertProfileViewWrapperProps> = ({ 
  experts, 
  onBook, 
  onViewCase 
}) => {
  const { expertId } = useParams<{ expertId: string }>();
  const navigate = useNavigate();
  const expert = experts.find(e => e.id === expertId);

  if (!expert) return <div className="flex items-center justify-center h-full text-slate-400">专家加载中...</div>;

  return (
    <ExpertProfileView 
      expert={expert} 
      onBack={() => navigate('/')} 
      onBook={() => onBook(expert.id)}
      onViewCase={(caseId) => onViewCase(caseId, expert.id)}
    />
  );
};
