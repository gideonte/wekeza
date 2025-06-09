"use client";

import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <SignIn
        appearance={{
          elements: {
            footer: { display: "none" }, // Hides "Don't have an account? Sign up"
          },
        }}
      />
    </div>
  );
}
