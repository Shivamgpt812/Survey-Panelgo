export const REDIRECT_URLS = {
  1: "https://surveypanelgo.com/success",
  2: "https://surveypanelgo.com/terminated", 
  3: "https://surveypanelgo.com/quota-full",
  4: "https://surveypanelgo.com/security-block"
};

export function getStatusText(status: string | number): string {
  const statusNum = typeof status === 'string' ? parseInt(status, 10) : status;
  
  switch (statusNum) {
    case 1:
      return 'Completed';
    case 2:
      return 'Terminated';
    case 3:
      return 'Quota Full';
    case 4:
      return 'Security Terminated';
    default:
      return 'Unknown';
  }
}

export function isValidStatus(status: string | number): boolean {
  const statusNum = typeof status === 'string' ? parseInt(status, 10) : status;
  return [1, 2, 3, 4].includes(statusNum);
}
