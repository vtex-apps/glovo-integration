export type AffiliationType = {
  id: string
  nameAffiliation: string
  storeId: string
  salesChannel: string
  pickupPoints: string
  glovoId: string
}

export type SettingDataType = {
  glovoToken: string
  production: boolean
  email: string
  firstName: string
  lastName: string
  selectDocument: string
  document: string
  phoneNumber: string
  corporateName: string
  affiliation: AffiliationType[]
}

export type TableItem = {
  cellData: unknown
  rowData: AffiliationType
  updateCellMeasurements: () => void
}
