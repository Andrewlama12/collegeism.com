import React, { useState, useEffect } from 'react';
import { FeedbackButtons } from './FeedbackButtons';
import { getPreferences } from '../types/preferences';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
}

export const NewsChannel: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const prefs = getPreferences();
      const response = await fetch('YOUR_NEWS_API_ENDPOINT');
      const data = await response.json();
      
      // Filter out disliked news and prioritize topics similar to liked ones
      const filteredNews = data.articles
        .filter((article: any) => !prefs.dislikedNews.includes(article.title))
        .map((article: any) => ({
          id: article.title, // Using title as ID since it should be unique
          title: article.title,
          description: article.description,
          url: article.url
        }));

      setNews(filteredNews);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleFeedback = async (newsId: string, liked: boolean) => {
    if (liked) {
      // Keep the article and fetch similar ones
      const similarNews = await fetchSimilarNews(newsId);
      setNews(prev => [...prev, ...similarNews]);
    } else {
      // Remove the article and fetch a replacement
      setNews(prev => prev.filter(item => item.id !== newsId));
      const newArticle = await fetchNewArticle();
      if (newArticle) {
        setNews(prev => [...prev, newArticle]);
      }
    }
  };

  const fetchSimilarNews = async (newsId: string): Promise<NewsItem[]> => {
    // Implement API call to fetch similar news based on the liked article
    return [];
  };

  const fetchNewArticle = async (): Promise<NewsItem | null> => {
    // Implement API call to fetch a new random article
    return null;
  };

  if (loading) {
    return <div className="p-4">Loading news...</div>;
  }

  return (
    <div className="space-y-4 p-4">
      {news.map((item) => (
        <div key={item.id} className="bg-white rounded-lg shadow p-4 space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <FeedbackButtons
              contentId={item.id}
              contentType="news"
              onFeedback={(liked) => handleFeedback(item.id, liked)}
            />
          </div>
          <p className="text-sm text-gray-600">{item.description}</p>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 text-sm"
          >
            Read more
          </a>
        </div>
      ))}
    </div>
  );
}; 