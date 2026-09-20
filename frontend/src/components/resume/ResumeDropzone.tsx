import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, FileCode, Edit3 } from 'lucide-react';
import { resumeAPI } from '../../services/api';
import type { Resume } from '../../types';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';

interface ResumeDropzoneProps {
  onParsed: (resume: Resume) => void;
  selectedResume: Resume | null;
}

export const ResumeDropzone: React.FC<ResumeDropzoneProps> = ({ onParsed, selectedResume }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [mode, setMode] = useState<'upload' | 'paste'>('upload');
  const [pastedTitle, setPastedTitle] = useState('');
  const [pastedText, setPastedText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'doc', 'txt', 'md'].includes(ext || '')) {
      showToast('Unsupported file type. Please upload a PDF, DOCX, or TXT document.', 'error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast('File size exceeds 10MB limit.', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const resume = await resumeAPI.upload(file);
      onParsed(resume);
      showToast(`Resume "${resume.filename}" parsed successfully!`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to process resume';
      showToast(msg, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFile(e.target.files[0]);
    }
  };

  const handlePasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pastedText.trim().length < 50) {
      showToast('Please provide at least 50 characters of resume text.', 'warning');
      return;
    }
    setIsUploading(true);
    try {
      const resume = await resumeAPI.parseText({
        title: pastedTitle.trim() || 'Pasted Resume',
        text: pastedText.trim(),
      });
      onParsed(resume);
      showToast('Pasted resume text parsed successfully!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to parse pasted resume';
      showToast(msg, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Mode Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
            mode === 'upload'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UploadCloud className="w-3.5 h-3.5" />
          Upload File (PDF / DOCX / TXT)
        </button>
        <button
          type="button"
          onClick={() => setMode('paste')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
            mode === 'paste'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          Paste Resume Text
        </button>
      </div>

      {mode === 'upload' ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-indigo-500 bg-indigo-950/20 scale-[1.01]'
              : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/60'
          } ${isUploading ? 'pointer-events-none opacity-75' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 shadow-inner">
            {isUploading ? (
              <FileCode className="w-7 h-7 animate-pulse text-indigo-300" />
            ) : (
              <UploadCloud className="w-7 h-7" />
            )}
          </div>

          <h4 className="text-base font-semibold text-white mb-1">
            {isUploading ? 'Extracting & Parsing Document...' : 'Upload your resume'}
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mb-4">
            Drag and drop your file here, or browse from your device. Supported formats: PDF, DOCX, TXT (up to 10MB).
          </p>

          <Button
            variant="outline"
            size="sm"
            type="button"
            isLoading={isUploading}
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Select Document
          </Button>
        </div>
      ) : (
        <form onSubmit={handlePasteSubmit} className="space-y-3">
          <div>
            <input
              type="text"
              placeholder="Resume Name / Headline (e.g., Full Stack Engineer 2026)"
              value={pastedTitle}
              onChange={(e) => setPastedTitle(e.target.value)}
              className="w-full text-sm rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <div>
            <textarea
              rows={8}
              placeholder="Paste the raw text of your resume here (Summary, Skills, Experience, Education)..."
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              className="w-full text-sm rounded-xl bg-slate-900 border border-slate-800 p-3.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{pastedText.length} characters</span>
            <Button variant="primary" size="sm" type="submit" isLoading={isUploading}>
              Parse Text Resume
            </Button>
          </div>
        </form>
      )}

      {/* Selected Resume Status Card */}
      {selectedResume && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">{selectedResume.filename}</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  {selectedResume.file_type}
                </span>
              </div>
              <p className="text-xs text-emerald-400/80">
                {selectedResume.parsed_data?.skills.length || 0} skills detected • {selectedResume.parsed_data?.word_count || 0} words
              </p>
            </div>
          </div>
          <span className="text-xs font-medium text-emerald-400 bg-emerald-950/50 px-2.5 py-1 rounded-md border border-emerald-500/20">
            Ready for Analysis
          </span>
        </div>
      )}
    </div>
  );
};
