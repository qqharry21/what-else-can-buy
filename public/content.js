// content.js for Price Context Extension (with Currency Conversion)

// --- Default Configuration ---
const DEFAULT_WORK_HOURS_PER_DAY = 8;
const DEFAULT_WORK_DAYS_PER_WEEK = 5;
const DEFAULT_WEEKS_PER_YEAR_FOR_ANNUAL = 52;
const DEFAULT_MONTHS_PER_YEAR = 12;

let USER_CONFIG = {}; // User settings from storage
let HOURLY_RATE = 0; // Calculated hourly rate in user's preferred currency
let EXCHANGE_RATES = null; // To store rates from rates.json

const PROCESSED_MARKER_CLASS = 'price-context-processed';
const PRICE_INFO_SPAN_CLASS = 'price-context-display';

// --- Currency and Rate Functions ---

/**
 * Loads exchange rates from the packaged rates.json file.
 * @returns {Promise<object|null>} A promise that resolves with the rates object or null on error.
 */
async function loadExchangeRates() {
  try {
    const ratesURL = chrome.runtime.getURL('rates.json');
    const response = await fetch(ratesURL);
    if (!response.ok) {
      console.error('Price Context Engine: Failed to load rates.json, status:', response.status);
      return null;
    }
    const ratesData = await response.json();
    if (ratesData && ratesData.rates) {
      console.log('Price Context Engine: Exchange rates loaded successfully.', ratesData.rates);
      return ratesData.rates;
    } else {
      console.error('Price Context Engine: rates.json is malformed or missing "rates" object.');
      return null;
    }
  } catch (error) {
    console.error('Price Context Engine: Error fetching or parsing rates.json:', error);
    return null;
  }
}

/**
 * Maps common currency symbols or variants to standard 3-letter codes.
 * Prioritizes codes defined in EXCHANGE_RATES.
 * @param {string} symbolOrCode - The detected currency string from the webpage.
 * @returns {string|null} The standardized currency code (e.g., 'USD') or null if not recognized.
 */
function mapSymbolToCode(symbolOrCode) {
  if (!symbolOrCode) return null;
  const s = symbolOrCode.toUpperCase().trim();

  if (EXCHANGE_RATES && EXCHANGE_RATES.hasOwnProperty(s)) {
    // Already a known code like TWD, USD, JPY
    return s;
  }

  // Symbol mapping - extend as needed
  if (s === '$' || s === 'US$' || s.includes('USD')) return 'USD';
  if (s === '¥' || s.includes('JPY') || s === 'YEN') return 'JPY'; // ¥ is ambiguous (CNY), prioritize JPY for this set
  if (s === 'NT$' || s.includes('TWD') || s === 'NTD') return 'TWD';

  // Check again if the mapped symbol is a valid rate code
  if (s === 'USD' && EXCHANGE_RATES && EXCHANGE_RATES.hasOwnProperty('USD')) return 'USD';
  if (s === 'JPY' && EXCHANGE_RATES && EXCHANGE_RATES.hasOwnProperty('JPY')) return 'JPY';
  if (s === 'TWD' && EXCHANGE_RATES && EXCHANGE_RATES.hasOwnProperty('TWD')) return 'TWD';

  console.warn(`Price Context Engine: Unrecognized currency symbol/code: ${symbolOrCode}`);
  return null;
}

/**
 * Converts an amount from a source currency to the user's target currency.
 * @param {number} amount - The amount to convert.
 * @param {string} sourceCurrencyCode - The 3-letter code of the source currency (e.g., 'USD').
 * @returns {number|null} The converted amount in the user's currency, or null if conversion is not possible.
 */
function convertToUserCurrency(amount, sourceCurrencyCode) {
  if (!EXCHANGE_RATES || !USER_CONFIG.currency) {
    console.warn('Price Context Engine: Exchange rates or user currency not set for conversion.');
    return null;
  }
  const targetCurrencyCode = USER_CONFIG.currency;

  if (sourceCurrencyCode === targetCurrencyCode) {
    return amount;
  }

  if (!EXCHANGE_RATES[sourceCurrencyCode] || !EXCHANGE_RATES[targetCurrencyCode]) {
    console.warn(
      `Price Context Engine: Missing exchange rate for ${sourceCurrencyCode} or ${targetCurrencyCode}.`
    );
    return null;
  }

  // Convert source currency to TWD (base currency in rates.json)
  // rates[sourceCurrencyCode] is how many units of sourceCurrency you get for 1 TWD
  // So, amountInTWD = amountInSource / rate_of_source_per_TWD
  const amountInTWD = amount / EXCHANGE_RATES[sourceCurrencyCode];

  // Convert amountInTWD to target currency
  // finalAmount = amountInTWD * rate_of_target_per_TWD
  const convertedAmount = amountInTWD * EXCHANGE_RATES[targetCurrencyCode];

  return convertedAmount;
}

