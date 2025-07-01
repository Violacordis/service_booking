export function generateShortCode(prefix = "SRV") {
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const timestamp = Date.now().toString(36).slice(-4).toUpperCase();
  return `${prefix}-${timestamp}${random}`;
}

function generateOtp(length = 6): string {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");
}

export function generateOtpCode(length = 6): string {
  return generateOtp(length);
}
