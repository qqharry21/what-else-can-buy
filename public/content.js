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

// --- New Global State Variables ---
// This value is expected to be set to true by the background script on extension install.
// It's read from chrome.storage.local.
let enabled = true;
let hasValidSalary = false; // True if USER_CONFIG.salary is a positive number

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
      console.log('Price Context Engine: Exchange rates loaded successfully.');
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

  // If 's' is already a valid key in EXCHANGE_RATES (e.g., "USD", "TWD"), return it directly.
  if (EXCHANGE_RATES && EXCHANGE_RATES.hasOwnProperty(s)) {
    return s;
  }

  // Symbol mapping
  if (s === '$' || s === 'US$' || s.includes('USD')) return 'USD';
  if (s === '¥' || s.includes('JPY') || s === 'YEN') return 'JPY';
  if (s === 'NT$' || s.includes('TWD') || s === 'NTD') return 'TWD';
  // Add more mappings as needed

  // Fallback for codes if they weren't caught by the first check (e.g. EXCHANGE_RATES was null then)
  // This part might be redundant if EXCHANGE_RATES is always populated before this is called with a code.
  if (s === 'USD' && EXCHANGE_RATES && EXCHANGE_RATES.hasOwnProperty('USD')) return 'USD';
  if (s === 'JPY' && EXCHANGE_RATES && EXCHANGE_RATES.hasOwnProperty('JPY')) return 'JPY';
  if (s === 'TWD' && EXCHANGE_RATES && EXCHANGE_RATES.hasOwnProperty('TWD')) return 'TWD';

  console.warn(
    `Price Context Engine: Could not map symbol/code "${symbolOrCode}" to a known currency code.`
  );
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
    console.warn(
      'Price Context Engine: Cannot convert currency, exchange rates or user currency not set.'
    );
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

  // Assuming TWD is the base currency in rates.json as per original logic hint
  // If rates.json is directly to USD, this logic needs adjustment.
  // The provided rates.json structure (e.g., {"USD": 30, "JPY": 0.2}) implies rates are relative to a common base (e.g. TWD=1).
  // Or, if rates are like {"USD": 1, "EUR": 0.9, "TWD": 32}, then convert to USD first, then to target.
  // For simplicity, let's assume rates are against a common unstated base (like TWD in your example, or USD).
  // If rates are all relative to TWD (TWD:1 in rates.json, or implied)
  // const amountInBase = amount / EXCHANGE_RATES[sourceCurrencyCode]; // Amount in TWD
  // const convertedAmount = amountInBase * EXCHANGE_RATES[targetCurrencyCode];

  // Generic conversion: convert source to a common base (e.g., USD if available), then base to target.
  // If your rates.json has a "base" field (e.g. "base": "USD"), use that.
  // For now, assuming rates are such that direct ratio works (e.g. all vs USD, or a common pivot)
  // If TWD is the pivot and rates are units of TWD per unit of currency X:
  // Example: USD:30 (30 TWD for 1 USD), JPY:0.2 (0.2 TWD for 1 JPY)
  // To convert 10 USD to JPY:
  // 10 USD * (30 TWD/USD) = 300 TWD
  // 300 TWD / (0.2 TWD/JPY) = 1500 JPY
  // So, amount * (rate_target_vs_base / rate_source_vs_base) if base is implicit.
  // If rates are "currency_per_TWD": { "USD": 0.033, "JPY": 5 }
  // 10 USD / 0.033 USD_per_TWD = 303 TWD
  // 303 TWD * 5 JPY_per_TWD = 1515 JPY

  // The original code had:
  // const amountInTWD = amount / EXCHANGE_RATES[sourceCurrencyCode];
  // const convertedAmount = amountInTWD * EXCHANGE_RATES[targetCurrencyCode];
  // This implies EXCHANGE_RATES[currencyCode] is "value of 1 unit of currencyCode in TWD".
  // e.g. USD:30 (1 USD = 30 TWD). So 1/EXCHANGE_RATES[sourceCurrencyCode] is not TWD amount.
  // It should be:
  // amount_in_source_currency * (TWD_per_source_currency) = amount_in_TWD
  // amount_in_TWD / (TWD_per_target_currency) = amount_in_target_currency
  // So, if EXCHANGE_RATES[code] = TWD per unit of code:
  const amountInTWD = amount * EXCHANGE_RATES[sourceCurrencyCode];
  const convertedAmount = amountInTWD / EXCHANGE_RATES[targetCurrencyCode];

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
  // Ensure symbols are escaped for regex if they contain special characters.
  // For simplicity, assuming they are simple like '$', '¥'.
  const currencySymbolPattern = '(US\\$|NT\\$|\\$|¥|€|£)'; // Added more common symbols
  // Combine known codes and common symbols for matching
  const combinedCurrencyPattern = `(${knownRateCodes.join('|')}|${currencySymbolPattern.replace(
    /[()]/g,
    ''
  )})`; // Remove capturing group from symbol pattern for this combined one
  const numberPattern = '([0-9,]+(?:[\\.,][0-9]{1,2})?)'; // Allows for , as thousands or . as decimal and vice-versa

  let match;
  let amountStr, detectedSymbolOrCode;

  // Regex: Currency (code or symbol) followed by number
  // Example: USD 1,234.56 or $123.45
  const regexCurrencyFirst = new RegExp(`^\\s*${combinedCurrencyPattern}\\s*${numberPattern}`, 'i');
  match = text.match(regexCurrencyFirst);
  if (match) {
    detectedSymbolOrCode = match[1];
    amountStr = match[match.length - 1]; // Last capture group is the number
  } else {
    // Regex: Number followed by Currency (code or symbol)
    // Example: 1,234.56 USD or 123.45$
    const regexAmountFirst = new RegExp(`^\\s*${numberPattern}\\s*${combinedCurrencyPattern}`, 'i');
    match = text.match(regexAmountFirst);
    if (match) {
      amountStr = match[1];
      detectedSymbolOrCode = match[match.length - 1]; // Last capture group is currency
    }
  }

  if (!amountStr || !detectedSymbolOrCode) {
    // console.log('Price Context Engine: Price regex did not match:', text);
    return null;
  }

  const currencyCode = mapSymbolToCode(detectedSymbolOrCode);
  if (!currencyCode) {
    // console.log('Price Context Engine: Could not map detected currency to code:', detectedSymbolOrCode);
    return null;
  }

  const normalizedAmountStr = normalizeNumberString(amountStr);
  const amount = parseFloat(normalizedAmountStr);

  if (isNaN(amount) || amount <= 0) {
    // console.log('Price Context Engine: Parsed amount is invalid:', normalizedAmountStr);
    return null;
  }
  return { amount, currency: currencyCode };
}

