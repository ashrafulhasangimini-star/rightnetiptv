import StatsCard from "@/components/StatsCard";
import { Tv, Users, Radio, TrendingUp, Activity, Loader2 } from "lucide-react";
import { useChannels } from "@/hooks/useChannels";
import { useCategories } from "@/hooks/useCategories";
import { useUsers } from "@/hooks/useUsers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Dashboard = () => {
  const { data: channels, isLoading: channelsLoading } = useChannels();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: users, isLoading: usersLoading } = useUsers();

  const isLoading = channelsLoading || categoriesLoading || usersLoading;

  const totalChannels = channels?.length || 0;
  const liveChannels = channels?.filter(ch => ch.is_live).length || 0;
  const totalViewers = channels?.reduce((acc, ch) => acc + ch.viewer_count, 0) || 0;
  const totalCategories = categories?.length || 0;
  const totalUsers = users?.length || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl">ড্যাশবোর্ড</h1>
        <p className="text-muted-foreground">আপনার IPTV প্ল্যাটফর্মের সার্বিক অবস্থা</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="মোট চ্যানেল"
          value={totalChannels}
          icon={Tv}
        />
        <StatsCard
          title="লাইভ চ্যানেল"
          value={liveChannels}
          icon={Radio}
          trend={totalChannels > 0 ? `${Math.round((liveChannels / totalChannels) * 100)}% অনলাইন` : undefined}
          trendUp={liveChannels > 0}
        />
        <StatsCard
          title="মোট দর্শক"
          value={totalViewers}
          icon={Users}
        />
        <StatsCard
          title="ক্যাটাগরি"
          value={totalCategories}
          icon={TrendingUp}
        />
        <StatsCard
          title="ব্যবহারকারী"
          value={totalUsers}
          icon={Users}
        />
      </div>

      {/* Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Channels */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-lg">সাম্প্রতিক চ্যানেল</h2>
              <Activity className="w-5 h-5 text-muted-foreground" />
            </div>
            {channels && channels.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 hover:bg-transparent">
                    <TableHead className="text-muted-foreground">চ্যানেল</TableHead>
                    <TableHead className="text-muted-foreground">স্ট্যাটাস</TableHead>
                    <TableHead className="text-muted-foreground">দর্শক</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {channels.slice(0, 5).map((channel) => (
                    <TableRow key={channel.id} className="border-border/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {channel.logo_url ? (
                            <img
                              src={channel.logo_url}
                              alt={channel.name}
                              className="w-8 h-8 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                              <Tv className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                          <span className="font-medium">{channel.name}</span>
                        </div>
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
                        <span className="text-sm">{channel.viewer_count.toLocaleString()}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-8">কোনো চ্যানেল নেই</p>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4">ক্যাটাগরি সমূহ</h3>
            <div className="space-y-3">
              {categories && categories.length > 0 ? (
                categories.slice(0, 5).map((category) => (
                  <div key={category.id} className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <span>{category.icon || "📁"}</span>
                      {category.name}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      category.is_active 
                        ? "bg-success/20 text-success" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {category.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">কোনো ক্যাটাগরি নেই</p>
              )}
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4">সার্ভার স্ট্যাটাস</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">প্রাইমারি সার্ভার</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-success/20 text-success">সক্রিয়</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">ব্যাকআপ সার্ভার</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-success/20 text-success">সক্রিয়</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">ডাটাবেস</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-success/20 text-success">সংযুক্ত</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
