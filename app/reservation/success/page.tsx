'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function SuccessContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const sessionId = params.get('session_id');
    const orderNumber = params.get('orderNumber');
    const isTestMode = params.get('testMode') === 'true';

    // Test mode: Show success directly with order number
    if (isTestMode && orderNumber) {
      setStatus('ok');
      setMessage(`Order created in test mode. Order No: ${orderNumber}`);
      return;
    }

    // Normal mode: Stripe session verification
    if (!sessionId) {
      setStatus('error');
      setMessage('Payment session not found.');
      return;
    }

    (async () => {
      try {
        const res = await fetch('/api/orders/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();
        if (data.success) {
          setStatus('ok');
          setMessage(`Payment received. Your order has been received and sent for approval.${data.order?.orderNumber ? ` Order No: ${data.order.orderNumber}` : ''}`);
        } else {
          setStatus('error');
          setMessage(data.message || 'Payment could not be verified.');
        }
      } catch {
        setStatus('error');
        setMessage('An error occurred during verification.');
      }
    })();
  }, [params]);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="max-w-lg w-full bg-white border border-gray-100 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.06)] p-10 text-center space-y-4">
        <div className="text-2xl font-extrabold text-gray-900">
          {status === 'loading' ? 'Verifying...' : status === 'ok' ? 'Success' : 'Error'}
        </div>
        <div className="text-gray-600">{message}</div>
        <div className="pt-4 flex gap-3 justify-center">
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 rounded-xl bg-zinc-900 text-white font-semibold"
          >
            Home
          </button>
          <button
            onClick={() => router.push('/orders-management')}
            className="px-6 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold"
          >
            Orders (Admin)
          </button>
        </div>
      </div>
    </main>
  );
}

export default function ReservationSuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="text-gray-600">Loading...</div>
      </main>
    }>
      <SuccessContent />
    </Suspense>
  );
}


