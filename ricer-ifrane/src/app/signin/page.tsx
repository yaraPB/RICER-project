'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function SignInPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [formData, setFormData] = useState({
    cin: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'حدث خطأ أثناء تسجيل الدخول');
        return;
      }

      setUser(data.user);
      router.push('/map');
    } catch (err) {
      setError('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🔥</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              RICER Ifrane
            </h1>
            <p className="text-gray-600">
              نظام الإبلاغ عن الحرائق في إفران
            </p>
            <p className="text-sm text-gray-500">
              Système de signalement des incendies à Ifrane
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-right">
                {error}
              </div>
            )}

            <div>
              <label className="block text-right text-sm font-medium text-gray-700 mb-2">
                رقم البطاقة الوطنية
                <span className="text-xs text-gray-500 mr-2">• CIN</span>
              </label>
              <input
                type="text"
                value={formData.cin}
                onChange={(e) =>
                  setFormData({ ...formData, cin: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-right"
                placeholder="AB123456"
                required
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-right text-sm font-medium text-gray-700 mb-2">
                كلمة المرور
                <span className="text-xs text-gray-500 mr-2">• Mot de passe</span>
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-right"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-medium py-3 rounded-lg transition-colors"
            >
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول • Connexion'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              ليس لديك حساب؟{' '}
              <Link
                href="/signup"
                className="text-red-600 hover:text-red-700 font-medium"
              >
                إنشاء حساب جديد
              </Link>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Pas de compte ?{' '}
              <Link
                href="/signup"
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
