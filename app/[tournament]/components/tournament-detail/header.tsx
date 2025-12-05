import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getEventStatusValue } from "@/lib/config/constant";
import { TournamentStatus } from "@/lib/types/tournament";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";

interface TournamentDetailHeaderProps {
  name: string;
  status: string;
  gobackUrl: string;
}

export default function TournamentDetailHeader({
  name,
  status,
  gobackUrl,
}: TournamentDetailHeaderProps) {
  const statusInfo = getEventStatusValue(status as TournamentStatus);
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
          <div className="w-full flex flex-col">
            <h1 className="text-3xl font-bold">{name}</h1>

            <Badge className="mt-2 text-xs" variant={statusInfo.variant}>
              {statusInfo.label}
            </Badge>
          </div>
        </CardHeader>
      </Card>
    </section>
  );
}
