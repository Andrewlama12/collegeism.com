export interface Question {
  id: string;
  prompt: string;
  options: string[];
  profileKey: string;
  level: number;
}

export interface QuizConfig {
  id: string;
  title: string;
  questions: Question[];
}

export const quizConfigs: QuizConfig[] = [
  {
    id: 'dailyContext',
    title: 'Daily Context',
    questions: [
      {
        id: 'q1-doingToday',
        prompt: 'What are you doing today?',
        options: ['Work', 'Busy', 'Nothing', 'Lazy'],
        profileKey: 'todayContext',
        level: 0,
      },
      {
        id: 'q2-workType',
        prompt: 'What do you do for work?',
        options: ['Study', 'Part-time', 'Internship', 'Other'],
        profileKey: 'workType',
        level: 1,
      },
    ],
  },
  {
    id: 'coffeeHabits',
    title: 'Coffee Habits',
    questions: [
      {
        id: 'q1-coffee',
        prompt: 'How do you take your coffee?',
        options: ['Black', 'With milk', 'Iced', 'I don\'t drink'],
        profileKey: 'coffeePreference',
        level: 0,
      },
    ],
  },
  {
    id: 'personalInfo',
    title: 'Personal Information',
    questions: [
      {
        id: 'q1-birthday',
        prompt: 'What is your birthday?',
        options: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        profileKey: 'birthday',
        level: 0,
      },
      {
        id: 'q2-location',
        prompt: 'Where are you located?',
        options: ['North America', 'South America', 'Europe', 'Asia', 'Africa', 'Australia', 'Antarctica'],
        profileKey: 'location',
        level: 0,
      },
    ],
  },
  // …other categories
]; 