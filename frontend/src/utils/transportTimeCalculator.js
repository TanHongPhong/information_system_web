// Utility để tính toán thời gian vận chuyển dựa trên tuyến đường
// Dữ liệu khoảng cách và thời gian vận chuyển giữa các tỉnh thành Việt Nam

// Mapping các tỉnh thành chính và khoảng cách từ HCM (km)
const DISTANCE_FROM_HCM = {
  "HCM": 0,
  "Hồ Chí Minh": 0,
  "TP. Hồ Chí Minh": 0,
  "Sài Gòn": 0,
  "Bình Dương": 30,
  "Đồng Nai": 40,
  "Tây Ninh": 100,
  "Bình Phước": 120,
  "Long An": 50,
  "Tiền Giang": 70,
  "Bến Tre": 85,
  "Trà Vinh": 120,
  "Vĩnh Long": 135,
  "Đồng Tháp": 160,
  "An Giang": 200,
  "Kiên Giang": 250,
  "Cần Thơ": 170,
  "Hậu Giang": 180,
  "Sóc Trăng": 230,
  "Bạc Liêu": 280,
  "Cà Mau": 350,
  "Bà Rịa - Vũng Tàu": 100,
  "Vũng Tàu": 100,
  "Bà Rịa": 100,
  "Ninh Thuận": 350,
  "Bình Thuận": 200,
  "Phan Thiết": 200,
  "Khánh Hòa": 450,
  "Nha Trang": 450,
  "Phú Yên": 550,
  "Bình Định": 650,
  "Quy Nhon": 650,
  "Quảng Ngãi": 850,
  "Đà Nẵng": 950,
  "Quảng Nam": 900,
  "Hội An": 900,
  "Thừa Thiên Huế": 1100,
  "Huế": 1100,
  "Quảng Trị": 1200,
  "Quảng Bình": 1300,
  "Hà Tĩnh": 1400,
  "Nghệ An": 1500,
  "Vinh": 1500,
  "Thanh Hóa": 1600,
  "Ninh Bình": 1700,
  "Nam Định": 1750,
  "Thái Bình": 1800,
  "Hải Phòng": 1850,
  "Hà Nội": 1700,
  "Hà Nam": 1700,
  "Hưng Yên": 1750,
  "Hải Dương": 1800,
  "Quảng Ninh": 1900,
  "Hạ Long": 1900,
  "Lào Cai": 2200,
  "Sapa": 2200,
  "Yên Bái": 2000,
  "Tuyên Quang": 1900,
  "Phú Thọ": 1800,
  "Vĩnh Phúc": 1750,
  "Bắc Ninh": 1800,
  "Bắc Giang": 1850,
  "Lạng Sơn": 2000,
  "Cao Bằng": 2100,
  "Điện Biên": 2500,
  "Lai Châu": 2600,
  "Sơn La": 2400,
  "Hòa Bình": 1900,
  "Mai Châu": 1900,
};

// Khoảng cách trực tiếp giữa các tỉnh (km) - dữ liệu thực tế
const DIRECT_DISTANCES = {
  // Miền Nam
  "HCM-Bình Dương": 30,
  "HCM-Đồng Nai": 40,
  "HCM-Long An": 50,
  "HCM-Tiền Giang": 70,
  "HCM-Cần Thơ": 170,
  "HCM-Vũng Tàu": 100,
  "HCM-Phan Thiết": 200,
  "HCM-Nha Trang": 450,
  "Bình Dương-Đồng Nai": 20,
  "Cần Thơ-An Giang": 60,
  "Cần Thơ-Kiên Giang": 100,
  
  // Miền Trung
  "Nha Trang-Đà Nẵng": 500,
  "Đà Nẵng-Huế": 100,
  "Huế-Hà Nội": 650,
  
  // Miền Bắc
  "Hà Nội-Hải Phòng": 100,
  "Hà Nội-Nam Định": 90,
  "Hà Nội-Thái Bình": 110,
  "Hà Nội-Hạ Long": 170,
  "Hà Nội-Lào Cai": 300,
  
  // Bắc-Nam
  "HCM-Hà Nội": 1700,
  "HCM-Đà Nẵng": 950,
  "HCM-Huế": 1100,
  "Cần Thơ-Hà Nội": 1870,
  "Đà Nẵng-Hà Nội": 750,
};

