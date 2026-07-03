import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  CreditCard,
  MapPin,
  User,
  Lock,
  Loader2,
  Store,
  Receipt,
  RotateCcw,
  Home,
  Coffee,
  Clock,
} from 'lucide-react';
import Section from '../components/ui/Section';
import Button from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import CheckoutStepper from '../components/checkout/CheckoutStepper';
import CheckoutSummary from '../components/checkout/CheckoutSummary';
import PaymentMethodSelector, { type PaymentMethod } from '../components/checkout/PaymentMethodSelector';
import PickupLocationSelector, { type PickupLocation } from '../components/checkout/PickupLocationSelector';
import EmptyState from '../components/cart/EmptyState';
import { useCart } from '../contexts/CartContext';
import { ordersApi } from '../lib/api';
import supabase from '../lib/supabase';
import { cn } from '../lib/utils';

/* ── Step definitions ───────────────────────────────────────── */
const STEPS = [
  { id: 'details', label: 'Details', icon: User },
  { id: 'delivery', label: 'Delivery', icon: MapPin },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'review', label: 'Review', icon: Receipt },
] as const;

type StepId = (typeof STEPS)[number]['id'];
type Phase = 'form' | 'processing' | 'success' | 'failure';

/* ── Pickup locations ───────────────────────────────────────── */
const PICKUP_LOCATIONS: PickupLocation[] = [
  {
    id: 'maple',
    name: 'Maple Street (Flagship)',
    address: '128 Maple Street',
    city: 'Portland, OR 97201',
    distance: '0.4 mi',
    hours: 'Mon–Fri 7am–7pm · Sat–Sun 8am–8pm',
  },
  {
    id: 'riverside',
    name: 'Riverside District',
    address: '42 Riverwalk Lane',
    city: 'Portland, OR 97204',
    distance: '1.2 mi',
    hours: 'Mon–Fri 6:30am–7pm · Sat–Sun 7am–6pm',
  },
  {
    id: 'eastside',
    name: 'Eastside Roastery',
    address: '301 Industrial Way',
    city: 'Portland, OR 97214',
    distance: '2.8 mi',
    hours: 'Mon–Fri 7am–6pm · Sat 8am–5pm · Sun Closed',
  },
];

