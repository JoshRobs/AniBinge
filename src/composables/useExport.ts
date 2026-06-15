import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

async function capture(elementId: string): Promise<HTMLCanvasElement> {
  const el = document.getElementById(elementId);
  if (!el) throw new Error(`Element #${elementId} not found`);
  const bg =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--bg-deep")
      .trim() || "#0d1015";

  // Forcing img display: inline-block fixes html2canvas baseline miscalculation
  // that causes all text to render too low on Windows.
  const style = document.createElement("style");
  style.textContent = "img { display: inline-block !important; }";
  document.head.appendChild(style);

  const PADDING = 48; // px at scale:1 (doubled at scale:2)

  try {
    const raw = await html2canvas(el, {
      useCORS: true,
      backgroundColor: bg,
      scale: 2,
      logging: false,
      onclone: (_doc, cloned) => {
        cloned.querySelectorAll<HTMLElement>(".row-title, .row-subtitle").forEach((t) => {
          t.style.overflow = "visible";
          t.style.paddingBottom = "3px";
        });
        cloned.querySelectorAll<HTMLElement>(".genre-tag").forEach((t) => {
          t.style.display = "inline-block";
          t.style.lineHeight = "1.5";
          t.style.verticalAlign = "middle";
        });
      },
    });

    const pad = PADDING * 2; // scale:2
    const padded = document.createElement("canvas");
    padded.width = raw.width + pad * 2;
    padded.height = raw.height + pad * 2;
    const ctx = padded.getContext("2d")!;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, padded.width, padded.height);
    ctx.drawImage(raw, pad, pad);
    return padded;
  } finally {
    document.head.removeChild(style);
  }
}

export async function exportToPng(
  elementId: string,
  filename = "anibinge-list.png",
): Promise<void> {
  const canvas = await capture(elementId);
  await new Promise<void>((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }
      resolve();
    }, "image/png");
  });
}

export async function copyToClipboard(elementId: string): Promise<void> {
  const canvas = await capture(elementId);
  await new Promise<void>((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) { reject(new Error("Failed to create image blob")); return; }
      try {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        resolve();
      } catch (e) {
        reject(e);
      }
    }, "image/png");
  });
}

export async function exportToPdf(
  elementId: string,
  filename = "anibinge-list.pdf",
): Promise<void> {
  const canvas = await capture(elementId);
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgW = pageW;
  const imgH = (canvas.height / canvas.width) * imgW;

  let remaining = imgH;
  let y = 0;

  pdf.addImage(imgData, "PNG", 0, y, imgW, imgH);
  remaining -= pageH;

  while (remaining > 0) {
    y -= pageH;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, y, imgW, imgH);
    remaining -= pageH;
  }

  pdf.save(filename);
}
