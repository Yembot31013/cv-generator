/**
 * Resume & Cover Letter PDF generation.
 *
 * PDFs are drawn directly from structured CVData using jsPDF's vector text API
 * (no html2canvas / DOM capture). This guarantees:
 *  - Reliable downloads regardless of the on-screen template or CSS (e.g. Tailwind
 *    `oklch()` colors that break canvas-based rasterizers).
 *  - Selectable, ATS-friendly text and crisp output at any zoom.
 *  - Small file sizes and a controllable file name.
 *
 * Every text element is width-constrained (wrapped or fitted) so content can never
 * overflow the A4 page. The selected on-screen template maps to a matching PDF
 * theme (accent color + heading style) so the download reflects the chosen design.
 */

import { jsPDF } from 'jspdf';
import { CVData, PersonalInfo } from '@/types/cv';

interface Rgb {
  r: number;
  g: number;
  b: number;
}

const PT_TO_MM = 0.352778;

const COLORS = {
  ink: { r: 31, g: 41, b: 55 }, // slate-800
  muted: { r: 107, g: 114, b: 128 }, // gray-500
  faint: { r: 156, g: 163, b: 175 }, // gray-400 (separators)
  line: { r: 226, g: 232, b: 240 }, // slate-200 (rules)
} as const;

export type HeadingStyle = 'rule' | 'bar' | 'block';

export interface ResumeTheme {
  accent: Rgb;
  headingStyle: HeadingStyle;
  headerAccentBar: boolean;
}

/**
 * Map each on-screen template to a clean, professional PDF theme.
 * Keeps the download visually consistent with the selected design while staying
 * ATS-friendly (single column, real text).
 */
const RESUME_THEMES: Record<string, ResumeTheme> = {
  minimal: { accent: { r: 17, g: 24, b: 39 }, headingStyle: 'rule', headerAccentBar: false },
  glass: { accent: { r: 13, g: 148, b: 136 }, headingStyle: 'rule', headerAccentBar: false },
  cyber: { accent: { r: 79, g: 70, b: 229 }, headingStyle: 'block', headerAccentBar: true },
  neon: { accent: { r: 219, g: 39, b: 119 }, headingStyle: 'bar', headerAccentBar: true },
};

const DEFAULT_TEMPLATE = 'cyber';

export function getResumeTheme(templateId?: string): ResumeTheme {
  return RESUME_THEMES[templateId ?? ''] ?? RESUME_THEMES[DEFAULT_TEMPLATE];
}

export interface CoverLetterInfo {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
}

export interface CoverLetterJobInfo {
  company?: string;
  title?: string;
}

function sanitizeFileName(value: string): string {
  return (
    value
      .trim()
      .replace(/[^a-z0-9\-_ ]/gi, '')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '') || 'document'
  );
}

