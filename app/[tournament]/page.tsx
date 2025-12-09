import TournamentDetailContainer from "./components/tournament-detail/container";
import AuthLayout from "@/components/auth/AuthLayout";

export default async function TournamentPage({
  params,
}: {
  params: Promise<{ tournament: string }>;
}) {
  const { tournament } = await params;

  return (
    <AuthLayout>
      <TournamentDetailContainer tournamentId={tournament} />
    </AuthLayout>
  );
}
