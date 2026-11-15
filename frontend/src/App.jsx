import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { Loading } from './components/ui.jsx';
import { useAuth } from './context/AuthContext.jsx';

import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Profile from './pages/shared/Profile.jsx';
import Settings from './pages/shared/Settings.jsx';
import Announcements from './pages/shared/Announcements.jsx';
import ComplaintDetails from './pages/shared/ComplaintDetails.jsx';

import ResidentDashboard from './pages/resident/Dashboard.jsx';
import MyComplaints from './pages/resident/MyComplaints.jsx';
import NewComplaint from './pages/resident/NewComplaint.jsx';
import ResidentFeedback from './pages/resident/Feedback.jsx';

import AdminDashboard from './pages/admin/Dashboard.jsx';
import AllComplaints from './pages/admin/AllComplaints.jsx';
import GateEntry from './pages/admin/GateEntry.jsx';
import AdminFeedback from './pages/admin/Feedback.jsx';

import WorkerDashboard from './pages/worker/Dashboard.jsx';
import AssignedComplaints from './pages/worker/AssignedComplaints.jsx';

// "/" is the marketing page for visitors; signed-in users go straight to their dashboard.
function Home() {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  return user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Landing />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Any signed-in role */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="/resident" element={<ProtectedRoute role="resident" />}>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ResidentDashboard />} />
          <Route path="complaints" element={<MyComplaints />} />
          <Route path="complaints/new" element={<NewComplaint />} />
          <Route path="complaints/:id" element={<ComplaintDetails />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="feedback" element={<ResidentFeedback />} />
        </Route>
      </Route>

      <Route path="/admin" element={<ProtectedRoute role="admin" />}>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="complaints" element={<AllComplaints />} />
          <Route path="complaints/:id" element={<ComplaintDetails />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="gate-entry" element={<GateEntry />} />
          <Route path="feedback" element={<AdminFeedback />} />
        </Route>
      </Route>

      <Route path="/worker" element={<ProtectedRoute role="worker" />}>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<WorkerDashboard />} />
          <Route path="complaints" element={<AssignedComplaints />} />
          <Route path="complaints/:id" element={<ComplaintDetails />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
