/**
 * PDF Export Utility
 * Uses html2canvas and jsPDF for client-side PDF generation
 */

/**
 * Temporarily disable stylesheets that contain oklab colors
 * html2canvas parses all stylesheets synchronously, so we need to disable them
 */
function disableOklabStylesheets(): Array<{ sheet: CSSStyleSheet; disabled: boolean }> {
  const disabledSheets: Array<{ sheet: CSSStyleSheet; disabled: boolean }> = [];
  
  try {
    for (let i = 0; i < document.styleSheets.length; i++) {
      const sheet = document.styleSheets[i];
      try {
        // Check if stylesheet contains oklab
        let hasOklab = false;
        if (sheet.cssRules) {
          for (let j = 0; j < Math.min(sheet.cssRules.length, 100); j++) {
            // Sample first 100 rules to check for oklab
            const rule = sheet.cssRules[j];
            if (rule.cssText && /oklab|oklch/i.test(rule.cssText)) {
              hasOklab = true;
              break;
            }
          }
        }
        
        if (hasOklab) {
          // Disable the stylesheet by removing it from the DOM
          const linkElement = sheet.ownerNode as HTMLElement;
          const styleElement = sheet.ownerNode as HTMLStyleElement;
          
          if (linkElement && linkElement.parentNode) {
            linkElement.setAttribute('data-pdf-export-disabled', 'true');
            linkElement.setAttribute('media', 'none');
            disabledSheets.push({ sheet, disabled: true });
          }
        }
      } catch (e) {
        // Can't access this stylesheet (CORS, etc.)
      }
    }
  } catch (e) {
    // Ignore errors
  }
  
  return disabledSheets;
}

/**
 * Re-enable previously disabled stylesheets
 */
function enableOklabStylesheets(disabledSheets: Array<{ sheet: CSSStyleSheet; disabled: boolean }>): void {
  disabledSheets.forEach(({ sheet }) => {
    try {
      const linkElement = sheet.ownerNode as HTMLElement;
      if (linkElement && linkElement.hasAttribute('data-pdf-export-disabled')) {
        linkElement.removeAttribute('data-pdf-export-disabled');
        linkElement.removeAttribute('media');
      }
    } catch (e) {
      // Ignore errors
    }
  });
}

/**
 * Preprocess element to convert oklab() colors to RGB before html2canvas processes it
 * html2canvas parses CSS before onclone runs, so we need to preprocess the element
 */
function preprocessElementForPDF(element: HTMLElement): HTMLElement {
  // Deep clone the element
  const cloned = element.cloneNode(true) as HTMLElement;
  
  // Create a temporary container to compute styles
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.visibility = 'hidden';
  tempContainer.style.top = '-9999px';
  tempContainer.style.left = '-9999px';
  tempContainer.style.width = '1px';
  tempContainer.style.height = '1px';
  tempContainer.style.overflow = 'hidden';
  document.body.appendChild(tempContainer);
  
  // Append cloned element to compute styles
  tempContainer.appendChild(cloned);
  
  // Helper function to convert any color to RGB using browser's built-in conversion
  function convertColorToRGB(colorValue: string): string {
    if (!colorValue || colorValue === 'transparent' || colorValue === 'none') {
      return colorValue;
    }
    
    // Check if it's already RGB/RGBA/HEX
    if (/^(rgb|rgba|#)/i.test(colorValue.trim())) {
      return colorValue;
    }
    
    // Use browser's computed style to convert oklab() and other formats to RGB
    const testElement = document.createElement('div');
    testElement.style.color = colorValue;
    tempContainer.appendChild(testElement);
    const computedColor = window.getComputedStyle(testElement).color;
    tempContainer.removeChild(testElement);
    
    return computedColor || colorValue;
  }
  
  // Process all elements and convert colors to inline RGB styles
  function processElement(el: HTMLElement) {
    try {
      const computedStyle = window.getComputedStyle(el);
      const style = el.style;
      
      // List of CSS properties that can contain colors
      const colorProperties = [
        'color',
        'backgroundColor',
        'borderColor',
        'borderTopColor',
        'borderRightColor',
        'borderBottomColor',
        'borderLeftColor',
        'outlineColor',
        'textDecorationColor',
        'columnRuleColor',
        'fill',
        'stroke',
      ];
      
      colorProperties.forEach(prop => {
        try {
          const computedValue = computedStyle.getPropertyValue(prop);
          if (computedValue && computedValue.trim() && computedValue !== 'rgba(0, 0, 0, 0)') {
            const rgbValue = convertColorToRGB(computedValue);
            if (rgbValue && rgbValue.startsWith('rgb')) {
              // Apply as inline style to override stylesheet rules
              (style as any)[prop] = rgbValue;
            }
          }
        } catch (e) {
          // Ignore errors for individual properties
        }
      });
      
      // Handle background-image gradients with oklab
      try {
        const bgImage = computedStyle.backgroundImage;
        if (bgImage && bgImage !== 'none') {
          // Check if gradient contains oklab colors
          if (/oklab|oklch/i.test(bgImage)) {
            // Use background-color as fallback
            const bgColor = computedStyle.backgroundColor;
            if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
              const rgbBg = convertColorToRGB(bgColor);
              if (rgbBg && rgbBg.startsWith('rgb')) {
                style.backgroundColor = rgbBg;
                style.backgroundImage = 'none';
              }
            }
          }
        }
      } catch (e) {
        // Ignore errors
      }
      
      // Handle box-shadow with oklab colors
      try {
        const boxShadow = computedStyle.boxShadow;
        if (boxShadow && boxShadow !== 'none' && /oklab|oklch/i.test(boxShadow)) {
          // Convert shadow colors
          const rgbShadow = boxShadow.replace(/oklab\([^)]+\)|oklch\([^)]+\)/gi, (match) => {
            return convertColorToRGB(match);
          });
          if (rgbShadow !== boxShadow) {
            style.boxShadow = rgbShadow;
          }
        }
      } catch (e) {
        // Ignore errors
      }
      
      // Process children recursively
      Array.from(el.children).forEach(child => {
        processElement(child as HTMLElement);
      });
    } catch (e) {
      // Ignore errors for this element
    }
  }
  
  // Process the cloned element
  processElement(cloned);
  
  // Remove from temp container
  tempContainer.removeChild(cloned);
  document.body.removeChild(tempContainer);
  
  return cloned;
}

