export type ISOString = string;
export type UserID = string;

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: ISOString;
  prority: "low" | "medium" | "high";
  isRead: boolean;
  recipientId: UserID;
}
