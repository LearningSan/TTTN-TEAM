import { Client } from "@elastic/elasticsearch";

export const esClient = new Client({
  node: process.env.ELASTIC_URL || "http://elasticsearch:9200",
});