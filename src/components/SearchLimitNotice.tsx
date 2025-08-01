"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Search, 
  Crown, 
  Clock, 
  TrendingUp,
  CheckCircle,
  XCircle,
  Zap
} from "lucide-react";
import Link from 'next/link';

interface SearchLimitData {
  searchCount: number;
  maxSearches: number;
  resetTime: string;
  subscriptionStatus: 'free' | 'premium' | 'enterprise';
  timeUntilReset: number; // in hours
}

interface SearchLimitNoticeProps {
  className?: string;
  language?: 'en' | 'pl';
  variant?: 'banner' | 'card' | 'modal';
}

// Translations
const translations = {
  en: {
    searchLimit: "Search Limit",
    dailySearches: "Daily Searches",
    searchesUsed: "searches used",
    searchesRemaining: "searches remaining",
    unlimited: "Unlimited",
    upgradeNow: "Upgrade Now",
    resetIn: "Resets in",
    hours: "hours",
    hour: "hour",
    minutes: "minutes",
    limitReached: "Daily Search Limit Reached",
    limitReachedDescription: "You've reached your daily search limit. Upgrade to premium for unlimited searches.",
    upgradeToPremium: "Upgrade to Premium",
    premiumFeatures: "Premium Features",
    premiumBenefits: [
      "Unlimited searches",
      "Advanced filters",
      "Priority support",
      "Export results",
      "Detailed analytics"
    ],
    freeUser: "Free User",
    premiumUser: "Premium User",
    enterpriseUser: "Enterprise User",
    warningTitle: "Approaching Search Limit",
    warningMessage: "You have {remaining} searches remaining today. Consider upgrading for unlimited access.",
    viewPlans: "View Plans",
    learnMore: "Learn More"
  },
  pl: {
    searchLimit: "Limit Wyszukiwań",
    dailySearches: "Dzienne Wyszukiwania",
    searchesUsed: "wykorzystanych wyszukiwań",
    searchesRemaining: "pozostałych wyszukiwań",
    unlimited: "Bez limitu",
    upgradeNow: "Zmień Plan",
    resetIn: "Reset za",
    hours: "godzin",
    hour: "godzina",
    minutes: "minut",
    limitReached: "Osiągnięto Dzienny Limit Wyszukiwań",
    limitReachedDescription: "Osiągnąłeś dzienny limit wyszukiwań. Przejdź na premium, aby mieć nieograniczony dostęp.",
    upgradeToPremium: "Przejdź na Premium",
    premiumFeatures: "Funkcje Premium",
    premiumBenefits: [
      "Nieograniczone wyszukiwania",
      "Zaawansowane filtry",
      "Wsparcie priorytetowe",
      "Eksport wyników",
      "Szczegółowe analizy"
    ],
    freeUser: "Użytkownik Bezpłatny",
    premiumUser: "Użytkownik Premium",
    enterpriseUser: "Użytkownik Enterprise",
    warningTitle: "Zbliżasz się do Limitu",
    warningMessage: "Masz {remaining} wyszukiwań na dzisiaj. Rozważ upgrade dla nieograniczonego dostępu.",
    viewPlans: "Zobacz Plany",
    learnMore: "Dowiedz się więcej"
  }
};

