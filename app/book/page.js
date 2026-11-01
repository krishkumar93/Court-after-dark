import { redirect } from "next/navigation";

// Redirect /book to /facilities
export default function BookRedirectPage() {
  redirect("/facilities");
}

