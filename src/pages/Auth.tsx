import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { z } from "zod";

const emailSchema = z.string().email("সঠিক ইমেইল দিন");
const passwordSchema = z.string().min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে");

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
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
            <img 
              src="/logo.jpeg" 
              alt="Right Net TV" 
              className="w-10 h-10 rounded-xl object-contain"
            />
            <span className="font-display font-bold text-xl gradient-text">Right Net TV</span>
          </div>
          <div>
            <CardTitle className="font-display text-2xl">অ্যাডমিন লগইন</CardTitle>
            <CardDescription>অ্যাডমিন প্যানেলে প্রবেশ করতে লগইন করুন</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
