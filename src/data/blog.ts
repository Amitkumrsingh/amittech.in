import type { BlogPost as BlogPostShape } from '../features/blog'

export { BLOG_CATEGORIES } from '../features/blog'
export type { BlogCategory, BlogPost, BlogSection } from '../features/blog'

export const BLOG_POSTS = [
  {
    slug: 'kafka-mistake-duplicate-events-production',
    title: 'The Kafka Mistake That Caused Duplicate Events in Production',
    category: 'Production Engineering',
    publishDate: '2026-05-22',
    readingMinutes: 9,
    featured: true,
    summary: 'A story about the gap between “Kafka guarantees delivery” and “our business workflow stayed correct after retries, crashes, and rebalances.”',
    hook: 'Everyone wants Kafka. Nobody wants the operational problems that come with it.',
    tags: ['Kafka', 'Idempotency', 'Reliability', 'Incidents'],
    cover: {
      kicker: 'Production incident',
      metric: 'Duplicate-safe events',
      gradient: 'from-cyan-400/30 via-violet-500/20 to-rose-500/25',
      accent: 'bg-cyan-300',
      motif: 'events'
    },
    takeaways: [
      'A consumer is not correct just because it commits offsets.',
      'Retries must be designed with business idempotency, not only infrastructure safety.',
      'The easiest duplicate to fix is the one your system can identify and explain.'
    ],
    sections: [
      {
        id: 'story',
        title: 'The Day the Event Pipeline Looked Healthy',
        body: [
          'The dashboard was green, the consumers were running, and Kafka was doing exactly what we had asked it to do. That was the uncomfortable part. The system did not fail loudly. It processed a few events more than once, and the business workflow noticed before the infrastructure did.',
          'This is where distributed systems stop being diagrams. A duplicate event is not a Kafka trivia question. It is a user seeing the same state change twice, an operations team losing trust in automation, and an engineer trying to prove what happened across logs, offsets, and database writes.'
        ]
      },
      {
        id: 'mistake',
        title: 'The Mistake Was Treating Offsets Like Business Truth',
        body: [
          'We had retries. We had consumer groups. We had offset commits. What we did not have was a clear business-level idempotency boundary. The consumer knew whether it had seen an offset. The product workflow did not know whether it had already applied the same decision.',
          'That difference matters. Infrastructure delivery semantics can reduce risk, but they cannot define what “already processed” means for your domain.'
        ]
      },
      {
        id: 'fix',
        title: 'The Fix Was Boring, Which Is Usually a Good Sign',
        body: [
          'We introduced stable event identifiers, persisted processing records before side effects escaped, and made replay behavior explicit. The system became less clever and much easier to operate.',
          'The win was not just fewer duplicates. The real win was explainability. When someone asked “did this event run twice?” the system could answer without a war room.'
        ]
      }
    ],
    productionNotes: [
      'Offset commits are part of consumer mechanics, not a complete correctness model.',
      'Every event that can trigger a side effect needs a durable identity.',
      'Replay tooling should be safe before an incident makes replay urgent.'
    ]
  },
  {
    slug: 'scaled-hrms-platform-300k-employees',
    title: 'Lessons from Scaling an HRMS Platform to 300K+ Employees',
    category: 'Production Engineering',
    publishDate: '2026-05-10',
    readingMinutes: 10,
    summary: 'What scaling taught me about CDC, migration strategy, operational visibility, and building workflows that non-engineering teams can trust.',
    hook: 'Scale was not one big rewrite. It was a long series of removing the next bottleneck.',
    tags: ['HRMS', 'CDC', 'Kafka', 'Scale'],
    cover: {
      kicker: '300K+ employees',
      metric: '60% faster onboarding',
      gradient: 'from-emerald-400/25 via-cyan-400/20 to-violet-500/25',
      accent: 'bg-emerald-300',
      motif: 'systems'
    },
    takeaways: [
      'Migration speed improves when legacy data movement is observable and reversible.',
      'A workflow platform must optimize for operations teams, not only API consumers.',
      'Scaling people-heavy systems is mostly about correctness, visibility, and recovery.'
    ],
    sections: [
      {
        id: 'story',
        title: 'The Hard Part Was Not the Employee Count',
        body: [
          'Numbers make scaling sound clean. 300K+ employees sounds like a traffic problem, but the harder problem was workflow trust. HRMS systems sit close to payroll, onboarding, compliance, and support. A small inconsistency can become a real operational mess.',
          'That changed how I looked at backend work. Fast APIs were useful, but the system also needed a reliable explanation for where each workflow was, why it moved, and what happened when a dependency slowed down.'
        ]
      },
      {
        id: 'migration',
        title: 'CDC Helped Us Move Without Freezing the Business',
        body: [
          'The practical reason CDC was valuable was not that it looked modern. It let us synchronize old and new paths while the business kept running. We could compare states, detect drift, and migrate workflows in slices instead of betting everything on a single cutover.',
          'The tradeoff was operational complexity. CDC pipelines need ownership. Lag, schema changes, poison records, and replay paths all become part of the product.'
        ]
      },
      {
        id: 'lesson',
        title: 'The System Became Better When It Became Easier to Explain',
        body: [
          'The strongest improvements came from making state transitions visible. Operators could understand what was pending, what failed, and what could be retried safely.',
          'That is the lesson I keep carrying: a backend system is not production-ready until someone can debug it calmly when the happy path is gone.'
        ]
      }
    ],
    productionNotes: [
      'CDC is a migration strategy and an operational product.',
      'Workflow state should be queryable by support, operations, and engineers.',
      'Replay without idempotency is a second incident waiting to happen.'
    ]
  },
  {
    slug: 'retry-logic-harder-than-it-looks',
    title: 'Why Retry Logic Is Harder Than It Looks',
    category: 'Production Engineering',
    publishDate: '2026-04-28',
    readingMinutes: 8,
    summary: 'Retries are usually added to make systems safer, but without backoff, ownership, and idempotency they can multiply the blast radius.',
    hook: 'Retrying a failed request feels harmless until the downstream service is already on fire.',
    tags: ['Retries', 'DLQ', 'Backoff', 'Reliability'],
    cover: {
      kicker: 'Failure handling',
      metric: 'Safer recovery',
      gradient: 'from-rose-500/25 via-orange-400/20 to-cyan-400/25',
      accent: 'bg-rose-300',
      motif: 'events'
    },
    takeaways: [
      'Retries need a failure budget, not only a loop.',
      'Dead-letter queues should be searchable, owned, and replayable.',
      'Backoff strategy should match how downstream systems actually recover.'
    ],
    sections: [
      {
        id: 'story',
        title: 'The Retry That Made the Incident Louder',
        body: [
          'The first version of the retry logic looked reasonable in code. Catch the exception, wait briefly, try again. It passed tests because the test dependency recovered instantly.',
          'Production was less polite. When a downstream system became slow, our retries increased pressure at exactly the wrong time. We had built optimism into the failure path.'
        ]
      },
      {
        id: 'tradeoff',
        title: 'A Retry Is a Product Decision',
        body: [
          'Some failures should be retried immediately. Some should be delayed. Some should stop and ask for human attention. The difference depends on money movement, user state, compliance, and whether repeating the action is safe.',
          'That is why generic retry helpers can be dangerous. They hide the part of the decision that needs domain context.'
        ]
      },
      {
        id: 'fix',
        title: 'The Better Shape Was Explicit Failure Behavior',
        body: [
          'We moved toward bounded retries, exponential backoff, DLQs with real metadata, and alerts tied to business impact. A failed workflow became inspectable instead of invisible.',
          'The code became less magical. The system became more honest.'
        ]
      }
    ],
    productionNotes: [
      'Retry count, delay, and terminal state should be visible in data.',
      'DLQs without ownership become storage for ignored incidents.',
      'A retry policy should be reviewed like any other correctness logic.'
    ]
  },
  {
    slug: 'event-driven-systems-simple-until-production',
    title: 'Event-Driven Systems Look Simple Until Production',
    category: 'Distributed Systems',
    publishDate: '2026-04-14',
    readingMinutes: 8,
    summary: 'The real work in event-driven architecture starts after events leave the whiteboard: contracts, lag, replay, ownership, and debugging.',
    hook: 'The diagram had three arrows. Production had delayed events, schema drift, and one confused on-call engineer.',
    tags: ['Events', 'Kafka', 'Contracts', 'Observability'],
    cover: {
      kicker: 'Event-driven work',
      metric: 'Replay-aware design',
      gradient: 'from-sky-400/25 via-teal-400/20 to-violet-500/25',
      accent: 'bg-teal-300',
      motif: 'events'
    },
    takeaways: [
      'An event contract is an API with memory.',
      'Consumer lag is only useful when tied to a business workflow.',
      'Debuggability should be designed before the first replay.'
    ],
    sections: [
      {
        id: 'story',
        title: 'The Diagram Was Technically Correct',
        body: [
          'Event-driven architecture is easy to sell because the drawing is clean. Producer emits. Kafka stores. Consumers react. Teams decouple. Everyone wins.',
          'Then a schema changes, one consumer lags, another has already applied side effects, and the question becomes: which version of reality is the system currently telling?'
        ]
      },
      {
        id: 'cost',
        title: 'Async Systems Move Complexity Out of Sight',
        body: [
          'Synchronous systems expose pain through latency. Asynchronous systems often hide pain as delay. The request returns quickly, but the business outcome may be stuck behind a consumer, a retry queue, or a poison event.',
          'That is not a reason to avoid events. It is a reason to build visibility as part of the feature.'
        ]
      },
      {
        id: 'lesson',
        title: 'The Best Event Systems Are Boring to Operate',
        body: [
          'Good topic names, stable schemas, owner metadata, replay tooling, and dashboards do not look impressive in architecture diagrams. They matter when a user asks why something did not happen.',
          'In production, the architecture is only as good as the team’s ability to explain it under pressure.'
        ]
      }
    ],
    productionNotes: [
      'Treat event schemas like public contracts.',
      'Measure lag by workflow risk, not only by partition offset.',
      'Design quarantine and replay paths before they are needed.'
    ]
  },
  {
    slug: 'hidden-cost-asynchronous-architecture',
    title: 'The Hidden Cost of Asynchronous Architectures',
    category: 'Distributed Systems',
    publishDate: '2026-03-31',
    readingMinutes: 7,
    summary: 'Async architectures buy responsiveness and decoupling, but they also create delayed failures, harder debugging, and new ownership questions.',
    hook: 'Async made the API faster. It also made failure arrive later and with less context.',
    tags: ['Async', 'Queues', 'Ownership', 'Tradeoffs'],
    cover: {
      kicker: 'Architecture tradeoff',
      metric: 'Delayed failure',
      gradient: 'from-violet-500/25 via-fuchsia-500/20 to-cyan-400/25',
      accent: 'bg-violet-300',
      motif: 'systems'
    },
    takeaways: [
      'Async is useful when delayed completion is acceptable and visible.',
      'Queue depth is not enough; teams need workflow-level status.',
      'Every asynchronous boundary needs a clear owner for failure resolution.'
    ],
    sections: [
      {
        id: 'story',
        title: 'The Request Became Fast and the Workflow Became Unclear',
        body: [
          'Moving work to a queue fixed the immediate latency problem. Users stopped waiting on slow downstream steps. The API looked healthier.',
          'But support questions changed from “why is it slow?” to “did it happen?” That is a much harder question if the system only tracks jobs and not outcomes.'
        ]
      },
      {
        id: 'ownership',
        title: 'Async Boundaries Need Human Ownership',
        body: [
          'A queue does not own a failure. A team does. When work crosses service boundaries, the system needs to preserve enough context for the owner to understand what failed and what can safely happen next.',
          'Without that, asynchronous architecture becomes a polite way to lose work slowly.'
        ]
      },
      {
        id: 'lesson',
        title: 'Decoupling Is Worth It Only If Recovery Is Designed',
        body: [
          'The best async systems I have worked on had clear status models, retry policies, dead-letter queues, and user-visible progress where it mattered.',
          'That is the tradeoff: you can move work out of the request path, but you cannot move accountability out of the system.'
        ]
      }
    ],
    productionNotes: [
      'Expose workflow status, not just job status.',
      'Capture request context before work leaves the synchronous path.',
      'Make terminal failure states explicit and actionable.'
    ]
  },
  {
    slug: 'most-systems-do-not-need-microservices-yet',
    title: "Most Systems Don't Need Microservices Yet",
    category: 'System Design',
    publishDate: '2026-03-18',
    readingMinutes: 8,
    summary: 'Microservices solve coordination and scaling problems, but they create distributed systems problems most teams are not ready to own on day one.',
    hook: 'A monolith with clear boundaries beats five services sharing one confused database.',
    tags: ['Microservices', 'Boundaries', 'Architecture', 'Tradeoffs'],
    cover: {
      kicker: 'Architecture judgment',
      metric: 'Boundaries first',
      gradient: 'from-purple-500/25 via-cyan-400/20 to-emerald-400/20',
      accent: 'bg-purple-300',
      motif: 'systems'
    },
    takeaways: [
      'Service boundaries should follow ownership and data, not org chart anxiety.',
      'A modular monolith can teach you where services should eventually split.',
      'Distributed architecture is a cost center until it solves a real constraint.'
    ],
    sections: [
      {
        id: 'story',
        title: 'The Architecture Looked Mature Before the Product Was',
        body: [
          'It is tempting to start with microservices because the end state sounds serious. Independent deploys, isolated scaling, clear ownership. Those are real benefits.',
          'But if the team cannot define the data boundary, cannot version contracts, and still needs coordinated deploys for every change, the system has taken on microservice costs without earning microservice benefits.'
        ]
      },
      {
        id: 'boundary',
        title: 'The Boundary Is the Product of Learning',
        body: [
          'Good boundaries usually emerge after the domain has taught you where change happens. Before that, premature service extraction can freeze bad assumptions behind network calls.',
          'I prefer making modules honest first: clear ownership, explicit interfaces, isolated data access, and tests around business behavior. Then extraction becomes an engineering move, not a branding exercise.'
        ]
      },
      {
        id: 'lesson',
        title: 'Scale the Architecture When the Constraint Is Real',
        body: [
          'Microservices make sense when teams, workloads, deployment frequency, or fault isolation demand them. They are not a default badge of seniority.',
          'The senior move is not choosing the fanciest architecture. It is choosing the architecture the team can operate well.'
        ]
      }
    ],
    productionNotes: [
      'Start with modular boundaries even inside a monolith.',
      'Do not split services while sharing the same write model casually.',
      'Operational maturity should increase before service count increases.'
    ]
  },
  {
    slug: 'stopped-memorizing-system-design-answers',
    title: 'I Stopped Memorizing System Design Answers',
    category: 'System Design',
    publishDate: '2026-03-05',
    readingMinutes: 7,
    summary: 'A practical shift from memorized diagrams to reasoning about constraints, bottlenecks, failure modes, and product tradeoffs.',
    hook: 'The moment system design improved for me was the moment I stopped trying to remember the “right” diagram.',
    tags: ['System Design', 'Interviews', 'Tradeoffs'],
    cover: {
      kicker: 'Design thinking',
      metric: 'Reason from constraints',
      gradient: 'from-pink-500/25 via-violet-500/20 to-cyan-400/20',
      accent: 'bg-pink-300',
      motif: 'systems'
    },
    takeaways: [
      'Requirements are more important than memorized components.',
      'Bottleneck analysis shows judgment better than architecture vocabulary.',
      'A good design answer explains tradeoffs in product language.'
    ],
    sections: [
      {
        id: 'story',
        title: 'Memorized Answers Break on the First Follow-Up',
        body: [
          'I used to think system design was a catalog of famous systems. URL shortener. Notification system. News feed. Chat app. Learn the parts, repeat the pattern.',
          'Real design discussions do not work that way. The interesting part starts when the interviewer changes a constraint or asks why one tradeoff matters more than another.'
        ]
      },
      {
        id: 'method',
        title: 'The Better Method Is Constraint First',
        body: [
          'Now I start with product behavior, traffic shape, data model, consistency needs, failure tolerance, and operational constraints. The architecture follows from those answers.',
          'This made my designs simpler and stronger. It also made them sound less like a memorized article and more like engineering judgment.'
        ]
      },
      {
        id: 'lesson',
        title: 'A Design Is a Series of Defensible Decisions',
        body: [
          'The goal is not to mention every technology. The goal is to show that each component exists because a constraint demanded it.',
          'That is true in interviews, and it is even more true in production.'
        ]
      }
    ],
    productionNotes: [
      'Start with product requirements before infrastructure choices.',
      'State the bottleneck you are solving at each step.',
      'Connect consistency and latency tradeoffs to user experience.'
    ]
  },
  {
    slug: 'scaling-is-not-about-kubernetes-first',
    title: "Scaling Isn't About Kubernetes First",
    category: 'System Design',
    publishDate: '2026-02-20',
    readingMinutes: 8,
    summary: 'A grounded view of scaling that starts with queries, caching, queues, workers, and observability before reaching for orchestration complexity.',
    hook: 'Kubernetes can run your service. It cannot fix the query that scans half your database.',
    tags: ['Scale', 'Kubernetes', 'Performance', 'Fundamentals'],
    cover: {
      kicker: 'Scaling fundamentals',
      metric: 'Bottlenecks first',
      gradient: 'from-cyan-400/25 via-blue-500/20 to-fuchsia-500/20',
      accent: 'bg-cyan-300',
      motif: 'cloud'
    },
    takeaways: [
      'Most scaling wins come from finding the current bottleneck.',
      'Better indexes and pagination often matter before new infrastructure.',
      'Orchestration helps after the service has sane operational behavior.'
    ],
    sections: [
      {
        id: 'story',
        title: 'The Fancy Tool Was Not the Bottleneck',
        body: [
          'When systems slow down, engineers often reach for the tool that sounds like scale. Kubernetes, microservices, event streams, read replicas. Sometimes those are right. Often they are a distraction.',
          'The painful bottleneck is usually more ordinary: a missing index, an endpoint returning too much data, a synchronous job hiding inside a request, or no metric telling us what changed.'
        ]
      },
      {
        id: 'fundamentals',
        title: 'Scale Usually Starts Small',
        body: [
          'A system serving 10K users needs different answers than one serving 10M. The path is gradual: fix query shapes, add observability, cache carefully, move slow work out of the request path, and only then split complexity where needed.',
          'The order matters because every new platform choice adds operational weight.'
        ]
      },
      {
        id: 'lesson',
        title: 'Good Scaling Feels Almost Disappointing',
        body: [
          'The best scaling work is often not glamorous. It is measuring, removing waste, and making the next failure mode visible.',
          'That kind of work does not always look exciting in a diagram, but it keeps systems alive.'
        ]
      }
    ],
    productionNotes: [
      'Profile the slow path before changing architecture.',
      'Do not add a queue until you know what user expectation changes.',
      'Scale decisions should reduce a measured constraint, not decorate the stack.'
    ]
  },
  {
    slug: 'missing-database-index-performance',
    title: 'The Missing Database Index That Brought Down Performance',
    category: 'Databases',
    publishDate: '2026-02-07',
    readingMinutes: 7,
    summary: 'A reminder that database performance problems often hide inside ordinary product queries until data volume makes them impossible to ignore.',
    hook: 'The endpoint did not become slow overnight. The data finally became large enough to tell the truth.',
    tags: ['Indexes', 'PostgreSQL', 'MongoDB', 'Performance'],
    cover: {
      kicker: 'Database lesson',
      metric: 'Query shape matters',
      gradient: 'from-green-400/25 via-emerald-500/20 to-cyan-400/20',
      accent: 'bg-green-300',
      motif: 'database'
    },
    takeaways: [
      'Indexes should match real filters, sorting, and cardinality.',
      'Slow query logs are product feedback from the database.',
      'Every new product state can change the query plan you thought was safe.'
    ],
    sections: [
      {
        id: 'story',
        title: 'The Query Looked Innocent in Development',
        body: [
          'On small data, almost every query looks fast enough. The database can hide bad access patterns because there is not much to scan.',
          'Then production data grows, product filters multiply, and one endpoint starts dragging the whole workflow down. The bug was not new. It had been waiting for scale.'
        ]
      },
      {
        id: 'investigation',
        title: 'The Fix Started with the Query Plan',
        body: [
          'The useful move was not guessing. It was reading the query plan, checking cardinality, understanding sort behavior, and matching the index to the way the product actually asked for data.',
          'That sounds basic, but fundamentals are usually where performance comes back.'
        ]
      },
      {
        id: 'lesson',
        title: 'Indexes Are Architecture',
        body: [
          'A database index is not just a performance tweak. It is a statement about the access pattern your product depends on.',
          'When that access pattern changes, the architecture has changed whether or not the diagram did.'
        ]
      }
    ],
    productionNotes: [
      'Capture slow query samples continuously, not only during incidents.',
      'Review indexes when adding filters, sorting, or new high-cardinality states.',
      'Measure write cost before adding indexes casually.'
    ]
  },
  {
    slug: 'pagination-matters-more-than-you-think',
    title: 'Why Pagination Matters More Than You Think',
    category: 'Databases',
    publishDate: '2026-01-24',
    readingMinutes: 6,
    summary: 'Pagination is not just a UI detail. It controls query cost, API stability, user experience, and how systems behave as data grows.',
    hook: 'Returning everything is not generosity. It is a slow incident with a friendly API response.',
    tags: ['Pagination', 'APIs', 'Performance', 'Databases'],
    cover: {
      kicker: 'Data access',
      metric: 'Bounded reads',
      gradient: 'from-sky-500/25 via-indigo-500/20 to-violet-500/20',
      accent: 'bg-sky-300',
      motif: 'database'
    },
    takeaways: [
      'Unbounded reads are reliability problems disguised as convenience.',
      'Cursor pagination usually maps better to changing datasets.',
      'API contracts should make expensive access patterns hard to misuse.'
    ],
    sections: [
      {
        id: 'story',
        title: 'The List Endpoint Was Fine Until It Was Popular',
        body: [
          'The endpoint started as a simple list. Return matching records. Add filters later. Let the frontend handle the rest.',
          'That decision aged badly. As the dataset grew, the API became slower, payloads became heavier, and every client inherited the cost of an unbounded read.'
        ]
      },
      {
        id: 'contract',
        title: 'Pagination Is an API Contract',
        body: [
          'Good pagination protects the backend and teaches clients how to consume data. It sets expectations around page size, sorting, stability, and what happens when records change between requests.',
          'Offset pagination is easy to start with. Cursor pagination is often easier to trust when data changes quickly.'
        ]
      },
      {
        id: 'lesson',
        title: 'Bounded Work Is a Reliability Habit',
        body: [
          'The deeper lesson is not about pagination syntax. It is about refusing to let one request do unbounded work.',
          'That habit shows up everywhere: queries, exports, background jobs, retries, and third-party calls.'
        ]
      }
    ],
    productionNotes: [
      'Define maximum page sizes and enforce them server-side.',
      'Choose stable sort keys before adopting cursor pagination.',
      'Track payload size and query duration for list APIs.'
    ]
  },
  {
    slug: 'apis-slow-after-adding-redis',
    title: 'Why Our APIs Were Slow Even After Adding Redis',
    category: 'Production Engineering',
    publishDate: '2026-01-11',
    readingMinutes: 7,
    summary: 'Caching helps only when you understand the real bottleneck, invalidation model, and request path you are trying to protect.',
    hook: 'Redis made one query faster. It did not make the workflow fast.',
    tags: ['Redis', 'Caching', 'APIs', 'Performance'],
    cover: {
      kicker: 'Caching reality',
      metric: 'Faster where it counts',
      gradient: 'from-red-400/25 via-pink-500/20 to-cyan-400/20',
      accent: 'bg-red-300',
      motif: 'systems'
    },
    takeaways: [
      'Caching the wrong layer makes dashboards look better without helping users.',
      'Cache invalidation is a product correctness problem.',
      'Latency budgets should follow the full request path, not one dependency.'
    ],
    sections: [
      {
        id: 'story',
        title: 'The Cache Was Working and the User Still Waited',
        body: [
          'We added Redis, saw fewer database hits, and expected the endpoint to feel dramatically better. It did improve, but not enough.',
          'The reason was simple after measurement: the cached query was only one part of the path. Serialization, downstream calls, payload size, and synchronous work still dominated the user-facing latency.'
        ]
      },
      {
        id: 'tradeoff',
        title: 'Caching Is Not a Performance Strategy by Itself',
        body: [
          'A cache is useful when the access pattern is stable, freshness requirements are understood, and misses do not create a stampede. Without that, Redis can become a faster way to serve stale or inconsistent behavior.',
          'The best cache decisions start with the question: what user pain disappears if this value is faster?'
        ]
      },
      {
        id: 'lesson',
        title: 'Measure the Path, Not the Tool',
        body: [
          'The real fix was widening the lens. We profiled the whole request, removed unnecessary work, bounded payloads, and cached only the pieces that matched product tolerance.',
          'Redis helped. Measurement helped more.'
        ]
      }
    ],
    productionNotes: [
      'Track cache hit rate beside end-to-end latency.',
      'Document freshness tolerance for every cached value.',
      'Protect hot keys and misses during traffic spikes.'
    ]
  },
  {
    slug: 'n-plus-one-query-real-projects',
    title: 'The N+1 Query Problem in Real Projects',
    category: 'Databases',
    publishDate: '2025-12-18',
    readingMinutes: 6,
    summary: 'N+1 problems rarely announce themselves in code review. They appear when product screens combine richer data with real volume.',
    hook: 'The code looked clean because every line was small. The database saw a hundred tiny requests.',
    tags: ['N+1', 'ORM', 'APIs', 'Performance'],
    cover: {
      kicker: 'Query behavior',
      metric: 'Fewer round trips',
      gradient: 'from-blue-400/25 via-cyan-400/20 to-pink-500/20',
      accent: 'bg-blue-300',
      motif: 'database'
    },
    takeaways: [
      'Readable code can still create expensive access patterns.',
      'Production-like data volume belongs in performance testing.',
      'Query counts should be visible during development and review.'
    ],
    sections: [
      {
        id: 'story',
        title: 'The Endpoint Slowed Down as the UI Became More Useful',
        body: [
          'The product screen needed richer information. A few related fields here, a few status labels there. Each addition looked harmless.',
          'By the time the page felt complete, the API was quietly asking the database the same kind of question again and again.'
        ]
      },
      {
        id: 'shape',
        title: 'N+1 Is a Shape Problem',
        body: [
          'The issue is not that ORMs are bad. The issue is that the code shape can hide the query shape. A loop over records can become a loop over database calls without anyone noticing in a small environment.',
          'The fix is usually eager loading, batched reads, better joins, or a response model designed around the screen.'
        ]
      },
      {
        id: 'lesson',
        title: 'Performance Bugs Often Start as Product Improvements',
        body: [
          'This is why performance work needs to stay close to product work. Every new field, filter, and relationship changes the data access pattern.',
          'Good backend engineers notice that before users do.'
        ]
      }
    ],
    productionNotes: [
      'Log query counts for critical endpoints in lower environments.',
      'Test list endpoints with realistic page sizes and relationship depth.',
      'Optimize for the response shape the product actually needs.'
    ]
  },
  {
    slug: 'building-ai-features-easier-than-operating-them',
    title: 'Building AI Features Is Easier Than Operating Them',
    category: 'AI Engineering',
    publishDate: '2025-12-01',
    readingMinutes: 8,
    summary: 'The hard part of AI engineering is not a demo response. It is latency, evaluation, cost, privacy, guardrails, and product trust.',
    hook: 'The demo worked in one afternoon. The production checklist was the real project.',
    tags: ['AI', 'RAG', 'Evaluation', 'Operations'],
    cover: {
      kicker: 'AI in production',
      metric: 'Trust over demos',
      gradient: 'from-fuchsia-500/25 via-cyan-400/20 to-emerald-400/20',
      accent: 'bg-fuchsia-300',
      motif: 'ai'
    },
    takeaways: [
      'AI features need evaluation and monitoring like any other system.',
      'Latency and cost are architecture constraints, not billing surprises.',
      'A model boundary should be treated like an unreliable external dependency.'
    ],
    sections: [
      {
        id: 'story',
        title: 'The First Version Felt Magical',
        body: [
          'A prototype can make AI feel almost unfair. Connect a model, send context, get a fluent answer. The hard part arrives when the feature has users, privacy expectations, failure modes, and a cost curve.',
          'That is when AI stops being a prompt and becomes backend engineering.'
        ]
      },
      {
        id: 'operations',
        title: 'Operating AI Means Measuring Weird Things',
        body: [
          'Traditional metrics still matter: latency, error rate, throughput, cost. But AI systems also need answer quality, retrieval quality, refusal behavior, source coverage, and human escalation paths.',
          'If the system cannot tell when it is wrong, the product will eventually find out the hard way.'
        ]
      },
      {
        id: 'lesson',
        title: 'Treat the Model Like a Powerful, Unreliable Dependency',
        body: [
          'That mental model keeps designs grounded. Add timeouts, fallbacks, guardrails, audit logs, and evaluation sets. Keep the product promise smaller than the model’s imagination.',
          'The best AI systems I trust feel less like magic and more like careful engineering.'
        ]
      }
    ],
    productionNotes: [
      'Track model latency, token cost, and answer-quality signals together.',
      'Keep retrieved context auditable for sensitive workflows.',
      'Design fallback behavior before model errors reach users.'
    ]
  },
  {
    slug: 'problem-nobody-talks-about-rag-systems',
    title: 'The Problem Nobody Talks About in RAG Systems',
    category: 'AI Engineering',
    publishDate: '2025-11-14',
    readingMinutes: 7,
    summary: 'RAG quality is usually limited by messy content, chunking decisions, retrieval evaluation, and how teams handle unknown answers.',
    hook: 'The model sounded confident. The retrieval layer had given it the wrong room to search in.',
    tags: ['RAG', 'Retrieval', 'AI', 'Evaluation'],
    cover: {
      kicker: 'RAG reality',
      metric: 'Retrieval is the product',
      gradient: 'from-cyan-400/25 via-violet-500/20 to-rose-500/20',
      accent: 'bg-cyan-300',
      motif: 'ai'
    },
    takeaways: [
      'Most RAG failures are retrieval failures wearing a model costume.',
      'Chunking strategy should follow the shape of the source material.',
      'Unknown-answer behavior is a product requirement, not an edge case.'
    ],
    sections: [
      {
        id: 'story',
        title: 'The Answer Was Fluent and Still Wrong',
        body: [
          'That is the uncomfortable part of RAG systems. A bad retrieval result does not always look bad. The model can produce a smooth answer from weak context, and users may trust the tone before they notice the substance.',
          'The problem was not prompt wording. The system had retrieved the wrong evidence.'
        ]
      },
      {
        id: 'retrieval',
        title: 'Retrieval Quality Is Product Quality',
        body: [
          'Chunking, metadata, freshness, access control, ranking, and evaluation define what the model is allowed to know. If those layers are weak, the final answer is built on sand.',
          'This is where backend instincts help. Treat the retrieval layer like a search product with observability, tests, and clear failure behavior.'
        ]
      },
      {
        id: 'lesson',
        title: 'The Best RAG Systems Know When to Stop',
        body: [
          'A reliable system should refuse, ask for clarification, or escalate when evidence is missing. That sounds less impressive than always answering, but it builds trust.',
          'In production, honesty is a feature.'
        ]
      }
    ],
    productionNotes: [
      'Maintain a retrieval evaluation set from real user questions.',
      'Log source coverage and empty-result behavior.',
      'Enforce access control before context reaches the model.'
    ]
  },
  {
    slug: 'ai-demos-never-reach-production',
    title: 'Why Most AI Demos Never Reach Production',
    category: 'AI Engineering',
    publishDate: '2025-10-29',
    readingMinutes: 6,
    summary: 'AI demos often skip the exact things production needs: evaluation, permissions, latency budgets, cost control, and failure ownership.',
    hook: 'A demo optimizes for surprise. A product has to optimize for trust.',
    tags: ['AI', 'Product Engineering', 'Trust', 'Architecture'],
    cover: {
      kicker: 'AI product gap',
      metric: 'Demo to durable',
      gradient: 'from-purple-500/25 via-pink-500/20 to-cyan-400/20',
      accent: 'bg-purple-300',
      motif: 'ai'
    },
    takeaways: [
      'The production gap is mostly operational, not model capability.',
      'Permissions and auditability must be designed from the first serious version.',
      'AI products need clear ownership for bad answers and high costs.'
    ],
    sections: [
      {
        id: 'story',
        title: 'The Demo Was Not Lying, It Was Incomplete',
        body: [
          'AI demos are good at showing possibility. They are bad at showing the boring constraints that decide whether something can ship.',
          'The missing pieces are usually not glamorous: tenant isolation, prompt logging, cost limits, retries, timeouts, fallback UX, and evaluation data.'
        ]
      },
      {
        id: 'gap',
        title: 'Production Adds Accountability',
        body: [
          'Once real users depend on the feature, someone owns wrong answers, slow responses, leaked context, and surprise bills. That ownership needs architecture behind it.',
          'This is why AI engineering feels closer to backend engineering than many people expect.'
        ]
      },
      {
        id: 'lesson',
        title: 'Build the Boring Parts Earlier',
        body: [
          'A small amount of early discipline saves a lot of cleanup. Evaluation sets, audit logs, cost dashboards, and permission checks make the second version much easier.',
          'The demo can be playful. The system around it has to be sober.'
        ]
      }
    ],
    productionNotes: [
      'Define success metrics beyond model response quality.',
      'Add tenant and user context to cost observability.',
      'Keep human escalation paths for high-risk workflows.'
    ]
  },
  {
    slug: 'three-years-production-engineering-taught-me',
    title: 'What 3 Years of Production Engineering Taught Me',
    category: 'Career',
    publishDate: '2025-10-11',
    readingMinutes: 7,
    summary: 'A career note on ownership, debugging, business context, and why production changes how engineers think.',
    hook: 'Production taught me that good code is only one part of being useful.',
    tags: ['Career', 'Production', 'Ownership', 'Backend'],
    cover: {
      kicker: 'Engineering growth',
      metric: 'Ownership mindset',
      gradient: 'from-emerald-400/25 via-cyan-400/20 to-violet-500/20',
      accent: 'bg-emerald-300',
      motif: 'career'
    },
    takeaways: [
      'The best engineers understand the business workflow behind the ticket.',
      'Debugging is easier when you designed for observability before the incident.',
      'Ownership means caring about the outcome after code is merged.'
    ],
    sections: [
      {
        id: 'story',
        title: 'The First Lesson Was Humbling',
        body: [
          'Early in my career, I cared most about writing clean code and finishing tasks. Those things still matter, but production taught me they are not enough.',
          'A feature is not done when it works locally. It is done when it behaves under real traffic, fails in understandable ways, and helps the business workflow it was built for.'
        ]
      },
      {
        id: 'ownership',
        title: 'Ownership Starts After Merge',
        body: [
          'The most valuable engineers I have worked with ask what can fail, who will notice, how we will recover, and whether the product team can explain the state to users.',
          'That mindset changes how you design APIs, database tables, logs, alerts, and even rollout plans.'
        ]
      },
      {
        id: 'lesson',
        title: 'Business Context Makes Technical Judgment Better',
        body: [
          'When you understand the business impact, you make better tradeoffs. You know when consistency matters more than latency, when a manual fallback is acceptable, and when a small bug can create a large operational problem.',
          'That is the kind of judgment I want my engineering work to show.'
        ]
      }
    ],
    productionNotes: [
      'Ask what business state a technical change is protecting.',
      'Write logs for the engineer who will debug at the worst time.',
      'Treat rollout and rollback as part of feature design.'
    ]
  },
  {
    slug: 'things-i-believed-before-real-systems',
    title: 'Things I Believed Before Working on Real Systems',
    category: 'Career',
    publishDate: '2025-09-24',
    readingMinutes: 6,
    summary: 'A reflection on the assumptions that changed after building APIs, data pipelines, and workflows with real users and real incidents.',
    hook: 'I used to think the hardest part was choosing the right technology. It was usually understanding the messy reality around it.',
    tags: ['Career', 'Engineering Judgment', 'Production'],
    cover: {
      kicker: 'Career notes',
      metric: 'Better assumptions',
      gradient: 'from-blue-400/25 via-cyan-400/20 to-pink-500/20',
      accent: 'bg-blue-300',
      motif: 'career'
    },
    takeaways: [
      'Simple systems are underrated until you are responsible for operating one.',
      'Most technical choices are tradeoffs, not permanent identities.',
      'The fastest engineer is often the one who asks the clearest questions early.'
    ],
    sections: [
      {
        id: 'story',
        title: 'Reality Made My Opinions Smaller and Stronger',
        body: [
          'Before working on real systems, it was easy to have clean opinions. Use this database. Choose this architecture. Avoid that pattern.',
          'Production made the opinions more conditional. The right answer depends on traffic, team maturity, data shape, failure tolerance, and how quickly the business is changing.'
        ]
      },
      {
        id: 'tradeoffs',
        title: 'Tradeoffs Beat Preferences',
        body: [
          'Every technology choice carries operational consequences. A queue can protect latency and hide failure. A cache can reduce load and create freshness problems. A service split can improve ownership and multiply debugging complexity.',
          'Learning to name both sides is where engineering judgment starts to become visible.'
        ]
      },
      {
        id: 'lesson',
        title: 'The Best Systems Are Understandable',
        body: [
          'I still like powerful tools. I just respect understandable systems more now.',
          'When a system is easy to reason about, teams move faster, incidents are calmer, and future engineers can improve it without fear.'
        ]
      }
    ],
    productionNotes: [
      'Prefer boring designs until the problem earns complexity.',
      'Document the tradeoff, not only the final decision.',
      'Ask who operates the choice after launch.'
    ]
  },
  {
    slug: 'business-understanding-better-engineers',
    title: 'Why Business Understanding Makes Better Engineers',
    category: 'Career',
    publishDate: '2025-09-08',
    readingMinutes: 6,
    summary: 'Backend engineering gets sharper when you understand revenue flows, operations pressure, support pain, and the workflows your code exists to protect.',
    hook: 'The database table made more sense after I understood the operations team using it every day.',
    tags: ['Career', 'Product Thinking', 'Ownership'],
    cover: {
      kicker: 'Product-minded backend',
      metric: 'Sharper tradeoffs',
      gradient: 'from-yellow-300/25 via-emerald-400/20 to-cyan-500/25',
      accent: 'bg-yellow-200',
      motif: 'career'
    },
    takeaways: [
      'Business context explains why some edge cases deserve first-class design.',
      'Operations workflows reveal hidden reliability requirements.',
      'Better engineers translate technical constraints into product impact.'
    ],
    sections: [
      {
        id: 'story',
        title: 'The Requirement Was Not Really About a Field',
        body: [
          'Sometimes a ticket looks small because it is described as a field, a status, or a validation. Then you learn the operations process behind it and realize the technical change protects a much larger workflow.',
          'That is why I try to understand the business path before designing the backend path.'
        ]
      },
      {
        id: 'context',
        title: 'Context Changes Technical Decisions',
        body: [
          'If a failure blocks payroll, the retry policy matters differently. If a state is used by support, auditability matters differently. If a report drives decisions, data freshness matters differently.',
          'Business context turns abstract engineering tradeoffs into concrete priorities.'
        ]
      },
      {
        id: 'lesson',
        title: 'Engineers Should Be Able to Explain the Outcome',
        body: [
          'The strongest backend work connects implementation to impact. It is not enough to say the API is done. What became faster, safer, clearer, or easier to operate?',
          'That answer is what earns trust.'
        ]
      }
    ],
    productionNotes: [
      'Map critical product states before designing storage.',
      'Ask support and operations where the current system is unclear.',
      'Tie observability to the workflow users care about.'
    ]
  }
] satisfies BlogPostShape[]
