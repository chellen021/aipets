# Mengchong Huoban - CMS (Strapi)

This is the Content Management System (CMS) for the Mengchong Huoban (萌宠伙伴) WeChat Mini Program, built with Strapi.

## Prerequisites

- Node.js (v18.x or v20.x recommended - see `package.json` engines)
- npm or yarn
- PostgreSQL (running instance recommended, or SQLite for quick local dev)

## Getting Started

1.  **Clone the repository (or ensure you are in the `cms` directory of the main project).**

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the `cms` root directory by copying from `.env.example`:
    ```bash
    cp .env.example .env
    ```
    Then, update the `.env` file with your specific configurations (e.g., database credentials, APP_KEYS, JWT secrets). **Crucially, generate new secure values for `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, and `TRANSFER_TOKEN_SALT`.** You can use `openssl rand -base64 32` for each part of these keys.
    Also, update the `uuid` in `package.json` -> `strapi` section with a unique UUID for your project (e.g., using an online UUID generator).

4.  **Build the Strapi admin panel (if not already built or if dependencies change significantly):**
    ```bash
    npm run build
    # or
    # yarn build
    ```

5.  **Run the development server:**
    ```bash
    npm run develop
    # or
    # yarn develop
    ```
    The server will start, typically on `http://localhost:1337`. The first time you run it, Strapi will guide you to create an administrator account.

6.  **Run the production server:**
    ```bash
    npm start
    # or
    # yarn start
    ```

## Project Structure (Initial - Strapi typical structure will be generated)

Strapi has a conventional project structure. After running `npm install` and `npm run develop` for the first time, or by manually creating the initial files, it will look something like this:

```
cms/
├── config/                 # Strapi configurations (server, database, plugins, etc.)
│   ├── admin.js
│   ├── api.js
│   ├── database.js
│   ├── middlewares.js
│   ├── plugins.js
│   └── server.js
├── src/                    # Source code for your application
│   ├── admin/              # Admin panel customizations
│   ├── api/                # Content-Types (collections, single types) logic
│   ├── components/         # Reusable components for content types
│   ├── extensions/         # Extensions for plugins
│   ├── policies/           # Custom policies for routes
│   ├── services/           # Custom services
│   ├── index.js            # Server bootstrap
│   └── bootstrap.js        # (Optional) Custom bootstrap logic
├── public/                 # Publicly accessible files (e.g., uploads if not using a provider)
├── .env.example            # Example environment variables
├── .gitignore              # Git ignore file
├── package.json            # Project dependencies and scripts
└── README.md               # This file
```

## Content Modeling & Further Development

Refer to the `cms.md` and `solution.md` documents for detailed design specifications, content types to be created, and architecture.

Use the Strapi Admin Panel (Content-Types Builder) to define your data structures (Collections, Single Types, Components) as outlined in `cms.md`.

Key areas for development within Strapi:
- Defining Content Types (e.g., ShopProduct, CheckinRewardRule, AppUser, Pet)
- Setting up Roles & Permissions for CMS users
- Configuring API tokens for backend service access
- Potentially custom controllers or services if advanced logic is needed within the CMS.