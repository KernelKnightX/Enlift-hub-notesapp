// __tests__/utils.test.js
// Sample unit tests

// Example test - validate email function
describe('Email Validation', () => {
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  test('valid email returns true', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
  });

  test('invalid email returns false', () => {
    expect(isValidEmail('invalid-email')).toBe(false);
  });

  test('email without @ returns false', () => {
    expect(isValidEmail('testexample.com')).toBe(false);
  });
});

// Example test - phone validation
describe('Phone Validation', () => {
  const isValidPhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    const nationalNumber = cleaned.startsWith('91') && cleaned.length === 12
      ? cleaned.slice(2)
      : cleaned;
    return nationalNumber.length === 10 && /^[6-9]\d{9}$/.test(nationalNumber);
  };

  test('valid 10-digit phone returns true', () => {
    expect(isValidPhone('9876543210')).toBe(true);
  });

  test('phone with country code returns true', () => {
    expect(isValidPhone('+919876543210')).toBe(true);
  });

  test('invalid phone returns false', () => {
    expect(isValidPhone('1234567890')).toBe(false);
  });
});

// Example test - calculate days until
describe('Date Calculations', () => {
  const daysUntil = (date) => {
    return Math.max(0, Math.ceil((new Date(date).getTime() - Date.now()) / 86400000));
  };

  test('future date returns positive days', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    expect(daysUntil(futureDate)).toBeGreaterThan(0);
  });

  test('past date returns 0', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 10);
    expect(daysUntil(pastDate)).toBe(0);
  });
});