export default function SearchLimitNotice({ 
  className = '', 
  language = 'pl',
  variant = 'card' 
}: SearchLimitNoticeProps) {
  const { user, isAuthenticated } = useUser();
  const t = translations[language];
  
  const [limitData, setLimitData] = useState<SearchLimitData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchSearchLimitData();
    }
  }, [isAuthenticated, user]);

  const fetchSearchLimitData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/search-limit');
      if (response.ok) {
        const data = await response.json();
        setLimitData(data);
      }
    } catch (error) {
      console.error('Error fetching search limit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeUntilReset = (hours: number) => {
    if (hours < 1) {
      const minutes = Math.ceil(hours * 60);
      return `${minutes} ${t.minutes}`;
    } else if (hours === 1) {
      return `1 ${t.hour}`;
    } else {
      return `${Math.ceil(hours)} ${t.hours}`;
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'premium':
        return (
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <Crown className="h-3 w-3 mr-1" />
            {t.premiumUser}
          </Badge>
        );
      case 'enterprise':
        return (
          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <Zap className="h-3 w-3 mr-1" />
            {t.enterpriseUser}
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            {t.freeUser}
          </Badge>
        );
    }
  };

  if (!isAuthenticated || loading) {
    return null;
  }

  if (!limitData) {
    return null;
  }

  const percentage = (limitData.searchCount / limitData.maxSearches) * 100;
  const remainingSearches = limitData.maxSearches - limitData.searchCount;
  const isLimitReached = limitData.searchCount >= limitData.maxSearches;
  const isNearLimit = percentage >= 80;

  // Premium users don't need to see search limits
  if (limitData.subscriptionStatus === 'premium' || limitData.subscriptionStatus === 'enterprise') {
    return (
      <Card className={`${className} border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Crown className="h-5 w-5 text-purple-600" />
              <div>
                <div className="font-semibold text-purple-900">{t.unlimited}</div>
                <div className="text-sm text-purple-600">{t.dailySearches}</div>
              </div>
            </div>
            {getStatusBadge(limitData.subscriptionStatus)}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'banner' && isLimitReached) {
    return (
      <div className={`${className} bg-red-50 border border-red-200 rounded-lg p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <XCircle className="h-5 w-5 text-red-600" />
            <div>
              <div className="font-semibold text-red-900">{t.limitReached}</div>
              <div className="text-sm text-red-600">{t.limitReachedDescription}</div>
            </div>
          </div>
          <Link href="/pricing">
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              {t.upgradeToPremium}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (variant === 'banner' && isNearLimit) {
    return (
      <div className={`${className} bg-yellow-50 border border-yellow-200 rounded-lg p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <div className="font-semibold text-yellow-900">{t.warningTitle}</div>
              <div className="text-sm text-yellow-600">
                {t.warningMessage.replace('{remaining}', remainingSearches.toString())}
              </div>
            </div>
          </div>
          <Link href="/pricing">
            <Button variant="outline" className="border-yellow-600 text-yellow-600 hover:bg-yellow-50">
              {t.viewPlans}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Card className={`${className} ${isLimitReached ? 'border-red-200' : isNearLimit ? 'border-yellow-200' : 'border-gray-200'}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-gray-600" />
            <span>{t.searchLimit}</span>
          </div>
          {getStatusBadge(limitData.subscriptionStatus)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>{t.dailySearches}</span>
            <span className="font-semibold">
              {limitData.searchCount} / {limitData.maxSearches}
            </span>
          </div>
          <div className="relative">
            <Progress 
              value={percentage} 
              className="h-2"
            />
            <div 
              className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getProgressColor(percentage)}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>{remainingSearches} {t.searchesRemaining}</span>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{t.resetIn} {formatTimeUntilReset(limitData.timeUntilReset)}</span>
            </div>
          </div>
        </div>

        {isLimitReached && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-semibold text-red-900">{t.limitReached}</span>
            </div>
            <p className="text-sm text-red-600 mb-3">{t.limitReachedDescription}</p>
            <Link href="/pricing">
              <Button size="sm" className="w-full bg-red-600 hover:bg-red-700">
                <Crown className="h-4 w-4 mr-2" />
                {t.upgradeToPremium}
              </Button>
            </Link>
          </div>
        )}

        {isNearLimit && !isLimitReached && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-semibold text-yellow-900">{t.warningTitle}</span>
            </div>
            <p className="text-sm text-yellow-600 mb-3">
              {t.warningMessage.replace('{remaining}', remainingSearches.toString())}
            </p>
            <div className="flex space-x-2">
              <Link href="/pricing" className="flex-1">
                <Button size="sm" variant="outline" className="w-full border-yellow-600 text-yellow-600 hover:bg-yellow-50">
                  {t.viewPlans}
                </Button>
              </Link>
            </div>
          </div>
        )}

        {!isNearLimit && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">{t.premiumFeatures}</span>
            </div>
            <ul className="text-sm text-blue-600 space-y-1 mb-3">
              {t.premiumBenefits.slice(0, 3).map((benefit, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-blue-600 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <Link href="/pricing">
              <Button size="sm" variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50">
                {t.learnMore}
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
