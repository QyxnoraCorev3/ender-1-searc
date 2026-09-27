export type MatchType = 'exact' | 'partial' | 'possible';

export interface AssociatedMessage {
  id: string;
  sender: string;       // e.g. "447873077777", "Authmsg", "LNKDIN"
  text: string;         // e.g. "LinkedIn verification code: [REDACTED]"
  rawLine?: string;
  timestamp?: string;
}

export interface CountryDomain {
  country: string;
  flag?: string;
  domain?: string;
}

export interface AvailabilityInfo {
  totalCount: number;
  label?: string;
  domains?: CountryDomain[];
}

export interface AppLinks {
  appLink?: string;       // 🔗 App Link (Google Play Store or App Store or direct app link)
  website?: string;       // 🌐 Website
  registration?: string;  // 📝 Registration
}

export interface AppRecord {
  id: string;
  name: string;                   // Original display name preserved (e.g. "LinkedIn", "Qcloud")
  normalizedName: string;         // Lowercased for fast lookup
  senderIds: string[];            // Preserved alphanumeric sender IDs, e.g. ["Authmsg", "LNKDIN", "Verify"]
  phoneNumbers: string[];         // Numerical sender IDs / phone numbers, e.g. ["447873077777"]
  aliases: string[];              // Any extracted alternative names or aliases
  messages: AssociatedMessage[];  // Associated messages
  sourceCount: number;            // Count of occurrences in dataset
  firstSeenIndex: number;         // Original ordering index
  links?: AppLinks;
  countryAvailability?: {
    general?: AvailabilityInfo;   // e.g. 🌍 5 Countries
    app?: AvailabilityInfo;       // 📱 App Availability — X Countries
    website?: AvailabilityInfo;   // 🌐 Website Availability — X Countries
  };
}

export interface SearchMatchResult {
  record: AppRecord;
  matchType: MatchType;
  matchLabel: string;             // "Exact Match", "Partial Match", "Possible Match — verify manually"
  matchedField: 'name' | 'senderId' | 'phoneNumber' | 'alias' | 'message';
  matchedValue: string;
  matchedQueryPortion: string;    // Substring in the value that matched (for highlighting)
  score: number;
  reason?: string;
}

export type SearchFieldFilter = 'all' | 'name' | 'sender' | 'message';
export type MatchTypeFilter = 'all' | 'exact' | 'partial' | 'possible';
export type SortOption = 'relevance' | 'alpha-asc' | 'alpha-desc' | 'records-desc';
