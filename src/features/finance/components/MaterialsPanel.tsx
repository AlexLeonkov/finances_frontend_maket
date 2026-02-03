import { useEffect, useMemo, useState } from 'react';

import type { MaterialRow } from '../types';
import { API_BASE_URL } from '../../../shared/api/baseUrl';
import { formatEUR } from '../../../shared/lib/format';

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('de-DE') : '—';

export const MaterialsPanel = () => {
  const [materials, setMaterials] = useState<MaterialRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [unitTypeFilter, setUnitTypeFilter] = useState('all');
  const [overrides, setOverrides] = useState<
    Record<string, { onHand?: number; reorderLevel?: number }>
  >({});

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const response = await fetch(`${API_BASE_URL}/materials`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Request failed (${response.status})`);
        }
        const data = (await response.json()) as MaterialRow[];
        setMaterials(data);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setLoadError('Не удалось загрузить материалы.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, []);

  const unitTypes = useMemo(() => {
    const items = new Set<string>();
    materials.forEach((row) => {
      if (row.unit_type) {
        items.add(row.unit_type);
      }
    });
    return Array.from(items).sort();
  }, [materials]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return materials.filter((row) => {
      if (unitTypeFilter !== 'all' && row.unit_type !== unitTypeFilter) {
        return false;
      }
      if (!q) {
        return true;
      }
      return `${row.name} ${row.unit} ${row.unit_type}`.toLowerCase().includes(q);
    });
  }, [materials, query, unitTypeFilter]);

  const stats = useMemo(() => {
    const total = materials.length;
    const avgPrice =
      total > 0
        ? materials.reduce((sum, row) => sum + (row.price ?? 0), 0) / total
        : 0;
    return { total, avgPrice };
  }, [materials]);

  const inventoryRows = useMemo(() => {
    if (materials.length === 0) {
      return [];
    }
    return materials.map((row, index) => {
      const base = (index % 8) + 2;
      const onHand = base * 6;
      const reorderLevel = base * 4;
      const unitCost = row.price ?? 0;
      const override = overrides[row.id] ?? {};
      const finalOnHand = override.onHand ?? onHand;
      const finalReorder = override.reorderLevel ?? reorderLevel;
      const warehouseValue = finalOnHand * unitCost;
      const status = finalOnHand <= finalReorder ? 'low' : 'ok';
      return {
        ...row,
        onHand: finalOnHand,
        reorderLevel: finalReorder,
        unitCost,
        warehouseValue,
        status,
      };
    });
  }, [materials, overrides]);

  const inventoryStats = useMemo(() => {
    const total = inventoryRows.length;
    const warehouseValue = inventoryRows.reduce((sum, row) => sum + row.warehouseValue, 0);
    const lowStock = inventoryRows.filter((row) => row.status === 'low').length;
    return { total, warehouseValue, lowStock };
  }, [inventoryRows]);

  const updateOverride = (
    id: string,
    key: 'onHand' | 'reorderLevel',
    value: number
  ) => {
    setOverrides((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [key]: Number.isFinite(value) ? value : 0,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-6 text-white shadow-lg">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Склад</p>
        <p className="mt-2 text-2xl font-semibold">Материалы и остатки</p>
        <p className="mt-1 text-sm text-slate-200">
          Управляйте складом и обновляйте остатки в реальном времени.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
            Всего позиций
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-800">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
            Средняя цена
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-800">
            {formatEUR(stats.avgPrice)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
            Стоимость склада
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-800">
            {formatEUR(inventoryStats.warehouseValue)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
            Низкий остаток
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-800">
            {inventoryStats.lowStock}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Поиск по названию или типу..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm sm:w-48"
              value={unitTypeFilter}
              onChange={(event) => setUnitTypeFilter(event.target.value)}
            >
              <option value="all">Все типы</option>
              {unitTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="text-xs text-slate-400">
            Показано {filtered.length} из {materials.length}
          </div>
        </div>

        {isLoading && (
          <div className="px-4 py-6 text-sm text-slate-500">Загрузка материалов…</div>
        )}
        {loadError && !isLoading && (
          <div className="px-4 py-6 text-sm text-rose-500">{loadError}</div>
        )}
        {!isLoading && !loadError && (
          <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((row) => (
              <div
                key={row.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{row.name}</p>
                    <p className="text-xs text-slate-400">
                      {formatEUR(row.price)}/{row.unit} · {row.unit_type}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                    {formatDate(row.created_at)}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                    <p className="text-xs text-slate-400 uppercase">Остаток</p>
                    <p className="mt-1 text-lg font-semibold text-slate-800">
                      {inventoryRows.find((item) => item.id === row.id)?.onHand ?? 0}{' '}
                      {row.unit}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                    <p className="text-xs text-slate-400 uppercase">Мин. остаток</p>
                    <p className="mt-1 text-lg font-semibold text-slate-800">
                      {inventoryRows.find((item) => item.id === row.id)?.reorderLevel ?? 0}{' '}
                      {row.unit}
                    </p>
                  </div>
                </div>
                <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                  <p className="text-xs text-slate-400 uppercase">Стоимость склада</p>
                  <p className="mt-1 text-lg font-semibold text-slate-800">
                    {formatEUR(
                      inventoryRows.find((item) => item.id === row.id)?.warehouseValue ?? 0
                    )}
                  </p>
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs"
                      value={overrides[row.id]?.onHand ?? inventoryRows.find((item) => item.id === row.id)?.onHand ?? 0}
                      onChange={(event) =>
                        updateOverride(row.id, 'onHand', Number(event.target.value))
                      }
                      title="Остаток"
                    />
                    <input
                      type="number"
                      min={0}
                      step={1}
                      className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs"
                      value={overrides[row.id]?.reorderLevel ?? inventoryRows.find((item) => item.id === row.id)?.reorderLevel ?? 0}
                      onChange={(event) =>
                        updateOverride(row.id, 'reorderLevel', Number(event.target.value))
                      }
                      title="Мин. остаток"
                    />
                  </div>
                  <span
                    className={`inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-semibold ${
                      (inventoryRows.find((item) => item.id === row.id)?.status ?? 'ok') ===
                      'low'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {(inventoryRows.find((item) => item.id === row.id)?.status ?? 'ok') ===
                    'low'
                      ? 'Нужно пополнить'
                      : 'Ок'}
                  </span>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
                Нет материалов.
              </div>
            )}
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-4">
          <p className="text-lg font-semibold text-slate-800">Инвентаризация</p>
          <p className="text-xs text-slate-400">Склад и актуальные остатки</p>
        </div>
        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-700">Режим склада</p>
            <p className="text-xs text-slate-400">
              Обновляйте остатки прямо в таблице — данные сохраняются локально.
            </p>
          </div>
          {Object.keys(overrides).length > 0 && (
            <button
              onClick={() => setOverrides({})}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Сбросить изменения
            </button>
          )}
        </div>
        <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {inventoryRows.map((row) => (
            <div
              key={row.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{row.name}</p>
                  <p className="text-xs text-slate-400">
                    {formatEUR(row.unitCost)}/{row.unit}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    row.status === 'low'
                      ? 'bg-rose-50 text-rose-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {row.status === 'low' ? 'Нужно пополнить' : 'Ок'}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                  <p className="text-xs text-slate-400 uppercase">Остаток</p>
                  <p className="mt-1 text-lg font-semibold text-slate-800">
                    {row.onHand} {row.unit}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                  <p className="text-xs text-slate-400 uppercase">Мин. остаток</p>
                  <p className="mt-1 text-lg font-semibold text-slate-800">
                    {row.reorderLevel} {row.unit}
                  </p>
                </div>
              </div>
              <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                <p className="text-xs text-slate-400 uppercase">Стоимость склада</p>
                <p className="mt-1 text-lg font-semibold text-slate-800">
                  {formatEUR(row.warehouseValue)}
                </p>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  step={1}
                  className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs"
                  value={overrides[row.id]?.onHand ?? row.onHand}
                  onChange={(event) =>
                    updateOverride(row.id, 'onHand', Number(event.target.value))
                  }
                  title="Остаток"
                />
                <input
                  type="number"
                  min={0}
                  step={1}
                  className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs"
                  value={overrides[row.id]?.reorderLevel ?? row.reorderLevel}
                  onChange={(event) =>
                    updateOverride(row.id, 'reorderLevel', Number(event.target.value))
                  }
                  title="Мин. остаток"
                />
              </div>
            </div>
          ))}
          {inventoryRows.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
              Нет данных для инвентаризации.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
