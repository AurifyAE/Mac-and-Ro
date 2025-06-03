import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit, UserPlus, Phone, Mail, MapPin, Calendar, DollarSign, Building, FileText, ImageIcon, Shield, ChevronDown, ChevronUp } from 'lucide-react';

  interface CustomerDetailModalProps {
    customer: any;
    onClose: () => void;
  }

const CustomerManagement = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Fetch customers from API
  useEffect(() => {
    setLoading(true);
    fetch(`${backendUrl}/customers`)
      .then(res => res.json())
      .then(data => {
        setCustomers(data);
        setFilteredCustomers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Fetch single customer by ID when modal opens (optional, for fresh data)
  const handleViewCustomer = (customer: any) => {
    setLoading(true);
    fetch(`${backendUrl}/customers/${customer._id}`)
      .then(res => res.json())
      .then(data => {
        setSelectedCustomer(data);
        setLoading(false);
      })
      .catch(() => {
        setSelectedCustomer(customer); // fallback to passed customer
        setLoading(false);
      });
  };

  // Search and filter logic
  useEffect(() => {
    let filtered = customers;

    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.customerPhone.includes(searchTerm)
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(customer => customer.kycStatus === filterStatus);
    }

    setFilteredCustomers(filtered);
  }, [searchTerm, filterStatus, customers]);

  const getStatusColor = (status: string) => {
    const colors = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
      registered: 'bg-blue-100 text-blue-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: any) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: any) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };



  const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({ customer, onClose }) => {
    if (!customer) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">{customer.customerName}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {customer.customerName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{customer.customerName}</p>
                    <p className="text-sm text-gray-500">@{customer.userName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(customer.kycStatus)}`}>
                    {customer.kycStatus.charAt(0).toUpperCase() + customer.kycStatus.slice(1)}
                  </span>
                  {customer.type && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                      {customer.type}
                    </span>
                  )}
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{customer.customerEmail}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{customer.customerPhone}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Residence</p>
                    <p className="font-medium">{customer.residence}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="font-medium">{formatDate(customer.dateOfBirth)}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Financial Information */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Cash Balance</p>
                      <p className="text-lg font-semibold text-green-600">{formatCurrency(customer.cash)}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="h-6 w-6 bg-yellow-400 rounded text-white text-xs flex items-center justify-center font-bold">Au</span>
                    <div>
                      <p className="text-sm text-gray-500">Gold Holdings</p>
                      <p className="text-lg font-semibold text-yellow-600">
                        {customer.branch.reduce((total: number, b: any) => total + b.gold, 0).toFixed(2)} g
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="h-6 w-6 bg-blue-400 rounded text-white text-xs flex items-center justify-center">%</span>
                    <div>
                      <p className="text-sm text-gray-500">Spread Value</p>
                      <p className="text-lg font-semibold text-blue-600">{customer.spreadValue}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Additional Details */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nationality</p>
                  <p className="font-medium">{customer.nationality}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Source of Income</p>
                  <p className="font-medium">{customer.sourceOfIncome}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ID Number</p>
                  <p className="font-medium">{customer.idNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bank Account</p>
                  <p className="font-medium">{customer.bankAccountNumber}</p>
                </div>
              </div>
            </section>

            {/* Documents */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
              <div className="flex space-x-4">
                {customer.document?.url && (
                  <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg">
                    <FileText className="h-5 w-5 text-gray-600" />
                    <span className="text-sm">Document</span>
                  </div>
                )}
                {customer.image?.url && (
                  <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg">
                    <ImageIcon className="h-5 w-5 text-gray-600" />
                    <span className="text-sm">Profile Image</span>
                  </div>
                )}
                {customer.documentFront?.url && (
                  <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg">
                    <Shield className="h-5 w-5 text-gray-600" />
                    <span className="text-sm">ID Front</span>
                  </div>
                )}
              </div>
            </section>

            {/* Branch Information */}
            {customer.branch.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Branch Holdings</h3>
                <div className="space-y-2">
                  {customer.branch.map((branchInfo: any, index: number) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Building className="h-5 w-5 text-gray-600" />
                        <span className="font-medium">
                          {(branchInfo.branch && branchInfo.branch.name) ? branchInfo.branch.name : 'Branch'}
                        </span>
                      </div>
                      <span className="text-yellow-600 font-semibold">{branchInfo.gold.toFixed(2)} g</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Timestamps */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account History</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium">{formatDate(customer.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium">{formatDate(customer.updatedAt)}</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
              <p className="mt-2 text-gray-600">Manage and view customer information</p>
            </div>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <UserPlus className="h-5 w-5" />
              <span>Add Customer</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers by name, email, phone..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">KYC Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="registered">Registered</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Customer Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">{customers.length}</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {customers.filter(c => c.kycStatus === 'approved').length}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {customers.filter(c => c.kycStatus === 'pending').length}
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Cash</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(customers.reduce((sum, c) => sum + c.cash, 0))}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Customer Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
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
                    Gold Holdings
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
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {customer.customerName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{customer.customerName}</div>
                          <div className="text-sm text-gray-500">@{customer.userName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.customerEmail}</div>
                      <div className="text-sm text-gray-500">{customer.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.kycStatus)}`}>
                        {customer.kycStatus.charAt(0).toUpperCase() + customer.kycStatus.slice(1)}
                      </span>
                      {customer.type && (
                        <div className="mt-1">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                            {customer.type}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(customer.cash)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.branch.reduce((total: number, b: any) => total + b.gold, 0).toFixed(2)} g
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewCustomer(customer)}
                          className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </button>
                        {/* <button className="text-gray-600 hover:text-gray-900 flex items-center space-x-1">
                          <Edit className="h-4 w-4" />
                          <span>Edit</span>
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No customers found</p>
                <p className="text-sm">Try adjusting your search or filter criteria</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
};

export default CustomerManagement;