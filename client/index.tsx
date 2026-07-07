import { Link, Route, Router, Routes, useMutation, useQuery, useParams, useNavigate } from "lakebed/client";
import { useState } from "preact/hooks";

export type Event = {
  id: string;
  name: string;
  dates: string; // JSON string of YYYY-MM-DD array
  startTime: string;
  endTime: string;
  createdAt: string;
};

function CreateEventPage() {
  const createEvent = useMutation<[name: string, dates: string, startTime: string, endTime: string], string>("createEvent");
  const navigate = useNavigate();

  const [eventName, setEventName] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Generate next 7 days dynamically starting from today
  const today = new Date();
  const datesList = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return {
      label: daysOfWeek[d.getDay()],
      num: d.getDate(),
      dateStr: `${yyyy}-${mm}-${dd}`,
      monthLabel: d.toLocaleString("default", { month: "long", year: "numeric" }),
    };
  });

  const [selectedDates, setSelectedDates] = useState<string[]>([datesList[0].dateStr]);
  const startMonth = datesList[0].monthLabel;
  const endMonth = datesList[datesList.length - 1].monthLabel;
  const activeMonthLabel = startMonth === endMonth ? startMonth : `${startMonth} - ${endMonth}`;

  function toggleDate(dateStr: string) {
    setSelectedDates((prev) =>
      prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr]
    );
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!eventName.trim()) {
      setError("Please enter an event name");
      return;
    }
    if (selectedDates.length === 0) {
      setError("Please select at least one date");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const eventId = await createEvent(eventName, JSON.stringify(selectedDates), startTime, endTime);
      navigate("/" + eventId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-[400px] bg-[#121214] border border-zinc-800 rounded-2xl p-6 shadow-2xl">
        <h1 className="text-2xl font-bold text-center text-zinc-100 mt-2 mb-1">Create an event</h1>
        <p className="text-xs text-zinc-400 text-center mb-6">Set the details and pick some times for your group to choose from.</p>
        
        {error && (
          <div 
            role="alert" 
            aria-live="assertive" 
            className="bg-red-950/50 border border-red-900 text-red-200 text-xs px-3 py-2 rounded-xl text-center mb-4"
          >
            {error}
          </div>
        )}

        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-5">
          <div>
            <label htmlFor="event-name" className="block text-[10px] uppercase tracking-wider font-semibold text-zinc-500 mb-1.5">Event Name</label>
            <input 
              id="event-name"
              type="text" 
              placeholder="Team Sync, Game Night..." 
              value={eventName}
              onInput={(e) => setEventName((e.target as HTMLInputElement).value)}
              className="w-full bg-[#18181c] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
              required 
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="block text-[10px] uppercase tracking-wider font-semibold text-zinc-500">Select Dates</span>
              <span className="text-[10px] uppercase font-bold text-indigo-400">{activeMonthLabel}</span>
            </div>
            <div className="flex justify-between gap-1">
              {datesList.map((item) => {
                const isSelected = selectedDates.includes(item.dateStr);
                return (
                  <button
                    type="button"
                    key={item.dateStr}
                    onClick={() => toggleDate(item.dateStr)}
                    className={`flex flex-col items-center justify-center flex-1 py-2 rounded-xl transition-all ${
                      isSelected 
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" 
                        : "bg-[#18181c] text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <span className="text-[9px] uppercase tracking-wider font-medium opacity-60 mb-0.5">{item.label}</span>
                    <span className="text-sm font-bold">{item.num}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="start-time" className="block text-[10px] uppercase tracking-wider font-semibold text-zinc-500 mb-1.5">Start Time</label>
              <select 
                id="start-time"
                value={startTime}
                onChange={(e) => setStartTime((e.target as HTMLSelectElement).value)}
                className="w-full bg-[#18181c] border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500"
              >
                {["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label htmlFor="end-time" className="block text-[10px] uppercase tracking-wider font-semibold text-zinc-500 mb-1.5">End Time</label>
              <select 
                id="end-time"
                value={endTime}
                onChange={(e) => setEndTime((e.target as HTMLSelectElement).value)}
                className="w-full bg-[#18181c] border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500"
              >
                {["16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 mt-2 transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Creating..." : "Create Event"} <span className="text-base">→</span>
          </button>
        </form>
      </div>
      <p className="text-[11px] text-zinc-600 mt-6">Create a poll and share the link with your group. No account required.</p>
    </div>
  );
}

function EventPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const events = useQuery<Event[] | undefined>("events");

  if (events === undefined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-zinc-500 text-sm">Loading event details...</p>
      </div>
    );
  }

  const event = events.find((e) => e.id === eventId);

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <p className="text-red-500 text-sm font-semibold">Event not found</p>
        <Link to="/" className="text-zinc-400 hover:text-zinc-200 text-xs mt-4 underline block">
          Back to home
        </Link>
      </div>
    );
  }

  let formattedDates = [];
  try {
    formattedDates = JSON.parse(event.dates);
  } catch (e) {
    formattedDates = [];
  }

  return (
    <div className="flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-[400px] bg-[#121214] border border-zinc-800 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-zinc-100">{event.name}</h2>
          <span className="text-xs bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded-full font-mono">
            {event.startTime} - {event.endTime}
          </span>
        </div>
        <p className="text-xs text-zinc-500 mb-6">
          Dates: {formattedDates.join(", ")}
        </p>

        {/* Login Form Skeleton */}
        <div className="bg-[#18181c] border border-zinc-800/80 rounded-xl p-4 mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Sign in to set availability</h3>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Your Name" 
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none"
            />
            <input 
              type="password" 
              placeholder="PIN" 
              className="w-16 bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-zinc-200 text-center focus:outline-none"
            />
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-1.5 rounded-lg">
              Go
            </button>
          </div>
        </div>

        <div className="border-t border-zinc-800/80 pt-4 text-center">
          <p className="text-xs text-zinc-500">Availability grid & heatmap interface (Step 3 & 4)</p>
        </div>
      </div>
    </div>
  );
}

export function App() {
  return (
    <Router>
      <main className="min-h-screen bg-[#0a0a0c] text-white flex flex-col">
        {/* Header matching mockup */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 bg-[#0c0c0e]">
          <div className="flex items-center gap-3">
            <button className="text-zinc-400 hover:text-zinc-200" type="button">
              {/* Menu Hamburger */}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link to="/" className="text-sm font-bold tracking-widest text-zinc-200 hover:text-white uppercase">
              WHENW3MEET
            </Link>
          </div>
          <button className="text-zinc-400 hover:text-zinc-200" type="button">
            {/* Share Icon */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 10.742l4.636-2.318M8.684 13.258l4.636 2.318M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </header>

        <section className="flex-1 flex flex-col justify-center py-6">
          <Routes>
            <Route path="/" element={<CreateEventPage />} />
            <Route path="/:eventId" element={<EventPage />} />
          </Routes>
        </section>
      </main>
    </Router>
  );
}
