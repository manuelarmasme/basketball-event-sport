"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { createInvitation } from "@/lib/actions/invitations";
import ErrorMessage from "@/components/ui/error-message";

export function InviteUserDialog() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const formData = new FormData(event.currentTarget);
    const result = await createInvitation(formData);

    if (result.success) {
      toast.success("Invitación enviada correctamente");
      setOpen(false);
      event.currentTarget.reset();
    } else if (result.errors) {
      setErrors(result.errors);
      toast.error("Por favor corrige los errores en el formulario");
    } else {
      toast.error(result.error || "Error al enviar la invitación");
    }

    setIsSubmitting(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Invitar Usuario
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invitar Nuevo Usuario</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Juan Pérez"
            />
            {errors.name && <ErrorMessage errorMessage={errors.name[0]} />}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="juan@ejemplo.com"
            />
            {errors.email && <ErrorMessage errorMessage={errors.email[0]} />}
          </div>

          <div>
            <Label htmlFor="role">Rol</Label>
            <select
              id="role"
              name="role"
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Selecciona un rol</option>
              <option value="admin">Administrador</option>
              <option value="manager">Manager</option>
            </select>
            {errors.role && <ErrorMessage errorMessage={errors.role[0]} />}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar Invitación"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
