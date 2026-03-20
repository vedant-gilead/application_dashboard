import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, AlertCircle, X, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '../components/ui/drawer';
import HierarchyAccordion from '../components/HierarchyAccordion';
import studiesMasterData from '../../data/studiesMasterData.json';

const getAllStudiesData = () => {
  const baseData = studiesMasterData.data || [];
  try {
    const stored = localStorage.getItem('studiesMasterDataNewStudies');
    const newStudies = stored ? JSON.parse(stored) : [];
    return [...baseData, ...newStudies];
  } catch (e) {
    return baseData;
  }
};

const uniqueBy = (arr, keyFn) => {
  const seen = new Set();
  return arr.filter((item) => {
    const k = keyFn(item);
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

const getExistingFinishedGoods = () => {
  const items = getAllStudiesData().flatMap((study) => study.children || []).map((fg) => ({ ...fg, type: 'fg' }));
  return uniqueBy(items, (fg) => fg.id || fg.name);
};

const getExistingDrugProducts = () => {
  const items = getAllStudiesData()
    .flatMap((study) => study.children || [])
    .flatMap((fg) => fg.children || [])
    .map((dp) => ({ ...dp, type: 'dp' }));
  return uniqueBy(items, (dp) => dp.id || dp.name);
};

const getExistingDrugSubstances = () => {
  const items = getAllStudiesData()
    .flatMap((study) => study.children || [])
    .flatMap((fg) => fg.children || [])
    .flatMap((dp) => dp.children || [])
    .map((ds) => ({ ...ds, type: 'ds' }));
  return uniqueBy(items, (ds) => ds.id || ds.name);
};

const ErrorMessage = ({ message }) => {
  if (!message) return null;
  return (
    <div className="flex items-center gap-1.5 mt-1.5 text-red-500 text-[13px] font-medium bg-red-50/50 p-2 rounded-lg border border-red-100">
      <AlertCircle className="w-4 h-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
};

const inputClassName = "w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#306e9a]/20 focus:border-[#306e9a] transition-all bg-white shadow-sm mt-1.5 placeholder:text-gray-400";
const labelClassName = "block text-[13px] font-bold text-slate-700 uppercase tracking-wider";

export default function Study_Create() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [studyName, setStudyName] = useState('');
  const [studyDescription, setStudyDescription] = useState('');
  const [studyType, setStudyType] = useState('Clinical Trial Phase I');
  const [startDate, setStartDate] = useState('');
  const [studyOwner, setStudyOwner] = useState('');

  const [createdFGs, setCreatedFGs] = useState([]);
  const [structureFGs, setStructureFGs] = useState([]);

  const [selectedStudyFG, setSelectedStudyFG] = useState(null);
  const [selectedStudyFGIds, setSelectedStudyFGIds] = useState([]);
  const [selectedStudyDP, setSelectedStudyDP] = useState(null);
  const [selectedStudyDS, setSelectedStudyDS] = useState(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('dp'); // 'dp' | 'ds'
  const [usingNewDP, setUsingNewDP] = useState(false);
  const [usingNewDS, setUsingNewDS] = useState(false);

  const [formErrors, setFormErrors] = useState({});

  const [newFpName, setNewFpName] = useState('');
  const [newFpDescription, setNewFpDescription] = useState('');

  const [newDpName, setNewDpName] = useState('');
  const [newDpManufacturing, setNewDpManufacturing] = useState('');
  const [newDpDsName, setNewDpDsName] = useState('');
  const [newDpDsCode, setNewDpDsCode] = useState('');
  const [newDpDsList, setNewDpDsList] = useState([]);
  const [selectedExistingDpIds, setSelectedExistingDpIds] = useState([]);
  const [selectedExistingDsIds, setSelectedExistingDsIds] = useState([]);
  const [newFpNewDpList, setNewFpNewDpList] = useState([]);


  const existingFGs = useMemo(() => getExistingFinishedGoods(), []);
  const existingDPs = useMemo(() => getExistingDrugProducts(), []);
  const existingDSs = useMemo(() => getExistingDrugSubstances(), []);

  const availableFGs = useMemo(() => [...existingFGs, ...createdFGs], [existingFGs, createdFGs]);

  const currentFgs = useMemo(() => structureFGs, [structureFGs]);

  const liveHierarchy = useMemo(() => {
    const focusStudy = {
      id: 'new-study',
      studyName: studyName || 'New Study',
      studyDescription: studyDescription || 'No description yet',
      finishedGoods: `${currentFgs.length} FGs`,
      drugProducts: `${currentFgs.reduce((acc, fg) => acc + (fg.children?.length || 0), 0)} DPs`,
      drugSubstances: `${currentFgs.reduce(
        (acc, fg) =>
          acc +
          (fg.children || []).reduce((acc2, dp) => acc2 + (dp.children?.length || 0), 0),
        0,
      )} DSs`,
      status: 'In Progress',
      lastUpdated: new Date().toLocaleDateString(),
      children: currentFgs,
    };
    return [focusStudy];
  }, [studyName, studyDescription, currentFgs]);

  const resetDrawer = () => {
    setIsDrawerOpen(false);
    setNewFpName('');
    setNewFpDescription('');
    setUsingNewDP(false);
    setUsingNewDS(false);
    setNewDpName('');
    setNewDpManufacturing('');
    setNewDpDsName('');
    setNewDpDsCode('');
    setNewDpDsList([]);
    setSelectedExistingDpIds([]);
    setSelectedExistingDsIds([]);
    setNewFpNewDpList([]);
  };

  const addNewDpDs = () => {
    if (!newDpDsName.trim()) {
      setFormErrors((prev) => ({ ...prev, newDsName: 'Drug Substance name is required.' }));
      return;
    }
    setNewDpDsList((prev) => [
      ...prev,
      {
        id: `new-ds-${Date.now()}`,
        name: newDpDsName,
        code: newDpDsCode || '',
        type: 'ds',
      },
    ]);
    setNewDpDsName('');
    setNewDpDsCode('');
    setFormErrors((prev) => ({ ...prev, newDsName: '', newDsSelection: '' }));
  };

  const addNewFpDp = () => {
    if (!newDpName.trim()) {
      setFormErrors((prev) => ({ ...prev, newDpName: 'Drug Product name is required.' }));
      return;
    }
    const filteredExistingDs = existingDSs.filter((ds) => selectedExistingDsIds.includes(ds.id));
    const allDsForNewDp = [...filteredExistingDs, ...newDpDsList];
    
    if (allDsForNewDp.length === 0) {
      setFormErrors((prev) => ({ ...prev, newDsSelection: 'Please select or create at least one Drug Substance.' }));
      return;
    }

    setNewFpNewDpList((prev) => [
      ...prev,
      {
        id: `new-dp-${Date.now()}-${Math.random()}`,
        name: newDpName,
        manufacturing: newDpManufacturing,
        type: 'dp',
        children: allDsForNewDp,
      },
    ]);

    setNewDpName('');
    setNewDpManufacturing('');
    setSelectedExistingDsIds([]);
    setNewDpDsList([]);
    setFormErrors((prev) => ({ ...prev, newDsSelection: '', newDpName: '' }));
  };

  const handleSaveNewFp = () => {
    if (!validateDrawerForm()) return;

    let dpForFp = null;
    if (usingNewDP) {
      let wipDp = null;
      if (newDpName.trim()) {
        const filteredExistingDs = existingDSs.filter((ds) => selectedExistingDsIds.includes(ds.id));
        const allDsForNewDp = [...filteredExistingDs, ...newDpDsList];
        
        if (allDsForNewDp.length > 0) {
          wipDp = {
            id: `new-dp-${Date.now()}-wip`,
            name: newDpName,
            manufacturing: newDpManufacturing,
            type: 'dp',
            children: allDsForNewDp,
          };
        }
      }
      
      const combinedDps = [...newFpNewDpList];
      if (wipDp) combinedDps.push(wipDp);

      if (combinedDps.length === 0) {
        setFormErrors((prev) => ({ ...prev, newDpSelection: 'Please create at least one Drug Product.' }));
        return;
      }
      dpForFp = combinedDps;
    } else if (selectedExistingDpIds.length > 0) {
      const foundDPs = existingDPs.filter((dp) => selectedExistingDpIds.includes(dp.id));
      if (foundDPs.length > 0) {
        dpForFp = foundDPs.map((dp) => ({
          ...dp,
          type: 'dp',
          children: dp.children || [],
        }));
      }
    }

    if (!dpForFp || (Array.isArray(dpForFp) && dpForFp.length === 0)) {
      setFormErrors((prev) => ({ ...prev, newDpSelection: 'Please select or create at least one Drug Product.' }));
      return;
    }

    const newFg = {
      id: `new-fg-${Date.now()}`,
      name: newFpName,
      description: newFpDescription,
      type: 'fg',
      children: Array.isArray(dpForFp) ? dpForFp : dpForFp ? [dpForFp] : [],
    };

    setCreatedFGs((prev) => [...prev, newFg]);
    setStructureFGs((prev) => [...prev, newFg]);
    setSelectedStudyFG(newFg);

    const firstDp = (newFg.children && newFg.children.length > 0 && newFg.children[0]) || null;
    setSelectedStudyDP(firstDp);
    setSelectedStudyDS(firstDp?.children?.[0] ?? null);

    resetDrawer();
  };

  const handleSelectFG = (fg) => {
    setSelectedStudyDP(null);
    setSelectedStudyDS(null);

    const isAlreadySelected = selectedStudyFGIds.includes(fg.id);
    const updatedSelectedIds = isAlreadySelected
      ? selectedStudyFGIds.filter((id) => id !== fg.id)
      : [...selectedStudyFGIds, fg.id];

    const updatedStructureFGs = isAlreadySelected
      ? structureFGs.filter((item) => item.id !== fg.id)
      : structureFGs.some((item) => item.id === fg.id)
      ? structureFGs
      : [...structureFGs, { ...fg, children: fg.children ? [...fg.children] : [] }];

    setSelectedStudyFGIds(updatedSelectedIds);
    setStructureFGs(updatedStructureFGs);

    if (!isAlreadySelected) {
      setSelectedStudyFG(fg);
      const firstDp = fg.children?.[0] ?? null;
      setSelectedStudyDP(firstDp);
      setSelectedStudyDS(firstDp?.children?.[0] ?? null);
    } else if (selectedStudyFG?.id === fg.id) {
      const nextSelectedFG = updatedSelectedIds.length > 0 ? updatedStructureFGs.find((item) => item.id === updatedSelectedIds[0]) : null;
      setSelectedStudyFG(nextSelectedFG);
      const firstDp = nextSelectedFG?.children?.[0] ?? null;
      setSelectedStudyDP(firstDp);
      setSelectedStudyDS(firstDp?.children?.[0] ?? null);
    }
  };

  const handleSelectDP = (dp) => {
    setSelectedStudyDP(dp);
    setSelectedStudyDS(null);
  };

  const handleAddDPToFG = () => {
    if (!selectedStudyFG || !selectedStudyDP) return;
    setStructureFGs((prev) =>
      prev.map((fg) => {
        if (fg.id !== selectedStudyFG.id) return fg;
        const existingDp = (fg.children || []).some((d) => d.id === selectedStudyDP.id);
        if (existingDp) return fg;
        return {
          ...fg,
          children: [...(fg.children || []), { ...selectedStudyDP, children: selectedStudyDP.children ? [...selectedStudyDP.children] : [] }],
        };
      }),
    );
  };

  const handleSelectDS = (ds) => {
    setSelectedStudyDS(ds);
  };

  const handleAddDSToDP = () => {
    if (!selectedStudyFG || !selectedStudyDP || !selectedStudyDS) return;
    setStructureFGs((prev) =>
      prev.map((fg) => {
        if (fg.id !== selectedStudyFG.id) return fg;
        return {
          ...fg,
          children: (fg.children || []).map((dp) => {
            if (dp.id !== selectedStudyDP.id) return dp;
            const existingDs = (dp.children || []).some((d) => d.id === selectedStudyDS.id);
            if (existingDs) return dp;
            return {
              ...dp,
              children: [...(dp.children || []), selectedStudyDS],
            };
          }),
        };
      }),
    );
  };

  const validateStep1 = () => {
    const errors = {};
    if (!studyName.trim()) errors.studyName = 'Study Name is required.';
    if (!studyType.trim()) errors.studyType = 'Study Type is required.';
    if (!startDate.trim()) errors.startDate = 'Start Date is required.';
    if (!studyOwner.trim()) errors.studyOwner = 'Study Owner is required.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateDrawerForm = () => {
    const errors = {};
    if (drawerMode === 'fp') {
      if (!newFpName.trim()) errors.newFpName = 'Finished Product name is required.';
      if (!usingNewDP && selectedExistingDpIds.length === 0) errors.newDpSelection = 'Select or create at least one Drug Product.';
      if (usingNewDP && !(newFpNewDpList.length > 0 || newDpName.trim())) {
        errors.newDpSelection = 'Add at least one new Drug Product.';
      }
    }
    if (drawerMode === 'dp') {
      if (!selectedStudyFG) errors.newDpError = 'Select or add a Finished Product first.';
      if (!newDpName.trim()) errors.newDpName = 'Drug Product name is required.';
    }
    if (drawerMode === 'ds') {
      if (!selectedStudyFG) errors.newDsError = 'Select a Finished Product first.';
      if (!selectedStudyDP) errors.newDsError = 'Select a Drug Product first.';
      if (!newDpDsName.trim()) errors.newDsName = 'Drug Substance name is required.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextFromFG = () => {
    if (!selectedStudyFG) return;
    setStep(3);
  };

  const drawerTitle =
    drawerMode === 'fp'
      ? 'Create Finished Product'
      : drawerMode === 'dp'
      ? 'Create Drug Product'
      : 'Create Drug Substance';

  const handleSaveNewDp = () => {
    if (!validateDrawerForm()) return;

    const newDp = {
      id: `new-dp-${Date.now()}`,
      name: newDpName,
      manufacturing: newDpManufacturing,
      type: 'dp',
      children: newDpDsList,
    };

    setStructureFGs((prev) => {
      const targetIndex = prev.findIndex((fg) => fg.id === selectedStudyFG.id);
      if (targetIndex === -1) {
        return [...prev, { ...selectedStudyFG, children: [newDp] }];
      }
      return prev.map((fg) => {
        if (fg.id !== selectedStudyFG.id) return fg;
        const existingDp = (fg.children || []).some((dp) => dp.id === newDp.id);
        return {
          ...fg,
          children: existingDp ? fg.children : [...(fg.children || []), newDp],
        };
      });
    });

    setSelectedStudyFG((prev) => ({
      ...prev,
      children: [...(prev?.children || []), newDp],
    }));
    setSelectedStudyDP(newDp);
    setSelectedStudyDS(null);
    resetDrawer();
  };

  const handleSaveNewDs = () => {
    if (!validateDrawerForm()) return;

    const newDs = {
      id: `new-ds-${Date.now()}`,
      name: newDpDsName,
      code: newDpDsCode || '',
      type: 'ds',
    };

    setStructureFGs((prev) =>
      prev.map((fg) => {
        if (fg.id !== selectedStudyFG.id) return fg;
        return {
          ...fg,
          children: (fg.children || []).map((dp) => {
            if (dp.id !== selectedStudyDP.id) return dp;
            const existingDs = (dp.children || []).some((d) => d.id === newDs.id);
            return {
              ...dp,
              children: existingDs ? dp.children : [...(dp.children || []), newDs],
            };
          }),
        };
      }),
    );

    setSelectedStudyDP((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        children: [...(prev.children || []), newDs],
      };
    });
    setSelectedStudyDS(newDs);
    setNewDpDsName('');
    setNewDpDsCode('');
    resetDrawer();
  };

  const handleNextFromDP = () => {
    if (!selectedStudyDP) return;
    setStep(4);
  };

  const handleFinishStudy = async () => {
    const studyId = `new-${Date.now()}`;
    const finishedGoodsCount = structureFGs.length;
    const drugProductsCount = structureFGs.reduce((acc, fg) => acc + (fg.children?.length || 0), 0);
    const drugSubstancesCount = structureFGs.reduce(
      (acc, fg) =>
        acc +
        (fg.children || []).reduce((acc2, dp) => acc2 + (dp.children?.length || 0), 0),
      0,
    );

    const newStudy = {
      id: studyId,
      studyName: studyName || `New Study ${studyId}`,
      studyDescription: studyDescription || '',
      finishedGoods: `${finishedGoodsCount} FGs`,
      drugProducts: `${drugProductsCount} DPs`,
      drugSubstances: `${drugSubstancesCount} DSs`,
      status: 'Planned',
      lastUpdated: new Date().toLocaleDateString(),
      children: structureFGs,
    };


    try {
      const updatedData = {
        ...studiesMasterData,
        data: [...studiesMasterData.data, newStudy]
      };
      await fetch('/api/save-studies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
    } catch (e) {
      console.error('Failed to save study to disk:', e);
    }

    navigate('/studies_master_data');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Create Study</h1>
          <p className="text-gray-500 text-sm mt-1">Use this step flow to build the study hierarchy in a single page.</p>
        </div>
        <Button className="bg-gray-200 text-gray-800" onClick={() => navigate('/studies_master_data')}>
          Back to Studies
        </Button>
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Study Name *</label>
            <input
              value={studyName}
              onChange={(e) => {
                setStudyName(e.target.value);
                if (formErrors.studyName) setFormErrors((prev) => ({ ...prev, studyName: '' }));
              }}
              placeholder="e.g., abc"
              className="w-full rounded-lg border border-gray-300 p-2"
            />
            {formErrors.studyName && <p className="text-red-500 text-xs mt-1">{formErrors.studyName}</p>}

            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea value={studyDescription} onChange={(e) => setStudyDescription(e.target.value)} placeholder="Project description" className="w-full rounded-lg border border-gray-300 p-2" />

            <label className="block text-sm font-medium text-gray-700">Study Type *</label>
            <select
              value={studyType}
              onChange={(e) => {
                setStudyType(e.target.value);
                if (formErrors.studyType) setFormErrors((prev) => ({ ...prev, studyType: '' }));
              }}
              className="w-full rounded-lg border border-gray-300 p-2"
            >
              <option>Clinical Trial Phase I</option>
              <option>Clinical Trial Phase II</option>
              <option>Clinical Trial Phase III</option>
              <option>Non-Clinical</option>
            </select>
            {formErrors.studyType && <p className="text-red-500 text-xs mt-1">{formErrors.studyType}</p>}

            <label className="block text-sm font-medium text-gray-700">Start Date *</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (formErrors.startDate) setFormErrors((prev) => ({ ...prev, startDate: '' }));
              }}
              className="w-full rounded-lg border border-gray-300 p-2"
            />
            {formErrors.startDate && <p className="text-red-500 text-xs mt-1">{formErrors.startDate}</p>}

            <label className="block text-sm font-medium text-gray-700">Study Owner *</label>
            <input
              value={studyOwner}
              onChange={(e) => {
                setStudyOwner(e.target.value);
                if (formErrors.studyOwner) setFormErrors((prev) => ({ ...prev, studyOwner: '' }));
              }}
              placeholder="e.g., VanJain"
              className="w-full rounded-lg border border-gray-300 p-2"
            />
            {formErrors.studyOwner && <p className="text-red-500 text-xs mt-1">{formErrors.studyOwner}</p>}


            <div className="pt-2">
              <Button className="bg-[#306e9a] text-white" onClick={() => { if (validateStep1()) setStep(2); }}>
                Next Step
              </Button>
            </div>
          </div>

          <div className="bg-[#f8fafc] p-4 rounded-lg border border-gray-200">
            <h2 className="font-semibold text-gray-800">Study Structure Preview</h2>
            <p className="text-xs text-gray-500 mt-2">This updates as you add products.</p>
            <div className="mt-4">
              <HierarchyAccordion columns={studiesMasterData.columns} data={liveHierarchy} />
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Step 2: Choose Finished Good</h2>
              <Button className="bg-[#306e9a] text-white" onClick={() => { setDrawerMode('fp'); setIsDrawerOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />Finished Good
              </Button>
            </div>

            <div className="max-h-[350px] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableFGs.map((fg) => {
                  const isAddedToStructure = structureFGs.some(sFg => sFg.id === fg.id);
                  const isSelected = isAddedToStructure || selectedStudyFGIds.includes(fg.id);
                return (
                  <div
                    key={fg.id}
                    className={`rounded-lg border p-4 cursor-pointer ${isSelected ? 'border-[#306e9a] bg-[#eef6fc]' : 'border-gray-200 bg-white'} ${isAddedToStructure ? 'opacity-80' : ''}`}
                    onClick={() => handleSelectFG(fg)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{fg.name || fg.studyName || 'Unnamed FP'}</div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isAddedToStructure}
                        className={isAddedToStructure ? 'cursor-not-allowed' : ''}
                        onChange={() => {
                          if (isAddedToStructure) return;
                          if (isSelected) {
                            setSelectedStudyFGIds((prev) => prev.filter((id) => id !== fg.id));
                          } else {
                            setSelectedStudyFGIds((prev) => [...prev, fg.id]);
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{fg.description || fg.studyDescription || 'No description'}</div>
                    <div className="mt-2 text-xs text-gray-600">DPs: {fg.children?.length || 0}</div>
                  </div>
                );
              })}
            </div>
          </div>

            <div className="flex gap-2">
              <Button className="bg-[#306e9a] text-white" onClick={handleFinishStudy} disabled={structureFGs.length === 0}>
                Finish Study
              </Button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h3 className="font-semibold">Study Structure</h3>
            <p className="text-xs text-gray-500 mt-1">In progress tree, no existing studies included.</p>
            <div className="mt-4">
              <HierarchyAccordion columns={studiesMasterData.columns} data={liveHierarchy} />
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Step 3: Select Drug Product for {selectedStudyFG?.name}</h2>
              <Button className="bg-[#306e9a] text-white" onClick={() => { setDrawerMode('dp'); setIsDrawerOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" /> Create New Drug Product in Selected Finished Good
              </Button>
            </div>

            <div className="space-y-3">
              {selectedStudyFG ? (
                (selectedStudyFG.children || []).length > 0 ? (
                  (selectedStudyFG.children || []).map((dp) => (
                    <div key={dp.id} className={`rounded-lg border p-3 cursor-pointer ${selectedStudyDP?.id === dp.id ? 'border-[#306e9a] bg-[#eef6fc]' : 'border-gray-200 bg-white'}`} onClick={() => handleSelectDP(dp)}>
                      <div className="font-medium">{dp.name}</div>
                      <div className="text-xs text-gray-500">{dp.manufacturing || ''}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">No drug products in this finished good yet.</div>
                )
              ) : (
                <div className="text-sm text-gray-500">Select or add a finished good first.</div>
              )}
            </div>

            <div className="flex gap-2">
              <Button className="bg-slate-200 text-slate-800" onClick={handleAddDPToFG} disabled={!selectedStudyDP || !selectedStudyFG}>
                Add Selected DP to Current FP
              </Button>
              <Button className="bg-[#306e9a] text-white" onClick={handleNextFromDP} disabled={!selectedStudyDP}>
                Next: Select Drug Substance
              </Button>
            </div>

            <div>
              <Button className="bg-gray-200 text-gray-700" onClick={() => setStep(2)}>
                Back to FP Step
              </Button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h3 className="font-semibold">Study Structure</h3>
            <p className="text-xs text-gray-500 mt-1">In progress hierarchical tree.</p>
            <div className="mt-4">
              <HierarchyAccordion columns={studiesMasterData.columns} data={liveHierarchy} />
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Step 4: Select Drug Substance for {selectedStudyDP?.name}</h2>
              <Button className="bg-[#306e9a] text-white" onClick={() => { setDrawerMode('ds'); setIsDrawerOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" /> Create New DS in Selected DP
              </Button>
            </div>

            <div className="space-y-3">
              {selectedStudyDP ? (
                (selectedStudyDP.children || []).length > 0 ? (
                  (selectedStudyDP.children || []).map((ds) => (
                    <div key={ds.id} className={`rounded-lg border p-3 cursor-pointer ${selectedStudyDS?.id === ds.id ? 'border-[#306e9a] bg-[#eef6fc]' : 'border-gray-200 bg-white'}`} onClick={() => handleSelectDS(ds)}>
                      <div className="font-medium">{ds.name}</div>
                      <div className="text-xs text-gray-500">{ds.code || ''}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">No drug substances in this drug product yet.</div>
                )
              ) : (
                <div className="text-sm text-gray-500">Select or add a drug product first.</div>
              )}
            </div>

            <div className="flex gap-2">
              <Button className="bg-slate-200 text-slate-800" onClick={handleAddDSToDP} disabled={!selectedStudyDS || !selectedStudyDP}>
                Add Selected DS to Current DP
              </Button>
              <Button className="bg-[#306e9a] text-white" onClick={handleFinishStudy} disabled={!selectedStudyDS}>
                Finish Study
              </Button>
            </div>

            <div>
              <Button className="bg-gray-200 text-gray-700" onClick={() => setStep(3)}>
                Back to DP Step
              </Button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h3 className="font-semibold">Study Structure</h3>
            <p className="text-xs text-gray-500 mt-1">In progress hierarchical tree.</p>
            <div className="mt-4">
              <HierarchyAccordion columns={studiesMasterData.columns} data={liveHierarchy} />
            </div>
          </div>
        </div>
      )}

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} direction="right">
        <DrawerContent className="w-[1200px] max-w-full">
          <DrawerHeader>
            <div className="flex justify-between items-center">
              <DrawerTitle>{drawerTitle}</DrawerTitle>
              <DrawerClose asChild>
                <Button className="text-gray-500 bg-transparent hover:bg-gray-100" onClick={resetDrawer}>
                  Close
                </Button>
              </DrawerClose>
            </div>
            <DrawerDescription>
              {drawerMode === 'fp' && 'Create a new finished product and specify its drug products.'}
              {drawerMode === 'dp' && (selectedStudyFG ? `Add a new drug product to FP ${selectedStudyFG.name}.` : 'Select a finished good first to add drug products.')}
              {drawerMode === 'ds' && (selectedStudyDP ? `Add a new drug substance to DP ${selectedStudyDP.name}.` : 'Select a drug product first to add drug substances.')}
            </DrawerDescription>
          </DrawerHeader>

          <div className="space-y-6 p-6 flex-1 overflow-y-auto bg-gray-50/30">
            {drawerMode === 'fp' && (
              <div className="max-w-4xl mx-auto space-y-8">
                {/* FP Details Section */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3">Finished Product Details</h3>
                  <div>
                    <label className={labelClassName}>Finished Product Name <span className="text-red-500">*</span></label>
                    <input
                      className={`${inputClassName} ${formErrors.newFpName ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50/10' : ''}`}
                      value={newFpName}
                      onChange={(e) => {
                        setNewFpName(e.target.value);
                        if (formErrors.newFpName) setFormErrors((prev) => ({ ...prev, newFpName: '' }));
                      }}
                      placeholder="e.g., New FP Name"
                    />
                    <ErrorMessage message={formErrors.newFpName} />
                  </div>

                  <div>
                    <label className={labelClassName}>Finished Product Description</label>
                    <textarea 
                      className={`${inputClassName} min-h-[100px] resize-y`}
                      value={newFpDescription} 
                      onChange={(e) => setNewFpDescription(e.target.value)} 
                      placeholder="Enter a detailed description..." 
                    />
                  </div>
                </div>

                {/* DP Section */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
                    <h3 className="text-lg font-semibold text-gray-900">Drug Product Association</h3>
                    <span className="bg-blue-50 text-[#306e9a] text-xs font-bold px-2.5 py-1 rounded-md">REQUIRED</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${!usingNewDP ? 'border-[#306e9a] bg-[#f4f9fd] ring-1 ring-[#306e9a] shadow-sm' : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}>
                      <div className="relative flex items-center justify-center">
                        <input type="radio" checked={!usingNewDP} onChange={() => setUsingNewDP(false)} className="sr-only" />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${!usingNewDP ? 'border-[#306e9a]' : 'border-gray-300'}`}>
                          {!usingNewDP && <div className="w-2.5 h-2.5 rounded-full bg-[#306e9a]" />}
                        </div>
                      </div>
                      <div className="ml-3">
                        <span className={`block font-semibold text-sm ${!usingNewDP ? 'text-[#306e9a]' : 'text-gray-700'}`}>Select Existing</span>
                        <span className="block text-xs text-gray-500 mt-0.5">Choose from standard registry</span>
                      </div>
                    </label>
                    
                    <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${usingNewDP ? 'border-[#306e9a] bg-[#f4f9fd] ring-1 ring-[#306e9a] shadow-sm' : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}>
                      <div className="relative flex items-center justify-center">
                        <input type="radio" checked={usingNewDP} onChange={() => setUsingNewDP(true)} className="sr-only" />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${usingNewDP ? 'border-[#306e9a]' : 'border-gray-300'}`}>
                          {usingNewDP && <div className="w-2.5 h-2.5 rounded-full bg-[#306e9a]" />}
                        </div>
                      </div>
                      <div className="ml-3">
                        <span className={`block font-semibold text-sm ${usingNewDP ? 'text-[#306e9a]' : 'text-gray-700'}`}>Create New DP</span>
                        <span className="block text-xs text-gray-500 mt-0.5">Define a custom product</span>
                      </div>
                    </label>
                  </div>

                  {!usingNewDP ? (
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                      <label className={labelClassName}>Available Drug Products</label>
                      <div className={`w-full rounded-xl border ${formErrors.newDpSelection ? 'border-red-300 ring-1 ring-red-200 bg-red-50/10' : 'border-gray-300 bg-white'} mt-2 max-h-56 overflow-y-auto shadow-inner`}>
                        <div className="p-2 space-y-1">
                          {existingDPs.map(dp => {
                            const isSelected = selectedExistingDpIds.includes(dp.id);
                            return (
                              <label key={dp.id} className={`flex items-center px-4 py-2.5 rounded-lg cursor-pointer transition-all ${isSelected ? 'bg-blue-50/80 text-[#306e9a]' : 'hover:bg-gray-50 text-gray-700'}`} onClick={(e) => {
                                e.preventDefault();
                                if (formErrors.newDpSelection) setFormErrors(prev => ({...prev, newDpSelection: ''}));
                                if (isSelected) setSelectedExistingDpIds(prev => prev.filter(id => id !== dp.id));
                                else setSelectedExistingDpIds(prev => [...prev, dp.id]);
                              }}>
                                <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${isSelected ? 'bg-[#306e9a] border-[#306e9a] text-white' : 'border-gray-300 bg-white text-transparent'}`}>
                                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                </div>
                                <span className="text-sm font-medium select-none flex-1">{dp.name}</span>
                                {dp.manufacturing && <span className="text-xs text-gray-400 select-none ml-2 truncate max-w-[200px]">{dp.manufacturing}</span>}
                              </label>
                            );
                          })}
                          {existingDPs.length === 0 && (
                            <div className="py-8 text-center text-sm text-gray-500">No existing drug products found.</div>
                          )}
                        </div>
                      </div>
                      <p className="text-[13px] text-gray-500 mt-2 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> Select one or multiple entries</p>
                      <ErrorMessage message={formErrors.newDpSelection} />
                    </div>
                  ) : (
                    <div className="space-y-5 bg-blue-50/30 p-6 rounded-xl border border-blue-100/50">
                      <div>
                        <label className={labelClassName}>New Drug Product Name <span className="text-red-500">*</span></label>
                        <input
                          className={`${inputClassName} ${formErrors.newDpName ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50/10' : ''}`}
                          value={newDpName}
                          onChange={(e) => {
                            setNewDpName(e.target.value);
                            if (formErrors.newDpName) setFormErrors((prev) => ({ ...prev, newDpName: '' }));
                          }}
                          placeholder="e.g., PC-XXXXX"
                        />
                        <ErrorMessage message={formErrors.newDpName} />
                      </div>

                      <div>
                        <label className={labelClassName}>Manufacturing Process</label>
                        <input className={inputClassName} value={newDpManufacturing} onChange={(e) => setNewDpManufacturing(e.target.value)} placeholder="e.g., Aseptic Fill-Finish" />
                      </div>

                      <div className="border-t border-gray-200/80 pt-6 mt-4">
                         <div className="flex items-center justify-between mb-4">
                           <h4 className="font-semibold text-gray-900">Drug Substance Dependencies</h4>
                           <span className="bg-blue-50 text-[#306e9a] border border-blue-100 text-[11px] px-2 py-0.5 rounded-full font-bold tracking-wide">REQUIRED</span>
                         </div>
                         
                         <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-5">
                           <div>
                             <label className={labelClassName}>Link Existing Drug Substance</label>
                              <div className={`w-full rounded-xl border ${formErrors.newDsSelection ? 'border-red-300 ring-1 ring-red-200 bg-red-50/10' : 'border-gray-300 bg-white'} mt-2 max-h-48 overflow-y-auto shadow-inner`}>
                                <div className="p-2 space-y-1">
                                  {existingDSs.map(ds => {
                                    const isSelected = selectedExistingDsIds.includes(ds.id);
                                    return (
                                      <label key={ds.id} className={`flex items-center px-4 py-2.5 rounded-lg cursor-pointer transition-all ${isSelected ? 'bg-blue-50/80 text-[#306e9a]' : 'hover:bg-gray-50 text-gray-700'}`} onClick={(e) => {
                                        e.preventDefault();
                                        if (formErrors.newDsSelection) setFormErrors(prev => ({...prev, newDsSelection: ''}));
                                        if (isSelected) setSelectedExistingDsIds(prev => prev.filter(id => id !== ds.id));
                                        else setSelectedExistingDsIds(prev => [...prev, ds.id]);
                                      }}>
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${isSelected ? 'bg-[#306e9a] border-[#306e9a] text-white' : 'border-gray-300 bg-white text-transparent'}`}>
                                          <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center leading-tight">
                                          <span className="text-sm font-medium">{ds.name}</span>
                                          {ds.code && <span className="text-[11px] text-gray-400 font-mono mt-0.5">{ds.code}</span>}
                                        </div>
                                      </label>
                                    );
                                  })}
                                  {existingDSs.length === 0 && (
                                    <div className="py-6 text-center text-[13px] text-gray-500">No existing drug substances found.</div>
                                  )}
                                </div>
                              </div>
                              <ErrorMessage message={formErrors.newDsSelection} />
                           </div>

                           <div className="relative flex items-center py-2">
                              <div className="flex-grow border-t border-gray-200"></div>
                              <span className="flex-shrink-0 mx-4 text-xs font-bold text-gray-400 uppercase tracking-widest">OR ADD NEW</span>
                              <div className="flex-grow border-t border-gray-200"></div>
                           </div>

                           <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col gap-3">
                             <div className="grid grid-cols-2 gap-3">
                               <div>
                                 <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">DS NAME</label>
                                 <input className={`w-full rounded-lg border ${formErrors.newDsName ? 'border-red-300 ring-1 ring-red-200 bg-red-50/10' : 'border-gray-300'} px-3 py-2 text-sm focus:ring-[#306e9a] focus:border-[#306e9a]`} placeholder="IP-XXXXX" value={newDpDsName} onChange={(e) => {
                                   setNewDpDsName(e.target.value);
                                   if (formErrors.newDsName) setFormErrors(prev => ({ ...prev, newDsName: '' }));
                                 }} />
                                 <ErrorMessage message={formErrors.newDsName} />
                               </div>
                               <div>
                                 <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">CODE (OPTIONAL)</label>
                                 <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-[#306e9a] focus:border-[#306e9a]" placeholder="e.g. MAB-X101" value={newDpDsCode} onChange={(e) => setNewDpDsCode(e.target.value)} />
                               </div>
                             </div>
                             <Button type="button" className="bg-[#306e9a] hover:bg-[#255577] text-white shadow-sm w-full md:w-auto self-end font-medium transition-colors" onClick={addNewDpDs}>
                               <Plus className="w-4 h-4 mr-1.5" /> Define Substance
                             </Button>
                           </div>
                           
                           {newDpDsList.length > 0 && (
                             <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                               <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Newly Defined Substances</h5>
                               <ul className="space-y-2">
                                 {newDpDsList.map((ds) => (
                                   <li key={ds.id} className="bg-white border text-sm border-blue-200/60 shadow-sm rounded-lg p-2.5 flex justify-between items-center group transition-colors hover:border-blue-300">
                                     <div className="flex items-center gap-2.5">
                                       <div className="w-1.5 h-1.5 rounded-full bg-[#306e9a]" />
                                       <span className="font-semibold text-gray-800">{ds.name}</span>
                                       {ds.code && <span className="font-mono text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">{ds.code}</span>}
                                     </div>
                                     <button type="button" className="text-gray-400 hover:text-red-500 transition-colors p-1" onClick={() => setNewDpDsList(prev => prev.filter(d => d.id !== ds.id))} title="Remove">
                                        <X className="w-4 h-4" />
                                     </button>
                                   </li>
                                 ))}
                               </ul>
                             </div>
                           )}
                         </div>
                         <Button type="button" className="bg-[#1f4a6b] hover:bg-[#16364f] text-white w-full py-6 mt-6 shadow-md text-base rounded-xl font-semibold transition-all" onClick={addNewFpDp}>
                           ✔ Finalize & Add Drug Product
                         </Button>
                      </div>

                      {newFpNewDpList.length > 0 && (
                        <div className="mt-2 pt-6 border-t border-gray-200">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                             <span className="bg-[#306e9a] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">{newFpNewDpList.length}</span>
                             Custom Drug Products Added
                          </h4>
                          <ul className="grid gap-3">
                            {newFpNewDpList.map((dp) => (
                              <li key={dp.id} className="bg-white border border-[#306e9a]/30 shadow-sm rounded-xl p-4 flex justify-between items-start group">
                                <div>
                                  <div className="font-bold text-[#306e9a] text-base">{dp.name}</div>
                                  {dp.manufacturing && <div className="text-[13px] text-gray-600 mt-1 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-gray-300" /> Mfg: {dp.manufacturing}</div>}
                                  <div className="text-[12px] font-medium text-[#306e9a] mt-2 bg-blue-50 inline-block px-2 py-0.5 rounded border border-blue-100">
                                    {dp.children?.length || 0} DS Dependencies
                                  </div>
                                </div>
                                <button type="button" className="text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 p-2 rounded-lg transition-colors border border-transparent hover:border-red-100 mt-0.5" onClick={() => setNewFpNewDpList(prev => prev.filter(d => d.id !== dp.id))} title="Remove DP">
                                  <X className="w-4 h-4" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {drawerMode === 'dp' && (
              <div className="max-w-2xl mx-auto space-y-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mt-4">
                {!selectedStudyFG ? (
                  <div className="py-8 text-center text-[13px] text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <AlertCircle className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    Please return to Step 2 and choose a Finished Product first.
                  </div>
                ) : (
                  <>
                    {formErrors.newDpError && <ErrorMessage message={formErrors.newDpError} />}
                    <div>
                      <label className={labelClassName}>Drug Product Name <span className="text-red-500">*</span></label>
                      <input
                        className={`${inputClassName} ${formErrors.newDpName ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50/10' : ''}`}
                        value={newDpName}
                        onChange={(e) => {
                          setNewDpName(e.target.value);
                          if (formErrors.newDpName) setFormErrors((prev) => ({ ...prev, newDpName: '' }));
                        }}
                        placeholder="e.g., PC-XXXXX"
                      />
                      <ErrorMessage message={formErrors.newDpName} />
                    </div>

                    <div>
                      <label className={labelClassName}>Manufacturing Process</label>
                      <input className={inputClassName} value={newDpManufacturing} onChange={(e) => setNewDpManufacturing(e.target.value)} placeholder="e.g., Aseptic Fill-Finish" />
                    </div>

                    <div className="border-t border-gray-100 pt-6 mt-4">
                      <div className="flex items-center justify-between mb-4">
                        <label className={labelClassName}>Optional DS to link now</label>
                        <span className="bg-gray-100 text-gray-500 text-[11px] px-2 py-0.5 rounded-full font-bold tracking-wide">OPTIONAL</span>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <input className={`w-full rounded-lg border ${formErrors.newDsName ? 'border-red-300 ring-1 ring-red-200 bg-red-50/10' : 'border-gray-300'} px-3 py-2 text-sm focus:ring-[#306e9a] focus:border-[#306e9a]`} placeholder="DS Name" value={newDpDsName} onChange={(e) => {
                              setNewDpDsName(e.target.value);
                              if (formErrors.newDsName) setFormErrors(prev => ({ ...prev, newDsName: '' }));
                            }} />
                            <ErrorMessage message={formErrors.newDsName} />
                          </div>
                          <div>
                            <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-[#306e9a] focus:border-[#306e9a]" placeholder="DS Code" value={newDpDsCode} onChange={(e) => setNewDpDsCode(e.target.value)} />
                          </div>
                        </div>
                        <Button type="button" className="bg-slate-200 hover:bg-slate-300 text-slate-800 shadow-sm w-full md:w-auto self-end font-medium transition-colors" onClick={addNewDpDs}>
                          <Plus className="w-4 h-4 mr-1.5" /> Quick Add DS
                        </Button>
                      </div>

                      {newDpDsList.length > 0 && (
                        <ul className="mt-4 space-y-2">
                          {newDpDsList.map((ds) => (
                            <li key={ds.id} className="bg-white border text-sm border-gray-200 shadow-sm rounded-lg p-2.5 flex justify-between items-center group transition-colors hover:border-gray-300">
                              <div className="flex items-center gap-2.5">
                                <span className="font-semibold text-gray-800">{ds.name}</span>
                                {ds.code && <span className="font-mono text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">{ds.code}</span>}
                              </div>
                              <button type="button" className="text-gray-400 hover:text-red-500 transition-colors p-1" onClick={() => setNewDpDsList(prev => prev.filter(d => d.id !== ds.id))} title="Remove">
                                <X className="w-4 h-4" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {drawerMode === 'ds' && (
              <div className="max-w-xl mx-auto space-y-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mt-4">
                {!selectedStudyDP ? (
                  <div className="py-8 text-center text-[13px] text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                     <AlertCircle className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                     Please return to Step 3 and choose a Drug Product first.
                  </div>
                ) : (
                  <>
                    {formErrors.newDsError && <ErrorMessage message={formErrors.newDsError} />}
                    <div>
                      <label className={labelClassName}>Drug Substance Name <span className="text-red-500">*</span></label>
                      <input
                        className={`${inputClassName} ${formErrors.newDsName ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50/10' : ''}`}
                        value={newDpDsName}
                        onChange={(e) => {
                          setNewDpDsName(e.target.value);
                          if (formErrors.newDsName) setFormErrors((prev) => ({ ...prev, newDsName: '' }));
                        }}
                        placeholder="e.g., IP-XXXXX"
                      />
                      <ErrorMessage message={formErrors.newDsName} />
                    </div>

                    <div>
                      <label className={labelClassName}>Drug Substance Code</label>
                      <input className={inputClassName} value={newDpDsCode} onChange={(e) => setNewDpDsCode(e.target.value)} placeholder="e.g., MAB-X101 (Optional)" />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <DrawerFooter className="bg-white border-t border-gray-200 py-4 px-6 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex justify-end w-full gap-4 max-w-4xl mx-auto">
              <Button className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm px-6 font-medium" onClick={resetDrawer}>Cancel</Button>
              <Button
                className="bg-[#306e9a] hover:bg-[#255577] text-white shadow-sm px-8 font-semibold transition-colors"
                onClick={drawerMode === 'fp' ? handleSaveNewFp : drawerMode === 'dp' ? handleSaveNewDp : handleSaveNewDs}
              >
                Save {drawerMode === 'fp' ? 'Finished Product' : drawerMode === 'dp' ? 'Drug Product' : 'Drug Substance'}
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
