// UK Universities by Course Type

export interface University {
  id: string
  name: string
  courseCode: string
  entranceReq: string
}

export const MEDICAL_SCHOOLS: University[] = [
  { id: "anglia-ruskin", name: "Anglia Ruskin University School of Medicine", courseCode: "A100", entranceReq: "AAA" },
  { id: "aston", name: "Aston University Medical School", courseCode: "A100", entranceReq: "AAA" },
  { id: "brighton-sussex", name: "Brighton and Sussex Medical School", courseCode: "A100", entranceReq: "AAA" },
  { id: "brunel", name: "Brunel University Medical School", courseCode: "A100", entranceReq: "AAA" },
  { id: "cardiff", name: "Cardiff University School of Medicine", courseCode: "A100", entranceReq: "AAA" },
  { id: "city-st-georges", name: "City St George's, University of London", courseCode: "A100", entranceReq: "A*AA" },
  { id: "edge-hill", name: "Edge Hill University Medical School", courseCode: "A100", entranceReq: "AAA" },
  { id: "hull-york", name: "Hull York Medical School", courseCode: "A100", entranceReq: "AAA" },
  { id: "imperial", name: "Imperial College London Faculty of Medicine", courseCode: "A100", entranceReq: "A*AA" },
  { id: "keele", name: "Keele University School of Medicine", courseCode: "A100", entranceReq: "AAA" },
  { id: "kent-medway", name: "Kent and Medway Medical School", courseCode: "A100", entranceReq: "AAA" },
  { id: "kings", name: "King's College London GKT School of Medical Education", courseCode: "A100", entranceReq: "A*AA" },
  { id: "lancaster", name: "Lancaster University Medical School", courseCode: "A100", entranceReq: "AAA" },
  { id: "lshtm", name: "London School of Hygiene and Tropical Medicine", courseCode: "A100", entranceReq: "A*AA" },
  { id: "newcastle", name: "Newcastle University School of Medical Education", courseCode: "A100", entranceReq: "AAA" },
  { id: "north-wales", name: "North Wales Medical School, Bangor University", courseCode: "A100", entranceReq: "AAA" },
  { id: "norwich", name: "Norwich Medical School, University of East Anglia", courseCode: "A100", entranceReq: "AAA" },
  { id: "pears-cumbria", name: "Pears Cumbria School of Medicine", courseCode: "A100", entranceReq: "AAA" },
  { id: "plymouth", name: "Plymouth University Peninsula School of Medicine", courseCode: "A100", entranceReq: "AAA" },
  { id: "queen-mary", name: "Queen Mary, University of London School of Medicine", courseCode: "A100", entranceReq: "A*AA" },
  { id: "queens-belfast", name: "Queen's University Belfast School of Medicine", courseCode: "A100", entranceReq: "AAA" },
  { id: "st-marys", name: "St Mary's University, Twickenham School of Medicine", courseCode: "A100", entranceReq: "AAA" },
  { id: "swansea", name: "Swansea University Medical School", courseCode: "A100", entranceReq: "AAA" },
  { id: "edinburgh", name: "The University of Edinburgh Medical School", courseCode: "A100", entranceReq: "AAA" },
  { id: "three-counties", name: "Three Counties Medical School, University of Worcester", courseCode: "A100", entranceReq: "AAA" },
  { id: "ulster", name: "Ulster University School of Medicine", courseCode: "A100", entranceReq: "AAA" },
  { id: "ucl", name: "University College London Medical School", courseCode: "A100", entranceReq: "A*AA" },
  { id: "aberdeen", name: "University of Aberdeen School of Medicine", courseCode: "A100", entranceReq: "AAA" },
  { id: "birmingham", name: "University of Birmingham School of Medical Sciences", courseCode: "A100", entranceReq: "AAA" },
  { id: "bristol", name: "University of Bristol Medical School", courseCode: "A100", entranceReq: "A*AA" },
  { id: "buckingham", name: "University of Buckingham Medical School", courseCode: "A100", entranceReq: "AAA" },
  { id: "cambridge", name: "University of Cambridge School of Clinical Medicine", courseCode: "A100", entranceReq: "A*A*A" },
  { id: "chester", name: "University of Chester Medical School", courseCode: "A100", entranceReq: "AAA" },
  { id: "dundee", name: "University of Dundee School of Medicine", courseCode: "A100", entranceReq: "AAA" },
  { id: "exeter", name: "University of Exeter Medical School", courseCode: "A100", entranceReq: "AAA" },
  { id: "glasgow", name: "University of Glasgow School of Medicine", courseCode: "A100", entranceReq: "AAA" },
  { id: "greater-manchester", name: "University of Greater Manchester Medical School", courseCode: "A100", entranceReq: "AAA" },
  { id: "lancashire", name: "University of Lancashire School of Medicine", courseCode: "A100", entranceReq: "AAA" },
  { id: "leeds", name: "University of Leeds School of Medicine", courseCode: "A100", entranceReq: "AAA" },
  { id: "leicester", name: "University of Leicester Medical School", courseCode: "A100", entranceReq: "AAA" },
  { id: "lincoln", name: "University of Lincoln Medical School", courseCode: "A100", entranceReq: "AAA" },
  { id: "liverpool", name: "University of Liverpool School of Medicine", courseCode: "A100", entranceReq: "AAA" },
  { id: "manchester", name: "University of Manchester Medical School", courseCode: "A100", entranceReq: "A*AA" },
  { id: "nottingham", name: "University of Nottingham School of Medicine", courseCode: "A100", entranceReq: "AAA" },
  { id: "oxford", name: "University of Oxford Medical Sciences Division", courseCode: "A100", entranceReq: "A*A*A" },
  { id: "sheffield", name: "University of Sheffield Medical School", courseCode: "A100", entranceReq: "AAA" },
  { id: "southampton", name: "University of Southampton School of Medicine", courseCode: "A100", entranceReq: "AAA" },
  { id: "st-andrews", name: "University of St Andrews School of Medicine", courseCode: "A100", entranceReq: "AAA" },
  { id: "sunderland", name: "University of Sunderland School of Medicine", courseCode: "A100", entranceReq: "AAA" },
  { id: "surrey", name: "University of Surrey School of Medicine", courseCode: "A100", entranceReq: "AAA" },
  { id: "warwick", name: "University of Warwick Medical School", courseCode: "A100", entranceReq: "AAA" },
]

