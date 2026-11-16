/** @typedef {Object} CsvData
 * @property {string} item
 * @property {number} qtd
 * @property {number} value
 */
/** @typedef {Object} Metadata
 * @property {string} id
 * @property {name} name
 */
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
const SERVER_URL = "http://localhost:8080";
/** @type {CsvData[]} */
let csvDataList = [];
/** @type {Metadata[]} */
let itemOptions = [];
/** @type {Metadata[]} */
let locationOptions = [];

function fetchMetadata() {
  fetch(`${SERVER_URL}/api/metadata`)
    .then((response) => response.json())
    .then((body) => {
      itemOptions = body.itemOptions;
      locationOptions = body.locationOptions;
      document.getElementById("csvFormButton").removeAttribute("disabled");
    })
    .catch((error) => console.error("Could not fetch the metadata", error));
}

/** @param {string} value */
function strToNumber(value) {
  return Number(value.replaceAll(",", "."));
}

/** @param {string} row */
function mapData(row) {
  let [item, qtdStr, valueStr] = row.split(";");
  const qtd = strToNumber(qtdStr);
  const value = strToNumber(valueStr);

  return { item, qtd, value };
}

function updateTableFooter() {
  const tableFooterTotal = document.getElementById("tableFooterTotal");
  tableFooterTotal.innerHTML = csvDataList.reduce(
    (acc, { value }) => (acc += value),
    0,
  );
}

function updateTableBody() {
  const tableBodyElem = document.getElementById("tableBody");

  tableBodyElem.innerHTML = csvDataList
    .map(
      ({ item, qtd, value }, index) => `
        <tr>
          <td>
            <input
              required
              id="${index}-name"
              name="${index}-name"
              type="text"
              value="${item.trim()}"
            />
          </td>
          <td>
            <input
              required
              id="${index}-qtd"
              name="${index}-qtd"
              type="text"
              value="${qtd}"
            />
          </td>
          <td>
            <input
              required
              id="${index}-value"
              name="${index}-value"
              type="text"
              value="${value}"
            />
          </td>
          <td>
            <select required id="${index}-location" name="${index}-location">
              ${locationOptions.map(
                (option) =>
                  `<option value="${option.id}">${option.name}</option>`,
              )}
            </select>
          </td>
          <td>
            <select required id="${index}-item" name="${index}-item">
              ${itemOptions.map(
                (option) =>
                  `<option value="${option.id}">${option.name}</option>`,
              )}
            </select>
          </td>
        </tr>
      `,
    )
    .join("");
}

/** @param {string} csvContent */
function fromCsv(csvContent) {
  const rows = csvContent.trim().split("\n");
  csvDataList = rows.map((row) => mapData(row));

  updateTableBody();
  document.getElementById("tableFormSubmitButton").removeAttribute("disabled");
  updateTableFooter();
}

/** @param {SubmitEvent} event */
function processCsv(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const csvContent = formData.get("itemsCsv");

  fromCsv(csvContent);
}

/** @param {Event} event */
function onTableFormChange(event) {
  const value = event.target.value;
  const [indexStr, field] = event.target.id.split("-");
  const index = Number(indexStr);
  switch (field) {
    case "qtd":
      csvDataList[index].qtd = Number(value);
      break;
    case "value":
      csvDataList[index].value = Number(value);
      break;
  }
  updateTableFooter();
}

/** @param {FormData} formData */
function mapDataSourceDetails(formData) {
  /** @type {DataSourceDetails} */
  const dataSourceDetails = {
    date: "",
    items: [],
  };
  for (const [key, value] of formData.entries()) {
    if (key === "date") {
      dataSourceDetails.date = value;
      continue;
    }
    const [indexStr, field] = key.split("-");
    const index = Number(indexStr);

    if (!dataSourceDetails.items[index]) {
      dataSourceDetails.items.push({ [field]: value });
      continue;
    }
    dataSourceDetails.items[index][field] = value;
  }

  return dataSourceDetails;
}

/** @param {SubmitEvent} event */
function onTableFormSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const dataSourceDetails = mapDataSourceDetails(formData);

  fetch(`${SERVER_URL}/api/data_sources`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dataSourceDetails),
  })
    .then((response) => response.json())
    .then((body) => console.log(body))
    .catch((error) => console.error("Could not save:", error));
}

document.addEventListener("DOMContentLoaded", () => {
  fetchMetadata();
  document.getElementById("csv-form").addEventListener("submit", processCsv);
  const tableForm = document.getElementById("table-form");
  tableForm.addEventListener("change", onTableFormChange);
  tableForm.addEventListener("submit", onTableFormSubmit);
});
