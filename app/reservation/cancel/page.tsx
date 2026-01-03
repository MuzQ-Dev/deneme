'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function ReservationCancelPage() {
  const router = useRouter();
  const params = useSearchParams();
  const orderId = params.get('order_id');

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="max-w-lg w-full bg-white border border-gray-100 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.06)] p-10 text-center space-y-4">
        <div className="text-2xl font-extrabold text-gray-900">Ödeme iptal edildi</div>
        <div className="text-gray-600">
          Ödeme tamamlanmadı. Dilerseniz yeniden deneyebilirsiniz.
          {orderId ? <div className="mt-2 text-sm text-gray-500">Sipariş No: {orderId}</div> : null}
        </div>
        <div className="pt-4 flex gap-3 justify-center">
          <button
            onClick={() => router.push('/#reservation')}
            className="px-6 py-3 rounded-xl bg-red-600 text-white font-semibold"
          >
            Yeniden Dene
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold"
          >
            Ana Sayfa
          </button>
        </div>
      </div>
    </main>
  );
}


