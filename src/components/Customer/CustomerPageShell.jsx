import GlassBackground from './GlassBackground';

export default function CustomerPageShell({
  children,
  className = '',
  contentClassName = '',
  maxWidth = 'max-w-6xl',
  hasGlassBackground = false,
}) {
  return (
    <div
      className={`relative min-h-screen ${hasGlassBackground ? 'bg-[#f3f1ee] overflow-hidden' : 'bg-white'} text-slate-900 ${className}`}
    >
      {hasGlassBackground && <GlassBackground />}
      <div
        className={`relative z-10 mx-auto w-full ${maxWidth} px-4 py-6 sm:px-6 sm:py-8 ${contentClassName}`}
      >
        {children}
      </div>
    </div>
  );
}