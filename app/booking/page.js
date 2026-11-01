import { redirect } from "next/navigation";

// Redirect /booking to /facilities or /bookings so players typing /booking never get 404
export default function BookingRedirectPage({ searchParams }) {
  if (searchParams?.view === "my" || searchParams?.tab === "my") {
    redirect("/bookings");
  }
  redirect("/facilities");
}

