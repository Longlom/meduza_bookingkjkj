import BookingForm from "./BookingForm";
import { getOpeningHoursFromEnv } from "@/lib/openingHours";

export default function BookingPage() {
  const openingHours = getOpeningHoursFromEnv();
  return <BookingForm openingHours={openingHours} />;
}
