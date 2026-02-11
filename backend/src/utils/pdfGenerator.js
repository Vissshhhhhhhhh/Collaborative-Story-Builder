const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function stripHtmlTags(html) {
  if (!html) return "";
  return html
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/<\/p>/gi, "\n\n") // Double newline for paragraphs
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/\n{3,}/g, "\n\n") // Replace 3+ newlines with just 2
    .replace(/[ \t]+/g, " ") // Replace multiple spaces/tabs with single space
    .trim(); // MUST trim to prevent trailing blank pages
}

module.exports = async function generateStoryPDF(story, chapters, res) {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 50, bottom: 70, left: 50, right: 50 }, // Increased bottom margin for footer
    bufferPages: true, // Required for page numbering
    autoFirstPage: true 
  });

  doc.on('error', (err) => {
    console.error("PDF Generation Error:", err);
    if (!res.headersSent) res.status(500).send("Generation failed");
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${story.title.replace(/\s+/g, '_')}.pdf"`
  );

  doc.pipe(res);

  // --- 1. LOGO (Made Bigger - now 300px) ---
  const logoPath = path.join(__dirname, "../assests/image.png");
  if (fs.existsSync(logoPath)) {
    // Increased width to 300 for larger logo
    doc.image(logoPath, 50, 40, { width: 300 });
  }

  // --- 2. TITLE GAP (Increased significantly) ---
  // Set Y cursor to 300 to create bigger gap between logo and title
  doc.y = 300;

  doc.font("Helvetica-Bold")
    .fontSize(26)
    .fillColor("#0F172A")
    .text(story.title);

  if (story.description) {
    doc.moveDown(0.7);
    doc.font("Helvetica")
      .fontSize(12)
      .fillColor("#334155")
      .text(story.description, { align: "justify" });
  }

  doc.moveDown(1.5); // More space before first chapter

  // --- 3. CHAPTERS (Fixed Page Logic) ---
  chapters.forEach((chapter, index) => {
    const plainTextContent = stripHtmlTags(chapter.content || "");
    
    // Skip completely empty chapters to prevent blank pages
    if (!plainTextContent || plainTextContent.length === 0) return;

    // ORPHAN PROTECTION:
    // Only add a page if the Title + 3 lines of text won't fit.
    // We do NOT add a page if we are already at the top (doc.y < 100).
    const spaceNeeded = 120; 
    const spaceLeft = doc.page.height - doc.page.margins.bottom - doc.y;

    if (spaceLeft < spaceNeeded && doc.y > 100) {
      doc.addPage();
    }

    // Render Title
    doc.font("Helvetica-Bold")
      .fontSize(18)
      .fillColor("#059669")
      .text(`Chapter ${index + 1}: ${chapter.title}`);

    doc.moveDown(0.5);

    // Render Text
    // We let PDFKit handle the wrapping and page breaks for the text automatically.
    doc.font("Helvetica")
      .fontSize(11)
      .fillColor("#334155")
      .text(plainTextContent, {
        align: "justify",
        lineGap: 2,
        paragraphGap: 10
      });
      
    // Only add spacing if this isn't the last chapter to prevent extra blank pages
    if (index < chapters.length - 1) {
      doc.moveDown(1.5); // Reduced gap between chapters
    }
  });

  // CRITICAL: Finalize all content before adding page numbers
  // This ensures we know the exact page count without extra blank pages
  
  // --- 4. PAGE NUMBERS (Applied to all existing content pages) ---
  const range = doc.bufferedPageRange(); // Gets range of all buffered pages
  
  // Calculate footer position (within the bottom margin area)
  const footerY = doc.page.height - 50;

  // Iterate through all pages and add page numbers
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(i);
    
    doc.fontSize(8)
      .fillColor("#64748B")
      .text(
        `Page ${i + 1} of ${range.count} — StoryBuilder`,
        50,
        footerY,
        { align: "center", width: doc.page.width - 100 }
      );
  }

  // End document - no content should be added after page numbers
  doc.end();
};