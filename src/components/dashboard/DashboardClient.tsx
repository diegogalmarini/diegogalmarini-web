"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { updateDocumentStatus } from "@/app/actions";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pendiente" },
  { value: "in_progress", label: "En progreso" },
  { value: "completed", label: "Completada" },
  { value: "cancelled", label: "Cancelada" },
];

function StatusSelect({ collectionName, docId, currentStatus }: {
  collectionName: string;
  docId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setLoading(true);
    setStatus(newStatus);
    const result = await updateDocumentStatus(collectionName, docId, newStatus);
    setLoading(false);
    if (result.success) {
      router.refresh();
    } else {
      alert("Error al actualizar el estado: " + (result.error || "Desconocido"));
      setStatus(currentStatus); // revert if error
    }
  };

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={loading}
      className="border rounded px-2 py-1"
    >
      {STATUS_OPTIONS.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

export default function DashboardClient({ consultations, appointments }: {
  consultations: any[];
  appointments: any[];
}) {
  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-2xl font-semibold mb-4">Consultas</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Plan</th>
                <th className="px-4 py-2">Fecha</th>
                <th className="px-4 py-2">Hora</th>
                <th className="px-4 py-2">Estado</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {consultations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">No hay consultas registradas.</td>
                </tr>
              ) : (
                consultations.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="px-4 py-2">{c.clientEmail}</td>
                    <td className="px-4 py-2">{c.planType}</td>
                    <td className="px-4 py-2">{c.selectedDate}</td>
                    <td className="px-4 py-2">{c.selectedTime}</td>
                    <td className="px-4 py-2">{c.status}</td>
                    <td className="px-4 py-2">
                      <StatusSelect
                        collectionName="consultations"
                        docId={c.id}
                        currentStatus={c.status || "pending"}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Citas</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Plan</th>
                <th className="px-4 py-2">Fecha</th>
                <th className="px-4 py-2">Hora</th>
                <th className="px-4 py-2">Estado</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">No hay citas registradas.</td>
                </tr>
              ) : (
                appointments.map((a) => (
                  <tr key={a.id} className="border-t">
                    <td className="px-4 py-2">{a.clientEmail}</td>
                    <td className="px-4 py-2">{a.planType}</td>
                    <td className="px-4 py-2">{a.selectedDate}</td>
                    <td className="px-4 py-2">{a.selectedTime}</td>
                    <td className="px-4 py-2">{a.status}</td>
                    <td className="px-4 py-2">
                      <StatusSelect
                        collectionName="appointments"
                        docId={a.id}
                        currentStatus={a.status || "pending"}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
