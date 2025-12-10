"use client";

import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function TermsOfServicePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#fdfbf8] pt-24">
        {/* Hero Section */}
        <section className="py-16 bg-black text-white">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <p className="text-sm tracking-[0.3em] mb-4 text-gray-400">EASTDOCK STUDIOS</p>
              <h1 className="text-4xl md:text-5xl font-light tracking-wider mb-6">Terms of Service</h1>
              <div className="w-24 h-px bg-gray-600 mx-auto"></div>
            </motion.div>
          </div>
        </section>

        {/* Terms Content */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-4xl mx-auto prose prose-lg"
            >
              {/* Overview */}
              <div className="mb-12">
                <h2 className="text-2xl font-light text-black mb-4 border-b border-gray-200 pb-2">1. Overview</h2>
                <p className="text-gray-600 leading-relaxed">
                  By using our studio and services, you agree to these terms of service. Acceptance of these terms is required to access our facilities and services. Please read them carefully before booking or using any of our services.
                </p>
              </div>

              {/* Studio and Service Usage */}
              <div className="mb-12">
                <h2 className="text-2xl font-light text-black mb-4 border-b border-gray-200 pb-2">2. Studio and Service Usage</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  When using our studio and services, the following activities are strictly prohibited:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Violating any applicable laws or regulations</li>
                  <li>Breaching our content guidelines</li>
                  <li>Distributing spam or unsolicited communications</li>
                  <li>Uploading malicious software or harmful content</li>
                  <li>Any activity that could damage our equipment or facilities</li>
                </ul>
              </div>

              {/* Content Guidelines */}
              <div className="mb-12">
                <h2 className="text-2xl font-light text-black mb-4 border-b border-gray-200 pb-2">3. Content Guidelines</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  All materials created or used within our studio must:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Respect intellectual property rights of others</li>
                  <li>Avoid defamatory, libellous, or misleading content</li>
                  <li>Refrain from promoting violence, discrimination, or illegal activities</li>
                </ul>
              </div>

              {/* Intellectual Property */}
              <div className="mb-12">
                <h2 className="text-2xl font-light text-black mb-4 border-b border-gray-200 pb-2">4. Intellectual Property</h2>
                <p className="text-gray-600 leading-relaxed">
                  User-created content remains the property of the creator. However, by using our studio and services, you grant East Dock Studios a non-exclusive, royalty-free license to use your content for promotional purposes, including but not limited to social media, website showcases, and marketing materials.
                </p>
              </div>

              {/* Guest Policy */}
              <div className="mb-12">
                <h2 className="text-2xl font-light text-black mb-4 border-b border-gray-200 pb-2">5. Guest Policy</h2>
                <p className="text-gray-600 leading-relaxed">
                  Up to two additional guests are permitted per booking session at an extra charge of £5 per person. All guests must be approved and registered prior to arrival. Unapproved guests may be asked to leave the premises.
                </p>
              </div>

              {/* Missed Bookings */}
              <div className="mb-12">
                <h2 className="text-2xl font-light text-black mb-4 border-b border-gray-200 pb-2">6. Missed Bookings</h2>
                <p className="text-gray-600 leading-relaxed">
                  Missed bookings cannot be refunded or rescheduled. It is your responsibility to arrive on time for your scheduled session. We recommend arriving 5-10 minutes before your booking time.
                </p>
              </div>

              {/* Booking and Payment */}
              <div className="mb-12">
                <h2 className="text-2xl font-light text-black mb-4 border-b border-gray-200 pb-2">7. Booking and Payment</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  The following payment and booking policies apply:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Full payment is required upfront at the time of booking</li>
                  <li>Rescheduling is permitted with at least 48 hours&apos; notice</li>
                  <li>Bookings made within 48 hours of the session are considered final and non-changeable</li>
                </ul>
              </div>

              {/* Refunds and Cancellations */}
              <div className="mb-12">
                <h2 className="text-2xl font-light text-black mb-4 border-b border-gray-200 pb-2">8. Refunds and Cancellations</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Our refund and cancellation policy is as follows:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Cancellations are permitted within 24 hours of making the booking for a full refund</li>
                  <li>Beyond the 24-hour window, all payments are final</li>
                  <li>No refunds are provided for no-shows</li>
                </ul>
              </div>

              {/* Last-Minute Bookings */}
              <div className="mb-12">
                <h2 className="text-2xl font-light text-black mb-4 border-b border-gray-200 pb-2">9. Last-Minute Bookings</h2>
                <p className="text-gray-600 leading-relaxed">
                  Bookings made with less than 48 hours advance notice are considered last-minute bookings. These bookings are non-refundable and non-reschedulable under any circumstances.
                </p>
              </div>

              {/* Studio Rules */}
              <div className="mb-12">
                <h2 className="text-2xl font-light text-black mb-4 border-b border-gray-200 pb-2">10. Studio Rules</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  The following rules must be observed at all times:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>No smoking or alcohol consumption on the premises</li>
                  <li>Any equipment damage will incur repair or replacement charges</li>
                  <li>The studio space must be left clean and tidy after your session</li>
                  <li>Only approved guests are permitted in the studio</li>
                  <li>Volume limits must be respected to avoid disturbance</li>
                </ul>
              </div>

              {/* Session Times */}
              <div className="mb-12">
                <h2 className="text-2xl font-light text-black mb-4 border-b border-gray-200 pb-2">11. Session Times</h2>
                <p className="text-gray-600 leading-relaxed">
                  Session extensions are available upon request and subject to availability. Additional fees may apply for extended sessions. Please note that unused session time does not qualify for refunds or reductions.
                </p>
              </div>

              {/* Audio and Video Files */}
              <div className="mb-12">
                <h2 className="text-2xl font-light text-black mb-4 border-b border-gray-200 pb-2">12. Audio and Video Files</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Regarding your recorded content:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Files will be delivered via cloud transfer</li>
                  <li>Files are stored for 7 days only</li>
                  <li>You are responsible for downloading your files in a timely manner</li>
                  <li>After 7 days, files will be permanently deleted from our systems</li>
                </ul>
              </div>

              {/* Termination */}
              <div className="mb-12">
                <h2 className="text-2xl font-light text-black mb-4 border-b border-gray-200 pb-2">13. Termination</h2>
                <p className="text-gray-600 leading-relaxed">
                  East Dock Studios reserves the right to suspend or terminate access to our services for any violations of these terms without prior notice. We may also refuse service to anyone at our discretion.
                </p>
              </div>

              {/* Changes to Terms */}
              <div className="mb-12">
                <h2 className="text-2xl font-light text-black mb-4 border-b border-gray-200 pb-2">14. Changes to Terms</h2>
                <p className="text-gray-600 leading-relaxed">
                  These terms may be updated at any time. Material changes will be communicated 30 days prior to taking effect. Continued use of our services after changes take effect constitutes acceptance of the updated terms.
                </p>
              </div>

              {/* Liability and Warranties */}
              <div className="mb-12">
                <h2 className="text-2xl font-light text-black mb-4 border-b border-gray-200 pb-2">15. Liability and Warranties</h2>
                <p className="text-gray-600 leading-relaxed">
                  Our services are provided &quot;as is&quot; without any warranties, express or implied. East Dock Studios shall not be held liable for any damages resulting from the use of our services, including but not limited to loss of data, equipment failure, or scheduling conflicts.
                </p>
              </div>

              {/* Contact Information */}
              <div className="mb-12">
                <h2 className="text-2xl font-light text-black mb-4 border-b border-gray-200 pb-2">16. Contact Information</h2>
                <p className="text-gray-600 leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us at:{" "}
                  <a href="mailto:admin@eastdockstudios.co.uk" className="text-[#DC143C] hover:underline">
                    admin@eastdockstudios.co.uk
                  </a>
                </p>
              </div>

              {/* Last Updated */}
              <div className="text-center pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Last updated: December 2024
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
