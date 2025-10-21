import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:8080", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # -> Click Home button from various pages to verify navigation returns to homepage.
        frame = context.pages[-1]
        # Click Home link to test navigation to homepage
        elem = frame.locator('xpath=html/body/div/div[2]/footer/div/div/div[2]/ul/li/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Navigate to a valid book detail page via URL to confirm book detail page loads correctly.
        await page.goto('http://localhost:8080/book/harry-potter-and-the-philosophers-stone', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Try navigating to another valid book detail page URL or verify the book ID to confirm book detail page loads correctly.
        await page.goto('http://localhost:8080/book/the-great-gatsby', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Click 'Return to Library' button to navigate back to homepage and then find a valid book detail page link to test.
        frame = context.pages[-1]
        # Click 'Return to Library' button to go back to homepage
        elem = frame.locator('xpath=html/body/div/div[2]/div/a/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on a valid book link from the homepage to navigate to its detail page and confirm it loads correctly.
        frame = context.pages[-1]
        # Click on 'Harry Potter and the Philosopher's Stone' book link from homepage to navigate to its detail page
        elem = frame.locator('xpath=html/body/div/div[2]/section/div/div/div/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        try:
            await expect(frame.locator('text=Navigation Successful').first).to_be_visible(timeout=1000)
        except AssertionError:
            raise AssertionError('Test plan execution failed: React Router navigation system did not behave as expected, including fallback to 404 and error pages.')
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    