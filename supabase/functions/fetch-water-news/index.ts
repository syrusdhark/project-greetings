/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NewsArticle {
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

interface RSSItem {
  title: string;
  description: string;
  link: string;
  thumbnail?: string;
  pubDate: string;
  author?: string;
}

interface RSS2JSONResponse {
  status: string;
  feed: {
    title: string;
    description: string;
    link: string;
    image: string;
  };
  items: RSSItem[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const category = url.searchParams.get('category') || 'general';
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '8');

    console.log(`Fetching water sports news for category: ${category}, page: ${page}`);

    // Primary RSS sources for water sports with fallback static content
    const rssSources = [
      'https://swimswam.com/feed/',
      'https://www.sailing.org/feed/',
      'https://feeds.feedburner.com/surfer/breaking-news'
    ];

    // Get RSS feeds and convert to JSON
    const rssPromises = rssSources.map(async (rssUrl) => {
      try {
        console.log(`Fetching RSS from: ${rssUrl}`);
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&count=20`);
        if (!response.ok) {
          console.warn(`Failed to fetch RSS from ${rssUrl}: ${response.status}`);
          return { items: [] };
        }
        const data: RSS2JSONResponse = await response.json();
        console.log(`RSS data from ${rssUrl}:`, JSON.stringify(data, null, 2));
        return data;
      } catch (error) {
        console.warn(`Error fetching RSS from ${rssUrl}:`, error);
        return { items: [] };
      }
    });

    const rssResults = await Promise.all(rssPromises);
    
    // Combine all RSS items
    let allItems: RSSItem[] = rssResults.flatMap(result => result.items || []);
    
    console.log(`Fetched ${allItems.length} total RSS items`);

    // Fallback content if no RSS items are available
    if (allItems.length === 0) {
      console.log('No RSS items found, using fallback content');
      allItems = [
        {
          title: "Khelo India Brings First-Ever Water Sports to Kashmir",
          description: "The first-ever Khelo India Water Sports Festival is all set to reveal the iconic Dal Lake in a new avatar with exciting water sports activities.",
          link: "https://www.rediff.com/sports/report/khelo-india-brings-first-ever-water-sports-to-kashmir/20250818.htm",
          thumbnail: "https://im.rediff.com/sports/2025/aug/18khelo1.jpg",
          pubDate: new Date().toISOString(),
          author: "Sports News"
        },
        {
          title: "Swimming Championships 2024: New Records Set",
          description: "International swimming championships see multiple world records broken as athletes push the boundaries of aquatic sports.",
          link: "https://swimswam.com/news",
          thumbnail: "/placeholder.svg",
          pubDate: new Date(Date.now() - 86400000).toISOString(),
          author: "SwimSwam"
        },
        {
          title: "Sailing World Cup: India's Rising Stars",
          description: "Young sailors from India make their mark on the international sailing circuit with impressive performances at the World Cup.",
          link: "https://sailing.org/news",
          thumbnail: "/placeholder.svg",
          pubDate: new Date(Date.now() - 172800000).toISOString(),
          author: "World Sailing"
        }
      ];
    }

    // Filter articles based on category
    const filteredItems = allItems.filter((item) => {
      if (!item.title || !item.description || !item.link) {
        return false;
      }

      const content = `${item.title} ${item.description}`.toLowerCase();
      
      switch (category) {
        case 'surfing':
          return content.includes('surf') || content.includes('wave') || content.includes('board');
        case 'scuba':
          return content.includes('div') || content.includes('underwater') || content.includes('scuba') || content.includes('snorkel');
        case 'sailing':
          return content.includes('sail') || content.includes('yacht') || content.includes('regatta') || content.includes('boat');
        case 'events':
          return content.includes('event') || content.includes('competition') || content.includes('championship') || content.includes('tournament') || content.includes('festival');
        case 'general':
        default:
          // For general, include all water sports related content
          const waterSportsKeywords = ['water sport', 'swim', 'surf', 'sail', 'div', 'kayak', 'marine', 'ocean', 'beach', 'aquatic', 'regatta', 'competition', 'championship'];
          return waterSportsKeywords.some(keyword => content.includes(keyword));
      }
    });

    // Convert RSS items to NewsArticle format
    const articles: NewsArticle[] = filteredItems
      .map((item) => ({
        id: `rss-${item.link}-${item.pubDate}`,
        title: item.title,
        description: item.description.replace(/<[^>]*>/g, '').substring(0, 200) + '...', // Strip HTML and truncate
        url: item.link,
        urlToImage: item.thumbnail || '/placeholder.svg',
        publishedAt: item.pubDate,
        source: {
          name: item.link.includes('swimswam') ? 'SwimSwam' : 
                item.link.includes('surfer') ? 'Surfer Magazine' :
                item.link.includes('outside') ? 'Outside Magazine' : 'Water Sports News'
        },
        category
      }))
      // Remove duplicates based on title similarity
      .filter((article, index, array) => 
        array.findIndex(a => a.title.toLowerCase() === article.title.toLowerCase()) === index
      )
      // Sort by published date (newest first)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      // Apply pagination
      .slice((page - 1) * pageSize, page * pageSize);

    console.log(`Returning ${articles.length} filtered articles for category: ${category}`);

    return new Response(
      JSON.stringify({
        articles: articles,
        totalResults: articles.length,
        status: 'ok'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error fetching RSS news:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch water sports news',
        message: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});