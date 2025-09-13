import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useWaterNews } from '@/hooks/useWaterNews';
import { CalendarDays, ExternalLink, Loader2, Waves } from 'lucide-react';

const categories = [
  { value: 'general', label: 'Water Sports', icon: Waves },
  { value: 'surfing', label: 'Surfing', icon: Waves },
  { value: 'scuba', label: 'Scuba & Diving', icon: Waves },
  { value: 'sailing', label: 'Sailing', icon: Waves },
  { value: 'events', label: 'Events', icon: CalendarDays },
];

const WaterNewsSection = () => {
  const [selectedCategory, setSelectedCategory] = useState('general');
  const { articles, loading, error, hasMore, loadMore } = useWaterNews(selectedCategory);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const NewsCardSkeleton = () => (
    <Card className="overflow-hidden hover-scale">
      <div className="relative">
        <Skeleton className="w-full h-48" />
      </div>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
    </Card>
  );

  return (
    <section className="py-16 bg-gradient-to-b from-background to-secondary/10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Water Sports News & Events
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Latest news, competitions, and events from the exciting world of water sports and marine activities
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                onClick={() => handleCategoryChange(category.value)}
                className="flex items-center gap-2 transition-all duration-200"
              >
                <IconComponent className="h-4 w-4" />
                {category.label}
              </Button>
            );
          })}
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-8">
            <p className="text-destructive mb-4">Failed to load news: {error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {loading && articles.length === 0 
            ? Array(8).fill(0).map((_, index) => (
                <NewsCardSkeleton key={index} />
              ))
            : articles.map((article) => (
                <Card 
                  key={article.id} 
                  className="overflow-hidden hover-scale group cursor-pointer bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/20 transition-all duration-300"
                  onClick={() => window.open(article.url, '_blank')}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={article.urlToImage}
                      alt={article.title}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <ExternalLink className="absolute top-3 right-3 h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="secondary" className="text-xs font-medium">
                        {article.source.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {formatDate(article.publishedAt)}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-sm leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-200">
                      {article.title}
                    </h3>
                    
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {article.description}
                    </p>
                  </CardContent>
                </Card>
              ))
          }
        </div>

        {/* Load More Button */}
        {hasMore && !error && (
          <div className="text-center">
            <Button 
              onClick={loadMore} 
              disabled={loading}
              variant="outline"
              size="lg"
              className="px-8 py-3"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More News'
              )}
            </Button>
          </div>
        )}

        {/* No more articles message */}
        {!hasMore && articles.length > 0 && (
          <div className="text-center">
            <p className="text-muted-foreground">
              You've reached the end of the news feed
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default WaterNewsSection;