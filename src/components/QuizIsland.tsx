import { useState } from 'preact/hooks';
import { markComplete } from './ProgressProvider';

interface QuizOption {
  text: string;
  correct: boolean;
  explain: string;
}

interface QuizQuestion {
  question: string;
  options: QuizOption[];
}

interface Props {
  questions: QuizQuestion[];
  trackId: string;
  conceptId: string;
  conceptTitle: string;
  takeawayText: string;
}

const LETTERS = ['A', 'B', 'C', 'D'];

export default function QuizIsland({ questions, trackId, conceptId, conceptTitle, takeawayText }: Props) {
  const [quizIdx, setQuizIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | undefined)[]>(new Array(questions.length).fill(undefined));
  const [showResult, setShowResult] = useState(false);

  if (showResult) {
    const correct = answers.reduce((sum, a, i) => {
      if (a === undefined) return sum;
      return sum + (questions[i].options[a].correct ? 1 : 0);
    }, 0);
    const total = questions.length;
    const perfect = correct === total;

    return (
      <div class="result-screen screen">
        <div class="result-emoji">{perfect ? '📚' : correct > 0 ? '🌱' : '🤔'}</div>
        <div class="complete-label">CONCEPT COMPLETE</div>
        <h2>{conceptTitle}</h2>
        <div class={`result-score ${perfect ? 'perfect' : ''}`}>{correct}/{total}</div>
        <div class="result-msg">
          {perfect
            ? 'Locked in. The analogy stuck.'
            : correct > 0
              ? 'Nearly there — review the analogy and try again.'
              : 'Watch it again — the analogy is the key.'}
        </div>

        <div class="takeaway-result-box">
          <div class="takeaway-result-label">TAKE AWAY</div>
          <div class="takeaway-result-quote">{takeawayText}</div>
        </div>

        <div class="result-buttons">
          <a href={`/resources/${trackId}/${conceptId}`} class="action-btn">
            Go Deeper &rarr;
          </a>
          <a href={`/tracks/${trackId}`} class="action-btn solid-dark">
            Back to Track
          </a>
          <button
            class="text-btn"
            onClick={() => {
              setQuizIdx(0);
              setAnswers(new Array(questions.length).fill(undefined));
              setShowResult(false);
            }}
          >
            Retry Quiz
          </button>
        </div>
      </div>
    );
  }

  const q = questions[quizIdx];
  const total = questions.length;
  const userAnswer = answers[quizIdx];
  const answered = userAnswer !== undefined;
  const selectedOpt = answered ? q.options[userAnswer] : null;
  const isLast = quizIdx === total - 1;

  function handleAnswer(idx: number) {
    if (answered) return;
    const newAnswers = [...answers];
    newAnswers[quizIdx] = idx;
    setAnswers(newAnswers);
  }

  function handleNext() {
    if (isLast) {
      // Compute score and save progress
      const correct = answers.reduce((sum, a, i) => {
        if (a === undefined) return sum;
        return sum + (questions[i].options[a].correct ? 1 : 0);
      }, 0);
      markComplete(trackId, conceptId, `${correct}/${questions.length}`);
      setShowResult(true);
    } else {
      setQuizIdx(quizIdx + 1);
    }
  }

  return (
    <div class="screen">
      <div class="topbar">
        <a href={`/lessons/${trackId}/${conceptId}`} class="back-btn">&larr;</a>
        <div class="topbar-title">QUIZ &middot; {conceptTitle.toUpperCase()}</div>
        <div class="topbar-meta">Q{quizIdx + 1}/{total}</div>
      </div>

      <div class="quiz-question">
        <h2>{q.question}</h2>
      </div>

      <div class="quiz-options">
        {q.options.map((opt, i) => {
          let cls = '';
          if (answered) {
            if (i === userAnswer && opt.correct) cls = 'correct locked';
            else if (i === userAnswer && !opt.correct) cls = 'wrong locked';
            else if (opt.correct) cls = 'correct locked';
            else cls = 'locked';
          }
          let icon: string = LETTERS[i];
          if (answered) {
            if (opt.correct) icon = '✓';
            else if (i === userAnswer) icon = '✕';
          }
          return (
            <button
              class={`quiz-option ${cls}`}
              disabled={answered}
              onClick={() => handleAnswer(i)}
            >
              <span class="opt-marker">{icon}</span>
              <span>{opt.text}</span>
            </button>
          );
        })}
      </div>

      {answered && selectedOpt && (
        <>
          <div class={`feedback-box ${selectedOpt.correct ? 'correct' : 'wrong'}`}>
            <div class="feedback-title">
              {selectedOpt.correct ? '✓ Correct' : '✕ Not quite'}
            </div>
            <div class="feedback-text">{selectedOpt.explain}</div>
          </div>
          <button class="action-btn" onClick={handleNext}>
            {isLast ? 'See Results' : 'Next Question'} &rarr;
          </button>
        </>
      )}
    </div>
  );
}
