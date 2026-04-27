'use client';

import { useState, useEffect } from 'react';
import { MOCK_INCIDENTS } from '@/lib/data/incidents';
import { Incident } from '@/types/incident';
import { Flame, MessageSquare, User, LogOut } from 'lucide-react';
import { getSeverityColor, getSeverityTextColor, formatDuration } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { GeneratingModal } from '@/components/GeneratingModal';

export default function Dashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [showMockData, setShowMockData] = useState(true);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [showGeneratingModal, setShowGeneratingModal] = useState(false);
  const [fetchingSlack, setFetchingSlack] = useState(false);
  const [recentPostmortems, setRecentPostmortems] = useState<any[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();

  // Check authentication and load data on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();

        if (!data.user) {
          router.push('/login');
          return;
        }

        setIsAuthenticated(true);
        setCurrentUser(data.user);

        // Load dashboard data after auth check
        await loadDashboardData();
      } catch (error) {
        router.push('/login');
      }
    };

    const loadDashboardData = async () => {
      try {
        // Fetch incidents
        const incidentsResponse = await fetch('/api/incidents');
        if (incidentsResponse.ok) {
          const incidentsData = await incidentsResponse.json();
          if (incidentsData.source === 'database' && incidentsData.incidents.length > 0) {
            setIncidents(incidentsData.incidents);
            setShowMockData(false);
          }
        }

        // Fetch recent postmortems
        const postmortemsResponse = await fetch('/api/postmortems/recent');
        if (postmortemsResponse.ok) {
          const postmortemsData = await postmortemsResponse.json();
          setRecentPostmortems(postmortemsData.postmortems || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    checkAuth();
  }, [router]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showUserMenu && !target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  // Show loading while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Show mock data initially, but hide when Slack data is fetched
  const displayIncidents = showMockData && incidents.length === 0 ? MOCK_INCIDENTS : incidents;

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleFetchFromSlack = async () => {
    setFetchingSlack(true);
    try {
      const response = await fetch('/api/slack/fetch-incident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours: 24 }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch from Slack');
      }

      // Log incident IDs for debugging
      console.log('📋 Fetched incidents with IDs:', data.incidents.map((inc: any) => inc.id));

      // Refresh incidents
      const incidentsResponse = await fetch('/api/incidents');
      if (incidentsResponse.ok) {
        const incidentsData = await incidentsResponse.json();
        if (incidentsData.source === 'database' && incidentsData.incidents.length > 0) {
          console.log('📊 Dashboard now showing incidents:', incidentsData.incidents.map((inc: any) => inc.id));
          setIncidents(incidentsData.incidents);
          setShowMockData(false);
        }
      }

      // Show success message with all incident titles
      const titles = data.incidents.map((inc: any, i: number) => `${i + 1}. ${inc.title}`).join('\n');

      alert(
        `✅ Fetched ${data.incidentCount} incident(s) from Slack!\n\n` +
        `${titles}\n\n` +
        `${data.messagesCount} messages analyzed.\n` +
        `${data.savedCount} saved to database!`
      );
    } catch (error) {
      console.error('Error fetching from Slack:', error);
      alert(`❌ Failed to fetch from Slack: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setFetchingSlack(false);
    }
  };

  const handleGeneratePostmortem = async (incident: Incident) => {
    setGeneratingFor(incident.id);
    setShowGeneratingModal(true);

    try {
      const response = await fetch('/api/generate-postmortem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId: incident.id,
          incident: incident  // Pass full incident data for Slack incidents
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error messages from API
        const errorMessage = data.error?.message || 'Failed to generate postmortem';
        throw new Error(errorMessage);
      }

      // Small delay to show completion of all stages
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Refresh postmortems
      const postmortemsResponse = await fetch('/api/postmortems/recent');
      if (postmortemsResponse.ok) {
        const postmortemsData = await postmortemsResponse.json();
        setRecentPostmortems(postmortemsData.postmortems || []);
      }

      // Redirect to postmortem viewer
      router.push(`/postmortems/${data.postmortem.id}`);
    } catch (error) {
      console.error('Error generating postmortem:', error);
      setShowGeneratingModal(false);

      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      alert(`⚠️ ${errorMessage}\n\nPlease try again or contact support if the problem persists.`);
    } finally {
      setGeneratingFor(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Generating Modal */}
      {showGeneratingModal && <GeneratingModal />}

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">ARIA</h1>
                <p className="text-xs text-slate-400">Living Postmortem AI</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleFetchFromSlack}
                disabled={fetchingSlack}
                className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700 disabled:opacity-50"
              >
                <MessageSquare className="h-4 w-4" />
                {fetchingSlack ? 'Fetching...' : 'Fetch from Slack'}
              </button>

              {/* User Menu */}
              <div className="relative user-menu-container">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                >
                  {currentUser?.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="h-6 w-6 rounded-full" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                  <span className="text-sm font-medium">{currentUser?.name || 'User'}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg bg-slate-800 border border-slate-700 shadow-xl z-50">
                    <div className="p-3 border-b border-slate-700">
                      <div className="text-sm font-medium text-white">{currentUser?.name}</div>
                      <div className="text-xs text-slate-400">{currentUser?.email}</div>
                      <div className="mt-1 inline-block px-2 py-0.5 text-xs rounded bg-violet-600/20 text-violet-400">
                        {currentUser?.role}
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-b-lg"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Open Incidents */}
        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-white">🚨 Open Incidents</h2>
          <div className="space-y-4">
            {displayIncidents.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-500">
              <p className="mb-4">No incidents found.</p>
              <p className="text-sm">Click "Fetch from Slack" to import incidents from your Slack channel.</p>
            </div>
          )}
          {displayIncidents.map((incident) => (
              <IncidentCard
                key={incident.id}
                incident={incident}
                onGeneratePostmortem={handleGeneratePostmortem}
                isGenerating={generatingFor === incident.id}
              />
            ))}
          </div>
        </section>

        {/* Recent Postmortems */}
        <section>
          <h2 className="mb-4 text-2xl font-bold text-white">✅ Recent Postmortems</h2>
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
            {recentPostmortems.length > 0 ? (
              <ul className="space-y-2 text-slate-300">
                {recentPostmortems.map((pm) => (
                  <li key={pm.id} className="flex items-center gap-2">
                    <span className="text-slate-500">•</span>
                    <a
                      href={`/postmortems/${pm.id}`}
                      className="text-sm hover:text-violet-400 transition cursor-pointer"
                    >
                      {new Date(pm.generatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: {pm.incidentTitle}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No postmortems generated yet. Generate one from an incident above!</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function IncidentCard({ incident, onGeneratePostmortem, isGenerating }: any) {
  const duration = incident.endTime
    ? formatDuration(Math.floor((new Date(incident.endTime).getTime() - new Date(incident.startTime).getTime()) / 60000))
    : `${Math.floor((Date.now() - new Date(incident.startTime).getTime()) / 60000)}m ago`;

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className={`inline-block h-3 w-3 rounded-full ${getSeverityColor(incident.severity)}`}></span>
            <span className={`text-xs font-semibold uppercase ${getSeverityTextColor(incident.severity)}`}>
              {incident.severity}
            </span>
          </div>
          <h3 className="mb-2 text-xl font-bold text-white">{incident.title}</h3>
          <p className="mb-3 text-sm text-slate-400">{incident.description}</p>
          <div className="flex flex-wrap gap-4 text-xs text-slate-500">
            <span>Started: {duration}</span>
            <span>•</span>
            <span>{incident.usersImpacted.toLocaleString()} users affected</span>
            <span>•</span>
            <span>Assigned to: {incident.assignedTo}</span>
          </div>
        </div>
      </div>
      
      <button
        onClick={() => onGeneratePostmortem(incident)}
        disabled={isGenerating}
        className="w-full rounded-lg bg-violet-600 px-4 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
      >
        {isGenerating ? '⏳ Generating Postmortem...' : '🚀 Close Incident & Generate Postmortem'}
      </button>
    </div>
  );
}
