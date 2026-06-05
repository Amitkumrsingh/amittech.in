export const BLOG_CATEGORIES = [
  'System Design',
  'Distributed Systems',
  'Kafka',
  'Python',
  'AWS',
  'Databases',
  'Backend Engineering',
  'Microservices',
  'AI Engineering',
  'Career Growth'
] as const

export type BlogCategory = typeof BLOG_CATEGORIES[number]

export type BlogPost = {
  slug: string
  title: string
  category: BlogCategory
  publishDate: string
  readingMinutes: number
  summary: string
  tags: string[]
  featured?: boolean
  cover: {
    kicker: string
    metric: string
    gradient: string
    accent: string
  }
  takeaways: string[]
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'scaled-hrms-platform-300k-employees',
    title: 'How We Scaled an HRMS Platform to 300K+ Employees',
    category: 'Distributed Systems',
    publishDate: '2026-05-18',
    readingMinutes: 9,
    featured: true,
    summary: 'A production-oriented look at service boundaries, CDC pipelines, observability, and migration strategy for a distributed HRMS platform.',
    tags: ['HRMS', 'Scale', 'CDC', 'Reliability'],
    cover: {
      kicker: '300K+ employees',
      metric: '60% faster onboarding',
      gradient: 'from-cyan-400/30 via-violet-500/20 to-pink-500/25',
      accent: 'bg-cyan-300'
    },
    takeaways: [
      'Model HR workflows as event streams instead of isolated CRUD screens.',
      'Use CDC to synchronize legacy systems while protecting migration velocity.',
      'Treat observability and replay tooling as core platform features.'
    ]
  },
  {
    slug: 'event-driven-architecture-production-kafka',
    title: 'Event-Driven Architecture in Production: Lessons from Kafka',
    category: 'Distributed Systems',
    publishDate: '2026-05-02',
    readingMinutes: 8,
    summary: 'Practical lessons from running Kafka-backed workflows where correctness, consumer lag, and replay safety matter.',
    tags: ['Kafka', 'Events', 'Observability'],
    cover: {
      kicker: 'Production events',
      metric: 'Replay-safe workflows',
      gradient: 'from-sky-400/25 via-teal-400/20 to-violet-500/25',
      accent: 'bg-teal-300'
    },
    takeaways: [
      'A good event contract is a product interface, not just a payload.',
      'Consumer lag needs ownership, alerting, and operational runbooks.',
      'Replay design should be explicit before incidents make it urgent.'
    ]
  },
  {
    slug: 'reliable-retry-dlq-mechanisms',
    title: 'Designing Reliable Retry and DLQ Mechanisms',
    category: 'Distributed Systems',
    publishDate: '2026-04-24',
    readingMinutes: 7,
    summary: 'How retry policies, dead-letter queues, backoff, and alerting work together in resilient event systems.',
    tags: ['DLQ', 'Retries', 'Fault Tolerance'],
    cover: {
      kicker: 'Fault tolerance',
      metric: 'Fewer silent failures',
      gradient: 'from-emerald-400/25 via-cyan-400/20 to-blue-500/25',
      accent: 'bg-emerald-300'
    },
    takeaways: [
      'Retries without idempotency can amplify damage.',
      'DLQs should be searchable, replayable, and owned by a team.',
      'Backoff strategy should match downstream recovery behavior.'
    ]
  },
  {
    slug: 'idempotency-distributed-systems-explained',
    title: 'Idempotency in Distributed Systems Explained',
    category: 'Distributed Systems',
    publishDate: '2026-04-12',
    readingMinutes: 6,
    summary: 'A backend engineer friendly explanation of idempotency keys, event dedupe, and exactly-once illusions.',
    tags: ['Idempotency', 'Dedupe', 'Consistency'],
    cover: {
      kicker: 'Correctness',
      metric: 'Duplicate-safe processing',
      gradient: 'from-violet-500/25 via-fuchsia-500/20 to-cyan-400/25',
      accent: 'bg-violet-300'
    },
    takeaways: [
      'Idempotency is a business rule encoded in infrastructure.',
      'Exactly-once systems usually hide at-least-once tradeoffs.',
      'A durable dedupe store is often simpler than clever consumer logic.'
    ]
  },
  {
    slug: 'kafka-consumer-groups-deep-dive',
    title: 'Kafka Consumer Groups Deep Dive',
    category: 'Kafka',
    publishDate: '2026-03-30',
    readingMinutes: 8,
    summary: 'Consumer groups, offsets, rebalances, and partition ownership explained from a production backend perspective.',
    tags: ['Kafka', 'Consumer Groups', 'Offsets'],
    cover: {
      kicker: 'Kafka internals',
      metric: 'Balanced processing',
      gradient: 'from-cyan-500/25 via-blue-500/20 to-indigo-500/25',
      accent: 'bg-blue-300'
    },
    takeaways: [
      'Partition count bounds parallelism for a consumer group.',
      'Rebalances should be expected and measured.',
      'Offset commits are part of the correctness model.'
    ]
  },
  {
    slug: 'preventing-duplicate-event-processing',
    title: 'Preventing Duplicate Event Processing',
    category: 'Kafka',
    publishDate: '2026-03-17',
    readingMinutes: 6,
    summary: 'Patterns for making Kafka consumers safe under retries, rebalances, crashes, and event replay.',
    tags: ['Kafka', 'Dedupe', 'Retries'],
    cover: {
      kicker: 'Duplicate control',
      metric: 'Replay confidence',
      gradient: 'from-teal-400/25 via-cyan-400/20 to-slate-400/15',
      accent: 'bg-cyan-200'
    },
    takeaways: [
      'Consumers should assume repeated delivery.',
      'Dedupe keys must be stable across producer retries.',
      'Side effects need transactional boundaries or compensating logic.'
    ]
  },
  {
    slug: 'kafka-partitioning-strategies-at-scale',
    title: 'Kafka Partitioning Strategies at Scale',
    category: 'Kafka',
    publishDate: '2026-03-04',
    readingMinutes: 7,
    summary: 'Choosing partition keys for ordering, throughput, tenant isolation, and long-term operational flexibility.',
    tags: ['Kafka', 'Partitioning', 'Scale'],
    cover: {
      kicker: 'Partition strategy',
      metric: 'Throughput with order',
      gradient: 'from-fuchsia-500/25 via-violet-500/20 to-cyan-400/25',
      accent: 'bg-fuchsia-300'
    },
    takeaways: [
      'Partition keys decide both performance and correctness.',
      'Hot keys are a data modeling problem before they are a Kafka problem.',
      'Future repartitioning cost should influence early topic design.'
    ]
  },
  {
    slug: 'real-production-kafka-failures',
    title: 'Real Production Kafka Failures and How We Solved Them',
    category: 'Kafka',
    publishDate: '2026-02-19',
    readingMinutes: 8,
    summary: 'A practical taxonomy of lag spikes, poison messages, schema drift, and downstream outages in event-driven systems.',
    tags: ['Kafka', 'Incidents', 'Observability'],
    cover: {
      kicker: 'Incident notes',
      metric: 'Faster recovery',
      gradient: 'from-rose-500/25 via-orange-400/20 to-cyan-400/25',
      accent: 'bg-rose-300'
    },
    takeaways: [
      'Most Kafka incidents are downstream system incidents in disguise.',
      'Poison messages need quarantine, not infinite retry loops.',
      'Dashboards should connect lag to business impact.'
    ]
  },
  {
    slug: 'building-resilient-apis-python',
    title: 'Building Resilient APIs in Python',
    category: 'Python',
    publishDate: '2026-02-05',
    readingMinutes: 7,
    summary: 'Timeouts, validation, retries, error contracts, and observability patterns for Python backend APIs.',
    tags: ['Python', 'APIs', 'Reliability'],
    cover: {
      kicker: 'Python APIs',
      metric: 'Resilient contracts',
      gradient: 'from-yellow-300/25 via-emerald-400/20 to-cyan-500/25',
      accent: 'bg-yellow-200'
    },
    takeaways: [
      'Every external call needs a timeout and failure model.',
      'Error contracts should be predictable for clients and operators.',
      'Metrics should describe both latency and domain failure modes.'
    ]
  },
  {
    slug: 'designing-high-throughput-backend-services',
    title: 'Designing High Throughput Backend Services',
    category: 'Backend Engineering',
    publishDate: '2026-01-28',
    readingMinutes: 8,
    summary: 'How to reason about bottlenecks across APIs, queues, databases, caches, and worker pools.',
    tags: ['Backend', 'Throughput', 'Performance'],
    cover: {
      kicker: 'Backend scale',
      metric: 'Higher throughput',
      gradient: 'from-cyan-400/25 via-violet-500/20 to-emerald-400/20',
      accent: 'bg-emerald-200'
    },
    takeaways: [
      'Throughput work starts with measuring the real constraint.',
      'Queues smooth spikes but do not remove downstream limits.',
      'Backpressure is a feature when user experience depends on stability.'
    ]
  },
  {
    slug: 'redis-caching-patterns-backend-engineers',
    title: 'Redis Caching Patterns Every Backend Engineer Should Know',
    category: 'Backend Engineering',
    publishDate: '2026-01-14',
    readingMinutes: 6,
    summary: 'Cache-aside, write-through, TTL design, invalidation, and stampede prevention for production services.',
    tags: ['Redis', 'Caching', 'Performance'],
    cover: {
      kicker: 'Cache design',
      metric: 'Lower latency',
      gradient: 'from-red-400/25 via-pink-500/20 to-cyan-400/20',
      accent: 'bg-red-300'
    },
    takeaways: [
      'Caching is correctness work, not only speed work.',
      'TTL choices should reflect data volatility and user tolerance.',
      'Stampede protection matters most when traffic spikes.'
    ]
  },
  {
    slug: 'api-rate-limiting-at-scale',
    title: 'API Rate Limiting at Scale',
    category: 'Backend Engineering',
    publishDate: '2025-12-21',
    readingMinutes: 6,
    summary: 'Token buckets, sliding windows, Redis counters, and tenant-aware rate limits for public APIs.',
    tags: ['APIs', 'Rate Limiting', 'Redis'],
    cover: {
      kicker: 'Traffic control',
      metric: 'Tenant safety',
      gradient: 'from-blue-400/25 via-cyan-400/20 to-violet-500/25',
      accent: 'bg-blue-200'
    },
    takeaways: [
      'Rate limits should protect systems and communicate clearly to clients.',
      'Tenant-aware limits prevent noisy-neighbor failures.',
      'Distributed counters need careful TTL and clock assumptions.'
    ]
  },
  {
    slug: 'mongodb-performance-optimization-techniques',
    title: 'MongoDB Performance Optimization Techniques',
    category: 'Databases',
    publishDate: '2025-12-08',
    readingMinutes: 7,
    summary: 'Index design, query plans, schema shape, and production profiling techniques that improved database performance.',
    tags: ['MongoDB', 'Indexes', 'Performance'],
    cover: {
      kicker: 'MongoDB tuning',
      metric: '35% improvement',
      gradient: 'from-green-400/25 via-emerald-500/20 to-cyan-400/20',
      accent: 'bg-green-300'
    },
    takeaways: [
      'Indexes should match actual query shapes, not imagined access patterns.',
      'Document shape can remove entire classes of joins and lookups.',
      'Slow query logs are a roadmap when sampled consistently.'
    ]
  },
  {
    slug: 'postgresql-indexing-strategies',
    title: 'PostgreSQL Indexing Strategies',
    category: 'Databases',
    publishDate: '2025-11-26',
    readingMinutes: 7,
    summary: 'A practical guide to B-tree, composite, partial, and covering indexes for transactional systems.',
    tags: ['PostgreSQL', 'Indexes', 'SQL'],
    cover: {
      kicker: 'Postgres indexes',
      metric: 'Faster reads',
      gradient: 'from-sky-500/25 via-indigo-500/20 to-violet-500/20',
      accent: 'bg-sky-300'
    },
    takeaways: [
      'Composite index order should mirror filtering and sorting behavior.',
      'Partial indexes are powerful when product states are unevenly distributed.',
      'Index cost includes writes, storage, and operational complexity.'
    ]
  },
  {
    slug: 'database-design-large-applications',
    title: 'Database Design for Large Applications',
    category: 'Databases',
    publishDate: '2025-11-11',
    readingMinutes: 8,
    summary: 'Schema design choices for transactional boundaries, auditability, reporting, and future service extraction.',
    tags: ['Schema Design', 'Data Modeling', 'Scale'],
    cover: {
      kicker: 'Data modeling',
      metric: 'Cleaner boundaries',
      gradient: 'from-purple-500/25 via-cyan-400/20 to-emerald-400/20',
      accent: 'bg-purple-300'
    },
    takeaways: [
      'Good schemas make domain constraints obvious.',
      'Audit needs should be designed before compliance requires them.',
      'Service extraction is easier when ownership is visible in the data model.'
    ]
  },
  {
    slug: 'docker-best-practices-backend-engineers',
    title: 'Docker Best Practices for Backend Engineers',
    category: 'AWS',
    publishDate: '2025-10-24',
    readingMinutes: 6,
    summary: 'Image size, build caching, environment configuration, and runtime security habits for backend services.',
    tags: ['Docker', 'DevOps', 'Backend'],
    cover: {
      kicker: 'Containers',
      metric: 'Repeatable delivery',
      gradient: 'from-cyan-400/25 via-blue-500/20 to-slate-400/20',
      accent: 'bg-cyan-300'
    },
    takeaways: [
      'Small images reduce deployment time and attack surface.',
      'Build-time and runtime configuration should stay separate.',
      'Health checks should represent actual service readiness.'
    ]
  },
  {
    slug: 'ci-cd-pipelines-that-scale',
    title: 'CI/CD Pipelines That Actually Scale',
    category: 'AWS',
    publishDate: '2025-10-09',
    readingMinutes: 7,
    summary: 'Pipeline patterns that reduce manual deployment effort without hiding risk or slowing teams down.',
    tags: ['CI/CD', 'Automation', 'Delivery'],
    cover: {
      kicker: 'Delivery systems',
      metric: '80% less effort',
      gradient: 'from-emerald-400/25 via-cyan-400/20 to-violet-500/20',
      accent: 'bg-emerald-300'
    },
    takeaways: [
      'A pipeline is a product interface for engineers.',
      'Fast feedback beats decorative automation.',
      'Deployment safety comes from checks, rollback, and clear ownership.'
    ]
  },
  {
    slug: 'aws-architecture-modern-startups',
    title: 'AWS Architecture for Modern Startups',
    category: 'AWS',
    publishDate: '2025-09-22',
    readingMinutes: 8,
    summary: 'A pragmatic AWS blueprint for teams that need speed, security, observability, and room to scale.',
    tags: ['AWS', 'Architecture', 'Startups'],
    cover: {
      kicker: 'Cloud architecture',
      metric: 'Startup-ready',
      gradient: 'from-orange-400/25 via-cyan-400/20 to-violet-500/20',
      accent: 'bg-orange-300'
    },
    takeaways: [
      'The best first architecture is understandable by a small team.',
      'Managed services buy focus when operational skill is limited.',
      'Observability and IAM discipline should not be postponed.'
    ]
  },
  {
    slug: 'monitoring-observability-production',
    title: 'Monitoring and Observability in Production',
    category: 'AWS',
    publishDate: '2025-09-06',
    readingMinutes: 7,
    summary: 'Metrics, logs, traces, alerts, and runbooks for backend systems that need operational clarity.',
    tags: ['Observability', 'Monitoring', 'Production'],
    cover: {
      kicker: 'Production clarity',
      metric: 'Better debugging',
      gradient: 'from-violet-500/25 via-cyan-400/20 to-green-400/20',
      accent: 'bg-violet-300'
    },
    takeaways: [
      'Metrics explain what changed; logs explain why it changed.',
      'Alert fatigue is a design failure.',
      'Runbooks should evolve from real incidents.'
    ]
  },
  {
    slug: 'system-design-interviews-approach',
    title: 'How I Approach System Design Interviews',
    category: 'System Design',
    publishDate: '2025-08-18',
    readingMinutes: 7,
    summary: 'A structured way to reason through requirements, scale, APIs, data models, bottlenecks, and tradeoffs.',
    tags: ['System Design', 'Interviews', 'Tradeoffs'],
    cover: {
      kicker: 'Interview method',
      metric: 'Clear tradeoffs',
      gradient: 'from-pink-500/25 via-violet-500/20 to-cyan-400/20',
      accent: 'bg-pink-300'
    },
    takeaways: [
      'Requirements and constraints decide the architecture.',
      'A clear bottleneck discussion is stronger than memorized diagrams.',
      'Tradeoffs should connect directly to product behavior.'
    ]
  },
  {
    slug: 'scaling-url-shortener-10-million-users',
    title: 'Scaling a URL Shortener from 0 to 10 Million Users',
    category: 'System Design',
    publishDate: '2025-08-02',
    readingMinutes: 8,
    summary: 'A system design walkthrough covering ID generation, caching, analytics, redirects, and abuse controls.',
    tags: ['System Design', 'Caching', 'Scale'],
    cover: {
      kicker: '10M users',
      metric: 'Low-latency redirects',
      gradient: 'from-cyan-400/25 via-blue-500/20 to-fuchsia-500/20',
      accent: 'bg-cyan-300'
    },
    takeaways: [
      'Read path latency is the core product requirement.',
      'Analytics should not slow redirects.',
      'Abuse prevention belongs in the design from day one.'
    ]
  },
  {
    slug: 'designing-notification-systems',
    title: 'Designing Notification Systems',
    category: 'System Design',
    publishDate: '2025-07-15',
    readingMinutes: 8,
    summary: 'Fanout models, user preferences, delivery guarantees, provider fallback, and event-driven notification pipelines.',
    tags: ['System Design', 'Kafka', 'Notifications'],
    cover: {
      kicker: 'Notification fanout',
      metric: 'Reliable delivery',
      gradient: 'from-emerald-400/25 via-cyan-400/20 to-pink-500/20',
      accent: 'bg-emerald-300'
    },
    takeaways: [
      'Preference resolution should happen before channel fanout.',
      'Delivery state needs to be queryable by support and users.',
      'Provider fallback is only useful if duplicate delivery is controlled.'
    ]
  },
  {
    slug: 'microservices-boundaries-without-chaos',
    title: 'Microservices Boundaries Without Chaos',
    category: 'Microservices',
    publishDate: '2025-06-28',
    readingMinutes: 7,
    summary: 'How to split services around ownership, data, contracts, and deployability instead of trend-driven diagrams.',
    tags: ['Microservices', 'Boundaries', 'Architecture'],
    cover: {
      kicker: 'Service boundaries',
      metric: 'Lower coupling',
      gradient: 'from-violet-500/25 via-slate-400/15 to-cyan-400/25',
      accent: 'bg-violet-300'
    },
    takeaways: [
      'A service boundary should reduce coordination cost.',
      'Shared databases are often a sign the boundary is not real yet.',
      'Contracts need versioning before independent deploys are safe.'
    ]
  },
  {
    slug: 'building-production-rag-systems',
    title: 'Building Production RAG Systems',
    category: 'AI Engineering',
    publishDate: '2025-06-12',
    readingMinutes: 8,
    summary: 'Retrieval quality, chunking, evaluation, latency, and guardrails for AI systems that have to work in production.',
    tags: ['RAG', 'AI', 'Production'],
    cover: {
      kicker: 'AI systems',
      metric: 'Reliable retrieval',
      gradient: 'from-fuchsia-500/25 via-cyan-400/20 to-emerald-400/20',
      accent: 'bg-fuchsia-300'
    },
    takeaways: [
      'RAG quality is mostly retrieval quality and evaluation discipline.',
      'Chunking strategy should follow the shape of the source material.',
      'Latency budgets need to include retrieval, generation, and safety checks.'
    ]
  },
  {
    slug: 'mcp-servers-explained',
    title: 'MCP Servers Explained',
    category: 'AI Engineering',
    publishDate: '2025-05-29',
    readingMinutes: 6,
    summary: 'A backend engineer perspective on MCP servers, tool contracts, context boundaries, and enterprise integrations.',
    tags: ['MCP', 'AI Agents', 'Integrations'],
    cover: {
      kicker: 'Agent tooling',
      metric: 'Safer integrations',
      gradient: 'from-cyan-400/25 via-violet-500/20 to-rose-500/20',
      accent: 'bg-cyan-300'
    },
    takeaways: [
      'Tool contracts should be explicit and least-privilege.',
      'Context boundaries matter as much as API boundaries.',
      'Enterprise MCP servers need auditability from the start.'
    ]
  },
  {
    slug: 'agentic-ai-architecture-patterns',
    title: 'Agentic AI Architecture Patterns',
    category: 'AI Engineering',
    publishDate: '2025-05-12',
    readingMinutes: 7,
    summary: 'Planning loops, tool calls, memory, evaluation, and human control points for agentic applications.',
    tags: ['Agents', 'Architecture', 'Evaluation'],
    cover: {
      kicker: 'Agentic design',
      metric: 'Controlled autonomy',
      gradient: 'from-purple-500/25 via-pink-500/20 to-cyan-400/20',
      accent: 'bg-purple-300'
    },
    takeaways: [
      'Agents need bounded autonomy and observable decisions.',
      'Evaluation should measure task success, not just model output quality.',
      'Human checkpoints are architecture, not a UI afterthought.'
    ]
  },
  {
    slug: 'aws-bedrock-enterprise-applications',
    title: 'Integrating AWS Bedrock in Enterprise Applications',
    category: 'AI Engineering',
    publishDate: '2025-04-23',
    readingMinutes: 7,
    summary: 'How to think about model access, security, retrieval, observability, and cost controls with AWS Bedrock.',
    tags: ['AWS Bedrock', 'Enterprise AI', 'Security'],
    cover: {
      kicker: 'Enterprise AI',
      metric: 'Governed model access',
      gradient: 'from-orange-400/25 via-violet-500/20 to-cyan-400/20',
      accent: 'bg-orange-300'
    },
    takeaways: [
      'Model integration belongs behind stable internal service contracts.',
      'Security reviews should include prompts, context, and retrieved data.',
      'Cost observability must be product and tenant aware.'
    ]
  },
  {
    slug: 'journey-sde1-to-sde2',
    title: 'My Journey from SDE-1 to SDE-2',
    category: 'Career Growth',
    publishDate: '2025-04-05',
    readingMinutes: 5,
    summary: 'The engineering habits that move a developer from task execution to system ownership and technical judgment.',
    tags: ['Career', 'Ownership', 'Growth'],
    cover: {
      kicker: 'Career growth',
      metric: 'Ownership mindset',
      gradient: 'from-emerald-400/25 via-cyan-400/20 to-violet-500/20',
      accent: 'bg-emerald-300'
    },
    takeaways: [
      'Owning outcomes matters more than owning tickets.',
      'Strong engineers explain tradeoffs before code is written.',
      'Production experience compounds when you write down lessons.'
    ]
  },
  {
    slug: 'lessons-building-production-systems',
    title: 'Lessons Learned from Building Production Systems',
    category: 'Career Growth',
    publishDate: '2025-03-18',
    readingMinutes: 6,
    summary: 'Reliability, communication, debugging, and decision-making lessons from backend systems that had real users.',
    tags: ['Production', 'Reliability', 'Engineering'],
    cover: {
      kicker: 'Production lessons',
      metric: 'Sharper judgment',
      gradient: 'from-blue-400/25 via-cyan-400/20 to-pink-500/20',
      accent: 'bg-blue-300'
    },
    takeaways: [
      'Production teaches the cost of ambiguous ownership.',
      'Debugging speed comes from good instrumentation and calm thinking.',
      'Reliability is built into daily engineering habits.'
    ]
  },
  {
    slug: 'backend-engineering-roadmap-2026',
    title: 'Backend Engineering Roadmap 2026',
    category: 'Career Growth',
    publishDate: '2025-03-02',
    readingMinutes: 7,
    summary: 'A practical roadmap for backend engineers covering APIs, databases, queues, cloud, system design, and AI systems.',
    tags: ['Roadmap', 'Backend', '2026'],
    cover: {
      kicker: 'Backend roadmap',
      metric: '2026 focus',
      gradient: 'from-cyan-400/25 via-emerald-400/20 to-violet-500/20',
      accent: 'bg-cyan-300'
    },
    takeaways: [
      'Backend fundamentals still matter more because AI raises system complexity.',
      'Distributed systems knowledge separates service builders from API writers.',
      'Cloud, data, and observability are now core backend skills.'
    ]
  }
]
