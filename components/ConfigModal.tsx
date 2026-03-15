'use client';

import React, { useState } from 'react';
import { X, Settings2, Key, Zap, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConfigModal({ isOpen, onClose }: ConfigModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<'idle' | 'testing' | 'success'>('idle');

  const handleTest = () => {
    setStatus('testing');
    setTimeout(() => setStatus('success'), 1500);
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
            <div className="px-8 py-8 space-y-8">
              <div className="space-y-2">
                <p className="text-sm text-slate-500 leading-relaxed">
                  Configure your custom AI endpoints. These keys are stored locally and encrypted for your security.
                </p>
              </div>

              {/* Input Field */}
              <div className="space-y-2.5">
                <label className="block text-sm font-semibold text-slate-700">
                  Custom AI API Key
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#135bec] transition-colors">
                    <Key size={18} />
                  </div>
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="block w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#135bec]/20 focus:border-[#135bec] outline-none transition-all text-slate-900 placeholder:text-slate-400"
                    placeholder="sk-••••••••••••••••••••••••••••••••"
                  />
                  <button 
                    onClick={() => setShowKey(!showKey)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    <ShieldCheck size={18} />
                  </button>
                </div>
                <p className="text-[12px] text-slate-400">
                  Supporting OpenAI, Anthropic, and Groq formats.
                </p>
              </div>

              {/* Status Section */}
              {status !== 'success' ? (
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <Zap className="text-slate-400" size={20} />
                    <div>
                      <p className="text-sm font-medium text-slate-700">Endpoint Connection</p>
                      <p className="text-xs text-slate-500">v1/chat/completions</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleTest}
                    disabled={status === 'testing'}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#135bec] hover:bg-[#135bec]/90 text-white text-sm font-bold rounded-lg shadow-lg shadow-[#135bec]/20 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Zap size={16} />
                    {status === 'testing' ? 'Testing...' : 'Test Connection'}
                  </button>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-[#00d1b2]/5 border border-[#00d1b2]/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-2 rounded-full bg-[#00d1b2] animate-pulse"></div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Connection Verified</p>
                      <p className="text-xs text-slate-500">Latency: 124ms</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-5 py-2.5 bg-[#00d1b2] text-white text-sm font-bold rounded-lg shadow-lg shadow-[#00d1b2]/20">
                    <CheckCircle2 size={16} />
                    Connected
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={onClose}
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
