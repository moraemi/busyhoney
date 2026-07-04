import { BookingPageClient } from '@/components/booking/BookingPageClient';

export const metadata = { title: '수분 예약 — Pollen-Drone' };

export default function BookingPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black text-slate-900">수분 작업 예약</h2>
      <BookingPageClient />
    </div>
  );
}
