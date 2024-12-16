function fetchArxivDataWithFullTextSearch() {

  // Function, which parses the data from the arxiv, based on the provided keywords for the last 24 hours. The results are saved in the current GSheet under the "Sheet1"

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");

  try {
    // Specify here your keywords
    const keywords = [
      "small language model",
      "RAG",
      "vector database"
    ];

    // Calculate yesterday's and today's date in the required format
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 6);  // If you want to search for a longer time period, change here on how many days from today you would like to consider, e.g., the day before yesterday will be today.getDate() - 2

    const formatDate = (date) => {
      return date.toISOString().replace(/[-:T]/g, "").slice(0, 8) + "000000";
    };

    const todayFormatted = formatDate(today);
    const yesterdayFormatted = formatDate(yesterday);

    // Clear the sheet and set up the header. 
    sheet.clear(); //If you do not want to clear the sheet on the regular basis, just delete this line.
    const header = [
      "Keyword",
      "Title",
      "Authors",
      "Published",
      "Summary",
      "PDF Link",
      "Primary Category",
    ];
    sheet.appendRow(header);

    let totalRowCount = 0;

    // Fetch and filter results for each keyword
    for (const keyword of keywords) {
      // Split keyword into individual terms for an AND query
      const terms = keyword.split(" ").map((term) => `all:${encodeURIComponent(term)}`);
      const queryKeyword = terms.join("+AND+");
      const arxivUrl = `http://export.arxiv.org/api/query?search_query=(${queryKeyword})+AND+submittedDate:[${yesterdayFormatted}+TO+${todayFormatted}]&start=0&max_results=10`;

      // Fetch data from the ArXiv API
      const response = UrlFetchApp.fetch(arxivUrl);
      const xml = response.getContentText();
      const document = XmlService.parse(xml);

      // Parse XML data
      const namespace = XmlService.getNamespace("http://www.w3.org/2005/Atom");
      const root = document.getRootElement();
      const entries = root.getChildren("entry", namespace);

      let rowCount = 0;

      for (const entry of entries) {
        if (rowCount >= 3) break; // Limit results to 3 per keyword

        const title = entry.getChildText("title", namespace).trim();
        const summary = entry.getChildText("summary", namespace).trim();

        // Ensure the keyword phrase is present in the title or abstract
        const keywordLower = keyword.toLowerCase();
        if (
          title.toLowerCase().includes(keywordLower) ||
          summary.toLowerCase().includes(keywordLower)
        ) {
          const published = entry.getChildText("published", namespace).trim();

          // Extract authors
          const authors = entry
            .getChildren("author", namespace)
            .map((author) => author.getChildText("name", namespace))
            .join(", ");

          // Extract PDF link
          const pdfLink = entry
            .getChildren("link", namespace)
            .filter((link) => link.getAttribute("title")?.getValue() === "pdf")
            .map((link) => link.getAttribute("href").getValue())[0] || "";

          // Extract primary category
          const arxivNamespace = XmlService.getNamespace("http://arxiv.org/schemas/atom");
          const primaryCategory = entry
            .getChild("primary_category", arxivNamespace)
            .getAttribute("term")
            .getValue();

          // Append data to the sheet
          sheet.appendRow([
            keyword,
            title,
            authors,
            published,
            summary,
            pdfLink,
            primaryCategory,
          ]);
          rowCount++;
          totalRowCount++;
        }
      }

      // Log results for each keyword
      if (rowCount === 0) {
        Logger.log(`No papers found for keyword: "${keyword}".`);
      } else {
        Logger.log(`${rowCount} papers found for keyword: "${keyword}".`);
      }
    }

    // Log the total number of entries written to the sheet
    if (totalRowCount === 0) {
      Logger.log("No papers were found for the specified keywords and date range.");
    } else {
      Logger.log(`${totalRowCount} papers written to the Google Sheet.`);
    }
  } catch (e) {
    Logger.log(`Error: ${e.message}`);
  }
}



function sendEmailWithTable() {
  // function, that sends you the email with the info on the arxiv articles that matched your search
  // Open the Sheet1 in active Gsheet
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
  
  // Get all data from the sheet
  const data = sheet.getDataRange().getValues();



 // Check if the sheet is empty or has only headers
const recipient = "your email"; // Change to your google email
const subject = "Arxiv articles for the last 24 hours";
let body;

if (data.length <= 1) {
  // If the sheet is empty or has only headers, no articles are found
  body = `
    <p>Hello,</p>
    <p>No new arxiv articles were found in the last 24 hours.</p>
    <p>With love,</p>
    <p>Your AI</p>
  `;
} else {
  // Extract headers and rows
  const headers = data[0]; // First row is headers
  const rows = data.slice(1); // Remaining rows are data

  // Start constructing the HTML table
  let tableHtml = '<table border="1" style="border-collapse: collapse; text-align: left;">';

  // Add table headers
  tableHtml += '<tr>';
  headers.forEach(header => {
    tableHtml += `<th style="padding: 8px; background-color: #f2f2f2;">${header}</th>`;
  });
  tableHtml += '</tr>';

  // Add table rows
  rows.forEach(row => {
    tableHtml += '<tr>';
    row.forEach(cell => {
      tableHtml += `<td style="padding: 8px;">${cell}</td>`;
    });
    tableHtml += '</tr>';
  });

  tableHtml += '</table>';

  // Email body with articles
  body = `
    <p>Hello,</p>
    <p>Here are interesting articles from the arxiv:</p>
    ${tableHtml}
    <p>With love,</p>
    <p>Your AI</p>
  `;
}

// Send the email
GmailApp.sendEmail(recipient, subject, '', {htmlBody: body});
}
