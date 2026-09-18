import { apiWrapper, apiCall } from "../helper/apiWrapper";
import type { ApiCallOptions } from "../types/api";

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

export interface HiddenProduct {
  artist: string;
  productId: number;
}

export interface DisplayImage {
  [key: string]: unknown;
}

export interface VariationOrderItem {
  [key: string]: string[];
}

export interface ProductDetail {
  dispaly_images?: DisplayImage[];
  variation_order?: VariationOrderItem[];
  artist_name?: string;
  product_id?: string | number;
  [key: string]: unknown;
}

export interface ProductDetailResponse {
  details: ProductDetail;
  [key: string]: unknown;
}

export interface ProcessedProductDetail {
  imageList: DisplayImage[] | undefined;
  productDetail: ProductDetail;
  selectedImage: DisplayImage | Record<string, never>;
  dropDownValues: Record<string, string[]>;
  isVariation: number;
}

export interface CartItem {
  productItemId: string | number;
  id: string | number;
  [key: string]: unknown;
}

export interface CartData {
  // Fallback for any legacy callers that still pass a nested "data" object.
  data?: {
    cartItems?: CartItem[];
    artist_subtotal?: number;
    subscription_discount?: number;
    coupon_discount?: number;
    final_price?: number;
  };
  cartItems?: CartItem[];
  [key: string]: unknown;
}

export interface GetAllProductsParams {
  categoryId?: string | number | null;
  countryId?: string | number | null;
  queryforTLS?: boolean | string | null;
  // Backward compatibility for callers that still use legacy key.
  queryforTLSTrue?: boolean | null;
  queryTLPro?: boolean | null;
  artistDomain?: string | null;
}

export type RequestHeader = Record<string, string>;

