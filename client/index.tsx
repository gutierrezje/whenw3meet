import { Link, Route, Router, Routes } from "lakebed/client";

export function App() {
  return (
    <Router>
      <main className="min-h-screen bg-black px-6 py-10 text-white">
        <section className="mx-auto max-w-2xl">
          <Routes>
            <Route path="/" element={<div className="text-center font-bold mt-12">whenw3meet Landing Page</div>} />
          </Routes>
        </section>
      </main>
    </Router>
  );
}
