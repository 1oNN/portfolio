// Real evaluation items from the FinLaw-UK benchmark.
//
// Source (verbatim): backend/evaluation/questions/questions_10_curated.csv in
// https://github.com/1oNN/finlaw-uk - the curated "basic" tier of the 110-item
// evaluation set. Nothing here is generated: questions, gold answers, and
// required citations are the graded ground truth the system was scored against.

export interface BenchmarkItem {
  id: string;
  /** Regulatory domain code as used in the eval set (FSMA, COBS, DISP...). */
  domain: string;
  /** Human-readable domain name shown in the detail panel. */
  domainLabel: string;
  question: string;
  goldAnswer: string;
  /** Citations a correct answer must carry - validated against the Neo4j graph. */
  citations: string[];
  /** Graded keywords from the eval harness (kept for fidelity; not all rendered). */
  keywords: string[];
}

export const FINLAW_BENCHMARK: BenchmarkItem[] = [
  {
    id: "Q1",
    domain: "FSMA",
    domainLabel: "Financial Services and Markets Act 2000",
    question: "What is the 'general prohibition' in UK financial services?",
    goldAnswer:
      "The FSMA 2000 'general prohibition' makes it an offence to carry on a regulated activity in the UK unless authorised or exempt.",
    citations: ["FSMA 2000 s.19", "RAO 2001 art.5"],
    keywords: ["general prohibition", "regulated activity", "authorised", "exempt"],
  },
  {
    id: "Q2",
    domain: "COMP",
    domainLabel: "FSCS Compensation Sourcebook",
    question: "What is the FSCS deposit protection limit per individual?",
    goldAnswer: "£85,000 per person per firm for eligible deposits.",
    citations: ["COMP 10.2"],
    keywords: ["FSCS", "£85,000", "deposit protection"],
  },
  {
    id: "Q3",
    domain: "COBS",
    domainLabel: "Conduct of Business Sourcebook",
    question: "What standard applies to financial promotions in the UK?",
    goldAnswer: "Financial promotions must be fair, clear and not misleading.",
    citations: ["COBS 4.2.1R"],
    keywords: ["financial promotion", "fair", "clear", "misleading"],
  },
  {
    id: "Q4",
    domain: "ICOBS",
    domainLabel: "Insurance Conduct of Business Sourcebook",
    question: "How many days does a consumer have to cancel a general insurance policy?",
    goldAnswer: "Consumers have 14 days to cancel most non-investment insurance contracts.",
    citations: ["ICOBS 7"],
    keywords: ["cancellation", "cooling off", "14 days", "insurance"],
  },
  {
    id: "Q5",
    domain: "PSR",
    domainLabel: "Payment Services Regulations 2017",
    question: "What is the maximum liability for an unauthorised payment transaction?",
    goldAnswer:
      "The payer's liability is limited to £35 unless the payer acted fraudulently or with gross negligence.",
    citations: ["PSR 2017 reg.77"],
    keywords: ["unauthorised", "payment", "£35", "liability"],
  },
  {
    id: "Q6",
    domain: "MLR",
    domainLabel: "Money Laundering Regulations 2017",
    question: "What is CDD under the Money Laundering Regulations 2017?",
    goldAnswer:
      "Customer due diligence requires firms to identify and verify customers and obtain information on purpose of business.",
    citations: ["MLR 2017 reg.27"],
    keywords: ["CDD", "customer due diligence", "verify", "identify"],
  },
  {
    id: "Q7",
    domain: "RAO",
    domainLabel: "Regulated Activities Order 2001",
    question: "Give one example of a regulated activity under RAO 2001.",
    goldAnswer: "Advising on investments is a regulated activity.",
    citations: ["RAO 2001 art.53"],
    keywords: ["regulated activity", "advising", "investments"],
  },
  {
    id: "Q8",
    domain: "UK MAR",
    domainLabel: "UK Market Abuse Regulation",
    question: "What must issuers maintain regarding inside information?",
    goldAnswer:
      "Issuers must maintain and update insider lists and provide them to the FCA on request.",
    citations: ["UK MAR art.18", "DTR 2"],
    keywords: ["insider list", "issuer", "FCA"],
  },
  {
    id: "Q9",
    domain: "PRIN",
    domainLabel: "FCA Principles for Businesses",
    question: "Which FCA principle introduces the Consumer Duty?",
    goldAnswer:
      "The Consumer Duty is Principle 12, requiring firms to act to deliver good outcomes for retail customers.",
    citations: ["PRIN 12"],
    keywords: ["Consumer Duty", "good outcomes", "Principle 12"],
  },
  {
    id: "Q10",
    domain: "DISP",
    domainLabel: "Dispute Resolution: Complaints",
    question: "How long do firms have to issue a final response to a complaint?",
    goldAnswer:
      "Firms must issue a final response within 8 weeks or a holding response with FOS rights.",
    citations: ["DISP 1.6"],
    keywords: ["complaint", "final response", "8 weeks", "ombudsman"],
  },
];

export const FINLAW_EVAL_SET_URL =
  "https://github.com/1oNN/finlaw-uk/tree/main/backend/evaluation/questions";
