import districtTalukasData from "./district-talukas.json";

export const JOB_TYPES = [
  "सेल्समन (Salesman)",
  "डिलिव्हरी बॉय (Delivery Boy)",
  "स्वयंपाकी (Cook)",
  "वेटर (Waiter)",
  "सुरक्षा रक्षक (Security Guard)",
  "ड्रायव्हर (Driver)",
  "मेकॅनिक (Mechanic)",
  "इलेक्ट्रिशियन (Electrician)",
  "प्लंबर (Plumber)",
  "सुतार (Carpenter)",
  "वेल्डर (Welder)",
  "शिपाई (Peon)",
  "क्लिनर (Cleaner)",
  "रिसेप्शनिस्ट (Receptionist)",
  "अकाउंट सहाय्यक (Accounts Assistant)",
  "दुकान सहाय्यक (Shop Assistant)",
  "गोडाउन कामगार (Warehouse Worker)",
  "इतर (Other)",
];

export const DISTRICT_TALUKAS: Record<string, string[]> = districtTalukasData;

export const DISTRICTS = Object.keys(DISTRICT_TALUKAS);

// Flat list of all talukas (for filters that show all)
export const TALUKAS = Object.values(DISTRICT_TALUKAS).flat();
