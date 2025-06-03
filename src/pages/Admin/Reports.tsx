import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { useEffect, useState } from 'react';
import { setPageTitle } from '../../store/themeConfigSlice';
import { getToken, getAllLogs } from '../../api/api';

// Define Log interface based on provided response
interface Log {
  _id: string;
  log: string;
  createdAt: string;
}

const Reports = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  useEffect(() => {
    dispatch(setPageTitle('Logs'));
  }, [dispatch]);

  // Protect the route: Redirect to login if no token
  useEffect(() => {
    const token = getToken();
    if (!token && location.pathname !== '/login') {
      navigate('/login', { replace: true });
    }
  }, [navigate, location]);

  // Fetch all logs
  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllLogs();
      setLogs(response.data as Log[]);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Calculate paginated logs
  const totalPages = Math.ceil(logs.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedLogs = logs.slice(startIndex, endIndex);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Handle page change
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1); // Reset to first page when rows per page changes
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <header className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-white text-center">Logs</h1>
          <p className="text-blue-100 text-center mt-2">View and manage your system logs</p>
        </header>

        <section className="bg-white rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="px-6 py-12 text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="px-6 py-12 text-center text-red-500">{error}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Serial No.</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Log</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedLogs.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                          No Logs Found
                        </td>
                      </tr>
                    ) : (
                      paginatedLogs.map((log, index) => (
                        <tr key={log._id}>
                          <td className="px-6 py-4">{startIndex + index + 1}</td>
                          <td className="px-6 py-4">{log.log}</td>
                          <td className="px-6 py-4">{formatDate(log.createdAt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 bg-gray-50">
                <div className="flex items-center space-x-2 mb-4 sm:mb-0">
                  <label htmlFor="rowsPerPage" className="text-sm text-gray-700">
                    Rows per page:
                  </label>
                  <select
                    id="rowsPerPage"
                    value={rowsPerPage}
                    onChange={handleRowsPerPageChange}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 text-sm rounded-md ${
                      currentPage === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 text-sm rounded-md ${
                      currentPage === totalPages
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
};

export default Reports;