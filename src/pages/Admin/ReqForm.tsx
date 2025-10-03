import React, { useEffect, useState } from 'react';

// Define ReqForm interface based on Mongoose schema
// Update the ReqForm interface to match your API response
interface ReqForm {
    _id?: string;
    type: 'deposit' | 'withdraw' | 'swapping' | 'buy' | 'sell';
    assetType?: 'cash' | 'gold';
    fromLocation?: {
        _id: string;
        name: string;
        address?: string;
    };
    toLocation?: {
        _id: string;
        name: string;
        address?: string;
    };
    quantity?: number;
    amount?: number;
    branchId?: {
        _id: string;
        name: string;
        address?: string;
    };
    customer: {
        _id: string;
        name: string; // Changed from customerName to name to match your controller
        email: string;
        cash?: number;
        gold?: number;
    };
    status: 'pending' | 'approved' | 'rejected' | 'closed';
    Remarks?: string;
    createdAt?: string;
    updatedAt?: string;
    actionTimestamp?: string;
}

interface Toast {
    message: string;
    type: 'success' | 'error';
}



// Mock API functions
// Replace these mock API functions with actual API calls
const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Replace the mock getAllPendingReqForms function
// Replace this function
const getReqFormsByStatus = async (status: string = 'all'): Promise<{ data: ReqForm[] }> => {
    const response = await fetch(`${backendUrl}/reqform/status?status=${status}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // Add authorization header if needed
            // 'Authorization': `Bearer ${token}`
        }
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch pending request forms');
    }
    
    return await response.json();
};

// Replace the mock getCustomerReqForms function
const getCustomerReqForms = async (customerId: string): Promise<{ data: ReqForm[] }> => {
    const response = await fetch(`${backendUrl}/reqform/customer/${customerId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // Add authorization header if needed
            // 'Authorization': `Bearer ${token}`
        }
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch customer request forms');
    }
    
    return await response.json();
};

// Replace the mock getReqFormById function
const getReqFormById = async (reqFormId: string): Promise<{ data: ReqForm }> => {
    const response = await fetch(`${backendUrl}/reqform/${reqFormId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // Add authorization header if needed
            // 'Authorization': `Bearer ${token}`
        }
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch request form details');
    }
    
    return await response.json();
};



// Replace the mock approveReqForm function
const approveReqForm = async (reqFormId: string): Promise<any> => {
    const response = await fetch(`${backendUrl}/reqform/approve/${reqFormId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            // Add authorization header if needed
            // 'Authorization': `Bearer ${token}`
        }
    });
    
    if (!response.ok) {
        throw new Error('Failed to approve request form');
    }
    
    return await response.json();
};

// Replace the mock rejectReqForm function
const rejectReqForm = async (reqFormId: string, remarks: string): Promise<any> => {
    const response = await fetch(`${backendUrl}/reqform/reject/${reqFormId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            // Add authorization header if needed
            // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ remarks })
    });
    
    if (!response.ok) {
        throw new Error('Failed to reject request form');
    }
    
    return await response.json();
};

// Add reverse request form function
const reverseReqForm = async (reqFormId: string): Promise<any> => {
    const response = await fetch(`${backendUrl}/reqform/reverse/${reqFormId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            // Add authorization header if needed
            // 'Authorization': `Bearer ${token}`
        }
    });
    
    if (!response.ok) {
        throw new Error('Failed to reverse request form');
    }
    
    return await response.json();
};

