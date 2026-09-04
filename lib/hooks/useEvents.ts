import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import {
  type HydratedEvent,
  type CreateEventInput,
  type UpdateEventInput,
  type TagRow,
  getAllEvents,
  createEvent as repoCreateEvent,
  updateEvent as repoUpdateEvent,
  deleteEvent as repoDeleteEvent,
} from "../EventRepository";
import { gregorianYmdToEthiopian } from "../ethiopianCalendar";
import { TAG_KEYS } from "./useTags";

export const EVENT_KEYS = {
  all: ["events"] as const,
};

export type EventIndex = {
  all: HydratedEvent[];
  byGcMonth: Map<string, HydratedEvent[]>;
  byEthMonth: Map<string, HydratedEvent[]>;
};

/** Pre-index all user events by Gregorian and Ethiopian month buckets */
export function buildEventIndex(events: HydratedEvent[]): EventIndex {
  const byGcMonth = new Map<string, HydratedEvent[]>();
  const byEthMonth = new Map<string, HydratedEvent[]>();

  for (const e of events) {
    const [gcY, gcM, gcD] = e.date.split("-").map(Number);

    // Gregorian bucket (year-monthIndex)
    const gcKey = `${gcY}-${gcM - 1}`;
    let gcBucket = byGcMonth.get(gcKey);
    if (!gcBucket) {
      gcBucket = [];
      byGcMonth.set(gcKey, gcBucket);
    }
    gcBucket.push(e);

    // Ethiopian bucket (ethYear-ethMonthIndex)
    const eth = gregorianYmdToEthiopian(gcY, gcM - 1, gcD);
    const ethKey = `${eth.year}-${eth.month}`;
    let ethBucket = byEthMonth.get(ethKey);
    if (!ethBucket) {
      ethBucket = [];
      byEthMonth.set(ethKey, ethBucket);
    }
    ethBucket.push(e);
  }

  return { all: events, byGcMonth, byEthMonth };
}

/** Retrieve active month events with displayDay in O(1) time */
export function getEventsForActiveMonth(
  index: EventIndex | undefined,
  activeYear: number,
  activeMonth: number,
  isEth: boolean,
): { event: HydratedEvent; displayDay: number }[] {
  if (!index) return [];

  const key = `${activeYear}-${activeMonth}`;
  const bucket = isEth ? index.byEthMonth.get(key) : index.byGcMonth.get(key);
  if (!bucket || bucket.length === 0) return [];

  return bucket.map((e) => {
    const [gcY, gcM, gcD] = e.date.split("-").map(Number);
    const displayDay = isEth ? gregorianYmdToEthiopian(gcY, gcM - 1, gcD).day : gcD;
    return { event: e, displayDay };
  });
}

/**
 * Fetches all user custom events from SQLite and pre-indexes them by month.
 * Stale time is set to Infinity so events load at app launch and are refreshed
 * strictly on event mutations.
 */
export function useEvents() {
  const db = useSQLiteContext();

  return useQuery({
    queryKey: EVENT_KEYS.all,
    staleTime: Infinity,
    queryFn: async (): Promise<HydratedEvent[]> => {
      return getAllEvents(db);
    },
    select: buildEventIndex,
  });
}

export function useCreateEvent() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();

  return useMutation({
    onMutate: async (input: CreateEventInput) => {
      await queryClient.cancelQueries({ queryKey: EVENT_KEYS.all });
      const previousEvents = queryClient.getQueryData<HydratedEvent[]>(EVENT_KEYS.all);

      const tags = queryClient.getQueryData<TagRow[]>(TAG_KEYS.all);
      const matchedTag = input.tagId ? tags?.find((t) => t.id === input.tagId) : null;
      const tagName = input.tagName ?? matchedTag?.name;
      const tagColor = input.tagColor ?? matchedTag?.color;

      const optimisticEvent: HydratedEvent = {
        id: input.id || `evt_${Date.now()}`,
        title: input.title,
        date: input.date,
        reminderTime: input.reminderTime ?? undefined,
        notes: input.notes ?? undefined,
        tagId: input.tagId ?? null,
        tagName: tagName ?? undefined,
        tagColor: tagColor ?? undefined,
        reminderOffsets: input.reminderOffsets,
        hasReminder: Boolean(input.reminderTime),
      };

      queryClient.setQueryData<HydratedEvent[]>(EVENT_KEYS.all, (old) => {
        if (!old) return [optimisticEvent];
        return [...old.filter((e) => e.id !== optimisticEvent.id), optimisticEvent];
      });

      return { previousEvents };
    },
    mutationFn: async (input: CreateEventInput) => {
      return repoCreateEvent(db, input);
    },
    onError: (_err, _newVal, context) => {
      if (context?.previousEvents) {
        queryClient.setQueryData(EVENT_KEYS.all, context.previousEvents);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: EVENT_KEYS.all });
    },
  });
}

export function useUpdateEvent() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();

  return useMutation({
    onMutate: async (input: UpdateEventInput) => {
      await queryClient.cancelQueries({ queryKey: EVENT_KEYS.all });
      const previousEvents = queryClient.getQueryData<HydratedEvent[]>(EVENT_KEYS.all);

      const tags = queryClient.getQueryData<TagRow[]>(TAG_KEYS.all);
      const matchedTag = input.tagId ? tags?.find((t) => t.id === input.tagId) : null;
      const tagName = input.tagName ?? matchedTag?.name;
      const tagColor = input.tagColor ?? matchedTag?.color;

      queryClient.setQueryData<HydratedEvent[]>(EVENT_KEYS.all, (old) => {
        if (!old) return [];
        return old.map((e) =>
          e.id === input.id
            ? {
                ...e,
                title: input.title,
                date: input.date,
                reminderTime: input.reminderTime ?? undefined,
                notes: input.notes ?? undefined,
                tagId: input.tagId ?? null,
                tagName: tagName ?? undefined,
                tagColor: tagColor ?? undefined,
                reminderOffsets: input.reminderOffsets,
                reminderOffset: input.reminderOffsets?.[0],
                hasReminder: Boolean(input.reminderTime),
              }
            : e,
        );
      });

      return { previousEvents };
    },
    mutationFn: async (input: UpdateEventInput) => {
      await repoUpdateEvent(db, input);
      return input;
    },
    onError: (_err, _newVal, context) => {
      if (context?.previousEvents) {
        queryClient.setQueryData(EVENT_KEYS.all, context.previousEvents);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: EVENT_KEYS.all });
    },
  });
}

export function useDeleteEvent() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();

  return useMutation({
    onMutate: async (eventId: string) => {
      await queryClient.cancelQueries({ queryKey: EVENT_KEYS.all });
      const previousEvents = queryClient.getQueryData<HydratedEvent[]>(EVENT_KEYS.all);

      queryClient.setQueryData<HydratedEvent[]>(EVENT_KEYS.all, (old) => {
        if (!old) return [];
        return old.filter((e) => e.id !== eventId);
      });

      return { previousEvents };
    },
    mutationFn: async (eventId: string) => {
      await repoDeleteEvent(db, eventId);
      return eventId;
    },
    onError: (_err, _eventId, context) => {
      if (context?.previousEvents) {
        queryClient.setQueryData(EVENT_KEYS.all, context.previousEvents);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: EVENT_KEYS.all });
    },
  });
}
