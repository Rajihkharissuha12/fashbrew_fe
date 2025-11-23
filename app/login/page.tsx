import { Metadata } from "next";
import LoginPageClient from "./loginPage";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Login",
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageClient />
    </Suspense>
  );
}
