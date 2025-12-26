import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import ChannelTable from "@/components/admin/ChannelTable";
import ChannelForm from "@/components/admin/ChannelForm";
import { mockChannels } from "@/data/mockData";
import { Channel } from "@/types/channel";
import { toast } from "sonner";

const Channels = () => {
  const [channels, setChannels] = useState(mockChannels);
  const [showForm, setShowForm] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | undefined>();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChannels = channels.filter((ch) =>
    ch.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = (channelData: Partial<Channel>) => {
    if (editingChannel) {
      setChannels(channels.map((ch) =>
        ch.id === editingChannel.id ? { ...ch, ...channelData, updatedAt: new Date() } : ch
      ));
      toast.success("চ্যানেল আপডেট করা হয়েছে!");
    } else {
      const newChannel: Channel = {
        id: Date.now().toString(),
        name: channelData.name || "",
        logo: channelData.logo || "",
        streamUrl: channelData.streamUrl || "",
        category: channelData.category || "",
        description: channelData.description || "",
        isLive: channelData.isLive || false,
        viewers: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setChannels([...channels, newChannel]);
      toast.success("নতুন চ্যানেল যোগ করা হয়েছে!");
    }
    setShowForm(false);
    setEditingChannel(undefined);
  };

  const handleEdit = (channel: Channel) => {
    setEditingChannel(channel);
    setShowForm(true);
  };

  const handleDelete = (channelId: string) => {
    setChannels(channels.filter((ch) => ch.id !== channelId));
    toast.success("চ্যানেল মুছে ফেলা হয়েছে!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl">চ্যানেল ম্যানেজমেন্ট</h1>
          <p className="text-muted-foreground">আপনার সব চ্যানেল এখানে ম্যানেজ করুন</p>
        </div>
        <Button variant="gradient" onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          নতুন চ্যানেল
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 glass-card px-4 py-2 max-w-md">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="চ্যানেল খুঁজুন..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border-0 bg-transparent focus-visible:ring-0"
        />
      </div>

      {/* Channels Table */}
      <ChannelTable
        channels={filteredChannels}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Channel Form Modal */}
      {showForm && (
        <ChannelForm
          channel={editingChannel}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditingChannel(undefined);
          }}
        />
      )}
    </div>
  );
};

export default Channels;