// Tốc độ vận chuyển trung bình (km/h)
const AVERAGE_SPEED = {
  "nội thành": 30,        // Nội thành: 30 km/h
  "liên tỉnh gần": 50,    // Liên tỉnh gần (< 200km): 50 km/h
  "liên tỉnh xa": 55,     // Liên tỉnh xa (200-500km): 55 km/h
  "bắc nam": 60,          // Tuyến Bắc-Nam (> 500km): 60 km/h
};

// Thời gian bốc xếp và nghỉ ngơi (giờ)
const ADDITIONAL_TIME = {
  "bốc hàng": 2,          // Thời gian bốc hàng: 2 giờ
  "dỡ hàng": 1.5,         // Thời gian dỡ hàng: 1.5 giờ
  "nghỉ ngơi": 8,         // Nghỉ ngơi ban đêm: 8 giờ (nếu > 500km)
  "checkpoint": 0.5,      // Thời gian qua trạm kiểm soát: 0.5 giờ
};

/**
 * Chuẩn hóa tên tỉnh thành
 */
function normalizeRegion(region) {
  if (!region) return null;
  
  const original = region.toString().trim();
  const normalized = original
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/kho\s+/gi, "") // Bỏ "Kho " ở đầu
    .replace(/tp\.?\s*/gi, "") // Bỏ "TP." hoặc "TP "
    .replace(/thanh pho\s*/gi, "") // Bỏ "Thành phố "
    .trim();
  
  // Tìm exact match
  for (const [key, value] of Object.entries(DISTANCE_FROM_HCM)) {
    const keyNormalized = key
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    
    if (keyNormalized === normalized) {
      return key;
    }
  }
  
  // Tìm partial match (region chứa key hoặc key chứa region)
  for (const [key, value] of Object.entries(DISTANCE_FROM_HCM)) {
    const keyNormalized = key
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    
    if (normalized.includes(keyNormalized) || keyNormalized.includes(normalized)) {
      return key;
    }
  }
  
  // Nếu không tìm thấy, thử tìm các pattern đặc biệt
  if (normalized.includes("hcm") || normalized.includes("ho chi minh") || normalized.includes("sai gon")) {
    return "HCM";
  }
  if (normalized.includes("ha noi") || normalized.includes("hanoi")) {
    return "Hà Nội";
  }
  if (normalized.includes("da nang") || normalized.includes("danang")) {
    return "Đà Nẵng";
  }
  if (normalized.includes("can tho") || normalized.includes("cantho")) {
    return "Cần Thơ";
  }
  if (normalized.includes("binh duong")) {
    return "Bình Dương";
  }
  if (normalized.includes("dong nai")) {
    return "Đồng Nai";
  }
  
  console.warn("⏱️ normalizeRegion: Could not match region", { original, normalized });
  return original; // Trả về giá trị gốc nếu không tìm thấy
}

/**
 * Tính khoảng cách giữa hai tỉnh thành (km)
 */
