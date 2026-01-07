'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { DEPARTMENTS } from '@/utils/constants';

export default function SignUpPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [formData, setFormData] = useState({
    cin: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'CIVILIAN' as 'CIVILIAN' | 'OFFICIAL',
    department: '',
    position: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }

    if (formData.role === 'OFFICIAL' && !formData.department) {
      setError('يرجى اختيار القسم');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cin: formData.cin,
          phone: formData.phone,
          password: formData.password,
          role: formData.role,
          department: formData.department || undefined,
          position: formData.position || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'حدث خطأ أثناء إنشاء الحساب');
        return;
      }

      setUser(data.user);
      router.push('/weather');
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
              إنشاء حساب جديد
            </h1>
            <p className="text-gray-600">انضم إلى نظام RICER Ifrane</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-right">
                {error}
              </div>
            )}

            <div>
              <label className="block text-right text-sm font-medium text-gray-700 mb-2">
                رقم البطاقة الوطنية
              </label>
              <input
                type="text"
                value={formData.cin}
                onChange={(e) =>
                  setFormData({ ...formData, cin: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-right"
                placeholder="AB123456"
                required
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-right text-sm font-medium text-gray-700 mb-2">
                رقم الهاتف
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-right"
                placeholder="+212612345678"
                required
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-right text-sm font-medium text-gray-700 mb-2">
                كلمة المرور
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-right"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-right text-sm font-medium text-gray-700 mb-2">
                تأكيد كلمة المرور
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-right"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-right text-sm font-medium text-gray-700 mb-2">
                نوع الحساب
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as 'CIVILIAN' | 'OFFICIAL',
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-right"
              >
                <option value="CIVILIAN">مواطن</option>
                <option value="OFFICIAL">مسؤول حكومي</option>
              </select>
            </div>

            {formData.role === 'OFFICIAL' && (
              <>
                <div>
                  <label className="block text-right text-sm font-medium text-gray-700 mb-2">
                    القسم
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-right"
                    required
                  >
                    <option value="">اختر القسم</option>
                    {Object.entries(DEPARTMENTS).map(([code, name]) => (
                      <option key={code} value={code}>
                        {name} ({code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-right text-sm font-medium text-gray-700 mb-2">
                    المنصب (اختياري)
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-right"
                    placeholder="مثال: مدير العمليات"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-medium py-3 rounded-lg transition-colors"
            >
              {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              لديك حساب بالفعل؟{' '}
              <Link
                href="/signin"
                className="text-red-600 hover:text-red-700 font-medium"
              >
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
