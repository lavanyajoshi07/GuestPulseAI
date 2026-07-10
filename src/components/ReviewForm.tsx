'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, Send, Loader2, CheckCircle2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import Papa from 'papaparse';

interface ReviewFormProps {
  onSubmit: (data: { review?: string; reviews?: string[]; fileData?: string; mimeType?: string; filename?: string }) => Promise<void>;
  isLoading?: boolean;
}

export default function ReviewForm({ onSubmit, isLoading = false }: ReviewFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileReviews, setFileReviews] = useState<string[]>([]);
  const [fileData, setFileData] = useState<string>('');
  const [mimeType, setMimeType] = useState<string>('');
  const [parsingStatus, setParsingStatus] = useState<string>('');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError('');
    setSelectedFile(file);
    setFileReviews([]);
    setFileData('');
    setMimeType('');
    setParsingStatus('Preparing document...');

    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.csv')) {
      setParsingStatus('Parsing CSV file...');
      Papa.parse(file, {
        complete: (results: any) => {
          const extracted: string[] = [];
          results.data.forEach((row: any) => {
            if (Array.isArray(row)) {
              row.forEach((cell) => {
                if (typeof cell === 'string' && cell.trim().length >= 10) {
                  extracted.push(cell.trim());
                }
              });
            } else if (typeof row === 'object' && row !== null) {
              Object.values(row).forEach((val) => {
                if (typeof val === 'string' && val.trim().length >= 10) {
                  extracted.push(val.trim());
                }
              });
            }
          });

          if (extracted.length === 0) {
            setError('Could not find readable review rows in CSV file.');
            setParsingStatus('');
          } else {
            setFileReviews(extracted);
            setParsingStatus(`Ready! Found ${extracted.length} reviews to analyze.`);
          }
        },
        error: () => {
          setError('Failed to parse CSV file.');
          setParsingStatus('');
        },
      });
    } else if (fileName.endsWith('.pdf') || fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const resultStr = (e.target?.result as string) || '';
        const commaIdx = resultStr.indexOf(',');
        if (commaIdx !== -1) {
          const base64 = resultStr.substring(commaIdx + 1);
          setFileData(base64);
          setMimeType(file.type || (fileName.endsWith('.pdf') ? 'application/pdf' : 'image/png'));
          setParsingStatus(`Ready! Document parsed successfully for AI extraction.`);
        } else {
          setError('Failed to read document data.');
          setParsingStatus('');
        }
      };
      reader.readAsDataURL(file);
    } else {
      setError('Please upload a valid .csv, .pdf, or .png/.jpg file.');
      setParsingStatus('');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedFile) {
      setError('Please upload a valid CSV, PDF, or PNG file first.');
      return;
    }

    try {
      const isCSV = selectedFile.name.toLowerCase().endsWith('.csv');
      if (isCSV) {
        if (fileReviews.length === 0) {
          setError('Please wait for the CSV dataset to be parsed first.');
          return;
        }
        await onSubmit({ reviews: fileReviews, filename: selectedFile.name });
      } else {
        if (!fileData || !mimeType) {
          setError('Please wait for the document to be parsed first.');
          return;
        }
        await onSubmit({ fileData, mimeType, filename: selectedFile.name });
      }
    } catch (err: any) {
      setError(err.message || 'Analysis failed.');
    }
  };

  return (
    <div className="w-full space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          {/* Drag & Drop File Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-50/10'
                : selectedFile
                ? 'border-emerald-500/50 bg-emerald-50/20 dark:bg-[#E2E8F0] dark:border-slate-200'
                : 'border-slate-200 dark:border-slate-200/40 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 bg-slate-50/50 hover:bg-slate-50 dark:bg-[#E2E8F0] dark:hover:bg-[#E2E8F0]/90'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex flex-col items-center gap-3">
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600">
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-800 text-sm">
                  {selectedFile ? selectedFile.name : 'Drag and drop your file here'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                  Supports <span className="font-semibold text-slate-700 dark:text-slate-700">.CSV, .PDF, .PNG</span> review datasets
                </p>
              </div>
            </div>
          </div>

          {/* Selected File Details */}
          {selectedFile && (
            <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-[#E2E8F0] border border-slate-200 dark:border-[#1E2D3D] flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedFile.name.endsWith('.png') || selectedFile.name.endsWith('.jpg') || selectedFile.name.endsWith('.jpeg') ? (
                  <ImageIcon className="w-5 h-5 text-purple-500" />
                ) : (
                  <FileText className="w-5 h-5 text-emerald-600" />
                )}
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-800">{selectedFile.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              {parsingStatus && (
                <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {parsingStatus}
                </span>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !selectedFile}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-semibold text-xs transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing & Synthesizing Owner Analytics...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Analyze Uploaded Dataset
            </>
          )}
        </button>
      </form>
    </div>
  );
}
