import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, X, Save, Loader2, Edit, Trash2, Radio, ExternalLink, Link as LinkIcon, Image, Tag } from "lucide-react";
import { useChannels, useCreateChannel, useUpdateChannel, useDeleteChannel, Channel } from "@/hooks/useChannels";
import { useCategories } from "@/hooks/useCategories";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Channels = () => {
  const { data: channels, isLoading } = useChannels();
  const { data: categories } = useCategories();
  const createChannel = useCreateChannel();
  const updateChannel = useUpdateChannel();
  const deleteChannel = useDeleteChannel();

  const [showForm, setShowForm] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    stream_url: "",
    logo_url: "",
    category_id: "",
    description: "",
    quality: "HD",
    is_live: false,
    is_active: true,
    viewer_count: 0,
  });

  const filteredChannels = channels?.filter((ch) =>
    ch.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const resetForm = () => {
    setFormData({
      name: "",
      stream_url: "",
      logo_url: "",
      category_id: "",
      description: "",
      quality: "HD",
      is_live: false,
      is_active: true,
      viewer_count: 0,
    });
    setEditingChannel(null);
    setShowForm(false);
  };

  const handleEdit = (channel: Channel) => {
    setEditingChannel(channel);
    setFormData({
      name: channel.name,
      stream_url: channel.stream_url,
      logo_url: channel.logo_url || "",
      category_id: channel.category_id || "",
      description: channel.description || "",
      quality: channel.quality || "HD",
      is_live: channel.is_live,
      is_active: channel.is_active,
      viewer_count: channel.viewer_count,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const channelData = {
      ...formData,
      category_id: formData.category_id || null,
    };

    if (editingChannel) {
      updateChannel.mutate({ id: editingChannel.id, ...channelData });
    } else {
      createChannel.mutate(channelData);
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm("আপনি কি নিশ্চিত এই চ্যানেল মুছে ফেলতে চান?")) {
      deleteChannel.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl">চ্যানেল ম্যানেজমেন্ট</h1>
          <p className="text-muted-foreground">মোট {channels?.length || 0}টি চ্যানেল</p>
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
      {filteredChannels.length > 0 ? (
        <div className="glass-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/30 hover:bg-transparent">
                <TableHead className="text-muted-foreground">চ্যানেল</TableHead>
                <TableHead className="text-muted-foreground">ক্যাটাগরি</TableHead>
                <TableHead className="text-muted-foreground">স্ট্যাটাস</TableHead>
                <TableHead className="text-muted-foreground">কোয়ালিটি</TableHead>
                <TableHead className="text-muted-foreground text-right">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredChannels.map((channel) => (
                <TableRow key={channel.id} className="border-border/30 hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {channel.logo_url ? (
                        <img
                          src={channel.logo_url}
                          alt={channel.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <Image className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{channel.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {channel.stream_url}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs bg-muted">
                      {channel.category?.name || "কোনো ক্যাটাগরি নেই"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {channel.is_live ? (
                      <span className="live-badge">
                        <Radio className="w-3 h-3" />
                        LIVE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
                        অফলাইন
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{channel.quality || "HD"}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleEdit(channel)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(channel.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <p className="text-muted-foreground">
            {searchQuery ? "কোনো চ্যানেল পাওয়া যায়নি" : "কোনো চ্যানেল নেই। নতুন চ্যানেল যোগ করুন।"}
          </p>
        </div>
      )}

      {/* Channel Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-lg mx-4 p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-xl">
                {editingChannel ? "চ্যানেল এডিট করুন" : "নতুন চ্যানেল যোগ করুন"}
              </h2>
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">চ্যানেলের নাম</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="চ্যানেলের নাম লিখুন"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="streamUrl" className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  স্ট্রিম URL (RTMP/HLS)
                </Label>
                <Input
                  id="streamUrl"
                  value={formData.stream_url}
                  onChange={(e) => setFormData({ ...formData, stream_url: e.target.value })}
                  placeholder="rtmp://example.com/live/stream"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo" className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  লোগো URL
                </Label>
                <Input
                  id="logo"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  ক্যাটাগরি
                </Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="ক্যাটাগরি নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quality">কোয়ালিটি</Label>
                <Select
                  value={formData.quality}
                  onValueChange={(value) => setFormData({ ...formData, quality: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SD">SD</SelectItem>
                    <SelectItem value="HD">HD</SelectItem>
                    <SelectItem value="FHD">Full HD</SelectItem>
                    <SelectItem value="4K">4K</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">বিবরণ</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="চ্যানেল সম্পর্কে সংক্ষিপ্ত বিবরণ"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <div>
                  <Label htmlFor="isLive" className="font-medium">লাইভ স্ট্যাটাস</Label>
                  <p className="text-sm text-muted-foreground">চ্যানেলটি বর্তমানে লাইভ আছে</p>
                </div>
                <Switch
                  id="isLive"
                  checked={formData.is_live}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_live: checked })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                  বাতিল
                </Button>
                <Button 
                  type="submit" 
                  variant="gradient" 
                  className="flex-1 gap-2"
                  disabled={createChannel.isPending || updateChannel.isPending}
                >
                  {(createChannel.isPending || updateChannel.isPending) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  সংরক্ষণ করুন
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Channels;
