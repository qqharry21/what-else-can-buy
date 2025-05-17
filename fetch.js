import fs from 'fs';
import fetch from 'node-fetch';

const API_KEY = process.env.EXCHANGE_RATE_KEY;
const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/TWD`;

async function main() {
  const res = await fetch(API_URL);
  const data = await res.json();
  if (!data.conversion_rates) {
    throw new Error('Invalid API response');
  }

  fs.writeFileSync(
    'public/rates.json',
    JSON.stringify(
      {
        updatedAt: new Date().toISOString(),
        rates: data.conversion_rates,
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
