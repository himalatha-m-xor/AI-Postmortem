'use client';

import { useState, useEffect } from 'react';
import { MOCK_INCIDENTS } from '@/lib/data/incidents';
import { Incident } from '@/types/incident';
import { AlertCircle, TrendingDown, FileText, Flame, MessageSquare } from 'lucide-react';
import { getSeverityColor, getSeverityTextColor, formatDuration } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { GeneratingModal } from '@/components/GeneratingModal';

export default function Dashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [showMockData, setShowMockData] = useState(true);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [showGeneratingModal, setShowGeneratingModal] = useState(false);
  const [fetchingSlack, setFetchingSlack] = useState(false);
  const [stats, setStats] = useState({ activeIncidents: 0, avgMTTR: 45, postmortemsThisWeek: 12 });
  const router = useRouter();

  // Show mock data initially, but hide when Slack data is fetched
  const displayIncidents = showMockData && incidents.length === 0 ? MOCK_INCIDENTS : incidents;

  // Fetch real dashboard stats and incidents on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const statsResponse = await fetch('/api/dashboard/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch incidents
      const incidentsResponse = await fetch('/api/incidents');
      if (incidentsResponse.ok) {
        const incidentsData = await incidentsResponse.json();
        if (incidentsData.incidents.length > 0) {
          setIncidents(incidentsData.incidents);
          setShowMockData(false);
        }
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
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

      // Replace mock data with Slack data
      setShowMockData(false);
      setIncidents([data.incident]);

      // Refresh dashboard stats
      await fetchDashboardData();

      alert(`✅ Fetched incident from Slack: ${data.incident.title}\n${data.messagesCount} messages imported!`);
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
            <button
              onClick={handleFetchFromSlack}
              disabled={fetchingSlack}
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700 disabled:opacity-50"
            >
              <MessageSquare className="h-4 w-4" />
              {fetchingSlack ? 'Fetching...' : 'Fetch from Slack'}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <StatCard
            icon={<AlertCircle className="h-6 w-6" />}
            label="Active Incidents"
            value={stats.activeIncidents.toString()}
            color="text-red-400"
          />
          <StatCard
            icon={<TrendingDown className="h-6 w-6" />}
            label="Avg MTTR"
            value={`${stats.avgMTTR}m`}
            color="text-green-400"
          />
          <StatCard
            icon={<FileText className="h-6 w-6" />}
            label="Generated This Week"
            value={stats.postmortemsThisWeek.toString()}
            color="text-violet-400"
          />
        </div>

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
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-center gap-2">
                <span className="text-slate-500">•</span>
                <span className="text-sm">Apr 20: Auth Service SSL Certificate Expired</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-slate-500">•</span>
                <span className="text-sm">Apr 18: Redis Memory Leak in Cache Layer</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-slate-500">•</span>
                <span className="text-sm">Apr 15: Load Balancer Configuration Error</span>
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, subtitle, color }: any) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
      <div className="mb-2 flex items-center justify-between">
        <span className={`${color}`}>{icon}</span>
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
      {subtitle && <div className="mt-1 text-xs text-green-400">{subtitle}</div>}
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
