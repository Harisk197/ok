// Mock data for development and testing
export const mockDocuments = [
  {
    id: '1',
    name: 'Sample Insurance Policy.pdf',
    type: 'application/pdf',
    size: 1024000,
    uploadedAt: new Date(),
    textContent: 'This is a sample insurance policy document with various clauses and terms.',
    clauses: [
      {
        number: '1.1',
        text: 'Coverage begins on the effective date specified in the policy.',
        confidence: 0.95,
        type: 'supportive' as const
      },
      {
        number: '2.1',
        text: 'Cancellation may result in penalties and fees.',
        confidence: 0.88,
        type: 'critical' as const
      }
    ]
  }
];

export const mockChatResponses = [
  "Based on your insurance policy, the coverage begins on the effective date specified in your policy document.",
  "According to clause 2.1, cancellation may result in penalties and fees. Please review the specific terms in your policy.",
  "Your policy includes comprehensive coverage with the following key benefits..."
];