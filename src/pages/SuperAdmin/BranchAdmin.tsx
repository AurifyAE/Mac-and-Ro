import React, { useEffect, useState, ChangeEvent } from 'react';
import { createBranchAdmin, getAllBranchAdmins, updateBranchAdmin, deleteBranchAdmin, getAllBranches } from '../../api/api';

interface Branch {
    _id?: string;
    branchName: string;
    branchCode?: string;
    branchAddress: string;
    branchPhone: string;
    branchEmail: string;
    createdAt?: string;
    updatedAt?: string;
}

interface BranchAdminData {
    _id?: string;
    name: string;
    code?: string;
    address: string;
    phone: string;
    email: string;
    userId: string;
    password: string;
    branch: string; // ObjectId of the branch
    branchName?: string; // For display purposes
    image?: File | null;
}

const emptyForm: BranchAdminData = {
    name: '',
    address: '',
    phone: '',
    email: '',
    userId: '',
    password: '',
    branch: '',
    image: null,
};

export default function BranchAdmin() {
    const [admins, setAdmins] = useState<BranchAdminData[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [form, setForm] = useState<BranchAdminData>({ ...emptyForm });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
    const [branchAdminToDelete, setBranchAdminToDelete] = useState<BranchAdminData | null>(null);

    const fetchBranches = async () => {
        try {
            const response = await getAllBranches();
            setBranches(response.data);
        } catch (error) {
            console.error('Error fetching branches:', error);
        }
    };

    const fetchAdmins = async () => {
        try {
            const response = await getAllBranchAdmins();

            // Handle populated branch data
            const transformed = response.data.map(
                (admin: any): BranchAdminData => ({
                    _id: admin._id,
                    name: admin.name || '',
                    code: admin.code,
                    address: admin.address || '',
                    phone: admin.phone || '',
                    email: admin.email || '',
                    userId: admin.userId || '',
                    password: '', // Never return passwords from API
                    // Handle branch ObjectId or populated branch object
                    branch: typeof admin.branch === 'object' ? admin.branch._id : admin.branch || '',
                    branchName: typeof admin.branch === 'object' ? admin.branch.branchName : branches.find((b) => b._id === admin.branch)?.branchName || 'Unknown Branch',
                    image: null,
                })
            );

            setAdmins(transformed);
        } catch (err) {
            console.error('Error fetching admins:', err);
        }
    };

    useEffect(() => {
        fetchBranches();
    }, []);

    useEffect(() => {
        if (branches.length > 0) {
            fetchAdmins();
        }
    }, [branches]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, files } = e.target as HTMLInputElement;
        if (name === 'image' && files) {
            setForm({ ...form, image: files[0] });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleSubmit = async () => {
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => {
                if (value && key !== 'branchName') {
                    // Don't send branchName to API
                    formData.append(key, value);
                }
            });

            if (editingId) {
                await updateBranchAdmin(editingId, formData);
            } else {
                await createBranchAdmin(formData);
            }

            await fetchAdmins();
            setForm({ ...emptyForm });
            setEditingId(null);
            setShowModal(false);
        } catch (err) {
            console.error('Error saving admin:', err);
        }
    };

    const handleEdit = (admin: BranchAdminData) => {
        setForm({ ...admin, image: null, password: '' });
        setEditingId(admin._id || null);
        setShowModal(true);
    };

    // Updated delete function to show confirmation modal
    const handleDeleteClick = (admin: BranchAdminData) => {
        setBranchAdminToDelete(admin);
        setDeleteConfirmModal(true);
    };

    // Actual delete function that executes after confirmation
    const confirmDelete = async () => {
        if (!branchAdminToDelete?._id) return;

        try {
            await deleteBranchAdmin(branchAdminToDelete._id);
            await fetchAdmins();
            closeDeleteModal();
        } catch (err) {
            console.error('Error deleting admin:', err);
        }
    };

    const closeDeleteModal = () => {
        setDeleteConfirmModal(false);
        setBranchAdminToDelete(null);
    };

    const openModal = () => {
        setForm({ ...emptyForm });
        setEditingId(null);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setForm({ ...emptyForm });
        setEditingId(null);
    };

    return (
        <main className="min-h-screen bg-gray-50 py-8">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                <header className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 mb-8">
                    <h1 className="text-3xl font-bold text-white text-center">Branch Admin Management</h1>
                    <p className="text-blue-100 text-center mt-2">Manage your branch administrators efficiently</p>
                </header>

                <section className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <button
                            onClick={openModal}
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg"
                        >
                            + Add Branch Admin
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {admins.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center">
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Branch Admins Found</h3>
                                                <p className="text-gray-500">Click "Add Branch Admin" to get started.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    admins.map((admin) => (
                                        <tr key={admin._id} className="hover:bg-gray-50 transition-colors duration-200">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{admin.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{admin.email}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{admin.phone}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {admin.branchName || admin.branch || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{admin.userId}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={admin.address}>
                                                {admin.address}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(admin)}
                                                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(admin)}
                                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200"
                                                    >
                                                        Delete
                                                    </button>
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

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-screen overflow-y-auto">
                        <header className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">{editingId ? 'Edit Branch Admin' : 'Add Branch Admin'}</h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200"
                            >
                                ×
                            </button>
                        </header>

                        <div className="p-6 space-y-4">
                            <div className="space-y-4">
                                {/* Name Field */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={form.name || ''}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                {/* Email Field */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={form.email || ''}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                {/* Phone Field */}
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone *
                                    </label>
                                    <input
                                        type="text"
                                        id="phone"
                                        name="phone"
                                        value={form.phone || ''}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                {/* Branch Dropdown */}
                                <div>
                                    <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-2">
                                        Branch *
                                    </label>
                                    <select
                                        id="branch"
                                        name="branch"
                                        value={form.branch || ''}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Select a branch</option>
                                        {branches.map((branch) => (
                                            <option key={branch._id} value={branch._id}>
                                                {branch.branchName} ({branch.branchCode})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* User ID Field */}
                                <div>
                                    <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
                                        User ID *
                                    </label>
                                    <input
                                        type="text"
                                        id="userId"
                                        name="userId"
                                        value={form.userId || ''}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                {/* Password Field */}
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                        Password *
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={form.password || ''}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                {/* Address Field */}
                                <div>
                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                                        Address *
                                    </label>
                                    <input
                                        type="text"
                                        id="address"
                                        name="address"
                                        value={form.address || ''}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                {/* Image Upload */}
                                <div>
                                    <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                                        Profile Image
                                    </label>
                                    <input
                                        type="file"
                                        id="image"
                                        name="image"
                                        accept="image/*"
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <footer className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-md font-medium transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
                                >
                                    {editingId ? 'Update Admin' : 'Add Admin'}
                                </button>
                            </footer>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmModal && branchAdminToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
                        <header className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                                </svg>
                                Confirm Deletion
                            </h3>
                        </header>
                        
                        <div className="p-6">
                            <p className="text-gray-600 mb-2">
                                Are you sure you want to delete the branch admin:
                            </p>
                            <div className="bg-gray-50 p-3 rounded-md mb-4">
                                <p className="font-semibold text-gray-900">{branchAdminToDelete.name}</p>
                                <p className="text-sm text-gray-600">{branchAdminToDelete.email}</p>
                                <p className="text-sm text-gray-600">{branchAdminToDelete.branchName || 'Unknown Branch'}</p>
                            </div>
                            <p className="text-sm text-red-600">
                                This action cannot be undone.
                            </p>
                        </div>

                        <footer className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                            <button 
                                onClick={closeDeleteModal} 
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmDelete} 
                                className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-200 flex items-center"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                                Delete Admin
                            </button>
                        </footer>
                    </div>
                </div>
            )}
        </main>
    );
}