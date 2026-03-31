export type UserRole = "student" | "teacher" | "admin" | "parent";

export interface User {
  email: string;
  password: string;
  role: UserRole;
  name: string;
  profileId: string;
}

export const users: User[] = [
  {
    email: "user1@aqbobek.kz",
    password: "123",
    role: "student",
    name: "Айдар Нурланов",
    profileId: "u1",
  },
  {
    email: "nurlan@aqbobek.kz",
    password: "123",
    role: "student",
    name: "Нурлан Оразов",
    profileId: "u2",
  },
  {
    email: "teacher1@aqbobek.kz",
    password: "123",
    role: "teacher",
    name: "Гульнар Аманова",
    profileId: "t1",
  },
  {
    email: "admin@aqbobek.kz",
    password: "123",
    role: "admin",
    name: "Администратор",
    profileId: "",
  },
  {
    email: "parent@aqbobek.kz",
    password: "123",
    role: "parent",
    name: "Нурлан Нурланов",
    profileId: "",
  },
];
