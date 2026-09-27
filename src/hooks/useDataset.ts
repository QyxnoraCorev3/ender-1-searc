import { useState, useEffect, useMemo, useCallback } from 'react';
import { AppRecord, AssociatedMessage } from '../types';
import { DEFAULT_RAW_DATASET } from '../data/defaultDataset';
import { parseDataset, isPhoneNumberOrShortcode, normalize } from '../utils/parser';

const STORAGE_KEY = 'sender_search_raw_dataset_v2';

export function useDataset() {
  // Load initial dataset from localStorage or fallback to default
  const [rawDataset, setRawDataset] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && stored.trim().length > 0) {
        return stored;
      }
    } catch {
      // Fallback
    }
    return DEFAULT_RAW_DATASET;
  });

  // Automatically parse records whenever rawDataset changes
  const records = useMemo(() => {
    return parseDataset(rawDataset);
  }, [rawDataset]);

  // Aggregate statistics
  const stats = useMemo(() => {
    let totalMessages = 0;
    const uniqueSenders = new Set<string>();
    const uniqueNumbers = new Set<string>();

    records.forEach((rec) => {
      totalMessages += rec.messages.length;
      rec.senderIds.forEach(s => uniqueSenders.add(s.toLowerCase()));
      rec.phoneNumbers.forEach(p => uniqueNumbers.add(p));
    });

    return {
      totalApps: records.length,
      totalSenderIds: uniqueSenders.size,
      totalPhoneNumbers: uniqueNumbers.size,
      totalMessages,
    };
  }, [records]);

  // Save to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, rawDataset);
    } catch (e) {
      console.warn('Unable to persist dataset to localStorage', e);
    }
  }, [rawDataset]);

  // Replace entire dataset
  const replaceDataset = useCallback((newRawText: string) => {
    setRawDataset(newRawText);
  }, []);

  // Append new text block
  const appendDataset = useCallback((additionalText: string) => {
    setRawDataset((prev) => {
      const trimmedPrev = prev.trim();
      const trimmedAdd = additionalText.trim();
      return `${trimmedPrev}\n\n${trimmedAdd}`;
    });
  }, []);

  // Reset to original default dataset
  const resetToDefault = useCallback(() => {
    setRawDataset(DEFAULT_RAW_DATASET);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  // Quick-add a single record without editing raw text directly
  const addSingleRecord = useCallback((
    appName: string,
    senderIdOrNumber?: string,
    messageText?: string,
    links?: { appLink?: string; website?: string; registration?: string },
    countryInfo?: string
  ) => {
    const cleanApp = appName.trim();
    if (!cleanApp) return;

    const parts: string[] = [];

    // App header line with optional country info
    if (countryInfo && countryInfo.trim()) {
      parts.push(`${cleanApp}                         ${countryInfo.trim()}`);
    } else {
      parts.push(cleanApp);
    }

    // Links (only if explicitly provided)
    if (links?.website?.trim()) {
      parts.push(`Website: ${links.website.trim()}`);
    }
    if (links?.appLink?.trim()) {
      parts.push(`App Link: ${links.appLink.trim()}`);
    }
    if (links?.registration?.trim()) {
      parts.push(`Registration: ${links.registration.trim()}`);
    }

    // Sender and Message
    const cleanSender = (senderIdOrNumber || '').trim();
    const cleanMsg = (messageText || '').trim();

    if (cleanSender && cleanMsg) {
      parts.push(`${cleanSender} → ${cleanMsg}`);
    } else if (cleanSender) {
      parts.push(`${cleanSender} → ${cleanApp} verification code: [REDACTED]`);
    }

    appendDataset(parts.join('\n'));
  }, [appendDataset]);

  return {
    rawDataset,
    records,
    stats,
    replaceDataset,
    appendDataset,
    resetToDefault,
    addSingleRecord,
  };
}
