import { AppRecord, AssociatedMessage, CountryDomain, AvailabilityInfo, AppLinks } from '../types';

/**
 * Check if a string consists primarily of digits (phone number or shortcode)
 */
export function isPhoneNumberOrShortcode(str: string): boolean {
  const cleaned = str.trim().replace(/^[\+\s\-\(\)]+/, '');
  return /^\d{3,16}$/.test(cleaned);
}

/**
 * Clean and normalize text for case-insensitive matching
 */
export function normalize(str: string): string {
  return str.trim().toLowerCase();
}

/**
 * Extracts candidate app name from common OTP/SMS patterns if not already registered.
 * e.g. "DAtech verification code: [REDACTED]" -> "DAtech"
 * "Call.com verification code: [REDACTED]" -> "Call.com"
 * "Your Bilt Auth verification code" -> "Bilt"
 */
function extractAppNameFromMessage(messageText: string): string | null {
  const yourAppMatch = messageText.match(/^Your\s+([A-Za-z0-9\.\-\s]{2,24}?)\s+(?:Auth\s+)?verification/i);
  if (yourAppMatch && yourAppMatch[1]) {
    const candidate = yourAppMatch[1].trim();
    if (!['phone', 'new', 'security', 'account', 'one-time'].includes(candidate.toLowerCase())) {
      return candidate;
    }
  }

  const prefixMatch = messageText.match(/^([A-Za-z0-9\.\-\s]{2,28}?)\s+(?:verification|security|authentication|account|one-time|passcode|code|driver)/i);
  if (prefixMatch && prefixMatch[1]) {
    const candidate = prefixMatch[1].trim();
    if (!['your', 'the', 'my', 'sms', 'otp', 'code', 'security', 'registration'].includes(candidate.toLowerCase())) {
      return candidate;
    }
  }

  return null;
}

/**
 * Checks if a line specifies an App Link, Website, or Registration link
 */
function parseLinkLine(line: string): { type: keyof AppLinks; url: string } | null {
  const clean = line.trim();

  // App Link
  const appMatch = clean.match(/^(?:🔗\s*)?(?:App(?:\s*Link)?|Google Play(?:\s*Store)?|Play Store|App Store)\s*(?:[:=→\->]|—)\s*(https?:\/\/[^\s]+)/i);
  if (appMatch) return { type: 'appLink', url: appMatch[1].trim() };

  // Website
  const webMatch = clean.match(/^(?:🌐\s*)?(?:Website|Site|Web(?:\s*Link)?|URL)\s*(?:[:=→\->]|—)\s*(https?:\/\/[^\s]+)/i);
  if (webMatch) return { type: 'website', url: webMatch[1].trim() };

  // Registration
  const regMatch = clean.match(/^(?:📝\s*)?(?:Registration(?:\s*Link)?|Register|Signup(?:\s*Link)?)\s*(?:[:=→\->]|—)\s*(https?:\/\/[^\s]+)/i);
  if (regMatch) return { type: 'registration', url: regMatch[1].trim() };

  return null;
}

/**
 * Parses country domain line like: "🇧🇩 Bangladesh — example.bd" or "India — example.in"
 */
function parseCountryDomainLine(line: string): CountryDomain | null {
  const clean = line.trim();
  if (/^(?:Country Domains|Domains|Availability):?$/i.test(clean)) return null;

  // Split by delimiter: —, --, -, or :
  const delimMatch = clean.match(/^(.*?)\s*(?:—|--|-|:)\s*([a-zA-Z0-9._/:?=&-]+)$/);
  if (!delimMatch) return null;

  const leftPart = delimMatch[1].trim();
  const domainPart = delimMatch[2].trim();

  if (!domainPart || (!domainPart.includes('.') && !domainPart.includes('/'))) {
    return null;
  }

  // Extract flag (if any) and country from leftPart
  const flagMatch = leftPart.match(/^(\p{Extended_Pictographic}|\uD83C[\uDDE6-\uDDFF]{2}|[^\w\s])\s*(.*)$/u);
  let flag: string | undefined;
  let country: string = leftPart;

  if (flagMatch) {
    flag = flagMatch[1].trim();
    country = flagMatch[2].trim();
  }

  if (!country) return null;

  return {
    flag,
    country,
    domain: domainPart,
  };
}

/**
 * Main parser function:
 * Converts raw dataset string into structured AppRecords with consolidated senders, messages,
 * exact links (App Link, Website, Registration) and country availability info.
 */