function calculateDistance(origin, destination) {
  if (!origin || !destination) {
    console.warn("⏱️ calculateDistance: Missing origin or destination", { origin, destination });
    return null;
  }
  
  const originNorm = normalizeRegion(origin);
  const destNorm = normalizeRegion(destination);
  
  console.log("⏱️ calculateDistance - Normalized:", { origin, originNorm, destination, destNorm });
  
  // Kiểm tra khoảng cách trực tiếp
  const directKey1 = `${originNorm}-${destNorm}`;
  const directKey2 = `${destNorm}-${originNorm}`;
  
  if (DIRECT_DISTANCES[directKey1]) {
    console.log("⏱️ calculateDistance - Found direct distance:", DIRECT_DISTANCES[directKey1]);
    return DIRECT_DISTANCES[directKey1];
  }
  if (DIRECT_DISTANCES[directKey2]) {
    console.log("⏱️ calculateDistance - Found direct distance (reversed):", DIRECT_DISTANCES[directKey2]);
    return DIRECT_DISTANCES[directKey2];
  }
  
  // Tính khoảng cách dựa trên khoảng cách từ HCM
  const originDist = DISTANCE_FROM_HCM[originNorm];
  const destDist = DISTANCE_FROM_HCM[destNorm];
  
  if (originDist !== undefined && destDist !== undefined) {
    // Tính khoảng cách tuyến tính (xấp xỉ)
    const distance = Math.abs(destDist - originDist);
    console.log("⏱️ calculateDistance - Calculated from HCM:", distance);
    return distance;
  }
  
  // Nếu một trong hai không tìm thấy, thử tìm trong mapping với key khác
  for (const [key, value] of Object.entries(DISTANCE_FROM_HCM)) {
    if (key.toLowerCase().includes(originNorm.toLowerCase()) || originNorm.toLowerCase().includes(key.toLowerCase())) {
      const foundOriginDist = value;
      if (destDist !== undefined) {
        const distance = Math.abs(destDist - foundOriginDist);
        console.log("⏱️ calculateDistance - Calculated with partial match:", distance);
        return distance;
      }
    }
    if (key.toLowerCase().includes(destNorm.toLowerCase()) || destNorm.toLowerCase().includes(key.toLowerCase())) {
      const foundDestDist = value;
      if (originDist !== undefined) {
        const distance = Math.abs(foundDestDist - originDist);
        console.log("⏱️ calculateDistance - Calculated with partial match:", distance);
        return distance;
      }
    }
  }
  
  // Nếu không tìm thấy, ước tính dựa trên pattern
  // Giả sử khoảng cách trung bình giữa các tỉnh là 150km
  console.warn("⏱️ calculateDistance: Using default distance 150km", { originNorm, destNorm });
  return 150;
}

/**
 * Tính tốc độ vận chuyển dựa trên khoảng cách
 */
function getSpeed(distance) {
  if (!distance || distance <= 0) return AVERAGE_SPEED["nội thành"];
  
  if (distance < 50) {
    return AVERAGE_SPEED["nội thành"];
  } else if (distance < 200) {
    return AVERAGE_SPEED["liên tỉnh gần"];
  } else if (distance < 500) {
    return AVERAGE_SPEED["liên tỉnh xa"];
  } else {
    return AVERAGE_SPEED["bắc nam"];
  }
}

/**
 * Tính thời gian vận chuyển (giờ) dựa trên tuyến đường
 * @param {string} origin - Điểm xuất phát
 * @param {string} destination - Điểm đến
 * @param {string} currentStatus - Trạng thái hiện tại của đơn hàng
 * @returns {number} - Thời gian còn lại (giờ)
 */
export function calculateTransportTime(origin, destination, currentStatus = "ACCEPTED") {
  if (!origin || !destination) return null;
  
  const distance = calculateDistance(origin, destination);
  if (!distance) return null;
  
  const speed = getSpeed(distance);
  const baseTime = distance / speed; // Thời gian vận chuyển cơ bản (giờ)
  
  // Thêm thời gian bốc xếp
  let additionalTime = 0;
  
  // Nếu chưa bốc hàng, thêm thời gian bốc hàng
  if (currentStatus === "ACCEPTED" || currentStatus === "PAID") {
    additionalTime += ADDITIONAL_TIME["bốc hàng"];
  }
  
  // Luôn thêm thời gian dỡ hàng
  additionalTime += ADDITIONAL_TIME["dỡ hàng"];
  
  // Nếu tuyến dài (> 500km), thêm thời gian nghỉ ngơi
  if (distance > 500) {
    // Ước tính số đêm nghỉ (mỗi 600km = 1 đêm)
    const nights = Math.floor(distance / 600);
    additionalTime += nights * ADDITIONAL_TIME["nghỉ ngơi"];
  }
  
  // Thêm thời gian qua các trạm kiểm soát (ước tính 1 trạm mỗi 200km)
  const checkpoints = Math.floor(distance / 200);
  additionalTime += checkpoints * ADDITIONAL_TIME["checkpoint"];
  
  return baseTime + additionalTime;
}

