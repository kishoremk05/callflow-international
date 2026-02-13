import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Phone, Globe, Users, Target, Award, Heart } from "lucide-react";

const AboutUs = () => {
  const navigate = useNavigate();

  const values = [
    {
      icon: Globe,
      title: "Global Reach",
      description:
        "We connect people across 200+ countries, breaking down communication barriers worldwide.",
    },
    {
      icon: Heart,
      title: "Customer First",
      description:
        "Every decision we make prioritizes our customers' needs and satisfaction.",
    },
    {
      icon: Award,
      title: "Quality Excellence",
      description:
        "We maintain the highest standards in call quality and service reliability.",
    },
    {
      icon: Target,
      title: "Innovation",
      description:
        "Constantly evolving our technology to provide better communication solutions.",
    },
  ];

  const team = [
    {
      role: "Engineering",
      count: "50+",
      description: "World-class developers",
    },
    { role: "Support", count: "24/7", description: "Always here to help" },
    { role: "Countries", count: "200+", description: "Global coverage" },
    { role: "Customers", count: "100K+", description: "Happy users worldwide" },
  ];

  const milestones = [
    {
      year: "2020",
      title: "Founded",
      description:
        "GlobalConnect was born with a mission to make international calling accessible to everyone.",
    },
    {
      year: "2021",
      title: "Global Expansion",
      description: "Expanded coverage to 100+ countries with HD voice quality.",
    },
    {
      year: "2022",
      title: "100K Users",
      description: "Reached 100,000 active users across the globe.",
    },
    {
      year: "2023",
      title: "Enterprise Launch",
      description: "Introduced enterprise solutions for businesses.",
    },
    {
      year: "2024",
      title: "API Release",
      description:
        "Launched public API for developers to integrate our services.",
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
              Connecting the World, One Call at a Time
            </h1>
            <p className="text-xl text-gray-100 mb-8">
              We're on a mission to make international communication simple,
              affordable, and accessible to everyone, everywhere.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              At GlobalConnect, we believe that distance should never be a
              barrier to meaningful connection. We're committed to providing
              crystal-clear, affordable international calling that brings people
              together across borders, cultures, and time zones. Through
              innovative technology and unwavering dedication to quality, we're
              making the world a smaller, more connected place.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These core principles guide everything we do at GlobalConnect.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="w-14 h-14 bg-[#0891b2]/10 rounded-xl flex items-center justify-center mb-6">
                  <value.icon className="w-7 h-7 text-[#0891b2]" />
                </div>
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {team.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-[#0891b2] mb-2">
                  {stat.count}
                </div>
                <div className="text-xl font-semibold mb-1">{stat.role}</div>
                <div className="text-gray-600">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">
              Our Journey
            </h2>
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex gap-8 items-start">
                  <div className="flex-shrink-0 w-24 text-right">
                    <div className="text-2xl font-bold text-[#0891b2]">
                      {milestone.year}
                    </div>
                  </div>
                  <div className="flex-shrink-0 w-4 h-4 bg-[#0891b2] rounded-full mt-2 relative">
                    {index !== milestones.length - 1 && (
                      <div className="absolute top-4 left-1/2 w-0.5 h-20 bg-[#0891b2]/30 -translate-x-1/2" />
                    )}
                  </div>
                  <div className="flex-1 pb-12">
                    <h3 className="text-2xl font-bold mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Join Our Team
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              We're always looking for talented individuals who share our
              passion for connecting the world.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/careers")}
              className="bg-[#0891b2] hover:bg-[#0e7490]"
            >
              View Open Positions
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-[#0891b2] to-[#0e7490] text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Join Thousands of Happy Users?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Experience the GlobalConnect difference. Start making clear,
            affordable international calls today.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/signup")}
            className="bg-white text-[#0891b2] hover:bg-gray-100"
          >
            Get Started Free
          </Button>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
