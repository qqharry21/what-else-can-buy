import { ShoppingBag } from 'lucide-react';
import { useState } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toggle } from '@/components/ui/toggle';

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

function App() {
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
    <div className='w-[350px] h-[500px] bg-white flex flex-col'>
      {/* Header */}
      <header className='border-b p-4 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <ShoppingBag className='h-5 w-5 text-emerald-500' />
          <h1 className='font-semibold text-lg'>What Else Could You Buy?</h1>
        </div>
        {/* <Link href='/settings'>
          <Button
            variant='ghost'
            size='icon'>
            <Settings className='h-5 w-5' />
            <span className='sr-only'>Settings</span>
          </Button>
        </Link> */}
      </header>

      {/* Main Content */}
      <main className='flex-1 overflow-auto p-4'>
        <div className='mb-4'>
          <h2 className='text-lg font-medium'>Current Product</h2>
          <Card className='mt-2'>
            <CardContent className='p-3'>
              <div className='flex items-center gap-3'>
                <div className='h-16 w-16 relative rounded overflow-hidden flex-shrink-0'>
                  {/* <Image
                    src='/placeholder.svg?height=64&width=64'
                    alt='Current product'
                    fill
                    className='object-cover'
                  /> */}
                </div>
                <div>
                  <h3 className='font-medium text-sm line-clamp-1'>
                    Wireless Noise Cancelling Headphones
                  </h3>
                  <p className='text-emerald-600 font-bold'>$299.99</p>
                  <p className='text-xs text-muted-foreground'>Amazon.com</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <div className='flex items-center justify-between mb-2'>
            <h2 className='text-lg font-medium'>What else you could buy:</h2>
            <Toggle aria-label='Toggle favorites'>
              <ShoppingBag className='h-4 w-4' />
              <span className='ml-1 text-xs'>Favorites</span>
            </Toggle>
          </div>

          <Tabs
            defaultValue='all'
            className='w-full'>
            <TabsList className='grid w-full grid-cols-3 mb-2'>
              <TabsTrigger value='all'>All</TabsTrigger>
              <TabsTrigger value='tech'>Tech</TabsTrigger>
              <TabsTrigger value='home'>Home</TabsTrigger>
            </TabsList>
            <TabsContent
              value='all'
              className='mt-0'>
              <div className='space-y-3'>
                {/* {alternativeProducts.map((product, index) => (
                  <AlternativeProductCard
                    key={index}
                    product={product}
                  />
                ))} */}
              </div>
            </TabsContent>
            <TabsContent
              value='tech'
              className='mt-0'>
              <div className='space-y-3'>
                {/* {alternativeProducts
                  .filter((p) => p.category === 'tech')
                  .map((product, index) => (
                    <AlternativeProductCard
                      key={index}
                      product={product}
                    />
                  ))} */}
              </div>
            </TabsContent>
            <TabsContent
              value='home'
              className='mt-0'>
              <div className='space-y-3'>
                {/* {alternativeProducts
                  .filter((p) => p.category === 'home')
                  .map((product, index) => (
                    <AlternativeProductCard
                      key={index}
                      product={product}
                    />
                  ))} */}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className='border-t p-3 text-center text-xs text-muted-foreground'>
        What Else Could You Buy? v1.0.0
      </footer>
    </div>
  );
}

export default App;
