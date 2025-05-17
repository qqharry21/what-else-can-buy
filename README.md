# What Else Buy - Browser Extension

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![GitHub issues](https://img.shields.io/github/issues/qqharry21/what-else-can-buy)](https://github.com/qqharry21/what-else-can-buy/issues) [![GitHub stars](https://img.shields.io/github/stars/qqharry21/what-else-can-buy)](https://github.com/qqharry21/what-else-can-buy/stargazers)

A browser extension that helps you make more informed purchasing decisions by converting product prices into your working hours. Ever wondered what else you could get for the price of a new smartphone or a daily coffee habit? This extension can help you find out!

## Features

- **Salary to Hourly Rate Calculator**: Convert your monthly salary into an hourly rate
- **Working Hours Calculator**: Calculate how many hours you need to work to afford a product
- **Shopping Website Integration**: Automatically detects product prices on shopping websites and shows the required working hours (Currently only supports Amazon)
- **Multi-currency Support**: Supports TWD, USD, and JPY currencies
- **User-friendly Interface**: Clean and intuitive sidebar interface for easy access
- **I18n Support**: Supports multiple languages (Currently only supports English and Traditional Chinese)

## How It Works

1. Enter your monthly salary in the extension sidebar
2. The extension calculates your hourly rate
3. When browsing products (especially on Amazon), the extension will:
   - Automatically detect product prices
   - Calculate and display how many working hours you need to afford the item
4. For other websites, you can manually enter product prices to calculate working hours

## Supported Currencies

- 🇹🇼 TWD (Taiwan Dollar)
- 🇺🇸 USD (US Dollar)
- 🇯🇵 JPY (Japanese Yen)

## Installation

[Installation instructions will be added once the extension is published]

## Development

1. Clone the repository
2. Run `npm install` to install the dependencies
3. Run `npm run dev` to start the development server and develop the sidebar window
   **But some browser apis are not available in the development server, try to comment out the code that uses the browser apis**
4. Run `npm run build` to build the extension
5. Load the extension in your browser by opening the `dist` folder

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgements

This project is inspired by some random threads on Threads and my friend [Amo Feng](https://github.com/amo0725)'s idea. Here is the project he built: [Salary-Time-Cost-Calculator](https://github.com/amo0725/Salary-Time-Cost-Calculator)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
