"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InvitationFormData, invitationSchema } from "@/lib/schemas/invitation";
import posthog from "posthog-js";
import { Invitation } from "@/lib/types/invitation";
import z from "zod";
import { auth } from "@/lib/firebase";

export function InviteUserDialog() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const [formData, setFormData] = useState<InvitationFormData>({
    name: "",
    email: "",
    role: "",
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const formResult = invitationSchema.safeParse(formData);

      if (!formResult.success) {
        const flattened = z.flattenError(formResult.error).fieldErrors;
        setErrors(flattened);
        setIsSubmitting(false);
        return;
      } else {
        const partialInvitationFormData: Partial<Invitation> = {
          name: formData.name,
          email: formData.email,
          role: formData.role as "admin" | "manager",
        };

        await createInvitation(
          partialInvitationFormData,
          auth.currentUser?.uid as string
        );
        toast.success("Invitación enviada correctamente");
        setOpen(false);
        setFormData({ name: "", email: "", role: "" });
        setErrors({});
      }
    } catch (error) {
      posthog.captureException(error, {
        location: "InviteUserDialog.handleSubmit",
      });

      toast.error("Error al enviar la invitación");
    } finally {
      setIsSubmitting(false);
    }
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
          <DialogDescription>
            Completa el formulario para enviar una invitación por email.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="w-full flex flex-col gap-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              aria-label="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              placeholder="Juan Pérez"
              disabled={isSubmitting}
            />
            {errors.name && <ErrorMessage errorMessage={errors.name[0]} />}
          </div>

          <div className="w-full flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              aria-label="email"
              type="email"
              disabled={isSubmitting}
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              placeholder="juan@ejemplo.com"
            />
            {errors.email && <ErrorMessage errorMessage={errors.email[0]} />}
          </div>

          <div className="w-full flex flex-col gap-2">
            <Label htmlFor="role">Rol</Label>
            <Select
              name="role"
              aria-label="role"
              required
              disabled={isSubmitting}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  role: value as "admin" | "manager",
                })
              }
              value={formData.role || ""}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <ErrorMessage errorMessage={errors.role[0]} />}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              aria-label="Cancelar"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              aria-label={isSubmitting ? "Enviando..." : "Enviar Invitación"}
              disabled={
                isSubmitting ||
                formData.name === "" ||
                formData.email === "" ||
                formData.role.length === 0
              }
            >
              {isSubmitting ? "Enviando..." : "Enviar Invitación"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
