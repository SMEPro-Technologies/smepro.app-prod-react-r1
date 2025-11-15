import React, { useState } from 'react';
import { SmeHelperContext } from '../types';
import { LifeBuoyIcon, DollarSignIcon, FeedbackIcon, LightbulbIcon, SendIcon } from './icons';

interface ContactPageProps {
  onSetHelperContext: (context: SmeHelperContext) => void;
}

type Category = 'support' | 'sales' | 'feedback';

const ContactPage: React.FC<ContactPageProps> = ({ onSetHelperContext }) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('support');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [ideaData, setIdeaData] = useState({ name: '', email: '', idea: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [ideaSubmitted, setIdeaSubmitted] = useState(false);

  const categoryDetails = {
    support: { icon: <LifeBuoyIcon className="w-6 h-6" />, email: 'admin@smepro.app', title: 'Technical Support' },
    sales: { icon: <DollarSignIcon className="w-6 h-6" />, email: 'sales@smepro.app', title: 'Sales & Enterprise' },
    feedback: { icon: <FeedbackIcon className="w-6 h-6" />, email: 'admin@smepro.app', title: 'General Feedback' },
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleIdeaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setIdeaData({ ...ideaData, [e.target.name]: e.target.value });
  };
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('General Inquiry Submitted:', { category: selectedCategory, ...formData });
    setFormSubmitted(true);
    setTimeout(() => {
        setFormSubmitted(false);
        setFormData({ name: '', email: '', message: '' });
    }, 3000);
  };
  
  const handleIdeaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('App Idea Submitted:', ideaData);
    setIdeaSubmitted(true);
     setTimeout(() => {
        setIdeaSubmitted(false);
        setIdeaData({ name: '', email: '', idea: '' });
    }, 3000);
  };

  return (
    <div className="animate-fade-in container mx-auto px-6 py-16" onMouseEnter={() => onSetHelperContext('APP_CONTACT')}>
      <div className="text-center mb-12 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white">Get in Touch</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mt-4">
          We're here to help. Whether you have a question about features, trials, or anything else, our team is ready to answer all your questions.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
        {/* General Contact Form */}
        <div className="bg-white dark:bg-slate-800/50 p-8 rounded-lg border border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Contact Us</h2>
          
          <div className="flex space-x-2 mb-6 border-b border-slate-200 dark:border-slate-700 pb-6">
            {(['support', 'sales', 'feedback'] as Category[]).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg text-sm font-semibold transition-colors ${selectedCategory === cat ? 'bg-cyan-500 text-white' : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
              >
                {categoryDetails[cat].icon}
                <span className="capitalize">{cat}</span>
              </button>
            ))}
          </div>

          {formSubmitted ? (
             <div className="text-center py-20 text-green-500 dark:text-green-400">
                <h3 className="font-bold text-xl">Thank You!</h3>
                <p>Your message has been sent. We'll get back to you shortly.</p>
             </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">Your message will be sent to <strong className="text-slate-700 dark:text-slate-300">{categoryDetails[selectedCategory].email}</strong>.</p>
              <div>
                <label htmlFor="name" className="sr-only">Name</label>
                <input type="text" name="name" id="name" placeholder="Your Name" required value={formData.name} onChange={handleFormChange} className="w-full p-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg" />
              </div>
              <div>
                <label htmlFor="email" className="sr-only">Email</label>
                <input type="email" name="email" id="email" placeholder="Your Email" required value={formData.email} onChange={handleFormChange} className="w-full p-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg" />
              </div>
              <div>
                <label htmlFor="message" className="sr-only">Message</label>
                <textarea name="message" id="message" placeholder="Your Message" required rows={4} value={formData.message} onChange={handleFormChange} className="w-full p-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg"></textarea>
              </div>
              <button type="submit" className="w-full py-3 font-bold rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white">Send Message</button>
            </form>
          )}
        </div>

        {/* Share Idea */}
        <div className="bg-gradient-to-br from-cyan-400 to-blue-500 p-8 rounded-lg text-white text-center flex flex-col justify-center">
            <LightbulbIcon className="w-12 h-12 mx-auto mb-4"/>
            <h2 className="text-3xl font-extrabold mb-4">Share Your App Idea!</h2>
            <p className="text-lg opacity-90 mb-6">
                Have an amazing app idea? Submit it for a chance to have it built LIVE by SMEPro during our live stream event. The winner will be announced and must be an active guest to claim their prize!
            </p>
            {ideaSubmitted ? (
                <div className="py-12">
                    <h3 className="font-bold text-2xl">Idea Submitted!</h3>
                    <p>Good luck! We'll be in touch if you're selected.</p>
                </div>
            ) : (
                <form onSubmit={handleIdeaSubmit} className="space-y-4 text-left">
                     <div>
                        <label htmlFor="idea-name" className="sr-only">Name</label>
                        <input type="text" name="name" id="idea-name" placeholder="Your Name" required value={ideaData.name} onChange={handleIdeaChange} className="w-full p-3 bg-white/20 border border-white/30 rounded-lg placeholder-white/70" />
                    </div>
                    <div>
                        <label htmlFor="idea-email" className="sr-only">Email</label>
                        <input type="email" name="email" id="idea-email" placeholder="Your Email" required value={ideaData.email} onChange={handleIdeaChange} className="w-full p-3 bg-white/20 border border-white/30 rounded-lg placeholder-white/70" />
                    </div>
                    <div>
                        <label htmlFor="idea" className="sr-only">Your Idea</label>
                        <textarea name="idea" id="idea" placeholder="Describe your app idea..." required rows={4} value={ideaData.idea} onChange={handleIdeaChange} className="w-full p-3 bg-white/20 border border-white/30 rounded-lg placeholder-white/70"></textarea>
                    </div>
                    <button type="submit" className="w-full py-3 font-bold rounded-lg bg-white text-cyan-500 hover:bg-slate-100">Submit My Idea</button>
                </form>
            )}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;