import React, { useState, useMemo } from 'react';
import HierarchyAccordion from '../components/HierarchyAccordion';
import studiesMasterData from '../../data/studiesMasterData.json';
import { Plus } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Studies_Master_Data() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');

  // Filter data based on search and status
  const filteredData = useMemo(() => {
    return studiesMasterData.data.filter(study => {
      // Check if study name or description matches search query
      const matchesSearch = 
        study.studyName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (study.studyDescription && study.studyDescription.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Check if status matches filter
      const matchesStatus = statusFilter === 'All Statuses' || study.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Studies Master Data</h1>
          <p className="text-gray-600 mt-2 text-sm">Manage pharmaceutical research studies and their components</p>
        </div>
<Button className="bg-[#306e9a] text-white px-4 py-2 rounded-lg shadow hover:bg-[#245371] transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Study
        </Button>
      </div>
      
      {/* Main Content Area */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        
        {/* Search & Filter Bar */}
        {/* <div className="flex justify-between items-center mb-6 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
           <div className="flex items-center text-gray-400 w-1/2">
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-3 mr-2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
             <input 
               type="text" 
               placeholder="Search studies..." 
               className="w-full bg-transparent border-none focus:outline-none text-sm text-gray-700 py-1"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
           </div>
           
           <div className="flex items-center space-x-2 w-1/4 justify-end">
              <select 
                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2 appearance-none outline-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All Statuses">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Planned">Planned</option>
              </select>
           </div>
        </div> */}

        {/* Hierarchy Accordion */}
        {filteredData.length > 0 ? (
          <HierarchyAccordion 
            columns={studiesMasterData.columns} 
            data={filteredData} 
          />
        ) : (
          <div className="text-center py-10 text-gray-500 bg-white rounded-lg border border-gray-100">
            No studies match your search criteria.
          </div>
        )}
      </div>
    </div>
  );
}