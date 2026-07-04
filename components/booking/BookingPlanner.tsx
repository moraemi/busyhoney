'use client';

import { useState, useMemo, useEffect, useRef } from 'react';

/* ── 타입 ─────────────────────────────────────────────────────── */
export type ReservationPayload = {
  startAt: string;
  droneCount: number;
  selectedZoneIds: string[];
  areaGeoJson: object;
  workBlocks: { id: string; row: number; col: number }[];
};

/* ── 날짜 마스킹 (YYYY/MM/DD) ─────────────────────────────────── */
function maskDate(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}/${digits.slice(4)}`;
  return `${digits.slice(0, 4)}/${digits.slice(4, 6)}/${digits.slice(6)}`;
}

function parseMasked(masked: string): string {
  const m = masked.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : '';
}

/* ── 예약 가능 여부 (데모용 pseudo-random) ─────────────────────── */
type DayStatus = 'available' | 'full' | 'past';

function buildAvailability(year: number, month: number): Record<number, DayStatus> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const result: Record<number, DayStatus> = {};
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    if (date < today) {
      result[d] = 'past';
    } else {
      result[d] = (year * 17 + (month + 1) * 7 + d * 13) % 6 === 0 ? 'full' : 'available';
    }
  }
  return result;
}

/* ── 상수 ─────────────────────────────────────────────────────── */
const DAY_LABELS   = ['일', '월', '화', '수', '목', '금', '토'];
const MONTH_LABELS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
const YEAR_RANGE   = Array.from({ length: 7 }, (_, i) => 2024 + i); // 2024~2030

/* ════════════════════════════════════════════════════════════════
   BookingPlanner
════════════════════════════════════════════════════════════════ */
export function BookingPlanner({ onSave }: { onSave: (p: ReservationPayload) => Promise<void> }) {
  /* 기본값: 2026년 7월 */
  const [viewYear,  setViewYear]  = useState(2026);
  const [viewMonth, setViewMonth] = useState(6); // 0-indexed → 7월

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [dateInput,    setDateInput]    = useState('');
  const [startTime,  setStartTime]  = useState('09:00');
  const [droneCount, setDroneCount] = useState(2);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [yearOpen,   setYearOpen]   = useState(false);
  const [monthOpen,  setMonthOpen]  = useState(false);
  const yearRef  = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);

  /* 외부 클릭 시 드롭다운 닫기 */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (yearRef.current  && !yearRef.current.contains(e.target as Node))  setYearOpen(false);
      if (monthRef.current && !monthRef.current.contains(e.target as Node)) setMonthOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* 달력 계산 */
  const daysInMonth  = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstWeekDay = new Date(viewYear, viewMonth, 1).getDay();

  const availability = useMemo(
    () => buildAvailability(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  /* 월 조작 */
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  /* 날짜 클릭 선택 */
  const selectDay = (day: number) => {
    if (availability[day] === 'past' || availability[day] === 'full') return;
    const iso  = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const disp = `${viewYear}/${String(viewMonth + 1).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
    setSelectedDate(iso);
    setDateInput(disp);
    setSaved(false);
  };

  /* 날짜 텍스트 직접 입력 (마스킹) */
  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskDate(e.target.value);
    setDateInput(masked);
    const iso = parseMasked(masked);
    if (iso) {
      const [y, m] = iso.split('-').map(Number);
      setSelectedDate(iso);
      setViewYear(y);
      setViewMonth(m - 1);
    } else {
      setSelectedDate('');
    }
    setSaved(false);
  };

  /* 저장 */
  const handleSave = async () => {
    if (!selectedDate || !startTime) return;
    setSaving(true);
    try {
      await onSave({
        startAt: `${selectedDate}T${startTime}:00`,
        droneCount,
        selectedZoneIds: [selectedDate],
        areaGeoJson: { type: 'Point', coordinates: [0, 0] },
        workBlocks: [],
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      {/* ── 캘린더 헤더 ──────────────────────────────── */}
      <div className="flex items-center justify-between">

        {/* 이전 달 */}
        <button
          onClick={prevMonth}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-lg text-slate-500 transition hover:border-green-400 hover:bg-green-50 hover:text-green-700"
          aria-label="이전 달"
        >
          ‹
        </button>

        {/* 연도 + 월 드롭다운 */}
        <div className="flex items-center gap-2">

          {/* 연도 드롭다운 */}
          <div ref={yearRef} className="relative">
            <button
              onClick={() => { setYearOpen(o => !o); setMonthOpen(false); }}
              className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-base font-black text-slate-900 transition hover:bg-slate-100"
            >
              {viewYear}년
              <span className="text-xs text-slate-400">{yearOpen ? '▲' : '▼'}</span>
            </button>
            {yearOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 w-28 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                {YEAR_RANGE.map(y => (
                  <button
                    key={y}
                    onClick={() => { setViewYear(y); setYearOpen(false); }}
                    className={`w-full px-4 py-2 text-left text-sm font-bold transition hover:bg-green-50 hover:text-green-700 ${
                      y === viewYear ? 'bg-green-600 text-white' : 'text-slate-800'
                    }`}
                  >
                    {y}년
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 월 드롭다운 */}
          <div ref={monthRef} className="relative">
            <button
              onClick={() => { setMonthOpen(o => !o); setYearOpen(false); }}
              className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-base font-black text-slate-900 transition hover:bg-slate-100"
            >
              {MONTH_LABELS[viewMonth]}
              <span className="text-xs text-slate-400">{monthOpen ? '▲' : '▼'}</span>
            </button>
            {monthOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 w-24 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                {MONTH_LABELS.map((label, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setViewMonth(idx); setMonthOpen(false); }}
                    className={`w-full px-4 py-2 text-left text-sm font-bold transition hover:bg-green-50 hover:text-green-700 ${
                      idx === viewMonth ? 'bg-green-600 text-white' : 'text-slate-800'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 다음 달 */}
        <button
          onClick={nextMonth}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-lg text-slate-500 transition hover:border-green-400 hover:bg-green-50 hover:text-green-700"
          aria-label="다음 달"
        >
          ›
        </button>
      </div>

      {/* ── 요일 헤더 ─────────────────────────────────── */}
      <div className="grid grid-cols-7 gap-1">
        {DAY_LABELS.map((label, i) => (
          <div
            key={label}
            className={`text-center text-xs font-extrabold ${
              i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-slate-700'
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      {/* ── 날짜 셀 ───────────────────────────────────── */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstWeekDay }, (_, i) => <div key={`blank-${i}`} />)}

        {Array.from({ length: daysInMonth }, (_, i) => {
          const day    = i + 1;
          const status = availability[day];
          const iso    = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isSel  = selectedDate === iso;
          const dow    = (firstWeekDay + i) % 7;
          const isPast = status === 'past';
          const isFull = status === 'full';

          return (
            <button
              key={day}
              type="button"
              onClick={() => selectDay(day)}
              disabled={isPast || isFull}
              className={`
                relative flex flex-col items-center rounded-xl py-2 text-sm font-bold transition-all duration-150
                ${isSel
                  ? 'bg-green-600 text-white shadow-md shadow-green-200 scale-105'
                  : isPast
                    ? 'cursor-not-allowed text-slate-300'
                    : isFull
                      ? 'cursor-not-allowed bg-red-50 text-red-300'
                      : dow === 0
                        ? 'text-red-600 hover:bg-red-50 hover:scale-105 cursor-pointer'
                        : dow === 6
                          ? 'text-blue-600 hover:bg-blue-50 hover:scale-105 cursor-pointer'
                          : 'text-slate-900 hover:bg-green-50 hover:text-green-700 hover:scale-105 cursor-pointer'
                }
              `}
            >
              <span className="leading-none">{day}</span>
              {isFull && !isSel && (
                <span className="mt-0.5 text-[8px] font-black text-red-400 leading-none">마감</span>
              )}
              {!isFull && !isPast && !isSel && (
                <span className="mt-1 h-1 w-1 rounded-full bg-green-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── 범례 ──────────────────────────────────────── */}
      <div className="flex gap-5 text-xs font-semibold text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-green-400" />예약 가능
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-300" />마감
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-green-600" />선택됨
        </span>
      </div>

      {/* ── 예약 설정 폼 ──────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
        <p className="text-xs font-extrabold uppercase tracking-widest text-slate-600">예약 설정</p>

        <div className="flex flex-wrap gap-3">
          {/* 날짜 직접 입력 */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700">날짜 (YYYY/MM/DD)</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="2026/07/15"
              value={dateInput}
              onChange={handleDateInput}
              maxLength={10}
              className="h-10 w-36 rounded-xl border border-slate-300 bg-white px-3 text-sm font-mono font-bold text-slate-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
            />
          </div>

          {/* 시작 시간 */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700">시작 시간</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-slate-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
            />
          </div>

          {/* 드론 수 */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700">드론 수</label>
            <input
              type="number"
              min={1}
              max={10}
              value={droneCount}
              onChange={(e) => setDroneCount(Number(e.target.value))}
              className="h-10 w-20 rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-slate-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
            />
          </div>
        </div>

        {/* 선택 요약 */}
        {selectedDate && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-bold text-green-800">
            📅 {selectedDate.replace(/-/g, '/')} {startTime} · 드론 {droneCount}대
          </div>
        )}

        {/* 버튼 */}
        <div className="flex gap-2">
          <button
            onClick={() => { setSelectedDate(''); setDateInput(''); setSaved(false); }}
            className="h-10 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
          >
            초기화
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedDate || saving}
            className="h-10 flex-1 rounded-xl bg-green-600 px-5 text-sm font-bold text-white shadow-sm shadow-green-200 transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
          >
            {saving ? '저장 중...' : saved ? '✓ 예약 완료' : '예약 저장'}
          </button>
        </div>
      </div>
    </div>
  );
}
