import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import LandingFooter from "@/components/LandingFooter";
import BrandLogo from "@/components/branding/BrandLogo";
import LandingSupportChatbot from "@/components/landing/LandingSupportChatbot";
import "./newlandingpage.css";

gsap.registerPlugin(ScrollTrigger);

const companyInfo = {
  name: "CallFlow International",
  shortName: "CallFlow",
  tagline: "Global Communication, Zero Boundaries",
  description:
    "Browser-based VoIP SaaS platform for calling, meetings, and enterprise communication.",
  secondQuote:
    "It doesn't matter where your team is located. What matters is how seamlessly they connect.",
};

const showcaseStats = [
  { number: "<5s", label: "Load Time" },
  { number: "150+", label: "Countries" },
  { number: "99.9%", label: "Uptime SLA" },
];

const premiumFeatures = [
  {
    icon: "AUD",
    title: "HD Voice Quality",
    desc: "Crystal-clear audio on every call with adaptive bitrate and automatic network optimization.",
    stats: [
      { label: "Uptime", value: "99.9%" },
      { label: "Audio Quality", value: "HD+" },
    ],
  },
  {
    icon: "WEB",
    title: "Browser Calling",
    desc: "Make HD calls directly from your browser. No apps or downloads required, just instant connectivity.",
    stats: [
      { label: "Load Time", value: "<5s" },
      { label: "Compatibility", value: "100%" },
    ],
  },
  {
    icon: "TEAM",
    title: "Team Collaboration",
    desc: "Host internal voice meetings and collaborate with your team seamlessly across the globe.",
    stats: [
      { label: "Team Size", value: "Unlimited" },
      { label: "Internal Calls", value: "Duration-based cost" },
    ],
  },
  {
    icon: "NUM",
    title: "Virtual Number Allocation",
    desc: "Assign a personal virtual number to each individual user for direct inbound calls, privacy, and location-based presence.",
    stats: [
      { label: "User Type", value: "Individual" },
      { label: "Activation", value: "Instant" },
    ],
  },
  {
    icon: "ANL",
    title: "Call Analytics",
    desc: "Monitor pilot usage, validate call quality, and prepare reporting workflows before public rollout.",
    stats: [
      { label: "Starting From", value: "$0.01/min" },
      { label: "Pilot Calls", value: "0-100" },
      { label: "Report Status", value: "Baseline" },
    ],
  },
  {
    icon: "CONF",
    title: "Conference Calling",
    desc: "Host multi-party conference calls with crystal-clear audio for seamless group discussions.",
    stats: [
      { label: "Participants", value: "50+" },
      { label: "Audio Quality", value: "HD" },
      { label: "Duration", value: "Unlimited" },
    ],
  },
  {
    icon: "AI",
    title: "AI Agent Automation Support (Coming Soon)",
    desc: "AI assistant for call summaries, ticket drafting, follow-up reminders, and workflow automation after every conversation.",
    stats: [
      { label: "Status", value: "Coming Soon" },
      { label: "Use Cases", value: "Support + Ops" },
    ],
  },
  {
    icon: "REC",
    title: "Call Recording (Coming Soon)",
    desc: "Record calls automatically with secure storage and easy playback for quality reviews and compliance workflows.",
    stats: [
      { label: "Status", value: "Coming Soon" },
      { label: "Storage", value: "Secure" },
    ],
  },
];

const stats = [
  { label: "Load Time", value: "<5s", numericValue: 5 },
  { label: "Countries", value: "150+", numericValue: 150 },
  { label: "Uptime SLA", value: "99.9%", numericValue: 99.9 },
  { label: "Min", value: "$0.01*", numericValue: 0.01 },
];

const pricingTiers = [
  {
    id: "starter",
    name: "Starter",
    price: "Free",
    period: "",
    description: "Calls start from $0.01* per minute based on country.",
    features: ["Call 150+ countries", "HD browser calling"],
    highlighted: false,
  },
  {
    id: "business",
    name: "Business",
    price: "$49",
    period: "/user/month",
    description: "Up to 10 users",
    features: ["All Starter features", "Call 150+ countries"],
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Custom",
    price: "Custom",
    period: "",
    description: "More than 10 users",
    features: ["All Business features", "Dedicated manager"],
    highlighted: false,
  },
];

const integrations = [
  "SIP Trunk",
  "LiveKit",
  "Stripe",
  "Slack",
  "Microsoft Teams",
  "Salesforce",
  "HubSpot",
  "Zapier",
  "Google Workspace",
  "Okta",
];

const navItems = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
];

const dashboardAnalysisMetrics = [
  { label: "Pilot Calls", value: "0-100" },
  { label: "Minutes Tracked", value: "0-300" },
  { label: "Reports Shared", value: "0-20" },
  { label: "Data Readiness", value: "Baseline" },
  { label: "Outbound Trials", value: "0-50" },
];

const companyDashboardAnalysisMetrics = [
  { label: "Calls", value: "Call" },
  { label: "Minutes", value: "Minutes" },
  { label: "Shares", value: "Shares" },
  { label: "Growth", value: "Growth" },
  { label: "Outreaches", value: "Outreach" },
];

const dashboardAnalysisCards = [
  {
    icon: "CALL",
    category: "Usage",
    subtitle: "Conversation Volume",
    title: "Total Calls Overview",
    desc: "Monitor inbound and outbound call totals by team, region, and campaign with live rollups and daily trend lines.",
  },
  {
    icon: "TIME",
    category: "Efficiency",
    subtitle: "Time Intelligence",
    title: "Minutes Spent",
    desc: "Track talk-time distribution and identify high-efficiency calling windows to optimize team performance and cost control.",
  },
  {
    icon: "FLOW",
    category: "Engagement",
    subtitle: "Share Performance",
    title: "Shares & Follow-ups",
    desc: "Measure how shared call summaries, links, and notes translate into follow-ups, team alignment, and improved outcomes.",
  },
  {
    icon: "GROW",
    category: "Forecast",
    subtitle: "Growth Signals",
    title: "Growth Analysis",
    desc: "Visualize week-over-week call growth, quality consistency, and retention signals with actionable trend insights.",
  },
  {
    icon: "GOAL",
    category: "Pipeline",
    subtitle: "Reach Impact",
    title: "Outreach Analysis",
    desc: "Track outreach velocity, response conversion, and pipeline progression to understand which campaigns drive results.",
  },
];

const companyDashboardAnalysisCards = [
  {
    icon: "TEAM",
    category: "Collaboration",
    subtitle: "Company Workspace",
    title: "Team Management",
    desc: "Organize members by role, track team calling activity, and manage workspace-level operations from one panel.",
  },
  {
    icon: "WLT",
    category: "Billing",
    subtitle: "Shared Credits",
    title: "Wallet Sharing",
    desc: "Share wallet balances across departments, apply spend rules, and monitor credit usage by user or team.",
  },
  {
    icon: "CSV",
    category: "Import",
    subtitle: "Bulk Operations",
    title: "CSV Upload Sheet",
    desc: "Upload and validate contact lists in bulk, then push clean records directly into outreach workflows.",
  },
  {
    icon: "QUE",
    category: "Routing",
    subtitle: "Outbound Operations",
    title: "Call Queuing",
    desc: "Upload a CSV contact list and start an outbound call queue. Calls run one by one, and once a call ends, the next queued contact is dialed automatically.",
  },
];

