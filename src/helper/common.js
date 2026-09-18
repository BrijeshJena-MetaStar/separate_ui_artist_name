export const formatIndianCurrency = (number) => {
  const num = parseFloat(number);
  if (isNaN(num)) return "0.00";

  const [integerPart, decimalPart = "00"] = num.toFixed(2).split(".");

  let formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  formattedInteger = formattedInteger.replace(
    /^(\d+?)(?=(\d\d)+(\d)(?!\d))(\.\d+)?$/g,
    "$1,"
  );

  return `${formattedInteger}.${decimalPart}`;
};

export const checkIfSafari = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return (
    userAgent.includes("safari") &&
    !userAgent.includes("chrome") &&
    !userAgent.includes("android")
  );
};

export const getDurationString = (duration) => {
  let string = "";

  if (duration.hours) {
    string += duration.hours + "h ";
  }

  if (duration.minutes) {
    string += duration.minutes + "m ";
  }

  if (duration.seconds) {
    string += duration.seconds + "s ";
  }

  return string;
};

export const formatDate = (dateString) => {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    return "today";
  } else if (diffDays === 2) {
    return "yesterday";
  } else if (diffDays <= 7) {
    return `${diffDays - 1} days ago`;
  } else if (diffDays <= 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else if (diffDays <= 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
};

export const isValidIndianMobileNumber = (number) => {
  const pattern = /^(?:(?:\+?91|0)\s?)?[6789]\d{9}$/;
  return pattern.test(number);
};

export const isValidEmail = (email) => {
  const re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

export const isValidPassword = (password) => {
  if (!password) return false;
  const hasMinLength = password.length >= 8;
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasLetter = /[a-zA-Z]/.test(password);
  return hasMinLength && hasSpecialChar && hasDigit && hasLetter;
};

export const isValidUserNamePass = (userName, pass) => {
  if (
    (isValidEmail(userName) || isValidIndianMobileNumber(userName)) &&
    isValidPassword(pass)
  ) {
    return true;
  } else {
    return false;
  }
};

export const LINKS = {
  facebook: "https://www.facebook.com/artisteverse.in",
  twitter: "https://x.com/artisteverse",
  instgaram: "https://www.instagram.com/artisteverse",
  linkedin: "https://www.linkedin.com/company/metastar-media/",

  faq: "https://artisteverse.com/faq.php",
  aboutUs: "https://artisteverse.com/about-us.php",
  terms: "https://artisteverse.com/terms-of-use.php",

  refund: "https://artisteverse.com/refund-policy.php",
  contact: "https://artisteverse.com/contact-us.php",
  privacy: "https://artisteverse.com/privacy-policy.php",
};

export const sendDataToParent = (data) => {
  const targetOrigin = "*";
  window.parent.postMessage(data, targetOrigin);
};

export const getArtistName = (id) => {
  switch (Number(id)) {
    case 1:
      return "Planet Bickram";

    case 2:
      return "Manasi Scott";
    case 3:
      return "Purbayan Chatterjee";
    case 4:
      return "Priyadarsini Govind";
    case 5:
      return "Indian Ocean";
    case 8:
      return "Terence Lewis";
    default:
      return "Metastar";
  }
};

export const getOrderType = (id) => {
  switch (Number(id)) {
    case 1:
      return "PRODUCT";
    case 2:
      return "MEET";
    case 3:
      return "COURSE";
    case 4:
      return "PAID_VIDEO";
    case 5:
      return "ALBUM";
    case 6:
      return "SUBSCRIPTION";
    default:
      return "PRODUCT";
  }
};

export const getArtistRoute = (artistDomain, path) => {
  if (!artistDomain) {
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    if (pathParts.length > 2 && pathParts[2]) {
      const standardRoutes = ['login', 'register', 'cart', 'checkout', 'profile', 'orderHistory', 'coming-soon', 'forgotPassword', 'test', 'popup', 'calendlyPopup', 'orderDetail'];
      if (!standardRoutes.includes(pathParts[2])) {
        return `/${pathParts[2]}${path}`;
      }
    }
    return path;
  }

  return `/${artistDomain}${path}`;
};
/**
 * Sorts course levels in the specified order: Beginner, Intermediate, Advance, Open
 * @param {Array} levels - Array of course level objects
 * @returns {Array} - Sorted array of course levels
 */
export const sortCourseLevels = (levels) => {
  if (!Array.isArray(levels)) return levels;
  
  const levelOrder = {
    'Beginner': 1,
    'Intermediate': 2,
    'Advance': 3,
    'Advanced': 3, // Handle both spellings
    'Open': 4
  };
  
  return [...levels].sort((a, b) => {
    const levelA = a.level || '';
    const levelB = b.level || '';
    
    const orderA = levelOrder[levelA] || 999; // Unknown levels go to the end
    const orderB = levelOrder[levelB] || 999;
    
    return orderA - orderB;
  });
};

/**
 * Split tax-inclusive cart lines into ex-tax subtotal and tax.
 * When a subscription discount is applied, `price_per_qty` is often the discounted
 * amount; use `artistSubtotal` (cart API) or `taxInclusiveGross` (single checkout)
 * as the pre-discount tax-inclusive total so subtotal/tax match the list price.
 *
 * @param {Array} cartItems
 * @param {{ subscriptionDiscount?: number, artistSubtotal?: number|null, taxInclusiveGross?: number|null }} options
 * @returns {{ subtotalExTax: number, taxAmount: number }}
 */
export function splitCartTaxAndSubtotal(cartItems, options = {}) {
  const subscriptionDiscount = Number(options.subscriptionDiscount ?? 0);
  const artistSubtotal = options.artistSubtotal;
  const taxInclusiveGross = options.taxInclusiveGross;
  const grossSource =
    artistSubtotal != null && artistSubtotal !== ""
      ? artistSubtotal
      : taxInclusiveGross;

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return { subtotalExTax: 0, taxAmount: 0 };
  }

  if (subscriptionDiscount > 0 && grossSource != null && grossSource !== "") {
    const rate = Number(cartItems[0]?.tax ?? 0);
    if (rate > 0) {
      const gross = Number(grossSource);
      const subtotalExTax = gross / (1 + rate / 100);
      const taxAmount = gross - subtotalExTax;
      return { subtotalExTax, taxAmount };
    }
  }

  let subtotalExTax = 0;
  let taxAmount = 0;
  for (const el of cartItems) {
    const pricePerQty = Number(el?.price_per_qty ?? 0);
    const quantity = Number(el?.cart_quantity ?? 0);
    const taxPercent = Number(el?.tax ?? 0);
    if (!pricePerQty || !quantity || !taxPercent) continue;
    const priceBeforeTax = pricePerQty / (1 + taxPercent / 100);
    const itemTotalBeforeTax = priceBeforeTax * quantity;
    const itemTax = (itemTotalBeforeTax * taxPercent) / 100;
    subtotalExTax += itemTotalBeforeTax;
    taxAmount += itemTax;
  }
  return { subtotalExTax, taxAmount };
}
