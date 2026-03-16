'use client';

import React, { useState, useCallback } from 'react';
import Header from '@/components/Header';
import InputSection from '@/components/InputSection';
import ResultsSection from '@/components/ResultsSection';
import ConfigModal from '@/components/ConfigModal';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface AIConfig {
  apiKey: string;
  provider: string;
  model: string;
}

export default function Page() {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [tailoredResume, setTailoredResume] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI configuration state — persists across modal open/close
  const [aiConfig, setAiConfig] = useState<AIConfig>({
    apiKey: '',
    provider: 'gemini',
    model: '',
  });

  const handleResumeUpload = useCallback((file: File) => {
    setResumeFile(file);
    setError(null);
  }, []);

  const generateApplication = async () => {
    if (!resumeFile) {
      setError('Please upload a PDF resume first.');
      return;
    }
    if (!jobDescription || jobDescription.length < 50) {
      setError('Please provide a job description (at least 50 characters).');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setTailoredResume('');
    setCoverLetter('');

    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('job_description', jobDescription);

      // Build request headers
      const headers: Record<string, string> = {};

      if (aiConfig.apiKey.trim()) {
        headers['X-API-Key'] = aiConfig.apiKey.trim();
      }
      if (aiConfig.provider) {
        headers['X-AI-Provider'] = aiConfig.provider;
      }
      if (aiConfig.model.trim()) {
        headers['X-AI-Model'] = aiConfig.model.trim();
      }

      const response = await fetch(`${API_BASE_URL}/process-resume`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const message =
          errorData?.detail ||
          errorData?.error ||
          `Server returned ${response.status}`;
        throw new Error(message);
      }

      const result = await response.json();

      if (result.success && result.data) {
        setTailoredResume(result.data.tailored_resume || '');
        setCoverLetter(result.data.cover_letter || '');
      } else {
        throw new Error(result.error || 'Unexpected response format.');
      }
    } catch (err: any) {
      console.error('Generation failed:', err);
      setError(err.message || 'An error occurred while generating. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        onOpenConfig={() => setIsConfigOpen(true)}
        provider={aiConfig.provider}
        hasApiKey={!!aiConfig.apiKey.trim()}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 flex flex-col gap-6">
        <InputSection
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
          resumeFile={resumeFile}
          onResumeUpload={handleResumeUpload}
          onGenerate={generateApplication}
          isGenerating={isGenerating}
          error={error}
        />

        <ResultsSection
          tailoredResume={tailoredResume}
          coverLetter={coverLetter}
          isGenerating={isGenerating}
        />
      </main>

      <footer className="p-6 text-center">
        <p className="text-xs text-slate-400">© 2025 evo AI Systems • Powered by advanced language models</p>
      </footer>

      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        config={aiConfig}
        onSave={setAiConfig}
        apiBaseUrl={API_BASE_URL}
      />
    </div>
  );
}
