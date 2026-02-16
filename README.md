# Blast Game MVP

A logic puzzle game featuring 'Block-Blast' mechanics, built with TypeScript and Cocos Creator.

[![Cocos Creator](https://img.shields.io/badge/Cocos_Creator-2.4-55C2E1?style=for-the-badge&logo=cocos&logoColor=white)](https://www.cocos.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NodeJS](https://img.shields.io/badge/NodeJS-18.20-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://www.nodejs.org/)
---
> **Legal Notice**: Copyright (c) 2026 Aleksei Gara. All rights reserved.  
> This source code is provided for **review purposes only**. Unauthorized copying, modification, or distribution is strictly prohibited.
---

## Licensing Information

### Source Code
The source code of this project is **UNLICENSED**. All rights reserved.
This code is provided for educational and review purposes only. No part of this
source code may be copied, modified, or redistributed without explicit written
permission from the author.

### Assets (Graphics, Fonts)
The visual assets contained in this project (e.g., in the `/assets/Font`, `/assets/Texture` directories)
are the property of their respective owners and are used here under __*Personal License / Limited Use License*__.

**Note on Assets:** All this visual assets are proprietary and were used with the owner's verbal permission for this technical assessment.

**The author of this repository does not claim ownership of these assets.**
Usage rights for these materials must be obtained from the original creators.

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
   git clone https://github.com/AlexeyGara/Blast-Game-MVP.git
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

| Command                  | Description                                       |
|:-------------------------|:--------------------------------------------------|
| npm run serve:web        | Start a local server to view the build in ./build |
| npm run type-check       | Run TS type-checking without building             |
| npm run type-check:watch | Run type-checking in watch mode                   |
| npm run lint             | Run ESLint check                                  |
| npm run lint:fix         | Automatically fix linting issues                  |
| npm run cleanup          | Remove build folder and temporary cache files     |
| npm run test             | Run unit tests via Jest                           |
| npm run test:coverage    | Run tests and open coverage report in browser     |
| npm run build:web-debug  | Debug build                                       |

-  **Output Path:**  
The compiled project is located in `./build` folder.

## 🚀 Deployment

The project is hosted on __GitHub Pages__.  
**Live Demo:** [alexeygara.github.io/Blast-Game-MVP/](https://alexeygara.github.io/Blast-Game-MVP/)  
**To deploy a new version, use:**
   ```bash
   npm run deploy:web
   ```
_The deployment process is managed by `./deploy-web.cjs` and includes:_
1. **Build:** Generating the web production build.
2. **Test:** Running the full test suite.
3. **Push:** Deploying the assets to the gh-pages branch.

<p align="center">
   <a href="https://alexeygara.github.io/Blast-Game-MVP/">
   <img src="./screenshots/screenshot-01.png" width="600" title="Blast-Game Gameplay Preview">
</p>