export interface MatchResult {
  score: number;
  matched: string[];
  missing: string[];
}

const STOP_WORDS = new Set([
  'and', 'for', 'the', 'with', 'of', 'to', 'in', 'on', 'at', 'a', 'an', 'or', 'etc', 'you', 'will',
  'must', 'should', 'able', 'good', 'using', 'use', 'experience', 'knowledge', 'have', 'has', 'etc',
  'work', 'job', 'role', 'skills', 'skill', 'year', 'years', 'from', 'by', 'are', 'is', 'not', 'as',
  'we', 'our', 'your', 'their', 'they', 'it', 'that', 'this', 'be', 'been', 'being', 'was', 'were',
]);

export class MatchScorer {
  static tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9+#./\-\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 1 && !STOP_WORDS.has(w));
  }

  static score(profile: string, jd: string): MatchResult {
    const profileTokens = new Set(this.tokenize(profile));
    const jdTokens = [...new Set(this.tokenize(jd))];
    const matched = jdTokens.filter(t => profileTokens.has(t));
    const missing = jdTokens.filter(t => !profileTokens.has(t));
    const score = jdTokens.length === 0 ? 0 : Math.round((matched.length / jdTokens.length) * 100);
    return { score, matched, missing };
  }
}
