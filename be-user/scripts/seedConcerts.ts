import { connectDB } from "@/app/lib/data";
import { esClient } from "@/app/lib/elasticsearch";

/* ================= RESET INDEX ================= */
async function resetIndex() {
  const index = "concerts";

  const exists = await esClient.indices.exists({ index });

  if (exists) {
    await esClient.indices.delete({ index });
  }

  await esClient.indices.create({
    index,
    mappings: {
      properties: {
        concert_id: { type: "keyword" },

        title: { type: "text" },
        artist: { type: "text" },
        description: { type: "text" },

        city: { type: "text" },
        venue_name: { type: "text" },
        address: { type: "text" },
        district: { type: "text" },

        organizer_name: { type: "text" },

        // ✅ FIX 1: giữ keyword nhưng OK vì search exact/filter
        zone_names: { type: "keyword" },

        min_price: { type: "float" },
        max_price: { type: "float" },

        concert_date: { type: "date" },
        status: { type: "keyword" },

        banner_url: { type: "keyword" },

        // ✅ FIX 2: IMPORTANT
        layout_config:{ type: "keyword" }

      }
    }
  });
}
/* ================= LOAD DATA FROM DB ================= */

async function loadFromDB() {
  const db = await connectDB();

 const query = `
  SELECT 
    c.concert_id, 
    c.title, 
    c.artist, 
    c.description,
    c.status,
    c.banner_url,
    c.concert_date,
    c.layout_config,

    v.venue_id,
    v.name AS venue_name,
    v.address,
    v.district,
    v.city,

    u.name AS organizer_name,

    z.zone_id,
    z.zone_name,
    z.price
  FROM concerts c
  LEFT JOIN zones z ON c.concert_id = z.concert_id
  LEFT JOIN venues v ON c.venue_id = v.venue_id
  LEFT JOIN users u ON c.organizer_id = u.user_id
`;

  const result = await db.request().query(query);

  return result.recordset;
}

/* ================= TRANSFORM ================= */

function transform(rows: any[]) {
  const map = new Map();

  for (const r of rows) {
    if (!map.has(r.concert_id)) {
      map.set(r.concert_id, {
        concert_id: r.concert_id,
        title: r.title,
        artist: r.artist,
        description: r.description ?? "",

        city: r.city,
        venue_name: r.venue_name,
        address: r.address,
        district: r.district,

        organizer_name: r.organizer_name ?? "",

        concert_date: r.concert_date,
        status: r.status ?? "DRAFT",
        banner_url: r.banner_url ?? "",
        layout_config: r.layout_config ?? "",

        zone_names: new Set(),
        prices: []
      });
    }

    const item = map.get(r.concert_id);

    if (r.zone_name) item.zone_names.add(r.zone_name);
    if (typeof r.price === "number") item.prices.push(r.price);
  }

  return Array.from(map.values()).map(item => {
    const prices = item.prices;

    return {
      ...item,
      zone_names: Array.from(item.zone_names),

      min_price: prices.length ? Math.min(...prices) : 0,
      max_price: prices.length ? Math.max(...prices) : 0
    };
  });
}
/* ================= SEED ================= */

async function seed() {
  await resetIndex();

  const rows = await loadFromDB();
  const concerts = transform(rows);

  const operations: any[] = [];

  for (const c of concerts) {
    operations.push(
      {
        index: {
          _index: "concerts",
          _id: c.concert_id
        }
      },
      c
    );
  }

  const res = await esClient.bulk({ operations });

  console.log("✅ DONE:", concerts.length);
if (res.errors) {
  console.log("❌ BULK FAILED DETAILS:");

  res.items.forEach((item: any, idx: number) => {
    const result = item.index;

    if (result && result.error) {
      console.log(`\n--- ERROR ITEM ${idx} ---`);
      console.log("ID:", result._id);
      console.log("STATUS:", result.status);
      console.log("ERROR:", JSON.stringify(result.error, null, 2));
    }
  });
}}

seed().catch(console.error);