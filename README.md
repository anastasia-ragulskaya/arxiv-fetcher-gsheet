# arxiv-fetcher-gsheet

This project is a Google Apps Script designed to interact with ArXiv's API to fetch and filter research articles based on keywords. The script saves the data to a Google Sheet and sends an email summary of the articles in a tabular format.

## Features

* Fetches articles from ArXiv based on specified keywords.
* Filters articles to include only those containing the keywords in the title or summary.
* Outputs article metadata (e.g., title, authors, publication date) into a Google Sheet.
* Sends an email with the results formatted as an HTML table or notifies if no articles are found.
* By default is designed for daily updates (articles from the last 24 hours), but the exact time range can be changed.

## Setup Instructions
1. Create a Google Sheet:
  * Name one of the sheets in your Google Spreadsheet as _Sheet1_.
2. Access Google Apps Script:
  * Open your Google Spreadsheet.
  * Go to _Extensions > Apps Script_.
3. Copy the Code:
  * Paste the script into the Apps Script editor.
4. Modify the Script:
  * Update the keywords array with the keywords you want to search for.
  * Replace _your email_ with your desired recipient email address in the _sendEmailWithTable_ function.
5. Authorize the Script:
  * Run the script for the first time to trigger the authorization flow and grant necessary permissions.
6. Set Up a Trigger (Optional):
  * To automate the regular execution, go to Triggers in the Apps Script editor and set up a time-driven trigger for the _fetchArxivDataWithFullTextSearch_ and _sendEmailWithTable_ functions, e.g. to run once per day.

## Usage
1. **Fetch Articles:**
   Run _fetchArxivDataWithFullTextSearch_ to populate the sheet with articles matching your keywords from the last 24 hours.
2. **Send Email:**
  Run _sendEmailWithTable_ to email the results. The email includes a table of articles if there are matches or a notification if no articles were found.

## Example Keywords

```
const keywords = [
  "small language model",
  "RAG",
  "vector database"
];
```
## Output Format in Google Sheet

The following columns will be populated in Sheet1:

**Keyword:** The keyword used in the search.
**Title:** The title of the article.
**Authors:** The authors of the article.
**Published:** The publication date.
**Summary:** A short summary of the article.
**PDF Link:** A direct link to the article's PDF.
**Primary Category:** The primary category of the article on ArXiv.

## Dependencies
This script requires Google Sheets and Gmail accounts for functionality.