export default function ReqFormManagement() {
    const [reqForms, setReqForms] = useState<ReqForm[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [customerIdFilter, setCustomerIdFilter] = useState<string>('');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedReqForm, setSelectedReqForm] = useState<ReqForm | any>(null);
    const [actionConfirmModal, setActionConfirmModal] = useState(false);
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
    const [reqFormToAction, setReqFormToAction] = useState<ReqForm | any>(null);
    const [remarks, setRemarks] = useState<string>('');
    const [remarksError, setRemarksError] = useState<string>('');
    const [toast, setToast] = useState<Toast | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    console.log('reqForms:', reqForms);
    console.log('selectedStatus:', selectedReqForm);

    // Set up SSE connection for real-time updates
    const setupSSE = () => {
        console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
        let sseUrl;
        if (import.meta.env.VITE_API_URL) {
            const apiUrl = import.meta.env.VITE_API_URL;
            if (apiUrl.endsWith('/api/admin')) {
                sseUrl = `${apiUrl}/events`;
            } else if (apiUrl.endsWith('/api')) {
                sseUrl = `${apiUrl}/admin/events`;
            } else {
                sseUrl = `${apiUrl}/api/admin/events`;
            }
        } else {
            sseUrl = 'http://localhost:5000/api/admin/events';
        }
        
        console.log('Connecting to SSE at:', sseUrl);
        const eventSource = new EventSource(sseUrl);
        
        // Connection opened
        eventSource.onopen = () => {
            console.log('SSE connection established for ReqForm Management');
        };
        
        // Listen for messages
        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('SSE message received:', data);
                
                // Handle different event types
                switch (data.type) {
                    case 'CONNECTION_ESTABLISHED':
                        console.log('SSE connection confirmed:', data.clientId);
                        break;
                        
                    case 'NEW_REQFORM':
                        console.log('New request form submitted:', data.message);
                        // Refresh request forms to include the new form
                        if (customerIdFilter.trim()) {
                            fetchCustomerReqForms(customerIdFilter.trim());
                        } else {
                            fetchReqFormsByStatus(selectedStatus);
                        }
                        
                        // Show success toast
                        setToast({
                            message: data.message || 'New request form submitted',
                            type: 'success'
                        });
                        break;
                        
                    case 'REQFORM_STATUS_UPDATE':
                        console.log('Request form status updated:', data.message);
                        // Refresh request forms to show updated status
                        if (customerIdFilter.trim()) {
                            fetchCustomerReqForms(customerIdFilter.trim());
                        } else {
                            fetchReqFormsByStatus(selectedStatus);
                        }
                        break;
                        
                    default:
                        console.log('Unknown SSE event type:', data.type);
                }
            } catch (error) {
                console.error('Error parsing SSE message:', error);
            }
        };
        
        // Handle errors
        eventSource.onerror = (error) => {
            console.error('SSE connection error:', error);
            
            // If connection is closed, attempt to reconnect after 5 seconds
            if (eventSource.readyState === EventSource.CLOSED) {
                console.log('SSE connection closed, attempting to reconnect in 5 seconds...');
                setTimeout(() => {
                    setupSSE();
                }, 5000);
            }
        };
        
        return eventSource;
    };

    // Helper function to check if reverse action is available (within 5 minutes)
    const canReverse = (reqForm: ReqForm): boolean => {
        if (reqForm.status === 'pending' || !reqForm.actionTimestamp) return false;
        const actionTime = new Date(reqForm.actionTimestamp).getTime();
        const currentTime = new Date().getTime();
        const fiveMinutesInMs = 5 * 60 * 1000;
        return (currentTime - actionTime) <= fiveMinutesInMs;
    };
