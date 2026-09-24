const fs = require('fs');
const path = require('path');

// Liste de toutes les destinations avec leur photo Unsplash actuelle
const IMAGES = [
  { code: 'STN', url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80' },
  { code: 'EDI', url: 'https://images.unsplash.com/photo-1506377585622-bedcbb027afc?q=80&w=1170&auto=format&fit=crop' },
  { code: 'GLA', url: 'https://images.unsplash.com/photo-1621519604512-85ea63c15ca2?q=80&w=1079&auto=format&fit=crop' },
  { code: 'MAN', url: 'https://images.unsplash.com/photo-1543872084-c7bd3822856f?w=600&q=80' },
  { code: 'LPL', url: 'https://images.unsplash.com/photo-1601779436248-4c269c0a0793?q=80&w=2070&auto=format&fit=crop' },
  { code: 'BRS', url: 'https://images.unsplash.com/photo-1502732728614-8329a1bf1415?q=80&w=1170&auto=format&fit=crop' },
  { code: 'CWL', url: 'https://images.unsplash.com/photo-1631125315683-b50db62a94ff?q=80&w=1170&auto=format&fit=crop' },
  { code: 'BHX', url: 'https://images.unsplash.com/photo-1609949279531-cf48d64bed89?w=600&q=80' },
  { code: 'CRL', url: 'https://images.unsplash.com/photo-1573995890753-a4f23342db17?q=80&w=715&auto=format&fit=crop' },
  { code: 'AMS', url: 'https://images.unsplash.com/photo-1622015524070-5ea7caac2643?q=80&w=735&auto=format&fit=crop' },
  { code: 'BER', url: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&q=80' },
  { code: 'CGN', url: 'https://images.unsplash.com/photo-1648198472274-1bf657c15963?q=80&w=1172&auto=format&fit=crop' },
  { code: 'VIE', url: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=600&q=80' },
  { code: 'PRG', url: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=600&q=80' },
  { code: 'BUD', url: 'https://images.unsplash.com/photo-1616432902940-b7a1acbc60b3?q=80&w=1170&auto=format&fit=crop' },
  { code: 'BTS', url: 'https://images.unsplash.com/photo-1620283110809-3ff3adfe057b?q=80&w=1332&auto=format&fit=crop' },
  { code: 'TLL', url: 'https://images.unsplash.com/photo-1564951537954-29dd59397b90?w=600&q=80' },
  { code: 'KRK', url: 'https://images.unsplash.com/photo-1562050380-55da3bae840c?q=80&w=1170&auto=format&fit=crop' },
  { code: 'WMI', url: 'https://images.unsplash.com/photo-1519197924294-4ba991a11128?w=600&q=80' },
  { code: 'GDN', url: 'https://images.unsplash.com/photo-1769285468984-86296da6c180?w=600&q=80' },
  { code: 'KTW', url: 'https://images.unsplash.com/photo-1785791456681-5c0a52e90efc?w=600&q=80' },
  { code: 'WRO', url: 'https://images.unsplash.com/photo-1563177978-4c5ffc081b2a?w=600&q=80' },
  { code: 'POZ', url: 'https://images.unsplash.com/photo-1656006319773-055beac4ec45?w=600&q=80' },
  { code: 'LUZ', url: 'https://images.unsplash.com/photo-1621275471769-e6aa344546d5?w=600&q=80' },
  { code: 'BZG', url: 'https://images.unsplash.com/photo-1664452066236-6318531c48a1?w=600&q=80' },
  { code: 'SZZ', url: 'https://images.unsplash.com/photo-1584646098378-0874589d76b1?w=600&q=80' },
  { code: 'RZE', url: 'https://images.unsplash.com/photo-1690293919131-000fc02b709d?w=600&q=80' },
  { code: 'LCJ', url: 'https://images.unsplash.com/photo-1773232807711-29b6083c9914?w=600&q=80' },
  { code: 'CPH', url: 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=600&q=80' },
  { code: 'LIS', url: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?q=80&w=1173&auto=format&fit=crop' },
  { code: 'OPO', url: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600&q=80' },
  { code: 'FAO', url: 'https://images.unsplash.com/photo-1619120565856-bd121937cfeb?q=80&w=764&auto=format&fit=crop' },
  { code: 'AGP', url: 'https://images.unsplash.com/photo-1560801514-704d01da7745?w=600&q=80' },
  { code: 'BCN', url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&q=80' },
  { code: 'MAD', url: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=600&q=80' },
  { code: 'ALC', url: 'https://images.unsplash.com/photo-1680537732160-01750bae5217?q=80&w=2070&auto=format&fit=crop' },
  { code: 'SVQ', url: 'https://images.unsplash.com/photo-1661442196029-ecc4a8e0a0b8?q=80&w=2074&auto=format&fit=crop' },
  { code: 'PMI', url: 'https://images.unsplash.com/photo-1537042145424-98c3022ed567?q=80&w=735&auto=format&fit=crop' },
  { code: 'MAH', url: 'https://images.unsplash.com/photo-1592634186523-484938bc3c22?q=80&w=688&auto=format&fit=crop' },
  { code: 'TFS', url: 'https://images.unsplash.com/photo-1579090814807-60808035e1cb?q=80&w=1170&auto=format&fit=crop' },
  { code: 'ACE', url: 'https://images.unsplash.com/photo-1643965304951-07a7ebb783a0?q=80&w=1170&auto=format&fit=crop' },
  { code: 'LPA', url: 'https://images.unsplash.com/photo-1598352103173-7556a25673c5?q=80&w=1074&auto=format&fit=crop' },
  { code: 'MXP', url: 'https://images.unsplash.com/photo-1567760855784-589f09ed5dc6?q=80&w=1976&auto=format&fit=crop' },
  { code: 'FCO', url: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=600&q=80' },
  { code: 'BVA', url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80' },
  { code: 'NAP', url: 'https://images.unsplash.com/photo-1728988120174-1bdf6ef22603?q=80&w=1074&auto=format&fit=crop' },
  { code: 'VCE', url: 'https://images.unsplash.com/photo-1534113414509-0eec2bfb493f?w=600&q=80' },
  { code: 'BLQ', url: 'https://images.unsplash.com/photo-1635469019177-7264fc1e013c?q=80&w=1170&auto=format&fit=crop' },
  { code: 'CAG', url: 'https://images.unsplash.com/photo-1593075356257-252c29b02ce8?w=600&q=80' },
  { code: 'BDS', url: 'https://images.unsplash.com/photo-1609948368716-254e2501d243?q=80&w=1074&auto=format&fit=crop' },
  { code: 'ATH', url: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=600&q=80' },
  { code: 'CFU', url: 'https://images.unsplash.com/photo-1500198894528-3819de6ad916?q=80&w=1332&auto=format&fit=crop' },
  { code: 'ZTH', url: 'https://images.unsplash.com/photo-1568323800788-78f87a78e492?q=80&w=1170&auto=format&fit=crop' },
  { code: 'CHQ', url: 'https://images.unsplash.com/photo-1596023397605-709cadaa4fce?q=80&w=1074&auto=format&fit=crop' },
  { code: 'RHO', url: 'https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?w=600&q=80' },
  { code: 'JTR', url: 'https://images.unsplash.com/photo-1504512485720-7d83a16ee930?w=600&q=80' },
  { code: 'DBV', url: 'https://images.unsplash.com/photo-1610104052927-ed67e7faefc3?q=80&w=1074&auto=format&fit=crop' },
  { code: 'SPU', url: 'https://images.unsplash.com/photo-1555990538-c48ab0a194b5?q=80&w=1171&auto=format&fit=crop' },
  { code: 'ZAD', url: 'https://images.unsplash.com/photo-1668450418514-7928a8f58d06?w=600&q=80' },
  { code: 'BJV', url: 'https://images.unsplash.com/photo-1727713682954-271a2135c375?q=80&w=1170&auto=format&fit=crop' },
  { code: 'DLM', url: 'https://images.unsplash.com/photo-1522740550390-62077fe6a82e?w=600&q=80' },
  { code: 'PFO', url: 'https://images.unsplash.com/photo-1622632983419-53f7c2737d23?q=80&w=1074&auto=format&fit=crop' },
  { code: 'MLA', url: 'https://images.unsplash.com/photo-1571510168951-bc6189f2dfad?w=600&q=80' },
  { code: 'NCE', url: 'https://images.unsplash.com/photo-1643914729809-4aa59fdc4c17?q=80&w=1074&auto=format&fit=crop' },
  { code: 'RAK', url: 'https://images.unsplash.com/photo-1580746738099-1cb74f972feb?q=80&w=735&auto=format&fit=crop' },
  { code: 'AGA', url: 'https://images.unsplash.com/photo-1538053367502-742497073841?q=80&w=1170&auto=format&fit=crop' },
  { code: 'FNC', url: 'https://images.unsplash.com/photo-1674333362725-84e9996aa6fb?w=600&q=80' },
  { code: 'EMA', url: 'https://images.unsplash.com/photo-1570977750810-646274873bdd?w=600&q=80' },
  { code: 'LBA', url: 'https://images.unsplash.com/photo-1722498909475-4745f13387db?w=600&q=80' },
  { code: 'NCL', url: 'https://images.unsplash.com/photo-1629858997805-d29f2c3b5c4a?w=600&q=80' },
  { code: 'NQY', url: 'https://images.unsplash.com/photo-1564085664537-5fa766be6629?w=600&q=80' },
  { code: 'BRU', url: 'https://images.unsplash.com/photo-1548092304-e0205cb0031b?w=600&q=80' },
  { code: 'LUX', url: 'https://images.unsplash.com/photo-1588336899284-950764f07147?w=600&q=80' },
  { code: 'BIQ', url: 'https://images.unsplash.com/photo-1591806058491-cbc786f5c7a1?w=600&q=80' },
  { code: 'CCF', url: 'https://images.unsplash.com/photo-1588278183316-7c7a88cc683d?w=600&q=80' },
  { code: 'GNB', url: 'https://images.unsplash.com/photo-1595765460960-0cbe6cb58b00?w=600&q=80' },
  { code: 'LRH', url: 'https://images.unsplash.com/photo-1587931693473-9598be66ae1c?w=600&q=80' },
  { code: 'LDE', url: 'https://images.unsplash.com/photo-1604863050091-d9864f22a83c?w=600&q=80' },
  { code: 'NTE', url: 'https://images.unsplash.com/photo-1682841469580-7c702a7c32e3?w=600&q=80' },
  { code: 'FNI', url: 'https://images.unsplash.com/photo-1706233674922-febe573ad52f?w=600&q=80' },
  { code: 'TLS', url: 'https://images.unsplash.com/photo-1668935445093-82a4af5f6c10?w=600&q=80' },
  { code: 'HAM', url: 'https://images.unsplash.com/photo-1553547274-0df401ae03c9?w=600&q=80' },
  { code: 'FMM', url: 'https://images.unsplash.com/photo-1580677616212-2fa929e9c2cd?w=600&q=80' },
  { code: 'BSL', url: 'https://images.unsplash.com/photo-1728402077556-7c2d3787e44f?w=600&q=80' },
  { code: 'SZG', url: 'https://images.unsplash.com/photo-1603892710963-331039c8dc66?w=600&q=80' },
  { code: 'KSC', url: 'https://images.unsplash.com/photo-1738686001611-39b03de57797?w=600&q=80' },
  { code: 'RIX', url: 'https://images.unsplash.com/photo-1567669721460-221b82865ee0?w=600&q=80' },
  { code: 'VNO', url: 'https://images.unsplash.com/photo-1660562278746-72e961bb9644?w=600&q=80' },
  { code: 'KUN', url: 'https://images.unsplash.com/photo-1591985745790-86fb27a08ab6?w=600&q=80' },
  { code: 'ARN', url: 'https://images.unsplash.com/photo-1588653818221-2651ec1a6423?w=600&q=80' },
  { code: 'RVN', url: 'https://images.unsplash.com/photo-1637138769122-6ad2ffb766dd?w=600&q=80' },
  { code: 'OTP', url: 'https://images.unsplash.com/photo-1690285044968-e2c856885065?w=600&q=80' },
  { code: 'CLJ', url: 'https://images.unsplash.com/photo-1622568987455-b53305e14b39?w=600&q=80' },
  { code: 'IAS', url: 'https://images.unsplash.com/photo-1710877669376-7633d6f64678?w=600&q=80' },
  { code: 'SOF', url: 'https://images.unsplash.com/photo-1594803294810-c860e5d29e07?w=600&q=80' },
  { code: 'BOJ', url: 'https://images.unsplash.com/photo-1725653510788-e2a608865b87?w=600&q=80' },
  { code: 'GRO', url: 'https://images.unsplash.com/photo-1643143127865-406ca08d16bd?w=600&q=80' },
  { code: 'REU', url: 'https://images.unsplash.com/photo-1643143127865-406ca08d16bd?w=600&q=80' },
  { code: 'VLC', url: 'https://images.unsplash.com/photo-1719401542194-95139aed215c?w=600&q=80' },
  { code: 'SDR', url: 'https://images.unsplash.com/photo-1519173542625-01c6e1a8d7a9?w=600&q=80' },
  { code: 'SCQ', url: 'https://images.unsplash.com/photo-1660496685662-b635f574f395?w=600&q=80' },
  { code: 'RMU', url: 'https://images.unsplash.com/photo-1789483439075-0a4a4b9534ed?w=600&q=80' },
  { code: 'IBZ', url: 'https://images.unsplash.com/photo-1602212356541-b9b31ea96a42?w=600&q=80' },
  { code: 'FUE', url: 'https://images.unsplash.com/photo-1607729990781-985e34315e16?w=600&q=80' },
  { code: 'BGY', url: 'https://images.unsplash.com/photo-1585296065578-aade4b9a8152?w=600&q=80' },
  { code: 'PSA', url: 'https://images.unsplash.com/photo-1543429776-2782fc8e1acd?w=600&q=80' },
  { code: 'TRN', url: 'https://images.unsplash.com/photo-1700490707354-e7989041950d?w=600&q=80' },
  { code: 'TRS', url: 'https://images.unsplash.com/photo-1663318967115-800cac54436b?w=600&q=80' },
  { code: 'VRN', url: 'https://images.unsplash.com/photo-1603019007332-06ab70ea6625?w=600&q=80' },
  { code: 'AHO', url: 'https://images.unsplash.com/photo-1788805298893-64f54c5ac06d?w=600&q=80' },
  { code: 'OLB', url: 'https://images.unsplash.com/photo-1788805298893-64f54c5ac06d?w=600&q=80' },
  { code: 'BRI', url: 'https://images.unsplash.com/photo-1779816567021-cd191ad09e3f?w=600&q=80' },
  { code: 'PMO', url: 'https://images.unsplash.com/photo-1533483268851-8975f8352671?w=600&q=80' },
  { code: 'ZAG', url: 'https://images.unsplash.com/photo-1677078305613-7f10511a8322?w=600&q=80' },
  { code: 'TIA', url: 'https://images.unsplash.com/photo-1705251464627-7bd4f6c07c45?w=600&q=80' },
  { code: 'KGS', url: 'https://images.unsplash.com/photo-1707166365769-3da9aa99462a?w=600&q=80' },
  { code: 'SKG', url: 'https://images.unsplash.com/photo-1613538384222-cd71e8488d7a?w=600&q=80' },
  { code: 'RBA', url: 'https://images.unsplash.com/photo-1702840628874-97ed05f0725b?w=600&q=80' }
,
  { code: 'BEIJING', url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80' },
  { code: 'WC_MADRID', url: 'https://images.unsplash.com/photo-1725112675082-5fc786ea4269?w=800&q=80' },
  { code: 'WC_PARIS', url: 'https://images.unsplash.com/photo-1583265266785-aab9e443ee68?w=800&q=80' },
  { code: 'WC_GLASGOW', url: 'https://images.unsplash.com/photo-1531152369337-1d0b0b9ef20d?w=800&q=80' },
  { code: 'WC_NICE', url: 'https://images.unsplash.com/photo-1586168574850-38dfa4d603f0?w=800&q=80' },
  { code: 'WC_MILAN', url: 'https://images.unsplash.com/photo-1520440229-6469a149ac59?w=800&q=80' },
  { code: 'MONTENEGRO', url: 'https://images.unsplash.com/photo-1614122027743-50a9e6e8002f?w=1200&q=80' }
];

const OUTPUT_DIR = 'images';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function downloadImage(url, filepath) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  if (!res.ok) {
    console.log(`  ❌ ${res.status} for ${url}`);
    return false;
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(filepath, buffer);
  return true;
}

async function main() {
  console.log('📸 Downloading destination images from Unsplash...');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let success = 0, skipped = 0, failed = 0;

  for (const img of IMAGES) {
    const filepath = path.join(OUTPUT_DIR, `${img.code}.jpg`);

    // Skip si déjà téléchargée (évite de re-télécharger à chaque run)
    if (fs.existsSync(filepath)) {
      skipped++;
      continue;
    }

    const ok = await downloadImage(img.url, filepath);
    if (ok) {
      console.log(`  ✅ ${img.code}`);
      success++;
    } else {
      failed++;
    }
    await sleep(300); // éviter le rate limiting
  }

  console.log(`\n✅ Done! ${success} downloaded, ${skipped} already existed, ${failed} failed`);
}

main().catch(err => {
  console.error('❌ Fatal:', err);
  process.exit(1);
});
