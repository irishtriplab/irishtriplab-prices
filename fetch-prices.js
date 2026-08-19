const fs = require('fs');

// === CONFIG ===
const ORIGIN = 'DUB';
const NIGHTS = [3, 7, 14]; // durées à récupérer
const MONTHS_AHEAD = 4;    // fenêtre glissante : aujourd'hui + 4 mois

// Toutes les destinations Ryanair depuis Dublin
const DESTINATIONS = [
  'LON','EDI','GLA','MAN','LPL','BRS','CWL','BHX', // UK
  'BRU','PAR','AMS','BER','CGN','VIE','PRG',        // Europe centrale
  'WAW','KRK','BUD','BTS','TLL','CPH',              // Europe est/nord
  'LIS','OPO','FAO','AGP','BCN','MAD','ALC',        // Ibérique
  'SVQ','PMI','MAH','TFS','ACE','LPA',              // Espagne îles
  'MIL','ROM','NAP','VCE','BLQ','CAG','BDS','CTA', // Italie
  'NCE',                                            // France
  'ATH','CFU','ZTH','CHQ','RHO','JTR',             // Grèce
  'DBV','SPU','ZAD',                               // Croatie
  'BJV','DLM','IST',                               // Turquie
  'PFO','MLA',                                     // Chypre/Malte
  'RAK','AGA','FEZ','FNC'                          // Maroc/Madeira
];

// Mapping code → nom lisible
const DEST_NAMES = {
  LON:'London', EDI:'Edinburgh', GLA:'Glasgow', MAN:'Manchester',
  LPL:'Liverpool', BRS:'Bristol', CWL:'Cardiff', BHX:'Birmingham',
  BRU:'Brussels', PAR:'Paris', AMS:'Amsterdam', BER:'Berlin',
  CGN:'Cologne', VIE:'Vienna', PRG:'Prague', WAW:'Warsaw',
  KRK:'Kraków', BUD:'Budapest', BTS:'Bratislava', TLL:'Tallinn',
  CPH:'Copenhagen', LIS:'Lisbon', OPO:'Porto', FAO:'Faro / Algarve',
  AGP:'Malaga', BCN:'Barcelona', MAD:'Madrid', ALC:'Alicante',
  SVQ:'Seville', PMI:'Palma', MAH:'Minorca', TFS:'Tenerife',
  ACE:'Lanzarote', LPA:'Gran Canaria', MIL:'Milan', ROM:'Rome',
  NAP:'Naples', VCE:'Venice', BLQ:'Bologna', CAG:'Cagliari',
  BDS:'Brindisi', CTA:'Catania', NCE:'Nice', ATH:'Athens',
  CFU:'Corfu', ZTH:'Zakynthos', CHQ:'Chania', RHO:'Rhodes',
  JTR:'Santorini', DBV:'Dubrovnik', SPU:'Split', ZAD:'Zadar',
  BJV:'Bodrum', DLM:'Dalaman / Fethiye', IST:'Istanbul',
  PFO:'Paphos', MLA:'Malta', RAK:'Marrakesh', AGA:'Agadir',
  FEZ:'Fes', FNC:'Funchal'
};

// === HELPERS ===
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function getDateRange() {
  const today = new Date();
  const end = new Date(today);
  end.setMonth(end.getMonth() + MONTHS_AHEAD);
  return { from: formatDate(today), to: formatDate(end) };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// === FETCH RYANAIR FARFND API ===
async function fetchFares(nights) {
  const { from, to } = getDateRange();

  // Calcul des dates de retour (outbound + nights)
  const returnFrom = new Date(from);
  returnFrom.setDate(returnFrom.getDate() + nights);
  const returnTo = new Date(to);
  returnTo.setDate(returnTo.getDate() + nights);

  const url = `https://services-api.ryanair.com/farfnd/3/roundTripFares?` +
    `departureAirportIataCode=${ORIGIN}` +
    `&language=en` +
    `&market=en-ie` +
    `&limit=200` +
    `&offset=0` +
    `&outboundDepartureDateFrom=${from}` +
    `&outboundDepartureDateTo=${to}` +
    `&inboundDepartureDateFrom=${formatDate(returnFrom)}` +
    `&inboundDepartureDateTo=${formatDate(returnTo)}` +
    `&priceValueTo=9999` +
    `&currency=EUR`;

  console.log(`\nFetching ${nights}n fares (${from} → ${to})...`);

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
      'Accept-Language': 'en-IE,en;q=0.9',
      'Origin': 'https://www.ryanair.com',
      'Referer': 'https://www.ryanair.com/'
    }
  });

  if (!res.ok) {
    console.error(`API error ${res.status} for ${nights}n`);
    return [];
  }

  const data = await res.json();
  return data.fares || [];
}

// === MAIN ===
async function main() {
  console.log('🚀 IrishTripLab Price Fetcher starting...');
  console.log(`📅 Date range: today + ${MONTHS_AHEAD} months`);
  console.log(`🌍 Destinations: ${DESTINATIONS.length}`);

  const prices = {};

  // Init structure
  for (const code of DESTINATIONS) {
    prices[code] = {
      name: DEST_NAMES[code] || code,
      months: {}
    };
  }

  // Fetch pour chaque durée
  for (const nights of NIGHTS) {
    const fares = await fetchFares(nights);
    console.log(`✅ Got ${fares.length} fares for ${nights}n`);

    for (const fare of fares) {
      const destCode = fare.outbound?.arrivalAirport?.iataCode;
      if (!destCode || !DESTINATIONS.includes(destCode)) continue;

      const total = fare.summary?.price?.value;
      const outPrice = fare.outbound?.price?.value;
      const inPrice = fare.inbound?.price?.value;
      const departDate = fare.outbound?.departureDate;

      if (!total || !departDate) continue;

      const month = departDate.substring(0, 7); // "2026-09"

      if (!prices[destCode].months[month]) {
        prices[destCode].months[month] = {};
      }

      // Garder le prix le moins cher pour cette durée/mois
      const existing = prices[destCode].months[month][nights];
      if (!existing || total < existing.total) {
        prices[destCode].months[month][nights] = {
          total: Math.round(total),
          out: Math.round(outPrice || total / 2),
          ret: Math.round(inPrice || total / 2),
          date: departDate
        };
        console.log(`  ✅ ${destCode} ${month} ${nights}n: €${Math.round(total)}`);
      }
    }

    // Pause entre les requêtes pour éviter le rate limiting
    if (nights !== NIGHTS[NIGHTS.length - 1]) {
      console.log('⏳ Waiting 2s...');
      await sleep(2000);
    }
  }

  // Output
  const output = {
    updatedAt: new Date().toISOString(),
    prices
  };

  fs.writeFileSync('prices.json', JSON.stringify(output, null, 2));
  console.log(`\n✅ Done! prices.json updated at ${output.updatedAt}`);
  console.log(`📊 Stats: ${Object.keys(prices).length} destinations`);
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
