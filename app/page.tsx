"use client";

import type React from "react";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowRight, Users, TrendingUp, Award, Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    reason: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitContactInquiry = useMutation(api.contacts.submitContactInquiry);

  const handleContactChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReasonChange = (value: string) => {
    setContactForm((prev) => ({
      ...prev,
      reason: value,
    }));
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !contactForm.name ||
      !contactForm.email ||
      !contactForm.reason ||
      !contactForm.message
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      await submitContactInquiry({
        name: contactForm.name,
        email: contactForm.email,
        phone: contactForm.phone || undefined,
        reason: contactForm.reason as "new_membership" | "support",
        message: contactForm.message,
      });

      toast.success(
        "Your inquiry has been submitted successfully! We'll get back to you soon."
      );

      // Reset form
      setContactForm({
        name: "",
        email: "",
        phone: "",
        reason: "",
        message: "",
      });
    } catch (error) {
      console.error("Error submitting contact inquiry:", error);
      toast.error("Failed to submit inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <Link className="flex items-center justify-center" href="#">
          <span className="font-bold text-xl sm:text-2xl text-primary">
            Wekeza
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="ml-auto hidden md:flex gap-4 lg:gap-6">
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="#about"
          >
            About
          </Link>

          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="#how-it-works"
          >
            How It Works
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="#contact"
          >
            Contact
          </Link>
        </nav>

        {/* Desktop Login Button */}
        <div className="ml-4 hidden md:block">
          <Link href="/dashboard">
            <Button size="sm">Member Login</Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="ml-auto md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white border-b shadow-lg md:hidden">
            <nav className="flex flex-col p-4 space-y-4">
              <Link
                className="text-sm font-medium hover:text-primary"
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>

              <Link
                className="text-sm font-medium hover:text-primary"
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link
                className="text-sm font-medium hover:text-primary"
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full">Member Login</Button>
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-8 sm:py-12 md:py-16 lg:py-24 xl:py-32 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4 text-center lg:text-left">
                <div className="space-y-3">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tighter leading-tight">
                    Wealth Building Through
                    <span className="text-primary block sm:inline">
                      {" "}
                      Collective Investments
                    </span>
                  </h1>
                  <p className="max-w-[600px] text-gray-600 text-base sm:text-lg md:text-xl mx-auto lg:mx-0">
                    Wekeza enables financial growth through group investments,
                    education, and secure strategies. Join a community committed
                    to prosperity.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <Link href="/dashboard" className="w-full sm:w-auto">
                    <Button size="lg" className="gap-2 w-full sm:w-auto">
                      Access Your Account
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="#about" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Replaced cards with a modern investment-themed image */}
              <div className="hidden md:flex justify-center items-center">
                <Image
                  src="/wekezaHeroo.png"
                  alt="Group investment growth visualization"
                  width={600}
                  height={600}
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section
          id="about"
          className="w-full py-8 sm:py-12 md:py-16 lg:py-24 xl:py-32"
        >
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter">
                About Wekeza Group
              </h2>
              <p className="mt-3 sm:mt-4 text-gray-600 text-base sm:text-lg md:text-xl max-w-3xl mx-auto px-4">
                Wekeza, meaning &ldquo;to invest&ldquo; in Swahili, represents
                our commitment to empowering communities through collective
                financial growth and education.
              </p>
            </div>
            <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="text-center px-4">
                <div className="rounded-full bg-primary/10 p-3 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                  <Award className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">
                  Our Mission
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  To democratize wealth building by providing accessible
                  investment opportunities and financial education to
                  underserved communities.
                </p>
              </div>
              <div className="text-center px-4">
                <div className="rounded-full bg-primary/10 p-3 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">
                  Community First
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  We believe in the power of collective action. Together, we can
                  achieve financial goals that would be difficult to reach
                  individually.
                </p>
              </div>
              <div className="text-center px-4 md:col-span-2 lg:col-span-1">
                <div className="rounded-full bg-primary/10 p-3 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">
                  Proven Results
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Our members have successfully built wealth through disciplined
                  saving, smart investing, and collaborative financial planning.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section
          id="how-it-works"
          className="w-full py-8 sm:py-12 md:py-16 lg:py-24 xl:py-32"
        >
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter">
                How Wekeza Works
              </h2>
              <p className="mt-3 sm:mt-4 text-gray-600 text-base sm:text-lg md:text-xl max-w-3xl mx-auto px-4">
                Our proven approach to collective wealth building through
                structured investment and education.
              </p>
            </div>
            <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
              <div className="text-center px-4">
                <div className="rounded-full bg-primary text-white p-3 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center text-lg sm:text-xl font-bold">
                  1
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">
                  Join the Community
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Become a registered member of Wekeza Group and gain access to
                  our exclusive investment platform and community resources.
                </p>
              </div>
              <div className="text-center px-4">
                <div className="rounded-full bg-primary text-white p-3 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center text-lg sm:text-xl font-bold">
                  2
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">
                  Contribute & Learn
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Make regular contributions to the collective investment pool
                  while participating in financial education workshops and
                  discussions.
                </p>
              </div>
              <div className="text-center px-4 md:col-span-3 lg:col-span-1">
                <div className="rounded-full bg-primary text-white p-3 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center text-lg sm:text-xl font-bold">
                  3
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">
                  Grow Together
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Watch your investments grow through collective
                  decision-making, professional management, and the power of
                  compound returns.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section
          id="contact"
          className="w-full py-8 sm:py-12 md:py-16 lg:py-24 xl:py-32 bg-gray-50"
        >
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter">
                Get In Touch
              </h2>
              <p className="mt-3 sm:mt-4 text-gray-600 text-base sm:text-lg md:text-xl max-w-3xl mx-auto px-4">
                Interested in joining Wekeza Group or need support? Send us a
                message and we&lsquo;ll get back to you.
              </p>
            </div>
            <div className="grid gap-6 sm:gap-8 md:grid-cols-2 max-w-4xl mx-auto">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">
                    Membership Access
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Already a member? Access your account to manage your
                    investments.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 text-sm sm:text-base">
                    Our platform is exclusively available to registered Wekeza
                    Group members. If you&lsquo;re already a member, click below
                    to access your account.
                  </p>
                  <Link href="/dashboard" className="block">
                    <Button className="w-full">
                      Member Login
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <p className="text-xs sm:text-sm text-gray-500">
                    For new membership inquiries, please use the contact form.
                  </p>
                </CardContent>
              </Card>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">
                    Send us a Message
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Fill out the form below and we&lsquo;ll respond as soon as
                    possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={contactForm.name}
                        onChange={handleContactChange}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={contactForm.email}
                        onChange={handleContactChange}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={contactForm.phone}
                        onChange={handleContactChange}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="reason">Reason for Contact</Label>
                      <Select
                        value={contactForm.reason}
                        onValueChange={handleReasonChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a reason" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new_membership">
                            New Membership Inquiry
                          </SelectItem>
                          <SelectItem value="support">
                            Support Request
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={contactForm.message}
                        onChange={handleContactChange}
                        placeholder="Please describe your inquiry or how we can help you..."
                        rows={4}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-4 sm:py-6 w-full border-t px-4 md:px-6 bg-white">
        <p className="text-xs text-gray-500 text-center sm:text-left">
          © {new Date().getFullYear()} Wekeza Inc. All rights reserved.
        </p>
        {/* <nav className="sm:ml-auto flex gap-4 sm:gap-6 justify-center sm:justify-end">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy Policy
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Member Agreement
          </Link>
        </nav> */}
      </footer>
    </div>
  );
}
