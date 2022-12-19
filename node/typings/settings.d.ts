interface AppSettings {
  glovoToken: string
  production: boolean
  marketplace: boolean
  stores: StoreInfo[]
  clientProfileData: ClientProfileData
}

interface StoreInfo {
  id: string
  storeName: string
  sellerId: string
  sellerName: string
  affiliateId: string
  salesChannel: string
  postalCode: string
  country: string
  glovoStoreId: string
}

interface ClientProfileData {
  email: string
  firstName: string
  lastName: string
  documentType: string | null
  document: string | null
  phone: string | null
  corporateName: string | null
  tradeName?: string | null
  corporateDocument?: string | null
  stateInscription?: string | null
  corporatePhone?: string | null
  isCorporate?: boolean
  userProfileId?: string | null
}
