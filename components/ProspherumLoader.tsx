"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function ProspherumLoader() {
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const startTime = Date.now();
    const minimumDisplayTime = 1800;

    const finishLoading = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minimumDisplayTime - elapsed);

      window.setTimeout(() => {
        setVisible(false);

        window.setTimeout(() => {
          setLoading(false);
        }, 500);
      }, remaining);
    };

    if (document.readyState === "complete") {
      finishLoading();
    } else {
      window.addEventListener("load", finishLoading);

      return () => {
        window.removeEventListener("load", finishLoading);
      };
    }
  }, []);

  if (!loading) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#111111] transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Background glow */}
      <div className="absolute h-80 w-80 rounded-full bg-[#1f7a4d]/10 blur-3xl animate-pulse" />

      {/* Main loader */}
      <div className="relative flex flex-col items-center">

        {/* Logo and rings */}
        <div className="relative flex h-44 w-44 items-center justify-center">

          {/* Outer rotating ring */}
          <div
            className="absolute inset-0 rounded-full border border-[#1f7a4d]/20 border-t-[#1f7a4d] border-r-[#1f7a4d]/60"
            style={{
              animation: "prospherumSpin 5s linear infinite",
            }}
          />

          {/* Inner rotating ring */}
          <div
            className="absolute inset-3 rounded-full border border-white/5 border-b-[#1f7a4d]/70"
            style={{
              animation: "prospherumSpinReverse 3s linear infinite",
            }}
          />

          {/* Logo glow */}
          <div
            className="absolute h-32 w-32 rounded-full bg-[#1f7a4d]/20 blur-2xl"
            style={{
              animation: "prospherumPulse 2s ease-in-out infinite",
            }}
          />

          {/* Logo */}
          <div
            className="relative z-10"
            style={{
              animation: "prospherumLogoEnter 1s ease-out forwards",
            }}
          >
            <Image
              src="/branding/prospherum-symbol.png"
              alt="Prospherum Skills Academy"
              width={140}
              height={140}
              priority
              className="h-28 w-28 object-contain"
            />
          </div>
        </div>

        {/* Academy name */}
        <div className="mt-5 overflow-hidden">
          <p
            className="text-center text-xs font-semibold tracking-[0.28em] text-white/70"
            style={{
              animation: "prospherumTextReveal 1s ease-out 0.3s forwards",
              opacity: 0,
            }}
          >
            PROSPHERUM SKILLS ACADEMY
          </p>
        </div>

        {/* Loading bar */}
        <div className="mt-7 h-[2px] w-32 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full w-1/2 rounded-full bg-[#1f7a4d]"
            style={{
              animation: "prospherumLoadingBar 1.4s ease-in-out infinite",
            }}
          />
        </div>

        {/* Loading text */}
        <p className="mt-3 text-[10px] tracking-[0.2em] text-white/30">
          LOADING PORTAL
        </p>
      </div>

      <style jsx>{`
        @keyframes prospherumSpin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes prospherumSpinReverse {
          from {
            transform: rotate(360deg);
          }

          to {
            transform: rotate(0deg);
          }
        }

        @keyframes prospherumPulse {
          0% {
            opacity: 0.35;
            transform: scale(0.9);
          }

          50% {
            opacity: 0.7;
            transform: scale(1.08);
          }

          100% {
            opacity: 0.35;
            transform: scale(0.9);
          }
        }

        @keyframes prospherumLogoEnter {
          0% {
            opacity: 0;
            transform: scale(0.65);
          }

          60% {
            opacity: 1;
            transform: scale(1.08);
          }

          80% {
            transform: scale(0.98);
          }

          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes prospherumTextReveal {
          0% {
            opacity: 0;
            transform: translateY(16px);
          }

          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes prospherumLoadingBar {
          0% {
            transform: translateX(-140%);
          }

          50% {
            transform: translateX(80%);
          }

          100% {
            transform: translateX(280%);
          }
        }
      `}</style>
    </div>
  );
}