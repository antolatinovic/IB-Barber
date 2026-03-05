# IB Barber — Instructions pour Claude Code

## Contexte du projet

Web app de réservation pour **IB**, salon de coiffure barbier (1 barbier).
Les clients arrivent via un **lien Snapchat story** et réservent un créneau en 3 étapes, sans créer de compte.
Inspiration design : **Planity** — interface épurée, dark, mobile-first.

---

## Stack technique

| Outil | Usage |
|-------|-------|
| Next.js 14 (App Router) | Framework principal |
| TypeScript | Typage strict partout |
| Tailwind CSS + shadcn/ui | UI components |
| Supabase | Base de données PostgreSQL + Auth back-office |
| Resend | Envoi d'emails de confirmation |
| Vercel | Déploiement et hébergement |

---

## Structure du projet

```
ib-barber/
├── CLAUDE.md
├── app/
│   ├── layout.tsx                  # Layout global (font, metadata)
│   ├── page.tsx                    # Redirect vers /book
│   ├── book/
│   │   ├── page.tsx                # Page principale réservation (étapes 1-2-3)
│   │   └── confirmation/
│   │       └── page.tsx            # Page de confirmation post-réservation
│   ├── admin/
│   │   ├── login/
│   │   │   └── page.tsx            # Login barbier
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Vue réservations de la semaine
│   │   └── slots/
│   │       └── page.tsx            # Gestion des créneaux
│   └── api/
│       ├── bookings/
│       │   └── route.ts            # POST /api/bookings
│       ├── slots/
│       │   └── route.ts            # GET + POST /api/slots
│       └── send-confirmation/
│           └── route.ts            # POST envoi email via Resend
├── components/
│   ├── booking/
│   │   ├── SlotPicker.tsx          # Grille de créneaux disponibles
│   │   ├── ServicePicker.tsx       # Choix de la prestation
│   │   └── BookingForm.tsx         # Formulaire nom/snap/mail
│   └── admin/
│       ├── WeekSlotBuilder.tsx     # Interface création créneaux semaine
│       └── BookingsList.tsx        # Liste des réservations
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Supabase client (côté browser)
│   │   └── server.ts               # Supabase client (côté server/API)
│   ├── resend.ts                   # Client Resend
│   └── utils.ts                    # Helpers (formatDate, etc.)
├── types/
│   └── index.ts                    # Types TypeScript globaux
└── emails/
    └── confirmation.tsx            # Template email React (react-email)
```

---

## Base de données Supabase

### Table `slots`
```sql
create table slots (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  time time not null,
  is_booked boolean default false,
  created_at timestamptz default now(),
  unique(date, time)
);
```

### Table `bookings`
```sql
create table bookings (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid references slots(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  snap text not null,
  email text not null,
  service text not null check (service in ('coupe', 'coupe_barbe')),
  created_at timestamptz default now()
);
```

### Row Level Security
```sql
-- Slots : lecture publique, écriture admin seulement
alter table slots enable row level security;
create policy "Slots lisibles par tous" on slots for select using (true);
create policy "Slots modifiables par admin" on slots for all using (auth.role() = 'authenticated');

-- Bookings : écriture publique (réservation), lecture admin seulement
alter table bookings enable row level security;
create policy "Réservation publique" on bookings for insert using (true);
create policy "Bookings lisibles par admin" on bookings for select using (auth.role() = 'authenticated');
```

---

## Parcours client — `/book`

Le parcours se fait en 3 étapes sur une seule page (stepper) :

1. **Étape 1 — Créneau** : Affichage des slots disponibles groupés par jour. Créneaux toutes les 30 min. Les slots `is_booked = true` sont grisés et non cliquables.
2. **Étape 2 — Prestation** : Choix entre "Coupe simple" (30 min) et "Coupe + Barbe" (60 min).
3. **Étape 3 — Infos client** : Formulaire avec Prénom, Nom, Pseudo Snapchat, Email.

À la validation :
- `POST /api/bookings` : insère la réservation + met `is_booked = true` sur le slot
- `POST /api/send-confirmation` : envoie l'email de confirmation via Resend
- Redirect vers `/book/confirmation`

**Anti double-booking** : la mise à jour du slot doit se faire en transaction (utiliser une Supabase Function ou une update conditionnelle avec `is_booked = false` dans le WHERE).

---

## Back-office admin — `/admin`

Accessible uniquement après login via Supabase Auth (email + mot de passe, 1 seul compte barbier).

### `/admin/slots` — Gestion des créneaux
Interface intuitive permettant au barbier de définir ses dispos chaque semaine :
- Sélecteur de jours actifs pour la semaine (checkboxes Lun → Sam)
- Pour chaque jour : heure de début + heure de fin (ex: 9h → 18h)
- Génération automatique des créneaux toutes les 30 min à la validation
- Bouton "Publier la semaine" → insère tous les slots en base via `POST /api/slots`
- Possibilité de supprimer un créneau spécifique

### `/admin/dashboard` — Vue réservations
- Liste de toutes les réservations de la semaine en cours
- Affichage : heure | nom client | prestation | snap | email
- Tri par date/heure

---

## Variables d'environnement

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Resend
RESEND_API_KEY=

# Email expéditeur
FROM_EMAIL=reservations@ib-barber.com
```

---

## Design — Principes

- **Mobile-first** : toute l'UI client doit être parfaite sur mobile (entrée via Snap)
- **Palette** : fond noir/très sombre (`#0a0a0a`), texte blanc, accents gris clair ou blanc
- **Typographie** : fonte moderne, épurée (ex: Geist, Inter)
- **Créneaux** : affichage en grille de pills/badges (disponible = blanc/outline, pris = grisé, sélectionné = blanc plein)
- **Pas de compte client** : aucune inscription, aucun mot de passe côté client
- **Feedback immédiat** : loading states, confirmation visuelle à chaque étape

---

## Services — Référence rapide

| Prestation | Durée | Clé DB |
|------------|-------|--------|
| Coupe simple | 30 min | `coupe` |
| Coupe + Barbe | 30 min | `coupe_barbe` |

---

## Email de confirmation

Utiliser `react-email` pour le template. Le mail doit contenir :
- Nom du client
- Jour + heure du RDV
- Prestation réservée
- Rappel : contacter le barbier sur Snap en cas d'annulation
- Design sobre, cohérent avec l'identité IB

---

## Commandes utiles

```bash
# Installer les dépendances
npm install

# Lancer en dev
npm run dev

# Générer les types Supabase
npx supabase gen types typescript --project-id <project-id> > types/supabase.ts
```

---

## Ce que Claude Code NE doit PAS faire

- Ne pas créer de système de paiement
- Ne pas créer de compte client (côté réservation)
- Ne pas utiliser de librairie de calendrier complexe (react-calendar, fullcalendar) — créer un composant simple custom
- Ne pas sur-ingéniérer : l'app est simple, le code doit l'être aussi
