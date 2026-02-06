'use client';

import React, { useState } from 'react';
import { CameraVerification } from '@/components/verification/camera-verification';
import { VerificationResults } from '@/components/verification/verification-results';
import { Shield, Sparkles, Lock, Zap } from 'lucide-react';

interface VerificationResult {
  success: boolean;
  verified: boolean;
  confidence: number;
  message: string;
  details?: any;
  issues?: string[];
  timestamp?: number;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function VerificationPage() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = async (imageData: string) => {
    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/verify/human`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData,
          wallet_address: 'anonymous' // Can be replaced with actual wallet address if needed
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setResult(data);
    } catch (err) {
      console.error('Verification error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setResult({
        success: false,
        verified: false,
        confidence: 0,
        message: 'Failed to connect to verification service. Please ensure the backend is running.',
        issues: ['Backend connection failed']
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      {/* Hero Section */}
      <div className="pt-12 pb-8 px-4">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center justify-center p-2 bg-tigerGreen rounded-2xl mb-4">
            <Shield className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-600 via-tigerGreen to-emerald-600 bg-clip-text text-transparent">
            Human Liveness Verification
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Secure, privacy-preserving biometric verification powered by AI
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI-Powered</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
              <Lock className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Privacy-First</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
              <Zap className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Real-Time</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          {!result ? (
            <div className="space-y-8">
              {/* Error Display */}
              {error && (
                <div className="max-w-3xl mx-auto p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-800 dark:text-red-200 text-center">{error}</p>
                </div>
              )}

              {/* Camera Component */}
              <CameraVerification
                onCapture={handleCapture}
                isVerifying={isVerifying}
              />

              {/* How It Works Section */}
              <div className="max-w-3xl mx-auto mt-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center mb-8">
                  How It Works
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Position Your Face
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Center your face in the camera frame with good lighting
                    </p>
                  </div>

                  <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">2</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      AI Analysis
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Our AI detects facial features and verifies liveness
                    </p>
                  </div>

                  <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">3</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Get Verified
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive instant verification with detailed results
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <VerificationResults result={result} onReset={handleReset} />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="py-8 px-4 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Powered by Face++ AI • Secure & Privacy-Preserving
          </p>
        </div>
      </div>
    </div>
  );
}
