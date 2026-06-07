import type { SkillCategory as SkillCategoryShape } from '../features/expertise'

export type { SkillCategory } from '../features/expertise'

export const SKILL_CATEGORIES = [
  {
    title: 'Frontend',
    items: ['React.js', 'Redux', 'HTML5', 'CSS3', 'Material UI', 'Responsive Design']
  },
  {
    title: 'Backend',
    items: ['Python', 'Django', 'Flask', 'Sanic', 'Node.js', 'Express.js', 'REST APIs']
  },
  {
    title: 'Databases',
    items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis']
  },
  {
    title: 'Distributed Systems',
    items: ['Kafka', 'Event-Driven Architecture', 'CDC Pipelines', 'Debezium', 'Consumer Groups', 'DLQ', 'Retry Mechanisms', 'Idempotency']
  },
  {
    title: 'Cloud & DevOps',
    items: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Nginx', 'Gunicorn']
  },
  {
    title: 'Architecture',
    items: ['Microservices', 'Distributed Systems', 'System Design', 'Scalable Backend Systems']
  }
] satisfies SkillCategoryShape[]

export const SKILL_DETAILS: Record<string, string> = {
  'React.js': 'Built responsive platform interfaces and admin workflows.',
  Redux: 'Managed application state for predictable data flows.',
  HTML5: 'Structured accessible interfaces for complex systems.',
  CSS3: 'Created polished dark UI with glassmorphism and gradients.',
  'Material UI': 'Implemented reusable design system patterns.',
  'Responsive Design': 'Delivered seamless experiences across desktop and mobile.',
  Python: 'Authored backend services, ETL pipelines, and automation tooling.',
  Django: 'Built REST APIs and domain models for SaaS and CRM platforms.',
  Flask: 'Prototyped lightweight microservices and webhooks.',
  Sanic: 'Optimized async request handling for performance-sensitive services.',
  'Node.js': 'Led backend integrations for payment and transaction systems.',
  'Express.js': 'Designed REST APIs and middleware for banking services.',
  'REST APIs': 'Connected workflows across systems with reliable contracts.',
  PostgreSQL: 'Engineered transactional models for financial and HR systems.',
  MySQL: 'Built CDC-driven sync pipelines with Debezium and MySQL binlogs.',
  MongoDB: 'Tuned queries and indexes to improve performance by 35%.',
  Redis: 'Used distributed caching for session and event state.',
  Kafka: 'Built streaming pipelines and event-driven delivery networks.',
  'Event-Driven Architecture': 'Delivered resilient asynchronous workflows.',
  'CDC Pipelines': 'Synchronized databases with change-data-capture streams.',
  Debezium: 'Enabled reliable MySQL binlog replication into Kafka.',
  'Consumer Groups': 'Orchestrated parallel processing with fault tolerance.',
  DLQ: 'Added durable error handling for failed events.',
  'Retry Mechanisms': 'Implemented safe retries with idempotency guarantees.',
  Idempotency: 'Ensured transaction safety across distributed workflows.',
  AWS: 'Operated production infrastructure and automated deployments.',
  Docker: 'Containerized services for consistent delivery pipelines.',
  Kubernetes: 'Designed scalable deployment patterns for cloud workloads.',
  'CI/CD': 'Reduced deployment effort by 80% with repeatable pipelines.',
  Nginx: 'Optimized reverse proxy routing and load balancing.',
  Gunicorn: 'Served Python web apps with reliable WSGI processes.',
  Microservices: 'Split monolithic logic into composable services.',
  'Distributed Systems': 'Engineered for throughput, reliability, and observability.',
  'System Design': 'Defined service boundaries, contracts, and scale plans.',
  'Scalable Backend Systems': 'Built platforms capable of supporting hundreds of thousands of users.'
}
