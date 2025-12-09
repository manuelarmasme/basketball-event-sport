import { EventsList } from "./components/events/EventsList";
import AuthLayout from "@/components/auth/AuthLayout";

export default function Home() {
  return (
    <AuthLayout>
      <EventsList />
    </AuthLayout>
  );
}