function normalizeUrl(value: string, kind: 'email' | 'phone' | 'web'): string {
  const trimmed = value.trim();
  if (kind === 'email') return `mailto:${trimmed}`;
  if (kind === 'phone') return `tel:${trimmed.replace(/[^\d+]/g, '')}`;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/+/, '')}`;
}

function displayUrl(value: string): string {
  return value
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/$/, '');
}

interface InlineSegment {
  label: string;
  url?: string;
  color: Rgb;
  bold?: boolean;
}

/**
 * Builds an A4 document and exposes a flowing cursor with automatic pagination.
 */
class PdfBuilder {
  private readonly doc: jsPDF;
  private readonly pageW: number;
  private readonly pageH: number;
  private readonly marginX = 16;
  private readonly marginTop = 18;
  private readonly marginBottom = 16;
  private readonly contentW: number;
  private readonly theme: ResumeTheme;
  private readonly accent: Rgb;
  private y: number;

  constructor(theme: ResumeTheme) {
    this.doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    this.pageW = this.doc.internal.pageSize.getWidth();
    this.pageH = this.doc.internal.pageSize.getHeight();
    this.contentW = this.pageW - this.marginX * 2;
    this.theme = theme;
    this.accent = theme.accent;
    this.y = this.marginTop;
  }

  private lineHeight(pt: number, factor = 1.15): number {
    return pt * PT_TO_MM * factor;
  }

  private setColor(c: Rgb): void {
    this.doc.setTextColor(c.r, c.g, c.b);
  }

  private ensureSpace(space: number): void {
    if (this.y + space > this.pageH - this.marginBottom) {
      this.doc.addPage();
      this.y = this.marginTop;
    }
  }

  private addGap(mm: number): void {
    this.y += mm;
  }

  /** Wrap text to a max width and write it line-by-line, paginating as needed. */
  private writeWrapped(
    text: string,
    options: {
      x?: number;
      maxWidth?: number;
      pt: number;
      color: Rgb;
      font?: 'normal' | 'bold' | 'italic';
      factor?: number;
    }
  ): void {
    const { pt, color, font = 'normal', factor = 1.4 } = options;
    const x = options.x ?? this.marginX;
    const maxWidth = options.maxWidth ?? this.contentW;

    this.doc.setFont('helvetica', font);
    this.doc.setFontSize(pt);
    this.setColor(color);

    const lines = this.doc.splitTextToSize(text, maxWidth) as string[];
    const lh = this.lineHeight(pt, factor);
    for (const line of lines) {
      this.ensureSpace(lh);
      this.doc.text(line, x, this.y);
      this.y += lh;
    }
  }

  private writeBullet(text: string): void {
    const bulletX = this.marginX + 1;
    const textX = this.marginX + 4.8;
    const maxWidth = this.contentW - 4.8;
    const pt = 9.3;
    const lh = this.lineHeight(pt, 1.35);

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(pt);
    const lines = this.doc.splitTextToSize(text, maxWidth) as string[];

    lines.forEach((line, index) => {
      this.ensureSpace(lh);
      if (index === 0) {
        this.setColor(this.accent);
        this.doc.text('\u2022', bulletX, this.y);
      }
      this.setColor(COLORS.ink);
      this.doc.text(line, textX, this.y);
      this.y += lh;
    });
  }

  /**
   * Render label/value segments left-to-right with separators, wrapping to new
   * lines when the row width is exceeded. Segments with a `url` become links.
   */
  private writeInline(
    segments: InlineSegment[],
    pt: number,
    opts: { startX?: number; separator?: string } = {}
  ): void {
    if (segments.length === 0) return;
    const separator = opts.separator ?? '   |   ';
    const startX = opts.startX ?? this.marginX;
    const right = this.marginX + this.contentW;
    const lh = this.lineHeight(pt, 1.4);

    this.doc.setFontSize(pt);
    let x = startX;
    this.ensureSpace(lh);

    segments.forEach((segment, index) => {
      this.doc.setFont('helvetica', segment.bold ? 'bold' : 'normal');
      const segWidth = this.doc.getTextWidth(segment.label);

      if (x > startX && x + segWidth > right) {
        this.y += lh;
        this.ensureSpace(lh);
        x = startX;
      }

      this.setColor(segment.color);
      if (segment.url) {
        this.doc.textWithLink(segment.label, x, this.y, { url: segment.url });
      } else {
        this.doc.text(segment.label, x, this.y);
      }
      x += segWidth;

      if (index < segments.length - 1) {
        this.doc.setFont('helvetica', 'normal');
        this.setColor(COLORS.faint);
        this.doc.text(separator, x, this.y);
        x += this.doc.getTextWidth(separator);
      }
    });

    this.y += lh;
  }

  /**
   * Entry header: a bold left title that wraps within the space remaining after
   * reserving room for right-aligned meta (dates / links). Prevents the overlap
   * and overflow that occurred when long titles ran into the dates.
   */
  private entryHeader(opts: {
    left: string;
    leftPt: number;
    leftColor: Rgb;
    leftFont?: 'bold' | 'normal';
    right?: InlineSegment[];
    rightPt?: number;
  }): void {
    const { left, leftPt, leftColor, leftFont = 'bold' } = opts;
    const right = opts.right ?? [];
    const rightPt = opts.rightPt ?? 9;
    const lh = this.lineHeight(leftPt, 1.25);

    // Measure the right-side meta block.
    this.doc.setFontSize(rightPt);
    const gap = this.doc.getTextWidth('  ');
    let rightWidth = 0;
    right.forEach((seg, i) => {
      this.doc.setFont('helvetica', seg.bold ? 'bold' : 'normal');
      rightWidth += this.doc.getTextWidth(seg.label);
      if (i < right.length - 1) rightWidth += gap;
    });

    const leftMaxW = Math.max(20, this.contentW - (rightWidth > 0 ? rightWidth + 5 : 0));

    this.doc.setFont('helvetica', leftFont);
    this.doc.setFontSize(leftPt);
    const lines = this.doc.splitTextToSize(left || '', leftMaxW) as string[];

    this.ensureSpace(lh * Math.max(lines.length, 1));
    const baseline = this.y;

    // Right-aligned meta on the first baseline.
    if (right.length) {
      this.doc.setFontSize(rightPt);
      let x = this.marginX + this.contentW;
      for (let i = right.length - 1; i >= 0; i--) {
        const seg = right[i];
        this.doc.setFont('helvetica', seg.bold ? 'bold' : 'normal');
        x -= this.doc.getTextWidth(seg.label);
        this.setColor(seg.color);
        if (seg.url) {
          this.doc.textWithLink(seg.label, x, baseline, { url: seg.url });
        } else {
          this.doc.text(seg.label, x, baseline);
        }
        if (i > 0) x -= gap;
      }
    }

    // Left title (wrapped).
    this.doc.setFont('helvetica', leftFont);
    this.doc.setFontSize(leftPt);
    this.setColor(leftColor);
    if (lines.length === 0) {
      this.y += lh;
    } else {
      lines.forEach((line) => {
        this.doc.text(line, this.marginX, this.y);
        this.y += lh;
      });
    }
  }

  private sectionHeading(title: string): void {
    const pt = 10.5;
    this.ensureSpace(this.lineHeight(pt) + 8);
    this.addGap(3.5);

    let textX = this.marginX;
    if (this.theme.headingStyle === 'block') {
      const sq = 2.6;
      this.doc.setFillColor(this.accent.r, this.accent.g, this.accent.b);
      this.doc.rect(this.marginX, this.y - sq, sq, sq, 'F');
      textX = this.marginX + sq + 2.4;
    }

    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(pt);
    this.setColor(this.theme.headingStyle === 'bar' ? COLORS.ink : this.accent);
    this.doc.text(title.toUpperCase(), textX, this.y, { charSpace: 0.5 });
    this.y += this.lineHeight(pt, 0.9);

    if (this.theme.headingStyle === 'bar') {
      this.doc.setDrawColor(this.accent.r, this.accent.g, this.accent.b);
      this.doc.setLineWidth(1.1);
      this.doc.line(this.marginX, this.y, this.marginX + 14, this.y);
    } else {
      this.doc.setDrawColor(COLORS.line.r, COLORS.line.g, COLORS.line.b);
      this.doc.setLineWidth(0.3);
      this.doc.line(this.marginX, this.y, this.marginX + this.contentW, this.y);
    }
    this.addGap(4);
  }

  private divider(): void {
    this.doc.setDrawColor(COLORS.line.r, COLORS.line.g, COLORS.line.b);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.marginX, this.y, this.marginX + this.contentW, this.y);
  }

  // ---- Header (shared by resume & cover letter) ------------------------------

  private renderNameBlock(fullName: string, title?: string): void {
    const barW = this.theme.headerAccentBar ? 1.8 : 0;
    const gap = barW ? 4 : 0;
    const x = this.marginX + barW + gap;
    const maxW = this.contentW - barW - gap;
    const startY = this.y + 1.5;

    const name = fullName.trim() || 'Your Name';
    let size = 22;
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(size);
    while (size > 15 && this.doc.getTextWidth(name) > maxW) {
      size -= 0.5;
      this.doc.setFontSize(size);
    }
    const nameLines = this.doc.splitTextToSize(name, maxW) as string[];
    const nameLh = this.lineHeight(size, 1.05);

    this.setColor(COLORS.ink);
    this.y += this.lineHeight(size, 0.75);
    nameLines.forEach((line) => {
      this.doc.text(line, x, this.y);
      this.y += nameLh;
    });

    if (title?.trim()) {
      this.addGap(0.5);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(11.5);
      this.setColor(this.accent);
      const titleLines = this.doc.splitTextToSize(title.trim(), maxW) as string[];
      const titleLh = this.lineHeight(11.5, 1.25);
      titleLines.forEach((line) => {
        this.doc.text(line, x, this.y);
        this.y += titleLh;
      });
    }

    if (barW) {
      const height = Math.max(this.y - startY - 1.5, 4);
      this.doc.setFillColor(this.accent.r, this.accent.g, this.accent.b);
      this.doc.rect(this.marginX, startY, barW, height, 'F');
    }
  }

  // ---- Resume ----------------------------------------------------------------

  private renderHeader(info: PersonalInfo): void {
    this.renderNameBlock(info.fullName || '', info.title);

    const segments: InlineSegment[] = [];
    if (info.email?.trim())
      segments.push({ label: info.email.trim(), url: normalizeUrl(info.email, 'email'), color: COLORS.muted });
    if (info.phone?.trim())
      segments.push({ label: info.phone.trim(), url: normalizeUrl(info.phone, 'phone'), color: COLORS.muted });
    if (info.location?.trim()) segments.push({ label: info.location.trim(), color: COLORS.muted });

    [info.website, info.linkedin, info.github, info.portfolio, info.twitter].forEach((value) => {
      if (value?.trim()) {
        segments.push({ label: displayUrl(value), url: normalizeUrl(value, 'web'), color: this.accent });
      }
    });

    this.addGap(2.5);
    this.writeInline(segments, 9);
    this.addGap(2.5);
    this.divider();
    this.addGap(3.5);
  }

  private renderExperience(cv: CVData): void {
    if (!cv.experience?.length) return;
    this.sectionHeading('Experience');

    cv.experience.forEach((exp, index) => {
      if (index > 0) this.addGap(2.5);
      const dates = [exp.startDate, exp.endDate].filter(Boolean).join('  \u2013  ');
      this.entryHeader({
        left: exp.position || '',
        leftPt: 10.5,
        leftColor: COLORS.ink,
        right: dates ? [{ label: dates, color: COLORS.muted }] : [],
        rightPt: 9,
      });

      const meta: InlineSegment[] = [];
      if (exp.company?.trim()) meta.push({ label: exp.company.trim(), color: this.accent, bold: true });
      if (exp.location?.trim()) meta.push({ label: exp.location.trim(), color: COLORS.muted });
      if (meta.length) this.writeInline(meta, 9.5, { separator: '   \u2022   ' });

      this.addGap(0.8);
      (exp.description || []).forEach((line) => line?.trim() && this.writeBullet(line.trim()));

      if (exp.technologies?.length) {
        this.addGap(0.6);
        this.writeWrapped(exp.technologies.join('   \u00b7   '), {
          pt: 8.5,
          color: COLORS.muted,
          font: 'italic',
          factor: 1.3,
        });
      }
    });
  }

  private renderProjects(cv: CVData): void {
    if (!cv.projects?.length) return;
    this.sectionHeading('Projects');

    cv.projects.forEach((project, index) => {
      if (index > 0) this.addGap(2.5);
      // Labels use only WinAnsi-safe characters (jsPDF's Helvetica lacks arrows).
      const links: InlineSegment[] = [];
      if (project.link?.trim())
        links.push({ label: 'Live \u203a', url: normalizeUrl(project.link, 'web'), color: this.accent });
      if (project.github?.trim())
        links.push({ label: 'Code \u203a', url: normalizeUrl(project.github, 'web'), color: this.accent });

      this.entryHeader({
        left: project.name || '',
        leftPt: 10.5,
        leftColor: COLORS.ink,
        right: links,
        rightPt: 8.5,
      });

      if (project.description?.trim()) {
        this.addGap(0.4);
        this.writeWrapped(project.description.trim(), { pt: 9.3, color: COLORS.muted, factor: 1.35 });
      }

      this.addGap(0.4);
      (project.highlights || []).forEach((line) => line?.trim() && this.writeBullet(line.trim()));

      if (project.technologies?.length) {
        this.addGap(0.6);
        this.writeWrapped(project.technologies.join('   \u00b7   '), {
          pt: 8.5,
          color: COLORS.muted,
          font: 'italic',
          factor: 1.3,
        });
      }
    });
  }

  private renderEducation(cv: CVData): void {
    if (!cv.education?.length) return;
    this.sectionHeading('Education');

    cv.education.forEach((edu, index) => {
      if (index > 0) this.addGap(2.5);
      const dates = [edu.startDate, edu.endDate].filter(Boolean).join('  \u2013  ');
      this.entryHeader({
        left: edu.degree || '',
        leftPt: 10.5,
        leftColor: COLORS.ink,
        right: dates ? [{ label: dates, color: COLORS.muted }] : [],
        rightPt: 9,
      });

      const meta: InlineSegment[] = [];
      if (edu.institution?.trim()) meta.push({ label: edu.institution.trim(), color: this.accent, bold: true });
      if (edu.field?.trim()) meta.push({ label: edu.field.trim(), color: COLORS.muted });
      if (meta.length) this.writeInline(meta, 9.5, { separator: '   \u2022   ' });

      if (edu.gpa?.trim()) {
        this.writeWrapped(`GPA: ${edu.gpa.trim()}`, { pt: 9, color: COLORS.muted, factor: 1.25 });
      }
      (edu.achievements || []).forEach((line) => line?.trim() && this.writeBullet(line.trim()));
    });
  }

  private renderSkills(cv: CVData): void {
    if (!cv.skills?.length) return;
    this.sectionHeading('Skills');

    cv.skills.forEach((group, index) => {
      if (!group.items?.length) return;
      if (index > 0) this.addGap(1.8);
      this.ensureSpace(this.lineHeight(9.3) * 2);

      if (group.category?.trim()) {
        this.writeWrapped(group.category.trim(), { pt: 9.3, color: COLORS.ink, font: 'bold', factor: 1.2 });
      }
      this.writeWrapped(group.items.join('   \u2022   '), { pt: 9.3, color: COLORS.muted, factor: 1.35 });
    });
  }

  private renderCertifications(cv: CVData): void {
    if (!cv.certifications?.length) return;
    this.sectionHeading('Certifications');

    cv.certifications.forEach((cert, index) => {
      if (index > 0) this.addGap(1.8);
      this.entryHeader({
        left: cert.name || '',
        leftPt: 9.7,
        leftColor: COLORS.ink,
        right: cert.date?.trim() ? [{ label: cert.date.trim(), color: COLORS.muted }] : [],
        rightPt: 9,
      });
      if (cert.issuer?.trim()) {
        this.writeWrapped(cert.issuer.trim(), { pt: 9, color: COLORS.muted, factor: 1.25 });
      }
    });
  }

  private renderLanguages(cv: CVData): void {
    if (!cv.languages?.length) return;
    this.sectionHeading('Languages');

    const value = cv.languages
      .filter((lang) => lang.name?.trim())
      .map((lang) => (lang.proficiency?.trim() ? `${lang.name} (${lang.proficiency})` : lang.name))
      .join('   \u2022   ');

    if (value) {
      this.writeWrapped(value, { pt: 9.3, color: COLORS.ink, factor: 1.35 });
    }
  }

  buildResume(cv: CVData): jsPDF {
    this.renderHeader(cv.personalInfo);

    if (cv.personalInfo.bio?.trim()) {
      this.sectionHeading('Summary');
      this.writeWrapped(cv.personalInfo.bio.trim(), { pt: 9.5, color: COLORS.ink, factor: 1.45 });
    }

    this.renderExperience(cv);
    this.renderProjects(cv);
    this.renderEducation(cv);
    this.renderSkills(cv);
    this.renderCertifications(cv);
    this.renderLanguages(cv);

    return this.doc;
  }

  // ---- Cover letter ----------------------------------------------------------

  buildCoverLetter(content: string, info?: CoverLetterInfo, job?: CoverLetterJobInfo): jsPDF {
    const fullName = info?.fullName?.trim() || '';
    this.renderNameBlock(fullName);

    const contact = [info?.email, info?.phone, info?.location]
      .map((v) => v?.trim())
      .filter(Boolean) as string[];
    if (contact.length) {
      const segments: InlineSegment[] = contact.map((label, index) => ({
        label,
        color: COLORS.muted,
        url: index === 0 && info?.email ? normalizeUrl(info.email, 'email') : undefined,
      }));
      this.addGap(2.5);
      this.writeInline(segments, 9);
    }

    this.addGap(2.5);
    this.divider();
    this.addGap(5);

    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    this.writeWrapped(today, { pt: 9.5, color: COLORS.muted, factor: 1.3 });
    this.addGap(3);

    if (job?.company?.trim()) {
      this.writeWrapped(job.company.trim(), { pt: 10, color: COLORS.ink, font: 'bold', factor: 1.3 });
      if (job.title?.trim()) {
        this.writeWrapped(`${job.title.trim()} Position`, { pt: 9.5, color: COLORS.muted, factor: 1.3 });
      }
      this.addGap(4);
    }

    const { salutation, body, closing } = parseCoverLetter(content);

    this.writeWrapped(salutation, { pt: 10, color: COLORS.ink, font: 'bold', factor: 1.4 });
    this.addGap(2);

    body.forEach((paragraph) => {
      this.writeWrapped(paragraph, { pt: 9.8, color: COLORS.ink, factor: 1.5 });
      this.addGap(2.5);
    });

    this.addGap(3);
    this.writeWrapped(closing, { pt: 9.8, color: COLORS.ink, factor: 1.4 });
    if (fullName) {
      this.addGap(2);
      this.writeWrapped(fullName, { pt: 10, color: COLORS.ink, font: 'bold', factor: 1.3 });
    }

    return this.doc;
  }
}

/**
 * Extract salutation / body paragraphs / closing from raw cover letter text.
 */
function parseCoverLetter(content: string): { salutation: string; body: string[]; closing: string } {
  let salutation = 'Dear Hiring Manager,';
  let closing = 'Sincerely,';
  let main = content.trim();

  const salutationMatch = main.match(/^(Dear\s+[^,\n]+(?:,|:))/i);
  if (salutationMatch) {
    salutation = salutationMatch[1];
    main = main.replace(salutationMatch[0], '').trim();
  }

  const closingMatch = main.match(/(Sincerely|Best regards|Regards|Yours sincerely|Yours truly)[,\s]*$/i);
  if (closingMatch) {
    closing = `${closingMatch[1]},`;
    main = main.replace(new RegExp(`${closingMatch[0]}.*$`, 'i'), '').trim();
  }

  const body = main
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, ' ').trim())
    .filter((p) => p.length > 0);

  return { salutation, body: body.length ? body : [main], closing };
}

/**
 * Generate a resume PDF document from structured CV data.
 */
export function generateResumePdf(cv: CVData, templateId?: string): jsPDF {
  return new PdfBuilder(getResumeTheme(templateId)).buildResume(cv);
}

/**
 * Generate and download a resume PDF.
 */
export function downloadResumePdf(cv: CVData, templateId?: string, fileName?: string): void {
  const doc = generateResumePdf(cv, templateId);
  const name = fileName ?? `${sanitizeFileName(cv.personalInfo.fullName || 'resume')}_Resume.pdf`;
  doc.save(name);
}

/**
 * Generate a cover letter PDF document.
 */
export function generateCoverLetterPdf(
  content: string,
  info?: CoverLetterInfo,
  job?: CoverLetterJobInfo,
  templateId?: string
): jsPDF {
  return new PdfBuilder(getResumeTheme(templateId)).buildCoverLetter(content, info, job);
}

/**
 * Generate and download a cover letter PDF.
 */
export function downloadCoverLetterPdf(
  content: string,
  info?: CoverLetterInfo,
  job?: CoverLetterJobInfo,
  templateId?: string,
  fileName?: string
): void {
  const doc = generateCoverLetterPdf(content, info, job, templateId);
  const name = fileName ?? `${sanitizeFileName(info?.fullName || 'cover_letter')}_Cover_Letter.pdf`;
  doc.save(name);
}
