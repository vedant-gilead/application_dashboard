import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, Link } from "react-router-dom";
import { Home, ChevronRight, Upload } from "lucide-react";
import { toast } from 'sonner';

import DataTable from "../components/DataTable";
import StudySelector from '../components/StudySelector';
import ViewModeToggle from '../components/ViewModeToggle';
import initialProgramsData from '../../data/programData.json';
import initialDemandForecastData from '../../data/Demand_Forecast.json';
import { calculateCumulativeData } from '../utils/cumulativeCalculations';
import { formatCreationDate, formatLotExpirationDate } from '../utils/inventoryDateDisplay';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';

import summaryData from "../../data/Program_Summary.json";
import parametersPoolData from "../../data/Parameters_Pool.json";
import onhandInventoryData from "../../data/onhand_inventory_data.json";
import sitesMasterData from "../../data/sitesMasterData.json";

import ProgramSummary from './Program_Drilldown/components/ProgramSummary';
import ProgramParameters from './Program_Drilldown/components/ProgramParameters';
import ProgramTables from './Program_Drilldown/components/ProgramTables';

export default function Program_Drilldown() {
  const { programId } = useParams();
  const [selectedStudyId, setSelectedStudyId] = useState("ALL");
  const [viewMode, setViewMode] = useState("PER_STUDY");
  const [programsData, setProgramsData] = useState(initialProgramsData);
  const [demandForecastData, setDemandForecastData] = useState(initialDemandForecastData);
  const [onhandUploadDialogOpen, setOnhandUploadDialogOpen] = useState(false);
  const [onhandData, setOnhandData] = useState(onhandInventoryData);
  const csvInputRef = useRef(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [onhandUploadError, setOnhandUploadError] = useState('');
  const [onhandUploadSuccess, setOnhandUploadSuccess] = useState('');
  const [onhandUploadFileName, setOnhandUploadFileName] = useState('');
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);

  const programSummary = summaryData[programId];
  const programParameters = parametersPoolData[programId];
  const baseProgram = programsData[programId];

  const upsertMetricOverride = async (materialId, storageMonthKey, rawValue, metricTypes) => {
    const cleaned = String(rawValue ?? '').replace(/[^0-9.-]/g, '').trim();
    const nextVal = cleaned === '' || cleaned === '-' || cleaned === '.' ? 0 : Number(cleaned);
    const safeValue = Number.isFinite(nextVal) ? nextVal : 0;
    if (!programId || !storageMonthKey) return;
    const allowedMetrics = new Set(metricTypes);

    let nextProgramsSnapshot = null;
    setProgramsData((prev) => {
      const next = { ...prev };
      const program = next[programId];
      if (!program) return prev;

      next[programId] = {
        ...program,
        studies: (program.studies || []).map((study) => ({
          ...study,
          materials: (study.materials || []).map((material) => {
            if (material.id !== materialId) return material;
            return {
              ...material,
              data: (material.data || []).map((row) => {
                const metric = String(row?.metric || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
                if (!allowedMetrics.has(metric)) return row;
                return { ...row, [storageMonthKey]: safeValue };
              }),
            };
          }),
        })),
      };
      nextProgramsSnapshot = next;
      return next;
    });

    if (!nextProgramsSnapshot) return;
    try {
      await fetch('/api/save-programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextProgramsSnapshot),
      });
    } catch (err) {
      console.error('Failed to persist programData metric edit:', err);
    }
  };

  const upsertExpiryOverride = async (materialId, storageMonthKey, rawValue) =>
    upsertMetricOverride(materialId, storageMonthKey, rawValue, ['expiry', 'expiryobsolescence']);

  const upsertSupplyExecStartOverride = async (materialId, storageMonthKey, rawValue) => {
    const cleaned = String(rawValue ?? '').replace(/[^0-9.-]/g, '').trim();
    const nextVal = cleaned === '' || cleaned === '-' || cleaned === '.' ? 0 : Number(cleaned);
    const safeValue = Number.isFinite(nextVal) ? nextVal : 0;
    if (!programId || !storageMonthKey) return;

    let nextProgramsSnapshot = null;
    setProgramsData((prev) => {
      const next = { ...prev };
      const program = next[programId];
      if (!program) return prev;

      next[programId] = {
        ...program,
        studies: (program.studies || []).map((study) => ({
          ...study,
          materials: (study.materials || []).map((material) => {
            if (material.id !== materialId) return material;
            return {
              ...material,
              data: (material.data || []).map((row) => {
                const metric = String(row?.metric || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
                if (metric !== 'supplyexecutionstart') return row;
                const manualMap = {
                  ...(row?.__manualSupplyExecutionStart || {}),
                  [storageMonthKey]: true,
                };
                return { ...row, [storageMonthKey]: safeValue, __manualSupplyExecutionStart: manualMap };
              }),
            };
          }),
        })),
      };
      nextProgramsSnapshot = next;
      return next;
    });

    if (!nextProgramsSnapshot) return;
    try {
      await fetch('/api/save-programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextProgramsSnapshot),
      });
    } catch (err) {
      console.error('Failed to persist programData supply execution start edit:', err);
    }
  };

  const parseCsvText = (text) => {
    const rows = [];
    let row = [];
    let field = '';
    let i = 0;
    let inQuotes = false;

    const pushField = () => {
      row.push(field);
      field = '';
    };
    const pushRow = () => {
      rows.push(row);
      row = [];
    };

    while (i < text.length) {
      const ch = text[i];
      if (inQuotes) {
        if (ch === '"') {
          const next = text[i + 1];
          if (next === '"') {
            field += '"';
            i += 2;
            continue;
          }
          inQuotes = false;
          i += 1;
          continue;
        }
        field += ch;
        i += 1;
        continue;
      }

      if (ch === '"') {
        inQuotes = true;
        i += 1;
        continue;
      }
      if (ch === ',') {
        pushField();
        i += 1;
        continue;
      }
      if (ch === '\n' || ch === '\r') {
        pushField();
        pushRow();
        if (ch === '\r' && text[i + 1] === '\n') i += 2;
        else i += 1;
        continue;
      }
      field += ch;
      i += 1;
    }

    pushField();
    if (row.length > 1 || (row.length === 1 && row[0] !== '') || rows.length === 0) pushRow();
    return rows;
  };

  const normalizeHeader = (value) =>
    String(value ?? '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^a-z0-9_ ]+/g, '')
      .replace(/ /g, '_');

  const coerceCellValue = (key, raw) => {
    const str = raw == null ? '' : String(raw).trim();
    if (key === 'onhand_qty') {
      if (!str) return '';
      const normalized = str.replace(/,/g, '');
      const num = Number(normalized);
      return Number.isFinite(num) ? num : str;
    }
    return str;
  };

  const buildOnhandRowsFromCsvReplace = ({ csvText, columns }) => {
    const rows = parseCsvText(csvText)
      .map((r) => r.map((c) => (c == null ? '' : String(c).trim())))
      .filter((r) => r.some((c) => c !== ''));

    if (!columns?.length) return { ok: false, error: 'No columns are defined for this program.' };
    if (rows.length < 2) return { ok: false, error: 'CSV is missing header / data rows.' };

    const headerRow = rows[0] || [];
    const headerNormalized = headerRow.map((h) => normalizeHeader(h));

    const keyByHeader = new Map();
    columns.forEach((col) => {
      keyByHeader.set(normalizeHeader(col.key), col.key);
      keyByHeader.set(normalizeHeader(col.label), col.key);
    });

    const headerIdxToKey = new Map();
    headerNormalized.forEach((h, idx) => {
      const key = keyByHeader.get(h);
      if (key) headerIdxToKey.set(idx, key);
    });

    const expected = columns.map((c) => c.key);
    const mappedKeys = new Set([...headerIdxToKey.values()]);
    if (mappedKeys.size === 0) {
      return { ok: false, error: 'CSV header does not match expected columns (keys or labels).' };
    }

    const missingRequired = expected.filter((k) => !mappedKeys.has(k));
    if (missingRequired.length === expected.length) {
      return { ok: false, error: 'CSV header does not match expected columns (keys or labels).' };
    }

    const out = [];
    for (let r = 1; r < rows.length; r += 1) {
      const csvRow = rows[r];
      if (!csvRow?.length) continue;

      const obj = Object.fromEntries(columns.map((c) => [c.key, '']));
      for (const [idx, key] of headerIdxToKey.entries()) {
        obj[key] = coerceCellValue(key, csvRow[idx]);
      }

      const hasAnyValue = columns.some((c) => {
        const v = obj[c.key];
        return v !== '' && v != null;
      });
      if (!hasAnyValue) continue;

      out.push(obj);
    }

    return { ok: true, data: out };
  };

  const handleCsvFile = async (file) => {
    setOnhandUploadError('');
    setOnhandUploadSuccess('');
    setOnhandUploadFileName(file?.name || '');

    if (!file) return;
    if (!programId) return;

    const isCsv = file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv') || file.type === '';
    if (!isCsv) {
      const msg = 'Please upload a .csv file.';
      setOnhandUploadError(msg);
      toast.error(msg, { description: `File: ${file.name}` });
      return;
    }

    const slice = onhandData?.[programId] || { columns: [], data: [] };
    const toastId = toast.loading('Uploading CSV…', { description: `File: ${file.name}` });
    setIsUploadingCsv(true);

    try {
      const csvText = await file.text();
      const result = buildOnhandRowsFromCsvReplace({ csvText, columns: slice.columns });
      if (!result.ok) {
        setOnhandUploadError(result.error);
        toast.error('Upload failed', { id: toastId, description: result.error });
        return;
      }

      const nextOnhand = {
        ...(onhandData || {}),
        [programId]: {
          ...slice,
          data: result.data,
        },
      };

      setOnhandData(nextOnhand);
      setOnhandUploadSuccess(`Uploaded. Replaced ${programId} with ${result.data.length} row(s).`);
      toast.success('Upload complete', {
        id: toastId,
        description: `${file.name} • ${programId} • ${result.data.length} row(s)`,
      });

      try {
        const resp = await fetch('/api/save-onhand', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nextOnhand),
        });
        if (!resp.ok) throw new Error(`Save failed (${resp.status})`);
      } catch (err) {
        console.error('Failed to persist onhand inventory:', err);
        toast.error('Saved to table, but failed to write JSON file', { description: String(err) });
        return;
      }

      setTimeout(() => {
        setOnhandUploadError('');
        setOnhandUploadSuccess('');
        setIsDragActive(false);
      }, 1200);
    } finally {
      setIsUploadingCsv(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const loadLatestDemand = async () => {
      try {
        const resp = await fetch(`/src/data/Demand_Forecast.json?t=${Date.now()}`);
        if (!resp.ok) return;
        const json = await resp.json();
        if (!cancelled) setDemandForecastData(json);
      } catch {
        // Keep using bundled fallback data if live fetch fails.
      }
    };
    loadLatestDemand();
    return () => {
      cancelled = true;
    };
  }, [programId]);

  useEffect(() => {
    let cancelled = false;
    const loadLatestOnhand = async () => {
      try {
        const resp = await fetch(`/src/data/onhand_inventory_data.json?t=${Date.now()}`);
        if (!resp.ok) return;
        const json = await resp.json();
        if (!cancelled) setOnhandData(json);
      } catch {
        // Keep using bundled fallback data if live fetch fails.
      }
    };
    loadLatestOnhand();
    return () => {
      cancelled = true;
    };
  }, [programId]);

  useEffect(() => {
    let cancelled = false;
    const loadLatestPrograms = async () => {
      try {
        const resp = await fetch(`/src/data/programData.json?t=${Date.now()}`);
        if (!resp.ok) return;
        const json = await resp.json();
        if (!cancelled) setProgramsData(json);
      } catch {
        // Keep using bundled fallback data if live fetch fails.
      }
    };
    loadLatestPrograms();
    return () => {
      cancelled = true;
    };
  }, [programId]);

  const program = useMemo(() => {
    if (!baseProgram) return null;

    const normalizeText = (value) => String(value ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
    const parseNumber = (value, fallback = 0) => {
      const n = Number(String(value ?? '').replace(/,/g, ''));
      return Number.isFinite(n) ? n : fallback;
    };
    const normalizeMetric = (value) => String(value ?? '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');

    const onhandSlice = onhandData?.[programId] || { data: [] };
    const onhandByItemCode = (onhandSlice.data || []).reduce((acc, row) => {
      const itemCode = String(row?.item_code ?? '').trim();
      if (!itemCode) return acc;
      const safeQty = parseNumber(row?.onhand_qty, 0);
      acc[itemCode] = (acc[itemCode] || 0) + safeQty;
      return acc;
    }, {});

    const paramsByMaterialId = new Map();
    Object.entries(programParameters || {}).forEach(([key, value]) => {
      if (!key.startsWith('IP') || !value || typeof value !== 'object') return;
      const materialIdMatch = String(value.name || '').match(/\(([A-Za-z0-9-]+)\)/);
      const materialId = materialIdMatch?.[1];
      if (!materialId) return;
      paramsByMaterialId.set(materialId, {
        siteExecution: String(value.siteExecution || '').trim(),
        executionLeadTime: parseNumber(value.executionLeadTime, NaN),
      });
    });

    const siteRows = sitesMasterData?.data || [];
    const resolveLeadTimeForMaterial = (material) => {
      const param = paramsByMaterialId.get(material.id);
      if (!param) return 0;
      if (Number.isFinite(param.executionLeadTime) && param.executionLeadTime >= 0) {
        return Math.max(0, Math.round(param.executionLeadTime));
      }

      const siteNorm = normalizeText(param.siteExecution);
      if (!siteNorm) return 0;
      const stagePrefix = String(material?.type || '').toLowerCase().includes('product')
        ? 'dp:'
        : String(material?.type || '').toLowerCase().includes('substance')
          ? 'ds:'
          : '';

      const byStage = stagePrefix
        ? siteRows.filter((row) => String(row.execution_site || '').toLowerCase().startsWith(stagePrefix))
        : siteRows;

      const tryMatch = (rows) =>
        rows.find((row) => normalizeText(row.execution_site) === siteNorm) ||
        rows.find((row) => normalizeText(row.execution_site).includes(siteNorm)) ||
        rows.find((row) => siteNorm.includes(normalizeText(row.execution_site)));

      // Prefer stage-specific rows, but if that doesn't find anything that looks like our siteExecution,
      // fall back to searching across all sites so that generic labels like "La Verne" still match
      // entries such as "DP: Gilead La Verne DP".
      let matched = tryMatch(byStage);
      if (!matched) {
        matched = tryMatch(siteRows);
      }

      if (!matched) return 0;
      const lead = parseNumber(matched.execution_lead_time, NaN);
      if (!Number.isFinite(lead) || lead < 0) return 0;
      return Math.round(lead);
    };

    const monthLabelToDemandKey = (label) => {
      // Program table labels look like "Jul-25"; Demand_Forecast keys look like "Jul-2025".
      const [mon, yy] = String(label || '').split('-');
      if (!mon || !yy) return null;
      const year = Number(yy);
      if (!Number.isFinite(year)) return null;
      return `${mon}-20${String(year).padStart(2, '0')}`;
    };

    const demandMonthColumns = (demandForecastData?.columns || [])
      .filter((col) => !['program', 'partNumber', 'partDescription', 'materialStage'].includes(col.key))
      .map((col) => {
        const [mon, year] = String(col.key).split('-'); // e.g. Mar, 2025
        const yy = String(year || '').slice(-2);
        return {
          demandKey: col.key, // e.g. Mar-2025
          key: `${String(mon || '').toLowerCase()}${yy}`, // e.g. mar25
          label: `${mon}-${yy}`, // e.g. Mar-25
        };
      });

    const findForecastRow = (partNumber) =>
      (demandForecastData?.data || []).find((r) => r.program === programId && r.partNumber === partNumber);

    return {
      ...baseProgram,
      studies: baseProgram.studies.map((study) => ({
        ...study,
        materials: study.materials.map((material) => {
          const forecastRow = findForecastRow(material.id);
          const leadTimeMonths = resolveLeadTimeForMaterial(material);

          const oldDemandKeyToColumnKey = new Map();
          (material.columns || []).forEach((col) => {
            if (!col || col.key === 'metric') return;
            const demandKey = monthLabelToDemandKey(col.label);
            if (demandKey) oldDemandKeyToColumnKey.set(demandKey, col.key);
          });

          const remappedColumns = [
            { key: 'metric', label: 'Metric' },
            ...demandMonthColumns.map((m) => ({
              key: m.key,
              label: m.label,
              headerClassName: 'text-right',
              cellClassName: 'text-right tabular-nums',
              render: (row) => {
                const metricKey = normalizeMetric(row?.metric);
                const isExpiryMetric = metricKey === 'expiry' || metricKey === 'expiryobsolescence';
                const isSupplyExecStartMetric = metricKey === 'supplyexecutionstart';
                const val = row?.[m.key] ?? 0;
                if (!isExpiryMetric && !isSupplyExecStartMetric) return val;
                const oldMonthKey = oldDemandKeyToColumnKey.get(m.demandKey);
                const storageMonthKey = oldMonthKey || m.key;
                if (isExpiryMetric) {
                  return <span className="block w-full text-right">{val}</span>;
                }
                return (
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    className="block w-full text-right outline-none rounded focus:ring-2 focus:ring-[#306e9a]/40"
                    onBlur={(e) => {
                      upsertSupplyExecStartOverride(material.id, storageMonthKey, e.currentTarget.innerText);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.currentTarget.blur();
                      }
                    }}
                  >
                    {val}
                  </span>
                );
              },
            })),
          ];

          const updatedRows = (material.data || []).map((row) => {
            const metric = String(row.metric || '').toLowerCase();
            const isInventory = metric === 'inventory';
            const isClinical = metric === 'demand (clinical)';
            const isIndependent = metric === 'demand (independent)';
            const isTotal = metric === 'total demand';

            const next = { ...row };
            demandMonthColumns.forEach((monthCol) => {
              const oldColKey = oldDemandKeyToColumnKey.get(monthCol.demandKey);
              const sourceColKey = oldColKey || monthCol.key;
              const oldVal = row[sourceColKey] ?? 0;

              if (isInventory) {
                // Initialize; we will override with projected onhand after we compute it.
                next[monthCol.key] = 0;
              } else if (isClinical) {
                next[monthCol.key] = Number(forecastRow?.[`${monthCol.demandKey}_clinical`] ?? 0);
              } else if (isIndependent) {
                next[monthCol.key] = Number(forecastRow?.[`${monthCol.demandKey}_independent`] ?? 0);
              } else if (isTotal) {
                next[monthCol.key] = Number(forecastRow?.[monthCol.demandKey] ?? 0);
              } else {
                next[monthCol.key] = oldVal ?? 0;
              }
            });

            return next;
          });

          const monthKeys = demandMonthColumns.map((m) => m.key);
          const totalDemandRow = updatedRows.find((r) => normalizeMetric(r.metric) === 'totaldemand');
          const clinicalDemandRow = updatedRows.find((r) => normalizeMetric(r.metric) === 'demandclinical');
          const independentDemandRow = updatedRows.find((r) => normalizeMetric(r.metric) === 'demandindependent');
          const supplyReleaseRow = updatedRows.find((r) => normalizeMetric(r.metric) === 'supplyrelease');
          const supplyExecStartRow = updatedRows.find((r) => normalizeMetric(r.metric) === 'supplyexecutionstart');
          const expiryRow = updatedRows.find((r) => {
            const metric = normalizeMetric(r.metric);
            return metric === 'expiry' || metric === 'expiryobsolescence';
          });
          const inventoryRow = updatedRows.find((r) => normalizeMetric(r.metric) === 'inventory');
          const getEffectiveDemand = (monthKey) => {
            const total = parseNumber(totalDemandRow?.[monthKey], 0);
            if (total > 0) return total;
            const clinical = parseNumber(clinicalDemandRow?.[monthKey], 0);
            const independent = parseNumber(independentDemandRow?.[monthKey], 0);
            return clinical + independent;
          };

          if (supplyExecStartRow || supplyReleaseRow || inventoryRow) {
            const startByMonth = Array(monthKeys.length).fill(0);
            const releaseByMonth = Array(monthKeys.length).fill(0);
            const requiredByDemandMonth = Array(monthKeys.length).fill(0);

            // Pass 1: compute monthly required quantity from projected onhand before demand.
            let onhandForDeficit = parseNumber(onhandByItemCode[material.id], 0);
            monthKeys.forEach((monthKey, monthIdx) => {
              const demand = getEffectiveDemand(monthKey);
              const expiry = parseNumber(expiryRow?.[monthKey], 0);
              const availableOnhand = Math.max(0, onhandForDeficit);
              const requiredRelease = demand > 0 ? Math.max(0, demand - availableOnhand) : 0;
              requiredByDemandMonth[monthIdx] = requiredRelease;
              // Existing agreed logic computes deficit against projected onhand; release is scheduled separately.
              onhandForDeficit = Math.max(0, onhandForDeficit - demand - expiry);
            });

            // Pass 2: map required quantity to start months from demand deficits.
            requiredByDemandMonth.forEach((qty, demandIdx) => {
              if (qty <= 0) return;
              const startIdx = Math.max(0, demandIdx - leadTimeMonths);
              startByMonth[startIdx] += qty;
            });

            if (supplyExecStartRow) {
              monthKeys.forEach((monthKey, idx) => {
                const demandKey = demandMonthColumns[idx]?.demandKey;
                const oldMonthKey = demandKey ? oldDemandKeyToColumnKey.get(demandKey) : null;
                const storageMonthKey = oldMonthKey || monthKey;
                const manualFlags = supplyExecStartRow?.__manualSupplyExecutionStart || {};
                const hasManualOverride = Boolean(manualFlags[storageMonthKey]);
                if (hasManualOverride) {
                  supplyExecStartRow[monthKey] = parseNumber(supplyExecStartRow[monthKey], 0);
                } else {
                  supplyExecStartRow[monthKey] = startByMonth[idx];
                }
              });
            }

            // Pass 3: derive release from execution start after execution lead time.
            // Business rule: start in month M -> release in month M + leadTimeMonths.
            releaseByMonth.fill(0);
            const sourceStartByMonth = supplyExecStartRow
              ? monthKeys.map((monthKey) => parseNumber(supplyExecStartRow[monthKey], 0))
              : startByMonth;
            sourceStartByMonth.forEach((qty, startIdx) => {
              if (qty <= 0) return;
              const releaseIdx = Math.min(monthKeys.length - 1, startIdx + leadTimeMonths);
              releaseByMonth[releaseIdx] += qty;
            });

            if (supplyReleaseRow) {
              monthKeys.forEach((monthKey, idx) => {
                supplyReleaseRow[monthKey] = releaseByMonth[idx];
              });
            }

            // Pass 4: project inventory timeline using dynamic release values.
            if (inventoryRow) {
              let onhandAtStart = parseNumber(onhandByItemCode[material.id], 0);
              monthKeys.forEach((monthKey, idx) => {
                const demand = getEffectiveDemand(monthKey);
                const expiry = parseNumber(expiryRow?.[monthKey], 0);
                const releaseThisMonth = releaseByMonth[idx] ?? 0;
                inventoryRow[monthKey] = Math.max(0, onhandAtStart);
                onhandAtStart = Math.max(0, onhandAtStart - demand - expiry + releaseThisMonth);
              });
            }
          }

          return { ...material, columns: remappedColumns, data: updatedRows };
        }),
      })),
    };
  }, [baseProgram, demandForecastData, programId, onhandData, programParameters]);

  const { data: cumulativeData, columns: cumulativeColumns } = useMemo(() => {
    if (!program) return { data: [], columns: [] };
    return calculateCumulativeData(program.studies);
  }, [program]);

  if (!programSummary || !programParameters || !program) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200/80 p-12 shadow-sm text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800">Program Not Found</h2>
        <p className="text-gray-600 mt-2">
          The program with ID <span className="font-semibold">{programId}</span> could not be found.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors"
        >
          Go Back to Programs
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Breadcrumbs */}
      <div className="flex items-center text-gray-500 text-sm mb-4">
        <Link to="/" className="hover:text-gray-700">
          <Home className="w-4 h-4" />
        </Link>
        <ChevronRight className="w-4 h-4 mx-1" />
        <Link to="/" className="hover:text-gray-700">
          Programs
        </Link>
        <ChevronRight className="w-4 h-4 mx-1" />
        <span className="font-medium text-gray-700">{programId}</span>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
          {programId}
        </h1>
        <p className="text-gray-600 mt-2 text-base">
          Detailed planning and material information for {programId}
        </p>
      </div>

      <ProgramSummary programSummary={programSummary} />
      <ProgramParameters programParameters={programParameters} />
      
      <div className="flex justify-between items-center mb-4">
        <StudySelector
            studies={program.studies}
            selectedStudyId={selectedStudyId}
            onChange={setSelectedStudyId}
            disabled={viewMode === 'CUMULATIVE'}
        />
        <ViewModeToggle viewMode={viewMode} onChange={setViewMode} />
      </div>

      <ProgramTables
        program={program}
        viewMode={viewMode}
        cumulativeColumns={cumulativeColumns}
        cumulativeData={cumulativeData}
        selectedStudyId={selectedStudyId}
      />

      {/* Onhand Inventory Table */}
      {/* <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Onhand Inventory
        </h2>
        <DataTable
          columns={onhandInventoryData.columns}
          data={onhandInventoryData.data}
        />
      </div> */}
      {/* Onhand Inventory Table */}
