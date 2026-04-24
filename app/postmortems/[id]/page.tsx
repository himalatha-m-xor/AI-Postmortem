'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Postmortem } from '@/types/postmortem';
import { ArrowLeft, Download, Copy, Share2, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatTimestamp, getSeverityColor } from '@/lib/utils';
import jsPDF from 'jspdf';

export default function PostmortemViewer() {
  const params = useParams();
  const router = useRouter();
  const [postmortem, setPostmortem] = useState<Postmortem | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchPostmortem() {
      try {
        const response = await fetch(`/api/generate-postmortem?id=${params.id}`);
        const data = await response.json();
        setPostmortem(data.postmortem);
      } catch (error) {
        console.error('Error fetching postmortem:', error);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchPostmortem();
    }
  }, [params.id]);

  const handleExportPDF = () => {
    if (!postmortem) return;
    
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Postmortem: ${postmortem.incidentTitle}`, 20, 20);
    doc.setFontSize(10);
    doc.text(postmortem.executiveSummary, 20, 40, { maxWidth: 170 });
    doc.save(`postmortem-${postmortem.id}.pdf`);
  };

  const handleCopyMarkdown = async () => {
    if (!postmortem) return;
    
    const markdown = generateMarkdown(postmortem);
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-violet-600 border-t-transparent mx-auto"></div>
          <p className="text-slate-400">Loading postmortem...</p>
        </div>
      </div>
    );
  }

  if (!postmortem) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <p className="text-red-400">Postmortem not found</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 text-violet-400 hover:text-violet-300"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700 transition"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </button>
              <button
                onClick={handleCopyMarkdown}
                className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-700 transition"
              >
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy Markdown'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <span className={`h-4 w-4 rounded-full ${getSeverityColor(postmortem.severity)}`}></span>
            <span className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              {postmortem.severity} Incident
            </span>
          </div>
          <h1 className="mb-4 text-4xl font-bold text-white">{postmortem.incidentTitle}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
            <span>{new Date(postmortem.startTime).toLocaleString()}</span>
            <span>•</span>
            <span>Duration: {postmortem.durationMinutes}m</span>
            <span>•</span>
            <span>{postmortem.usersImpacted.toLocaleString()} users impacted</span>
            {postmortem.estimatedRevenueLoss && (
              <>
                <span>•</span>
                <span>Est. Revenue Impact: {postmortem.estimatedRevenueLoss}</span>
              </>
            )}
          </div>
        </div>

        {/* Executive Summary */}
        <Section title="📋 Executive Summary">
          <p className="text-slate-300 leading-relaxed">{postmortem.executiveSummary}</p>
        </Section>

        {/* Timeline */}
        <Section title="🕐 Timeline of Events">
          <div className="space-y-4">
            {postmortem.timeline.map((event, index) => (
              <TimelineEvent key={index} event={event} />
            ))}
          </div>
        </Section>

        {/* Root Cause */}
        <Section title="🔍 Root Cause">
          <div className="space-y-4">
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
              <p className="text-red-300 font-semibold">{postmortem.rootCause.summary}</p>
            </div>
            <div>
              <h4 className="mb-2 font-semibold text-white">Technical Details:</h4>
              <p className="text-slate-300 leading-relaxed">{postmortem.rootCause.technicalDetails}</p>
            </div>
            {postmortem.rootCause.codeExample && (
              <div className="rounded-lg bg-slate-900 border border-slate-800 p-4">
                <pre className="text-sm text-slate-300 overflow-x-auto">
                  <code>{postmortem.rootCause.codeExample}</code>
                </pre>
              </div>
            )}
          </div>
        </Section>

        {/* Contributing Factors */}
        {postmortem.contributingFactors.length > 0 && (
          <Section title="📈 Contributing Factors">
            <ul className="space-y-2">
              {postmortem.contributingFactors.map((factor, index) => (
                <li key={index} className="flex gap-3 text-slate-300">
                  <span className="text-orange-400">•</span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* What Went Well / Poorly */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {postmortem.whatWentWell.length > 0 && (
            <Section title="✅ What Went Well">
              <ul className="space-y-2">
                {postmortem.whatWentWell.map((item, index) => (
                  <li key={index} className="flex gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}
          {postmortem.whatWentPoorly.length > 0 && (
            <Section title="❌ What Went Poorly">
              <ul className="space-y-2">
                {postmortem.whatWentPoorly.map((item, index) => (
                  <li key={index} className="flex gap-3 text-slate-300">
                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>

        {/* Prevention Measures */}
        <Section title="🛡️ Prevention Measures">
          <div className="space-y-3">
            {postmortem.preventionMeasures.map((measure, index) => (
              <div
                key={index}
                className="rounded-lg border border-slate-800 bg-slate-900/50 p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    measure.priority === 'P0' ? 'bg-red-500/20 text-red-300' :
                    measure.priority === 'P1' ? 'bg-orange-500/20 text-orange-300' :
                    'bg-blue-500/20 text-blue-300'
                  }`}>
                    {measure.priority}
                  </span>
                  <span className="text-xs text-slate-500">{measure.category}</span>
                </div>
                <p className="text-white font-medium mb-1">{measure.action}</p>
                <p className="text-sm text-slate-400">Owner: {measure.owner}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Action Items */}
        <Section title="📝 Action Items">
          <div className="space-y-2">
            {postmortem.actionItems.map((item, index) => (
              <div key={index} className="flex items-start gap-3 text-slate-300">
                <input type="checkbox" className="mt-1" />
                <div className="flex-1">
                  <span>{item.task}</span>
                  <div className="mt-1 flex gap-3 text-xs text-slate-500">
                    <span className={`font-semibold ${
                      item.priority === 'P0' ? 'text-red-400' :
                      item.priority === 'P1' ? 'text-orange-400' :
                      'text-blue-400'
                    }`}>
                      {item.priority}
                    </span>
                    <span>•</span>
                    <span>Owner: {item.owner}</span>
                    <span>•</span>
                    <span>Due: {item.dueDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-4 text-2xl font-bold text-white">{title}</h2>
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
        {children}
      </div>
    </section>
  );
}

function TimelineEvent({ event }: { event: any }) {
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      detection: 'bg-red-500',
      investigation: 'bg-yellow-500',
      action: 'bg-blue-500',
      resolution: 'bg-green-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`h-3 w-3 rounded-full ${getTypeColor(event.type)}`}></div>
        <div className="w-0.5 flex-1 bg-slate-800 mt-2"></div>
      </div>
      <div className="flex-1 pb-4">
        <div className="text-sm text-slate-500 mb-1">{event.timestamp}</div>
        <div className="text-white">{event.event}</div>
        {event.user && <div className="text-sm text-slate-400 mt-1">by {event.user}</div>}
      </div>
    </div>
  );
}

function generateMarkdown(postmortem: Postmortem): string {
  return `# Postmortem: ${postmortem.incidentTitle}

**Severity:** ${postmortem.severity}
**Duration:** ${postmortem.durationMinutes} minutes
**Users Impacted:** ${postmortem.usersImpacted}
**Date:** ${new Date(postmortem.startTime).toLocaleString()}

## Executive Summary

${postmortem.executiveSummary}

## Timeline

${postmortem.timeline.map(e => `- **${e.timestamp}** - ${e.event}${e.user ? ` (${e.user})` : ''}`).join('\n')}

## Root Cause

${postmortem.rootCause.summary}

${postmortem.rootCause.technicalDetails}

## Prevention Measures

${postmortem.preventionMeasures.map(m => `- [${m.priority}] ${m.action} (Owner: ${m.owner})`).join('\n')}

## Action Items

${postmortem.actionItems.map(a => `- [ ] ${a.task} - ${a.priority} - Owner: ${a.owner} - Due: ${a.dueDate}`).join('\n')}
`;
}
