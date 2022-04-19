// This is a list of the countries where Glovo operates currently

export type CountriesRecord = Record<string, string>

export const countriesMap: CountriesRecord = {
  ESP: 'Spain',
  PRT: 'Portugal',
  ITA: 'Italy',
  POL: 'Poland',
  HRV: 'Croatia',
  SRB: 'Serbia',
  KAZ: 'Kazakhstan',
  ROU: 'Romania',
  MAR: 'Morocco',
  GEO: 'Georgia',
  KEN: 'Kenya',
  CIV: 'Ivory Coast',
  UKR: 'Ukraine',
  MDA: 'Moldova',
  UGA: 'Uganda',
  KGZ: 'Kyrgyzstan',
  BIH: 'Bosnia & Herzegovina',
  GHA: 'Ghana',
  MNE: 'Montenegro',
  BGR: 'Bulgaria',
}

export const countriesOptions: CountriesRecord[] = [
  { value: 'ESP', label: 'Spain' },
  { value: 'PRT', label: 'Portugal' },
  { value: 'ITA', label: 'Italy' },
  { value: 'POL', label: 'Poland' },
  { value: 'HRV', label: 'Croatia' },
  { value: 'SRB', label: 'Serbia' },
  { value: 'KAZ', label: 'Kazakhstan' },
  { value: 'ROU', label: 'Romania' },
  { value: 'MAR', label: 'Morocco' },
  { value: 'GEO', label: 'Georgia' },
  { value: 'KEN', label: 'Kenya' },
  { value: 'CIV', label: 'Ivory Coast' },
  { value: 'UKR', label: 'Ukraine' },
  { value: 'MDA', label: 'Moldova' },
  { value: 'UGA', label: 'Uganda' },
  { value: 'KGZ', label: 'Kyrgyzstan' },
  { value: 'BIH', label: 'Bosnia & Herzegovina' },
  { value: 'GHA', label: 'Ghana' },
  { value: 'MNE', label: 'Montenegro' },
  { value: 'BGR', label: 'Bulgaria' },
]