/**
 * Export CV to PDF
 * This captures the rendered CV template and converts it to PDF
 */
export async function exportToPDF(elementId: string, fileName: string = 'resume.pdf'): Promise<void> {
  // Dynamic import to avoid SSR issues
  const html2canvas = (await import('html2canvas')).default;
  const { jsPDF } = await import('jspdf');

  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('CV element not found');
    }

    // Show loading state
    const originalDisplay = element.style.display;
    element.style.display = 'block';

    // Temporarily disable stylesheets with oklab colors
    // html2canvas parses stylesheets synchronously, so we must disable them first
    const disabledSheets = disableOklabStylesheets();

    // Preprocess element to convert oklab() colors to RGB
    // This must happen BEFORE html2canvas parses CSS
    const processedElement = preprocessElementForPDF(element);
    
    // Temporarily add processed element to DOM for html2canvas
    processedElement.style.position = 'absolute';
    processedElement.style.left = '-9999px';
    processedElement.style.top = '0';
    processedElement.style.width = element.offsetWidth + 'px';
    processedElement.style.height = element.offsetHeight + 'px';
    document.body.appendChild(processedElement);

    try {
      // Capture the processed element as canvas
      // Use onclone to further process the cloned document
      const canvas = await html2canvas(processedElement, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc, element) => {
          // Additional processing in cloned document
          // Convert any remaining oklab colors
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            const computedStyle = window.getComputedStyle(htmlEl);
            const style = htmlEl.style;
            
            // Force RGB conversion for all color properties
            ['color', 'backgroundColor', 'borderColor'].forEach(prop => {
              try {
                const value = computedStyle.getPropertyValue(prop);
                if (value && !value.startsWith('rgb') && value !== 'transparent' && value !== 'rgba(0, 0, 0, 0)') {
                  // Use a test element to convert color
                  const testEl = clonedDoc.createElement('div');
                  testEl.style.color = value;
                  clonedDoc.body.appendChild(testEl);
                  const rgbValue = window.getComputedStyle(testEl).color;
                  clonedDoc.body.removeChild(testEl);
                  if (rgbValue && rgbValue.startsWith('rgb')) {
                    (style as any)[prop] = rgbValue;
                  }
                }
              } catch (e) {
                // Ignore errors
              }
            });
          });
        },
      });

      // Clean up processed element
      document.body.removeChild(processedElement);
      
      // Re-enable disabled stylesheets
      enableOklabStylesheets(disabledSheets);

      // Restore original display
      element.style.display = originalDisplay;

      // Calculate PDF dimensions
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Create PDF
    const pdf = new jsPDF({
      orientation: imgHeight > imgWidth ? 'portrait' : 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Add image to PDF
    const imgData = canvas.toDataURL('image/png');

    let position = 0;
    const pageHeight = 297; // A4 height in mm

    if (imgHeight <= pageHeight) {
      // Single page
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    } else {
      // Multiple pages
      let heightLeft = imgHeight;

      while (heightLeft > 0) {
        if (position !== 0) {
          pdf.addPage();
        }

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        position -= pageHeight;
      }
    }

      // Save PDF
      pdf.save(fileName);
    } catch (cleanupError) {
      // Clean up on error
      try {
        document.body.removeChild(processedElement);
      } catch (e) {
        // Ignore cleanup errors
      }
      try {
        enableOklabStylesheets(disabledSheets);
      } catch (e) {
        // Ignore cleanup errors
      }
      element.style.display = originalDisplay;
      throw cleanupError;
    }
  } catch (error) {
    console.error('PDF Export Error:', error);
    throw new Error('Failed to export PDF. Please try again.');
  }
}

