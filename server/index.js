import express from 'express';
import nodemailer from 'nodemailer';
import fs from 'node:fs';
import path from 'node:path';
import { randomBytes, randomInt, scrypt as scryptCallback, createHmac, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH ? path.resolve(process.env.DB_PATH) : path.join(__dirname, 'data', 'db.json');
const app = express();
const PORT = Number(process.env.PORT || 4000);
const isProduction = process.env.NODE_ENV === 'production';
const authSecret = process.env.AUTH_SECRET || randomBytes(32).toString('hex');
const scrypt = promisify(scryptCallback);
const sessionLifetime = 1000 * 60 * 60 * 24 * 14;
const verificationLifetime = 10 * 60 * 1000;
const failedVerificationLimit = 5;
const hasSmtpSettings = Boolean(process.env.SMTP_HOST || process.env.SMTP_USER || process.env.SMTP_PASS);
const hasCompleteSmtpSettings = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
const hasResendSettings = Boolean(process.env.RESEND_API_KEY && process.env.FROM_EMAIL);

if (hasSmtpSettings && !hasCompleteSmtpSettings) {
  throw new Error('SMTP_HOST, SMTP_USER, and SMTP_PASS must all be configured to use SMTP email.');
}
if (hasCompleteSmtpSettings && (!Number.isInteger(Number(process.env.SMTP_PORT || 465)) || Number(process.env.SMTP_PORT || 465) < 1 || Number(process.env.SMTP_PORT || 465) > 65535)) {
  throw new Error('SMTP_PORT must be a valid TCP port number.');
}
if (isProduction && (!process.env.AUTH_SECRET || (!hasCompleteSmtpSettings && !hasResendSettings))) {
  throw new Error('Production requires AUTH_SECRET and a complete SMTP or Resend email configuration.');
}
const emailTransport = hasCompleteSmtpSettings
  ? nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : Number(process.env.SMTP_PORT || 465) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  })
  : null;