export const DENTAL_SCHOOLS: University[] = [
  { id: "cardiff-dent", name: "Cardiff University", courseCode: "A200", entranceReq: "AAA" },
  { id: "kings-dent", name: "King's College London", courseCode: "A200", entranceReq: "A*AA" },
  { id: "newcastle-dent", name: "Newcastle University", courseCode: "A200", entranceReq: "AAA" },
  { id: "queen-mary-dent", name: "Queen Mary University of London", courseCode: "A200", entranceReq: "A*AA" },
  { id: "queens-belfast-dent", name: "Queen's University Belfast", courseCode: "A200", entranceReq: "AAA" },
  { id: "rcs-england", name: "Royal College of Surgeons of England", courseCode: "A200", entranceReq: "A*AA" },
  { id: "aberdeen-dent", name: "University of Aberdeen", courseCode: "A200", entranceReq: "AAA" },
  { id: "birmingham-dent", name: "University of Birmingham", courseCode: "A200", entranceReq: "AAA" },
  { id: "bristol-dent", name: "University of Bristol", courseCode: "A200", entranceReq: "A*AA" },
  { id: "central-lancashire-dent", name: "University of Central Lancashire", courseCode: "A200", entranceReq: "AAA" },
  { id: "dundee-dent", name: "University of Dundee", courseCode: "A200", entranceReq: "AAA" },
  { id: "east-anglia-dent", name: "University of East Anglia", courseCode: "A200", entranceReq: "AAA" },
  { id: "glasgow-dent", name: "University of Glasgow", courseCode: "A200", entranceReq: "AAA" },
  { id: "leeds-dent", name: "University of Leeds", courseCode: "A200", entranceReq: "AAA" },
  { id: "liverpool-dent", name: "University of Liverpool", courseCode: "A200", entranceReq: "AAA" },
  { id: "manchester-dent", name: "University of Manchester", courseCode: "A200", entranceReq: "A*AA" },
  { id: "plymouth-dent", name: "University of Plymouth", courseCode: "A200", entranceReq: "AAA" },
  { id: "sheffield-dent", name: "University of Sheffield", courseCode: "A200", entranceReq: "AAA" },
]

export const VETERINARY_SCHOOLS: University[] = [
  { id: "rvc", name: "Royal Veterinary College", courseCode: "D100", entranceReq: "AAA" },
  { id: "sruc", name: "Scotland's Rural College (SRUC)", courseCode: "D100", entranceReq: "AAA" },
  { id: "lancashire-vet", name: "University of Lancashire", courseCode: "D100", entranceReq: "AAA" },
  { id: "edinburgh-vet", name: "University of Edinburgh (Royal (Dick) School of Veterinary Studies)", courseCode: "D100", entranceReq: "AAA" },
  { id: "nottingham-vet", name: "University of Nottingham", courseCode: "D100", entranceReq: "AAA" },
  { id: "cambridge-vet", name: "University of Cambridge", courseCode: "D100", entranceReq: "A*A*A" },
  { id: "surrey-vet", name: "University of Surrey", courseCode: "D100", entranceReq: "AAA" },
  { id: "harper-keele", name: "Harper and Keele Veterinary School", courseCode: "D100", entranceReq: "AAA" },
  { id: "glasgow-vet", name: "University of Glasgow", courseCode: "D100", entranceReq: "AAA" },
  { id: "liverpool-vet", name: "University of Liverpool", courseCode: "D100", entranceReq: "AAA" },
  { id: "bristol-vet", name: "University of Bristol", courseCode: "D100", entranceReq: "AAA" },
]

export function getUniversitiesByCourse(course: "medicine" | "dentistry" | "veterinary" | null): University[] {
  switch (course) {
    case "medicine":
      return MEDICAL_SCHOOLS
    case "dentistry":
      return DENTAL_SCHOOLS
    case "veterinary":
      return VETERINARY_SCHOOLS
    default:
      return MEDICAL_SCHOOLS // Default to medicine
  }
}
