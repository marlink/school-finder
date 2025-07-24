# School Finder Portal - Strategia Testowania

> **WAŻNE**: NIGDY nie używaj plików z folderu `-Trash`. Folder ten zawiera przestarzałe lub odrzucone dokumenty, które nie powinny być wykorzystywane w implementacji.

## 1. Przegląd

Ten dokument opisuje strategię testowania dla School Finder Portal. Obejmuje ona różne poziomy testów, narzędzia i podejścia, które będą stosowane w celu zapewnienia wysokiej jakości aplikacji.

## 2. Poziomy Testowania

### 2.1. Testy Jednostkowe

Testy jednostkowe skupiają się na testowaniu pojedynczych komponentów i funkcji w izolacji.

**Narzędzia:**
- Jest - framework testowy
- React Testing Library - biblioteka do testowania komponentów React

**Przykład testu jednostkowego:**

```tsx
// components/ui/Button.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";

describe("Button component", () => {
  it("renders correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick handler when clicked", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText("Click me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("applies variant classes correctly", () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByText("Delete");
    expect(button).toHaveClass("bg-destructive");
  });
});
```

### 2.2. Testy Integracyjne

Testy integracyjne sprawdzają, czy różne części aplikacji współpracują ze sobą poprawnie.

**Narzędzia:**
- Jest
- React Testing Library
- MSW (Mock Service Worker) - do mockowania API

**Przykład testu integracyjnego:**

```tsx
// components/search/SearchForm.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SearchForm } from "./SearchForm";
import { SearchLimitProvider } from "@/contexts/SearchLimitContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

// Mock useRouter
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("SearchForm component", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  it("submits search with correct parameters", async () => {
    render(
      <AuthProvider>
        <SearchLimitProvider>
          <SearchForm />
        </SearchLimitProvider>
      </AuthProvider>
    );

    // Fill the form
    fireEvent.change(screen.getByLabelText(/słowa kluczowe/i), {
      target: { value: "dwujęzyczna" },
    });
    fireEvent.change(screen.getByLabelText(/miasto/i), {
      target: { value: "Warszawa" },
    });

    // Submit the form
    fireEvent.click(screen.getByText(/wyszukaj/i));

    // Check if router.push was called with correct URL
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining("query=dwujęzyczna")
      );
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining("city=Warszawa")
      );
    });
  });
});
```

### 2.3. Testy E2E (End-to-End)

Testy E2E symulują rzeczywiste interakcje użytkownika z aplikacją, testując cały system od początku do końca.

**Narzędzia:**
- Cypress - framework do testów E2E

**Przykład testu E2E:**

```javascript
// cypress/e2e/search.cy.js
describe("School Search", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should search for schools and display results", () => {
    // Fill search form on homepage
    cy.get("input[placeholder*='Słowa kluczowe']").type("dwujęzyczna");
    cy.get("input[placeholder*='Miasto']").type("Warszawa");
    cy.get("button").contains("Wyszukaj").click();

    // Verify we're on the search results page
    cy.url().should("include", "/search");
    cy.url().should("include", "query=dwujęzyczna");
    cy.url().should("include", "city=Warszawa");

    // Verify results are displayed
    cy.get("[data-testid=school-card]").should("have.length.at.least", 1);
    cy.contains("Znaleziono").should("be.visible");
  });

  it("should show limit reached message for free users", () => {
    // Perform 3 searches to reach the limit
    for (let i = 0; i < 3; i++) {
      cy.get("input[placeholder*='Miasto']").clear().type(`Test ${i}`);
      cy.get("button").contains("Wyszukaj").click();
      cy.url().should("include", "/search");
      // Go back to home for next search
      if (i < 2) cy.visit("/");
    }

    // Try to perform 4th search
    cy.visit("/");
    cy.get("input[placeholder*='Miasto']").clear().type("Test 4");
    cy.get("button").contains("Wyszukaj").click();

    // Verify limit message is shown
    cy.contains("Osiągnięto limit wyszukiwań").should("be.visible");
    cy.contains("Zaloguj się lub wykup subskrypcję").should("be.visible");
  });
});
```

