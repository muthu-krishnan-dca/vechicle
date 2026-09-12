import React, { useState, useEffect } from 'react';
import { IonIcon, IonButton, IonBadge, IonProgressBar, IonSpinner } from '@ionic/react';
import { closeOutline, timeOutline, checkmarkCircle, trophyOutline, arrowForwardOutline, arrowBackOutline, refreshOutline } from 'ionicons/icons';
import confetti from 'canvas-confetti';
import { RoadSignViewer } from './RoadSignViewer';
import { api, RTOQuestionItem, ExamSubmissionResponse } from '../services/api';

interface RtoExamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RtoExamModal: React.FC<RtoExamModalProps> = ({ isOpen, onClose }) => {
  const [questions, setQuestions] = useState<RTOQuestionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [examResult, setExamResult] = useState<ExamSubmissionResponse | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const data = await api.getMockExamQuestions();
      setQuestions(data);
      setCurrentIndex(0);
      setSelectedAnswers({});
      setIsSubmitted(false);
      setExamResult(null);
      setTimeLeft(30);
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchQuestions();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || isSubmitted || questions.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (currentIndex < questions.length - 1) {
            setCurrentIndex((idx) => idx + 1);
            return 30;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, isSubmitted, isOpen, questions.length]);

  const handleSelectOption = (idx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [questions[currentIndex].id]: idx,
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setTimeLeft(30);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setTimeLeft(30);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const submissions = questions.map((q) => ({
        question_id: q.id,
        selected_index: selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : -1,
      }));
      const result = await api.submitMockExam(submissions);
      setExamResult(result);
      setIsSubmitted(true);

      if (result.is_passed) {
        try {
          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}
      }
    } catch (err) {
      console.error('Exam submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentQ = questions[currentIndex];
  const progressVal = questions.length > 0 ? (currentIndex + 1) / questions.length : 0;

  return (
    <div className="bottom-sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet-modal" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '92vh' }}>
        <div className="sheet-drag-pill" />

        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>
              RTO Learner's Licence Exam
            </h3>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Parivahan Sarathi 60% Passing Benchmark
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <IonIcon icon={closeOutline} style={{ fontSize: '1.2rem', color: '#64748b' }} />
          </button>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '30px' }}>
            <IonSpinner name="crescent" style={{ color: '#2563eb' }} />
          </div>
        )}

        {/* Exam Active */}
        {!isSubmitted && currentQ && !loading && (
          <div>
            {/* Progress & Countdown */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#2563eb' }}>
                Question {currentIndex + 1} of {questions.length}
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700, color: timeLeft <= 10 ? '#dc2626' : '#ea580c', background: '#fff7ed', padding: '3px 8px', borderRadius: '12px' }}>
                <IonIcon icon={timeOutline} />
                <span>{timeLeft}s</span>
              </div>
            </div>

            <IonProgressBar value={progressVal} style={{ height: '5px', borderRadius: '3px', marginBottom: '16px', '--progress-background': '#2563eb' }} />

            {/* Road Sign / Graphic */}
            {currentQ.sign_code && currentQ.sign_code !== 'TRAFFIC_RULE' && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
                <div style={{ background: '#f8fafc', padding: '10px 20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <RoadSignViewer signCode={currentQ.sign_code} size={90} />
                </div>
              </div>
            )}

            {/* Question Text */}
            <h4 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', lineHeight: 1.35 }}>
              {currentQ.question_text}
            </h4>

            {/* Choices */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedAnswers[currentQ.id] === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: `1.5px solid ${isSelected ? '#2563eb' : '#e2e8f0'}`,
                      background: isSelected ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: isSelected ? '#2563eb' : '#f1f5f9',
                        color: isSelected ? '#ffffff' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                      }}
                    >
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span style={{ fontSize: '0.85rem', color: isSelected ? '#1e40af' : '#334155', fontWeight: isSelected ? 700 : 500 }}>
                      {opt}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
              <IonButton
                fill="outline"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                style={{
                  '--border-color': '#cbd5e1',
                  '--color': '#334155',
                  '--border-radius': '8px',
                  height: '40px',
                  fontWeight: 700,
                }}
              >
                Previous
              </IonButton>

              {currentIndex < questions.length - 1 ? (
                <IonButton
                  onClick={handleNext}
                  style={{
                    '--background': '#2563eb',
                    '--color': '#ffffff',
                    '--border-radius': '8px',
                    height: '40px',
                    fontWeight: 700,
                  }}
                >
                  Next Question
                </IonButton>
              ) : (
                <IonButton
                  onClick={handleSubmit}
                  style={{
                    '--background': '#16a34a',
                    '--color': '#ffffff',
                    '--border-radius': '8px',
                    height: '40px',
                    fontWeight: 800,
                  }}
                >
                  Submit Exam
                </IonButton>
              )}
            </div>
          </div>
        )}

        {/* Scorecard */}
        {isSubmitted && examResult && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <IonIcon icon={examResult.is_passed ? trophyOutline : checkmarkCircle} style={{ fontSize: '4rem', color: examResult.is_passed ? '#16a34a' : '#dc2626' }} />
            <h3 style={{ margin: '6px 0 2px 0', fontSize: '1.4rem', fontWeight: 800, color: '#1e293b' }}>
              {examResult.is_passed ? 'Congratulations! Exam Passed' : 'Test Completed'}
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.82rem', color: '#64748b' }}>
              Score: <strong>{examResult.correct_answers} / {examResult.total_questions} ({examResult.percentage}%)</strong> • Passing Requirement: 60%
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
              <IonButton
                onClick={fetchQuestions}
                style={{
                  '--background': '#2563eb',
                  '--color': '#ffffff',
                  '--border-radius': '8px',
                  height: '40px',
                  fontWeight: 700,
                }}
              >
                <IonIcon icon={refreshOutline} slot="start" />
                Retake Exam
              </IonButton>
              <IonButton
                fill="outline"
                onClick={onClose}
                style={{
                  '--border-color': '#e2e8f0',
                  '--color': '#334155',
                  '--border-radius': '8px',
                  height: '40px',
                }}
              >
                Close
              </IonButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
