import type { ExperienceRole as ExperienceRoleShape } from '../features/experience'

export type { ExperienceRole } from '../features/experience'

export const EXPERIENCE = [
  {
    id: 'delhivery',
    company: 'Delhivery',
    role: 'Software Development Engineer',
    period: 'Oct 2025 – Jul 2026',
    tech: ['Python', 'Kafka', 'Redis', 'MySQL', 'MongoDB', 'AWS', 'MCP', 'Microservices'],
    highlights: [
      'Supported an HRMS platform serving 150K+ employees across onboarding, BGV, attendance, and workforce workflows.',
      'Reduced onboarding time by 60% through event-driven Python and Kafka microservices.',
      'Synchronized HRMS, Newton RDS, and OS1 LMS workflows while migrating legacy PHP services to Python.',
      'Built an MCP server and agentic AI workflows for employee lifecycle lookup, onboarding status, and attendance cycles.',
      'Implemented Kafka retries, DLQs, partition scaling, alerts, security remediation, and zero-downtime migrations.'
    ]
  },
  {
    id: 'finxbridge',
    company: 'Finxbridge',
    role: 'Software Development Engineer - I',
    period: 'Jan 2025 – Oct 2025',
    tech: ['Node.js', 'MongoDB', 'Kafka', 'REST APIs', 'SOAP APIs', 'JWT', 'AES'],
    highlights: [
      'Built backend services for HDFC Forex Card workflows using Node.js, MongoDB, Kafka, REST, and SOAP APIs.',
      'Designed asynchronous transaction processing with idempotent retries and resilient payment workflows.',
      'Implemented JWT authentication, AES encryption, secure bank integrations, and circuit-breaker patterns.',
      'Improved MongoDB query performance by 35% through aggregation, indexing, and pagination.'
    ]
  },
  {
    id: 'anirvana',
    company: 'Anirvana',
    role: 'Software Developer',
    period: 'Jul 2023 – Dec 2024',
    tech: ['Django', 'React', 'PostgreSQL', 'AWS', 'Docker', 'CI/CD'],
    highlights: [
      'Built an EdTech CRM with React, Django, PostgreSQL, and AWS, improving lead management by 30%.',
      'Developed enquiry, appointment, user-management, accounts, and configurable workflow modules.',
      'Improved REST API response times by 15% through backend and query optimization.',
      'Containerized services with Docker and Kubernetes and built CI/CD pipelines that cut deployment time by 80%.'
    ]
  },
  {
    id: 'anirvana-intern',
    company: 'Anirvana',
    role: 'Software Engineer Intern',
    period: 'May 2023 – Jul 2023',
    tech: ['Bash', 'Figma', 'HTML', 'CSS', 'Web Performance'],
    highlights: [
      'Generated 100+ city SEO landing pages with Bash automation.',
      'Created 20+ Figma pages and improved Lighthouse performance from 30 to 93 with lazy loading and WebP assets.'
    ]
  }
] satisfies ExperienceRoleShape[]
