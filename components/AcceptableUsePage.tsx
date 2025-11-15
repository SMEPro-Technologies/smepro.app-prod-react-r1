import React from 'react';
import { SmeHelperContext } from '../types';

interface AcceptableUsePageProps {
  onSetHelperContext: (context: SmeHelperContext) => void;
}

const AcceptableUsePage: React.FC<AcceptableUsePageProps> = ({ onSetHelperContext }) => {
  return (
    <div className="animate-fade-in container mx-auto px-6 py-16" onMouseEnter={() => onSetHelperContext('APP_ACCEPTABLE_USE')}>
      <div className="max-w-4xl mx-auto prose dark:prose-invert">
        <h1>Acceptable Use & SAFE AI Policy</h1>
        <p className="text-sm text-slate-500">Last updated: {new Date().toLocaleDateString()}</p>

        <p>This policy outlines the acceptable use of the SMEPro.app Service and explains the function and purpose of our SAFE AI system. By using our Service, you agree to this policy.</p>

        <h2>1. Prohibited Activities</h2>
        <p>You may not use the Service to generate, store, or transmit any content that:</p>
        <ul>
            <li><strong>Is Illegal or Promotes Illegal Acts:</strong> This includes, but is not limited to, content that facilitates child sexual abuse, terrorism, illegal drug use, or any other criminal activity.</li>
            <li><strong>Is Hateful, Harassing, or Violent:</strong> Content that promotes violence, incites hatred, promotes discrimination, or disparages on the basis of race or ethnic origin, religion, disability, age, nationality, veteran status, sexual orientation, sex, gender identity, caste, or any other characteristic that is associated with systemic discrimination or marginalization.</li>
            <li><strong>Generates Malicious Code:</strong> Content intended to generate or distribute malware, viruses, or other harmful code.</li>
            <li><strong>Is Sexually Explicit:</strong> Content that is pornographic or intended to be sexually gratifying.</li>
            <li><strong>Infringes on Intellectual Property:</strong> Content that violates copyright, trademark, or other intellectual property rights of others.</li>
            <li><strong>Involves High-Risk Activities:</strong> Use of the Service in a way that could lead to death, personal injury, or environmental damage, such as in the operation of critical infrastructure or medical devices.</li>
        </ul>
        <p>Violation of this policy may lead to a warning, temporary suspension, or permanent termination of your account.</p>
        
        <h2>2. Our Commitment to SAFE AI</h2>
        <p>SMEPro is built on a foundation of safety. Our "SAFE AI" system is a multi-layered approach designed to create a secure and responsible environment for all users.</p>
        
        <h3>How SAFE AI Works:</h3>
        <ul>
            <li><strong>Proactive Filtering:</strong> Our models are trained to avoid generating unsafe content, including harmful, biased, or sexually explicit material.</li>
            <li><strong>Prompt Analysis:</strong> Your prompts are analyzed in real-time for keywords and intent that may violate our policies.</li>
            <li><strong>Reasoning & Pivot Tactics:</strong> When a potentially harmful or sensitive topic is detected, our AI is designed not to just refuse, but to explain *why* the topic is inappropriate and attempt to pivot the conversation to a productive, safe alternative. This is a core part of our "yellow brick road" logic, guiding users toward safe and actionable outcomes.</li>
            <li><strong>Data Redaction:</strong> Our system attempts to identify and redact personally identifiable information (PII) like social security numbers or credit card numbers to protect your privacy, even from accidental disclosure.</li>
            <li><strong>Warnings and Lockouts:</strong> Blatant attempts to misuse the Service will trigger a clear warning. Repeated attempts will result in a temporary session lockout to prevent abuse. These incidents may be logged for review by our moderation team.</li>
        </ul>

        <h2>3. User Responsibility</h2>
        <p>While we strive to make our AI as safe as possible, no system is perfect. You are ultimately responsible for the content you create and the actions you take based on the AI's output. The AI-generated content is for informational purposes and should not be considered a substitute for professional advice (e.g., legal, financial, or medical).</p>

        <h2>4. Reporting Violations</h2>
        <p>If you encounter content or behavior that you believe violates this policy, please report it immediately to <a href="mailto:admin@smepro.app">admin@smepro.app</a>.</p>
        
        <h2>5. Contact Us</h2>
        <p>If you have any questions about this Acceptable Use & SAFE AI Policy, please contact us at: <a href="mailto:admin@smepro.app">admin@smepro.app</a></p>
      </div>
    </div>
  );
};

export default AcceptableUsePage;