import { Badge } from "@/components/ui/badge";

interface RoundHeaderProps {
  name: string;
  matchCount: number;
}

export default function RoundHeader({ name, matchCount }: RoundHeaderProps) {
  return (
    <>
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur pb-4 pt-4 rounded-md">
        <div className="flex items-center justify-center gap-2 ml-2">
          <h3 className="text-xl font-bold text-primary">{name}</h3>
          <Badge variant="secondary" className="text-xs">
            {matchCount} {matchCount === 1 ? "partido" : "partidos"}
          </Badge>
        </div>
      </div>
    </>
  );
}
