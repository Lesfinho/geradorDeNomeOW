export default function PoolStats({ stats }) {
  if (!stats) return null;

  return (
    <div className="bg-gray-900/80 backdrop-blur p-4 rounded-lg border border-gray-700 text-center">
      <p className="text-gray-300">
        <span className="text-2xl font-bold text-blue-400">{stats.available}</span>
        <span className="text-sm"> nomes disponíveis</span>
      </p>
    </div>
  );
}
