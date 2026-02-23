import { useMemo, useState } from 'react';
import { AdvisoryToolShell } from '../AdvisoryToolShell';
import { buildQuizQuestions, resolveProxyAffinity, type QuizQuestion } from '../../../core/advisory-tools-engine';
import type { ProxyAffinityResult, ProxyDefinition } from '../../../domain/types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  proxyLibrary: ProxyDefinition[];
  onApplyToNextBid: (result: ProxyAffinityResult) => void;
};

export function ProxyPersonalityAssessmentModal(props: Props) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => buildQuizQuestions());
  const [currentStep, setCurrentStep] = useState(0);
  const [selected, setSelected] = useState<Record<string, QuizQuestion['options'][number]>>({});
  const result = useMemo(() => {
    if (Object.keys(selected).length !== questions.length) return null;
    return resolveProxyAffinity(props.proxyLibrary, Object.values(selected));
  }, [props.proxyLibrary, questions.length, selected]);

  if (!props.isOpen) return null;

  const activeQuestion = questions[currentStep];
  const stepLabel = `${Math.min(currentStep + 1, questions.length)}/${questions.length}`;

  return (
    <AdvisoryToolShell title="DBT Proxy Affinity Assessment – Pursuant to Personality Index 4.2" onClose={props.onClose} mobileFullScreen>
      {!result && activeQuestion && (
        <div>
          <p className="helper">Step {stepLabel}</p>
          <progress value={currentStep + 1} max={questions.length} />
          <p>{activeQuestion.prompt}</p>
          <div className="cards">
            {activeQuestion.options.map((option) => (
              <button
                key={option.id}
                className="card-button"
                onClick={() => {
                  const next = { ...selected, [activeQuestion.id]: option };
                  setSelected(next);
                  setCurrentStep((prev) => Math.min(prev + 1, questions.length));
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {result && (
        <div>
          <p><strong>Assessment Complete:</strong> Your Spirit Proxy is {result.proxyName}.</p>
          <p className="badge-volatility">DBT-Certified Module</p>
          <p className="helper">Rate: {result.rate.toFixed(2)} · {result.rationale}</p>
          <pre>{result.snippet}</pre>
          <div className="actions-row actions-row--two">
            <button className="ccc-button-primary" onClick={() => props.onApplyToNextBid(result)}>Apply to Next Bid</button>
            <button
              onClick={() => {
                setQuestions(buildQuizQuestions());
                setSelected({});
                setCurrentStep(0);
              }}
            >
              Retake Certification
            </button>
          </div>
        </div>
      )}
    </AdvisoryToolShell>
  );
}
