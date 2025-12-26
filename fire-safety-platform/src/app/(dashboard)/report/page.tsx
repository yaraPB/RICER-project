import ReportForm from '@/components/reports/ReportForm';

export default function ReportPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2 text-right">الإبلاغ عن حريق</h1>
      <p className="text-gray-600 mb-6 text-right">
        املأ النموذج أدناه للإبلاغ عن حريق
      </p>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <ReportForm />
      </div>
    </div>
  );
}
