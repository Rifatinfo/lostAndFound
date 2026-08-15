export const locations = [
  "Dhanmondi",
  "Gulshan",
  "Banani",
  "Uttara Sector 7",
  "Mohammadpur",
  "Mirpur",
  "Bashundhara R/A",
  "Bashundhara City",
  "DIU Campus",
  "Mohakhali",
  "Tejgaon",
  "Khilgaon",
  "Motijheel",
  "Wari",
  "Badda",
  "Niketon",
] as const;

export const defaultAvatarUrl = "";

export const defaultCoverUrl =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e2e8f0"/><stop offset="1" stop-color="#94a3b8"/></linearGradient></defs><rect width="1200" height="240" fill="url(#g)"/></svg>`,
  );
