import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Phone,
  MapPin,
  Briefcase,
  Users,
  Heart,
  Zap,
  Globe,
  TrendingUp,
} from "lucide-react";

const Careers = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: Heart,
      title: "Health & Wellness",
      description:
        "Comprehensive health insurance and wellness programs for you and your family.",
    },
    {
      icon: TrendingUp,
      title: "Career Growth",
      description:
        "Continuous learning opportunities and clear career progression paths.",
    },
    {
      icon: Globe,
      title: "Remote Work",
      description: "Flexible work arrangements with remote options available.",
    },
    {
      icon: Users,
      title: "Great Team",
      description:
        "Work with talented, passionate people from around the world.",
    },
  ];

  const openPositions = [
    {
      title: "Senior Backend Engineer",
      department: "Engineering",
      location: "Remote / San Francisco, CA",
      type: "Full-time",
      description:
        "Build scalable backend systems for our global voice infrastructure.",
    },
    {
      title: "Product Designer",
      department: "Design",
      location: "Remote / New York, NY",
      type: "Full-time",
      description:
        "Design beautiful, intuitive experiences for millions of users worldwide.",
    },
    {
      title: "Customer Success Manager",
      department: "Support",
      location: "Remote",
      type: "Full-time",
      description:
        "Help our customers succeed and grow their businesses with CallFlow.",
    },
    {
      title: "DevOps Engineer",
      department: "Engineering",
      location: "Remote / London, UK",
      type: "Full-time",
      description:
        "Maintain and scale our high-availability global infrastructure.",
    },
    {
      title: "Sales Development Representative",
      department: "Sales",
      location: "Remote / Austin, TX",
      type: "Full-time",
      description:
        "Drive growth by connecting with potential enterprise customers.",
    },
    {
      title: "Marketing Manager",
      department: "Marketing",
      location: "Remote / Boston, MA",
      type: "Full-time",
      description:
        "Lead marketing initiatives to grow our brand and user base.",
    },
  ];

  const values = [
    "Customer-first mindset",
    "Continuous innovation",
    "Global collaboration",
    "Transparent communication",
    "Quality excellence",
    "Inclusive culture",
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
              Join Our Mission to Connect the World
            </h1>
            <p className="text-xl text-gray-100 mb-8">
              Help us build the future of global communication. We're looking
              for talented, passionate people to join our growing team.
            </p>
            <Button
              size="lg"
              onClick={() =>
                document
                  .getElementById("positions")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="bg-white text-[#0891b2] hover:bg-gray-100"
            >
              View Open Positions
            </Button>
          </div>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why CallFlow?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join a team that's passionate about making a global impact and
              creating meaningful connections.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="w-14 h-14 bg-[#0891b2]/10 rounded-xl flex items-center justify-center mb-6">
                  <benefit.icon className="w-7 h-7 text-[#0891b2]" />
                </div>
                <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              Our Values
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4"
                >
                  <div className="w-2 h-2 bg-[#0891b2] rounded-full flex-shrink-0" />
                  <span className="text-lg font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="positions" className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              Open Positions
            </h2>
            <div className="space-y-6">
              {openPositions.map((position, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">
                        {position.title}
                      </h3>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {position.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {position.location}
                        </span>
                        <span className="px-3 py-1 bg-[#0891b2]/10 text-[#0891b2] rounded-full font-semibold">
                          {position.type}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => navigate("/contact")}
                      className="bg-[#0891b2] hover:bg-[#0e7490] whitespace-nowrap"
                    >
                      Apply Now
                    </Button>
                  </div>
                  <p className="text-gray-600">{position.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-[#0891b2] to-[#0e7490] text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Don't See the Right Role?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            We're always interested in hearing from talented people. Send us
            your resume and let's talk!
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/contact")}
            className="bg-white text-[#0891b2] hover:bg-gray-100"
          >
            Get in Touch
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Careers;

