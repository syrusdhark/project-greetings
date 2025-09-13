import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
  category?: string;
}

export interface NewsResponse {
  articles: NewsArticle[];
  totalResults: number;
  status: string;
}

export const useWaterNews = (category: string = 'general') => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchNews = async (resetPage = false) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    const currentPage = resetPage ? 1 : page;
    
    try {
      console.log(`Fetching news for category: ${category}, page: ${currentPage}`);
      
      const { data, error: functionError } = await supabase.functions.invoke('fetch-water-news', {
        body: {
          category,
          page: currentPage,
          pageSize: 8
        }
      });

      if (functionError) {
        throw new Error(functionError.message || 'Failed to fetch news');
      }

      const newsData = data as NewsResponse;
      
      if (newsData.status !== 'ok') {
        throw new Error('News API returned error status');
      }

      console.log(`Received ${newsData.articles.length} articles`);

      if (resetPage) {
        setArticles(newsData.articles);
        setPage(2);
      } else {
        setArticles(prev => [...prev, ...newsData.articles]);
        setPage(prev => prev + 1);
      }

      // If we got fewer articles than requested, we've reached the end
      setHasMore(newsData.articles.length >= 8);
      
    } catch (err) {
      console.error('Error fetching news:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchNews(false);
    }
  };

  const refreshNews = () => {
    setPage(1);
    setHasMore(true);
    fetchNews(true);
  };

  useEffect(() => {
    refreshNews();
  }, [category]);

  return {
    articles,
    loading,
    error,
    hasMore,
    loadMore,
    refreshNews
  };
};