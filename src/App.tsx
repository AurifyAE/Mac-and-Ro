import { PropsWithChildren, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from './store';
import { toggleRTL, toggleTheme, toggleLocale, toggleMenu, toggleLayout, toggleAnimation, toggleNavbar, toggleSemidark } from './store/themeConfigSlice';
import store from './store';
import { Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

function App({ children }: PropsWithChildren) {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const sidebar = useSelector((state: IRootState) => state.themeConfig.sidebar);
    const dispatch = useDispatch();
    const location = useLocation();

    useEffect(() => {
        dispatch(toggleTheme(localStorage.getItem('theme') || themeConfig.theme));
        dispatch(toggleMenu(localStorage.getItem('menu') || themeConfig.menu));
        dispatch(toggleLayout(localStorage.getItem('layout') || themeConfig.layout));
        dispatch(toggleRTL(localStorage.getItem('rtlClass') || themeConfig.rtlClass));
        dispatch(toggleAnimation(localStorage.getItem('animation') || themeConfig.animation));
        dispatch(toggleNavbar(localStorage.getItem('navbar') || themeConfig.navbar));
        dispatch(toggleLocale(localStorage.getItem('i18nextLng') || themeConfig.locale));
        dispatch(toggleSemidark(localStorage.getItem('semidark') || themeConfig.semidark));
        // eslint-disable-next-line
    }, []); // Only run once on mount

    // Check login
    const auth = useSelector((state: IRootState) => state.auth);
    const isAuthenticated = auth.isAuthenticated;

    // Prevent infinite redirect loop by not redirecting if already on login page
    if (!isAuthenticated && location.pathname !== '/auth/boxed-signin') {
        return <Navigate to="/auth/boxed-signin" state={{ from: location }} replace />;
    }

    // Prevent logged-in users from accessing login page
    if (isAuthenticated && location.pathname === '/auth/boxed-signin') {
        return <Navigate to="/" replace />;
    }

    return (
        <div
            className={`${(!isAuthenticated && sidebar && 'toggle-sidebar') || ''} ${themeConfig.menu} ${themeConfig.layout} ${
                themeConfig.rtlClass
            } main-section antialiased relative font-nunito text-sm font-normal`}
        >
            {children}
            <Toaster position="top-right" />
        </div>
    );
}

export default App;
