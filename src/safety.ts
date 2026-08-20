const FINAL_ACTION_PATTERNS = [
  /place\s+order/i,
  /submit\s+order/i,
  /complete\s+purchase/i,
  /buy\s+now/i,
  /pay\s+now/i,
  /confirm\s+purchase/i,
  /confirm\s+payment/i,
  /send\s+payment/i
];

export function assertNotFinalAction(label: string, explicitlyAuthorized = false) {
  if (explicitlyAuthorized) return;
  if (FINAL_ACTION_PATTERNS.some((pattern) => pattern.test(label))) {
    throw new Error('Blocked final transaction action: explicit user authorization is required.');
  }
}
