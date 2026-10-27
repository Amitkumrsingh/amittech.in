export type AiFocus = {
  id: string
  eyebrow: string
  title: string
  summary: string
  details: string[]
  stack: string[]
  accent: 'cyan' | 'violet'
}

export const AI_FOCUS_ITEMS: AiFocus[] = [
  {
    id: 'cloudops-ai-copilot',
    eyebrow: 'Private AI platform',
    title: 'CloudOps AI Copilot',
    summary: 'An AI workspace for cloud infrastructure intelligence, cost visibility, and observability workflows.',
    details: [
      'Parsed AWS CUR and Athena data with S3-backed CSV workflows for cost analysis.',
      'Combined ChromaDB retrieval, vector search, and Gemini-powered cost optimization.',
      'Used MCP tool orchestration, agentic workflows, SSE streaming, and context management.'
    ],
    stack: ['AWS Athena', 'AWS CUR', 'S3', 'ChromaDB', 'RAG', 'MCP', 'Gemini', 'Claude via Bedrock'],
    accent: 'cyan'
  },
  {
    id: 'hrms-ai-workflows',
    eyebrow: 'Production workflow intelligence',
    title: 'HRMS MCP & RAG workflows',
    summary: 'Natural-language access to employee lifecycle, onboarding, attendance, and operational context.',
    details: [
      'Built an MCP server for structured employee lifecycle lookup and onboarding status.',
      'Connected Claude orchestration to HRMS records and attendance-cycle workflows.',
      'Designed human-in-the-loop paths for reliable answers over operational data.'
    ],
    stack: ['Python', 'MCP', 'RAG', 'Claude', 'LLM orchestration', 'HITL', 'Kafka', 'HRMS'],
    accent: 'violet'
  }
]

export const AI_CAPABILITIES = [
  'LLM applications',
  'RAG pipelines',
  'LangChain',
  'LangGraph',
  'Vector databases',
  'Prompt engineering',
  'AI agents',
  'MCP',
  'Human-in-the-loop'
]
