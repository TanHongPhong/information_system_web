const PHONE_REGEX = /^[0-9+][0-9\- ]{5,}$/;

export const normalizePhone = (input) => {
  if (input === null || input === undefined) return null;
  if (typeof input === "number") {
    // Giữ nguyên dấu '+' nếu có trong chuỗi, số sẽ mất nên cast sang string sớm
    input = String(input);
  }
  const normalized = String(input).trim();
  return normalized === "" ? null : normalized;
};

export const isValidPhone = (phone) => {
  const normalized = normalizePhone(phone);
  if (!normalized) return false;
  return PHONE_REGEX.test(normalized);
};

export const validateAndNormalizePhone = (phone) => {
  const normalized = normalizePhone(phone);
  if (!normalized) {
    return { valid: false, normalized: null };
  }
  return {
    valid: PHONE_REGEX.test(normalized),
    normalized,
  };
};
