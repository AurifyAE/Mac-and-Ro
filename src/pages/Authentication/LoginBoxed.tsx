import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { useEffect, useState } from 'react';
import { setPageTitle, toggleRTL } from '../../store/themeConfigSlice';
import IconMail from '../../components/Icon/IconMail';
import IconLockDots from '../../components/Icon/IconLockDots';
import IconUser from '../../components/Icon/IconUser';
import { login } from '../../store/authSlice';

const SuperAdminLogin = () => {
    const dispatch = useDispatch();

    // Form state
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isDark = useSelector((state: any) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const themeConfig = useSelector((state: any) => state.themeConfig);
    const [flag, setFlag] = useState(themeConfig.locale);

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const setLocale = (flag: string) => {
        setFlag(flag);
        if (flag.toLowerCase() === 'ae') {
            dispatch(toggleRTL('rtl'));
        } else {
            dispatch(toggleRTL('ltr'));
        }
    };

    useEffect(() => {
        dispatch(setPageTitle('Admin Login'));
    }, [dispatch]);

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    useEffect(() => {
        if (error) {
            setError('');
        }
    }, [formData]);

    // Admin Login
    const handleSuperAdminLogin = async () => {
        const { username, password } = formData;

        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'admin login failed');
        }

        // Store authentication data
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', username);
        localStorage.setItem('userType', 'superadmin');
        localStorage.setItem('role', 'superadmin');

        dispatch(login('admin'));
        return { success: true, message: 'admin login successful' };
    };

    const submitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { username, password } = formData;

        // Validation
        if (!username) {
            setError('Username is required');
            setLoading(false);
            return;
        }
        if (!password) {
            setError('Password is required');
            setLoading(false);
            return;
        }

        try {
            const result = await handleSuperAdminLogin();
            if (result.success) {
                window.location.href = '/';
                return;
            }
        } catch (err: any) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="absolute inset-0">
                <img src="/assets/images/auth/bg-gradient.png" alt="image" className="h-full w-full object-cover" />
            </div>

            <div className="relative flex min-h-screen items-center justify-center bg-[url(/assets/images/auth/map.png)] bg-cover bg-center bg-no-repeat px-6 py-10 dark:bg-[#060818] sm:px-16">
                <img src="/assets/images/auth/coming-soon-object1.png" alt="image" className="absolute left-0 top-1/2 h-full max-h-[893px] -translate-y-1/2" />
                <img src="/assets/images/auth/coming-soon-object2.png" alt="image" className="absolute left-24 top-0 h-40 md:left-[30%]" />
                <img src="/assets/images/auth/coming-soon-object3.png" alt="image" className="absolute right-0 top-0 h-[300px]" />
                <img src="/assets/images/auth/polygon-object.svg" alt="image" className="absolute bottom-0 end-[28%]" />

                <div className="relative w-full max-w-[870px] rounded-md bg-[linear-gradient(45deg,#fff9f9_0%,rgba(255,255,255,0)_25%,rgba(255,255,255,0)_75%,_#fff9f9_100%)] p-2 dark:bg-[linear-gradient(52.22deg,#0E1726_0%,rgba(14,23,38,0)_18.66%,rgba(14,23,38,0)_51.04%,rgba(14,23,38,0)_80.07%,#0E1726_100%)]">
                    <div className="relative flex flex-col justify-center rounded-md bg-white/60 backdrop-blur-lg dark:bg-black/50 px-6 lg:min-h-[600px] py-20">
                        <div className="mx-auto w-full max-w-[440px]">
                            <div className="mb-10">
                                <h1 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">Admin Login</h1>
                                <p className="text-base font-bold leading-normal text-white-dark">
                                    Enter your username and password to access Admin panel
                                </p>
                            </div>

                            {error && (
                                <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800">
                                    {error}
                                </div>
                            )}

                            <form className="space-y-5 dark:text-white" onSubmit={submitForm}>
                                {/* Username field */}
                                <div>
                                    <label htmlFor="username">Username</label>
                                    <div className="relative text-white-dark">
                                        <input
                                            id="username"
                                            name="username"
                                            type="text"
                                            placeholder="Enter Admin Username"
                                            className="form-input ps-10 placeholder:text-white-dark"
                                            value={formData.username}
                                            onChange={handleInputChange}
                                            required
                                        />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            <IconUser fill={true} />
                                        </span>
                                    </div>
                                </div>

                                {/* Password field */}
                                <div>
                                    <label htmlFor="password">Password</label>
                                    <div className="relative text-white-dark">
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            placeholder="Enter Password"
                                            className="form-input ps-10 placeholder:text-white-dark"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            required
                                        />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            <IconLockDots fill={true} />
                                        </span>
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                                            Signing in...
                                        </span>
                                    ) : (
                                        `Sign in as Admin`
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminLogin;