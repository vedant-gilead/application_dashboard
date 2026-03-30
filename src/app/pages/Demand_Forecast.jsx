import React, { useMemo, useRef, useState, useEffect } from 'react';
import ProgramAccordion from '../components/ProgramAccordion';
import PartNumberAccordion from '../components/PartNumberAccordion';
import initialDemandData from '../../data/Demand_Forecast.json';
import { ChevronDown, ChevronUp, ChevronsUpDown, Upload } from 'lucide-react';
import { Button } from '../components/ui/button';
import Pagination from '../components/Pagination';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
 
export default function Demand_Forecast() {
  const [demandData, setDemandData] = useState(initialDemandData);
  const [viewMode, setViewMode] = useState('program'); // 'program' | 'part'
 
  // Group data by program
  const programs = useMemo(() => {
    const grouped = {};
    demandData.data.forEach(row => {
      if (!grouped[row.program]) {
        grouped[row.program] = [];
      }
      grouped[row.program].push(row);
    });
    return grouped;
  }, [demandData]);
 
  // Group data by part number
  const parts = useMemo(() => {
    const grouped = {};
    demandData.data.forEach(row => {
      if (!grouped[row.partNumber]) {
        grouped[row.partNumber] = [];
      }
      grouped[row.partNumber].push(row);
    });
    return grouped;
  }, [demandData]);
 
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const itemsPerPage = 10;
 
  useEffect(() => {
    setCurrentPage(1);
    setSortConfig({ key: null, direction: 'asc' });
  }, [viewMode]);
 
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkSelectedProgram, setBulkSelectedProgram] = useState('');
  const csvInputRef = useRef(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [bulkUploadError, setBulkUploadError] = useState('');
  const [bulkUploadSuccess, setBulkUploadSuccess] = useState('');
  const [bulkUploadFileName, setBulkUploadFileName] = useState('');
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);
 
  useEffect(() => {
    if (!bulkSelectedProgram) setIsDragActive(false);
  }, [bulkSelectedProgram]);
 
  useEffect(() => {
    if (!bulkDialogOpen) return;
    setBulkUploadError('');
    setBulkUploadSuccess('');
    setBulkUploadFileName('');
    setIsUploadingCsv(false);
  }, [bulkDialogOpen]);
 
  const availablePrograms = useMemo(() => {
    const set = new Set(demandData.data.map((row) => row.program).filter(Boolean));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [demandData.data]);
 
  const forecastMonthColumns = useMemo(() => {
    return demandData.columns.filter(
      (col) => !['program', 'partNumber', 'partDescription', 'materialStage'].includes(col.key),
    );
  }, [demandData.columns]);
 
  const downloadCsv = (csv, fileName) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
 
  const buildDemandTemplateCsv = (programName) => {
    const monthKeys = forecastMonthColumns.map((c) => c.key);
    const header = ['partNumber', ...monthKeys.flatMap((m) => [`${m}_clinical`, `${m}_independent`])];
 
    const csvEscape = (value) => {
      const str = value == null ? '' : String(value);
      if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
      return str;
    };
 
    const programRows = demandData.data.filter((r) => r.program === programName);
    const partNumbers = [...new Set(programRows.map((r) => r.partNumber).filter(Boolean))].sort((a, b) =>
      (a || '').localeCompare(b || ''),
    );
 
    // First row: a single "program name" cell on top (rest blank)
    const topRow = [programName, ...Array(header.length - 1).fill('')];
 
    // Data rows: partNumber filled, all month clinical/independent cells empty
    const lines = partNumbers.map((partNumber) => {
      const emptyMonthCells = monthKeys.flatMap(() => ['', '']);
      return [partNumber, ...emptyMonthCells].map(csvEscape).join(',');
    });
 
    return [topRow.map(csvEscape).join(','), header.map(csvEscape).join(','), ...lines].join('\n');
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
 
  const parseNumberCell = (raw) => {
    const str = raw == null ? '' : String(raw).trim();
    if (!str) return { kind: 'empty' };
    const normalized = str.replace(/,/g, '');
    const num = Number(normalized);
    if (!Number.isFinite(num)) return { kind: 'invalid', value: str };
    return { kind: 'number', value: num };
  };
 
  const buildDemandForecastDataFromCsvReplace = ({ csvText, selectedProgram }) => {
    const rows = parseCsvText(csvText)
      .map((r) => r.map((c) => (c == null ? '' : String(c).trim())))
      .filter((r) => r.some((c) => c !== ''));
 
    if (!selectedProgram) return { ok: false, error: 'Please select a program before uploading.' };
    if (rows.length < 2) return { ok: false, error: 'CSV is missing header / data rows.' };
 
    const fileProgram = (rows[0]?.[0] || '').trim();
    if (fileProgram && fileProgram !== selectedProgram) {
      return { ok: false, error: `Selected program "${selectedProgram}" does not match CSV program "${fileProgram}".` };
    }
 
    const header = rows[1] || [];
    const partNumberIdx = header.findIndex((h) => h.toLowerCase() === 'partnumber');
    if (partNumberIdx === -1) return { ok: false, error: 'Header row must include "partNumber".' };
 
    const monthKeys = forecastMonthColumns.map((c) => c.key);
    const expectedHeaders = new Set(
      ['partNumber', ...monthKeys.flatMap((m) => [`${m}_clinical`, `${m}_independent`])].map((h) => h.toLowerCase()),
    );
    const unknownHeaders = header.filter(Boolean).filter((h) => !expectedHeaders.has(h.toLowerCase()));
    if (unknownHeaders.length) {
      return { ok: false, error: `Unknown columns in CSV header: ${unknownHeaders.join(', ')}` };
    }
 
    const headerIndexByKey = new Map();
    header.forEach((h, idx) => {
      if (!h) return;
      headerIndexByKey.set(h, idx);
    });
 
    const errors = [];
    const out = [];
    const seenPartNumbers = new Set();
 
    for (let r = 2; r < rows.length; r += 1) {
      const csvRow = rows[r];
      const partNumber = (csvRow[partNumberIdx] || '').trim();
      if (!partNumber) continue;
 
      if (seenPartNumbers.has(partNumber)) {
        errors.push(`Row ${r + 1}: duplicate partNumber "${partNumber}".`);
        continue;
      }
      seenPartNumbers.add(partNumber);
 
      const next = {
        program: selectedProgram,
        partNumber,
        partDescription: '',
        materialStage: '',
      };
 
      for (const monthKey of monthKeys) {
        const clinicalHeader = `${monthKey}_clinical`;
        const independentHeader = `${monthKey}_independent`;
        const clinicalIdx = headerIndexByKey.get(clinicalHeader);
        const independentIdx = headerIndexByKey.get(independentHeader);
        if (clinicalIdx == null || independentIdx == null) continue;
 
        const clinicalParsed = parseNumberCell(csvRow[clinicalIdx]);
        const independentParsed = parseNumberCell(csvRow[independentIdx]);
 
        if (clinicalParsed.kind === 'invalid') {
          errors.push(`Row ${r + 1}: invalid value for ${clinicalHeader} ("${clinicalParsed.value}").`);
          continue;
        }
        if (independentParsed.kind === 'invalid') {
          errors.push(`Row ${r + 1}: invalid value for ${independentHeader} ("${independentParsed.value}").`);
          continue;
        }
 
        const clinicalVal = clinicalParsed.kind === 'number' ? clinicalParsed.value : 0;
        const independentVal = independentParsed.kind === 'number' ? independentParsed.value : 0;
 
        next[clinicalHeader] = clinicalVal;
        next[independentHeader] = independentVal;
        next[monthKey] = clinicalVal + independentVal;
      }
 
      out.push(next);
    }
 
    if (errors.length) {
      return {
        ok: false,
        error: errors.slice(0, 6).join(' ') + (errors.length > 6 ? ` (+${errors.length - 6} more)` : ''),
      };
    }
 
    return { ok: true, data: out };
  };
 
  const handleCsvFile = async (file) => {
    setBulkUploadError('');
    setBulkUploadSuccess('');
    setBulkUploadFileName(file?.name || '');
 
    if (!bulkSelectedProgram) {
      setBulkUploadError('Please select a program before uploading.');
      toast.error('Select a program before uploading.', {
        description: file?.name ? `File: ${file.name}` : undefined,
      });
      return;
    }
    if (!file) return;
 
    const isCsv = file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv') || file.type === '';
    if (!isCsv) {
      setBulkUploadError('Please upload a .csv file.');
      toast.error('Please upload a .csv file.', { description: `File: ${file.name}` });
      return;
    }
 
    const toastId = toast.loading('Uploading CSV…', { description: `File: ${file.name}` });
    setIsUploadingCsv(true);
 
    try {
      const csvText = await file.text();
      const result = buildDemandForecastDataFromCsvReplace({ csvText, selectedProgram: bulkSelectedProgram });
      if (!result.ok) {
        setBulkUploadError(result.error);
        toast.error('Upload failed', { id: toastId, description: result.error });
        return;
      }
 
      // Replace only the selected program's rows; keep all other programs intact.
      const preserved = demandData.data.filter((r) => r.program !== bulkSelectedProgram);
      const nextDemand = { ...demandData, data: [...preserved, ...result.data] };
      setDemandData(nextDemand);
      setBulkUploadSuccess(`Uploaded. Replaced ${bulkSelectedProgram} with ${result.data.length} row(s).`);
      toast.success('Upload complete', {
        id: toastId,
        description: `${file.name} • ${bulkSelectedProgram} • ${result.data.length} row(s)`,
      });
 
      // Persist to JSON file via dev server middleware
      try {
        const resp = await fetch('/api/save-demand', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nextDemand),
        });
        if (!resp.ok) throw new Error(`Save failed (${resp.status})`);
      } catch (err) {
        console.error('Failed to persist demand forecast:', err);
        toast.error('Saved to table, but failed to write JSON file', { description: String(err) });
        return;
      }
 
      // Keep dialog open. Clear inline messages after a short delay (toast remains visible).
      setTimeout(() => {
        setBulkUploadError('');
        setBulkUploadSuccess('');
        setIsDragActive(false);
      }, 1200);
    } finally {
      setIsUploadingCsv(false);
    }
  };
 
  const currentViewData = useMemo(() => {
    let entries = viewMode === 'program' ? Object.entries(programs) : Object.entries(parts);
    
    // 1. Map to array of objects with sortable properties
    let sortableList = entries.map(([key, data]) => {
      let totalDemand = 0;
      const monthColumns = demandData.columns.filter(c => !['program', 'partNumber', 'partDescription', 'materialStage'].includes(c.key));
      
      let uniquePartsOrProgramsLabel = '';
      let startDate = 'N/A';
      
      if (viewMode === 'program') {
          const uniqueParts = [...new Set(data.map(d => d.partNumber))];
          uniquePartsOrProgramsLabel = uniqueParts.slice(0, 2).join(', ') + (uniqueParts.length > 2 ? '...' : '');
          startDate = monthColumns.length > 0 ? monthColumns[0].label : 'N/A';
      } else {
          const dedupedPrograms = data.reduce((acc, current) => {
            if (!acc.find(i => i.program === current.program)) acc.push(current);
            return acc;
          }, []);
          uniquePartsOrProgramsLabel = dedupedPrograms.map(d => d.program).join(', ');
      }
      
      data.forEach(row => {
        monthColumns.forEach(col => {
          if (typeof row[col.key] === 'number' && !isNaN(row[col.key])) totalDemand += row[col.key];
        });
      });
 
      return {
          keyName: key,
          data,
          startDate,
          uniquePartsOrProgramsLabel,
          totalDemand,
          status: 'Active'
      };
    });
 
    // 2. Sort
    if (sortConfig.key) {
      sortableList.sort((a, b) => {
          let aValue = a[sortConfig.key];
          let bValue = b[sortConfig.key];
 
          if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
          }
 
          const aStr = String(aValue).toLowerCase();
          const bStr = String(bValue).toLowerCase();
          if (aStr < bStr) return sortConfig.direction === "asc" ? -1 : 1;
          if (aStr > bStr) return sortConfig.direction === "asc" ? 1 : -1;
          return 0;
      });
    }
 
    return sortableList;
  }, [programs, parts, viewMode, demandData.columns, sortConfig]);
 
  const totalPages = Math.ceil(currentViewData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = currentViewData.slice(startIndex, endIndex);
 
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };
 
  const getSortIcon = (columnKey) => {
    if (sortConfig.key === columnKey) {
      return sortConfig.direction === "asc" ? (
        <ChevronUp className="w-4 h-4 ml-1 inline text-white" />
      ) : (
        <ChevronDown className="w-4 h-4 ml-1 inline text-white" />
      );
    }
    return <ChevronsUpDown className="w-4 h-4 ml-1 inline text-blue-200 hover:text-white" />;
  };
 
  const handleDataChange = (partNumber, monthKey, newValue, programName) => {
    // Find and update the row in our local state
    const newData = [...demandData.data];
    // Find using both partNumber and programName to be absolute sure if editing in part view
    const rowIndex = newData.findIndex(row => row.partNumber === partNumber && row.program === programName);
    
    if (rowIndex !== -1) {
      // Calculate the new total: clinical (existing) + new independent value
      // Handle the case where the clinical value doesn't explicitly exist yet on the record
      const clinicalKey = `${monthKey}_clinical`;
      const independentKey = `${monthKey}_independent`;
      
      const currentClinical = newData[rowIndex][clinicalKey] || 0;
      const newTotal = currentClinical + newValue;
 
      newData[rowIndex] = {
        ...newData[rowIndex],
        [clinicalKey]: currentClinical,
        [independentKey]: newValue,
        [monthKey]: newTotal
      };
      
      const newDemandData = { ...demandData, data: newData };
      setDemandData(newDemandData);
 
      // Save to backend (mocked or real endpoint)
      fetch('/api/save-demand', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          columns: newDemandData.columns,
          data: newData
        })
      }).catch(err => console.error('Failed to save demand:', err));
    }
  };
 
  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Demand Forecast</h1>
          <p className="text-gray-600 mt-2 text-base">Demand Forecasts: showing Total, Clinical, and Independent demand across different time periods.</p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-3">
            <span className="text-gray-700 font-medium text-sm">View Mode:</span>
            <div className="flex bg-[#E5E7EB] rounded-full p-1 border border-gray-200 shadow-sm relative overflow-hidden">
              <button
                onClick={() => setViewMode('program')}
                className={`relative z-10 px-6 py-1.5 text-[13px] font-medium rounded-full transition-all duration-200 ${
                  viewMode === 'program' ? 'text-white' : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                By Program
              </button>
              <button
                onClick={() => setViewMode('part')}
                className={`relative z-10 px-6 py-1.5 text-[13px] font-medium rounded-full transition-all duration-200 ${
                  viewMode === 'part' ? 'text-white' : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                By Part Number
              </button>
 
              {/* Absolute Sliding Pill Background */}
              <div
                className={`absolute top-1 bottom-1 bg-[#306e9a] rounded-full transition-all duration-300 ease-in-out z-0`}
                style={{
                  left: viewMode === 'program' ? '4px' : '50%',
                  width: 'calc(50% - 4px)',
                }}
              />
            </div>
          </div>
 
          <Button
            className="bg-gray-200 text-gray-800 hover:bg-gray-300 px-4 py-2 rounded-lg shadow-sm transition-colors"
            onClick={() => {
              setBulkSelectedProgram('');
              setBulkDialogOpen(true);
            }}
          >
            <Upload className="w-4 h-4 mr-2" />
            Bulk Upload
          </Button>
        </div>
      </div>
 
      <Dialog
        open={bulkDialogOpen}
        onOpenChange={(open) => {
          setBulkDialogOpen(open);
          // Reset ephemeral upload UI state whenever dialog toggles
          setBulkUploadError('');
          setBulkUploadSuccess('');
          if (!open) {
            setBulkSelectedProgram('');
            setIsDragActive(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-[520px] bg-white rounded-lg shadow-xl border border-gray-200">
          <DialogHeader>
            <DialogTitle>Bulk Upload Demand Forecast</DialogTitle>
            <DialogDescription>Select a program to download its CSV template.</DialogDescription>
          </DialogHeader>
 
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">Program *</div>
              <Select value={bulkSelectedProgram} onValueChange={setBulkSelectedProgram}>
                <SelectTrigger className="w-full !border-[#306e9a] rounded-md shadow-sm focus-visible:!ring-[#306e9a]/20 focus-visible:!border-[#306e9a] bg-white">
                  <SelectValue placeholder="Select a program" />
                </SelectTrigger>
                <SelectContent>
                  {availablePrograms.map((p) => (
                    <SelectItem
                      key={p}
                      value={p}
                      className="focus:!bg-[#eef6fc] focus:!text-[#306e9a] data-[state=checked]:!text-[#306e9a]"
                    >
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
 
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleCsvFile(file);
                // allow re-uploading same file
                e.target.value = '';
              }}
            />
 
            <div
              aria-disabled={!bulkSelectedProgram}
              className={[
                'rounded-md border border-dashed px-4 py-4 transition-colors',
                !bulkSelectedProgram && 'opacity-60 border-gray-200 bg-gray-100',
                bulkSelectedProgram && isDragActive && 'border-[#306e9a] bg-[#eef6fc]',
                bulkSelectedProgram && !isDragActive && 'border-gray-300 bg-gray-50',
              ]
                .filter(Boolean)
                .join(' ')}
              onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!bulkSelectedProgram) {
                  e.dataTransfer.dropEffect = 'none';
                  return;
                }
                e.dataTransfer.dropEffect = 'copy';
                setIsDragActive(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!bulkSelectedProgram) {
                  e.dataTransfer.dropEffect = 'none';
                  return;
                }
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
                if (!bulkSelectedProgram) return;
                const file = e.dataTransfer.files?.[0];
                if (file) handleCsvFile(file);
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-gray-700">
                  <div className="font-medium">
                    {bulkSelectedProgram ? 'Drag & drop your CSV here' : 'Select a program to enable upload'}
                  </div>
                  <div className="text-gray-500">
                    {bulkSelectedProgram ? 'or use the Upload CSV button.' : 'Then you can drag and drop or use Upload CSV.'}
                  </div>
                </div>
                <Button
                  type="button"
                  className="bg-gray-200 text-gray-800 hover:bg-gray-300 shadow-sm disabled:opacity-50 disabled:pointer-events-none"
                  disabled={!bulkSelectedProgram}
                  onClick={() => {
                    if (!bulkSelectedProgram) return;
                    csvInputRef.current?.click();
                  }}
                >
                  Upload CSV
                </Button>
              </div>
 
              {bulkUploadFileName ? (
                <div className="mt-3 text-xs text-gray-600">
                  Selected file: <span className="font-medium">{bulkUploadFileName}</span>
                  {isUploadingCsv ? <span className="ml-2 text-gray-500">(uploading…)</span> : null}
                </div>
              ) : null}
 
              {bulkUploadError ? (
                <div className="mt-3 text-sm text-red-600">{bulkUploadError}</div>
              ) : bulkUploadSuccess ? (
                <div className="mt-3 text-sm text-green-700">{bulkUploadSuccess}</div>
              ) : null}
            </div>
          </div>
 
          <DialogFooter>
            <Button
              type="button"
              className="bg-[#306e9a] hover:bg-[#255577] text-white shadow-sm"
              disabled={!bulkSelectedProgram}
              onClick={() => {
                if (!bulkSelectedProgram) return;
                const csv = buildDemandTemplateCsv(bulkSelectedProgram);
                downloadCsv(csv, `Demand_Forecast_Template_${bulkSelectedProgram}.csv`);
              }}
            >
              Download template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
 
      <div className="bg-white rounded-xl   border border-gray-200 shadow-sm">
        {/* Static column header (outside accordions) */}
        <div className="rounded-t-xl bg-[#306e9a] px-4 py-4 shadow-sm">
          {viewMode === 'program' ? (
            <div className="grid grid-cols-[1.5fr_1.1fr_1.7fr_1.1fr_1fr] gap-4 text-sm font-semibold text-white">
              <div className="cursor-pointer -m-1 p-1 rounded transition-colors select-none flex items-center" onClick={() => handleSort('keyName')}>PROGRAM {getSortIcon('keyName')}</div>
              <div className="cursor-pointer -m-1 p-1 rounded transition-colors select-none flex items-center" onClick={() => handleSort('startDate')}>START DATE {getSortIcon('startDate')}</div>
              <div className="cursor-pointer -m-1 p-1 rounded transition-colors select-none flex items-center" onClick={() => handleSort('uniquePartsOrProgramsLabel')}>PARTS {getSortIcon('uniquePartsOrProgramsLabel')}</div>
              <div className="cursor-pointer -m-1 p-1 rounded transition-colors select-none flex items-center" onClick={() => handleSort('status')}>STATUS {getSortIcon('status')}</div>
              <div className="text-right cursor-pointer -m-1 p-1 rounded transition-colors select-none flex items-center justify-end" onClick={() => handleSort('totalDemand')}>TOTAL DEMAND {getSortIcon('totalDemand')}</div>
            </div>
          ) : (
            <div className="grid grid-cols-[1.8fr_1.7fr_1.3fr] gap-4 text-sm font-semibold text-white">
              <div className="cursor-pointer -m-1 p-1 rounded transition-colors select-none flex items-center" onClick={() => handleSort('keyName')}>Part Number {getSortIcon('keyName')}</div>
              <div className="cursor-pointer -m-1 p-1 rounded transition-colors select-none flex items-center" onClick={() => handleSort('uniquePartsOrProgramsLabel')}>Programs {getSortIcon('uniquePartsOrProgramsLabel')}</div>
              <div className="text-right cursor-pointer -m-1 p-1 rounded transition-colors select-none flex items-center justify-end" onClick={() => handleSort('totalDemand')}>Total Demand {getSortIcon('totalDemand')}</div>
            </div>
          )}
        </div>
 
        {/* Accordion List */}
        <div className="w-full flex flex-col">
        {paginatedData.length > 0 ? (
          viewMode === 'program'
            ? paginatedData.map(item => (
                <ProgramAccordion
                  key={item.keyName}
                  program={item.keyName}
                  partsData={item.data}
                  allColumns={demandData.columns}
                  onDataChange={handleDataChange}
                />
              ))
            : paginatedData.map(item => (
                <PartNumberAccordion
                  key={item.keyName}
                  partNumber={item.keyName}
                  programsData={item.data}
                  allColumns={demandData.columns}
                  onDataChange={handleDataChange}
                />
              ))
        ) : (
          <div className="p-8 text-center text-gray-500 bg-white">
            No items match your query.
          </div>
        )}
      </div>
 
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={endIndex}
        totalItems={currentViewData.length}
        onPageChange={setCurrentPage}
      />
    </div>
  </div>
);
}
