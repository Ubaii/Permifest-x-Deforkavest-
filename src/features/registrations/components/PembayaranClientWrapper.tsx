'use client';

import React, { useState, useCallback } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { PaymentUploadCard } from './PaymentUploadCard';
import type { RegistrationWithRelations } from '@/features/registrations/queries';

interface Props {
  initialRegistrations: RegistrationWithRelations[];
}

export function PembayaranClientWrapper({ initialRegistrations }: Props) {
  const [registrations, setRegistrations] = useState(initialRegistrations);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSuccess = useCallback(() => {
    setSuccessMsg('Bukti pembayaran berhasil diunggah! Panitia akan memverifikasi dalam 24 jam kerja.');
    setRegistrations((prev) =>
      prev.map((r) =>
        r.payment && (r.payment.status === 'awaiting_proof' || r.payment.status === 'rejected')
          ? {
              ...r,
              payment: {
                ...r.payment,
                status: 'pending_review',
                proof_uploaded_at: new Date().toISOString(),
              },
            }
          : r
      )
    );
  }, []);

  return (
    <div className="space-y-6">
      {successMsg && (
        <Alert variant="success" onClose={() => setSuccessMsg(null)}>
          <AlertTitle>Berhasil!</AlertTitle>
          <AlertDescription>{successMsg}</AlertDescription>
        </Alert>
      )}

      {registrations.map((reg) => (
        <PaymentUploadCard key={reg.id} registration={reg} onSuccess={handleSuccess} />
      ))}
    </div>
  );
}
