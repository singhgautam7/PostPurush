# PostPurush

A powerful, dark-themed API testing client and documentation generator built with Next.js App Router and Tailwind CSS. PostPurush is designed for modern developers who need an integrated, fast, and beautiful environment to test APIs, manage environments, analyze performance, and generate beautiful PDF documentation.

![Request Builder](./public/screenshots/collections.png)

## 🚀 Features

### 1. Interactive Request Builder
- Full support for standard HTTP methods (GET, POST, PUT, DELETE, PATCH, etc.).
- Dynamic management of **Query Parameters**, **Headers**, and **Request Bodies** (JSON, Form Data, Raw).
- Multi-tab interface allowing users to work on multiple requests simultaneously without losing state.
- Split-pane layout with syntax-highlighted response viewers (Pretty, Raw) powered by CodeMirror.

### 2. Collection & Folder Management
- Organize requests into a nested, drag-and-drop enabled hierarchy.
- Ability to create, rename, and manage request groups for better workflow organization.
- Dedicated Collections sidebar.

### 3. Environment Variables
- Manage and toggle between multiple environments (e.g., Local, Staging, Production).
- Define variables as Key-Value pairs and use them across request URLs, headers, and bodies seamlessly.

### 4. Comprehensive Analytics Dashboard
- Real-time tracking of **Total Requests**, **Success Rates**, and **Error Counts**.
- Deep performance metrics including **Average Duration** and **P95 Latency**.
- Visualizations for response time trends and error rates per endpoint powered by Recharts.
- Slowest endpoints tracking and error breakdowns by status code.

![Analytics Dashboard](./public/screenshots/analytics.png)

### 5. Automated API Documentation
- Built-in generator to create beautiful, print-ready PDF documentation directly from your collections.
- Select specific folders or requests to include in the docs.
- Automatically extracts and formats parameters, headers, and body schemas.
- Add custom titles and summaries to the PDF cover page.

### 6. Code Snippet Generation
- Easily export requests into ready-to-run code snippets.
- Include these snippets automatically in the exported API Documentation PDFs.
- Supported languages:
  - **cURL**
  - **Python**
  - **JavaScript**
  - **Go**

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
Make sure you have Node.js and a package manager installed. We recommend using `bun` for the fastest installation and build times.

### 1. Clone the repository
```bash
git clone https://github.com/your-username/postpurush.git
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
Navigate to [http://localhost:3000](http://localhost:3000) in your browser. The app runs completely locally and stores all its data within your browser's IndexedDB.

---
*Built with Next.js.*
