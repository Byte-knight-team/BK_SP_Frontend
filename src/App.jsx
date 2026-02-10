export default function App() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-bold tracking-tight">React + Tailwind</h1>
        <p className="mt-2 text-slate-300">
          Starter defaults (dark background, readable text, full height).
        </p>
      </header>

      <main className="mx-auto max-w-4xl px-6 pb-16">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow">
          <p className="text-slate-200">
            Edit <span className="font-mono">src/App.jsx</span> and save.
          </p>

          <div className="mt-6 flex gap-3">
            <button className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500">
              Primary
            </button>
            <button className="rounded-lg border border-slate-700 px-4 py-2 font-semibold text-slate-100 hover:bg-slate-900">
              Secondary
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
