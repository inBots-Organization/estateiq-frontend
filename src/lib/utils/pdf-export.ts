import jsPDF from 'jspdf';

// Dynamic import for html-to-image to avoid SSR issues
const getHtmlToImage = async () => {
  if (typeof window === 'undefined') {
    throw new Error('html-to-image can only be used on the client side');
  }
  return await import('html-to-image');
};

interface ExportOptions {
  filename?: string;
  title?: string;
  subtitle?: string;
  isRTL?: boolean;
}

interface ChatTranscriptData {
  sessionId: string;
  scenarioType: string;
  difficultyLevel: string;
  completedAt: Date;
  duration: number;
  score: number | null;
  grade: string | null;
  messages: {
    speaker: 'trainee' | 'client';
    message: string;
    timestamp: Date;
  }[];
}

/**
 * Export page content to PDF using html-to-image
 * This approach handles Arabic text properly
 */
export async function exportToPDF(
  elementId: string,
  options: ExportOptions = {}
): Promise<void> {
  const { filename = 'report.pdf', isRTL = false } = options;

  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  // Create a clone for PDF generation
  const clone = element.cloneNode(true) as HTMLElement;

  // Create a wrapper with proper styling for light mode
  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '0';
  wrapper.style.top = '0';
  wrapper.style.width = '900px';
  wrapper.style.background = 'white';
  wrapper.style.padding = '30px';
  wrapper.style.zIndex = '-9999';
  wrapper.style.direction = isRTL ? 'rtl' : 'ltr';
  wrapper.style.color = '#1e293b';

  // Remove dark mode classes and force light mode styling
  const removeDarkMode = (el: Element) => {
    if (el instanceof HTMLElement) {
      // Remove dark mode classes
      el.classList.remove('dark');

      // Force light backgrounds on cards
      if (el.classList.contains('card') || el.getAttribute('class')?.includes('bg-')) {
        el.style.backgroundColor = '#ffffff';
        el.style.borderColor = '#e2e8f0';
      }

      // Force dark text
      el.style.color = '#1e293b';
    }

    // Process children
    Array.from(el.children).forEach(child => removeDarkMode(child));
  };

  removeDarkMode(clone);

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  // Wait for fonts to load
  await document.fonts.ready;

  // Small delay to ensure rendering is complete
  await new Promise(resolve => setTimeout(resolve, 300));

  try {
    // Dynamically import html-to-image to avoid SSR issues
    const htmlToImage = await getHtmlToImage();

    // Use html-to-image which handles fonts better than html2canvas
    const dataUrl = await htmlToImage.toPng(wrapper, {
      quality: 1,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      style: {
        transform: 'scale(1)',
        transformOrigin: 'top left',
      },
      filter: (node) => {
        // Filter out certain elements that might cause issues
        if (node instanceof Element) {
          const tagName = node.tagName?.toLowerCase();
          // Skip script and style tags
          if (tagName === 'script' || tagName === 'noscript') {
            return false;
          }
        }
        return true;
      },
    });

    // Create PDF from the image
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;

    // Load the image to get dimensions
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = dataUrl;
    });

    const imgWidth = pageWidth - margin * 2;
    const imgHeight = (img.height * imgWidth) / img.width;
    const contentHeight = pageHeight - margin * 2;

    // Split into multiple pages if needed
    if (imgHeight > contentHeight) {
      let remainingHeight = img.height;
      let sourceY = 0;
      let currentPage = 0;
      const scaleFactor = imgWidth / img.width;

      while (remainingHeight > 0) {
        if (currentPage > 0) {
          pdf.addPage();
        }

        const sliceHeight = Math.min(remainingHeight, contentHeight / scaleFactor);

        // Create a canvas for this slice
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = img.width;
        sliceCanvas.height = sliceHeight;

        const ctx = sliceCanvas.getContext('2d')!;
        ctx.drawImage(
          img,
          0,
          sourceY,
          img.width,
          sliceHeight,
          0,
          0,
          img.width,
          sliceHeight
        );

        const sliceData = sliceCanvas.toDataURL('image/png');
        const sliceImgHeight = sliceHeight * scaleFactor;

        pdf.addImage(sliceData, 'PNG', margin, margin, imgWidth, sliceImgHeight);

        sourceY += sliceHeight;
        remainingHeight -= sliceHeight;
        currentPage++;
      }
    } else {
      pdf.addImage(dataUrl, 'PNG', margin, margin, imgWidth, imgHeight);
    }

    // Add footer with page numbers
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(9);
      pdf.setTextColor(148, 163, 184);
      pdf.text(
        `${i} / ${totalPages}`,
        pageWidth / 2,
        pageHeight - 5,
        { align: 'center' }
      );
    }

    pdf.save(filename);
  } finally {
    document.body.removeChild(wrapper);
  }
}

