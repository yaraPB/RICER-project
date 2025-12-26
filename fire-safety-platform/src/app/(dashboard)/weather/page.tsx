import WeatherDisplay from '@/components/weather/WeatherDisplay';

export default function WeatherPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6 text-right">معلومات الطقس</h1>
      <WeatherDisplay />
    </div>
  );
}
