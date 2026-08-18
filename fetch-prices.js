const https = require('https');
const fs = require('fs');

const destinations = [
  {name:'Agadir', code:'AGA'},
  {name:'Alghero', code:'AHO'},
  {name:'Alicante', code:'ALC'},
  {name:'Amsterdam', code:'AMS'},
  {name:'Athens', code:'ATH'},
  {name:'Barcelona', code:'BCN'},
  {name:'Barcelona Girona', code:'GRO'},
  {name:'Barcelona Reus', code:'REU'},
  {name:'Bari', code:'BRI'},
  {name:'Basel', code:'BSL'},
  {name:'Berlin', code:'BER'},
  {name:'Birmingham', code:'BHX'},
  {name:'Bodrum', code:'BJV'},
  {name:'Bologna', code:'BLQ'},
  {name:'Bratislava', code:'BTS'},
  {name:'Brindisi', code:'BDS'},
  {name:'Bristol', code:'BRS'},
  {name:'Brussels Charleroi', code:'CRL'},
  {name:'Brussels', code:'BRU'},
  {name:'Bucharest', code:'OTP'},
  {name:'Budapest', code:'BUD'},
  {name:'Burgas', code:'BOJ'},
  {name:'Cagliari', code:'CAG'},
  {name:'Cardiff', code:'CWL'},
  {name:'Chania', code:'CHQ'},
  {name:'Cluj', code:'CLJ'},
  {name:'Cologne', code:'CGN'},
  {name:'Copenhagen', code:'CPH'},
  {name:'Corfu', code:'CFU'},
  {name:'Dalaman', code:'DLM'},
  {name:'Dubrovnik', code:'DBV'},
  {name:'East Midlands', code:'EMA'},
  {name:'Edinburgh', code:'EDI'},
  {name:'Faro', code:'FAO'},
  {name:'Fuerteventura', code:'FUE'},
  {name:'Gdansk', code:'GDN'},
  {name:'Glasgow', code:'GLA'},
  {name:'Gran Canaria', code:'LPA'},
  {name:'Ibiza', code:'IBZ'},
  {name:'Katowice', code:'KTW'},
  {name:'Kos', code:'KGS'},
  {name:'Krakow', code:'KRK'},
  {name:'Lanzarote', code:'ACE'},
  {name:'Leeds Bradford', code:'LBA'},
  {name:'Lisbon', code:'LIS'},
  {name:'Liverpool', code:'LPL'},
  {name:'London Gatwick', code:'LGW'},
  {name:'London Luton', code:'LTN'},
  {name:'London Stansted', code:'STN'},
  {name:'Luxembourg', code:'LUX'},
  {name:'Madeira Funchal', code:'FNC'},
  {name:'Madrid', code:'MAD'},
  {name:'Malaga', code:'AGP'},
  {name:'Malta', code:'MLA'},
  {name:'Manchester', code:'MAN'},
  {name:'Marrakesh', code:'RAK'},
  {name:'Marseille', code:'MRS'},
  {name:'Menorca', code:'MAH'},
  {name:'Milan Bergamo', code:'BGY'},
  {name:'Milan Malpensa', code:'MXP'},
  {name:'Naples', code:'NAP'},
  {name:'Newcastle', code:'NCL'},
  {name:'Nice', code:'NCE'},
  {name:'Olbia', code:'OLB'},
  {name:'Palermo', code:'PMO'},
  {name:'Palma', code:'PMI'},
  {name:'Paphos', code:'PFO'},
  {name:'Paris Beauvais', code:'BVA'},
  {name:'Pisa', code:'PSA'},
  {name:'Porto', code:'OPO'},
  {name:'Poznan', code:'POZ'},
  {name:'Prague', code:'PRG'},
  {name:'Rabat', code:'RBA'},
  {name:'Rhodes', code:'RHO'},
  {name:'Riga', code:'RIX'},
  {name:'Rome', code:'FCO'},
  {name:'Rzeszow', code:'RZE'},
  {name:'Salzburg', code:'SZG'},
  {name:'Santorini', code:'JTR'},
  {name:'Seville', code:'SVQ'},
  {name:'Sofia', code:'SOF'},
  {name:'Split', code:'SPU'},
  {name:'Stockholm', code:'ARN'},
  {name:'Tallinn', code:'TLL'},
  {name:'Tenerife South', code:'TFS'},
  {name:'Thessaloniki', code:'SKG'},
  {name:'Tirana', code:'TIA'},
  {name:'Toulouse', code:'TLS'},
  {name:'Turin', code:'TRN'},
  {name:'Valencia', code:'VLC'},
  {name:'Venice', code:'VCE'},
  {name:'Verona', code:'VRN'},
  {name:'Vienna', code:'VIE'},
  {name:'Vilnius', code:'VNO'},
  {name:'Warsaw Modlin', code:'WMI'},
  {name:'Wroclaw', code:'WRO'},
  {name:'Zadar', code:'ZAD'},
  {name:'Zagreb', code:'ZAG'},
  {name:'Zakynthos', code:'ZTH'},
];

