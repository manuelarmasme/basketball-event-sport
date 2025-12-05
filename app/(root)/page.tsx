import FabButton from "@/app/(root)/components/events/FabButton";
import { EventsList } from "./components/events/EventsList";

export default function Home() {
  return (
    <>
      <EventsList />
      <FabButton />
    </>
  );
}
