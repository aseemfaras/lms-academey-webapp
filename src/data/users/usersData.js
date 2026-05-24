// Mock data: 50 users with roles Student, Instructor, Supporter
// status: Active | Inactive | Pending

const firstNames = [
  "Aditya", "Ananya", "Arjun", "Deepa", "Karthik", "Lakshmi", "Meera", "Rahul", "Priya", "Vikram",
  "Sneha", "Rohan", "Kavya", "Aarav", "Isha", "Neha", "Sanjay", "Pooja", "Rajesh", "Divya",
  "Anitha", "Suresh", "Kiran", "Manoj", "Latha", "Venkat", "Swathi", "Gopal", "Preeti", "Naveen",
  "Shruti", "Arun", "Vijay", "Anjali", "Sridhar", "Madhuri", "Kumar", "Rekha", "Prakash", "Sunita",
  "Ramesh", "Geeta", "Kavitha", "Murali", "Indira", "Srinivas", "Lalitha", "Chandra", "Bala", "Uma"
];

const lastNames = [
  "Joshi", "Gupta", "Mehta", "Iyer", "Nair", "Venkat", "Krishnan", "Sharma", "Patel", "Reddy",
  "Rao", "Singh", "Khan", "Pillai", "Menon", "Desai", "Kapoor", "Malhotra", "Chopra", "Verma",
  "Agarwal", "Sethi", "Bansal", "Goyal", "Tiwari", "Dubey", "Mishra", "Shukla", "Saxena", "Jain",
  "Bhatia", "Chandra", "Dutta", "Ghosh", "Mukherjee", "Banerjee", "Das", "Bose", "Roy", "Sinha",
  "Prasad", "Rao", "Reddy", "Nair", "Kumar", "Sharma", "Patel", "Gupta", "Mehta", "Iyer"
];

const emailDomains = ["company.com", "gmail.com", "outlook.com", "example.com", "academy.org"];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(startYear, endYear) {
  const start = new Date(startYear, 0, 1).getTime();
  const end = new Date(endYear, 11, 31).getTime();
  return new Date(start + Math.random() * (end - start));
}

function formatDate(d) {
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

// Role distribution: ~35 students, ~10 instructors, ~5 supporters
const rolePool = [
  ...Array(35).fill("Student"),
  ...Array(10).fill("Instructor"),
  ...Array(5).fill("Supporter")
];
for (let i = rolePool.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [rolePool[i], rolePool[j]] = [rolePool[j], rolePool[i]];
}

const users = [];
for (let i = 0; i < 50; i++) {
  const first = firstNames[i % firstNames.length];
  const last = lastNames[i % lastNames.length];
  const name = `${first} ${last}`;
  const role = rolePool[i];
  const statusPool = ["Active", "Active", "Active", "Inactive", "Pending"];
  const status = statusPool[Math.floor(Math.random() * statusPool.length)];

  let coursesEnrolled = 0;
  let coursesCompleted = 0;
  if (role === "Student") {
    coursesEnrolled = Math.floor(Math.random() * 6) + 1;
    coursesCompleted = Math.floor(Math.random() * (coursesEnrolled + 1));
  }
  const progress = coursesEnrolled === 0 ? 0 : Math.round((coursesCompleted / coursesEnrolled) * 100);

  const joined = randomDate(2024, 2025);
  const lastLogin = new Date(joined.getTime() + Math.random() * (Date.now() - joined.getTime()));
  const email = `${first.toLowerCase()}.${last.toLowerCase()}${i + 1}@${emailDomains[i % emailDomains.length]}`;

  users.push({
    id: i + 1,
    name,
    email,
    role,
    status,
    coursesCompleted,
    coursesEnrolled,
    progress,
    lastLogin: formatDate(lastLogin),
    joined: formatDate(joined),
    lastLoginDate: lastLogin,
    joinedDate: joined
  });
}

users.sort((a, b) => a.name.localeCompare(b.name));

export const usersData = users;

export function getUsersStats(data) {
  const total = data.length;
  const active = data.filter((u) => u.status === "Active").length;
  const inactiveBlocked = data.filter((u) => u.status === "Inactive").length;
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const newLast7 = data.filter((u) => u.joinedDate && u.joinedDate.getTime() >= sevenDaysAgo).length;
  return { total, active, inactiveBlocked, newLast7 };
}
