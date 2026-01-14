"use client";

import { useNotifications } from "./hooks/use-notifications";



export function NotificationListener() {
  useNotifications();
  return null;
}
