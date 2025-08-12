import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Posts from './pages/Posts';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import JobDetail from './pages/JobDetail';
import { useRecoilValue } from 'recoil';
import { isAuthedSelector } from './store/auth';

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    const authed = useRecoilValue(isAuthedSelector);
    return authed ? children : <Navigate to="/login" replace />;
};

function App() {
    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
            <Navbar />
            <main className="flex-1 pb-16 pt-4">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                    <Route path="/posts" element={<PrivateRoute><Posts /></PrivateRoute>} />
                    <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                    <Route path="/jobs/:id" element={<PrivateRoute><JobDetail /></PrivateRoute>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
            <Footer />
        </div>
    );
}

export default App;
