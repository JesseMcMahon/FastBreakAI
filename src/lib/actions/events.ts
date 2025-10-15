"use server";

import { createServerClient } from "@/lib/supabase/supabase";
import { revalidatePath } from "next/cache";

export interface EventData {
  name: string;
  description?: string;
  start_date: string;
  end_date?: string;
  venue_id?: string;
  sport_type: string;
  created_by: string;
}

interface VenueData {
  id: string;
  name: string;
  address: string;
  city: string;
  state?: string;
  capacity?: number;
  description?: string;
  created_by: string;
}

export async function createEvent(
  eventData: EventData & { venue_ids?: string[] }
) {
  const supabase = createServerClient();

  try {
    // Extract venue_ids from eventData
    const { venue_ids, ...eventDataWithoutVenues } = eventData;

    // Create the event
    const { data: event, error: eventError } = await supabase
      .from("events")
      .insert(eventDataWithoutVenues)
      .select()
      .single();

    if (eventError) {
      console.error("Server: Event insert error:", eventError);
      throw new Error(eventError.message);
    }

    // Add venues to event_venues junction table if provided
    if (venue_ids && venue_ids.length > 0) {
      const eventVenues = venue_ids.map((venue_id, index) => ({
        event_id: event.id,
        venue_id: venue_id,
        is_primary: index === 0, // First venue is primary
      }));

      const { error: venuesError } = await supabase
        .from("event_venues")
        .insert(eventVenues);

      if (venuesError) {
        console.error("Server: Venues insert error:", venuesError);
        throw new Error(venuesError.message);
      }
    }

    revalidatePath("/dashboard");
    return { success: true, data: event };
  } catch (error) {
    console.error("Server: Error creating event:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create event",
    };
  }
}

export async function getEvents(searchQuery?: string, sportFilter?: string) {
  const supabase = createServerClient();

  try {
    let query = supabase.from("events").select(
      `
        *,
        event_venues (
          is_primary,
          venues (
            id,
            name,
            address,
            city,
            state
          )
        )
      `
    );

    // Apply search filter
    if (searchQuery && searchQuery.trim()) {
      const searchTerm = `%${searchQuery.trim()}%`;
      query = query.or(
        `name.ilike.${searchTerm},description.ilike.${searchTerm}`
      );
    }

    // Apply sport filter
    if (sportFilter && sportFilter.trim()) {
      query = query.eq("sport_type", sportFilter);
    }

    const { data, error } = await query.order("start_date", {
      ascending: true,
    });

    if (error) {
      throw new Error(error.message);
    }

    // Transform the data to flatten venues array
    const transformedData =
      data?.map((event) => ({
        ...event,
        venues:
          event.event_venues?.map(
            (ev: { is_primary: boolean; venues: VenueData }) => ({
              ...ev.venues,
              is_primary: ev.is_primary,
            })
          ) || [],
        primary_venue:
          event.event_venues?.find(
            (ev: { is_primary: boolean; venues: VenueData }) => ev.is_primary
          )?.venues || null,
      })) || [];

    return { success: true, data: transformedData };
  } catch (error) {
    console.error("Error fetching events:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch events",
    };
  }
}

export async function getEventById(id: string) {
  const supabase = createServerClient();

  try {
    const { data, error } = await supabase
      .from("events")
      .select(
        `
        *,
        event_venues (
          is_primary,
          venues (
            id,
            name,
            address,
            city,
            state
          )
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Transform the data to match the same structure as getEvents
    const transformedData = {
      ...data,
      venues:
        data.event_venues?.map(
          (ev: { is_primary: boolean; venues: VenueData }) => ({
            ...ev.venues,
            is_primary: ev.is_primary,
          })
        ) || [],
      primary_venue:
        data.event_venues?.find(
          (ev: { is_primary: boolean; venues: VenueData }) => ev.is_primary
        )?.venues || null,
    };

    return { success: true, data: transformedData };
  } catch (error) {
    console.error("Error fetching event:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch event",
    };
  }
}

export async function updateEvent(
  id: string,
  eventData: Partial<EventData> & { venue_ids?: string[] }
) {
  const supabase = createServerClient();

  try {
    // Extract venue_ids from eventData
    const { venue_ids, ...eventDataWithoutVenues } = eventData;

    // Update the event
    const { data, error } = await supabase
      .from("events")
      .update(eventDataWithoutVenues)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Update venues if provided
    if (venue_ids !== undefined) {
      // First, delete existing venue associations
      await supabase.from("event_venues").delete().eq("event_id", id);

      // Then, add new venue associations if any
      if (venue_ids.length > 0) {
        const eventVenues = venue_ids.map((venue_id, index) => ({
          event_id: id,
          venue_id: venue_id,
          is_primary: index === 0, // First venue is primary
        }));

        const { error: venuesError } = await supabase
          .from("event_venues")
          .insert(eventVenues);

        if (venuesError) {
          console.error("Error updating event venues:", venuesError);
          throw new Error(venuesError.message);
        }
      }
    }

    revalidatePath("/dashboard");
    return { success: true, data };
  } catch (error) {
    console.error("Error updating event:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update event",
    };
  }
}

export async function deleteEvent(id: string) {
  const supabase = createServerClient();

  try {
    const { data, error } = await supabase
      .from("events")
      .delete()
      .eq("id", id)
      .select();

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/dashboard");
    return { success: true, data };
  } catch (error) {
    console.error("Error deleting event:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete event",
    };
  }
}
