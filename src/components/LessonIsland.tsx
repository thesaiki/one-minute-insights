import { useState } from 'preact/hooks';

interface Step {
  type: string;
  emoji: string;
  label: string | null;
  body: string;
}

interface Props {
  steps: Step[];
  trackId: string;
  conceptId: string;
  conceptIcon: string;
  conceptTitle: string;
}

function formatBody(text: string): string {
  const parts = text.split('\n\n');
  return parts.map(part => {
    const lines = part.split('\n');
    if (lines[0].startsWith('- ')) {
      return `<ul>${lines.map(l => `<li>${formatInline(l.slice(2))}</li>`).join('')}</ul>`;
    }
    return `<p>${formatInline(part.replace(/\n/g, '<br>'))}</p>`;
  }).join('');
}

function formatInline(text: string): string {
  return text.replace(/`([^`]+)`/g, '<code>$1</code>');
}

export default function LessonIsland({ steps, trackId, conceptId, conceptIcon, conceptTitle }: Props) {
  const [currentStep, setCurrentStep] = useState(0);

  const step = steps[currentStep];
  const total = steps.length;
  const isLast = currentStep === total - 1;
  const nextLabel = isLast ? 'Take the Quiz' : `Next: ${steps[currentStep + 1]?.label || 'Take Away'}`;
  const isTakeaway = step.type === 'takeaway';

  function handleBack() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }

  function handleNext() {
    if (isLast) {
      window.location.href = `/quiz/${trackId}/${conceptId}`;
    } else {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  }

  return (
    <div class="screen">
      <div class="topbar">
        {currentStep > 0 ? (
          <button class="back-btn" onClick={handleBack}>&larr;</button>
        ) : (
          <a href={`/tracks/${trackId}`} class="back-btn">&larr;</a>
        )}
        <div class="topbar-title">
          <span>{conceptIcon}</span>
          <span>{conceptTitle.toUpperCase()}</span>
        </div>
        <div class="topbar-meta">{currentStep + 1} / {total}</div>
      </div>

      <div class="lesson-progress">
        <div class="lesson-progress-bars">
          {Array.from({ length: total }).map((_, i) => (
            <div
              class={`progress-pip ${i < currentStep ? 'complete' : i === currentStep ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>

      <div class="lesson-card" key={currentStep}>
        <span class="corner-emoji">{conceptIcon}</span>
        <div class="lesson-step-label">
          <span class="lesson-step-emoji">{step.emoji}</span>
          <span>{step.label || 'Take Away'}</span>
        </div>

        {isTakeaway ? (
          <div class="takeaway-quote">
            <div class="takeaway-emoji">{step.emoji}</div>
            <div class="takeaway-text">{step.body}</div>
          </div>
        ) : (
          <div class="lesson-body" dangerouslySetInnerHTML={{ __html: formatBody(step.body) }} />
        )}
      </div>

      <button class={`action-btn ${isLast ? '' : 'outline'}`} onClick={handleNext}>
        {nextLabel} &rarr;
      </button>
    </div>
  );
}
