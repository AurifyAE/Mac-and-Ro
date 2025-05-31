import React, { useEffect, useState } from 'react';
import { getAllKYCForms, acceptKYC, rejectKYC, getAllBranches } from '../../api/api';
import { Branch } from '../../api/types';

// Define KYCForm based on Mongoose schema
interface KYCForm {
    _id?: string;
    custId: string;
    customerName: string;
    customerEmail: string;
    nationality: string;
    kycStatus: 'pending' | 'approved' | 'rejected';
    idNumber: string;
    residence: string;
    sourceOfIncome: string;
    bankAccountNumber: string;
    dateOfBirth?: string;
    document?: {
        url: string;
        key: string;
    };
    image?: {
        url: string;
        key: string;
    };
    branch: string;
    type: string;
    createdAt?: string;
    updatedAt?: string;
    branchName?: string;
}

interface KYCFormsResponse {
    data: KYCForm[];
}

interface KYCData {
    _id?: string;
    custId: string;
    customerName: string;
    customerEmail: string;
    nationality: string;
    kycStatus: 'pending' | 'approved' | 'rejected';
    idNumber: string;
    residence: string;
    sourceOfIncome: string;
    bankAccountNumber: string;
    dateOfBirth?: string;
    document?: {
        url: string;
        key: string;
    };
    image?: {
        url: string;
        key: string;
    };
    branch: string;
    branchName?: string;
    type: string;
    createdAt?: string;
    updatedAt?: string;
}

interface KYCAcceptData {
    spreadValue: number;
    branchAdminId: string;
    approvedBy?: string;
    comments?: string;
}

interface KYCRejectData {
    reasons: string[];
    rejectedBy?: string;
}

interface Toast {
    message: string;
    type: 'success' | 'error';
}

