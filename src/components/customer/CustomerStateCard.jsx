import { AlertCircle, Loader2 } from 'lucide-react';

const VARIANT_STYLES = {
  loading: {
    wrapper: 'border-slate-200 bg-white shadow-[0_18px_42px_rgba(15,23,42,0.08)]',
    iconWrap: 'bg-orange-50 text-orange-500',
    title: 'Loading...',
    description: 'Please wait a moment while we prepare the content.',
    icon: Loader2,
    spin: true,
  },
  error: {
    wrapper: 'border-slate-200 bg-white shadow-[0_18px_42px_rgba(15,23,42,0.08)]',
    iconWrap: 'bg-rose-50 text-rose-600',
    title: 'Something went wrong',
    description: 'We could not load this section right now.',
    icon: AlertCircle,
    spin: false,
  },
  empty: {
    wrapper: 'border-slate-200 bg-white shadow-[0_18px_42px_rgba(15,23,42,0.08)]',
    iconWrap: 'bg-slate-100 text-slate-500',
    title: 'Nothing here yet',
    description: 'There is no content to show at the moment.',
    icon: AlertCircle,
    spin: false,
  },
};

export default function CustomerStateCard({
  variant = 'loading',
  icon: IconOverride,
  title,
  description,
  primaryAction,
  secondaryAction,
  className = '',
}) {
  const config = VARIANT_STYLES[variant] || VARIANT_STYLES.loading;
  const Icon = IconOverride || config.icon;

  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] border px-6 py-12 sm:px-10 ${config.wrapper} ${className}`}
    >
      <div className="relative flex flex-col items-center text-center">
        <div
          className={`mb-5 flex h-16 w-16 items-center justify-center rounded-[1.35rem] ${config.iconWrap}`}
        >
          <Icon size={32} className={config.spin ? 'animate-spin' : ''} />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 sm:text-[1.75rem]">
          {title || config.title}
        </h2>

        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-[0.95rem]">
          {description || config.description}
        </p>

        {(primaryAction || secondaryAction) && (
          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            {primaryAction && (
              <button
                type="button"
                onClick={primaryAction.onClick}
                className={`inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-bold text-white transition-all active:scale-[0.98] ${primaryAction.className || 'bg-orange-500 shadow-lg shadow-orange-500/20 hover:bg-orange-600'}`}
              >
                {primaryAction.label}
              </button>
            )}

            {secondaryAction && (
              <button
                type="button"
                onClick={secondaryAction.onClick}
                className={`inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-bold transition-all active:scale-[0.98] ${secondaryAction.className || 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
              >
                {secondaryAction.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}