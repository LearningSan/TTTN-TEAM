import { Client } from "@elastic/elasticsearch";

export const esClient = new Client({
  node: "http://localhost:9200"
});

/* =========================
   ENUM CONSTRAINTS
========================= */

const CONCERT_STATUS = [
  "COMPLETED",
  "CANCELLED",
  "SOLD_OUT",
  "ON_SALE",
  "DRAFT"
];

const ZONE_CURRENCY = ["USDT", "BNB", "ETH"];

const ZONE_STATUS = ["DISABLED", "SOLD_OUT", "ACTIVE"];


/* =========================
   BASE DATA
========================= */

const artists = [
  "Sơn Tùng M-TP",
  "Đen Vâu",
  "Binz",
  "Hà Anh Tuấn",
  "Noo Phước Thịnh",
  "Erik",
  "AMEE",
  "MIN",
  "Trúc Nhân",
  "Hoàng Thùy Linh",
  "Karik",
  "JustaTee",
  "Wren Evans",
  "HIEUTHUHAI",

  // "Phan Mạnh Quỳnh",
  // "Vũ.",
  // "Grey D",
  // "Obito",
  // "Low G",
  // "Tlinh",
  // "MCK",
  // "Wxrdie",
  // "GDucky",
  // "Lou Hoàng",
  // "Quân A.P",
  // "JayKii",
  // "Bích Phương",
  // "Orange",
  // "Thịnh Suy",
  // "Dương Domic",
  // "RPT MCK"
];

const cities = [
  "Hà Nội",
  "TP.HCM",
  "Đà Nẵng",
  "Cần Thơ",
  "Hải Phòng",

  // "Huế",
  // "Nha Trang",
  // "Đà Lạt",
  // "Vũng Tàu",
  // "Bình Dương",
  // "Đồng Nai",
  // "Quảng Ninh",
  // "Thanh Hóa",
  // "Nghệ An",
  // "Hạ Long",
  // "Buôn Ma Thuột"
];
const venues = [
  "Sân vận động Mỹ Đình",
  "Quân khu 7",
  "Nhà hát Hòa Bình",
  "Sân vận động Thống Nhất",
  "Cung thể thao Tiên Sơn",

  // "Nhà hát Lớn Hà Nội",
  // "Cung Văn hóa Hữu nghị Việt Xô",
  // "Trung tâm Hội nghị Quốc gia",
  // "Sân vận động Hàng Đẫy",
  // "Sân vận động Lạch Tray",
  // "Sân vận động Thiên Trường",
  // "Sân vận động Vinh",
  // "Sân vận động Cần Thơ",
  // "Nhà hát Trưng Vương (Đà Nẵng)",
  // "Cung Hội nghị Quốc tế Ariyana Đà Nẵng",
  // "Trung tâm Hội nghị GEM Center",
  // "SECC - Trung tâm Hội chợ & Triển lãm Sài Gòn",
  // "White Palace",
  // "Adora Center",
  // "Nhà hát VOH",
  // "Sân vận động Gò Đậu",
  // "Sân vận động Long An",
  // "Nhà văn hóa Thanh Niên TP.HCM",
  // "Nhà hát Bến Thành"
];

const zoneNames = [
  "FRONT STAGE",
  "CENTER STAGE",
  "LEFT STAGE",
  "RIGHT STAGE",
  "NEAR STAGE",
  "MID ZONE",
  "BACK ZONE",
  "SIDE VIEW",
  "STANDING AREA",
  "SEATED AREA"
];
/* =========================
   HELPERS
========================= */

function random<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate() {
  const m = Math.floor(Math.random() * 12) + 1;
  const d = Math.floor(Math.random() * 28) + 1;
  return `2026-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function price(base: number) {
  return base + Math.floor(Math.random() * 500000);
}

/* =========================
   MAIN SEED
========================= */


async function seed() {
  const operations: any[] = [];

  for (let i = 1; i <= 1000; i++) {
    const concertId = String(i);

    const city = random(cities);
    const venue = random(venues);

    operations.push(
      {
        index: {
          _index: "concerts",
          _id: concertId
        }
      },
      {
        /* ================= FLAT FIELDS (SEARCH IMPORTANT) ================= */
        concert_id: concertId,
        organizer_id: `ORG-${Math.ceil(i / 10)}`,
        title: `${random(artists)} Live Show ${i}`,
        artist: random(artists),
        city: city,                      // ⭐ IMPORTANT FOR SEARCH
        venue_name: venue,
        concert_date: randomDate(),
        end_date: randomDate(),
        status: random(CONCERT_STATUS),

        sale_start_at: "2026-01-01",
        sale_end_at: "2026-12-31",

        /* ================= NESTED VENUE ================= */
        venue: {
          venue_id: `V${i}`,
          name: venue,
          address: "Vietnam",
          city: city,
          district: null,
          country: "VN",
          capacity: 10000
        },

        /* ================= ZONES ================= */
        zones: zoneNames.map((z) => ({
          zone_id: `Z${i}-${z}`,
          zone_name: z,
          price: price(200000),
          currency: random(ZONE_CURRENCY),
          status: random(ZONE_STATUS),
          total_seats: 1000,
          available_seats: Math.floor(Math.random() * 800),
          sold_seats: Math.floor(Math.random() * 200)
        }))
      }
    );
  }


  const res = await esClient.bulk({ operations });

  console.log("====================================");
  console.log("✅ SEED DONE: 1000 FULL COMPLEX RECORDS");
  console.log("❌ ERRORS:", res.errors);
  console.log("====================================");
}

seed().catch(console.error);