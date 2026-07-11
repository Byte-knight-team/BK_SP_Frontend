export default function AppHeader({ title, subtitle, children }) {
  const dateText = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="flex items-center justify-between border-b border-gray-100 bg-white px-5 py-3">
      <div>
        <h1 className="text-lg font-bold text-gray-900">{title}</h1>

        {subtitle && (
          <p className="mt-0.5 text-[13px] text-gray-500">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4 text-[13px] text-gray-500">
        <div>{dateText}</div>
        {children}
      </div>
    </header>
  );
}