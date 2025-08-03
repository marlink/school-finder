'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  ThumbsUp, 
  ThumbsDown, 
  Meh,
  AlertCircle,
  Clock,
  BarChart3,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface SentimentAnalysisData {
  sentiment: number; // -1.00 to 1.00
  positiveKeywords: string[];
  negativeKeywords: string[];
  lastUpdated: string | Date;
}

interface SentimentAnalysisDisplayProps {
  sentimentData: SentimentAnalysisData | null;
  className?: string;
  showKeywords?: boolean;
  compact?: boolean;
}

export function SentimentAnalysisDisplay({ 
  sentimentData, 
  className,
  showKeywords = true,
  compact = false 
}: SentimentAnalysisDisplayProps) {
  if (!sentimentData) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Sentiment Data Available
          </h3>
          <p className="text-sm text-gray-500 max-w-md">
            Sentiment analysis will appear here once we have enough reviews and feedback about this school.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getSentimentLevel = (sentiment: number) => {
    if (sentiment > 0.5) return { label: 'Very Positive', color: 'text-green-600', bgColor: 'bg-green-100', icon: ThumbsUp };
    if (sentiment > 0.1) return { label: 'Positive', color: 'text-green-500', bgColor: 'bg-green-50', icon: ThumbsUp };
    if (sentiment > -0.1) return { label: 'Neutral', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: Meh };
    if (sentiment > -0.5) return { label: 'Negative', color: 'text-orange-500', bgColor: 'bg-orange-50', icon: ThumbsDown };
    return { label: 'Very Negative', color: 'text-red-600', bgColor: 'bg-red-100', icon: ThumbsDown };
  };

  const sentimentLevel = getSentimentLevel(sentimentData.sentiment);
  const SentimentIcon = sentimentLevel.icon;
  
  // Convert sentiment (-1 to 1) to progress percentage (0 to 100)
  const progressValue = Math.max(0, Math.min(100, ((sentimentData.sentiment + 1) / 2) * 100));

  const formatLastUpdated = (date: string | Date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  if (compact) {
    return (
      <div className={cn("flex items-center gap-3 p-3 rounded-lg border", sentimentLevel.bgColor, className)}>
        <SentimentIcon className={cn("h-5 w-5", sentimentLevel.color)} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={cn("text-sm font-medium", sentimentLevel.color)}>
              {sentimentLevel.label}
            </span>
            <span className={cn("text-lg font-bold", sentimentLevel.color)}>
              {sentimentData.sentiment.toFixed(2)}
            </span>
          </div>
          <Progress 
            value={progressValue} 
            className="h-2 mt-1"
          />
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          Sentiment Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Sentiment Score Display */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <SentimentIcon className={cn("h-8 w-8", sentimentLevel.color)} />
              <div className={cn("text-4xl font-bold", sentimentLevel.color)}>
                {sentimentData.sentiment.toFixed(2)}
              </div>
            </div>
            
            <div className={cn(
              "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium",
              sentimentLevel.bgColor,
              sentimentLevel.color
            )}>
              {sentimentLevel.label}
            </div>
            
            {/* Progress Bar */}
            <div className="w-full max-w-md mx-auto space-y-2">
              <Progress 
                value={progressValue} 
                className="h-3"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Very Negative</span>
                <span>Neutral</span>
                <span>Very Positive</span>
              </div>
            </div>
          </div>

          {/* Keywords Section */}
          {showKeywords && (sentimentData.positiveKeywords.length > 0 || sentimentData.negativeKeywords.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Positive Keywords */}
              {sentimentData.positiveKeywords.length > 0 && (
                <div>
                  <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4" />
                    Positive Mentions
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {sentimentData.positiveKeywords.map((keyword, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="bg-green-100 text-green-800 hover:bg-green-200"
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Negative Keywords */}
              {sentimentData.negativeKeywords.length > 0 && (
                <div>
                  <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                    <ThumbsDown className="h-4 w-4" />
                    Areas for Improvement
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {sentimentData.negativeKeywords.map((keyword, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="bg-red-100 text-red-800 hover:bg-red-200"
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Disclaimer and Last Updated */}
          <div className="space-y-2 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <AlertCircle className="h-3 w-3" />
              <span>
                Analysis based on automated processing of reviews and feedback
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>
                Last updated {formatLastUpdated(sentimentData.lastUpdated)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Export a hook to use sentiment analysis data
export function useSentimentAnalysis(schoolId: string) {
  // This could be expanded to fetch sentiment data independently
  // For now, it's included in the main school data fetch
  return null;
}