export default function KYCManagement() {
    const [kycForms, setKycForms] = useState<KYCData[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedKyc, setSelectedKyc] = useState<KYCData | null>(null);
    const [actionConfirmModal, setActionConfirmModal] = useState(false);
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
    const [kycToAction, setKycToAction] = useState<KYCData | null>(null);
    const [spreadValue, setSpreadValue] = useState<string>(''); 
    const [spreadValueError, setSpreadValueError] = useState<string>(''); 
    const [remarks, setRemarks] = useState<string>(''); // New state for rejection remarks
    const [remarksError, setRemarksError] = useState<string>(''); // Error state for remarks validation
    const [toast, setToast] = useState<Toast | null>(null); // State for toast notification

    const fetchBranches = async () => {
        try {
            const response = await getAllBranches();
            setBranches(response.data);
        } catch (error) {
            console.error('Error fetching branches:', error);
        }
    };

    const fetchKYCForms = async () => {
        try {
            const response = (await getAllKYCForms()) as KYCFormsResponse;
            const mappedData: KYCData[] = response.data.map((form: KYCForm) => ({
                ...form,
                branchName: form.branchName || branches.find((b) => b._id === form.branch)?.branchName,
            }));
            setKycForms(mappedData);
        } catch (error: any) {
            console.error('Error fetching KYC forms:', error.message, error);
        }
    };

    useEffect(() => {
        fetchBranches();
    }, []);

    useEffect(() => {
        fetchKYCForms();
    }, [branches]);

    const filteredKYCForms = kycForms.filter((kyc) => selectedStatus === 'all' || kyc.kycStatus === selectedStatus);

    const getStatusBadge = (status: string) => {
        const baseClasses = 'px-3 py-1 rounded-full text-xs font-medium';
        switch (status) {
            case 'pending':
                return `${baseClasses} bg-yellow-100 text-yellow-800`;
            case 'approved':
                return `${baseClasses} bg-green-100 text-green-800`;
            case 'rejected':
                return `${baseClasses} bg-red-100 text-red-800`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`;
        }
    };

    const handleViewDetails = (kyc: KYCData) => {
        setSelectedKyc(kyc);
        setShowDetailsModal(true);
    };

    const handleActionClick = (kyc: KYCData, action: 'approve' | 'reject') => {
        setKycToAction(kyc);
        setActionType(action);
        setSpreadValue(''); 
        setSpreadValueError(''); 
        setRemarks(''); // Reset remarks
        setRemarksError(''); // Reset remarks error
        setActionConfirmModal(true);
    };

    const validateSpreadValue = (value: string): boolean => {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue <= 0) {
            setSpreadValueError('Please enter a valid positive number for spread value.');
            return false;
        }
        setSpreadValueError('');
        return true;
    };

    const validateRemarks = (value: string): boolean => {
        if (!value.trim()) {
            setRemarksError('Please provide a reason for rejection.');
            return false;
        }
        setRemarksError('');
        return true;
    };

    const confirmAction = async () => {
        if (!kycToAction?._id || !actionType) return;

        try {
            const adminId = localStorage.getItem('userId'); 
            const adminName = localStorage.getItem('username');
            if (!adminId || !adminName) {
                setToast({ message: 'Admin ID not found. Please log in again.', type: 'error' });
                return;
            }

            if (actionType === 'approve') {
                if (!spreadValue || !validateSpreadValue(spreadValue)) {
                    return; 
                }
                const acceptData: KYCAcceptData = {
                    spreadValue: parseFloat(spreadValue),
                    branchAdminId: adminId,
                    approvedBy: adminName,
                    comments: 'Approved after verification',
                };
                await acceptKYC(kycToAction._id, acceptData);
                setToast({ message: `KYC for ${kycToAction.customerName} approved successfully!`, type: 'success' });
            } else {
                if (!remarks || !validateRemarks(remarks)) {
                    return; // Prevent submission if remarks are invalid
                }
                const rejectData: KYCRejectData = {
                    reasons: [remarks], // Use the provided remarks
                    rejectedBy: adminId,
                };
                await rejectKYC(kycToAction._id, rejectData);
                setToast({ message: `KYC for ${kycToAction.customerName} rejected successfully!`, type: 'success' });
            }
            await fetchKYCForms();
            closeActionModal();
        } catch (error) {
            console.error('Error performing action:', error);
            setToast({ message: `Failed to ${actionType} KYC for ${kycToAction.customerName}.`, type: 'error' });
        }
    };

    const closeActionModal = () => {
        setActionConfirmModal(false);
        setKycToAction(null);
        setActionType(null);
        setSpreadValue('');
        setSpreadValueError('');
        setRemarks(''); // Reset remarks
        setRemarksError(''); // Reset remarks error
    };

    const closeDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedKyc(null);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Close toast after 3 seconds
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    return (
        <main className="min-h-screen bg-gray-50 py-8">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                {/* Toast Notification */}
                {toast && (
                    <div className={`fixed top-4 right-4 px-4 py-2 rounded-md text-white text-sm font-medium z-50 ${
                        toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                        {toast.message}
                    </div>
                )}

                <header className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 mb-8">
                    <h1 className="text-3xl font-bold text-white text-center">KYC Management</h1>
                    <p className="text-blue-100 text-center mt-2">Manage customer KYC applications efficiently</p>
                </header>

                <section className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center space-x-4">
                                <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
                                    Filter by Status:
                                </label>
                                <select
                                    id="status-filter"
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                            <div className="flex space-x-4 text-sm">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                                    <span>Pending: {kycForms.filter((k) => k.kycStatus === 'pending').length}</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                                    <span>Approved: {kycForms.filter((k) => k.kycStatus === 'approved').length}</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                                    <span>Rejected: {kycForms.filter((k) => k.kycStatus === 'rejected').length}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Number</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredKYCForms.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center">
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">No KYC Applications Found</h3>
                                                <p className="text-gray-500">{selectedStatus === 'all' ? 'No KYC applications available.' : `No ${selectedStatus} KYC applications found.`}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredKYCForms.map((kyc) => (
                                        <tr key={kyc._id} className="hover:bg-gray-50 transition-colors duration-200">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{kyc.customerName}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{kyc.customerEmail}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{kyc.idNumber}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{kyc.branchName || 'N/A'}</td>
                                            <td className="px-6 py-4">
                                                <span className={getStatusBadge(kyc.kycStatus)}>{kyc.kycStatus.charAt(0).toUpperCase() + kyc.kycStatus.slice(1)}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{kyc.type}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{kyc.createdAt ? formatDate(kyc.createdAt) : 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleViewDetails(kyc)}
                                                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200"
                                                    >
                                                        View
                                                    </button>
                                                    {kyc.kycStatus === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleActionClick(kyc, 'approve')}
                                                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleActionClick(kyc, 'reject')}
                                                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200"
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            {/* Details Modal */}
            {showDetailsModal && selectedKyc && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
                        <header className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">KYC Details</h2>
                            <button
                                onClick={closeDetailsModal}
                                className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200"
                            >
                                ×
                            </button>
                        </header>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                                            <p className="text-sm text-gray-900">{selectedKyc.customerName}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Email</label>
                                            <p className="text-sm text-gray-900">{selectedKyc.customerEmail}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Nationality</label>
                                            <p className="text-sm text-gray-900">{selectedKyc.nationality}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                            <p className="text-sm text-gray-900">{selectedKyc.dateOfBirth ? new Date(selectedKyc.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">ID Number</label>
                                            <p className="text-sm text-gray-900">{selectedKyc.idNumber}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Type</label>
                                            <p className="text-sm text-gray-900">{selectedKyc.type}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Branch</label>
                                            <p className="text-sm text-gray-900">{selectedKyc.branchName || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Source of Income</label>
                                            <p className="text-sm text-gray-900">{selectedKyc.sourceOfIncome}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Bank Account</label>
                                            <p className="text-sm text-gray-900">{selectedKyc.bankAccountNumber}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Status</label>
                                            <span className={getStatusBadge(selectedKyc.kycStatus)}>{selectedKyc.kycStatus.charAt(0).toUpperCase() + selectedKyc.kycStatus.slice(1)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Residence Address</label>
                                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{selectedKyc.residence}</p>
                            </div>

                            {(selectedKyc.document?.url || selectedKyc.image?.url) && (
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Documents</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedKyc.document?.url && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Document</label>
                                                <a href={selectedKyc.document.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm underline">
                                                    View Document
                                                </a>
                                            </div>
                                        )}
                                        {selectedKyc.image?.url && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
                                                <a href={selectedKyc.image.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm underline">
                                                    View Photo
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedKyc.kycStatus === 'pending' && (
                                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => {
                                            closeDetailsModal();
                                            handleActionClick(selectedKyc, 'reject');
                                        }}
                                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200"
                                    >
                                        Reject KYC
                                    </button>
                                    <button
                                        onClick={() => {
                                            closeDetailsModal();
                                            handleActionClick(selectedKyc, 'approve');
                                        }}
                                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200"
                                    >
                                        Approve KYC
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Action Confirmation Modal */}
            {actionConfirmModal && kycToAction && actionType && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
                        <header className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <svg className={`w-6 h-6 mr-3 ${actionType === 'approve' ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                    ></path>
                                </svg>
                                Confirm {actionType === 'approve' ? 'Approval' : 'Rejection'}
                            </h3>
                        </header>

                        <div className="p-6">
                            <p className="text-gray-600 mb-2">Are you sure you want to {actionType} the KYC application for:</p>
                            <div className="bg-gray-50 p-3 rounded-md mb-4">
                                <p className="font-semibold text-gray-900">{kycToAction.customerName}</p>
                                <p className="text-sm text-gray-600">{kycToAction.customerEmail}</p>
                                <p className="text-sm text-gray-600">ID: {kycToAction.idNumber}</p>
                            </div>
                            {actionType === 'approve' ? (
                                <>
                                    <p className="text-sm text-gray-600 mb-2">Please provide the spread value for approval:</p>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={spreadValue}
                                        onChange={(e) => {
                                            setSpreadValue(e.target.value);
                                            validateSpreadValue(e.target.value);
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        placeholder="Enter spread value (e.g., 1.5)"
                                    />
                                    {spreadValueError && (
                                        <p className="text-sm text-red-600 mt-1">{spreadValueError}</p>
                                    )}
                                    <p className="text-sm text-gray-600 mt-2">This will approve the KYC and generate login credentials for the customer.</p>
                                </>
                            ) : (
                                <>
                                    <p className="text-sm text-gray-600 mb-2">Please provide the reason for rejection:</p>
                                    <textarea
                                        value={remarks}
                                        onChange={(e) => {
                                            setRemarks(e.target.value);
                                            validateRemarks(e.target.value);
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        placeholder="Enter reason for rejection"
                                        rows={4}
                                    />
                                    {remarksError && (
                                        <p className="text-sm text-red-600 mt-1">{remarksError}</p>
                                    )}
                                    <p className="text-sm text-gray-600 mt-2">This action will reject the KYC application.</p>
                                </>
                            )}
                        </div>

                        <footer className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                            <button
                                onClick={closeActionModal}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmAction}
                                disabled={actionType === 'approve' ? !!spreadValueError : !!remarksError} // Disable based on relevant error
                                className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors duration-200 flex items-center ${
                                    actionType === 'approve'
                                        ? spreadValueError
                                            ? 'bg-green-300 cursor-not-allowed'
                                            : 'bg-green-600 hover:bg-green-700'
                                        : remarksError
                                        ? 'bg-red-300 cursor-not-allowed'
                                        : 'bg-red-600 hover:bg-red-700'
                                }`}
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {actionType === 'approve' ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    )}
                                </svg>
                                {actionType === 'approve' ? 'Approve KYC' : 'Reject KYC'}
                            </button>
                        </footer>
                    </div>
                </div>
            )}
        </main>
    );
}