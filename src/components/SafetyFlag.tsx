import { cn } from "@/lib/utils";

type SafetyLevel = "safe" | "warning" | "danger";

interface SafetyFlagProps {
  level: SafetyLevel;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SafetyFlag = ({ level, size = "md", className }: SafetyFlagProps) => {
  const flagColors = {
    safe: "bg-safe",
    warning: "bg-warning", 
    danger: "bg-danger"
  };
  
  const sizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4", 
    lg: "w-6 h-6"
  };
  
  return (
    <div 
      className={cn(
        "rounded-full border-2 border-white shadow-sm",
        flagColors[level],
        sizes[size],
        className
      )}
      title={`${level.charAt(0).toUpperCase() + level.slice(1)} conditions`}
    />
  );
};

export default SafetyFlag;