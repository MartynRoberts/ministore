import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn } from 'storybook/test'
import { ProductMenuContent } from './ProductNav'

const meta = {
  component: ProductMenuContent,
  tags: ['ai-generated'],
  args: { onNavigate: fn(), compact: false },
} satisfies Meta<typeof ProductMenuContent>

export default meta
type Story = StoryObj<typeof meta>

export const Full: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const link = canvas.getByRole('link', { name: 'Laptops' })
    await expect(link).toHaveAttribute('href', '/products?category=laptops')
    await userEvent.click(link)
    await expect(args.onNavigate).toHaveBeenCalledOnce()
  },
}

export const Compact: Story = { args: { compact: true } }
