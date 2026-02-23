from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_default_timeout(60000)

        # Wait for server to be fully ready
        print("Waiting for server...")
        time.sleep(15)

        # Home Page (ID)
        print("Navigating to /id...")
        try:
            page.goto("http://localhost:9999/id", wait_until="networkidle")
            time.sleep(5)
            page.screenshot(path="verification/home_id.png", full_page=True)
            print("Home ID screenshot saved.")
        except Exception as e:
            print(f"Error Home ID: {e}")

        # About Page (ID)
        print("Navigating to /id/about...")
        try:
            page.goto("http://localhost:9999/id/about", wait_until="networkidle")
            time.sleep(5)
            page.screenshot(path="verification/about_id.png", full_page=True)
            print("About ID screenshot saved.")
        except Exception as e:
            print(f"Error About ID: {e}")

        browser.close()

if __name__ == "__main__":
    run()
