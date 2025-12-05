import { Suspense } from "react";
import TournamentDetailContainer from "./components/tournament-detail/container";
import PreInscriptionParticipantsList from "./components/tournament-detail/PreInscriptionParticipantsList";
import { Loading } from "@/components/ui/loading";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CONSTANTS } from "@/lib/config/constant";

export default async function TournamentPage({
  params,
}: {
  params: Promise<{ tournament: string }>;
}) {
  const { tournament } = await params;

  // Fetch event to get googleSheetUrl
  const eventDoc = await getDoc(
    doc(db, CONSTANTS.FIREBASE_COLLECTIONS.TOURNAMENTS, tournament)
  );
  const eventData = eventDoc.data();

  return (
    <>
      <TournamentDetailContainer tournamentId={tournament} />

      {eventData?.googleSheetUrl && (
        <Suspense fallback={<Loading message="Cargando participantes..." />}>
          <PreInscriptionParticipantsList
            googleSheetUrl={eventData.googleSheetUrl}
          />
        </Suspense>
      )}
    </>
  );
}