/**
 * Parses text to find a numerical price and its currency.
 * @param {string} text - The text content to parse.
 * @returns {{amount: number, currency: string}|null} - Parsed price object or null.
 */
function parsePrice(text) {
  if (!text || !EXCHANGE_RATES) return null;

  // Define currency patterns based on available rates and common symbols
  const knownRateCodes = Object.keys(EXCHANGE_RATES); // ['TWD', 'USD', 'JPY']
  const currencyCodePattern = `(${knownRateCodes.join('|')})`; // (TWD|USD|JPY)

  // Add common symbols that map to these codes
  // Be careful with symbols like '$' which might be used by other currencies not in rates.json
  // This specific version prioritizes codes from rates.json
  const currencySymbolPattern = '(US\\$|NT\\$|\\$|¥)'; // ¥ for JPY, $ for USD, NT$ for TWD
  const combinedCurrencyPattern = `(${knownRateCodes.join('|')}|US\\$|NT\\$|\\$|¥)`; // More specific

  const numberPattern = '([0-9,]+(?:[\\.,][0-9]{1,2})?)';

  // Regex attempts:
  // 1. CURRENCY_CODE Amount (e.g., USD 10.99) - Most reliable
  // 2. CURRENCY_SYMBOL Amount (e.g., $10.99)
  // 3. Amount CURRENCY_CODE (e.g., 10.99 USD)

  let match;
  let amountStr, detectedSymbolOrCode;

  // Attempt 1: Explicit code like "USD 12.34" or "JPY 1000"
  const regexCodeFirst = new RegExp(`${currencyCodePattern}\\s*${numberPattern}`, 'i');
  match = text.match(regexCodeFirst);
  if (match) {
    detectedSymbolOrCode = match[1]; // This is a code like 'USD', 'JPY', 'TWD'
    amountStr = match[2];
  } else {
    // Attempt 2: Symbol like "$12.34" or "¥1000" or "NT$500"
    const regexSymbolFirst = new RegExp(`${combinedCurrencyPattern}\\s*${numberPattern}`, 'i');
    match = text.match(regexSymbolFirst);
    if (match) {
      detectedSymbolOrCode = match[1]; // This is a symbol or code
      amountStr = match[2];
    } else {
      // Attempt 3: Amount then code "12.34 USD" or "1000 JPY"
      const regexAmountFirstCode = new RegExp(`${numberPattern}\\s*${currencyCodePattern}`, 'i');
      match = text.match(regexAmountFirstCode);
      if (match) {
        amountStr = match[1];
        detectedSymbolOrCode = match[2]; // This is a code
      }
    }
  }

  if (!amountStr || !detectedSymbolOrCode) {
    return null;
  }

  const currencyCode = mapSymbolToCode(detectedSymbolOrCode);
  if (!currencyCode) {
    // If symbol couldn't be mapped to a known/convertible currency
    return null;
  }

  const normalizedAmountStr = normalizeNumberString(amountStr);
  const amount = parseFloat(normalizedAmountStr);

  if (isNaN(amount)) return null;

  return { amount, currency: currencyCode };
}

/**
 * Standardizes number strings (handles different decimal/thousands separators).
 * @param {string} numberString - The number string to normalize.
 * @returns {string} - Normalized number string.
 */
function normalizeNumberString(numberString) {
  if (numberString.includes('.') && numberString.includes(',')) {
    if (numberString.lastIndexOf('.') < numberString.lastIndexOf(',')) {
      return numberString.replace(/\./g, '').replace(',', '.');
    } else {
      return numberString.replace(/,/g, '');
    }
  } else if (numberString.includes(',')) {
    const parts = numberString.split(',');
    if (parts.length === 2 && parts[1].length <= 2 && /^\d+$/.test(parts[1])) {
      return numberString.replace(',', '.');
    } else {
      return numberString.replace(/,/g, '');
    }
  }
  return numberString.replace(/[^\d\.]/g, ''); // Clean any remaining non-digits except dot
}

