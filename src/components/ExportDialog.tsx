'use client';

import { useState } from 'react';
import { Download, Loader2, X, CheckCircle } from 'lucide-react';
import { exportReviewsAsCSV, exportReviewsAsJSON, downloadFile } from '@/lib/export';
import type { Review } from '@/types';

interface ExportDialogProps {
  reviews: Review[];
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportDialog({ reviews, isOpen, onClose }: ExportDialogProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exported, setExported] = useState(false);

  if (!isOpen) return null;

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const csv = await exportReviewsAsCSV(reviews);
      const filename = `reviews-export-${new Date().toISOString().split('T')[0]}.csv`;
      downloadFile(csv, filename, 'text/csv');
      setExported(true);
      setTimeout(() => {
        setExported(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      const json = await exportReviewsAsJSON(reviews);
      const filename = `reviews-export-${new Date().toISOString().split('T')[0]}.json`;
      downloadFile(json, filename, 'application/json');
      setExported(true);
      setTimeout(() => {
        setExported(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg shadow-xl max-w-md w-full mx-4 transition-colors duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Export Reviews</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-accent transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {exported ? (
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
              <p className="text-green-700 dark:text-green-400 font-semibold">Exported successfully!</p>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleExportCSV}
                disabled={isExporting}
                className="w-full flex items-center justify-between px-4 py-3 bg-background border border-border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {isExporting ? (
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  )}
                  <div className="text-left">
                    <p className="font-semibold text-foreground">CSV</p>
                    <p className="text-xs text-muted-foreground">For Excel/Sheets</p>
                  </div>
                </div>
              </button>

              <button
                onClick={handleExportJSON}
                disabled={isExporting}
                className="w-full flex items-center justify-between px-4 py-3 bg-background border border-border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {isExporting ? (
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  )}
                  <div className="text-left">
                    <p className="font-semibold text-foreground">JSON</p>
                    <p className="text-xs text-muted-foreground">For APIs/Programs</p>
                  </div>
                </div>
              </button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                {reviews.length} review{reviews.length !== 1 ? 's' : ''} will be exported
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-border rounded-lg font-semibold text-foreground hover:bg-accent transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