/**
 * Standardizes number strings (e.g., "1,234.56" or "1.234,56" to "1234.56").
 * @param {string} numberString - The number string to normalize.
 * @returns {string} - Normalized number string.
 */
function normalizeNumberString(numberString) {
  // Remove currency symbols or codes if they are still part of the string (though regex should separate them)
  numberString = numberString.replace(/(USD|JPY|TWD|US\$|NT\$|\$|¥|€|£)/gi, '').trim();

  const hasDot = numberString.includes('.');
  const hasComma = numberString.includes(',');

  if (hasDot && hasComma) {
    // If comma is after dot, assume comma is thousand separator, dot is decimal
    // e.g., 1.234,56 -> 1234.56 (European style)
    if (numberString.lastIndexOf(',') > numberString.lastIndexOf('.')) {
      return numberString.replace(/\./g, '').replace(',', '.');
    }
    // If dot is after comma, assume dot is thousand separator, comma is decimal
    // e.g., 1,234.56 -> 1234.56 (US style)
    else {
      return numberString.replace(/,/g, ''); // Dot is already decimal
    }
  } else if (hasComma) {
    // If only comma, check if it's a decimal for European numbers (e.g., "123,45")
    const parts = numberString.split(',');
    if (parts.length === 2 && parts[1].length <= 2 && /^\d+$/.test(parts[1])) {
      // Check if the part after comma looks like a decimal (1-2 digits)
      return numberString.replace(',', '.');
    } else {
      // Assume comma is a thousands separator
      return numberString.replace(/,/g, '');
    }
  }
  // If only dot, or neither, it should be fine or already be in "xxxx.xx" format.
  // Final cleanup for any non-digit, non-dot characters that might have slipped through.
  return numberString.replace(/[^\d\.]/g, '');
}

// --- Formatting Functions ---
function formatWorkTime(totalHours) {
  if (HOURLY_RATE <= 0 || totalHours <= 0) return '';
  if (totalHours < 1 / 60) return `<1 min`; // Less than a minute
  if (totalHours < 1) {
    const minutes = Math.round(totalHours * 60);
    return `${minutes} min${minutes === 1 ? '' : 's'}`;
  }
  const fixedHours = parseFloat(totalHours.toFixed(1));
  return `${fixedHours} hr${fixedHours === 1.0 ? '' : 's'}`;
}

