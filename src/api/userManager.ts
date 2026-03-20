import { User } from "../models/User";

export const MOCK_USERS: User[] = [
  {
    id: "user-001",
    firstName: "Łukasz",
    lastName: "Janus",
    role: "admin",
  },
  {
    id: "user-002",
    firstName: "Anna",
    lastName: "Kowalska",
    role: "developer",
  },
  {
    id: "user-003",
    firstName: "Piotr",
    lastName: "Nowak",
    role: "devops",
  },
  {
    id: "user-004",
    firstName: "Maria",
    lastName: "Wiśniewska",
    role: "developer",
  },
];

class UserManager {
  private currentUser: User = MOCK_USERS[0];

  getLoggedUser(): User {
    return this.currentUser;
  }

  getFullName(): string {
    return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
  }

  getAllUsers(): User[] {
    return MOCK_USERS;
  }

  getAssignableUsers(): User[] {
    return MOCK_USERS.filter((u) => u.role === "developer" || u.role === "devops");
  }

  getUserById(id: string): User | undefined {
    return MOCK_USERS.find((u) => u.id === id);
  }
}

export const userManager = new UserManager();
