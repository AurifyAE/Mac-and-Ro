import React, { useState, useEffect, ChangeEvent } from 'react';
import { getAllBranches, updateBranchCharge } from '../../api/api';
import toast from 'react-hot-toast';

interface ChargeToBranch {
    branch: string;
    amount: number;
}

interface Branch {
    _id?: string;
    branchName: string;
    branchCode?: string;
    branchAddress: string;
    branchPhone: string;
    branchEmail: string;
    chargeTo?: ChargeToBranch[];
    createdAt?: string;
    updatedAt?: string;
}

interface ChargeData {
  branch: string;
  branchName?: string;
  amount: number;
}

export default function BranchCharges() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [charges, setCharges] = useState<ChargeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBranches = async () => {
          try {
              setLoading(true);
              const response = await getAllBranches();
              setBranches(response.data);
          } catch (error) {
              console.error('Error fetching branches:', error);
              setError('Failed to load branches. Please try again.');
          } finally {
              setLoading(false);
          }
      };
  
      useEffect(() => {
          fetchBranches();
      }, []);
  

  const handleBranchSelect = (branch: Branch) => {
    setSelectedBranch(branch);
    
    // Get other branches (excluding selected one)
    const otherBranches = branches.filter(b => b._id !== branch._id);
    
    // Initialize charges with existing data or default values
    const initialCharges = otherBranches
      .filter(otherBranch => otherBranch._id) // Filter out branches without _id
      .map(otherBranch => {
        const existingCharge = branch.chargeTo?.find(c => c.branch === otherBranch._id);
        return {
          branch: otherBranch._id!, // Use non-null assertion since we filtered above
          branchName: otherBranch.branchName,
          amount: existingCharge ? existingCharge.amount : 0
        };
      });
    
    setCharges(initialCharges);
  };

  const handleChargeChange = (e: ChangeEvent<HTMLInputElement>, branchId: string) => {
    const { value } = e.target;
    setCharges(prev => prev.map(charge => 
      charge.branch === branchId 
        ? { ...charge, amount: parseFloat(value) || 0 }
        : charge
    ));
  };

  const handleSave = async () => {
    if (!selectedBranch || !selectedBranch._id) return;
    
    setSaving(true);
    setError(null);
    
    try {
      // Format charges for API (remove branchName as it's not needed for backend)
      const chargesToSave = charges.map(charge => ({
        branch: charge.branch,
        amount: charge.amount
      }));

      // Send as an object with chargeTo array property
      const payload = { chargeTo: chargesToSave };
      
      await updateBranchCharge(selectedBranch._id, payload);
      
      // Update local state with the saved data
      setBranches(prev => prev.map(branch => 
        branch._id === selectedBranch._id 
          ? { ...branch, chargeTo: chargesToSave }
          : branch
      ));
      
      // Update selected branch
      setSelectedBranch(prev => prev ? { ...prev, chargeTo: chargesToSave } : null);
      
      toast.success('Branch charges updated successfully!');
      
    } catch (error) {
      console.error('Error saving charges:', error);
      setError('Error saving charges. Please try again.');
      toast.error('Failed to save charges. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    fetchBranches();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading branches...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error && branches.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Branches</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={handleRetry}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <header className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-white text-center">Branch Charges Management</h1>
          <p className="text-blue-100 text-center mt-2">Manage inter-branch charges efficiently</p>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    onClick={() => setError(null)}
                    className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Branch Selection Section */}
        <section className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Select Branch</h2>
              <button
                onClick={fetchBranches}
                disabled={loading}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200 disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {branches.map((branch) => (
                <button
                  key={branch._id}
                  onClick={() => handleBranchSelect(branch)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left transform hover:-translate-y-1 hover:shadow-lg ${
                    selectedBranch?._id === branch._id
                      ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-gray-900">{branch.branchName}</div>
                  <div className="text-sm text-gray-500">{branch.branchCode}</div>
                  <div className="text-xs text-gray-400 mt-1">{branch.branchAddress}</div>
                  {/* {branch.chargeTo && branch.chargeTo.length > 0 && (
                    <div className="text-xs text-green-600 mt-2 font-medium">
                      {branch.chargeTo.filter(charge => charge.amount > 0).length} charge(s) configured
                    </div>
                  )} */}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Charges Configuration Section */}
        {selectedBranch ? (
          <section className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Charges from {selectedBranch.branchName}
                  </h2>
                  <p className="text-gray-500 mt-1">
                    Set charges to other branches from {selectedBranch.branchName}
                  </p>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      From Branch
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      To Branch
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Charge Amount (USD)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {charges.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Other Branches Available</h3>
                          <p className="text-gray-500">All branches are already configured.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    charges.map((charge) => (
                      <tr key={charge.branch} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {selectedBranch.branchName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {charge.branchName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-500">USD</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={charge.amount || ''}
                              onChange={(e) => handleChargeChange(e, charge.branch)}
                              className="w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                              placeholder="0.00"
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <section className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-12 text-center text-gray-500">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Branch Selected</h3>
                <p className="text-gray-500">Please select a branch above to configure inter-branch charges</p>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}