const analysisContentByItem = {
  Dashboard: {
    metrics: dashboardAnalysisMetrics,
    cards: dashboardAnalysisCards,
  },
  "Team Call": {
    metrics: [
      { label: "Active Rooms", value: "0-8" },
      { label: "Participants", value: "0-40" },
      { label: "Avg Session", value: "08:30" },
      { label: "Audio Stability", value: "99%" },
      { label: "Queue Delay", value: "<2s" },
    ],
    cards: [
      {
        icon: "ROOM",
        category: "Calls",
        subtitle: "Live Team Rooms",
        title: "Team Call Sessions",
        desc: "View active internal call rooms, participant count, and session health across teams in real time.",
      },
      {
        icon: "AUDIO",
        category: "Quality",
        subtitle: "Voice Performance",
        title: "Call Quality Monitor",
        desc: "Track packet loss, jitter, and reconnect events to maintain consistent team calling quality.",
      },
    ],
  },
  "Recent Calls": {
    metrics: [
      { label: "Calls Today", value: "0-60" },
      { label: "Answered", value: "0-45" },
      { label: "Missed", value: "0-12" },
      { label: "Avg Handle", value: "04:10" },
      { label: "Follow-Ups", value: "0-20" },
    ],
    cards: [
      {
        icon: "LOG",
        category: "History",
        subtitle: "Timeline",
        title: "Recent Call Feed",
        desc: "Review latest inbound and outbound calls with timestamp, outcome, and assigned owner.",
      },
      {
        icon: "MON",
        category: "Activity",
        subtitle: "Monthly Trend",
        title: "Monthly Activity",
        desc: "Track monthly call volume, answered ratio, and follow-up completion trends to understand consistency.",
      },
    ],
  },
  "Meeting Calendar": {
    metrics: [
      { label: "Meetings Today", value: "0-15" },
      { label: "Upcoming", value: "0-30" },
      { label: "Rescheduled", value: "0-5" },
      { label: "No-Show Rate", value: "0-10%" },
      { label: "Slot Fill", value: "Baseline" },
    ],
    cards: [
      {
        icon: "CAL",
        category: "Planning",
        subtitle: "Schedule View",
        title: "Meeting Timeline",
        desc: "See upcoming team and customer meetings in one calendar with timezone-aware scheduling.",
      },
      {
        icon: "SYNC",
        category: "Automation",
        subtitle: "Calendar Sync",
        title: "Reminders & Reschedule",
        desc: "Send auto-reminders, track reschedule patterns, and keep call plans aligned with team availability.",
      },
    ],
  },
  Numbers: {
    metrics: [
      { label: "Numbers Active", value: "0-25" },
      { label: "Regions", value: "0-12" },
      { label: "Assigned", value: "0-20" },
      { label: "Unassigned", value: "0-5" },
      { label: "Activation", value: "Instant" },
    ],
    cards: [
      {
        icon: "NUM",
        category: "Inventory",
        subtitle: "Virtual Numbers",
        title: "Number Allocation",
        desc: "Track purchased numbers, assignment status, and routing destination by user, team, or campaign.",
      },
      {
        icon: "ROUTE",
        category: "Routing",
        subtitle: "Inbound Flow",
        title: "Destination Rules",
        desc: "Configure where each number routes, including IVR, direct user ringing, and fallback forwarding.",
      },
    ],
  },
  "Admin Access": {
    metrics: [
      { label: "Admins", value: "1-5" },
      { label: "Roles", value: "3" },
      { label: "Permission Sets", value: "6" },
      { label: "Audit Events", value: "0-120" },
      { label: "Access Health", value: "Stable" },
    ],
    cards: [
      {
        icon: "AUDIT",
        category: "Compliance",
        subtitle: "Event Logs",
        title: "Audit Trail",
        desc: "Review authentication attempts and permission changes with timestamped event records.",
      },
    ],
  },
};

const companyAnalysisSidebarItems = [
  "Dashboard",
  "Team Call",
  "Recent Calls",
  "Meeting Calendar",
  "Numbers",
  "Admin Access",
];

const normalAnalysisSidebarItems = ["Dashboard", "Recent Calls"];

const featureDeepDive = [
  {
    icon: "CALL",
    category: "calling",
    subtitle: "Crystal-Clear Calls",
    title: "International VoIP",
    desc: "Make and receive PSTN calls worldwide with reliable carrier routing. HD voice quality with adaptive bitrate and noise cancellation.",
  },
  {
    icon: "MEET",
    category: "meetings",
    subtitle: "Internal Conferencing",
    title: "Team Meetings",
    desc: "Unlimited internal team meetings with screen sharing, virtual backgrounds, and real-time collaboration.",
  },
  {
    icon: "PAY",
    category: "billing",
    subtitle: "Pay-As-You-Go",
    title: "Wallet Billing",
    desc: "Transparent wallet-based billing with real-time balance tracking, auto-recharge, detailed call logs, and organization-level credit management.",
  },
  {
    icon: "NUM",
    category: "calling",
    subtitle: "Local Presence, Global Reach",
    title: "Virtual Numbers",
    desc: "Purchase virtual phone numbers in 150+ countries. Establish local presence and route calls intelligently.",
  },
  {
    icon: "SCL",
    category: "platform",
    subtitle: "Built for Growth",
    title: "Scalable Architecture",
    desc: "From solo users to 1,000+ seat enterprises with global edge deployment.",
  },
];

const platformCapabilities = [
  {
    category: "Core",
    title: "Browser-Based Calling",
    desc: "No downloads, no plugins. Make and receive calls directly from your browser.",
  },
  {
    category: "Intelligence",
    title: "Smart Call Routing",
    desc: "AI-powered call routing with IVR, auto-attendant, and skill-based distribution.",
  },
  {
    category: "Insights",
    title: "Real-Time Analytics",
    desc: "Live dashboards for call quality, usage metrics, and team performance tracking.",
  },
  {
    category: "Numbers",
    title: "Number Management",
    desc: "Purchase and manage virtual numbers across 150+ countries from a single dashboard.",
  },
  {
    category: "Meetings",
    title: "Team Collaboration",
    desc: "HD team meetings with screen sharing, chat, and whiteboarding - all free for internal use.",
  },
  {
    category: "Enterprise",
    title: "Compliance & Security",
    desc: "SOC 2 compliant, end-to-end encryption, SSO, and audit logging for regulated industries.",
  },
  {
    category: "Developer",
    title: "API & Webhooks",
    desc: "RESTful API and webhooks for custom integrations, automation, and workflow triggers.",
  },
  {
    category: "Platform",
    title: "Mobile Ready",
    desc: "Responsive PWA experience - full functionality on any device without app store downloads.",
  },
];

const securityItems = [
  {
    title: "End-to-End Encryption",
    desc: "All calls and meetings are encrypted in transit and at rest. Zero-knowledge architecture for maximum privacy.",
  },
  {
    title: "SOC 2 Type II",
    desc: "Independently audited security controls. Compliance reports available for enterprise customers on request.",
  },
  {
    title: "Data Residency",
    desc: "Choose where your data lives. Regional deployment options for GDPR, HIPAA, and other regulatory requirements.",
  },
];

const fullPricingTiers = [
  {
    id: "starter-full",
    name: "Starter",
    price: "Free",
    period: "",
    description: "Calls start from $0.01* per minute based on country.",
    cta: "Get Started",
    highlighted: false,
    features: [
      "Call 150+ countries",
      "HD browser calling",
      "Basic support",
      "Call history",
      "Wallet system",
    ],
  },
  {
    id: "business-full",
    name: "Business",
    price: "$49",
    period: "/user/month",
    description: "Up to 10 users",
    cta: "Get Started",
    highlighted: true,
    features: [
      "All Starter features",
      "150+ countries",
      "Priority support",
      "Up to 10 users",
      "Organization management",
    ],
  },
  {
    id: "enterprise-full",
    name: "Custom",
    price: "Custom",
    period: "",
    description: "More than 10 users",
    cta: "Contact Sales",
    highlighted: false,
    features: [
      "All Business features",
      "150+ countries",
      "More than 10 users",
      "Dedicated manager",
      "AI support agent (Coming soon)",
      "Voice auto-calling agent (Coming soon)",
      "AI analysis insights (Coming soon)",
    ],
  },
];

const comparisonRows = [
  {
    feature: "International Calling",
    starter: "150+ countries",
    business: "150+ countries",
    enterprise: "150+ countries",
  },
  {
    feature: "HD Browser Calling",
    starter: "Yes",
    business: "Yes",
    enterprise: "Yes",
  },
  {
    feature: "Team Features",
    starter: "-",
    business: "Yes",
    enterprise: "Yes",
  },
  {
    feature: "User Capacity",
    starter: "-",
    business: "-",
    enterprise: "Up to 10 users",
  },
  {
    feature: "Organization Management",
    starter: "-",
    business: "Yes",
    enterprise: "Yes",
  },
  {
    feature: "Dedicated Manager",
    starter: "-",
    business: "-",
    enterprise: "Yes",
  },
  {
    feature: "Custom Numbers",
    starter: "Yes",
    business: "Yes",
    enterprise: "Yes",
  },
  {
    feature: "AI Support Agent (Coming soon)",
    starter: "-",
    business: "-",
    enterprise: "Yes",
  },
  {
    feature: "Voice Auto-Calling Agent (Coming soon)",
    starter: "-",
    business: "-",
    enterprise: "Yes",
  },
  {
    feature: "AI Analysis (Coming soon)",
    starter: "-",
    business: "-",
    enterprise: "Yes",
  },
  {
    feature: "Support",
    starter: "Basic",
    business: "Priority",
    enterprise: "Dedicated",
  },
];

const faqs = [
  {
    q: "How does wallet billing work?",
    a: "The platform follows a pay-as-you-go pricing model, so users are charged only for the minutes they actually use, with rates starting at just a few cents per minute. There are no subscriptions, long-term contracts, or hidden fees to worry about. Unused minutes never expire and automatically roll over into the next month.",
  },
  {
    q: "Do I need to install anything?",
    a: "No. CallFlow is 100% browser-based. It works on Chrome, Firefox, Safari, and Edge - on desktop, tablet, and mobile devices.",
  },
  {
    q: "What are the rates for international calls?",
    a: "Our rates vary by country and are competitive with major carriers. You can view our current rates in the pricing section below. We charge per minute, and you only pay for what you use.",
  },
  {
    q: "Can I get a virtual number?",
    a: "Yes. You can buy virtual numbers directly in the platform and allocate them to your users, teams, or campaigns. Numbers can be activated instantly and managed from one admin panel.",
  },
  {
    q: "What about call quality?",
    a: "CallFlow uses adaptive bitrate, intelligent jitter buffering, and regional media routing to keep calls stable. During pilot rollout, quality metrics are tracked continuously so teams can tune performance before full launch.",
  },
  {
    q: "Is my call data secure?",
    a: "Yes, we take privacy seriously. All calls are encrypted, and we only store the minimum information needed for to display calls in your call history. You can review our Privacy Policy for more details.",
  },
];

