'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';

const NAV_LINKS = [
  { label: '기능',     id: 'section-features' },
  { label: '작동 방식', id: 'section-how'      },
  { label: '스펙',     id: 'section-specs'    },
  { label: '기대 효과', id: 'section-benefits' },
  { label: '팀 소개',  id: 'team'             },
] as const;

export default function NavBar() {
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = useCallback((id: string) => {
    setMobileOpen(false);
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, mobileOpen ? 250 : 0);
  }, [mobileOpen]);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-all duration-500"
      style={{
        backgroundColor:     scrolled ? 'rgba(11,15,20,0.82)' : 'transparent',
        backdropFilter:      scrolled ? 'blur(20px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        borderBottom:        scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
      }}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo — smooth scroll to top */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="cursor-pointer"
          aria-label="맨 위로 이동"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="바쁜벌꿀 팀 로고" className="h-8 w-auto" />
        </button>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="group relative px-4 py-2 text-sm text-slate-400 transition-colors duration-200 hover:text-white"
            >
              {label}
              <span className="absolute bottom-1.5 left-4 right-4 h-px origin-left scale-x-0 rounded-full bg-blue-400 transition-transform duration-300 ease-out group-hover:scale-x-100" />
            </button>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-4 md:flex">
          <Link href="/auth/login" className="text-sm text-slate-400 transition-colors hover:text-white">
            로그인
          </Link>
          <Link
            href="/auth/signup"
            className="group relative overflow-hidden rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-px hover:bg-blue-500 hover:shadow-blue-500/30"
          >
            <motion.span
              className="pointer-events-none absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ translateX: ['-120%', '220%'] }}
              transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 4.5, ease: 'easeInOut' }}
            />
            <span className="relative flex items-center gap-1.5">
              데모 보기
              <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}>→</motion.span>
            </span>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex flex-col gap-1.5 p-2 md:hidden"
          onClick={() => setMobileOpen((p) => !p)}
          aria-label="메뉴"
        >
          <span className={`block h-px w-5 bg-white transition-all duration-300 ${mobileOpen ? 'translate-y-[10px] rotate-45' : ''}`} />
          <span className={`block h-px w-5 bg-white transition-opacity duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
          <span className={`block h-px w-5 bg-white transition-all duration-300 ${mobileOpen ? '-translate-y-[6px] -rotate-45' : ''}`} />
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-white/[0.06] bg-[#0B0F14]/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col px-6 py-4">
              {NAV_LINKS.map(({ label, id }) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className="border-b border-white/[0.05] py-3.5 text-left text-sm text-slate-300 transition-colors hover:text-white last:border-0"
                >
                  {label}
                </button>
              ))}
              <div className="mt-4 flex flex-col gap-3">
                <Link href="/auth/login" className="py-2.5 text-center text-sm text-slate-400 hover:text-white">로그인</Link>
                <Link href="/auth/signup" className="rounded-xl bg-blue-600 py-2.5 text-center text-sm font-semibold text-white">
                  데모 보기 →
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
