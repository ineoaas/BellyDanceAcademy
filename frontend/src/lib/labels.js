export const LEVELS = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
];

export function levelLabel(level) {
  return LEVELS.find((entry) => entry.value === level)?.label ?? level;
}

export const ROLE_LABELS = { STUDENT: "Student", INSTRUCTOR: "Instructor", ADMIN: "Admin" };

/** Where each role lands after signing in. */
export const DASHBOARD_PATH = { STUDENT: "/student", INSTRUCTOR: "/instructor", ADMIN: "/admin" };