/**
 * Export multiple page CV to PDF with proper page breaks
 */
export async function exportMultiPageToPDF(
  elementId: string,
  fileName: string = 'resume.pdf'
): Promise<void> {
  const html2canvas = (await import('html2canvas')).default;
  const { jsPDF } = await import('jspdf');

  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('CV element not found');
    }

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm

    // Find all page elements (if CV is split into pages)
    const pages = element.querySelectorAll('.cv-page');

    if (pages.length > 0) {
      // Temporarily disable stylesheets with oklab colors
      const disabledSheets = disableOklabStylesheets();
      
      try {
        // Multi-page CV
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i] as HTMLElement;
          
          // Preprocess page to convert oklab() colors to RGB
          const processedPage = preprocessElementForPDF(page);
          
          // Temporarily add processed page to DOM for html2canvas
          processedPage.style.position = 'absolute';
          processedPage.style.left = '-9999px';
          processedPage.style.top = '0';
          processedPage.style.width = page.offsetWidth + 'px';
          processedPage.style.height = page.offsetHeight + 'px';
          document.body.appendChild(processedPage);

          const canvas = await html2canvas(processedPage, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
          });
          
          // Clean up processed page
          document.body.removeChild(processedPage);

        const imgData = canvas.toDataURL('image/png');
        const imgHeight = (canvas.height * pageWidth) / canvas.width;

        if (i > 0) {
          pdf.addPage();
        }

          pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, imgHeight);
        }
        
        // Re-enable disabled stylesheets
        enableOklabStylesheets(disabledSheets);
        
        pdf.save(fileName);
      } catch (error) {
        // Re-enable disabled stylesheets on error
        enableOklabStylesheets(disabledSheets);
        throw error;
      }
    } else {
      // Single page CV - use standard export
      return exportToPDF(elementId, fileName);
    }
  } catch (error) {
    console.error('Multi-page PDF Export Error:', error);
    throw new Error('Failed to export PDF. Please try again.');
  }
}

/**
 * Print CV directly (alternative to PDF download)
 */
export function printCV(elementId: string): void {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('CV element not found');
  }

  // Create print-friendly version
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Could not open print window. Please allow popups.');
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Resume</title>
        <style>
          @page {
            size: A4;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
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

  // Wait for content to load, then print
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
}

/**
 * Download CV as HTML file
 */
export function downloadAsHTML(elementId: string, fileName: string = 'resume.html'): void {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('CV element not found');
  }

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resume</title>
  <style>
    ${getInlineStyles()}
  </style>
</head>
<body>
  ${element.innerHTML}
</body>
</html>
  `.trim();

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Get inline styles for HTML export
 */
function getInlineStyles(): string {
  // Extract relevant styles from document
  const styles: string[] = [];

  for (let i = 0; i < document.styleSheets.length; i++) {
    try {
      const sheet = document.styleSheets[i];
      if (sheet.cssRules) {
        for (let j = 0; j < sheet.cssRules.length; j++) {
          styles.push(sheet.cssRules[j].cssText);
        }
      }
    } catch (e) {
      // Skip external stylesheets due to CORS
      console.warn('Could not access stylesheet:', e);
    }
  }

  return styles.join('\n');
}
