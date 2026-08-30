import { QRCodeSVG } from 'qrcode.react';

type PaymentQrProps = {
  upiId: string;
  payeeName: string;
  amount: number;
  onConfirm?: () => void;
};

export default function PaymentQr({ upiId, payeeName, amount, onConfirm }: PaymentQrProps) {
  const upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount.toFixed(2)}&cu=INR`;

  return (
    <section className="mt-4 rounded-2xl bg-white p-4 text-center text-gray-800 shadow-md">
      <div className="mx-auto mb-3 flex w-fit rounded-2xl border border-pink-100 bg-pink-50 p-3">
        <QRCodeSVG value={upiString} size={180} bgColor="#ffffff" fgColor="#111827" level="M" includeMargin />
      </div>
      <h4 className="text-sm font-bold">Scan to pay ₹{amount.toFixed(2)}</h4>
      <p className="mt-1 break-all text-[11px] text-gray-500">{upiString}</p>
      {onConfirm && (
        <button
          type="button"
          onClick={onConfirm}
          className="mt-4 w-full rounded-xl bg-green-600 px-3 py-2 text-xs font-bold text-white hover:bg-green-700"
        >
          Confirm payment & unlock
        </button>
      )}
    </section>
  );
}
