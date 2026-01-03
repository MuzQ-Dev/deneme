'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

type OrderStatus = 'pending_payment' | 'paid' | 'accepted' | 'rejected' | 'cancelled';

type OrderItem = {
  id: number;
  title: string;
  category: string;
  unitPrice: number;
  qty: number;
  lineTotal: number;
};

type Order = {
  id: number;
  status: OrderStatus;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  address: string;
  total_amount: string | number;
  currency: string;
  created_at: string;
  admin_note: string | null;
  items: OrderItem[];
};

const statusLabel: Record<OrderStatus, string> = {
  pending_payment: 'Ödeme bekleniyor',
  paid: 'Ödendi',
  accepted: 'Kabul edildi',
  rejected: 'Reddedildi',
  cancelled: 'İptal',
};

export default function OrdersManagementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [showPending, setShowPending] = useState(false);
  const [active, setActive] = useState<Order | null>(null);
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const url = filter === 'all' ? '/api/orders' : `/api/orders?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
      
      // Yarım kalan siparişleri ayrı çek
      const pendingRes = await fetch('/api/orders?status=pending_payment');
      const pendingData = await pendingRes.json();
      if (pendingData.success) {
        setPendingOrders(pendingData.orders);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/');
      return;
    }
    fetchOrders();
  }, [router, fetchOrders]);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const openOrder = (o: Order) => {
    setActive(o);
    setNote(o.admin_note || '');
    setMessage('');
  };

  const totalFmt = (val: any) => `£${Number(val).toFixed(2)}`;

  const updateStatus = async (status: OrderStatus) => {
    if (!active) return;
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: active.id, status, adminNote: note }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Kaydedildi');
        await fetchOrders();
        // günceli tekrar aç
        const updated = (data.order as Order) || null;
        if (updated) openOrder(updated);
      } else {
        setMessage(data.message || 'Kaydedilemedi');
      }
    } catch {
      setMessage('Kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const statusPill = (s: OrderStatus) => {
    const base = 'px-3 py-1 rounded-full text-xs font-bold border';
    if (s === 'accepted') return `${base} bg-green-900/30 text-green-400 border-green-800`;
    if (s === 'rejected') return `${base} bg-red-900/30 text-red-400 border-red-800`;
    if (s === 'paid') return `${base} bg-blue-900/30 text-blue-400 border-blue-800`;
    if (s === 'pending_payment') return `${base} bg-amber-900/30 text-amber-400 border-amber-800`;
    return `${base} bg-zinc-700 text-gray-300 border-zinc-600`;
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    for (const s of ['pending_payment', 'paid', 'accepted', 'rejected', 'cancelled'] as OrderStatus[]) {
      c[s] = orders.filter((o) => o.status === s).length;
    }
    return c;
  }, [orders]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-zinc-900">
      <header className="bg-black/50 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="text-2xl font-bold text-white">BEN&apos;S BAP&apos;S</div>
            <nav className="hidden md:flex gap-4">
              <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white transition">
                Profil
              </button>
              <button onClick={() => router.push('/menu-management')} className="text-gray-400 hover:text-white transition">
                Menü Yönetimi
              </button>
              <button className="text-white font-bold border-b-2 border-red-600">
                Siparişler
              </button>
            </nav>
          </div>
          <button onClick={handleLogout} className="bg-red-700 hover:bg-red-800 text-white px-6 py-2 rounded-md font-medium transition-all">
            Çıkış Yap
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Sipariş Yönetimi</h1>
            <p className="text-gray-400">Siparişleri görüntüle, kabul et, reddet ve not ekle.</p>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="inline-flex bg-zinc-800 border border-zinc-700 rounded-full p-1.5">
              {[
                { key: 'all', label: `Tümü (${counts.all || 0})` },
                { key: 'paid', label: `Ödendi (${counts.paid || 0})` },
                { key: 'accepted', label: `Kabul (${counts.accepted || 0})` },
                { key: 'rejected', label: `Red (${counts.rejected || 0})` },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setFilter(t.key as any)}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition ${
                    filter === (t.key as any) ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {counts.pending_payment > 0 && (
              <div className="inline-flex items-center gap-2 bg-amber-900/30 border border-amber-800 rounded-full px-4 py-2">
                <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-amber-400 font-bold text-sm">
                  Yarım Kalan: {counts.pending_payment}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Yarım Kalan Siparişler Bölümü */}
        {pendingOrders.length > 0 && !showPending && (
          <div className="mb-8 bg-amber-900/20 border border-amber-800/50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h3 className="text-lg font-bold text-amber-400">Yarım Kalan Siparişler</h3>
                  <p className="text-sm text-amber-300/80 mt-1">
                    {pendingOrders.length} sipariş ödeme bekliyor
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPending(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-semibold transition"
              >
                Görüntüle
              </button>
            </div>
          </div>
        )}

        {showPending && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Yarım Kalan Siparişler</h2>
              <button
                onClick={() => setShowPending(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingOrders.map((o: Order) => (
                <button
                  key={o.id}
                  onClick={() => openOrder(o)}
                  className="text-left bg-amber-900/20 border-2 border-amber-800 rounded-2xl hover:border-amber-600 transition-all p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-extrabold text-amber-400">Sipariş #{o.id}</div>
                      <div className="text-sm text-amber-300/80 mt-1">{o.first_name} {o.last_name}</div>
                    </div>
                    <span className={statusPill(o.status)}>{statusLabel[o.status]}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-amber-300/80">Toplam</div>
                    <div className="text-xl font-extrabold text-amber-400">{totalFmt(o.total_amount)}</div>
                  </div>
                  <div className="mt-4 text-xs text-amber-400/60">Oluşturma: {new Date(o.created_at).toLocaleString()}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            <div className="text-gray-400 mt-4">Yükleniyor...</div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-zinc-800 border border-zinc-700 rounded-3xl p-10 text-center text-gray-400">
            Sipariş bulunamadı.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((o) => (
              <button
                key={o.id}
                onClick={() => openOrder(o)}
                className="text-left bg-zinc-800 border border-zinc-700 rounded-2xl hover:border-red-600/50 transition-all p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-extrabold text-white">Sipariş #{o.id}</div>
                    <div className="text-sm text-gray-400 mt-1">{o.first_name} {o.last_name}</div>
                  </div>
                  <span className={statusPill(o.status)}>{statusLabel[o.status]}</span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-400">Toplam</div>
                  <div className="text-xl font-extrabold text-red-600">{totalFmt(o.total_amount)}</div>
                </div>
                <div className="mt-4 text-xs text-gray-500">Oluşturma: {new Date(o.created_at).toLocaleString()}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {active && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-800 border border-zinc-700 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="text-2xl font-extrabold text-white mb-3">Sipariş #{active.id}</div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-gray-300 font-semibold">{active.first_name} {active.last_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-gray-400">{active.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-400">{active.email}</span>
                    </div>
                    <div className="flex items-start gap-2 mt-2">
                      <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-gray-400 text-sm">{active.address}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setActive(null)}
                  className="text-gray-400 hover:text-white"
                  aria-label="Kapat"
                >
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-zinc-700 bg-zinc-900/50 p-5">
                  <div className="text-sm font-bold text-gray-300 mb-3">Sipariş Durumu</div>
                  <div className="flex items-center justify-between gap-4">
                    <span className={statusPill(active.status)}>{statusLabel[active.status]}</span>
                    <div className="text-xl font-extrabold text-red-600">{totalFmt(active.total_amount)}</div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-zinc-700">
                    <div className="text-xs text-gray-500">Sipariş Tarihi</div>
                    <div className="text-sm text-gray-300 mt-1">{new Date(active.created_at).toLocaleString('en-GB', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</div>
                  </div>
                </div>
                <div className="rounded-2xl border border-zinc-700 bg-zinc-900/50 p-5">
                  <div className="text-sm font-bold text-gray-300 mb-3">İletişim Bilgileri</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {active.phone}
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {active.email}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-zinc-700 bg-zinc-900/50 p-5">
                <div className="text-sm font-bold text-gray-300 mb-3">Sipariş Detayları</div>
                <div className="space-y-2">
                  {active.items?.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="text-gray-300 font-semibold">
                        {it.title} <span className="text-gray-500 font-normal">x {it.qty}</span>
                      </div>
                      <div className="text-gray-300 font-bold">{totalFmt(it.lineTotal)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-zinc-700 bg-zinc-900/50 p-5">
                <div className="text-sm font-bold text-gray-300 mb-2">Admin Notu</div>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                />
              </div>

              {message && (
                <div className="mt-4 text-sm font-semibold text-green-400">{message}</div>
              )}

              <div className="mt-6 flex flex-col md:flex-row gap-3">
                <button
                  disabled={saving}
                  onClick={() => updateStatus('accepted')}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-3 rounded-xl"
                >
                  Kabul Et
                </button>
                <button
                  disabled={saving}
                  onClick={() => updateStatus('rejected')}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-semibold py-3 rounded-xl"
                >
                  Reddet
                </button>
                <button
                  disabled={saving}
                  onClick={() => updateStatus(active.status)}
                  className="flex-1 bg-zinc-700 hover:bg-zinc-600 disabled:bg-gray-600 text-white font-semibold py-3 rounded-xl"
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}


