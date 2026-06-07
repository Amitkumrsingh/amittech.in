import type { Project as ProjectShape } from '../features/projects'

export type { Project } from '../features/projects'

export const PROJECTS = [
  {
    id: 'distributed-hrms',
    title: 'Distributed HRMS Platform',
    company: 'Delhivery',
    period: 'Oct 2025 – Present',
    role: 'Software Developer',
    businessProblem: 'Unified HR, attendance, roster, leave, and learning systems for a distributed workforce across multiple regions.',
    scale: '300K+ employees served, CDC-driven sync across MySQL, MongoDB, and Kafka.',
    architecture: 'Event-driven microservices with Debezium CDC, Kafka, Redis, MySQL, MongoDB, and AWS.',
    tech: ['Python', 'Kafka', 'Redis', 'MySQL', 'MongoDB', 'AWS', 'Debezium', 'Microservices'],
    impact: ['60% reduction in onboarding turnaround time', 'Zero-downtime migrations', 'Improved observability across production systems'],
    challenges: ['Built idempotent event replay and retry pipelines', 'Managed cross-system integration with LMS, UMS, Oracle HRMS, attendance, roster, and leave systems', 'Implemented PII encryption and VAPT remediation'],
    sampleCode: `# Kafka consumer with idempotent state handling
from kafka import KafkaConsumer
from collections import defaultdict

processed = defaultdict(bool)
consumer = KafkaConsumer('hrms-events', bootstrap_servers=['kafka:9092'], group_id='hrms-processing')
for msg in consumer:
    event = json.loads(msg.value)
    if processed[event['id']]:
        continue
    process_event(event)
    processed[event['id']] = True
`
  },
  {
    id: 'hdfc-forex-card',
    title: 'HDFC Forex Card Platform',
    company: 'Finxbridge',
    period: 'Jan 2025 – Oct 2025',
    role: 'Software Development Engineer - I',
    businessProblem: 'Built backend services for HDFC Forex Card products to support secure foreign exchange and payment workflows.',
    scale: 'Payment processing for banking clients with transaction-level idempotency and retry guarantees.',
    architecture: 'Distributed transaction workflow with Node.js services, Kafka event buses, MongoDB persistence, and encrypted API gateways.',
    tech: ['Node.js', 'MongoDB', 'Kafka', 'REST APIs', 'SOAP APIs', 'JWT', 'AES Encryption'],
    impact: ['Improved MongoDB performance by 35%', 'Reduced transaction failure through idempotent retry logic'],
    challenges: ['Integrated banking systems over REST and SOAP APIs', 'Secured transaction flows with JWT and AES', 'Orchestrated resilient payment workflows with Kafka'],
    sampleCode: `// Idempotent transaction handler
async function handlePayment(event) {
  const key = generateIdempotencyKey(event)
  if (await cache.exists(key)) return
  await processPayment(event)
  await cache.set(key, true)
}
`
  },
  {
    id: 'visa-payment-system',
    title: 'VISA Payment Processing System',
    company: 'Finxbridge',
    period: 'Jan 2025 – Oct 2025',
    role: 'Software Development Engineer - I',
    businessProblem: 'Delivered a secure payment platform for VISA processing while maintaining compliance and high throughput.',
    scale: 'Financial transaction routing with low-latency payment settlement.',
    architecture: 'Event-driven API stack with Kafka, Node.js, MongoDB, and encryption-first payload handling.',
    tech: ['Node.js', 'MongoDB', 'Kafka', 'Distributed Systems', 'REST APIs', 'SOAP APIs'],
    impact: ['Reduced payment retries with robust error handling', 'Improved database throughput for transaction workloads'],
    challenges: ['Built retry mechanisms and connection fallback for payment rails', 'Ensured encryption and auditability across every transaction'],
    sampleCode: `// Payment retry with backoff
async function executeTransaction(payload) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await sendToPaymentGateway(payload)
    } catch (err) {
      await sleep(Math.pow(2, attempt) * 200)
    }
  }
  throw new Error('Transaction failed after retries')
}
`
  },
  {
    id: 'edtech-crm',
    title: 'EdTech CRM Platform',
    company: 'Anirvana',
    period: 'Jul 2023 – Dec 2024',
    role: 'Software Developer',
    businessProblem: 'Built a CRM platform for EdTech teams to manage leads, workflows, and student engagement at scale.',
    scale: '30% improvement in lead management efficiency with configurable automation pipelines.',
    architecture: 'Django backend with React frontend, PostgreSQL data models, AWS infrastructure and containerized deployment.',
    tech: ['Django', 'React', 'PostgreSQL', 'AWS', 'Docker', 'CI/CD'],
    impact: ['30% improvement in lead management efficiency', '80% reduction in deployment effort'],
    challenges: ['Designed workflow automation and REST APIs for lead routing', 'Managed AWS production infrastructure and containerized delivery'],
    sampleCode: `# CRM lead scoring pipeline
class LeadProcessor:
    def process(self, lead):
        score = self.compute_score(lead)
        if score > 80:
            self.route_to_sales(lead)
`
  },
  {
    id: 'dynamic-form-builder',
    title: 'Dynamic Form Builder',
    company: 'Anirvana',
    period: 'Jul 2023 – Dec 2024',
    role: 'Software Developer',
    businessProblem: 'Created a configurable form builder for education teams to launch custom workflows without engineering support.',
    scale: 'Reusable form templates supporting dynamic validation, field logic, and backend event handling.',
    architecture: 'Modular React form engine with Django APIs, PostgreSQL storage, and Dockerized CI/CD pipelines.',
    tech: ['Django', 'React', 'PostgreSQL', 'AWS', 'Docker', 'CI/CD'],
    impact: ['Enabled no-code form creation for operations teams', 'Reduced deployment effort by 80% with automated pipelines'],
    challenges: ['Built a reusable form model with configurable validation rules', 'Delivered reliable API contracts for dynamic workflows'],
    sampleCode: `// Dynamic form payload normalization
function normalizeForm(values) {
  return values.reduce((acc, field) => ({ ...acc, [field.name]: field.value }), {})
}
`
  }
] satisfies ProjectShape[]
