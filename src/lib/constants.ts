// Job expiry
export const JOB_EXPIRY_DAYS = 30;
export const JOB_EXPIRY_MS = JOB_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

// Industries — groups for job types
export const INDUSTRIES = [
  { id: 1, marathi: "सामान्य", english: "General" },
  { id: 2, marathi: "हॉस्पिटल", english: "Hospital" },
  { id: 3, marathi: "हॉटेल", english: "Hotel" },
  { id: 4, marathi: "उत्पादन", english: "Manufacturing" },
  { id: 5, marathi: "बांधकाम", english: "Construction" },
  { id: 6, marathi: "शिक्षण", english: "Education" },
  { id: 7, marathi: "सॉफ्टवेअर", english: "Software" },
  { id: 8, marathi: "रिअल इस्टेट", english: "Real Estate" },
  { id: 9, marathi: "व्यापार", english: "Trading" },
] as const;

// Job types — single source of truth (with industry_id)
export const JOB_TYPES = [
  { id: 1, marathi: "सेल्समन", english: "Salesman", industry_id: 1 },
  { id: 2, marathi: "डिलिव्हरी बॉय", english: "Delivery Boy", industry_id: 1 },
  { id: 3, marathi: "स्वयंपाकी", english: "Cook", industry_id: 3 },
  { id: 4, marathi: "वेटर", english: "Waiter", industry_id: 3 },
  { id: 5, marathi: "सुरक्षा रक्षक", english: "Security Guard", industry_id: 1 },
  { id: 6, marathi: "ड्रायव्हर", english: "Driver", industry_id: 1 },
  { id: 7, marathi: "मेकॅनिक", english: "Mechanic", industry_id: 1 },
  { id: 8, marathi: "इलेक्ट्रिशियन", english: "Electrician", industry_id: 5 },
  { id: 9, marathi: "प्लंबर", english: "Plumber", industry_id: 5 },
  { id: 10, marathi: "सुतार", english: "Carpenter", industry_id: 5 },
  { id: 11, marathi: "वेल्डर", english: "Welder", industry_id: 4 },
  { id: 12, marathi: "शिपाई", english: "Peon", industry_id: 1 },
  { id: 13, marathi: "सफाई कर्मचारी", english: "Cleaner", industry_id: 1 },
  { id: 14, marathi: "रिसेप्शनिस्ट", english: "Receptionist", industry_id: 1 },
  { id: 15, marathi: "दुकान सहाय्यक", english: "Shop Assistant", industry_id: 1 },
  { id: 16, marathi: "गोडाउन कामगार", english: "Warehouse Worker", industry_id: 1 },
  { id: 17, marathi: "हेल्पर", english: "Helper", industry_id: 1 },
  { id: 18, marathi: "सुपरवायझर", english: "Supervisor", industry_id: 1 },
  { id: 19, marathi: "टेलिकॉलर", english: "Telecaller", industry_id: 1 },
  { id: 20, marathi: "एचआर", english: "HR", industry_id: 1 },
  { id: 21, marathi: "बँक कर्मचारी", english: "Bank Staff", industry_id: 1 },
  { id: 22, marathi: "कॉम्प्युटर ऑपरेटर", english: "Computer Operator", industry_id: 1 },
  { id: 23, marathi: "शिक्षक", english: "Teacher", industry_id: 6 },
  { id: 24, marathi: "नर्स", english: "Nurse", industry_id: 2 },
  { id: 25, marathi: "तंत्रज्ञ", english: "Technician", industry_id: 2 },
  { id: 26, marathi: "मशीन ऑपरेटर", english: "Machine Operator", industry_id: 4 },
  { id: 27, marathi: "ऑफिस सहाय्यक", english: "Office Assistant", industry_id: 1 },
  { id: 28, marathi: "फील्ड वर्कर", english: "Field Worker", industry_id: 1 },
  { id: 29, marathi: "इंजिनिअर", english: "Engineer", industry_id: 1 },
  { id: 30, marathi: "व्हिडिओ एडिटर", english: "Video Editor", industry_id: 1 },
  { id: 31, marathi: "मार्केटिंग", english: "Marketing", industry_id: 1 },
  { id: 32, marathi: "अकाउंटंट", english: "Accountant", industry_id: 1 },
  { id: 33, marathi: "कामगार", english: "Worker", industry_id: 4 },
  { id: 34, marathi: "इतर", english: "Other", industry_id: 1 },
  // Hospital-specific types
  { id: 35, marathi: "आरएमओ", english: "RMO", industry_id: 2 },
  { id: 36, marathi: "हॉस्पिटल ब्रदर", english: "Hospital Brother", industry_id: 2 },
  { id: 37, marathi: "हॉस्पिटल सिस्टर", english: "Hospital Sister", industry_id: 2 },
  { id: 38, marathi: "सीएचओ", english: "CHO", industry_id: 2 },
  { id: 39, marathi: "हॉस्पिटल तंत्रज्ञ", english: "Hospital Technician", industry_id: 2 },
  { id: 40, marathi: "ओटी तंत्रज्ञ", english: "OT Technician", industry_id: 2 },
  { id: 41, marathi: "कॅथलॅब तंत्रज्ञ", english: "Cathlab Technician", industry_id: 2 },
  { id: 42, marathi: "परफ्युजनिस्ट", english: "Perfusionist", industry_id: 2 },
  { id: 43, marathi: "हाउसकीपिंग", english: "Housekeeping", industry_id: 2 },
] as const;

