export default function Header({ user, onLogout }) {
  return (
    <header className="glass-card-sm px-5 py-3 flex items-center justify-between">
      <h1 className="text-lg font-bold text-white tracking-tight">Resenha Ow</h1>
      <div className="flex items-center gap-3">
        <span className="text-xs text-white/50">
          <strong className="text-white/80">{user.username}</strong>
        </span>
        <button
          onClick={onLogout}
          className="text-xs text-amber-400/70 hover:text-amber-400 cursor-pointer transition-colors"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
