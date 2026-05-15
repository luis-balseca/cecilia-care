# Cecilia's Care Hub

A private family web app to track Cecilia's cancer treatment — appointments, notes, medications, and contacts — all in one place.

## Features
- 📋 Patient overview dashboard
- 📅 Appointment tracker
- ✎ Mum's personal notepad (for use during appointments)
- 💊 Medication tracker
- 📞 Contacts (hospital, GP, family)
- 💾 All data saves locally to the device (no server needed)
- 📱 Mobile-friendly

## Deploying to GitHub Pages (step by step)

### Step 1 — Create a GitHub account
Go to https://github.com and sign up if you don't have an account.

### Step 2 — Create a new repository
1. Click the **+** button (top right) → **New repository**
2. Name it: `cecilia-care` (or anything you like)
3. Set it to **Public** (required for free GitHub Pages)
4. Click **Create repository**

### Step 3 — Upload the files
1. On your new repo page, click **uploading an existing file**
2. Drag and drop all three files: `index.html`, `style.css`, `app.js`
3. Scroll down and click **Commit changes**

### Step 4 — Enable GitHub Pages
1. Go to your repo → **Settings** tab
2. Scroll to **Pages** in the left sidebar
3. Under **Source**, select **Deploy from a branch**
4. Set branch to **main**, folder to **/ (root)**
5. Click **Save**

### Step 5 — Get your link
After ~1 minute, GitHub will show your live URL:
```
https://YOUR-USERNAME.github.io/cecilia-care/
```
Share this link with Anita and Santi — it works on any device, no login needed.

## Notes
- All data is stored in the browser's localStorage on each device
- Each family member's data is local to their own device/browser
- To share appointment data, use the Export feature and share the JSON file
