'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const STEPS = [
  {
    num:   '01',
    icon:  '🚁',
    title: '과수원 탐색 및 맵핑',
    desc:  '대형 드론이 고해상도 카메라로 과수원을 정찰. AI가 개화 꽃의 위치를 탐지해 좌표 데이터로 변환합니다.',
    color: '#22C55E',
  },
  {
    num:   '02',
    icon:  '🧠',
    title: 'DBSCAN 스케줄링',
    desc:  '수집된 꽃 좌표를 DBSCAN으로 분석해 소형 드론이 작업할 밀집 구역(Island) 그리드로 자동 분할합니다.',
    color: '#3B82F6',
  },
  {
    num:   '03',
    icon:  '🐝',
    title: '군집 자율 비행 · 정밀 살포',
    desc:  '소형 드론 3~5대가 APF 충돌 회피로 간격을 유지하며 마이크로 펌프로 꽃가루를 정밀 분사합니다.',
    color: '#A78BFA',
  },
  {
    num:   '04',
    icon:  '🖥️',
    title: '웹 대시보드 시각화',
    desc:  '작업 데이터가 Supabase에 실시간 저장. 사용자는 웹으로 드론 위치·배터리·완료 구역을 확인합니다.',
    color: '#34D399',
  },
] as const;

export default function HowItWorks() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="section-how" className="relative px-6 py-24" style={{ background: 'rgba(255,255,255,0.015)' }}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />

      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-400">How It Works</p>
          <h2 className="text-3xl font-black text-white lg:text-4xl">4단계로 완료되는 수분 자동화</h2>
          <p className="mt-3 text-slate-400">농장주가 할 일은 단 하나 — 웹 플랫폼에 접속해 구역을 등록하는 것뿐입니다</p>
        </motion.div>

        <div ref={ref} className="relative">
          {/* 연결선 — z-0으로 아이콘 뒤에 배치 */}
          <div className="absolute left-[calc(12.5%+36px)] right-[calc(12.5%+36px)] top-[3.25rem] z-0 hidden h-px bg-white/[0.05] lg:block" />

          <motion.div
            className="absolute left-[calc(12.5%+36px)] top-[3.25rem] z-0 hidden h-px lg:block"
            style={{
              right: 'calc(12.5% + 36px)',
              background: 'linear-gradient(90deg, #22C55E, #3B82F6, #A78BFA, #34D399)',
            }}
            initial={{ scaleX: 0, transformOrigin: 'left' }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.6, delay: 0.3, ease: 'easeOut' }}
          />

          <div className="grid gap-10 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 32 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.15 + i * 0.18, ease: 'easeOut' }}
                className="flex flex-col items-center text-center"
              >
                {/* 아이콘 원형 컨테이너 — z-10으로 선 위에 배치, 불투명 배경으로 선 차단 */}
                <div
                  className="relative z-10 flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-full text-4xl"
                  style={{
                    background: `radial-gradient(ellipse 80% 80% at 50% 50%, ${step.color}18, #0B0F14)`,
                    border: `1px solid ${step.color}30`,
                  }}
                >
                  <div
                    className="absolute inset-0 rounded-full blur-xl"
                    style={{ background: `${step.color}14` }}
                  />
                  <span className="relative z-10">{step.icon}</span>

                  <span
                    className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black text-slate-950"
                    style={{ background: step.color }}
                  >
                    {i + 1}
                  </span>
                </div>

                <h3 className="mt-5 text-sm font-bold text-white">{step.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-14 text-center"
        >
          <a
            href="/auth/signup"
            className="inline-flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-6 py-3 text-sm font-semibold text-blue-400 transition-colors hover:bg-blue-500/20"
          >
            데모 보기 →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
