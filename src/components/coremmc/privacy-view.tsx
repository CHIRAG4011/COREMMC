'use client';

import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

const sections = [
  {
    title: '1. Information We Collect',
    items: [
      {
        subtitle: 'Personal Information',
        text: 'When you create an account, we collect your name, email address, and billing information (including payment details processed through our secure payment providers). We do not store full credit card numbers on our servers.',
      },
      {
        subtitle: 'Usage Data',
        text: 'We automatically collect information about your interactions with our services, including IP addresses, browser type, device information, pages visited, and service usage metrics (CPU, RAM, bandwidth).',
      },
      {
        subtitle: 'Communication Data',
        text: 'We record support ticket conversations, chat logs (where applicable), and email communications to improve our support quality and maintain records for dispute resolution.',
      },
    ],
  },
  {
    title: '2. How We Use Your Information',
    content: `We use collected information to: (a) provide, maintain, and improve our hosting services; (b) process payments and manage your account; (c) send service-related notifications, updates, and alerts; (d) respond to support requests and inquiries; (e) detect, prevent, and address fraud, abuse, and security issues; (f) comply with legal obligations; (g) analyze usage patterns to improve our infrastructure and user experience.`,
  },
  {
    title: '3. Data Sharing & Third Parties',
    content: `We do not sell your personal information. We may share your data with: (a) authorized payment processors for billing purposes; (b) infrastructure providers (e.g., data centers, CDN providers) as necessary to deliver our services; (c) law enforcement authorities when required by law or to protect our rights and safety; (d) analytics partners who help us understand service usage in an aggregated, anonymized manner.`,
  },
  {
    title: '4. Data Storage & Security',
    content: `Your data is stored on secure servers within India and/or other jurisdictions as necessary for service delivery. We implement industry-standard security measures including encryption at rest (AES-256) and in transit (TLS 1.3), regular security audits, access controls, and monitoring systems. While we strive to protect your data, no method of electronic storage is 100% secure, and we cannot guarantee absolute security.`,
  },
  {
    title: '5. Cookies & Tracking Technologies',
    content: `We use cookies and similar technologies for: (a) authenticating your session; (b) remembering your preferences; (c) analyzing site traffic and usage patterns; (d) delivering personalized content where applicable. You can control cookie settings through your browser. Essential cookies required for service functionality cannot be disabled.`,
  },
  {
    title: '6. Data Retention',
    content: `We retain your personal information for as long as your account is active or as needed to provide services. Upon account deletion, personal data is removed within 30 days, except where retention is required by law (e.g., financial records retained for 5 years as per Indian tax regulations). Anonymized usage data may be retained indefinitely for analytical purposes.`,
  },
  {
    title: '7. Your Rights',
    content: `You have the right to: (a) access your personal data through your account dashboard; (b) request correction of inaccurate data; (c) request deletion of your personal data (subject to legal retention requirements); (d) export your data in a machine-readable format; (e) opt out of non-essential communications. To exercise these rights, contact us at support@coremmc.cloud.`,
  },
  {
    title: '8. Children\'s Privacy',
    content: `Our services are not directed at individuals under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it promptly.`,
  },
  {
    title: '9. International Data Transfers',
    content: `If your data is transferred outside of India, we ensure appropriate safeguards are in place, including standard contractual clauses and adherence to applicable data protection frameworks. We primarily utilize infrastructure within India to minimize cross-border transfers.`,
  },
  {
    title: '10. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. We will notify you of material changes via email and/or a prominent notice on our website at least 15 days before they take effect. Continued use of our services after changes take effect constitutes acceptance of the updated policy.`,
  },
  {
    title: '11. Contact Us',
    content: `For any privacy-related questions or concerns, please contact us at support@coremmc.cloud or through our Discord server.`,
  },
];

export function PrivacyView() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#22c55e]/10 mb-4">
            <Shield className="w-7 h-7 text-[#22c55e]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Privacy <span className="gradient-text">Policy</span>
          </h1>
          <p className="text-white/50 text-sm">Last updated: July 2025</p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="glass rounded-2xl p-6 md:p-8 space-y-8"
        >
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-lg font-semibold text-white mb-3">
                {section.title}
              </h2>
              {'content' in section && (
                <p className="text-sm text-white/50 leading-relaxed whitespace-pre-line">
                  {section.content}
                </p>
              )}
              {'items' in section && (
                <div className="space-y-4">
                  {section.items.map((item) => (
                    <div key={item.subtitle}>
                      <h3 className="text-sm font-medium text-white/70 mb-1">
                        {item.subtitle}
                      </h3>
                      <p className="text-sm text-white/50 leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}