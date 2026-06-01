export type CityData = {
  name: string;
  slug: string;
  state: string;
  members: string;
  tagline: string;
  testimonials: { name: string; text: string }[];
};

export const CITIES: Record<string, CityData> = {
  mumbai: {
    name: "Mumbai",
    slug: "mumbai",
    state: "Maharashtra",
    members: "18,000+",
    tagline: "Maximum City, Maximum Matches",
    testimonials: [
      { name: "Shreya, 24", text: "Found someone from Andheri — we go on dates every weekend now!" },
      { name: "Rohan, 27", text: "Best dating app for Mumbai. Real people, no fake profiles." },
    ],
  },
  delhi: {
    name: "Delhi",
    slug: "delhi",
    state: "Delhi NCR",
    members: "22,000+",
    tagline: "Dilli Walon Ka Dil Milao",
    testimonials: [
      { name: "Priya, 23", text: "Met someone from South Delhi — we've been together 6 months!" },
      { name: "Arjun, 26", text: "Finally a dating app that understands Delhi culture." },
    ],
  },
  bangalore: {
    name: "Bangalore",
    slug: "bangalore",
    state: "Karnataka",
    members: "15,000+",
    tagline: "Silicon Valley of India, Valley of Hearts",
    testimonials: [
      { name: "Ananya, 25", text: "Met my partner here — both techies, both from Bangalore!" },
      { name: "Karthik, 28", text: "The filters are perfect for finding someone with similar values." },
    ],
  },
  hyderabad: {
    name: "Hyderabad",
    slug: "hyderabad",
    state: "Telangana",
    members: "12,000+",
    tagline: "Find Love in the City of Nizams",
    testimonials: [
      { name: "Sravani, 24", text: "Found a genuine connection right here in Hyderabad." },
      { name: "Rahul, 27", text: "Great app — matched with someone from Banjara Hills!" },
    ],
  },
  pune: {
    name: "Pune",
    slug: "pune",
    state: "Maharashtra",
    members: "11,000+",
    tagline: "Oxford of the East, Love of the West",
    testimonials: [
      { name: "Meera, 22", text: "As a student here, I found someone who shares my goals." },
      { name: "Vivek, 26", text: "Pune has so many genuine people on Dil Milao!" },
    ],
  },
  chennai: {
    name: "Chennai",
    slug: "chennai",
    state: "Tamil Nadu",
    members: "9,000+",
    tagline: "Find Your Inamorata in Chennai",
    testimonials: [
      { name: "Kavitha, 25", text: "Finally found someone who respects Tamil values and culture." },
      { name: "Arun, 28", text: "The religion and language filters made it so easy to find the right person." },
    ],
  },
  kolkata: {
    name: "Kolkata",
    slug: "kolkata",
    state: "West Bengal",
    members: "8,000+",
    tagline: "City of Joy, City of Love",
    testimonials: [
      { name: "Ria, 23", text: "Found a book lover from Park Street — truly my soulmate!" },
      { name: "Souvik, 27", text: "Kolkata has so many interesting people on Dil Milao." },
    ],
  },
  jaipur: {
    name: "Jaipur",
    slug: "jaipur",
    state: "Rajasthan",
    members: "6,000+",
    tagline: "Pink City, Rosy Romance",
    testimonials: [
      { name: "Pooja, 24", text: "Met someone amazing right here in the Pink City!" },
      { name: "Mohit, 26", text: "Great for finding someone with Rajasthani roots and values." },
    ],
  },
  ahmedabad: {
    name: "Ahmedabad",
    slug: "ahmedabad",
    state: "Gujarat",
    members: "7,000+",
    tagline: "Manchester of India, Heart of Gujarat",
    testimonials: [
      { name: "Nisha, 23", text: "Found a Gujarati match who loves food as much as I do!" },
      { name: "Dev, 27", text: "The best app for finding genuine Gujarati connections." },
    ],
  },
  lucknow: {
    name: "Lucknow",
    slug: "lucknow",
    state: "Uttar Pradesh",
    members: "5,000+",
    tagline: "City of Nawabs, City of Love",
    testimonials: [
      { name: "Zara, 24", text: "The tehzeeb and warmth of Lucknow is reflected in its users!" },
      { name: "Aditya, 26", text: "Found someone who shares my love for Lucknawi culture." },
    ],
  },
  chandigarh: {
    name: "Chandigarh",
    slug: "chandigarh",
    state: "Punjab",
    members: "4,500+",
    tagline: "The City Beautiful, Full of Beautiful People",
    testimonials: [
      { name: "Simran, 23", text: "Best dating app for Chandigarh — found my dream match!" },
      { name: "Harpreet, 27", text: "So many genuine Punjabi matches on Dil Milao." },
    ],
  },
  surat: {
    name: "Surat",
    slug: "surat",
    state: "Gujarat",
    members: "5,500+",
    tagline: "Diamond City Deserves Diamond Matches",
    testimonials: [
      { name: "Foram, 24", text: "Found someone perfect right here in Surat!" },
      { name: "Nirav, 26", text: "Great app for finding genuine Gujarati connections in Surat." },
    ],
  },
};

export const ALL_CITY_SLUGS = Object.keys(CITIES);
