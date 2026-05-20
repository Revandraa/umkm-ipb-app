import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'local-users.json');

export function getUsers() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify([]));
  }
  const data = fs.readFileSync(dbPath, 'utf-8');
  return JSON.parse(data);
}

export function saveUsers(users: any[]) {
  fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));
}
