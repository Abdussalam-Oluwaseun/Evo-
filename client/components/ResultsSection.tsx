'use client';

import React from 'react';
import { FileText, Mail, Download, Wand2 } from 'lucide-react';
import { motion } from 'motion/react';

interface ResultsSectionProps {
  tailoredResume: string;
  coverLetter: string;
  isGenerating: boolean;
}

export default function ResultsSection({ tailoredResume, coverLetter, isGenerating }: ResultsSectionProps) {
  const downloadAsText = (content: string, filename: string) => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleExportResume = () => {
    if (tailoredResume) {
      downloadAsText(tailoredResume, 'tailored-resume.txt');
    }
  };

  const handleExportCoverLetter = () => {
    if (coverLetter) {
      downloadAsText(coverLetter, 'cover-letter.txt');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
      {/* Section 2: Tailored Resume */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-[400px]">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <FileText className="text-[#135bec]" size={18} />
            <span className="text-sm font-bold text-slate-900">Tailored Resume</span>
          </div>
          <button
            onClick={handleExportResume}
            disabled={!tailoredResume || isGenerating}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#135bec] transition-colors bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={14} />
            Export
          </button>
        </div>
        <div className="flex-1 p-6 overflow-y-auto">
          {isGenerating ? (
            <div className="animate-pulse flex flex-col gap-4">
              <div className="h-4 bg-slate-100 rounded w-1/3"></div>
              <div className="h-2 bg-slate-50 rounded w-full"></div>
              <div className="h-2 bg-slate-50 rounded w-5/6"></div>
              <div className="h-2 bg-slate-50 rounded w-full"></div>
              <div className="mt-4 h-4 bg-slate-100 rounded w-1/4"></div>
              <div className="h-2 bg-slate-50 rounded w-full"></div>
              <div className="h-2 bg-slate-50 rounded w-4/5"></div>
            </div>
          ) : tailoredResume ? (
            <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
              {tailoredResume}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <Wand2 className="text-slate-400 mb-2" size={40} />
              <div className="mt-8 text-slate-400 text-xs italic">
                Generate content to preview your tailored resume
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section 3: Cover Letter */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-[400px]">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <Mail className="text-[#135bec]" size={18} />
            <span className="text-sm font-bold text-slate-900">Cover Letter</span>
          </div>
          <button
            onClick={handleExportCoverLetter}
            disabled={!coverLetter || isGenerating}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#135bec] transition-colors bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={14} />
            Export
          </button>
        </div>
        <div className="flex-1 p-6 overflow-y-auto">
          {isGenerating ? (
            <div className="animate-pulse flex flex-col gap-4">
              <div className="h-4 bg-slate-100 rounded w-1/3"></div>
              <div className="h-2 bg-slate-50 rounded w-full"></div>
              <div className="h-2 bg-slate-50 rounded w-5/6"></div>
              <div className="h-2 bg-slate-50 rounded w-full"></div>
            </div>
          ) : coverLetter ? (
            <div className="prose prose-sm  max-w-none text-slate-700 whitespace-pre-wrap">
              {coverLetter}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
              <Wand2 className="text-slate-400 mb-2" size={40} />
              <p className="mt-8 text-slate-400 text-xs italic">Generate content to preview your tailored resume </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
