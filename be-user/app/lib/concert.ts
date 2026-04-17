import { connectDB } from "./data";
import { esClient } from "./elasticsearch";

export async function searchConcertByKeyword(
  keyword: string,
  page: number = 1,
  pageSize: number = 10
) {
  try {
    keyword = keyword?.trim();

    const from = (page - 1) * pageSize;

    const result = await esClient.search({
      index: "concerts",
      from,
      size: pageSize,
      query: keyword
        ? {
          multi_match: {
            query: keyword,
            fields: [
              "title^3",
              "artist^2",
              "venue.city",
              "venue.name",
              "zones.zone_name",
              "seat_tiers.tier_name"
            ],
            fuzziness: "AUTO",
            operator: "or"
          }
        }
        : { match_all: {} },

      sort: [
        "_score",
        { concert_date: "asc" }
      ]
    });

    const total =
      typeof result.hits.total === "number"
        ? result.hits.total
        : result.hits.total?.value || 0;

    return {
      items: result.hits.hits.map((hit: any) => hit._source),
      pagination: {
        page,
        pageSize,
        totalItems: total,
        totalPages: Math.ceil(total / pageSize)
      }
    };

  } catch (error: any) {
    console.error("❌ searchConcertByKeyword error:", error);
    throw error;
  }
}
export async function getConcertList(
  filters?: {
    title?: string;
    artist?: string;
    city?: string;
    date?: string;
    status?: string;
  },
  page: number = 1,
  pageSize: number = 10
) {
  const db = await connectDB();
  try {
    const request = db.request();

    let query = `
      SELECT 
        c.concert_id, c.title, c.artist, c.concert_date, c.end_date,
        c.sale_start_at, c.sale_end_at,
        z.zone_id, z.zone_name, z.price, z.total_seats, z.available_seats, z.sold_seats,
        v.venue_id, v.name AS venue_name, v.address, v.district, v.city, v.country,
        CASE 
          WHEN GETDATE() BETWEEN c.sale_start_at AND c.sale_end_at THEN 1 
          ELSE 0 
        END AS is_on_sale
      FROM concerts c
      LEFT JOIN zones z ON c.concert_id = z.concert_id
      LEFT JOIN venues v ON c.venue_id = v.venue_id
      WHERE 1=1
    `;

    // 🔍 filter title
    if (filters?.title) {
      query += " AND c.title LIKE @title";
      request.input("title", `%${filters.title}%`);
    }

    // 🔍 filter artist
    if (filters?.artist) {
      query += " AND c.artist LIKE @artist";
      request.input("artist", `%${filters.artist}%`);
    }

    // 🔍 filter city
    if (filters?.city) {
      query += " AND v.city LIKE @city";
      request.input("city", `%${filters.city}%`);
    }

    // 🔍 filter date (so sánh theo ngày, bỏ giờ)
    if (filters?.date) {
      query += " AND CAST(c.concert_date AS DATE) = @date";
      request.input("date", filters.date);
    }

    // 🔍 filter status
    if (filters?.status) {
      query += " AND c.status = @status";
      request.input("status", filters.status);
    }

    const offset = (page - 1) * pageSize;

    query += `
      ORDER BY c.concert_date ASC
      OFFSET ${offset} ROWS
      FETCH NEXT ${pageSize} ROWS ONLY
    `;

    const result = await request.query(query);

    return result.recordset.map(r => ({
      ...r,
      is_on_sale: r.is_on_sale === 1
    }));

  } catch (error) {
    console.error("getConcertList DB error:", error);
    throw error;
  }
}

export async function getConcertById(concert_id: string) {
  const db = await connectDB();

  try {
    const request = db.request().input("concert_id", concert_id);

    const query = `
      SELECT 
        c.concert_id,
        c.organizer_id,
        c.venue_id,
        c.title,
        c.artist,
        c.concert_date,
        c.end_date,
        c.description,
        c.banner_url,
        c.sale_start_at,
        c.sale_end_at,
        c.status,
        c.created_at,
        c.updated_at,

        v.name AS venue_name,
        v.address,
        v.district,
        v.city,
        v.country,
        v.capacity,

        CASE 
          WHEN GETDATE() BETWEEN c.sale_start_at AND c.sale_end_at THEN 1 
          ELSE 0 
        END AS is_on_sale

      FROM concerts c
      INNER JOIN venues v ON c.venue_id = v.venue_id
      WHERE c.concert_id = @concert_id
    `;

    const result = await request.query(query);

    const r = result.recordset[0];
    if (!r) return null;

    return {
      concert: {
        concert_id: r.concert_id,
        organizer_id: r.organizer_id,
        venue_id: r.venue_id,
        title: r.title,
        artist: r.artist,
        concert_date: r.concert_date,
        end_date: r.end_date,
        description: r.description,
        banner_url: r.banner_url,
        sale_start_at: r.sale_start_at,
        sale_end_at: r.sale_end_at,
        status: r.status,
        created_at: r.created_at,
        updated_at: r.updated_at,
        is_on_sale: r.is_on_sale === 1
      },

      venue: {
        venue_id: r.venue_id,
        name: r.venue_name,
        address: r.address,
        district: r.district,
        city: r.city,
        country: r.country,
        capacity: r.capacity
      }
    };

  } catch (error) {
    console.error("getConcertById DB error:", error);
    throw error;
  }
}