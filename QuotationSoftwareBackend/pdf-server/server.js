const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors()); // allow cross-origin requests

const PORT = 8080;

app.post('/generate-pdf', async (req, res) => {
  try {
    const { htmlContent } = req.body;
    if (!htmlContent) return res.status(400).send('HTML content is required');

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '50px', bottom: '60px', left: '20px', right: '20px' },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `<div style="font-size:10px; text-align:center; width:100%">
        Page <span class="pageNumber"></span> of <span class="totalPages"></span>
      </div>`,
    });

    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=Quotation.pdf',
    });

    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).send('PDF generation failed');
  }
});

app.listen(PORT, () => {
  console.log(`PDF server running on http://localhost:${PORT}`);
});
