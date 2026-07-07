import { Link, Route, Router, Routes } from "lakebed/client";

export function App() {
  return (
    <Router>
      <main className="min-h-screen bg-[#0a0a0c] text-white flex flex-col items-center justify-center p-6">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-widest uppercase">WHENW3MEET</h1>
          <p className="text-zinc-500 text-xs mt-1">A mobile-first when2meet clone</p>
        </header>
        <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 shadow-2xl max-w-[400px] w-full text-center">
          <p className="text-sm text-zinc-400">Step 0 Setup: Ready to build.</p>
        </div>
      </main>
    </Router>
  );
}
