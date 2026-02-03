"use client";

import { Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { useEffect, Suspense } from "react";
import { FiArrowRight, FiShoppingBag, FiStar, FiZap, FiAward, FiPackage, FiTruck, FiShield, FiCheck, FiUsers, FiHeart, FiCode, FiGlobe } from "react-icons/fi";
import {
  useMotionTemplate,
  useMotionValue,
  motion,
  animate,
} from "framer-motion";
import Link from "next/link";

// DevRelSquad Theming - Teal/Cyan/Emerald
const COLORS_TOP = ["#06b6d4", "#0891b2", "#10b981", "#0ea5e9"];

// Floating particles component
const FloatingParticle = ({ delay, duration, size, left, top }: {
  delay: number;
  duration: number;
  size: number;
  left: string;
  top: string;
}) => (
  <motion.div
    className="absolute rounded-full bg-cyan-400/20 blur-sm"
    style={{ width: size, height: size, left, top }}
    animate={{
      y: [0, -30, 0],
      opacity: [0.3, 0.6, 0.3],
      scale: [1, 1.2, 1],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

// Statistics component
const StatItem = ({ icon, value, label, delay }: {
  icon: React.ReactNode;
  value: string;
  label: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6 }}
    className="flex flex-col items-center gap-2"
  >
    <div className="p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
      {icon}
    </div>
    <span className="text-2xl md:text-3xl font-bold text-white">{value}</span>
    <span className="text-xs text-gray-400 uppercase tracking-wider">{label}</span>
  </motion.div>
);

// Feature card component
const FeatureCard = ({ icon, title, description, delay }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className="group p-8 rounded-3xl bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 hover:border-cyan-300 dark:hover:border-cyan-600 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-2"
  >
    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-100 to-teal-100 dark:from-cyan-900/30 dark:to-teal-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
      {title}
    </h3>
    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
      {description}
    </p>
  </motion.div>
);

// Testimonial component
const TestimonialCard = ({ quote, author, role, company, delay }: {
  quote: string;
  author: string;
  role: string;
  company: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className="p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-700/50"
  >
    <div className="flex gap-1 mb-4">
      {[...Array(5)].map((_, i) => (
        <FiStar key={i} className="w-4 h-4 text-emerald-500 fill-emerald-500" />
      ))}
    </div>
    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-6 italic">
      "{quote}"
    </p>
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-white font-bold">
        {author.split(' ').map(n => n[0]).join('')}
      </div>
      <div>
        <p className="font-medium text-zinc-900 dark:text-white">{author}</p>
        <p className="text-sm text-zinc-500">{role} at {company}</p>
      </div>
    </div>
  </motion.div>
);

// Pricing tier component
const PricingTier = ({ name, price, description, features, highlighted, delay }: {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className={`relative p-8 rounded-3xl border ${
      highlighted 
        ? 'bg-gradient-to-br from-cyan-600 to-teal-700 border-cyan-500 text-white shadow-2xl shadow-cyan-500/20 scale-105' 
        : 'bg-white dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700'
    }`}
  >
    {highlighted && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full text-xs font-bold text-zinc-900">
        COMMUNITY FAVORITE
      </div>
    )}
    <h3 className={`text-xl font-semibold mb-2 ${highlighted ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>
      {name}
    </h3>
    <p className={`text-sm mb-6 ${highlighted ? 'text-cyan-100' : 'text-zinc-500'}`}>
      {description}
    </p>
    <div className="mb-6">
      <span className={`text-4xl font-bold ${highlighted ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>{price}</span>
      {price !== 'Custom' && <span className={`text-sm ${highlighted ? 'text-cyan-100' : 'text-zinc-500'}`}>/pack</span>}
    </div>
    <ul className="space-y-3 mb-8">
      {features.map((feature, i) => (
        <li key={i} className="flex items-center gap-3">
          <FiCheck className={`w-4 h-4 ${highlighted ? 'text-cyan-200' : 'text-emerald-500'}`} />
          <span className={`text-sm ${highlighted ? 'text-cyan-50' : 'text-zinc-600 dark:text-zinc-400'}`}>{feature}</span>
        </li>
      ))}
    </ul>
    <Link
      href="/shop"
      className={`block w-full py-3 rounded-xl font-medium text-center transition-all ${
        highlighted
          ? 'bg-white text-cyan-700 hover:bg-cyan-50'
          : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90'
      }`}
    >
      Start Building
    </Link>
  </motion.div>
);

export default function LandingPage() {
  const color = useMotionValue(COLORS_TOP[0]);

  useEffect(() => {
    animate(color, COLORS_TOP, {
      ease: "easeInOut",
      duration: 10,
      repeat: Infinity,
      repeatType: "mirror",
    });
  }, [color]);

  const backgroundImage = useMotionTemplate`radial-gradient(125% 125% at 50% 0%, #09090b 50%, ${color})`;
  const border = useMotionTemplate`1px solid ${color}`;
  const boxShadow = useMotionTemplate`0px 4px 24px ${color}`;

  const features = [
    {
      icon: <FiCode className="w-6 h-6" />,
      title: "Developer First",
      description: "Designed by devs, for devs. We understand what the community actually wants to wear."
    },
    {
      icon: <FiGlobe className="w-6 h-6" />,
      title: "Global Shipping",
      description: "Send swag to your remote team members and community contributors anywhere in the world."
    },
    {
      icon: <FiZap className="w-6 h-6" />,
      title: "Hackathon Ready",
      description: "Bulk orders for your next hackathon or meetup delivered with lightning speed."
    },
    {
      icon: <FiHeart className="w-6 h-6" />,
      title: "Community Loved",
      description: "High-quality materials that turn your community members into proud brand advocates."
    }
  ];

  const testimonials = [
    {
      quote: "The hoodie quality is insane. Our contributors actually compete to earn them now!",
      author: "Alex Rivera",
      role: "DevRel Lead",
      company: "CloudScale"
    },
    {
      quote: "Finally, swag that doesn't feel like cheap corporate merch. DRS Swag gets developer culture.",
      author: "Sarah Chen",
      role: "Community Manager",
      company: "OpenSource Hub"
    },
    {
      quote: "We ordered 500 tees for our hackathon. Arrived early, looked perfect. Lifesavers.",
      author: "Mike Ross",
      role: "Event Organizer",
      company: "CodeFest"
    }
  ];

  const pricingTiers = [
    {
      name: "Meetup",
      price: "$199",
      description: "For local user groups",
      features: ["Up to 30 items", "Stickers & Tees", "Standard shipping", "Community support"],
      highlighted: false
    },
    {
      name: "Hackathon",
      price: "$899",
      description: "For major events",
      features: ["Up to 150 items", "Full swag kits", "Priority shipping", "Event coordinator", "Custom branding"],
      highlighted: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For global programs",
      features: ["Unlimited volume", "Global distribution", "Warehousing", "API integration", "Dedicated success manager"],
      highlighted: false
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="text-2xl font-cursive italic text-white hover:text-cyan-300 transition-colors">
              DRS Swag
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#testimonials" className="text-sm text-gray-300 hover:text-white transition-colors">Community</a>
              <a href="#pricing" className="text-sm text-gray-300 hover:text-white transition-colors">Pricing</a>
              <Link href="/login" className="text-sm text-gray-300 hover:text-white transition-colors">Sign In</Link>
              <Link 
                href="/shop" 
                className="px-5 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm text-white hover:bg-white/20 transition-all"
              >
                Browse Shop
              </Link>
            </div>
            <Link href="/shop" className="md:hidden px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white">
              Shop
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section
        style={{ backgroundImage }}
        className="relative grid min-h-screen place-content-center overflow-hidden bg-zinc-950 px-4 py-24 text-gray-200"
      >
        {/* Floating particles */}
        <FloatingParticle delay={0} duration={4} size={8} left="10%" top="20%" />
        <FloatingParticle delay={0.5} duration={5} size={6} left="80%" top="15%" />
        <FloatingParticle delay={1} duration={4.5} size={10} left="70%" top="70%" />
        <FloatingParticle delay={1.5} duration={3.5} size={7} left="15%" top="80%" />
        <FloatingParticle delay={2} duration={5} size={9} left="50%" top="10%" />
        <FloatingParticle delay={2.5} duration={4} size={8} left="30%" top="60%" />
        <FloatingParticle delay={3} duration={5.5} size={6} left="85%" top="50%" />

        <div className="relative z-10 flex flex-col items-center max-w-5xl mx-auto">
          {/* Badge */}
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 text-sm backdrop-blur-sm"
          >
            <FiZap className="text-cyan-400" />
            <span className="text-cyan-300">Powered by DevRelSquad</span>
          </motion.span>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl bg-gradient-to-br from-white via-gray-200 to-gray-400 bg-clip-text text-center text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-medium leading-tight text-transparent"
          >
            Swag that{' '}
            <span className="font-cursive italic bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text">
              Builds
            </span>
            <br />
            Community
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="my-8 max-w-2xl text-center text-lg md:text-xl leading-relaxed text-gray-400"
          >
            Premium gear for your meetups, hackathons, and dev heroes.
            Turn your community members into lifelong advocates.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 items-center"
          >
            <motion.div
              style={{ border, boxShadow }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-full"
            >
              <Link
                href="/shop"
                className="group relative flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-600 to-teal-600 px-8 py-4 text-white font-medium transition-all hover:shadow-lg hover:shadow-cyan-500/25"
              >
                <FiShoppingBag className="w-5 h-5" />
                Explore Gear
                <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>

            <Link
              href="/login"
              className="group flex items-center gap-2 px-6 py-3 text-gray-400 hover:text-white transition-colors"
            >
              Join the Squad
              <FiArrowRight className="transition-transform group-hover:translate-x-1 group-hover:-rotate-45" />
            </Link>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-20 grid grid-cols-3 gap-8 md:gap-16"
          >
            <StatItem
              icon={<FiUsers className="w-5 h-5 text-cyan-400" />}
              value="500+"
              label="Communities"
              delay={0.8}
            />
            <StatItem
              icon={<FiStar className="w-5 h-5 text-cyan-400" />}
              value="4.9"
              label="Dev Rating"
              delay={0.9}
            />
            <StatItem
              icon={<FiPackage className="w-5 h-5 text-cyan-400" />}
              value="50K+"
              label="Items Shipped"
              delay={1.0}
            />
          </motion.div>

          {/* Scroll indicator */}
          <motion.a
            href="#features"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ 
              opacity: { delay: 1.2 },
              y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500 hover:text-cyan-400 transition-colors cursor-pointer"
          >
            <span className="text-xs uppercase tracking-widest"></span>
            <div className="w-px h-8 bg-gradient-to-b from-cyan-500/50 to-transparent" />
          </motion.a>
        </div>

        {/* Stars Background */}
        <div className="absolute inset-0 z-0">
          <Suspense fallback={null}>
            <Canvas>
              <Stars radius={50} count={2000} factor={4} fade speed={2} />
            </Canvas>
          </Suspense>
        </div>

        {/* Gradient overlays for depth */}
        <div className="absolute inset-0 z-[1] pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent" />
        </div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="text-sm uppercase tracking-[0.3em] text-cyan-600 dark:text-cyan-400 font-medium">
              Why DevRelSquad
            </span>
            <h2 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-medium text-zinc-900 dark:text-white">
              Built for{' '}
              <span className="font-cursive italic text-cyan-600 dark:text-cyan-400">
                Developers
              </span>
            </h2>
            <p className="mt-6 text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              We know developer relations. Every product is selected to resonate with technical audiences and stand the test of time.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Stats Banner */}
      <section className="py-16 bg-white dark:bg-zinc-900 border-y border-zinc-100 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <p className="text-4xl font-bold text-zinc-900 dark:text-white">500+</p>
              <p className="text-sm text-zinc-500 mt-1">Tech Communities</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <p className="text-4xl font-bold text-zinc-900 dark:text-white">10K+</p>
              <p className="text-sm text-zinc-500 mt-1">Happy Developers</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <p className="text-4xl font-bold text-zinc-900 dark:text-white">24hr</p>
              <p className="text-sm text-zinc-500 mt-1">Avg. Dispatch</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <p className="text-4xl font-bold text-zinc-900 dark:text-white">99%</p>
              <p className="text-sm text-zinc-500 mt-1">Satisfaction Rate</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-32 bg-white dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="text-sm uppercase tracking-[0.3em] text-cyan-600 dark:text-cyan-400 font-medium">
              Community Voices
            </span>
            <h2 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-medium text-zinc-900 dark:text-white">
              Loved by{' '}
              <span className="font-cursive italic text-cyan-600 dark:text-cyan-400">
                DevRel
              </span>{' '}
              Pros
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={testimonial.author}
                quote={testimonial.quote}
                author={testimonial.author}
                role={testimonial.role}
                company={testimonial.company}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="text-sm uppercase tracking-[0.3em] text-cyan-600 dark:text-cyan-400 font-medium">
              Packages
            </span>
            <h2 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-medium text-zinc-900 dark:text-white">
              Simple,{' '}
              <span className="font-cursive italic text-cyan-600 dark:text-cyan-400">
                Transparent
              </span>{' '}
              Pricing
            </h2>
            <p className="mt-6 text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              No hidden fees. Designed for community budgets of all sizes.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {pricingTiers.map((tier, index) => (
              <PricingTier
                key={tier.name}
                name={tier.name}
                price={tier.price}
                description={tier.description}
                features={tier.features}
                highlighted={tier.highlighted}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-zinc-900 dark:bg-zinc-950 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 via-transparent to-teal-600/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-8"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-white">
              Ready to{' '}
              <span className="font-cursive italic bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Energize
              </span>{' '}
              Your Community?
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Join thousands of communities that trust DevRelSquad for their merchandise. 
              Let's create something amazing together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link
                href="/shop"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-zinc-900 rounded-full font-medium hover:bg-cyan-50 transition-colors shadow-xl shadow-cyan-500/10"
              >
                <FiShoppingBag className="w-5 h-5" />
                Start Shopping
                <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-4 text-gray-300 hover:text-white transition-colors"
              >
                Create Account
                <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 py-16 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <Link href="/" className="text-3xl font-cursive italic text-white hover:text-cyan-400 transition-colors">
                DRS Swag
              </Link>
              <p className="mt-4 text-zinc-400 max-w-sm leading-relaxed">
                Premium developer merchandise that elevates your community and delights your team. Powered by DevRelSquad.
              </p>
              <div className="mt-6 flex items-center gap-4">
                <FiHeart className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-zinc-500">Made with love for developers</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-white mb-4">Quick Links</h4>
              <ul className="space-y-3">
                <li><Link href="/shop" className="text-zinc-400 hover:text-white transition-colors text-sm">Browse Shop</Link></li>
                <li><a href="#features" className="text-zinc-400 hover:text-white transition-colors text-sm">Features</a></li>
                <li><a href="#pricing" className="text-zinc-400 hover:text-white transition-colors text-sm">Pricing</a></li>
                <li><Link href="/login" className="text-zinc-400 hover:text-white transition-colors text-sm">Sign In</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-white mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-zinc-400 hover:text-white transition-colors text-sm">Terms of Service</a></li>
                <li><a href="#" className="text-zinc-400 hover:text-white transition-colors text-sm">Privacy Policy</a></li>
                <li><a href="#" className="text-zinc-400 hover:text-white transition-colors text-sm">Refund Policy</a></li>
                <li><a href="#" className="text-zinc-400 hover:text-white transition-colors text-sm">Contact Us</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-zinc-500">
              © 2026 <span className="font-cursive italic text-zinc-400">DevRelSquad</span>. All rights reserved.
            </p>
            <p className="text-xs text-zinc-600">
              Crafted with precision for the builders of tomorrow.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
