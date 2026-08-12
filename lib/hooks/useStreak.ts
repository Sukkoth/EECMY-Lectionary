import { useQuery } from "@tanstack/react-query";
import { loadStreak } from "../StreakService";

export const STREAK_KEYS = {
  all: ["streak"] as const,
};

export function useStreak() {
  return useQuery({
    queryKey: STREAK_KEYS.all,
    queryFn: loadStreak,
  });
}
