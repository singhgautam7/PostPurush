![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Local First](https://img.shields.io/badge/local--first-yes-purple)
![Mobile Friendly](https://img.shields.io/badge/Mobile_Friendly-Yes-orange)

# PostPurush
A modern API client for testing, analyzing, and documenting APIs — which sits entirely in the browser.
Built with Next.js App Router and Tailwind CSS.


## 🖼 Screenshots

### Collections
![Collections](./docs/how-to/assets/05-response.png)

### Analytics Dashboard
![Analytics](./docs/how-to/assets/09-analytics.png)

### Environments
![Environments](./docs/how-to/assets/08-env-edit.png)

### API Documentation Generator
![Docs](./docs/how-to/assets/14-doc-export-pdf.png)

### Test your APIS
![Testing](./docs/how-to/assets/16-test-apis.png)

### Multiple Themes
![Themes](./docs/how-to/assets/15-multiple-themes-doc.png)


## 🧠 Architecture Highlights

- **Local-First Design** – All data is stored in IndexedDB. No backend required.
- **No Accounts Required** – No sign-ups, no tracking, no external servers.
- **Modular Feature Architecture** – Each major feature (Collections, Environments, Analytics, Docs) is isolated into independent modules.
- **Optimized Rendering** – Next.js + Zustand ensures fast UI updates even with large collections.


## 🛠 Tech Stack
- **Framework**: Next.js 14+ (App Router), React, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI, Radix UI Primitives
- **State Management**: Zustand
- **Local Storage / DB**: IndexedDB (`idb`)
- **Data Visualization**: Recharts
- **Code Editor / Syntax Highlighting**: `@uiw/react-codemirror`
- **PDF Generation**: `@react-pdf/renderer`
- **Icons**: Lucide React
- **Drag & Drop**: `@dnd-kit`

## 💻 Getting Started

### Prerequisites
Make sure you have Node.js and a package manager installed. I used `bun` for my setup.

### 1. Clone the repository
```bash
git clone https://github.com/singhgautam7/PostPurush.git
cd postpurush
```

### 2. Install dependencies
```bash
bun install
# or
npm install
# or
yarn install
```

### 3. Run the development server
```bash
bun run dev
# or
npm run dev
# or
yarn dev
```

### 4. Open the App
Navigate to [http://localhost:3000](http://localhost:3000) in your browser.
The app runs completely locally and stores all its data within your browser's IndexedDB.

## Understand Each Section
1. [Collections](./docs/how-to/collections.md)
2. [Environments](./docs/how-to/environments.md)
3. [Analytics](./docs/how-to/analytics.md)
4. [Create API Docs](./docs/how-to/create-api-docs.md)

## 📄 License

This project is licensed under the **MIT License**.
See the [LICENSE](./LICENSE) file for details.
