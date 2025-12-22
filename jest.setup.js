process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'test-session';

jest.setTimeout(30000);
