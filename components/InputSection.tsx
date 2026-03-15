'use client';

import React from 'react';
import { UploadCloud, Sparkles } from 'lucide-react';

interface InputSectionProps {
  jobDescription: string;
  setJobDescription: (val: string) => void;
  onResumeUpload: (file: File) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export default function InputSection({ 
  jobDescription, 
  setJobDescription, 
  onResumeUpload, 
  onGenerate,
  isGenerating
}: InputSectionProps) {
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onResumeUpload(e.target.files[0]);
    }
  };

  return (
    <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900">Application Input</h3>
        <p className="text-sm text-slate-500">Provide your details to optimize your application.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Resume Upload */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700">Your Resume</label>
          <label className="flex-1 border-2 border-dashed border-slate-200 hover:border-[#135bec]/50 transition-colors rounded-xl p-6 flex flex-col items-center justify-center gap-3 bg-slate-50/50 group cursor-pointer min-h-[180px]">
            <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx" />
            <div className="size-10 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-[#135bec] transition-colors">
              <UploadCloud size={24} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-900">Click to upload or drag</p>
              <p className="text-[10px] text-slate-500 mt-1">PDF, DOCX up to 10MB</p>
            </div>
          </label>
        </div>

        {/* Job Description Textarea */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700">Job Description</label>
          <textarea 
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full flex-1 min-h-[180px] rounded-xl border-slate-200 bg-white text-sm focus:ring-[#135bec] focus:border-[#135bec] placeholder-slate-400 p-4 resize-none outline-none" 
            placeholder="Paste the job requirements here..."
          />
        </div>
      </div>

      <button 
        onClick={onGenerate}
        disabled={isGenerating}
        className="w-full bg-[#135bec] hover:bg-[#135bec]/90 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#135bec]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Sparkles size={18} />
        {isGenerating ? 'Generating...' : 'Generate Application'}
      </button>
    </section>
  );
}
