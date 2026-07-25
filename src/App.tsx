import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginView } from './views/LoginView';
import { SuperAdminDashboard } from './views/SuperAdminDashboard';
import { InstituteDashboard } from './views/InstituteDashboard';
import { StudentsView } from './views/StudentsView';
import { StaffView } from './views/StaffView';
import { TimetableView } from './views/TimetableView';
import { AttendanceView } from './views/AttendanceView';
import { FeesView } from './views/FeesView';
import { ExamsView } from './views/ExamsView';
import { AssignmentsView } from './views/AssignmentsView';
import { PtmView } from './views/PtmView';
import { NoticesView } from './views/NoticesView';
import { WebsiteStudioView } from './views/WebsiteStudioView';
import { PublicWebsiteView } from './views/PublicWebsiteView';
import { ReportsView } from './views/ReportsView';

import { apiRequest, setAuthToken, setTenantContext } from './api/client';
import { User, Institution } from './types';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentInstitution, setCurrentInstitution] = useState<Institution | null>(null);
  const [allInstitutions, setAllInstitutions] = useState<Institution[]>([]);
  const [currentView, setCurrentView] = useState('dashboard');
  const [publicSiteSlug, setPublicSiteSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check stored auth session
  useEffect(() => {
    const token = localStorage.getItem('educore_token');
    const tenantId = localStorage.getItem('educore_tenant_id');

    if (token) {
      setAuthToken(token);
      if (tenantId) setTenantContext(tenantId);

      apiRequest('/auth/me')
        .then((res) => {
          if (res.success && res.data) {
            setUser(res.data.user);
            setCurrentInstitution(res.data.institution);
            if (res.data.user.role === 'SUPER_ADMIN' && !res.data.institution) {
              setCurrentView('super-admin');
            }
          } else {
            handleLogout();
          }
        })
        .catch(() => handleLogout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch all institutions for tenant switcher
  const fetchInstitutionsList = async () => {
    try {
      const res = await apiRequest('/institutions');
      if (res.success && res.data) {
        setAllInstitutions(res.data);
      }
    } catch (err) {
      console.error('Error fetching institutions:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchInstitutionsList();
    }
  }, [user]);

  const handleLoginSuccess = (loggedInUser: User, institution: Institution | null) => {
    setUser(loggedInUser);
    setCurrentInstitution(institution);
    if (loggedInUser.role === 'SUPER_ADMIN' && !institution) {
      setCurrentView('super-admin');
    } else {
      setCurrentView('dashboard');
    }
    fetchInstitutionsList();
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentInstitution(null);
    setAuthToken('');
    setTenantContext('');
    setCurrentView('dashboard');
  };

  const handleOpenPublicSite = (slug: string) => {
    setPublicSiteSlug(slug);
    setCurrentView('public-site');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-xs font-semibold">Initializing EduCore Enterprise ERP...</p>
        </div>
      </div>
    );
  }

  // Preview Public Website
  if (currentView === 'public-site' && publicSiteSlug) {
    return (
      <PublicWebsiteView
        slug={publicSiteSlug}
        onBackToApp={() => setCurrentView('dashboard')}
      />
    );
  }

  // Unauthenticated -> Show Login View
  if (!user) {
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        onOpenPublicSite={handleOpenPublicSite}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Top Navbar Header */}
      <Navbar
        user={user}
        currentInstitution={currentInstitution}
        allInstitutions={allInstitutions}
        onSelectInstitution={(inst) => {
          setCurrentInstitution(inst);
          if (!inst && user.role === 'SUPER_ADMIN') {
            setCurrentView('super-admin');
          } else {
            setCurrentView('dashboard');
          }
        }}
        onLogout={handleLogout}
        onNavigate={(v) => {
          if (v === 'public-site') {
            handleOpenPublicSite(currentInstitution?.code.toLowerCase() || 'tcs');
          } else {
            setCurrentView(v);
          }
        }}
      />

      {/* Main App Layout Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          currentView={currentView}
          user={user}
          currentInstitution={currentInstitution}
          onNavigate={setCurrentView}
        />

        {/* Main Content View Area */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          {currentView === 'super-admin' && (
            <SuperAdminDashboard onRefreshInstitutions={fetchInstitutionsList} />
          )}
          {currentView === 'dashboard' && (
            <InstituteDashboard
              user={user}
              institution={currentInstitution}
              onNavigate={setCurrentView}
            />
          )}
          {currentView === 'students' && (
            <StudentsView institution={currentInstitution} />
          )}
          {currentView === 'staff' && <StaffView />}
          {currentView === 'timetable' && <TimetableView />}
          {currentView === 'attendance' && <AttendanceView />}
          {currentView === 'fees' && <FeesView institution={currentInstitution} />}
          {currentView === 'exams' && <ExamsView />}
          {currentView === 'assignments' && <AssignmentsView />}
          {currentView === 'ptm' && <PtmView />}
          {currentView === 'notices' && <NoticesView />}
          {currentView === 'website-studio' && (
            <WebsiteStudioView
              institution={currentInstitution}
              onOpenPublicSite={handleOpenPublicSite}
            />
          )}
          {currentView === 'reports' && <ReportsView />}
        </main>
      </div>
    </div>
  );
}

export default App;