// --- DOM Manipulation ---

/**
 * Checks if price modifications can be applied based on current settings and page.
 * @returns {boolean} True if modifications can be applied, false otherwise.
 */
function canApplyPriceModifications() {
  if (!enabled) {
    // console.log('Price Context Engine: Modification disabled globally.');
    return false;
  }
  // Special condition for Amazon: only apply if salary is validly set.
  if (CURRENT_HOSTNAME.includes('amazon.') && !hasValidSalary) {
    // console.log('Price Context Engine: On Amazon, but salary not set/valid. Modifications disabled for this site.');
    return false;
  }
  return true;
}

/**
 * Removes all price context information (spans and markers) from the page.
 */
function removePriceContextFromPage() {
  // console.log('Price Context Engine: Removing all price context from page.');
  document.querySelectorAll(`.${PRICE_INFO_SPAN_CLASS}`).forEach((span) => span.remove());
  document.querySelectorAll(`.${PROCESSED_MARKER_CLASS}`).forEach((el) => {
    el.classList.remove(PROCESSED_MARKER_CLASS);
  });
}

/**
 * Finds price elements and appends the calculated work time or base item equivalent.
 * This function is called for specific nodes (e.g. by MutationObserver) or for document.body.
 * @param {Node} contextNode - The DOM node (Element or DocumentFragment) to search within.
 */
function findAndAppendPriceContext(contextNode) {
  if (!canApplyPriceModifications()) {
    // If modifications are not allowed globally or for this specific page context (e.g. Amazon without salary),
    // do not add any new price context. Existing ones are handled by refreshPagePriceContext.
    return;
  }

  if (!EXCHANGE_RATES) {
    console.warn('Price Context Engine: Exchange rates not loaded, cannot append price context.');
    return;
  }
  // HOURLY_RATE check is now more nuanced; if it's 0, only baseItem comparison might be possible.
  // The original logic was: if (HOURLY_RATE <= 0 && (!USER_CONFIG.baseItem || USER_CONFIG.baseItem.price <= 0)) return;
  // This means if hourly rate is 0, but baseItem is valid, it could still proceed. Let's keep that.
  const canShowWorkTime = HOURLY_RATE > 0;
  const canShowBaseItem = USER_CONFIG.baseItem && USER_CONFIG.baseItem.price > 0;
  if (!canShowWorkTime && !canShowBaseItem) {
    // console.log('Price Context Engine: Neither hourly rate nor base item is configured for display.');
    return;
  }

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
      // For text nodes, try parent
      elements = contextNode.parentElement.querySelectorAll(currentSelectors);
    } else {
      return; // Cannot query
    }
  } catch (e) {
    console.error('Price Context Engine: Error querying selectors:', e);
    return;
  }

  elements.forEach((el) => {
    if (el.classList.contains(PROCESSED_MARKER_CLASS)) return; // Already processed
    if (el.classList.contains(PRICE_INFO_SPAN_CLASS) || el.closest(`.${PRICE_INFO_SPAN_CLASS}`))
      return; // Is or is inside our span
    if (el.querySelector(`:scope > .${PRICE_INFO_SPAN_CLASS}`)) return; // Already has our span as direct child

    let textToParse = '';
    // Amazon-specific text extraction
    if (isAmazon) {
      if (el.matches('.a-price .a-offscreen')) {
        textToParse = el.textContent;
      } else if (el.matches('.a-price')) {
        const offscreen = el.querySelector('.a-offscreen');
        if (offscreen && offscreen.textContent) {
          textToParse = offscreen.textContent;
        } else {
          let tempText = '';
          el.childNodes.forEach((child) => {
            if (child.nodeType === Node.TEXT_NODE) {
              tempText += child.textContent;
            } else if (
              child.nodeType === Node.ELEMENT_NODE &&
              !child.classList.contains(PRICE_INFO_SPAN_CLASS)
            ) {
              tempText += child.textContent || '';
            }
          });
          textToParse = tempText;
        }
      } else {
        // Generic selector matched on Amazon (should be rare if amazon selectors are good)
        textToParse = el.innerText || el.textContent;
      }
    } else {
      // Generic text extraction
      if (
        el.children.length === 0 ||
        (el.children.length === 1 && el.children[0].tagName === 'BR')
      ) {
        // If no children or only a BR, textContent is usually cleaner
        textToParse = el.textContent;
      } else {
        // For elements with children, innerText can be better but might combine too much.
        // Let's try to get text from direct children first if they are text nodes.
        let directText = Array.from(el.childNodes)
          .filter((n) => n.nodeType === Node.TEXT_NODE)
          .map((n) => n.textContent.trim())
          .join(' ');
        if (directText.length > 5) {
          // Heuristic: if there's substantial direct text
          textToParse = directText;
        } else {
          textToParse = el.innerText || el.textContent; // Fallback
        }
      }
    }

    if (!textToParse) textToParse = el.textContent; // Final fallback
    textToParse = textToParse?.trim();
    if (!textToParse) return;

    const parsedPriceData = parsePrice(textToParse);

    if (parsedPriceData && parsedPriceData.amount > 0 && parsedPriceData.currency) {
      const priceInUserCurrency = convertToUserCurrency(
        parsedPriceData.amount,
        parsedPriceData.currency
      );

      if (priceInUserCurrency === null || priceInUserCurrency <= 0) return;

      // Heuristic to ensure we are targeting actual price display elements
      // Avoids adding to large containers with tiny bits of text that match price regex.
      const isLikelyPriceContainer =
        (el.children.length < 5 && textToParse.length < 70) || // Few children, short text
        el.matches(
          '.price, [class*="price"], [itemprop="price"], .a-price, .product-price, .sale-price, .current-price'
        ) || // Matches common price classes
        (el.children.length === 0 && textToParse.length < 40); // No children, very short text

      if (isLikelyPriceContainer && textToParse.length < 150) {
        // Additional length check on text
        let displayText = [];
        if (canShowWorkTime) {
          const workTimeText = formatWorkTime(priceInUserCurrency / HOURLY_RATE);
          if (workTimeText) displayText.push(workTimeText);
        }
        // Add base item comparison if enabled and configured
        if (canShowBaseItem && USER_CONFIG.baseItem.price > 0) {
          const numBaseItems = priceInUserCurrency / USER_CONFIG.baseItem.price;
          if (numBaseItems >= 0.1) {
            // Show if at least 0.1 of a base item
            const itemName =
              numBaseItems === 1.0 ? USER_CONFIG.baseItem.singularName : USER_CONFIG.baseItem.name;
            displayText.push(`${numBaseItems.toFixed(1)} ${itemName}`);
          }
        }

        if (displayText.length > 0) {
          const infoSpan = document.createElement('span');
          infoSpan.className = PRICE_INFO_SPAN_CLASS;
          infoSpan.textContent = ` (${displayText.join(' or ')})`;
          // Try to append intelligently based on element type
          if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            // Cannot append to input/textarea, maybe add after?
            // For now, skip these to avoid breaking forms.
            return;
          }

          el.appendChild(infoSpan);
          el.classList.add(PROCESSED_MARKER_CLASS);
        }
      }
    }
  });
}