const fetchReqFormsByStatus = async (status: string = 'all') => {
    try {
        setIsLoading(true);
        const response = await getReqFormsByStatus(status);
            setReqForms(response.data);
        } catch (error) {
            console.error('Error fetching pending request forms:', error);
            setToast({ message: 'Failed to fetch request forms', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCustomerReqForms = async (customerId: string) => {
        try {
            setIsLoading(true);
            const response = await getCustomerReqForms(customerId);
            setReqForms(response.data);
        } catch (error) {
            console.error('Error fetching customer request forms:', error);
            setToast({ message: 'Failed to fetch customer request forms', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

   const handleCustomerSearch = () => {
    if (customerIdFilter.trim()) {
        fetchCustomerReqForms(customerIdFilter.trim());
    } else {
        fetchReqFormsByStatus(selectedStatus); // Changed from fetchAllPendingReqForms
    }
};

    useEffect(() => {
    if (customerIdFilter.trim()) {
        fetchCustomerReqForms(customerIdFilter.trim());
    } else {
        fetchReqFormsByStatus(selectedStatus);
    }
}, [selectedStatus]);

 useEffect(() => {
    fetchReqFormsByStatus('all'); // or fetchReqFormsByStatus(selectedStatus)
    
    // Set up SSE connection
    const eventSource = setupSSE();
    
    // Cleanup function to close SSE connection
    return () => {
        if (eventSource) {
            eventSource.close();
            console.log('SSE connection closed');
        }
    };
}, []);

    // Close toast after 3 seconds
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const filteredReqForms = reqForms.filter((reqForm) => {
        const statusMatch = selectedStatus === 'all' || reqForm.status === selectedStatus;
        const typeMatch = selectedType === 'all' || reqForm.type === selectedType;
        return statusMatch && typeMatch;
    });

    const getStatusBadge = (status: string) => {
        const baseClasses = 'px-3 py-1 rounded-full text-xs font-medium';
        switch (status) {
            case 'pending':
                return `${baseClasses} bg-yellow-100 text-yellow-800`;
            case 'approved':
                return `${baseClasses} bg-green-100 text-green-800`;
            case 'rejected':
                return `${baseClasses} bg-red-100 text-red-800`;
            case 'closed':
                return `${baseClasses} bg-blue-100 text-blue-800`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`;
        }
    };

    const getTypeBadge = (type: string) => {
        const baseClasses = 'px-2 py-1 rounded text-xs font-medium';
        switch (type) {
            case 'deposit':
                return `${baseClasses} bg-green-50 text-green-700`;
            case 'withdraw':
                return `${baseClasses} bg-red-50 text-red-700`;
            case 'swapping':
                return `${baseClasses} bg-blue-50 text-blue-700`;
            case 'buy':
                return `${baseClasses} bg-purple-50 text-purple-700`;
            case 'sell':
                return `${baseClasses} bg-orange-50 text-orange-700`;
            default:
                return `${baseClasses} bg-gray-50 text-gray-700`;
        }
    };

    const handleViewDetails = async (reqForm: ReqForm) => {
        try {
            if (reqForm._id) {
                const response = await getReqFormById(reqForm._id);
                setSelectedReqForm(response.data);
                setShowDetailsModal(true);
            }
        } catch (error) {
            console.error('Error fetching request form details:', error);
            setToast({ message: 'Failed to fetch request form details', type: 'error' });
        }
    };

    const handleActionClick = (reqForm: ReqForm, action: 'approve' | 'reject') => {
        setReqFormToAction(reqForm);
        setActionType(action);
        setRemarks('');
        setRemarksError('');
        setActionConfirmModal(true);
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
        if (!reqFormToAction?._id || !actionType) return;

        try {
            if (actionType === 'approve') {
                await approveReqForm(reqFormToAction._id);
                setToast({ 
                    message: `Request for ${reqFormToAction.customer?.customerName || 'N/A'} approved successfully!`, 
                    type: 'success' 
                });
            } else {
                if (!remarks || !validateRemarks(remarks)) {
                    return;
                }
                await rejectReqForm(reqFormToAction._id, remarks);
                setToast({ 
                    message: `Request for ${reqFormToAction.customer?.customerName || 'N/A'} rejected successfully!`, 
                    type: 'success' 
                });
            }
            
            if (customerIdFilter.trim()) {
                fetchCustomerReqForms(customerIdFilter.trim());
            } else {
                fetchReqFormsByStatus(selectedStatus);
            }
            
            closeActionModal();
        } catch (error) {
            console.error('Error performing action:', error);
            setToast({ 
                message: `Failed to ${actionType} request for ${reqFormToAction.customer?.customerName || 'N/A'}.`, 
                type: 'error' 
            });
        }
    };

    const handleReverseAction = async (reqForm: ReqForm) => {
        if (!reqForm._id) return;

        try {
            await reverseReqForm(reqForm._id);
            setToast({ 
                message: `Request for ${reqForm.customer?.name || 'N/A'} reversed to pending successfully!`, 
                type: 'success' 
            });
            
            if (customerIdFilter.trim()) {
                fetchCustomerReqForms(customerIdFilter.trim());
            } else {
                fetchReqFormsByStatus(selectedStatus);
            }
        } catch (error) {
            console.error('Error reversing request form:', error);
            setToast({ 
                message: `Failed to reverse request for ${reqForm.customer?.name || 'N/A'}.`, 
                type: 'error' 
            });
        }
    };

    const closeActionModal = () => {
        setActionConfirmModal(false);
        setReqFormToAction(null);
        setActionType(null);
        setRemarks('');
        setRemarksError('');
    };

    const closeDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedReqForm(null);
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

    const formatCurrency = (amount?: number) => {
        if (amount === undefined || amount === null) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    return (
        <main className="min-h-screen bg-gray-50 py-8">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                {toast && (
                    <div className={`fixed top-4 right-4 px-4 py-2 rounded-md text-white text-sm font-medium z-50 ${
                        toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                        {toast.message}
                    </div>
                )}

                <header className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 mb-8">
                    <h1 className="text-3xl font-bold text-white text-center">Request Form Management</h1>
                    <p className="text-blue-100 text-center mt-2">Manage customer transaction requests efficiently</p>
                </header>

                <section className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                            <div className="flex items-center space-x-4">
                                {/* <div>
                                    <label htmlFor="customer-filter" className="text-sm font-medium text-gray-700">
                                        Search by Customer ID:
                                    </label>
                                    <div className="flex mt-1">
                                        <input
                                            id="customer-filter"
                                            type="text"
                                            value={customerIdFilter}
                                            onChange={(e) => setCustomerIdFilter(e.target.value)}
                                            placeholder="Enter customer ID"
                                            className="px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <button
                                            onClick={handleCustomerSearch}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            Search
                                        </button>
                                    </div>
                                </div> */}
                                <div>
                                    <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
                                        Filter by Status:
                                    </label>
                                    <select
                                        id="status-filter"
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="type-filter" className="text-sm font-medium text-gray-700">
                                        Filter by Type:
                                    </label>
                                    <select
                                        id="type-filter"
                                        value={selectedType}
                                        onChange={(e) => setSelectedType(e.target.value)}
                                        className="mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="deposit">Deposit</option>
                                        <option value="withdraw">Withdraw</option>
                                        <option value="swapping">Swapping</option>
                                        <option value="buy">Buy</option>
                                        <option value="sell">Sell</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex space-x-4 text-sm">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                                <span>Pending: {reqForms.filter((r) => r.status === 'pending').length}</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                                <span>Approved: {reqForms.filter((r) => r.status === 'approved').length}</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                                <span>Rejected: {reqForms.filter((r) => r.status === 'rejected').length}</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
                                <span>Closed: {reqForms.filter((r) => r.status === 'closed').length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset Type</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount/Qty</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredReqForms.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center">
                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Request Forms Found</h3>
                                                    <p className="text-gray-500">
                                                        {customerIdFilter 
                                                            ? `No request forms found for customer ID: ${customerIdFilter}` 
                                                            : 'No request forms available.'}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredReqForms.map((reqForm:any) => (
                                            <tr key={reqForm._id} className="hover:bg-gray-50 transition-colors duration-200">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{reqForm.customer?.customerName}</div>
                                                        <div className="text-sm text-gray-500">{reqForm.customer?.customerPhone}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={getTypeBadge(reqForm.type)}>
                                                        {reqForm.type.charAt(0).toUpperCase() + reqForm.type.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {reqForm.assetType || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {reqForm.assetType === 'gold'  ? (
                                                        <>
                                                        
                                                            {reqForm.quantity ? `${reqForm.quantity} g` : ''}
                                                        </>
                                                    ) : (
                                                        <>
                                                            {reqForm.amount ? formatCurrency(reqForm.amount) : ''}
                                                        </>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={getStatusBadge(reqForm.status)}>
                                                        {reqForm.status.charAt(0).toUpperCase() + reqForm.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {formatDate(reqForm.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleViewDetails(reqForm)}
                                                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200"
                                                        >
                                                            View
                                                        </button>
                                                        {reqForm.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleActionClick(reqForm, 'approve')}
                                                                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200"
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => handleActionClick(reqForm, 'reject')}
                                                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}
                                                        {(reqForm.status === 'approved' || reqForm.status === 'rejected') && canReverse(reqForm) && (
    <button
        onClick={() => handleReverseAction(reqForm)}
        className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200"
        title="Reverse action (available for 5 minutes)"
    >
        Reverse
    </button>
)}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>
            </div>

            {/* Details Modal */}
            {showDetailsModal && selectedReqForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-screen overflow-y-auto">
                        <header className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">Request Form Details</h2>
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
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                                            <p className="text-sm text-gray-900">{selectedReqForm.customer?.customerName}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Email</label>
                                            <p className="text-sm text-gray-900">{selectedReqForm.customer?.customerEmail}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Customer ID</label>
                                            <p className="text-sm text-gray-900">{selectedReqForm.customer?.idNumber}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Transaction Details</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Type</label>
                                            <span className={getTypeBadge(selectedReqForm.type)}>
                                                {selectedReqForm.type.charAt(0).toUpperCase() + selectedReqForm.type.slice(1)}
                                            </span>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Asset Type</label>
                                            <p className="text-sm text-gray-900">{selectedReqForm.assetType || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Status</label>
                                            <span className={getStatusBadge(selectedReqForm.status)}>
                                                {selectedReqForm.status.charAt(0).toUpperCase() + selectedReqForm.status.slice(1)}
                                            </span>
                                        </div>
                                        {selectedReqForm.amount && (
                                            <div>
                                                {selectedReqForm.type === 'swapping' ? (
                                                    <label className="block text-sm font-medium text-gray-700">Charge</label>
                                                ) : (
                                                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                                                )}
                                                <p className="text-sm text-gray-900">{formatCurrency(selectedReqForm.amount)}</p>
                                            </div>
                                        )}
                                        {selectedReqForm.quantity && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                                                <p className="text-sm text-gray-900">{selectedReqForm.quantity} g</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Location Information for Swapping */}
                            {selectedReqForm.type === 'swapping' && (
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Transfer Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">From Location</label>
                                            <p className="text-sm text-gray-900">
                                                {selectedReqForm.fromLocation?.branchName || 'N/A'}
                                            </p>
                                            {selectedReqForm.fromLocation?.branchAddress && (
                                                <p className="text-xs text-gray-500">{selectedReqForm.fromLocation.branchAddress}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">To Location</label>
                                            <p className="text-sm text-gray-900">
                                                {selectedReqForm.toLocation?.branchName || 'N/A'}
                                            </p>
                                            {selectedReqForm.toLocation?.branchAddress && (
                                                <p className="text-xs text-gray-500">{selectedReqForm.toLocation.branchAddress}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Branch Information */}
                            {selectedReqForm.branchId && (
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Branch Information</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Branch Name</label>
                                            <p className="text-sm text-gray-900">{selectedReqForm.branchId.branchName}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Branch ID</label>
                                            <p className="text-sm text-gray-900">{selectedReqForm.branchId.branchCode}</p>
                                        </div>
                                        {selectedReqForm.branchId.address && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Branch Address</label>
                                                <p className="text-sm text-gray-900">{selectedReqForm.branchId.address}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Additional Information */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Created At</label>
                                        <p className="text-sm text-gray-900">{formatDate(selectedReqForm.createdAt)}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Updated At</label>
                                        <p className="text-sm text-gray-900">{formatDate(selectedReqForm.updatedAt)}</p>
                                    </div>
                                    {selectedReqForm.Remarks && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Remarks</label>
                                            <p className="text-sm text-gray-900">{selectedReqForm.Remarks}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <footer className="flex justify-end p-6 border-t border-gray-200">
                            <button
                                onClick={closeDetailsModal}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                            >
                                Close
                            </button>
                        </footer>
                    </div>
                </div>
            )}

            {/* Action Confirmation Modal */}
            {actionConfirmModal && reqFormToAction && actionType && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <header className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
                            </h2>
                            <button
                                onClick={closeActionModal}
                                className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200"
                            >
                                ×
                            </button>
                        </header>

                        <div className="p-6">
                            <p className="text-sm text-gray-600 mb-4">
                                Are you sure you want to {actionType} the request for{' '}
<span className="font-medium">{reqFormToAction.customer?.customerName || 'N/A'}</span>
                            </p>
                            {actionType === 'reject' && (
                                <div className="mb-4">
                                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">
                                        Reason for Rejection
                                    </label>
                                    <textarea
                                        id="remarks"
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        className={`w-full px-3 py-2 border ${remarksError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                        placeholder="Enter reason for rejection"
                                        rows={4}
                                    />
                                    {remarksError && (
                                        <p className="text-sm text-red-500 mt-1">{remarksError}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <footer className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                            <button
                                onClick={closeActionModal}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmAction}
                                className={`px-4 py-2 text-white rounded-md transition-colors duration-200 ${
                                    actionType === 'approve'
                                        ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                                        : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                                } focus:outline-none focus:ring-2`}
                            >
                                {actionType === 'approve' ? 'Approve' : 'Reject'}
                            </button>
                        </footer>
                    </div>
                </div>
            )}
        </main>
    );
}