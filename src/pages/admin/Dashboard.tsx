import StatsCard from "@/components/StatsCard";
import { mockStats, mockChannels } from "@/data/mockData";
import { Tv, Users, Radio, TrendingUp, Activity } from "lucide-react";
import ChannelTable from "@/components/admin/ChannelTable";
import { toast } from "sonner";

const Dashboard = () => {
  const handleEdit = () => {
    toast.info("এডিট ফিচার শীঘ্রই আসছে!");
  };

  const handleDelete = () => {
    toast.info("ডিলিট ফিচার শীঘ্রই আসছে!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl">ড্যাশবোর্ড</h1>
        <p className="text-muted-foreground">আপনার IPTV প্ল্যাটফর্মের সার্বিক অবস্থা</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="মোট চ্যানেল"
          value={mockStats.totalChannels}
          icon={Tv}
          trend="গত মাস থেকে ৫টি বেশি"
          trendUp
        />
        <StatsCard
          title="লাইভ চ্যানেল"
          value={mockStats.liveChannels}
          icon={Radio}
          trend="৬৪% অনলাইন"
          trendUp
        />
        <StatsCard
          title="সক্রিয় দর্শক"
          value={mockStats.totalViewers}
          icon={Users}
          trend="গত ঘন্টায় ১২% বৃদ্ধি"
          trendUp
        />
        <StatsCard
          title="ক্যাটাগরি"
          value={mockStats.categories}
          icon={TrendingUp}
        />
      </div>

      {/* Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-lg">সাম্প্রতিক চ্যানেল</h2>
              <Activity className="w-5 h-5 text-muted-foreground" />
            </div>
            <ChannelTable 
              channels={mockChannels.slice(0, 4)} 
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4">জনপ্রিয় ক্যাটাগরি</h3>
            <div className="space-y-3">
              {["বিনোদন", "খেলাধুলা", "সংবাদ", "শিশু"].map((category, i) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm">{category}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 rounded-full bg-muted overflow-hidden w-20">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                        style={{ width: `${100 - i * 20}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{100 - i * 20}%</span>
                  </div>
                </div>
              ))}
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
                <span className="text-sm">CDN স্ট্যাটাস</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-warning/20 text-warning">৯৮%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
