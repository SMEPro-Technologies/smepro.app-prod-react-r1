import React from 'react';
import { SmeHelperContext } from '../types';

interface PrivacyPolicyPageProps {
  onSetHelperContext: (context: SmeHelperContext) => void;
}

const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onSetHelperContext }) => {
  return (
    <div className="animate-fade-in container mx-auto px-6 py-16" onMouseEnter={() => onSetHelperContext('APP_PRIVACY')}>
      <div className="max-w-4xl mx-auto prose dark:prose-invert">
        <h1>Privacy Policy</h1>
        <p className="text-sm text-slate-500">Last updated: {new Date().toLocaleDateString()}</p>

        <p>SMEPro Technologies ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application, SMEPro.app (the "Service").</p>

        <h2>1. Information We Collect</h2>
        <p>We may collect information about you in a variety of ways. The information we may collect via the Service includes:</p>
        <ul>
            <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, and company name, that you voluntarily give to us when you register for the Service.</li>
            <li><strong>Subscription Data:</strong> Information related to your subscription plan, billing cycle, and payment status, which is processed and managed by our third-party payment processor (Stripe). We do not store your credit card details.</li>
            <li><strong>Session and Usage Data:</strong> All conversational data, including messages, SME configurations, and interactions within a session, as well as items you save to your SMEVault, are stored as part of your user account.</li>
        </ul>

        <h2>2. Use of Your Information</h2>
        <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Service to:</p>
        <ul>
            <li>Create and manage your account.</li>
            <li>Provide the core functionality of the Service, including storing and retrieving your chat sessions and Vault items.</li>
            <li>Process payments and manage your subscription.</li>
            <li>Email you regarding your account or order.</li>
            <li>Respond to customer service requests.</li>
        </ul>

        <h2>3. Commitment to Data Privacy and Model Training</h2>
        <p><strong>Your data is not our product.</strong> We have a strict policy against using your personal, sensitive, or proprietary data for training our AI models or any third-party models.</p>
        <p>Specifically:</p>
        <ul>
            <li>The content of your chat sessions, including all prompts and AI-generated responses, is considered your private data.</li>
            <li>The contents of your SMEVault, including all saved items and analyses, are your private data.</li>
            <li>This user-specific data is **never** aggregated, shared, or used to train, fine-tune, or improve our AI models or any other machine learning systems for other users.</li>
        </ul>
        <p>Your account, your storage, and your interactions are secure and private, with access authenticated only for you.</p>

        <h2>4. Disclosure of Your Information</h2>
        <p>We do not share, sell, rent, or trade your personal information with third parties for their commercial purposes.</p>

        <h2>5. Security of Your Information</h2>
        <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.</p>
        
        <h2>6. Your Rights (GDPR & CCPA)</h2>
        <p>Depending on your location, you may have the following rights regarding your personal data:</p>
        <ul>
            <li>The right to access – You have the right to request copies of your personal data.</li>
            <li>The right to rectification – You have the right to request that we correct any information you believe is inaccurate.</li>
            <li>The right to erasure – You have the right to request that we erase your personal data, under certain conditions.</li>
            <li>The right to restrict processing – You have the right to request that we restrict the processing of your personal data, under certain conditions.</li>
        </ul>
        <p>To exercise these rights, please contact us at <a href="mailto:admin@smepro.app">admin@smepro.app</a>.</p>

        <h2>7. Contact Us</h2>
        <p>If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:admin@smepro.app">admin@smepro.app</a></p>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;