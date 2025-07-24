# School Finder Portal - Schema Bazy Danych

> **WAŻNE**: NIGDY nie używaj plików z folderu `-Trash`. Folder ten zawiera przestarzałe lub odrzucone dokumenty, które nie powinny być wykorzystywane w implementacji.

## 1. Przegląd

Schema bazy danych dla School Finder Portal została zaprojektowana z myślą o efektywnym przechowywaniu danych o szkołach, użytkownikach, ocenach i subskrypcjach. Używamy Prisma ORM do zarządzania bazą danych.

## 2. Modele Danych

### 2.1. User

```prisma
model User {
  id                String    @id @default(cuid())
  name              String?
  email             String    @unique
  emailVerified     DateTime?
  image             String?
  password          String?
  role              String    @default("user") // "user" lub "admin"
  subscriptionStatus String    @default("free") // "free" lub "premium"
  subscriptionEnd   DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relacje
  accounts          Account[]
  sessions          Session[]
  favorites         Favorite[]
  ratings           Rating[]
  searchHistory     SearchHistory[]
}
```

### 2.2. School

```prisma
model School {
  id                String    @id @default(cuid())
  name              String
  type              String    // Typ szkoły (np. "primary", "high_school")
  address           String
  city              String
  region            String
  postalCode        String?
  phone             String?
  email             String?
  website           String?
  googleRating      Float?
  googleRatingCount Int?
  sentimentScore    Float?
  latitude          Float?
  longitude         Float?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relacje
  favorites         Favorite[]
  ratings           Rating[]
  comments          Comment[]
  visits            SchoolVisit[]
}
```

### 2.3. Rating

```prisma
model Rating {
  id                String    @id @default(cuid())
  value             Int       // Ocena od 1 do 5
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relacje
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId            String
  school            School    @relation(fields: [schoolId], references: [id], onDelete: Cascade)
  schoolId          String
  
  @@unique([userId, schoolId]) // Użytkownik może ocenić szkołę tylko raz
}
```

### 2.4. Favorite

```prisma
model Favorite {
  id                String    @id @default(cuid())
  createdAt         DateTime  @default(now())
  
  // Relacje
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId            String
  school            School    @relation(fields: [schoolId], references: [id], onDelete: Cascade)
  schoolId          String
  
  @@unique([userId, schoolId]) // Szkoła może być dodana do ulubionych tylko raz
}
```

### 2.5. Comment

```prisma
model Comment {
  id                String    @id @default(cuid())
  content           String    @db.Text
  source            String    // Źródło komentarza (np. "google", "user")
  sentimentScore    Float?    // Wynik analizy sentymentu
  createdAt         DateTime  @default(now())
  
  // Relacje
  school            School    @relation(fields: [schoolId], references: [id], onDelete: Cascade)
  schoolId          String
}
```

### 2.6. SearchHistory

```prisma
model SearchHistory {
  id                String    @id @default(cuid())
  query             String
  filters           Json?     // Filtry wyszukiwania
  resultCount       Int
  createdAt         DateTime  @default(now())
  
  // Relacje
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId            String
}
```

### 2.7. SchoolVisit

```prisma
model SchoolVisit {
  id                String    @id @default(cuid())
  createdAt         DateTime  @default(now())
  
  // Relacje
  school            School    @relation(fields: [schoolId], references: [id], onDelete: Cascade)
  schoolId          String
  
  // Opcjonalna relacja z użytkownikiem (jeśli zalogowany)
  user              User?     @relation(fields: [userId], references: [id], onDelete: SetNull)
  userId            String?
}
```

### 2.8. ScrapingLog

```prisma
model ScrapingLog {
  id                String    @id @default(cuid())
  actorId           String    // ID aktora Apify
  runId             String    // ID uruchomienia
  status            String    // Status: "started", "succeeded", "failed"
  startedAt         DateTime  @default(now())
  finishedAt        DateTime?
  errorMessage      String?
  
  // Relacje
  user              User      @relation(fields: [userId], references: [id])
  userId            String
}
```

## 3. Indeksy i Optymalizacja

```prisma
// Indeksy dla szybkiego wyszukiwania szkół
@@index([city])
@@index([region])
@@index([type])

// Indeksy dla relacji
@@index([userId])
@@index([schoolId])
```

## 4. Migracje i Zarządzanie Schematem

### 4.1. Inicjalizacja Prisma

```bash
npx prisma init
```

### 4.2. Generowanie Migracji

```bash
npx prisma migrate dev --name init
```

### 4.3. Wdrażanie Migracji

```bash
npx prisma migrate deploy
```

### 4.4. Generowanie Klienta Prisma

```bash
npx prisma generate
```