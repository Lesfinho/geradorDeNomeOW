export default function PoolStats({ stats }) {
  if (!stats) return null;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md text-center">
      <p className="text-gray-600">
        <span className="text-2xl font-bold text-blue-600">{stats.available}</span>
        <span className="text-sm"> nomes disponíveis</span>
      </p>
    </div>
  );
}