const seedQuestions = [
  { id: 'alg-1', domain: 'Algebra', skill: 'Linear equations', difficulty: 'Easy', prompt: 'Solve for x: 3x + 5 = 20.', choices: ['3', '5', '8', '15'], answer: '5', explanation: 'Subtract 5 from both sides to get 3x = 15, then divide by 3.' },
  { id: 'alg-2', domain: 'Algebra', skill: 'Systems of equations', difficulty: 'Medium', prompt: 'If x + y = 11 and x − y = 3, what is x?', choices: ['4', '7', '8', '14'], answer: '7', explanation: 'Add the equations to get 2x = 14, so x = 7.' },
  { id: 'alg-3', domain: 'Algebra', skill: 'Linear inequalities', difficulty: 'Medium', prompt: 'If 4x − 7 < 9, which statement must be true?', choices: ['x < 4', 'x > 4', 'x < 1/2', 'x > 1/2'], answer: 'x < 4', explanation: 'Add 7 to get 4x < 16, then divide by 4.' },
  { id: 'alg-4', domain: 'Algebra', skill: 'Linear equations', difficulty: 'Easy', prompt: 'What is the solution to 5x − 10 = 15?', choices: ['1', '3', '5', '25'], answer: '5', explanation: 'Add 10 to both sides, then divide 25 by 5.' },
  { id: 'alg-5', domain: 'Algebra', skill: 'Linear relationships', difficulty: 'Easy', prompt: 'A gym charges a $12 sign-up fee plus $8 per visit. Which expression gives the total cost for v visits?', choices: ['12v + 8', '8v + 12', '20v', '8(v + 12)'], answer: '8v + 12', explanation: 'The $8 visit fee is multiplied by v, then the $12 fee is added.' },
  { id: 'adv-1', domain: 'Advanced Math', skill: 'Quadratic equations', difficulty: 'Easy', prompt: 'What are the solutions to x² − 5x + 6 = 0?', choices: ['x = 1 and x = 6', 'x = 2 and x = 3', 'x = −2 and x = −3', 'x = 0 and x = 5'], answer: 'x = 2 and x = 3', explanation: 'Factor the expression as (x − 2)(x − 3) = 0.' },
  { id: 'adv-2', domain: 'Advanced Math', skill: 'Functions', difficulty: 'Easy', prompt: 'If f(x) = 2x² − 3, what is f(2)?', choices: ['2', '5', '8', '11'], answer: '5', explanation: 'Substitute 2 for x: 2(2²) − 3 = 8 − 3 = 5.' },
  { id: 'adv-3', domain: 'Advanced Math', skill: 'Exponential functions', difficulty: 'Medium', prompt: 'A bacteria culture starts with 200 cells and doubles every hour. How many cells are there after 3 hours?', choices: ['600', '800', '1,200', '1,600'], answer: '1,600', explanation: 'The amount is 200 × 2³ = 1,600.' },
  { id: 'adv-4', domain: 'Advanced Math', skill: 'Equivalent expressions', difficulty: 'Easy', prompt: 'Which expression is equivalent to 3(x + 4) − 2x?', choices: ['x + 12', '5x + 4', 'x + 4', '3x + 12'], answer: 'x + 12', explanation: 'Distribute 3, then combine like terms: 3x + 12 − 2x = x + 12.' },
  { id: 'adv-5', domain: 'Advanced Math', skill: 'Quadratic equations', difficulty: 'Medium', prompt: 'What is the vertex x-coordinate of y = (x − 3)² + 2?', choices: ['−3', '2', '3', '5'], answer: '3', explanation: 'In vertex form y = (x − h)² + k, the vertex x-coordinate is h.' },
  { id: 'data-1', domain: 'Problem-Solving & Data Analysis', skill: 'Percentages', difficulty: 'Easy', prompt: 'A $40 item is discounted by 25%. What is its sale price?', choices: ['$10', '$25', '$30', '$35'], answer: '$30', explanation: 'A 25% discount is $10, so the sale price is $40 − $10 = $30.' },
  { id: 'data-2', domain: 'Problem-Solving & Data Analysis', skill: 'Ratios and rates', difficulty: 'Medium', prompt: 'A car travels 150 miles in 3 hours at a constant speed. What is its speed in miles per hour?', choices: ['30', '45', '50', '60'], answer: '50', explanation: 'Speed equals distance divided by time: 150 ÷ 3 = 50 miles per hour.' },
  { id: 'data-3', domain: 'Problem-Solving & Data Analysis', skill: 'Statistics', difficulty: 'Medium', prompt: 'What is the mean of 4, 7, 9, and 12?', choices: ['7', '8', '9', '32'], answer: '8', explanation: 'Add the values and divide by 4: (4 + 7 + 9 + 12) ÷ 4 = 8.' },
  { id: 'data-4', domain: 'Problem-Solving & Data Analysis', skill: 'Proportions', difficulty: 'Easy', prompt: 'A recipe uses 3 cups of flour for 12 muffins. How many cups are needed for 20 muffins at the same rate?', choices: ['4', '5', '6', '8'], answer: '5', explanation: 'Each muffin uses 3 ÷ 12 = 1/4 cup. For 20 muffins, that is 5 cups.' },
  { id: 'data-5', domain: 'Problem-Solving & Data Analysis', skill: 'Probability', difficulty: 'Easy', prompt: 'A bag contains 3 red and 5 blue marbles. What is the probability of selecting a red marble?', choices: ['3/5', '3/8', '5/8', '1/3'], answer: '3/8', explanation: 'There are 3 red marbles out of 8 marbles total.' },
  { id: 'geo-1', domain: 'Geometry & Trigonometry', skill: 'Area', difficulty: 'Easy', prompt: 'A rectangle has a length of 9 and a width of 4. What is its area?', choices: ['13', '26', '36', '72'], answer: '36', explanation: 'Area of a rectangle is length × width: 9 × 4 = 36.' },
  { id: 'geo-2', domain: 'Geometry & Trigonometry', skill: 'Right triangles', difficulty: 'Medium', prompt: 'A right triangle has legs of length 6 and 8. What is the hypotenuse length?', choices: ['10', '12', '14', '48'], answer: '10', explanation: 'By the Pythagorean theorem, c² = 6² + 8² = 100, so c = 10.' },
  { id: 'geo-3', domain: 'Geometry & Trigonometry', skill: 'Circles', difficulty: 'Medium', prompt: 'A circle has a radius of 5. What is its circumference?', choices: ['5π', '10π', '25π', '50π'], answer: '10π', explanation: 'Circumference is 2πr, so 2π × 5 = 10π.' },
  { id: 'geo-4', domain: 'Geometry & Trigonometry', skill: 'Angles', difficulty: 'Easy', prompt: 'Two angles in a triangle measure 50° and 60°. What is the measure of the third angle?', choices: ['60°', '70°', '80°', '90°'], answer: '70°', explanation: 'Triangle angles total 180°, so 180 − 50 − 60 = 70°.' },
  { id: 'geo-5', domain: 'Geometry & Trigonometry', skill: 'Volume', difficulty: 'Easy', prompt: 'A rectangular prism is 3 units long, 4 units wide, and 5 units high. What is its volume?', choices: ['12', '20', '47', '60'], answer: '60', explanation: 'Volume is length × width × height: 3 × 4 × 5 = 60 cubic units.' }
];