// --- Main Execution Flow ---

/**
 * Updates USER_CONFIG and related derived values (HOURLY_RATE, hasValidSalary).
 * @param {object} settings - Settings object, typically from chrome.storage.
 * Expected structure: { salary: {amount, type, currency, currencySymbol}, workHoursPerDay, baseItem }
 */
function updateCoreConfigs(settings) {
  const salaryData = settings.salary || {};
  USER_CONFIG = {
    salary: parseFloat(salaryData.amount) || 0,
    salaryType: salaryData.salaryType || 'annual',
    currency: mapSymbolToCode(salaryData.currency) || 'USD', // Default to USD if mapping fails
    workHoursPerDay: settings.workHoursPerDay || DEFAULT_WORK_HOURS_PER_DAY,
    baseItem: {
      name: settings.baseItem?.name || 'coffees', // Default example
      singularName: settings.baseItem?.singularName || 'coffee',
      price: parseFloat(settings.baseItem?.price) || 0, // Default to 0 if not set
    },
    currencySymbol: salaryData.currencySymbol || salaryData.currency || '$',
  };

  hasValidSalary = USER_CONFIG.salary > 0;

  // Validate and adjust USER_CONFIG.currency against loaded EXCHANGE_RATES
  if (EXCHANGE_RATES && USER_CONFIG.currency && !EXCHANGE_RATES[USER_CONFIG.currency]) {
    console.warn(
      `Price Context Engine: User's configured currency "${USER_CONFIG.currency}" is not available in exchange rates. Attempting fallback.`
    );
    if (EXCHANGE_RATES['USD']) {
      USER_CONFIG.currency = 'USD';
      console.warn(`Price Context Engine: User currency defaulted to USD.`);
    } else if (Object.keys(EXCHANGE_RATES).length > 0) {
      const firstAvailableRate = Object.keys(EXCHANGE_RATES)[0];
      USER_CONFIG.currency = firstAvailableRate;
      console.warn(
        `Price Context Engine: User currency defaulted to first available rate: ${firstAvailableRate}.`
      );
    } else {
      console.error(
        'Price Context Engine: No exchange rates available. Currency conversions will be unreliable.'
      );
      // If currency is critical and no rates, consider hasValidSalary implications or disabling features.
    }
  }

  const workHoursPerWeek = USER_CONFIG.workHoursPerDay * DEFAULT_WORK_DAYS_PER_WEEK;
  let annualSalaryInUserCurrency = USER_CONFIG.salary;

  if (USER_CONFIG.salaryType === 'monthly') {
    annualSalaryInUserCurrency = USER_CONFIG.salary * DEFAULT_MONTHS_PER_YEAR;
  } else if (USER_CONFIG.salaryType === 'hourly') {
    // Handle hourly salary type
    annualSalaryInUserCurrency =
      USER_CONFIG.salary * workHoursPerWeek * DEFAULT_WEEKS_PER_YEAR_FOR_ANNUAL;
  }

  if (workHoursPerWeek > 0 && annualSalaryInUserCurrency > 0) {
    if (USER_CONFIG.salaryType === 'hourly') {
      HOURLY_RATE = USER_CONFIG.salary; // If salary is hourly, that's the rate
    } else {
      HOURLY_RATE =
        annualSalaryInUserCurrency / (DEFAULT_WEEKS_PER_YEAR_FOR_ANNUAL * workHoursPerWeek);
    }
  } else {
    HOURLY_RATE = 0;
  }

  if (isNaN(HOURLY_RATE) || HOURLY_RATE < 0) HOURLY_RATE = 0;

  console.log(
    `Price Context Engine: Configs updated. Currency: ${USER_CONFIG.currency}, Hourly: ${
      USER_CONFIG.currencySymbol
    }${HOURLY_RATE.toFixed(2)}. Valid Salary: ${hasValidSalary}. Base Item: ${
      USER_CONFIG.baseItem.name
    } @ ${USER_CONFIG.baseItem.price}`
  );
}

