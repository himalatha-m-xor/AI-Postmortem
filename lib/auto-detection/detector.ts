// Automatic Incident Detection
import {
  IncidentDetectionResult,
  AutoResolveDetection,
  INCIDENT_KEYWORDS,
  RESOLUTION_KEYWORDS,
  SEVERITY_KEYWORDS,
} from '@/types/slack-events';
import { logger } from '@/lib/logger';

/**
 * Detect if a message indicates a new incident
 */
export function detectIncident(text: string): IncidentDetectionResult {
  const lowerText = text.toLowerCase();
  const foundKeywords: string[] = [];
  
  // Check for incident keywords
  for (const keyword of INCIDENT_KEYWORDS) {
    if (lowerText.includes(keyword.toLowerCase())) {
      foundKeywords.push(keyword);
    }
  }
  
  if (foundKeywords.length === 0) {
    return {
      isIncident: false,
      confidence: 0,
      keywords: [],
    };
  }
  
  // Detect severity
  let severity: 'critical' | 'high' | 'medium' | 'low' = 'medium';
  let maxSeverityScore = 0;
  
  for (const [severityLevel, keywords] of Object.entries(SEVERITY_KEYWORDS)) {
    const score = keywords.filter(k => lowerText.includes(k.toLowerCase())).length;
    if (score > maxSeverityScore) {
      maxSeverityScore = score;
      severity = severityLevel as any;
    }
  }
  
  // Calculate confidence (0-1)
  const confidence = Math.min(foundKeywords.length * 0.3, 1);
  
  // Extract potential title (first 100 chars, cleaned)
  const suggestedTitle = text
    .replace(/[🚨⚠️❌]/g, '')
    .trim()
    .substring(0, 100);
  
  logger.info('Incident detected', {
    isIncident: true,
    confidence,
    severity,
    keywords: foundKeywords,
  });
  
  return {
    isIncident: true,
    severity,
    confidence,
    keywords: foundKeywords,
    suggestedTitle,
  };
}

/**
 * Detect if a message indicates incident resolution
 */
export function detectResolution(text: string): AutoResolveDetection {
  const lowerText = text.toLowerCase();
  const foundKeywords: string[] = [];
  
  for (const keyword of RESOLUTION_KEYWORDS) {
    if (lowerText.includes(keyword.toLowerCase())) {
      foundKeywords.push(keyword);
    }
  }
  
  if (foundKeywords.length === 0) {
    return {
      isResolved: false,
      confidence: 0,
      keywords: [],
    };
  }
  
  // Calculate confidence
  const confidence = Math.min(foundKeywords.length * 0.4, 1);
  
  logger.info('Resolution detected', {
    isResolved: true,
    confidence,
    keywords: foundKeywords,
  });
  
  return {
    isResolved: true,
    confidence,
    keywords: foundKeywords,
  };
}

/**
 * Extract severity from text
 */
export function extractSeverity(text: string): 'critical' | 'high' | 'medium' | 'low' {
  const lowerText = text.toLowerCase();
  
  for (const [severityLevel, keywords] of Object.entries(SEVERITY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return severityLevel as any;
      }
    }
  }
  
  return 'medium'; // Default
}

/**
 * Clean and extract incident title from message
 */
export function extractIncidentTitle(text: string): string {
  // Remove emojis and special characters
  let title = text
    .replace(/[🚨⚠️❌✅]/g, '')
    .replace(/\n/g, ' ')
    .trim();
  
  // Take first sentence or 100 chars
  const firstSentence = title.split(/[.!?]/)[0];
  title = firstSentence.substring(0, 100);
  
  // Remove common prefixes
  const prefixes = ['alert:', 'incident:', 'p0:', 'p1:', 'p2:'];
  for (const prefix of prefixes) {
    if (title.toLowerCase().startsWith(prefix)) {
      title = title.substring(prefix.length).trim();
    }
  }
  
  return title || 'Untitled Incident';
}
