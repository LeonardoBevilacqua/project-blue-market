/** @typedef {Object} CsvData
 * @property {string} item
 * @property {number} qtd
 * @property {number} value
 */
/** @typedef {Object} Metadata
 * @property {string} id
 * @property {name} name
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
          <td>${item}</td>
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
              ${itemOptions.map((option) => `<option value="${option.id}">${option.name}</option>`)}
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

document.addEventListener("DOMContentLoaded", () => {
  fetchMetadata();
  document.getElementById("csv-form").addEventListener("submit", processCsv);
  document
    .getElementById("table-form")
    .addEventListener("change", onTableFormChange);
});
