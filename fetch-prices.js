const fs = require('fs');

const ORIGIN = 'DUB';
const NIGHTS = [3, 7, 14];
const MONTHS_AHEAD = 4;

const DESTINATIONS = [
  // UK & Ireland
  { code: 'STN', name: 'London' },
  { code: 'LGW', name: 'London Gatwick' },
  { code: 'LTN', name: 'London Luton' },
  { code: 'EDI', name: 'Edinburgh' },
  { code: 'GLA', name: 'Glasgow' },
  { code: 'MAN', name: 'Manchester' },
  { code: 'LPL', name: 'Liverpool' },
  { code: 'BRS', name: 'Bristol' },
  { code: 'CWL', name: 'Cardiff' },
  { code: 'BHX', name: 'Birmingham' },
  { code: 'EMA', name: 'East Midlands' },
  { code: 'LBA', name: 'Leeds-Bradford' },
  { code: 'NCL', name: 'Newcastle' },
  { code: 'NQY', name: 'Newquay' },
  // Belgium / Luxembourg
  { code: 'CRL', name: 'Brussels' },
  { code: 'BRU', name: 'Brussels Zaventem' },
  { code: 'LUX', name: 'Luxembourg' },
  // France
  { code: 'BVA', name: 'Paris' },
  { code: 'NCE', name: 'Nice' },
  { code: 'BIQ', name: 'Biarritz' },
  { code: 'CCF', name: 'Carcassonne' },
  { code: 'GNB', name: 'Grenoble' },
  { code: 'LRH', name: 'La Rochelle' },
  { code: 'LDE', name: 'Lourdes' },
  { code: 'NTE', name: 'Nantes' },
  { code: 'FNI', name: 'Nimes' },
  { code: 'TLS', name: 'Toulouse' },
  // Netherlands / Germany / Switzerland
  { code: 'AMS', name: 'Amsterdam' },
  { code: 'BER', name: 'Berlin' },
  { code: 'CGN', name: 'Cologne' },
  { code: 'HAM', name: 'Hamburg' },
  { code: 'FMM', name: 'Memmingen (Munich)' },
  { code: 'BSL', name: 'Basel-Mulhouse' },
  // Austria / Czech / Slovakia / Hungary
  { code: 'VIE', name: 'Vienna' },
  { code: 'SZG', name: 'Salzburg' },
  { code: 'PRG', name: 'Prague' },
  { code: 'BTS', name: 'Bratislava' },
  { code: 'KSC', name: 'Kosice' },
  { code: 'BUD', name: 'Budapest' },
  // Poland
  { code: 'WMI', name: 'Warsaw' },
  { code: 'KRK', name: 'Kraków' },
  { code: 'GDN', name: 'Gdansk' },
  { code: 'KTW', name: 'Katowice' },
  { code: 'WRO', name: 'Wroclaw' },
  { code: 'POZ', name: 'Poznan' },
  { code: 'LUZ', name: 'Lublin' },
  { code: 'BZG', name: 'Bydgoszcz' },
  { code: 'SZZ', name: 'Szczecin' },
  { code: 'RZE', name: 'Rzeszow' },
  { code: 'LCJ', name: 'Lodz' },
  // Baltics / Scandinavia
  { code: 'TLL', name: 'Tallinn' },
  { code: 'RIX', name: 'Riga' },
  { code: 'VNO', name: 'Vilnius' },
  { code: 'KUN', name: 'Kaunas' },
  { code: 'ARN', name: 'Stockholm' },
  { code: 'RVN', name: 'Rovaniemi' },
  { code: 'CPH', name: 'Copenhagen' },
  // Romania / Bulgaria
  { code: 'OTP', name: 'Bucharest' },
  { code: 'CLJ', name: 'Cluj-Napoca' },
  { code: 'IAS', name: 'Iasi' },
  { code: 'SOF', name: 'Sofia' },
  { code: 'BOJ', name: 'Burgas' },
  // Portugal
  { code: 'LIS', name: 'Lisbon' },
  { code: 'OPO', name: 'Porto' },
  { code: 'FAO', name: 'Faro / Algarve' },
  { code: 'FNC', name: 'Funchal' },
  // Spain
  { code: 'AGP', name: 'Malaga' },
  { code: 'BCN', name: 'Barcelona' },
  { code: 'GRO', name: 'Barcelona Girona' },
  { code: 'REU', name: 'Barcelona Reus' },
  { code: 'MAD', name: 'Madrid' },
  { code: 'ALC', name: 'Alicante' },
  { code: 'SVQ', name: 'Seville' },
  { code: 'VLC', name: 'Valencia' },
  { code: 'SDR', name: 'Santander' },
  { code: 'SCQ', name: 'Santiago' },
  { code: 'RMU', name: 'Murcia' },
  { code: 'PMI', name: 'Palma' },
  { code: 'MAH', name: 'Minorca' },
  { code: 'IBZ', name: 'Ibiza' },
  { code: 'TFS', name: 'Tenerife' },
  { code: 'ACE', name: 'Lanzarote' },
  { code: 'LPA', name: 'Gran Canaria' },
  { code: 'FUE', name: 'Fuerteventura' },
  // Italy
  { code: 'MXP', name: 'Milan' },
  { code: 'BGY', name: 'Milan Bergamo' },
  { code: 'FCO', name: 'Rome' },
  { code: 'NAP', name: 'Naples' },
  { code: 'VCE', name: 'Venice' },
  { code: 'BLQ', name: 'Bologna' },
  { code: 'PSA', name: 'Pisa' },
  { code: 'TRN', name: 'Turin' },
  { code: 'TRS', name: 'Trieste' },
  { code: 'VRN', name: 'Verona' },
  { code: 'CAG', name: 'Cagliari' },
  { code: 'AHO', name: 'Alghero' },
  { code: 'OLB', name: 'Olbia' },
  { code: 'BRI', name: 'Bari' },
  { code: 'BDS', name: 'Brindisi' },
  { code: 'PMO', name: 'Palermo' },
  // Croatia / Slovenia / Balkans
  { code: 'DBV', name: 'Dubrovnik' },
  { code: 'SPU', name: 'Split' },
  { code: 'ZAD', name: 'Zadar' },
  { code: 'ZAG', name: 'Zagreb' },
  { code: 'TIA', name: 'Tirana' },
  // Greece
  { code: 'ATH', name: 'Athens' },
  { code: 'CFU', name: 'Corfu' },
  { code: 'ZTH', name: 'Zakynthos' },
  { code: 'CHQ', name: 'Chania' },
  { code: 'RHO', name: 'Rhodes' },
  { code: 'JTR', name: 'Santorini' },
  { code: 'KGS', name: 'Kos' },
  { code: 'SKG', name: 'Thessaloniki' },
  // Turkey
  { code: 'BJV', name: 'Bodrum' },
  { code: 'DLM', name: 'Dalaman / Fethiye' },
  // Cyprus / Malta
  { code: 'PFO', name: 'Paphos' },
  { code: 'MLA', name: 'Malta' },
  // Morocco
  { code: 'RAK', name: 'Marrakesh' },
  { code: 'AGA', name: 'Agadir' },
  { code: 'RBA', name: 'Rabat' }
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
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json', 'Referer': 'https://www.ryanair.com/' }
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
    const outPrices = {};
    for (const month of months) {
      const fares = await fetchCheapestPerDay(ORIGIN, dest.code, month);
      for (const f of fares) {
        if (f.price?.value && !f.soldOut) outPrices[f.day] = f.price.value;
      }
      await sleep(200);
    }

    const retPrices = {};
    for (const month of months) {
      const fares = await fetchCheapestPerDay(dest.code, ORIGIN, month);
      for (const f of fares) {
        if (f.price?.value && !f.soldOut) retPrices[f.day] = f.price.value;
      }
      await sleep(200);
    }

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
            total, out: Math.round(outPrice), ret: Math.round(retPrice),
            dateOut: outDate, dateIn: retDateStr
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
