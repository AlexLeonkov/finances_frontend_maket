import { useMemo, useState } from 'react';

import type { Attachment, PvCase, PvExtractedData } from '../types';
import { NETZBETREIBER_LABELS, PV_STATUS_LABELS } from '../constants';
import { getMissingRequiredItems } from '../store/usePvIntakeStore';
import { PvStatusBadge } from './PvStatusBadge';

type PvCaseDetailsProps = {
  pvCase: PvCase;
  aiRunning: boolean;
  onRunAi: () => void;
  onUpdateExtracted: (patch: Partial<PvExtractedData>) => void;
  onUpdateCase: (patch: Partial<PvCase>) => void;
  onToggleChecklist: (itemId: string) => void;
};

type TabKey =
  | 'whatsapp'
  | 'extract'
  | 'review'
  | 'preReg'
  | 'final';

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

const AttachmentCard = ({ attachment }: { attachment: Attachment }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-3">
    <div className="flex items-center justify-between text-xs text-slate-500">
      <span>{attachment.senderName}</span>
      <span>{formatDateTime(attachment.takenAt)}</span>
    </div>
    <div className="mt-2">
      {attachment.type === 'image' && attachment.url && (
        <img
          src={attachment.url}
          alt="attachment"
          className="h-40 w-full rounded-lg object-cover"
        />
      )}
      {attachment.type === 'voice' && (
        <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
          Voice note: {attachment.transcript ?? 'Transcript pending'}
        </div>
      )}
      {attachment.type === 'text' && (
        <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
          {attachment.text}
        </div>
      )}
    </div>
    <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
      <span>{attachment.classification ?? 'unclassified'}</span>
      {attachment.extracted?.confidence !== undefined && (
        <span>{Math.round(attachment.extracted.confidence * 100)}% conf</span>
      )}
    </div>
  </div>
);

