import React, { useEffect, useState, ChangeEvent } from 'react';
import { createBranch, getAllBranches, updateBranch, deleteBranch } from '../../api/api';

interface ChargeToBranch {
    branch: string;
    amount: number;
}

interface BranchData {
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

const emptyForm: BranchData = {
    branchName: '',
    branchAddress: '',
    branchPhone: '',
    branchEmail: '',
    chargeTo: [],
};

export default function Branches() {
    const [branches, setBranches] = useState<BranchData[]>([]);
    const [form, setForm] = useState<BranchData>({ ...emptyForm });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
    const [branchToDelete, setBranchToDelete] = useState<BranchData | null>(null);

    const fetchBranches = async () => {
        try {
            const response = await getAllBranches();
            setBranches(response.data);
        } catch (error) {
            console.error('Error fetching branches:', error);
        }
    };

    useEffect(() => {
        fetchBranches();
    }, []);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async () => {
        try {
            if (editingId) {
                await updateBranch(editingId, form);
            } else {
                await createBranch(form);
            }
            setForm({ ...emptyForm });
            setEditingId(null);
            setShowModal(false);
            fetchBranches();
        } catch (err) {
            console.error('Error saving branch:', err);
        }
    };

    const handleEdit = (branch: BranchData) => {
        setForm({ ...branch });
        setEditingId(branch._id || null);
        setShowModal(true);
    };

    const confirmDelete = (branch: BranchData) => {
        setBranchToDelete(branch);
        setDeleteConfirmModal(true);
    };

    const handleDelete = async () => {
        if (!branchToDelete?._id) return;
        try {
            await deleteBranch(branchToDelete._id);
            setBranchToDelete(null);
            setDeleteConfirmModal(false);
            fetchBranches();
        } catch (err) {
            console.error('Error deleting branch:', err);
        }
    };

    const closeDeleteModal = () => {
        setDeleteConfirmModal(false);
        setBranchToDelete(null);
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

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <main className="min-h-screen bg-gray-50 py-8">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                <header className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 mb-8">
                    <h1 className="text-3xl font-bold text-white text-center">Branch Management</h1>
                    <p className="text-blue-100 text-center mt-2">Manage your company branches efficiently</p>
                </header>

                <section className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <button
                            onClick={openModal}
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-medium transition"
                        >
                            + Add New Branch
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {branches.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                            No Branches Found
                                        </td>
                                    </tr>
                                ) : (
                                    branches.map((branch) => (
                                        <tr key={branch._id}>
                                            <td className="px-6 py-4">{branch.branchCode || 'N/A'}</td>
                                            <td className="px-6 py-4">{branch.branchName || 'N/A'}</td>
                                            <td className="px-6 py-4">{branch.branchEmail || 'N/A'}</td>
                                            <td className="px-6 py-4">{branch.branchPhone || 'N/A'}</td>
                                            <td className="px-6 py-4">{branch.branchAddress || 'N/A'}</td>
                                            <td className="px-6 py-4">{formatDate(branch.createdAt)}</td>
                                            <td className="px-6 py-4 space-x-2">
                                                <button onClick={() => handleEdit(branch)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs">
                                                    Edit
                                                </button>
                                                <button onClick={() => confirmDelete(branch)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs">
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            {/* Branch Form Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-md p-6 space-y-4">
                        <h2 className="text-lg font-bold">{editingId ? 'Edit Branch' : 'Add New Branch'}</h2>
                        <input 
                            type="text" 
                            name="branchName" 
                            value={form.branchName || ''} 
                            onChange={handleChange} 
                            placeholder="Branch Name" 
                            className="w-full border rounded px-3 py-2" 
                        />
                        <input 
                            type="email" 
                            name="branchEmail" 
                            value={form.branchEmail || ''} 
                            onChange={handleChange} 
                            placeholder="Branch Email" 
                            className="w-full border rounded px-3 py-2" 
                        />
                        <input 
                            type="text" 
                            name="branchPhone" 
                            value={form.branchPhone || ''} 
                            onChange={handleChange} 
                            placeholder="Branch Phone" 
                            className="w-full border rounded px-3 py-2" 
                        />
                        <input 
                            type="text" 
                            name="branchAddress" 
                            value={form.branchAddress || ''} 
                            onChange={handleChange} 
                            placeholder="Branch Address" 
                            className="w-full border rounded px-3 py-2" 
                        />
                        <div className="flex justify-end space-x-3 pt-4 border-t">
                            <button onClick={closeModal} className="px-4 py-2 bg-gray-100 rounded">
                                Cancel
                            </button>
                            <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">
                                {editingId ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmModal && branchToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-sm w-full">
                        <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
                        <p>
                            Are you sure you want to delete branch <strong>{branchToDelete.branchName}</strong>?
                        </p>
                        <div className="flex justify-end mt-6 space-x-3">
                            <button onClick={closeDeleteModal} className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                                Cancel
                            </button>
                            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}