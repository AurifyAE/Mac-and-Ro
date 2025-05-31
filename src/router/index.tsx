import { createBrowserRouter } from 'react-router-dom';
import BlankLayout from '../components/Layouts/BlankLayout';
import DefaultLayout from '../components/Layouts/DefaultLayout';
import { getRoleBasedRoutes } from './routes';

// Get the correct routes based on user role
const roleBasedRoutes = getRoleBasedRoutes();

const finalRoutes = roleBasedRoutes.map((route) => {
    return {
        ...route,
        element: route.layout === 'blank'
            ? <BlankLayout>{route.element}</BlankLayout>
            : <DefaultLayout>{route.element}</DefaultLayout>,
    };
});

const router = createBrowserRouter(finalRoutes);

export default router;