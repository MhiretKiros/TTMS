'use client';

import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

type QRCodeGeneratorProps = {
  link: string;
};

export const QRCodeGenerator = ({ link }: QRCodeGeneratorProps) => {
  const qrRef = useRef<HTMLCanvasElement>(null);

  // Download QR as PNG
  const handleDownload = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current;
    const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = 'qr-code.png';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // Print QR code only
  const handlePrint = () => {
    if (!qrRef.current) return;
    const dataUrl = qrRef.current.toDataURL();

    const printWindow = window.open('', '_blank', 'width=300,height=400');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head><title>Print QR Code</title></head>
        <body style="text-align:center; margin:0; padding:20px;">
          <img src="${dataUrl}" style="width:250px; height:250px;" />
          <p>${link}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="flex flex-col items-center gap-4 border p-6 rounded-md max-w-xs mx-auto bg-white">
      <QRCodeCanvas value={link} size={250} ref={qrRef} />

      <div className="flex gap-4">
        <button
          onClick={handleDownload}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Download PNG
        </button>
        <button
          onClick={handlePrint}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Print QR
        </button>
      </div>
    </div>
  );
};
