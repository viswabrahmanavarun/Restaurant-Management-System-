import { redirect } from "next/navigation";

export default function ReserveRedirectPage() {
  // Redirect user directly to the New Reservation page
  redirect("/dashboard/reservations/new");
}
