import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Leaf, Coffee, Award, Heart, CheckCircle2, ChevronRight } from 'lucide-react';
import Section from '../components/ui/Section';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { productsApi } from '../lib/api';
import type { Product } from '../types';

const storySteps = [
  {
    step: '01',
    title: 'Ethical Sourcing',
    subtitle: 'Direct Trade Coffee Beans',
    description: 'We travel directly to family-owned farms in Ethiopia, Colombia, and Sumatra to source organic Arabica beans, paying above fair-trade prices to ensure sustainability and pick only the highest quality cherries.',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    icon: Leaf
  },
  {
    step: '02',
    title: 'In-House Roasting',
    subtitle: 'Small-Batch Craft Roasting',
    description: 'Our beans are roasted weekly in small batches at our Portland facility. We customize roast curves for each origin to highlight natural fruit, chocolate, and floral notes.',
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80',
    icon: Coffee
  },
  {
    step: '03',
    title: 'Precision Brewing',
    subtitle: 'Scientific Extraction',
    description: 'From water chemistry to extraction times, our certified baristas use customized recipes for pour-overs, cold brews, and espresso to pull the perfect cup every single time.',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    icon: Award
  }
];

const values = [
  {
    icon: Leaf,
    title: 'Ethically Sourced',
    description: 'Direct-trade relationships with farmers who share our values.',
  },
  {
    icon: Coffee,
    title: 'Small-Batch Roasted',
    description: 'Roasted in-house weekly for peak freshness and flavor.',
  },
  {
    icon: Award,
    title: 'Award Winning',
    description: 'Recognized by the Specialty Coffee Association three years running.',
  },
  {
    icon: Heart,
    title: 'Community First',
    description: 'A welcoming space where everyone belongs and connections brew.',
  },
] as const;

