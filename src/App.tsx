import { useState } from 'react';

import { Footer } from './components/footer';
import { Header } from './components/header';
import { HomePage } from './components/pages/home-page';
import { SettingsPage } from './components/pages/settings-page';
import { GlobalContextProvider } from './contexts/global-context';
import { type Page } from './contexts/page-context';
import { usePageContext } from './hooks/usePageContext';

type Category = 'food' | 'fun' | 'save';
type Currency = 'TWD' | 'USD' | 'JPY';

const exchangeRates: Record<Currency, number> = {
  TWD: 1,
  USD: 30,
  JPY: 0.22,
};

const alternatives: Record<Category, { label: string; unitPrice: number; icon: string }[]> = {
  food: [
    { label: 'Bubble tea', unitPrice: 50, icon: '🧋' },
    { label: 'Fast food meal', unitPrice: 120, icon: '🍔' },
    { label: 'Ramen bowl', unitPrice: 250, icon: '🍜' },
    { label: 'Braised pork rice', unitPrice: 100, icon: '🍚' },
  ],
  fun: [
    { label: 'Movie ticket', unitPrice: 280, icon: '🎬' },
    { label: 'KTV hour', unitPrice: 400, icon: '🎤' },
    { label: 'Escape room', unitPrice: 800, icon: '🕵️' },
  ],
  save: [
    { label: 'Stock share', unitPrice: 1000, icon: '📈' },
    { label: 'Taipei→Taichung HSR', unitPrice: 1200, icon: '🚄' },
    { label: 'Emergency fund unit', unitPrice: 3000, icon: '🛟' },
  ],
};

const pageContent: Record<Page, React.ReactNode> = {
  home: <HomePage />,
  settings: <SettingsPage />,
};

function App() {
  const { page } = usePageContext();
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('TWD');
  const [category, setCategory] = useState<Category>('food');

  const parsed = parseFloat(amount);
  const converted = parsed * exchangeRates[currency];

  // return (
  //   <div className='p-4 w-80 text-white bg-gradient-to-b from-indigo-900 to-neutral-950'>
  //     <h1 className='text-lg font-semibold mb-4 text-center'>💸 What Else Could You Buy?</h1>

  //     <div className='mb-3'>
  //       <label className='block text-sm font-medium mb-1'>Amount</label>
  //       <input
  //         type='number'
  //         className='w-full px-3 py-2 border border-gray-300 rounded-md mb-1 focus:outline-none focus:ring-2 focus:ring-indigo-500'
  //         placeholder='e.g. 100'
  //         value={amount}
  //         onChange={(e) => setAmount(e.target.value)}
  //       />
  //       <select
  //         className='w-full px-2 py-1 mt-1 border border-gray-300 rounded-md text-sm'
  //         value={currency}
  //         onChange={(e) => setCurrency(e.target.value as Currency)}>
  //         <option value='TWD'>TWD</option>
  //         <option value='USD'>USD</option>
  //         <option value='JPY'>JPY</option>
  //       </select>
  //     </div>

  //     <div className='mb-3'>
  //       <label className='block text-sm font-medium mb-1'>Category</label>
  //       <div className='flex space-x-2'>
  //         {(['food', 'fun', 'save'] as Category[]).map((cat) => (
  //           <button
  //             key={cat}
  //             onClick={() => setCategory(cat)}
  //             className={`px-3 py-1 rounded-full text-sm border ${
  //               cat === category ? 'bg-neutral-800 text-white' : 'bg-gray-100 text-neutral-950'
  //             }`}>
  //             {cat}
  //           </button>
  //         ))}
  //       </div>
  //     </div>

  //     {parsed > 0 && (
  //       <div className='bg-gray-50 border border-gray-200 p-3 rounded-md'>
  //         <p className='text-sm font-semibold mb-2 text-gray-700'>
  //           With {parsed} {currency}, you could get:
  //         </p>
  //         <ul className='text-sm space-y-1'>
  //           {alternatives[category].map((item) => (
  //             <li
  //               key={item.label}
  //               className='text-neutral-950'>
  //               {item.icon} {(converted / item.unitPrice).toFixed(1)} × {item.label}
  //             </li>
  //           ))}
  //         </ul>
  //       </div>
  //     )}
  //   </div>
  // );
  return (
    <GlobalContextProvider>
      <div className='w-[500px] min-h-fit h-[600px] bg-white flex flex-col'>
        <Header />

        <main className='flex-1 overflow-auto p-4'>{pageContent[page]}</main>

        <Footer />
      </div>
    </GlobalContextProvider>
  );
}

export default App;
