### **Project Plan: Advanced Spending Analyzer**

**Objective**: Develop a full-stack web application using Node.js and TypeScript for users to upload, analyze, and visualize their spending habits from a CSV file.

---

### **Part 1: Backend Development (API)**

**Technology Stack**:
*   **Language**: TypeScript
*   **Framework**: Node.js with Express
*   **File Handling**: `multer` for uploads, `csv-parser` for parsing

---

#### **Module 1: Core Project Setup & File Handling**

1.  **Initialize Backend Project**:
    *   Set up a new Node.js project (`npm init`).
    *   Install TypeScript and necessary type definitions (`typescript`, `ts-node`, `@types/node`, `@types/express`).
    *   Configure `tsconfig.json` for a Node.js environment.
    *   Structure the project with `src`, `dist`, and sub-folders for `routes`, `services`, `controllers`, and `types`.

2.  **Create a Basic Express Server**:
    *   In `src/index.ts`, set up an Express application that listens on a specified port.
    *   Add middleware for JSON parsing (`express.json()`) and CORS (`cors` package) to allow requests from the frontend.

3.  **Implement CSV Upload Endpoint**:
    *   Install `multer` and `csv-parser`.
    *   Create a route `POST /api/upload`.
    *   Use `multer` to handle `multipart/form-data` and store the uploaded CSV in memory.
    *   In the controller, pipe the file buffer to `csv-parser` to stream and parse the data.

4.  **Define Data Structures and Parsing Logic**:
    *   Create a `src/types/Transaction.ts` file to define the data interfaces (`Transaction`, `PersonShare`).
    *   The `Transaction` type should support a dynamic number of people. The parser should intelligently identify columns representing people's shares (i.e., all columns after `Currency`).
    *   The parsing service should clean the data, handle empty rows, and convert each row into a structured `Transaction` object. For simplicity, the parsed data can be stored in an in-memory session store for the duration of the user's session.

---

#### **Module 2: Description Analysis and Grouping**

1.  **Develop a Store Name Analysis Service**:
    *   Create `src/services/StoreAnalysisService.ts`.
    *   This service will take the list of parsed transactions and extract all unique `description` values.
    *   Implement a grouping algorithm to identify variations of the same store name. A robust approach would be:
        1.  Normalize strings (lowercase, remove punctuation).
        2.  Use a string similarity algorithm (like Levenshtein distance from a library like `fast-levenshtein`) to cluster similar strings.
    *   The service should output a suggested mapping of a canonical store name to its detected variations (e.g., `{"Trader Joe's": ["trader joes", "Traders joe"]}`).

2.  **Create API Endpoints for Store Grouping**:
    *   **`GET /api/stores/suggestions`**: This endpoint will trigger the `StoreAnalysisService` on the session's data and return the suggested groupings to the frontend.
    *   **`POST /api/stores/mappings`**: This endpoint will receive the user-approved (and potentially edited) mappings from the frontend. It will then update the session's transaction data, replacing the description variations with the canonical names.

---

#### **Module 3: Data Aggregation and Analysis API**

1.  **Create a Data Analysis Service**:
    *   Create `src/services/AnalysisService.ts`.
    *   This service will contain the core business logic for querying and aggregating the cleaned transaction data.
    *   It must expose methods that accept a flexible filter object (e.g., `{ dateRange, people[], categories[], stores[] }`).
    *   Key methods to implement:
        *   `getSpendingOverTime(filters, interval)`: Group by day, week, or month.
        *   `getSpendingBy(filters, dimension)`: Group by `category`, `store`, or `person`.
        *   `getDetailedTransactions(filters)`: Return a list of all transactions matching the filters.

2.  **Build a Flexible Analysis API Endpoint**:
    *   Create a route `GET /api/analysis`.
    *   This endpoint will accept query parameters that correspond to the filters (`startDate`, `endDate`, `person`, `category`, etc.) and the desired grouping (`groupBy=category`).
    *   It will call the appropriate methods in `AnalysisService` and return the aggregated data in a clean, JSON format ready for visualization.
    *   Create a `GET /api/metadata` endpoint that returns lists of all unique people, categories, and canonical store names from the dataset. The frontend will use this to populate filter dropdowns.

---

### **Part 2: Frontend Development (UI)**

**Technology Stack**:
*   **Framework**: React with TypeScript (using Vite)
*   **UI Library**: Material-UI (MUI) for components and styling.
*   **Visualizations**: `Recharts` for interactive charts.
*   **State Management**: React Context or Zustand for managing session state.
*   **Routing**: `react-router-dom`.

---

#### **Module 4: UI Setup and Core Components**

1.  **Initialize React Project**:
    *   Use Vite to bootstrap a new React project with the TypeScript template.
    *   Configure a proxy in `vite.config.ts` to redirect `/api` calls to the backend, avoiding CORS issues.
    *   Install all necessary dependencies (`@mui/material`, `recharts`, `react-router-dom`, `date-fns`, etc.).

2.  **Implement Application Routing and Layout**:
    *   Set up `react-router-dom` with three main routes:
        *   `/`: The home page for file uploads.
        *   `/refine-data`: The page where users confirm store name groupings.
        *   `/dashboard`: The main page for data visualization.
    *   Create a global layout component that includes a header and consistent styling.

---

#### **Module 5: User Flow Implementation**

1.  **Build the File Upload Page (`/`)**:
    *   Create a clean, simple UI with a file dropzone or input button that accepts only `.csv` files.
    *   Upon file upload, make a `POST` request to the `/api/upload` endpoint, showing a loading indicator during the process.
    *   On a successful response, programmatically navigate the user to the `/refine-data` page.

2.  **Build the Data Refinement Page (`/refine-data`)**:
    *   On page load, fetch the suggested store groupings from `GET /api/stores/suggestions`.
    *   Render these suggestions in a user-friendly, editable list. Each item should show the proposed canonical name and the list of variations it groups together.
    *   Allow the user to modify the groupings (e.g., edit a canonical name, move a variation to a different group).
    *   A "Confirm & View Dashboard" button will `POST` the final mappings to `/api/stores/mappings` and then navigate to the `/dashboard`.

---

#### **Module 6: Interactive Dashboard and Visualizations**

1.  **Create a Global Filter Component**:
    *   Build a `Filters` component that will be displayed prominently on the dashboard.
    *   It will fetch metadata from `/api/metadata` to populate the filter options.
    *   It must include:
        *   A date range picker.
        *   Multi-select dropdowns for People, Categories, and Stores.
    *   Changes in these filters should update a global state (using React Context or Zustand).

2.  **Develop Reusable Visualization Components**:
    *   Create a separate, modular component for each chart. Each component will watch the global filter state. When the state changes, the component will re-fetch its specific data from the `/api/analysis` endpoint and re-render.
    *   **`SpendingTimelineChart`**: A line chart showing total spending over the selected time period.
    *   **`CategoryPieChart`**: A pie chart breaking down spending by category.
    *   **`PerPersonBarChart`**: A bar chart comparing total spending across different people. This could be a stacked bar chart to show the category breakdown for each person.
    *   **`StoreBarChart`**: A horizontal bar chart showing the top 10 stores by spending.
    *   **`TransactionsDataGrid`**: A detailed, paginated data grid (using `@mui/x-data-grid`) showing all individual transactions that match the current filters.

3.  **Assemble the Dashboard Layout**:
    *   Design a responsive grid layout for the dashboard page.
    *   Place the `Filters` component at the top.
    *   Arrange the various chart components and the data grid in an intuitive layout below the filters. Ensure the dashboard feels interactive and updates smoothly as filters are applied.
