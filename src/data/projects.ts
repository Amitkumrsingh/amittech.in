import type { Project as ProjectShape } from '../features/projects'

export type { Project } from '../features/projects'

export const PROJECTS = [
  {
    id: 'cloudops-ai-copilot',
    title: 'CloudOps AI Copilot',
    company: 'Independent AI project',
    period: 'Recent project',
    role: 'AI Systems Engineer',
    businessProblem: 'Turn cloud cost and observability data into an interactive assistant for infrastructure teams.',
    scale: 'AWS CUR and Athena workflows with S3-backed data parsing, vector retrieval, and streamed agent responses.',
    architecture: 'RAG and MCP orchestration across AWS Athena, S3, ChromaDB, Gemini, Claude via Bedrock, and SSE.',
    tech: ['AWS Athena', 'AWS CUR', 'S3', 'ChromaDB', 'RAG', 'MCP', 'Gemini', 'Claude via Bedrock'],
    impact: ['Automated cloud cost analysis and optimization workflows', 'Enabled tool-aware agentic responses with streamed output'],
    challenges: ['Managed context across retrieval and tool calls', 'Designed a practical path from structured cloud data to human-readable recommendations'],
    sampleCode: `# Retrieval-augmented tool workflow
context = retriever.search(question)
result = agent.run(question=question, context=context, tools=mcp_tools)
stream(result)
`
  },
  {
    id: 'hrms-event-driven',
    title: 'HRMS Event-Driven Workflow Engine',
    company: 'Delhivery',
    period: 'Oct 2025 – Jul 2026',
    role: 'Software Development Engineer',
    businessProblem: 'Connect onboarding, BGV, attendance, and learning workflows across operational systems for a large employee base.',
    scale: '150K+ employees supported through Python services, Kafka workflows, and cross-system synchronization.',
    architecture: 'Event-driven microservices with Kafka, Redis, MySQL, MongoDB, AWS, retries, DLQs, and observability.',
    tech: ['Python', 'Kafka', 'Redis', 'MySQL', 'MongoDB', 'AWS', 'MCP', 'Microservices'],
    impact: ['60% reduction in onboarding time', 'Zero-downtime migrations and stronger production observability', 'MCP and agentic AI workflows for employee lifecycle lookup'],
    challenges: ['Built idempotent retries, DLQs, event replay, and partition scaling', 'Synchronized HRMS, Newton RDS, OS1 LMS, attendance, and workforce workflows', 'Implemented security remediation and PII-safe operational practices'],
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
