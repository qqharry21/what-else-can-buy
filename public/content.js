// content.js for Price Context Extension (Site-Specific Price Finding)

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

let CURRENT_HOSTNAME = ''; // To store the current page's hostname

// --- Utility Functions ---

/**
 * Gets the current page's hostname.
 */
function storeCurrentHostname() {
  try {
    CURRENT_HOSTNAME = window.location.hostname;
  } catch (e) {
    console.error('Price Context Engine: Could not get hostname.', e);
    CURRENT_HOSTNAME = '';
  }
}

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
    return s;
  }

  if (s === '$' || s === 'US$' || s.includes('USD')) return 'USD';
  if (s === '¥' || s.includes('JPY') || s === 'YEN') return 'JPY';
  if (s === 'NT$' || s.includes('TWD') || s === 'NTD') return 'TWD';

  if (s === 'USD' && EXCHANGE_RATES && EXCHANGE_RATES.hasOwnProperty('USD')) return 'USD';
  if (s === 'JPY' && EXCHANGE_RATES && EXCHANGE_RATES.hasOwnProperty('JPY')) return 'JPY';
  if (s === 'TWD' && EXCHANGE_RATES && EXCHANGE_RATES.hasOwnProperty('TWD')) return 'TWD';

  return null;
}

/**
 * Converts an amount from a source currency to the user's target currency.
 * @param {number} amount - The amount to convert.
 * @param {string} sourceCurrencyCode - The 3-letter code of the source currency.
 * @returns {number|null} The converted amount in the user's currency, or null if conversion is not possible.
 */
function convertToUserCurrency(amount, sourceCurrencyCode) {
  if (!EXCHANGE_RATES || !USER_CONFIG.currency) {
    return null;
  }
  const targetCurrencyCode = USER_CONFIG.currency;

  if (sourceCurrencyCode === targetCurrencyCode) {
    return amount;
  }

  if (!EXCHANGE_RATES[sourceCurrencyCode] || !EXCHANGE_RATES[targetCurrencyCode]) {
    return null;
  }

  const amountInTWD = amount / EXCHANGE_RATES[sourceCurrencyCode];
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

  const knownRateCodes = Object.keys(EXCHANGE_RATES);
  const currencyCodePattern = `(${knownRateCodes.join('|')})`;
  const currencySymbolPattern = '(US\\$|NT\\$|\\$|¥)';
  const combinedCurrencyPattern = `(${knownRateCodes.join('|')}|US\\$|NT\\$|\\$|¥)`;
  const numberPattern = '([0-9,]+(?:[\\.,][0-9]{1,2})?)';

  let match;
  let amountStr, detectedSymbolOrCode;

  const regexCodeFirst = new RegExp(`^\\s*${currencyCodePattern}\\s*${numberPattern}`, 'i');
  match = text.match(regexCodeFirst);
  if (match) {
    detectedSymbolOrCode = match[1];
    amountStr = match[2];
  } else {
    const regexSymbolFirst = new RegExp(`^\\s*${combinedCurrencyPattern}\\s*${numberPattern}`, 'i');
    match = text.match(regexSymbolFirst);
    if (match) {
      detectedSymbolOrCode = match[1];
      amountStr = match[2];
    } else {
      const regexAmountFirstCode = new RegExp(
        `^\\s*${numberPattern}\\s*${currencyCodePattern}`,
        'i'
      );
      match = text.match(regexAmountFirstCode);
      if (match) {
        amountStr = match[1];
        detectedSymbolOrCode = match[2];
      }
    }
  }

  if (!amountStr || !detectedSymbolOrCode) {
    return null;
  }

  const currencyCode = mapSymbolToCode(detectedSymbolOrCode);
  if (!currencyCode) {
    return null;
  }

  const normalizedAmountStr = normalizeNumberString(amountStr);
  const amount = parseFloat(normalizedAmountStr);

  if (isNaN(amount) || amount <= 0) return null;

  return { amount, currency: currencyCode };
}

/**
 * Standardizes number strings.
 * @param {string} numberString - The number string to normalize.
 * @returns {string} - Normalized number string.
 */
function normalizeNumberString(numberString) {
  numberString = numberString.replace(/(USD|JPY|TWD|US\$|NT\$|\$|¥)/gi, '').trim();

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
  return numberString.replace(/[^\d\.]/g, '');
}

// --- Formatting Functions ---
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

