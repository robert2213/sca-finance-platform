import type { AgentDefinition } from "./types";
import {
  cfoRespond, fpaRespond, procurementRespond,
  externalLaborRespond, headcountRespond, cioRespond,
} from "./mockResponses";

export const agentRegistry: AgentDefinition[] = [
  {
    id: "cfo",
    name: "CFO Agent",
    title: "Chief Financial Officer",
    description: "Synthesizes financial performance, creates executive commentary, and flags major risks and opportunities across the IT portfolio.",
    avatar: "🏦",
    color: "indigo",
    capabilities: ["Executive Summaries", "Risk Flagging", "Cost Optimization", "Board Narratives"],
    suggestedQuestions: [
      "Give me the executive financial summary for May 2026",
      "What are the top financial risks I should know about?",
      "Where are our biggest cost optimization opportunities?",
      "How do we explain the budget variance to the board?",
    ],
    respond: cfoRespond,
  },
  {
    id: "fpa",
    name: "FP&A Agent",
    title: "Financial Planning & Analysis",
    description: "Explains budget vs. actuals, reviews forecast changes, and identifies variance drivers by cost center and business unit.",
    avatar: "📊",
    color: "blue",
    capabilities: ["Variance Analysis", "Forecast Review", "Budget vs. Actuals", "Trend Analysis"],
    suggestedQuestions: [
      "What are the main drivers of our budget variance?",
      "How is our full-year forecast tracking?",
      "Which cost centers are most over budget?",
      "Walk me through the month-over-month spend trend",
    ],
    respond: fpaRespond,
  },
  {
    id: "procurement",
    name: "Procurement Agent",
    title: "Vendor & Contract Management",
    description: "Reviews vendor spend, flags contracts near expiration, identifies spend concentration risks, and supports renewal strategy.",
    avatar: "📋",
    color: "purple",
    capabilities: ["Contract Tracking", "Spend Analysis", "Risk Assessment", "Renewal Strategy"],
    suggestedQuestions: [
      "Which contracts are expiring in the next 6 months?",
      "Where do we have vendor concentration risk?",
      "What is our total vendor commitment?",
      "Which vendors should we prioritize for renewal negotiations?",
    ],
    respond: procurementRespond,
  },
  {
    id: "external-labor",
    name: "External Labor Agent",
    title: "Contractor Spend Management",
    description: "Tracks contractor spend, reviews burn rate by cost center, flags over-budget engagements, and identifies SOW risks.",
    avatar: "👷",
    color: "amber",
    capabilities: ["Burn Rate Analysis", "SOW Review", "Budget Compliance", "Contractor Tracking"],
    suggestedQuestions: [
      "Which contractors are over their approved budgets?",
      "What is our total YTD contractor spend?",
      "Which contractor engagements are ending soon?",
      "How does our contractor spend compare to budget by business unit?",
    ],
    respond: externalLaborRespond,
  },
  {
    id: "headcount",
    name: "Headcount Agent",
    title: "Workforce Planning & Analytics",
    description: "Reviews open positions, tracks filled roles, explains headcount movement, and supports workforce cost analysis.",
    avatar: "👥",
    color: "emerald",
    capabilities: ["HC Tracking", "Open Req Analysis", "Salary Budgeting", "Workforce Planning"],
    suggestedQuestions: [
      "How many open requisitions do we have?",
      "What is our current headcount fill rate?",
      "Which business units have the most open positions?",
      "How much salary savings do open reqs generate?",
    ],
    respond: headcountRespond,
  },
  {
    id: "cio",
    name: "CIO Finance Partner",
    title: "IT Executive Finance Partner",
    description: "Summarizes IT spend, explains cloud/project/labor trends, and creates CIO-ready talking points for executive and board audiences.",
    avatar: "💡",
    color: "rose",
    capabilities: ["CIO Briefings", "Cloud Trends", "Strategic Narrative", "Board Readiness"],
    suggestedQuestions: [
      "Give me CIO-ready talking points for our cloud spend",
      "How do I explain the IT budget variance to leadership?",
      "What is our total IT investment story this year?",
      "Prepare a 5-point executive briefing on IT financials",
    ],
    respond: cioRespond,
  },
];

export function getAgent(id: string): AgentDefinition | undefined {
  return agentRegistry.find((a) => a.id === id);
}
