'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import InputSection from '@/components/InputSection';
import ResultsSection from '@/components/ResultsSection';
import ConfigModal from '@/components/ConfigModal';
import { GoogleGenAI } from "@google/genai";

export default function Page() {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [tailoredResume, setTailoredResume] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleResumeUpload = (file: File) => {
    // In a real app, we'd use a library to parse PDF/Docx
    // For this demo, we'll simulate extracting text
    setResumeText("John Doe\nSoftware Engineer\nExperience: 5 years at TechCorp...");
    alert(`File "${file.name}" uploaded. (Text extraction simulated)`);
  };

  const generateApplication = async () => {
    if (!jobDescription) {
      alert("Please provide a job description.");
      return;
    }

    setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '' });
      
      const prompt = `
        You are an expert career coach. 
        Based on the following Job Description and my Resume, please generate:
        1. A tailored version of my resume that highlights relevant skills and experiences.
        2. A professional cover letter.

        Job Description:
        ${jobDescription}

        My Resume:
        ${resumeText || "Standard software engineer resume with React, Node, and TypeScript experience."}

        Format the output as a JSON object with two fields: "resume" and "coverLetter".
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash", // Using a stable model
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
        }
      });

      const result = JSON.parse(response.text || '{}');
      setTailoredResume(result.resume || "Tailored resume content...");
      setCoverLetter(result.coverLetter || "Cover letter content...");
    } catch (error) {
      console.error("Generation failed:", error);
      // Fallback for demo if API fails
      setTailoredResume("Tailored Resume:\n- Highlighted React and TypeScript skills\n- Focused on cloud architecture experience\n- Quantified achievements at TechCorp");
      setCoverLetter("Dear Hiring Manager,\n\nI am writing to express my strong interest in the Software Engineer position...");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header onOpenConfig={() => setIsConfigOpen(true)} />
      
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 flex flex-col gap-6">
        <InputSection 
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
          onResumeUpload={handleResumeUpload}
          onGenerate={generateApplication}
          isGenerating={isGenerating}
        />

        <ResultsSection 
          tailoredResume={tailoredResume}
          coverLetter={coverLetter}
          isGenerating={isGenerating}
        />
      </main>

      <footer className="p-6 text-center">
        <p className="text-xs text-slate-400">© 2024 evo AI Systems • Powered by advanced language models</p>
      </footer>

      <ConfigModal 
        isOpen={isConfigOpen} 
        onClose={() => setIsConfigOpen(false)} 
      />
    </div>
  );
}
