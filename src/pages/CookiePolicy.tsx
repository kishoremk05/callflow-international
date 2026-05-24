import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Phone, Cookie } from "lucide-react";

const CookiePolicy = () => {
  const navigate = useNavigate();

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
              <span className="text-xl font-bold">Palodial</span>
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
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Cookie className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Cookie Policy
            </h1>
            <p className="text-xl text-gray-100">
              Last updated: February 12, 2024
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  1. What Are Cookies?
                </h2>
                <p className="text-gray-600 mb-4">
                  Cookies are small text files that are placed on your computer
                  or mobile device when you visit a website. They are widely
                  used to make websites work more efficiently and provide
                  information to the owners of the site.
                </p>
                <p className="text-gray-600 mb-4">
                  Palodial uses cookies to distinguish you from other users and
                  to provide you with a better experience when you browse our
                  website and use our services.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  2. Types of Cookies We Use
                </h2>

                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-3 text-gray-900">
                    Essential Cookies
                  </h3>
                  <p className="text-gray-600 mb-2">
                    These cookies are necessary for the website to function
                    properly. They enable core functionality such as security,
                    network management, and accessibility.
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-1">
                    <li>Session cookies for user authentication</li>
                    <li>Security cookies to prevent fraud</li>
                    <li>Load balancing cookies</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-3 text-gray-900">
                    Functional Cookies
                  </h3>
                  <p className="text-gray-600 mb-2">
                    These cookies enable the website to provide enhanced
                    functionality and personalization. They may be set by us or
                    by third-party providers whose services we have added to our
                    pages.
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-1">
                    <li>Language preference cookies</li>
                    <li>User interface customization cookies</li>
                    <li>Video player cookies</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-3 text-gray-900">
                    Analytics Cookies
                  </h3>
                  <p className="text-gray-600 mb-2">
                    These cookies allow us to count visits and traffic sources
                    so we can measure and improve the performance of our site.
                    They help us understand which pages are the most and least
                    popular.
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-1">
                    <li>Google Analytics cookies</li>
                    <li>Page visit tracking cookies</li>
                    <li>User behavior analysis cookies</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-3 text-gray-900">
                    Marketing Cookies
                  </h3>
                  <p className="text-gray-600 mb-2">
                    These cookies may be set through our site by our advertising
                    partners. They may be used by those companies to build a
                    profile of your interests and show you relevant
                    advertisements.
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-1">
                    <li>Advertising targeting cookies</li>
                    <li>Retargeting cookies</li>
                    <li>Social media integration cookies</li>
                  </ul>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  3. Specific Cookies We Use
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">
                          Cookie Name
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left">
                          Purpose
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left">
                          Duration
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600">
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          session_id
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          Essential - Maintains user session
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          Session
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          auth_token
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          Essential - User authentication
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          7 days
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          preferences
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          Functional - User preferences
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          1 year
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          _ga
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          Analytics - Google Analytics
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          2 years
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          _gid
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          Analytics - Google Analytics
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          24 hours
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  4. Third-Party Cookies
                </h2>
                <p className="text-gray-600 mb-4">
                  In addition to our own cookies, we may also use various
                  third-party cookies to report usage statistics of the service
                  and deliver advertisements:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>
                    <strong>Google Analytics:</strong> To understand how
                    visitors use our site
                  </li>
                  <li>
                    <strong>Stripe:</strong> For payment processing
                  </li>
                  <li>
                    <strong>Twilio:</strong> For voice communication services
                  </li>
                  <li>
                    <strong>Social Media Platforms:</strong> For social sharing
                    features
                  </li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  5. How to Control Cookies
                </h2>
                <p className="text-gray-600 mb-4">
                  You have the right to decide whether to accept or reject
                  cookies. You can exercise your cookie preferences in several
                  ways:
                </p>

                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-3 text-gray-900">
                    Browser Settings
                  </h3>
                  <p className="text-gray-600 mb-2">
                    Most web browsers allow you to control cookies through their
                    settings preferences. However, limiting cookies may impact
                    your experience of our services.
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-1">
                    <li>
                      Chrome: Settings â†’ Privacy and Security â†’ Cookies
                    </li>
                    <li>Firefox: Options â†’ Privacy & Security â†’ Cookies</li>
                    <li>Safari: Preferences â†’ Privacy â†’ Cookies</li>
                    <li>Edge: Settings â†’ Privacy â†’ Cookies</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-3 text-gray-900">
                    Cookie Consent Tool
                  </h3>
                  <p className="text-gray-600 mb-2">
                    When you first visit our website, you can choose your cookie
                    preferences through our cookie consent banner. You can
                    change your preferences at any time by clicking the "Cookie
                    Settings" link in our footer.
                  </p>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  6. Do Not Track Signals
                </h2>
                <p className="text-gray-600 mb-4">
                  Some browsers include a "Do Not Track" (DNT) feature that
                  signals to websites that you visit that you do not want to
                  have your online activity tracked. Currently, there is no
                  industry standard for how to respond to DNT signals. At this
                  time, we do not respond to DNT signals.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  7. Updates to This Policy
                </h2>
                <p className="text-gray-600 mb-4">
                  We may update this Cookie Policy from time to time to reflect
                  changes in the cookies we use or for other operational, legal,
                  or regulatory reasons. Please revisit this Cookie Policy
                  regularly to stay informed about our use of cookies.
                </p>
              </section>

              <section className="mb-0">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  8. Contact Us
                </h2>
                <p className="text-gray-600 mb-4">
                  If you have any questions about our use of cookies, please
                  contact us:
                </p>
                <ul className="list-none text-gray-600 space-y-2">
                  <li>Email: privacy@callflow.com</li>
                  <li>Phone: +1 (555) 123-4567</li>
                  <li>Address: 123 Tech Street, San Francisco, CA 94105</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Questions About Cookies?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            We're happy to help you understand how we use cookies to improve
            your experience.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/contact")}
            className="bg-[#0891b2] hover:bg-[#0e7490]"
          >
            Contact Us
          </Button>
        </div>
      </section>
    </div>
  );
};

export default CookiePolicy;
