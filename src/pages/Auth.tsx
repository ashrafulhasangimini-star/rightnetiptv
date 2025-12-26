import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Tv, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { z } from "zod";

const emailSchema = z.string().email("সঠিক ইমেইল দিন");
const passwordSchema = z.string().min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে");

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (user) {
    navigate("/admin");
    return null;
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Validate
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      toast.error(emailResult.error.errors[0].message);
      return;
    }
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      toast.error(passwordResult.error.errors[0].message);
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        toast.error("ইমেইল বা পাসওয়ার্ড সঠিক নয়");
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success("সফলভাবে লগইন হয়েছে!");
      navigate("/admin");
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;

    // Validate
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      toast.error(emailResult.error.errors[0].message);
      return;
    }
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      toast.error(passwordResult.error.errors[0].message);
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);

    if (error) {
      if (error.message.includes("User already registered")) {
        toast.error("এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট আছে");
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success("অ্যাকাউন্ট তৈরি হয়েছে! লগইন করুন।");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl" />

      <Card className="relative w-full max-w-md glass-card border-border/30">
        <CardHeader className="text-center space-y-4">
          <Link to="/" className="absolute top-4 left-4 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Tv className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl gradient-text">বাংলা IPTV</span>
          </div>
          <div>
            <CardTitle className="font-display text-2xl">অ্যাডমিন প্যানেল</CardTitle>
            <CardDescription>আপনার অ্যাকাউন্টে প্রবেশ করুন</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">লগইন</TabsTrigger>
              <TabsTrigger value="signup">রেজিস্টার</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">ইমেইল</Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    placeholder="admin@example.com"
                    required
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">পাসওয়ার্ড</Label>
                  <Input
                    id="signin-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="bg-background/50"
                  />
                </div>
                <Button type="submit" className="w-full" variant="gradient" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      প্রবেশ করা হচ্ছে...
                    </>
                  ) : (
                    "লগইন করুন"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">পূর্ণ নাম</Label>
                  <Input
                    id="signup-name"
                    name="fullName"
                    type="text"
                    placeholder="আপনার নাম"
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">ইমেইল</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="admin@example.com"
                    required
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">পাসওয়ার্ড</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="bg-background/50"
                  />
                </div>
                <Button type="submit" className="w-full" variant="gradient" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      তৈরি হচ্ছে...
                    </>
                  ) : (
                    "অ্যাকাউন্ট তৈরি করুন"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
