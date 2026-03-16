'use client';

import React, { useState, useEffect } from 'react';
import { X, Settings2, Key, Zap, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AIConfig {
  apiKey: string;
  provider: string;
  model: string;
}

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AIConfig;
  onSave: (config: AIConfig) => void;
  apiBaseUrl: string;
}

export default function ConfigModal({ isOpen, onClose, config, onSave, apiBaseUrl }: ConfigModalProps) {
  const [localConfig, setLocalConfig] = useState<AIConfig>({ ...config });
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<'idle' | 'testing' | 'success'>('idle');
  const [providers, setProviders] = useState<Record<string, any>>({});
  const [loadingProviders, setLoadingProviders] = useState(false);

  // Sync with parent config when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalConfig({ ...config });
    }
  }, [isOpen, config]);

  // Fetch supported providers on mount
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoadingProviders(true);
        const response = await fetch(`${apiBaseUrl}/supported-providers`);
        if (response.ok) {
          const data = await response.json();
          setProviders(data.providers || {});
        }
      } catch (err) {
        console.error('Failed to fetch providers:', err);
        // Fallback to default providers if fetch fails
        setProviders({
          gemini: { default_model: 'gemini-2.0-flash' },
          openai: { default_model: 'gpt-4o' },
          anthropic: { default_model: 'claude-sonnet-4-20250514' },
          deepseek: { default_model: 'deepseek-chat' },
          groq: { default_model: 'llama-3.3-70b-versatile' },
          openrouter: { default_model: 'gpt-4o' },
          together: { default_model: 'meta-llama/Llama-3-70b-chat-hf' },
          mistral: { default_model: 'mistral-large-latest' },
        });
      } finally {
        setLoadingProviders(false);
      }
    };
    fetchProviders();
  }, [apiBaseUrl]);

  const handleTest = async () => {
    if (!localConfig.apiKey.trim()) {
      alert('Please enter an API key first.');
      return;
    }
    setStatus('testing');
    try {
      // Test connection by making a simple request
      const response = await fetch(`${apiBaseUrl}/supported-providers`, {
        headers: {
          'X-API-Key': localConfig.apiKey.trim(),
          'X-AI-Provider': localConfig.provider,
        },
      });
      if (response.ok) {
        setStatus('success');
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        alert('Connection test failed. Please check your API key.');
        setStatus('idle');
      }
    } catch (err) {
      alert('Connection test failed. Please check your API key.');
      setStatus('idle');
    }
  };

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#135bec]/10 text-[#135bec]">
                  <Settings2 size={20} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">API Configuration</h3>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="px-8 py-8 space-y-6">
              <div className="space-y-2">
                <p className="text-sm text-slate-500 leading-relaxed">
                  Configure your AI provider settings. Your API key is stored locally and never shared.
                </p>
              </div>

              {/* Provider Selection */}
              <div className="space-y-2.5">
                <label className="block text-sm font-semibold text-slate-700">
                  AI Provider
                </label>
                <select
                  value={localConfig.provider}
                  onChange={(e) => setLocalConfig({ ...localConfig, provider: e.target.value, model: '' })}
                  className="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#135bec]/20 focus:border-[#135bec] outline-none transition-all text-slate-900"
                >
                  {loadingProviders ? (
                    <option>Loading providers...</option>
                  ) : (
                    Object.keys(providers).map((p) => (
                      <option key={p} value={p}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Model Selection */}
              <div className="space-y-2.5">
                <label className="block text-sm font-semibold text-slate-700">
                  Model (Optional)
                </label>
                <input
                  type="text"
                  value={localConfig.model}
                  onChange={(e) => setLocalConfig({ ...localConfig, model: e.target.value })}
                  className="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#135bec]/20 focus:border-[#135bec] outline-none transition-all text-slate-900 placeholder:text-slate-400"
                  placeholder={`e.g. ${providers[localConfig.provider]?.default_model || 'gpt-4o'}`}
                />
                <p className="text-[12px] text-slate-400">
                  Leave blank to use default: <span className="font-mono">{providers[localConfig.provider]?.default_model || 'default model'}</span>
                </p>
              </div>

              {/* API Key Input */}
              <div className="space-y-2.5">
                <label className="block text-sm font-semibold text-slate-700">
                  API Key
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#135bec] transition-colors">
                    <Key size={18} />
                  </div>
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={localConfig.apiKey}
                    onChange={(e) => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
                    className="block w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#135bec]/20 focus:border-[#135bec] outline-none transition-all text-slate-900 placeholder:text-slate-400"
                    placeholder="sk-••••••••••••••••••••••••••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    <ShieldCheck size={18} />
                  </button>
                </div>
              </div>

              {/* Test Connection Section */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <Zap className={status === 'success' ? 'text-[#00d1b2]' : 'text-slate-400'} size={20} />
                  <div>
                    <p className="text-sm font-medium text-slate-700">{status === 'success' ? 'Connection Verified' : 'Test Connection'}</p>
                    <p className="text-xs text-slate-500">{status === 'success' ? 'API key is valid' : 'Optional: Verify your API key works'}</p>
                  </div>
                </div>
                {status === 'success' ? (
                  <div className="flex items-center gap-2 px-5 py-2.5 bg-[#00d1b2] text-white text-sm font-bold rounded-lg shadow-lg shadow-[#00d1b2]/20">
                    <CheckCircle2 size={16} />
                    Valid
                  </div>
                ) : (
                  <button 
                    type="button"
                    onClick={handleTest}
                    disabled={status === 'testing' || !localConfig.apiKey.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#135bec] hover:bg-[#135bec]/90 text-white text-sm font-bold rounded-lg shadow-lg shadow-[#135bec]/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Zap size={16} />
                    {status === 'testing' ? 'Testing...' : 'Test'}
                  </button>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleSave}
                className="px-8 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-lg hover:shadow-xl transition-all"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
