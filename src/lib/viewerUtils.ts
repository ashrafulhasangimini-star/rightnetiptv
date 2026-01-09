import { supabase } from "@/integrations/supabase/client";

/**
 * Increment viewer count for a channel
 * Call this when user opens the video player
 */
export const incrementViewerCount = async (channelId: string) => {
  try {
    // Get current count
    const { data: channel, error: fetchError } = await supabase
      .from("channels")
      .select("viewer_count")
      .eq("id", channelId)
      .single();

    if (fetchError) throw fetchError;

    const newCount = (channel?.viewer_count || 0) + 1;

    // Update with new count
    const { error: updateError } = await supabase
      .from("channels")
      .update({ viewer_count: newCount })
      .eq("id", channelId);

    if (updateError) throw updateError;

    return newCount;
  } catch (error) {
    console.error("Failed to increment viewer count:", error);
    throw error;
  }
};

/**
 * Decrement viewer count for a channel
 * Call this when user closes the video player
 */
export const decrementViewerCount = async (channelId: string) => {
  try {
    // Get current count
    const { data: channel, error: fetchError } = await supabase
      .from("channels")
      .select("viewer_count")
      .eq("id", channelId)
      .single();

    if (fetchError) throw fetchError;

    const newCount = Math.max(0, (channel?.viewer_count || 1) - 1);

    // Update with new count
    const { error: updateError } = await supabase
      .from("channels")
      .update({ viewer_count: newCount })
      .eq("id", channelId);

    if (updateError) throw updateError;

    return newCount;
  } catch (error) {
    console.error("Failed to decrement viewer count:", error);
    throw error;
  }
};

/**
 * Set viewer count to a specific value
 * Useful for admin operations
 */
export const setViewerCount = async (channelId: string, count: number) => {
  try {
    const { error } = await supabase
      .from("channels")
      .update({ viewer_count: Math.max(0, count) })
      .eq("id", channelId);

    if (error) throw error;

    return count;
  } catch (error) {
    console.error("Failed to set viewer count:", error);
    throw error;
  }
};