/**
 * Clears existing price context and re-applies it to the entire document body
 * if current conditions allow.
 */
async function refreshPagePriceContext() {
  // console.log('Price Context Engine: Refreshing page price context.');
  removePriceContextFromPage(); // Clear everything first

  if (canApplyPriceModifications()) {
    // console.log('Price Context Engine: Conditions met, applying price context to document body.');
    findAndAppendPriceContext(document.body);
  } else {
    // console.log('Price Context Engine: Conditions not met, page will remain clean or was cleaned.');
  }
}

let mutationObserver = null;

/**
 * Initializes or re-initializes the MutationObserver.
 */
function setupMutationObserver() {
  if (mutationObserver) {
    mutationObserver.disconnect();
  }

  mutationObserver = new MutationObserver((mutationsList) => {
    // Check if modifications are allowed before processing any mutations.
    // findAndAppendPriceContext also has this check, but this can prevent unnecessary iteration.
    if (!canApplyPriceModifications()) {
      return;
    }

    for (const mutation of mutationsList) {
      // Avoid processing our own spans or their parents if they were the target
      if (
        mutation.target.classList?.contains(PRICE_INFO_SPAN_CLASS) ||
        mutation.target.parentElement?.classList?.contains(PRICE_INFO_SPAN_CLASS) ||
        mutation.target.closest?.(`.${PRICE_INFO_SPAN_CLASS}`)
      ) {
        continue;
      }

      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((newNode) => {
          if (
            newNode.nodeType === Node.ELEMENT_NODE &&
            !newNode.classList?.contains(PRICE_INFO_SPAN_CLASS) && // Check the node itself
            !newNode.closest(`.${PRICE_INFO_SPAN_CLASS}`)
          ) {
            // Check if it's inside our span
            findAndAppendPriceContext(newNode);
          } else if (
            newNode.nodeType === Node.TEXT_NODE &&
            newNode.parentElement &&
            !newNode.parentElement.classList.contains(PRICE_INFO_SPAN_CLASS) &&
            !newNode.parentElement.closest(`.${PRICE_INFO_SPAN_CLASS}`)
          ) {
            findAndAppendPriceContext(newNode.parentElement);
          }
        });
      } else if (mutation.type === 'characterData' && mutation.target.parentElement) {
        const parent = mutation.target.parentElement;
        // Ensure parent is not our span and not already processed, and not inside our span
        if (
          !parent.classList.contains(PRICE_INFO_SPAN_CLASS) &&
          !parent.classList.contains(PROCESSED_MARKER_CLASS) &&
          !parent.querySelector(`:scope > .${PRICE_INFO_SPAN_CLASS}`) && // Check direct child
          !parent.closest(`.${PRICE_INFO_SPAN_CLASS}`)
        ) {
          // Check if parent is inside our span
          findAndAppendPriceContext(parent);
        }
      }
    }
  });

  mutationObserver.observe(document.body, { childList: true, subtree: true, characterData: true });
  // console.log('Price Context Engine: MutationObserver started/restarted.');
}

