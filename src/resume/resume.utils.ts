/**
 * Lightweight ATS resume scorer — a compact port of hroute_server's
 * atsScorer.ts adapted for koso. Scores a resume markdown string on 0–100
 * across the sections most important to ATS compatibility.
 */

export interface ResumeIssue {
  category: 'ats' | 'content' | 'format' | 'completeness';
  severity: 'high' | 'medium' | 'low';
  description: string;
}

export interface ResumeScore {
  score: number;
  summary: string;
  issues: ResumeIssue[];
  suggestions: string[];
}

const REQUIRED_HEADERS = ['summary', 'skills', 'experience', 'education'];

const XYZ_INDICATORS = [
  /accomplished/i,
  /achieved/i,
  /delivered/i,
  /resulted?\s+in/i,
  /leading\s+to/i,
  /contribut(ed|ing)\s+to/i,
  /by\s+(doing|using|leveraging|implementing)/i,
];

const QUANTIFICATION_PATTERNS = [
  /\d+%/,
  /\$[\d,]+/,
  /\d+\+?\s*(users?|customers?|clients?|accounts?|projects?|team\s+members?)/i,
  /\d+\s*(hours?|days?|weeks?|months?|years?)/i,
  /\d+\s*(times?|x)/i,
];

function hasHeader(text: string, name: string): boolean {
  const lower = text.toLowerCase();
  const header = new RegExp(`^#\\s+.*\\b${name}\\b`, 'im');
  return header.test(lower);
}

/** Deterministic scoring — operates on generated markdown resumes. */
export function scoreResume(resumeText: string): ResumeScore {
  const issues: ResumeIssue[] = [];
  const suggestions: string[] = [];
  let score = 0;

  const lower = resumeText.toLowerCase();

  // 1. Required sections (0–30)
  let sectionCount = 0;
  for (const header of REQUIRED_HEADERS) {
    if (hasHeader(resumeText, header)) {
      sectionCount++;
    }
  }
  score += sectionCount * 7;
  if (sectionCount < 4) {
    issues.push({
      category: 'completeness',
      severity: 'high',
      description: `Missing required section(s): ${REQUIRED_HEADERS.filter(
        (h) => !hasHeader(resumeText, h),
      ).join(', ')}`,
    });
  }

  // 2. XYZ / accomplishment format (0–20)
  const xyzMatchCount = XYZ_INDICATORS.filter((p) => p.test(resumeText)).length;
  score += Math.min(xyzMatchCount, 4) * 5;
  if (xyzMatchCount === 0) {
    issues.push({
      category: 'content',
      severity: 'medium',
      description: 'No Google XYZ format bullets detected (Accomplished X by doing Y resulting in Z)',
    });
    suggestions.push('Rewrite bullets in Google XYZ format: "Accomplished X by doing Y resulting in Z"');
  }

  // 3. Quantified achievements (0–20)
  const quantCount = QUANTIFICATION_PATTERNS.filter((p) => p.test(resumeText)).length;
  score += Math.min(quantCount, 4) * 5;
  if (quantCount === 0) {
    issues.push({
      category: 'content',
      severity: 'medium',
      description: 'No quantified achievements (metrics/percentages) found',
    });
    suggestions.push('Add specific metrics (e.g. "reduced load time by 40%")');
  }

  // 4. Contact info (0–15)
  const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(lower);
  const hasPhone = /\+?[\d\s()-]{10,}/.test(resumeText);
  const hasLinkedin = /linkedin\.com/.test(lower);
  let contact = 0;
  if (hasEmail) contact += 6;
  if (hasPhone) contact += 5;
  if (hasLinkedin) contact += 4;
  score += contact;
  if (!hasEmail) {
    issues.push({ category: 'completeness', severity: 'high', description: 'Missing email address' });
  }

  // 5. Formatting cleanliness (0–15)
  if (!/\|.*\|.*\|/.test(resumeText)) score += 5;
  if (!/```/.test(resumeText)) score += 5;
  const wordCount = resumeText.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 250 && wordCount <= 600) {
    score += 5;
  } else if (wordCount > 600) {
    issues.push({ category: 'format', severity: 'low', description: `Resume is long (${wordCount} words)` });
  }

  const finalScore = Math.max(0, Math.min(Math.round(score), 100));

  if (finalScore < 70) {
    suggestions.push('Ensure all section headings are standard (Summary, Skills, Experience, Education)');
    suggestions.push('Use action verbs and quantified achievements throughout');
  }

  return {
    score: finalScore,
    summary:
      finalScore >= 85
        ? 'Strong, ATS-friendly resume.'
        : finalScore >= 70
          ? 'Good resume with room for improvement in a few areas.'
          : 'Needs significant improvement to be ATS-competitive.',
    issues,
    suggestions: [...new Set(suggestions)],
  };
}
