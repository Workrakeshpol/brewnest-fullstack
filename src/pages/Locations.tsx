import { motion } from 'framer-motion';
import { MapPin, Clock, Phone, Navigation } from 'lucide-react';
import Section from '../components/ui/Section';
import Container from '../components/ui/Container';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';

interface Location {
  name: string;
  address: string;
  city: string;
  phone: string;
  hours: { days: string; time: string }[];
  image: string;
  featured?: boolean;
}

const locations: Location[] = [
  {
    name: 'Maple Street (Flagship)',
    address: '128 Maple Street',
    city: 'Portland, OR 97201',
    phone: '(503) 555-0142',
    hours: [
      { days: 'Mon – Fri', time: '7am – 7pm' },
      { days: 'Sat – Sun', time: '8am – 8pm' },
    ],
    image: '/images/cafe-interior.jpg',
    featured: true,
  },
  {
    name: 'Riverside District',
    address: '42 Riverwalk Lane',
    city: 'Portland, OR 97204',
    phone: '(503) 555-0188',
    hours: [
      { days: 'Mon – Fri', time: '6:30am – 7pm' },
      { days: 'Sat – Sun', time: '7am – 6pm' },
    ],
    image: '/images/cafe-counter.jpg',
  },
  {
    name: 'Eastside Roastery',
    address: '301 Industrial Way',
    city: 'Portland, OR 97214',
    phone: '(503) 555-0203',
    hours: [
      { days: 'Mon – Fri', time: '7am – 6pm' },
      { days: 'Sat', time: '8am – 5pm' },
      { days: 'Sun', time: 'Closed' },
    ],
    image: '/images/beans.jpg',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function Locations() {
  return (
    <>
      {/* ── Header ───────────────────────────────────────────── */}
      <Section padding="lg" className="pt-32">
        <div className="text-center">
          <Badge variant="accent" size="md" className="mb-4">Find Us</Badge>
          <h1 className="font-serif text-4xl font-bold text-text sm:text-5xl">
            Your Neighborhood BrewNest
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
            Three locations across Portland, each with its own personality but
            the same commitment to craft.
          </p>
        </div>
      </Section>

      {/* ── Location Cards ───────────────────────────────────── */}
      <Section padding="lg" className="pt-4">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {locations.map((loc, i) => (
            <motion.div
              key={loc.name}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={fadeUp}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={loc.featured ? 'lg:col-span-2' : ''}
            >
              <Card className="overflow-hidden">
                <div className={`grid grid-cols-1 ${loc.featured ? 'lg:grid-cols-2' : ''}`}>
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto">
                    <img
                      src={loc.image}
                      alt={loc.name}
                      className="h-full w-full object-cover"
                    />
                    {loc.featured && (
                      <div className="absolute left-4 top-4">
                        <Badge variant="accent" size="md">Flagship</Badge>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-col justify-between p-6 sm:p-8">
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-text">{loc.name}</h2>
                      <div className="mt-4 space-y-3">
                        <div className="flex items-start gap-3 text-sm text-text-muted">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                          <span>
                            {loc.address}<br />{loc.city}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-text-muted">
                          <Phone className="h-4 w-4 shrink-0 text-accent" />
                          <span>{loc.phone}</span>
                        </div>
                        <div className="flex items-start gap-3 text-sm text-text-muted">
                          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                          <div className="space-y-1">
                            {loc.hours.map((h) => (
                              <div key={h.days} className="flex gap-3">
                                <span className="w-20 text-text">{h.days}</span>
                                <span>{h.time}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        <Navigation className="h-4 w-4" />
                        Get Directions
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <Section variant="muted" padding="md">
        <Container size="md" className="text-center">
          <h2 className="font-serif text-2xl font-bold text-text">
            Planning a visit with a group?
          </h2>
          <p className="mt-3 text-text-muted">
            We welcome reservations for parties of six or more. Give us a call
            ahead of time and we'll have a table ready.
          </p>
          <div className="mt-6">
            <Button to="/contact" variant="primary" size="md">
              Contact Us
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
