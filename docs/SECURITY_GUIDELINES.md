# School Finder Portal - Wytyczne Bezpieczeństwa

## 1. Przegląd

Ten dokument zawiera wytyczne bezpieczeństwa dla School Finder Portal. Bezpieczeństwo jest kluczowym aspektem naszej aplikacji, szczególnie ze względu na przetwarzanie danych osobowych użytkowników i integrację z zewnętrznymi API.

## 2. Uwierzytelnianie i Autoryzacja

### 2.1. NextAuth.js

Używamy NextAuth.js do zarządzania uwierzytelnianiem. Poniżej znajdują się kluczowe aspekty konfiguracji:

```typescript
// lib/auth.ts (fragment)
import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import { Adapter } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dni
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    signOut: "/logout",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role as string;
        session.user.subscription = token.subscription as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role || "user";
        token.subscription = user.subscription || "free";
      }
      return token;
    },
  },
};
```

### 2.2. Middleware do Ochrony Tras

Używamy middleware Next.js do ochrony tras wymagających uwierzytelnienia:

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuthenticated = !!token;
  const isAdmin = token?.role === "admin";
  const isPremium = token?.subscription === "premium";

  // Chronione trasy dla zalogowanych użytkowników
  if (request.nextUrl.pathname.startsWith("/profile") && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Chronione trasy dla administratorów
  if (request.nextUrl.pathname.startsWith("/admin") && !isAdmin) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Chronione trasy dla użytkowników premium
  if (request.nextUrl.pathname.startsWith("/premium") && !isPremium) {
    return NextResponse.redirect(new URL("/subscription", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/admin/:path*", "/premium/:path*"],
};
```

## 3. Ochrona API

### 3.1. Walidacja Danych Wejściowych

Wszystkie dane wejściowe powinny być walidowane przed przetworzeniem. Używamy Zod do walidacji danych:

```typescript
// pages/api/schools/index.ts (fragment)
import { z } from "zod";

const searchParamsSchema = z.object({
  query: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  type: z.string().optional(),
  page: z.string().transform(Number).default("1"),
  limit: z.string().transform(Number).default("10"),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const params = searchParamsSchema.parse(req.query);
    // Przetwarzanie zapytania...
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid search parameters", details: error.errors });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}
```

### 3.2. Limitowanie Zapytań (Rate Limiting)

Implementujemy limitowanie zapytań, aby zapobiec nadużyciom API:

```typescript
// lib/rate-limit.ts
import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";

type LimitOptions = {
  limit: number;
  windowMs: number;
};

const defaultOptions: LimitOptions = {
  limit: 5, // 5 zapytań
  windowMs: 60 * 60 * 1000, // 1 godzina
};

const ipRequestMap = new Map<string, { count: number; resetTime: number }>();
const userRequestMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(options: Partial<LimitOptions> = {}) {
  const { limit, windowMs } = { ...defaultOptions, ...options };

  return async function rateLimitMiddleware(
    req: NextApiRequest,
    res: NextApiResponse,
    next: () => void
  ) {
    // Pobierz token użytkownika
    const token = await getToken({ req });
    const userId = token?.sub;

    // Użyj ID użytkownika lub adresu IP jako klucza
    const key = userId || req.headers["x-forwarded-for"]?.toString() || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const map = userId ? userRequestMap : ipRequestMap;

    // Sprawdź czy użytkownik ma już wpis
    const current = map.get(key);

    // Jeśli nie ma wpisu lub czas resetowania minął, utwórz nowy wpis
    if (!current || current.resetTime < now) {
      map.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    // Jeśli limit został przekroczony, zwróć błąd
    if (current.count >= limit) {
      return res.status(429).json({
        error: "Too many requests",
        resetTime: current.resetTime,
      });
    }

    // Zwiększ licznik zapytań
    current.count += 1;
    return next();
  };
}
```

## 4. Bezpieczne Przechowywanie Danych

### 4.1. Zmienne Środowiskowe

Wszystkie wrażliwe dane, takie jak klucze API i hasła, powinny być przechowywane jako zmienne środowiskowe:

```plaintext
# .env.local (przykład)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

DATABASE_URL=your-database-url

APIFY_API_TOKEN=your-apify-token

STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

### 4.2. Szyfrowanie Danych Wrażliwych

Wrażliwe dane w bazie danych powinny być szyfrowane:

```typescript
// lib/encryption.ts
import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!; // Musi być 32 bajtów (256 bitów)
const IV_LENGTH = 16; // Dla AES, IV to zawsze 16 bajtów

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export function decrypt(text: string): string {
  const textParts = text.split(":");
  const iv = Buffer.from(textParts.shift()!, "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
```

## 5. Bezpieczeństwo Frontendu

### 5.1. Content Security Policy (CSP)

Implementujemy CSP, aby zapobiec atakom XSS i innym zagrożeniom:

```typescript
// next.config.js (fragment)
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://maps.googleapis.com https://js.stripe.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https://*.googleapis.com https://*.gstatic.com;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://api.stripe.com;
  frame-src 'self' https://js.stripe.com;
`;

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: ContentSecurityPolicy.replace(/\s{2,}/g, " ").trim(),
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
];

module.exports = {
  // ...
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};
```

### 5.2. Ochrona przed CSRF

NextAuth.js zapewnia ochronę przed CSRF, ale dodatkowo implementujemy własne zabezpieczenia dla niezabezpieczonych endpointów:

```typescript
// lib/csrf.ts
import { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function setCsrfCookie(res: NextApiResponse): string {
  const token = generateCsrfToken();
  res.setHeader("Set-Cookie", `csrf-token=${token}; Path=/; HttpOnly; SameSite=Strict`);
  return token;
}

export function validateCsrfToken(req: NextApiRequest): boolean {
  const cookieToken = req.cookies["csrf-token"];
  const headerToken = req.headers["x-csrf-token"];
  
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return false;
  }
  
  return true;
}
```

## 6. Bezpieczne Integracje z Zewnętrznymi API

### 6.1. Apify

Przy korzystaniu z Apify do scrapowania danych, stosujemy następujące zasady bezpieczeństwa:

```typescript
// pages/api/scrape.ts (fragment)
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";
import { ApifyClient } from "apify-client";

const limiter = rateLimit({
  limit: 5, // 5 zapytań na godzinę
  windowMs: 60 * 60 * 1000, // 1 godzina
});

const scrapeParamsSchema = z.object({
  actorId: z.string(),
  input: z.record(z.any()),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Sprawdź metodę HTTP
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Sprawdź sesję użytkownika
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Zastosuj rate limiting
  try {
    await new Promise((resolve, reject) => {
      limiter(req, res, (result) => {
        if (result instanceof Error) {
          return reject(result);
        }
        resolve(result);
      });
    });
  } catch (error) {
    return res.status(429).json({ error: "Too many requests" });
  }

  // Waliduj parametry
  try {
    const { actorId, input } = scrapeParamsSchema.parse(req.body);
    
    // Inicjalizuj klienta Apify
    const apifyClient = new ApifyClient({
      token: process.env.APIFY_API_TOKEN,
    });

    // Uruchom aktora
    const run = await apifyClient.actor(actorId).call(input);
    
    // Zapisz informacje o scrapowaniu w bazie danych
    await prisma.scrapingLog.create({
      data: {
        userId: session.user.id,
        actorId,
        input: JSON.stringify(input),
        runId: run.id,
        status: "completed",
      },
    });

    // Pobierz dane
    const dataset = await apifyClient.dataset(run.defaultDatasetId).listItems();
    return res.status(200).json({ data: dataset.items });
  } catch (error) {
    console.error("Scraping error:", error);
    return res.status(500).json({ error: "Scraping failed" });
  }
}
```

## 7. Audyt i Monitorowanie

### 7.1. Logowanie Zdarzeń

Implementujemy logowanie zdarzeń związanych z bezpieczeństwem:

```typescript
// lib/logger.ts
type LogLevel = "info" | "warn" | "error";
type LogEvent = {
  level: LogLevel;
  message: string;
  userId?: string;
  action?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
};

const logs: LogEvent[] = [];

export function log(level: LogLevel, message: string, options?: {
  userId?: string;
  action?: string;
  metadata?: Record<string, any>;
}) {
  const event: LogEvent = {
    level,
    message,
    userId: options?.userId,
    action: options?.action,
    metadata: options?.metadata,
    timestamp: new Date(),
  };

  logs.push(event);
  console[level](message, options);

  // W środowisku produkcyjnym można wysłać logi do zewnętrznego serwisu
  if (process.env.NODE_ENV === "production") {
    // Implementacja wysyłania logów do serwisu monitorującego
  }
}

export const logger = {
  info: (message: string, options?: Omit<LogEvent, "level" | "message" | "timestamp">) => log("info", message, options),
  warn: (message: string, options?: Omit<LogEvent, "level" | "message" | "timestamp">) => log("warn", message, options),
  error: (message: string, options?: Omit<LogEvent, "level" | "message" | "timestamp">) => log("error", message, options),
};
```

### 7.2. Regularne Audyty Bezpieczeństwa

Przeprowadzamy regularne audyty bezpieczeństwa, w tym:

1. Skanowanie zależności pod kątem podatności (npm audit)
2. Testy penetracyjne
3. Przegląd kodu pod kątem bezpieczeństwa
4. Monitorowanie logów pod kątem podejrzanych działań