// --- DOM Manipulation ---
function findAndAppendPriceContext(contextNode) {
  if (!EXCHANGE_RATES) return;
  if (HOURLY_RATE <= 0 && (!USER_CONFIG.baseItem || USER_CONFIG.baseItem.price <= 0)) return;

  // Define candidate selectors
  // Amazon-specific selectors are more targeted
  const amazonCandidateSelectors = '.a-price .a-offscreen, .a-price';
  const genericCandidateSelectors = [
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
  ].join(', ');

  const isAmazon = CURRENT_HOSTNAME.includes('amazon.');
  const currentSelectors = isAmazon ? amazonCandidateSelectors : genericCandidateSelectors;

  let elements;
  try {
    if (
      contextNode.nodeType === Node.ELEMENT_NODE ||
      contextNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE
    ) {
      elements = contextNode.querySelectorAll(currentSelectors);
    } else if (contextNode.parentElement?.querySelectorAll) {
      elements = contextNode.parentElement.querySelectorAll(currentSelectors);
    } else {
      return;
    }
  } catch (e) {
    console.error('Price Context Engine: Error querying selectors:', e);
    return;
  }

  elements.forEach((el) => {
    if (el.classList.contains(PROCESSED_MARKER_CLASS)) return;
    if (el.classList.contains(PRICE_INFO_SPAN_CLASS) || el.closest(`.${PRICE_INFO_SPAN_CLASS}`))
      return;
    if (el.querySelector(`:scope > .${PRICE_INFO_SPAN_CLASS}`)) return;

    let textToParse = '';
    if (isAmazon) {
      // Amazon-specific text extraction
      if (el.matches('.a-price .a-offscreen')) {
        // Specific target for clean price
        textToParse = el.textContent;
      } else if (el.matches('.a-price')) {
        // Container for price parts
        const offscreen = el.querySelector('.a-offscreen');
        if (offscreen && offscreen.textContent) {
          textToParse = offscreen.textContent;
        } else {
          // Fallback for .a-price: reconstruct from visible parts, excluding our own spans
          let tempText = '';
          el.childNodes.forEach((child) => {
            if (child.nodeType === Node.TEXT_NODE) {
              tempText += child.textContent;
            } else if (
              child.nodeType === Node.ELEMENT_NODE &&
              !child.classList.contains(PRICE_INFO_SPAN_CLASS)
            ) {
              // For Amazon, .a-price-symbol, .a-price-whole, .a-price-fraction are common
              tempText += child.textContent || ''; // textContent is usually better here
            }
          });
          textToParse = tempText;
        }
      } else {
        // If a generic selector matched on Amazon, but it's not .a-price or .a-offscreen
        // This case should be less common if amazonCandidateSelectors are specific enough
        textToParse = el.innerText || el.textContent;
      }
    } else {
      // Generic text extraction for other sites
      // Prioritize direct text content if the element has no children or few meaningful ones.
      // Otherwise, innerText can be a good general approach.
      if (el.children.length === 0) {
        textToParse = el.textContent;
      } else {
        // For elements with children, innerText often gives a good representation.
        // The parsePrice regex is anchored, so it will try to match at the start.
        textToParse = el.innerText;
      }
    }

    if (!textToParse) textToParse = el.textContent; // Final fallback if other methods yielded nothing
    textToParse = textToParse?.trim();
    if (!textToParse) return;

    const parsedPriceData = parsePrice(textToParse);

    if (parsedPriceData && parsedPriceData.amount > 0 && parsedPriceData.currency) {
      const priceInUserCurrency = convertToUserCurrency(
        parsedPriceData.amount,
        parsedPriceData.currency
      );

      if (priceInUserCurrency === null || priceInUserCurrency <= 0) return;

      // Simplified heuristic for now, can be made site-specific too
      const isLikelyPriceContainer =
        (el.children.length < 5 && textToParse.length < 50) ||
        el.matches('.price, [class*="price"], [itemprop="price"], .a-price') ||
        (el.children.length === 0 && textToParse.length < 30);

      if (isLikelyPriceContainer && textToParse.length < 100) {
        const workTimeText =
          HOURLY_RATE > 0 ? formatWorkTime(priceInUserCurrency / HOURLY_RATE) : '';

        let displayText = [];
        if (workTimeText) displayText.push(workTimeText);

        if (displayText.length > 0) {
          const infoSpan = document.createElement('span');
          infoSpan.className = PRICE_INFO_SPAN_CLASS;
          infoSpan.textContent = ` (${displayText.join(' or ')})`;
          el.appendChild(infoSpan);
          el.classList.add(PROCESSED_MARKER_CLASS);
        }
      }
    }
  });
}

