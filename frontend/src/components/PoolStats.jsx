export default function PoolStats({ stats }) {
  if (!stats) return null;

  return (
    <div className="glass-card-sm p-3 text-center">
      <p className="text-white/60 text-sm">
        <span className="text-2xl font-bold text-amber-400">{stats.available}</span>
        <span className="ml-1 text-xs">disponiveis</span>
      </p>
    </div>
  );
}
