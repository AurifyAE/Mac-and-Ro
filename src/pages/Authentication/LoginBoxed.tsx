import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { useEffect, useState } from 'react';
import { setPageTitle, toggleRTL } from '../../store/themeConfigSlice';
import IconMail from '../../components/Icon/IconMail';
import IconLockDots from '../../components/Icon/IconLockDots';
import { login } from '../../store/authSlice';
import { loginBranchAdmin } from '../../api/api';

const LoginBoxed = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [role, setRole] = useState('admin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const [flag, setFlag] = useState(themeConfig.locale);

    const setLocale = (flag: string) => {
        setFlag(flag);
        if (flag.toLowerCase() === 'ae') {
            dispatch(toggleRTL('rtl'));
        } else {
            dispatch(toggleRTL('ltr'));
        }
    };

    useEffect(() => {
        dispatch(setPageTitle('Login Boxed'));
    }, [dispatch]);

    const submitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const superUser = import.meta.env.VITE_SUPERADMIN_USERNAME;
        const superPass = import.meta.env.VITE_SUPERADMIN_PASSWORD;

        if (role === 'superadmin') {
            if (email === superUser && password === superPass) {
                dispatch(login('superadmin'));
                localStorage.setItem('username', email);
                localStorage.setItem('role', 'superadmin');
                dispatch(login(role));
                navigate('/');
            } else {
                setError('Invalid superadmin credentials.');
            }
        } else if (role === 'admin') {
            try {
                const data = await loginBranchAdmin(email, password, role); // ✅ data is already parsed

                if (!data || !data.token) {
                    throw new Error(data?.message || 'Login failed');
                }
                // console.log(data)
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.admin.userId);
                localStorage.setItem('userId', data.admin.id);
                localStorage.setItem('role', 'admin');
                localStorage.setItem('branchId', data.admin.branch);

                dispatch(login(role));
                navigate('/');
            } catch (err: any) {
                setError(err.message || 'Something went wrong.');
            }
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
                                <h1 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">Sign in</h1>
                                <p className="text-base font-bold leading-normal text-white-dark">Enter your username and password to login</p>
                            </div>

                            {error && <div className="mb-4 rounded bg-red-100 px-4 py-2 text-red-700 border border-red-300 text-center">{error}</div>}

                            <form className="space-y-5 dark:text-white" onSubmit={submitForm}>
                                <div>
                                    <label htmlFor="role">Select User Role</label>
                                    <div className="relative text-white-dark">
                                        <select id="role" value={role} onChange={(e) => setRole(e.target.value)} className="form-input ps-10 placeholder:text-white-dark">
                                            <option value="admin">Admin</option>
                                            <option value="superadmin">Super Admin</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="Email">User Name</label>
                                    <div className="relative text-white-dark">
                                        <input
                                            id="Email"
                                            type="text"
                                            placeholder="Enter User Name"
                                            className="form-input ps-10 placeholder:text-white-dark"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            <IconMail fill={true} />
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="Password">Password</label>
                                    <div className="relative text-white-dark">
                                        <input
                                            id="Password"
                                            type="password"
                                            placeholder="Enter Password"
                                            className="form-input ps-10 placeholder:text-white-dark"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            <IconLockDots fill={true} />
                                        </span>
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]">
                                    Sign in
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginBoxed;
