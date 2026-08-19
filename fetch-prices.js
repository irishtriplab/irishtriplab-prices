const fs = require('fs');

const ORIGIN = 'DUB';
const NIGHTS = [3, 7, 14];
const MONTHS_AHEAD = 4;

const DESTINATIONS = [
  { code: 'STN', name: 'London' },
  { code: 'EDI', name: 'Edinburgh' },
  { code: 'GLA', name: 'Glasgow' },
  { code: 'MAN', name: 'Manchester' },
  { code: 'LPL', name: 'Liverpool' },
  { code: 'BRS', name: 'Bristol' },
  { code: 'CWL', name: 'Cardiff' },
  { code: 'BHX', name: 'Birmingham' },
  { code: 'CRL', name: 'Brussels' },
  { code: 'CDG', name: 'Paris' },
  { code: 'AMS', name: 'Amsterdam' },
  { code: 'BER', name: 'Berlin' },
  { code: 'CGN', name: 'Cologne' },
  { code: 'VIE', name: 'Vienna' },
  { code: 'PRG', name: 'Prague' },
  { code: 'WAW', name: 'Warsaw' },
  { code: 'KRK', name: 'Kraków' },
  { code: 'BUD', name: 'Budapest' },
  { code: 'BTS', name: 'Bratislava' },
  { code: 'TLL', name: 'Tallinn' },
  { code: 'CPH', name: 'Copenhagen' },
  { code: 'LIS', name: 'Lisbon' },
  { code: 'OPO', name: 'Porto' },
  { code: 'FAO', name: 'Faro / Algarve' },
  { code: 'AGP', name: 'Malaga' },
  { code: 'BCN', name: 'Barcelona' },
  { code: 'MAD', name: 'Madrid' },
  { code: 'ALC', name: 'Alicante' },
  { code: 'SVQ', name: 'Seville' },
  { code: 'PMI', name: 'Palma' },
  { code: 'MAH', name: 'Minorca' },
  { code: 'TFS', name: 'Tenerife' },
  { code: 'ACE', name: 'Lanzarote' },
  { code: 'LPA', name: 'Gran Canaria' },
  { code: 'MXP', name: 'Milan' },
  { code: 'FCO', name: 'Rome' },
  { code: 'NAP', name: 'Naples' },
  { code: 'VCE', name: 'Venice' },
  { code: 'BLQ', name: 'Bologna' },
  { code: 'CAG', name: 'Cagliari' },
  { code: 'BDS', name: 'Brindisi' },
  { code: 'CTA', name: 'Catania' },
  { code: 'NCE', name: 'Nice' },
  { code: 'ATH', name: 'Athens' },
  { code: 'CFU', name: 'Corfu' },
  { code: 'ZTH', name: 'Zakynthos' },
  { code: 'CHQ', name: 'Chania' },
  { code: 'RHO', name: 'Rhodes' },
  { code: 'JTR', name: 'Santorini' },
  { code: 'DBV', name: 'Dubrovnik' },
  { code: 'SPU', name: 'Split' },
  { code: 'ZAD', name: 'Zadar' },
  { code: 'BJV', name: 'Bodrum' },
  { code: 'DLM', name: 'Dalaman / Fethiye' },
  { code: 'IST', name: 'Istanbul' },
  { code: 'PFO', name: 'Paphos' },
  { code: 'MLA', name: 'Malta' },
  { code: 'RAK', name: 'Marrakesh' },
  { code: 'AGA', name: 'Agadir' },
  { code: 'FEZ', name: 'Fes' },
  { code: 'FNC', name: 'Funchal' }
];

function formatDate(d) { return d.toISOString().split('T')[0]; }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function getMonths() {
  const months = [];
  const cursor = new Date();
  cursor.setDate(1);
  for (let i = 0; i < MONTHS_AHEAD + 1; i++) {
    months.push(formatDate(new Date(cursor)));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
}

async function fetchCheapestPerDay(origin, dest, month) {
  const url = `https://www.ryanair.com/api/farfnd/3/oneWayFares/${origin}/${dest}/cheapestPerDay?market=en-ie&outboundMonthOfDate=${month}&currency=EUR`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
        'Referer': 'https://www.ryanair.com/'
      }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.outbound?.fares || [];
  } catch(e) { return []; }
}

async function main() {
  console.log('🚀 IrishTripLab Price Fetcher starting...');
  const months = getMonths();
  console.log(`📅 Months: ${months.join(', ')}`);
  const prices = {};

  for (const dest of DESTINATIONS) {
    // Collecter prix outbound (DUB→DEST) par date
    const outPrices = {};
    for (const month of months) {
      const fares = await fetchCheapestPerDay(ORIGIN, dest.code, month);
      for (const f of fares) {
        if (f.price?.value && !f.soldOut) outPrices[f.day] = f.price.value;
      }
      await sleep(200);
    }

    // Collecter prix retour (DEST→DUB) par date
    const retPrices = {};
    for (const month of months) {
      const fares = await fetchCheapestPerDay(dest.code, ORIGIN, month);
      for (const f of fares) {
        if (f.price?.value && !f.soldOut) retPrices[f.day] = f.price.value;
      }
      await sleep(200);
    }

    // Combiner aller + retour pour chaque durée
    prices[dest.code] = { name: dest.name, months: {} };

    for (const outDate of Object.keys(outPrices).sort()) {
      const outPrice = outPrices[outDate];
      const month = outDate.substring(0, 7);

      for (const nights of NIGHTS) {
        const retDate = new Date(outDate);
        retDate.setDate(retDate.getDate() + nights);
        const retDateStr = formatDate(retDate);
        const retPrice = retPrices[retDateStr];
        if (!retPrice) continue;

        const total = Math.round(outPrice + retPrice);
        if (!prices[dest.code].months[month]) prices[dest.code].months[month] = {};

        const existing = prices[dest.code].months[month][nights];
        if (!existing || total < existing.total) {
          prices[dest.code].months[month][nights] = {
            total,
            out: Math.round(outPrice),
            ret: Math.round(retPrice),
            dateOut: outDate,
            dateIn: retDateStr
          };
        }
      }
    }

    const found = Object.keys(prices[dest.code].months).length;
    console.log(`✅ ${dest.code} (${dest.name}): ${found} months`);
  }

  const output = { updatedAt: new Date().toISOString(), prices };
  fs.writeFileSync('prices.json', JSON.stringify(output, null, 2));
  console.log(`\n✅ Done! prices.json updated at ${output.updatedAt}`);
  console.log(`📊 ${Object.keys(prices).length} destinations`);
}

main().catch(err => { console.error('❌', err); process.exit(1); });
