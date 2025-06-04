import React, { useEffect, useState } from 'react';

// Define ReqForm interface based on Mongoose schema
interface ReqForm {
    _id?: string;
    type: 'deposit' | 'withdraw' | 'swapping' | 'buy' | 'sell';
    assetType?: 'cash' | 'gold';
    fromLocation?: {
        _id: string;
        name: string;
        address?: string;
        branchName?: string;
        branchAddress?: string;
    };
    toLocation?: {
        _id: string;
        name: string;
        address?: string;
        branchName?: string;
        branchAddress?: string;
    };
    quantity?: number;
    amount?: number;
    branchId?: {
        _id: string;
        name: string;
        address?: string;
        branchName?: string;
        branchCode?: string;
    };
    customer: {
        _id: string;
        name: string;
        customerName?: string;
        customerEmail?: string;
        customerPhone?: string;
        email: string;
        idNumber?: string;
        cash?: number;
        gold?: number;
    };
    status: 'pending' | 'approved' | 'rejected' | 'closed';
    Remarks?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface Toast {
    message: string;
    type: 'success' | 'error';
}

export default function SwappedProductsManagement() {
    const [swappedProducts, setSwappedProducts] = useState<ReqForm[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<ReqForm[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [customerIdFilter, setCustomerIdFilter] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<ReqForm | null>(null);
    const [toast, setToast] = useState<Toast | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    // Mock data for demonstration
    const mockSwappedProducts: ReqForm[] = [
        {
            _id: '1',
            type: 'swapping',
            assetType: 'gold',
            fromLocation: {
                _id: 'loc1',
                name: 'Downtown Branch',
                branchName: 'Downtown Gold Exchange',
                branchAddress: '123 Main St, Downtown'
            },
            toLocation: {
                _id: 'loc2',
                name: 'Uptown Branch',
                branchName: 'Uptown Gold Exchange',
                branchAddress: '456 High St, Uptown'
            },
            quantity: 50,
            amount: 25,
            customer: {
                _id: 'cust1',
                name: 'John Doe',
                customerName: 'John Doe',
                customerEmail: 'john.doe@email.com',
                customerPhone: '+1-234-567-8900',
                email: 'john.doe@email.com',
                idNumber: 'ID12345',
                cash: 1000,
                gold: 100
            },
            status: 'pending',
            Remarks: 'Transfer requested for investment portfolio diversification',
            createdAt: '2024-12-01T10:30:00Z',
            updatedAt: '2024-12-01T10:30:00Z'
        },
        {
            _id: '2',
            type: 'swapping',
            assetType: 'cash',
            fromLocation: {
                _id: 'loc3',
                name: 'Central Branch',
                branchName: 'Central Financial Hub',
                branchAddress: '789 Central Ave'
            },
            toLocation: {
                _id: 'loc4',
                name: 'East Branch',
                branchName: 'East Side Exchange',
                branchAddress: '321 East Blvd'
            },
            amount: 5000,
            customer: {
                _id: 'cust2',
                name: 'Jane Smith',
                customerName: 'Jane Smith',
                customerEmail: 'jane.smith@email.com',
                customerPhone: '+1-234-567-8901',
                email: 'jane.smith@email.com',
                idNumber: 'ID54321',
                cash: 15000,
                gold: 75
            },
            status: 'approved',
            Remarks: 'Approved for same-day transfer',
            createdAt: '2024-11-28T14:15:00Z',
            updatedAt: '2024-11-29T09:20:00Z'
        },
        {
            _id: '3',
            type: 'swapping',
            assetType: 'gold',
            fromLocation: {
                _id: 'loc5',
                name: 'North Branch',
                branchName: 'North Gold Vault',
                branchAddress: '555 North Plaza'
            },
            toLocation: {
                _id: 'loc6',
                name: 'South Branch',
                branchName: 'South Exchange Center',
                branchAddress: '777 South Way'
            },
            quantity: 25,
            amount: 15,
            customer: {
                _id: 'cust3',
                name: 'Mike Johnson',
                customerName: 'Mike Johnson',
                customerEmail: 'mike.johnson@email.com',
                customerPhone: '+1-234-567-8902',
                email: 'mike.johnson@email.com',
                idNumber: 'ID67890',
                cash: 8000,
                gold: 200
            },
            status: 'rejected',
            Remarks: 'Insufficient documentation provided',
            createdAt: '2024-11-25T16:45:00Z',
            updatedAt: '2024-11-26T11:30:00Z'
        }
    ];

    // Fetch swapped products (using mock data for demo)
// ...existing code...
const fetchSwappedProducts = async () => {
    try {
        setIsLoading(true);
        const response = await fetch(`${backendUrl}/reqform/swapped`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        // Adjust this line based on your actual API response structure:
        // If your API returns { swappedProducts: [...] }
        const products = Array.isArray(data) ? data : (data.swappedProducts || data.data || []);
        setSwappedProducts(products);
        setFilteredProducts(products);
    } catch (error) {
        console.error('Error fetching swapped products:', error);
        setToast({ message: 'Failed to fetch swapped products', type: 'error' });
    } finally {
        setIsLoading(false);
    }
};
// ...existing code...

    // Filter products based on search criteria
    const applyFilters = () => {
        let filtered = swappedProducts;

        // Filter by status
        if (selectedStatus !== 'all') {
            filtered = filtered.filter(product => product.status === selectedStatus);
        }

        // Filter by customer ID
        if (customerIdFilter.trim()) {
            filtered = filtered.filter(product => 
                product.customer?._id?.toLowerCase().includes(customerIdFilter.toLowerCase()) ||
                product.customer?.idNumber?.toLowerCase().includes(customerIdFilter.toLowerCase())
            );
        }

        // Filter by search term (customer name, email)
        if (searchTerm.trim()) {
            filtered = filtered.filter(product =>
                product.customer?.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.customer?.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredProducts(filtered);
    };

    // Handle search
    const handleSearch = () => {
        applyFilters();
    };

    // Clear filters
    const clearFilters = () => {
        setSelectedStatus('all');
        setCustomerIdFilter('');
        setSearchTerm('');
        setFilteredProducts(swappedProducts);
    };

    useEffect(() => {
        fetchSwappedProducts();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [selectedStatus, swappedProducts]);

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

    const handleViewDetails = async (product: ReqForm) => {
        try {
            // Simulate API call for detailed view
            setSelectedProduct(product);
            setShowDetailsModal(true);
        } catch (error) {
            console.error('Error fetching product details:', error);
            setToast({ message: 'Failed to fetch product details', type: 'error' });
        }
    };

    const closeDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedProduct(null);
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

                <header className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg p-8 mb-8">
                    <h1 className="text-3xl font-bold text-white text-center">Branch to Branch</h1>
                    <p className="text-purple-100 text-center mt-2">Monitor and manage all branch to branch transactions</p>
                </header>

                <section className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                            <div className="flex flex-wrap items-center gap-4">
                                {/* <div>
                                    <label htmlFor="search" className="text-sm font-medium text-gray-700">
                                        Search Customer:
                                    </label>
                                    <div className="flex mt-1">
                                        <input
                                            id="search"
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Enter customer name or email"
                                            className="px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        />
                                        <button
                                            onClick={handleSearch}
                                            className="px-4 py-2 bg-purple-600 text-white rounded-r-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            Search
                                        </button>
                                    </div>
                                </div> */}
                                
                                {/* <div>
                                    <label htmlFor="customer-id-filter" className="text-sm font-medium text-gray-700">
                                        Customer ID:
                                    </label>
                                    <input
                                        id="customer-id-filter"
                                        type="text"
                                        value={customerIdFilter}
                                        onChange={(e) => setCustomerIdFilter(e.target.value)}
                                        placeholder="Enter customer ID"
                                        className="mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div> */}
                                
                                <div>
                                    <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
                                        Filter by Status:
                                    </label>
                                    <select
                                        id="status-filter"
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>
                            </div>
                            
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                                Clear Filters
                            </button>
                        </div>
                        
                        <div className="flex flex-wrap gap-6 text-sm">
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-gray-600 rounded-full mr-2"></div>
                                <span>Total : {swappedProducts.length}</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-yellow-400 rounded-full mr-2"></div>
                                <span>Pending: {swappedProducts.filter((p) => p.status === 'pending').length}</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-green-400 rounded-full mr-2"></div>
                                <span>Approved: {swappedProducts.filter((p) => p.status === 'approved').length}</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-red-400 rounded-full mr-2"></div>
                                <span>Rejected: {swappedProducts.filter((p) => p.status === 'rejected').length}</span>
                            </div>
                            {/* <div className="flex items-center">
                                <div className="w-4 h-4 bg-blue-400 rounded-full mr-2"></div>
                                <span>Closed: {swappedProducts.filter((p) => p.status === 'closed').length}</span>
                            </div> */}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                            </div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From Location</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To Location</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset Type</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount/Qty</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredProducts.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center">
                                                    <div className="text-6xl mb-4">📦</div>
                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Swapped Products Found</h3>
                                                    <p className="text-gray-500">
                                                        {customerIdFilter || searchTerm 
                                                            ? 'No swapped products match your search criteria.' 
                                                            : 'No swapped products available at the moment.'}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredProducts.map((product) => (
                                            <tr key={product._id} className="hover:bg-gray-50 transition-colors duration-200">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {product.customer?.customerName || product.customer?.name || 'N/A'}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {product.customer?.customerPhone || product.customer?.customerEmail || product.customer?.email || 'N/A'}
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            ID: {product.customer?.idNumber || product.customer?._id || 'N/A'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    <div>
                                                        <div className="font-medium">
                                                            {product.fromLocation?.branchName || product.fromLocation?.name || 'N/A'}
                                                        </div>
                                                        {product.fromLocation?.branchAddress && (
                                                            <div className="text-xs text-gray-400">
                                                                {product.fromLocation.branchAddress}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    <div>
                                                        <div className="font-medium">
                                                            {product.toLocation?.branchName || product.toLocation?.name || 'N/A'}
                                                        </div>
                                                        {product.toLocation?.branchAddress && (
                                                            <div className="text-xs text-gray-400">
                                                                {product.toLocation.branchAddress}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                        product.assetType === 'gold' 
                                                            ? 'bg-yellow-50 text-yellow-700' 
                                                            : 'bg-green-50 text-green-700'
                                                    }`}>
                                                        {product.assetType || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {product.assetType === 'gold' ? (
                                                        product.quantity ? `${product.quantity} g` : 'N/A'
                                                    ) : (
                                                        product.amount ? formatCurrency(product.amount) : 'N/A'
                                                    )}
                                                    {product.amount && product.assetType === 'gold' && (
                                                        <div className="text-xs text-gray-400">
                                                            Charge: {formatCurrency(product.amount)}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={getStatusBadge(product.status)}>
                                                        {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {formatDate(product.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium">
                                                    <button
                                                        onClick={() => handleViewDetails(product)}
                                                        className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200"
                                                    >
                                                        View Details
                                                    </button>
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
            {showDetailsModal && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
                        <header className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-indigo-600">
                            <h2 className="text-xl font-semibold text-white">Swapped Product Details</h2>
                            <button
                                onClick={closeDetailsModal}
                                className="text-white hover:text-gray-200 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition-colors duration-200"
                            >
                                ×
                            </button>
                        </header>

                        <div className="p-6 space-y-8">
                            {/* Customer Information */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <span className="text-2xl mr-2">👤</span>
                                    Customer Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                                        <p className="text-sm text-gray-900 mt-1">
                                            {selectedProduct.customer?.customerName || selectedProduct.customer?.name || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email</label>
                                        <p className="text-sm text-gray-900 mt-1">
                                            {selectedProduct.customer?.customerEmail || selectedProduct.customer?.email || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                                        <p className="text-sm text-gray-900 mt-1">
                                            {selectedProduct.customer?.customerPhone || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Customer ID</label>
                                        <p className="text-sm text-gray-900 mt-1">
                                            {selectedProduct.customer?.idNumber || selectedProduct.customer?._id || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Current Cash Balance</label>
                                        <p className="text-sm text-gray-900 mt-1">
                                            {formatCurrency(selectedProduct.customer?.cash)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Current Gold Balance</label>
                                        <p className="text-sm text-gray-900 mt-1">
                                            {selectedProduct.customer?.gold ? `${selectedProduct.customer.gold} g` : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Swap Details */}
                            <div className="bg-blue-50 rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <span className="text-2xl mr-2">🔄</span>
                                    Swap Transaction Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">From Location</label>
                                            <p className="text-sm text-gray-900 mt-1 font-medium">
                                                {selectedProduct.fromLocation?.branchName || selectedProduct.fromLocation?.name || 'N/A'}
                                            </p>
                                            {selectedProduct.fromLocation?.branchAddress && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {selectedProduct.fromLocation.branchAddress}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Asset Type</label>
                                            <span className={`inline-block mt-1 px-3 py-1 rounded text-sm font-medium ${
                                                selectedProduct.assetType === 'gold' 
                                                    ? 'bg-yellow-100 text-yellow-800' 
                                                    : 'bg-green-100 text-green-800'
                                            }`}>
                                                {selectedProduct.assetType || 'N/A'}
                                            </span>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Status</label>
                                            <span className={`inline-block mt-1 ${getStatusBadge(selectedProduct.status)}`}>
                                                {selectedProduct.status.charAt(0).toUpperCase() + selectedProduct.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">To Location</label>
                                            <p className="text-sm text-gray-900 mt-1 font-medium">
                                                {selectedProduct.toLocation?.branchName || selectedProduct.toLocation?.name || 'N/A'}
                                            </p>
                                            {selectedProduct.toLocation?.branchAddress && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {selectedProduct.toLocation.branchAddress}
                                                </p>
                                            )}
                                        </div>
                                        {selectedProduct.quantity && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                                                <p className="text-sm text-gray-900 mt-1 font-medium">
                                                    {selectedProduct.quantity} grams
                                                </p>
                                            </div>
                                        )}
                                        {selectedProduct.amount && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    {selectedProduct.assetType === 'gold' ? 'Charge' : 'Amount'}
                                                </label>
                                                <p className="text-sm text-gray-900 mt-1 font-medium">
                                                    {formatCurrency(selectedProduct.amount)}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {selectedProduct.Remarks && (
                                    <div className="mt-6">
                                        <label className="block text-sm font-medium text-gray-700">Remarks</label>
                                        <p className="text-sm text-gray-900 mt-1">{selectedProduct.Remarks}</p>
                                    </div>
                                )}
                                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Created At</label>
                                        <p className="text-sm text-gray-900 mt-1">{formatDate(selectedProduct.createdAt)}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                                        <p className="text-sm text-gray-900 mt-1">{formatDate(selectedProduct.updatedAt)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}