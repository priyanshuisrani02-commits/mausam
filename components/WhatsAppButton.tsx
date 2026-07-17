"use client";

export default function WhatsAppButton() {
  const phone = "919913558866";

  return (
    <a
      href={`https://wa.me/${phone}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 rounded-full bg-[#25D366] px-5 py-4 text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-[0_0_30px_rgba(37,211,102,0.5)]"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        className="h-7 w-7 fill-current"
      >
        <path d="M16 .396C7.164.396 0 7.56 0 16.396c0 3.098.884 6.09 2.56 8.676L0 32l7.12-2.52a15.92 15.92 0 008.88 2.72c8.836 0 16-7.164 16-16S24.836.396 16 .396zm0 29.08a13.1 13.1 0 01-6.68-1.84l-.48-.28-4.24 1.48 1.4-4.12-.32-.52a13.08 13.08 0 1110.32 5.28zm7.2-9.84c-.4-.2-2.36-1.16-2.72-1.28-.36-.12-.64-.2-.92.2-.28.4-1.04 1.28-1.28 1.56-.24.28-.48.32-.88.12-.4-.2-1.72-.64-3.28-2.04-1.2-1.08-2-2.4-2.24-2.8-.24-.4-.04-.64.16-.84.2-.2.4-.48.6-.72.2-.24.28-.4.4-.68.12-.28.08-.52-.04-.72-.12-.2-.92-2.2-1.24-3-.32-.76-.68-.68-.92-.68h-.8c-.28 0-.72.08-1.08.48-.36.4-1.4 1.36-1.4 3.32s1.44 3.84 1.64 4.12c.2.28 2.84 4.36 6.88 6.12.96.4 1.72.64 2.32.84.96.32 1.84.28 2.52.16.76-.12 2.36-.96 2.68-1.88.32-.92.32-1.72.24-1.88-.08-.16-.36-.24-.76-.44z" />
      </svg>

      <span className="hidden font-medium md:block">
        Chat with us
      </span>
    </a>
  );
}