// --- Formatting Functions (Work Time, Base Item) ---
function formatWorkTime(totalHours) {
  if (HOURLY_RATE <= 0 || totalHours <= 0) return '';
  if (totalHours < 1 / 60) return `<1 min`;
  if (totalHours < 1) {
    const minutes = Math.round(totalHours * 60);
    return `${minutes} min${minutes === 1 ? '' : 's'}`;
  }
  const fixedHours = parseFloat(totalHours.toFixed(1));
  return `${fixedHours} hr${fixedHours === 1.0 ? '' : 's'}`;
}

function formatBaseItemEquivalency(priceInUserCurrency) {
  if (!USER_CONFIG.baseItem || USER_CONFIG.baseItem.price <= 0 || priceInUserCurrency <= 0)
    return '';
  const quantity = Math.floor(priceInUserCurrency / USER_CONFIG.baseItem.price);
  if (quantity <= 0) return '';
  return `${quantity} ${
    quantity === 1 ? USER_CONFIG.baseItem.singularName : USER_CONFIG.baseItem.name
  }`;
}

// --- DOM Manipulation ---
function findAndAppendPriceContext(contextNode) {
  if (!EXCHANGE_RATES) {
    console.warn('Price Context Engine: Exchange rates not loaded. Cannot process prices.');
    return;
  }
  if (HOURLY_RATE <= 0 && (!USER_CONFIG.baseItem || USER_CONFIG.baseItem.price <= 0)) {
    return; // Nothing to display if no rate and no base item
  }

  const candidateSelectors = [
    'span',
    'div',
    'p',
    'strong',
    'b',
    'em',
    'font',
    'td',
    'li',
    'data',
    'ins',
    'dd',
    '.price',
    '[class*="price"]',
    '[id*="price"]',
    '[itemprop="price"]',
    '[data-price]',
    '.product-price',
    '.current-price',
    '.sale-price',
    '.a-price .a-offscreen',
    '.a-price', // Amazon specific
  ].join(', ');

  let elements;
  try {
    if (contextNode.querySelectorAll) elements = contextNode.querySelectorAll(candidateSelectors);
    else if (contextNode.parentElement?.querySelectorAll)
      elements = contextNode.parentElement.querySelectorAll(candidateSelectors);
    else return;
  } catch (e) {
    console.error('Price Context Engine: Error querying selectors:', e);
    return;
  }

  elements.forEach((el) => {
    // 跳過已處理過的元素
    if (
      el.classList.contains(PROCESSED_MARKER_CLASS) ||
      el.classList.contains(PRICE_INFO_SPAN_CLASS) ||
      el.closest(`.${PRICE_INFO_SPAN_CLASS}`) ||
      el.querySelector(`.${PRICE_INFO_SPAN_CLASS}`)
    ) {
      return;
    }

    // 獲取要解析的文本
    const textToParse =
      el.matches && el.matches('.a-offscreen')
        ? el.textContent
        : (el.innerText || el.textContent || '').trim();

    if (!textToParse) return;

    // 解析價格
    const parsedPriceData = parsePrice(textToParse);
    if (!parsedPriceData || parsedPriceData.amount <= 0 || !parsedPriceData.currency) return;

    // 轉換為用戶貨幣
    const priceInUserCurrency = convertToUserCurrency(
      parsedPriceData.amount,
      parsedPriceData.currency
    );

    if (priceInUserCurrency === null || priceInUserCurrency <= 0) return;

    // 判斷是否為價格容器
    const isLikelyPriceContainer =
      (el.children.length > 0 && el.children.length < 7) ||
      el.matches('.price, [class*="price"], [itemprop="price"], .a-price') ||
      (el.children.length === 0 && textToParse.length < 30);

    if (!isLikelyPriceContainer || textToParse.length >= 100) return;

    // 生成顯示文本
    const displayTexts = [];

    if (HOURLY_RATE > 0) {
      const workTimeText = formatWorkTime(priceInUserCurrency / HOURLY_RATE);
      if (workTimeText) displayTexts.push(workTimeText);
    }

    const baseItemText = formatBaseItemEquivalency(priceInUserCurrency);
    if (baseItemText) displayTexts.push(baseItemText);

    if (displayTexts.length > 0) {
      const infoSpan = document.createElement('span');
      infoSpan.className = PRICE_INFO_SPAN_CLASS;
      infoSpan.textContent = ` (${displayTexts.join(' or ')})`;
      el.appendChild(infoSpan);
      el.classList.add(PROCESSED_MARKER_CLASS);
    }
  });
}

