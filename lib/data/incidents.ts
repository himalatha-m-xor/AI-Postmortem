import { Incident } from '@/types/incident';

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'inc-001',
    title: 'Database Connection Pool Exhausted',
    description: 'Production database connection pool reached maximum capacity, causing API timeouts and service degradation',
    severity: 'critical',
    status: 'open',
    startTime: '2024-04-22T14:23:00Z',
    affectedServices: ['Payment API', 'User Dashboard', 'Checkout Service'],
    usersImpacted: 2500,
    slackChannel: '#incident-response',
    assignedTo: 'Sarah Chen',
    slackMessages: [
      {
        timestamp: '2024-04-22T14:23:15Z',
        user: 'PagerDuty Bot',
        message: '🚨 CRITICAL ALERT: Payment API latency exceeded 5s threshold. Current: 12.4s'
      },
      {
        timestamp: '2024-04-22T14:25:33Z',
        user: 'Sarah Chen',
        message: 'Joining. Looking at DataDog now. Seeing elevated error rates on payment service.'
      },
      {
        timestamp: '2024-04-22T14:27:45Z',
        user: 'Mike Rodriguez',
        message: 'I\'m looking at the database metrics. Connection pool is at 100/100.'
      },
      {
        timestamp: '2024-04-22T14:31:12Z',
        user: 'Sarah Chen',
        message: 'Found it! Database connections are maxed out. All 100 connections in use. Seeing "connection timeout" errors in logs.'
      },
      {
        timestamp: '2024-04-22T14:33:28Z',
        user: 'Mike Rodriguez',
        message: 'Should we increase the pool size as a quick fix?'
      },
      {
        timestamp: '2024-04-22T14:34:55Z',
        user: 'Sarah Chen',
        message: 'Hold on, that won\'t help if we have a connection leak. Let me check recent deployments first.'
      },
      {
        timestamp: '2024-04-22T14:38:17Z',
        user: 'Emily Watson',
        message: 'We deployed payment-service v2.3.1 about 3 hours ago. Commit a3f5d21.'
      },
      {
        timestamp: '2024-04-22T14:41:22Z',
        user: 'Sarah Chen',
        message: 'Looking at that commit now...'
      },
      {
        timestamp: '2024-04-22T14:47:35Z',
        user: 'Sarah Chen',
        message: 'FOUND IT! The payment processing code has a try-catch that doesn\'t release the connection on error. We\'re leaking connections on every failed payment.'
      },
      {
        timestamp: '2024-04-22T14:49:12Z',
        user: 'Emily Watson',
        message: 'Oh no. I wrote that code. I forgot to add conn.release() in the catch block. 😓'
      },
      {
        timestamp: '2024-04-22T14:50:01Z',
        user: 'Sarah Chen',
        message: 'No blame, we all miss stuff. Let\'s fix it. Creating hotfix branch now.'
      },
      {
        timestamp: '2024-04-22T15:12:45Z',
        user: 'Sarah Chen',
        message: 'Hotfix deployed to staging. Testing now...'
      },
      {
        timestamp: '2024-04-22T15:28:33Z',
        user: 'Sarah Chen',
        message: 'Staging looks good. Connection pool is stable. Deploying to prod.'
      },
      {
        timestamp: '2024-04-22T16:35:22Z',
        user: 'Sarah Chen',
        message: 'Production deployment complete. Connection count dropping back to normal levels.'
      },
      {
        timestamp: '2024-04-22T16:47:11Z',
        user: 'Sarah Chen',
        message: '✅ RESOLVED. All systems green. API latency back to normal. Marking incident as resolved.'
      }
    ],
    logs: [
      {
        timestamp: '2024-04-22T14:23:10Z',
        level: 'error',
        message: 'Connection timeout: pool exhausted',
        service: 'payment-api',
        stackTrace: 'Error: Connection timeout\n    at Pool.connect (pool.js:156)\n    at PaymentService.processPayment (payment.js:45)'
      },
      {
        timestamp: '2024-04-22T14:23:12Z',
        level: 'error',
        message: 'SQLException: Unable to acquire connection from pool',
        service: 'payment-api',
        stackTrace: 'SQLException: Too many connections\n    at DatabasePool.getConnection (pool.js:89)'
      },
      {
        timestamp: '2024-04-22T14:23:15Z',
        level: 'error',
        message: 'Payment processing failed: timeout waiting for database connection',
        service: 'payment-api'
      },
      {
        timestamp: '2024-04-22T14:24:33Z',
        level: 'error',
        message: 'HTTP 503 Service Unavailable - Database connection pool exhausted',
        service: 'payment-api'
      },
      {
        timestamp: '2024-04-22T14:25:12Z',
        level: 'warning',
        message: 'Connection pool health check failed: 100/100 connections in use',
        service: 'database-monitor'
      }
    ],
    metrics: [
      { timestamp: '2024-04-22T14:00:00Z', metric: 'db.connections', value: 45, unit: 'count' },
      { timestamp: '2024-04-22T14:10:00Z', metric: 'db.connections', value: 67, unit: 'count' },
      { timestamp: '2024-04-22T14:20:00Z', metric: 'db.connections', value: 98, unit: 'count' },
      { timestamp: '2024-04-22T14:23:00Z', metric: 'db.connections', value: 100, unit: 'count' },
      { timestamp: '2024-04-22T14:00:00Z', metric: 'api.latency', value: 245, unit: 'ms' },
      { timestamp: '2024-04-22T14:10:00Z', metric: 'api.latency', value: 412, unit: 'ms' },
      { timestamp: '2024-04-22T14:20:00Z', metric: 'api.latency', value: 2100, unit: 'ms' },
      { timestamp: '2024-04-22T14:23:00Z', metric: 'api.latency', value: 12400, unit: 'ms' }
    ],
    alerts: [
      {
        timestamp: '2024-04-22T14:23:00Z',
        type: 'trigger',
        message: 'Payment API latency > 5s threshold'
      },
      {
        timestamp: '2024-04-22T14:25:00Z',
        type: 'acknowledge',
        message: 'Incident acknowledged',
        user: 'Sarah Chen'
      }
    ]
  },
  {
    id: 'inc-002',
    title: 'API Performance Degradation - Memory Leak',
    description: 'Gradual memory increase in checkout service causing slow responses',
    severity: 'medium',
    status: 'investigating',
    startTime: '2024-04-22T15:45:00Z',
    affectedServices: ['Checkout Service'],
    usersImpacted: 850,
    slackChannel: '#incident-response',
    assignedTo: 'Mike Rodriguez',
    slackMessages: [
      {
        timestamp: '2024-04-22T15:45:12Z',
        user: 'DataDog Bot',
        message: '⚠️ WARNING: Checkout service memory usage at 85%'
      },
      {
        timestamp: '2024-04-22T15:47:33Z',
        user: 'Mike Rodriguez',
        message: 'On it. Heap dump shows unusual growth pattern.'
      }
    ],
    logs: [
      {
        timestamp: '2024-04-22T15:44:00Z',
        level: 'warning',
        message: 'Heap memory usage: 85%',
        service: 'checkout-service'
      }
    ],
    metrics: [
      { timestamp: '2024-04-22T15:00:00Z', metric: 'memory.heap', value: 512, unit: 'MB' },
      { timestamp: '2024-04-22T15:30:00Z', metric: 'memory.heap', value: 890, unit: 'MB' },
      { timestamp: '2024-04-22T15:45:00Z', metric: 'memory.heap', value: 1456, unit: 'MB' }
    ],
    alerts: [
      {
        timestamp: '2024-04-22T15:45:00Z',
        type: 'trigger',
        message: 'Memory usage exceeds 85%'
      }
    ]
  },
  {
    id: 'inc-003',
    title: 'SSL Certificate Expiration - Auth Service Down',
    description: 'Authentication service SSL certificate expired causing 503 errors for all login attempts',
    severity: 'critical',
    status: 'open',
    startTime: '2024-04-23T08:15:00Z',
    affectedServices: ['Auth Service', 'User Login', 'Admin Panel'],
    usersImpacted: 5200,
    slackChannel: '#incident-response',
    assignedTo: 'Alex Kim',
    slackMessages: [
      {
        timestamp: '2024-04-23T08:15:22Z',
        user: 'PagerDuty Bot',
        message: '🚨 CRITICAL: Auth service health check failing - 100% error rate'
      },
      {
        timestamp: '2024-04-23T08:16:45Z',
        user: 'Alex Kim',
        message: 'I see it. All login requests returning 503. Checking now.'
      },
      {
        timestamp: '2024-04-23T08:18:12Z',
        user: 'Alex Kim',
        message: 'SSL cert expired at midnight. How did we miss this?'
      },
      {
        timestamp: '2024-04-23T08:19:30Z',
        user: 'Jordan Lee',
        message: 'The cert renewal reminder went to old-team@company.com which doesn\'t exist anymore'
      },
      {
        timestamp: '2024-04-23T08:21:00Z',
        user: 'Alex Kim',
        message: 'Requesting new cert from LetsEncrypt now...'
      },
      {
        timestamp: '2024-04-23T08:35:45Z',
        user: 'Alex Kim',
        message: 'New cert issued and deployed to staging. Testing...'
      },
      {
        timestamp: '2024-04-23T08:42:18Z',
        user: 'Alex Kim',
        message: 'Staging working. Deploying to prod now.'
      },
      {
        timestamp: '2024-04-23T08:47:33Z',
        user: 'Alex Kim',
        message: '✅ RESOLVED. Auth service is back online. All logins working.'
      }
    ],
    logs: [
      {
        timestamp: '2024-04-23T08:15:10Z',
        level: 'error',
        message: 'SSL certificate validation failed: certificate has expired',
        service: 'auth-service',
        stackTrace: 'Error: certificate has expired\n    at TLSSocket.<anonymous> (tls.js:307)\n    at Server.listen (server.js:156)'
      },
      {
        timestamp: '2024-04-23T08:15:15Z',
        level: 'error',
        message: 'HTTPS server failed to start: Invalid SSL certificate',
        service: 'auth-service'
      },
      {
        timestamp: '2024-04-23T08:15:20Z',
        level: 'error',
        message: 'Health check failed: Connection refused',
        service: 'load-balancer'
      }
    ],
    metrics: [
      { timestamp: '2024-04-23T08:00:00Z', metric: 'auth.success_rate', value: 100, unit: '%' },
      { timestamp: '2024-04-23T08:15:00Z', metric: 'auth.success_rate', value: 0, unit: '%' },
      { timestamp: '2024-04-23T08:47:00Z', metric: 'auth.success_rate', value: 98, unit: '%' }
    ],
    alerts: [
      {
        timestamp: '2024-04-23T08:15:00Z',
        type: 'trigger',
        message: 'Auth service down - 100% failure rate'
      },
      {
        timestamp: '2024-04-23T08:16:30Z',
        type: 'acknowledge',
        message: 'Incident acknowledged',
        user: 'Alex Kim'
      }
    ]
  },
  {
    id: 'inc-004',
    title: 'DDoS Attack - Traffic Spike Overload',
    description: 'Massive traffic spike from suspected DDoS attack overwhelming application servers',
    severity: 'high',
    status: 'open',
    startTime: '2024-04-23T13:22:00Z',
    affectedServices: ['Web Application', 'CDN', 'Load Balancer'],
    usersImpacted: 3400,
    slackChannel: '#incident-response',
    assignedTo: 'Taylor Singh',
    slackMessages: [
      {
        timestamp: '2024-04-23T13:22:34Z',
        user: 'Cloudflare Bot',
        message: '⚠️ WARNING: Traffic spike detected - 500x normal levels from Eastern Europe IPs'
      },
      {
        timestamp: '2024-04-23T13:24:11Z',
        user: 'Taylor Singh',
        message: 'Seeing massive traffic spike. Pattern looks like DDoS - lots of requests to /search endpoint'
      },
      {
        timestamp: '2024-04-23T13:25:45Z',
        user: 'Morgan Chen',
        message: 'Application servers are maxing out CPU. Response times > 10s'
      },
      {
        timestamp: '2024-04-23T13:27:20Z',
        user: 'Taylor Singh',
        message: 'Enabling Cloudflare "Under Attack" mode to challenge suspicious traffic'
      },
      {
        timestamp: '2024-04-23T13:32:05Z',
        user: 'Taylor Singh',
        message: 'Traffic dropping. Blocking top 20 offending IP ranges'
      },
      {
        timestamp: '2024-04-23T13:38:40Z',
        user: 'Taylor Singh',
        message: 'Adding rate limiting to /search endpoint - 10 req/min per IP'
      },
      {
        timestamp: '2024-04-23T13:45:12Z',
        user: 'Morgan Chen',
        message: 'CPU normalizing. Response times back under 500ms'
      },
      {
        timestamp: '2024-04-23T13:52:28Z',
        user: 'Taylor Singh',
        message: '✅ Mitigated. Monitoring for any further attacks.'
      }
    ],
    logs: [
      {
        timestamp: '2024-04-23T13:22:15Z',
        level: 'warning',
        message: 'High request rate detected: 15000 req/s (normal: 30 req/s)',
        service: 'load-balancer'
      },
      {
        timestamp: '2024-04-23T13:23:45Z',
        level: 'error',
        message: 'CPU throttling - 98% utilization',
        service: 'app-server-1'
      },
      {
        timestamp: '2024-04-23T13:24:00Z',
        level: 'error',
        message: 'Request timeout - queue full',
        service: 'app-server-2'
      }
    ],
    metrics: [
      { timestamp: '2024-04-23T13:00:00Z', metric: 'requests.per_second', value: 28, unit: 'req/s' },
      { timestamp: '2024-04-23T13:22:00Z', metric: 'requests.per_second', value: 15240, unit: 'req/s' },
      { timestamp: '2024-04-23T13:35:00Z', metric: 'requests.per_second', value: 856, unit: 'req/s' },
      { timestamp: '2024-04-23T13:50:00Z', metric: 'requests.per_second', value: 42, unit: 'req/s' }
    ],
    alerts: [
      {
        timestamp: '2024-04-23T13:22:00Z',
        type: 'trigger',
        message: 'Abnormal traffic spike detected'
      },
      {
        timestamp: '2024-04-23T13:24:00Z',
        type: 'acknowledge',
        message: 'Incident acknowledged',
        user: 'Taylor Singh'
      }
    ]
  },
  {
    id: 'inc-005',
    title: 'Deployment Rollback - Breaking Change in Production',
    description: 'New deployment introduced breaking API changes causing client application failures',
    severity: 'high',
    status: 'open',
    startTime: '2024-04-23T16:05:00Z',
    affectedServices: ['REST API v2', 'Mobile App', 'Web Dashboard'],
    usersImpacted: 1850,
    slackChannel: '#incident-response',
    assignedTo: 'Casey Martinez',
    slackMessages: [
      {
        timestamp: '2024-04-23T16:05:42Z',
        user: 'Sentry Bot',
        message: '⚠️ ERROR SPIKE: 400 Bad Request errors increased 2000% in last 5 minutes'
      },
      {
        timestamp: '2024-04-23T16:07:15Z',
        user: 'Casey Martinez',
        message: 'Mobile apps crashing. Error logs showing "userId field missing from API response"'
      },
      {
        timestamp: '2024-04-23T16:08:33Z',
        user: 'Jamie Parker',
        message: 'We deployed API v2.8.0 at 16:00. Must be related.'
      },
      {
        timestamp: '2024-04-23T16:09:45Z',
        user: 'Casey Martinez',
        message: 'Checking the diff... oh no. We renamed userId to user_id but mobile app expects camelCase'
      },
      {
        timestamp: '2024-04-23T16:11:20Z',
        user: 'Jamie Parker',
        message: 'This should\'ve been caught in integration tests. Initiating rollback now.'
      },
      {
        timestamp: '2024-04-23T16:15:50Z',
        user: 'Jamie Parker',
        message: 'Rollback deployed. Testing...'
      },
      {
        timestamp: '2024-04-23T16:18:35Z',
        user: 'Casey Martinez',
        message: 'Mobile app working again. Error rate dropping.'
      },
      {
        timestamp: '2024-04-23T16:22:10Z',
        user: 'Jamie Parker',
        message: '✅ RESOLVED. Error rate back to normal. Will fix v2.8.0 properly with backwards compatibility.'
      }
    ],
    logs: [
      {
        timestamp: '2024-04-23T16:05:30Z',
        level: 'error',
        message: 'TypeError: Cannot read property \'userId\' of undefined',
        service: 'mobile-app',
        stackTrace: 'TypeError: Cannot read property \'userId\' of undefined\n    at UserProfile.render (UserProfile.js:45)\n    at App.componentDidMount (App.js:120)'
      },
      {
        timestamp: '2024-04-23T16:06:15Z',
        level: 'error',
        message: 'API validation error: userId is required',
        service: 'web-dashboard'
      }
    ],
    metrics: [
      { timestamp: '2024-04-23T15:00:00Z', metric: 'api.error_rate', value: 0.2, unit: '%' },
      { timestamp: '2024-04-23T16:05:00Z', metric: 'api.error_rate', value: 42.5, unit: '%' },
      { timestamp: '2024-04-23T16:20:00Z', metric: 'api.error_rate', value: 0.3, unit: '%' }
    ],
    alerts: [
      {
        timestamp: '2024-04-23T16:05:00Z',
        type: 'trigger',
        message: 'API error rate exceeds 10% threshold'
      },
      {
        timestamp: '2024-04-23T16:07:00Z',
        type: 'acknowledge',
        message: 'Incident acknowledged',
        user: 'Casey Martinez'
      }
    ]
  }
];
