import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Phone, CheckCircle2, Globe, Zap } from "lucide-react";

const Pricing = () => {
  const navigate = useNavigate();

  const popularDestinations = [
    { country: "United States", flag: "ðŸ‡ºðŸ‡¸", rate: "$0.012/min" },
    { country: "United Kingdom", flag: "ðŸ‡¬ðŸ‡§", rate: "$0.015/min" },
    { country: "Canada", flag: "ðŸ‡¨ðŸ‡¦", rate: "$0.013/min" },
    { country: "Australia", flag: "ðŸ‡¦ðŸ‡º", rate: "$0.018/min" },
    { country: "India", flag: "ðŸ‡®ðŸ‡³", rate: "$0.008/min" },
    { country: "Germany", flag: "ðŸ‡©ðŸ‡ª", rate: "$0.016/min" },
    { country: "France", flag: "ðŸ‡«ðŸ‡·", rate: "$0.017/min" },
    { country: "China", flag: "ðŸ‡¨ðŸ‡³", rate: "$0.011/min" },
    { country: "Brazil", flag: "ðŸ‡§ðŸ‡·", rate: "$0.014/min" },
    { country: "Mexico", flag: "ðŸ‡²ðŸ‡½", rate: "$0.010/min" },
    { country: "Japan", flag: "ðŸ‡¯ðŸ‡µ", rate: "$0.019/min" },
    { country: "South Korea", flag: "ðŸ‡°ðŸ‡·", rate: "$0.016/min" },
  ];

  const plans = [
    {
      name: "Pay As You Go",
      price: "No monthly fee",
      description: "Perfect for occasional callers",
      features: [
        "No monthly commitment",
        "Rates starting from $0.008/min",
        "Top up anytime",
        "Credit never expires",
        "200+ countries coverage",
        "HD voice quality",
      ],
      buttonText: "Start Now",
      highlighted: false,
    },
    {
      name: "Frequent Caller",
      price: "$20/month",
      description: "Best for regular international calls",
      features: [
        "Everything in Pay As You Go",
        "10% discount on all calls",
        "500 free minutes included",
        "Priority support",
        "Call recording",
        "Advanced analytics",
      ],
      buttonText: "Get Started",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For businesses with high call volumes",
      features: [
        "Everything in Frequent Caller",
        "Up to 30% discount",
        "Unlimited team members",
        "Dedicated account manager",
        "SLA guarantee",
        "Custom integrations",
        "API access",
        "Volume discounts",
      ],
      buttonText: "Contact Sales",
      highlighted: false,
    },
  ];

  const features = [
    {
      icon: Globe,
      title: "Global Coverage",
      description: "Call 200+ countries with competitive rates",
    },
    {
      icon: Zap,
      title: "Instant Setup",
      description: "Start calling in under 2 minutes",
    },
    {
      icon: CheckCircle2,
      title: "No Hidden Fees",
      description: "Transparent pricing, no surprises",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <div className="w-10 h-10 bg-[#0891b2] rounded-xl flex items-center justify-center">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">CallFlow</span>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button
                onClick={() => navigate("/signup")}
                className="bg-[#0891b2] hover:bg-[#0e7490]"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-[#0891b2] to-[#0e7490] text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-100 mb-8">
              Pay only for what you use. No hidden fees, no monthly commitments.
              Start from as low as $0.008/minute.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Choose Your Plan
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Select the plan that best fits your calling needs. Upgrade or
              downgrade anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-2xl shadow-lg p-8 ${
                  plan.highlighted
                    ? "ring-2 ring-[#0891b2] transform scale-105"
                    : "border border-gray-200"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#0891b2] text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                </div>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${
                    plan.highlighted
                      ? "bg-[#0891b2] hover:bg-[#0e7490]"
                      : "bg-gray-900 hover:bg-gray-800"
                  }`}
                  onClick={() =>
                    navigate(plan.price === "Custom" ? "/contact" : "/signup")
                  }
                >
                  {plan.buttonText}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Popular Destinations
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Check out our competitive rates for the most popular calling
              destinations worldwide.
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {popularDestinations.map((destination, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
              >
                <div className="text-4xl mb-3">{destination.flag}</div>
                <h3 className="font-semibold mb-2">{destination.country}</h3>
                <p className="text-2xl font-bold text-[#0891b2]">
                  {destination.rate}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/signup")}
            >
              View All Rates
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-[#0891b2]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-[#0891b2]" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-[#0891b2] to-[#0e7490] text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Start Saving on International Calls Today
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust CallFlow for affordable,
            high-quality international calling.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/signup")}
            className="bg-white text-[#0891b2] hover:bg-gray-100"
          >
            Create Free Account
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Pricing;