// --- Main Execution Flow ---
async function initializeExtension(settings) {
  storeCurrentHostname(); // Store hostname once at init

  USER_CONFIG = {
    salary: parseFloat(settings.salary?.amount) || 0,
    salaryType: settings.salary?.salaryType || 'annual',
    currency: mapSymbolToCode(settings.salary?.currency) || 'USD',
    workHoursPerDay: settings.workHoursPerDay || DEFAULT_WORK_HOURS_PER_DAY,
    baseItem: {
      name: settings.baseItem?.name || 'coffees',
      singularName: settings.baseItem?.singularName || 'coffee',
      price: parseFloat(settings.baseItem?.price) || 5.0,
    },
    currencySymbol: settings.salary?.currencySymbol || settings.salary?.currency || '$',
  };

  if (!EXCHANGE_RATES) {
    console.error('Price Context Engine: EXCHANGE_RATES not available during initialization.');
  } else if (!EXCHANGE_RATES[USER_CONFIG.currency]) {
    console.warn(
      `User's configured currency ${USER_CONFIG.currency} is not in exchange rates. Defaulting calculations to USD if possible.`
    );
    if (EXCHANGE_RATES['USD']) {
      USER_CONFIG.currency = 'USD';
    } else if (Object.keys(EXCHANGE_RATES).length > 0) {
      USER_CONFIG.currency = Object.keys(EXCHANGE_RATES)[0];
      console.warn(`Falling back user currency to ${USER_CONFIG.currency}`);
    } else {
      console.error('No exchange rates available. Currency conversions will fail.');
    }
  }

  const workHoursPerWeek = USER_CONFIG.workHoursPerDay * DEFAULT_WORK_DAYS_PER_WEEK;
  let annualSalaryInUserCurrency = USER_CONFIG.salary;

  if (USER_CONFIG.salaryType === 'monthly') {
    annualSalaryInUserCurrency = USER_CONFIG.salary * DEFAULT_MONTHS_PER_YEAR;
  }

  if (workHoursPerWeek > 0 && annualSalaryInUserCurrency > 0) {
    HOURLY_RATE =
      annualSalaryInUserCurrency / (DEFAULT_WEEKS_PER_YEAR_FOR_ANNUAL * workHoursPerWeek);
  } else {
    HOURLY_RATE = 0;
  }

  if (isNaN(HOURLY_RATE) || HOURLY_RATE < 0) HOURLY_RATE = 0;

  console.log(
    `Price Context Engine active on ${CURRENT_HOSTNAME}. User Currency: ${
      USER_CONFIG.currency
    }. Hourly rate: ${USER_CONFIG.currencySymbol}${HOURLY_RATE.toFixed(2)} ${
      USER_CONFIG.currency
    }` +
      (USER_CONFIG.baseItem.price > 0
        ? `, Base item: ${USER_CONFIG.baseItem.name} at ${
            USER_CONFIG.currencySymbol
          }${USER_CONFIG.baseItem.price.toFixed(2)} ${USER_CONFIG.currency}`
        : '')
  );

  findAndAppendPriceContext(document.body);

  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.target.classList && mutation.target.classList.contains(PRICE_INFO_SPAN_CLASS))
        continue;
      if (
        mutation.target.parentElement &&
        mutation.target.parentElement.classList.contains(PRICE_INFO_SPAN_CLASS)
      )
        continue;

      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((newNode) => {
          if (
            newNode.nodeType === Node.ELEMENT_NODE &&
            !newNode.classList.contains(PRICE_INFO_SPAN_CLASS)
          ) {
            findAndAppendPriceContext(newNode);
          } else if (
            newNode.nodeType === Node.TEXT_NODE &&
            newNode.parentElement &&
            !newNode.parentElement.classList.contains(PRICE_INFO_SPAN_CLASS)
          ) {
            findAndAppendPriceContext(newNode.parentElement);
          }
        });
      } else if (mutation.type === 'characterData' && mutation.target.parentElement) {
        const parent = mutation.target.parentElement;
        if (
          !parent.classList.contains(PRICE_INFO_SPAN_CLASS) &&
          !parent.classList.contains(PROCESSED_MARKER_CLASS) &&
          !parent.querySelector(`:scope > .${PRICE_INFO_SPAN_CLASS}`)
        ) {
          findAndAppendPriceContext(parent);
        }
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
}

// Start the process
(async () => {
  EXCHANGE_RATES = await loadExchangeRates();
  storeCurrentHostname(); // Store hostname after rates might be loaded (though not dependent)

  chrome.storage.sync.get('salary', (result) => {
    if (chrome.runtime.lastError) {
      console.error('Error loading settings:', chrome.runtime.lastError.message);
      initializeExtension({});
      return;
    }
    const settings = {
      salary: result?.salary || {},
      workHoursPerDay: DEFAULT_WORK_HOURS_PER_DAY,
      baseItem: {},
    };
    initializeExtension(settings);
  });
})();