export function parseDataset(rawText: string): AppRecord[] {
  if (!rawText || !rawText.trim()) {
    return [];
  }

  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const appsMap = new Map<string, AppRecord>();
  const arrowLines: { sender: string; message: string; raw: string }[] = [];

  let currentApp: AppRecord | null = null;

  // Pass 1: Parse numbered items, links, availability, or direct declarations
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for arrow format first: "Sender → Message"
    const arrowMatch = line.match(/^(.+?)\s*(?:→|->|=>)\s*(.+)$/);
    if (arrowMatch) {
      arrowLines.push({
        sender: arrowMatch[1].trim(),
        message: arrowMatch[2].trim(),
        raw: line,
      });
      continue;
    }

    // Check for link lines attached to currentApp
    const linkInfo = parseLinkLine(line);
    if (linkInfo && currentApp) {
      if (!currentApp.links) currentApp.links = {};
      currentApp.links[linkInfo.type] = linkInfo.url;
      continue;
    }

    // Check for App Availability (e.g. "📱 App Availability — 5 Countries")
    const appAvailMatch = line.match(/^(?:📱\s*)?App Availability\s*(?:—|-|:)\s*(\d+)\s*Countries/i);
    if (appAvailMatch && currentApp) {
      if (!currentApp.countryAvailability) currentApp.countryAvailability = {};
      currentApp.countryAvailability.app = {
        totalCount: parseInt(appAvailMatch[1], 10),
        label: 'App Availability',
        domains: [],
      };
      continue;
    }

    // Check for Website Availability (e.g. "🌐 Website Availability — 8 Countries")
    const webAvailMatch = line.match(/^(?:🌐\s*)?Website Availability\s*(?:—|-|:)\s*(\d+)\s*Countries/i);
    if (webAvailMatch && currentApp) {
      if (!currentApp.countryAvailability) currentApp.countryAvailability = {};
      currentApp.countryAvailability.website = {
        totalCount: parseInt(webAvailMatch[1], 10),
        label: 'Website Availability',
        domains: [],
      };
      continue;
    }

    // Check for General Country Availability (e.g. "🌍 5 Countries" or "5 Countries")
    const generalAvailMatch = line.match(/^(?:🌍\s*)?(?:(\d+)\s*Countries|Countries\s*(?:—|-|:)\s*(\d+))/i);
    if (generalAvailMatch && currentApp) {
      const count = parseInt(generalAvailMatch[1] || generalAvailMatch[2], 10);
      if (!currentApp.countryAvailability) currentApp.countryAvailability = {};
      currentApp.countryAvailability.general = {
        totalCount: count,
        label: 'Countries',
        domains: currentApp.countryAvailability.general?.domains || [],
      };
      continue;
    }

    // Check for Country Domain line (e.g. "🇧🇩 Bangladesh — example.bd")
    const countryDomain = parseCountryDomainLine(line);
    if (countryDomain && currentApp) {
      if (!currentApp.countryAvailability) currentApp.countryAvailability = {};
      if (!currentApp.countryAvailability.general) {
        currentApp.countryAvailability.general = {
          totalCount: 1,
          label: 'Countries',
          domains: [],
        };
      }
      currentApp.countryAvailability.general.domains = currentApp.countryAvailability.general.domains || [];
      currentApp.countryAvailability.general.domains.push(countryDomain);
      if (currentApp.countryAvailability.general.domains.length > currentApp.countryAvailability.general.totalCount) {
        currentApp.countryAvailability.general.totalCount = currentApp.countryAvailability.general.domains.length;
      }
      continue;
    }

    // Skip standalone headers like "Country Domains:"
    if (/^Country Domains:?$/i.test(line)) {
      continue;
    }

    // Check for numbered format: "1. Apple" or "113. 1win 🌍 5 Countries"
    const numberedMatch = line.match(/^(\d+)[\.\)]\s*(.+)$/);
    if (numberedMatch) {
      let rawRest = numberedMatch[2].trim();

      // Check if line contains country availability suffix, e.g. "1win    🌍 5 Countries"
      let inlineCountryCount: number | null = null;
      const inlineCountryMatch = rawRest.match(/^(.+?)\s+(?:🌍\s*)?(\d+)\s*Countries$/i);
      if (inlineCountryMatch) {
        rawRest = inlineCountryMatch[1].trim();
        inlineCountryCount = parseInt(inlineCountryMatch[2], 10);
      }

      const originalName = rawRest;
      const norm = normalize(originalName);

      if (appsMap.has(norm)) {
        currentApp = appsMap.get(norm)!;
        currentApp.sourceCount += 1;
        if (currentApp.name !== originalName && !currentApp.aliases.includes(originalName)) {
          currentApp.aliases.push(originalName);
        }
      } else {
        currentApp = {
          id: `app_${appsMap.size + 1}_${norm.replace(/[^a-z0-9]/g, '_')}`,
          name: originalName,
          normalizedName: norm,
          senderIds: [],
          phoneNumbers: [],
          aliases: [],
          messages: [],
          sourceCount: 1,
          firstSeenIndex: appsMap.size,
        };
        appsMap.set(norm, currentApp);
      }

      if (inlineCountryCount !== null && currentApp) {
        if (!currentApp.countryAvailability) currentApp.countryAvailability = {};
        currentApp.countryAvailability.general = {
          totalCount: inlineCountryCount,
          label: 'Countries',
          domains: [],
        };
      }
      continue;
    }

    // Standalone line without colons or arrows
    if (line.length > 1 && line.length < 60 && !line.includes(':') && !line.includes('→')) {
      let candidate = line;
      let inlineCountryCount: number | null = null;
      const inlineCountryMatch = candidate.match(/^(.+?)\s+(?:🌍\s*)?(\d+)\s*Countries$/i);
      if (inlineCountryMatch) {
        candidate = inlineCountryMatch[1].trim();
        inlineCountryCount = parseInt(inlineCountryMatch[2], 10);
      }

      const norm = normalize(candidate);
      if (appsMap.has(norm)) {
        currentApp = appsMap.get(norm)!;
        currentApp.sourceCount += 1;
      } else {
        currentApp = {
          id: `app_${appsMap.size + 1}_${norm.replace(/[^a-z0-9]/g, '_')}`,
          name: candidate,
          normalizedName: norm,
          senderIds: [],
          phoneNumbers: [],
          aliases: [],
          messages: [],
          sourceCount: 1,
          firstSeenIndex: appsMap.size,
        };
        appsMap.set(norm, currentApp);
      }

      if (inlineCountryCount !== null && currentApp) {
        if (!currentApp.countryAvailability) currentApp.countryAvailability = {};
        currentApp.countryAvailability.general = {
          totalCount: inlineCountryCount,
          label: 'Countries',
          domains: [],
        };
      }
    }
  }

  // Pass 2: Process all arrow lines (SMS message logs)
  let msgCounter = 1;
  arrowLines.forEach(({ sender, message, raw }) => {
    const senderNorm = normalize(sender);
    let matchedApp: AppRecord | null = null;

    // Check 1: Does sender name match an existing app exactly?
    if (appsMap.has(senderNorm)) {
      matchedApp = appsMap.get(senderNorm)!;
    }

    // Check 2: Find known apps mentioned in message text (longest name first)
    if (!matchedApp) {
      const sortedApps = Array.from(appsMap.values()).sort(
        (a, b) => b.name.length - a.name.length
      );

      for (const app of sortedApps) {
        const escaped = app.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escaped}\\b`, 'i');
        if (regex.test(message)) {
          matchedApp = app;
          break;
        }
      }
    }

    // Check 3: Check if sender starts with an existing app name
    if (!matchedApp) {
      for (const app of appsMap.values()) {
        if (app.name.length >= 3 && senderNorm.startsWith(app.normalizedName)) {
          matchedApp = app;
          break;
        }
      }
    }

    // Check 4: Extract candidate app name from message text
    if (!matchedApp) {
      const candidateName = extractAppNameFromMessage(message);
      if (candidateName) {
        const candNorm = normalize(candidateName);
        if (appsMap.has(candNorm)) {
          matchedApp = appsMap.get(candNorm)!;
        } else {
          matchedApp = {
            id: `app_${appsMap.size + 1}_${candNorm.replace(/[^a-z0-9]/g, '_')}`,
            name: candidateName,
            normalizedName: candNorm,
            senderIds: [],
            phoneNumbers: [],
            aliases: [],
            messages: [],
            sourceCount: 1,
            firstSeenIndex: appsMap.size,
          };
          appsMap.set(candNorm, matchedApp);
        }
      }
    }

    // Check 5: Standalone sender or number log
    if (!matchedApp) {
      const isNum = isPhoneNumberOrShortcode(sender);
      const appKey = senderNorm;
      if (appsMap.has(appKey)) {
        matchedApp = appsMap.get(appKey)!;
      } else {
        matchedApp = {
          id: `app_${appsMap.size + 1}_${senderNorm.replace(/[^a-z0-9]/g, '_')}`,
          name: isNum ? `Sender ${sender}` : sender,
          normalizedName: senderNorm,
          senderIds: isNum ? [] : [sender],
          phoneNumbers: isNum ? [sender] : [],
          aliases: [],
          messages: [],
          sourceCount: 1,
          firstSeenIndex: appsMap.size,
        };
        appsMap.set(appKey, matchedApp);
      }
    }

    if (matchedApp) {
      const newMessage: AssociatedMessage = {
        id: `msg_${msgCounter++}`,
        sender,
        text: message,
        rawLine: raw,
      };

      const alreadyHasMessage = matchedApp.messages.some(
        m => m.sender === sender && m.text === message
      );
      if (!alreadyHasMessage) {
        matchedApp.messages.push(newMessage);
      }

      const isNum = isPhoneNumberOrShortcode(sender);
      if (isNum) {
        if (!matchedApp.phoneNumbers.includes(sender)) {
          matchedApp.phoneNumbers.push(sender);
        }
      } else {
        if (!matchedApp.senderIds.includes(sender) && normalize(sender) !== matchedApp.normalizedName) {
          matchedApp.senderIds.push(sender);
        }
      }
    }
  });

  return Array.from(appsMap.values());
}
