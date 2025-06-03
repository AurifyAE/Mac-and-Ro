import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../store';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { setPageTitle } from '../store/themeConfigSlice';
import IconRefresh from '../components/Icon/IconRefresh';
import IconClock from '../components/Icon/IconClock';
import IconAlertCircle from '../components/Icon/IconLoader';
import IconUser from '../components/Icon/IconUser';
import IconUserCheck from '../components/Icon/IconUserPlus';
import IconUserX from '../components/Icon/IconPlusCircle';
import IconUserPlus from '../components/Icon/IconUserPlus';

const Index = () => {
    const dispatch = useDispatch();
    const [logs, setLogs] = useState<any>([]);
    const [loading, setLoading] = useState(true);
    const [customers, setCustomers] = useState<any>([]);
    const [error, setError] = useState<any>(null);
    const [customerStats, setCustomerStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        registered: 0
    });
    const backendUrl = import.meta.env.VITE_API_URL || '/api';

    useEffect(() => {
        dispatch(setPageTitle('System Logs'));
    }, [dispatch]);

    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);

    // Calculate customer statistics
    const calculateCustomerStats = (customersData: any[]) => {
        const stats = {
            total: customersData.length,
            pending: 0,
            approved: 0,
            rejected: 0,
            registered: 0
        };

        customersData.forEach(customer => {
            const status = customer.kycStatus || 'pending'; // Default to pending if not set
            switch (status) {
                case 'pending':
                    stats.pending++;
                    break;
                case 'approved':
                    stats.approved++;
                    break;
                case 'rejected':
                    stats.rejected++;
                    break;
                case 'registered':
                    stats.registered++;
                    break;
            }
        });

        setCustomerStats(stats);
    };

    // Fetch logs from backend
    const fetchLogs = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${backendUrl}/logs`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setLogs(data);
        } catch (err) {
            const error = err as Error;
            console.error('Error fetching logs:', error);
            setError(error.message || 'Failed to fetch logs');
        } finally {
            setLoading(false);
        }
    };

    // Fetch customers from backend
    const fetchCustomers = async () => {
        try {
            const response = await fetch(`${backendUrl}/customers`);
            const data = await response.json();
            console.log('customers', data);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            setCustomers(data);
            calculateCustomerStats(data);
            console.log('Fetched customers:', data);
        } catch (error) {
            console.error('Error fetching customers:', error);
            setError('Failed to fetch customers');
        }
    }

    useEffect(() => {
        fetchCustomers();
    }, [])

    useEffect(() => {
        fetchLogs();
        // Auto-refresh logs every 30 seconds
        const interval = setInterval(fetchLogs, 30000);
        return () => clearInterval(interval);
    }, []);

    // Format date to readable format
    const formatDate = (dateString: any) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    // Get time ago string
    const getTimeAgo = (dateString: any) => {
        const now = new Date();
        const logDate = new Date(dateString);
        const diffInSeconds = Math.floor((now.getTime() - logDate.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr ago`;
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    };

    return (
        <div>
            {/* Breadcrumb */}
            <ul className="flex space-x-2 rtl:space-x-reverse">
                <li>
                    <Link to="/" className="text-primary hover:underline">
                        Dashboard
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>System Logs</span>
                </li>
            </ul>

            <div className="pt-5">
                {/* Header Section */}
                <div className="panel mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h5 className="font-semibold text-lg dark:text-white-light mb-2">System Logs & Customer Overview</h5>
                            <p className="text-white-dark">Real-time system logs • Auto-refreshes every 30 seconds • Logs expire after 10 days</p>
                        </div>
                        <button type="button" onClick={fetchLogs} disabled={loading} className="btn btn-primary flex items-center gap-2">
                            <IconRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Customer Statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    <div className="panel">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-primary-light dark:bg-primary text-primary dark:text-primary-light rounded-lg flex items-center justify-center ltr:mr-3 rtl:ml-3">
                                <IconUser className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <div className="text-primary text-xl font-bold">{customerStats.total}</div>
                                <div className="text-xs text-white-dark">Total Customers</div>
                            </div>
                        </div>
                    </div>

                    <div className="panel">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-warning-light dark:bg-warning text-warning dark:text-warning-light rounded-lg flex items-center justify-center ltr:mr-3 rtl:ml-3">
                                <IconClock className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <div className="text-warning text-xl font-bold">{customerStats.pending}</div>
                                <div className="text-xs text-white-dark">Pending KYC</div>
                            </div>
                        </div>
                    </div>

                    <div className="panel">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-success-light dark:bg-success text-success dark:text-success-light rounded-lg flex items-center justify-center ltr:mr-3 rtl:ml-3">
                                <IconUserCheck className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <div className="text-success text-xl font-bold">{customerStats.approved}</div>
                                <div className="text-xs text-white-dark">Approved KYC</div>
                            </div>
                        </div>
                    </div>

                    <div className="panel">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-danger-light dark:bg-danger text-danger dark:text-danger-light rounded-lg flex items-center justify-center ltr:mr-3 rtl:ml-3">
                                <IconUserX className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <div className="text-danger text-xl font-bold">{customerStats.rejected}</div>
                                <div className="text-xs text-white-dark">Rejected KYC</div>
                            </div>
                        </div>
                    </div>

                    <div className="panel">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-info-light dark:bg-info text-info dark:text-info-light rounded-lg flex items-center justify-center ltr:mr-3 rtl:ml-3">
                                <IconUserPlus className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <div className="text-info text-xl font-bold">{customerStats.registered}</div>
                                <div className="text-xs text-white-dark">Registered</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <div className="panel">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-primary-light dark:bg-primary text-primary dark:text-primary-light rounded-lg flex items-center justify-center ltr:mr-3 rtl:ml-3">
                                <IconClock className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <div className="text-primary text-xl font-bold">{logs.length}</div>
                                <div className="text-xs text-white-dark">Total Logs</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="panel">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-info-light dark:bg-info text-info dark:text-info-light rounded-lg flex items-center justify-center ltr:mr-3 rtl:ml-3">
                                <IconRefresh className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <div className="text-info text-xl font-bold">30s</div>
                                <div className="text-xs text-white-dark">Auto Refresh</div>
                            </div>
                        </div>
                    </div>

                    <div className="panel">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-secondary-light dark:bg-secondary text-secondary dark:text-secondary-light rounded-lg flex items-center justify-center ltr:mr-3 rtl:ml-3">
                                <IconClock className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <div className="text-secondary text-xl font-bold">10</div>
                                <div className="text-xs text-white-dark">Days Retention</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Logs Panel */}
                <div className="panel">
                    <div className="flex items-center justify-between dark:text-white-light mb-5">
                        <h5 className="font-semibold text-lg">Recent System Logs</h5>
                        <div className="text-sm text-white-dark">{loading ? 'Refreshing...' : `Last updated: ${new Date().toLocaleTimeString()}`}</div>
                    </div>

                    {error && (
                        <div className="bg-danger-light text-danger p-4 rounded-md mb-5 flex items-center gap-2">
                            <IconAlertCircle className="w-5 h-5" />
                            <span>Error loading logs: {error}</span>
                        </div>
                    )}

                    <div className="h-[600px]">
                        <PerfectScrollbar className="h-full">
                            {loading && logs.length === 0 ? (
                                <div className="flex items-center justify-center h-32">
                                    <div className="animate-spin border-2 border-primary border-l-transparent rounded-full w-8 h-8"></div>
                                    <span className="ml-3 text-white-dark">Loading logs...</span>
                                </div>
                            ) : logs.length === 0 ? (
                                <div className="text-center py-8">
                                    <IconClock className="w-12 h-12 text-white-dark mx-auto mb-3" />
                                    <p className="text-white-dark">No logs found</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {logs.map((log: any, index: number) => {
                                        return (
                                            <div
                                                key={log._id || index}
                                                className="flex items-start gap-3 p-4 bg-white-light/50 dark:bg-white-dark/5 rounded-lg hover:bg-white-light dark:hover:bg-white-dark/10 transition-colors"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2 mb-1">
                                                        <span className="text-xs font-medium text-primary uppercase"></span>
                                                        <div className="flex items-center gap-3 text-xs text-white-dark">
                                                            <span>{getTimeAgo(log.createdAt)}</span>
                                                            <span>{formatDate(log.createdAt)}</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm dark:text-white-light break-words">{log.log}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </PerfectScrollbar>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Index;