export const PvCaseDetails = ({
  pvCase,
  aiRunning,
  onRunAi,
  onUpdateExtracted,
  onUpdateCase,
  onToggleChecklist,
}: PvCaseDetailsProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>('whatsapp');
  const [showRaw, setShowRaw] = useState(false);

  const missingRequired = useMemo(() => getMissingRequiredItems(pvCase), [pvCase]);
  const canMoveToPreReg = missingRequired.length === 0;

  const currentImport = pvCase.extractedData.meterReadings?.find(
    (reading) => reading.kind === 'import'
  );
  const currentExport = pvCase.extractedData.meterReadings?.find(
    (reading) => reading.kind === 'export'
  );
  const moduleBase = pvCase.extractedData.pv.module ?? {
    brand: 'Trina',
    model: 'Vertex S',
    watt: 0,
    count: 0,
  };

  const handleMeterReadingChange = (kind: 'import' | 'export', value: number | null) => {
    const existing = pvCase.extractedData.meterReadings ?? [];
    const other = existing.filter((reading) => reading.kind !== kind);
    const updated = value
      ? [
          ...other,
          {
            kind,
            valueKwh: value,
            takenAt: new Date().toISOString(),
          },
        ]
      : other;
    onUpdateExtracted({ meterReadings: updated });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-slate-800">{pvCase.customerName}</h2>
            <PvStatusBadge status={pvCase.status} />
          </div>
          <p className="text-sm text-slate-500">{pvCase.address}</p>
          <p className="text-xs text-slate-400">
            {NETZBETREIBER_LABELS[pvCase.netzbetreiber]} · Updated {formatDateTime(pvCase.updatedAt)}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>{pvCase.messages.length} attachments</span>
          <span>{missingRequired.length} missing required</span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {([
          { key: 'whatsapp', label: 'WhatsApp Feed' },
          { key: 'extract', label: 'AI Extract' },
          { key: 'review', label: 'Review & Missing Data' },
          { key: 'preReg', label: 'Voranmeldung + MaStR' },
          { key: 'final', label: 'Fertigmeldung' },
        ] as Array<{ key: TabKey; label: string }>).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              activeTab === tab.key
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'whatsapp' && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              Status: <span className="font-semibold">{PV_STATUS_LABELS[pvCase.status]}</span>
            </p>
            <button
              onClick={onRunAi}
              disabled={aiRunning}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                aiRunning
                  ? 'bg-slate-200 text-slate-500 cursor-wait'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {aiRunning ? 'Running AI...' : 'Run AI Structuring'}
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pvCase.messages.map((attachment) => (
              <AttachmentCard key={attachment.id} attachment={attachment} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'extract' && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Extracted summary</h3>
            <button
              onClick={() => setShowRaw((prev) => !prev)}
              className="text-xs font-semibold text-indigo-600"
            >
              {showRaw ? 'Hide raw JSON' : 'Show raw JSON'}
            </button>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p>Meter number: {pvCase.extractedData.meterNumber ?? '—'}</p>
            <p>Generator kWp: {pvCase.extractedData.pv.generatorKwp ?? '—'}</p>
            <p>Inverter: {pvCase.extractedData.pv.inverter?.model ?? '—'}</p>
            <p>Storage: {pvCase.extractedData.pv.storage?.model ?? '—'}</p>
            <p>Operator: {pvCase.extractedData.operator.name ?? '—'}</p>
          </div>
          {showRaw && (
            <pre className="rounded-xl bg-slate-900 text-slate-100 p-4 text-xs overflow-auto">
              {JSON.stringify(pvCase.extractedData, null, 2)}
            </pre>
          )}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Attachment classification
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              {pvCase.messages.map((attachment) => (
                <div key={attachment.id} className="rounded-lg border border-slate-200 p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">{attachment.type}</span>
                    <span className="text-slate-500">
                      {attachment.classification ?? 'unclassified'}
                    </span>
                  </div>
                  <p className="text-slate-400">{formatDateTime(attachment.takenAt)}</p>
                  {attachment.extracted?.confidence !== undefined && (
                    <p className="text-slate-500">
                      Confidence: {Math.round(attachment.extracted.confidence * 100)}%
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'review' && (
        <div className="mt-6 space-y-6">
          {missingRequired.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
              Missing required: {missingRequired.join(', ')}
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-600">
              Operator name
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={pvCase.extractedData.operator.name ?? ''}
                onChange={(event) =>
                  onUpdateExtracted({ operator: { name: event.target.value } })
                }
              />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Operator email
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={pvCase.extractedData.operator.email ?? ''}
                onChange={(event) =>
                  onUpdateExtracted({ operator: { email: event.target.value } })
                }
              />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Operator phone
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={pvCase.extractedData.operator.phone ?? ''}
                onChange={(event) =>
                  onUpdateExtracted({ operator: { phone: event.target.value } })
                }
              />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Meter number
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={pvCase.extractedData.meterNumber ?? ''}
                onChange={(event) =>
                  onUpdateExtracted({ meterNumber: event.target.value })
                }
              />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Import meter reading (kWh)
              <input
                type="number"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={currentImport?.valueKwh ?? ''}
                onChange={(event) =>
                  handleMeterReadingChange(
                    'import',
                    event.target.value ? Number(event.target.value) : null
                  )
                }
              />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Export meter reading (kWh)
              <input
                type="number"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={currentExport?.valueKwh ?? ''}
                onChange={(event) =>
                  handleMeterReadingChange(
                    'export',
                    event.target.value ? Number(event.target.value) : null
                  )
                }
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-600">
              Generator kWp
              <input
                type="number"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={pvCase.extractedData.pv.generatorKwp ?? ''}
                onChange={(event) =>
                  onUpdateExtracted({
                    pv: { generatorKwp: event.target.value ? Number(event.target.value) : null },
                  })
                }
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm font-medium text-slate-600">
                Module watt
                <input
                  type="number"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  value={pvCase.extractedData.pv.module?.watt ?? ''}
                  onChange={(event) =>
                    onUpdateExtracted({
                      pv: {
                        module: {
                          ...moduleBase,
                          watt: event.target.value ? Number(event.target.value) : 0,
                        },
                      },
                    })
                  }
                />
              </label>
              <label className="text-sm font-medium text-slate-600">
                Module count
                <input
                  type="number"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  value={pvCase.extractedData.pv.module?.count ?? ''}
                  onChange={(event) =>
                    onUpdateExtracted({
                      pv: {
                        module: {
                          ...moduleBase,
                          count: event.target.value ? Number(event.target.value) : 0,
                        },
                      },
                    })
                  }
                />
              </label>
            </div>
            <label className="text-sm font-medium text-slate-600">
              Inverter model
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={pvCase.extractedData.pv.inverter?.model ?? ''}
                onChange={(event) =>
                  onUpdateExtracted({
                    pv: {
                      inverter: {
                        brand: 'FoxESS',
                        model: event.target.value,
                        powerKw: pvCase.extractedData.pv.inverter?.powerKw ?? 0,
                        serialNumber: pvCase.extractedData.pv.inverter?.serialNumber ?? '',
                      },
                    },
                  })
                }
              />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Inverter serial
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={pvCase.extractedData.pv.inverter?.serialNumber ?? ''}
                onChange={(event) =>
                  onUpdateExtracted({
                    pv: {
                      inverter: {
                        brand: 'FoxESS',
                        model: pvCase.extractedData.pv.inverter?.model ?? '',
                        powerKw: pvCase.extractedData.pv.inverter?.powerKw ?? 0,
                        serialNumber: event.target.value,
                      },
                    },
                  })
                }
              />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Storage model
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={pvCase.extractedData.pv.storage?.model ?? ''}
                onChange={(event) =>
                  onUpdateExtracted({
                    pv: {
                      storage: {
                        brand: 'FoxESS',
                        model: event.target.value,
                        capacityKwh: pvCase.extractedData.pv.storage?.capacityKwh ?? 0,
                        serialNumber: pvCase.extractedData.pv.storage?.serialNumber ?? '',
                      },
                    },
                  })
                }
              />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Storage serial
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={pvCase.extractedData.pv.storage?.serialNumber ?? ''}
                onChange={(event) =>
                  onUpdateExtracted({
                    pv: {
                      storage: {
                        brand: 'FoxESS',
                        model: pvCase.extractedData.pv.storage?.model ?? '',
                        capacityKwh: pvCase.extractedData.pv.storage?.capacityKwh ?? 0,
                        serialNumber: event.target.value,
                      },
                    },
                  })
                }
              />
            </label>
          </div>
        </div>
      )}

      {activeTab === 'preReg' && (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-800 mb-2">Portal summary</p>
            <p>Operator: {pvCase.extractedData.operator.name ?? '—'}</p>
            <p>Address: {pvCase.address}</p>
            <p>Inverter: {pvCase.extractedData.pv.inverter?.model ?? '—'}</p>
            <p>Serial: {pvCase.extractedData.pv.inverter?.serialNumber ?? '—'}</p>
            <p>Generator kWp: {pvCase.extractedData.pv.generatorKwp ?? '—'}</p>
            <p>Meter number: {pvCase.extractedData.meterNumber ?? '—'}</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-800 mb-2">MaStR checklist</p>
            <ul className="space-y-2">
              {pvCase.checklist.map((item) => (
                <li key={item.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => onToggleChecklist(item.id)}
                  />
                  <span>{item.title}</span>
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={() => onUpdateCase({ status: 'final_notification' })}
            disabled={!canMoveToPreReg}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              canMoveToPreReg
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-slate-200 text-slate-500 cursor-not-allowed'
            }`}
          >
            Mark Pre-reg + MaStR Done
          </button>
        </div>
      )}

      {activeTab === 'final' && (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-slate-200 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-800 mb-2">Final steps</p>
            <ul className="space-y-2">
              {pvCase.checklist.map((item) => (
                <li key={item.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => onToggleChecklist(item.id)}
                  />
                  <span>{item.title}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-800 mb-2">Documents</p>
            <p>Pre-reg: {pvCase.documents.preReg?.length ?? 0}</p>
            <p>MaStR: {pvCase.documents.mastr?.length ?? 0}</p>
            <p>Final: {pvCase.documents.final?.length ?? 0}</p>
          </div>
          <button
            onClick={() => onUpdateCase({ status: 'closed' })}
            className="rounded-lg px-4 py-2 text-sm font-semibold bg-slate-800 text-white hover:bg-slate-900"
          >
            Close Case
          </button>
        </div>
      )}
    </div>
  );
};