// Dropdown options: array of {id, label} for forms and filters
export const JOB_TYPE_OPTIONS = JOB_TYPES.map((jt) => ({
  id: jt.id,
  label: `${jt.marathi} (${jt.english})`,
}));

// Lookup maps
const jobTypeLabelById = new Map<number, string>();
const jobTypeMarathiById = new Map<number, string>();
const jobTypeIdByMarathi = new Map<string, number>();
for (const jt of JOB_TYPES) {
  jobTypeLabelById.set(jt.id, `${jt.marathi} (${jt.english})`);
  jobTypeMarathiById.set(jt.id, jt.marathi);
  jobTypeIdByMarathi.set(jt.marathi, jt.id);
}

/** Returns bilingual label: "मराठी (English)" for a numeric ID */
export function getJobTypeLabel(id: number): string {
  return jobTypeLabelById.get(id) || `#${id}`;
}

/** Returns Marathi name for a numeric ID */
export function getJobTypeMarathi(id: number): string {
  return jobTypeMarathiById.get(id) || "इतर";
}

/** Returns numeric ID for a Marathi name (used by import scripts) */
export function getJobTypeIdByMarathi(name: string): number | undefined {
  return jobTypeIdByMarathi.get(name);
}

// Industry lookup maps
const industryById = new Map<number, { marathi: string; english: string }>();
for (const ind of INDUSTRIES) {
  industryById.set(ind.id, { marathi: ind.marathi, english: ind.english });
}

/** Returns industry label: "मराठी (English)" for an industry ID */
export function getIndustryLabel(id: number): string {
  const ind = industryById.get(id);
  return ind ? `${ind.marathi} (${ind.english})` : "सामान्य (General)";
}

// Grouped job type options for <optgroup> dropdowns
export interface GroupedJobTypeOptions {
  industry_id: number;
  industry_mr: string;
  industry_en: string;
  options: { id: number; label: string }[];
}

export const JOB_TYPE_OPTIONS_GROUPED: GroupedJobTypeOptions[] = (() => {
  const map = new Map<number, GroupedJobTypeOptions>();
  for (const ind of INDUSTRIES) {
    map.set(ind.id, {
      industry_id: ind.id,
      industry_mr: ind.marathi,
      industry_en: ind.english,
      options: [],
    });
  }
  for (const jt of JOB_TYPES) {
    const group = map.get(jt.industry_id);
    if (group) {
      group.options.push({ id: jt.id, label: `${jt.marathi} (${jt.english})` });
    }
  }
  return Array.from(map.values()).filter((g) => g.options.length > 0);
})();

export const GENDERS = ["पुरुष (Male)", "महिला (Female)", "दोन्ही (Both)"];

