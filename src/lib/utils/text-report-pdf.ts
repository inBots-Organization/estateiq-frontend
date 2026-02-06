import jsPDF from 'jspdf';

/**
 * Text Conversation Report PDF Generator
 *
 * Generates professional Arabic-layout PDFs for text-based conversation training reports.
 * Uses html2canvas for proper Arabic text rendering.
 */

export interface TextReportData {
  sessionId: string;
  traineeId: string;
  traineeName?: string;
  startTime: string;
  endTime?: string;
  durationSeconds: number;
  scenarioType: string;
  difficultyLevel: string;
  clientPersona: {
    name: string;
    personality: string;
    background: string;
    budget: string;
  };
  conversationTurns: Array<{
    speaker: 'trainee' | 'client';
    message: string;
    timestamp: Date;
  }>;
  analysis: {
    overallScore: number;
    grade: string;
    summary: string;
    skillScores: {
      communication: { score: number; tips: string[] };
      negotiation: { score: number; tips: string[] };
      objectionHandling: { score: number; tips: string[] };
      relationshipBuilding: { score: number; tips: string[] };
      productKnowledge: { score: number; tips: string[] };
      closingTechnique: { score: number; tips: string[] };
    };
    highlights: string[];
    improvementAreas: string[];
    conversationMetrics: {
      talkTimeRatio: number;
      questionsAsked: number;
      empathyStatements: number;
      activeListeningIndicators: number;
    };
  };
}

// Safe number helper
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

// Arabic scenario type labels
const scenarioLabels: Record<string, string> = {
  property_showing: 'عرض عقار',
  price_negotiation: 'تفاوض على السعر',
  objection_handling: 'معالجة الاعتراضات',
  closing: 'إغلاق الصفقة',
  cold_call: 'اتصال بارد',
  follow_up: 'متابعة',
};

// Arabic difficulty labels
const difficultyLabels: Record<string, string> = {
  easy: 'سهل',
  medium: 'متوسط',
  hard: 'صعب',
};

// Arabic personality labels
const personalityLabels: Record<string, string> = {
  friendly: 'ودود',
  skeptical: 'متشكك',
  demanding: 'متطلب',
  indecisive: 'متردد',
  analytical: 'تحليلي',
};

// Arabic skill labels
const skillLabels: Record<string, string> = {
  communication: 'التواصل',
  negotiation: 'التفاوض',
  objectionHandling: 'معالجة الاعتراضات',
  relationshipBuilding: 'بناء العلاقات',
  productKnowledge: 'معرفة المنتج',
  closingTechnique: 'تقنيات الإغلاق',
};

