# School Finder Portal - Endpointy API

> **WAŻNE**: NIGDY nie używaj plików z folderu `-Trash`. Folder ten zawiera przestarzałe lub odrzucone dokumenty, które nie powinny być wykorzystywane w implementacji.

## 1. Przegląd

School Finder Portal wykorzystuje API Routes w Next.js do obsługi operacji na danych. Poniżej znajduje się lista wszystkich endpointów API z ich opisami, parametrami i przykładowymi odpowiedziami.

## 2. Endpointy Szkół

### 2.1. Wyszukiwanie Szkół

- **Endpoint**: `GET /api/schools/search`
- **Opis**: Wyszukuje szkoły na podstawie podanych kryteriów
- **Parametry**:
  - `query`: Tekst wyszukiwania (opcjonalny)
  - `city`: Miasto (opcjonalny)
  - `region`: Region (opcjonalny)
  - `type`: Typ szkoły (opcjonalny)
  - `page`: Numer strony (domyślnie 1)
  - `limit`: Limit wyników na stronę (domyślnie 10)
- **Przykładowa odpowiedź**:

```json
{
  "schools": [
    {
      "id": "clj2x5a0b0000qw3f8g7h6j5k",
      "name": "Szkoła Podstawowa nr 1",
      "type": "primary",
      "city": "Warszawa",
      "region": "Mazowieckie",
      "googleRating": 4.5,
      "sentimentScore": 0.8
    }
  ],
  "pagination": {
    "total": 120,
    "page": 1,
    "limit": 10,
    "pages": 12
  }
}
```

### 2.2. Szczegóły Szkoły

- **Endpoint**: `GET /api/schools/[id]`
- **Opis**: Pobiera szczegółowe informacje o szkole
- **Parametry**:
  - `id`: ID szkoły (w ścieżce URL)
- **Przykładowa odpowiedź**:

```json
{
  "id": "clj2x5a0b0000qw3f8g7h6j5k",
  "name": "Szkoła Podstawowa nr 1",
  "type": "primary",
  "address": "ul. Szkolna 1",
  "city": "Warszawa",
  "region": "Mazowieckie",
  "postalCode": "00-001",
  "phone": "+48 123 456 789",
  "email": "kontakt@sp1.edu.pl",
  "website": "https://sp1.edu.pl",
  "googleRating": 4.5,
  "googleRatingCount": 120,
  "sentimentScore": 0.8,
  "latitude": 52.2297,
  "longitude": 21.0122,
  "ratings": {
    "average": 4.2,
    "count": 45
  },
  "comments": [
    {
      "content": "Świetna szkoła z dobrą kadrą.",
      "source": "google",
      "sentimentScore": 0.9,
      "createdAt": "2023-06-15T10:30:00Z"
    }
  ]
}
```

## 3. Endpointy Użytkowników

### 3.1. Profil Użytkownika

- **Endpoint**: `GET /api/user/profile`
- **Opis**: Pobiera profil zalogowanego użytkownika
- **Uwierzytelnianie**: Wymagane
- **Przykładowa odpowiedź**:

```json
{
  "id": "clj2x5a0b0001qw3f8g7h6j5l",
  "name": "Jan Kowalski",
  "email": "jan@example.com",
  "role": "user",
  "subscriptionStatus": "premium",
  "subscriptionEnd": "2024-06-15T00:00:00Z",
  "createdAt": "2023-01-15T10:30:00Z"
}
```

### 3.2. Ulubione Szkoły

- **Endpoint**: `GET /api/user/favorites`
- **Opis**: Pobiera listę ulubionych szkół użytkownika
- **Uwierzytelnianie**: Wymagane
- **Parametry**:
  - `page`: Numer strony (domyślnie 1)
  - `limit`: Limit wyników na stronę (domyślnie 10)
- **Przykładowa odpowiedź**:

```json
{
  "favorites": [
    {
      "id": "clj2x5a0b0002qw3f8g7h6j5m",
      "school": {
        "id": "clj2x5a0b0000qw3f8g7h6j5k",
        "name": "Szkoła Podstawowa nr 1",
        "type": "primary",
        "city": "Warszawa",
        "region": "Mazowieckie",
        "googleRating": 4.5
      },
      "createdAt": "2023-06-20T14:25:00Z"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

### 3.3. Dodawanie do Ulubionych

- **Endpoint**: `POST /api/user/favorites`
- **Opis**: Dodaje szkołę do ulubionych
- **Uwierzytelnianie**: Wymagane
- **Parametry**:
  - `schoolId`: ID szkoły
- **Przykładowa odpowiedź**:

```json
{
  "success": true,
  "favorite": {
    "id": "clj2x5a0b0003qw3f8g7h6j5n",
    "schoolId": "clj2x5a0b0000qw3f8g7h6j5k",
    "createdAt": "2023-06-25T09:15:00Z"
  }
}
```

## 4. Endpointy Ocen

### 4.1. Dodawanie Oceny

- **Endpoint**: `POST /api/ratings`
- **Opis**: Dodaje ocenę dla szkoły
- **Uwierzytelnianie**: Wymagane
- **Parametry**:
  - `schoolId`: ID szkoły
  - `value`: Wartość oceny (1-5)
- **Przykładowa odpowiedź**:

```json
{
  "success": true,
  "rating": {
    "id": "clj2x5a0b0004qw3f8g7h6j5o",
    "value": 5,
    "schoolId": "clj2x5a0b0000qw3f8g7h6j5k",
    "createdAt": "2023-06-25T10:20:00Z"
  }
}
```

## 5. Endpointy Subskrypcji

### 5.1. Tworzenie Sesji Płatności

- **Endpoint**: `POST /api/subscription/create-checkout-session`
- **Opis**: Tworzy sesję płatności Stripe
- **Uwierzytelnianie**: Wymagane
- **Parametry**:
  - `priceId`: ID ceny w Stripe
- **Przykładowa odpowiedź**:

```json
{
  "sessionId": "cs_test_a1b2c3d4e5f6g7h8i9j0",
  "url": "https://checkout.stripe.com/pay/cs_test_a1b2c3d4e5f6g7h8i9j0"
}
```

## 6. Endpointy Administracyjne

### 6.1. Statystyki

- **Endpoint**: `GET /api/admin/stats`
- **Opis**: Pobiera statystyki portalu
- **Uwierzytelnianie**: Wymagane (tylko admin)
- **Przykładowa odpowiedź**:

```json
{
  "users": {
    "total": 1250,
    "premium": 320,
    "newLast7Days": 45
  },
  "schools": {
    "total": 5430,
    "byType": {
      "primary": 2100,
      "high_school": 980,
      "kindergarten": 1350,
      "other": 1000
    }
  },
  "searches": {
    "total": 28450,
    "last7Days": 4320
  },
  "ratings": {
    "total": 8750,
    "last7Days": 980
  }
}
```

### 6.2. Uruchamianie Scrapingu

- **Endpoint**: `POST /api/admin/scrape`
- **Opis**: Uruchamia zadanie scrapingu danych
- **Uwierzytelnianie**: Wymagane (tylko admin)
- **Parametry**:
  - `actorId`: ID aktora Apify
  - `input`: Parametry wejściowe dla aktora
- **Przykładowa odpowiedź**:

```json
{
  "success": true,
  "runId": "XYZ123",
  "status": "started"
}
```