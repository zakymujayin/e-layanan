export async function createPengajuanLog(
  tx: any,
  params: {
    pengajuanId: number;
    actionCode: string;
    performedBy: number;
    fromStatus: string | null;
    toStatus: string | null;
    targetStep?: string | null;
    alasan?: string;
    metadata?: Record<string, unknown>;
  }
) {
  return tx.pengajuanLog.create({
    data: {
      pengajuan_id: params.pengajuanId,
      action_code: params.actionCode,
      performed_by: params.performedBy,
      from_status: params.fromStatus,
      to_status: params.toStatus,
      target_step: params.targetStep ?? null,
      alasan: params.alasan ?? null,
      metadata: params.metadata ?? {},
    },
  });
}
