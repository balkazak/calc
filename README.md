git clone <repository-url>
cd nomad-calc-module

````

2. Install dependencies:
```bash
npm install
````

## Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Build

Build the project for production:

```bash
npm run build
```

The build output will be placed in the `dist` directory.

## Project Structure

```
src/
├── features/              # Feature-sliced modules
│   └── mst-calculator/    # MST Calculator feature
│       ├── model/         # Pinia stores and composables
│       ├── ui/            # Vue components
│       └── index.ts       # Feature entry point
├── components/            # Shared components
├── router/                # Vue Router configuration
├── styles/                # Global styles
└── main.ts                # Application entry point
```

## Environment Variables

Create a `.env` file in the root directory (if needed):

```env
VITE_API_URL=https://api.example.com
```

## Usage

To use the MST Calculator in another project:

```typescript
import { MSTCalculator } from 'nomad-calc-module'
import 'nomad-calc-module/dist/nomad-calc-module.css'
```
