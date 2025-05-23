# AI Life Planner

A personalized life planning application that uses AI to provide tailored recommendations for news, music, and daily activities.

## Features

- Personalized news feed
- Music recommendations
- Weather updates
- Financial insights
- AI-powered daily questions
- OCEAN model personality tracking

## Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd ai-life-planner
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your API keys:
```
VITE_OPENAI_API_KEY=your_openai_key
VITE_WEATHER_API_KEY=your_weather_key
VITE_LASTFM_API_KEY=your_lastfm_key
VITE_POLYGON_API_KEY=your_polygon_key
VITE_NEWS_API_KEY=your_news_key
```

4. Run the development server:
```bash
npm run dev
```

## Deployment

This project is configured for deployment on Vercel. To deploy:

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Add environment variables in the Vercel dashboard:
- Go to your project settings
- Navigate to the Environment Variables section
- Add all the required API keys from your `.env` file

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Various APIs (OpenAI, Weather, Last.fm, Polygon, News)
