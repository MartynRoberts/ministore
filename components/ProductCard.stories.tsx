import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn } from 'storybook/test'
import ProductCard from './ProductCard'

const product = {
  id: 7,
  title: 'Classic wristwatch',
  description: 'A clean everyday watch with a stainless steel case.',
  price: 89.99,
  category: 'mens-watches',
  image: '/categories-watches.jpg',
  stock: 12,
}

const meta = {
  component: ProductCard,
  tags: ['ai-generated'],
  args: {
    product,
    isFav: false,
    onToggleFav: fn(),
    onAddToBasket: fn(),
  },
  decorators: [(Story) => <div className="w-80"><Story /></div>],
} satisfies Meta<typeof ProductCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Add to basket' }))
    await expect(args.onAddToBasket).toHaveBeenCalledWith(product.id, 'dummyjson-7-standard')
  },
}

export const Favourite: Story = { args: { isFav: true } }
export const PreloadedImage: Story = { args: { preloadImage: true, headingLevel: 2 } }