// --- Main Execution Flow ---
async function initializeExtension(settings) {
  // Set user configuration (salary currency is the display currency)
  USER_CONFIG = {
    salary: parseFloat(settings.salary?.amount) || 0,
    salaryType: settings.salary?.salaryType || 'annual',
    currency: mapSymbolToCode(settings.salary?.currency) || 'USD', // User's preferred currency for display
    workHoursPerDay: settings.workHoursPerDay || DEFAULT_WORK_HOURS_PER_DAY,
    baseItem: {
      name: settings.baseItem?.name || 'coffees',
      singularName: settings.baseItem?.singularName || 'coffee',
      price: parseFloat(settings.baseItem?.price) || 5.0, // Assumed to be in USER_CONFIG.currency
    },
    // currencySymbol is mainly for display if needed, actual currency code is USER_CONFIG.currency
    currencySymbol: settings.salary?.currencySymbol || settings.salary?.currency || '$',
  };

  // Ensure USER_CONFIG.currency is one of the known rate codes if possible
  if (!EXCHANGE_RATES[USER_CONFIG.currency]) {
    console.warn(
      `User's configured currency ${USER_CONFIG.currency} is not in exchange rates. Defaulting calculations to USD if possible or disabling.`
    );
    if (EXCHANGE_RATES['USD']) {
      USER_CONFIG.currency = 'USD'; // Fallback if user's currency is not convertible
    } else {
      // If USD is also not available, currency features will be largely disabled.
      // HOURLY_RATE might be zero or calculations might fail.
      console.error('Fallback currency USD not found in rates. Currency conversions may not work.');
    }
  }

  // Calculate HOURLY_RATE in USER_CONFIG.currency
  // Salary amount is assumed to be in USER_CONFIG.currency
  const workHoursPerWeek = USER_CONFIG.workHoursPerDay * DEFAULT_WORK_DAYS_PER_WEEK;
  let annualSalaryInUserCurrency = USER_CONFIG.salary;

  if (USER_CONFIG.salaryType === 'monthly') {
    annualSalaryInUserCurrency = USER_CONFIG.salary * DEFAULT_MONTHS_PER_YEAR;
  }

  if (workHoursPerWeek > 0) {
    HOURLY_RATE =
      annualSalaryInUserCurrency / (DEFAULT_WEEKS_PER_YEAR_FOR_ANNUAL * workHoursPerWeek);
  } else {
    HOURLY_RATE = 0;
  }

  if (isNaN(HOURLY_RATE) || HOURLY_RATE < 0) HOURLY_RATE = 0;

  console.log(
    `Price Context Engine active. User Currency: ${USER_CONFIG.currency}. Hourly rate: ${
      USER_CONFIG.currencySymbol // This might not match USER_CONFIG.currency if symbol was generic like '$'
    }${HOURLY_RATE.toFixed(2)} ${USER_CONFIG.currency}` +
      (USER_CONFIG.baseItem.price > 0
        ? `, Base item: ${USER_CONFIG.baseItem.name} at ${
            USER_CONFIG.currencySymbol
          }${USER_CONFIG.baseItem.price.toFixed(2)} ${USER_CONFIG.currency}`
        : '')
  );

  findAndAppendPriceContext(document.body);

  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((newNode) => {
          if (newNode.nodeType === Node.ELEMENT_NODE) findAndAppendPriceContext(newNode);
          else if (newNode.nodeType === Node.TEXT_NODE && newNode.parentElement)
            findAndAppendPriceContext(newNode.parentElement);
        });
      } else if (mutation.type === 'characterData' && mutation.target.parentElement) {
        if (
          !mutation.target.parentElement.classList.contains(PROCESSED_MARKER_CLASS) &&
          !mutation.target.parentElement.classList.contains(PRICE_INFO_SPAN_CLASS)
        ) {
          findAndAppendPriceContext(mutation.target.parentElement);
        }
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
}

// Start the process: Load rates, then settings, then initialize.
(async () => {
  EXCHANGE_RATES = await loadExchangeRates();
  if (!EXCHANGE_RATES) {
    console.error(
      'Price Context Engine: Could not load exchange rates. Currency conversion will be disabled.'
    );
    // Proceed with initialization but currency features will be limited.
    // Or, decide to not initialize at all if rates are critical.
  }

  chrome.storage.sync.get(['salary', 'workHoursPerDay', 'baseItem'], (result) => {
    if (chrome.runtime.lastError) {
      console.error('Error loading settings:', chrome.runtime.lastError.message);
      initializeExtension({}); // Initialize with defaults
      return;
    }
    const settings = {
      salary: result.salary || {},
      workHoursPerDay: result.workHoursPerDay,
      baseItem: result.baseItem || {},
    };
    initializeExtension(settings);
  });
})();
