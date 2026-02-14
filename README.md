# Blast Game MVP

A logic puzzle game featuring 'Block-Blast' mechanics, built with TypeScript and Cocos Creator.

[![Node.js Version](https://img.shields.io)](https://nodejs.org)
[![Cocos Creator](https://img.shields.io)](https://www.cocos.com)

---
> **Legal Notice**: Copyright (c) 2026 Aleksei Gara. All rights reserved.  
> This source code is provided for **review purposes only**. Unauthorized copying, modification, or distribution is strictly prohibited.
---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js**: 18.x or higher
- **npm**: (comes with Node.js)
- **rimraf**: (global or project-level)
- **Cocos Creator**: 2.4.x
- **gh-pages CLI**: For deployment

## ⚙️ Setup & Build
1. **Clone the repository:**
   ```bash
   git clone https://github.com
   cd Blast-Game-MVP
2. **Install dependencies:**
    ```bash
    npm install
3. **Configure Cocos Creator Path:**  
   Open package.json and update the cocos script with the absolute path to your Cocos Creator executable:
    ```json
    "scripts": {
        ...
        "cocos": "/Applications/Cocos/Creator/2.4.15/CocosCreator.app/Contents/MacOS/CocosCreator",
        ...
    }
5. **Build the project:**
    ```bash
    npm run build:web

## 🛠 Development & Scripts

-   **Configuration Files:**
>- tsconfig.json — TypeScript compilation settings.
>- .eslintrc.cjs — ESLint v8 configuration (Legacy format).
>- jest.config.cjs — Jest testing framework settings.
>- build-web.json / build-web-debug.json — Cocos Creator CLI build profiles.

-   **Useful Commands:**  

| Command                                                             | Description                                       |
|:--------------------------------------------------------------------|:--------------------------------------------------|
| npm run serve:web                                                   | Start a local server to view the build in ./build |
| npm run type-check                                                  | Run TS type-checking without building             |
| npm run type-check:watch                                            | Run type-checking in watch mode                   |
| npm run lint                                                        | Run ESLint check                                  |
| npm run lint:fix                                                    | Automatically fix linting issues                  |
| npm run cleanup                                                     | Remove build folder and temporary cache files     |
| npm run test                                                        | Run unit tests via Jest                           |
| npm run test:coverage | Run tests and open coverage report in browser     |

