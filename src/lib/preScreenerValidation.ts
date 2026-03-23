import type { PreScreenerQuestion } from '@/types';

export interface PreScreenerAnswer {
  questionId: string;
  value: string | number | boolean;
}

export interface ValidationResult {
  passed: boolean;
  failedQuestion?: PreScreenerQuestion;
  message?: string;
}

function validateCondition(
  answerValue: string | number | boolean,
  condition: string,
  expectedValue: string | number | boolean
): boolean {
  switch (condition) {
    case 'equals':
      return String(answerValue).toLowerCase() === String(expectedValue).toLowerCase();
    case 'greater_than':
      return Number(answerValue) > Number(expectedValue);
    case 'less_than':
      return Number(answerValue) < Number(expectedValue);
    case 'not_equals':
      return String(answerValue).toLowerCase() !== String(expectedValue).toLowerCase();
    default:
      return false;
  }
}

function getFailureMessage(question: PreScreenerQuestion): string {
  switch (question.condition) {
    case 'equals':
      return `This survey requires ${question.question} to be "${question.value}"`;
    case 'greater_than':
      return `This survey requires ${question.question} to be greater than ${question.value}`;
    case 'less_than':
      return `This survey requires ${question.question} to be less than ${question.value}`;
    case 'not_equals':
      return `This survey requires ${question.question} to not be "${question.value}"`;
    default:
      return 'You do not meet the requirements for this survey';
  }
}

export function validatePreScreener(
  answers: PreScreenerAnswer[],
  questions: PreScreenerQuestion[]
): ValidationResult {
  for (const question of questions) {
    const answer = answers.find((a) => a.questionId === question.id);

    if (!answer) {
      return {
        passed: false,
        failedQuestion: question,
        message: `Please answer: ${question.question}`,
      };
    }

    const isValid = validateCondition(answer.value, question.condition, question.value);

    if (!isValid) {
      return {
        passed: false,
        failedQuestion: question,
        message: getFailureMessage(question),
      };
    }
  }

  return { passed: true };
}
