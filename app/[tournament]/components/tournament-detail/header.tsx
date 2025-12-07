import Link from "next/link";
import { ChevronLeft, Trophy } from "lucide-react";
import { getEventStatusValue } from "@/lib/config/constant";
import { TournamentStatus } from "@/lib/types/tournament";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";

interface TournamentDetailHeaderProps {
  name: string;
  status: string;
  gobackUrl: string;
  matchesUrl?: string;
}

export default function TournamentDetailHeader({
  name,
  status,
  gobackUrl,
  matchesUrl,
}: TournamentDetailHeaderProps) {
  const statusInfo = getEventStatusValue(status as TournamentStatus);
  const showMatchesButton = status === "in_progress" || status === "finished";

  return (
    <section className="mb-8">
      <div className="mb-4 gap-2">
        <Link
          href={gobackUrl}
          className="flex flex-row text-sm items-center text-gray-400 hover:text-gray-200"
        >
          <ChevronLeft /> Regresar al inicio
        </Link>
      </div>

      <Card className="w-full">
        <CardHeader>
          <div className="w-full flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold">{name}</h1>

              <Badge className="mt-2 text-xs w-fit" variant={statusInfo.variant}>
                {statusInfo.label}
              </Badge>
            </div>

            {showMatchesButton && matchesUrl && (
              <Link href={matchesUrl}>
                <Button variant="default" className="gap-2 w-full md:w-auto">
                  <Trophy className="w-4 h-4" />
                  Ver Partidos
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
      </Card>
    </section>
  );
}
