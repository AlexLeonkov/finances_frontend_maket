import { useMemo, useState } from 'react';

import { materialsCatalog, type MaterialItem } from '../data/materialsCatalog';
import { formatEUR } from '../../../shared/lib/format';

type MaterialLine = {
  id: string;
  material: MaterialItem;
  quantity: number;
};

type AddOperationModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const createLine = (material: MaterialItem): MaterialLine => ({
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
  const [selectedMaterial, setSelectedMaterial] = useState(materialsCatalog[0]);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [lines, setLines] = useState<MaterialLine[]>([]);

  const materialsTotal = useMemo(
    () =>
      lines.reduce(
        (sum, line) => sum + line.quantity * line.material.priceEUR,
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

            <div className="grid grid-cols-1 md:grid-cols-[1fr_120px_120px_120px] gap-3">
              <select
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={selectedMaterial?.name ?? ''}
                onChange={(event) => {
                  const found = materialsCatalog.find(
                    (item) => item.name === event.target.value
                  );
                  if (found) {
                    setSelectedMaterial(found);
                  }
                }}
              >
                {materialsCatalog.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.name} · {formatEUR(item.priceEUR)}/{item.unit}
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
                  ? `${formatEUR(selectedMaterial.priceEUR)}/${selectedMaterial.unit}`
                  : '—'}
              </div>
            </div>

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
                      {formatEUR(line.material.priceEUR)}/{line.material.unit}
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
                      {formatEUR(line.quantity * line.material.priceEUR)}
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
