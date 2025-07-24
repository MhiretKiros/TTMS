import { QRCodeGenerator } from './components/QRCodeGenerator';

export default function QRPage() {
  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-6">QR Code with Download & Print</h1>
      <QRCodeGenerator link="https://verdant-kataifi-3c5c1b.netlify.app/" />
    </div>
  );
}
