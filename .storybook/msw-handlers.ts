import type { RequestHandler } from 'msw'

// These arg-driven stories do not make network requests.
export const mswHandlers: RequestHandler[] = []
