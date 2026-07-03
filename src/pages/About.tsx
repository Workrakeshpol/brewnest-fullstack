import { motion } from 'framer-motion';
import { Leaf, Users, Sparkles, Globe } from 'lucide-react';
import Section from '../components/ui/Section';
import Container from '../components/ui/Container';
import Badge from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

const timeline = [
  {
    year: '2014',
    title: 'The Cart',
    description: 'Founder Maya Chen launches a coffee cart on Maple Street with a borrowed espresso machine and big dreams.',
  },
  {
    year: '2017',
    title: 'First Cafe',
    description: 'BrewNest opens its first brick-and-mortar location, doubling as a community gathering space.',
  },
  {
    year: '2020',
    title: 'In-House Roastery',
    description: 'We begin roasting our own beans, establishing direct-trade relationships with farms across three continents.',
  },
  {
    year: '2024',
    title: 'Three Locations',
    description: 'Now serving three neighborhoods with the same dedication to craft that started it all.',
  },
] as const;

const values = [
  {
    icon: Leaf,
    title: 'Sustainability',
    description: 'Compostable packaging, solar-powered roastery, and zero-waste initiatives across all locations.',
  },
  {
    icon: Globe,
    title: 'Direct Trade',
    description: 'We pay above fair-trade prices and visit every farm we source from at least once a year.',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Free workspace, local art shows, and monthly community events that bring people together.',
  },
  {
    icon: Sparkles,
    title: 'Craft',
    description: 'Every barista undergoes 40+ hours of training before pulling their first paying shot.',
  },
] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function About() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <Section padding="lg" className="pt-32">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="accent" size="md" className="mb-4">Our Story</Badge>
            <h1 className="font-serif text-4xl font-bold leading-tight text-text sm:text-5xl">
              Rooted in Passion,<br />Grown by Community
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-text-muted">
              BrewNest began with a simple belief: that a great cup of coffee
              can bring people together. What started as a single cart has
              blossomed into a gathering place where craft, community, and
              conscience meet.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-text-muted">
              We don't just serve coffee — we cultivate connections, champion
              ethical sourcing, and create a space where everyone feels at home.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative"
          >
            <div className="overflow-hidden rounded-3xl shadow-elevated">
              <img
                src="/images/about.jpg"
                alt="Barista grinding coffee beans"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden rounded-2xl bg-surface p-5 shadow-card sm:block">
              <p className="font-serif text-3xl font-bold text-accent">10+</p>
              <p className="text-sm text-text-muted">Years of craft</p>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ── Values ───────────────────────────────────────────── */}
      <Section variant="muted" padding="lg">
        <div className="mb-12 text-center">
          <Badge variant="muted" size="md" className="mb-4">What We Stand For</Badge>
          <h2 className="font-serif text-3xl font-bold text-text sm:text-4xl">
            Our Core Values
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {values.map((value, i) => (
            <motion.div
              key={value.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={fadeUp}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="flex h-full items-start gap-5 p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sage-100 text-sage-700 dark:bg-sage-800/40 dark:text-sage-300">
                  <value.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-text">{value.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-muted">{value.description}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── Timeline ─────────────────────────────────────────── */}
      <Section padding="lg">
        <div className="mb-12 text-center">
          <Badge variant="accent" size="md" className="mb-4">Milestones</Badge>
          <h2 className="font-serif text-3xl font-bold text-text sm:text-4xl">
            Our Journey
          </h2>
        </div>

        <div className="relative mx-auto max-w-3xl">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 h-full w-px bg-border sm:left-1/2 sm:-translate-x-1/2" />

          <div className="space-y-12">
            {timeline.map((item, i) => (
              <motion.div
                key={item.year}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative flex gap-6 sm:gap-8 ${i % 2 === 0 ? 'sm:flex-row-reverse' : ''}`}
              >
                {/* Dot */}
                <div className="absolute left-4 top-1.5 z-10 h-3 w-3 -translate-x-1/2 rounded-full bg-accent ring-4 ring-bg sm:left-1/2" />

                {/* Spacer for alternating layout on desktop */}
                <div className="hidden flex-1 sm:block" />

                {/* Content */}
                <div className="ml-10 flex-1 sm:ml-0">
                  <Card className="p-5">
                    <span className="font-serif text-2xl font-bold text-accent">{item.year}</span>
                    <h3 className="mt-1 font-serif text-lg font-semibold text-text">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-text-muted">{item.description}</p>
                  </Card>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Beans Banner ─────────────────────────────────────── */}
      <Section variant="muted" padding="md">
        <div className="relative overflow-hidden rounded-3xl">
          <img
            src="/images/beans.jpg"
            alt="Roasted coffee beans"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-espresso-950/70" />
          <div className="relative px-6 py-16 text-center sm:px-12 sm:py-24">
            <h2 className="font-serif text-3xl font-bold text-cream-50 sm:text-4xl">
              From Farm to Cup
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-cream-200">
              Every bean is traceable to its origin. We know our farmers by name,
              not by invoice number.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
