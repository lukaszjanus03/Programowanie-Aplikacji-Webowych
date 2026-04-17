import { Notification } from "../models/Notification";
import { store } from "../storage";

class NotificationApi {
  getAll(): Notification[] {
    return store.getAll<Notification>("notifications");
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

  /** Funkcja synchroniczna dla wygody UI — fire-and-forget zapis do store. */
  send(data: Omit<Notification, "id" | "date" | "isRead">): Notification {
    const newNotification: Notification = {
      id: crypto.randomUUID(),
      title: data.title,
      message: data.message,
      date: new Date().toISOString(),
      prority: data.prority,
      isRead: false,
      recipientId: data.recipientId,
    };
    // zapisujemy optymistycznie — store.upsert aktualizuje cache natychmiast
    void store.upsert("notifications", newNotification);
    return newNotification;
  }

  async markAsRead(id: string): Promise<void> {
    const existing = this.getById(id);
    if (!existing) return;
    await store.upsert("notifications", { ...existing, isRead: true });
  }

  async markAllAsRead(recipientId: string): Promise<void> {
    const toUpdate = this.getAll().filter((n) => n.recipientId === recipientId && !n.isRead);
    await Promise.all(
      toUpdate.map((n) => store.upsert("notifications", { ...n, isRead: true }))
    );
  }

  async delete(id: string): Promise<void> {
    await store.remove("notifications", id);
  }
}

export const notificationApi = new NotificationApi();
