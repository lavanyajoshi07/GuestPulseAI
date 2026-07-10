import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Review } from '@/types';

export async function exportReviewsAsCSV(reviews: Review[]): Promise<string> {
  const data = reviews.map((review) => ({
    'Review ID': review._id,
    'Review Text': review.text,
    'Sentiment': review.sentiment,
    'Sentiment Score': review.sentimentScore || 0.75,
    'Category': review.category,
    'Key Points': (review.keyPoints || []).join('; '),
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
  doc.text('GuestPulse AI - Dashboard Report', 14, 22);

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

  autoTable(doc, {
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

    autoTable(doc, {
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

  return new Uint8Array(doc.output('arraybuffer'));
}

export function sanitizeFilename(homestayName: string, extension: string): string {
  const cleanName = (homestayName || 'Homestay').replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  return `GuestPulse_Report_${cleanName}_${dateStr}.${extension}`;
}

export async function exportReportAsPDF(reportData: any, homestayName: string): Promise<Uint8Array> {
  const doc = new jsPDF();

  // Header Branding
  doc.setFontSize(22);
  doc.setTextColor(37, 99, 235); // Blue-600
  doc.text('GuestPulse AI', 14, 20);

  doc.setFontSize(14);
  doc.setTextColor(75, 85, 99);
  doc.text(`Executive Report: ${homestayName}`, 14, 28);

  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 34);

  let yPos = 45;

  // Executive Metrics Table
  doc.setFontSize(13);
  doc.setTextColor(17, 24, 39);
  doc.text('Performance Summary', 14, yPos);
  yPos += 8;

  const metricsBody = [
    ['Guest Satisfaction Rate', `${reportData.guestSatisfactionRate || 100}%`],
    ['Total Analyzed Reviews', `${reportData.totalReviews || 0}`],
    ['Top Appreciated Features', (reportData.mostAppreciated || []).join(', ') || 'N/A'],
    ['Primary Areas for Improvement', (reportData.topComplaints || []).join(', ') || 'None reported'],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Metric', 'Detail']],
    body: metricsBody,
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    margin: { left: 14, right: 14 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 14;

  // AI Business Summary Section
  if (reportData.aiSummary) {
    doc.setFontSize(13);
    doc.setTextColor(17, 24, 39);
    doc.text('Gemini AI Executive Insights', 14, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);

    // Split AI Summary text across PDF lines safely
    const cleanSummary = reportData.aiSummary.replace(/###/g, '').trim();
    const splitText = doc.splitTextToSize(cleanSummary, 180);
    
    // Check page space
    if (yPos + splitText.length * 5 > 280) {
      doc.addPage();
      yPos = 20;
    }

    doc.text(splitText, 14, yPos);
    yPos += splitText.length * 5 + 12;
  }

  // Category Breakdown Table
  if (reportData.categoryBreakdown && reportData.categoryBreakdown.length > 0) {
    if (yPos > 230) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(13);
    doc.setTextColor(17, 24, 39);
    doc.text('Category Breakdown', 14, yPos);
    yPos += 8;

    const catData = reportData.categoryBreakdown.map((c: any) => [c.category, c.count]);

    autoTable(doc, {
      startY: yPos,
      head: [['Category', 'Feedback Count']],
      body: catData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: 255 },
      margin: { left: 14, right: 14 },
    });
  }

  return new Uint8Array(doc.output('arraybuffer'));
}

export async function exportReportAsCSV(reportData: any, homestayName: string): Promise<string> {
  const summaryRows = [
    { Section: 'Property', Metric: 'Homestay Name', Value: homestayName },
    { Section: 'Overview', Metric: 'Guest Satisfaction Rate', Value: `${reportData.guestSatisfactionRate}%` },
    { Section: 'Overview', Metric: 'Total Reviews Analyzed', Value: reportData.totalReviews },
    { Section: 'Highlights', Metric: 'Most Appreciated Features', Value: (reportData.mostAppreciated || []).join('; ') },
    { Section: 'Highlights', Metric: 'Top Complaint Categories', Value: (reportData.topComplaints || []).join('; ') },
  ];

  if (reportData.categoryBreakdown) {
    reportData.categoryBreakdown.forEach((c: any) => {
      summaryRows.push({
        Section: 'Category Breakdown',
        Metric: c.category,
        Value: c.count,
      });
    });
  }

  return Papa.unparse(summaryRows);
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

