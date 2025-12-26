import { Channel } from "@/types/channel";
import { Button } from "../ui/button";
import { Edit, Trash2, Radio, ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

interface ChannelTableProps {
  channels: Channel[];
  onEdit: (channel: Channel) => void;
  onDelete: (channelId: string) => void;
}

const ChannelTable = ({ channels, onEdit, onDelete }: ChannelTableProps) => {
  return (
    <div className="glass-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border/30 hover:bg-transparent">
            <TableHead className="text-muted-foreground">চ্যানেল</TableHead>
            <TableHead className="text-muted-foreground">ক্যাটাগরি</TableHead>
            <TableHead className="text-muted-foreground">স্ট্যাটাস</TableHead>
            <TableHead className="text-muted-foreground">দর্শক</TableHead>
            <TableHead className="text-muted-foreground text-right">অ্যাকশন</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {channels.map((channel) => (
            <TableRow key={channel.id} className="border-border/30 hover:bg-muted/30">
              <TableCell>
                <div className="flex items-center gap-3">
                  <img
                    src={channel.logo}
                    alt={channel.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-medium">{channel.name}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {channel.streamUrl}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="px-2 py-1 rounded-full text-xs bg-muted">
                  {channel.category}
                </span>
              </TableCell>
              <TableCell>
                {channel.isLive ? (
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
                <span className="text-sm">{channel.viewers.toLocaleString()}</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => onEdit(channel)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onDelete(channel.id)}
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
  );
};

export default ChannelTable;
