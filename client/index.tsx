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

export type Availability = {
  id: string;
  eventId: string;
  userName: string;
  passwordHash: string;
  slots: string; // JSON string of YYYY-MM-DDTHH:MM -> boolean map
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

function generateTimeSlots(start: string, end: string): string[] {
  const slots: string[] = [];
  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);
  
  let currentMin = startH * 60 + startM;
  const endMin = endH * 60 + endM;

  while (currentMin < endMin) {
    const h = String(Math.floor(currentMin / 60)).padStart(2, "0");
    const m = String(currentMin % 60).padStart(2, "0");
    slots.push(`${h}:${m}`);
    currentMin += 30;
  }
  return slots;
}

function EventPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const events = useQuery<Event[] | undefined>("events");
  const availabilities = useQuery<Availability[] | undefined>("availabilities");
  const saveAvailability = useMutation<
    [eventId: string, userName: string, passwordHash: string, slots: string],
    { success: boolean; error?: string }
  >("saveAvailability");

  const [currentUser, setCurrentUser] = useState<{ name: string; pin: string } | null>(null);
  const [loginName, setLoginName] = useState("");
  const [loginPin, setLoginPin] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  const [paintedSlots, setPaintedSlots] = useState<Record<string, boolean>>({});
  const [isDragSelecting, setIsDragSelecting] = useState<boolean | null>(null); // true = selecting, false = deselecting
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"paint" | "heatmap">("paint");

  if (events === undefined || availabilities === undefined) {
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

  let formattedDates: string[] = [];
  try {
    formattedDates = JSON.parse(event.dates);
  } catch (e) {
    formattedDates = [];
  }

  const slots = generateTimeSlots(event.startTime, event.endTime);

  // Authentication submission
  function handleLogin(e: SubmitEvent) {
    e.preventDefault();
    if (!loginName.trim() || !loginPin.trim()) return;
    setLoginError(null);

    const existing = availabilities?.find(
      (a) => a.eventId === eventId && a.userName === loginName.trim()
    );

    if (existing) {
      if (existing.passwordHash !== loginPin.trim()) {
        setLoginError("Incorrect PIN for this username");
        return;
      }
      setCurrentUser({ name: existing.userName, pin: loginPin.trim() });
      try {
        setPaintedSlots(JSON.parse(existing.slots));
      } catch (err) {
        setPaintedSlots({});
      }
    } else {
      setCurrentUser({ name: loginName.trim(), pin: loginPin.trim() });
      setPaintedSlots({});
    }
  }

  function handleSignOut() {
    setCurrentUser(null);
    setLoginName("");
    setLoginPin("");
    setPaintedSlots({});
  }

  // Save Availability to database
  async function handleSave() {
    if (!currentUser) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const res = await saveAvailability(
        eventId,
        currentUser.name,
        currentUser.pin,
        JSON.stringify(paintedSlots)
      );
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(res.error || "Failed to save availability");
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save availability");
    } finally {
      setSaving(false);
    }
  }

  // Grid Drag/Touch controls
  function handleStartSelection(slotKey: string) {
    if (!currentUser || activeTab !== "paint") return;
    const nextState = !paintedSlots[slotKey];
    setIsDragSelecting(nextState);
    setPaintedSlots((prev) => ({
      ...prev,
      [slotKey]: nextState,
    }));
  }

  function handleDragOver(slotKey: string) {
    if (isDragSelecting === null || !currentUser || activeTab !== "paint") return;
    setPaintedSlots((prev) => {
      if (prev[slotKey] === isDragSelecting) return prev;
      return {
        ...prev,
        [slotKey]: isDragSelecting,
      };
    });
  }

  // Mouse handlers
  function onMouseDownCell(e: MouseEvent, slotKey: string) {
    e.preventDefault();
    setIsMouseDown(true);
    handleStartSelection(slotKey);
  }

  function onMouseEnterCell(slotKey: string) {
    if (isMouseDown) {
      handleDragOver(slotKey);
    }
  }

  function onMouseUpGrid() {
    setIsMouseDown(false);
    setIsDragSelecting(null);
  }

  // Touch handlers
  function onTouchStartCell(e: TouchEvent, slotKey: string) {
    if (e.cancelable) e.preventDefault();
    handleStartSelection(slotKey);
  }

  function onTouchMoveGrid(e: TouchEvent) {
    if (isDragSelecting === null || !currentUser || activeTab !== "paint") return;
    if (e.cancelable) e.preventDefault();
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!element) return;
    const cell = element.closest("[data-time-slot]");
    const slotKey = cell ? cell.getAttribute("data-time-slot") : null;
    if (slotKey) {
      handleDragOver(slotKey);
    }
  }

  function onTouchEndGrid() {
    setIsDragSelecting(null);
  }

  return (
    <div className="flex flex-col items-center px-4 py-4 select-none">
      <div className="w-full max-w-[400px] bg-[#121214] border border-zinc-800 rounded-2xl p-5 shadow-2xl">
        
        {/* Toggle Switch */}
        <div className="bg-zinc-950 p-1 rounded-xl flex mb-5 border border-zinc-900">
          <button
            onClick={() => setActiveTab("paint")}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === "paint" ? "bg-zinc-900 text-zinc-100 shadow" : "text-zinc-500 hover:text-zinc-300"
            }`}
            type="button"
          >
            My Availability
          </button>
          <button
            onClick={() => setActiveTab("heatmap")}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === "heatmap" ? "bg-zinc-900 text-zinc-100 shadow" : "text-zinc-500 hover:text-zinc-300"
            }`}
            type="button"
          >
            Group Heatmap
          </button>
        </div>

        {/* Title Card */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-100 leading-tight">{event.name}</h2>
            <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider font-semibold">
              {formattedDates.length > 0 ? `${formattedDates[0]} - ${formattedDates[formattedDates.length - 1]}` : ""}
            </p>
          </div>
          {currentUser && (
            <button 
              onClick={handleSignOut}
              className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded-lg"
              type="button"
            >
              Sign Out
            </button>
          )}
        </div>

        {/* Login Form Panel */}
        {!currentUser && (
          <div className="bg-[#18181c] border border-zinc-800/80 rounded-xl p-4 mb-5">
            <h3 className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 mb-3">Sign in to edit availability</h3>
            <form onSubmit={(e) => void handleLogin(e)} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Name" 
                value={loginName}
                onInput={(e) => setLoginName((e.target as HTMLInputElement).value)}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
                required
              />
              <input 
                type="password" 
                placeholder="PIN" 
                value={loginPin}
                onInput={(e) => setLoginPin((e.target as HTMLInputElement).value)}
                maxLength={4}
                className="w-16 bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-2 text-xs text-zinc-200 text-center placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
                required
              />
              <button 
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors"
              >
                Go
              </button>
            </form>
            {loginError && (
              <p role="alert" aria-live="assertive" className="text-red-500 text-[10px] mt-2 font-medium">{loginError}</p>
            )}
          </div>
        )}

        {/* Sign in status */}
        {currentUser && (
          <div className="bg-zinc-950/60 border border-zinc-900 rounded-xl px-4 py-2.5 mb-5 flex items-center justify-between">
            <span className="text-[11px] text-zinc-400">
              Editing as: <strong className="text-zinc-200">{currentUser.name}</strong>
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
        )}

        {/* Info panel when not logged in */}
        {!currentUser && activeTab === "paint" && (
          <div className="bg-zinc-950/30 border border-dashed border-zinc-800 rounded-xl py-3 px-4 mb-5 text-center text-zinc-500 text-xs font-medium">
            🔒 Enter your Name and PIN above to paint your schedule.
          </div>
        )}

        {/* Grid Container */}
        <div 
          onMouseUp={onMouseUpGrid}
          onMouseLeave={onMouseUpGrid}
          className="bg-zinc-950/20 border border-zinc-900 rounded-xl p-3"
        >
          {activeTab === "paint" ? (
            <div className="grid grid-cols-[60px_1fr] gap-1">
              {/* Header dates row */}
              <div></div>
              <div className="grid grid-flow-col gap-1 text-center">
                {formattedDates.map((dateStr) => {
                  const d = new Date(dateStr + "T00:00:00");
                  const weekday = d.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 3).toUpperCase();
                  const dayNum = d.getDate();
                  return (
                    <div key={dateStr} className="text-zinc-500 text-[9px] uppercase font-bold py-1">
                      <div>{weekday}</div>
                      <div className="text-zinc-300 text-xs font-bold">{dayNum}</div>
                    </div>
                  );
                })}
              </div>

              {/* Grid rows */}
              {slots.map((slotTime) => {
                const [h, m] = slotTime.split(":").map(Number);
                const period = h >= 12 ? "PM" : "AM";
                const h12 = h % 12 === 0 ? 12 : h % 12;
                const displayTime = `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;

                return (
                  <div key={slotTime} className="contents">
                    <div className="text-[9px] font-mono text-zinc-500 text-right pr-2 self-center">
                      {displayTime}
                    </div>
                    <div className="grid grid-flow-col gap-1">
                      {formattedDates.map((dateStr) => {
                        const cellKey = `${dateStr}T${slotTime}`;
                        const isSelected = !!paintedSlots[cellKey];
                        return (
                          <div
                            key={cellKey}
                            data-time-slot={cellKey}
                            onMouseDown={(e) => onMouseDownCell(e, cellKey)}
                            onMouseEnter={() => onMouseEnterCell(cellKey)}
                            onTouchStart={(e) => onTouchStartCell(e, cellKey)}
                            onTouchMove={onTouchMoveGrid}
                            onTouchEnd={onTouchEndGrid}
                            className={`h-8 rounded-md border border-zinc-800/80 cursor-pointer transition-colors ${
                              isSelected 
                                ? "bg-emerald-500 border-emerald-400/30 shadow-inner" 
                                : "bg-zinc-950/40 hover:bg-zinc-900/50"
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-500 text-xs font-medium">
              📊 Heatmap results will be wired up in Step 4.
            </div>
          )}
        </div>

        {/* Save button and alerts */}
        {activeTab === "paint" && currentUser && (
          <div className="mt-4">
            {saveError && (
              <p role="alert" aria-live="assertive" className="text-red-500 text-xs text-center mb-3 font-medium">{saveError}</p>
            )}
            <button
              onClick={() => void handleSave()}
              disabled={saving}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              {saving ? "Saving..." : saveSuccess ? "✓ Saved Availability" : "Save Availability"}
            </button>
          </div>
        )}

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
