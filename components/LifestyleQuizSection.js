import { useState, useEffect } from 'react';
/** @typedef {import('../lib/types').Profile} Profile */

const QUESTIONS = [
  {
    key: 'ageRange',
    question: 'Which age range best describes you?',
    type: 'bubbles',
    options: ['18–22', '23–30', '31–40', '41–55', '56+'],
  },
  {
    key: 'occupation',
    question: 'What\'s your current occupation?',
    type: 'bubbles',
    options: ['Student', 'Employed', 'Freelancer', 'Self-employed', 'Retired'],
  },
  {
    key: 'hobbies',
    question: 'Pick your favorite hobbies (tap all that apply):',
    type: 'multi',
    options: ['Golf', 'Guitar', 'Reading', 'Cooking', 'Gaming', 'Hiking', 'Art'],
  },
  {
    key: 'availability',
    question: 'When are you free each day? Drag the handles:',
    type: 'slider',
    min: 0,
    max: 24,
    step: 0.5,
  },
  {
    key: 'dinnerPrefs',
    question: 'Dinner style:',
    type: 'bubbles',
    options: ['Cook at home', 'Order takeout', 'Meal kit', 'Go out'],
  },
  {
    key: 'evening',
    question: 'After dinner, what builds relationships?',
    type: 'bubbles',
    options: ['Watch a movie', 'Board/card games', 'Family chat', 'Go for a walk'],
  },
];

export default function LifestyleQuizSection({ initialProfile, onComplete }) {
  const [step, setStep] = useState(0);
  /** @type {[Profile, React.Dispatch<React.SetStateAction<Profile>>]} */
  const [answers, setAnswers] = useState({
    ageRange: '',
    occupation: '',
    hobbies: [],
    availability: [18, 20], // default 6pm–8pm
    dinnerPrefs: '',
    evening: '',
  });
  const [submitting, setSubmitting] = useState(false);
  /** @type {[string, React.Dispatch<React.SetStateAction<string>>]} */
  const [plan, setPlan] = useState(null);
  const [finished, setFinished] = useState(false);
  
  // If initial profile is provided, use it
  useEffect(() => {
    if (initialProfile) {
      setAnswers(initialProfile);
    }
  }, [initialProfile]);

  const q = !finished ? QUESTIONS[step] : null;

  const handleBubble = (opt) => {
    if (q.type === 'multi') {
      setAnswers((a) => {
        const arr = a.hobbies.includes(opt)
          ? a.hobbies.filter((h) => h !== opt)
          : [...a.hobbies, opt];
        return { ...a, hobbies: arr };
      });
    } else {
      setAnswers((a) => ({ ...a, [q.key]: opt }));
    }
  };

  const handleSlider = (e, idx) => {
    const val = parseFloat(e.target.value);
    setAnswers((a) => {
      const arr = [...a.availability];
      arr[idx] = val;
      return { ...a, availability: arr };
    });
  };

  const canNext = () => {
    if (!q) return false;
    const val = answers[q.key];
    if (q.type === 'multi') return val.length > 0;
    if (q.type === 'slider') return true;
    return val !== '';
  };

  const handleNext = async () => {
    if (step < QUESTIONS.length - 1) {
      setStep((s) => s + 1);
    } else {
      setSubmitting(true);
      
      // Call the onComplete callback
      if (onComplete) {
        await onComplete(answers);
      }
      
      // Get a personalized lifestyle plan
      const response = await fetch('/api/lifestyle-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      });
      
      const data = await response.json();
      setPlan(data.plan);
      setSubmitting(false);
      setFinished(true);
    }
  };
  
  // Handler to restart the quiz
  const handleRestart = () => {
    setFinished(false);
    setStep(0);
    setPlan(null);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {!finished ? (
        <>
          <h2 className="text-2xl font-semibold">
            {q.question}
          </h2>

          {/* Bubbles & Multi-select */}
          {(q.type === 'bubbles' || q.type === 'multi') && (
            <div className="flex flex-wrap gap-3">
              {q.options.map((opt) => {
                const selected =
                  q.type === 'multi'
                    ? answers.hobbies.includes(opt)
                    : answers[q.key] === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => handleBubble(opt)}
                    className={`px-4 py-2 rounded-full border ${
                      selected
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-white text-gray-800 border-gray-300'
                    } transition`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {/* Slider */}
          {q.type === 'slider' && (
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>
                  {answers.availability[0].toFixed(1)}h
                </span>
                <span>
                  {answers.availability[1].toFixed(1)}h
                </span>
              </div>
              <div className="relative h-6">
                <input
                  type="range"
                  min={q.min}
                  max={q.max}
                  step={q.step}
                  value={answers.availability[0]}
                  onChange={(e) => handleSlider(e, 0)}
                  className="absolute inset-0 w-full opacity-0"
                />
                <input
                  type="range"
                  min={q.min}
                  max={q.max}
                  step={q.step}
                  value={answers.availability[1]}
                  onChange={(e) => handleSlider(e, 1)}
                  className="absolute inset-0 w-full opacity-0"
                />
                {/* Visual track */}
                <div className="h-1 bg-gray-200 rounded-full mt-2" />
                <div
                  className="h-1 bg-green-600 rounded-full mt-2"
                  style={{
                    left: `${(answers.availability[0] / 24) * 100}%`,
                    right: `${100 -
                      (answers.availability[1] / 24) * 100}%`,
                    position: 'absolute',
                  }}
                />
              </div>
            </div>
          )}

          <button
            onClick={handleNext}
            disabled={!canNext() || submitting}
            className="mt-6 w-full py-3 bg-green-600 text-white rounded-lg disabled:opacity-50 hover:bg-green-700 transition"
          >
            {submitting ? 'Saving...' : step < QUESTIONS.length - 1 ? 'Next' : 'Finish & Get Plan'}
          </button>
          
          {/* Progress indicator */}
          <div className="flex justify-center">
            <div className="text-xs text-gray-500">
              Question {step + 1} of {QUESTIONS.length}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Your Personalized Lifestyle Plan</h2>
            <button
              onClick={handleRestart}
              className="text-sm text-green-600 hover:text-green-800"
            >
              Update Preferences
            </button>
          </div>
          
          {submitting ? (
            <div className="my-8 text-gray-600 text-center">Generating your plan...</div>
          ) : (
            <div className="bg-white p-6 rounded-xl shadow-sm mt-6 text-left prose max-w-none whitespace-pre-wrap">
              {plan}
            </div>
          )}
        </>
      )}
    </div>
  );
} 