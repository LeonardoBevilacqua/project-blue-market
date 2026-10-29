/**
 * @param {HTMLElement | Element | HTMLTableRowElement | null} element
 * @param {string} errorMessage
 */
function get_valid_element(element, errorMessage) {
  if (!element) throw new Error(errorMessage);
  return element;
}

/**
 * @param {HTMLTableCellElement} colElem
 */
function extract_data_from_first_column(colElem) {
  const item = get_valid_element(
    colElem.querySelector("span.txtTit"),
    'could not load "span.txtTit',
  ).innerHTML;
  const barcode = get_valid_element(
    colElem.querySelector("span.RCod"),
    'could not load "span.RCod',
  )
    .innerHTML.trim()
    .match(/\d+/)[0];
  const qtd = get_valid_element(
    colElem.querySelector("span.Rqtd"),
    'could not load "span.Rqtd',
  )
    .textContent.replace("Qtde.:", "")
    .trim();
  const qtdType = get_valid_element(
    colElem.querySelector("span.RUN"),
    'could not load "span.RUN',
  )
    .textContent.replace("UN:", "")
    .trim();
  const unitValue = get_valid_element(
    colElem.querySelector("span.RvlUnit"),
    'could not load "span.RvlUnit',
  )
    .textContent.replace("Vl. Unit.:", "")
    .trim();

  return { item, barcode, qtd, qtdType, unitValue };
}

/**
 * @param {HTMLTableCellElement} colElem
 */
function extract_data_from_second_column(colElem) {
  const value = get_valid_element(
    colElem.querySelector("span.valor"),
    'could not load "span.valor',
  ).innerHTML;

  return { value };
}

/**
 * @param {HTMLTableRowElement} rowElem
 */
function extract_data_from_row(rowElem) {
  const columnsElem = rowElem.getElementsByTagName("td");
  const first_col = extract_data_from_first_column(columnsElem.item(0));
  const second_col = extract_data_from_second_column(columnsElem.item(1));

  return { ...first_col, ...second_col };
}

/** @param {HTMLElement} content */
function get_table_element(content) {
  const tableBodyElem = get_valid_element(
    content.querySelector("table>tbody"),
    "could not load table body",
  );

  return tableBodyElem;
}

/** @param {HTMLElement} content */
function get_location(content) {
  const titleElem = get_valid_element(
    content.querySelector("div.txtCenter>div#u20.txtTopo"),
    'Could not load "title"',
  );
  return titleElem.innerHTML.trim();
}

/** @param {HTMLCollectionOf<HTMLTableRowElement>} rowsElem */
function extract_data_from_rows(rowsElem) {
  const data = [];
  for (let i = 0; i < rowsElem.length; i++) {
    const rowElem = get_valid_element(
      rowsElem.item(i),
      `Could not get row ${i}`,
    );
    data.push(extract_data_from_row(rowElem));
  }

  return data;
}

function get_data() {
  const content = get_valid_element(
    document.getElementById("conteudo"),
    'Could not load "conteudo"',
  );

  const rowsElem = get_table_element(content).getElementsByTagName("tr");
  const data = extract_data_from_rows(rowsElem);
  const title = get_location(content);

  return { title, data };
}

console.log(get_data());
