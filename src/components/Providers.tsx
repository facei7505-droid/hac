"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth";
import { StudentDataProvider } from "@/lib/student-data-context";
import { NotificationsProvider } from "@/lib/notifications-context";
import { ProfileProvider } from "@/lib/profile-context";
import { ToastProvider } from "@/lib/toast-context";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ProfileProvider>
        <StudentDataProvider>
          <NotificationsProvider>
            <ToastProvider>{children}</ToastProvider>
          </NotificationsProvider>
        </StudentDataProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}
