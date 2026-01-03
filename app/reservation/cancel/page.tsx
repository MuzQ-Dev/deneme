'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function CancelContent() {
  const router = useRouter();
  const params = useSearchParams();
  const orderId = params.get('order_id');

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="max-w-lg w-full bg-white border border-gray-100 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.06)] p-10 text-center space-y-4">
        <div className="text-2xl font-extrabold text-gray-900">Payment Cancelled</div>
        <div className="text-gray-600">
          Payment was not completed. You can try again if you wish.
          {orderId ? <div className="mt-2 text-sm text-gray-500">Order No: {orderId}</div> : null}
        </div>
        <div className="pt-4 flex gap-3 justify-center">
          <button
            onClick={() => router.push('/#reservation')}
            className="px-6 py-3 rounded-xl bg-red-600 text-white font-semibold"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold"
          >
            Home
          </button>
        </div>
      </div>
    </main>
  );
}

export default function ReservationCancelPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="text-gray-600">Loading...</div>
      </main>
    }>
      <CancelContent />
    </Suspense>
  );
}


