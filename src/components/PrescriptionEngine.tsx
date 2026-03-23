import React, { useState, useEffect } from 'react';
import { Prescription } from '../types';
import { FileText, MessageSquare, AlertOctagon, CheckCircle } from 'lucide-react';

interface Props {
  prescription: Prescription;
  isGenerating: boolean;
}

export const PrescriptionEngine: React.FC<Props> = ({ prescription, isGenerating }) => {
  const [displayedTruth, setDisplayedTruth] = useState('');
  const [displayedOpening, setDisplayedOpening] = useState('');
  const [displayedResponses, setDisplayedResponses] = useState<string[]>([]);
  const [displayedClosing, setDisplayedClosing] = useState('');
  const [displayedRedLines, setDisplayedRedLines] = useState<string[]>([]);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setDisplayedTruth('');
      setDisplayedOpening('');
      setDisplayedResponses([]);
      setDisplayedClosing('');
      setDisplayedRedLines([]);
      setStep(0);
      return;
    }

    const typeText = (text: string, setter: React.Dispatch<React.SetStateAction<string>>, speed = 20) => {
      return new Promise<void>(resolve => {
        let i = 0;
        const interval = setInterval(() => {
          setter(prev => prev + text.charAt(i));
          i++;
          if (i >= text.length) {
            clearInterval(interval);
            resolve();
          }
        }, speed);
      });
    };

    const runSimulation = async () => {
      await typeText(prescription.truth, setDisplayedTruth);
      setStep(1);
      await typeText(prescription.script.opening, setDisplayedOpening);
      setStep(2);
      
      const newResponses: string[] = [];
      for (const response of prescription.script.responses) {
        newResponses.push('');
        setDisplayedResponses([...newResponses]);
        await typeText(response, (val) => {
          newResponses[newResponses.length - 1] = typeof val === 'function' ? val('') : val;
          setDisplayedResponses([...newResponses]);
        });
      }
      
      setStep(3);
      await typeText(prescription.script.closing, setDisplayedClosing);
      
      setStep(4);
      const newRedLines: string[] = [];
      for (const line of prescription.redLines) {
        newRedLines.push('');
        setDisplayedRedLines([...newRedLines]);
        await typeText(line, (val) => {
          newRedLines[newRedLines.length - 1] = typeof val === 'function' ? val('') : val;
          setDisplayedRedLines([...newRedLines]);
        });
      }
      setStep(5);
    };

    runSimulation();
  }, [isGenerating, prescription]);

  if (!isGenerating && step === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-lg font-bold text-[#1B3C59] mb-6 flex items-center">
        <FileText className="w-5 h-5 mr-2 text-[#F2C94C]" />
        AI 管理能力提升助手剧本
      </h2>

      <div className="space-y-6">
        <div className="bg-[#FEF9E7] p-4 rounded-md border-l-4 border-[#F2C94C] animate-pulse-text">
          <h3 className="text-sm font-bold text-[#1B3C59] mb-2 flex items-center">
            <AlertOctagon className="w-4 h-4 mr-2 text-[#F2C94C]" />
            真相揭秘
          </h3>
          <p className="text-sm text-[#2C3E50] leading-relaxed">
            {displayedTruth}
            {step === 0 && <span className="inline-block w-1 h-4 bg-[#1B3C59] animate-pulse ml-1"></span>}
          </p>
        </div>

        {step >= 1 && (
          <div className="bg-white p-4 rounded-md border border-gray-200 animate-pulse-text">
            <h3 className="text-sm font-bold text-[#1B3C59] mb-4 flex items-center">
              <MessageSquare className="w-4 h-4 mr-2 text-[#1B3C59]" />
              谈话剧本
            </h3>
            
            <div className="mb-4">
              <strong className="text-xs text-[#95A5A6] uppercase tracking-wider block mb-2">开场白</strong>
              <div className="bg-[#F4F7F9] p-3 rounded text-sm text-[#2C3E50] border-l-2 border-[#1B3C59]">
                {displayedOpening}
                {step === 1 && <span className="inline-block w-1 h-4 bg-[#1B3C59] animate-pulse ml-1"></span>}
              </div>
            </div>

            {step >= 2 && (
              <div className="mb-4">
                <strong className="text-xs text-[#95A5A6] uppercase tracking-wider block mb-2">核心拆解</strong>
                <ul className="space-y-3">
                  {displayedResponses.map((response, idx) => (
                    <li key={idx} className="flex items-start text-sm text-[#2C3E50]">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#1B3C59] text-white flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        {response}
                        {step === 2 && idx === displayedResponses.length - 1 && <span className="inline-block w-1 h-4 bg-[#1B3C59] animate-pulse ml-1"></span>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {step >= 3 && (
              <div>
                <strong className="text-xs text-[#95A5A6] uppercase tracking-wider block mb-2">收尾动作</strong>
                <div className="bg-[#F4F7F9] p-3 rounded text-sm text-[#2C3E50] border-l-2 border-[#1B3C59]">
                  {displayedClosing}
                  {step === 3 && <span className="inline-block w-1 h-4 bg-[#1B3C59] animate-pulse ml-1"></span>}
                </div>
              </div>
            )}
          </div>
        )}

        {step >= 4 && (
          <div className="bg-[#FDEDEC] p-4 rounded-md border-l-4 border-[#EB5757] animate-pulse-text">
            <h3 className="text-sm font-bold text-[#EB5757] mb-3 flex items-center">
              <AlertOctagon className="w-4 h-4 mr-2" />
              动作红线
            </h3>
            <ul className="space-y-2">
              {displayedRedLines.map((line, idx) => (
                <li key={idx} className="flex items-start text-sm text-[#2C3E50]">
                  <AlertOctagon className="w-4 h-4 text-[#EB5757] mr-2 mt-0.5 flex-shrink-0" />
                  <span>
                    {line}
                    {step === 4 && idx === displayedRedLines.length - 1 && <span className="inline-block w-1 h-4 bg-[#EB5757] animate-pulse ml-1"></span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {step === 5 && (
          <div className="flex justify-end mt-6 animate-pulse-text">
            <button className="flex items-center text-sm font-medium text-green-600 bg-green-50 px-4 py-2 rounded border border-green-200">
              <CheckCircle className="w-4 h-4 mr-2" />
              建议已生成，已存入锦囊库
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
