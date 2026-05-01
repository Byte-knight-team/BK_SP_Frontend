export default function CustomerPageShell({
  children,
  className = '',
  contentClassName = '',
  maxWidth = 'max-w-6xl',
}) {
  return (
    <div
      className={`min-h-screen bg-white text-slate-900 ${className}`}
    >
      <div
        className={`mx-auto w-full ${maxWidth} px-4 py-6 sm:px-6 sm:py-8 ${contentClassName}`}
      >
        {children}
      </div>
    </div>
  );
}