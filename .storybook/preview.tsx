import type { Preview } from '@storybook/nextjs-vite'
import { mswLoader } from 'msw-storybook-addon/csf3'
import { ShopProvider } from '../app/ShopProvider'
import '../app/globals.css'
import { mswHandlers } from './msw-handlers'

const initialSession = {
  basket: {
    lines: [],
    currency: 'GBP' as const,
    subtotal: 0,
    delivery: 0,
    total: 0,
    count: 0,
    canCheckout: false,
    deliveryMethod: 'standard' as const,
  },
  favs: [],
}

const preview: Preview = {
  decorators: [
    (Story) => (
      <ShopProvider initialSession={initialSession}>
        <Story />
      </ShopProvider>
    ),
  ],
  loaders: [mswLoader()],
  async beforeEach({ msw }) {
    msw.use(...mswHandlers)
  },
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
};

export default preview;
