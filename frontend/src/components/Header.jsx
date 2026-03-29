export default function Header({ user, onLogout }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
      <h1 className="text-xl font-bold text-gray-800">ResenhaGenerator</h1>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">
          Logado como <strong className="text-gray-800">{user.username}</strong>
        </span>
        <button
          onClick={onLogout}
          className="text-sm text-red-500 hover:text-red-700 cursor-pointer"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
