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

export const countriesOptions: CountriesRecord[] = Object.keys(
  countriesMap
).map((country) => ({
  value: country,
  label: countriesMap[country],
}))
