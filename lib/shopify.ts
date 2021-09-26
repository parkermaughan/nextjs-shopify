export async function storeFront(query: string) {
  const options = {
    method: 'POST',
    headers: {
      'X-Shopify-Storefront-Access-Token':
        process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESSTOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  }

  const response = await fetch(process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN, options)

  const data = response.json()

  return data
}
