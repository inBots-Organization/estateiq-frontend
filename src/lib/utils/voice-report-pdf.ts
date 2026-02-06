import jsPDF from 'jspdf';

/**
 * Voice Training Report PDF Generator
 *
 * Generates professional Arabic-layout PDFs for voice training session reports.
 * Uses html2canvas fallback for proper Arabic text rendering.
 */

export interface VoiceReportData {
  sessionId: string;
  conversationId: string;
  traineeId: string;
  traineeName?: string;
  startTime: string;
  endTime?: string;
  durationSeconds: number;
  overallScore: number;
  breakdown: {
    opening: number;
    needsDiscovery: number;
    objectionHandling: number;
    persuasion: number;
    closing: number;
    communication: number;
  };
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  summary: string;
}

// Safe number helper - prevents NaN in PDF
function safeNum(value: unknown, defaultValue = 0): number {
  if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
    return Math.round(value);
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!isNaN(parsed) && isFinite(parsed)) {
      return Math.round(parsed);
    }
  }
  return defaultValue;
}

// Safe string helper
function safeStr(value: unknown, defaultValue = '—'): string {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }
  return defaultValue;
}

// Safe array helper
function safeArray(value: unknown, defaultValue: string[] = ['لم يتم التحديد']): string[] {
  if (Array.isArray(value) && value.length > 0) {
    return value.filter(item => typeof item === 'string' && item.trim().length > 0);
  }
  return defaultValue;
}

function getScoreColor(score: number): string {
  const safeScore = safeNum(score, 0);
  if (safeScore >= 70) return '#22c55e'; // green
  if (safeScore >= 50) return '#eab308'; // yellow
  return '#ef4444'; // red
}

function getScoreBgColor(score: number): string {
  const safeScore = safeNum(score, 0);
  if (safeScore >= 70) return '#dcfce7'; // green-100
  if (safeScore >= 50) return '#fef9c3'; // yellow-100
  return '#fee2e2'; // red-100
}

