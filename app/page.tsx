'use client';

import { useState } from 'react';
import { MOCK_INCIDENTS } from '@/lib/data/incidents';
import { Incident } from '@/types/incident';
import { AlertCircle, TrendingDown, FileText, Flame } from 'lucide-react';
import { getSeverityColor, getSeverityTextColor, formatDuration } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { GeneratingModal } from '@/components/GeneratingModal';

export default function Dashboard() {
  const [incidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [showGeneratingModal, setShowGeneratingModal] = useState(false);
  const router = useRouter();

  const activeIncidents = incidents.filter(i => i.status !== 'resolved');
  const avgMTTR = 45; // Mock data
  const postmortemsThisWeek = 12; // Mock data

  const handleGeneratePostmortem = async (incident: Incident) => {
    setGeneratingFor(incident.id);
    setShowGeneratingModal(true);

    try {
      const response = await fetch('/api/generate-postmortem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidentId: incident.id })
      });

      if (!response.ok) {
        throw new Error('Failed to generate postmortem');
      }

      const data = await response.json();

      // Small delay to show completion of all stages
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect to postmortem viewer
      router.push(`/postmortems/${data.postmortem.id}`);
    } catch (error) {
      console.error('Error generating postmortem:', error);
      setShowGeneratingModal(false);
      alert('Failed to generate postmortem. Please try again.');
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
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              All Systems Operational
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <StatCard
            icon={<AlertCircle className="h-6 w-6" />}
            label="Active Incidents"
            value={activeIncidents.length.toString()}
            color="text-red-400"
          />
          <StatCard
            icon={<TrendingDown className="h-6 w-6" />}
            label="Avg MTTR"
            value={`${avgMTTR}m`}
            subtitle="↓ 20% vs last week"
            color="text-green-400"
          />
          <StatCard
            icon={<FileText className="h-6 w-6" />}
            label="Generated This Week"
            value={postmortemsThisWeek.toString()}
            color="text-violet-400"
          />
        </div>

        {/* Open Incidents */}
        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-white">🚨 Open Incidents</h2>
          <div className="space-y-4">
            {activeIncidents.map((incident) => (
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
