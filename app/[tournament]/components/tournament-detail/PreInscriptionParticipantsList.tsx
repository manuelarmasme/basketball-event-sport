import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Empty, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchParticipants } from "@/lib/actions/sheets";
import { Users, Plus } from "lucide-react";

interface PreInscriptionParticipantsListProps {
  googleSheetUrl: string;
}

export default async function PreInscriptionParticipantsList({
  googleSheetUrl,
}: PreInscriptionParticipantsListProps) {
  const participants = await fetchParticipants(googleSheetUrl);

  return (
    <Card>
      <CardHeader className="text-primary font-bold text-xl flex justify-between items-center">
        Participantes Pre-inscritos
        <Button variant="outline" size="lg">
          <Plus className="w-4 h-4" />
        </Button>
      </CardHeader>

      <CardContent>
        {participants.length === 0 && (
          <Empty>
            <EmptyMedia>
              <Users className="w-16 h-16 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>No hay participantes pre-inscritos.</EmptyTitle>
          </Empty>
        )}

        <ScrollArea className="h-64">
          <ul className="list-none list-inside">
            {participants.map((participant, index) => (
              <li className="mb-4 text-lg" key={index}>
                {participant}
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
