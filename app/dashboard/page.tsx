'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  username: string;
  first_name: string | null;
  last_name: string | null;
  profile_image: string | null;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [testMode, setTestMode] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/');
      return;
    }
    
    const userData = JSON.parse(userStr);
    setUser(userData);
    setFirstName(userData.first_name || '');
    setLastName(userData.last_name || '');
    setImagePreview(userData.profile_image || null);
    
    // Test modu durumunu yükle
    const testModeStr = localStorage.getItem('testMode');
    setTestMode(testModeStr === 'true');
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      let imageUrl = user?.profile_image || null;
      let publicId = null;

      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('userId', user?.id.toString() || '');

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadRes.json();
        
        if (uploadData.success) {
          imageUrl = uploadData.url;
          publicId = uploadData.publicId;
        } else {
          throw new Error(uploadData.message);
        }
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          firstName,
          lastName,
          profileImage: imageUrl,
          cloudinaryPublicId: publicId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('✓ Profil başarıyla güncellendi!');
        const updatedUser = { ...user, ...data.user };
        setUser(updatedUser as User);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setImageFile(null);
      } else {
        setMessage('✗ ' + data.message);
      }
    } catch (error) {
      setMessage('✗ Güncelleme hatası: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!user?.profile_image) return;
    
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/profile', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('✓ Profil resmi silindi!');
        const updatedUser = { ...user, profile_image: null, cloudinary_public_id: null };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setImagePreview(null);
      } else {
        setMessage('✗ ' + data.message);
      }
    } catch (error) {
      setMessage('✗ Silme hatası');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  const toggleTestMode = () => {
    const newMode = !testMode;
    setTestMode(newMode);
    localStorage.setItem('testMode', String(newMode));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900">
        <div className="text-xl text-white">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-900">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-bold text-white">BEN&apos;S BAP&apos;S</h1>
              <nav className="hidden md:flex gap-4">
                <button className="text-white font-bold border-b-2 border-red-600">
                  Profil
                </button>
                <button
                  onClick={() => router.push('/menu-management')}
                  className="text-gray-400 hover:text-white transition"
                >
                  Menü Yönetimi
                </button>
                <button
                  onClick={() => router.push('/orders-management')}
                  className="text-gray-400 hover:text-white transition"
                >
                  Siparişler
                </button>
              </nav>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-700 hover:bg-red-800 text-white px-6 py-2 rounded-md font-medium transition-all"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-4xl font-bold text-white mb-2">
                Hoş Geldin, <span className="text-red-600">@{user.username}</span>
              </h2>
              <p className="text-gray-400">Profil bilgilerini yönet ve düzenle</p>
            </div>
            {/* Test Mode Toggle */}
            <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-300">Test Modu</span>
                <button
                  onClick={toggleTestMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    testMode ? 'bg-red-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      testMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                {testMode && (
                  <span className="text-xs text-amber-400 font-semibold">Aktif</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {testMode 
                  ? 'Ödeme yapılmadan sipariş oluşturulacak' 
                  : 'Gerçek ödeme sistemi kullanılacak'}
              </p>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Image Card */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Profil Fotoğrafı</h3>
              
              <div className="flex flex-col items-center">
                <div className="relative group mb-6">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Profile"
                        className="w-40 h-40 rounded-full object-cover border-4 border-red-600 shadow-xl"
                      />
                      <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-sm font-medium">Değiştir</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-40 h-40 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center border-4 border-zinc-700 shadow-xl">
                      <span className="text-5xl text-white font-bold">
                        {user.first_name?.[0] || user.username[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="w-full space-y-3">
                  <label className="block">
                    <div className="bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white px-6 py-3 rounded-lg cursor-pointer transition-all text-center font-medium shadow-lg">
                      Resim Seç
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  
                  {user.profile_image && (
                    <button
                      type="button"
                      onClick={handleDeleteImage}
                      disabled={loading}
                      className="w-full bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      Resmi Sil
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form Card */}
          <div className="lg:col-span-2">
            <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Profil Bilgileri</h3>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                      İsim
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                      placeholder="İsminiz"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                      Soyisim
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                      placeholder="Soyisminiz"
                    />
                  </div>
                </div>

                {/* Username (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Kullanıcı Adı (değiştirilemez)
                  </label>
                  <input
                    type="text"
                    value={user.username}
                    disabled
                    className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-lg text-gray-500 cursor-not-allowed"
                  />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-zinc-900 rounded-lg border border-zinc-700">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 mb-1">
                      {user.profile_image ? '✓' : '○'}
                    </div>
                    <div className="text-sm text-gray-400">Profil Resmi</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-500 mb-1">
                      {firstName && lastName ? '✓' : '○'}
                    </div>
                    <div className="text-sm text-gray-400">Tam İsim</div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 rounded-lg transition-all duration-300 shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Güncelleniyor...
                    </span>
                  ) : (
                    'Profili Güncelle'
                  )}
                </button>
              </form>

              {/* Message */}
              {message && (
                <div className={`mt-6 text-center p-4 rounded-lg font-medium ${
                  message.startsWith('✓') 
                    ? 'bg-green-900/30 text-green-400 border border-green-800' 
                    : 'bg-red-900/30 text-red-400 border border-red-800'
                }`}>
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

