import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, Monitor, Tv, Apple, Chrome, CheckCircle, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isOpera, setIsOpera] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Check if Opera browser
    const isOperaBrowser = /OPR\/|Opera/.test(navigator.userAgent);
    setIsOpera(isOperaBrowser);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for app installed
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary/20 to-background py-16 px-4">
        <div className="container mx-auto text-center">
          <img 
            src="/logo.jpeg" 
            alt="Right NeT TV" 
            className="w-20 h-20 rounded-2xl mx-auto mb-6 object-contain bg-white"
          />
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Right NeT TV ইনস্টল করুন
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            আপনার ডিভাইসে অ্যাপ হিসেবে ইনস্টল করুন - দ্রুত অ্যাক্সেস, অফলাইন সাপোর্ট
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Already Installed */}
        {isInstalled && (
          <Card className="mb-8 border-green-500/50 bg-green-500/10">
            <CardContent className="py-6 flex items-center gap-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <h3 className="font-semibold text-green-500">ইতিমধ্যে ইনস্টল করা হয়েছে!</h3>
                <p className="text-muted-foreground">আপনার হোম স্ক্রিন থেকে অ্যাপটি খুলুন</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Install Button for Android/Desktop */}
        {deferredPrompt && !isInstalled && (
          <Card className="mb-8 border-primary/50 bg-primary/5">
            <CardContent className="py-6">
              <Button onClick={handleInstall} size="lg" className="w-full gap-2">
                <Download className="w-5 h-5" />
                এখনই ইনস্টল করুন
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Device Instructions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Android Phone/Tablet */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Android ফোন/ট্যাবলেট</CardTitle>
                  <CardDescription>Chrome ব্রাউজার</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li>১. Chrome-এ এই পেজ খুলুন</li>
                <li>২. মেনু বাটনে (⋮) ক্লিক করুন</li>
                <li>৩. "Install app" বা "Add to Home screen" সিলেক্ট করুন</li>
                <li>৪. "Install" বাটনে ক্লিক করুন</li>
              </ol>
            </CardContent>
          </Card>

          {/* Android TV */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Tv className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Android TV</CardTitle>
                  <CardDescription>Smart TV / TV Box</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li>১. Chrome/Puffin TV ব্রাউজার ইনস্টল করুন</li>
                <li>২. এই ওয়েবসাইট খুলুন</li>
                <li>৩. বুকমার্ক করুন বা শর্টকাট তৈরি করুন</li>
                <li>৪. ফুলস্ক্রিন মোডে ব্যবহার করুন</li>
              </ol>
            </CardContent>
          </Card>

          {/* iPhone/iPad */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-500/20 rounded-xl flex items-center justify-center">
                  <Apple className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">iPhone / iPad</CardTitle>
                  <CardDescription>Safari ব্রাউজার</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li>১. Safari-তে এই পেজ খুলুন</li>
                <li>২. Share বাটনে (↑) ট্যাপ করুন</li>
                <li>৩. "Add to Home Screen" সিলেক্ট করুন</li>
                <li>৪. "Add" বাটনে ট্যাপ করুন</li>
              </ol>
              {isIOS && (
                <div className="mt-4 p-3 bg-amber-500/10 rounded-lg">
                  <p className="text-xs text-amber-500">
                    💡 আপনি iOS ডিভাইসে আছেন - Safari ব্যবহার করুন
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Windows/Mac */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Monitor className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Windows / Mac</CardTitle>
                  <CardDescription>Chrome / Edge</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li>১. Chrome বা Edge-এ খুলুন</li>
                <li>২. অ্যাড্রেস বারে ইনস্টল আইকন (⊕) ক্লিক করুন</li>
                <li>৩. অথবা মেনু → "Install app" সিলেক্ট করুন</li>
                <li>৪. "Install" বাটনে ক্লিক করুন</li>
              </ol>
            </CardContent>
          </Card>

          {/* Chrome Browser */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                  <Chrome className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">যেকোনো Chrome</CardTitle>
                  <CardDescription>সব প্ল্যাটফর্ম</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li>১. URL বারে ইনস্টল আইকন দেখুন</li>
                <li>২. না থাকলে মেনু (⋮) → "Install"</li>
                <li>৩. পপআপে "Install" ক্লিক করুন</li>
                <li>৪. অ্যাপ আইকন স্বয়ংক্রিয়ভাবে তৈরি হবে</li>
              </ol>
            </CardContent>
          </Card>

          {/* Opera Browser */}
          <Card className={isOpera ? "border-red-500/50 ring-2 ring-red-500/20" : ""}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <Globe className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Opera ব্রাউজার</CardTitle>
                  <CardDescription>Desktop / Mobile</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li>১. Opera সেটিংস → Features খুলুন</li>
                <li>২. "Install apps" অপশন Enable করুন</li>
                <li>৩. এই পেজে ফিরে আসুন</li>
                <li>৪. অ্যাড্রেস বারে ইনস্টল (⊕) আইকনে ক্লিক করুন</li>
                <li>৫. অথবা মেনু (☰) → "Install" সিলেক্ট করুন</li>
              </ol>
              {isOpera && (
                <div className="mt-4 p-3 bg-red-500/10 rounded-lg">
                  <p className="text-xs text-red-400">
                    💡 আপনি Opera ব্রাউজারে আছেন - উপরের নির্দেশনা অনুসরণ করুন
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Back Button */}
        <div className="mt-12 text-center">
          <Button variant="outline" onClick={() => navigate("/")}>
            হোমে ফিরে যান
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Install;
