import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showNumber?: boolean;
  className?: string;
}

const StarRating = ({ 
  rating, 
  maxRating = 5, 
  size = "md", 
  showNumber = true,
  className 
}: StarRatingProps) => {
  const sizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };
  
  const textSizes = {
    sm: "text-xs",
    md: "text-sm", 
    lg: "text-base"
  };
  
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }, (_, i) => {
          const starNumber = i + 1;
          const isFilled = starNumber <= Math.floor(rating);
          const isPartial = starNumber === Math.ceil(rating) && rating % 1 !== 0;
          
          return (
            <div key={i} className="relative">
              <Star 
                className={cn(
                  sizes[size],
                  "text-muted-foreground"
                )}
              />
              {(isFilled || isPartial) && (
                <Star 
                  className={cn(
                    sizes[size],
                    "absolute top-0 left-0 text-warning fill-warning",
                    isPartial && "opacity-70"
                  )}
                  style={isPartial ? { 
                    clipPath: `inset(0 ${100 - (rating % 1) * 100}% 0 0)` 
                  } : undefined}
                />
              )}
            </div>
          );
        })}
      </div>
      
      {showNumber && (
        <span className={cn("font-medium text-foreground", textSizes[size])}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;