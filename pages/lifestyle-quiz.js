import { useState } from 'react';
import Head from 'next/head';
// Import for JSDoc type references
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

export default function QuizPage() {
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
  /** @type {[Profile, React.Dispatch<React.SetStateAction<Profile>>]} */
  const [profile, setProfile] = useState(null);

  const q = QUESTIONS[step];

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
    const val = answers[q.key];
    if (q.type === 'multi') return val.length > 0;
    if (q.type === 'slider') return true;
    return val !== '';
  };

  /**
   * Handle next button click to advance questions or submit
   * @returns {Promise<void>}
   */
  const handleNext = async () => {
    if (step < QUESTIONS.length - 1) {
      setStep((s) => s + 1);
    } else {
      setSubmitting(true);
      const response = await fetch('/api/lifestyle-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      });
      
      const data = await response.json();
      setProfile(data.plan);
      setSubmitting(false);
      setStep((s) => s + 1);
    }
  };

  return (
    <>
      <Head>
        <title>Lifestyle Quiz</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="min-h-screen bg-gray-50 font-[Montserrat] p-8">
        <div className="max-w-xl mx-auto space-y-6">
          {step < QUESTIONS.length ? (
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
                            ? 'bg-black text-white border-black'
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
                      className="h-1 bg-black rounded-full mt-2"
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
                disabled={!canNext()}
                className="mt-6 w-full py-3 bg-black text-white rounded-lg disabled:opacity-50"
              >
                {step < QUESTIONS.length - 1
                  ? 'Next'
                  : submitting
                  ? 'Sending…'
                  : 'Finish & Get Plan'}
              </button>
            </>
          ) : (
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold">
                Your Personalized Lifestyle Plan
              </h2>
              {submitting ? (
                <div className="my-8 text-gray-600">Generating your plan...</div>
              ) : (
                <div className="bg-white p-6 rounded-xl shadow-sm mt-6 text-left prose max-w-none whitespace-pre-wrap">
                  {profile}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
} 