/* ── Main component ─────────────────────────────────────────── */
export default function Checkout() {
  const { items, total, clearCart, deliveryType, setDeliveryType, subtotal, discount, taxAmount, deliveryFee, itemCount } = useCart();

  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('form');
  const [orderId, setOrderId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [pickupLocation, setPickupLocation] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    apt: '',
    city: '',
    zip: '',
    notes: '',
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
  });

  // Empty cart guard
  if (items.length === 0 && phase !== 'success') {
    return (
      <Section padding="lg" className="pt-32">
        <EmptyState
          icon={<ShoppingBag className="h-12 w-12 text-text-muted" />}
          title="Nothing to check out"
          message="Your cart is empty. Add some items from the menu first."
          ctaLabel="Browse the Menu"
          ctaTo="/menu"
        />
      </Section>
    );
  }

  /* ── Validation ──────────────────────────────────────────── */
  const validateStep = (step: StepId): boolean => {
    const e: Record<string, string> = {};

    if (step === 'details') {
      if (!form.name.trim()) e.name = 'Full name is required';
      if (!form.email.trim()) e.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        e.email = 'Enter a valid email address';
      if (!form.phone.trim()) e.phone = 'Phone number is required';
    }

    if (step === 'delivery') {
      if (deliveryType === 'delivery') {
        if (!form.address.trim()) e.address = 'Street address is required';
        if (!form.city.trim()) e.city = 'City is required';
        if (!form.zip.trim()) e.zip = 'ZIP code is required';
      } else {
        if (!pickupLocation) e.pickupLocation = 'Please select a pickup location';
      }
    }

    if (step === 'payment' && paymentMethod === 'card') {
      if (!form.cardName.trim()) e.cardName = 'Name on card is required';
      if (!form.cardNumber.trim()) e.cardNumber = 'Card number is required';
      else if (form.cardNumber.replace(/\s/g, '').length < 15)
        e.cardNumber = 'Enter a valid card number';
      if (!form.expiry.trim()) e.expiry = 'Expiry date is required';
      if (!form.cvc.trim()) e.cvc = 'CVC is required';
      else if (form.cvc.length < 3) e.cvc = 'Enter a valid CVC';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── Navigation ──────────────────────────────────────────── */
  const handleNext = () => {
    const currentStep = STEPS[stepIndex].id;
    if (!validateStep(currentStep)) return;

    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handlePlaceOrder();
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /* ── Place order ─────────────────────────────────────────── */
  const handlePlaceOrder = async () => {
    setPhase('processing');

    // Simulate payment processing delay
    await new Promise((r) => setTimeout(r, 1800));

    const cardDigits = form.cardNumber.replace(/\s/g, '');
    const isDeclineCard = cardDigits.startsWith('4000') && cardDigits.endsWith('0002');

    if (isDeclineCard) {
      setErrors({ submit: 'Your card was declined. Please try another card.' });
      setPhase('failure');
      return;
    }

    // ── Create real order via API / Supabase Client ──────────
    try {
      const selectedLocation = PICKUP_LOCATIONS.find((l) => l.id === pickupLocation);
      const orderNumber = 'BN-' + Date.now().toString(36).toUpperCase().slice(-8);

      const { data: { user } } = await supabase.auth.getUser();

      const orderPayload = {
        user_id: user?.id || null,
        order_number: orderNumber,
        delivery_type: deliveryType,
        delivery_address: deliveryType === 'delivery'
          ? `${form.address}${form.apt ? `, Apt ${form.apt}` : ''}, ${form.city}, ${form.zip}`
          : null,
        pickup_location: deliveryType === 'pickup' && selectedLocation
          ? selectedLocation.name
          : null,
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone,
        notes: form.notes || null,
        payment_method: paymentMethod,
        card_last4: paymentMethod === 'card' ? cardDigits.slice(-4) : null,
        subtotal,
        discount,
        tax_amount: taxAmount,
        delivery_fee: deliveryFee,
        total,
        coupon_code: null,
        status: 'confirmed',
      };

      let finalOrderId = '';
      let finalOrderNumber = '';

      if (user) {
        const { data: { session } } = await supabase.auth.getSession();
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        const res = await fetch('/api/orders', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            ...orderPayload,
            items: items.map((item) => ({
              id: item.id,
              name: item.name,
              price: item.price,
              image: item.image,
              quantity: item.quantity,
            })),
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.error || 'Failed to create order via API');
        }

        const orderData = await res.json();
        finalOrderId = orderData.id;
        finalOrderNumber = orderData.order_number || orderData.id;
      } else {
        // Guest user: direct insert to Supabase client
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert(orderPayload)
          .select()
          .single();

        if (orderError) throw new Error(orderError.message);
        if (!order) throw new Error('Failed to create order record.');

        finalOrderId = order.id;
        finalOrderNumber = order.order_number;

        const orderItemsPayload = items.map((item) => ({
          order_id: finalOrderId,
          product_id: item.id,
          product_name: item.name,
          product_image: item.image || null,
          price: item.price,
          quantity: item.quantity,
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItemsPayload);

        if (itemsError) throw new Error(itemsError.message);
      }

      setOrderId(finalOrderNumber);
      setPhase('success');
      clearCart();
    } catch (err: any) {
      console.error('[Checkout] Order placement failed:', err);
      setErrors({ submit: err.message || 'A network error occurred. Please try again.' });
      setPhase('failure');
    }
  };

  /* ── Formatting helpers ──────────────────────────────────── */
  const formatCardNumber = (v: string) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [key]: e.target.value });
    if (errors[key]) setErrors({ ...errors, [key]: '' });
  };

  /* ── Processing phase ────────────────────────────────────── */
  if (phase === 'processing') {
    return (
      <Section padding="lg" className="pt-32">
        <div className="mx-auto flex max-w-md flex-col items-center justify-center py-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="absolute inset-0 animate-ping rounded-full bg-accent/20" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
              <Loader2 className="h-10 w-10 animate-spin text-accent" />
            </div>
          </motion.div>
          <h2 className="mt-8 font-serif text-2xl font-bold text-text sm:text-3xl">
            Processing Payment…
          </h2>
          <p className="mt-3 text-text-muted">
            Securely processing your order. Please don't close this page.
          </p>
          <div className="mt-6 flex items-center gap-2 text-xs text-text-muted">
            <Lock className="h-3.5 w-3.5" />
            256-bit SSL encrypted
          </div>
        </div>
      </Section>
    );
  }

  /* ── Success phase ───────────────────────────────────────── */
  if (phase === 'success') {
    const selectedLocation = PICKUP_LOCATIONS.find((l) => l.id === pickupLocation);
    return (
      <Section padding="lg" className="pt-32">
        <div className="mx-auto max-w-2xl">
          {/* Success hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-sage-100 text-sage-600 dark:bg-sage-800/40 dark:text-sage-300"
            >
              <CheckCircle2 className="h-12 w-12" />
            </motion.div>
            <h1 className="mt-6 font-serif text-3xl font-bold text-text sm:text-4xl">
              Order Confirmed!
            </h1>
            <p className="mt-3 max-w-md text-lg text-text-muted">
              Thank you, {form.name || 'friend'}! Your order has been received
              and is being prepared.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5">
              <span className="text-sm text-text-muted">Order ID:</span>
              <span className="font-serif text-base font-bold text-accent">{orderId}</span>
            </div>
          </motion.div>

          {/* Confirmation details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-10 rounded-2xl border border-border bg-surface p-6 shadow-soft sm:p-8"
          >
            <h2 className="mb-5 font-serif text-xl font-bold text-text">
              Order Details
            </h2>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Fulfillment */}
              <div>
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-text-muted">
                  {deliveryType === 'pickup' ? <Store className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                  {deliveryType === 'pickup' ? 'Pickup' : 'Delivery'}
                </h3>
                {deliveryType === 'pickup' && selectedLocation ? (
                  <div className="text-sm text-text">
                    <p className="font-medium">{selectedLocation.name}</p>
                    <p className="text-text-muted">{selectedLocation.address}</p>
                    <p className="text-text-muted">{selectedLocation.city}</p>
                    <p className="mt-1 flex items-center gap-1 text-text-muted">
                      <Clock className="h-3 w-3" />
                      Ready in ~15 minutes
                    </p>
                  </div>
                ) : (
                  <div className="text-sm text-text">
                    <p className="font-medium">{form.address}</p>
                    {form.apt && <p className="text-text-muted">Apt {form.apt}</p>}
                    <p className="text-text-muted">{form.city}, {form.zip}</p>
                    <p className="mt-1 flex items-center gap-1 text-text-muted">
                      <Clock className="h-3 w-3" />
                      Arriving in 30–45 min
                    </p>
                  </div>
                )}
              </div>

              {/* Contact */}
              <div>
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-text-muted">
                  <User className="h-3.5 w-3.5" />
                  Contact
                </h3>
                <div className="text-sm text-text">
                  <p className="font-medium">{form.name}</p>
                  <p className="text-text-muted">{form.email}</p>
                  <p className="text-text-muted">{form.phone}</p>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="mt-6 border-t border-border pt-5">
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-text-muted">
                <CreditCard className="h-3.5 w-3.5" />
                Payment
              </h3>
              <p className="text-sm text-text">
                {paymentMethod === 'card' && `Card ending in ${form.cardNumber.replace(/\s/g, '').slice(-4)}`}
                {paymentMethod === 'apple-pay' && 'Apple Pay'}
                {paymentMethod === 'google-pay' && 'Google Pay'}
                {paymentMethod === 'cash' && 'Cash on pickup'}
                {' · '}
                <span className="font-serif text-lg font-bold text-accent">${total.toFixed(2)}</span>
              </p>
            </div>

            {form.notes && (
              <div className="mt-5 border-t border-border pt-5">
                <h3 className="mb-1 text-xs font-medium uppercase tracking-wider text-text-muted">Notes</h3>
                <p className="text-sm text-text-muted">{form.notes}</p>
              </div>
            )}
          </motion.div>

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button to="/" variant="primary" size="lg" leftIcon={<Home className="h-5 w-5" />}>
              Back to Home
            </Button>
            <Button to="/menu" variant="outline" size="lg" leftIcon={<Coffee className="h-5 w-5" />}>
              Order Again
            </Button>
          </div>
        </div>
      </Section>
    );
  }

  /* ── Failure phase ───────────────────────────────────────── */
  if (phase === 'failure') {
    return (
      <Section padding="lg" className="pt-32">
        <div className="mx-auto max-w-md text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400"
          >
            <XCircle className="h-12 w-12" />
          </motion.div>
          <h1 className="mt-6 font-serif text-3xl font-bold text-text sm:text-4xl">
            Order Failed
          </h1>
          <p className="mt-3 text-sm text-red-500 font-medium bg-red-50 dark:bg-red-950/25 px-4 py-3 rounded-xl border border-red-200/40">
            {errors.submit || 'Your order could not be completed. Please check your connection and try again.'}
          </p>
          <div className="mt-6 rounded-xl border border-border bg-surface p-4 text-left">
            <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
              What you can try
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-text-muted">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-text-muted" />
                Check your card details and try again
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-text-muted" />
                Use a different payment method
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-text-muted" />
                Contact your bank if the issue persists
              </li>
            </ul>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                setPhase('form');
                setStepIndex(2); // Go back to payment step
              }}
              leftIcon={<RotateCcw className="h-5 w-5" />}
            >
              Try Again
            </Button>
            <Button to="/cart" variant="outline" size="lg">
              Back to Cart
            </Button>
          </div>
        </div>
      </Section>
    );
  }

  /* ── Form phase ──────────────────────────────────────────── */
  const currentStepId = STEPS[stepIndex].id;

  return (
    <>
      {/* ── Header + Stepper ─────────────────────────────────── */}
      <Section padding="none" className="pt-28 pb-6">
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </Link>
          <h1 className="font-serif text-2xl font-bold text-text sm:text-3xl">
            Checkout
          </h1>
          <div className="w-24" />
        </div>

        {/* Stepper */}
        <div className="rounded-2xl border border-border bg-surface px-4 py-5 shadow-soft sm:px-6">
          <CheckoutStepper steps={STEPS} currentStep={stepIndex} />
        </div>
      </Section>

      {/* ── Step content + summary ───────────────────────────── */}
      <Section padding="none" className="pb-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left: form area */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* ── Step 1: Customer Details ─────────────────── */}
              {currentStepId === 'details' && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <FormSection icon={User} title="Customer Details" subtitle="How can we reach you?">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Input
                        label="Full Name"
                        name="name"
                        placeholder="Jane Doe"
                        value={form.name}
                        onChange={update('name')}
                        error={errors.name}
                      />
                      <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        placeholder="jane@example.com"
                        value={form.email}
                        onChange={update('email')}
                        error={errors.email}
                      />
                      <Input
                        label="Phone Number"
                        name="phone"
                        type="tel"
                        placeholder="(503) 555-0142"
                        value={form.phone}
                        onChange={update('phone')}
                        error={errors.phone}
                      />
                    </div>
                  </FormSection>

                  <StepNav
                    onNext={handleNext}
                    nextLabel="Continue"
                    showBack={false}
                  />
                </motion.div>
              )}

              {/* ── Step 2: Delivery / Pickup ─────────────────── */}
              {currentStepId === 'delivery' && (
                <motion.div
                  key="delivery"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <FormSection
                    icon={deliveryType === 'pickup' ? Store : MapPin}
                    title="Delivery Method"
                    subtitle="Choose how you'd like to receive your order"
                  >
                    {/* Delivery type toggle */}
                    <div className="grid grid-cols-2 gap-3">
                      <ToggleCard
                        active={deliveryType === 'pickup'}
                        onClick={() => setDeliveryType('pickup')}
                        icon={Store}
                        label="Pickup"
                        sublabel="Ready in 15 min · Free"
                      />
                      <ToggleCard
                        active={deliveryType === 'delivery'}
                        onClick={() => setDeliveryType('delivery')}
                        icon={MapPin}
                        label="Delivery"
                        sublabel="30–45 min · $3.50"
                      />
                    </div>

                    {/* Pickup location selector */}
                    {deliveryType === 'pickup' ? (
                      <div className="mt-5">
                        <h4 className="mb-3 text-sm font-medium text-text">
                          Select a pickup location
                        </h4>
                        <PickupLocationSelector
                          locations={PICKUP_LOCATIONS}
                          selected={pickupLocation}
                          onChange={(id) => {
                            setPickupLocation(id);
                            if (errors.pickupLocation) setErrors({ ...errors, pickupLocation: '' });
                          }}
                        />
                        {errors.pickupLocation && (
                          <p className="mt-2 text-xs text-red-500">{errors.pickupLocation}</p>
                        )}
                      </div>
                    ) : (
                      /* Delivery address form */
                      <div className="mt-5 space-y-4">
                        <Input
                          label="Street Address"
                          name="address"
                          placeholder="128 Maple Street"
                          value={form.address}
                          onChange={update('address')}
                          error={errors.address}
                        />
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                          <Input
                            label="Apt / Suite"
                            name="apt"
                            placeholder="2B"
                            value={form.apt}
                            onChange={update('apt')}
                            containerClassName="sm:col-span-1"
                          />
                          <Input
                            label="City"
                            name="city"
                            placeholder="Portland"
                            value={form.city}
                            onChange={update('city')}
                            error={errors.city}
                            containerClassName="sm:col-span-1"
                          />
                          <Input
                            label="ZIP Code"
                            name="zip"
                            placeholder="97201"
                            value={form.zip}
                            onChange={update('zip')}
                            error={errors.zip}
                            containerClassName="sm:col-span-1"
                          />
                        </div>
                      </div>
                    )}
                  </FormSection>

                  <StepNav
                    onBack={handleBack}
                    onNext={handleNext}
                    nextLabel="Continue to Payment"
                  />
                </motion.div>
              )}

              {/* ── Step 3: Payment ───────────────────────────── */}
              {currentStepId === 'payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <FormSection
                    icon={CreditCard}
                    title="Payment Method"
                    subtitle="Select your preferred way to pay"
                  >
                    <PaymentMethodSelector
                      selected={paymentMethod}
                      onChange={setPaymentMethod}
                    />

                    {/* Card details (only if card selected) */}
                    {paymentMethod === 'card' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-5 space-y-4"
                      >
                        <Input
                          label="Name on Card"
                          name="cardName"
                          placeholder="Jane Doe"
                          value={form.cardName}
                          onChange={update('cardName')}
                          error={errors.cardName}
                        />
                        <Input
                          label="Card Number"
                          name="cardNumber"
                          placeholder="4242 4242 4242 4242"
                          value={form.cardNumber}
                          onChange={(e) => setForm({ ...form, cardNumber: formatCardNumber(e.target.value) })}
                          error={errors.cardNumber}
                          leftIcon={<CreditCard className="h-4 w-4" />}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            label="Expiry (MM/YY)"
                            name="expiry"
                            placeholder="12/27"
                            value={form.expiry}
                            onChange={(e) => setForm({ ...form, expiry: formatExpiry(e.target.value) })}
                            error={errors.expiry}
                          />
                          <Input
                            label="CVC"
                            name="cvc"
                            placeholder="123"
                            value={form.cvc}
                            onChange={(e) => setForm({ ...form, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                            error={errors.cvc}
                          />
                        </div>
                        <div className="flex items-center gap-2 rounded-lg bg-surface-hover px-4 py-2.5 text-xs text-text-muted">
                          <Lock className="h-3.5 w-3.5 shrink-0 text-sage-500" />
                          Test mode: use 4242 4242 4242 4242 for success, or 4000 0000 0000 0002 to simulate decline.
                        </div>
                      </motion.div>
                    )}

                    {/* Alt payment methods */}
                    {paymentMethod !== 'card' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-5 rounded-xl border border-border bg-surface-hover/50 p-5 text-center"
                      >
                        <p className="text-sm text-text-muted">
                          {paymentMethod === 'apple-pay' && 'You\'ll be prompted to confirm payment with Touch ID or Face ID.'}
                          {paymentMethod === 'google-pay' && 'You\'ll be redirected to Google Pay to complete your purchase.'}
                          {paymentMethod === 'cash' && 'Pay at the counter when you pick up your order.'}
                        </p>
                      </motion.div>
                    )}
                  </FormSection>

                  <StepNav
                    onBack={handleBack}
                    onNext={handleNext}
                    nextLabel="Review Order"
                  />
                </motion.div>
              )}

              {/* ── Step 4: Review ────────────────────────────── */}
              {currentStepId === 'review' && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Customer review */}
                  <ReviewCard icon={User} title="Customer" onEdit={() => setStepIndex(0)}>
                    <p className="text-sm text-text">{form.name}</p>
                    <p className="text-sm text-text-muted">{form.email} · {form.phone}</p>
                  </ReviewCard>

                  {/* Delivery review */}
                  <ReviewCard
                    icon={deliveryType === 'pickup' ? Store : MapPin}
                    title={deliveryType === 'pickup' ? 'Pickup' : 'Delivery'}
                    onEdit={() => setStepIndex(1)}
                  >
                    {deliveryType === 'pickup' ? (
                      <>
                        <p className="text-sm text-text">
                          {PICKUP_LOCATIONS.find((l) => l.id === pickupLocation)?.name}
                        </p>
                        <p className="text-sm text-text-muted">
                          {PICKUP_LOCATIONS.find((l) => l.id === pickupLocation)?.address} · Ready in ~15 min
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-text">{form.address}{form.apt && `, Apt ${form.apt}`}</p>
                        <p className="text-sm text-text-muted">{form.city}, {form.zip} · 30–45 min</p>
                      </>
                    )}
                  </ReviewCard>

                  {/* Payment review */}
                  <ReviewCard icon={CreditCard} title="Payment" onEdit={() => setStepIndex(2)}>
                    <p className="text-sm text-text">
                      {paymentMethod === 'card' && `Card ending in ${form.cardNumber.replace(/\s/g, '').slice(-4)}`}
                      {paymentMethod === 'apple-pay' && 'Apple Pay'}
                      {paymentMethod === 'google-pay' && 'Google Pay'}
                      {paymentMethod === 'cash' && 'Cash on Pickup'}
                    </p>
                    <p className="text-sm font-semibold text-accent">${total.toFixed(2)}</p>
                  </ReviewCard>

                  {/* Notes */}
                  <FormSection icon={Receipt} title="Order Notes (Optional)">
                    <Textarea
                      name="notes"
                      placeholder="Any special instructions? E.g., extra hot, no whipped cream, leave at door…"
                      value={form.notes}
                      onChange={update('notes')}
                      className="min-h-[80px]"
                    />
                  </FormSection>

                  {/* Place order */}
                  <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="font-serif text-lg font-bold text-text">Total</span>
                      <span className="font-serif text-2xl font-bold text-accent">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={handlePlaceOrder}
                      leftIcon={<Lock className="h-5 w-5" />}
                    >
                      Place Order · ${total.toFixed(2)}
                    </Button>
                    <p className="mt-3 text-center text-xs text-text-muted">
                      By placing this order, you agree to BrewNest's Terms of Service and Privacy Policy.
                    </p>
                  </div>

                  <StepNav onBack={handleBack} showNext={false} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: sticky summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <CheckoutSummary showDeliveryOptions={false} />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

