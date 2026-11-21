import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import type { PDFFont, PDFPage } from "pdf-lib";
import type {
  EnrolmentWithClassAndTerm,
  PaymentWithDetails,
  Term,
} from "@/lib/api/types";

type StudentInvoiceData = {
  payment: PaymentWithDetails;
  term: Term;
  enrolments: EnrolmentWithClassAndTerm[];
};

const invoiceCurrency = new Intl.NumberFormat("en-AU", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("en-AU", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Australia/Sydney",
});

const shortDateFormatter = new Intl.DateTimeFormat("en-AU", {
  day: "numeric",
  month: "short",
  timeZone: "Australia/Sydney",
});

const formatTime = (time: string) => {
  const [hourText, minuteText = "00"] = time.split(":");
  const hour = Number(hourText);
  if (!Number.isFinite(hour)) return time;
  const displayHour = hour % 12 || 12;
  const period = hour >= 12 ? "pm" : "am";
  return `${displayHour}${minuteText === "00" ? "" : `:${minuteText}`}${period}`;
};

const shortDay = (day: string) => day.slice(0, 3);

const campusName = (location: string) => {
  switch (location) {
    case "cabramatta_and_canley_vale":
      return "Canley Heights";
    case "parramatta":
      return "Parramatta";
    case "online":
      return "Online";
    default:
      return location;
  }
};

const coverText = (
  page: PDFPage,
  region: { x: number; top: number; width: number; height: number },
) => {
  const pageHeight = page.getHeight();
  page.drawRectangle({
    x: region.x,
    y: pageHeight - region.top - region.height,
    width: region.width,
    height: region.height,
    color: rgb(1, 1, 1),
  });
};

const drawText = (
  page: PDFPage,
  text: string,
  x: number,
  baselineFromTop: number,
  font: PDFFont,
  size: number,
  maxWidth?: number,
) => {
  let fontSize = size;
  if (maxWidth) {
    while (font.widthOfTextAtSize(text, fontSize) > maxWidth && fontSize > 8) {
      fontSize -= 0.25;
    }
  }
  page.drawText(text, {
    x,
    y: page.getHeight() - baselineFromTop,
    font,
    size: fontSize,
    color: rgb(0, 0, 0),
  });
};