function readDb() {
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  db.users ||= [];
  db.sessions ||= [];
  const seededIds = new Set(seedQuestions.map(question => question.id));
  db.questions = [...seedQuestions, ...(Array.isArray(db.questions) ? db.questions.filter(question => !seededIds.has(question.id)) : [])];
  db.users.forEach(user => {
    user.attempts ||= [];
    user.bookmarks ||= [];
    if (typeof user.notes === 'string') {
      user.notes = {
        folders: [{ id: 'general', name: 'General' }],
        notes: [{ id: randomBytes(8).toString('hex'), title: 'My study notes', body: user.notes, folderId: 'general', images: [], updatedAt: Date.now() }]
      };
    } else {
      user.notes ||= { folders: [{ id: 'general', name: 'General' }], notes: [] };
      user.notes.folders ||= [{ id: 'general', name: 'General' }];
      user.notes.notes ||= [];
    }
    user.avatar ||= { body: '#F4C95D', shirt: '#7D9D86', shoes: '#E47B5D', shirtStyle: 'crew', shirtPattern: 'none', decal: 'none' };
    user.avatar.shirtPattern ||= 'none';
    user.avatar.decal ||= 'none';
    user.membership ||= 'Free Fledgling';
  });
  return db;
}

function writeDb(db) {
  const tempPath = `${dbPath}.${process.pid}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(db, null, 2), { mode: 0o600 });
  fs.renameSync(tempPath, dbPath);
}

if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  writeDb({ users: [], sessions: [], questions: seedQuestions });
} else {
  const db = readDb();
  writeDb(db);
}

app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'same-origin',
    'X-Frame-Options': 'DENY',
    'Cache-Control': 'no-store'
  });
  next();
});
app.use(express.json({ limit: '5mb' }));
app.get('/api/session', (req, res) => {
  const user = getSessionUser(req, res);
  res.json(user ? { authenticated: true, profile: publicProfile(user) } : { authenticated: false });
});

const rateLimits = new Map();
function limitRequests(max, windowMs) {
  return (req, res, next) => {
    const key = `${req.path}:${req.ip}`;
    const now = Date.now();
    const entry = rateLimits.get(key);
    if (!entry || entry.resetAt <= now) {
      rateLimits.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    entry.count += 1;
    res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
    if (entry.count > max) return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    next();
  };
}

function cookieValue(req, name) {
  const cookie = req.headers.cookie?.split(';').map(value => value.trim()).find(value => value.startsWith(`${name}=`));
  return cookie ? cookie.slice(name.length + 1) : '';
}

function sessionCookie(res, token, expires) {
  const attributes = [`session=${token}`, 'HttpOnly', 'SameSite=Strict', 'Path=/', `Expires=${new Date(expires).toUTCString()}`];
  if (isProduction) attributes.push('Secure');
  res.set('Set-Cookie', attributes.join('; '));
}

function clearSessionCookie(res) {
  res.set('Set-Cookie', 'session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
}

function publicProfile(user) {
  const today = new Date().toISOString().slice(0, 10);
  const questionsSolved = user.attempts.length;
  const correct = user.attempts.filter(attempt => attempt.correct).length;
  const todayCompleted = user.attempts.filter(attempt => attempt.date === today).length;
  const dailyXp = user.attempts.filter(attempt => attempt.date === today).reduce((total, attempt) => total + (attempt.correct ? 15 : 5), 0);
  const xp = user.xp || 0;
  const level = xp >= 1800 ? 'SAT Superstar' : xp >= 1000 ? 'Silver Rooster' : xp >= 500 ? 'Golden Chick' : xp >= 200 ? 'Curious Chick' : 'Fresh Hatchling';
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    questionsSolved,
    accuracy: questionsSolved ? Math.round((correct / questionsSolved) * 100) : 0,
    todayCompleted,
    dailyXp,
    dailyGoal: 15,
    streak: user.streak || 0,
    xp,
    level,
    membership: user.membership,
    avatar: user.avatar,
    estimatedScore: null
  };
}

function getSessionUser(req, res) {
  const token = cookieValue(req, 'session');
  if (!token) return null;
  const tokenHash = createHmac('sha256', authSecret).update(token).digest('hex');
  const db = readDb();
  const session = db.sessions.find(item => safeEqual(item.tokenHash, tokenHash) && item.expiresAt > Date.now());
  const user = session && db.users.find(item => item.id === session.userId && item.verifiedAt);
  if (!user) {
    clearSessionCookie(res);
    return null;
  }
  return user;
}

function requireAuth(req, res, next) {
  const user = getSessionUser(req, res);
  if (!user) return res.status(401).json({ error: 'Please sign in to continue.' });
  req.user = user;
  next();
}

const asyncRoute = handler => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

function safeEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && timingSafeEqual(a, b);
}

function validEmail(email) {
  return typeof email === 'string' && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function hashPassword(password) {
  const salt = randomBytes(16);
  const derivedKey = await scrypt(password, salt, 64);
  return `${salt.toString('hex')}:${derivedKey.toString('hex')}`;
}

async function verifyPassword(password, stored) {
  const [saltHex, hashHex] = (stored || '').split(':');
  if (!saltHex || !hashHex) return false;
  const derivedKey = await scrypt(password, Buffer.from(saltHex, 'hex'), 64);
  return safeEqual(derivedKey.toString('hex'), hashHex);
}

function verificationHash(userId, code) {
  return createHmac('sha256', authSecret).update(`${userId}:${code}`).digest('hex');
}

async function deliverVerification(email, code, purpose = 'verification') {
  const subject = purpose === 'password reset' ? 'Your ChickenSAT password reset code' : 'Your ChickenSAT verification code';
  const message = `Your ${purpose} code is ${code}. It expires in 10 minutes. If you did not request this, you can ignore this email.`;
  if (emailTransport) {
    await emailTransport.sendMail({
      from: process.env.FROM_EMAIL || { name: 'ChickenSAT', address: process.env.SMTP_USER },
      to: email,
      subject,
      text: message
    });
    return;
  }
  if (!process.env.RESEND_API_KEY) {
    if (isProduction) throw new Error('Verification email delivery is not configured.');
    console.info(`[ChickenSAT development ${purpose}] ${email}: ${code}`);
    return;
  }
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.FROM_EMAIL,
      to: [email],
      subject,
      text: message
    })
  });
  if (!response.ok) throw new Error(`Email provider returned ${response.status}.`);
}

async function resendVerification(db, user) {
  const previousVerification = user.verification;
  const retryAfterSeconds = Math.max(0, Math.ceil(((previousVerification?.lastSentAt || 0) + 60_000 - Date.now()) / 1000));
  if (retryAfterSeconds > 0) return { sent: false, retryAfterSeconds };

  const code = String(randomInt(100000, 1000000));
  user.verification = {
    codeHash: verificationHash(user.id, code),
    expiresAt: Date.now() + verificationLifetime,
    attempts: 0,
    lastSentAt: previousVerification?.lastSentAt || 0
  };
  writeDb(db);
  try {
    await deliverVerification(user.email, code);
    user.verification.lastSentAt = Date.now();
    writeDb(db);
    return { sent: true, retryAfterSeconds: 60 };
  } catch (error) {
    if (previousVerification) user.verification = previousVerification;
    else delete user.verification;
    writeDb(db);
    throw error;
  }
}

function issueSession(db, user, res) {
  const token = randomBytes(32).toString('hex');
  const expiresAt = Date.now() + sessionLifetime;
  db.sessions = db.sessions.filter(session => session.expiresAt > Date.now());
  db.sessions.push({ tokenHash: createHmac('sha256', authSecret).update(token).digest('hex'), userId: user.id, expiresAt });
  writeDb(db);
  sessionCookie(res, token, expiresAt);
}

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'ChickenSAT API' }));

app.post('/api/auth/signup', limitRequests(5, 15 * 60 * 1000), asyncRoute(async (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = req.body.password;
  if (name.length < 1 || name.length > 60 || !validEmail(email) || typeof password !== 'string' || password.length < 12 || password.length > 128) {
    return res.status(400).json({ error: 'Enter a name, valid email, and password of at least 12 characters.' });
  }
  const db = readDb();
  const existingUser = db.users.find(user => user.email === email);
  if (existingUser?.verifiedAt) return res.status(409).json({ error: 'This email already has an account. Please sign in.' });
  if (existingUser) {
    try {
      const result = await resendVerification(db, existingUser);
      const message = result.sent
        ? 'A new verification code was sent. Check your email.'
        : `A code was sent recently. Please wait ${result.retryAfterSeconds} seconds before requesting another.`;
      return res.status(202).json({ message, retryAfterSeconds: result.retryAfterSeconds });
    } catch (error) {
      console.error('Verification email could not be delivered:', error.message);
      return res.status(503).json({ error: 'Could not send the verification email. Please try again shortly.' });
    }
  }
  const user = {
    id: randomBytes(16).toString('hex'),
    name,
    email,
    passwordHash: await hashPassword(password),
    verifiedAt: null,
    attempts: [],
    xp: 0,
    streak: 0,
    lastActive: null,
    membership: 'Free Fledgling',
    avatar: { body: '#F4C95D', shirt: '#7D9D86', shoes: '#E47B5D', shirtStyle: 'crew' }
  };
  const code = String(randomInt(100000, 1000000));
  user.verification = { codeHash: verificationHash(user.id, code), expiresAt: Date.now() + verificationLifetime, attempts: 0, lastSentAt: Date.now() };
  db.users.push(user);
  writeDb(db);
  try {
    await deliverVerification(email, code);
  } catch (error) {
    db.users = db.users.filter(item => item.id !== user.id);
    writeDb(db);
    console.error('Verification email could not be delivered:', error.message);
    return res.status(503).json({ error: 'Could not send the verification email. Please try again shortly.' });
  }
  res.status(202).json({ message: 'Verification code sent. Check your email, or the server terminal in local development.', retryAfterSeconds: 60 });
}));

app.post('/api/auth/verify', limitRequests(10, 15 * 60 * 1000), asyncRoute(async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const code = typeof req.body.code === 'string' ? req.body.code.trim() : '';
  if (!validEmail(email) || !/^\d{6}$/.test(code)) return res.status(400).json({ error: 'Enter the email and six-digit code.' });
  const db = readDb();
  const user = db.users.find(item => item.email === email && !item.verifiedAt);
  if (!user?.verification || user.verification.expiresAt <= Date.now() || user.verification.attempts >= failedVerificationLimit) {
    return res.status(400).json({ error: 'That code is invalid or expired. Request a new code.' });
  }
  user.verification.attempts += 1;
  const expected = verificationHash(user.id, code);
  if (!safeEqual(expected, user.verification.codeHash)) {
    writeDb(db);
    return res.status(400).json({ error: 'That code is invalid or expired. Request a new code.' });
  }
  user.verifiedAt = Date.now();
  delete user.verification;
  issueSession(db, user, res);
  res.json({ profile: publicProfile(user) });
}));

app.post('/api/auth/resend-verification', limitRequests(3, 15 * 60 * 1000), asyncRoute(async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const db = readDb();
  const user = db.users.find(item => item.email === email && !item.verifiedAt);
  if (user) {
    try {
      const result = await resendVerification(db, user);
      return res.json({
        message: result.sent ? 'A new verification code was sent.' : `A code was sent recently. Please wait ${result.retryAfterSeconds} seconds before requesting another.`,
        retryAfterSeconds: result.retryAfterSeconds
      });
    } catch (error) {
      console.error('Verification email could not be delivered:', error.message);
      return res.status(503).json({ error: 'Could not send the verification email. Please try again shortly.' });
    }
  }
  res.json({ message: 'If an unverified account exists, a new code has been sent.', retryAfterSeconds: 0 });
}));

app.post('/api/auth/forgot-password', limitRequests(5, 15 * 60 * 1000), asyncRoute(async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const db = readDb();
  const user = validEmail(email) && db.users.find(item => item.email === email && item.verifiedAt);
  if (user) {
    const lastSentAt = user.passwordReset?.lastSentAt || 0;
    if (lastSentAt + 60_000 <= Date.now()) {
      const code = String(randomInt(100000, 1000000));
      const previousReset = user.passwordReset;
      user.passwordReset = {
        codeHash: verificationHash(user.id, `password-reset:${code}`),
        expiresAt: Date.now() + verificationLifetime,
        attempts: 0,
        lastSentAt
      };
      writeDb(db);
      try {
        await deliverVerification(email, code, 'password reset');
        user.passwordReset.lastSentAt = Date.now();
        writeDb(db);
      } catch (error) {
        if (previousReset) user.passwordReset = previousReset;
        else delete user.passwordReset;
        writeDb(db);
        console.error('Password reset email could not be delivered:', error.message);
        return res.status(503).json({ error: 'Could not send the password reset email. Please try again shortly.' });
      }
    }
  }
  res.json({ message: 'If a verified account exists for that email, a password reset code has been sent.', retryAfterSeconds: 60 });
}));

app.post('/api/auth/reset-password', limitRequests(10, 15 * 60 * 1000), asyncRoute(async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const code = typeof req.body.code === 'string' ? req.body.code.trim() : '';
  const password = req.body.password;
  if (!validEmail(email) || !/^\d{6}$/.test(code) || typeof password !== 'string' || password.length < 12 || password.length > 128) {
    return res.status(400).json({ error: 'Enter the email, six-digit code, and a password of at least 12 characters.' });
  }
  const db = readDb();
  const user = db.users.find(item => item.email === email && item.verifiedAt);
  const reset = user?.passwordReset;
  if (!reset || reset.expiresAt <= Date.now() || reset.attempts >= failedVerificationLimit) {
    return res.status(400).json({ error: 'That reset code is invalid or expired. Request a new code.' });
  }
  reset.attempts += 1;
  const expected = verificationHash(user.id, `password-reset:${code}`);
  if (!safeEqual(expected, reset.codeHash)) {
    writeDb(db);
    return res.status(400).json({ error: 'That reset code is invalid or expired. Request a new code.' });
  }
  user.passwordHash = await hashPassword(password);
  delete user.passwordReset;
  db.sessions = db.sessions.filter(session => session.userId !== user.id);
  writeDb(db);
  res.json({ message: 'Password updated. Sign in using your new password.' });
}));

app.post('/api/auth/login', limitRequests(10, 15 * 60 * 1000), asyncRoute(async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = req.body.password;
  const db = readDb();
  const user = db.users.find(item => item.email === email);
  if (!user || typeof password !== 'string' || !await verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Email or password is incorrect.' });
  }
  if (!user.verifiedAt) return res.status(403).json({ error: 'Please verify your email before signing in.', needsVerification: true });
  issueSession(db, user, res);
  res.json({ profile: publicProfile(user) });
}));

app.post('/api/auth/logout', requireAuth, (req, res) => {
  const token = cookieValue(req, 'session');
  const tokenHash = createHmac('sha256', authSecret).update(token).digest('hex');
  const db = readDb();
  db.sessions = db.sessions.filter(session => !safeEqual(session.tokenHash, tokenHash));
  writeDb(db);
  clearSessionCookie(res);
  res.json({ ok: true });
});

app.get('/api/me', requireAuth, (req, res) => res.json({ profile: publicProfile(req.user) }));

app.get('/api/questions', (_req, res) => {
  const questions = readDb().questions.map(({ answer, explanation, ...question }) => question);
  res.json({ total: questions.length, questions });
});

app.get('/api/profile', requireAuth, (req, res) => res.json(publicProfile(req.user)));

app.get('/api/study-data', requireAuth, (req, res) => res.json({
  bookmarks: req.user.bookmarks || [],
  notes: req.user.notes || { folders: [{ id: 'general', name: 'General' }], notes: [] },
  attempts: req.user.attempts.map(({ questionId, correct, date }) => ({ questionId, correct, date }))
}));

app.put('/api/bookmarks', requireAuth, (req, res) => {
  const { questionId, bookmarked } = req.body;
  if (typeof questionId !== 'string' || typeof bookmarked !== 'boolean' || !readDb().questions.some(question => question.id === questionId)) {
    return res.status(400).json({ error: 'A valid question and bookmark state are required.' });
  }
  const db = readDb();
  const user = db.users.find(item => item.id === req.user.id);
  user.bookmarks ||= [];
  user.bookmarks = bookmarked
    ? [...new Set([...user.bookmarks, questionId])]
    : user.bookmarks.filter(id => id !== questionId);
  writeDb(db);
  res.json({ bookmarks: user.bookmarks });
});

app.put('/api/notes', requireAuth, (req, res) => {
  const { folders, notes } = req.body.notes || {};
  if (!Array.isArray(folders) || folders.length > 100 || !Array.isArray(notes) || notes.length > 500) {
    return res.status(400).json({ error: 'Notes must contain a valid folder list and no more than 500 notes.' });
  }
  const folderIds = new Set();
  for (const folder of folders) {
    if (!folder || typeof folder.id !== 'string' || !/^[\w-]{1,80}$/.test(folder.id)
      || typeof folder.name !== 'string' || !folder.name.trim() || folder.name.length > 60 || folderIds.has(folder.id)) {
      return res.status(400).json({ error: 'Each folder needs a unique ID and a name of 1 to 60 characters.' });
    }
    folderIds.add(folder.id);
  }
  let totalImageBytes = 0;
  const normalizedNotes = [];
  const noteIds = new Set();
  for (const note of notes) {
    if (!note || typeof note.id !== 'string' || !/^[\w-]{1,80}$/.test(note.id) || noteIds.has(note.id)
      || typeof note.title !== 'string' || note.title.length > 120
      || typeof note.body !== 'string' || note.body.length > 50_000
      || typeof note.folderId !== 'string' || !folderIds.has(note.folderId)
      || !Array.isArray(note.images) || note.images.length > 5) {
      return res.status(400).json({ error: 'Each note needs a valid title, body, folder, and up to five images.' });
    }
    const images = [];
    for (const image of note.images) {
      const match = typeof image === 'string' && image.match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]*={0,2})$/);
      if (!match) return res.status(400).json({ error: 'Note images must be PNG, JPEG, or WebP files.' });
      const imageBytes = Buffer.from(match[2], 'base64');
      if (imageBytes.length > 1_000_000) return res.status(400).json({ error: 'Each note image must be 1 MB or smaller.' });
      totalImageBytes += imageBytes.length;
      if (totalImageBytes > 3_000_000) return res.status(400).json({ error: 'Total note images must be 3 MB or smaller.' });
      images.push(image);
    }
    noteIds.add(note.id);
    normalizedNotes.push({
      id: note.id,
      title: note.title.trim() || 'Untitled note',
      body: note.body,
      folderId: note.folderId,
      images,
      updatedAt: Date.now()
    });
  }
  const db = readDb();
  const user = db.users.find(item => item.id === req.user.id);
  user.notes = { folders, notes: normalizedNotes };
  writeDb(db);
  res.json({ notes: user.notes });
});

app.patch('/api/profile', requireAuth, (req, res) => {
  const avatar = req.body.avatar;
  if (!avatar || typeof avatar !== 'object' || Array.isArray(avatar)) return res.status(400).json({ error: 'A valid avatar is required.' });
  const allowedColors = new Set(['#F4C95D', '#F2B9A8', '#FFF0D5', '#C8D5BE', '#B9C6E4', '#7D9D86', '#E47B5D', '#7E8DBD', '#D99ECA', '#2E342B', '#F0D46D', '#6B86A8', '#F7F1E5', '#4A5C8A', '#C76876', '#5A7961']);
  const current = req.user.avatar;
  const next = {
    body: avatar.body ?? current.body,
    shirt: avatar.shirt ?? current.shirt,
    shoes: avatar.shoes ?? current.shoes,
    shirtStyle: avatar.shirtStyle ?? current.shirtStyle,
    shirtPattern: avatar.shirtPattern ?? current.shirtPattern ?? 'none',
    decal: avatar.decal ?? current.decal ?? 'none'
  };
  const shirtUnlocks = { '#4A5C8A': 250, '#C76876': 500, '#5A7961': 750 };
  const styleUnlocks = { crew: 0, pocket: 100, stripes: 200 };
  const patternUnlocks = { none: 0, dots: 400, stars: 700 };
  const decalUnlocks = { none: 0, chick: 500, lightning: 900 };
  const xp = req.user.xp || 0;
  const shirtLocked = (shirtUnlocks[next.shirt] || 0) > xp;
  if (![next.body, next.shirt, next.shoes].every(color => allowedColors.has(color))
    || !Object.hasOwn(styleUnlocks, next.shirtStyle) || styleUnlocks[next.shirtStyle] > xp
    || !Object.hasOwn(patternUnlocks, next.shirtPattern) || patternUnlocks[next.shirtPattern] > xp
    || !Object.hasOwn(decalUnlocks, next.decal) || decalUnlocks[next.decal] > xp || shirtLocked) {
    return res.status(400).json({ error: 'The selected avatar options are not valid.' });
  }
  const db = readDb();
  const user = db.users.find(item => item.id === req.user.id);
  user.avatar = next;
  writeDb(db);
  res.json(publicProfile(user));
});

app.post('/api/attempts', requireAuth, (req, res) => {
  const { questionId, answer } = req.body;
  if (typeof questionId !== 'string' || typeof answer !== 'string') return res.status(400).json({ error: 'A question and answer are required.' });
  const db = readDb();
  const question = db.questions.find(item => item.id === questionId);
  const user = db.users.find(item => item.id === req.user.id);
  if (!question || !question.choices.includes(answer)) return res.status(400).json({ error: 'That question or answer is not valid.' });
  const correct = answer === question.answer;
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  user.streak = user.lastActive === today ? (user.streak || 0) : user.lastActive === yesterday ? (user.streak || 0) + 1 : 1;
  user.lastActive = today;
  user.xp = (user.xp || 0) + (correct ? 15 : 5);
  user.attempts.push({ questionId, correct, date: today, createdAt: Date.now() });
  writeDb(db);
  res.json({ correct, answer: question.answer, explanation: question.explanation, profile: publicProfile(user) });
});

app.get('/api/activity', requireAuth, (req, res) => {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_value, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      count: req.user.attempts.filter(attempt => attempt.date === key).length
    };
  });
  res.json(days);
});

const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

app.use((error, _req, res, _next) => {
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body is too large.' });
  }
  console.error('Request failed:', error);
  if (!res.headersSent) res.status(500).json({ error: 'The request could not be completed.' });
});

app.listen(PORT, () => console.log(`ChickenSAT API listening on http://localhost:${PORT}`));
