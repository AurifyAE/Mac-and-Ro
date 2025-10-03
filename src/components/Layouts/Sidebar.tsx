import PerfectScrollbar from 'react-perfect-scrollbar';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { toggleSidebar } from '../../store/themeConfigSlice';
import AnimateHeight from 'react-animate-height';
import { IRootState } from '../../store';
import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, FileText, Folder, ChevronDown, LogOut, FileCheck2, GitBranch, SquareStack, LucideArrowRightLeft } from 'lucide-react';
import Swal from 'sweetalert2';

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
        { to: '/', label: t('Dashboard'), icon: <LayoutDashboard size={20} /> },
        { to: '/user-management', label: t('User Management'), icon: <Users size={20} /> },
        { to: '/kyc', label: t('KYC Management'), icon: <FileCheck2 size={20} /> },
        { to: '/req-form', label: t('Reqests'), icon: <Folder size={20} /> },
    ];

    // Sidebar menu items for super admin
    const superAdminMenu: MenuItem[] = [
        { to: '/', label: t('Dashboard'), icon: <LayoutDashboard size={20} /> },
        { to: '/superadmin/branches', label: t('Branches'), icon: <SquareStack size={20} /> },
        { to: '/superadmin/branch-charges', label: t('Branch Charges'), icon: <FileText size={20} /> },
        { to: '/user-management', label: t('User Management'), icon: <Users size={20} /> },
        { to: '/kyc', label: t('KYC Management'), icon: <FileCheck2 size={20} /> },
        { to: '/req-form', label: t('Reqests'), icon: <Folder size={20} /> },
        { to: '/branch-charges', label: t('Branch to Branch'), icon: <LucideArrowRightLeft size={20} /> },
    ];
    const menuToShow: MenuItem[] = adminType === 'superadmin' ? superAdminMenu : adminType === 'admin' ? adminMenu : [];

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Confirm Logout',
            text: 'Are you sure you want to logout?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, logout',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            localStorage.removeItem('role');
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('userType');
            localStorage.removeItem('username');
            
            // Show success toast
            Swal.fire({
                title: 'Logged Out',
                text: 'You have been successfully logged out.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
            
            setTimeout(() => {
                window.location.href = '/auth/boxed-signin';
            }, 1000);
        }
    };

    const toggleMenu = (value: string) => {
        setCurrentMenu((oldValue) => (oldValue === value ? '' : value));
    };

    // Debug: Log the current sidebar state
    console.log('Sidebar component render - themeConfig.sidebar:', themeConfig.sidebar);

    return (
        <div className={semidark ? 'dark' : ''}>
            <nav
                className={`sidebar fixed min-h-screen h-full top-0 bottom-0 w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] z-50 transition-all duration-300 ${semidark ? 'text-white-dark' : ''}`}
                style={{
                    left: themeConfig.sidebar ? '0px' : '-260px'
                }}
            >
                <div className="bg-white dark:bg-black h-full flex flex-col">
                    <div className="flex justify-between items-center px-4 py-3">
                        <NavLink to="/" className="main-logo flex items-center shrink-0">
                            <h2 style={{ fontSize: 'x-large' }}>Mac & Ro</h2>
                            {/* <img className="w-8 ml-[5px] flex-none" src="/assets/images/logo.svg" alt="logo" />
                            <span className="text-2xl ltr:ml-1.5 rtl:mr-1.5 font-semibold align-middle lg:inline dark:text-white-light">{t('VRISTO')}</span> */}
                        </NavLink>
                        <button
                            type="button"
                            className="collapse-icon w-8 h-8 rounded-full flex items-center hover:bg-gray-500/10 dark:hover:bg-dark-light/10 dark:text-white-light transition duration-300 rtl:rotate-180"
                            onClick={() => {
                                console.log('Sidebar toggle button clicked');
                                console.log('Current sidebar state:', themeConfig.sidebar);
                                dispatch(toggleSidebar());
                                console.log('After dispatch, sidebar state:', themeConfig.sidebar);
                            }}
                        >
                            <ChevronDown className="m-auto rotate-90" />
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
                                            <ChevronDown className={`ml-auto transition-transform ${currentMenu === item.label ? 'rotate-180' : ''}`} />
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
                            <LogOut className="mr-2" size={18} />
                            <span>{t('Logout')}</span>
                        </button>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;
