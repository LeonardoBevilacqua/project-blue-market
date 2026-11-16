import { createServer } from "node:http";
import path from "path";
import fs from "fs";
import { text } from "node:stream/consumers";

/**
 * @typedef {Object} DataSourceDetailsItem
 * @property {number} qtd
 * @property {number} value
 * @property {string} location
 * @property {string} item
 * @property {string} name
 */
/** @typedef {Object} DataSourceDetails
 * @property {string} date
 * @property {DataSourceDetailsItem[]} items
 */

const HOSTNAME = "127.0.0.1";
const PORT = 8080;
const NOTION_VERSION = "2026-03-11";
const NOTION_URL = "https://api.notion.com";
const DATA_SOURCE_ID = "b692daee-6d3d-4bde-85a1-1aeae9ae1036";
const DEFAULT_HEADERS = {
  Authorization: `Bearer ${process.env.PAT}`,
  "Content-Type": "application/json",
  "Notion-Version": NOTION_VERSION,
};
const CLIENT_DIR = path.join(import.meta.dirname, "./public");
const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
};

/** @param {string} secret */
const SECRET_ERROR_MESSAGE_TEMPLATE = (secret) =>
  `Include ${secret} by exporting the variable or assign before starting the server`;

async function fetchDataSources() {
  try {
    const response = await fetch(
      `${NOTION_URL}/v1/data_sources/${DATA_SOURCE_ID}`,
      {
        method: "GET",
        headers: DEFAULT_HEADERS,
      },
    );
    return await response.json();
  } catch (error) {
    console.error(`Could not get the database`, error);
  }
  return null;
}

/** @param {string} date
 * @param {DataSourceDetailsItem} dataSourceDetailsItem */
async function postNewDataSourcePage(
  date,
  { item, qtd, location, value, name },
) {
  const requestBody = {
    parent: { type: "data_source_id", data_source_id: DATA_SOURCE_ID },
    icon: {
      type: "emoji",
      emoji: "🛒",
    },
    properties: {
      Nome: { title: [{ text: { content: name } }] },
      Date: { date: { start: date } },
      Item: { select: { id: item } },
      Para: { select: { id: location } },
      Quantidade: { number: Number(qtd) },
      Valor: { number: Number(value) },
    },
  };

  try {
    console.log(`Posting ${name} - (${date})`);
    const response = await fetch(`${NOTION_URL}/v1/pages`, {
      method: "POST",
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(requestBody),
    });
    return await response.json();
  } catch (error) {
    console.error(`Could not create new data source page`, error);
  }

  return null;
}

/** @param {{id: string; name: string; color: string; description: null | string}[]} options */
function mapOptions(options) {
  return options
    .map(({ id, name }) => ({ id, name }))
    .sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
}

async function getEnumsMetadata() {
  const result = await fetchDataSources();
  if (!result) return {};

  const { properties } = result;
  const { Item: item, Para: location } = properties;
  const itemOptions = mapOptions(item.select.options);
  const locationOptions = mapOptions(location.select.options);

  return { itemOptions, locationOptions };
}

/** @param {IncomingMessage} request */
async function createNewDataSourcePage(request) {
  /** @type {DataSourceDetails} */
  const requestBody = JSON.parse(await text(request));

  for (const item of requestBody.items) {
    const result = await postNewDataSourcePage(requestBody.date, item);
    if (!result)
      return { ok: false, status: `Error with item: ${JSON.stringify(item)}` };

    if (result && result.status == 400) return { ok: false, status: result };
  }

  return { ok: true, status: "success" };
}

const server = createServer((request, res) => {
  const { url, method } = request;
  if (url == "/api/metadata" && method == "GET") {
    getEnumsMetadata().then((result) => {
      res
        .writeHead(200, { "Content-Type": "application/json" })
        .end(JSON.stringify(result));
    });
    return;
  } else if (url == "/api/data_sources" && method == "POST") {
    createNewDataSourcePage(request).then((result) => {
      if (!result) res.writeHead(403, { "Content-Type": "application/json" });
      else res.writeHead(200, { "Content-Type": "application/json" });

      res.end(JSON.stringify(result));
    });
    return;
  }

  const filePath = url === "/" ? "index.html" : url;
  const targetPath = path.join(CLIENT_DIR, filePath);

  // Security check
  if (!targetPath.startsWith(CLIENT_DIR)) {
    res.writeHead(403, { "Content-Type": "text/plain" }).end("403 Forbidden");
    return;
  }

  const extname = path.extname(targetPath).toLowerCase();
  const contentType = MIME_TYPES[extname] || "application/octet-stream";

  fs.stat(targetPath, (err, stats) => {
    if (err || !stats.isFile()) {
      res
        .writeHead(404, { "Content-Type": "text/html" })
        .end("<h1>404 Not Found</h1>");
      return;
    }

    // Stream the file contents to the response
    res.writeHead(200, { "Content-Type": contentType });
    fs.createReadStream(targetPath).pipe(res);
  });
});

if (!process.env.PAT) throw new Error(SECRET_ERROR_MESSAGE_TEMPLATE("PAT"));

server.listen(PORT, HOSTNAME, () => {
  console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
});
