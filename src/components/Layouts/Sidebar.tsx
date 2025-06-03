import PerfectScrollbar from 'react-perfect-scrollbar';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { toggleSidebar } from '../../store/themeConfigSlice';
import AnimateHeight from 'react-animate-height';
import { IRootState } from '../../store';
import { useState, useEffect } from 'react';
import IconCaretsDown from '../Icon/IconCaretsDown';
import IconCaretDown from '../Icon/IconCaretDown';
import IconMenuDashboard from '../Icon/Menu/IconMenuDashboard';
import IconMenuInvoice from '../Icon/Menu/IconMenuInvoice';
import IconMenuCharts from '../Icon/Menu/IconMenuCharts';
import IconMenuUsers from '../Icon/Menu/IconMenuUsers';
import IconFolder from '../Icon/IconFolder';

type MenuItem = {
    to?: string;
    label: string;
    icon: React.ReactNode;
    subMenu?: MenuItem[];
};

const Sidebar = () => {
    const [currentMenu, setCurrentMenu] = useState<string>('');
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const semidark = useSelector((state: IRootState) => state.themeConfig.semidark);
    const location = useLocation();
    const dispatch = useDispatch();
    const { t } = useTranslation();

    useEffect(() => {
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        if (selector) {
            selector.classList.add('active');
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link') || [];
                if (ele.length) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele.click();
                    });
                }
            }
        }
    }, []);

    useEffect(() => {
        if (window.innerWidth < 1024 && themeConfig.sidebar) {
            dispatch(toggleSidebar());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location]);

    // Hide sidebar if not authenticated
    const adminType = localStorage.getItem('userType') || '';
    const isAuthenticated = !!localStorage.getItem('userType');
    if (!isAuthenticated) {
        return null;
    }

    // Sidebar menu items for admin
    const adminMenu: MenuItem[] = [
        { to: '/', label: t('Dashboard'), icon: <IconMenuDashboard /> },
        { to: '/user-management', label: t('User Management'), icon: <IconMenuUsers /> },
        { to: '/kyc', label: t('KYC Management'), icon: <IconMenuUsers /> },
        { to: '/req-form', label: t('Reqests'), icon: <IconFolder /> },
        // { to: '/reports', label: t('Reports'), icon: <IconMenuCharts /> },
    ];

    // Sidebar menu items for super admin
    const superAdminMenu: MenuItem[] = [
        // { to: '/superadmin/branch-admin', label: t('Branch Admin'), icon: <IconMenuUsers /> },
        { to: '/', label: t('Dashboard'), icon: <IconMenuDashboard /> },
        { to: '/superadmin/branches', label: t('Branches'), icon: <IconMenuDashboard /> },
        { to: '/superadmin/branch-charges', label: t('Branch Charges'), icon: <IconMenuInvoice /> },
          { to: '/user-management', label: t('User Management'), icon: <IconMenuUsers /> },
        { to: '/kyc', label: t('KYC Management'), icon: <IconMenuUsers /> },
        { to: '/req-form', label: t('Reqests'), icon: <IconFolder /> },
        { to: '/branch-charges', label: t('Swapped Forms'), icon: <IconFolder /> },
    ];
    const menuToShow: MenuItem[] = adminType === 'superadmin' ? superAdminMenu : adminType === 'admin' ? adminMenu : [];

    const handleLogout = () => {
        localStorage.removeItem('role');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userType');
        localStorage.removeItem('username');
        window.location.href = '/auth/boxed-signin';
    };

    const toggleMenu = (value: string) => {
        setCurrentMenu((oldValue) => (oldValue === value ? '' : value));
    };

    return (
        <div className={semidark ? 'dark' : ''}>
            <nav
                className={`sidebar fixed min-h-screen h-full top-0 bottom-0 w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] z-50 transition-all duration-300 ${semidark ? 'text-white-dark' : ''}`}
            >
                <div className="bg-white dark:bg-black h-full flex flex-col">
                    <div className="flex justify-between items-center px-4 py-3">
                        <NavLink to="/" className="main-logo flex items-center shrink-0">
                            {/* <img className="w-8 ml-[5px] flex-none" src="/assets/images/logo.svg" alt="logo" />
                            <span className="text-2xl ltr:ml-1.5 rtl:mr-1.5 font-semibold align-middle lg:inline dark:text-white-light">{t('VRISTO')}</span> */}
                        </NavLink>
                        <button
                            type="button"
                            className="collapse-icon w-8 h-8 rounded-full flex items-center hover:bg-gray-500/10 dark:hover:bg-dark-light/10 dark:text-white-light transition duration-300 rtl:rotate-180"
                            onClick={() => dispatch(toggleSidebar())}
                        >
                            <IconCaretsDown className="m-auto rotate-90" />
                        </button>
                    </div>
                    <PerfectScrollbar className="h-[calc(100vh-80px)] relative flex-1 mt-4">
                        <ul className="relative font-semibold space-y-0.5 p-4 py-0">
                            {menuToShow.map((item, idx) =>
                                item.subMenu ? (
                                    <li className="nav-item menu" key={idx}>
                                        <button type="button" className="group w-full flex items-center" onClick={() => toggleMenu(item.label)}>
                                            {item.icon}
                                            <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">{item.label}</span>
                                            <IconCaretDown className={`ml-auto transition-transform ${currentMenu === item.label ? 'rotate-180' : ''}`} />
                                        </button>
                                        <AnimateHeight duration={300} height={currentMenu === item.label ? 'auto' : 0}>
                                            <ul className="sub-menu pl-0">
                                                {item.subMenu.map((sub, subIdx) =>
                                                    sub.to ? (
                                                        <li key={subIdx}>
                                                            <NavLink to={sub.to} className="group flex items-center py-2">
                                                                {sub.icon}
                                                                <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">{sub.label}</span>
                                                            </NavLink>
                                                        </li>
                                                    ) : null
                                                )}
                                            </ul>
                                        </AnimateHeight>
                                    </li>
                                ) : (
                                    item.to && (
                                        <li className="nav-item" key={idx}>
                                            <NavLink to={item.to} className="group">
                                                <div className="flex items-center">
                                                    {item.icon}
                                                    <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">{item.label}</span>
                                                </div>
                                            </NavLink>
                                        </li>
                                    )
                                )
                            )}
                        </ul>
                    </PerfectScrollbar>
                    <div className="p-4 mt-auto">
                        <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-900 transition">
                            <span className="mr-2">⎋</span>
                            <span>{t('Logout')}</span>
                        </button>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;