export const createStudentInvoicePdf = async ({
  payment,
  term,
  enrolments,
}: StudentInvoiceData) => {
  const response = await fetch("/student-invoice-template.pdf");
  if (!response.ok) throw new Error("Could not load the invoice template.");

  const pdf = await PDFDocument.load(await response.arrayBuffer());
  pdf.registerFontkit(fontkit);
  const page = pdf.getPages()[0];
  if (!page) throw new Error("The invoice template has no pages.");

  const [regularFontResponse, boldFontResponse] = await Promise.all([
    fetch("/fonts/segoe-ui-regular.woff"),
    fetch("/fonts/segoe-ui-semibold.woff"),
  ]);
  if (!regularFontResponse.ok || !boldFontResponse.ok) {
    throw new Error("Could not load the invoice fonts.");
  }
  const [regularFontBytes, boldFontBytes] = await Promise.all([
    regularFontResponse.arrayBuffer(),
    boldFontResponse.arrayBuffer(),
  ]);
  const regularFont = await pdf.embedFont(regularFontBytes, { subset: true });
  const boldFont = await pdf.embedFont(boldFontBytes, { subset: true });
  const studentName = payment.student_name.trim() || payment.student_name;
  const termDates = `${shortDateFormatter.format(new Date(term.start_date))} - ${shortDateFormatter.format(new Date(term.end_date))}`;
  const invoiceDate = dateFormatter.format(new Date());
  // Each invoice is generated from one payment row, so show that payment's
  // amount rather than the enrolment's full amount due.
  const invoiceAmount = Number(payment.amount_paid);

  const classes = enrolments;
  const classLines = classes.length
    ? classes.map((enrolment) => {
        const offering = enrolment.ClassTime.SubjectOffering;
        return `Year ${offering.grade} ${offering.subject_name} - ${campusName(offering.location)} - ${shortDay(enrolment.ClassTime.day_of_week)} ${formatTime(enrolment.ClassTime.start_time)}-${formatTime(enrolment.ClassTime.end_time)}`;
      })
    : [
        `Year ${payment.grade} ${payment.subject_name} - ${campusName(payment.location)}`,
      ];
  // Replace the template's bracketed fields and optional fee rows while
  // leaving its logo, rules, payment details, and typography in place.
  coverText(page, { x: 40, top: 140, width: 225, height: 24 });
  drawText(page, `Hi ${studentName},`, 41.5, 154.6, boldFont, 12, 220);

  coverText(page, { x: 40, top: 161, width: 500, height: 25 });
  drawText(
    page,
    `Here is your invoice for ${term.year} Term ${term.name}:  ${termDates}  (10 weeks)`,
    41.5,
    176.1,
    regularFont,
    12,
    495,
  );

  coverText(page, { x: 40, top: 184, width: 180, height: 32 });
  drawText(page, invoiceDate, 41.5, 198.4, boldFont, 12, 118);

  coverText(page, { x: 40, top: 256, width: 260, height: 120 });
  const classLineStep = Math.min(
    16,
    classLines.length > 1 ? 80 / (classLines.length - 1) : 16,
  );
  const classLineFontSize = Math.max(
    7,
    Math.min(10.5, classLineStep * 0.72),
  );
  classLines.forEach((line, index) => {
    drawText(
      page,
      line,
      41.5,
      271.6 + classLineStep * index,
      regularFont,
      classLineFontSize,
      242,
    );
  });
  coverText(page, { x: 316, top: 258, width: 180, height: 86 });
  drawText(
    page,
    `$ ${invoiceCurrency.format(invoiceAmount)}`,
    317.6,
    274.3,
    regularFont,
    12,
    104,
  );
  drawText(page, "(10 weeks)", 317.6, 302, regularFont, 12, 130);

  coverText(page, { x: 316, top: 344, width: 180, height: 38 });
  coverText(page, { x: 40, top: 388, width: 460, height: 34 });
  drawText(page, "Total Due", 41.5, 405, boldFont, 12, 105);
  drawText(
    page,
    `$ ${invoiceCurrency.format(invoiceAmount)}`,
    317.6,
    405,
    boldFont,
    12,
    115,
  );

  coverText(page, { x: 40, top: 438, width: 460, height: 40 });
  coverText(page, { x: 40, top: 515, width: 460, height: 38 });
  const totalLabel = "Total (incl. discount)";
  drawText(page, totalLabel, 41.5, 531.4, boldFont, 12, 180);
  drawText(
    page,
    "(pay by date)",
    41.5 + boldFont.widthOfTextAtSize(totalLabel, 12) + 4,
    531.4,
    regularFont,
    12,
    150,
  );
  drawText(
    page,
    `$ ${invoiceCurrency.format(invoiceAmount)}`,
    317.6,
    531.4,
    boldFont,
    12,
    175,
  );

  const endDate = dateFormatter.format(new Date(term.end_date));
  coverText(page, { x: 40, top: 728, width: 510, height: 52 });
  drawText(
    page,
    `Payment must be received by the END OF TERM ${endDate} to secure a`,
    41.5,
    745,
    regularFont,
    11,
    500,
  );
  drawText(page, "place for the following term.", 41.5, 764, regularFont, 11, 500);

  pdf.setTitle(invoiceFileName({ payment, term, enrolments }));
  return pdf.save();
};

const invoiceFileName = ({ payment, term }: StudentInvoiceData) => {
  const safeName = payment.student_name
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "");
  return `Invoice-${safeName}-T${term.name}-${term.year}.pdf`;
};

export const openStudentInvoice = async (data: StudentInvoiceData) => {
  // Open the tab before awaiting PDF generation so the browser recognizes it
  // as part of the user's click and does not block it as a popup.
  const invoiceTab = window.open("about:blank", "_blank");
  if (!invoiceTab) {
    throw new Error("Allow pop-ups to open the invoice in a new tab.");
  }

  try {
    const bytes = await createStudentInvoicePdf(data);
    const blob = new Blob([Uint8Array.from(bytes).buffer], {
      type: "application/pdf",
    });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = invoiceFileName(data);
    downloadLink.click();
    invoiceTab.location.href = url;
  } catch (error) {
    invoiceTab.close();
    throw error;
  }
};