const NIGHTS = [3, 7, 14];

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; PriceBot/1.0)',
      }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Get next 3 months
function getNextMonths() {
  const months = [];
  const now = new Date();
  for (let i = 1; i <= 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push(d.toISOString().slice(0, 7));
  }
  return months;
}

async function getCheapestOneWay(from, to, month) {
  const url = `https://www.ryanair.com/api/farfnd/v4/oneWayFares?departureAirportIataCode=${from}&arrivalAirportIataCode=${to}&outboundDepartureDateFrom=${month}-01&outboundDepartureDateTo=${month}-28&currency=EUR&priceValueTo=999`;
  try {
    const data = await fetchJSON(url);
    if (data.fares && data.fares.length > 0) {
      const prices = data.fares
        .filter(f => f.summary?.price?.value)
        .map(f => ({ price: f.summary.price.value, date: f.outbound?.departureDate }));
      prices.sort((a, b) => a.price - b.price);
      return prices[0] || null;
    }
  } catch(e) {}
  return null;
}

async function main() {
  const months = getNextMonths();
  const prices = {};
  const updatedAt = new Date().toISOString();

  console.log(`Fetching prices for months: ${months.join(', ')}`);
  console.log(`Destinations: ${destinations.length}`);

  for (const dest of destinations) {
    prices[dest.code] = { name: dest.name, months: {} };

    for (const month of months) {
      prices[dest.code].months[month] = {};

      const outbound = await getCheapestOneWay('DUB', dest.code, month);
      if (!outbound) {
        await sleep(300);
        continue;
      }

      for (const nights of NIGHTS) {
        const retDate = new Date(outbound.date);
        retDate.setDate(retDate.getDate() + nights);
        const retFrom = new Date(retDate); retFrom.setDate(retFrom.getDate() - 2);
        const retTo = new Date(retDate); retTo.setDate(retTo.getDate() + 2);

        const retUrl = `https://www.ryanair.com/api/farfnd/v4/oneWayFares?departureAirportIataCode=${dest.code}&arrivalAirportIataCode=DUB&outboundDepartureDateFrom=${retFrom.toISOString().slice(0,10)}&outboundDepartureDateTo=${retTo.toISOString().slice(0,10)}&currency=EUR`;
        
        try {
          const retData = await fetchJSON(retUrl);
          let returnPrice = 0;
          if (retData.fares?.length > 0) {
            const retPrices = retData.fares.filter(f => f.summary?.price?.value).map(f => f.summary.price.value);
            returnPrice = Math.min(...retPrices);
          }
          prices[dest.code].months[month][nights] = {
            total: Math.round(outbound.price + returnPrice),
            out: Math.round(outbound.price),
            ret: Math.round(returnPrice),
            date: outbound.date
          };
          console.log(`✅ ${dest.name} ${month} ${nights}n: €${Math.round(outbound.price + returnPrice)}`);
        } catch(e) {}

        await sleep(200);
      }
      await sleep(300);
    }
  }

  const output = { updatedAt, prices };
  fs.writeFileSync('prices.json', JSON.stringify(output, null, 2));
  console.log(`\n✅ Done! prices.json updated at ${updatedAt}`);
}

main().catch(console.error);
