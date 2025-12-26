import ReportsList from '@/components/reports/ReportsList';

export default function ReportsListPage() {
  return (
    <div>
      <div className="mb-6 text-right">
        <h1 className="text-3xl font-bold text-gray-900">قائمة التقارير</h1>
        <p className="text-gray-600 mt-2">
          جميع التقارير المقدمة من المواطنين
        </p>
      </div>

      <ReportsList />
    </div>
  );
}
