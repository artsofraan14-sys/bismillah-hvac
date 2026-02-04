import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DepthCard } from "../components/DepthUI";
import type { ACRecord, AcHistoryEntry } from "../types";

type PublicDetailResponse = {
  record?: ACRecord;
  history?: AcHistoryEntry[];
  error?: string;
};

export function GuestMaintenancePage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [record, setRecord] = useState<ACRecord | null>(null);
  const [history, setHistory] = useState<AcHistoryEntry[]>([]);

  useEffect(() => {
    if (!id) {
      setError("ID AC tidak valid");
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/public/ac/${id}`);
        const payload = (await response.json()) as PublicDetailResponse;
        if (!response.ok) {
          throw new Error(payload.error || `Gagal memuat detail (${response.status})`);
        }
        setRecord(payload.record ?? null);
        setHistory(payload.history ?? []);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Gagal memuat detail AC");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  return (
    <div className="depthui-shell min-h-screen px-4 py-6 text-(--depthui-text) sm:py-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <DepthCard className="rounded-4xl p-6">
          <div className="flex items-center gap-3">
            <img className="h-9" src="/logo.png" alt="App Logo" />
            <div>
              <p className="text-xs uppercase text-(--depthui-muted)">Guest View</p>
              <h1 className="text-xl font-semibold text-[#1f1f1f]">Detail Unit AC</h1>
            </div>
          </div>
          {loading && <p className="mt-4 text-sm text-(--depthui-muted)">Memuat detail AC...</p>}
          {error && <p className="mt-4 text-sm text-rose-500">{error}</p>}
        </DepthCard>

        {!loading && record && (
          <>
            <DepthCard className="space-y-3 rounded-4xl p-6 text-sm text-[#3f3f3f]">
              <p className="text-xs uppercase text-(--depthui-muted)">Identitas Unit</p>
              <p className="text-lg font-semibold text-[#1f1f1f]">{record.assetCode}</p>
              <p>ID AC: {record.id}</p>
              <p>Lokasi: {record.location}</p>
              <p>Site ID: {record.siteId}</p>
              <p>Merek: {record.brand}</p>
              <p>Sheet: {record.sheetName ?? "-"}</p>
              <p>Source Row: {record.sourceRowRef ?? "-"}</p>
            </DepthCard>

            <DepthCard className="space-y-2 rounded-4xl p-6 text-sm text-[#3f3f3f]">
              <p className="text-xs uppercase text-(--depthui-muted)">Status & Service</p>
              <p>Kondisi Terakhir: {record.lastCondition}</p>
              <p>Teknisi: {record.technician}</p>
              <p>
                Service Terakhir:{" "}
                {record.lastServiceAt ? new Date(record.lastServiceAt).toLocaleString("id-ID") : "-"}
              </p>
              <p>
                Jadwal Berikut:{" "}
                {record.nextScheduleAt ? new Date(record.nextScheduleAt).toLocaleString("id-ID") : "-"}
              </p>
              <p>Tekanan Freon: {record.freonPressure ?? "-"}</p>
              <p>Suhu Keluar: {record.outletTemp ?? "-"}</p>
              <p>Ampere Kompresor: {record.compressorAmp ?? "-"}</p>
              <p>Kondisi Filter: {record.filterCondition ?? "-"}</p>
              <p>
                Terakhir Diperbarui:{" "}
                {record.updatedAt ? new Date(record.updatedAt).toLocaleString("id-ID") : "-"}
              </p>
              {record.photoUrl && (
                <div className="pt-2">
                  <p className="mb-2 text-xs uppercase text-(--depthui-muted)">Foto Unit</p>
                  <img
                    src={record.photoUrl}
                    alt={record.assetCode}
                    className="w-full rounded-2xl border border-black/10 object-cover"
                  />
                </div>
              )}
              {record.signatureUrl && (
                <div className="pt-2">
                  <p className="mb-2 text-xs uppercase text-(--depthui-muted)">Signature</p>
                  <img
                    src={record.signatureUrl}
                    alt="Signature"
                    className="h-32 rounded-2xl border border-black/10 object-contain"
                  />
                </div>
              )}
            </DepthCard>

            <DepthCard className="rounded-4xl p-6">
              <p className="text-xs uppercase text-(--depthui-muted)">Parameter Tambahan</p>
              {record.parameters && typeof record.parameters === "object" && Object.keys(record.parameters).length > 0 ? (
                <ul className="mt-3 space-y-1 text-sm text-[#3f3f3f]">
                  {Object.entries(record.parameters as Record<string, unknown>).map(([key, value]) => (
                    <li key={key}>
                      <span className="font-semibold text-[#1f1f1f]">{key}</span>: {String(value ?? "-")}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-(--depthui-muted)">Tidak ada parameter tambahan.</p>
              )}
            </DepthCard>

            <DepthCard className="rounded-4xl p-6">
              <p className="text-xs uppercase text-(--depthui-muted)">Riwayat Perubahan</p>
              {!history.length ? (
                <p className="mt-4 text-sm text-(--depthui-muted)">Belum ada riwayat untuk unit ini.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {history.map(entry => (
                    <li key={entry.id} className="rounded-2xl border border-black/10 bg-white p-4 text-sm text-[#3f3f3f]">
                      <div className="flex flex-col gap-1 text-[#1f1f1f]">
                        <span className="text-xs text-(--depthui-muted)">
                          {new Date(entry.createdAt).toLocaleString("id-ID")}
                        </span>
                        <span className="text-sm font-semibold">{entry.userName ?? "Teknisi"}</span>
                      </div>
                      {entry.changes.length > 0 && (
                        <ul className="mt-2 space-y-1 text-xs">
                          {entry.changes.map(change => {
                            if (change.field === "parameters") {
                              let previousValue: Record<string, unknown> = {};
                              let currentValue: Record<string, unknown> = {};
                              try {
                                if (typeof change.previous === "string") {
                                  previousValue = JSON.parse(change.previous);
                                }
                              } catch {
                                previousValue = {};
                              }
                              try {
                                if (typeof change.current === "string") {
                                  currentValue = JSON.parse(change.current);
                                }
                              } catch {
                                currentValue = {};
                              }

                              const keys = Array.from(
                                new Set([...Object.keys(previousValue), ...Object.keys(currentValue)])
                              );

                              const changedKeys = keys.filter(key => {
                                const prev = previousValue[key];
                                const curr = currentValue[key];
                                return String(prev ?? "") !== String(curr ?? "");
                              });

                              if (!changedKeys.length) return null;

                              return (
                                <li key={`${entry.id}-${change.field}`}>
                                  <div className="font-semibold text-[#1f1f1f]">Perubahan Parameter:</div>
                                  <ul className="mt-1 space-y-1">
                                    {changedKeys.map(key => (
                                      <li key={`${entry.id}-${change.field}-${key}`}>
                                        <span className="font-semibold text-[#1f1f1f]">{key}</span>:{" "}
                                        {String(previousValue[key] ?? "-")} -&gt; {String(currentValue[key] ?? "-")}
                                      </li>
                                    ))}
                                  </ul>
                                </li>
                              );
                            }

                            return (
                              <li key={`${entry.id}-${change.field}`}>
                                <span className="font-semibold text-[#1f1f1f]">{change.field}</span>:{" "}
                                {String(change.previous ?? "-")} -&gt; {String(change.current ?? "-")}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                      {entry.note && <p className="mt-2 text-xs italic text-[#1f1f1f]">{entry.note}</p>}
                      {entry.photos && entry.photos.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {entry.photos.map((photo, index) => (
                            <a
                              key={`${entry.id}-photo-${index}`}
                              href={photo.url}
                              target="_blank"
                              rel="noreferrer"
                              className="block h-16 w-16 overflow-hidden rounded border border-black/10"
                            >
                              <img src={photo.url} alt={photo.label} className="h-full w-full object-cover" />
                            </a>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </DepthCard>
          </>
        )}
      </div>
    </div>
  );
}
