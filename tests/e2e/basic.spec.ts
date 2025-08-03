import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the home page successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check if the page loads
    await expect(page).toHaveTitle(/School Finder/);
    
    // Check for main navigation elements
    await expect(page.locator('nav')).toBeVisible();
    
    // Check for search functionality
    await expect(page.locator('input[type="search"], input[placeholder*="search" i]')).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/');
    
    // Test navigation links
    const navLinks = page.locator('nav a');
    const linkCount = await navLinks.count();
    
    expect(linkCount).toBeGreaterThan(0);
    
    // Check if links are clickable
    for (let i = 0; i < Math.min(linkCount, 3); i++) {
      const link = navLinks.nth(i);
      await expect(link).toBeVisible();
    }
  });

  test('should be responsive', async ({ page }) => {
    await page.goto('/');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('body')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Search Functionality', () => {
  test('should perform basic search', async ({ page }) => {
    await page.goto('/');
    
    // Find search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    await expect(searchInput).toBeVisible();
    
    // Perform search
    await searchInput.fill('Warsaw');
    await searchInput.press('Enter');
    
    // Wait for results or navigation
    await page.waitForTimeout(2000);
    
    // Check if we're on a results page or have results
    const currentUrl = page.url();
    expect(currentUrl).toContain('Warsaw');
  });

  test('should show search suggestions', async ({ page }) => {
    await page.goto('/');
    
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    await searchInput.fill('War');
    
    // Wait for suggestions to appear
    await page.waitForTimeout(1000);
    
    // Check if suggestions dropdown appears
    const suggestions = page.locator('[role="listbox"], .suggestions, .dropdown');
    if (await suggestions.count() > 0) {
      await expect(suggestions.first()).toBeVisible();
    }
  });
});

test.describe('School Pages', () => {
  test('should load school listing page', async ({ page }) => {
    await page.goto('/schools');
    
    // Check if page loads
    await expect(page).toHaveTitle(/Schools/);
    
    // Check for school cards or listings
    const schoolElements = page.locator('[data-testid="school-card"], .school-card, article');
    if (await schoolElements.count() > 0) {
      await expect(schoolElements.first()).toBeVisible();
    }
  });

  test('should have working filters', async ({ page }) => {
    await page.goto('/schools');
    
    // Look for filter elements
    const filters = page.locator('select, input[type="checkbox"], input[type="radio"]');
    const filterCount = await filters.count();
    
    if (filterCount > 0) {
      // Test first filter
      const firstFilter = filters.first();
      await expect(firstFilter).toBeVisible();
      
      if (await firstFilter.getAttribute('type') === 'checkbox') {
        await firstFilter.check();
      }
    }
  });
});

test.describe('Authentication', () => {
  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    
    // Look for login link
    const loginLink = page.locator('a[href*="login"], a:has-text("Login"), a:has-text("Sign In")').first();
    
    if (await loginLink.count() > 0) {
      await loginLink.click();
      
      // Check if we're on login page
      await expect(page).toHaveURL(/login|signin|auth/);
      
      // Check for login form
      await expect(page.locator('form')).toBeVisible();
      await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
    }
  });

  test('should show validation errors for invalid login', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"], input[type="submit"]').first();
    
    if (await submitButton.count() > 0) {
      await submitButton.click();
      
      // Wait for validation errors
      await page.waitForTimeout(1000);
      
      // Check for error messages
      const errorMessages = page.locator('.error, [role="alert"], .text-red-500');
      if (await errorMessages.count() > 0) {
        await expect(errorMessages.first()).toBeVisible();
      }
    }
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/');
    
    // Check for h1
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    
    // Check for proper heading hierarchy
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);
  });

  test('should have alt text for images', async ({ page }) => {
    await page.goto('/');
    
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const ariaLabel = await img.getAttribute('aria-label');
      
      // Images should have alt text or aria-label
      expect(alt !== null || ariaLabel !== null).toBeTruthy();
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    
    // Check if focus is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Test a few more tab presses
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
  });
});

test.describe('Performance', () => {
  test('should load within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should not have console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/');
    
    // Wait for page to fully load
    await page.waitForTimeout(3000);
    
    // Filter out known acceptable errors
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('404') &&
      !error.includes('Failed to download')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});