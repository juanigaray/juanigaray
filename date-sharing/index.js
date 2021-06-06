const DATE_ID = "date-input";
const PARSED_DATE_ID = "parsed-url-date";

/**
 *
 * @param {string} url
 * @return {string}
 */
const trimParamsFromURL = (url) => {
  const ix = url.split("").findIndex((e) => e === "?");
  if (ix === -1) return url;
  return url.substring(0, ix);
};

/**
 * @param {number} encodedDate
 * @returns {void}
 */
const goToDateUrl = (encodedDate) => {
  const currUrl = trimParamsFromURL(window.location.href);
  const fullUrl = `${currUrl}?date=${encodedDate}`;
  window.location.href = fullUrl;
};

const goToSelectedDateUrl = () => {
  const dateInputElement = document.getElementById(DATE_ID);
  // @ts-ignore
  const dateValue = dateInputElement.value;
  const date = new Date(dateValue);
  const encodedDate = date.valueOf();
  if (!isNaN(encodedDate)) goToDateUrl(encodedDate);
  if (isNaN(encodedDate)) alert("Select a date first");
};

/**
 * @returns {Date | undefined}
 */
const parseUrlDate = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const urlDate = urlParams.get("date");
  if (urlDate === "") return undefined;
  const urlDateNum = +urlDate;
  if (isNaN(urlDateNum) || urlDateNum === 0) return undefined;
  const date = new Date();
  date.setTime(urlDateNum);
  return date;
};

/**
 * @returns {void}
 */
const setUrlDateParagraph = () => {
  const parsedUrlDate = parseUrlDate();
  if (parsedUrlDate) {
    const pElement = document.getElementById(PARSED_DATE_ID);
    if (pElement) pElement.innerText = parsedUrlDate.toString();
  }
};

setUrlDateParagraph();
