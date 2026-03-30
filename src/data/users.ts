export type UserRole = "student" | "teacher" | "admin";

export interface User {
  email: string;
  password: string;
  role: UserRole;
  name: string;
}

export const users: User[] = [
  {
    email: "user1@aqbobek.kz",
    password: "123",
    role: "student",
    name: "Айдар Нурланов",
  },
  {
    email: "teacher1@aqbobek.kz",
    password: "123",
    role: "teacher",
    name: "Гульнар Аманова",
  },
  {
    email: "admin@aqbobek.kz",
    password: "123",
    role: "admin",
    name: "Администратор",
  },
];
