const PDFDocument = require("pdfkit");

const generateStoryPDF = async (story, chapters, res) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${story.title}.pdf"`
  );

  doc.pipe(res);

  // Title
  doc.fontSize(22).text(story.title, { align: "center" });
  doc.moveDown();

  // Description
  if (story.description) {
    doc.fontSize(14).text(story.description);
    doc.moveDown();
  }

  // Chapters
  chapters.forEach((chapter) => {
    doc
      .fontSize(16)
      .text(chapter.title, { underline: true });

    doc.moveDown(0.5);

    doc.fontSize(12).text(chapter.content || " ");
    doc.moveDown(1);
  });

  doc.end();
};

module.exports = generateStoryPDF;
