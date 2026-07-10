const { createUser, findUserByEmail } = require("../lib/users");

const DEMO_ACCOUNTS = [
  { name: "Nadia Karim", email: "student@example.com", password: "student123", role: "student" },
  { name: "Amara Nour", email: "instructor@example.com", password: "instructor123", role: "instructor" },
  { name: "Site Admin", email: "admin@example.com", password: "admin123", role: "admin" },
];

for (const account of DEMO_ACCOUNTS) {
  if (findUserByEmail(account.email)) {
    console.log(`Skipping ${account.email} — already exists`);
    continue;
  }
  createUser(account);
  console.log(`Created ${account.role}: ${account.email} / ${account.password}`);
}
