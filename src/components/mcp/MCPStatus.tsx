'use client';

import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Sparkles, Database, Zap } from 'lucide-react';
import { useMCPHealth } from '@/hooks/useMCPSearch';

interface MCPStatusProps {
  className?: string;
  showDetails?: boolean;
}

export function MCPStatus({ className = "", showDetails = false }: MCPStatusProps) {
  const { isHealthy, lastCheck, checkHealth } = useMCPHealth();

  const getStatusIcon = () => {
    if (isHealthy === null) {
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
    return isHealthy ? 
      <CheckCircle className="w-4 h-4 text-green-500" /> : 
      <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusText = () => {
    if (isHealthy === null) return 'Checking...';
    return isHealthy ? 'Online' : 'Offline';
  };

  const getStatusColor = () => {
    if (isHealthy === null) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return isHealthy ? 
      'text-green-600 bg-green-50 border-green-200' : 
      'text-red-600 bg-red-50 border-red-200';
  };

  if (!showDetails) {
    // Compact status indicator
    return (
      <div className={`inline-flex items-center space-x-2 ${className}`}>
        <div className="flex items-center space-x-1">
          <Sparkles className="w-3 h-3 text-purple-500" />
          <span className="text-xs font-medium text-gray-600">AI</span>
        </div>
        {getStatusIcon()}
      </div>
    );
  }

  // Detailed status panel
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h3 className="text-sm font-semibold text-gray-900">MCP Status</h3>
        </div>
        
        <button
          onClick={checkHealth}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          Refresh
        </button>
      </div>

      {/* Overall Status */}
      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor()}`}>
        {getStatusIcon()}
        <span>MCP Service: {getStatusText()}</span>
      </div>

      {/* Service Details */}
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-blue-500" />
            <span className="text-gray-600">Vector Search</span>
          </div>
          <div className="flex items-center space-x-1">
            {process.env.NEXT_PUBLIC_QDRANT_URL ? (
              <>
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span className="text-green-600">Configured</span>
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3 text-yellow-500" />
                <span className="text-yellow-600">Not configured</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-purple-500" />
            <span className="text-gray-600">AI Processing</span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-3 h-3 text-green-500" />
            <span className="text-green-600">Active</span>
          </div>
        </div>
      </div>

      {/* Last Check */}
      {lastCheck && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Last checked: {lastCheck.toLocaleTimeString()}
          </div>
        </div>
      )}

      {/* Environment Info */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          Environment: {process.env.NODE_ENV || 'development'}
        </div>
      </div>
    </div>
  );
}

/**
 * Simple MCP badge for header/navigation
 */
export function MCPBadge({ className = "" }: { className?: string }) {
  const { isHealthy } = useMCPHealth();

  return (
    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 ${className}`}>
      <Sparkles className="w-3 h-3 text-purple-600" />
      <span className="text-xs font-medium text-purple-700">AI</span>
      {isHealthy !== null && (
        <div className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-green-400' : 'bg-red-400'}`} />
      )}
    </div>
  );
}