<div className="mt-8">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-xl font-bold text-gray-800">Onhand Inventory</h2>
    <div>
      <Button
        type="button"
        className="bg-gray-200 text-gray-800 hover:bg-gray-300 px-4 py-2 rounded-lg shadow-sm transition-colors"
        onClick={() => {
          setOnhandUploadError('');
          setOnhandUploadSuccess('');
          setOnhandUploadFileName('');
          setIsDragActive(false);
          setOnhandUploadDialogOpen(true);
        }}
      >
        <Upload className="w-4 h-4 mr-2" />
        Upload CSV
      </Button>
    </div>
  </div>
  {(() => {
    const slice = onhandData?.[programId] || { columns: [], data: [] };
    const columns = slice.columns.map((col) => {
      if (col.key === 'creation_date') {
        return { ...col, render: (row) => formatCreationDate(row[col.key]) };
      }
      if (col.key === 'lot_expiration_date') {
        return { ...col, render: (row) => formatLotExpirationDate(row[col.key]) };
      }
      return col;
    });

    const dataWithPlaceholder =
      slice.data.length === 0
        ? [Object.fromEntries(slice.columns.map((col) => [col.key, '--']))]
        : slice.data;

    return <DataTable columns={columns} data={dataWithPlaceholder} />;
  })()}
