// CallFlow International — Content Data

export const companyInfo = {
  name: "CallFlow International",
  shortName: "CallFlow",
  product: "CallFlow Pro",
  tagline: "Global Communication, Zero Boundaries",
  description:
    "Browser-based VoIP SaaS platform for calling, meetings, and enterprise communication.",
  heroQuote:
    "Redefining global communication. One platform for calls, meetings, and enterprise voice — from any browser, anywhere in the world.",
  secondQuote:
    "It doesn't matter where your team is located. What matters is how seamlessly they connect.",
  socials: {
    twitter: "#",
    linkedin: "#",
    youtube: "#",
    github: "#",
  },
};

export interface Feature {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  category: "calling" | "meetings" | "billing" | "platform";
}

export const features: Feature[] = [
  {
    id: "voip-calling",
    title: "International VoIP",
    subtitle: "Crystal-Clear Calls",
    description:
      "Make and receive PSTN calls worldwide via Twilio integration. HD voice quality with adaptive bitrate, noise cancellation, and call recording.",
    icon: "📞",
    category: "calling",
  },
  {
    id: "video-meetings",
    title: "Video Meetings",
    subtitle: "Free Internal Conferencing",
    description:
      "Powered by LiveKit — unlimited internal audio and video meetings with screen sharing, virtual backgrounds, and real-time collaboration.",
    icon: "🎥",
    category: "meetings",
  },
  {
    id: "wallet-billing",
    title: "Wallet Billing",
    subtitle: "Pay-As-You-Go",
    description:
      "Transparent wallet-based billing with real-time balance tracking, auto-recharge, detailed call logs, and organization-level credit management.",
    icon: "💳",
    category: "billing",
  },
  {
    id: "virtual-numbers",
    title: "Virtual Numbers",
    subtitle: "Local Presence, Global Reach",
    description:
      "Purchase virtual phone numbers in 50+ countries. Establish local presence, set up IVR menus, and route calls intelligently.",
    icon: "🌐",
    category: "calling",
  },
  {
    id: "rbac",
    title: "Role-Based Access",
    subtitle: "Enterprise Security",
    description:
      "Granular role-based access control with SSO integration, audit logs, compliance reporting, and organization-level policies.",
    icon: "🔐",
    category: "platform",
  },
  {
    id: "scalable-arch",
    title: "Scalable Architecture",
    subtitle: "Built for Growth",
    description:
      "From solo users to 10,000+ seat enterprises. Auto-scaling infrastructure, 99.9% uptime SLA, and global edge deployment.",
    icon: "⚡",
    category: "platform",
  },
];

export interface PricingTier {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
}

