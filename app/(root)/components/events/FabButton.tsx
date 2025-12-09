"use client";

import { Plus } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { CreateEventForm } from "./CreateEventForm";

export default function FabButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="secondary"
            size="icon"
            aria-label="Submit"
            className=" cursor-pointer shadow-lg hover:shadow-xl focus:shadow-xl transition-shadow"
          >
            <Plus
              className="size-8 text-muted-foreground/50 text-primary "
              strokeWidth={1.5}
            />
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Evento</DialogTitle>

            <DialogDescription>
              Aquí va el formulario para crear un nuevo evento.
            </DialogDescription>
          </DialogHeader>

          <CreateEventForm onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
