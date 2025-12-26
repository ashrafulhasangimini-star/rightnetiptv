import { useState } from "react";
import Header from "@/components/Header";
import ChannelCard from "@/components/ChannelCard";
import CategoryFilter from "@/components/CategoryFilter";
import VideoPlayer from "@/components/VideoPlayer";
import { useChannels } from "@/hooks/useChannels";
import { useCategories } from "@/hooks/useCategories";
import { Channel } from "@/types/channel";
import { Tv, Users, Radio, Layers, Loader2 } from "lucide-react";

const Index = () => {
  const { data: dbChannels, isLoading: channelsLoading } = useChannels();
  const { data: dbCategories, isLoading: categoriesLoading } = useCategories();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

  const isLoading = channelsLoading || categoriesLoading;

  // Transform DB channels to the Channel type used by UI components
  const channels: Channel[] = dbChannels?.map(ch => ({
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
  })) || [];

  // Transform DB categories
  const categories = dbCategories?.map(cat => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon || "📁",
    channelCount: channels.filter(ch => ch.category === cat.name).length,
  })) || [];

  const filteredChannels = selectedCategory
    ? channels.filter((ch) => 
        categories.find(c => c.id === selectedCategory)?.name === ch.category
      )
    : channels;

  const stats = [
    { icon: Tv, label: "মোট চ্যানেল", value: channels.length },
    { icon: Radio, label: "লাইভ চ্যানেল", value: channels.filter(ch => ch.isLive).length },
    { icon: Users, label: "দর্শক", value: channels.reduce((acc, ch) => acc + ch.viewers, 0) },
    { icon: Layers, label: "ক্যাটাগরি", value: categories.length },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">লোড হচ্ছে...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-12 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
        
        <div className="container relative px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="font-display font-bold text-4xl lg:text-6xl mb-4 animate-slide-up">
              সরাসরি দেখুন{" "}
              <span className="gradient-text">বাংলা টিভি</span>
            </h1>
            <p className="text-lg text-muted-foreground animate-slide-up" style={{ animationDelay: "0.1s" }}>
              বাংলাদেশের সেরা টিভি চ্যানেলগুলো এখন আপনার হাতের মুঠোয়। 
              সংবাদ, খেলাধুলা, বিনোদন - সবকিছু এক জায়গায়।
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: "0.2s" }}>
            {stats.map((stat, index) => (
              <div key={index} className="glass-card p-4 text-center">
                <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-display font-bold">{stat.value.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Channels Section */}
      <section className="container px-4 pb-12">
        <div className="mb-8">
          <h2 className="font-display font-bold text-2xl mb-6">চ্যানেল সমূহ</h2>
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {filteredChannels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredChannels.map((channel, index) => (
              <div 
                key={channel.id} 
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <ChannelCard
                  channel={channel}
                  onClick={setSelectedChannel}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 glass-card">
            <Tv className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {selectedCategory ? "এই ক্যাটাগরিতে কোনো চ্যানেল নেই।" : "কোনো চ্যানেল যোগ করা হয়নি।"}
            </p>
          </div>
        )}
      </section>

      {/* Video Player Modal */}
      {selectedChannel && (
        <VideoPlayer
          channel={selectedChannel}
          onClose={() => setSelectedChannel(null)}
        />
      )}
    </div>
  );
};

export default Index;
