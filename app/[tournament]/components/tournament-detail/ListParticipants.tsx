"use client";

import { Button } from "@/components/ui/button";
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

export default function ListParticipants({
  participants,
}: {
  participants: MatchPlayer[] | PreIncriptionPlayer[];
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
        placeholder="Filtrar participantes..."
      />

      <ScrollArea className="h-64">
        {filteredParticipants.map((player, index) => (
          <Item key={index} className="w-full px-0">
            <ItemContent>
              <ItemTitle>{player.name}</ItemTitle>
            </ItemContent>
            <ItemActions>
              <Button variant="secondary" size="sm">
                Inscribir
              </Button>
            </ItemActions>
          </Item>
        ))}
      </ScrollArea>
    </>
  );
}
