// Đảm bảo ĐÚNG tên hàm & named export
export function buildSepayQrUrl({ acc, bank, amount, des, template }) {
  const url = new URL("https://qr.sepay.vn/img");
  url.searchParams.set("acc", acc);
  url.searchParams.set("bank", bank);
  if (amount) url.searchParams.set("amount", String(amount));
  if (des) url.searchParams.set("des", des);
  if (template) url.searchParams.set("template", template);
  return url.toString();
}
