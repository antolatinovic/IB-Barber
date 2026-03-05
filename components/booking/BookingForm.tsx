"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BookingFormProps {
  onSubmit: (data: { firstName: string; lastName: string; snap: string; email: string }) => void;
  isLoading: boolean;
}

export default function BookingForm({ onSubmit, isLoading }: BookingFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [snap, setSnap] = useState("");
  const [email, setEmail] = useState("");

  const isValid = firstName.trim() && lastName.trim() && snap.trim() && email.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSubmit({ firstName, lastName, snap, email });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Tes informations</h2>
        <p className="mt-1 text-sm text-muted-foreground">Pour confirmer ta réservation</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom</Label>
            <Input
              id="firstName"
              placeholder="Prénom"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Nom</Label>
            <Input
              id="lastName"
              placeholder="Nom"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="snap">Pseudo Snapchat</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@</span>
            <Input
              id="snap"
              placeholder="ton_snap"
              value={snap}
              onChange={(e) => setSnap(e.target.value)}
              className="pl-7"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="ton@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={!isValid || isLoading}
          className="mt-2 w-full rounded-xl bg-foreground py-3 text-sm font-semibold text-background transition-opacity disabled:opacity-40"
        >
          {isLoading ? "Réservation en cours..." : "Confirmer la réservation"}
        </button>
      </form>
    </div>
  );
}
