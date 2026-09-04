import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import {
  type TagRow,
  getAllTags,
  createTag as repoCreateTag,
  deleteTag as repoDeleteTag,
} from "../EventRepository";
import { EVENT_KEYS } from "./useEvents";

export const TAG_KEYS = {
  all: ["tags"] as const,
};

/**
 * Fetches all tags from the SQLite Tag table.
 * Stale time is set to Infinity so tags are loaded at app start
 * and only refreshed when a tag is added or deleted.
 */
export function useTags() {
  const db = useSQLiteContext();

  return useQuery({
    queryKey: TAG_KEYS.all,
    staleTime: Infinity,
    queryFn: async (): Promise<TagRow[]> => {
      return getAllTags(db);
    },
  });
}

export function useCreateTag() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tag: { id?: string; name: string; color: string }) => {
      return repoCreateTag(db, tag);
    },
    onSuccess: async (createdTag) => {
      queryClient.setQueryData<TagRow[]>(TAG_KEYS.all, (old) => {
        if (!old) return [createdTag];
        return [...old.filter((t) => t.id !== createdTag.id), createdTag];
      });
      await queryClient.refetchQueries({ queryKey: TAG_KEYS.all });
    },
  });
}

export function useDeleteTag() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tagId: string) => {
      await repoDeleteTag(db, tagId);
      return tagId;
    },
    onSuccess: async (deletedId) => {
      queryClient.setQueryData<TagRow[]>(TAG_KEYS.all, (old) => {
        if (!old) return [];
        return old.filter((t) => t.id !== deletedId);
      });
      await Promise.all([
        queryClient.refetchQueries({ queryKey: TAG_KEYS.all }),
        queryClient.refetchQueries({ queryKey: EVENT_KEYS.all }),
      ]);
    },
  });
}
