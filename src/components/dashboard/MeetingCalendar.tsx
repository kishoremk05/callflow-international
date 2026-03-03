import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Clock,
  Video,
  Link2,
  RefreshCw,
  LogOut,
  ChevronRight,
  CalendarDays,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  format,
  isToday,
  isTomorrow,
  startOfDay,
  addDays,
  parseISO,
} from "date-fns";

// ─── Types ───────────────────────────────────────────────────────────────────

interface GCalEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  hangoutLink?: string;
  conferenceData?: { entryPoints?: { uri: string; entryPointType: string }[] };
  attendees?: { email: string; displayName?: string; responseStatus: string }[];
  location?: string;
  status: string;
  organizer?: { email: string; displayName?: string };
}

interface TokenClient {
  requestAccessToken: (opts?: { prompt?: string }) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (cfg: {
            client_id: string;
            scope: string;
            callback: (resp: { access_token?: string; error?: string }) => void;
          }) => TokenClient;
          revoke: (token: string, done: () => void) => void;
        };
      };
    };
  }
}

const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
const STORAGE_KEY = "gcal_access_token";

// ─── Helper utils ─────────────────────────────────────────────────────────────

function getEventStart(ev: GCalEvent): Date | null {
  const raw = ev.start?.dateTime || ev.start?.date;
  if (!raw) return null;
  return parseISO(raw);
}

function getEventEnd(ev: GCalEvent): Date | null {
  const raw = ev.end?.dateTime || ev.end?.date;
  if (!raw) return null;
  return parseISO(raw);
}

function isAllDay(ev: GCalEvent) {
  return !ev.start?.dateTime;
}

function dayLabel(date: Date): string {
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "EEEE, MMM d");
}

function groupByDay(events: GCalEvent[]): Record<string, GCalEvent[]> {
  const map: Record<string, GCalEvent[]> = {};
  events.forEach((ev) => {
    const d = getEventStart(ev);
    if (!d) return;
    const key = format(d, "yyyy-MM-dd");
    if (!map[key]) map[key] = [];
    map[key].push(ev);
  });
  return map;
}

function getMeetLink(ev: GCalEvent): string | null {
  if (ev.hangoutLink) return ev.hangoutLink;
  const ep = ev.conferenceData?.entryPoints?.find(
    (e) => e.entryPointType === "video",
  );
  return ep?.uri || null;
}