/**
 * Tính thời gian còn lại (giờ) dựa trên trạng thái và tiến độ
 * @param {string} origin - Điểm xuất phát
 * @param {string} destination - Điểm đến
 * @param {string} currentStatus - Trạng thái hiện tại
 * @param {number} progressPercent - Phần trăm hoàn thành (0-100)
 * @returns {number|null} - Thời gian còn lại (giờ), null nếu không tính được
 */
export function calculateTimeLeft(origin, destination, currentStatus, progressPercent = 0) {
  if (!origin || !destination) return null;
  
  // Chỉ tính cho các trạng thái đang vận chuyển
  const activeStatuses = ["ACCEPTED", "LOADING", "IN_TRANSIT", "WAREHOUSE_RECEIVED"];
  if (!activeStatuses.includes(currentStatus)) {
    return null;
  }
  
  const totalTime = calculateTransportTime(origin, destination, currentStatus);
  if (!totalTime) return null;
  
  // Tính thời gian đã trôi qua dựa trên progress
  const elapsedTime = (progressPercent / 100) * totalTime;
  const remainingTime = totalTime - elapsedTime;
  
  // Đảm bảo thời gian còn lại không âm
  return Math.max(0, remainingTime);
}

/**
 * Format thời gian còn lại thành chuỗi dễ đọc
 * @param {number} hours - Thời gian còn lại (giờ)
 * @returns {string|null} - Chuỗi định dạng (VD: "2 Giờ", "30 Phút")
 */
export function formatTimeLeft(hours) {
  if (hours === null || hours === undefined || hours <= 0) return null;
  
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  
  if (wholeHours > 0) {
    if (minutes > 0) {
      return `${wholeHours} Giờ ${minutes} Phút`;
    }
    return `${wholeHours} Giờ`;
  } else if (minutes > 0) {
    return `${minutes} Phút`;
  }
  
  return null;
}

/**
 * Tính thời gian còn lại từ địa chỉ pickup và dropoff
 * @param {string} pickupAddress - Địa chỉ lấy hàng
 * @param {string} dropoffAddress - Địa chỉ giao hàng
 * @param {string} currentStatus - Trạng thái hiện tại
 * @param {number} progressPercent - Phần trăm hoàn thành
 * @returns {string|null} - Chuỗi thời gian còn lại
 */
export function getTimeLeftFromAddresses(pickupAddress, dropoffAddress, currentStatus, progressPercent = 0) {
  if (!pickupAddress || !dropoffAddress) {
    console.warn("⏱️ getTimeLeftFromAddresses: Missing addresses", { pickupAddress, dropoffAddress });
    return null;
  }
  
  // Extract region từ địa chỉ (lấy phần cuối cùng, thường là tỉnh/thành phố)
  const extractRegion = (address) => {
    if (!address) return null;
    const parts = address.split(",").map(p => p.trim());
    // Lấy phần cuối cùng (thường là tỉnh/thành phố)
    const region = parts[parts.length - 1] || address;
    // Chuẩn hóa region
    return normalizeRegion(region);
  };
  
  const origin = extractRegion(pickupAddress);
  const destination = extractRegion(dropoffAddress);
  
  console.log("⏱️ getTimeLeftFromAddresses - Extracted regions:", {
    pickupAddress,
    dropoffAddress,
    origin,
    destination,
    currentStatus,
    progressPercent
  });
  
  if (!origin || !destination) {
    console.warn("⏱️ getTimeLeftFromAddresses: Could not extract regions", { origin, destination });
    return null;
  }
  
  const timeLeftHours = calculateTimeLeft(origin, destination, currentStatus, progressPercent);
  const formatted = formatTimeLeft(timeLeftHours);
  
  console.log("⏱️ getTimeLeftFromAddresses - Result:", {
    timeLeftHours,
    formatted
  });
  
  return formatted;
}

