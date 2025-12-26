import Link from 'next/link';
import SignInForm from '@/components/auth/SignInForm';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-orange-600 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <span className="text-6xl">🔥</span>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">RICER إفران</h2>
            <p className="mt-2 text-sm text-gray-600">
              نظام إدارة حرائق الغابات
            </p>
          </div>

          <SignInForm />

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ليس لديك حساب؟{' '}
              <Link href="/signup" className="font-medium text-primary-600 hover:text-primary-500">
                إنشاء حساب جديد
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
