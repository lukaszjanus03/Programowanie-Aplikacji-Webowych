import { User } from "../models/User";

const MOCK_USER: User = {
  id: "user-001",
  firstName: "Łukasz",
  lastName: "Janus",
};

class UserManager {
  private currentUser: User = MOCK_USER;

  getLoggedUser(): User {
    return this.currentUser;
  }

  getFullName(): string {
    return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
  }
}

export const userManager = new UserManager();
