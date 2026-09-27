import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, Search, MessageSquare, Phone, Tag, Copy, Check, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';
import { SearchMatchResult } from '../types';
import { HighlightText } from './HighlightText';

interface ResultCardProps {
  matchResult: SearchMatchResult;
  searchQuery: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({ matchResult, searchQuery }) => {
  const { record, matchType, matchLabel, matchedField, matchedValue, reason } = matchResult;
  const [expandedMessages, setExpandedMessages] = useState(false);
  const [expandedCountries, setExpandedCountries] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const hasMessages = record.messages.length > 0;
  const hasPhoneNumbers = record.phoneNumbers.length > 0;
  const hasSenderIds = record.senderIds.length > 0;
  const totalRelatedRecords = record.senderIds.length + record.phoneNumbers.length + record.messages.length + (record.sourceCount > 1 ? record.sourceCount - 1 : 0);

  const hasLinks = Boolean(
    record.links && (record.links.appLink || record.links.website || record.links.registration)
  );

  const hasCountryAvailability = Boolean(
    record.countryAvailability &&
    (record.countryAvailability.general || record.countryAvailability.app || record.countryAvailability.website)
  );

  const handleCopyMessage = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Determine badge styling based on matchType
  let badgeClasses = '';
  let badgeIcon = null;

  if (matchType === 'exact') {
    badgeClasses = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
    badgeIcon = <CheckCircle2 className="w-3.5 h-3.5" />;
  } else if (matchType === 'partial') {
    badgeClasses = 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/60';
    badgeIcon = <Search className="w-3.5 h-3.5" />;
  } else {
    badgeClasses = 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/70';
    badgeIcon = <AlertTriangle className="w-3.5 h-3.5" />;
  }

  // Display max 2 messages by default unless expanded
  const displayedMessages = expandedMessages ? record.messages : record.messages.slice(0, 2);

  return (
    <article className="group bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all space-y-4">
      {/* Top Header: App Name, Country Availability beside name, Match Badge, and Record Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-950 dark:text-white tracking-tight">
              <HighlightText text={record.name} query={searchQuery} />
            </h2>

            {/* Country Availability beside App Name */}
            {hasCountryAvailability && (
              <div className="flex items-center gap-2 flex-wrap">
                {record.countryAvailability?.general && (
                  <button
                    type="button"
                    onClick={() => setExpandedCountries(!expandedCountries)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                    title="Toggle country availability & domains"
                  >
                    <span>🌍</span>
                    <span>{record.countryAvailability.general.totalCount} Countries</span>
                    {record.countryAvailability.general.domains && record.countryAvailability.general.domains.length > 0 && (
                      expandedCountries ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />
                    )}
                  </button>
                )}

                {record.countryAvailability?.app && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">
                    <span>📱</span>
                    <span>App Availability — {record.countryAvailability.app.totalCount} Countries</span>
                  </span>
                )}

                {record.countryAvailability?.website && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">
                    <span>🌐</span>
                    <span>Website Availability — {record.countryAvailability.website.totalCount} Countries</span>
                  </span>
                )}
              </div>
            )}

            {/* Match Type Badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border ${badgeClasses}`}
            >
              {badgeIcon}
              <span>{matchLabel}</span>
            </span>
          </div>

          {/* Clean Unboxed Metadata: Related Records Count */}
          <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            <span>
              <strong className="font-mono tabular-nums text-neutral-700 dark:text-neutral-300 font-semibold">{totalRelatedRecords}</strong> related record{totalRelatedRecords === 1 ? '' : 's'}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <span className="font-mono tabular-nums">{record.messages.length}</span> message{record.messages.length === 1 ? '' : 's'}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <span className="font-mono tabular-nums">{record.senderIds.length + record.phoneNumbers.length}</span> sender{record.senderIds.length + record.phoneNumbers.length === 1 ? '' : 's'}
            </span>
            {record.sourceCount > 1 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-neutral-400 dark:text-neutral-500 font-mono">
                  x{record.sourceCount} entries
                </span>
              </>
            )}
          </div>
        </div>

        {/* If match is possible / uncertain, show safety disclaimer */}
        {matchType === 'possible' && (
          <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-950/30 px-2.5 py-1.5 rounded-md border border-amber-200/60 dark:border-amber-800/40 shrink-0">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span className="font-medium">Uncertain relationship — verify manually</span>
          </div>
        )}
      </div>

