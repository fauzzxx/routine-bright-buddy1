# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/9104fad7-a343-48a1-84ea-674e705532bc

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/9104fad7-a343-48a1-84ea-674e705532bc) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Routine videos (recordings)

Step-by-step routines (Morning, Bedtime) can show your own MP4 recordings instead of generated videos.

1. **Put your MP4s in `api/recordings/`**  
   Use the names from `api/recordings/README.md` (e.g. `brush_teeth.mp4`, `wake_up.mp4`, or the fallback names like `brushing your teeth.mp4`).

2. **Run the API locally** (for "Use my recording" to work in dev):
   ```sh
   cd api
   pip install -r requirements.txt
   uvicorn index:parent --reload --host 0.0.0.0 --port 8000
   ```
   Keep this running in a separate terminal.

3. **Run the frontend** (from the project root):
   ```sh
   npm run dev
   ```
   The app will proxy `/api` to the backend on port 8000. Open the app, add a routine from the library, open it, and click **"Use my recording"** on a step to attach the matching video.

4. **Deploying (e.g. Vercel)**  
   Include your MP4 files in `api/recordings/` in the repo so the serverless API can serve them.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/9104fad7-a343-48a1-84ea-674e705532bc) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