/**
 * Alternative: Use browser's native print to PDF
 * This gives the best Arabic text support
 */
export function printToPDF(elementId: string): void {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  // Create a new window with just the content
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Could not open print window. Please allow popups.');
  }

  // Get computed styles
  const getComputedStyles = () => {
    const styles: string[] = [];

    // Get all stylesheets
    Array.from(document.styleSheets).forEach(styleSheet => {
      try {
        Array.from(styleSheet.cssRules).forEach(rule => {
          styles.push(rule.cssText);
        });
      } catch {
        // External stylesheets might throw security errors
      }
    });

    return styles.join('\n');
  };

  const styles = getComputedStyles();

  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="${document.documentElement.dir || 'rtl'}" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>تقارير الأداء - Performance Report</title>
      <style>
        ${styles}

        /* Force light mode for printing */
        :root {
          color-scheme: light !important;
        }

        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        body {
          font-family: "Segoe UI", Arial, sans-serif;
          padding: 20px;
          direction: ${document.documentElement.dir || 'rtl'};
          background: white !important;
          color: #1e293b !important;
        }

        /* Force light backgrounds */
        .bg-card, .card, [class*="bg-"] {
          background-color: #f8fafc !important;
        }

        /* Force readable text colors */
        .text-foreground, .text-card-foreground, h1, h2, h3, h4, h5, h6, p, span, div {
          color: #1e293b !important;
        }

        .text-muted-foreground {
          color: #64748b !important;
        }

        /* Hide elements not needed in print */
        button, .no-print {
          display: none !important;
        }

        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          @page {
            margin: 15mm;
            size: A4;
          }
        }
      </style>
    </head>
    <body>
      ${element.innerHTML}
    </body>
    </html>
  `);

  printWindow.document.close();

  // Wait for content to load then print
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
    // Don't close immediately - let user complete the print dialog
    setTimeout(() => {
      printWindow.close();
    }, 1000);
  }, 500);
}

// Chat transcript PDF export - uses HTML rendering for proper Arabic support
export async function exportChatTranscriptToPDF(
  data: ChatTranscriptData,
  options: { filename?: string; isRTL?: boolean } = {}
): Promise<void> {
  const { filename = 'chat-transcript.pdf', isRTL = false } = options;

  // Create HTML content for the transcript
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '0';
  container.style.top = '0';
  container.style.width = '800px';
  container.style.background = 'white';
  container.style.padding = '40px';
  container.style.zIndex = '-9999';
  container.style.direction = isRTL ? 'rtl' : 'ltr';
  container.style.fontFamily = 'Segoe UI, Arial, sans-serif';
  container.style.color = '#1e293b';

  // Header
  const header = document.createElement('div');
  header.style.textAlign = 'center';
  header.style.marginBottom = '30px';
  header.innerHTML = `
    <h1 style="font-size: 24px; color: #1e293b; margin-bottom: 10px;">
      ${isRTL ? 'تقرير المحادثة' : 'Chat Transcript Report'}
    </h1>
    <p style="color: #64748b; font-size: 14px;">${isRTL ? 'تقرير أداء التدريب' : 'Training Performance Report'}</p>
  `;
  container.appendChild(header);

  // Session info
  const infoSection = document.createElement('div');
  infoSection.style.backgroundColor = '#f8fafc';
  infoSection.style.borderRadius = '12px';
  infoSection.style.padding = '20px';
  infoSection.style.marginBottom = '30px';
  infoSection.style.display = 'grid';
  infoSection.style.gridTemplateColumns = 'repeat(3, 1fr)';
  infoSection.style.gap = '15px';

  const infoItems = [
    { label: isRTL ? 'نوع السيناريو' : 'Scenario', value: data.scenarioType },
    { label: isRTL ? 'مستوى الصعوبة' : 'Difficulty', value: data.difficultyLevel },
    { label: isRTL ? 'المدة' : 'Duration', value: `${Math.round(data.duration / 60)} ${isRTL ? 'دقيقة' : 'min'}` },
    { label: isRTL ? 'التاريخ' : 'Date', value: new Date(data.completedAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US') },
    { label: isRTL ? 'النتيجة' : 'Score', value: data.score !== null ? `${data.score}/100` : '--' },
    { label: isRTL ? 'التقدير' : 'Grade', value: data.grade || '--' },
  ];

  infoItems.forEach(item => {
    const div = document.createElement('div');
    div.style.textAlign = 'center';
    div.innerHTML = `
      <p style="color: #64748b; font-size: 12px; margin-bottom: 4px;">${item.label}</p>
      <p style="color: #1e293b; font-size: 16px; font-weight: 600;">${item.value}</p>
    `;
    infoSection.appendChild(div);
  });
  container.appendChild(infoSection);

  // Messages section
  const messagesHeader = document.createElement('h2');
  messagesHeader.style.fontSize = '18px';
  messagesHeader.style.color = '#1e293b';
  messagesHeader.style.marginBottom = '20px';
  messagesHeader.style.paddingBottom = '10px';
  messagesHeader.style.borderBottom = '2px solid #e2e8f0';
  messagesHeader.textContent = isRTL ? 'نص المحادثة' : 'Conversation';
  container.appendChild(messagesHeader);

  // Messages
  const messagesContainer = document.createElement('div');
  messagesContainer.style.display = 'flex';
  messagesContainer.style.flexDirection = 'column';
  messagesContainer.style.gap = '16px';

  data.messages.forEach(msg => {
    const isTrainee = msg.speaker === 'trainee';
    const messageDiv = document.createElement('div');
    messageDiv.style.display = 'flex';
    messageDiv.style.flexDirection = isTrainee ? (isRTL ? 'row' : 'row-reverse') : (isRTL ? 'row-reverse' : 'row');
    messageDiv.style.gap = '12px';

    const avatar = document.createElement('div');
    avatar.style.width = '36px';
    avatar.style.height = '36px';
    avatar.style.borderRadius = '50%';
    avatar.style.backgroundColor = isTrainee ? '#dbeafe' : '#f3f4f6';
    avatar.style.display = 'flex';
    avatar.style.alignItems = 'center';
    avatar.style.justifyContent = 'center';
    avatar.style.fontSize = '14px';
    avatar.style.flexShrink = '0';
    avatar.textContent = isTrainee ? (isRTL ? 'أ' : 'Y') : (isRTL ? 'ع' : 'C');

    const content = document.createElement('div');
    content.style.maxWidth = '70%';

    const speakerLabel = document.createElement('p');
    speakerLabel.style.fontSize = '12px';
    speakerLabel.style.color = isTrainee ? '#2563eb' : '#4b5563';
    speakerLabel.style.marginBottom = '4px';
    speakerLabel.textContent = isTrainee
      ? (isRTL ? 'أنت (المتدرب)' : 'You (Trainee)')
      : (isRTL ? 'العميل (AI)' : 'Client (AI)');

    const bubble = document.createElement('div');
    bubble.style.backgroundColor = isTrainee ? '#3b82f6' : '#f3f4f6';
    bubble.style.color = isTrainee ? 'white' : '#1e293b';
    bubble.style.padding = '12px 16px';
    bubble.style.borderRadius = '16px';
    bubble.style.borderTopRightRadius = isTrainee && !isRTL ? '4px' : '16px';
    bubble.style.borderTopLeftRadius = !isTrainee && !isRTL ? '4px' : isTrainee && isRTL ? '4px' : '16px';
    bubble.style.fontSize = '14px';
    bubble.style.lineHeight = '1.5';
    bubble.style.whiteSpace = 'pre-wrap';
    bubble.textContent = msg.message;

    const timestamp = document.createElement('p');
    timestamp.style.fontSize = '11px';
    timestamp.style.color = '#94a3b8';
    timestamp.style.marginTop = '4px';
    timestamp.textContent = new Date(msg.timestamp).toLocaleTimeString(isRTL ? 'ar-SA' : 'en-US');

    content.appendChild(speakerLabel);
    content.appendChild(bubble);
    content.appendChild(timestamp);

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    messagesContainer.appendChild(messageDiv);
  });

  container.appendChild(messagesContainer);
  document.body.appendChild(container);

  // Wait for fonts to load
  await document.fonts.ready;
  await new Promise(resolve => setTimeout(resolve, 300));

  try {
    // Dynamically import html-to-image to avoid SSR issues
    const htmlToImage = await getHtmlToImage();

    // Use html-to-image for proper Arabic font rendering
    const dataUrl = await htmlToImage.toPng(container, {
      quality: 1,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
    });

    // Create PDF from the image
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;

    // Load the image to get dimensions
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = dataUrl;
    });

    const imgWidth = pageWidth - margin * 2;
    const imgHeight = (img.height * imgWidth) / img.width;
    const contentHeight = pageHeight - margin * 2;

    // Split into multiple pages if needed
    if (imgHeight > contentHeight) {
      let remainingHeight = img.height;
      let sourceY = 0;
      let currentPage = 0;
      const scaleFactor = imgWidth / img.width;

      while (remainingHeight > 0) {
        if (currentPage > 0) {
          pdf.addPage();
        }

        const sliceHeight = Math.min(remainingHeight, contentHeight / scaleFactor);

        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = img.width;
        sliceCanvas.height = sliceHeight;

        const ctx = sliceCanvas.getContext('2d')!;
        ctx.drawImage(
          img,
          0,
          sourceY,
          img.width,
          sliceHeight,
          0,
          0,
          img.width,
          sliceHeight
        );

        const sliceData = sliceCanvas.toDataURL('image/png');
        const sliceImgHeight = sliceHeight * scaleFactor;

        pdf.addImage(sliceData, 'PNG', margin, margin, imgWidth, sliceImgHeight);

        sourceY += sliceHeight;
        remainingHeight -= sliceHeight;
        currentPage++;
      }
    } else {
      pdf.addImage(dataUrl, 'PNG', margin, margin, imgWidth, imgHeight);
    }

    // Add footer with page numbers
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(9);
      pdf.setTextColor(148, 163, 184);
      pdf.text(
        `${i} / ${totalPages}`,
        pageWidth / 2,
        pageHeight - 5,
        { align: 'center' }
      );
    }

    pdf.save(filename);
  } finally {
    document.body.removeChild(container);
  }
}

export function downloadJSON(data: object, filename: string = 'data.json'): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export function downloadCSV(
  data: Record<string, unknown>[],
  filename: string = 'data.csv'
): void {
  if (data.length === 0) {
    throw new Error('No data to export');
  }

  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];

  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (
        stringValue.includes(',') ||
        stringValue.includes('\n') ||
        stringValue.includes('"')
      ) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    csvRows.push(values.join(','));
  }

  // Add BOM for proper UTF-8 encoding in Excel
  const BOM = '\uFEFF';
  const csv = BOM + csvRows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