      {/* Expanded Country Domains Section */}
      {expandedCountries && record.countryAvailability?.general?.domains && record.countryAvailability.general.domains.length > 0 && (
        <div className="bg-neutral-50 dark:bg-neutral-800/50 p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-700/80 space-y-2 text-xs">
          <div className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span>Country Domains:</span>
            </span>
            <button
              type="button"
              onClick={() => setExpandedCountries(false)}
              className="text-[11px] text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 cursor-pointer underline"
            >
              Hide
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
            {record.countryAvailability.general.domains.map((cd, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-3 py-2 bg-white dark:bg-neutral-800 rounded-md border border-neutral-200 dark:border-neutral-700/60 shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  {cd.flag && <span className="text-base leading-none">{cd.flag}</span>}
                  <span className="font-medium text-neutral-800 dark:text-neutral-200">{cd.country}</span>
                </div>
                {cd.domain && (
                  <span className="text-neutral-600 dark:text-neutral-300 font-semibold">{cd.domain}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Maximum 3 Link Types: 🔗 App Link, 🌐 Website, 📝 Registration (ONLY if exact link exists in dataset) */}
      {hasLinks && (
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          {record.links?.appLink && (
            <a
              href={record.links.appLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg transition-colors border border-neutral-200 dark:border-neutral-700 cursor-pointer"
            >
              <span>🔗</span>
              <span>App Link</span>
            </a>
          )}
          {record.links?.website && (
            <a
              href={record.links.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg transition-colors border border-neutral-200 dark:border-neutral-700 cursor-pointer"
            >
              <span>🌐</span>
              <span>Website</span>
            </a>
          )}
          {record.links?.registration && (
            <a
              href={record.links.registration}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg transition-colors border border-neutral-200 dark:border-neutral-700 cursor-pointer"
            >
              <span>📝</span>
              <span>Registration</span>
            </a>
          )}
        </div>
      )}

      {/* Match Reason Banner if Query is Active */}
      {searchQuery && reason && (
        <div className="text-xs text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800/60 px-3 py-2 rounded-lg border border-neutral-100 dark:border-neutral-800 flex items-start gap-2">
          <span className="font-medium text-neutral-400 dark:text-neutral-500 shrink-0">Match Context:</span>
          <span>{reason}</span>
        </div>
      )}

      {/* Sender Information Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Matching Sender ID / Alias Section */}
        <div className="bg-neutral-50/70 dark:bg-neutral-800/40 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 space-y-1.5">
          <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 font-medium">
            <Tag className="w-3.5 h-3.5" />
            <span>
              {matchType === 'possible' && searchQuery.includes('X') ? 'Possible sender:' : 'Matching Sender ID / Alias:'}
            </span>
          </div>
          <div>
            {matchType === 'possible' && searchQuery.includes('X') ? (
              <div className="font-mono text-xs font-semibold text-amber-800 dark:text-amber-300">
                <HighlightText text={searchQuery} query={searchQuery} />
                <span className="ml-2 text-[11px] font-normal text-neutral-500 dark:text-neutral-400">
                  (matches stem against {record.name})
                </span>
              </div>
            ) : hasSenderIds ? (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {record.senderIds.map((s, idx) => (
                  <span
                    key={idx}
                    className="font-mono text-xs px-2 py-0.5 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 font-medium shadow-2xs"
                  >
                    <HighlightText text={s} query={searchQuery} />
                  </span>
                ))}
              </div>
            ) : record.aliases.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {record.aliases.map((a, idx) => (
                  <span
                    key={idx}
                    className="font-mono text-xs px-2 py-0.5 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 font-medium shadow-2xs"
                  >
                    <HighlightText text={a} query={searchQuery} />
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-neutral-400 dark:text-neutral-500 italic">None specified in record</span>
            )}
          </div>
        </div>

        {/* Related Sender Numbers Section */}
        <div className="bg-neutral-50/70 dark:bg-neutral-800/40 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 space-y-1.5">
          <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 font-medium">
            <Phone className="w-3.5 h-3.5" />
            <span>Related sender numbers:</span>
          </div>
          <div>
            {hasPhoneNumbers ? (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {record.phoneNumbers.map((p, idx) => (
                  <span
                    key={idx}
                    className="font-mono tabular-nums text-xs px-2 py-0.5 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 font-medium shadow-2xs"
                  >
                    <HighlightText text={p} query={searchQuery} />
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-neutral-400 dark:text-neutral-500 italic">No phone numbers recorded</span>
            )}
          </div>
        </div>
      </div>

      {/* Messages Section */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-neutral-700 dark:text-neutral-300">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Messages:</span>
          </div>
          {record.messages.length > 2 && (
            <button
              type="button"
              onClick={() => setExpandedMessages(!expandedMessages)}
              className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer font-medium"
            >
              {expandedMessages ? (
                <>
                  <span>Show less</span>
                  <ChevronUp className="w-3 h-3" />
                </>
              ) : (
                <>
                  <span>View all {record.messages.length} messages</span>
                  <ChevronDown className="w-3 h-3" />
                </>
              )}
            </button>
          )}
        </div>

        {hasMessages ? (
          <div className="space-y-2">
            {displayedMessages.map((msg) => {
              const isCopied = copiedMsgId === msg.id;
              return (
                <div
                  key={msg.id}
                  className="bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 text-xs text-neutral-800 dark:text-neutral-200 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                      <span className="font-medium">From:</span>
                      <span className="font-mono tabular-nums font-semibold text-neutral-700 dark:text-neutral-300">
                        <HighlightText text={msg.sender} query={searchQuery} />
                      </span>
                    </div>
                    <div className="font-mono leading-relaxed break-words text-neutral-900 dark:text-neutral-100">
                      <HighlightText text={msg.text} query={searchQuery} />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyMessage(msg.id, msg.text)}
                    className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors shrink-0 cursor-pointer"
                    title="Copy message text"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-neutral-50/50 dark:bg-neutral-800/30 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 text-xs text-neutral-400 dark:text-neutral-500 italic">
            No message available.
          </div>
        )}
      </div>
    </article>
  );
};
