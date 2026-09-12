import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonButton,
  IonBadge,
  IonIcon,
  IonSpinner,
  IonProgressBar,
} from '@ionic/react';
import {
  schoolOutline,
  timeOutline,
  checkmarkCircle,
  closeCircle,
  refreshOutline,
  trophyOutline,
  arrowForwardOutline,
  arrowBackOutline,
  documentTextOutline,
} from 'ionicons/icons';
import confetti from 'canvas-confetti';
import { Header } from '../components/Header';
import { RoadSignViewer } from '../components/RoadSignViewer';
import { api, RTOQuestionItem, ExamSubmissionResponse } from '../services/api';

export const ExamTab: React.FC = () => {
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
      console.error('Failed to fetch RTO questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // 30s Countdown timer per question during exam
  useEffect(() => {
    if (isSubmitted || questions.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Auto advance to next question or stay
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
  }, [currentIndex, isSubmitted, questions.length]);

  const handleSelectOption = (optionIndex: number) => {
    if (isSubmitted) return;
    const currentQ = questions[currentIndex];
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQ.id]: optionIndex,
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

  const handleSubmitExam = async () => {
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
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#10b981', '#06b6d4', '#f59e0b', '#3b82f6'],
          });
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.error('Failed to submit exam:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = questions.length > 0 ? (currentIndex + 1) / questions.length : 0;

  return (
    <IonPage>
      <Header />
      <IonContent fullscreen className="ion-padding" style={{ '--background': '#090d16' }}>
        <div className="app-container">
          {/* Header Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.7) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '18px',
              padding: '24px 20px',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'rgba(245, 158, 11, 0.15)', borderRadius: '20px', border: '1px solid rgba(245, 158, 11, 0.3)', marginBottom: '8px' }}>
                  <IonIcon icon={schoolOutline} style={{ color: '#fbbf24', fontSize: '0.9rem' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fbbf24' }}>Parivahan Sarathi Mock Test Simulator</span>
                </div>
                <h1 style={{ margin: '0 0 6px 0', fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>
                  RTO Learner's Licence (LL) Exam
                </h1>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#94a3b8', maxWidth: '680px' }}>
                  Simulated computerized examination covering Indian mandatory, cautionary, and informatory road traffic signs. Minimum 60% (9/15) score required to qualify.
                </p>
              </div>

              {/* Status Pills */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ padding: '8px 14px', background: 'rgba(30, 41, 59, 0.6)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block' }}>Passing Benchmark</span>
                  <strong style={{ color: '#10b981', fontSize: '1rem' }}>60% (9/15)</strong>
                </div>

                <div style={{ padding: '8px 14px', background: 'rgba(30, 41, 59, 0.6)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block' }}>Answered</span>
                  <strong style={{ color: '#38bdf8', fontSize: '1rem' }}>{answeredCount} / {questions.length}</strong>
                </div>
              </div>
            </div>
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <IonSpinner name="crescent" style={{ width: '36px', height: '36px', color: '#06b6d4' }} />
              <div style={{ marginTop: '10px', color: '#94a3b8' }}>Loading official RTO question bank...</div>
            </div>
          )}

          {/* Active Exam Interface */}
          {!isSubmitted && currentQuestion && !loading && (
            <div className="glass-card" style={{ padding: '24px 22px' }}>
              {/* Progress and Timer Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IonBadge style={{ '--background': '#06b6d4', padding: '6px 12px', fontSize: '0.82rem', fontWeight: 800 }}>
                    Question {currentIndex + 1} of {questions.length}
                  </IonBadge>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Category: {currentQuestion.category}</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    background: timeLeft <= 10 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.15)',
                    border: `1px solid ${timeLeft <= 10 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.3)'}`,
                    color: timeLeft <= 10 ? '#f87171' : '#fbbf24',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}
                >
                  <IonIcon icon={timeOutline} />
                  <span>{timeLeft}s remaining</span>
                </div>
              </div>

              <IonProgressBar value={progressPercent} color="primary" style={{ marginBottom: '20px', height: '6px', borderRadius: '3px' }} />

              {/* Question Layout: Road Sign Graphic + Question Text */}
              <div style={{ display: 'grid', gridTemplateColumns: currentQuestion.sign_code !== 'TRAFFIC_RULE' ? '140px 1fr' : '1fr', gap: '20px', alignItems: 'center', marginBottom: '24px' }}>
                {currentQuestion.sign_code !== 'TRAFFIC_RULE' && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(15, 23, 42, 0.8)', padding: '12px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <RoadSignViewer signCode={currentQuestion.sign_code} size={110} />
                  </div>
                )}

                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.4 }}>
                    {currentQuestion.question_text}
                  </h3>
                </div>
              </div>

              {/* 4 Multiple Choice Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {currentQuestion.options.map((option, optIdx) => {
                  const isSelected = selectedAnswers[currentQuestion.id] === optIdx;
                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      style={{
                        padding: '14px 18px',
                        borderRadius: '12px',
                        border: `1.5px solid ${isSelected ? '#06b6d4' : 'rgba(255, 255, 255, 0.1)'}`,
                        background: isSelected ? 'rgba(6, 182, 212, 0.12)' : 'rgba(30, 41, 59, 0.45)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          background: isSelected ? '#06b6d4' : 'rgba(255, 255, 255, 0.08)',
                          color: isSelected ? '#ffffff' : '#94a3b8',
                        }}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                      <span style={{ fontSize: '0.92rem', color: isSelected ? '#f8fafc' : '#cbd5e1', fontWeight: isSelected ? 600 : 400 }}>
                        {option}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Navigation Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <IonButton
                  fill="outline"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  style={{
                    '--border-color': 'rgba(255, 255, 255, 0.2)',
                    '--color': '#cbd5e1',
                    '--border-radius': '10px',
                    height: '42px',
                  }}
                >
                  <IonIcon icon={arrowBackOutline} slot="start" />
                  Previous
                </IonButton>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {currentIndex < questions.length - 1 ? (
                    <IonButton
                      onClick={handleNext}
                      style={{
                        '--background': '#06b6d4',
                        '--color': '#ffffff',
                        '--border-radius': '10px',
                        height: '42px',
                        fontWeight: 700,
                      }}
                    >
                      Next Question
                      <IonIcon icon={arrowForwardOutline} slot="end" />
                    </IonButton>
                  ) : (
                    <IonButton
                      onClick={handleSubmitExam}
                      style={{
                        '--background': '#10b981',
                        '--color': '#ffffff',
                        '--border-radius': '10px',
                        height: '42px',
                        fontWeight: 800,
                        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                      }}
                    >
                      Submit Exam for Evaluation
                    </IonButton>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Exam Result Scorecard */}
          {isSubmitted && examResult && (
            <div>
              <div
                className="glass-card"
                style={{
                  padding: '32px 24px',
                  textAlign: 'center',
                  borderTop: `6px solid ${examResult.is_passed ? '#10b981' : '#ef4444'}`,
                  marginBottom: '24px',
                }}
              >
                <IonIcon
                  icon={examResult.is_passed ? trophyOutline : closeCircle}
                  style={{
                    fontSize: '4.5rem',
                    color: examResult.is_passed ? '#10b981' : '#ef4444',
                    marginBottom: '10px',
                  }}
                />

                <h2 style={{ margin: '0 0 6px 0', fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'Outfit' }}>
                  {examResult.is_passed ? 'Congratulations! You Passed the RTO Exam' : 'Needs More Practice'}
                </h2>

                <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: '#94a3b8' }}>
                  Official Ministry of Road Transport & Highways Benchmark: Minimum 60% to qualify for Learner's Licence.
                </p>

                {/* Score Summary Metrics */}
                <div style={{ display: 'inline-flex', gap: '20px', padding: '16px 24px', background: 'rgba(15, 23, 42, 0.7)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', marginBottom: '20px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Your Score</span>
                    <strong style={{ fontSize: '1.8rem', color: examResult.is_passed ? '#10b981' : '#ef4444', fontFamily: 'Outfit' }}>
                      {examResult.correct_answers} / {examResult.total_questions}
                    </strong>
                  </div>

                  <div style={{ width: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />

                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Percentage</span>
                    <strong style={{ fontSize: '1.8rem', color: '#38bdf8', fontFamily: 'Outfit' }}>
                      {examResult.percentage}%
                    </strong>
                  </div>

                  <div style={{ width: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />

                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Result Status</span>
                    <strong style={{ fontSize: '1.8rem', color: examResult.is_passed ? '#10b981' : '#f87171', fontFamily: 'Outfit' }}>
                      {examResult.is_passed ? 'PASS' : 'FAIL'}
                    </strong>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                  <IonButton
                    onClick={fetchQuestions}
                    style={{
                      '--background': '#06b6d4',
                      '--color': '#ffffff',
                      '--border-radius': '10px',
                      height: '42px',
                      fontWeight: 700,
                    }}
                  >
                    <IonIcon icon={refreshOutline} slot="start" />
                    Retake Mock Test
                  </IonButton>
                </div>
              </div>

              {/* Detailed Answers Review Section */}
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc' }}>
                Detailed Question Review & Explanations ({examResult.detailed_results.length})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {examResult.detailed_results.map((item, idx) => (
                  <div
                    key={item.question_id}
                    className="glass-card"
                    style={{
                      padding: '16px 20px',
                      borderLeft: `4px solid ${item.is_correct ? '#10b981' : '#ef4444'}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>
                        Question {idx + 1}
                      </span>
                      <IonBadge
                        style={{
                          '--background': item.is_correct ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          '--color': item.is_correct ? '#34d399' : '#f87171',
                          padding: '4px 10px',
                          borderRadius: '6px',
                        }}
                      >
                        {item.is_correct ? 'Correct' : 'Incorrect'}
                      </IonBadge>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '12px' }}>
                      {item.sign_code && item.sign_code !== 'TRAFFIC_RULE' && (
                        <div style={{ flexShrink: 0 }}>
                          <RoadSignViewer signCode={item.sign_code} size={65} />
                        </div>
                      )}
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                        {item.question_text}
                      </h4>
                    </div>

                    {/* Answers Comparison */}
                    <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px 14px', borderRadius: '10px', fontSize: '0.82rem', marginBottom: '10px' }}>
                      <div style={{ marginBottom: '4px' }}>
                        <span style={{ color: '#94a3b8' }}>Your Answer: </span>
                        <strong style={{ color: item.is_correct ? '#10b981' : '#ef4444' }}>
                          {item.selected_index >= 0 ? item.options[item.selected_index] : 'No Answer Selected'}
                        </strong>
                      </div>
                      {!item.is_correct && (
                        <div>
                          <span style={{ color: '#94a3b8' }}>Official Correct Answer: </span>
                          <strong style={{ color: '#10b981' }}>{item.options[item.correct_index]}</strong>
                        </div>
                      )}
                    </div>

                    {/* RTO Explanation */}
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', borderTop: '1px dashed rgba(255, 255, 255, 0.08)', paddingTop: '8px' }}>
                      <strong style={{ color: '#38bdf8' }}>Official RTO Rule: </strong>
                      {item.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};
