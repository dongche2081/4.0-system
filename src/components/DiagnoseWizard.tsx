import React, { useState } from 'react';
import { StepScenario } from './DiagnoseWizard/StepScenario';
import { StepQuestions } from './DiagnoseWizard/StepQuestions';
import { StepResult } from './DiagnoseWizard/StepResult';

export interface WizardData {
  scenario: string;
  answers: Record<string, string>;
  details: string;
}

interface Props {
  onComplete: (data: WizardData) => void;
}

type WizardStep = 1 | 2 | 3;

export const DiagnoseWizard: React.FC<Props> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [scenario, setScenario] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [details, setDetails] = useState('');

  const canGoToStep2 = scenario.trim().length > 0;
  const canStartDiagnosis = Object.keys(answers).length >= 3;

  const handleNext = () => {
    if (canGoToStep2) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = () => {
    if (!canStartDiagnosis) return;
    setCurrentStep(3);
    onComplete({ scenario, answers, details });
  };

  const handleRestart = () => {
    setCurrentStep(1);
    setScenario('');
    setAnswers({});
    setDetails('');
  };

  const steps = [
    { step: 1, title: '描述场景', desc: '输入你的管理困境' },
    { step: 2, title: '回答题目', desc: '几道关键调研题目' },
    { step: 3, title: 'AI 生成', desc: '定制化，可追问' },
  ];

  return (
    <div>
      {/* 步骤指示器 */}
      <div className="flex items-center justify-center gap-2 md:gap-4 py-4 mb-6">
        {steps.map((s, idx) => (
          <React.Fragment key={s.step}>
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                s.step === currentStep
                  ? 'bg-[#F2C94C] border-[#F2C94C] text-white shadow-md'
                  : s.step < currentStep
                    ? 'bg-[#F2C94C]/10 border-[#F2C94C]/30 text-[#F2C94C]'
                    : 'bg-white border-slate-200 text-slate-400'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  s.step === currentStep
                    ? 'bg-white/20 text-white'
                    : s.step < currentStep
                      ? 'bg-[#F2C94C] text-white'
                      : 'bg-slate-100 text-slate-400'
                }`}
              >
                {s.step < currentStep ? '✓' : s.step}
              </div>
              <div className="hidden md:block">
                <div
                  className={`text-sm font-bold ${
                    s.step === currentStep
                      ? 'text-white'
                      : s.step < currentStep
                        ? 'text-[#F2C94C]'
                        : 'text-slate-600'
                  }`}
                >
                  {s.title}
                </div>
                <div
                  className={`text-[10px] ${
                    s.step === currentStep ? 'text-white/80' : 'text-slate-400'
                  }`}
                >
                  {s.desc}
                </div>
              </div>
            </div>
            {idx < 2 && (
              <div
                className={`hidden md:block ${
                  s.step < currentStep ? 'text-[#F2C94C]' : 'text-slate-300'
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* 步骤内容 */}
      <div className="max-w-3xl mx-auto">
        {currentStep === 1 && (
          <StepScenario
            scenario={scenario}
            onScenarioChange={setScenario}
            onNext={handleNext}
            canGoNext={canGoToStep2}
          />
        )}

        {currentStep === 2 && (
          <StepQuestions
            scenario={scenario}
            answers={answers}
            onAnswersChange={setAnswers}
            details={details}
            onDetailsChange={setDetails}
            onBack={handleBack}
            onSubmit={handleSubmit}
            canSubmit={canStartDiagnosis}
          />
        )}

        {currentStep === 3 && (
          <StepResult scenario={scenario} onRestart={handleRestart} />
        )}
      </div>
    </div>
  );
};
