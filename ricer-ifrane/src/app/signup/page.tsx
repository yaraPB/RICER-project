'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import { DEPARTMENTS, getDepartmentName } from '@/utils/constants';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';

export default function SignUpPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const { t, language } = useTranslation();
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
      setError(t('passwordsDontMatch'));
      return;
    }

    if (formData.role === 'OFFICIAL' && !formData.department) {
      setError(t('selectDepartmentError'));
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
        setError(data.error || t('signupError'));
        return;
      }

      setUser(data.user);
      router.push('/map');
    } catch (err) {
      setError(t('connectionError'));
    } finally {
      setLoading(false);
    }
  };

  const isRTL = language === 'ar';

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🔥</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('createNewAccount')}
            </h1>
            <p className="text-gray-600">
              {t('joinSystem')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
            {error && (
              <div className={`bg-red-50 text-red-600 p-3 rounded-lg text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                {error}
              </div>
            )}

            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('cin')}
              </label>
              <input
                type="text"
                value={formData.cin}
                onChange={(e) =>
                  setFormData({ ...formData, cin: e.target.value })
                }
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${isRTL ? 'text-right' : 'text-left'}`}
                placeholder="AB123456"
                required
                dir="ltr"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('phone')}
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${isRTL ? 'text-right' : 'text-left'}`}
                placeholder="+212612345678"
                required
                dir="ltr"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('password')}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${isRTL ? 'text-right' : 'text-left'}`}
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('confirmPassword')}
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${isRTL ? 'text-right' : 'text-left'}`}
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('accountType')}
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as 'CIVILIAN' | 'OFFICIAL',
                  })
                }
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${isRTL ? 'text-right' : 'text-left'}`}
              >
                <option value="CIVILIAN">{t('civilian')}</option>
                <option value="OFFICIAL">{t('official')}</option>
              </select>
            </div>

            {formData.role === 'OFFICIAL' && (
              <>
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('department')}
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${isRTL ? 'text-right' : 'text-left'}`}
                    required
                  >
                    <option value="">{t('selectDepartment')}</option>
                    {Object.keys(DEPARTMENTS).map((code) => (
                      <option key={code} value={code}>
                        {getDepartmentName(code as keyof typeof DEPARTMENTS, language)} ({code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('positionOptional')}
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${isRTL ? 'text-right' : 'text-left'}`}
                    placeholder={language === 'ar' ? 'مثال: مدير العمليات' : 'Ex: Directeur des opérations'}
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-medium py-3 rounded-lg transition-colors"
            >
              {loading ? t('creatingAccount') : t('createAccount')}
            </button>
          </form>

          <div className={`mt-6 text-center ${isRTL ? 'text-right' : 'text-left'}`}>
            <p className="text-gray-600">
              {t('haveAccount')}{' '}
              <Link
                href="/signin"
                className="text-red-600 hover:text-red-700 font-medium"
              >
                {t('signIn')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
