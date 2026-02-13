import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Phone,
  Code,
  Zap,
  Shield,
  Globe,
  CheckCircle2,
  Copy,
} from "lucide-react";
import { useState } from "react";

const API = () => {
  const navigate = useNavigate();
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const features = [
    {
      icon: Zap,
      title: "Fast & Reliable",
      description: "99.9% uptime with low-latency global infrastructure",
    },
    {
      icon: Shield,
      title: "Secure",
      description: "OAuth 2.0 authentication and encrypted connections",
    },
    {
      icon: Code,
      title: "Well Documented",
      description: "Comprehensive docs with examples in multiple languages",
    },
    {
      icon: Globe,
      title: "Global Coverage",
      description: "Access to 200+ countries with competitive rates",
    },
  ];

  const endpoints = [
    {
      method: "POST",
      path: "/api/v1/calls/initiate",
      description: "Initiate a new voice call",
      example: `{
  "from": "+1234567890",
  "to": "+0987654321",
  "callbackUrl": "https://your-domain.com/callback"
}`,
    },
    {
      method: "GET",
      path: "/api/v1/calls/{callId}",
      description: "Get call details and status",
      example: `// Response
{
  "callId": "abc123",
  "status": "completed",
  "duration": 125,
  "cost": 0.15
}`,
    },
    {
      method: "GET",
      path: "/api/v1/pricing/{country}",
      description: "Get pricing for a specific country",
      example: `// Response
{
  "country": "US",
  "rate": 0.012,
  "currency": "USD"
}`,
    },
    {
      method: "GET",
      path: "/api/v1/balance",
      description: "Check account balance",
      example: `// Response
{
  "balance": 45.50,
  "currency": "USD"
}`,
    },
  ];

  const sdks = [
    { name: "Node.js", code: "npm install globalconnect-sdk" },
    { name: "Python", code: "pip install globalconnect" },
    { name: "PHP", code: "composer require globalconnect/sdk" },
    { name: "Ruby", code: "gem install globalconnect" },
    { name: "Java", code: "maven: com.globalconnect:sdk:1.0.0" },
    { name: "Go", code: "go get github.com/globalconnect/sdk" },
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
              <span className="text-xl font-bold">GlobalConnect</span>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button
                onClick={() => navigate("/signup")}
                className="bg-[#0891b2] hover:bg-[#0e7490]"
              >
                Get API Key
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
              GlobalConnect API
            </h1>
            <p className="text-xl text-gray-100 mb-8">
              Integrate voice calling into your application with our powerful,
              easy-to-use REST API.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate("/signup")}
                className="bg-white text-[#0891b2] hover:bg-gray-100"
              >
                Get API Key
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                View Documentation
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
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

      {/* Quick Start */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              Quick Start
            </h2>
            <div className="bg-gray-900 text-white p-8 rounded-2xl shadow-xl">
              <div className="mb-4">
                <span className="text-gray-400"># Install the SDK</span>
              </div>
              <div className="mb-6">
                <code className="text-green-400">
                  npm install globalconnect-sdk
                </code>
              </div>
              <div className="mb-4">
                <span className="text-gray-400">
                  # Initialize and make a call
                </span>
              </div>
              <pre className="text-sm overflow-x-auto">
                <code className="text-blue-300">{`const GlobalConnect = require('globalconnect-sdk');

const client = new GlobalConnect('YOUR_API_KEY');

const call = await client.calls.create({
  from: '+1234567890',
  to: '+0987654321',
  callbackUrl: 'https://your-domain.com/callback'
});

console.log('Call initiated:', call.callId);`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* API Endpoints */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              API Endpoints
            </h2>
            <div className="space-y-6">
              {endpoints.map((endpoint, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <span
                        className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                          endpoint.method === "GET"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {endpoint.method}
                      </span>
                      <div className="flex-1">
                        <code className="text-lg font-mono text-gray-900">
                          {endpoint.path}
                        </code>
                        <p className="text-gray-600 mt-2">
                          {endpoint.description}
                        </p>
                      </div>
                    </div>
                    <div className="relative">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2 z-10"
                        onClick={() =>
                          copyToClipboard(endpoint.example, endpoint.path)
                        }
                      >
                        {copiedEndpoint === endpoint.path ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      <pre className="bg-gray-900 text-gray-300 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{endpoint.example}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SDKs */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              Official SDKs
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {sdks.map((sdk, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-md border border-gray-100"
                >
                  <h3 className="text-xl font-bold mb-3">{sdk.name}</h3>
                  <code className="block bg-gray-900 text-green-400 p-3 rounded-lg text-sm">
                    {sdk.code}
                  </code>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="bg-gradient-to-br from-[#0891b2] to-[#0e7490] rounded-3xl p-12 md:p-16 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Build with GlobalConnect?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Get your API key and start integrating voice calling into your
              application today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate("/signup")}
                className="bg-white text-[#0891b2] hover:bg-gray-100"
              >
                Get API Key
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/contact")}
                className="border-white text-white hover:bg-white/10"
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default API;
