/* eslint-disable prettier/prettier */
export type AffiliationType = {
  id: string
  nameAffiliation: string
  idAffiliation: string
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

// eslint-disable-next-line no-restricted-syntax
export enum NameFields {
  GLOVOTOKEN = 'glovoToken',
  EMAIL = 'email',
  FIRSTNAME = 'firstName',
  LASTNAME = 'lastName',
  CORPORATENAME = 'corporateName',
  TYPEDOCUMENT = 'typeDocument',
  DOCUMENT = 'document',
  PHONENUMBER = 'phoneNumber',
  TYPENEW = 'new',
  TYPEDIT = 'edit',
  DANGER = 'danger',
  SECONDARY = 'secondary',
  PRIMARY = 'primary',
  SUCCESS = 'success',
  NAMEAFFILIATION = 'nameAffiliation',
  IDAFFILIATION = 'idAffiliation',
  SALESCHANNEL = 'salesChannel',
  PICKUPPOINTS = 'pickupPoints',
  GLOVOID = 'glovoId',
}
