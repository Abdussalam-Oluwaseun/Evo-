'use client';

import React from 'react';
import { UploadCloud, Sparkles, FileCheck2, AlertCircle, X } from 'lucide-react';

interface InputSectionProps {
  jobDescription: string;
  setJobDescription: (val: string) => void;
  resumeFile: File | null;
  onResumeUpload: (file: File) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  error: string | null;
}

export default function InputSection({
  jobDescription,
  setJobDescription,
  resumeFile,
  onResumeUpload,
  onGenerate,
  isGenerating,
  error,
}: InputSectionProps) {

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        alert('Only PDF files are accepted. Please upload a .pdf file.');
        return;
      }
      onResumeUpload(file);
    }
  };

  return (
    <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900">Application Input</h3>
        <p className="text-sm text-slate-500">Upload your resume and paste the job description to get started.</p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span className="flex-1">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Resume Upload */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700">Your Resume</label>
          {resumeFile ? (
            <div className="flex-1 border-2 border-[#135bec]/30 bg-[#135bec]/5 rounded-xl p-6 flex flex-col items-center justify-center gap-3 min-h-[180px]">
              <div className="size-10 rounded-full bg-[#135bec]/10 border border-[#135bec]/20 flex items-center justify-center text-[#135bec]">
                <FileCheck2 size={24} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-900">{resumeFile.name}</p>
                <p className="text-[10px] text-slate-500 mt-1">
                  {(resumeFile.size / 1024).toFixed(1)} KB • Ready to process
                </p>
              </div>
              <label className="text-xs font-semibold text-[#135bec] hover:underline cursor-pointer">
                <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf" />
                Change file
              </label>
            </div>
          ) : (
            <label className="flex-1 border-2 border-dashed border-slate-200 hover:border-[#135bec]/50 transition-colors rounded-xl p-6 flex flex-col items-center justify-center gap-3 bg-slate-50/50 group cursor-pointer min-h-[180px]">
              <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf" />
              <div className="size-10 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-[#135bec] transition-colors">
                <UploadCloud size={24} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-900">Click to upload or drag</p>
                <p className="text-[10px] text-slate-500 mt-1">PDF files only, up to 10MB</p>
              </div>
            </label>
          )}
        </div>

        {/* Job Description Textarea */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700">Job Description</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full flex-1 min-h-[180px] rounded-xl border-slate-200 bg-white text-sm focus:ring-[#135bec] focus:border-[#135bec] placeholder-slate-400 p-4 resize-none outline-none"
            placeholder="Paste the job requirements here (minimum 50 characters)..."
          />
          <p className="text-[10px] text-slate-400 text-right">
            {jobDescription.length} characters {jobDescription.length < 50 && jobDescription.length > 0 ? '(min 50)' : ''}
          </p>
        </div>
      </div>

      <button
        onClick={onGenerate}
        disabled={isGenerating || !resumeFile || jobDescription.length < 50}
        className="w-full bg-[#135bec] hover:bg-[#135bec]/90 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#135bec]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Sparkles size={18} />
        {isGenerating ? 'Generating...' : 'Generate Application'}
      </button>
    </section>
  );
}
