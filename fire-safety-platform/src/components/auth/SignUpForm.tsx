'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { DEPARTMENTS } from '@/utils/constants';

export default function SignUpForm() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [role, setRole] = useState<'CIVILIAN' | 'OFFICIAL'>('CIVILIAN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      cin: formData.get('cin') as string,
      phone: formData.get('phone') as string,
      password: formData.get('password') as string,
      role,
      department: role === 'OFFICIAL' ? (formData.get('department') as string) : undefined,
      position: role === 'OFFICIAL' ? (formData.get('position') as string) : undefined,
    };

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'حدث خطأ أثناء التسجيل');
      }

      setUser(result.user);
      router.push('/weather');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          نوع الحساب
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setRole('CIVILIAN')}
            className={`p-4 border-2 rounded-lg transition-colors ${
              role === 'CIVILIAN'
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="font-semibold">مواطن</div>
            <div className="text-sm text-gray-600">للإبلاغ عن الحرائق</div>
          </button>
          <button
            type="button"
            onClick={() => setRole('OFFICIAL')}
            className={`p-4 border-2 rounded-lg transition-colors ${
              role === 'OFFICIAL'
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="font-semibold">مسؤول</div>
            <div className="text-sm text-gray-600">إدارة الحرائق</div>
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="cin" className="block text-sm font-medium text-gray-700">
          رقم البطاقة الوطنية
        </label>
        <input
          id="cin"
          name="cin"
          type="text"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          رقم الهاتف
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          placeholder="+212..."
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
        />
      </div>

      {role === 'OFFICIAL' && (
        <>
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">
              الإدارة / القسم
            </label>
            <select
              id="department"
              name="department"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
            >
              <option value="">اختر الإدارة</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept.value} value={dept.value}>
                  {dept.label} ({dept.value})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700">
              المنصب / الوظيفة
            </label>
            <input
              id="position"
              name="position"
              type="text"
              required
              placeholder="مثال: رئيس القطاع"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
            />
          </div>
        </>
      )}

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          كلمة المرور
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
        />
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
      >
        {loading ? 'جاري التسجيل...' : 'إنشاء حساب'}
      </button>
    </form>
  );
}
