const session = {
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

export async function addToBasket() { return session }
export async function toggleFav() { return session }
export async function setBasketQty() { return session }
export async function setDelivery() { return session }
export async function clearFavourites() { return session }