const LandingPage = () => {
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [analysisUserType, setAnalysisUserType] = useState<
    "normal" | "company"
  >("company");
  const [selectedAnalysisItem, setSelectedAnalysisItem] =
    useState<string>("Dashboard");

  const isFeaturesPage = pathname === "/features";
  const isHowItWorksPage = pathname === "/how-it-works";
  const isPricingPage = pathname === "/pricing";
  const currentAnalysisSidebarItems =
    analysisUserType === "company"
      ? companyAnalysisSidebarItems
      : normalAnalysisSidebarItems;
  const isCompanyDashboardView =
    analysisUserType === "company" && selectedAnalysisItem === "Dashboard";
  const activeAnalysisContent = isCompanyDashboardView
    ? {
        metrics: companyDashboardAnalysisMetrics,
        cards: companyDashboardAnalysisCards,
      }
    : (analysisContentByItem[
        selectedAnalysisItem as keyof typeof analysisContentByItem
      ] ?? analysisContentByItem.Dashboard);
  const currentPath =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;
  const isNavItemActive = (href: string) => {
    const normalizedHref =
      href.length > 1 && href.endsWith("/") ? href.slice(0, -1) : href;
    return currentPath === normalizedHref;
  };

  const heroWrapperRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const showcaseRef = useRef<HTMLDivElement>(null);
  const featuresHeroRef = useRef<HTMLElement>(null);
  const featuresStatsRef = useRef<HTMLElement>(null);
  const featuresCardsRef = useRef<HTMLElement>(null);
  const pricingHeroRef = useRef<HTMLElement>(null);
  const pricingStatsRef = useRef<HTMLElement>(null);
  const pricingCardsRef = useRef<HTMLDivElement>(null);
  const pricingCompareRef = useRef<HTMLElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const featuresScrollRef = useRef<HTMLElement>(null);
  const featuresTrackRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    const canvas = particleCanvasRef.current;
    if (!canvas || !canvas.parentElement) return;

    const parent = canvas.parentElement;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      opacity: number;
      driftSeed: number;
    };

    const LIME_R = 232;
    const LIME_G = 178;
    const LIME_B = 74;
    const DESKTOP_COUNT = 80;
    const MOBILE_COUNT = 52;
    const DESKTOP_DIST = 150;
    const MOBILE_DIST = 120;
    const POINTER_RADIUS = 200;
    const POINTER_FORCE = 0.02;
    const AMBIENT_DRIFT = 0.015;

    let particles: Particle[] = [];
    let mouse = { x: -9999, y: -9999 };
    let dims = { w: 0, h: 0 };
    let particleCount = DESKTOP_COUNT;
    let connDist = DESKTOP_DIST;
    let rafId = 0;

    const createParticles = (w: number, h: number, count: number) => {
      const arr: Particle[] = [];
      for (let i = 0; i < count; i += 1) {
        arr.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.7,
          vy: (Math.random() - 0.5) * 0.7,
          radius: Math.random() * 2 + 1,
          opacity: Math.random() * 0.35 + 0.15,
          driftSeed: Math.random() * Math.PI * 2,
        });
      }
      return arr;
    };

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = rect.width;
      const h = rect.height;
      const isMobile = window.innerWidth < 768;

      particleCount = isMobile ? MOBILE_COUNT : DESKTOP_COUNT;
      connDist = isMobile ? MOBILE_DIST : DESKTOP_DIST;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      dims = { w, h };
      particles = createParticles(w, h, particleCount);
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onMouseLeave = () => {
      mouse = { x: -9999, y: -9999 };
    };

    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      const rect = canvas.getBoundingClientRect();
      mouse = { x: t.clientX - rect.left, y: t.clientY - rect.top };
    };

    const animate = () => {
      const { w, h } = dims;
      const time = performance.now() * 0.001;
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < POINTER_RADIUS && dist > 0) {
          const force = (1 - dist / POINTER_RADIUS) * POINTER_FORCE;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        p.vx += Math.sin(time * 0.9 + p.driftSeed) * AMBIENT_DRIFT;
        p.vy += Math.cos(time * 0.75 + p.driftSeed) * AMBIENT_DRIFT;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${LIME_R},${LIME_G},${LIME_B},${p.opacity})`;
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connDist) {
            const alpha = (1 - dist / connDist) * 0.15;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${LIME_R},${LIME_G},${LIME_B},${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      if (mouse.x > -999) {
        for (let i = 0; i < particles.length; i += 1) {
          const p = particles[i];
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < POINTER_RADIUS) {
            const alpha = (1 - dist / POINTER_RADIUS) * 0.25;
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(p.x, p.y);
            ctx.strokeStyle = `rgba(${LIME_R},${LIME_G},${LIME_B},${alpha})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      }

      rafId = requestAnimationFrame(animate);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    resize();

    parent.addEventListener("mousemove", onMouseMove);
    parent.addEventListener("mouseleave", onMouseLeave);
    parent.addEventListener("touchmove", onTouchMove, { passive: true });

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      parent.removeEventListener("mousemove", onMouseMove);
      parent.removeEventListener("mouseleave", onMouseLeave);
      parent.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  useEffect(() => {
    const isHomePage =
      pathname === "/" ||
      (pathname.length > 1 &&
        pathname.endsWith("/") &&
        pathname.slice(0, -1) === "");

    if (
      isHomePage &&
      heroWrapperRef.current &&
      heroRef.current &&
      showcaseRef.current
    ) {
      const tagline = showcaseRef.current.querySelector(".sc-tagline");
      const statItems = showcaseRef.current.querySelectorAll(".sc-stat");
      const desc = showcaseRef.current.querySelector(".sc-desc");
      const logoDivider = showcaseRef.current.querySelector(".sc-logo-divider");
      const logos = showcaseRef.current.querySelectorAll(".sc-logo");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroWrapperRef.current,
          start: "top top",
          end: "+=100%",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      tl.to(
        heroRef.current,
        {
          scale: 0.65,
          borderRadius: "24px",
          opacity: 0,
          ease: "none",
        },
        0,
      );

      if (heroContentRef.current) {
        tl.to(
          heroContentRef.current,
          { opacity: 0, scale: 0.9, ease: "none" },
          0,
        );
      }

      if (tagline) {
        tl.fromTo(
          tagline,
          { opacity: 0, y: -30 },
          { opacity: 1, y: 0, ease: "power3.out" },
          0.1,
        );
      }

      if (statItems.length) {
        tl.fromTo(
          statItems,
          { opacity: 0, y: 50, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, stagger: 0.06, ease: "power3.out" },
          0.15,
        );
      }

      if (desc) {
        tl.fromTo(
          desc,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, ease: "power3.out" },
          0.3,
        );
      }

      if (logoDivider) {
        tl.fromTo(
          logoDivider,
          { scaleX: 0 },
          { scaleX: 1, ease: "power2.out" },
          0.35,
        );
      }

      if (logos.length) {
        tl.fromTo(
          logos,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, stagger: 0.03, ease: "power2.out" },
          0.4,
        );
      }
    }

    if (isHomePage && quoteRef.current) {
      const words = quoteRef.current.querySelectorAll(".quote-word");
      if (words.length) {
        gsap.fromTo(
          words,
          {
            opacity: 0,
            filter: "blur(8px)",
            x: -30,
          },
          {
            opacity: 1,
            filter: "blur(0px)",
            x: 0,
            duration: 0.8,
            stagger: 0.06,
            ease: "power3.out",
            scrollTrigger: {
              trigger: quoteRef.current,
              start: "top 80%",
              end: "top 30%",
              scrub: 1,
            },
          },
        );
      }
    }

    if (isHomePage && featuresScrollRef.current && featuresTrackRef.current) {
      const track = featuresTrackRef.current;
      const scrollDistance = Math.max(0, track.scrollWidth - window.innerWidth);

      gsap.to(track, {
        x: -scrollDistance,
        ease: "none",
        scrollTrigger: {
          trigger: featuresScrollRef.current,
          start: "top top",
          end: () => `+=${scrollDistance}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    }

    if ((isHowItWorksPage || isFeaturesPage) && howItWorksRef.current) {
      const heroEls = howItWorksRef.current.querySelectorAll(
        ".analysis-hero-reveal",
      );
      if (heroEls.length) {
        gsap.fromTo(
          heroEls,
          { opacity: 0, y: 24, filter: "blur(8px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.85,
            stagger: 0.1,
            ease: "power3.out",
          },
        );
      }

      const kpiItems = howItWorksRef.current.querySelectorAll(".analysis-kpi");
      if (kpiItems.length) {
        gsap.fromTo(
          kpiItems,
          { opacity: 0, y: 22 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: howItWorksRef.current,
              start: "top 80%",
            },
          },
        );
      }

      const cards = howItWorksRef.current.querySelectorAll(".analysis-card");
      cards.forEach((card) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 38, filter: "blur(8px)", scale: 0.99 },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            scale: 1,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 84%",
              toggleActions: "play none none none",
            },
          },
        );
      });
    }

    if (isFeaturesPage) {
      if (featuresHeroRef.current) {
        const heroEls = featuresHeroRef.current.querySelectorAll(
          ".features-hero-reveal",
        );
        gsap.fromTo(
          heroEls,
          { opacity: 0, y: 26, filter: "blur(8px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.9,
            stagger: 0.12,
            ease: "power3.out",
          },
        );
      }

      if (featuresStatsRef.current) {
        const statItems =
          featuresStatsRef.current.querySelectorAll(".feature-stat");
        gsap.fromTo(
          statItems,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: featuresStatsRef.current,
              start: "top 85%",
            },
          },
        );
      }

      if (featuresCardsRef.current) {
        const cards =
          featuresCardsRef.current.querySelectorAll(".feature-dive-card");
        cards.forEach((card) => {
          gsap.fromTo(
            card,
            { opacity: 0, y: 46, filter: "blur(8px)", scale: 0.985 },
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              scale: 1,
              duration: 0.85,
              ease: "power3.out",
              scrollTrigger: {
                trigger: card,
                start: "top 84%",
                toggleActions: "play none none none",
              },
            },
          );
        });
      }
    }

    if (isPricingPage) {
      if (pricingHeroRef.current) {
        const heroEls = pricingHeroRef.current.querySelectorAll(
          ".pricing-hero-reveal",
        );
        gsap.fromTo(
          heroEls,
          { opacity: 0, y: 22, filter: "blur(8px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out",
          },
        );
      }

      if (pricingStatsRef.current) {
        const statItems =
          pricingStatsRef.current.querySelectorAll(".pricing-stat");
        gsap.fromTo(
          statItems,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: pricingStatsRef.current,
              start: "top 85%",
            },
          },
        );
      }

      if (pricingCardsRef.current) {
        const cards =
          pricingCardsRef.current.querySelectorAll(".pricing-tier-card");
        cards.forEach((card) => {
          gsap.fromTo(
            card,
            { opacity: 0, y: 36, filter: "blur(8px)", scale: 0.99 },
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              scale: 1,
              duration: 0.85,
              ease: "power3.out",
              scrollTrigger: {
                trigger: card,
                start: "top 84%",
                toggleActions: "play none none none",
              },
            },
          );
        });
      }

      if (pricingCompareRef.current) {
        const rows = pricingCompareRef.current.querySelectorAll(
          ".pricing-compare-row",
        );
        gsap.fromTo(
          rows,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.06,
            ease: "power2.out",
            scrollTrigger: {
              trigger: pricingCompareRef.current,
              start: "top 78%",
            },
          },
        );
      }
    }

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [pathname, isFeaturesPage, isHowItWorksPage, isPricingPage]);

  useEffect(() => {
    if (!currentAnalysisSidebarItems.includes(selectedAnalysisItem)) {
      setSelectedAnalysisItem("Dashboard");
    }
  }, [analysisUserType, currentAnalysisSidebarItems, selectedAnalysisItem]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const closeMenu = () => setIsOpen(false);

  const simpleHeader = (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-3 mix-blend-difference">
        <a
          href="/"
          className="text-on-dark font-display text-xl md:text-2xl tracking-widest"
          onClick={closeMenu}
        >
          <BrandLogo
            iconClassName="text-lime"
            textClassName="font-display text-xl md:text-2xl tracking-widest text-on-dark uppercase"
          />
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`font-display text-sm tracking-[0.2em] uppercase transition-colors duration-300 ${
                isNavItemActive(item.href)
                  ? "text-lime"
                  : "text-on-dark hover:text-lime"
              }`}
            >
              {item.label}
            </a>
          ))}
          <a
            href="/signup"
            className="font-display text-sm tracking-[0.2em] uppercase bg-lime text-on-lime px-5 py-2 hover:bg-lime/90 transition-all duration-300 glow-lime-hover"
          >
            Get Started
          </a>
        </nav>

        <button
          onClick={() => setIsOpen((v) => !v)}
          className="md:hidden flex flex-col gap-[5px] z-50 relative"
          aria-label="Toggle menu"
        >
          <span
            className={`block w-6 h-[2px] bg-current text-on-dark transition-all ${isOpen ? "rotate-45 translate-y-[7px]" : ""}`}
          />
          <span
            className={`block w-6 h-[2px] bg-current text-on-dark transition-all ${isOpen ? "opacity-0" : "opacity-100"}`}
          />
          <span
            className={`block w-6 h-[2px] bg-current text-on-dark transition-all ${isOpen ? "-rotate-45 -translate-y-[7px]" : ""}`}
          />
        </button>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-dark flex flex-col items-center justify-center gap-8 overflow-hidden md:hidden transition-opacity duration-200 ${
          isOpen
            ? "opacity-100 visible pointer-events-auto"
            : "opacity-0 invisible pointer-events-none"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--lime)_/_0.18),transparent_35%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,hsl(var(--dark-card))_0%,hsl(var(--dark))_100%)] opacity-95" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime/40 to-transparent" />

        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={closeMenu}
            className={`relative z-10 font-display text-4xl tracking-widest uppercase transition-colors ${
              isNavItemActive(item.href)
                ? "text-lime"
                : "text-on-dark hover:text-lime"
            }`}
          >
            {item.label}
          </a>
        ))}

        <p className="absolute bottom-8 text-lime/50 text-xs font-body tracking-widest uppercase">
          {companyInfo.tagline}
        </p>
      </div>
    </>
  );

  if (isFeaturesPage) {
    return (
      <div key="features-page" className="lp-root bg-dark min-h-screen">
        {simpleHeader}
        <section
          ref={featuresHeroRef}
          className="features-hero-shell relative z-20 pt-[92px] md:pt-[104px] pb-16 md:pb-20 px-6 md:px-12"
          style={{
            background:
              "linear-gradient(180deg, hsl(220 8% 5%) 0%, hsl(220 8% 7%) 100%)",
          }}
        >
          <div className="max-w-7xl mx-auto">
            <p className="features-hero-reveal font-body text-xs tracking-[0.28em] uppercase text-lime/70 mb-5">
              Features
            </p>
            <h1 className="features-hero-reveal font-display text-[6rem] md:text-[11rem] lg:text-[12rem] leading-[0.84] text-on-dark uppercase tracking-[-0.02em]">
              Features
            </h1>
            <p className="features-hero-reveal font-body text-[1.05rem] text-muted-dark mt-7 max-w-2xl leading-relaxed">
              Everything your team needs for international communication -
              calling, meetings, billing, and security.
            </p>
          </div>
        </section>

        <section
          ref={featuresStatsRef}
          className="relative z-20 bg-dark-lighter"
        >
          <div className="grid grid-cols-2 md:grid-cols-4">
            {stats.map((item) => (
              <div
                key={item.label}
                className="feature-stat text-center px-6 py-10 md:px-8 md:py-12 border-l border-lime/10 first:border-l-0"
              >
                <p className="font-display text-[3.1rem] md:text-[3.4rem] text-lime leading-none mb-2 tracking-[-0.015em]">
                  {item.value}
                </p>
                <p className="font-display text-[0.8rem] tracking-[0.21em] uppercase text-muted-dark">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          ref={howItWorksRef}
          id="analysis"
          className="features-hero-shell relative z-20 pt-20 md:pt-24 pb-16 md:pb-20 px-6 md:px-12 overflow-hidden"
          style={{
            background:
              "linear-gradient(180deg, hsl(220 8% 7%) 0%, hsl(220 8% 9%) 100%)",
          }}
        >
          <div className="relative z-10 max-w-7xl mx-auto">
            <p className="analysis-hero-reveal font-body text-[1.05rem] text-muted-dark max-w-2xl mt-5 leading-relaxed mb-10">
              Track performance across calls, minutes, shares, growth, and
              outreach with real-time visibility and actionable insights.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 md:gap-10 items-stretch mt-3 md:mt-5">
              <div className="analysis-hero-reveal h-full flex flex-col">
                <div className="mb-3 p-1 flex items-center gap-1 bg-dark-lighter border border-lime/15 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setAnalysisUserType("normal")}
                    className={`flex-1 px-3 py-2 text-[10px] md:text-xs tracking-[0.12em] uppercase font-display rounded-lg transition-all duration-300 ${
                      analysisUserType === "normal"
                        ? "bg-lime text-on-lime"
                        : "text-muted-dark hover:text-on-dark"
                    }`}
                  >
                    Normal User
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnalysisUserType("company")}
                    className={`flex-1 px-3 py-2 text-[10px] md:text-xs tracking-[0.12em] uppercase font-display rounded-lg transition-all duration-300 ${
                      analysisUserType === "company"
                        ? "bg-lime text-on-lime"
                        : "text-muted-dark hover:text-on-dark"
                    }`}
                  >
                    Company User
                  </button>
                </div>

                <aside className="bg-dark-lighter/70 border border-lime/10 rounded-2xl p-5 md:p-6 flex-1">
                  <div className="flex items-center gap-4 pb-5 border-b border-lime/10">
                    <div className="w-14 h-14 rounded-xl bg-lime/20 flex items-center justify-center text-2xl">
                      CF
                    </div>
                    <div>
                      <p className="font-display text-2xl text-on-dark normal-case tracking-normal">
                        CallFlow
                      </p>
                      <p className="text-xs text-muted-dark font-body mt-1">
                        {analysisUserType === "company"
                          ? "Performance Workspace"
                          : "Personal Workspace"}
                      </p>
                    </div>
                  </div>

                  <nav className="mt-5 flex flex-col gap-2">
                    {currentAnalysisSidebarItems.map((item) => {
                      const isActive = selectedAnalysisItem === item;
                      return (
                        <button
                          type="button"
                          key={item}
                          onClick={() => setSelectedAnalysisItem(item)}
                          className={`analysis-hero-reveal flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 ${
                            isActive
                              ? "bg-lime/15 text-lime"
                              : "text-muted-dark hover:bg-dark-card hover:text-on-dark"
                          }`}
                        >
                          <span className="font-body text-base md:text-lg">
                            {item}
                          </span>
                          {isActive ? (
                            <span className="text-lime">o</span>
                          ) : null}
                        </button>
                      );
                    })}
                  </nav>
                </aside>
              </div>

              <div className="lg:mt-12">
                {analysisUserType === "company" ? (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
                    {activeAnalysisContent.metrics.map((item) => (
                      <div
                        key={item.label}
                        className="analysis-kpi text-left px-4 py-4 border border-lime/10 bg-dark-card"
                      >
                        <p className="font-display text-2xl md:text-3xl text-lime leading-none mb-1">
                          {item.value}
                        </p>
                        <p className="font-display text-[0.6rem] tracking-[0.18em] uppercase text-muted-dark">
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {activeAnalysisContent.cards.map((item, idx) => {
                    const isLastOddCard =
                      activeAnalysisContent.cards.length % 2 === 1 &&
                      idx === activeAnalysisContent.cards.length - 1;

                    return (
                      <div
                        key={item.title}
                        className={`analysis-card p-6 md:p-7 border border-lime/10 bg-dark-card ${isLastOddCard ? "md:col-span-2" : ""}`}
                      >
                        <div className="text-3xl mb-3 text-lime">
                          {item.icon}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-[10px] px-2 py-1 uppercase tracking-widest bg-lime/15 text-lime font-display">
                            {item.category}
                          </span>
                          <span className="text-[11px] text-muted-dark font-body uppercase tracking-wider">
                            {item.subtitle}
                          </span>
                        </div>
                        <h2 className="font-display text-xl md:text-2xl text-on-dark uppercase mb-2">
                          {item.title}
                        </h2>
                        <p className="font-body text-sm text-muted-dark leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          ref={featuresCardsRef}
          className="relative z-20 pt-20 md:pt-24 pb-24 md:pb-32 px-6 bg-dark"
        >
          <div className="max-w-6xl mx-auto">
            <div className="mb-14 md:mb-16 max-w-3xl">
              <h2 className="font-display text-5xl md:text-7xl leading-[0.9] text-on-dark uppercase">
                Deep <span className="text-lime">Dive</span>
              </h2>
              <p className="mt-5 font-body text-[1.15rem] text-muted-dark leading-relaxed">
                Explore every capability that makes CallFlow the most complete
                browser-based communication platform.
              </p>
            </div>

            <div className="space-y-6">
              {featureDeepDive.map((item) => (
                <div
                  key={item.title}
                  className="feature-dive-card grid grid-cols-1 md:grid-cols-[90px_1fr] gap-5 p-6 md:p-8 border bg-dark-card"
                  style={{
                    borderColor: "hsl(var(--lime-dark) / 0.22)",
                    background:
                      "linear-gradient(180deg, hsl(220 8% 9%) 0%, hsl(220 8% 8%) 100%)",
                  }}
                >
                  <div className="text-4xl text-lime">{item.icon}</div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-[10px] px-2 py-1 uppercase tracking-widest bg-lime/15 text-lime font-display">
                        {item.category}
                      </span>
                      <span className="text-[11px] text-muted-dark font-body uppercase tracking-wider">
                        {item.subtitle}
                      </span>
                    </div>
                    <h2 className="font-display text-2xl text-on-dark uppercase mb-2">
                      {item.title}
                    </h2>
                    <p className="font-body text-sm text-muted-dark leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <LandingFooter />
      </div>
    );
  }

  if (isHowItWorksPage) {
    return (
      <div key="analysis-page" className="lp-root bg-dark min-h-screen">
        {simpleHeader}
        <section
          ref={howItWorksRef}
          className="features-hero-shell relative z-20 pt-[122px] md:pt-[146px] pb-16 md:pb-20 px-6 md:px-12 overflow-hidden"
          style={{
            background:
              "linear-gradient(180deg, hsl(220 8% 7%) 0%, hsl(220 8% 9%) 100%)",
          }}
        >
          <div className="relative z-10 max-w-7xl mx-auto">
            <p className="analysis-hero-reveal font-body text-[1.05rem] text-muted-dark max-w-2xl mt-5 leading-relaxed mb-10">
              Track performance across calls, minutes, shares, growth, and
              outreach with real-time visibility and actionable insights.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 md:gap-10 items-stretch mt-3 md:mt-5">
              <div className="analysis-hero-reveal h-full flex flex-col">
                <div className="mb-3 p-1 flex items-center gap-1 bg-dark-lighter border border-lime/15 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setAnalysisUserType("normal")}
                    className={`flex-1 px-3 py-2 text-[10px] md:text-xs tracking-[0.12em] uppercase font-display rounded-lg transition-all duration-300 ${
                      analysisUserType === "normal"
                        ? "bg-lime text-on-lime"
                        : "text-muted-dark hover:text-on-dark"
                    }`}
                  >
                    Normal User
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnalysisUserType("company")}
                    className={`flex-1 px-3 py-2 text-[10px] md:text-xs tracking-[0.12em] uppercase font-display rounded-lg transition-all duration-300 ${
                      analysisUserType === "company"
                        ? "bg-lime text-on-lime"
                        : "text-muted-dark hover:text-on-dark"
                    }`}
                  >
                    Company User
                  </button>
                </div>

                <aside className="bg-dark-lighter/70 border border-lime/10 rounded-2xl p-5 md:p-6 flex-1">
                  <div className="flex items-center gap-4 pb-5 border-b border-lime/10">
                    <div className="w-14 h-14 rounded-xl bg-lime/20 flex items-center justify-center text-2xl">
                      CF
                    </div>
                    <div>
                      <p className="font-display text-2xl text-on-dark normal-case tracking-normal">
                        CallFlow
                      </p>
                      <p className="text-xs text-muted-dark font-body mt-1">
                        {analysisUserType === "company"
                          ? "Performance Workspace"
                          : "Personal Workspace"}
                      </p>
                    </div>
                  </div>

                  <nav className="mt-5 flex flex-col gap-2">
                    {currentAnalysisSidebarItems.map((item) => {
                      const isActive = selectedAnalysisItem === item;
                      return (
                        <button
                          type="button"
                          key={item}
                          onClick={() => setSelectedAnalysisItem(item)}
                          className={`analysis-hero-reveal flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 ${
                            isActive
                              ? "bg-lime/15 text-lime"
                              : "text-muted-dark hover:bg-dark-card hover:text-on-dark"
                          }`}
                        >
                          <span className="font-body text-base md:text-lg">
                            {item}
                          </span>
                          {isActive ? (
                            <span className="text-lime">o</span>
                          ) : null}
                        </button>
                      );
                    })}
                  </nav>
                </aside>
              </div>

              <div className="lg:mt-12">
                {analysisUserType === "company" ? (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
                    {activeAnalysisContent.metrics.map((item) => (
                      <div
                        key={item.label}
                        className="analysis-kpi text-left px-4 py-4 border border-lime/10 bg-dark-card"
                      >
                        <p className="font-display text-2xl md:text-3xl text-lime leading-none mb-1">
                          {item.value}
                        </p>
                        <p className="font-display text-[0.6rem] tracking-[0.18em] uppercase text-muted-dark">
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {activeAnalysisContent.cards.map((item, idx) => {
                    const isLastOddCard =
                      activeAnalysisContent.cards.length % 2 === 1 &&
                      idx === activeAnalysisContent.cards.length - 1;

                    return (
                      <div
                        key={item.title}
                        className={`analysis-card p-6 md:p-7 border border-lime/10 bg-dark-card ${isLastOddCard ? "md:col-span-2" : ""}`}
                      >
                        <div className="text-3xl mb-3 text-lime">
                          {item.icon}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-[10px] px-2 py-1 uppercase tracking-widest bg-lime/15 text-lime font-display">
                            {item.category}
                          </span>
                          <span className="text-[11px] text-muted-dark font-body uppercase tracking-wider">
                            {item.subtitle}
                          </span>
                        </div>
                        <h2 className="font-display text-xl md:text-2xl text-on-dark uppercase mb-2">
                          {item.title}
                        </h2>
                        <p className="font-body text-sm text-muted-dark leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <LandingFooter />
      </div>
    );
  }

  if (isPricingPage) {
    return (
      <div key="pricing-page" className="lp-root bg-dark min-h-screen">
        {simpleHeader}
        <section
          ref={pricingHeroRef}
          className="features-hero-shell relative z-20 pt-[92px] md:pt-[104px] pb-16 md:pb-20 px-6 md:px-12 overflow-hidden"
          style={{
            background:
              "linear-gradient(180deg, hsl(220 8% 7%) 0%, hsl(220 8% 10%) 50%, hsl(220 8% 7%) 100%)",
          }}
          id="pricing"
        >
          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="mb-8 md:mb-10">
              <p className="pricing-hero-reveal text-lime font-body text-xs tracking-[0.3em] uppercase mb-5">
                Pricing
              </p>
              <h1 className="pricing-hero-reveal font-display text-[6rem] md:text-[11rem] lg:text-[12rem] leading-[0.84] text-on-dark uppercase tracking-[-0.02em]">
                Pricing
              </h1>
              <p className="pricing-hero-reveal font-body text-[1.05rem] text-muted-dark max-w-2xl mt-5 leading-relaxed">
                Transparent pricing for teams of every size. Start free, scale
                as you grow.
              </p>
            </div>
          </div>
        </section>

        <section
          ref={pricingStatsRef}
          className="relative z-20 bg-dark-lighter"
        >
          <div className="grid grid-cols-2 md:grid-cols-4">
            {stats.map((item) => (
              <div
                key={item.label}
                className="pricing-stat text-center px-6 py-10 md:px-8 md:py-12 border-l border-lime/10 first:border-l-0"
              >
                <p className="font-display text-[3.1rem] md:text-[3.4rem] text-lime leading-none mb-2 tracking-[-0.015em]">
                  {item.value}
                </p>
                <p className="font-display text-[0.8rem] tracking-[0.21em] uppercase text-muted-dark">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          className="relative z-20 pt-16 md:pt-20 pb-16 md:pb-20 px-6 overflow-hidden"
          style={{
            background:
              "linear-gradient(180deg, hsl(220 8% 8%) 0%, hsl(220 8% 10%) 50%, hsl(220 8% 7%) 100%)",
          }}
        >
          <div className="relative z-10 max-w-6xl mx-auto">
            <div className="mb-14 md:mb-16 max-w-3xl">
              <h2 className="font-display text-5xl md:text-7xl leading-[0.9] text-on-dark uppercase">
                Pricing <span className="text-lime">Details</span>
              </h2>
              <p className="mt-5 font-body text-[1.15rem] text-muted-dark leading-relaxed">
                Pick the right plan for your team and scale globally with
                transparent billing.
              </p>
            </div>

            <div
              id="pricing-details"
              ref={pricingCardsRef}
              className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 items-stretch"
            >
              {fullPricingTiers.map((tier) => (
                <div
                  key={tier.id}
                  className={`pricing-tier-card p-8 border h-full ${tier.highlighted ? "bg-dark-lighter" : "bg-dark-card"}`}
                  style={{
                    borderColor: tier.highlighted
                      ? "hsl(var(--lime-dark) / 0.5)"
                      : "hsl(var(--lime-dark) / 0.2)",
                    background: tier.highlighted
                      ? "linear-gradient(180deg, hsl(38 30% 11%) 0%, hsl(220 8% 10%) 100%)"
                      : "linear-gradient(180deg, hsl(220 8% 9%) 0%, hsl(220 8% 8%) 100%)",
                  }}
                >
                  <p className="font-display text-sm tracking-widest uppercase text-lime mb-2">
                    {tier.name}
                  </p>
                  <div className="flex items-end gap-1 mb-2">
                    <p className="font-display text-5xl text-on-dark">
                      {tier.price}
                    </p>
                    <p className="font-body text-sm text-muted-dark pb-1">
                      {tier.period}
                    </p>
                  </div>
                  <p className="font-body text-sm text-muted-dark mb-6">
                    {tier.description}
                  </p>
                  <ul className="space-y-2 mb-8">
                    {tier.features.map((f) => (
                      <li
                        key={`${tier.id}-${f}`}
                        className="font-body text-sm text-on-dark flex items-start gap-2"
                      >
                        <span className="text-lime">+</span>
                        <span>
                          {f.includes("(Coming soon)") ? (
                            <>
                              {f.replace(" (Coming soon)", "")}{" "}
                              <span className="text-lime">(Coming soon)</span>
                            </>
                          ) : (
                            f
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href={
                      tier.id === "enterprise-full" ? "/contact" : "/signup"
                    }
                    className={`mt-auto block w-full text-center font-display text-sm tracking-[0.2em] uppercase px-6 py-3 transition-all duration-300 ${
                      tier.highlighted
                        ? "bg-lime text-on-lime hover:bg-lime/90 glow-lime-hover"
                        : "border border-lime/30 text-on-dark hover:border-lime hover:text-lime"
                    }`}
                  >
                    {tier.cta}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          ref={pricingCompareRef}
          className="relative z-20 py-16 md:py-20 px-6 bg-dark"
        >
          <div className="max-w-6xl mx-auto">
            <h2 className="font-display text-4xl md:text-7xl text-on-dark uppercase mb-8 md:mb-10">
              Compare <span className="text-lime">Plans</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse">
                <thead>
                  <tr className="border-b border-lime/20">
                    <th className="text-left py-4 font-display text-xs tracking-[0.2em] uppercase text-muted-dark">
                      Feature
                    </th>
                    <th className="text-center py-4 font-display text-xs tracking-[0.2em] uppercase text-muted-dark">
                      Starter
                    </th>
                    <th className="text-center py-4 font-display text-xs tracking-[0.2em] uppercase text-lime">
                      Business
                    </th>
                    <th className="text-center py-4 font-display text-xs tracking-[0.2em] uppercase text-muted-dark">
                      Enterprise
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, idx) => (
                    <tr
                      key={row.feature}
                      className={`pricing-compare-row ${idx % 2 === 0 ? "bg-dark/20 border-b border-lime/10" : "border-b border-lime/10"}`}
                    >
                      <td className="py-4 text-on-dark font-body text-sm md:text-lg">
                        {row.feature}
                      </td>
                      <td className="py-4 text-center text-muted-dark font-body text-sm md:text-2xl">
                        {row.starter}
                      </td>
                      <td className="py-4 text-center text-lime font-body text-sm md:text-2xl">
                        {row.business}
                      </td>
                      <td className="py-4 text-center text-muted-dark font-body text-sm md:text-2xl">
                        {row.enterprise}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="relative z-20 py-20 md:py-24 px-6 bg-dark-lighter">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-4xl md:text-6xl text-on-dark uppercase text-center mb-12">
              Frequently <span className="font-serif-accent">Asked</span>
            </h2>

            <div className="space-y-4">
              {faqs.map((item, idx) => {
                const isOpenFaq = openFaqIndex === idx;
                return (
                  <div
                    key={item.q}
                    className="border border-lime/15 bg-dark-card rounded-md overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setOpenFaqIndex((prev) => (prev === idx ? null : idx))
                      }
                      className="w-full text-left px-6 py-5 flex items-center justify-between gap-4"
                    >
                      <span className="font-display text-base md:text-lg text-on-dark uppercase leading-tight">
                        {item.q}
                      </span>
                      <span className="font-display text-2xl text-lime leading-none">
                        {isOpenFaq ? "-" : "+"}
                      </span>
                    </button>

                    {isOpenFaq ? (
                      <div className="px-6 pb-6">
                        <p className="font-body text-sm text-muted-dark leading-relaxed">
                          {item.a}
                        </p>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <LandingFooter />
      </div>
    );
  }

  return (
    <div key="home-page" className="lp-root bg-dark min-h-screen" id="home">
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 mix-blend-difference">
        <a
          href="#home"
          className="text-on-dark font-display text-xl md:text-2xl tracking-widest"
          onClick={closeMenu}
        >
          <BrandLogo
            iconClassName="text-lime"
            textClassName="font-display text-xl md:text-2xl tracking-widest text-on-dark uppercase"
          />
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`font-display text-sm tracking-[0.2em] uppercase transition-colors duration-300 ${
                isNavItemActive(item.href)
                  ? "text-lime"
                  : "text-on-dark hover:text-lime"
              }`}
            >
              {item.label}
            </a>
          ))}
          <a
            href="/signup"
            className="font-display text-sm tracking-[0.2em] uppercase bg-lime text-on-lime px-5 py-2 hover:bg-lime/90 transition-all duration-300 glow-lime-hover"
          >
            Get Started
          </a>
        </nav>

        <button
          onClick={() => setIsOpen((v) => !v)}
          className="md:hidden flex flex-col gap-[5px] z-50 relative"
          aria-label="Toggle menu"
        >
          <span
            className={`block w-6 h-[2px] bg-current text-on-dark transition-all ${isOpen ? "rotate-45 translate-y-[7px]" : ""}`}
          />
          <span
            className={`block w-6 h-[2px] bg-current text-on-dark transition-all ${isOpen ? "opacity-0" : "opacity-100"}`}
          />
          <span
            className={`block w-6 h-[2px] bg-current text-on-dark transition-all ${isOpen ? "-rotate-45 -translate-y-[7px]" : ""}`}
          />
        </button>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-dark flex flex-col items-center justify-center gap-8 overflow-hidden md:hidden transition-opacity duration-200 ${
          isOpen
            ? "opacity-100 visible pointer-events-auto"
            : "opacity-0 invisible pointer-events-none"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--lime)_/_0.18),transparent_35%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,hsl(var(--dark-card))_0%,hsl(var(--dark))_100%)] opacity-95" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime/40 to-transparent" />

        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={closeMenu}
            className={`relative z-10 font-display text-4xl tracking-widest uppercase transition-colors ${
              isNavItemActive(item.href)
                ? "text-lime"
                : "text-on-dark hover:text-lime"
            }`}
          >
            {item.label}
          </a>
        ))}

        <p className="absolute bottom-8 text-lime/50 text-xs font-body tracking-widest uppercase">
          {companyInfo.tagline}
        </p>
      </div>

      <div ref={heroWrapperRef} className="hero-zoom-wrapper">
        <div ref={showcaseRef} className="hero-showcase-bg">
          <p className="sc-tagline">TRUSTED BY TEAMS WORLDWIDE</p>
          <div className="sc-stats-row">
            {showcaseStats.map((stat) => (
              <div key={stat.label} className="sc-stat">
                <span className="sc-stat-number">{stat.number}</span>
                <span className="sc-stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
          <p className="sc-desc">
            One platform for calls, meetings, and enterprise voice - from any
            browser, anywhere.
          </p>
        </div>

        <section
          ref={heroRef}
          className="absolute inset-0 z-10 overflow-hidden flex items-center justify-center"
          style={{ transformOrigin: "center center" }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 30%, hsl(var(--lime) / 0.08) 0%, hsl(220 8% 6%) 70%)",
            }}
          >
            <canvas
              ref={particleCanvasRef}
              className="absolute inset-0 pointer-events-none"
            />
            <div
              className="absolute inset-0 opacity-[0.2]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 20%, hsl(var(--lime) / 0.4) 1px, transparent 1px), radial-gradient(circle at 80% 30%, hsl(var(--lime) / 0.3) 1px, transparent 1px), radial-gradient(circle at 40% 80%, hsl(var(--lime) / 0.3) 1px, transparent 1px)",
                backgroundSize: "220px 220px, 260px 260px, 200px 200px",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-dark/40 via-transparent to-dark" />
          </div>

          <div
            ref={heroContentRef}
            className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto"
          >
            <h1 className="font-display text-[clamp(3.75rem,18vw,5.5rem)] sm:text-[7rem] md:text-[11rem] lg:text-[13rem] xl:text-[15rem] leading-[0.82] text-on-dark tracking-tighter">
              CALLFLOW
            </h1>
            <p className="text-muted-dark font-body text-base md:text-lg max-w-2xl mx-auto mt-8">
              {companyInfo.description}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#pricing"
                className="inline-block font-display text-sm tracking-[0.2em] uppercase bg-lime text-on-lime px-8 py-4 hover:bg-lime/90 transition-all duration-300 glow-lime"
              >
                Start Free Trial
              </a>
              <a
                href="/features"
                className="inline-block font-display text-sm tracking-[0.2em] uppercase text-on-dark border border-lime/30 px-8 py-4 hover:border-lime hover:text-lime transition-all duration-300"
              >
                Explore Features
              </a>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <div className="w-[1px] h-12 bg-gradient-to-b from-lime/0 to-lime animate-pulse" />
          </div>
        </section>
      </div>

      <div className="bg-dark py-3 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="mx-8 font-display text-sm text-lime tracking-[0.3em] uppercase"
            >
              {companyInfo.tagline}
            </span>
          ))}
        </div>
      </div>

      <section
        className="relative py-28 md:py-44 px-6 overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, hsl(var(--lime) / 0.04) 0%, hsl(220 8% 6%) 60%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--lime)) 1px, transparent 1px)",
            backgroundSize: "100% 60px",
          }}
        />

        <div
          ref={quoteRef}
          className="relative z-10 max-w-5xl mx-auto text-center"
        >
          <p
            className="text-lime font-body text-xs tracking-[0.3em] uppercase mb-10 quote-word"
            style={{ display: "inline-block" }}
          >
            Why CallFlow
          </p>
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl text-on-dark leading-[1.1] tracking-tight uppercase">
            <span className="quote-word font-serif-accent">Powering</span>{" "}
            <span className="quote-word">modern</span>{" "}
            <span className="quote-word">teams.</span>{" "}
            <span className="quote-word">One</span>{" "}
            <span className="quote-word">platform</span>{" "}
            <span className="quote-word">for</span>{" "}
            <span className="quote-word font-serif-accent">calls,</span>{" "}
            <span className="quote-word font-serif-accent">calendar</span>{" "}
            <span className="quote-word font-serif-accent">features,</span>{" "}
            <span className="quote-word">team</span>{" "}
            <span className="quote-word font-serif-accent">meetings,</span>{" "}
            <span className="quote-word">and</span>{" "}
            <span className="quote-word font-serif-accent">virtual</span>{" "}
            <span className="quote-word font-serif-accent">number</span>{" "}
            <span className="quote-word font-serif-accent">allocation.</span>
          </h2>
        </div>
      </section>

      <section
        ref={featuresScrollRef}
        className="relative h-screen overflow-hidden"
        id="features"
      >
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 opacity-[0.25]"
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--lime-dark)) 2px, transparent 2px), linear-gradient(90deg, hsl(var(--lime-dark)) 2px, transparent 2px)",
              backgroundSize: "120px 120px",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 50%, hsl(var(--lime) / 0.04) 0%, transparent 60%)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-dark via-transparent to-dark" />
          <div className="absolute inset-0 bg-gradient-to-b from-dark via-transparent to-dark opacity-60" />
        </div>

        <div
          ref={featuresTrackRef}
          className="absolute top-0 left-0 flex items-center gap-8 h-full"
          style={{ paddingLeft: "4vw", paddingRight: "20vw" }}
        >
          <div className="flex-shrink-0 w-[320px] md:w-[380px] flex flex-col justify-center pr-4">
            <p className="text-lime font-body text-xs tracking-[0.3em] uppercase mb-4">
              + Premium Features
            </p>
            <h2 className="font-display text-3xl md:text-5xl text-on-dark leading-[1.05] uppercase mb-2">
              Built for teams,
            </h2>
            <h3 className="font-display text-2xl md:text-4xl leading-tight uppercase mb-4">
              <span className="font-serif-accent">powered by simplicity</span>
            </h3>
            <p className="text-muted-dark font-body text-xs leading-relaxed max-w-[280px]">
              Everything you need for seamless global communication, wrapped in
              a beautiful interface.
            </p>
          </div>

          {premiumFeatures.map((feat, i) => (
            <div
              key={feat.title}
              className="pf-card flex-shrink-0 w-[280px] md:w-[300px] bg-dark-lighter border border-lime/10 p-6 hover:border-lime/30 transition-all duration-500 group rounded-sm"
              style={{ marginTop: i % 2 === 0 ? "-60px" : "60px" }}
            >
              <h4 className="font-display text-lg text-on-dark tracking-wider mb-1.5 group-hover:text-lime transition-colors">
                {feat.title}
              </h4>
              <p className="font-body text-[11px] text-muted-dark leading-relaxed mb-5">
                {feat.desc}
              </p>
              <div className="space-y-2">
                {feat.stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center justify-between border-t border-lime/5 pt-1.5"
                  >
                    <span className="font-body text-[10px] text-muted-dark">
                      {stat.label}
                    </span>
                    <span className="font-display text-xs text-lime tracking-wider">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-20 bg-dark-lighter py-24 md:py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-display text-2xl md:text-4xl text-on-dark leading-snug">
            {companyInfo.secondQuote}
          </p>
        </div>
      </section>

      <section
        ref={howItWorksRef}
        className="relative z-20 py-[4.5rem] md:py-24 px-6 overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, hsl(220 8% 7%) 0%, hsl(220 8% 9%) 100%)",
        }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <svg
            className="absolute w-full h-full opacity-[0.06]"
            viewBox="0 0 1200 600"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M0,200 C300,100 600,350 1200,150"
              stroke="hsl(var(--lime-dark))"
              strokeWidth="1.5"
            />
            <path
              d="M0,400 C400,300 800,500 1200,350"
              stroke="hsl(var(--lime-dark))"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <p className="text-lime font-body text-xs tracking-[0.3em] uppercase mb-6 text-center">
            Simple Process
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-0">
            <div className="text-center px-7 py-9 md:border-r border-lime/10 hiw-step">
              <div className="mb-6">
                <span
                  className="font-serif-accent text-7xl md:text-[8rem] leading-none"
                  style={{
                    WebkitTextStroke: "1.5px hsl(var(--lime-dark))",
                    color: "transparent",
                  }}
                >
                  01
                </span>
              </div>
              <h3 className="font-display text-3xl md:text-4xl text-on-dark uppercase leading-none mb-2">
                Open
              </h3>
              <h4 className="font-display text-2xl md:text-3xl uppercase leading-none mb-6">
                <span className="font-serif-accent">Your Browser</span>
              </h4>
              <p className="font-body text-sm text-muted-dark leading-relaxed max-w-[240px] mx-auto">
                No downloads needed. Simply visit our website from any modern
                browser on desktop or mobile.
              </p>
            </div>

            <div className="text-center px-7 py-9 md:border-r border-lime/10 hiw-step">
              <div className="mb-6">
                <span
                  className="font-serif-accent text-7xl md:text-[8rem] leading-none"
                  style={{
                    WebkitTextStroke: "1.5px hsl(var(--lime-dark))",
                    color: "transparent",
                  }}
                >
                  02
                </span>
              </div>
              <h3 className="font-display text-3xl md:text-4xl text-on-dark uppercase leading-none mb-2">
                Create Free
              </h3>
              <h4 className="font-display text-2xl md:text-3xl uppercase leading-none mb-6">
                <span className="font-serif-accent">Account</span>
              </h4>
              <p className="font-body text-sm text-muted-dark leading-relaxed max-w-[240px] mx-auto">
                Quick signup with email or Google. Add credits to your wallet
                and you are ready to call anywhere.
              </p>
            </div>

            <div className="text-center px-7 py-9 hiw-step">
              <div className="mb-6">
                <span
                  className="font-serif-accent text-7xl md:text-[8rem] leading-none"
                  style={{
                    WebkitTextStroke: "1.5px hsl(var(--lime-dark))",
                    color: "transparent",
                  }}
                >
                  03
                </span>
              </div>
              <h3 className="font-display text-3xl md:text-4xl text-on-dark uppercase leading-none mb-2">
                Start Calling
              </h3>
              <h4 className="font-display text-2xl md:text-3xl uppercase leading-none mb-6">
                <span className="font-serif-accent">Worldwide</span>
              </h4>
              <p className="font-body text-sm text-muted-dark leading-relaxed max-w-[240px] mx-auto">
                Dial any number worldwide with crystal-clear HD quality. Track
                usage and manage contacts easily.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 px-8 py-4 font-display text-sm uppercase tracking-widest transition-all duration-300 hover:scale-105"
              style={{
                background: "hsl(var(--lime-dark))",
                color: "hsl(220 8% 10%)",
              }}
            >
              Get Started Free -&gt;
            </a>
            <p className="font-body text-xs mt-4 text-muted-dark">
              No credit card required
            </p>
          </div>
        </div>
      </section>

      <section
        className="relative z-20 pt-24 md:pt-32 pb-24 md:pb-36 px-6 overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, hsl(220 8% 7%) 0%, hsl(220 8% 10%) 50%, hsl(220 8% 7%) 100%)",
        }}
        id="pricing"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 left-[8%] w-[420px] h-[420px] rounded-full bg-lime/10 blur-[120px] opacity-45" />
          <div className="absolute top-[14%] right-[10%] w-[360px] h-[360px] rounded-full bg-lime/8 blur-[110px] opacity-35" />
          <div className="absolute bottom-[-120px] left-[35%] w-[520px] h-[320px] rounded-full bg-lime/6 blur-[130px] opacity-40" />
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--lime) / 0.35) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--lime) / 0.35) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_28%,hsl(var(--lime)_/_0.08),transparent_40%),radial-gradient(circle_at_72%_32%,hsl(var(--lime)_/_0.06),transparent_42%)]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-lime font-body text-xs tracking-[0.3em] uppercase mb-5">
              Pricing
            </p>
            <h2 className="font-display text-4xl md:text-6xl text-on-dark leading-tight uppercase">
              Simple plans
            </h2>
            <h3 className="font-display text-3xl md:text-5xl leading-tight uppercase">
              <span className="font-serif-accent">for serious calling</span>
            </h3>
            <p className="font-body text-sm text-muted-dark max-w-2xl mx-auto mt-5">
              The homepage gives a quick pricing snapshot. See full plan
              details, feature comparison, and FAQ below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {pricingTiers.map((tier) => (
              <div
                key={tier.id}
                className={`relative p-8 h-full transition-all duration-500 hover:-translate-y-1 flex flex-col ${tier.highlighted ? "md:scale-[1.02]" : ""}`}
                style={{
                  background: tier.highlighted
                    ? "linear-gradient(180deg, hsl(220 8% 14%) 0%, hsl(220 8% 10%) 100%)"
                    : "linear-gradient(180deg, hsl(220 8% 13%) 0%, hsl(220 8% 10%) 100%)",
                  border: tier.highlighted
                    ? "1px solid hsl(var(--lime-dark) / 0.25)"
                    : "1px solid hsl(var(--lime-dark) / 0.08)",
                  borderRadius: "8px",
                }}
              >
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <p className="font-display text-sm text-muted-dark tracking-widest uppercase mb-2">
                      {tier.name}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-5xl text-on-dark">
                        {tier.price}
                      </span>
                      <span className="font-body text-sm text-muted-dark">
                        {tier.period}
                      </span>
                    </div>
                  </div>
                  {tier.highlighted ? (
                    <span
                      className="font-display text-[10px] uppercase tracking-wider px-3 py-1"
                      style={{
                        background: "hsl(var(--lime-dark))",
                        color: "hsl(220 8% 10%)",
                        borderRadius: "3px",
                      }}
                    >
                      Popular
                    </span>
                  ) : null}
                </div>

                <p className="font-body text-sm text-muted-dark mb-6">
                  {tier.description}
                </p>

                <div className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <span className="text-lime text-xs">+</span>
                      <span className="font-body text-sm text-on-dark">
                        {feature.includes("(Coming soon)") ? (
                          <>
                            {feature.replace(" (Coming soon)", "")}{" "}
                            <span className="text-lime">(Coming soon)</span>
                          </>
                        ) : (
                          feature
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                <a
                  href="/pricing"
                  className="mt-auto inline-block font-display text-sm tracking-[0.2em] uppercase text-lime hover:text-on-dark hover:bg-lime border border-lime/30 px-6 py-3 transition-all duration-300 text-center"
                >
                  More Details
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-20 py-24 md:py-32 px-6 bg-dark-lighter">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-4xl md:text-6xl text-on-dark uppercase text-center mb-12">
            Frequently <span className="font-serif-accent">Asked</span>
          </h2>

          <div className="space-y-4">
            {faqs.map((item, idx) => {
              const isOpenFaq = openFaqIndex === idx;
              return (
                <div
                  key={item.q}
                  className="border border-lime/15 bg-dark-card rounded-md overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setOpenFaqIndex((prev) => (prev === idx ? null : idx))
                    }
                    className="w-full text-left px-6 py-5 flex items-center justify-between gap-4"
                  >
                    <span className="font-display text-base md:text-lg text-on-dark uppercase leading-tight">
                      {item.q}
                    </span>
                    <span className="font-display text-2xl text-lime leading-none">
                      {isOpenFaq ? "-" : "+"}
                    </span>
                  </button>

                  {isOpenFaq ? (
                    <div className="px-6 pb-6">
                      <p className="font-body text-sm text-muted-dark leading-relaxed">
                        {item.a}
                      </p>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <LandingFooter />
      <LandingSupportChatbot />
    </div>
  );
};

export default LandingPage;
