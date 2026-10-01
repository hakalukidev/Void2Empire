"use client";

import { Shield } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-8 min-h-[calc(100vh-4rem)] pt-6 sm:pt-12">
      <div className="space-y-4 border-b border-border pb-8">
        <div className="flex items-center gap-3 text-primary">
          <Shield className="w-8 h-8" />
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
        </div>
        <p className="text-muted-foreground">Last Updated: September 2024</p>
      </div>

      <div className="prose prose-invert prose-p:text-muted-foreground prose-headings:text-foreground prose-a:text-primary max-w-none space-y-6">
        
        <section className="space-y-3">
          <h2 className="text-2xl font-bold">1. Introduction</h2>
          <p>
            Void2Empire (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our trading platform services.
          </p>
          <p>
            Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-bold">2. Information We Collect</h2>
          <p>We may collect information about you in a variety of ways. The information we may collect includes:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, and telephone number, that you voluntarily give to us when you register.</li>
            <li><strong>KYC Data:</strong> Identity verification documents required for compliance with Anti-Money Laundering (AML) regulations, including government-issued ID and proof of address.</li>
            <li><strong>Financial Data:</strong> Data related to your payment method and cryptocurrency wallet addresses.</li>
            <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the site, such as your IP address, browser type, and operating system.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-bold">3. Use of Your Information</h2>
          <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. We use information collected about you to:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Create and manage your account.</li>
            <li>Process your transactions and send related information.</li>
            <li>Comply with legal obligations, including AML and KYC regulations.</li>
            <li>Improve our platform, customer service, and overall user experience.</li>
            <li>Monitor and analyze usage and trends to improve your experience.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-bold">4. Disclosure of Your Information</h2>
          <p>We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>
          <p><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-bold">5. Security of Your Information</h2>
          <p>
            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-bold">6. Contact Us</h2>
          <p>If you have questions or comments about this Privacy Policy, please contact us at:</p>
          <p className="font-medium text-foreground">privacy@void2empire.com</p>
        </section>

      </div>
    </div>
  );
}
