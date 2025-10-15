"use server";

import { createServerClient } from "@/lib/supabase/supabase";
import { revalidatePath } from "next/cache";

export interface VenueData {
  name: string;
  address: string;
  city: string;
  state?: string;
  capacity?: number;
  description?: string;
  created_by: string;
}

export async function createVenue(venueData: VenueData) {
  const supabase = createServerClient();

  try {
    const { data, error } = await supabase
      .from("venues")
      .insert(venueData)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/dashboard");
    return { success: true, data };
  } catch (error) {
    console.error("Error creating venue:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create venue",
    };
  }
}

export async function getVenues(searchQuery?: string, cityFilter?: string) {
  const supabase = createServerClient();

  try {
    let query = supabase.from("venues").select("*");

    // Apply search filter
    if (searchQuery && searchQuery.trim()) {
      const searchTerm = `%${searchQuery.trim()}%`;
      query = query.or(
        `name.ilike.${searchTerm},address.ilike.${searchTerm},description.ilike.${searchTerm}`
      );
    }

    // Apply city filter
    if (cityFilter && cityFilter.trim()) {
      query = query.ilike("city", `%${cityFilter.trim()}%`);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching venues:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch venues",
    };
  }
}

export async function getVenueById(id: string) {
  const supabase = createServerClient();

  try {
    const { data, error } = await supabase
      .from("venues")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching venue:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch venue",
    };
  }
}

export async function updateVenue(id: string, venueData: Partial<VenueData>) {
  const supabase = createServerClient();

  try {
    const { data, error } = await supabase
      .from("venues")
      .update(venueData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/dashboard");
    return { success: true, data };
  } catch (error) {
    console.error("Error updating venue:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update venue",
    };
  }
}

export async function deleteVenue(id: string) {
  const supabase = createServerClient();

  try {
    const { data, error } = await supabase
      .from("venues")
      .delete()
      .eq("id", id)
      .select();

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/dashboard");
    return { success: true, data };
  } catch (error) {
    console.error("Error deleting venue:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete venue",
    };
  }
}
