# Airline Overbooking Manager - Backend Subsystem

Enterprise full-stack Node.js / Express backend with Google Gemini AI integration and mathematical optimization services.

## Architecture

- **`server.ts`**: Express application entry point. Serves API routes, handles production static file hosting from `dist/`, mounts dynamic Vite middleware in development, and provides instantaneous container health checks on port 8080 (Cloud Run).
- **`services/GeminiService.ts`**: AI integration with an automated multi-tier model fallback ladder:
  1. Primary: `gemini-3.6-flash`
  2. High-Availability Fallback: `gemini-3.1-flash-lite`
  3. Dynamic Alias: `gemini-flash-latest`
  4. Deep Reasoning Fallback: `gemini-3.7-flash`
- **`services/OverbookingService.ts`**: Newsvendor mathematical model and normal distribution approximation for overbooking bounds.
- **`controllers/FlightController.ts`**: Request sanitization, bounds checking, and error containment.
- **`routes/apiRoutes.ts`**: REST endpoints for health check, predictions, categorized file retrieval (`frontend`, `backend`, `java-core`, `python`), and redirection.

## Security Controls (OWASP Standards)

- **Input Validation (OWASP A03 / LLM02)**: Strict numeric clamping on all incoming capacity, fare, and penalty parameters.
- **Zero Insecure Defaults**: Secret Manager and runtime environment variable retrieval for `GEMINI_API_KEY` (zero hardcoded strings).
- **Error Shielding**: Sanitized error messages to avoid system stack exposure to clients.
- **Top-Level Request Deserialization**: Pre-configured JSON and urlencoded body parsers mounted upstream of all routing logic.

## Execution

```bash
# Development Mode (runs on http://localhost:3000)
npm run dev

# Production Build & Run
npm run build
npm start
```
