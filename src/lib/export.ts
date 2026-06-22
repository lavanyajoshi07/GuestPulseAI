import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { Review } from '@/types';

export async function exportReviewsAsCSV(reviews: Review[]): Promise<string> {
  const data = reviews.map((review) => ({
    'Review ID': review._id,
    'Review Text': review.text,
    'Sentiment': review.sentiment,
    'Sentiment Score': review.sentimentScore || 0.75,
    'Category': review.category,
    'Key Points': (review.keyPoints || []).join('; '),
    'Suggested Response': review.suggestedResponse,
    'Created At': new Date(review.createdAt).toLocaleString(),
  }));

  return Papa.unparse(data);
}

export async function exportReviewsAsJSON(reviews: Review[]): Promise<string> {
  return JSON.stringify(
    {
      exportDate: new Date().toISOString(),
      totalReviews: reviews.length,
      reviews: reviews.map((review) => ({
        id: review._id,
        text: review.text,
        sentiment: review.sentiment,
        sentimentScore: review.sentimentScore || 0.75,
        category: review.category,
        keyPoints: review.keyPoints || [],
        suggestedResponse: review.suggestedResponse,
        createdAt: review.createdAt,
      })),
    },
    null,
    2
  );
}

export async function exportDashboardAsPDF(stats: any): Promise<Uint8Array> {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.text('ReviewLens AI - Dashboard Report', 14, 22);

  // Date
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);
  doc.setTextColor(0);

  // Statistics Section
  let yPosition = 45;

  doc.setFontSize(14);
  doc.text('Summary Statistics', 14, yPosition);
  yPosition += 12;

  const statsData = [
    ['Total Reviews', stats.totalReviews || 0],
    ['Positive Reviews', stats.positiveReviews || 0],
    ['Neutral Reviews', stats.neutralReviews || 0],
    ['Negative Reviews', stats.negativeReviews || 0],
    ['Average Sentiment Score', `${((stats.averageSentimentScore || 0) * 100).toFixed(1)}%`],
    ['Most Common Category', stats.mostCommonCategory || 'N/A'],
  ];

  (doc as any).autoTable({
    startY: yPosition,
    head: [['Metric', 'Value']],
    body: statsData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    bodyStyles: { textColor: 0 },
    alternateRowStyles: { fillColor: [240, 245, 250] },
    margin: { left: 14, right: 14 },
  });

  // Get current y position after table
  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Category Breakdown
  if (stats.categoryBreakdown && stats.categoryBreakdown.length > 0) {
    doc.setFontSize(14);
    doc.text('Category Breakdown', 14, yPosition);
    yPosition += 12;

    const categoryData = stats.categoryBreakdown.map((item: any) => [
      item.category,
      item.count,
    ]);

    (doc as any).autoTable({
      startY: yPosition,
      head: [['Category', 'Count']],
      body: categoryData,
      theme: 'grid',
      headStyles: { fillColor: [34, 197, 94], textColor: 255 },
      bodyStyles: { textColor: 0 },
      alternateRowStyles: { fillColor: [240, 253, 244] },
      margin: { left: 14, right: 14 },
    });
  }

  return doc.output('arraybuffer') as Uint8Array;
}

export function downloadFile(content: string | Uint8Array, filename: string, type: string) {
  const blob = new Blob(
    [content],
    { type: type }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
