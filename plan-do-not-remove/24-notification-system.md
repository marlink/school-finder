# Notification System

## Overview
The School Finder Portal includes a notification system to keep users informed about important events, updates, and actions.

## Types of Notifications

- **System Notifications**: Updates about the platform, new features, maintenance
- **User Activity**: Subscription status, search limits
- **School Updates**: New ratings, comments on favorite schools
- **Administrative**: For admin users about data updates, user reports

## Implementation

### Notification Component
```jsx
// components/ui/notification.tsx
'use client';
import { useState, useEffect } from 'react';
import { X, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { cva } from 'class-variance-authority';

const notificationVariants = cva(
  "fixed flex items-center p-4 rounded-md shadow-md transition-all duration-300",
  {
    variants: {
      position: {
        topRight: "top-4 right-4",
        topLeft: "top-4 left-4",
        bottomRight: "bottom-4 right-4",
        bottomLeft: "bottom-4 left-4",
      },
      type: {
        info: "bg-blue-50 text-blue-800 border-l-4 border-blue-500",
        success: "bg-green-50 text-green-800 border-l-4 border-green-500",
        warning: "bg-yellow-50 text-yellow-800 border-l-4 border-yellow-500",
        error: "bg-red-50 text-red-800 border-l-4 border-red-500",
      },
    },
    defaultVariants: {
      position: "topRight",
      type: "info",
    },
  }
);

const iconMap = {
  info: <Info className="w-5 h-5 mr-3" />,
  success: <CheckCircle className="w-5 h-5 mr-3" />,
  warning: <AlertTriangle className="w-5 h-5 mr-3" />,
  error: <AlertTriangle className="w-5 h-5 mr-3" />,
};

export function Notification({
  title,
  message,
  type = "info",
  position = "topRight",
  duration = 5000,
  onClose,
}) {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 300); // Allow time for exit animation
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  return (
    <div 
      className={`${notificationVariants({ type, position })} ${
        isVisible ? 'opacity-100' : 'opacity-0 translate-x-full'
      }`}
    >
      {iconMap[type]}
      <div className="flex-1">
        {title && <h4 className="font-semibold">{title}</h4>}
        <p className="text-sm">{message}</p>
      </div>
      <button 
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose?.(), 300);
        }}
        className="ml-4 text-gray-500 hover:text-gray-700"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
```

### Notification Context
```jsx
// contexts/NotificationContext.tsx
'use client';
import { createContext, useContext, useState, useCallback } from 'react';
import { Notification } from '@/components/ui/notification';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  
  const showNotification = useCallback((notification) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, ...notification }]);
    return id;
  }, []);
  
  const closeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);
  
  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          {...notification}
          onClose={() => closeNotification(notification.id)}
        />
      ))}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
```

### Using Notifications
```jsx
// Example usage in a component
'use client';
import { useNotification } from '@/contexts/NotificationContext';

export function SubscribeButton() {
  const { showNotification } = useNotification();
  
  const handleSubscribe = async () => {
    try {
      // Subscribe logic
      showNotification({
        type: 'success',
        title: 'Subscription Successful',
        message: 'You now have unlimited access to all features!',
      });
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Subscription Failed',
        message: 'There was an error processing your subscription. Please try again.',
      });
    }
  };
  
  return (
    <button 
      onClick={handleSubscribe}
      className="px-4 py-2 bg-orange-500 text-white rounded"
    >
      Subscribe Now
    </button>
  );
}
```

## Server-Side Notifications

### Email Notifications
```typescript
// lib/notifications/email.ts
import { Resend } from 'resend';
import { WelcomeEmail } from '@/emails/WelcomeEmail';
import { SubscriptionEmail } from '@/emails/SubscriptionEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(user) {
  return resend.emails.send({
    from: 'School Finder <noreply@schoolfinder.example.com>',
    to: user.email,
    subject: 'Welcome to School Finder!',
    react: WelcomeEmail({ 
      name: user.name, 
      loginLink: `${process.env.NEXTAUTH_URL}/login` 
    }),
  });
}

export async function sendSubscriptionEmail(user, subscriptionType) {
  return resend.emails.send({
    from: 'School Finder <noreply@schoolfinder.example.com>',
    to: user.email,
    subject: 'Your School Finder Subscription',
    react: SubscriptionEmail({ 
      name: user.name, 
      subscriptionType,
      dashboardLink: `${process.env.NEXTAUTH_URL}/dashboard` 
    }),
  });
}
```