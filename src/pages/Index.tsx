import { useState } from "react";
import Header from "@/components/Header";
import ChannelCard from "@/components/ChannelCard";
import CategoryFilter from "@/components/CategoryFilter";
import VideoPlayer from "@/components/VideoPlayer";
import { mockChannels, mockCategories, mockStats } from "@/data/mockData";
import { Channel } from "@/types/channel";
import { Tv, Users, Radio, Layers } from "lucide-react";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

  const filteredChannels = selectedCategory
    ? mockChannels.filter((ch) => 
        mockCategories.find(c => c.id === selectedCategory)?.name === ch.category
      )
    : mockChannels;

  const stats = [
    { icon: Tv, label: "মোট চ্যানেল", value: mockStats.totalChannels },
    { icon: Radio, label: "লাইভ চ্যানেল", value: mockStats.liveChannels },
    { icon: Users, label: "দর্শক", value: mockStats.totalViewers },
    { icon: Layers, label: "ক্যাটাগরি", value: mockStats.categories },
  ];

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
            categories={mockCategories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

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

        {filteredChannels.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">এই ক্যাটাগরিতে কোনো চ্যানেল নেই।</p>
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
