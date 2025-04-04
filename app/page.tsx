import Link from "next/link";
import { ArrowRight, BarChart3, FileText, Shield, Users } from "lucide-react";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link className="flex items-center justify-center" href="#">
          <span className="font-bold text-2xl">Wekeza</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="#"
          >
            About
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="#"
          >
            Features
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="#"
          >
            Contact
          </Link>
        </nav>
        <div className="ml-4 flex items-center gap-2">
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="default" size="sm">
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Financial Empowerment Through Collective Investment
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    Join Wekeza Group to access collaborative investment
                    opportunities, financial education, and a supportive
                    community dedicated to building wealth together.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/dashboard">
                    <Button size="lg" className="gap-1">
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button size="lg" variant="outline">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-start gap-2 rounded-lg border p-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">
                      Financial Tracking
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Monitor investments, track returns, and visualize your
                      financial growth.
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-2 rounded-lg border p-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">Collaboration</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Connect with other members, share insights, and
                      participate in group investments.
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-2 rounded-lg border p-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">Document Storage</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Securely store and access important financial documents
                      and resources.
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-2 rounded-lg border p-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">Secure Access</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Your data is protected with enterprise-grade security and
                      authentication.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full border-t px-4 md:px-6">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2025 Wekeza Group Inc. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
