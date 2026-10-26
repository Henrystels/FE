import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import jsonServer from 'json-server';
import jwt from 'jsonwebtoken';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, 'db.json');

const ACCESS_SECRET = 'todo-dev-access';
const REFRESH_SECRET = 'todo-dev-refresh';
const PORT = 3001;

function readDb() {
  return JSON.parse(readFileSync(dbPath, 'utf8'));
}

function writeDb(db) {
  writeFileSync(dbPath, `${JSON.stringify(db, null, 2)}\n`, 'utf8');
}

function publicUser(user) {
  const { password: _password, ...rest } = user;
  return rest;
}

function issueTokens(user) {
  const accessToken = jwt.sign({ sub: user.id, email: user.email }, ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ sub: user.id }, REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

function authUser(req) {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return null;
  }
  try {
    const payload = jwt.verify(token, ACCESS_SECRET);
    const db = readDb();
    const user = db.users.find((u) => u.id === payload.sub);
    return user ?? null;
  } catch {
    return null;
  }
}

const server = jsonServer.create();
const router = jsonServer.router(dbPath);

server.use(jsonServer.defaults({ noCors: false }));
server.use(jsonServer.bodyParser);

server.post('/auth/login', (req, res) => {
  const { email, password } = req.body ?? {};
  const db = readDb();
  const user = db.users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Неверный email или пароль' });
  }
  return res.json({ user: publicUser(user), tokens: issueTokens(user) });
});

server.post('/auth/register', (req, res) => {
  const { email, password, name } = req.body ?? {};
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Заполните все поля' });
  }
  const db = readDb();
  if (db.users.some((u) => u.email === email)) {
    return res.status(400).json({ message: 'Email уже занят' });
  }
  const id = db.users.reduce((max, u) => Math.max(max, u.id), 0) + 1;
  const user = {
    id,
    email,
    password,
    name,
    settings: { theme: 'light', emailNotifications: true },
  };
  db.users.push(user);
  writeDb(db);
  return res.status(201).json({ user: publicUser(user), tokens: issueTokens(user) });
});

server.get('/auth/email-available', (req, res) => {
  const email = String(req.query.email ?? '');
  const db = readDb();
  const available = !db.users.some((u) => u.email === email);
  return res.json({ available });
});

server.post('/auth/refresh', (req, res) => {
  const { refreshToken } = req.body ?? {};
  if (!refreshToken) {
    return res.status(401).json({ message: 'Требуется refresh token' });
  }
  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);
    const db = readDb();
    const user = db.users.find((u) => u.id === payload.sub);
    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }
    const accessToken = jwt.sign({ sub: user.id, email: user.email }, ACCESS_SECRET, { expiresIn: '15m' });
    return res.json({ accessToken });
  } catch {
    return res.status(401).json({ message: 'Сессия истекла' });
  }
});

server.get('/users/me', (req, res) => {
  const user = authUser(req);
  if (!user) {
    return res.status(401).json({ message: 'Требуется авторизация' });
  }
  return res.json(publicUser(user));
});

server.use('/todos', (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  if (!authUser(req)) {
    return res.status(401).json({ message: 'Требуется авторизация' });
  }
  return next();
});

server.use(router);

server.listen(PORT, () => {
  console.log(`Mock API listening on http://localhost:${PORT}`);
});