/* ── Helper components ─────────────────────────────────────── */

function FormSection({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: typeof User;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-caramel-100 text-caramel-700 dark:bg-caramel-900/30 dark:text-caramel-300">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-serif text-lg font-bold text-text">{title}</h3>
          {subtitle && <p className="text-sm text-text-muted">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function ToggleCard({
  active,
  onClick,
  icon: Icon,
  label,
  sublabel,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Store;
  label: string;
  sublabel: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all duration-200',
        active
          ? 'border-accent bg-caramel-50 ring-1 ring-accent/30 dark:bg-caramel-900/20'
          : 'border-border bg-surface hover:border-accent/40 hover:bg-surface-hover',
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full transition-colors',
          active ? 'bg-accent text-white' : 'bg-surface-hover text-text-muted',
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-text">{label}</p>
        <p className="text-xs text-text-muted">{sublabel}</p>
      </div>
    </button>
  );
}

function StepNav({
  onBack,
  onNext,
  nextLabel = 'Continue',
  showBack = true,
  showNext = true,
}: {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  showBack?: boolean;
  showNext?: boolean;
}) {
  return (
    <div className="flex gap-3">
      {showBack && (
        <Button variant="outline" size="lg" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
          Back
        </Button>
      )}
      {showNext && (
        <Button variant="primary" size="lg" fullWidth={!showBack} onClick={onNext}>
          {nextLabel}
          <ArrowRight className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}

function ReviewCard({
  icon: Icon,
  title,
  onEdit,
  children,
}: {
  icon: typeof User;
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-border bg-surface p-5 shadow-soft">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-caramel-100 text-caramel-700 dark:bg-caramel-900/30 dark:text-caramel-300">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <h4 className="font-serif text-base font-bold text-text">{title}</h4>
          <button
            onClick={onEdit}
            className="text-xs font-medium text-accent hover:underline"
          >
            Edit
          </button>
        </div>
        <div className="mt-1">{children}</div>
      </div>
    </div>
  );
}
