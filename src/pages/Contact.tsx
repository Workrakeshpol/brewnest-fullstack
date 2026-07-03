import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Clock, Send, CheckCircle2, Loader2 } from 'lucide-react';
import Section from '../components/ui/Section';
import Container from '../components/ui/Container';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { contactApi } from '../lib/api';

const contactInfo = [
  {
    icon: MapPin,
    label: 'Visit',
    value: '128 Maple Street\nPortland, OR 97201',
  },
  {
    icon: Phone,
    label: 'Call',
    value: '(503) 555-0142',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'hello@brewnest.cafe',
  },
  {
    icon: Clock,
    label: 'Hours',
    value: 'Mon–Fri: 7am–7pm\nSat–Sun: 8am–8pm',
  },
] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Please enter your name';
    if (!form.email.trim()) e.email = 'Please enter your email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Please enter a valid email address';
    if (!form.message.trim()) e.message = 'Please enter a message';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await contactApi.submit(form);
      setSubmitted(true);
      setForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err: any) {
      setErrors({ message: err.message || 'Failed to send message. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* ── Header ───────────────────────────────────────────── */}
      <Section padding="lg" className="pt-32">
        <div className="text-center">
          <Badge variant="accent" size="md" className="mb-4">Get in Touch</Badge>
          <h1 className="font-serif text-4xl font-bold text-text sm:text-5xl">
            We'd Love to Hear From You
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
            Questions, feedback, or just want to say hello? Drop us a line and
            we'll get back to you within 24 hours.
          </p>
        </div>
      </Section>

      {/* ── Contact Info + Form ──────────────────────────────── */}
      <Section padding="lg" className="pt-4">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
          {/* Info column */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <h2 className="font-serif text-2xl font-bold text-text">Reach Us Directly</h2>
            <p className="mt-3 text-text-muted">
              Prefer the personal touch? Here's how to find us.
            </p>
            <div className="mt-8 space-y-6">
              {contactInfo.map((info) => (
                <div key={info.label} className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-caramel-100 text-caramel-700 dark:bg-caramel-900/40 dark:text-caramel-300">
                    <info.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text">{info.label}</p>
                    <p className="mt-0.5 whitespace-pre-line text-sm text-text-muted">
                      {info.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Form column */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-3"
          >
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-soft sm:p-8">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sage-100 text-sage-600 dark:bg-sage-800/40 dark:text-sage-300">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="mt-4 font-serif text-xl font-semibold text-text">
                    Message Sent!
                  </h3>
                  <p className="mt-2 text-sm text-text-muted">
                    Thanks for reaching out. We'll get back to you soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Input
                      label="Name"
                      name="name"
                      placeholder="Jane Doe"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      error={errors.name}
                    />
                    <Input
                      label="Email"
                      name="email"
                      type="email"
                      placeholder="jane@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      error={errors.email}
                    />
                  </div>
                  <Input
                    label="Subject"
                    name="subject"
                    placeholder="What's this about?"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  />
                  <Textarea
                    label="Message"
                    name="message"
                    placeholder="Tell us what's on your mind..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    error={errors.message}
                  />
                  <Button type="submit" variant="primary" size="md" fullWidth disabled={submitting}>
                    {submitting ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
                    ) : (
                      <><Send className="h-4 w-4" /> Send Message</>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </Section>
    </>
  );
}
