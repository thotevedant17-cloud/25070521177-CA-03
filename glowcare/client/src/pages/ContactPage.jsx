import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Clock, MessageCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';

export default function ContactPage() {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      setSending(true);
      // Simulate send (no backend endpoint for contact form in this demo)
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Message sent! We\'ll get back to you soon.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="bg-gradient-to-r from-blush via-rose-light to-cream py-16">
        <div className="container text-center">
          <h1 className="font-serif text-4xl font-bold text-brown mb-3">Contact Us</h1>
          <p className="text-brown/70 max-w-md mx-auto">We'd love to hear from you. Reach out with questions, feedback, or just to say hello!</p>
        </div>
      </section>

      <div className="container py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-cream p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-rose-light flex items-center justify-center shrink-0">
                  <Mail size={18} className="text-rose" />
                </div>
                <div>
                  <h3 className="font-semibold text-brown text-sm mb-1">Email</h3>
                  <p className="text-sm text-taupe">hello@glowcare.com</p>
                  <p className="text-sm text-taupe">support@glowcare.com</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-cream p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-rose-light flex items-center justify-center shrink-0">
                  <Phone size={18} className="text-rose" />
                </div>
                <div>
                  <h3 className="font-semibold text-brown text-sm mb-1">Phone</h3>
                  <p className="text-sm text-taupe">+91 98765 43210</p>
                  <p className="text-xs text-taupe mt-1">Mon-Sat, 10am - 7pm IST</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-cream p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-rose-light flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-rose" />
                </div>
                <div>
                  <h3 className="font-semibold text-brown text-sm mb-1">Address</h3>
                  <p className="text-sm text-taupe">123 Beauty Lane<br />Mumbai, Maharashtra 400001<br />India</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-cream p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-rose-light flex items-center justify-center shrink-0">
                  <Clock size={18} className="text-rose" />
                </div>
                <div>
                  <h3 className="font-semibold text-brown text-sm mb-1">Response Time</h3>
                  <p className="text-sm text-taupe">We typically respond within 24 hours</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl border border-cream p-8">
              <h2 className="font-serif text-xl font-bold text-brown mb-1 flex items-center gap-2">
                <MessageCircle size={20} /> Send us a Message
              </h2>
              <p className="text-sm text-taupe mb-6">Fill out the form and we'll get back to you as soon as possible.</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="form-label">Name *</label>
                    <input
                      className="form-input"
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      className="form-input"
                      value={form.email}
                      onChange={e => setForm({...form, email: e.target.value})}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">Subject</label>
                  <input
                    className="form-input"
                    value={form.subject}
                    onChange={e => setForm({...form, subject: e.target.value})}
                    placeholder="How can we help?"
                  />
                </div>
                <div>
                  <label className="form-label">Message *</label>
                  <textarea
                    className="form-input min-h-36 resize-none"
                    value={form.message}
                    onChange={e => setForm({...form, message: e.target.value})}
                    placeholder="Tell us more..."
                    required
                  />
                </div>
                <button type="submit" disabled={sending} className="btn btn-primary btn-lg">
                  {sending ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">Send Message <Send size={16} /></span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
