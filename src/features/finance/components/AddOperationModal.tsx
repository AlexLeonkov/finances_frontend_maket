import { useEffect, useMemo, useState } from 'react';

import type { MaterialRow } from '../types';
import { formatEUR } from '../../../shared/lib/format';
import { API_BASE_URL } from '../../../shared/api/baseUrl';

type MaterialLine = {
  id: string;
  material: MaterialRow;
  quantity: number;
  isCustom?: boolean;
};

type AddOperationModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const createLine = (material: MaterialRow): MaterialLine => ({
  id: `line-${Math.random().toString(16).slice(2)}`,
  material,
  quantity: 1,
});

export const AddOperationModal = ({ isOpen, onClose }: AddOperationModalProps) => {
  const [operationName, setOperationName] = useState('');
  const [operationDate, setOperationDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [operationType, setOperationType] = useState<'expense' | 'income'>('expense');
  const [notes, setNotes] = useState('');
  const [materials, setMaterials] = useState<MaterialRow[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [materialsError, setMaterialsError] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialRow | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [lines, setLines] = useState<MaterialLine[]>([]);
  const [activeTab, setActiveTab] = useState<'catalog' | 'custom'>('catalog');
  const [customName, setCustomName] = useState('');
  const [customUnit, setCustomUnit] = useState('шт');
  const [customUnitType, setCustomUnitType] = useState('item');
  const [customPrice, setCustomPrice] = useState(0);
  const [customQuantity, setCustomQuantity] = useState(1);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const controller = new AbortController();
    const load = async () => {
      try {
        setMaterialsLoading(true);
        setMaterialsError(null);
        const response = await fetch(`${API_BASE_URL}/materials`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Request failed (${response.status})`);
        }
        const data = (await response.json()) as MaterialRow[];
        setMaterials(data);
        setSelectedMaterial((prev) => prev ?? data[0] ?? null);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setMaterialsError('Не удалось загрузить материалы.');
        }
      } finally {
        setMaterialsLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [isOpen]);

  const materialsTotal = useMemo(
    () =>
      lines.reduce(
        (sum, line) => sum + line.quantity * line.material.price,
        0
      ),
    [lines]
  );

  if (!isOpen) {
    return null;
  }

  const addLine = () => {
    if (!selectedMaterial) {
      return;
    }
    setLines((prev) => [
      ...prev,
      { ...createLine(selectedMaterial), quantity: Math.max(0, selectedQuantity) },
    ]);
  };

  const addCustomLine = () => {
    if (!customName.trim()) {
      return;
    }
    const material: MaterialRow = {
      id: `custom-${Math.random().toString(16).slice(2)}`,
      name: customName.trim(),
      price: customPrice,
      unit: customUnit.trim() || 'шт',
      unit_type: customUnitType.trim() || 'item',
    };
    setLines((prev) => [
      ...prev,
      {
        id: `line-${Math.random().toString(16).slice(2)}`,
        material,
        quantity: Math.max(0, customQuantity),
        isCustom: true,
      },
    ]);
    setCustomName('');
    setCustomPrice(0);
    setCustomQuantity(1);
  };

  const updateLine = (id: string, quantity: number) => {
    setLines((prev) =>
      prev.map((line) =>
        line.id === id
          ? { ...line, quantity: Number.isFinite(quantity) ? quantity : 0 }
          : line
      )
    );
  };

  const removeLine = (id: string) => {
    setLines((prev) => prev.filter((line) => line.id !== id));
  };

  const resetForm = () => {
    setOperationName('');
    setOperationDate(new Date().toISOString().slice(0, 10));
    setOperationType('expense');
    setNotes('');
    setSelectedQuantity(1);
    setLines([]);
    setActiveTab('catalog');
    setCustomName('');
    setCustomUnit('шт');
    setCustomUnitType('item');
    setCustomPrice(0);
    setCustomQuantity(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative mx-4 w-full max-w-3xl rounded-2xl bg-white shadow-xl">
        <div className="border-b border-slate-200 p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
            Новая операция
          </p>
          <h2 className="text-lg font-semibold text-slate-800">Добавить операцию</h2>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-5 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="text-sm font-medium text-slate-600">
              Название
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={operationName}
                onChange={(event) => setOperationName(event.target.value)}
              />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Дата
              <input
                type="date"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={operationDate}
                onChange={(event) => setOperationDate(event.target.value)}
              />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Тип
              <select
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={operationType}
                onChange={(event) =>
                  setOperationType(event.target.value as 'expense' | 'income')
                }
              >
                <option value="expense">Расход</option>
                <option value="income">Доход</option>
              </select>
            </label>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">Материалы</p>
                <p className="text-xs text-slate-400">
                  Выберите материал, количество и получите сумму.
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Итого материалов</p>
                <p className="text-lg font-semibold text-slate-800">
                  {formatEUR(materialsTotal)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab('catalog')}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                  activeTab === 'catalog'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                Каталог
              </button>
              <button
                onClick={() => setActiveTab('custom')}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                  activeTab === 'custom'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                Своя позиция
              </button>
            </div>

            {activeTab === 'catalog' ? (
              <div className="grid grid-cols-1 md:grid-cols-[1fr_120px_120px_120px] gap-3">
                <select
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={selectedMaterial?.id ?? ''}
                  onChange={(event) => {
                    const found = materials.find((item) => item.id === event.target.value);
                    if (found) {
                      setSelectedMaterial(found);
                    }
                  }}
                  disabled={materialsLoading || materials.length === 0}
                >
                  {materials.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} · {formatEUR(item.price)}/{item.unit}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={selectedQuantity}
                  onChange={(event) => setSelectedQuantity(Number(event.target.value))}
                />
                <button
                  onClick={addLine}
                  className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Добавить
                </button>
                <div className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500">
                  {selectedMaterial
                    ? `${formatEUR(selectedMaterial.price)}/${selectedMaterial.unit}`
                    : '—'}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-[1fr_120px_120px_120px] gap-3">
                <input
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Название"
                  value={customName}
                  onChange={(event) => setCustomName(event.target.value)}
                />
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Цена"
                  value={customPrice}
                  onChange={(event) => setCustomPrice(Number(event.target.value))}
                />
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Кол-во"
                  value={customQuantity}
                  onChange={(event) => setCustomQuantity(Number(event.target.value))}
                />
                <button
                  onClick={addCustomLine}
                  className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Добавить
                </button>
                <div className="grid grid-cols-2 gap-2 md:col-span-2">
                  <input
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Ед."
                    value={customUnit}
                    onChange={(event) => setCustomUnit(event.target.value)}
                  />
                  <input
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Тип"
                    value={customUnitType}
                    onChange={(event) => setCustomUnitType(event.target.value)}
                  />
                </div>
              </div>
            )}

            {materialsLoading && (
              <p className="text-xs text-slate-400">Загрузка материалов…</p>
            )}
            {materialsError && (
              <p className="text-xs text-rose-500">{materialsError}</p>
            )}

            <div className="space-y-2">
              {lines.map((line) => (
                <div
                  key={line.id}
                  className="flex flex-col gap-2 rounded-lg border border-slate-100 bg-white px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      {line.material.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatEUR(line.material.price)}/{line.material.unit} · {line.material.unit_type}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-sm"
                      value={line.quantity}
                      onChange={(event) => updateLine(line.id, Number(event.target.value))}
                    />
                    <span className="text-sm text-slate-600">
                      {formatEUR(line.quantity * line.material.price)}
                    </span>
                    <button
                      onClick={() => removeLine(line.id)}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
              {lines.length === 0 && (
                <p className="text-xs text-slate-400">Материалы не добавлены.</p>
              )}
            </div>
          </div>

          <label className="text-sm font-medium text-slate-600 block">
            Комментарий
            <textarea
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </label>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 sm:w-auto"
          >
            Отмена
          </button>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <p className="text-sm text-slate-500">
              Итого материалов: <span className="font-semibold">{formatEUR(materialsTotal)}</span>
            </p>
            <button
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 sm:w-auto"
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
