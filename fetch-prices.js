const fs = require('fs');

const ORIGIN = 'DUB';
const MONTHS_AHEAD = 4;

const DEST_NAMES = {
  STN:'London', EDI:'Edinburgh', GLA:'Glasgow', MAN:'Manchester',
  LPL:'Liverpool', BRS:'Bristol', CWL:'Cardiff', BHX:'Birmingham',
  EMA:'East Midlands', BRU:'Brussels', CRL:'Brussels Charleroi',
  CDG:'Paris', AMS:'Amsterdam', BER:'Berlin', CGN:'Cologne',
  VIE:'Vienna', PRG:'Prague', WAW:'Warsaw', KRK:'Kraków',
  BUD:'Budapest', BTS:'Bratislava', TLL:'Tallinn', CPH:'Copenhagen',
  LIS:'Lisbon', OPO:'Porto', FAO:'Faro / Algarve', AGP:'Malaga',
  BCN:'Barcelona', MAD:'Madrid', ALC:'Alicante', SVQ:'Seville',
  PMI:'Palma', MAH:'Minorca', TFS:'Tenerife', ACE:'Lanzarote',
  LPA:'Gran Canaria', MXP:'Milan', FCO:'Rome', NAP:'Naples',
  VCE:'Venice', BLQ:'Bologna', CAG:'Cagliari', BDS:'Brindisi',
  CTA:'Catania', NCE:'Nice', ATH:'Athens', CFU:'Corfu',
  ZTH:'Zakynthos', CHQ:'Chania', RHO:'Rhodes', JTR:'Santorini',
  DBV:'Dubrovnik', SPU:'Split', ZAD:'Zadar', BJV:'Bodrum',
  DLM:'Dalaman / Fethiye', IST:'Istanbul', PFO:'Paphos',
  MLA:'Malta', RAK:'Marrakesh', AGA:'Agadir', FEZ:'Fes', FNC:'Funchal'
};

const DURATION_RANGES = [
  { from: 2, to: 4,  nights: 3  },
  { from: 5, to: 9,  nights: 7  },
  { from: 10, to: 14, nights: 14 }
];

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchPage(durationFrom, durationTo, page) {
  const today = new Date();
  const end = new Date(today);
  end.setMonth(end.getMonth() + MONTHS_AHEAD);

  const retFrom = new Date(today);
  retFrom.setDate(retFrom.getDate() + durationFrom);
  const retTo = new Date(end);
  retTo.setDate(retTo.getDate() + durationTo);

  const url = `https://www.ryanair.com/api/farfnd/v4/roundTripFares?` +
    `departureAirportIataCode=${ORIGIN}` +
    `&outboundDepartureDateFrom=${formatDate(today)}` +
    `&outboundDepartureDateTo=${formatDate(end)}` +
    `&inboundDepartureDateFrom=${formatDate(retFrom)}` +
    `&inboundDepartureDateTo=${formatDate(retTo)}` +
    `&durationFrom=${durationFrom}` +
    `&durationTo=${durationTo}` +
    `&market=en-ie` +
    `&adultPaxCount=1` +
    `&outboundDepartureDaysOfWeek=MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY,SUNDAY` +
    `&outboundDepartureTimeFrom=00:00&outboundDepartureTimeTo=23:59` +
    `&inboundDepartureTimeFrom=00:00&inboundDepartureTimeTo=23:59` +
    `&priceValueTo=9999` +
    `&currency=EUR` +
    `&page=${page}`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
      'Accept-Language': 'en-IE,en;q=0.9',
      'Origin': 'https://www.ryanair.com',
      'Referer': 'https://www.ryanair.com/ie/en/fare-finder'
    }
  });

  if (!res.ok) return { fares: [], nextPage: null };
  const data = await res.json();
  return { fares: data.fares || [], nextPage: data.nextPage ?? null };
}

async function fetchAllFares(durationFrom, durationTo, nights) {
  const allFares = [];
  let page = 0;
  let pageCount = 0;

  console.log(`\n📦 Fetching ${nights}n fares (paginating)...`);

  while (true) {
    const { fares, nextPage } = await fetchPage(durationFrom, durationTo, page);
    allFares.push(...fares);
    pageCount++;
    console.log(`  Page ${page}: ${fares.length} fares (total: ${allFares.length})`);

    if (nextPage === null || nextPage === undefined || fares.length === 0) break;
    page = nextPage;
    await sleep(400);
  }

  console.log(`  ✅ Total: ${allFares.length} fares in ${pageCount} pages`);
  return allFares;
}

async function main() {
  console.log('🚀 IrishTripLab Price Fetcher starting...');
  const prices = {};

  for (const range of DURATION_RANGES) {
    const fares = await fetchAllFares(range.from, range.to, range.nights);

    for (const fare of fares) {
      const destCode = fare.outbound?.arrivalAirport?.iataCode;
      if (!destCode) continue;

      const total = fare.summary?.price?.value;
      const outPrice = fare.outbound?.price?.value;
      const inPrice = fare.inbound?.price?.value;
      const departDate = fare.outbound?.departureDate;
      const retDate = fare.inbound?.departureDate || null;

      if (!total || !departDate) continue;

      const month = departDate.substring(0, 7);

      if (!prices[destCode]) {
        prices[destCode] = { name: DEST_NAMES[destCode] || destCode, months: {} };
      }
      if (!prices[destCode].months[month]) prices[destCode].months[month] = {};

      const existing = prices[destCode].months[month][range.nights];
      if (!existing || total < existing.total) {
        prices[destCode].months[month][range.nights] = {
          total: Math.round(total),
          out: Math.round(outPrice || total / 2),
          ret: Math.round(inPrice || total / 2),
          dateOut: departDate,
          dateIn: retDate
        };
        console.log(`  ✅ ${destCode} ${month} ${range.nights}n: €${Math.round(total)} (${departDate?.substring(0,10)} → ${retDate?.substring(0,10)})`);
      }
    }

    await sleep(1000);
  }

  const output = { updatedAt: new Date().toISOString(), prices };
  fs.writeFileSync('prices.json', JSON.stringify(output, null, 2));
  console.log(`\n✅ Done! prices.json updated at ${output.updatedAt}`);
  console.log(`📊 ${Object.keys(prices).length} destinations found`);
}

main().catch(err => {
  console.error('❌ Fatal:', err);
  process.exit(1);
});
