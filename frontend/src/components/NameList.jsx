import { useMemo, useState, useEffect } from 'react';
import { getAllNames } from '../api';

const COL_SIZE = 12;
const COL_COUNT = 3;
const PAGE_SIZE = COL_SIZE * COL_COUNT;
const MOCK_MODE = import.meta.env.VITE_MOCK_NAMES === '1';

function makeMockNames() {
  const users = ['BoboEsponja', 'Hori', 'Wattoz', 'foda3e4', 'LesfHitscanGap'];
  const base = [
    'pimba', 'labubu', 'bobbygoods', 'Alungsadhu', 'Diddykirkado', 'Tungvon',
    'FadeTungTung', 'Ooooomfght', 'Boboboryahu', 'Lestrogen', 'Mvttrogen', 'kingvon',
    'charliekirk', 'macacodardo', 'Didder69', 'Macakirk', 'Kirkatrogen', 'aluizobeso',
    'Kirkadhu', 'Boykirk', 'von', 'Netanho', 'Wfapyaoi', 'Tungsadhu'
  ];

  return Array.from({ length: 84 }, (_, i) => {
    const name = `${base[i % base.length]}${i >= base.length ? i : ''}`;
    const isUsed = i % 7 === 0;
    return {
      id: i + 1,
      name,
      isUsed,
      addedBy: users[i % users.length],
      drawnBy: isUsed ? users[(i + 2) % users.length] : null,
    };
  });
}

export default function NameList({ refreshKey }) {
  const [names, setNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (MOCK_MODE) {
      setNames(makeMockNames());
      setLoading(false);
      return;
    }

    setLoading(true);
    getAllNames()
      .then(setNames)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return names;
    return names.filter((entry) => {
      const byName = entry.name?.toLowerCase().includes(q);
      const byUser = entry.addedBy?.toLowerCase().includes(q);
      return byName || byUser;
    });
  }, [names, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const col1 = pageItems.slice(0, COL_SIZE);
  const col2 = pageItems.slice(COL_SIZE, COL_SIZE * 2);
  const col3 = pageItems.slice(COL_SIZE * 2, COL_SIZE * 3);

  const renderTable = (items, title) => (
    <div className="rounded-2xl border border-white/10 bg-black/15 overflow-hidden">
      <div className="px-3 py-2 bg-white/5 border-b border-white/10">
        <p className="text-xs uppercase tracking-wider text-white/60">{title}</p>
      </div>
      <div className="max-h-[560px] overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-white/30 text-sm p-4">Sem nomes nesta coluna.</p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {items.map((entry) => (
                <tr key={entry.id} className="border-b border-white/5 last:border-b-0">
                  <td className="px-3 py-2 align-top">
                    <p className={entry.isUsed ? 'line-through text-white/35' : 'text-white'}>{entry.name}</p>
                    <p className="text-[11px] text-white/35">por {entry.addedBy}</p>
                    {entry.isUsed && (
                      <p className="text-[11px] text-amber-300/70">retirado por {entry.drawnBy}</p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  if (loading) return <p className="text-white/40 text-center text-sm">Carregando...</p>;

  if (names.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-white/30">Nenhum nome adicionado ainda.</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Todos os Nomes</h2>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar nome ou usuario..."
          className="w-full md:w-80 rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-amber-300/40"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {renderTable(col1, 'Esquerda (1-12)')}
        {renderTable(col2, 'Centro (13-24)')}
        {renderTable(col3, 'Direita (25-36)')}
      </div>

      <div className="flex items-center justify-between mt-4">
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="pill-btn pill-btn-glass px-3 py-2 text-sm disabled:opacity-40"
        >
          Anterior
        </button>
        <p className="text-xs text-white/60">
          Pagina {page} de {totalPages} • {filtered.length} resultado(s)
        </p>
        <button
          type="button"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="pill-btn pill-btn-glass px-3 py-2 text-sm disabled:opacity-40"
        >
          Proxima
        </button>
      </div>
    </div>
  );
}