/**
 * Main initialization function. Loads settings, sets up listeners, and performs initial processing.
 */
async function main() {
  console.log('Price Context Engine: Starting main initialization.');
  EXCHANGE_RATES = await loadExchangeRates();
  if (!EXCHANGE_RATES) {
    console.error(
      'Price Context Engine: CRITICAL - Exchange rates not loaded. Most functionality will be disabled.'
    );
    // enabled could be set to false here, or rely on checks for EXCHANGE_RATES within functions.
    // For now, functions check for EXCHANGE_RATES.
  }
  storeCurrentHostname();

  // Listener for storage changes
  chrome.storage.onChanged.addListener(async (changes, namespace) => {
    let needsCoreConfigUpdate = false;
    let needsRefresh = false;
    // console.log('Price Context Engine: Storage changed', { changes, namespace });

    if (namespace === 'sync') {
      // Check if any of the core config keys changed
      const coreSyncKeys = ['salary', 'workHoursPerDay', 'baseItem'];
      if (coreSyncKeys.some((key) => changes[key])) {
        console.log('Price Context Engine: Core sync settings changed.');
        needsCoreConfigUpdate = true;
        needsRefresh = true;
      }
    }

    if (namespace === 'local' && changes.enabled) {
      console.log('Price Context Engine: enabled changed in local storage.');
      enabled = changes.enabled.newValue;
      needsRefresh = true; // Need to refresh display based on new enabled state
    }

    if (needsCoreConfigUpdate) {
      const newSyncSettings = await new Promise((resolve) =>
        chrome.storage.sync.get(['salary', 'workHoursPerDay', 'baseItem'], (result) =>
          resolve(result)
        )
      );
      updateCoreConfigs(newSyncSettings); // This updates USER_CONFIG, HOURLY_RATE, hasValidSalary
    }

    if (needsRefresh) {
      console.log('Price Context Engine: Refreshing page due to storage change.');
      await refreshPagePriceContext();
      // The mutation observer continues to observe. If canApplyPriceModifications changed,
      // its behavior will adapt on the next mutation.
      // If findAndAppendPriceContext was re-run on document.body, new elements are processed.
    }
  });

  // Load initial settings from local storage for the enable/disable flag
  // The background script should set 'enabled: true' on install.
  const localSettings = await new Promise((resolve) =>
    chrome.storage.local.get('enabled', (result) => resolve(result))
  );
  if (localSettings.enabled !== undefined) {
    enabled = localSettings.enabled;
  } else {
    // This case means it's not in storage. Background should have set it.
    // We'll use the hardcoded default 'true' and the background script should ideally set it for future consistency.
    console.warn(
      'Price Context Engine: enabled not found in local storage. Using default (true). Background script should set this on install.'
    );
    // Optionally, the content script could try to set it here, but it's better if background owns defaults.
    // chrome.storage.local.set({ enabled: true });
  }

  // Load initial settings from sync storage for salary, work hours, etc.
  const initialSyncSettings = await new Promise((resolve) =>
    chrome.storage.sync.get(['salary', 'workHoursPerDay', 'baseItem'], (result) => resolve(result))
  );
  updateCoreConfigs(initialSyncSettings); // Initialize USER_CONFIG, HOURLY_RATE, hasValidSalary

  console.log(`Price Context Engine: Initial load. Enabled: ${enabled}, Host: ${CURRENT_HOSTNAME}`);

  await refreshPagePriceContext(); // Perform initial processing based on loaded settings
  setupMutationObserver(); // Start observing DOM changes
}

// Start the process
// Ensure the script runs after the DOM is somewhat ready, though MutationObserver handles dynamic content.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main().catch((error) => {
    console.error('Price Context Engine: Uncaught error in main execution:', error);
  });
}
