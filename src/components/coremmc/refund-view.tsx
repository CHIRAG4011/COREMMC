'use client';

import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

const sections = [
  {
    title: '1. General Refund Policy',
    content: `At CoreMMC, we want you to be satisfied with our services. We understand that circumstances change, and we strive to handle refund requests fairly and transparently. This Refund Policy outlines the conditions under which refunds are granted for our hosting, VPS, and related services.`,
  },
  {
    title: '2. Eligible for Refund',
    items: [
      {
        subtitle: 'First-Time Purchase (Within 48 Hours)',
        text: 'If you are a new customer and this is your first purchase with CoreMMC, you are eligible for a full refund within 48 hours of the original transaction, provided that the service has not been substantially used.',
      },
      {
        subtitle: 'Service Downtime',
        text: 'If your service experiences prolonged, unannounced downtime exceeding 4 consecutive hours due to a fault on our end (excluding DDoS attacks, customer misconfiguration, or third-party outages), you may request a pro-rata credit or refund for the affected billing period.',
      },
      {
        subtitle: 'Duplicate Payments',
        text: 'If you are charged twice for the same service due to a billing error, we will issue a full refund for the duplicate amount within 3-5 business days.',
      },
      {
        subtitle: 'Service Not Delivered',
        text: 'If a service you purchased is not provisioned or activated within a reasonable timeframe (24 hours for automated services, 72 hours for custom setups) and we are unable to resolve the issue, you are entitled to a full refund.',
      },
    ],
  },
  {
    title: '3. Not Eligible for Refund',
    items: [
      {
        subtitle: 'Used Services',
        text: 'Refunds will not be issued for services that have been actively used for more than 48 hours after provisioning. This includes any resource consumption, traffic generation, or active configuration on the service.',
      },
      {
        subtitle: 'Account Termination for ToS Violations',
        text: 'Services terminated due to violations of our Terms of Service or Acceptable Use Policy are not eligible for any refund or credit.',
      },
      {
        subtitle: 'Domain Registrations',
        text: 'Domain registration fees are non-refundable once the domain has been registered with the respective registry. Domains can be cancelled but the registration fee will not be returned.',
      },
      {
        subtitle: 'Setup Services',
        text: 'Custom setup, configuration, and paid work services that have been completed are non-refundable once delivered.',
      },
      {
        subtitle: 'Discord Bot Hosting (Low-Tier Plans)',
        text: 'Refunds for promotional or heavily discounted plans may be limited to store credit at our discretion.',
      },
    ],
  },
  {
    title: '4. How to Request a Refund',
    content: `To initiate a refund request:
1. Contact our support team via Discord (#tickets channel) or email at support@coremmc.cloud.
2. Provide your account email, service identifier, and the reason for the refund.
3. Include your transaction ID or payment reference number.
4. Our team will review your request and respond within 1-2 business days.`,
  },
  {
    title: '5. Refund Processing',
    content: `Approved refunds are processed within 5-10 business days. Refunds are issued to the original payment method used for the purchase. Please note:
- UPI/IMPS transfers: 3-5 business days
- Credit/Debit cards: 5-10 business days
- Bank transfers (NEFT/RTGS): 5-7 business days
- Wallet credits: Instantaneous

If the original payment method is no longer available, we will issue the refund via bank transfer to your verified bank account.`,
  },
  {
    title: '6. Service Credits',
    content: `In some cases, we may offer service credits as an alternative to refunds. Service credits are applied to your account balance and can be used toward future purchases. Service credits are valid for 12 months from the date of issuance and are non-transferable.`,
  },
  {
    title: '7. Renewal Refunds',
    content: `Automatic renewal payments are eligible for a refund only if the refund request is made within 24 hours of the renewal charge and the renewed service period has not been used. After 24 hours, renewal charges are considered final.`,
  },
  {
    title: '8. Disputes',
    content: `If you believe your refund request was unfairly denied, you may escalate the matter by contacting our management team at support@coremmc.cloud with the subject line "Refund Dispute - [Your Account Email]". We will conduct a secondary review within 3 business days.`,
  },
  {
    title: '9. Policy Changes',
    content: `CoreMMC reserves the right to modify this Refund Policy at any time. Changes will be communicated via email and/or our website at least 15 days before taking effect. The policy in effect at the time of purchase will apply to that transaction.`,
  },
  {
    title: '10. Contact',
    content: `For refund-related inquiries, please reach out to support@coremmc.cloud or join our Discord server for live assistance.`,
  },
];

export function RefundView() {
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
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#f59e0b]/10 mb-4">
            <RotateCcw className="w-7 h-7 text-[#f59e0b]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Refund <span className="gradient-text">Policy</span>
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
                    <div key={item.subtitle} className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
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