import axios from 'axios';
import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function syncSymbols() {
    console.log('Starting BIST symbol sync...');

    try {
        // Comprehensive BIST symbols list - 100+ major stocks
        const symbols = [
            // Banks
            { code: 'AKBNK', title: 'AKBANK' },
            { code: 'GARAN', title: 'TURKIYE GARANTI BANKASI' },
            { code: 'ISCTR', title: 'TURKIYE IS BANKASI' },
            { code: 'HALKB', title: 'HALK BANKASI' },
            { code: 'VAKBN', title: 'VAKIFLAR BANKASI' },
            { code: 'YKBNK', title: 'YAPI VE KREDI BANKASI' },
            { code: 'SKBNK', title: 'SEKERBANK' },
            { code: 'TSKB', title: 'T.S.K.B.' },
            { code: 'ALBRK', title: 'ALBARAKA TURK' },
            { code: 'ICBCT', title: 'ICBC TURKEY BANK' },

            // Holdings
            { code: 'KCHOL', title: 'KOC HOLDING' },
            { code: 'SAHOL', title: 'SABANCI HOLDING' },
            { code: 'DOHOL', title: 'DOGAN HOLDING' },
            { code: 'TKFEN', title: 'TEKFEN HOLDING' },
            { code: 'ALARK', title: 'ALARKO HOLDING' },
            { code: 'AGHOL', title: 'AG ANADOLU GRUBU HOLDING' },
            { code: 'YATAS', title: 'YATAS' },

            // Industrial
            { code: 'ASELS', title: 'ASELSAN' },
            { code: 'EREGL', title: 'EREGLI DEMIR VE CELIK' },
            { code: 'KRDMD', title: 'KARDEMIR (D)' },
            { code: 'SISE', title: 'TURKIYE SISE VE CAM FABRIKALARI' },
            { code: 'ARCLK', title: 'ARCELIK' },
            { code: 'VESTL', title: 'VESTEL ELEKTRONIK' },
            { code: 'VESBE', title: 'VESTEL BEYAZ ESYA' },
            { code: 'FROTO', title: 'FORD OTOSAN' },
            { code: 'TOASO', title: 'TOFAS TURK OTOMOBIL FABRIKASI' },
            { code: 'OTKAR', title: 'OTOKAR' },
            { code: 'BRISA', title: 'BRISA' },
            { code: 'GOODY', title: 'GOODYEAR' },
            { code: 'PRKME', title: 'PARK ELEKTRIK' },

            // Energy
            { code: 'TUPRS', title: 'TUPRAS' },
            { code: 'PETKM', title: 'PETKIM' },
            { code: 'AKSEN', title: 'AKSA ENERJI' },
            { code: 'ZOREN', title: 'ZORLU ENERJI' },
            { code: 'ODAS', title: 'ODAS ELEKTRIK' },
            { code: 'AYEN', title: 'AYEN ENERJI' },
            { code: 'GESAN', title: 'GIRISIM ELEKTRIK' },
            { code: 'EUPWR', title: 'EUROPOWER ENERJI' },
            { code: 'GWIND', title: 'GALATA WIND ENERJI' },
            { code: 'SMRTG', title: 'SMART GUNES ENERJISI' },
            { code: 'ASTOR', title: 'ASTOR ENERJI' },
            { code: 'CANTE', title: 'CAN2 TERMIK' },

            // Telecom
            { code: 'TCELL', title: 'TURKCELL' },
            { code: 'TTKOM', title: 'TURK TELEKOM' },
            { code: 'LOGO', title: 'LOGO YAZILIM' },
            { code: 'MIATK', title: 'MIA TEKNOLOJI' },
            { code: 'NETAS', title: 'NETAS TELEKOM' },
            { code: 'INDES', title: 'INDEKS BILGISAYAR' },
            { code: 'LINK', title: 'LINK BILGISAYAR' },

            // Retail & Consumer
            { code: 'BIMAS', title: 'BIM BIRLESIK MAGAZALAR' },
            { code: 'MGROS', title: 'MIGROS' },
            { code: 'SOKM', title: 'SOK MARKETLER' },
            { code: 'CRFSA', title: 'CARREFOURSA' },
            { code: 'MAVI', title: 'MAVI GIYIM' },
            { code: 'ULKER', title: 'ULKER BISKUVI' },
            { code: 'AEFES', title: 'ANADOLU EFES' },
            { code: 'CCOLA', title: 'COCA COLA ICECEK' },
            { code: 'TATGD', title: 'TAT GIDA' },
            { code: 'KNFRT', title: 'KONFRUT GIDA' },
            { code: 'PENGD', title: 'PENGUEN GIDA' },
            { code: 'BANVT', title: 'BANVIT' },

            // Construction & Real Estate
            { code: 'ENKAI', title: 'ENKA INSAAT' },
            { code: 'EKGYO', title: 'EMLAK KONUT GAYRIMENKUL' },
            { code: 'ALGYO', title: 'ALARKO GMYO' },
            { code: 'ISGYO', title: 'IS GMYO' },
            { code: 'TRGYO', title: 'TORUNLAR GMYO' },
            { code: 'VAKGF', title: 'VAKIF GMYO' },
            { code: 'YKGYO', title: 'YAPI KREDI KORAY GMYO' },

            // Cement
            { code: 'CIMSA', title: 'CIMSA CIMENTO' },
            { code: 'OYAKC', title: 'OYAK CIMENTO' },
            { code: 'KONYA', title: 'KONYA CIMENTO' },
            { code: 'AKCNS', title: 'AKCANSA' },
            { code: 'BTCIM', title: 'BATI CIMENTO' },
            { code: 'BOLUC', title: 'BOLU CIMENTO' },
            { code: 'BUCIM', title: 'BURSA CIMENTO' },

            // Chemicals & Fertilizer
            { code: 'GUBRF', title: 'GUBRE FABRIKALARI' },
            { code: 'SASA', title: 'SASA POLYESTER' },
            { code: 'AKSA', title: 'AKSA AKRILIK' },
            { code: 'BRSAN', title: 'BORUSAN MANNESMANN' },
            { code: 'BAGFS', title: 'BAGFAS' },
            { code: 'DEVA', title: 'DEVA HOLDING' },
            { code: 'GENIL', title: 'GEN ILAC' },

            // Mining & Metals
            { code: 'KOZAL', title: 'KOZA ALTIN' },
            { code: 'KOZAA', title: 'KOZA MADENCILIK' },
            { code: 'IPEKE', title: 'IPEK DOGAL ENERJI' },
            { code: 'EGEEN', title: 'EGE ENDUSTRI' },

            // Transportation
            { code: 'THYAO', title: 'TURK HAVA YOLLARI' },
            { code: 'PGSUS', title: 'PEGASUS' },
            { code: 'CLEBI', title: 'CELEBI HAVA SERVISI' },
            { code: 'GSDHO', title: 'GSD DENIZCILIK' },

            // Textile
            { code: 'HEKTS', title: 'HEKTAS' },
            { code: 'YUNSA', title: 'YUNSA' },
            { code: 'BRKO', title: 'BIRKO' },
            { code: 'DAGI', title: 'DAGI GIYIM' },

            // Technology & Electronics
            { code: 'KONTR', title: 'KONTROLMATIK TEKNOLOJI' },
            { code: 'KRONT', title: 'KRON TELEKOMUNIKASYON' },
            { code: 'ESCOM', title: 'ESCORT TEKNOLOJI' },

            // Paper & Forest Products
            { code: 'KLSER', title: 'KALESERAMIK' },
            { code: 'KRSTL', title: 'KRISTAL KOLA' },

            // Investment & Finance
            { code: 'ISMEN', title: 'IS YATIRIM MENKUL DEGERLER' },
            { code: 'ASYAB', title: 'ASYA KATILIM BANKASI' },
            { code: 'GLBMD', title: 'GLOBAL MENKUL DEGERLER' },

            // Tourism & Leisure
            { code: 'MAALT', title: 'MARMARIS ALTINYUNUS' },
            { code: 'AYCES', title: 'ALTINYAG' },
            { code: 'AVTUR', title: 'AVRASYA PETROL' },

            // Other
            { code: 'ASUZU', title: 'ANADOLU ISUZU' },
            { code: 'ADEL', title: 'ADEL KALEMCILIK' },
            { code: 'ADESE', title: 'ADESE' },
            { code: 'AFYON', title: 'AFYON CIMENTO' }
        ];

        console.log(`Found ${symbols.length} symbols.`);

        for (const s of symbols) {
            await prisma.bistSymbol.upsert({
                where: { code: s.code },
                update: { title: s.title, lastSyncedAt: new Date() },
                create: { code: s.code, title: s.title, isActive: true },
            });
        }

        console.log('Sync completed successfully.');

    } catch (error) {
        console.error('Sync failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

syncSymbols();
