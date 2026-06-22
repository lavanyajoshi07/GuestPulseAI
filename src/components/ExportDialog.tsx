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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Export Reviews</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {exported ? (
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <p className="text-green-700 font-semibold">Exported successfully!</p>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleExportCSV}
                disabled={isExporting}
                className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExporting ? (
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  ) : (
                    <Download className="w-5 h-5 text-blue-600" />
                  )}
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">CSV</p>
                    <p className="text-xs text-gray-500">For Excel/Sheets</p>
                  </div>
                </div>
              </button>

              <button
                onClick={handleExportJSON}
                disabled={isExporting}
                className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExporting ? (
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  ) : (
                    <Download className="w-5 h-5 text-blue-600" />
                  )}
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">JSON</p>
                    <p className="text-xs text-gray-500">For APIs/Programs</p>
                  </div>
                </div>
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                {reviews.length} review{reviews.length !== 1 ? 's' : ''} will be exported
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
