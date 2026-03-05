import { NextResponse } from "next/server";
import { createServerSupabaseClient, createServiceClient } from "@/lib/supabase/server";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, format } from "date-fns";

const PRICES: Record<string, number> = {
  coupe: 10,
  coupe_barbe: 15,
};

interface PeriodStats {
  totalSlots: number;
  bookedSlots: number;
  revenue: number;
}

async function getStatsForPeriod(
  supabase: ReturnType<typeof createServiceClient>,
  from: string,
  to: string
): Promise<PeriodStats> {
  const [slotsRes, bookingsRes] = await Promise.all([
    supabase
      .from("slots")
      .select("is_booked")
      .gte("date", from)
      .lte("date", to),
    supabase
      .from("bookings")
      .select("service, slots(date)")
      .gte("slots.date", from)
      .lte("slots.date", to)
      .not("slots", "is", null),
  ]);

  const slots = slotsRes.data ?? [];
  const bookings = bookingsRes.data ?? [];

  const totalSlots = slots.length;
  const bookedSlots = slots.filter((s) => s.is_booked).length;
  const revenue = bookings.reduce(
    (sum, b) => sum + (PRICES[b.service] ?? 0),
    0
  );

  return { totalSlots, bookedSlots, revenue };
}

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const serviceClient = createServiceClient();

  const weekFrom = format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");
  const weekTo = format(endOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");
  const monthFrom = format(startOfMonth(now), "yyyy-MM-dd");
  const monthTo = format(endOfMonth(now), "yyyy-MM-dd");
  const yearFrom = format(startOfYear(now), "yyyy-MM-dd");
  const yearTo = format(endOfYear(now), "yyyy-MM-dd");

  const [week, month, year] = await Promise.all([
    getStatsForPeriod(serviceClient, weekFrom, weekTo),
    getStatsForPeriod(serviceClient, monthFrom, monthTo),
    getStatsForPeriod(serviceClient, yearFrom, yearTo),
  ]);

  return NextResponse.json({ week, month, year });
}
