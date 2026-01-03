'use client';

import { useMemo, useState, useEffect } from 'react';

export type ReservationMenuItem = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  image: string | null;
};

type Props = {
  items: ReservationMenuItem[];
};

export function ReservationWizard({ items }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [testMode, setTestMode] = useState(false);

  // Test modu durumunu kontrol et
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setTestMode(localStorage.getItem('testMode') === 'true');
    }
  }, [step]);

  // Step 1 fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  // Step 2 selection (id -> qty)
  const [selected, setSelected] = useState<Record<number, number>>({});

  const selectedList = useMemo(() => {
    const byId = new Map(items.map((i) => [i.id, i]));
    return Object.entries(selected)
      .map(([idStr, qty]) => {
        const id = Number(idStr);
        const item = byId.get(id);
        if (!item) return null;
        const q = Math.max(1, Number(qty || 1));
        return {
          ...item,
          qty: q,
          lineTotal: Number(item.price) * q,
        };
      })
      .filter(Boolean) as Array<ReservationMenuItem & { qty: number; lineTotal: number }>;
  }, [items, selected]);

  const total = useMemo(() => {
    return selectedList.reduce((sum, i) => sum + i.lineTotal, 0);
  }, [selectedList]);

  // Email format validasyonu
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const canGoStep2 = firstName.trim() && lastName.trim() && phone.trim() && email.trim() && address.trim();
  const canGoStep3 = selectedList.length > 0;

  const goNext = () => {
    setMessage('');
    if (step === 1) {
      if (!canGoStep2) {
        setMessage('Please fill in all fields.');
        return;
      }
      // Email format kontrolü
      if (!isValidEmail(email.trim())) {
        setMessage('Please enter a valid email address. (e.g., example@email.com)');
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!canGoStep3) {
        setMessage('Please select at least one menu item.');
        return;
      }
      setStep(3);
      return;
    }
  };

  const goBack = () => {
    setMessage('');
    if (step === 2) return setStep(1);
    if (step === 3) return setStep(2);
  };

  const toggleItem = (id: number) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = 1;
      }
      return next;
    });
  };

  const setQty = (id: number, qty: number) => {
    setSelected((prev) => ({ ...prev, [id]: Math.max(1, qty) }));
  };

  const startPayment = async () => {
    setSubmitting(true);
    setMessage('');
    try {
      const payload = {
        firstName,
        lastName,
        phone,
        email,
        address,
        selectedItems: selectedList.map((i) => ({ id: i.id, qty: i.qty })),
      };

      // Test modu kontrolü
      const testMode = localStorage.getItem('testMode') === 'true';

      if (testMode) {
        // Test modu: Direkt sipariş oluştur
        const res = await fetch('/api/orders/test-mode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (!data.success) {
          setMessage(data.message || 'Failed to create order.');
          return;
        }

        // Başarılı - sipariş numarası ile success sayfasına yönlendir
        window.location.href = `/reservation/success?orderNumber=${data.order.orderNumber}&testMode=true`;
        return;
      }

      // Normal mod: Stripe checkout
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!data.success) {
        setMessage(data.message || 'Ödeme başlatılamadı.');
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      setMessage('Ödeme bağlantısı oluşturulamadı.');
    } catch (e) {
      setMessage('Ödeme başlatılırken hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="reservation" className="py-24 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-10 mb-10">
          <div className="space-y-3">
            <div className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-4 py-2">
              <span className="text-xs font-bold uppercase tracking-widest text-red-700">Reservation</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Rezervasyon ve ödeme
            </h2>
            <p className="text-gray-600 text-lg">
              Bilgileri doldurun, menüyü seçin, kart ile ödeme yapın. Sipariş admin paneline düşer.
            </p>
          </div>

          <div className="w-full lg:w-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-gray-50 border border-gray-200 p-1.5">
              {[
                { n: 1, t: 'Details' },
                { n: 2, t: 'Menu' },
                { n: 3, t: 'Payment' },
              ].map((s) => (
                <div
                  key={s.n}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition ${
                    step === s.n ? 'bg-zinc-900 text-white shadow' : 'text-gray-600'
                  }`}
                >
                  {s.n}. {s.t}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.06)] p-8">
              {step === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                      <input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                      <input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@email.com"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        type="tel"
                        placeholder="+44 20 1234 5678"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-gray-700 font-semibold">Menu Selection</div>
                  <div className="space-y-4">
                    {items.map((it) => {
                      const checked = !!selected[it.id];
                      return (
                        <div key={it.id} className="flex flex-col md:flex-row gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50/40">
                          <div className="md:w-40 h-24 rounded-xl overflow-hidden bg-white border border-gray-100">
                            <img
                              src={it.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600'}
                              alt={it.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="font-bold text-gray-900">{it.title}</div>
                                <div className="text-sm text-gray-600">{it.description}</div>
                              </div>
                              <div className="text-red-600 font-bold">£{Number(it.price).toFixed(2)}</div>
                            </div>
                            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                              <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleItem(it.id)}
                                  className="h-4 w-4"
                                />
                                Select
                              </label>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Quantity</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={selected[it.id] || 1}
                                  disabled={!checked}
                                  onChange={(e) => setQty(it.id, Number(e.target.value))}
                                  className="w-20 px-3 py-2 rounded-lg border border-gray-200 bg-white disabled:bg-gray-100"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="text-gray-700 font-semibold">Payment</div>
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-5 space-y-3">
                    {selectedList.map((i) => (
                      <div key={i.id} className="flex items-center justify-between gap-4 text-sm">
                        <div className="text-gray-900 font-semibold">
                          {i.title} <span className="text-gray-500 font-normal">x {i.qty}</span>
                        </div>
                        <div className="text-gray-700 font-bold">£{Number(i.lineTotal).toFixed(2)}</div>
                      </div>
                    ))}
                    <div className="h-px bg-gray-200 my-2" />
                    <div className="flex items-center justify-between">
                      <div className="text-gray-700 font-semibold">Total</div>
                      <div className="text-2xl font-extrabold text-red-600">£{Number(total).toFixed(2)}</div>
                    </div>
                  </div>

                  {testMode && (
                    <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <div className="font-semibold text-amber-900">Test Mode Active</div>
                          <div className="text-sm text-amber-700 mt-1">
                            Order will be created without payment and an order number will be provided.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={startPayment}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-red-600/20"
                  >
                    {submitting 
                      ? 'Processing...' 
                      : testMode 
                        ? 'Create Order in Test Mode' 
                        : 'Pay with Card'}
                  </button>
                </div>
              )}

              {message && (
                <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 font-medium">
                  {message}
                </div>
              )}

              <div className="mt-8 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={step === 1 || submitting}
                  className="px-6 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={step === 3 || submitting}
                  className="px-6 py-3 rounded-xl bg-zinc-900 text-white font-semibold disabled:opacity-50"
                >
                  Next Step
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-6 space-y-6">
              <div className="bg-gray-50 rounded-3xl border border-gray-100 p-6">
                <div className="text-lg font-bold text-gray-900 mb-2">Summary</div>
                <div className="text-sm text-gray-600 leading-relaxed">
                  Your order will be created and status will be updated in the admin panel after card payment.
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Selected Items</span>
                    <span className="font-bold text-gray-900">{selectedList.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total</span>
                    <span className="font-bold text-red-600">£{Number(total).toFixed(2)}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


