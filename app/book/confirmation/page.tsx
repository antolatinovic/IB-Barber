export default function ConfirmationPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-md text-center">
        {/* Checkmark */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-foreground">
          <svg
            className="h-8 w-8 text-background"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold">Réservation confirmée</h1>
        <p className="mt-3 text-muted-foreground">
          Tu vas recevoir un email de confirmation avec les détails de ton rendez-vous.
        </p>

        {/* Récap mock */}
        <div className="mt-8 rounded-xl border border-border p-4 text-left">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">Mercredi 5 mars</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Heure</span>
              <span className="font-medium">14:30</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Prestation</span>
              <span className="font-medium">Coupe + Barbe</span>
            </div>
          </div>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Un email de confirmation t&apos;a été envoyé.
        </p>

        <p className="mt-4 text-sm text-muted-foreground">
          Pour toutes demandes spécifique contacte moi sur Snapchat
          <br />
          <span className="font-medium text-foreground">@i-ftyyy08</span>
        </p>
      </div>
    </div>
  );
}
