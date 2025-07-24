import { QueryResponse } from '../types';

export const mockQueryResponse: QueryResponse = {
  query: "Can I terminate my contract early?",
  answer: "Yes, according to clause 12.2 of your insurance policy, you can terminate the contract early by providing a 30-day written notice. However, please note that early termination may result in cancellation fees as outlined in clause 15.4.",
  clauses: [
    {
      number: "12.2",
      text: "Early Termination. Either party may terminate this Agreement by providing thirty (30) days' written notice to the other party. Such termination shall be effective upon the expiration of the thirty (30) day notice period.",
      confidence: 0.96,
      type: "supportive",
      documentId: "doc-1"
    },
    {
      number: "15.4",
      text: "Cancellation Fees. In the event of early termination by the policyholder, a cancellation fee equal to 10% of the remaining premium amount shall be applied.",
      confidence: 0.88,
      type: "critical",
      documentId: "doc-1"
    }
  ],
  documentName: "Health Insurance Policy.pdf",
  timestamp: new Date()
};

export const sampleDocuments = [
  {
    id: "doc-1",
    name: "Health Insurance Policy.pdf",
    type: "application/pdf",
    size: 2048000,
    uploadedAt: new Date("2025-01-08T10:00:00"),
  },
  {
    id: "doc-2", 
    name: "Employment Contract.pdf",
    type: "application/pdf",
    size: 1024000,
    uploadedAt: new Date("2025-01-08T10:05:00"),
  }
];