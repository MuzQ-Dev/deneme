'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function ReservationSuccessPage() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const sessionId = params.get('session_id');
    const orderNumber = params.get('orderNumber');
    const isTestMode = params.get('testMode') === 'true';

    // Test modu: Sipariş numarası ile direkt başarı göster
    if (isTestMode && orderNumber) {
      setStatus('ok');
      setMessage(`Test modunda sipariş oluşturuldu. Sipariş No: ${orderNumber}`);
      return;
    }

    // Normal mod: Stripe session doğrulama
    if (!sessionId) {
      setStatus('error');
      setMessage('Ödeme oturumu bulunamadı.');
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
          setMessage(`Ödeme alındı. Siparişiniz alındı ve onaya gönderildi.${data.order?.orderNumber ? ` Sipariş No: ${data.order.orderNumber}` : ''}`);
        } else {
          setStatus('error');
          setMessage(data.message || 'Ödeme doğrulanamadı.');
        }
      } catch {
        setStatus('error');
        setMessage('Doğrulama sırasında hata oluştu.');
      }
    })();
  }, [params]);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="max-w-lg w-full bg-white border border-gray-100 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.06)] p-10 text-center space-y-4">
        <div className="text-2xl font-extrabold text-gray-900">
          {status === 'loading' ? 'Doğrulanıyor...' : status === 'ok' ? 'Başarılı' : 'Hata'}
        </div>
        <div className="text-gray-600">{message}</div>
        <div className="pt-4 flex gap-3 justify-center">
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 rounded-xl bg-zinc-900 text-white font-semibold"
          >
            Ana Sayfa
          </button>
          <button
            onClick={() => router.push('/orders-management')}
            className="px-6 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold"
          >
            Siparişler (Admin)
          </button>
        </div>
      </div>
    </main>
  );
}


