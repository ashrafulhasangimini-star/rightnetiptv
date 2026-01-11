-- Enable realtime for channels table to track viewer count updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.channels;