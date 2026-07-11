'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useState } from 'react';

const TEAM = [
  { name: '홍수림', role: 'AI 비전 · 꽃 인식 딥러닝',              initials: '홍', color: '#22C55E' },
  { name: '정보윤', role: '3D 기기 제작 · 드론 주행 제어',         initials: '정', color: '#3B82F6' },
  { name: '강형우', role: '3D 기기 제작 · 드론 주행 제어',         initials: '강', color: '#3B82F6' },
  { name: '최현규', role: '드론 제어 · 군집 드론 알고리즘',        initials: '최', color: '#A78BFA' },
  { name: '김찬우', role: '수분 예약 · 모니터링 웹 개발',           initials: '김', color: '#34D399' },
  { name: '김도형', role: '수분 예약 · 모니터링 웹 개발',           initials: '도', color: '#34D399' },
  { name: '신민혁', role: '드론 부착 기기 설계 · 배경 및 농가 조사', initials: '신', color: '#F59E0B' },
  { name: '백겸',   role: '드론 부착 기기 설계 · 배경 및 농가 조사', initials: '백', color: '#F59E0B' },
] as const;

const TeamCard = memo(function TeamCard({ name, role, initials, color }: typeof TEAM[number]) {
  const [hov, setHov] = useState(false);

  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-3 text-center transition-all duration-300"
      style={{
        borderColor: hov ? `${color}30` : 'rgba(255,255,255,0.06)',
        background:  hov ? `${color}08` : 'rgba(255,255,255,0.02)',
        cursor: 'default',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Avatar */}
      <div
        className="mx-auto flex h-11 w-11 items-center justify-center rounded-full text-sm font-black transition-all duration-300"
        style={{
          background: hov ? color : `${color}20`,
          color: hov ? '#0B0F14' : color,
        }}
      >
        {initials}
      </div>

      <p className="mt-2.5 text-xs font-semibold text-white">{name}</p>

      {/* Role — 호버 시 슬라이드 인, break-keep으로 한글 단어 중간 잘림 방지 */}
      <AnimatePresence>
        {hov && (
          <motion.p
            initial={{ opacity: 0, y: 6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 4, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="overflow-hidden text-[9px] leading-snug text-slate-400 break-keep"
          >
            <span className="mt-1.5 block">{role}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});

export default function FooterSection() {
  return (
    <footer
      className="border-t px-6 pt-16 pb-10"
      style={{ borderColor: 'rgba(255,255,255,0.06)' }}
    >
      <div className="mx-auto max-w-7xl">
        {/* Team */}
        <div id="team" className="mb-16">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-500">Team</p>
          <p className="mb-6 text-sm font-bold text-white">
            바쁜벌꿀 — 인하대학교 종합설계 2026
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {TEAM.map((m) => (
              <TeamCard key={m.name} {...m} />
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col items-center justify-between gap-6 border-t pt-8 md:flex-row"
          style={{ borderColor: 'rgba(255,255,255,0.05)' }}
        >
          <Link href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="바쁜벌꿀 팀 로고" className="h-7 w-auto" />
          </Link>

          <p className="text-xs text-slate-600">
            © 2026 Pollen-Drone · Inha University Capstone Design · All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            {[{ label: 'GitHub', href: 'https://github.com' }].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-500 transition-colors hover:text-slate-300"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
