export interface PreScreenerQuestion {
  id: string;
  question: string;
  type: 'text' | 'number' | 'boolean';
  condition: 'equals' | 'greater_than' | 'less_than' | 'not_equals';
  value: string | number | boolean;
}

export const preScreenerTemplates: PreScreenerQuestion[] = [
  {
    id: 'ps1',
    question: 'What is your age?',
    type: 'number',
    condition: 'greater_than',
    value: 18,
  },
  {
    id: 'ps2',
    question: 'Which country do you live in?',
    type: 'text',
    condition: 'equals',
    value: 'India',
  },
  {
    id: 'ps3',
    question: 'What is your annual income (in USD)?',
    type: 'number',
    condition: 'greater_than',
    value: 25000,
  },
  {
    id: 'ps4',
    question: 'Do you own a smartphone?',
    type: 'boolean',
    condition: 'equals',
    value: true,
  },
  {
    id: 'ps5',
    question: 'How many hours do you spend online daily?',
    type: 'number',
    condition: 'greater_than',
    value: 2,
  },
  {
    id: 'ps6',
    question: 'Are you currently employed?',
    type: 'boolean',
    condition: 'equals',
    value: true,
  },
];
