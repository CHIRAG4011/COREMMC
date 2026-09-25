'use client';

import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using the services provided by CoreMMC ("we," "our," or "us"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use our services. These Terms apply to all visitors, users, and others who access or use our hosting, VPS, and related services.`,
  },
  {
    title: '2. Description of Services',
    content: `CoreMMC provides web hosting, game server hosting (including but not limited to Minecraft and Hytale), virtual private servers (VPS), domain registration, Discord bot hosting, and related setup services. We reserve the right to modify, suspend, or discontinue any part of our services at any time, with reasonable notice to affected users.`,
  },
  {
    title: '3. Account Registration & Security',
    content: `You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate, current, and complete information during registration. You must notify us immediately of any unauthorized use of your account. CoreMMC will not be liable for any loss or damage arising from your failure to comply with this section.`,
  },
  {
    title: '4. Acceptable Use Policy',
    content: `You agree not to use our services to: (a) violate any applicable laws or regulations; (b) distribute malware, spam, or malicious content; (c) engage in DDoS attacks, brute-force attacks, or any form of abuse against third-party systems; (d) host or distribute copyrighted material without authorization; (e) operate phishing sites or engage in fraudulent activities; (f) mine cryptocurrency without explicit authorization on your plan; (g) resell your allocated resources without written consent from CoreMMC.`,
  },
  {
    title: '5. Payment & Billing',
    content: `All fees are billed in advance on a recurring basis (monthly, quarterly, or annually as selected). Payments are processed through our authorized payment providers. You are responsible for ensuring timely payment. Failure to pay may result in service suspension after a 7-day grace period, followed by termination after an additional 7 days. All prices are listed in INR unless otherwise stated and are exclusive of applicable taxes.`,
  },
  {
    title: '6. Service Level Agreement',
    content: `We strive to maintain a 99.9% uptime for all hosting services. Scheduled maintenance windows will be communicated at least 24 hours in advance via email and Discord announcements. In the event of unplanned downtime, we will apply service credits as outlined in our SLA documentation. CoreMMC is not responsible for downtime caused by third-party providers, DDoS attacks targeting your service, or customer-initiated configuration changes.`,
  },
  {
    title: '7. Data & Backups',
    content: `While we perform regular backups of our infrastructure, customers are solely responsible for maintaining their own backups of critical data. CoreMMC shall not be held liable for any data loss. Backup restoration requests may be subject to a fee and are processed on a best-effort basis.`,
  },
  {
    title: '8. Intellectual Property',
    content: `All content, branding, software, and materials provided by CoreMMC are our intellectual property or are licensed to us. You retain ownership of content you upload to your hosted services. By using our services, you grant CoreMMC a limited license to store, process, and deliver your content as necessary to provide the service.`,
  },
  {
    title: '9. Limitation of Liability',
    content: `To the maximum extent permitted by applicable law, CoreMMC shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or business opportunities, arising from or related to your use of our services. Our total liability shall not exceed the amount you have paid to us in the twelve (12) months preceding the claim.`,
  },
  {
    title: '10. Termination',
    content: `Either party may terminate these Terms at any time. You may terminate by cancelling your services through your account dashboard or by contacting support. CoreMMC reserves the right to terminate or suspend accounts that violate these Terms, with or without notice. Upon termination, your data will be retained for 30 days before permanent deletion.`,
  },
  {
    title: '11. Changes to Terms',
    content: `We reserve the right to update these Terms at any time. Material changes will be communicated via email and/or a prominent notice on our website at least 15 days before they take effect. Your continued use of our services after changes become effective constitutes acceptance of the revised Terms.`,
  },
  {
    title: '12. Governing Law',
    content: `These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these Terms or your use of our services shall be resolved through good-faith negotiation, and if unresolved, through binding arbitration in accordance with the Arbitration and Conciliation Act, 1996.`,
  },
  {
    title: '13. Contact',
    content: `For questions about these Terms, please contact us at support@coremmc.cloud or through our Discord server.`,
  },
];

export function TermsView() {
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
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#6366f1]/10 mb-4">
            <FileText className="w-7 h-7 text-[#6366f1]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Terms of <span className="gradient-text">Service</span>
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
              <h2 className="text-lg font-semibold text-white mb-2">
                {section.title}
              </h2>
              <p className="text-sm text-white/50 leading-relaxed whitespace-pre-line">
                {section.content}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}