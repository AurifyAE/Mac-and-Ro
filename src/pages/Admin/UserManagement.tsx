import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Users, Wallet, CheckCircle, Eye } from 'lucide-react';
import { getAllCustomers, searchCustomers } from '../../api/api';

// Define Customer interface
interface Customer {
  _id: string;
  customerName: string;
  userName: string;
  customerEmail: string;
  customerPhone: string;
  kycStatus: 'pending' | 'approved' | 'rejected' | 'registered';
  cash?: number;
  branch: Array<{
    branch: string;
    gold: number;
  }>;
  createdAt: string;
}

function UserManagement() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'customers' | 'wallets' | 'approvals'>('customers');
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch all customers on component mount
    useEffect(() => {
        fetchCustomers();
    }, []);

    // Filter customers based on search term
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredCustomers(customers);
        } else {
            const filtered = customers.filter(customer =>
                customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.customerPhone.includes(searchTerm)
            );
            setFilteredCustomers(filtered);
        }
    }, [searchTerm, customers]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getAllCustomers();
            setCustomers(response.data);
        } catch (err) {
            setError('Failed to fetch customers');
            console.error('Error fetching customers:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value: string) => {
        setSearchTerm(value);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'registered':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'customers':
                return (
                    <div className="p-6">
                        {/* Search Bar */}
                        <div className="mb-6">
                            <div className="relative max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search customers..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                                <p className="mt-2 text-gray-600">Loading customers...</p>
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                <p className="text-red-700">{error}</p>
                                <button
                                    onClick={fetchCustomers}
                                    className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
                                >
                                    Try again
                                </button>
                            </div>
                        )}

                        {/* Customers Table */}
                        {!loading && !error && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Customer
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Contact
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Cash Balance
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredCustomers.map((customer) => (
                                            <tr key={customer._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {customer.customerName}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            @{customer.userName}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {customer.customerEmail}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {customer.customerPhone}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.kycStatus)}`}>
                                                        {customer.kycStatus}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    ${customer.cash?.toFixed(2) || '0.00'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button className="text-blue-600 hover:text-blue-900 flex items-center">
                                                        <Eye className="w-4 h-4 mr-1" />
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* No Results */}
                                {filteredCustomers.length === 0 && !loading && (
                                    <div className="text-center py-8">
                                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500">
                                            {searchTerm ? 'No customers found matching your search.' : 'No customers found.'}
                                        </p>
                                    </div>
                                )}

                                {/* Results Count */}
                                {filteredCustomers.length > 0 && (
                                    <div className="mt-4 text-sm text-gray-600">
                                        Showing {filteredCustomers.length} of {customers.length} customers
                                        {searchTerm && ` for "${searchTerm}"`}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            case 'wallets':
                return (
                    <div className="p-6">
                        {/* Search Bar for Wallets */}
                        <div className="mb-6">
                            <div className="relative max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search user wallets..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                                <p className="mt-2 text-gray-600">Loading user wallets...</p>
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                <p className="text-red-700">{error}</p>
                                <button
                                    onClick={fetchCustomers}
                                    className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
                                >
                                    Try again
                                </button>
                            </div>
                        )}

                        {/* User Wallets Table */}
                        {!loading && !error && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                User
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Cash Balance
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Gold Balance
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Total Branches
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredCustomers.map((customer) => {
                                            const totalGold = customer.branch.reduce((sum, branch) => sum + (branch.gold || 0), 0);
                                            return (
                                                <tr key={customer._id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {customer.customerName}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                @{customer.userName}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                                            <span className="text-sm font-medium text-gray-900">
                                                                ${customer.cash?.toFixed(2) || '0.00'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                                                            <span className="text-sm font-medium text-gray-900">
                                                                {totalGold.toFixed(2)} oz
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                            {customer.branch.length} {customer.branch.length === 1 ? 'branch' : 'branches'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <button className="text-blue-600 hover:text-blue-900 flex items-center">
                                                            <Wallet className="w-4 h-4 mr-1" />
                                                            Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                                {/* No Results */}
                                {filteredCustomers.length === 0 && !loading && (
                                    <div className="text-center py-8">
                                        <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500">
                                            {searchTerm ? 'No user wallets found matching your search.' : 'No user wallets found.'}
                                        </p>
                                    </div>
                                )}

                                {/* Results Count */}
                                {filteredCustomers.length > 0 && (
                                    <div className="mt-4 text-sm text-gray-600">
                                        Showing {filteredCustomers.length} of {customers.length} user wallets
                                        {searchTerm && ` for "${searchTerm}"`}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            case 'approvals':
                return (
                    <div className="p-8 text-center">
                        <CheckCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('Approvals')}</h3>
                        <p className="text-gray-600">Handle user approval requests and permissions</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 py-8">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                <header className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 mb-8">
                    <h1 className="text-3xl font-bold text-white text-center">{t('User Management')}</h1>
                    <p className="text-blue-100 text-center mt-2">Manage customers, wallets, and approvals efficiently</p>
                </header>

                <section className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6" aria-label="Tabs">
                            <button
                                onClick={() => setActiveTab('customers')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                                    activeTab === 'customers'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {t('Customers')}
                            </button>
                            <button
                                onClick={() => setActiveTab('wallets')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                                    activeTab === 'wallets'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {t('User Wallets')}
                            </button>
                            {/* <button
                                onClick={() => setActiveTab('approvals')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                                    activeTab === 'approvals'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {t('Approvals')}
                            </button> */}
                        </nav>
                    </div>

                    <div className="min-h-96">
                        {renderTabContent()}
                    </div>
                </section>
            </div>
        </main>
    );
}

export default UserManagement;