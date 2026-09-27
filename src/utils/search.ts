import { AppRecord, SearchMatchResult, SearchFieldFilter, MatchTypeFilter, SortOption } from '../types';

/**
 * Computes Levenshtein edit distance between two strings
 */
export function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // deletion
        dp[i][j - 1] + 1,      // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return dp[m][n];
}

export interface MaskAnalysis {
  isMasked: boolean;
  stem: string;           // The unmasked portion, e.g. "Qcl" from "QclXXXX"
  maskPattern: string;    // e.g. "XXXX"
}

/**
 * Analyzes whether a query looks masked (e.g. QclXXXX, ideXXXX, CHAXXXX, 4478***)
 */
export function analyzeQueryMask(rawQuery: string): MaskAnalysis {
  const query = rawQuery.trim();
  // Check for trailing X's, x's, asterisks, question marks, hashes
  const trailingMaskMatch = query.match(/^([a-zA-Z0-9\+\.\-_]{2,})([xX\*\?#]{1,})$/);
  if (trailingMaskMatch) {
    return {
      isMasked: true,
      stem: trailingMaskMatch[1],
      maskPattern: trailingMaskMatch[2],
    };
  }

  // Check for embedded wildcards e.g. "Q*cloud"
  if (/[xX\*\?]{2,}/.test(query)) {
    const cleanStem = query.replace(/[xX\*\?#]+/g, '').trim();
    if (cleanStem.length >= 2) {
      return {
        isMasked: true,
        stem: cleanStem,
        maskPattern: query,
      };
    }
  }

  return {
    isMasked: false,
    stem: query,
    maskPattern: '',
  };
}

/**
 * Evaluates a single AppRecord against a search query.
 * Returns null if no match found.
 */
export function evaluateRecordMatch(
  record: AppRecord,
  rawQuery: string,
  fieldFilter: SearchFieldFilter = 'all'
): SearchMatchResult | null {
  const trimmed = rawQuery.trim();
  if (!trimmed) return null;

  const queryLower = trimmed.toLowerCase();
  const maskInfo = analyzeQueryMask(trimmed);
  const stemLower = maskInfo.stem.toLowerCase();

  // Helper checks based on fieldFilter
  const allowName = fieldFilter === 'all' || fieldFilter === 'name';
  const allowSender = fieldFilter === 'all' || fieldFilter === 'sender';
  const allowMessage = fieldFilter === 'all' || fieldFilter === 'message';

  // ==========================================
  // CASE 1: MASKED QUERY (e.g. QclXXXX, ideXXXX, CHAXXXX, VGSXXXX)
  // According to rules:
  // "If a masked/partial value resembles a stored name, show it as a possible match, not as a confirmed identity."
  // "Show: Possible Match — verify manually"
  // "When searching App/Website names, match ONLY from the beginning of the name."
  // ==========================================
  if (maskInfo.isMasked) {
    // 1. App Name starts with stem (PREFIX ONLY: e.g. "Qcloud" starts with "Qcl")
    if (allowName && record.normalizedName.startsWith(stemLower)) {
      const matchLength = maskInfo.stem.length;
      return {
        record,
        matchType: 'possible',
        matchLabel: 'Possible Match — verify manually',
        matchedField: 'name',
        matchedValue: record.name,
        matchedQueryPortion: record.name.slice(0, matchLength),
        score: 350,
        reason: `Query prefix "${maskInfo.stem}" matches start of service name "${record.name}". Identity is masked.`,
      };
    }

    // 2. Sender ID or Alias starts with stem
    if (allowSender) {
      for (const s of record.senderIds) {
        if (s.toLowerCase().startsWith(stemLower)) {
          return {
            record,
            matchType: 'possible',
            matchLabel: 'Possible Match — verify manually',
            matchedField: 'senderId',
            matchedValue: s,
            matchedQueryPortion: s.slice(0, maskInfo.stem.length),
            score: 330,
            reason: `Query prefix "${maskInfo.stem}" matches sender ID "${s}". Identity is masked.`,
          };
        }
      }

      for (const p of record.phoneNumbers) {
        if (p.toLowerCase().startsWith(stemLower)) {
          return {
            record,
            matchType: 'possible',
            matchLabel: 'Possible Match — verify manually',
            matchedField: 'phoneNumber',
            matchedValue: p,
            matchedQueryPortion: p.slice(0, maskInfo.stem.length),
            score: 320,
            reason: `Query prefix "${maskInfo.stem}" matches sender number "${p}".`,
          };
        }
      }

      for (const alias of record.aliases) {
        if (alias.toLowerCase().startsWith(stemLower)) {
          return {
            record,
            matchType: 'possible',
            matchLabel: 'Possible Match — verify manually',
            matchedField: 'alias',
            matchedValue: alias,
            matchedQueryPortion: alias.slice(0, maskInfo.stem.length),
            score: 310,
            reason: `Query prefix "${maskInfo.stem}" matches alias "${alias}".`,
          };
        }
      }
    }

    // 3. Sender ID or Alias contains stem (allowed for senders/aliases)
    if (allowSender) {
      for (const s of record.senderIds) {
        const sNorm = s.toLowerCase();
        if (sNorm.includes(stemLower)) {
          const idx = sNorm.indexOf(stemLower);
          return {
            record,
            matchType: 'possible',
            matchLabel: 'Possible Match — verify manually',
            matchedField: 'senderId',
            matchedValue: s,
            matchedQueryPortion: s.slice(idx, idx + stemLower.length),
            score: 240,
            reason: `Query prefix "${maskInfo.stem}" is contained in sender ID "${s}".`,
          };
        }
      }
    }

    // 4. Message contains stem (allowed for messages)
    if (allowMessage) {
      for (const msg of record.messages) {
        const msgNorm = msg.text.toLowerCase();
        if (msgNorm.includes(stemLower)) {
          const idx = msgNorm.indexOf(stemLower);
          return {
            record,
            matchType: 'possible',
            matchLabel: 'Possible Match — verify manually',
            matchedField: 'message',
            matchedValue: msg.text,
            matchedQueryPortion: msg.text.slice(idx, idx + stemLower.length),
            score: 200,
            reason: `Query prefix "${maskInfo.stem}" matches text in associated SMS message.`,
          };
        }
      }
    }

    // 5. Resemblance check for sender IDs (distance <= 1)
    if (stemLower.length >= 3 && allowSender) {
      for (const s of record.senderIds) {
        const sNorm = s.toLowerCase();
        const prefix = sNorm.slice(0, stemLower.length);
        if (prefix.length === stemLower.length && levenshteinDistance(stemLower, prefix) === 1) {
          return {
            record,
            matchType: 'possible',
            matchLabel: 'Possible Match — verify manually',
            matchedField: 'senderId',
            matchedValue: s,
            matchedQueryPortion: s.slice(0, prefix.length),
            score: 140,
            reason: `Masked query "${trimmed}" resembles sender ID "${s}" (1-char variation).`,
          };
        }
      }
    }

    // No match for this masked query
    return null;
  }

  // ==========================================
  // CASE 2: CLEAN / NON-MASKED QUERY
  // ==========================================

  // --- EXACT MATCHES (Score 900 - 1000) ---
  if (allowName && record.normalizedName === queryLower) {
    return {
      record,
      matchType: 'exact',
      matchLabel: 'Exact Match',
      matchedField: 'name',
      matchedValue: record.name,
      matchedQueryPortion: record.name,
      score: 1000,
      reason: `Matches app/service name exactly.`,
    };
  }

  if (allowSender) {
    for (const s of record.senderIds) {
      if (s.toLowerCase() === queryLower) {
        return {
          record,
          matchType: 'exact',
          matchLabel: 'Exact Match',
          matchedField: 'senderId',
          matchedValue: s,
          matchedQueryPortion: s,
          score: 950,
          reason: `Matches sender ID "${s}" exactly.`,
        };
      }
    }

    for (const p of record.phoneNumbers) {
      if (p.toLowerCase() === queryLower) {
        return {
          record,
          matchType: 'exact',
          matchLabel: 'Exact Match',
          matchedField: 'phoneNumber',
          matchedValue: p,
          matchedQueryPortion: p,
          score: 940,
          reason: `Matches phone number "${p}" exactly.`,
        };
      }
    }

    for (const a of record.aliases) {
      if (a.toLowerCase() === queryLower) {
        return {
          record,
          matchType: 'exact',
          matchLabel: 'Exact Match',
          matchedField: 'alias',
          matchedValue: a,
          matchedQueryPortion: a,
          score: 930,
          reason: `Matches alias "${a}" exactly.`,
        };
      }
    }
  }

  // --- PARTIAL MATCHES (Score 400 - 800) ---
  // PREFIX-ONLY for App/Website Name:
  // Starts with query in App Name (e.g. "F" -> "Facebook", "fac" -> "Facebook", "qcl" -> "Qcloud")
  // Do NOT match when query appears only in the middle or end of an App/Website name!
  if (allowName && record.normalizedName.startsWith(queryLower)) {
    return {
      record,
      matchType: 'partial',
      matchLabel: 'Partial Match',
      matchedField: 'name',
      matchedValue: record.name,
      matchedQueryPortion: record.name.slice(0, queryLower.length),
      score: 800,
      reason: `App name starts with "${trimmed}".`,
    };
  }

  // Starts with or contains query in Sender IDs (existing behavior preserved)
  if (allowSender) {
    for (const s of record.senderIds) {
      const sNorm = s.toLowerCase();
      if (sNorm.startsWith(queryLower)) {
        return {
          record,
          matchType: 'partial',
          matchLabel: 'Partial Match',
          matchedField: 'senderId',
          matchedValue: s,
          matchedQueryPortion: s.slice(0, queryLower.length),
          score: 600,
          reason: `Sender ID starts with "${trimmed}".`,
        };
      }
      if (sNorm.includes(queryLower)) {
        const idx = sNorm.indexOf(queryLower);
        return {
          record,
          matchType: 'partial',
          matchLabel: 'Partial Match',
          matchedField: 'senderId',
          matchedValue: s,
          matchedQueryPortion: s.slice(idx, idx + queryLower.length),
          score: 550,
          reason: `Sender ID contains "${trimmed}".`,
        };
      }
    }

    for (const p of record.phoneNumbers) {
      const pNorm = p.toLowerCase();
      if (pNorm.includes(queryLower)) {
        const idx = pNorm.indexOf(queryLower);
        return {
          record,
          matchType: 'partial',
          matchLabel: 'Partial Match',
          matchedField: 'phoneNumber',
          matchedValue: p,
          matchedQueryPortion: p.slice(idx, idx + queryLower.length),
          score: 530,
          reason: `Sender number contains "${trimmed}".`,
        };
      }
    }

    for (const a of record.aliases) {
      const aNorm = a.toLowerCase();
      if (aNorm.includes(queryLower)) {
        const idx = aNorm.indexOf(queryLower);
        return {
          record,
          matchType: 'partial',
          matchLabel: 'Partial Match',
          matchedField: 'alias',
          matchedValue: a,
          matchedQueryPortion: a.slice(idx, idx + queryLower.length),
          score: 520,
          reason: `Alias contains "${trimmed}".`,
        };
      }
    }
  }

  // Matches in message text (existing behavior preserved)
  if (allowMessage) {
    for (const msg of record.messages) {
      const msgNorm = msg.text.toLowerCase();
      if (msgNorm.includes(queryLower)) {
        const idx = msgNorm.indexOf(queryLower);
        return {
          record,
          matchType: 'partial',
          matchLabel: 'Partial Match',
          matchedField: 'message',
          matchedValue: msg.text,
          matchedQueryPortion: msg.text.slice(idx, idx + queryLower.length),
          score: 450,
          reason: `Associated SMS message contains "${trimmed}".`,
        };
      }
    }
  }

  return null;
}

/**
 * Searches and sorts all records
 */
export function searchRecords(
  records: AppRecord[],
  query: string,
  fieldFilter: SearchFieldFilter = 'all',
  matchFilter: MatchTypeFilter = 'all',
  sortOption: SortOption = 'relevance'
): SearchMatchResult[] {
  const trimmed = query.trim();

  // If no query, return all records as baseline view
  if (!trimmed) {
    let baseline: SearchMatchResult[] = records.map((record) => ({
      record,
      matchType: 'exact',
      matchLabel: 'Stored Record',
      matchedField: 'name',
      matchedValue: record.name,
      matchedQueryPortion: '',
      score: 100,
    }));

    // Apply sorting
    return sortResults(baseline, sortOption);
  }

  const results: SearchMatchResult[] = [];

  for (const record of records) {
    const match = evaluateRecordMatch(record, trimmed, fieldFilter);
    if (match) {
      if (matchFilter === 'all' || match.matchType === matchFilter) {
        results.push(match);
      }
    }
  }

  return sortResults(results, sortOption);
}

/**
 * Sorts search results according to user selection
 * Priority: Exact matches > Partial matches > Possible matches
 */
function sortResults(results: SearchMatchResult[], sortOption: SortOption): SearchMatchResult[] {
  return [...results].sort((a, b) => {
    if (sortOption === 'relevance') {
      // 1. Exact matches first, then partial, then possible
      const typeRank = { exact: 3, partial: 2, possible: 1 };
      const rankDiff = typeRank[b.matchType] - typeRank[a.matchType];
      if (rankDiff !== 0) return rankDiff;

      // 2. Score diff
      if (b.score !== a.score) return b.score - a.score;

      // 3. Alphabetical tie-breaker
      return a.record.name.localeCompare(b.record.name);
    }

    if (sortOption === 'alpha-asc') {
      return a.record.name.localeCompare(b.record.name);
    }

    if (sortOption === 'alpha-desc') {
      return b.record.name.localeCompare(a.record.name);
    }

    if (sortOption === 'records-desc') {
      const aCount = a.record.messages.length + a.record.senderIds.length + a.record.phoneNumbers.length;
      const bCount = b.record.messages.length + b.record.senderIds.length + b.record.phoneNumbers.length;
      if (bCount !== aCount) return bCount - aCount;
      return a.record.name.localeCompare(b.record.name);
    }

    return 0;
  });
}
