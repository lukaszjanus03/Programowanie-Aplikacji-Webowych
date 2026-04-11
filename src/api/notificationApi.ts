import { Notification } from "../models/Notification";

const STORAGE_KEY = "manageme_notifications";

class NotificationApi {
  getAll(): Notification[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Notification[]) : [];
    } catch {
      return [];
    }
  }

  getByRecipient(recipientId: string): Notification[] {
    return this.getAll()
      .filter((n) => n.recipientId === recipientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  getById(id: string): Notification | undefined {
    return this.getAll().find((n) => n.id === id);
  }

  getUnreadCount(recipientId: string): number {
    return this.getByRecipient(recipientId).filter((n) => !n.isRead).length;
  }

  private save(notifications: Notification[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }

  send(data: Omit<Notification, "id" | "date" | "isRead">): Notification {
    const notifications = this.getAll();
    const newNotification: Notification = {
      id: crypto.randomUUID(),
      title: data.title,
      message: data.message,
      date: new Date().toISOString(),
      prority: data.prority,
      isRead: false,
      recipientId: data.recipientId,
    };
    notifications.push(newNotification);
    this.save(notifications);
    return newNotification;
  }

  markAsRead(id: string): void {
    const notifications = this.getAll();
    const idx = notifications.findIndex((n) => n.id === id);
    if (idx !== -1) {
      notifications[idx] = { ...notifications[idx], isRead: true };
      this.save(notifications);
    }
  }

  markAllAsRead(recipientId: string): void {
    const notifications = this.getAll();
    const updated = notifications.map((n) =>
      n.recipientId === recipientId ? { ...n, isRead: true } : n
    );
    this.save(updated);
  }

  delete(id: string): void {
    const notifications = this.getAll().filter((n) => n.id !== id);
    this.save(notifications);
  }
}

export const notificationApi = new NotificationApi();
