export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { qa } = req.body;
    
    if (!qa || !Array.isArray(qa)) {
      return res.status(400).json({ error: 'Invalid request format' });
    }

    // Generate a personalized follow-up question based on previous Q&A
    const nextQuestion = generateNextQuestion(qa);
    
    return res.status(200).json({ question: nextQuestion });
  } catch (error) {
    console.error('Error generating next question:', error);
    return res.status(500).json({ error: 'Failed to generate question' });
  }
}

function generateNextQuestion(qa) {
  // Previous questions and answers
  const previousQA = qa.map(item => `Q: ${item.question}\nA: ${item.answer}`).join('\n');
  const questionCount = qa.length;
  
  // Pool of possible follow-up questions based on progress
  const questionPool = {
    // Early questions (more general)
    early: [
      "What's something you're looking forward to this week?",
      "When do you feel most energetic during the day?",
      "What's one small thing that typically improves your mood?",
      "How do you usually handle stress when it first appears?"
    ],
    // Middle questions (more specific)
    middle: [
      "What's one thing you wish you had more time for in your daily life?",
      "When was the last time you felt truly relaxed? What were you doing?",
      "What's one habit you're trying to build or break right now?",
      "How do you typically recharge when you're feeling drained?"
    ],
    // Late questions (more reflective)
    late: [
      "What area of your life currently feels most out of balance?",
      "What's one change you could make tomorrow that would improve your wellbeing?",
      "What relationship in your life gives you the most energy? The most stress?",
      "If you had a day completely to yourself, how would you spend it ideally?"
    ]
  };

  // Select question group based on progress
  let poolToUse;
  if (questionCount <= 2) {
    poolToUse = questionPool.early;
  } else if (questionCount <= 4) {
    poolToUse = questionPool.middle;
  } else {
    poolToUse = questionPool.late;
  }

  // Simple selection - pick question based on position
  // In a full implementation, you could use an AI to generate truly personalized questions
  const questionIndex = (questionCount - 1) % poolToUse.length;
  return poolToUse[questionIndex];
} 