export interface OrderBody {
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const HIDDEN_PRODUCTS: HiddenProduct[] = [
  // { artist: "bickram ghosh", productId: 9 }, // Removed to allow display in classroom section
];

function filterBlacklistedProducts(
  resultData: unknown[],
  hiddenProducts: HiddenProduct[]
): unknown[] {
  if (!Array.isArray(resultData)) return [];
  return resultData.filter((item) => {
    const record = item as ProductDetail;
    const artistName = record.artist_name?.toLowerCase();
    const productId = parseInt(String(record.product_id));
    return !hiddenProducts.some(
      (hiddenItem) =>
        hiddenItem.artist === artistName && hiddenItem.productId === productId
    );
  });
}

function processProductDetailResp(
  data: ProductDetailResponse
): ProcessedProductDetail {
  const imageList = data.details.dispaly_images;
  const productDetail = data.details;
  let selectedImage: DisplayImage | Record<string, never> = {};
  if (data.details.dispaly_images?.length) {
    selectedImage = data.details.dispaly_images[0];
  }
  const dropDownValues: Record<string, string[]> = {};
  (data.details.variation_order || []).forEach((item) => {
    const key = Object.keys(item)[0];
    dropDownValues[key] = item[key];
  });
  const isVariation = Object.keys(dropDownValues).length;
  return { imageList, productDetail, selectedImage, dropDownValues, isVariation };
}

function mapCartItems(data: CartData): CartItem[] {
  const items: CartItem[] = data?.data?.cartItems ?? data?.cartItems ?? [];
  return items.map((el) => ({ ...el, id: el.productItemId }));
}

// ---------------------------------------------------------------------------
// Public service functions
// ---------------------------------------------------------------------------

export const getAllProducts = async ({
  categoryId,
  countryId,
  artistDomain,
  queryforTLS,
  queryforTLSTrue,
  queryTLPro,
}: GetAllProductsParams): Promise<unknown[]> => {
  const queryParts: string[] = [];
  const rawTlsFlag = queryforTLS ?? queryforTLSTrue;
  const shouldQueryForTLS = rawTlsFlag === true;
  const shouldqueryTLPro = queryTLPro === true;
  if (categoryId != null && categoryId !== "")
    queryParts.push(`categoryId=${categoryId}`);
  if (countryId != null && countryId !== "")
    queryParts.push(`currencyCode=${countryId}`);
  if (shouldQueryForTLS) {
    queryParts.push(`queryforTLSTrue=true`);
  }
  if (shouldqueryTLPro) {
    queryParts.push(`queryTLPro=true`);
  }

  if (artistDomain != null && artistDomain !== "")
    queryParts.push(`artistDomain=${artistDomain}`);

  const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
  const data = await apiCall<unknown[]>(
    () => apiWrapper.get(`/api/allProducts${queryString}`),
    { defaultMessage: "Broken Connection" } satisfies ApiCallOptions
  );
  // conso
  return filterBlacklistedProducts(
    Array.isArray(data) ? data : (data as { data?: unknown[] })?.data ?? [],
    HIDDEN_PRODUCTS
  );
};

export const getProductById = async (
  id: string | number
): Promise<ProcessedProductDetail | null> => {
  const data = await apiCall<ProductDetailResponse>(
    () => apiWrapper.get(`/api/product-details/${id}`),
    { defaultMessage: "Broken Connection" } satisfies ApiCallOptions
  );
  if (data?.details) return processProductDetailResp(data);
  return null;
};

export const updateCartAPI = async (
  body: OrderBody,
  header?: RequestHeader
): Promise<unknown> => {
  try {
    const response = await apiWrapper.post("/api/cart", body, header);
    // Cart API returns 200 with { status: false, message: 'Cart Updated' } on success (e.g. remove item)
    if (response.status === 200) return response.data;
    return Promise.reject({
      status: false,
      message: response?.data?.message || "Broken Connection",
      rawError: response,
    });
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
};

export const getCart = async (
  artistId: string | number,
  currency: string,
  coupon: string
): Promise<CartItem[]> => {
  const data = await apiCall<CartData>(
    () => apiWrapper.get(`/api/cart/${artistId}?${currency}&${coupon}`),
    { defaultMessage: "Broken Connection" } satisfies ApiCallOptions
  );
  return mapCartItems(data);
};

export interface CartSummary {
  items: CartItem[];
  has_totals: boolean;
  artist_subtotal: number | null;
  subscription_discount: number | null;
  coupon_discount: number | null;
  final_price: number | null;
}

export const getCartSummary = async (
  artistId: string | number,
  currency: string,
  coupon: string
): Promise<CartSummary> => {
  const data = await apiCall<CartData>(
    () => apiWrapper.get(`/api/cart/${artistId}?${currency}&${coupon}`),
    { defaultMessage: "Broken Connection" } satisfies ApiCallOptions
  );

  const totals = (data?.data ?? data) as CartData;
  const hasTotalsKeys =
    totals != null &&
    typeof totals === "object" &&
    (Object.prototype.hasOwnProperty.call(totals, "artist_subtotal") ||
      Object.prototype.hasOwnProperty.call(totals, "subscription_discount") ||
      Object.prototype.hasOwnProperty.call(totals, "coupon_discount") ||
      Object.prototype.hasOwnProperty.call(totals, "final_price"));

  return {
    items: mapCartItems(data),
    has_totals: Boolean(hasTotalsKeys),
    artist_subtotal:
      totals?.artist_subtotal == null ? null : Number(totals.artist_subtotal),
    subscription_discount:
      totals?.subscription_discount == null
        ? null
        : Number(totals.subscription_discount),
    coupon_discount:
      totals?.coupon_discount == null ? null : Number(totals.coupon_discount),
    final_price: totals?.final_price == null ? null : Number(totals.final_price),
  };
};

export const cartSingle = async (
  currency: string,
  coupon: string,
  productItemId: string,
  type: string,
  courselevelavail: string
): Promise<CartItem[]> => {
  const data = await apiCall<CartData>(
    () =>
      apiWrapper.get(
        `/api/cartSingle?${currency}&${coupon}&${productItemId}&${type}&${courselevelavail}`
      ),
    { defaultMessage: "Broken Connection" } satisfies ApiCallOptions
  );
  return mapCartItems(data);
};

export const updateBulkCartAPI = async (body: OrderBody): Promise<unknown> => {
  return apiCall(
    () => apiWrapper.post("/api/bulk-cart", body),
    { defaultMessage: "Broken Connection", returnFull: true } satisfies ApiCallOptions
  );
};

export const placeOrder = async (body: OrderBody): Promise<unknown> => {
  return apiCall(
    () => apiWrapper.post("/api/order", body),
    { defaultMessage: "Broken Connection", returnFull: true } satisfies ApiCallOptions
  );
};

export const orderStatusCancel = async (body: OrderBody): Promise<unknown> => {
  return apiCall(
    () => apiWrapper.post("/api/cancelOrder", body),
    { defaultMessage: "Broken Connection", returnFull: true } satisfies ApiCallOptions
  );
};

export const cancelOrder = async (
  body: OrderBody,
  header?: RequestHeader
): Promise<unknown> => {
  return apiCall(
    () => apiWrapper.post("/api/cancel-payment", body, header),
    { defaultMessage: "Broken Connection", returnFull: true } satisfies ApiCallOptions
  );
};

export const getOrderHistory = async (): Promise<unknown[]> => {
  const data = await apiCall<unknown[]>(
    () => apiWrapper.get(`/api/v1/orders`),
    { defaultMessage: "Broken Connection" } satisfies ApiCallOptions
  );
  return data ?? [];
};

export const singleOrderPlace = async (body: OrderBody): Promise<unknown> => {
  return apiCall(
    () => apiWrapper.post("/api/order-now", body),
    { defaultMessage: "Broken Connection", returnFull: true } satisfies ApiCallOptions
  );
};

export const addWishList = async (
  body: OrderBody,
  header?: RequestHeader
): Promise<unknown> => {
  return apiCall(
    () => apiWrapper.post("/api/addWishlist", body, header),
    { defaultMessage: "Broken Connection", returnFull: true } satisfies ApiCallOptions
  );
};

export const removeWishList = async (
  body: OrderBody,
  header?: RequestHeader
): Promise<unknown> => {
  return apiCall(
    () => apiWrapper.post("/api/removeWishlist", body, header),
    { defaultMessage: "Broken Connection", returnFull: true } satisfies ApiCallOptions
  );
};

export const placeOrderPaypal = async (body: OrderBody): Promise<unknown> => {
  return apiCall(
    () => apiWrapper.post("/api/v2/order", body),
    { defaultMessage: "Broken Connection", returnFull: true } satisfies ApiCallOptions
  );
};

export const orderNowinitMeetPaypal = async (
  body: OrderBody
): Promise<unknown> => {
  return apiCall(
    () => apiWrapper.post("/api/v2/init-meet", body),
    { defaultMessage: "Broken Connection", returnFull: true } satisfies ApiCallOptions
  );
};

export const orderNowCoursePaypal = async (
  body: OrderBody
): Promise<unknown> => {
  return apiCall(
    () => apiWrapper.post("/api/v2/course-purchase", body),
    { defaultMessage: "Broken Connection", returnFull: true } satisfies ApiCallOptions
  );
};

export const orderNowVideoPaypal = async (
  body: OrderBody
): Promise<unknown> => {
  return apiCall(
    () => apiWrapper.post("/api/v2/subscribe-video", body),
    { defaultMessage: "Broken Connection", returnFull: true } satisfies ApiCallOptions
  );
};
