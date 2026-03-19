import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
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
  };

  const addNewFpDp = () => {
    if (!newDpName.trim()) {
      setFormErrors((prev) => ({ ...prev, newDpName: 'Drug Product name is required.' }));
      return;
    }
    const filteredExistingDs = existingDSs.filter((ds) => selectedExistingDsIds.includes(ds.id));
    const allDsForNewDp = [...filteredExistingDs, ...newDpDsList];
    
    if (allDsForNewDp.length === 0) {
      alert("Please select or create at least one Drug Substance for the new Drug Product.");
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
        alert("Please create at least one Drug Product for the Finished Product.");
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
      alert('Please select or create at least one Drug Product for the Finished Product.');
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

  const handleFinishStudy = () => {
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

    const stored = localStorage.getItem('studiesMasterDataNewStudies');
    const saved = stored ? JSON.parse(stored) : [];
    localStorage.setItem('studiesMasterDataNewStudies', JSON.stringify([...saved, newStudy]));

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

          <div className="space-y-4 p-4 flex-1 overflow-y-auto">
            {drawerMode === 'fp' && (
              <>
                <label className="block text-sm font-medium text-gray-700">Finished Good Name *</label>
                <input
                  className="w-full rounded-lg border border-gray-300 p-2"
                  value={newFpName}
                  onChange={(e) => {
                    setNewFpName(e.target.value);
                    if (formErrors.newFpName) setFormErrors((prev) => ({ ...prev, newFpName: '' }));
                  }}
                  placeholder="e.g., New FP Name"
                />
                {formErrors.newFpName && <p className="text-red-500 text-xs mt-1">{formErrors.newFpName}</p>}

                <label className="block text-sm font-medium text-gray-700">Finished Good Description</label>
                <textarea className="w-full rounded-lg border border-gray-300 p-2" value={newFpDescription} onChange={(e) => setNewFpDescription(e.target.value)} placeholder="e.g., Description..." />

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Drug Product (Required)</h3>
                  
                  <div className="flex items-center gap-6 mb-4">
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input type="radio" checked={!usingNewDP} onChange={() => setUsingNewDP(false)} />
                      Select Existing Drug Product
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input type="radio" checked={usingNewDP} onChange={() => setUsingNewDP(true)} />
                      Create New Drug Product
                    </label>
                  </div>

                  {!usingNewDP ? (
                    <div>
                      <select 
                        className="w-full rounded-lg border border-gray-300 p-2 h-32"
                        multiple
                        value={selectedExistingDpIds}
                        onChange={(e) => setSelectedExistingDpIds(Array.from(e.target.selectedOptions, option => option.value))}
                      >
                        {existingDPs.map(dp => (
                          <option key={dp.id} value={dp.id}>{dp.name}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                      {formErrors.newDpSelection && <p className="text-red-500 text-xs mt-1">{formErrors.newDpSelection}</p>}
                    </div>
                  ) : (
                    <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700">New Drug Product Name *</label>
                      <input
                        className="w-full rounded-lg border border-gray-300 p-2 bg-white"
                        value={newDpName}
                        onChange={(e) => {
                          setNewDpName(e.target.value);
                          if (formErrors.newDpName) setFormErrors((prev) => ({ ...prev, newDpName: '' }));
                        }}
                      />
                      {formErrors.newDpName && <p className="text-red-500 text-xs mt-1">{formErrors.newDpName}</p>}

                      <label className="block text-sm font-medium text-gray-700">Manufacturing</label>
                      <input className="w-full rounded-lg border border-gray-300 p-2 bg-white" value={newDpManufacturing} onChange={(e) => setNewDpManufacturing(e.target.value)} placeholder="e.g., Aseptic Fill-Finish" />

                      <div className="border-t border-gray-200 pt-4 mt-2">
                         <h4 className="font-semibold text-sm text-gray-800 mb-3">Drug Substance (Required for New Drug Product)</h4>
                         
                         <label className="block text-sm font-medium text-gray-700 mb-1">Select Existing Drug Substance</label>
                         <select 
                           className="w-full rounded-lg border border-gray-300 p-2 bg-white mb-1 h-24"
                           multiple
                           value={selectedExistingDsIds}
                           onChange={(e) => setSelectedExistingDsIds(Array.from(e.target.selectedOptions, option => option.value))}
                         >
                           {existingDSs.map(ds => (
                             <option key={ds.id} value={ds.id}>{ds.name} ({ds.code || 'No Code'})</option>
                           ))}
                         </select>
                         <p className="text-xs text-gray-500 mb-4">Hold Ctrl/Cmd to select multiple</p>

                         <label className="block text-sm font-medium text-gray-700 mb-2">Or Create New Drug Substance</label>
                         <div className="gap-2 mb-2">
                           <input className="w-full rounded-lg border border-gray-300 p-2 bg-white mb-6" placeholder="Drug Substance Name" value={newDpDsName} onChange={(e) => setNewDpDsName(e.target.value)} />
                           <input className="w-full rounded-lg border border-gray-300 p-2 bg-white mb-6" placeholder="Drug Substance Code" value={newDpDsCode} onChange={(e) => setNewDpDsCode(e.target.value)} />
                           <Button type="button" className="bg-[#306e9a] text-white shrink-0" onClick={addNewDpDs}>Add Drug Substance</Button>
                         </div>
                         
                         {newDpDsList.length > 0 && (
                           <ul className="text-sm text-gray-700 space-y-2 mt-3 mb-2">
                             {newDpDsList.map((ds) => (
                               <li key={ds.id} className="border border-gray-200 bg-white rounded p-2 flex justify-between items-center">
                                 <span>{ds.name} {ds.code ? `(${ds.code})` : ''}</span>
                                 <button type="button" className="text-red-500 hover:text-red-700 font-medium" onClick={() => setNewDpDsList(prev => prev.filter(d => d.id !== ds.id))}>Remove</button>
                               </li>
                             ))}
                           </ul>
                         )}
                         <Button type="button" className="bg-[#1f4a6b] hover:bg-[#16364f] text-white w-full mt-4" onClick={addNewFpDp}>Add this Drug Product</Button>
                      </div>

                      {newFpNewDpList.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="font-semibold text-sm text-gray-800 mb-2">Added Drug Products</h4>
                          <ul className="text-sm text-gray-700 space-y-2">
                            {newFpNewDpList.map((dp) => (
                              <li key={dp.id} className="border border-[#306e9a] bg-[#eef6fc] rounded p-3 flex justify-between items-start">
                                <div>
                                  <div className="font-medium text-[#306e9a]">{dp.name}</div>
                                  {dp.manufacturing && <div className="text-xs text-gray-600">Mfg: {dp.manufacturing}</div>}
                                  <div className="text-xs text-gray-500 mt-1">{dp.children?.length} DS(s) attached</div>
                                </div>
                                <button type="button" className="text-red-500 hover:text-red-700 font-medium text-xs mt-1" onClick={() => setNewFpNewDpList(prev => prev.filter(d => d.id !== dp.id))}>Remove</button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              </>
            )}

            {drawerMode === 'dp' && (
              <>
                {!selectedStudyFG ? (
                  <p className="text-sm text-gray-500">Please return to Step 2 and choose an FP first.</p>
                ) : (
                  <>
                    {formErrors.newDpError && <p className="text-red-500 text-xs mb-2">{formErrors.newDpError}</p>}
                    <label className="block text-sm font-medium text-gray-700">DP Name</label>
                    <input
                      className="w-full rounded-lg border border-gray-300 p-2"
                      value={newDpName}
                      onChange={(e) => {
                        setNewDpName(e.target.value);
                        if (formErrors.newDpName) setFormErrors((prev) => ({ ...prev, newDpName: '' }));
                      }}
                    />
                    {formErrors.newDpName && <p className="text-red-500 text-xs mt-1">{formErrors.newDpName}</p>}

                    <label className="block text-sm font-medium text-gray-700">Manufacturing</label>
                    <input className="w-full rounded-lg border border-gray-300 p-2" value={newDpManufacturing} onChange={(e) => setNewDpManufacturing(e.target.value)} placeholder="e.g., Aseptic Fill-Finish" />

                    <label className="block text-sm font-medium text-gray-700">Optional DS to link now</label>
                    <input className="w-full rounded-lg border border-gray-300 p-2" placeholder="DS Name" value={newDpDsName} onChange={(e) => setNewDpDsName(e.target.value)} />
                    <input className="w-full rounded-lg border border-gray-300 p-2 mt-2" placeholder="DS Code (optional)" value={newDpDsCode} onChange={(e) => setNewDpDsCode(e.target.value)} />
                    <Button className="bg-[#306e9a] text-white" onClick={addNewDpDs}>
                      Add DS to DP
                    </Button>
                    {newDpDsList.length > 0 && (
                      <ul className="mt-2 text-sm text-gray-700 space-y-1">
                        {newDpDsList.map((ds) => (
                          <li key={ds.id} className="border border-gray-200 rounded p-2">{ds.name} {ds.code}</li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </>
            )}

            {drawerMode === 'ds' && (
              <>
                {!selectedStudyDP ? (
                  <p className="text-sm text-gray-500">Please return to Step 3 and choose a DP first.</p>
                ) : (
                  <>
                    {formErrors.newDsError && <p className="text-red-500 text-xs mb-2">{formErrors.newDsError}</p>}
                    <label className="block text-sm font-medium text-gray-700">DS Name</label>
                    <input
                      className="w-full rounded-lg border border-gray-300 p-2"
                      value={newDpDsName}
                      onChange={(e) => {
                        setNewDpDsName(e.target.value);
                        if (formErrors.newDsName) setFormErrors((prev) => ({ ...prev, newDsName: '' }));
                      }}
                    />
                    {formErrors.newDsName && <p className="text-red-500 text-xs mt-1">{formErrors.newDsName}</p>}

                    <label className="block text-sm font-medium text-gray-700">DS Code</label>
                    <input className="w-full rounded-lg border border-gray-300 p-2" value={newDpDsCode} onChange={(e) => setNewDpDsCode(e.target.value)} />
                  </>
                )}
              </>
            )}
          </div>

          <DrawerFooter>
            <div className="flex justify-end w-full gap-3">
              <Button className="bg-gray-200 text-gray-700" onClick={resetDrawer}>Cancel</Button>
              <Button
                className="bg-[#306e9a] text-white"
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
