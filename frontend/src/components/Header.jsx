export default function Header({ user, onLogout }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-gray-900/80 backdrop-blur">
      <h1 className="text-xl font-bold text-white">ResenhaGenerator</h1>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">
          Logado como <strong className="text-white">{user.username}</strong>
        </span>
        <button
          onClick={onLogout}
          className="text-sm text-red-400 hover:text-red-300 cursor-pointer"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