## 3. Testowanie API

Testowanie API zapewnia, że nasze endpointy działają zgodnie z oczekiwaniami.

**Narzędzia:**
- Jest
- Supertest - biblioteka do testowania HTTP

**Przykład testu API:**

```javascript
// __tests__/api/schools.test.js
import { createMocks } from "node-mocks-http";
import schoolsHandler from "@/pages/api/schools";

describe("/api/schools endpoint", () => {
  it("returns schools based on search parameters", async () => {
    const { req, res } = createMocks({
      method: "GET",
      query: {
        city: "Warszawa",
        type: "primary",
        page: "1",
        limit: "10",
      },
    });

    await schoolsHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty("schools");
    expect(data).toHaveProperty("total");
    expect(data).toHaveProperty("pages");
    
    // Verify schools match search criteria
    data.schools.forEach(school => {
      expect(school.city).toBe("Warszawa");
      expect(school.type).toBe("primary");
    });
  });

  it("handles pagination correctly", async () => {
    // First page
    const { req: req1, res: res1 } = createMocks({
      method: "GET",
      query: { page: "1", limit: "5" },
    });

    await schoolsHandler(req1, res1);
    const data1 = JSON.parse(res1._getData());

    // Second page
    const { req: req2, res: res2 } = createMocks({
      method: "GET",
      query: { page: "2", limit: "5" },
    });

    await schoolsHandler(req2, res2);
    const data2 = JSON.parse(res2._getData());

    // Verify different schools on different pages
    expect(data1.schools[0].id).not.toBe(data2.schools[0].id);
    expect(data1.schools.length).toBeLessThanOrEqual(5);
    expect(data2.schools.length).toBeLessThanOrEqual(5);
  });
});
```

## 4. Testowanie Wydajności

Testowanie wydajności zapewnia, że aplikacja działa szybko i efektywnie.

**Narzędzia:**
- Lighthouse - do testowania wydajności stron
- Next.js Analytics - do monitorowania metryk Web Vitals

**Metryki do monitorowania:**
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)
- Time to Interactive (TTI)

## 5. Testowanie Dostępności

Testowanie dostępności zapewnia, że aplikacja jest użyteczna dla wszystkich użytkowników, w tym osób z niepełnosprawnościami.

**Narzędzia:**
- axe-core - biblioteka do testowania dostępności
- Cypress-axe - integracja axe z Cypress

**Przykład testu dostępności:**

```javascript
// cypress/e2e/accessibility.cy.js
describe("Accessibility Tests", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.injectAxe();
  });

  it("Homepage should not have accessibility violations", () => {
    cy.checkA11y();
  });

  it("Search page should not have accessibility violations", () => {
    cy.get("button").contains("Wyszukaj").click();
    cy.url().should("include", "/search");
    cy.checkA11y();
  });

  it("Login page should not have accessibility violations", () => {
    cy.get("a").contains("Zaloguj").click();
    cy.url().should("include", "/login");
    cy.checkA11y();
  });
});
```

## 6. Ciągła Integracja (CI)

Ciągła integracja zapewnia, że testy są uruchamiane automatycznie przy każdym push'u do repozytorium.

**Narzędzia:**
- GitHub Actions - do automatyzacji testów

**Przykładowa konfiguracja GitHub Actions:**

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run unit and integration tests
        run: npm test

      - name: Build
        run: npm run build

  e2e:
    runs-on: ubuntu-latest
    needs: test

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Cypress run
        uses: cypress-io/github-action@v5
        with:
          build: npm run build
          start: npm start
          wait-on: 'http://localhost:3000'
```

## 7. Pokrycie Testami

Monitorowanie pokrycia testami pomaga zidentyfikować obszary kodu, które nie są wystarczająco przetestowane.

**Narzędzia:**
- Jest - do generowania raportów pokrycia
- Codecov - do wizualizacji i śledzenia pokrycia

**Cele pokrycia:**
- Komponenty UI: minimum 80% pokrycia
- Logika biznesowa: minimum 90% pokrycia
- API endpoints: minimum 85% pokrycia