function statusColor(responseStatus: string) {
  switch (responseStatus) {
    case "accepted":
      return "bg-green-100 text-green-700";
    case "declined":
      return "bg-red-100 text-red-700";
    case "tentative":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MeetingCalendar() {
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    sessionStorage.getItem(STORAGE_KEY),
  );
  const [tokenClient, setTokenClient] = useState<TokenClient | null>(null);
  const [events, setEvents] = useState<GCalEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gisReady, setGisReady] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  // ── Load Google Identity Services script ──────────────────────────────────
  useEffect(() => {
    if (window.google?.accounts?.oauth2) {
      setGisReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setGisReady(true);
    script.onerror = () => setScriptError(true);
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // ── Init token client when GIS is ready ───────────────────────────────────
  useEffect(() => {
    if (!gisReady || !CLIENT_ID) return;
    const tc = window.google!.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response) => {
        if (response.error) {
          setError("Google authorization failed: " + response.error);
          return;
        }
        if (response.access_token) {
          sessionStorage.setItem(STORAGE_KEY, response.access_token);
          setAccessToken(response.access_token);
        }
      },
    });
    setTokenClient(tc);
  }, [gisReady]);

  // ── Fetch events ──────────────────────────────────────────────────────────
  const fetchEvents = useCallback(async (token: string, silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const now = new Date();
      const tenDaysLater = addDays(now, 10);
      const params = new URLSearchParams({
        calendarId: "primary",
        timeMin: startOfDay(now).toISOString(),
        timeMax: tenDaysLater.toISOString(),
        maxResults: "50",
        singleEvents: "true",
        orderBy: "startTime",
      });
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.status === 401) {
        // Token expired
        sessionStorage.removeItem(STORAGE_KEY);
        setAccessToken(null);
        setError("Session expired. Please reconnect.");
        return;
      }
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      setEvents(
        (data.items as GCalEvent[]).filter((e) => e.status !== "cancelled"),
      );
    } catch (err: any) {
      setError(err.message || "Failed to fetch events");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ── Auto-fetch when token is set ──────────────────────────────────────────
  useEffect(() => {
    if (accessToken) {
      fetchEvents(accessToken);
    }
  }, [accessToken, fetchEvents]);

  const handleConnect = () => {
    if (!tokenClient) return;
    tokenClient.requestAccessToken({ prompt: "" });
  };

  const handleDisconnect = () => {
    if (accessToken && window.google?.accounts?.oauth2) {
      window.google.accounts.oauth2.revoke(accessToken, () => {});
    }
    sessionStorage.removeItem(STORAGE_KEY);
    setAccessToken(null);
    setEvents([]);
    setError(null);
  };

  const handleRefresh = () => {
    if (accessToken) fetchEvents(accessToken, true);
    else if (tokenClient) tokenClient.requestAccessToken({ prompt: "" });
  };

  // ── Group events ──────────────────────────────────────────────────────────
  const grouped = groupByDay(events);
  const sortedDays = Object.keys(grouped).sort();

  // ── Not configured ────────────────────────────────────────────────────────
  if (!CLIENT_ID) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="w-10 h-10 text-amber-500" />
        <p className="text-gray-700 font-semibold">
          Google Client ID not configured
        </p>
        <p className="text-sm text-gray-500 text-center max-w-sm">
          Add{" "}
          <code className="bg-gray-100 px-1 rounded">
            VITE_GOOGLE_CLIENT_ID
          </code>{" "}
          to your <code className="bg-gray-100 px-1 rounded">.env</code> file
          and restart the dev server.
        </p>
      </div>
    );
  }

  // ── Not connected ─────────────────────────────────────────────────────────
  if (!accessToken) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        {scriptError && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-4 py-2 rounded-xl">
            <AlertCircle className="w-4 h-4" /> Failed to load Google sign-in
            script.
          </div>
        )}
        <div className="w-16 h-16 rounded-full bg-[#0891b2]/10 flex items-center justify-center">
          <CalendarDays className="w-8 h-8 text-[#0891b2]" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-[#1a365d] mb-2">
            Connect Google Calendar
          </h2>
          <p className="text-gray-500 text-sm max-w-sm">
            Connect your Google Calendar to see today's meetings, upcoming
            events, and join calls — all without leaving this portal.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleConnect}
          disabled={!gisReady || scriptError}
          className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {/* Google "G" logo */}
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {gisReady ? "Connect with Google" : "Loading…"}
        </button>

        <p className="text-xs text-gray-400 max-w-xs text-center">
          Read-only access. Your calendar data stays private and is never stored
          on our servers.
        </p>
      </div>
    );
  }

  // ── Connected – loading ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-8 h-8 text-[#0891b2] animate-spin" />
        <p className="text-gray-500 text-sm">Loading your calendar…</p>
      </div>
    );
  }

  // ── Connected – show events ───────────────────────────────────────────────
  const todayKey = format(new Date(), "yyyy-MM-dd");
  const todayEvents = grouped[todayKey] || [];
  const upcomingDays = sortedDays.filter((d) => d !== todayKey);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#0891b2]/10 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-[#0891b2]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#1a365d]">
              Google Calendar
            </h2>
            <p className="text-xs text-gray-400">
              {events.length} event{events.length !== 1 ? "s" : ""} in next 10
              days
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <button
            onClick={handleDisconnect}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 border border-red-200 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Disconnect
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl border border-red-100">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Today */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-bold text-[#1a365d]">Today</span>
          <span className="text-xs text-gray-400">
            {format(new Date(), "EEEE, MMMM d")}
          </span>
          {todayEvents.length > 0 && (
            <span className="ml-auto bg-[#0891b2] text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {todayEvents.length}
            </span>
          )}
        </div>
        {todayEvents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-4">
            <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-700">
                No meetings today
              </p>
              <p className="text-xs text-gray-400">Enjoy your free day! 🎉</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {todayEvents.map((ev) => (
              <EventCard key={ev.id} event={ev} highlight />
            ))}
          </div>
        )}
      </section>

      {/* Upcoming */}
      {upcomingDays.length > 0 && (
        <section className="space-y-5">
          <h3 className="text-sm font-bold text-[#1a365d]">Upcoming</h3>
          {upcomingDays.map((dayKey) => {
            const dayDate = parseISO(dayKey);
            return (
              <div key={dayKey}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {dayLabel(dayDate)}
                  </span>
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-400">
                    {grouped[dayKey].length} event
                    {grouped[dayKey].length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="space-y-2">
                  {grouped[dayKey].map((ev) => (
                    <EventCard key={ev.id} event={ev} />
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {events.length === 0 && !error && (
        <div className="flex flex-col items-center gap-3 py-12 text-gray-400">
          <Calendar className="w-10 h-10" />
          <p className="text-sm">No events in the next 10 days</p>
        </div>
      )}
    </div>
  );
}

// ─── EventCard sub-component ─────────────────────────────────────────────────

function EventCard({
  event,
  highlight = false,
}: {
  event: GCalEvent;
  highlight?: boolean;
}) {
  const start = getEventStart(event);
  const end = getEventEnd(event);
  const allDay = isAllDay(event);
  const meetLink = getMeetLink(event);
  const attendeeCount = event.attendees?.length || 0;

  return (
    <div
      className={`bg-white rounded-2xl border p-4 transition-all ${
        highlight
          ? "border-[#0891b2]/30 shadow-sm ring-1 ring-[#0891b2]/10"
          : "border-gray-100 shadow-sm hover:border-gray-200"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Color stripe */}
        <div
          className={`w-1 self-stretch rounded-full flex-shrink-0 ${
            meetLink ? "bg-[#0891b2]" : "bg-purple-400"
          }`}
        />

        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <p className="text-sm font-semibold text-[#1a365d] leading-snug truncate">
              {event.summary || "(No title)"}
            </p>
            {meetLink && (
              <a
                href={meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 flex items-center gap-1 bg-[#0891b2] text-white text-xs font-medium px-2.5 py-1 rounded-lg hover:bg-[#0e7490] transition-colors"
              >
                <Video className="w-3 h-3" />
                Join
              </a>
            )}
          </div>

          {/* Time */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            {allDay ? (
              <span>All day</span>
            ) : (
              <span>
                {start ? format(start, "h:mm a") : "?"}
                {end ? ` – ${format(end, "h:mm a")}` : ""}
              </span>
            )}
          </div>

          {/* Attendees + location row */}
          <div className="flex items-center gap-3 flex-wrap">
            {attendeeCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Users className="w-3.5 h-3.5" />
                <span>
                  {attendeeCount} attendee{attendeeCount !== 1 ? "s" : ""}
                </span>
              </div>
            )}
            {event.location && !meetLink && (
              <div className="flex items-center gap-1 text-xs text-gray-400 truncate max-w-[200px]">
                <Link2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
