"use client";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "@/components/ui/item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MatchPlayer, PreIncriptionPlayer } from "@/lib/types/tournament";
import FilterInput from "./FilterInput";
import { useState } from "react";
import InscriptionButton from "./InscriptionButton";
import RemoveInscriptionDialog from "./RemoveInscriptionDialog";

export default function ListParticipants({
  participants,
  filterPlaceholder = "Filtrar participantes...",
  removeInscription,
}: {
  participants: MatchPlayer[] | PreIncriptionPlayer[];
  filterPlaceholder?: string;
  removeInscription?: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredParticipants = participants.filter((player) =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <FilterInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={filterPlaceholder}
      />

      <ScrollArea className="h-64">
        {filteredParticipants.map((player, index) => (
          <Item key={index} className="w-full px-0">
            <ItemContent>
              <ItemTitle>{player.name}</ItemTitle>
            </ItemContent>
            <ItemActions>
              {!removeInscription && (
                <InscriptionButton participantName={player.name as string} />
              )}

              {removeInscription && (
                <RemoveInscriptionDialog
                  participantName={player.name as string}
                  participantId={(player as MatchPlayer).id}
                />
              )}
            </ItemActions>
          </Item>
        ))}
      </ScrollArea>
    </>
  );
}
