import { notificationApi } from "../api/notificationApi";
import { userManager } from "../api/userManager";
import { Notification } from "../models/Notification";

type NotificationCallback = (notification: Notification) => void;

class NotificationService {
  private listeners: NotificationCallback[] = [];

  subscribe(callback: NotificationCallback): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private emit(notification: Notification): void {
    this.listeners.forEach((cb) => cb(notification));
  }

  /** Utworzono nowy projekt (high, otrzymuje każdy admin) */
  notifyProjectCreated(projectName: string): void {
    const admins = userManager.getAdmins();
    admins.forEach((admin) => {
      const n = notificationApi.send({
        title: "Nowy projekt utworzony",
        message: `Utworzono nowy projekt: „${projectName}".`,
        prority: "high",
        recipientId: admin.id,
      });
      this.emit(n);
    });
  }

  /** Nowy użytkownik w systemie (high, otrzymuje każdy admin) */
  notifyUserRegistered(userFullName: string, userEmail: string): void {
    const admins = userManager.getAdmins();
    admins.forEach((admin) => {
      const n = notificationApi.send({
        title: "Nowe konto w systemie",
        message: `Utworzono nowe konto użytkownika: ${userFullName} (${userEmail}).`,
        prority: "high",
        recipientId: admin.id,
      });
      this.emit(n);
    });
  }

  /** Przypisanie osoby do historyjki/zadania (high) */
  notifyUserAssigned(
    userName: string,
    itemName: string,
    itemType: "zadanie" | "historyjka",
    recipientId: string
  ): void {
    const n = notificationApi.send({
      title: `Przypisano do ${itemType === "zadanie" ? "zadania" : "historyjki"}`,
      message: `${userName} został(a) przypisany(a) do ${itemType === "zadanie" ? "zadania" : "historyjki"}: „${itemName}".`,
      prority: "high",
      recipientId,
    });
    this.emit(n);
  }

  /** Nowe zadanie w historyjce (medium, otrzymuje właściciel historyjki) */
  notifyTaskCreated(taskName: string, storyName: string, storyOwnerId: string): void {
    const n = notificationApi.send({
      title: "Nowe zadanie w historyjce",
      message: `Dodano nowe zadanie „${taskName}" do historyjki „${storyName}".`,
      prority: "medium",
      recipientId: storyOwnerId,
    });
    this.emit(n);
  }

  /** Usunięcie zadania z historyjki (medium, otrzymuje właściciel historyjki) */
  notifyTaskDeleted(taskName: string, storyName: string, storyOwnerId: string): void {
    const n = notificationApi.send({
      title: "Usunięto zadanie z historyjki",
      message: `Zadanie „${taskName}" zostało usunięte z historyjki „${storyName}".`,
      prority: "medium",
      recipientId: storyOwnerId,
    });
    this.emit(n);
  }

  /** Zmiana statusu zadania (done = medium, doing = low, otrzymuje właściciel historyjki) */
  notifyTaskStatusChanged(
    taskName: string,
    storyName: string,
    newStatus: "doing" | "done",
    storyOwnerId: string
  ): void {
    const statusLabel = newStatus === "done" ? "zakończone" : "w trakcie";
    const n = notificationApi.send({
      title: "Zmiana statusu zadania",
      message: `Zadanie „${taskName}" w historyjce „${storyName}" zostało oznaczone jako ${statusLabel}.`,
      prority: newStatus === "done" ? "medium" : "low",
      recipientId: storyOwnerId,
    });
    this.emit(n);
  }
}

export const notificationService = new NotificationService();