// District-talukas — single source of truth
export const DISTRICT_TALUKAS: Record<string, string[]> = {
  "सांगली": ["सांगली", "मिरज", "कुपवाड", "तासगाव", "खानापूर", "आटपाडी", "जत", "कवठेमहांकाळ", "वाळवा", "पलूस"],
  "पुणे": ["पुणे शहर", "हवेली", "बारामती", "इंदापूर", "दौंड", "जुन्नर", "खेड", "मावळ", "मुळशी", "पुरंदर", "शिरूर", "वेल्हे", "भोर", "आंबेगाव"],
  "मुंबई": ["मुंबई शहर", "मुंबई उपनगर"],
  "नागपूर": ["नागपूर शहर", "नागपूर ग्रामीण", "हिंगणा", "काटोल", "कामठी", "नरखेड", "पारशिवनी", "रामटेक", "सावनेर", "उमरेड", "कुही", "भिवापूर", "मौदा"],
  "नाशिक": ["नाशिक", "इगतपुरी", "दिंडोरी", "कळवण", "मालेगाव", "नांदगाव", "निफाड", "पेठ", "सिन्नर", "सुरगाणा", "त्र्यंबकेश्वर", "येवला", "चांदवड", "देवळा", "बागलाण"],
  "औरंगाबाद": ["औरंगाबाद", "कन्नड", "खुलताबाद", "गंगापूर", "पैठण", "फुलंब्री", "सिल्लोड", "सोयगाव", "वैजापूर"],
  "सोलापूर": ["सोलापूर उत्तर", "सोलापूर दक्षिण", "अक्कलकोट", "बार्शी", "करमाळा", "माढा", "माळशिरस", "मोहोळ", "पंढरपूर", "सांगोला", "मंगळवेढा"],
  "कोल्हापूर": ["कोल्हापूर", "करवीर", "पन्हाळा", "शाहूवाडी", "हातकणंगले", "शिरोळ", "इचलकरंजी", "कागल", "गडहिंग्लज", "चंदगड", "आजरा", "भुदरगड", "राधानगरी", "गगनबावडा", "बावडा"],
  "सातारा": ["सातारा", "कराड", "वाई", "महाबळेश्वर", "पाटण", "जावळी", "फलटण", "मान", "खटाव", "कोरेगाव", "खंडाळा"],
  "अहमदनगर": ["अहमदनगर", "श्रीरामपूर", "कोपरगाव", "संगमनेर", "राहाता", "नेवासा", "शेवगाव", "पाथर्डी", "जामखेड", "कर्जत", "पारनेर", "राहुरी", "अकोले"],
  "रत्नागिरी": ["रत्नागिरी", "चिपळूण", "गुहागर", "दापोली", "खेड", "लांजा", "राजापूर", "संगमेश्वर", "मंडणगड"],
  "ठाणे": ["ठाणे", "कल्याण", "भिवंडी", "उल्हासनगर", "अंबरनाथ", "मुरबाड", "शहापूर"],
  "रायगड": ["अलिबाग", "पेण", "पनवेल", "उरण", "कर्जत", "खालापूर", "महाड", "माणगाव", "मुरुड", "पोलादपूर", "रोहा", "श्रीवर्धन", "सुधागड", "तळा"],
  "सिंधुदुर्ग": ["सिंधुदुर्ग", "कुडाळ", "मालवण", "सावंतवाडी", "वेंगुर्ला", "देवगड", "कणकवली", "दोडामार्ग"],
  "पालघर": ["पालघर", "वसई", "डहाणू", "तलासरी", "जव्हार", "मोखाडा", "विक्रमगड", "वाडा"],
  "धुळे": ["धुळे", "शिरपूर", "शिंदखेडा", "साक्री"],
  "जळगाव": ["जळगाव", "भुसावळ", "चोपडा", "एरंडोल", "जामनेर", "पाचोरा", "रावेर", "यावल", "अमळनेर", "बोदवड", "चाळीसगाव", "धरणगाव", "मुक्ताईनगर", "पारोळा"],
  "नंदुरबार": ["नंदुरबार", "शहादा", "तळोदा", "नवापूर", "अक्कलकुवा", "अक्राणी"],
  "अमरावती": ["अमरावती", "अचलपूर", "चांदूर बाजार", "चांदूर रेल्वे", "धामणगाव रेल्वे", "मोर्शी", "वरुड", "तिवसा", "नांदगाव खंडेश्वर", "भातकुली", "अंजनगाव सुर्जी", "दर्यापूर", "चिखलदरा", "धारणी"],
  "अकोला": ["अकोला", "अकोट", "बाळापूर", "मूर्तिजापूर", "पातूर", "तेल्हारा", "बार्शीटाकळी"],
  "बुलढाणा": ["बुलढाणा", "चिखली", "देऊळगाव राजा", "जळगाव जामोद", "खामगाव", "लोणार", "मलकापूर", "मेहकर", "मोताळा", "नांदुरा", "संग्रामपूर", "शेगाव", "सिंदखेड राजा"],
  "यवतमाळ": ["यवतमाळ", "अर्णी", "बाभूळगाव", "दारव्हा", "दिग्रस", "घाटंजी", "कळंब", "केळापूर", "महागाव", "नेर", "पांढरकवडा", "पुसद", "राळेगाव", "उमरखेड", "वणी", "झरीझामणी"],
  "वाशीम": ["वाशीम", "कारंजा", "मालेगाव", "मंगरूळपीर", "मानोरा", "रिसोड"],
  "वर्धा": ["वर्धा", "आर्वी", "आष्टी", "देवळी", "हिंगणघाट", "कारंजा", "सेलू", "समुद्रपूर"],
  "भंडारा": ["भंडारा", "तुमसर", "पवनी", "मोहाडी", "साकोली", "लाखनी", "लाखांदूर"],
  "गोंदिया": ["गोंदिया", "तिरोडा", "गोरेगाव", "अर्जुनी मोरगाव", "आमगाव", "देवरी", "सडक अर्जुनी", "सालेकसा"],
  "चंद्रपूर": ["चंद्रपूर", "बल्लारपूर", "ब्रह्मपुरी", "चिमूर", "गोंडपिंपरी", "जिवती", "कोरपना", "मूल", "नागभीड", "पोंभुर्णा", "राजुरा", "सावली", "सिंदेवाही", "वरोरा"],
  "गडचिरोली": ["गडचिरोली", "अहेरी", "आरमोरी", "चामोर्शी", "देसाईगंज", "धानोरा", "एटापल्ली", "कुरखेडा", "मुलचेरा", "सिरोंचा", "भामरागड", "कोरची"],
  "जालना": ["जालना", "अंबड", "बदनापूर", "भोकरदन", "घनसावंगी", "जाफराबाद", "मंठा", "परतूर"],
  "बीड": ["बीड", "आष्टी", "अंबाजोगाई", "गेवराई", "धारूर", "केज", "माजलगाव", "पाटोदा", "परळी", "शिरूर कासार", "वडवणी"],
  "लातूर": ["लातूर", "अहमदपूर", "औसा", "चाकूर", "देवणी", "जळकोट", "निलंगा", "रेणापूर", "शिरूर अनंतपाळ", "उदगीर"],
  "उस्मानाबाद": ["उस्मानाबाद", "उमरगा", "तुळजापूर", "लोहारा", "कळंब", "भूम", "परांडा", "वाशी"],
  "नांदेड": ["नांदेड", "अर्धापूर", "भोकर", "बिलोली", "देगलूर", "धर्माबाद", "हदगाव", "हिमायतनगर", "कंधार", "किनवट", "लोहा", "माहूर", "मुदखेड", "मुखेड", "नायगाव", "उमरी"],
  "परभणी": ["परभणी", "गंगाखेड", "जिंतूर", "मानवत", "पाथरी", "पालम", "पूर्णा", "सेलू", "सोनपेठ"],
  "हिंगोली": ["हिंगोली", "औंढा नागनाथ", "बसमत", "कळमनुरी", "सेनगाव"],
};

export type District = keyof typeof DISTRICT_TALUKAS;

export const DISTRICTS = Object.keys(DISTRICT_TALUKAS);

// Flat list of all talukas (for filters that show all)
export const TALUKAS = Object.values(DISTRICT_TALUKAS).flat();