</div>

      <Dialog
        open={onhandUploadDialogOpen}
        onOpenChange={(open) => {
          setOnhandUploadDialogOpen(open);
          if (!open) {
            setOnhandUploadError('');
            setOnhandUploadSuccess('');
            setOnhandUploadFileName('');
            setIsDragActive(false);
            setIsUploadingCsv(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-[520px] bg-white rounded-lg shadow-xl border border-gray-200">
          <DialogHeader>
            <DialogTitle>Bulk Upload Onhand Inventory</DialogTitle>
            <DialogDescription>Upload CSV for {programId}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleCsvFile(file);
                e.target.value = '';
              }}
            />

            <div
              className={[
                'rounded-md border border-dashed px-4 py-4 transition-colors',
                isDragActive ? 'border-[#306e9a] bg-[#eef6fc]' : 'border-gray-300 bg-gray-50',
              ]
                .filter(Boolean)
                .join(' ')}
              onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.dataTransfer.dropEffect = 'copy';
                setIsDragActive(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.dataTransfer.dropEffect = 'copy';
                setIsDragActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragActive(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragActive(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleCsvFile(file);
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-gray-700">
                  <div className="font-medium">Drag & drop your CSV here</div>
                  <div className="text-gray-500">or use the Upload CSV button.</div>
                </div>
                <Button
                  type="button"
                  className="bg-gray-200 text-gray-800 hover:bg-gray-300 shadow-sm"
                  onClick={() => csvInputRef.current?.click()}
                >
                  Upload CSV
                </Button>
              </div>

              {onhandUploadFileName ? (
                <div className="mt-3 text-xs text-gray-600">
                  Selected file: <span className="font-medium">{onhandUploadFileName}</span>
                  {isUploadingCsv ? <span className="ml-2 text-gray-500">(uploading…)</span> : null}
                </div>
              ) : null}

              {onhandUploadError ? (
                <div className="mt-3 text-sm text-red-600">{onhandUploadError}</div>
              ) : onhandUploadSuccess ? (
                <div className="mt-3 text-sm text-green-700">{onhandUploadSuccess}</div>
              ) : null}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              className="bg-[#306e9a] hover:bg-[#255577] text-white shadow-sm"
              onClick={() => setOnhandUploadDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
 