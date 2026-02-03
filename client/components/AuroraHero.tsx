"use client";

import { Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { useEffect, Suspense } from "react";
import { FiArrowRight, FiShoppingBag, FiStar, FiZap } from "react-icons/fi";
import {
  useMotionTemplate,
  useMotionValue,
  motion,
  animate,
} from "framer-motion";
import Link from "next/link";

// Premium violet/purple gradient theme matching the SwagStore brand
const COLORS_TOP = ["#8b5cf6", "#7c3aed", "#a78bfa", "#6d28d9"];

// Floating particles component
const FloatingParticle = ({ delay, duration, size, left, top }: {
  delay: number;
  duration: number;
  size: number;
  left: string;
  top: string;
}) => (
  <motion.div
    className="absolute rounded-full bg-violet-400/20 blur-sm"
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

export const AuroraHero = () => {
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

  return (
    <motion.section
      style={{
        backgroundImage,
      }}
      className="relative grid min-h-screen place-content-center overflow-hidden bg-zinc-950 px-4 py-24 text-gray-200"
    >
      {/* Floating particles */}
      <FloatingParticle delay={0} duration={4} size={8} left="10%" top="20%" />
      <FloatingParticle delay={0.5} duration={5} size={6} left="80%" top="15%" />
      <FloatingParticle delay={1} duration={4.5} size={10} left="70%" top="70%" />
      <FloatingParticle delay={1.5} duration={3.5} size={7} left="15%" top="80%" />
      <FloatingParticle delay={2} duration={5} size={9} left="50%" top="10%" />

      <div className="relative z-10 flex flex-col items-center max-w-5xl mx-auto">
        {/* Badge */}
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full bg-violet-500/10 border border-violet-500/20 px-4 py-2 text-sm backdrop-blur-sm"
        >
          <FiZap className="text-violet-400" />
          <span className="text-violet-300">Premium Corporate Merchandise</span>
        </motion.span>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl bg-gradient-to-br from-white via-gray-200 to-gray-400 bg-clip-text text-center text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-medium leading-tight text-transparent"
        >
          Swag that{' '}
          <span className="font-cursive italic bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text">
            Elevates
          </span>
          <br />
          Your Brand
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="my-8 max-w-2xl text-center text-lg md:text-xl leading-relaxed text-gray-400"
        >
          Premium quality merchandise that your team will actually want to wear. 
          Transform your brand identity with products crafted for excellence.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <motion.div
            style={{
              border,
              boxShadow,
            }}
            whileHover={{
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.98,
            }}
            className="rounded-full"
          >
            <Link
              href="#shop"
              className="group relative flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-8 py-4 text-white font-medium transition-all hover:shadow-lg hover:shadow-violet-500/25"
            >
              <FiShoppingBag className="w-5 h-5" />
              Explore Collection
              <FiArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          <Link
            href="/login"
            className="group flex items-center gap-2 px-6 py-3 text-gray-400 hover:text-white transition-colors"
          >
            Sign In
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
            icon={<FiShoppingBag className="w-5 h-5 text-violet-400" />}
            value="500+"
            label="Products"
            delay={0.8}
          />
          <StatItem
            icon={<FiStar className="w-5 h-5 text-violet-400" />}
            value="4.9"
            label="Rating"
            delay={0.9}
          />
          <StatItem
            icon={<FiZap className="w-5 h-5 text-violet-400" />}
            value="24hr"
            label="Delivery"
            delay={1.0}
          />
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ 
            opacity: { delay: 1.2 },
            y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500"
        >
          <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
          <div className="w-px h-8 bg-gradient-to-b from-violet-500/50 to-transparent" />
        </motion.div>
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
  );
};

export default AuroraHero;
