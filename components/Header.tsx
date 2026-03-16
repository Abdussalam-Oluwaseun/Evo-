'use client';

import React from 'react';
import { Settings } from 'lucide-react';
import Image from 'next/image';

const PROVIDER_LABELS: Record<string, string> = {
  gemini: 'Google Gemini',
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  deepseek: 'DeepSeek',
  groq: 'Groq',
  openrouter: 'OpenRouter',
  together: 'Together',
  mistral: 'Mistral',
};

interface HeaderProps {
  onOpenConfig: () => void;
  provider: string;
  hasApiKey: boolean;
}

export default function Header({ onOpenConfig, provider, hasApiKey }: HeaderProps) {
  const label = PROVIDER_LABELS[provider] || provider;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#135bec] text-white p-1.5 rounded-lg flex items-center justify-center">
            <div className="size-5 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">evo</h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#135bec]/10 rounded-full border border-[#135bec]/20">
            <span className="size-2 rounded-full bg-[#135bec] animate-pulse"></span>
            <span className="text-xs font-semibold text-[#135bec] uppercase tracking-wider">
              {hasApiKey ? `${label} • Key Set` : label}
            </span>
          </div>

          <button
            onClick={onOpenConfig}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
            aria-label="Open configuration"
          >
            <Settings size={20} />
          </button>

          <div className="size-9 rounded-full bg-slate-200 border border-slate-300 overflow-hidden relative">
            <Image
              src="https://picsum.photos/seed/professional/100/100"
              alt="User profile"
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
