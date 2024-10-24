export async function storeFront(query, variables = {}) {
  const options = {
    method: 'POST',
    headers: {
      'X-Shopify-Storefront-Access-Token':
        process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESSTOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  }

  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN,
      options
    )
    const data = await response.json()

    // Log response details to help with debugging
    console.log('Response Status:', response.status)
    console.log('Response Data:', data)

    if (!response.ok) {
      throw new Error(
        `Error fetching products: ${response.status} ${
          data.errors ? data.errors[0].message : ''
        }`
      )
    }

    return data
  } catch (error) {
    console.error('Fetch error:', error.message)
    throw new Error('Error fetching products')
  }
}

const gql = String.raw

export async function getAllProducts() {
  const productsQuery = gql`
    query Products {
      products(first: 6) {
        edges {
          node {
            id
            title
            handle
            tags
            priceRange {
              minVariantPrice {
                amount
              }
            }
            images(first: 1) {
              edges {
                node {
                  transformedSrc
                  altText
                }
              }
            }
          }
        }
      }
    }
  `

  const { data } = await storeFront(productsQuery)
  const allProducts = data?.products.edges ?? []
  return allProducts
}

export async function getAllProductHandles() {
  const productHandlesQuery = gql`
    {
      products(first: 6) {
        edges {
          node {
            handle
          }
        }
      }
    }
  `

  const { data } = await storeFront(productHandlesQuery)
  const handles = data?.products.edges ?? []
  return handles
}

export async function getSingleProductByHandleAndRelatedProducts(handle) {
  const singleProductQuery = gql`
    query SingleProduct($handle: String!) {
      productByHandle(handle: $handle) {
        title
        description
        tags
        handle
        priceRange {
          minVariantPrice {
            amount
          }
        }
        images(first: 1) {
          edges {
            node {
              transformedSrc
              altText
            }
          }
        }
        options {
          id
          values
        }
        variants(first: 6) {
          edges {
            node {
              id
              title
              priceV2 {
                amount
              }
              product {
                id
              }
              availableForSale
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
      products(first: 6) {
        edges {
          node {
            id
            title
            handle
            tags
            priceRange {
              minVariantPrice {
                amount
              }
            }
            images(first: 1) {
              edges {
                node {
                  transformedSrc
                  altText
                }
              }
            }
          }
        }
      }
    }
  `
  const { data } = await storeFront(singleProductQuery, handle)
  const { productByHandle, products } = data

  const allProducts = products?.edges ?? []

  return {
    productByHandle: productByHandle,
    products: allProducts,
  }
}

export async function checkout(variantId) {
  const checkoutMutation = gql`
    mutation CheckoutCreate($variantId: ID!) {
      checkoutCreate(
        input: { lineItems: { variantId: $variantId, quantity: 1 } }
      ) {
        checkout {
          webUrl
        }
      }
    }
  `
  const response = await storeFront(checkoutMutation, { variantId: variantId })
  return response
}
