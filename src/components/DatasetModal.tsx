import React, { useState, useMemo } from 'react';
import { X, Database, RotateCcw, Copy, Download, Plus, Check, AlertCircle } from 'lucide-react';
import { parseDataset } from '../utils/parser';

interface DatasetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRawDataset: string;
  onReplaceDataset: (newText: string) => void;
  onAppendDataset: (extraText: string) => void;
  onResetToDefault: () => void;
}

export const DatasetModal: React.FC<DatasetModalProps> = ({
  isOpen,
  onClose,
  currentRawDataset,
  onReplaceDataset,
  onAppendDataset,
  onResetToDefault,
}) => {
  const [tab, setTab] = useState<'replace' | 'append'>('replace');
  const [text, setText] = useState(currentRawDataset);
  const [appendText, setAppendText] = useState('');
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync text if currentRawDataset changes when opening
  React.useEffect(() => {
    setText(currentRawDataset);
  }, [currentRawDataset, isOpen]);

  // Live preview parse stats
  const previewStats = useMemo(() => {
    const target = tab === 'replace' ? text : appendText;
    const parsed = parseDataset(target);
    let msgs = 0;
    const senders = new Set<string>();

    parsed.forEach((rec) => {
      msgs += rec.messages.length;
      rec.senderIds.forEach((s) => senders.add(s.toLowerCase()));
      rec.phoneNumbers.forEach((p) => senders.add(p));
    });

    return {
      appsCount: parsed.length,
      sendersCount: senders.size,
      messagesCount: msgs,
    };
  }, [tab, text, appendText]);

  if (!isOpen) return null;

  const handleSaveReplace = () => {
    onReplaceDataset(text);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  const handleSaveAppend = () => {
    if (!appendText.trim()) return;
    onAppendDataset(appendText);
    setAppendText('');
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sender-search-dataset-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-4xl bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                Dataset Management
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Replace or append text records. All data parses automatically.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-5 pt-4 pb-2 flex items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setTab('replace')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
                tab === 'replace'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Replace Entire Dataset
            </button>
            <button
              type="button"
              onClick={() => setTab('append')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
                tab === 'append'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Append New Records
            </button>
          </div>

          {/* Quick dataset actions */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
            <button
              type="button"
              onClick={onResetToDefault}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/50 bg-amber-50 dark:bg-amber-950/20 rounded-md transition-colors cursor-pointer"
              title="Reset dataset back to original default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3">
          {tab === 'replace' ? (
            <div className="space-y-2">
              <label htmlFor="replace-textarea" className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                Paste or edit full dataset text:
              </label>
              <textarea
                id="replace-textarea"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={14}
                className="w-full font-mono text-xs p-3.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white resize-y"
                placeholder="Paste numbered list or 'Sender → Message' lines..."
                spellCheck="false"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-xs text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800/40 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <p className="font-semibold text-neutral-900 dark:text-white mb-1">
                  Supported formats for appending:
                </p>
                <ul className="list-disc list-inside space-y-0.5 font-mono text-[11px] text-neutral-600 dark:text-neutral-300">
                  <li>277. NewApp (numbered service declaration)</li>
                  <li>447812345678 → Your NewApp verification code: [REDACTED]</li>
                  <li>Authmsg → ServiceName verification code: [REDACTED]</li>
                </ul>
              </div>
              <label htmlFor="append-textarea" className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                Paste additional records to append:
              </label>
              <textarea
                id="append-textarea"
                value={appendText}
                onChange={(e) => setAppendText(e.target.value)}
                rows={10}
                className="w-full font-mono text-xs p-3.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white resize-y"
                placeholder="Paste new entries here..."
                spellCheck="false"
              />
            </div>
          )}

          {/* Live Parsing Preview Banner */}
          <div className="flex items-center justify-between text-xs px-3.5 py-2.5 bg-neutral-100/70 dark:bg-neutral-800/60 rounded-lg text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
            <span className="font-medium flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-neutral-400" />
              Live Parser Detection:
            </span>
            <div className="flex items-center gap-4 font-mono tabular-nums">
              <span>{previewStats.appsCount} Apps</span>
              <span className="text-neutral-300 dark:text-neutral-600" aria-hidden="true">·</span>
              <span>{previewStats.sendersCount} Senders</span>
              <span className="text-neutral-300 dark:text-neutral-600" aria-hidden="true">·</span>
              <span>{previewStats.messagesCount} Messages</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white bg-neutral-200/70 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {tab === 'replace' ? (
            <button
              type="button"
              onClick={handleSaveReplace}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Apply & Replace Dataset</span>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSaveAppend}
              disabled={!appendText.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Appended!</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Append to Dataset</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
