/**
 * Lot statuses that count toward on-hand quantity per Oracle EBS / SAP rules
 * (Unrestricted "Yes" rows from the reference table).
 */
const INCLUDED_RAW = [
  'Active',
  'Release',
  'Conditional Release Concurrent Use',
  'Conditional Release Pending Qual',
  'Release for Limited Use',
  'Rework / Reprocess',
  'Release For Further Processing',
  'Accept',
  'Physicians Release',
  'Research Use only',
  'WIP',
  'Released for Clinical Review',
  'Physicians Release for QP Review',
  'QP Release',
  'Release for QP Review',
  'Released for Clinical Use Only',
];

export function normalizeLotStatus(value) {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

const INCLUDED_SET = new Set(INCLUDED_RAW.map((s) => normalizeLotStatus(s)));

export function isLotStatusEligibleForOnhand(statusDescription) {
  return INCLUDED_SET.has(normalizeLotStatus(statusDescription));
}

/**
 * Sum onhand_qty by item_code for rows whose lot status is eligible.
 * @param {Array<Record<string, unknown>>} rows
 * @returns {{ byItemCode: Record<string, number>, skippedRows: number }}
 */
export function aggregateEligibleOnhandByItemCode(rows) {
  const byItemCode = {};
  let skippedRows = 0;

  (rows || []).forEach((row) => {
    const code = String(row?.item_code ?? '').trim();
    if (!code) {
      skippedRows += 1;
      return;
    }
    if (!isLotStatusEligibleForOnhand(row?.lot_status_description)) {
      skippedRows += 1;
      return;
    }
    const rawQty = row?.onhand_qty;
    const n =
      typeof rawQty === 'number'
        ? rawQty
        : Number(String(rawQty ?? '').replace(/,/g, '').trim());
    const qty = Number.isFinite(n) ? n : 0;
    byItemCode[code] = (byItemCode[code] || 0) + qty;
  });

  return { byItemCode, skippedRows };
}
