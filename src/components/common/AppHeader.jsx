export default function AppHeader({ title, subtitle }) {
  const dateText = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="px-8 py-5 bg-white border-b border-gray-100 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>

      <div className="text-sm text-gray-500">{dateText}</div>
    </header>
  );
}
