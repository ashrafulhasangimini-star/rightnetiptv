import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import VideoPlayer from "@/components/VideoPlayer";
import { useChannels } from "@/hooks/useChannels";
import { useCategories } from "@/hooks/useCategories";
import { Channel } from "@/types/channel";
import { Play, Loader2, Tv, Radio, Download, Apple, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { data: dbChannels, isLoading: channelsLoading } = useChannels();
  const { data: dbCategories, isLoading: categoriesLoading } = useCategories();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const isLoading = channelsLoading || categoriesLoading;

  const channels: Channel[] = (dbChannels ?? []).map((ch) => ({
    id: ch.id,
    name: ch.name,
    logo: ch.logo_url || "/placeholder.svg",
    streamUrl: ch.stream_url,
    category: ch.category?.name || "অন্যান্য",
    description: ch.description || "",
    isLive: ch.is_live,
    viewers: ch.viewer_count,
    createdAt: new Date(ch.created_at),
    updatedAt: new Date(ch.updated_at),
  }));

  const categories = (dbCategories ?? []).map((cat) => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon || "📁",
    channelCount: channels.filter((ch) => ch.category === cat.name).length,
  }));

  const featured = channels.find((c) => c.isLive) || channels[0];

  const filteredChannels = useMemo(() => {
    let list = channels;
    if (selectedCategory) {
      const catName = categories.find((c) => c.id === selectedCategory)?.name;
      list = list.filter((ch) => ch.category === catName);
    }
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(
        (ch) =>
          ch.name.toLowerCase().includes(q) ||
          ch.category.toLowerCase().includes(q) ||
          ch.description?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [channels, categories, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero */}
        <section className="relative h-[420px] md:h-[540px] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden mb-12 group shadow-2xl shadow-black/50">
          {featured?.logo ? (
            <img
              src={featured.logo}
              alt={featured.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-card to-background" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/30 to-transparent" />

          <div className="absolute bottom-0 left-0 p-6 sm:p-10 md:p-16 w-full md:w-3/4">
            <div className="flex items-center gap-3 mb-5">
              <span className="bg-destructive text-destructive-foreground text-[11px] font-black tracking-widest px-3 py-1 rounded-md uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" /> সরাসরি
              </span>
              <span className="bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider">
                Right Net TV
              </span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-black mb-5 leading-[1.05] tracking-tight">
              {featured ? (
                <>
                  {featured.name} <br />
                  <span className="text-primary">সরাসরি</span>
                </>
              ) : (
                <>
                  সরাসরি দেখুন <br />
                  <span className="text-primary">Right Net TV</span>
                </>
              )}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mb-7 max-w-xl leading-relaxed">
              {featured?.description ||
                "বাংলাদেশের সেরা লাইভ টিভি চ্যানেলগুলো এখন আপনার হাতের মুঠোয়। বাফারিং ছাড়াই উপভোগ করুন।"}
            </p>

            {featured && (
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={() => setSelectedChannel(featured)}
                  className="px-8 sm:px-10 py-6 rounded-2xl font-bold text-base gap-3 shadow-xl shadow-primary/30"
                >
                  <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                    <Play className="w-5 h-5 fill-current" />
                  </div>
                  এখনই দেখুন
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Categories */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-primary rounded-full" />
              <h2 className="font-display text-2xl sm:text-3xl font-black">পছন্দসই ক্যাটাগরি</h2>
            </div>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`whitespace-nowrap px-6 sm:px-8 py-3 rounded-2xl font-bold text-sm transition-all ${
                selectedCategory === null
                  ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20"
                  : "bg-card/60 border border-border hover:border-primary/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              সব চ্যানেল
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap px-6 sm:px-8 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20"
                    : "bg-card/60 border border-border hover:border-primary/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </section>

        {/* Channel Grid */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-8 bg-primary rounded-full" />
            <h2 className="font-display text-2xl sm:text-3xl font-black">চ্যানেল সমূহ</h2>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-muted-foreground">লোড হচ্ছে...</p>
            </div>
          ) : filteredChannels.length === 0 ? (
            <div className="text-center py-20 bg-card/40 border border-border/60 rounded-3xl">
              <Tv className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {channels.length === 0
                  ? "এখনো কোনো চ্যানেল যোগ করা হয়নি।"
                  : "এই ফিল্টারে কোনো চ্যানেল নেই।"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {filteredChannels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel)}
                  className="group text-left"
                >
                  <div className="relative aspect-video rounded-2xl md:rounded-3xl overflow-hidden mb-4 bg-card border border-border/60 transition-all duration-500 group-hover:border-primary/50 group-hover:shadow-2xl group-hover:shadow-primary/20 group-hover:-translate-y-1">
                    <img
                      src={channel.logo}
                      alt={channel.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                    {channel.isLive && (
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-destructive text-destructive-foreground px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tight shadow-lg">
                        <span className="w-1 h-1 bg-white rounded-full animate-pulse" /> লাইভ
                      </div>
                    )}
                    {channel.viewers > 0 && (
                      <div className="absolute bottom-3 right-3 bg-background/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-muted-foreground">
                        {channel.viewers.toLocaleString()} দর্শক
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full flex items-center justify-center">
                        <Play className="w-6 h-6 text-white fill-current" />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 px-1">
                    <div className="w-12 h-12 rounded-2xl bg-card border border-border/60 p-2 flex-shrink-0 overflow-hidden">
                      <img src={channel.logo} alt="" className="w-full h-full object-cover rounded-md" />
                    </div>
                    <div className="flex-1 py-0.5 overflow-hidden">
                      <h3 className="font-bold text-base sm:text-lg group-hover:text-primary transition-colors truncate">
                        {channel.name}
                      </h3>
                      <p className="text-muted-foreground text-sm font-medium truncate">
                        {channel.category}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* App Download Banner */}
        <section className="bg-gradient-to-r from-primary/20 to-card border border-primary/20 rounded-[2rem] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="font-display text-xl sm:text-2xl font-bold mb-2">অ্যাপ ডাউনলোড করুন</h3>
            <p className="text-muted-foreground text-sm sm:text-base">
              যেকোনো সময় যেকোনো স্থানে আপনার প্রিয় চ্যানেল দেখুন মোবাইল অ্যাপে।
            </p>
          </div>
          <div className="flex gap-3 sm:gap-4 flex-wrap justify-center">
            <Link to="/install">
              <Button variant="secondary" className="rounded-xl gap-2 font-bold">
                <Smartphone className="w-5 h-5" /> অ্যান্ড্রয়েড
              </Button>
            </Link>
            <Link to="/install">
              <Button variant="outline" className="rounded-xl gap-2 font-bold">
                <Apple className="w-5 h-5" /> আইফোন
              </Button>
            </Link>
            <Link to="/install">
              <Button variant="ghost" className="rounded-xl gap-2 font-bold">
                <Download className="w-5 h-5" /> PWA
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 mb-8 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
          <Radio className="w-4 h-4 text-primary" />
          <span>© {new Date().getFullYear()} Right Net TV — লাইভ টিভি স্ট্রিমিং প্ল্যাটফর্ম</span>
        </footer>
      </main>

      {selectedChannel && (
        <VideoPlayer
          channel={selectedChannel}
          channels={channels}
          onClose={() => setSelectedChannel(null)}
          onChannelChange={setSelectedChannel}
        />
      )}
    </div>
  );
};

export default Index;
