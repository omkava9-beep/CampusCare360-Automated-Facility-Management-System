import { Outlet, useLocation, useSearchParams } from 'react-router-dom';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import './Layout.css'

const Layout = () => {
    const [searchParams] = useSearchParams();
    const locationId = searchParams.get('qr');

    return (
        <div className="student-layout">
            <Navbar locationId={locationId} />
            <main className="student-body">
                <Outlet />
            </main>
            <BottomNav />
        </div>
    );
};

export default Layout;
