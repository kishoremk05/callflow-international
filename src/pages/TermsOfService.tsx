import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Phone, FileText } from "lucide-react";

const TermsOfService = () => {
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
              <FileText className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Terms of Service
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
                  1. Agreement to Terms
                </h2>
                <p className="text-gray-600 mb-4">
                  By accessing or using GlobalConnect's services, you agree to
                  be bound by these Terms of Service and all applicable laws and
                  regulations. If you do not agree with any of these terms, you
                  are prohibited from using or accessing this service.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  2. Use License
                </h2>
                <p className="text-gray-600 mb-4">
                  Permission is granted to temporarily use GlobalConnect's
                  services for personal or commercial telecommunications
                  purposes only. This is the grant of a license, not a transfer
                  of title, and under this license you may not:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>
                    Use the service for any illegal purpose or in violation of
                    any regulations
                  </li>
                  <li>
                    Attempt to reverse engineer or decompile any part of the
                    service
                  </li>
                  <li>
                    Use the service to transmit spam, harassment, or threatening
                    communications
                  </li>
                  <li>
                    Attempt to gain unauthorized access to our systems or
                    networks
                  </li>
                  <li>
                    Use automated systems to access the service without
                    permission
                  </li>
                  <li>
                    Resell or redistribute the service without authorization
                  </li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  3. Account Registration
                </h2>
                <p className="text-gray-600 mb-4">
                  To use certain features of our service, you must register for
                  an account. You agree to:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>
                    Provide accurate, current, and complete information during
                    registration
                  </li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Maintain the security of your password and account</li>
                  <li>
                    Accept responsibility for all activities that occur under
                    your account
                  </li>
                  <li>
                    Notify us immediately of any unauthorized use of your
                    account
                  </li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  4. Payment and Billing
                </h2>
                <p className="text-gray-600 mb-4">
                  All charges are billed in advance on a per-minute or
                  subscription basis depending on your plan. You agree to:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>
                    Pay all fees and charges in accordance with the pricing in
                    effect at the time
                  </li>
                  <li>Provide valid payment information</li>
                  <li>
                    Authorize us to charge your payment method for all fees
                    incurred
                  </li>
                  <li>Pay any applicable taxes</li>
                </ul>
                <p className="text-gray-600 mt-4">
                  We reserve the right to modify our pricing at any time. All
                  prices are subject to change with 30 days notice.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  5. Acceptable Use Policy
                </h2>
                <p className="text-gray-600 mb-4">
                  You agree not to use the service to:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Violate any laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Transmit harmful or malicious content</li>
                  <li>Harass, abuse, or harm another person</li>
                  <li>Impersonate any person or entity</li>
                  <li>Interfere with or disrupt the service or servers</li>
                  <li>Engage in any form of fraudulent activity</li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  6. Service Availability
                </h2>
                <p className="text-gray-600 mb-4">
                  While we strive to maintain 99.9% uptime, we do not guarantee
                  that the service will be available at all times. We may
                  experience:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Scheduled maintenance periods</li>
                  <li>Unscheduled service interruptions</li>
                  <li>
                    Performance degradation due to factors beyond our control
                  </li>
                </ul>
                <p className="text-gray-600 mt-4">
                  We will make reasonable efforts to notify you of any scheduled
                  maintenance in advance.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  7. Termination
                </h2>
                <p className="text-gray-600 mb-4">
                  We may terminate or suspend your account immediately, without
                  prior notice or liability, for any reason whatsoever,
                  including without limitation if you breach the Terms. Upon
                  termination:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Your right to use the service will immediately cease</li>
                  <li>Any unused credit balance may be forfeited</li>
                  <li>
                    You remain responsible for any charges incurred before
                    termination
                  </li>
                </ul>
                <p className="text-gray-600 mt-4">
                  You may terminate your account at any time by contacting
                  customer support.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  8. Limitation of Liability
                </h2>
                <p className="text-gray-600 mb-4">
                  In no event shall GlobalConnect, its directors, employees, or
                  agents be liable for any indirect, incidental, special,
                  consequential, or punitive damages, including without
                  limitation loss of profits, data, use, goodwill, or other
                  intangible losses, resulting from:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>
                    Your access to or use of or inability to access or use the
                    service
                  </li>
                  <li>
                    Any conduct or content of any third party on the service
                  </li>
                  <li>
                    Unauthorized access, use, or alteration of your
                    transmissions or content
                  </li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  9. Disclaimer
                </h2>
                <p className="text-gray-600 mb-4">
                  Your use of the service is at your sole risk. The service is
                  provided on an "AS IS" and "AS AVAILABLE" basis. GlobalConnect
                  expressly disclaims all warranties of any kind, whether
                  express or implied.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  10. Governing Law
                </h2>
                <p className="text-gray-600 mb-4">
                  These Terms shall be governed and construed in accordance with
                  the laws of the State of California, United States, without
                  regard to its conflict of law provisions.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  11. Changes to Terms
                </h2>
                <p className="text-gray-600 mb-4">
                  We reserve the right, at our sole discretion, to modify or
                  replace these Terms at any time. We will provide notice of any
                  material changes by posting the new Terms on this page and
                  updating the "Last updated" date.
                </p>
              </section>

              <section className="mb-0">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  12. Contact Information
                </h2>
                <p className="text-gray-600 mb-4">
                  If you have any questions about these Terms of Service, please
                  contact us:
                </p>
                <ul className="list-none text-gray-600 space-y-2">
                  <li>Email: legal@globalconnect.com</li>
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
            Questions About Our Terms?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            We're here to help clarify any questions you may have about our
            terms of service.
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

export default TermsOfService;
