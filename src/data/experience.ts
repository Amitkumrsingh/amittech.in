import type { ExperienceRole as ExperienceRoleShape } from '../features/experience'

export type { ExperienceRole } from '../features/experience'

export const EXPERIENCE = [
  {
    id: 'delhivery',
    company: 'Delhivery',
    role: 'Software Developer',
    period: 'Oct 2025 – Present',
    tech: ['Python', 'Kafka', 'Redis', 'MySQL', 'MongoDB', 'AWS', 'Debezium', 'Microservices'],
    highlights: [
      'Architected and scaled a distributed HRMS platform serving 300K+ employees.',
      'Reduced onboarding turnaround time by 60%.',
      'Built CDC-based synchronization pipelines using Debezium, MySQL binlogs, and Kafka.',
      'Implemented Consumer Groups, DLQs, Retry Policies, Idempotency, Event Replay, and Partition Scaling.',
      'Led zero-downtime migrations and PII encryption with VAPT remediation.',
      'Enhanced observability and monitoring across production systems.'
    ]
  },
  {
    id: 'finxbridge',
    company: 'Finxbridge',
    role: 'Software Development Engineer - I',
    period: 'Jan 2025 – Oct 2025',
    tech: ['Node.js', 'MongoDB', 'Kafka', 'Distributed Systems', 'REST APIs', 'SOAP APIs'],
    highlights: [
      'Built backend systems for HDFC Forex Card and VISA payment products.',
      'Designed distributed transaction processing workflows with idempotent retry mechanisms.',
      'Implemented JWT authentication, AES encryption, and secure bank integrations.',
      'Integrated REST and SOAP APIs across banking and payment systems.',
      'Improved MongoDB performance by 35% through schema and indexing enhancements.'
    ]
  },
  {
    id: 'anirvana',
    company: 'Anirvana',
    role: 'Software Developer',
    period: 'Jul 2023 – Dec 2024',
    tech: ['Django', 'React', 'PostgreSQL', 'AWS', 'Docker', 'CI/CD'],
    highlights: [
      'Built and scaled an EdTech CRM platform that improved lead management efficiency by 30%.',
      'Developed a configurable Form Builder platform for dynamic workflows.',
      'Designed REST APIs and workflow automation systems for operations teams.',
      'Managed AWS production infrastructure and containerized applications with Docker.',
      'Built CI/CD pipelines that reduced deployment effort by 80%.'
    ]
  }
] satisfies ExperienceRoleShape[]
