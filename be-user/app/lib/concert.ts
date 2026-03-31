import { connectDB } from "./data";

export async function getConcertList(
  filters?: { artist?: string; status?: string },
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

    if (filters?.artist) {
      query += " AND c.artist LIKE @artist";
      request.input("artist", `%${filters.artist}%`);
    }
    if (filters?.status) {
      query += " AND c.status = @status";
      request.input("status", filters.status);
    }

    const offset = (page - 1) * pageSize;
    query += ` ORDER BY c.concert_date ASC OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;

    const result = await request.query(query);

    return result.recordset.map(r => ({ ...r, is_on_sale: r.is_on_sale === 1 }));
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
        c.concert_id, c.title, c.artist, c.concert_date, c.end_date,
        c.sale_start_at, c.sale_end_at,
        z.zone_id, z.zone_name, z.price, z.total_seats, z.available_seats, z.sold_seats,
        v.venue_id, v.name AS venue_name, v.address, v.district, v.city, v.country,
        CASE 
          WHEN GETDATE() BETWEEN c.sale_start_at AND c.sale_end_at THEN 1 
          ELSE 0 
        END AS is_on_sale
      FROM concerts c
      INNER JOIN zones z ON c.concert_id = z.concert_id
      INNER JOIN venues v ON c.venue_id = v.venue_id
      WHERE c.concert_id = @concert_id
      ORDER BY z.display_order ASC
    `;

    const result = await request.query(query);
    return result.recordset.map(r => ({ ...r, is_on_sale: r.is_on_sale === 1 }));
  } catch (error) {
    console.error("getConcertById DB error:", error);
    throw error;
  }
}