function getGrade(score: number): string {
  const safeScore = safeNum(score, 0);
  if (safeScore >= 90) return 'A';
  if (safeScore >= 80) return 'B';
  if (safeScore >= 70) return 'C';
  if (safeScore >= 60) return 'D';
  return 'F';
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

export async function generateVoiceReportPDF(report: VoiceReportData): Promise<void> {
  // Validate and sanitize all report data
  const safeReport = {
    sessionId: safeStr(report.sessionId, 'unknown'),
    conversationId: safeStr(report.conversationId, 'unknown'),
    traineeId: safeStr(report.traineeId, 'unknown'),
    traineeName: report.traineeName ? safeStr(report.traineeName) : undefined,
    startTime: report.startTime,
    endTime: report.endTime,
    durationSeconds: safeNum(report.durationSeconds, 0),
    overallScore: safeNum(report.overallScore, 0),
    breakdown: {
      opening: safeNum(report.breakdown?.opening, 0),
      needsDiscovery: safeNum(report.breakdown?.needsDiscovery, 0),
      objectionHandling: safeNum(report.breakdown?.objectionHandling, 0),
      persuasion: safeNum(report.breakdown?.persuasion, 0),
      closing: safeNum(report.breakdown?.closing, 0),
      communication: safeNum(report.breakdown?.communication, 0),
    },
    strengths: safeArray(report.strengths, ['لم يتم تحديد نقاط القوة']),
    weaknesses: safeArray(report.weaknesses, ['لم يتم تحديد نقاط الضعف']),
    improvements: safeArray(report.improvements, ['لم يتم تحديد اقتراحات']),
    summary: safeStr(report.summary, 'لم يتم تحليل هذه الجلسة'),
  };

  const durationMins = Math.round(safeReport.durationSeconds / 60);
  const scoreColor = getScoreColor(safeReport.overallScore);
  const grade = getGrade(safeReport.overallScore);

  // Category data for breakdown
  const categories = [
    { label: 'الافتتاحية', score: safeReport.breakdown.opening },
    { label: 'اكتشاف الاحتياجات', score: safeReport.breakdown.needsDiscovery },
    { label: 'معالجة الاعتراضات', score: safeReport.breakdown.objectionHandling },
    { label: 'الإقناع', score: safeReport.breakdown.persuasion },
    { label: 'الإغلاق', score: safeReport.breakdown.closing },
    { label: 'التواصل', score: safeReport.breakdown.communication },
  ];

  // Create HTML content for the report
  const htmlContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;600;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Noto Sans Arabic', 'Segoe UI', Tahoma, sans-serif;
          direction: rtl;
          background: white;
          color: #1e293b;
          line-height: 1.6;
        }

        .page {
          width: 210mm;
          min-height: 297mm;
          padding: 15mm;
          background: white;
        }

        .header {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: white;
          padding: 25px;
          border-radius: 12px;
          margin-bottom: 20px;
        }

        .header h1 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .header p {
          color: #94a3b8;
          font-size: 14px;
        }

        .meta-info {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
          color: #64748b;
          font-size: 13px;
        }

        .score-section {
          background: #f8fafc;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .score-label {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
        }

        .score-display {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .grade {
          font-size: 36px;
          font-weight: 700;
          color: ${scoreColor};
        }

        .score-circle {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: ${scoreColor};
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 700;
        }

        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .breakdown-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }

        .breakdown-item {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px;
        }

        .breakdown-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .breakdown-label {
          font-size: 13px;
          color: #64748b;
        }

        .breakdown-score {
          font-size: 14px;
          font-weight: 600;
        }

        .progress-bar {
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s;
        }

        .feedback-section {
          border-radius: 10px;
          padding: 15px;
          margin-bottom: 15px;
        }

        .strengths {
          background: #dcfce7;
          border: 1px solid #86efac;
        }

        .strengths .section-title {
          color: #16a34a;
        }

        .strengths li {
          color: #15803d;
        }

        .weaknesses {
          background: #fee2e2;
          border: 1px solid #fca5a5;
        }

        .weaknesses .section-title {
          color: #dc2626;
        }

        .weaknesses li {
          color: #b91c1c;
        }

        .improvements {
          background: #dbeafe;
          border: 1px solid #93c5fd;
        }

        .improvements .section-title {
          color: #2563eb;
        }

        .improvements li {
          color: #1d4ed8;
        }

        .feedback-list {
          list-style: none;
          padding: 0;
        }

        .feedback-list li {
          padding: 5px 0;
          font-size: 13px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }

        .feedback-list li::before {
          content: "•";
          font-weight: bold;
        }

        .improvements .feedback-list li::before {
          content: "→";
        }

        .summary-section {
          background: #f8fafc;
          border-radius: 10px;
          padding: 15px;
          margin-bottom: 20px;
        }

        .summary-text {
          font-size: 13px;
          color: #475569;
          line-height: 1.8;
        }

        .footer {
          text-align: center;
          color: #94a3b8;
          font-size: 11px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="header">
          <h1>تقرير التدريب الصوتي</h1>
          <p>تقييم أداء المكالمة</p>
        </div>

        <div class="meta-info">
          <span>📅 التاريخ: ${formatDate(safeReport.startTime)}</span>
          <span>⏱️ المدة: ${durationMins} دقيقة</span>
          ${safeReport.traineeName ? `<span>👤 المتدرب: ${safeReport.traineeName}</span>` : ''}
        </div>

        <div class="score-section">
          <div class="score-label">النتيجة الإجمالية</div>
          <div class="score-display">
            <div class="grade">${grade}</div>
            <div class="score-circle">${safeReport.overallScore}%</div>
          </div>
        </div>

        <div class="section-title">📊 تحليل الأداء التفصيلي</div>
        <div class="breakdown-grid">
          ${categories.map(cat => `
            <div class="breakdown-item">
              <div class="breakdown-header">
                <span class="breakdown-label">${cat.label}</span>
                <span class="breakdown-score" style="color: ${getScoreColor(cat.score)}">${cat.score}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${cat.score}%; background: ${getScoreColor(cat.score)}"></div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="feedback-section strengths">
          <div class="section-title">✓ نقاط القوة</div>
          <ul class="feedback-list">
            ${safeReport.strengths.map(s => `<li>${s}</li>`).join('')}
          </ul>
        </div>

        <div class="feedback-section weaknesses">
          <div class="section-title">✗ نقاط الضعف</div>
          <ul class="feedback-list">
            ${safeReport.weaknesses.map(w => `<li>${w}</li>`).join('')}
          </ul>
        </div>

        <div class="feedback-section improvements">
          <div class="section-title">💡 اقتراحات للتحسين</div>
          <ul class="feedback-list">
            ${safeReport.improvements.map(i => `<li>${i}</li>`).join('')}
          </ul>
        </div>

        <div class="summary-section">
          <div class="section-title">📝 ملخص الأداء</div>
          <p class="summary-text">${safeReport.summary}</p>
        </div>

        <div class="footer">
          تم إنشاء التقرير بواسطة منصة عقاري برو
        </div>
      </div>
    </body>
    </html>
  `;

  // Create a hidden container for rendering
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.innerHTML = htmlContent;
  document.body.appendChild(container);

  // Wait for fonts to load
  await document.fonts.ready;
  await new Promise(resolve => setTimeout(resolve, 500));

  try {
    // Import html2canvas dynamically
    const html2canvas = (await import('html2canvas')).default;

    const pageElement = container.querySelector('.page') as HTMLElement;
    if (!pageElement) throw new Error('Page element not found');

    // Render to canvas
    const canvas = await html2canvas(pageElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Calculate dimensions maintaining aspect ratio
    const canvasAspect = canvas.width / canvas.height;
    const pdfAspect = pdfWidth / pdfHeight;

    let imgWidth = pdfWidth;
    let imgHeight = pdfWidth / canvasAspect;

    if (imgHeight > pdfHeight) {
      imgHeight = pdfHeight;
      imgWidth = pdfHeight * canvasAspect;
    }

    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);

    // Save PDF
    const filename = `voice-report-${safeReport.conversationId.slice(0, 8)}-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);
  } finally {
    // Cleanup
    document.body.removeChild(container);
  }
}

export default generateVoiceReportPDF;
