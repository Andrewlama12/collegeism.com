import React, { useEffect, useState, useCallback } from 'react';

interface NewsItem {
  title: string;
  url: string;
  source: string;
}

const NewsChannel: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiKey = import.meta.env.VITE_NEWS_API_KEY;

  const fetchNews = useCallback(async (signal?: AbortSignal) => {
    if (!apiKey) {
      setError('API key not found');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?country=us&category=business&pageSize=4&apiKey=${apiKey}`,
        signal ? { signal } : undefined
      );

      if (!response.ok) {
        throw new Error(`News API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.articles) {
        throw new Error('Invalid response format');
      }

      setNews(data.articles.map((article: any) => ({
        title: article.title.split(' - ')[0], // Remove source from title
        url: article.url,
        source: article.source.name
      })));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch news');
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  useEffect(() => {
    const controller = new AbortController();
    fetchNews(controller.signal);
    return () => controller.abort();
  }, [fetchNews]);

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center h-full">
        <div className="text-gray-500">Loading news...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 flex items-center justify-center h-full">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold mb-4">Business Headlines</h2>
      <div className="space-y-4">
        {news.map((item, index) => (
          <a
            key={index}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <article className="space-y-1">
              <h3 className="text-lg font-medium group-hover:text-gray-600 transition-colors">
                {item.title}
              </h3>
              <p className="text-sm text-gray-500">{item.source}</p>
            </article>
          </a>
        ))}
      </div>
    </div>
  );
};

export default NewsChannel; 