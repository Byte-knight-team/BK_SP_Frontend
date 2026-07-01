export default function ComingSoonPage({ title }) {
  return (
    <div className="bg-white border border-gray-100 rounded-[1.5rem] p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="text-sm text-gray-500 mt-2">
        This page will be ready soon.
      </p>
    </div>
  );
}