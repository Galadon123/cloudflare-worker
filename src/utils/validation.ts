export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const hasEnrollmentExpired = (enrollmentDate: string | null): boolean => {
  if (!enrollmentDate) return false;

  const enrolled = new Date(enrollmentDate);
  const now = new Date();
  const daysDiff = (now.getTime() - enrolled.getTime()) / (1000 * 60 * 60 * 24);

  return daysDiff > 30;
};