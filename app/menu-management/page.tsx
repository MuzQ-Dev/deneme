'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface MenuItem {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  image: string | null;
  cloudinary_public_id: string | null;
}

export default function MenuManagement() {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [message, setMessage] = useState('');
  
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Mains');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Auth kontrolü
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/');
      return;
    }
    
    fetchMenuItems();
  }, [router]);

  const fetchMenuItems = async () => {
    try {
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
      console.error('Menü yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      let imageUrl = editingItem?.image || null;
      let publicId = editingItem?.cloudinary_public_id || null;

      // Resim yükleme
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('userId', '1'); // Temp

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadRes.json();
        
        if (uploadData.success) {
          imageUrl = uploadData.url;
          publicId = uploadData.publicId;
        }
      }

      // Menü ekleme veya güncelleme
      const method = editingItem ? 'PUT' : 'POST';
      const body = editingItem
        ? { id: editingItem.id, title, description, category, price: parseFloat(price), image: imageUrl, cloudinaryPublicId: publicId }
        : { title, description, category, price: parseFloat(price), image: imageUrl, cloudinaryPublicId: publicId };

      const response = await fetch('/api/menu', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✓ Menü ${editingItem ? 'güncellendi' : 'eklendi'}!`);
        fetchMenuItems();
        resetForm();
        setTimeout(() => setShowModal(false), 1500);
      } else {
        setMessage('✗ ' + data.message);
      }
    } catch (error) {
      setMessage('✗ İşlem hatası');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description);
    setCategory(item.category);
    setPrice(item.price.toString());
    setImagePreview(item.image);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu menüyü silmek istediğinize emin misiniz?')) return;

    try {
      const response = await fetch(`/api/menu?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setMessage('✓ Menü silindi!');
        fetchMenuItems();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('✗ Silme hatası');
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setTitle('');
    setDescription('');
    setCategory('Mains');
    setPrice('');
    setImageFile(null);
    setImagePreview(null);
    setMessage('');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-zinc-900">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-bold text-white">BEN'S BAP'S</h1>
              <nav className="hidden md:flex gap-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="text-gray-400 hover:text-white transition"
                >
                  Profil
                </button>
                <button className="text-white font-bold border-b-2 border-red-600">
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

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Top Actions */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">Menü Yönetimi</h2>
            <p className="text-gray-400">Menüleri ekle, düzenle veya sil</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Yeni Menü Ekle
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.startsWith('✓') 
              ? 'bg-green-900/30 text-green-400 border border-green-800' 
              : 'bg-red-900/30 text-red-400 border border-red-800'
          }`}>
            {message}
          </div>
        )}

        {/* Menu List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <div 
                key={item.id} 
                className="bg-zinc-800 border border-zinc-700 rounded-2xl overflow-hidden hover:border-red-600/50 transition-all"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600'}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-white">{item.title}</h3>
                    <span className="text-lg font-bold text-red-600">£{Number(item.price).toFixed(2)}</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{item.description}</p>
                  <span className="inline-block px-3 py-1 bg-zinc-700 text-gray-300 text-xs font-bold uppercase rounded-md mb-4">
                    {item.category}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg font-medium transition"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="flex-1 bg-red-900/30 hover:bg-red-900/50 text-red-400 px-4 py-2 rounded-lg font-medium transition border border-red-800"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-800 border border-zinc-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">
                  {editingItem ? 'Menüyü Düzenle' : 'Yeni Menü Ekle'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Resim</label>
                  <div className="flex items-center gap-4">
                    {imagePreview && (
                      <img src={imagePreview} alt="Preview" className="w-24 h-24 rounded-lg object-cover" />
                    )}
                    <label className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-3 rounded-lg cursor-pointer transition text-center font-medium">
                      Resim Seç
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                    Başlık *
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                    Açıklama
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                  />
                </div>

                {/* Category & Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                      Kategori *
                    </label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                      required
                    >
                      <option value="Mains">Mains</option>
                      <option value="Breakfast">Breakfast</option>
                      <option value="Side Dishes">Side Dishes</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-2">
                      Fiyat (£) *
                    </label>
                    <input
                      id="price"
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-3 rounded-lg font-semibold transition"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition"
                  >
                    {submitting ? 'Kaydediliyor...' : (editingItem ? 'Güncelle' : 'Ekle')}
                  </button>
                </div>

                {message && (
                  <div className={`text-center p-3 rounded-lg text-sm ${
                    message.startsWith('✓') 
                      ? 'bg-green-900/30 text-green-400 border border-green-800' 
                      : 'bg-red-900/30 text-red-400 border border-red-800'
                  }`}>
                    {message}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

