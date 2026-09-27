import React, { useState } from 'react';
import { X, Plus, Check } from 'lucide-react';

interface AddRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRecord: (
    appName: string,
    senderIdOrNumber?: string,
    messageText?: string,
    links?: { appLink?: string; website?: string; registration?: string },
    countryInfo?: string
  ) => void;
}

export const AddRecordModal: React.FC<AddRecordModalProps> = ({
  isOpen,
  onClose,
  onAddRecord,
}) => {
  const [appName, setAppName] = useState('');
  const [sender, setSender] = useState('');
  const [message, setMessage] = useState('');
  const [appLink, setAppLink] = useState('');
  const [website, setWebsite] = useState('');
  const [registration, setRegistration] = useState('');
  const [countryInfo, setCountryInfo] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName.trim()) return;

    onAddRecord(
      appName.trim(),
      sender.trim() || undefined,
      message.trim() || undefined,
      {
        appLink: appLink.trim() || undefined,
        website: website.trim() || undefined,
        registration: registration.trim() || undefined,
      },
      countryInfo.trim() || undefined
    );
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setAppName('');
      setSender('');
      setMessage('');
      setAppLink('');
      setWebsite('');
      setRegistration('');
      setCountryInfo('');
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              Add New Record
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Quickly register an app, sender ID, or SMS message log.
            </p>
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label htmlFor="app-name-input" className="block font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
              App / Service Name <span className="text-red-500">*</span>
            </label>
            <input
              id="app-name-input"
              type="text"
              required
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="e.g. Acme Services"
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
            />
          </div>

          <div>
            <label htmlFor="sender-input" className="block font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
              Sender ID or Phone Number <span className="text-neutral-400 font-normal">(optional)</span>
            </label>
            <input
              id="sender-input"
              type="text"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              placeholder="e.g. 447812345678 or ACMOTP"
              className="w-full px-3 py-2 font-mono bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
            />
          </div>

          <div>
            <label htmlFor="message-input" className="block font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
              SMS Message Text <span className="text-neutral-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="message-input"
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Acme verification code: [REDACTED]"
              className="w-full px-3 py-2 font-mono bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white resize-none"
            />
          </div>

          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
            <span className="font-semibold text-neutral-700 dark:text-neutral-300 block">
              Links & Country Availability <span className="text-neutral-400 font-normal">(optional)</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label htmlFor="website-input" className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-0.5">
                  🌐 Website Link
                </label>
                <input
                  id="website-input"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-2.5 py-1.5 font-mono text-[11px] bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label htmlFor="applink-input" className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-0.5">
                  🔗 App Link
                </label>
                <input
                  id="applink-input"
                  type="url"
                  value={appLink}
                  onChange={(e) => setAppLink(e.target.value)}
                  placeholder="https://play.google.com/..."
                  className="w-full px-2.5 py-1.5 font-mono text-[11px] bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label htmlFor="reglink-input" className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-0.5">
                  📝 Registration Link
                </label>
                <input
                  id="reglink-input"
                  type="url"
                  value={registration}
                  onChange={(e) => setRegistration(e.target.value)}
                  placeholder="https://.../register"
                  className="w-full px-2.5 py-1.5 font-mono text-[11px] bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                />
              </div>
            </div>

            <div>
              <label htmlFor="country-input" className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-0.5">
                🌍 Country Availability (e.g. &ldquo;🌍 5 Countries&rdquo;)
              </label>
              <input
                id="country-input"
                type="text"
                value={countryInfo}
                onChange={(e) => setCountryInfo(e.target.value)}
                placeholder="e.g. 🌍 5 Countries"
                className="w-full px-2.5 py-1.5 text-[11px] bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!appName.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-40"
            >
              {isSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Save Record</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