export async function generateTextReportPDF(report: TextReportData): Promise<void> {
  // Validate and sanitize all report data
  const safeReport = {
    sessionId: safeStr(report.sessionId, 'unknown'),
    traineeId: safeStr(report.traineeId, 'unknown'),
    traineeName: report.traineeName ? safeStr(report.traineeName) : undefined,
    startTime: report.startTime,
    endTime: report.endTime,
    durationSeconds: safeNum(report.durationSeconds, 0),
    scenarioType: report.scenarioType,
    difficultyLevel: report.difficultyLevel,
    clientPersona: {
      name: safeStr(report.clientPersona?.name, 'عميل'),
      personality: safeStr(report.clientPersona?.personality, 'neutral'),
      background: safeStr(report.clientPersona?.background, 'غير محدد'),
      budget: safeStr(report.clientPersona?.budget, 'غير محدد'),
    },
    conversationTurns: report.conversationTurns || [],
    analysis: {
      overallScore: safeNum(report.analysis?.overallScore, 0),
      grade: safeStr(report.analysis?.grade, 'N/A'),
      summary: safeStr(report.analysis?.summary, 'لم يتم تحليل هذه الجلسة'),
      skillScores: {
        communication: { score: safeNum(report.analysis?.skillScores?.communication?.score, 0), tips: safeArray(report.analysis?.skillScores?.communication?.tips) },
        negotiation: { score: safeNum(report.analysis?.skillScores?.negotiation?.score, 0), tips: safeArray(report.analysis?.skillScores?.negotiation?.tips) },
        objectionHandling: { score: safeNum(report.analysis?.skillScores?.objectionHandling?.score, 0), tips: safeArray(report.analysis?.skillScores?.objectionHandling?.tips) },
        relationshipBuilding: { score: safeNum(report.analysis?.skillScores?.relationshipBuilding?.score, 0), tips: safeArray(report.analysis?.skillScores?.relationshipBuilding?.tips) },
        productKnowledge: { score: safeNum(report.analysis?.skillScores?.productKnowledge?.score, 0), tips: safeArray(report.analysis?.skillScores?.productKnowledge?.tips) },
        closingTechnique: { score: safeNum(report.analysis?.skillScores?.closingTechnique?.score, 0), tips: safeArray(report.analysis?.skillScores?.closingTechnique?.tips) },
      },
      highlights: safeArray(report.analysis?.highlights, ['لم يتم تحديد نقاط القوة']),
      improvementAreas: safeArray(report.analysis?.improvementAreas, ['لم يتم تحديد نقاط الضعف']),
      conversationMetrics: {
        talkTimeRatio: safeNum(report.analysis?.conversationMetrics?.talkTimeRatio, 0.5),
        questionsAsked: safeNum(report.analysis?.conversationMetrics?.questionsAsked, 0),
        empathyStatements: safeNum(report.analysis?.conversationMetrics?.empathyStatements, 0),
        activeListeningIndicators: safeNum(report.analysis?.conversationMetrics?.activeListeningIndicators, 0),
      },
    },
  };

  const durationMins = Math.round(safeReport.durationSeconds / 60);
  const scoreColor = getScoreColor(safeReport.analysis.overallScore);
  const grade = getGrade(safeReport.analysis.overallScore);

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
          padding: 12mm;
          background: white;
        }

        .header {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: white;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 15px;
        }

        .header h1 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 5px;
        }

        .header p {
          color: #94a3b8;
          font-size: 12px;
        }

        .meta-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 15px;
        }

        .meta-item {
          background: #f8fafc;
          padding: 10px;
          border-radius: 8px;
          text-align: center;
        }

        .meta-label {
          font-size: 10px;
          color: #64748b;
          margin-bottom: 3px;
        }

        .meta-value {
          font-size: 13px;
          font-weight: 600;
          color: #1e293b;
        }

        .score-section {
          background: #f8fafc;
          border-radius: 10px;
          padding: 15px;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .score-label {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
        }

        .score-display {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .grade {
          font-size: 32px;
          font-weight: 700;
          color: ${scoreColor};
        }

        .score-circle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: ${scoreColor};
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 700;
        }

        .section-title {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .client-info {
          background: #f1f5f9;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 15px;
        }

        .client-name {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 5px;
        }

        .client-details {
          font-size: 11px;
          color: #64748b;
        }

        .skills-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 15px;
        }

        .skill-item {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 10px;
        }

        .skill-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .skill-label {
          font-size: 11px;
          color: #64748b;
        }

        .skill-score {
          font-size: 12px;
          font-weight: 600;
        }

        .progress-bar {
          height: 6px;
          background: #e2e8f0;
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: 3px;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-bottom: 15px;
        }

        .metric-item {
          background: #f8fafc;
          border-radius: 6px;
          padding: 10px;
          text-align: center;
        }

        .metric-value {
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
        }

        .metric-label {
          font-size: 10px;
          color: #64748b;
        }

        .feedback-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 15px;
        }

        .feedback-section {
          border-radius: 8px;
          padding: 12px;
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

        .feedback-list {
          list-style: none;
          padding: 0;
        }

        .feedback-list li {
          padding: 3px 0;
          font-size: 11px;
          display: flex;
          align-items: flex-start;
          gap: 6px;
        }

        .feedback-list li::before {
          content: "•";
          font-weight: bold;
        }

        .summary-section {
          background: #f8fafc;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 15px;
        }

        .summary-text {
          font-size: 12px;
          color: #475569;
          line-height: 1.7;
        }

        .conversation-section {
          background: #fafafa;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 15px;
          max-height: 300px;
          overflow-y: auto;
        }

        .turn {
          margin-bottom: 8px;
          padding: 8px;
          border-radius: 6px;
        }

        .turn-trainee {
          background: #3b82f6;
          color: white;
          margin-right: 20%;
        }

        .turn-client {
          background: #e5e7eb;
          color: #1e293b;
          margin-left: 20%;
        }

        .turn-speaker {
          font-size: 10px;
          font-weight: 600;
          margin-bottom: 3px;
          opacity: 0.8;
        }

        .turn-message {
          font-size: 11px;
          line-height: 1.5;
        }

        .footer {
          text-align: center;
          color: #94a3b8;
          font-size: 10px;
          padding-top: 15px;
          border-top: 1px solid #e2e8f0;
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="header">
          <h1>تقرير التدريب النصي</h1>
          <p>تقييم أداء المحادثة مع العميل</p>
        </div>

        <div class="meta-grid">
          <div class="meta-item">
            <div class="meta-label">التاريخ</div>
            <div class="meta-value">${formatDate(safeReport.startTime)}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">المدة</div>
            <div class="meta-value">${durationMins} دقيقة</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">السيناريو</div>
            <div class="meta-value">${scenarioLabels[safeReport.scenarioType] || safeReport.scenarioType}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">الصعوبة</div>
            <div class="meta-value">${difficultyLabels[safeReport.difficultyLevel] || safeReport.difficultyLevel}</div>
          </div>
        </div>

        <div class="client-info">
          <div class="client-name">👤 ${safeReport.clientPersona.name}</div>
          <div class="client-details">
            الشخصية: ${personalityLabels[safeReport.clientPersona.personality] || safeReport.clientPersona.personality} |
            الميزانية: ${safeReport.clientPersona.budget}
          </div>
        </div>

        <div class="score-section">
          <div class="score-label">النتيجة الإجمالية</div>
          <div class="score-display">
            <div class="grade">${grade}</div>
            <div class="score-circle">${safeReport.analysis.overallScore}%</div>
          </div>
        </div>

        <div class="section-title">📊 تحليل المهارات</div>
        <div class="skills-grid">
          ${Object.entries(safeReport.analysis.skillScores).map(([key, value]) => `
            <div class="skill-item">
              <div class="skill-header">
                <span class="skill-label">${skillLabels[key] || key}</span>
                <span class="skill-score" style="color: ${getScoreColor(value.score)}">${value.score}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${value.score}%; background: ${getScoreColor(value.score)}"></div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="section-title">📈 مؤشرات المحادثة</div>
        <div class="metrics-grid">
          <div class="metric-item">
            <div class="metric-value">${Math.round(safeReport.analysis.conversationMetrics.talkTimeRatio * 100)}%</div>
            <div class="metric-label">نسبة الكلام</div>
          </div>
          <div class="metric-item">
            <div class="metric-value">${safeReport.analysis.conversationMetrics.questionsAsked}</div>
            <div class="metric-label">الأسئلة المطروحة</div>
          </div>
          <div class="metric-item">
            <div class="metric-value">${safeReport.analysis.conversationMetrics.empathyStatements}</div>
            <div class="metric-label">عبارات التعاطف</div>
          </div>
          <div class="metric-item">
            <div class="metric-value">${safeReport.analysis.conversationMetrics.activeListeningIndicators}</div>
            <div class="metric-label">الاستماع الفعال</div>
          </div>
        </div>

        <div class="feedback-grid">
          <div class="feedback-section strengths">
            <div class="section-title">✓ نقاط القوة</div>
            <ul class="feedback-list">
              ${safeReport.analysis.highlights.slice(0, 4).map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>
          <div class="feedback-section weaknesses">
            <div class="section-title">✗ نقاط التحسين</div>
            <ul class="feedback-list">
              ${safeReport.analysis.improvementAreas.slice(0, 4).map(w => `<li>${w}</li>`).join('')}
            </ul>
          </div>
        </div>

        <div class="summary-section">
          <div class="section-title">📝 ملخص الأداء</div>
          <p class="summary-text">${safeReport.analysis.summary}</p>
        </div>

        ${safeReport.conversationTurns.length > 0 ? `
        <div class="section-title">💬 نص المحادثة (${safeReport.conversationTurns.length} رسالة)</div>
        <div class="conversation-section">
          ${safeReport.conversationTurns.slice(0, 10).map(turn => `
            <div class="turn turn-${turn.speaker}">
              <div class="turn-speaker">${turn.speaker === 'trainee' ? 'المتدرب' : 'العميل'}</div>
              <div class="turn-message">${turn.message}</div>
            </div>
          `).join('')}
          ${safeReport.conversationTurns.length > 10 ? `
            <div style="text-align: center; color: #64748b; font-size: 10px; padding: 8px;">
              ... و ${safeReport.conversationTurns.length - 10} رسالة إضافية
            </div>
          ` : ''}
        </div>
        ` : ''}

        <div class="footer">
          تم إنشاء التقرير بواسطة منصة عقاري برو | ${new Date().toLocaleDateString('ar-SA')}
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
    const filename = `text-report-${safeReport.sessionId.slice(0, 8)}-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);
  } finally {
    // Cleanup
    document.body.removeChild(container);
  }
}

export default generateTextReportPDF;
