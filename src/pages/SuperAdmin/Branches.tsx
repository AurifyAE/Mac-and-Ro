import React, { useEffect, useState, ChangeEvent } from 'react';
import { createBranch, getAllBranches, updateBranch, deleteBranch } from '../../api/api';
import Select from 'react-select';

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
    country?: string; // <-- Add this line
    chargeTo?: ChargeToBranch[];
    createdAt?: string;
    updatedAt?: string;
}

const emptyForm: BranchData = {
    branchName: '',
    branchAddress: '',
    branchPhone: '',
    branchEmail: '',
    country: '', // <-- Add this line
    chargeTo: [],
};

const countryOptions = [
    { value: 'Afghanistan', label: 'Afghanistan' },
    { value: 'Åland Islands', label: 'Åland Islands' },
    { value: 'Albania', label: 'Albania' },
    { value: 'Algeria', label: 'Algeria' },
    { value: 'American Samoa', label: 'American Samoa' },
    { value: 'Andorra', label: 'Andorra' },
    { value: 'Angola', label: 'Angola' },
    { value: 'Anguilla', label: 'Anguilla' },
    { value: 'Antarctica', label: 'Antarctica' },
    { value: 'Antigua and Barbuda', label: 'Antigua and Barbuda' },
    { value: 'Argentina', label: 'Argentina' },
    { value: 'Armenia', label: 'Armenia' },
    { value: 'Aruba', label: 'Aruba' },
    { value: 'Australia', label: 'Australia' },
    { value: 'Austria', label: 'Austria' },
    { value: 'Azerbaijan', label: 'Azerbaijan' },
    { value: 'Bahamas', label: 'Bahamas' },
    { value: 'Bahrain', label: 'Bahrain' },
    { value: 'Bangladesh', label: 'Bangladesh' },
    { value: 'Barbados', label: 'Barbados' },
    { value: 'Belarus', label: 'Belarus' },
    { value: 'Belgium', label: 'Belgium' },
    { value: 'Belize', label: 'Belize' },
    { value: 'Benin', label: 'Benin' },
    { value: 'Bermuda', label: 'Bermuda' },
    { value: 'Bhutan', label: 'Bhutan' },
    { value: 'Bolivia', label: 'Bolivia' },
    { value: 'Bosnia and Herzegovina', label: 'Bosnia and Herzegovina' },
    { value: 'Botswana', label: 'Botswana' },
    { value: 'Bouvet Island', label: 'Bouvet Island' },
    { value: 'Brazil', label: 'Brazil' },
    { value: 'British Indian Ocean Territory', label: 'British Indian Ocean Territory' },
    { value: 'Brunei Darussalam', label: 'Brunei Darussalam' },
    { value: 'Bulgaria', label: 'Bulgaria' },
    { value: 'Burkina Faso', label: 'Burkina Faso' },
    { value: 'Burundi', label: 'Burundi' },
    { value: 'Cambodia', label: 'Cambodia' },
    { value: 'Cameroon', label: 'Cameroon' },
    { value: 'Canada', label: 'Canada' },
    { value: 'Cape Verde', label: 'Cape Verde' },
    { value: 'Cayman Islands', label: 'Cayman Islands' },
    { value: 'Central African Republic', label: 'Central African Republic' },
    { value: 'Chad', label: 'Chad' },
    { value: 'Chile', label: 'Chile' },
    { value: 'China', label: 'China' },
    { value: 'Christmas Island', label: 'Christmas Island' },
    { value: 'Cocos (Keeling) Islands', label: 'Cocos (Keeling) Islands' },
    { value: 'Colombia', label: 'Colombia' },
    { value: 'Comoros', label: 'Comoros' },
    { value: 'Congo', label: 'Congo' },
    { value: 'Congo, The Democratic Republic of The', label: 'Congo, The Democratic Republic of The' },
    { value: 'Cook Islands', label: 'Cook Islands' },
    { value: 'Costa Rica', label: 'Costa Rica' },
    { value: "Cote D'ivoire", label: "Cote D'ivoire" },
    { value: 'Croatia', label: 'Croatia' },
    { value: 'Cuba', label: 'Cuba' },
    { value: 'Cyprus', label: 'Cyprus' },
    { value: 'Czech Republic', label: 'Czech Republic' },
    { value: 'Denmark', label: 'Denmark' },
    { value: 'Djibouti', label: 'Djibouti' },
    { value: 'Dominica', label: 'Dominica' },
    { value: 'Dominican Republic', label: 'Dominican Republic' },
    { value: 'Ecuador', label: 'Ecuador' },
    { value: 'Egypt', label: 'Egypt' },
    { value: 'El Salvador', label: 'El Salvador' },
    { value: 'Equatorial Guinea', label: 'Equatorial Guinea' },
    { value: 'Eritrea', label: 'Eritrea' },
    { value: 'Estonia', label: 'Estonia' },
    { value: 'Ethiopia', label: 'Ethiopia' },
    { value: 'Falkland Islands (Malvinas)', label: 'Falkland Islands (Malvinas)' },
    { value: 'Faroe Islands', label: 'Faroe Islands' },
    { value: 'Fiji', label: 'Fiji' },
    { value: 'Finland', label: 'Finland' },
    { value: 'France', label: 'France' },
    { value: 'French Guiana', label: 'French Guiana' },
    { value: 'French Polynesia', label: 'French Polynesia' },
    { value: 'French Southern Territories', label: 'French Southern Territories' },
    { value: 'Gabon', label: 'Gabon' },
    { value: 'Gambia', label: 'Gambia' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Germany', label: 'Germany' },
    { value: 'Ghana', label: 'Ghana' },
    { value: 'Gibraltar', label: 'Gibraltar' },
    { value: 'Greece', label: 'Greece' },
    { value: 'Greenland', label: 'Greenland' },
    { value: 'Grenada', label: 'Grenada' },
    { value: 'Guadeloupe', label: 'Guadeloupe' },
    { value: 'Guam', label: 'Guam' },
    { value: 'Guatemala', label: 'Guatemala' },
    { value: 'Guernsey', label: 'Guernsey' },
    { value: 'Guinea', label: 'Guinea' },
    { value: 'Guinea-bissau', label: 'Guinea-bissau' },
    { value: 'Guyana', label: 'Guyana' },
    { value: 'Haiti', label: 'Haiti' },
    { value: 'Heard Island and Mcdonald Islands', label: 'Heard Island and Mcdonald Islands' },
    { value: 'Holy See (Vatican City State)', label: 'Holy See (Vatican City State)' },
    { value: 'Honduras', label: 'Honduras' },
    { value: 'Hong Kong', label: 'Hong Kong' },
    { value: 'Hungary', label: 'Hungary' },
    { value: 'Iceland', label: 'Iceland' },
    { value: 'India', label: 'India' },
    { value: 'Indonesia', label: 'Indonesia' },
    { value: 'Iran, Islamic Republic of', label: 'Iran, Islamic Republic of' },
    { value: 'Iraq', label: 'Iraq' },
    { value: 'Ireland', label: 'Ireland' },
    { value: 'Isle of Man', label: 'Isle of Man' },
    { value: 'Israel', label: 'Israel' },
    { value: 'Italy', label: 'Italy' },
    { value: 'Jamaica', label: 'Jamaica' },
    { value: 'Japan', label: 'Japan' },
    { value: 'Jersey', label: 'Jersey' },
    { value: 'Jordan', label: 'Jordan' },
    { value: 'Kazakhstan', label: 'Kazakhstan' },
    { value: 'Kenya', label: 'Kenya' },
    { value: 'Kiribati', label: 'Kiribati' },
    { value: "Korea, Democratic People's Republic of", label: "Korea, Democratic People's Republic of" },
    { value: 'Korea, Republic of', label: 'Korea, Republic of' },
    { value: 'Kuwait', label: 'Kuwait' },
    { value: 'Kyrgyzstan', label: 'Kyrgyzstan' },
    { value: "Lao People's Democratic Republic", label: "Lao People's Democratic Republic" },
    { value: 'Latvia', label: 'Latvia' },
    { value: 'Lebanon', label: 'Lebanon' },
    { value: 'Lesotho', label: 'Lesotho' },
    { value: 'Liberia', label: 'Liberia' },
    { value: 'Libyan Arab Jamahiriya', label: 'Libyan Arab Jamahiriya' },
    { value: 'Liechtenstein', label: 'Liechtenstein' },
    { value: 'Lithuania', label: 'Lithuania' },
    { value: 'Luxembourg', label: 'Luxembourg' },
    { value: 'Macao', label: 'Macao' },
    { value: 'Macedonia, The Former Yugoslav Republic of', label: 'Macedonia, The Former Yugoslav Republic of' },
    { value: 'Madagascar', label: 'Madagascar' },
    { value: 'Malawi', label: 'Malawi' },
    { value: 'Malaysia', label: 'Malaysia' },
    { value: 'Maldives', label: 'Maldives' },
    { value: 'Mali', label: 'Mali' },
    { value: 'Malta', label: 'Malta' },
    { value: 'Marshall Islands', label: 'Marshall Islands' },
    { value: 'Martinique', label: 'Martinique' },
    { value: 'Mauritania', label: 'Mauritania' },
    { value: 'Mauritius', label: 'Mauritius' },
    { value: 'Mayotte', label: 'Mayotte' },
    { value: 'Mexico', label: 'Mexico' },
    { value: 'Micronesia, Federated States of', label: 'Micronesia, Federated States of' },
    { value: 'Moldova, Republic of', label: 'Moldova, Republic of' },
    { value: 'Monaco', label: 'Monaco' },
    { value: 'Mongolia', label: 'Mongolia' },
    { value: 'Montenegro', label: 'Montenegro' },
    { value: 'Montserrat', label: 'Montserrat' },
    { value: 'Morocco', label: 'Morocco' },
    { value: 'Mozambique', label: 'Mozambique' },
    { value: 'Myanmar', label: 'Myanmar' },
    { value: 'Namibia', label: 'Namibia' },
    { value: 'Nauru', label: 'Nauru' },
    { value: 'Nepal', label: 'Nepal' },
    { value: 'Netherlands', label: 'Netherlands' },
    { value: 'Netherlands Antilles', label: 'Netherlands Antilles' },
    { value: 'New Caledonia', label: 'New Caledonia' },
    { value: 'New Zealand', label: 'New Zealand' },
    { value: 'Nicaragua', label: 'Nicaragua' },
    { value: 'Niger', label: 'Niger' },
    { value: 'Nigeria', label: 'Nigeria' },
    { value: 'Niue', label: 'Niue' },
    { value: 'Norfolk Island', label: 'Norfolk Island' },
    { value: 'Northern Mariana Islands', label: 'Northern Mariana Islands' },
    { value: 'Norway', label: 'Norway' },
    { value: 'Oman', label: 'Oman' },
    { value: 'Pakistan', label: 'Pakistan' },
    { value: 'Palau', label: 'Palau' },
    { value: 'Palestinian Territory, Occupied', label: 'Palestinian Territory, Occupied' },
    { value: 'Panama', label: 'Panama' },
    { value: 'Papua New Guinea', label: 'Papua New Guinea' },
    { value: 'Paraguay', label: 'Paraguay' },
    { value: 'Peru', label: 'Peru' },
    { value: 'Philippines', label: 'Philippines' },
    { value: 'Pitcairn', label: 'Pitcairn' },
    { value: 'Poland', label: 'Poland' },
    { value: 'Portugal', label: 'Portugal' },
    { value: 'Puerto Rico', label: 'Puerto Rico' },
    { value: 'Qatar', label: 'Qatar' },
    { value: 'Reunion', label: 'Reunion' },
    { value: 'Romania', label: 'Romania' },
    { value: 'Russian Federation', label: 'Russian Federation' },
    { value: 'Rwanda', label: 'Rwanda' },
    { value: 'Saint Helena', label: 'Saint Helena' },
    { value: 'Saint Kitts and Nevis', label: 'Saint Kitts and Nevis' },
    { value: 'Saint Lucia', label: 'Saint Lucia' },
    { value: 'Saint Pierre and Miquelon', label: 'Saint Pierre and Miquelon' },
    { value: 'Saint Vincent and The Grenadines', label: 'Saint Vincent and The Grenadines' },
    { value: 'Samoa', label: 'Samoa' },
    { value: 'San Marino', label: 'San Marino' },
    { value: 'Sao Tome and Principe', label: 'Sao Tome and Principe' },
    { value: 'Saudi Arabia', label: 'Saudi Arabia' },
    { value: 'Senegal', label: 'Senegal' },
    { value: 'Serbia', label: 'Serbia' },
    { value: 'Seychelles', label: 'Seychelles' },
    { value: 'Sierra Leone', label: 'Sierra Leone' },
    { value: 'Singapore', label: 'Singapore' },
    { value: 'Slovakia', label: 'Slovakia' },
    { value: 'Slovenia', label: 'Slovenia' },
    { value: 'Solomon Islands', label: 'Solomon Islands' },
    { value: 'Somalia', label: 'Somalia' },
    { value: 'South Africa', label: 'South Africa' },
    { value: 'South Georgia and The South Sandwich Islands', label: 'South Georgia and The South Sandwich Islands' },
    { value: 'Spain', label: 'Spain' },
    { value: 'Sri Lanka', label: 'Sri Lanka' },
    { value: 'Sudan', label: 'Sudan' },
    { value: 'Suriname', label: 'Suriname' },
    { value: 'Svalbard and Jan Mayen', label: 'Svalbard and Jan Mayen' },
    { value: 'Swaziland', label: 'Swaziland' },
    { value: 'Sweden', label: 'Sweden' },
    { value: 'Switzerland', label: 'Switzerland' },
    { value: 'Syrian Arab Republic', label: 'Syrian Arab Republic' },
    { value: 'Taiwan', label: 'Taiwan' },
    { value: 'Tajikistan', label: 'Tajikistan' },
    { value: 'Tanzania, United Republic of', label: 'Tanzania, United Republic of' },
    { value: 'Thailand', label: 'Thailand' },
    { value: 'Timor-leste', label: 'Timor-leste' },
    { value: 'Togo', label: 'Togo' },
    { value: 'Tokelau', label: 'Tokelau' },
    { value: 'Tonga', label: 'Tonga' },
    { value: 'Trinidad and Tobago', label: 'Trinidad and Tobago' },
    { value: 'Tunisia', label: 'Tunisia' },
    { value: 'Turkey', label: 'Turkey' },
    { value: 'Turkmenistan', label: 'Turkmenistan' },
    { value: 'Turks and Caicos Islands', label: 'Turks and Caicos Islands' },
    { value: 'Tuvalu', label: 'Tuvalu' },
    { value: 'Uganda', label: 'Uganda' },
    { value: 'Ukraine', label: 'Ukraine' },
    { value: 'United Arab Emirates', label: 'United Arab Emirates' },
    { value: 'United Kingdom', label: 'United Kingdom' },
    { value: 'United States', label: 'United States' },
    { value: 'United States Minor Outlying Islands', label: 'United States Minor Outlying Islands' },
    { value: 'Uruguay', label: 'Uruguay' },
    { value: 'Uzbekistan', label: 'Uzbekistan' },
    { value: 'Vanuatu', label: 'Vanuatu' },
    { value: 'Venezuela', label: 'Venezuela' },
    { value: 'Viet Nam', label: 'Viet Nam' },
    { value: 'Virgin Islands, British', label: 'Virgin Islands, British' },
    { value: 'Virgin Islands, U.S.', label: 'Virgin Islands, U.S.' },
    { value: 'Wallis and Futuna', label: 'Wallis and Futuna' },
    { value: 'Western Sahara', label: 'Western Sahara' },
    { value: 'Yemen', label: 'Yemen' },
    { value: 'Zambia', label: 'Zambia' },
    { value: 'Zimbabwe', label: 'Zimbabwe' },
];

export default function Branches() {
    const [branches, setBranches] = useState<BranchData[]>([]);
    const [form, setForm] = useState<BranchData>({ ...emptyForm });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
    const [branchToDelete, setBranchToDelete] = useState<BranchData | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

    // Update handleChange to support select fields
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!form.branchName.trim()) newErrors.branchName = 'Branch Name is required';
        if (!form.branchEmail.trim()) newErrors.branchEmail = 'Branch Email is required';
        if (!form.branchPhone.trim()) newErrors.branchPhone = 'Branch Phone is required';
        if (!form.branchAddress.trim()) newErrors.branchAddress = 'Branch Address is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        try {
            if (editingId) {
                await updateBranch(editingId, form);
            } else {
                await createBranch(form);
            }
            setForm({ ...emptyForm });
            setEditingId(null);
            setShowModal(false);
            setErrors({});
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
                        {errors.branchName && <p className="text-red-500 text-xs">{errors.branchName}</p>}
                        <input 
                            type="email" 
                            name="branchEmail" 
                            value={form.branchEmail || ''} 
                            onChange={handleChange} 
                            placeholder="Branch Email" 
                            className="w-full border rounded px-3 py-2" 
                        />
                        {errors.branchEmail && <p className="text-red-500 text-xs">{errors.branchEmail}</p>}
                        <input 
                            type="text" 
                            name="branchPhone" 
                            value={form.branchPhone || ''} 
                            onChange={handleChange} 
                            placeholder="Branch Phone" 
                            className="w-full border rounded px-3 py-2" 
                        />
                        {errors.branchPhone && <p className="text-red-500 text-xs">{errors.branchPhone}</p>}
                         <Select
                            name="country"
                            options={countryOptions}
                            value={countryOptions.find(option => option.value === form.country) || null}
                            onChange={option => setForm({ ...form, country: option ? option.value : '' })}
                            className="w-full"
                            classNamePrefix="react-select"
                            placeholder="Select Country"
                        />
                        <input 
                            type="text" 
                            name="branchAddress" 
                            value={form.branchAddress || ''} 
                            onChange={handleChange} 
                            placeholder="Branch Address" 
                            className="w-full border rounded px-3 py-2" 
                        />
                        {errors.branchAddress && <p className="text-red-500 text-xs">{errors.branchAddress}</p>}
                       
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