export const pricingTiers: PricingTier[] = [
  {
    id: "starter",
    name: "Starter",
    price: "$5",
    period: "/month",
    description: "For solo use with light needs.",
    features: [
      "Call 50+ countries",
      "HD browser calling",
      "Basic support",
      "Call history",
      "Wallet system",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    id: "business",
    name: "Business",
    price: "$50",
    period: "/month",
    description: "Best value for teams",
    features: [
      "All Starter features",
      "190+ countries",
      "Call recording",
      "Priority support",
      "Team features",
      "Organization management",
    ],
    cta: "Get Started",
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$200",
    period: "/month",
    description: "For team use with custom needs.",
    features: [
      "All Business features",
      "Dedicated manager",
      "Custom numbers",
      "API access",
      "SLA guarantee",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export const integrations = [
  "Twilio",
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

export const stats = [
  { label: "Calls Made", value: "10M+", numericValue: 10 },
  { label: "Countries", value: "50+", numericValue: 50 },
  { label: "Uptime SLA", value: "99.9%", numericValue: 99.9 },
  { label: "Active Teams", value: "5K+", numericValue: 5 },
];

export interface Testimonial {
  id: number;
  quote: string;
  author: string;
  role: string;
  company: string;
}

export const testimonials: Testimonial[] = [
  {
    id: 1,
    quote:
      "CallFlow replaced three separate tools for us. Our international calling costs dropped 60% in the first month.",
    author: "Sarah Chen",
    role: "VP Operations",
    company: "TechScale Global",
  },
  {
    id: 2,
    quote:
      "The wallet billing system is genius. Our finance team finally has real-time visibility into communication spend.",
    author: "Marcus Rivera",
    role: "CFO",
    company: "NovaBridge Solutions",
  },
  {
    id: 3,
    quote:
      "We went from desk phones to browser-based calling in a weekend. The LiveKit meetings integration is seamless.",
    author: "Priya Sharma",
    role: "CTO",
    company: "Meridian Consulting",
  },
  {
    id: 4,
    quote:
      "Enterprise-grade security with the simplicity of a consumer app. CallFlow is how business communication should work.",
    author: "James Whitfield",
    role: "Head of IT",
    company: "Pinnacle Financial",
  },
];

export const platformCapabilities = [
  {
    id: 1,
    title: "Browser-Based Calling",
    category: "Core",
    description: "No downloads, no plugins. Make and receive calls directly from your browser.",
  },
  {
    id: 2,
    title: "Smart Call Routing",
    category: "Intelligence",
    description: "AI-powered call routing with IVR, auto-attendant, and skill-based distribution.",
  },
  {
    id: 3,
    title: "Real-Time Analytics",
    category: "Insights",
    description: "Live dashboards for call quality, usage metrics, and team performance tracking.",
  },
  {
    id: 4,
    title: "Number Management",
    category: "Numbers",
    description: "Purchase and manage virtual numbers across 50+ countries from a single dashboard.",
  },
  {
    id: 5,
    title: "Team Collaboration",
    category: "Meetings",
    description: "HD video meetings with screen sharing, chat, and whiteboarding — all free for internal use.",
  },
  {
    id: 6,
    title: "Compliance & Security",
    category: "Enterprise",
    description: "SOC 2 compliant, end-to-end encryption, SSO, and audit logging for regulated industries.",
  },
  {
    id: 7,
    title: "API & Webhooks",
    category: "Developer",
    description: "RESTful API and webhooks for custom integrations, automation, and workflow triggers.",
  },
  {
    id: 8,
    title: "Mobile Ready",
    category: "Platform",
    description: "Responsive PWA experience — full functionality on any device without app store downloads.",
  },
];

export const featureComparison = [
  { feature: "International Calling", starter: "50+ countries", business: "190+ countries", enterprise: "190+ countries" },
  { feature: "HD Browser Calling", starter: "✓", business: "✓", enterprise: "✓" },
  { feature: "Call Recording", starter: "—", business: "✓", enterprise: "✓" },
  { feature: "Team Features", starter: "—", business: "✓", enterprise: "✓" },
  { feature: "Organization Management", starter: "—", business: "✓", enterprise: "✓" },
  { feature: "Dedicated Manager", starter: "—", business: "—", enterprise: "✓" },
  { feature: "Custom Numbers", starter: "—", business: "—", enterprise: "✓" },
  { feature: "API Access", starter: "—", business: "—", enterprise: "✓" },
  { feature: "SLA Guarantee", starter: "—", business: "—", enterprise: "✓" },
  { feature: "Support", starter: "Basic", business: "Priority", enterprise: "Dedicated" },
];

export const faqItems = [
  {
    question: "How does wallet billing work?",
    answer:
      "Each user and organization has a wallet with a real-time balance. Calls are billed per-minute at transparent rates. You can enable auto-recharge, set spending limits, and view detailed usage logs.",
  },
  {
    question: "Do I need to install anything?",
    answer:
      "No. CallFlow is 100% browser-based. It works on Chrome, Firefox, Safari, and Edge — on desktop, tablet, and mobile devices.",
  },
  {
    question: "Are internal meetings really free?",
    answer:
      "Yes. All internal audio and video meetings powered by LiveKit are completely free with unlimited participants and duration. Only outbound PSTN calls are billed.",
  },
  {
    question: "Can I port my existing phone numbers?",
    answer:
      "Yes. We support number porting from most carriers worldwide. Our team handles the entire porting process, typically completed within 5–10 business days.",
  },
  {
    question: "What about call quality?",
    answer:
      "CallFlow uses adaptive bitrate technology with Opus codec, built-in noise cancellation, and global edge servers to deliver crystal-clear HD voice quality even on variable connections.",
  },
  {
    question: "Is CallFlow suitable for regulated industries?",
    answer:
      "Absolutely. We offer SOC 2 Type II compliance, end-to-end encryption, HIPAA-ready configurations, detailed audit logs, and data residency options for healthcare, finance, and government sectors.",
  },
];
