import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Phone, Shield } from "lucide-react";

const PrivacyPolicy = () => {
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
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Privacy Policy
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
                  1. Introduction
                </h2>
                <p className="text-gray-600 mb-4">
                  Welcome to GlobalConnect. We respect your privacy and are
                  committed to protecting your personal data. This privacy
                  policy will inform you about how we look after your personal
                  data when you visit our website or use our services and tell
                  you about your privacy rights.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  2. Information We Collect
                </h2>
                <p className="text-gray-600 mb-4">
                  We may collect, use, store and transfer different kinds of
                  personal data about you:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>
                    <strong>Identity Data:</strong> First name, last name,
                    username or similar identifier
                  </li>
                  <li>
                    <strong>Contact Data:</strong> Email address, telephone
                    numbers, billing address
                  </li>
                  <li>
                    <strong>Financial Data:</strong> Payment card details, bank
                    account information
                  </li>
                  <li>
                    <strong>Transaction Data:</strong> Details about payments
                    and call records
                  </li>
                  <li>
                    <strong>Technical Data:</strong> IP address, browser type,
                    device information
                  </li>
                  <li>
                    <strong>Usage Data:</strong> Information about how you use
                    our services
                  </li>
                  <li>
                    <strong>Communications Data:</strong> Your preferences in
                    receiving marketing communications
                  </li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  3. How We Use Your Information
                </h2>
                <p className="text-gray-600 mb-4">
                  We will only use your personal data when the law allows us to.
                  Most commonly, we will use your personal data in the following
                  circumstances:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>To provide and maintain our service</li>
                  <li>To process your transactions and manage payments</li>
                  <li>To notify you about changes to our service</li>
                  <li>To provide customer support</li>
                  <li>
                    To gather analysis or valuable information to improve our
                    service
                  </li>
                  <li>To detect, prevent and address technical issues</li>
                  <li>
                    To provide you with news and offers (only with your consent)
                  </li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  4. Data Security
                </h2>
                <p className="text-gray-600 mb-4">
                  We have implemented appropriate security measures to prevent
                  your personal data from being accidentally lost, used or
                  accessed in an unauthorized way, altered or disclosed. We use:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>End-to-end encryption for all voice communications</li>
                  <li>SSL/TLS encryption for all data in transit</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>Access controls and authentication mechanisms</li>
                  <li>Regular data backups with encryption</li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  5. Data Retention
                </h2>
                <p className="text-gray-600 mb-4">
                  We will only retain your personal data for as long as
                  necessary to fulfill the purposes we collected it for,
                  including for the purposes of satisfying any legal,
                  accounting, or reporting requirements.
                </p>
                <p className="text-gray-600 mb-4">
                  Call detail records are retained for 12 months for billing and
                  support purposes. Account information is retained for the
                  duration of your account plus 7 years for legal and regulatory
                  compliance.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  6. Your Legal Rights
                </h2>
                <p className="text-gray-600 mb-4">
                  Under certain circumstances, you have rights under data
                  protection laws in relation to your personal data:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>
                    <strong>Right to access:</strong> Request access to your
                    personal data
                  </li>
                  <li>
                    <strong>Right to correction:</strong> Request correction of
                    your personal data
                  </li>
                  <li>
                    <strong>Right to erasure:</strong> Request erasure of your
                    personal data
                  </li>
                  <li>
                    <strong>Right to object:</strong> Object to processing of
                    your personal data
                  </li>
                  <li>
                    <strong>Right to restriction:</strong> Request restriction
                    of processing your personal data
                  </li>
                  <li>
                    <strong>Right to data portability:</strong> Request transfer
                    of your personal data
                  </li>
                  <li>
                    <strong>Right to withdraw consent:</strong> Withdraw consent
                    at any time
                  </li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  7. Third-Party Services
                </h2>
                <p className="text-gray-600 mb-4">
                  We may employ third-party companies and individuals to
                  facilitate our service, provide the service on our behalf, or
                  assist us in analyzing how our service is used. These third
                  parties have access to your personal data only to perform
                  these tasks on our behalf and are obligated not to disclose or
                  use it for any other purpose.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  8. International Transfers
                </h2>
                <p className="text-gray-600 mb-4">
                  We operate globally and may transfer your personal data to
                  countries outside of your residence. We ensure appropriate
                  safeguards are in place to protect your data, including EU
                  Standard Contractual Clauses where applicable.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  9. Cookies
                </h2>
                <p className="text-gray-600 mb-4">
                  We use cookies and similar tracking technologies to track
                  activity on our service and hold certain information. For more
                  information about our use of cookies, please see our Cookie
                  Policy.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  10. Changes to This Policy
                </h2>
                <p className="text-gray-600 mb-4">
                  We may update our Privacy Policy from time to time. We will
                  notify you of any changes by posting the new Privacy Policy on
                  this page and updating the "Last updated" date. You are
                  advised to review this Privacy Policy periodically for any
                  changes.
                </p>
              </section>

              <section className="mb-0">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  11. Contact Us
                </h2>
                <p className="text-gray-600 mb-4">
                  If you have any questions about this Privacy Policy, please
                  contact us:
                </p>
                <ul className="list-none text-gray-600 space-y-2">
                  <li>Email: privacy@globalconnect.com</li>
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
          <h2 className="text-3xl font-bold mb-6">
            Questions About Your Privacy?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Our team is here to help. Contact us anytime with privacy-related
            questions or concerns.
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

export default PrivacyPolicy;
