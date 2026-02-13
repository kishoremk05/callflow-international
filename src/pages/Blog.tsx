import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Phone,
  Calendar,
  ArrowRight,
  TrendingUp,
  Globe,
  Zap,
} from "lucide-react";

const Blog = () => {
  const navigate = useNavigate();

  const featuredPost = {
    title: "The Future of International Communication in 2024",
    excerpt:
      "Explore how AI and advanced networking technologies are revolutionizing global voice communication and making international calls more accessible than ever.",
    date: "February 10, 2024",
    readTime: "8 min read",
    category: "Industry Insights",
    image: "🌐",
  };

  const posts = [
    {
      title: "5 Tips for Reducing International Calling Costs",
      excerpt:
        "Learn proven strategies to save money on international calls without compromising on quality.",
      date: "February 5, 2024",
      readTime: "5 min read",
      category: "Tips & Tricks",
      icon: "💡",
    },
    {
      title: "How VoIP Technology Works: A Simple Guide",
      excerpt:
        "Understand the technology behind modern internet calling and why it's superior to traditional phone lines.",
      date: "January 28, 2024",
      readTime: "6 min read",
      category: "Technology",
      icon: "🔧",
    },
    {
      title: "GlobalConnect API: Building Your First Integration",
      excerpt:
        "A step-by-step guide to integrating voice calling into your application using our API.",
      date: "January 20, 2024",
      readTime: "10 min read",
      category: "Developer",
      icon: "💻",
    },
    {
      title: "The Rise of Remote Work and Global Teams",
      excerpt:
        "How international communication tools are enabling the future of work and distributed teams.",
      date: "January 15, 2024",
      readTime: "7 min read",
      category: "Business",
      icon: "🚀",
    },
    {
      title: "Security Best Practices for Business Calls",
      excerpt:
        "Essential security measures to protect your business communications from threats.",
      date: "January 8, 2024",
      readTime: "6 min read",
      category: "Security",
      icon: "🔒",
    },
    {
      title: "Customer Success Story: TechCorp International",
      excerpt:
        "How TechCorp saved 60% on international calling costs while improving call quality.",
      date: "January 2, 2024",
      readTime: "4 min read",
      category: "Case Study",
      icon: "⭐",
    },
  ];

  const categories = [
    "All Posts",
    "Industry Insights",
    "Tips & Tricks",
    "Technology",
    "Developer",
    "Business",
    "Security",
    "Case Study",
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
              GlobalConnect Blog
            </h1>
            <p className="text-xl text-gray-100 mb-8">
              Insights, tips, and stories about global communication and
              connecting people worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-[#0891b2] to-[#0e7490] rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-8 md:p-12 text-white">
                <div className="flex items-center gap-4 mb-6">
                  <span className="px-4 py-2 bg-white/20 rounded-full text-sm font-semibold">
                    Featured
                  </span>
                  <span className="text-sm opacity-90">
                    {featuredPost.category}
                  </span>
                </div>
                <div className="text-6xl mb-6">{featuredPost.image}</div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  {featuredPost.title}
                </h2>
                <p className="text-xl text-gray-100 mb-6">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center gap-6 text-sm mb-8 opacity-90">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {featuredPost.date}
                  </span>
                  <span>{featuredPost.readTime}</span>
                </div>
                <Button
                  size="lg"
                  className="bg-white text-[#0891b2] hover:bg-gray-100"
                >
                  Read Article
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category, index) => (
                <button
                  key={index}
                  className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                    index === 0
                      ? "bg-[#0891b2] text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-12 pb-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer group"
                >
                  <div className="p-8">
                    <div className="text-5xl mb-6">{post.icon}</div>
                    <div className="mb-4">
                      <span className="px-3 py-1 bg-[#0891b2]/10 text-[#0891b2] rounded-full text-sm font-semibold">
                        {post.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-[#0891b2] transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-6 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {post.date}
                      </span>
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Stay Updated
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Get the latest insights on global communication, product updates,
              and industry trends delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
              />
              <Button className="bg-[#0891b2] hover:bg-[#0e7490] whitespace-nowrap">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-[#0891b2] to-[#0e7490] text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Connecting Globally?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of users making crystal-clear international calls
            with GlobalConnect.
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

export default Blog;
