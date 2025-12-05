import TournamentDetailContainer from "./components/tournament-detail/container";

export default async function TournamentPage({
  params,
}: {
  params: Promise<{ tournament: string }>;
}) {
  const { tournament } = await params;

  return <TournamentDetailContainer tournamentId={tournament} />;
}
