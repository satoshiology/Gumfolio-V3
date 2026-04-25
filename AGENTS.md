# Project Rules & API Lessons

## Gumroad API v2 Integration

### Authentication for State-Changing Operations (PUT, POST, DELETE)
- **Quirk**: Header-based `Authorization: Bearer <token>` is inconsistent and often triggers generic 500 "Something broke" errors on specific endpoints (like products/enable).
- **Hardened Pattern**: Always use `application/x-www-form-urlencoded` with the `access_token` in the request body (using `URLSearchParams`).
- **Endpoint Specificity**: Prefer specific sub-resource endpoints for state management (e.g., `/products/:id/enable`) over generic update calls with status flags.

### Frontend Synchronization
- **Consistency**: Gumroad's backend may return stale data in the response immediately following a mutation.
- **Rule**: In React state updates, always MANDATE the intended state change locally (e.g., `published: nextState`) rather than relying solely on the `res.product` object returned by the API.

## Design Patterns
- **Colors**: Use the defined CSS variables in `index.css` (e.g., `primary`, `surface`, etc.).
- **Icons**: Always import from `lucide-react`.
- **Animations**: Use `motion` for all transitions and entrances.
