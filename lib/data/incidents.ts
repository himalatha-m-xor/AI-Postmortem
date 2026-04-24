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
  }
];
