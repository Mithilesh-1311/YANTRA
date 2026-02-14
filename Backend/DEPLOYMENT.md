# Deploying Yantra Hackathon Backend to Render

This guide will help you deploy your Node.js backend to **Render** (a cloud hosting platform).

## Prerequisites

1.  **GitHub Repository**: Ensure your code is pushed to GitHub.
2.  **Render Account**: Create an account at [render.com](https://render.com).

## Step 1: Create a New Web Service on Render

1.  Click **New +** and select **Web Service**.
2.  Connect your GitHub repository (`Mithilesh-1311/YANTRA`).
3.  Select the **backend** directory (or if your repo root is the backend, leave it blank).
    *   *Note based on your file structure*: Your backend code is in the `Backend` folder. You might need to set the **Root Directory** to `Backend` in Render settings.

## Step 2: Configure the Service

Fill in the details:

*   **Name**: `yantra-backend` (or any unique name)
*   **Region**: Singapore (or nearest to you)
*   **Branch**: `main` (or your working branch)
*   **Root Directory**: `Backend` (Important! This tells Render where your `package.json` is)
*   **Runtime**: **Node**
*   **Build Command**: `npm install`
*   **Start Command**: `npm start` (or `node server.js`)

## Step 3: Environment Variables

Click on **Advanced** or **Environment** tab and add the following variables. **Copy these from your local `.env` file**:

| Key | Value |
| :--- | :--- |
| `SUPABASE_URL` | *(Your Supabase URL)* |
| `SUPABASE_SERVICE_ROLE_KEY` | *(Your Supabase Service Role Key)* |
| `NODE_VERSION` | `20` (Optional, good for stability) |

## Step 4: Deploy

Click **Create Web Service**. Render will start building your app. Watch the logs for "Build successful" and "Server running on...".

Once deployed, Render will give you a URL (e.g., `https://yantra-backend.onrender.com`).

---

## Step 5: Connecting the Python Generator

Your Python script (`Backend/Machine Learning/generator (1).py`) currently sends data to `http://localhost:5000/update`. You need to update it to point to your new Render URL.

1.  Open `Backend/Machine Learning/generator (1).py`.
2.  Find the `API_URL` or the requests URL.
3.  Change it from:
    ```python
    url = "http://localhost:5000/update"
    ```
    To:
    ```python
    url = "https://your-app-name.onrender.com/update"
    ```
4.  Run the Python script locally to start feeding data to your live cloud backend!

---

## Troubleshooting

*   **Health Check**: Visit `https://your-app-name.onrender.com/` to see "Backend is operational".
*   **Logs**: Check the **Logs** tab in Render if the deployment fails.