const LOCAL_FALLBACK_PRODUCTS = [
  {
    id: 'single-origin-espresso',
    name: 'Single-Origin Espresso',
    description: 'Ethiopian Yirgacheffe — bright, floral, with notes of bergamot.',
    price: 4.50,
    image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80',
    tags: ['Signature', 'Popular'],
  },
  {
    id: 'pour-over-v60',
    name: 'Pour Over (V60)',
    description: 'Hand-poured V60 highlighting the unique terroir of each bean.',
    price: 5.50,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    tags: ['Signature', 'Popular'],
  },
  {
    id: 'slow-cold-brew',
    name: 'Slow Cold Brew',
    description: '18-hour steeped cold brew, smooth and naturally sweet.',
    price: 4.75,
    image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=800&q=80',
    tags: ['Signature', 'Refreshing'],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await productsApi.list({ sort: 'popular', limit: 3 });
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          setFeaturedProducts(data.items);
        } else {
          setFeaturedProducts(LOCAL_FALLBACK_PRODUCTS);
        }
      } catch (err) {
        console.warn('[Home] Failed to load featured products from API. Using local fallbacks.');
        setFeaturedProducts(LOCAL_FALLBACK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative min-h-[100svh] w-full overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1600&q=80"
            alt="Cinematic coffee shop interior with latte art"
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-espresso-950/60 via-espresso-950/50 to-espresso-950/80" />
        </div>

        {/* Content */}
        <Container size="xl" className="relative flex min-h-[100svh] flex-col justify-center pt-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.7 }}
            className="max-w-2xl bg-espresso-950/60 border border-cream-200/10 backdrop-blur-md p-8 rounded-xl"
          >
            <Badge variant="accent" size="md" className="mb-6">
              <span className="mr-1.5">☕</span> Specialty Coffee Since 2014
            </Badge>
            <h1 className="font-serif text-4xl font-bold leading-tight text-cream-50 sm:text-5xl lg:text-6xl">
              Where Every Cup<br />
              <span className="text-caramel-300">Tells a Story</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-cream-200">
              From bean to brew, we craft exceptional coffee with intention.
              Sourced ethically, roasted in-house, served with heart.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button to="/menu" variant="cta" size="lg">
                Explore the Menu
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button to="/about" variant="outline" size="lg" className="border-cream-300/40 text-cream-50 hover:bg-cream-50/10">
                Our Story
              </Button>
            </div>
          </motion.div>
        </Container>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-cream-300/50 p-1.5">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="h-2 w-1 rounded-full bg-cream-300/70"
            />
          </div>
        </div>
      </section>

      {/* ── Values ────────────────---------------------------- */}
      <Section variant="glass" padding="lg">
        <div className="mb-12 text-center">
          <Badge variant="muted" size="md" className="mb-4">Our Craft</Badge>
          <h2 className="font-serif text-3xl font-bold text-text sm:text-4xl">
            More Than Just Coffee
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-text-muted">
            We believe great coffee is built on relationships — with farmers,
            with our craft, and with our community.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value, i) => (
            <motion.div
              key={value.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={fadeUp}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card interactive glass className="h-full p-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-caramel-100 text-caramel-700 dark:bg-caramel-900/40 dark:text-caramel-300">
                  <value.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-4 font-serif text-lg font-semibold text-text">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  {value.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── Source-to-Cup Story (Interactive) ────────────────── */}
      <Section variant="muted" padding="lg" className="border-t border-b border-border">
        <div className="mb-16 text-center">
          <Badge variant="accent" size="md" className="mb-4">Sourcing & Roasting</Badge>
          <h2 className="font-serif text-3xl font-bold text-text sm:text-4xl">
            Our Source-to-Cup Journey
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-text-muted">
            Discover the dedication, science, and care behind every drop of coffee we pour.
          </p>
        </div>

        <div className="space-y-24">
          {storySteps.map((step, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div key={step.step} className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
                {/* Image side */}
                <motion.div
                  className={`lg:col-span-6 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}
                  initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                  <div className="relative overflow-hidden rounded-2xl shadow-card group">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="h-96 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-espresso-950/40 to-transparent" />
                    <div className="absolute left-6 top-6 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-lg font-bold text-white shadow-soft">
                      {step.step}
                    </div>
                  </div>
                </motion.div>

                {/* Text side */}
                <motion.div
                  className={`lg:col-span-6 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}
                  initial={{ opacity: 0, x: isEven ? 40 : -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
                >
                  <div className="space-y-4 lg:max-w-md mx-auto">
                    <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent">
                      <step.icon className="h-4 w-4" />
                      {step.subtitle}
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-text sm:text-3xl">
                      {step.title}
                    </h3>
                    <p className="text-base leading-relaxed text-text-muted">
                      {step.description}
                    </p>
                    <ul className="space-y-2 pt-2">
                      <li className="flex items-center gap-2 text-sm text-text">
                        <CheckCircle2 className="h-4.5 w-4.5 text-accent shrink-0" />
                        <span>100% Traceable supply chains</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm text-text">
                        <CheckCircle2 className="h-4.5 w-4.5 text-accent shrink-0" />
                        <span>Carefully monitored organic farming</span>
                      </li>
                    </ul>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── Featured Menu ────────────────────────────────────── */}
      <Section variant="glass" padding="lg">
        <div className="mb-12 flex flex-col items-end justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Badge variant="accent" size="md" className="mb-4">Featured</Badge>
            <h2 className="font-serif text-3xl font-bold text-text sm:text-4xl">
              Crowd Favorites
            </h2>
          </div>
          <Link
            to="/menu"
            className="group inline-flex items-center gap-2 text-sm font-medium text-accent hover:gap-3 transition-all"
          >
            View Full Menu
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="animate-pulse rounded-2xl border border-border bg-surface p-5 space-y-4">
                <div className="aspect-[4/3] w-full rounded-xl bg-border" />
                <div className="h-6 w-3/4 rounded bg-border" />
                <div className="h-4 w-1/2 rounded bg-border" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((item, i) => (
              <motion.div
                key={item.id || item.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link to={`/menu/${item.id}`} className="group block h-full">
                  <Card interactive glass className="h-full">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={
                          item.image === '/images/espresso.jpg'
                            ? 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80'
                            : item.image === '/images/cappuccino.jpg'
                            ? 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80'
                            : item.image === '/images/cold-brew.jpg'
                            ? 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=800&q=80'
                            : item.image || 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80'
                        }
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute left-3 top-3">
                        <Badge variant="accent" size="sm">
                          {item.tags?.includes('signature') || item.tags?.includes('Signature') ? 'Signature' : 'Popular'}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-serif text-lg font-semibold text-text group-hover:text-accent transition-colors">{item.name}</h3>
                        <span className="shrink-0 font-serif text-lg font-bold text-accent">
                          ${(parseFloat(item.price) || item.price || 0).toFixed(2)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-text-muted line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </Section>

      {/* ── Story CTA ────────────────────────────────────────── */}
      <Section variant="glass" padding="lg">
        <div className="relative overflow-hidden rounded-3xl">
          <img
            src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1600&q=80"
            alt="Barista preparing coffee with warm lighting"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-espresso-950/90 to-espresso-950/40" />
          <div className="relative p-8 sm:p-12 lg:p-16">
            <div className="max-w-lg">
              <Badge variant="accent" size="md" className="mb-4">Our Journey</Badge>
              <h2 className="font-serif text-3xl font-bold text-cream-50 sm:text-4xl">
                A Decade of Passion in Every Cup
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-cream-200">
                What started as a tiny corner cart has grown into a beloved
                neighborhood institution — but our commitment to craft has
                never wavered.
              </p>
              <div className="mt-8">
                <Button to="/about" variant="accent" size="lg">
                  Read Our Story
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Visit CTA ───────────────────────────────────────── */}
      <Section variant="accent" padding="lg">
        <Container size="xl" className="text-center">
          <h2 className="font-serif text-3xl font-bold text-cream-50 sm:text-4xl">
            Come Sit a While
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-cream-200">
            Find your nearest BrewNest and discover your new favorite corner.
          </p>
          <div className="mt-8">
            <Button to="/locations" variant="cta" size="lg" className="bg-caramel-400 text-espresso-950 hover:bg-caramel-300">
              Find a Location
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
