// Playwright MCP Examples for India Water Score Project
// These examples show how to use Playwright for testing and automation

// Example 1: Test booking flow
export async function testBookingFlow(page) {
  try {
    console.log('🧪 Testing booking flow...');
    
    // Navigate to the booking page
    await page.goto('http://localhost:3000/book-now');
    
    // Wait for page to load
    await page.waitForSelector('[data-testid="school-selector"]', { timeout: 10000 });
    
    // Select a school
    await page.click('[data-testid="school-selector"]');
    await page.click('[data-testid="school-option-0"]');
    
    // Select a sport
    await page.click('[data-testid="sport-selector"]');
    await page.click('[data-testid="sport-option-0"]');
    
    // Select a date
    await page.click('[data-testid="date-picker"]');
    await page.click('[data-testid="date-tomorrow"]');
    
    // Select a time slot
    await page.click('[data-testid="time-slot-0"]');
    
    // Fill customer details
    await page.fill('[data-testid="customer-name"]', 'Test User');
    await page.fill('[data-testid="customer-email"]', 'test@example.com');
    await page.fill('[data-testid="customer-phone"]', '9876543210');
    
    // Submit booking
    await page.click('[data-testid="submit-booking"]');
    
    // Wait for confirmation
    await page.waitForSelector('[data-testid="booking-confirmation"]', { timeout: 5000 });
    
    console.log('✅ Booking flow test completed');
    return true;
  } catch (error) {
    console.error('❌ Booking flow test failed:', error);
    return false;
  }
}

// Example 2: Test admin dashboard
export async function testAdminDashboard(page) {
  try {
    console.log('🧪 Testing admin dashboard...');
    
    // Navigate to admin dashboard
    await page.goto('http://localhost:3000/admin/dashboard');
    
    // Wait for login if needed
    if (await page.locator('[data-testid="login-form"]').isVisible()) {
      await page.fill('[data-testid="email"]', 'admin@example.com');
      await page.fill('[data-testid="password"]', 'password123');
      await page.click('[data-testid="login-button"]');
    }
    
    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="dashboard-stats"]', { timeout: 10000 });
    
    // Check if stats are displayed
    const statsVisible = await page.locator('[data-testid="dashboard-stats"]').isVisible();
    console.log('Dashboard stats visible:', statsVisible);
    
    // Test live bookings section
    await page.click('[data-testid="live-bookings-tab"]');
    await page.waitForSelector('[data-testid="bookings-list"]', { timeout: 5000 });
    
    // Test filters
    await page.click('[data-testid="filter-today"]');
    await page.waitForTimeout(1000);
    
    console.log('✅ Admin dashboard test completed');
    return true;
  } catch (error) {
    console.error('❌ Admin dashboard test failed:', error);
    return false;
  }
}

// Example 3: Test payment flow
export async function testPaymentFlow(page) {
  try {
    console.log('🧪 Testing payment flow...');
    
    // Navigate to payment page
    await page.goto('http://localhost:3000/deposit');
    
    // Wait for payment form
    await page.waitForSelector('[data-testid="payment-form"]', { timeout: 10000 });
    
    // Fill payment details
    await page.fill('[data-testid="amount"]', '500');
    await page.selectOption('[data-testid="payment-method"]', 'upi');
    
    // Upload payment screenshot
    const fileInput = page.locator('[data-testid="screenshot-upload"]');
    await fileInput.setInputFiles('./test-payment-screenshot.png');
    
    // Fill UTR
    await page.fill('[data-testid="utr"]', 'TEST123456789');
    
    // Submit payment
    await page.click('[data-testid="submit-payment"]');
    
    // Wait for confirmation
    await page.waitForSelector('[data-testid="payment-confirmation"]', { timeout: 5000 });
    
    console.log('✅ Payment flow test completed');
    return true;
  } catch (error) {
    console.error('❌ Payment flow test failed:', error);
    return false;
  }
}

// Example 4: Take screenshots for documentation
export async function takeScreenshots(page) {
  try {
    console.log('📸 Taking screenshots...');
    
    // Homepage screenshot
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: './screenshots/homepage.png', fullPage: true });
    
    // Booking page screenshot
    await page.goto('http://localhost:3000/book-now');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: './screenshots/booking-page.png', fullPage: true });
    
    // Admin dashboard screenshot
    await page.goto('http://localhost:3000/admin/dashboard');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: './screenshots/admin-dashboard.png', fullPage: true });
    
    console.log('✅ Screenshots taken successfully');
    return true;
  } catch (error) {
    console.error('❌ Screenshot capture failed:', error);
    return false;
  }
}

// Example 5: Performance testing
export async function performanceTest(page) {
  try {
    console.log('⚡ Running performance test...');
    
    // Start performance measurement
    await page.coverage.startJSCoverage();
    
    // Navigate to homepage
    const startTime = Date.now();
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Get performance metrics
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      };
    });
    
    // Stop coverage
    const coverage = await page.coverage.stopJSCoverage();
    const totalBytes = coverage.reduce((total, entry) => total + entry.text.length, 0);
    const usedBytes = coverage.reduce((total, entry) => total + entry.ranges.reduce((sum, range) => sum + range.end - range.start, 0), 0);
    const coveragePercentage = (usedBytes / totalBytes) * 100;
    
    console.log('Performance Metrics:');
    console.log(`- Page load time: ${loadTime}ms`);
    console.log(`- DOM content loaded: ${metrics.domContentLoaded}ms`);
    console.log(`- First paint: ${metrics.firstPaint}ms`);
    console.log(`- First contentful paint: ${metrics.firstContentfulPaint}ms`);
    console.log(`- JavaScript coverage: ${coveragePercentage.toFixed(2)}%`);
    
    console.log('✅ Performance test completed');
    return true;
  } catch (error) {
    console.error('❌ Performance test failed:', error);
    return false;
  }
}

// Example 6: Mobile responsiveness test
export async function mobileResponsivenessTest(page) {
  try {
    console.log('📱 Testing mobile responsiveness...');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Test homepage on mobile
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: './screenshots/mobile-homepage.png' });
    
    // Test booking page on mobile
    await page.goto('http://localhost:3000/book-now');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: './screenshots/mobile-booking.png' });
    
    // Test navigation menu
    await page.click('[data-testid="mobile-menu-toggle"]');
    await page.waitForTimeout(500);
    await page.screenshot({ path: './screenshots/mobile-menu.png' });
    
    console.log('✅ Mobile responsiveness test completed');
    return true;
  } catch (error) {
    console.error('❌ Mobile responsiveness test failed:', error);
    return false;
  }
}

// Main test runner
export async function runAllTests(page) {
  console.log('🚀 Starting comprehensive test suite...\n');
  
  const results = {
    bookingFlow: await testBookingFlow(page),
    adminDashboard: await testAdminDashboard(page),
    paymentFlow: await testPaymentFlow(page),
    screenshots: await takeScreenshots(page),
    performance: await performanceTest(page),
    mobile: await mobileResponsivenessTest(page)
  };
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
  console.log('Results:', results);
  
  return results;
}
