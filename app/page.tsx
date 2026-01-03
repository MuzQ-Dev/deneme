'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ReservationWizard } from '@/components/ReservationWizard';

interface MenuItem {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  image: string;
}

export default function Home() {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);

  // Menü verilerini yükle
  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoadingMenu(true);
      const response = await fetch('/api/menu');
      const data = await response.json();
      
      if (data.success) {
        // Price'ı number'a çevir
        const items = data.items.map((item: any) => ({
          ...item,
          price: parseFloat(item.price)
        }));
        setMenuItems(items);
      }
    } catch (error) {
      console.error('Menu loading error:', error);
    } finally {
      setLoadingMenu(false);
    }
  };

  const filteredItems = activeCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setMessage('✓ ' + data.message + ' Redirecting...');
        
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        setMessage('✗ ' + data.message);
      }
    } catch (error) {
      setMessage('✗ Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Restaurant",
            "name": "BEN'S BAP'S",
            "description": "Premium catering and event services in London. Exceptional British cuisine for weddings, corporate events, and private parties.",
            "servesCuisine": "British",
            "priceRange": "££",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "GB",
              "addressLocality": "London"
            },
            "telephone": "+44 756 1626 764",
            "url": typeof window !== 'undefined' ? window.location.origin : "https://bensbaps.com",
            "menu": menuItems.length > 0 ? menuItems.map(item => ({
              "@type": "MenuItem",
              "name": item.title,
              "description": item.description,
              "offers": {
                "@type": "Offer",
                "price": item.price,
                "priceCurrency": "GBP"
              }
            })) : []
          })
        }}
      />
    <main className="relative bg-white text-gray-900 overflow-x-hidden font-sans">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070&auto=format&fit=crop)',
          }}
        >
          {/* Daha yumuşak, hafif bir overlay */}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Header */}
        <header className="relative z-20 px-6 py-6 border-b border-white/10 backdrop-blur-md bg-white/5">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wider">BEN&apos;S BAP&apos;S</h1>
            </div>
            <nav className="hidden md:flex gap-8 items-center">
              <button onClick={() => setShowLogin(false)} className="text-white hover:text-red-400 transition font-medium border-b-2 border-red-600">
                Home
              </button>
              <a href="#menu" className="text-white hover:text-red-400 transition font-medium">
                Menu
              </a>
              <a href="#events" className="text-white hover:text-red-400 transition font-medium">
                Events
              </a>
              <button 
                onClick={() => setShowLogin(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-medium transition-all shadow-lg shadow-red-600/20"
              >
                Contact: 0756 1626 764
              </button>
            </nav>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 flex-grow flex items-center px-6">
          <div className="max-w-7xl mx-auto w-full">
            {!showLogin ? (
              <div className="max-w-3xl space-y-8 animate-fade-in">
                <div className="inline-flex items-center gap-2 text-white bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                  <span className="text-sm font-medium tracking-widest uppercase">PROFESSIONAL MANAGEMENT</span>
                </div>

                <h2 className="text-6xl md:text-8xl font-bold text-white leading-tight drop-shadow-2xl">
                  Taste Meets Art
                  <br />
                  <span className="text-red-500">Excellence</span>
                </h2>

                <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl drop-shadow-lg">
                  Unforgettable Flavours, Perfect Events. From weddings to corporate 
                  meetings, we deliver a unique experience.
                </p>

                <div className="flex flex-wrap gap-4 pt-4">
                  <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-md font-semibold transition-all shadow-xl shadow-red-600/30 flex items-center gap-2 group">
                    Plan Event
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                  <button className="bg-white/10 hover:bg-white/20 border-2 border-white/50 text-white px-8 py-4 rounded-md font-semibold transition-all backdrop-blur-sm">
                    View Menu
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto">
                <div className="bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Panele Giriş</h2>
                    <p className="text-gray-500">Login to your account</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                      </label>
                      <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                        placeholder="Your username"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                        placeholder="Your password"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-all shadow-lg shadow-red-600/20"
                    >
                      {loading ? 'Logging in...' : 'Login'}
                    </button>
                  </form>

                  {message && (
                    <div className={`mt-6 text-center p-4 rounded-lg ${
                      message.startsWith('✓') 
                        ? 'bg-green-50 text-green-700 border border-green-100' 
                        : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                      {message}
                    </div>
                  )}

                  <div className="mt-6 text-center">
                    <button onClick={() => setShowLogin(false)} className="text-gray-500 hover:text-gray-900 transition text-sm font-medium">
                      ← Back to Home
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-4 py-2">
                <span className="text-xs font-bold uppercase tracking-widest text-red-700">Why Us?</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                Service that simplifies your event,
                <span className="text-red-600"> highlights flavour</span>.
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Every detail from process management to presentation is planned. You work with a team that maintains clear communication, regular operations, and standards.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-white border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  Transparent pricing
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  Quick planning
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  Consistent quality
                </span>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    title: 'Timely and planned operations',
                    desc: 'Clear flow from setup to service; no surprises.',
                    icon: (
                      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                        <path d="M12 8v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    ),
                  },
                  {
                    title: 'Menus tailored to taste',
                    desc: 'We quickly organise content and present options clearly.',
                    icon: (
                      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                        <path d="M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M6 7l2 14h8l2-14" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                        <path d="M9 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                      </svg>
                    ),
                  },
                  {
                    title: 'Clean presentation, strong brand perception',
                    desc: 'Minimal and elegant service; takes your event to the next level.',
                    icon: (
                      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                        <path d="M7 20h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M12 4v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M8 14h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M9 4h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    ),
                  },
                  {
                    title: 'Quick communication and clear process',
                    desc: 'Single point of tracking; decisions are quick, processes are transparent.',
                    icon: (
                      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                        <path d="M7 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M7 12h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M21 12a8 8 0 0 1-8 8H7l-4 3 1.5-4.5A8 8 0 1 1 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                      </svg>
                    ),
                  },
                ].map((f, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.05)] p-6 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-red-50 text-red-700 border border-red-100 flex items-center justify-center">
                        {f.icon}
                      </div>
                      <div className="space-y-2">
                        <div className="text-lg font-bold text-gray-900">{f.title}</div>
                        <div className="text-gray-600 leading-relaxed">{f.desc}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          {/* Category Filter */}
          <div className="flex justify-center mb-16">
            <div className="inline-flex bg-gray-100/50 p-1.5 rounded-full border border-gray-200 backdrop-blur-sm">
              {['All', 'Mains', 'Breakfast', 'Side Dishes'].map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                    activeCategory === category
                      ? 'bg-zinc-900 text-white shadow-lg'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {loadingMenu ? (
              <div className="col-span-2 text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                <p className="mt-4 text-gray-500">Loading menu...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="col-span-2 text-center py-20">
                <p className="text-gray-500 text-lg">No menu items found in this category.</p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div 
                  key={item.id} 
                  className="relative flex flex-col md:flex-row bg-white/90 backdrop-blur-sm rounded-[2rem] overflow-hidden border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-500 group"
                >
                  <div className="absolute top-4 right-4">
                    <span className="inline-block px-4 py-2 rounded-full bg-white text-red-600 font-bold text-sm shadow-md border border-red-100">
                      £{Number(item.price).toFixed(2)}
                    </span>
                  </div>

                  {/* Image Part */}
                  <div className="md:w-2/5 h-64 md:h-auto overflow-hidden">
                    <img 
                      src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600'} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  
                  {/* Content Part */}
                  <div className="md:w-3/5 p-8 md:p-10 flex flex-col justify-center space-y-4">
                    <h4 className="text-2xl md:text-3xl font-bold text-gray-900">{item.title}</h4>
                    <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-3 pt-2">
                      <span className="inline-block px-4 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-widest rounded-md border border-gray-200">
                        {item.category.toUpperCase()}
                      </span>
                      <span className="h-2 w-2 rounded-full bg-red-500 opacity-70"></span>
                      <span className="text-sm font-semibold text-red-600">Best choice</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Reservation Section (Under Menu) */}
      <ReservationWizard items={menuItems} />

      {/* Testimonials Section */}
      <section className="py-24 bg-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-red-600 font-bold uppercase tracking-widest text-sm">Yorumlar</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900">What Our Clients Say</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "James Sterling", comment: "The catering was absolutely spot on. The baps were fresh and the service was brilliant. Highly recommend Ben's for any event!", role: "Event Organiser" },
              { name: "Sarah Jenkins", comment: "Lovely food and even better service. They handled our corporate lunch with such professionalism. Proper good stuff, cheers!", role: "Business Manager" },
              { name: "Oliver Smith", comment: "Best baps in Maidstone, hands down. The team is friendly and the flavours are just incredible. Top notch!", role: "Local Customer" }
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 p-8 rounded-3xl border border-gray-100 space-y-6 hover:shadow-lg transition-all">
                <div className="flex text-amber-500 gap-1">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                </div>
                <p className="text-gray-600 italic leading-relaxed">&quot;{item.comment}&quot;</p>
                <div className="pt-6 border-t border-gray-200 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">
                    {item.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{item.name}</div>
                    <div className="text-red-600 text-sm font-medium">{item.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
          <div className="text-3xl font-bold tracking-wider">BEN&apos;S BAP&apos;S</div>
          <nav className="flex flex-wrap justify-center gap-10 text-gray-400 font-medium">
            <a href="#" className="hover:text-white transition">Home</a>
            <a href="#" className="hover:text-white transition">Menu</a>
            <a href="#" className="hover:text-white transition">About</a>
            <a href="#" className="hover:text-white transition">Contact</a>
          </nav>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-gray-500 text-sm">
            <div>© 2026 BEN&apos;S BAP&apos;S. All rights reserved.</div>
            <div>
              Made by{' '}
              <a 
                href="https://muzq.online" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition font-medium"
              >
                Muzq.online
              </a>
            </div>
          </div>
        </div>
      </footer>
      </main>
    </>
  );
}

