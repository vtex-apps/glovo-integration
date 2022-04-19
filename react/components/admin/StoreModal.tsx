import type { ChangeEvent, Dispatch, SetStateAction } from 'react'
import React, { useEffect, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import {
  Button,
  Input,
  Modal,
  EXPERIMENTAL_Select as Select,
} from 'vtex.styleguide'
import { v4 as createId } from 'uuid'
import { useQuery } from 'react-apollo'

import {
  COUNTRY,
  GLOVO_STORE_ID,
  POSTAL_CODE,
  SALES_CHANNEL,
  AFFILIATE_ID,
  STORE_NAME,
  SELLER_ID,
} from '../../constants'
import { IconGlovo } from '../../icons/IconGlovo'
import { countriesMap, countriesOptions } from '../../utils'
import { validateInputs } from '../../../common/utils'
import type { AddOrEditStore } from './Stores'
import GET_SELLERS from '../../graphql/getSellers.gql'

interface Props {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<AddOrEditStore>>
  saving: boolean
  store: StoreInfo | null
  addStore: (store: StoreInfo) => Promise<void>
  editStore: (store: StoreInfo) => Promise<void>
}

interface SelectOption {
  label: string
  value: string
}

interface Seller {
  id: string
  name: string
  isActive: boolean
}

const StoreModal = ({
  isOpen,
  setIsOpen,
  saving,
  store,
  addStore,
  editStore,
}: Props) => {
  const [error, setError] = useState(false)
  const [storeInfo, setStoreInfo] = useState({} as StoreInfo)
  const [sellers, setSellers] = useState<SelectOption[]>([])
  const [selectedSeller, setSelectedSeller] = useState<SelectOption | null>(
    null
  )

  const [selectedCountry, setSelectedCountry] = useState<SelectOption | null>(
    null
  )

  const {
    loading: loadingSellers,
    error: sellersError,
    data,
  } = useQuery(GET_SELLERS, {
    ssr: false,
  })

  useEffect(() => {
    if (!store) {
      setStoreInfo({
        ...storeInfo,
        id: createId(),
      })

      return
    }

    setSelectedCountry({
      label: countriesMap[store.country],
      value: store.country,
    })

    setStoreInfo(store)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store])

  useEffect(() => {
    if (loadingSellers || sellersError) {
      return
    }

    if (data) {
      const sellersInfo = data.sellers.items.reduce(
        (sellersOptions: SelectOption[], seller: Seller) => {
          if (seller.isActive) {
            sellersOptions.push({
              label: seller.name,
              value: seller.id,
            })

            return sellersOptions
          }

          return sellersOptions
        },
        []
      )

      setSellers(sellersInfo)
    }
  }, [loadingSellers, data, sellersError])

  const handleCloseModal = () => {
    setStoreInfo({} as StoreInfo)

    setIsOpen({
      isOpen: false,
      loading: false,
      store: null,
    })
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value =
      e.target.id === AFFILIATE_ID
        ? e.target.value.toUpperCase().replace(/[AEIOU0-9]/, '')
        : e.target.value

    setStoreInfo({
      ...storeInfo,
      [e.target.id]: value,
    })
  }

  const handleSelectCountry = (country: SelectOption) => {
    setStoreInfo({
      ...storeInfo,
      country: country.value,
    })

    setSelectedCountry(country)
  }

  const handleSelectSeller = (seller: SelectOption) => {
    setStoreInfo({
      ...storeInfo,
      sellerId: seller.value,
      sellerName: seller.label,
    })

    setSelectedSeller(seller)
  }

  const validate = () => {
    setIsOpen({
      isOpen: true,
      loading: true,
      store: storeInfo,
    })

    const validation = validateInputs({
      ...storeInfo,
    })

    if (!validation) {
      setError(true)

      return false
    }

    setError(false)

    return true
  }

  const handleAddStore = () => {
    if (validate()) {
      addStore(storeInfo)
    }

    setStoreInfo({} as StoreInfo)
    setSelectedCountry(null)
    setSelectedSeller(null)
  }

  const handleEditStore = () => {
    if (validate()) {
      editStore(storeInfo)
    }

    setStoreInfo({} as StoreInfo)
    setSelectedCountry(null)
    setSelectedSeller(null)
  }

  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal}>
      <div className="mt5">
        <div className="flex items-center">
          <IconGlovo size={60} />
          <h4 className="t-heading-4 ml4">
            <FormattedMessage id="admin/glovo-integration.modal.title" />
          </h4>
        </div>
        <div className="mb6">
          <p className="mb2">
            <FormattedMessage id="admin/glovo-integration.store-name" />
          </p>
          <Input
            id={STORE_NAME}
            label={
              <FormattedMessage id="admin/glovo-integration.modal.store-name.description" />
            }
            value={storeInfo.storeName}
            onChange={handleChange}
            errorMessage={
              error &&
              !storeInfo.storeName && (
                <FormattedMessage id="admin/glovo-integration.inputs.error-message" />
              )
            }
          />
        </div>

        <div className="mb6">
          <p className="mb2">
            {<FormattedMessage id="admin/glovo-integration.seller-id" />}
          </p>
          <Select
            id={SELLER_ID}
            label={
              <FormattedMessage id="admin/glovo-integration.modal.seller-id.description" />
            }
            value={selectedSeller}
            multi={false}
            options={sellers}
            onChange={handleSelectSeller}
            errorMessage={
              error &&
              !storeInfo.sellerId && (
                <FormattedMessage id="admin/glovo-integration.inputs.error-message" />
              )
            }
          />
        </div>

        <div className="mb6">
          <p className="mb2">
            {<FormattedMessage id="admin/glovo-integration.affiliate-id" />}
          </p>
          <Input
            id={AFFILIATE_ID}
            maxLength={3}
            label={
              <FormattedMessage id="admin/glovo-integration.modal.affiliate-id.description" />
            }
            value={storeInfo.affiliateId}
            onChange={handleChange}
            errorMessage={
              error &&
              !storeInfo.affiliateId && (
                <FormattedMessage id="admin/glovo-integration.inputs.error-message" />
              )
            }
          />
        </div>

        <div className="mb6">
          <p className="mb2">
            {<FormattedMessage id="admin/glovo-integration.sales-channel" />}
          </p>
          <Input
            id={SALES_CHANNEL}
            label={
              <FormattedMessage id="admin/glovo-integration.modal.sales-channel.description" />
            }
            value={storeInfo.salesChannel}
            onChange={handleChange}
            errorMessage={
              error &&
              !storeInfo.salesChannel && (
                <FormattedMessage id="admin/glovo-integration.inputs.error-message" />
              )
            }
          />
        </div>

        <div className="mb6">
          <p className="mb2">
            {<FormattedMessage id="admin/glovo-integration.postal-code" />}
          </p>
          <Input
            id={POSTAL_CODE}
            label={
              <FormattedMessage id="admin/glovo-integration.modal.postal-code.description" />
            }
            value={storeInfo.postalCode}
            onChange={handleChange}
            errorMessage={
              error &&
              !storeInfo.postalCode && (
                <FormattedMessage id="admin/glovo-integration.inputs.error-message" />
              )
            }
          />
        </div>

        <div className="mb6">
          <p className="mb2">
            {<FormattedMessage id="admin/glovo-integration.country" />}
          </p>
          <Select
            id={COUNTRY}
            label={
              <FormattedMessage id="admin/glovo-integration.modal.country.description" />
            }
            value={selectedCountry}
            multi={false}
            options={countriesOptions}
            onChange={handleSelectCountry}
            errorMessage={
              error &&
              !storeInfo.country && (
                <FormattedMessage id="admin/glovo-integration.inputs.error-message" />
              )
            }
          />
        </div>

        <div className="mb6">
          <p className="mb2">
            {<FormattedMessage id="admin/glovo-integration.glovo-store-id" />}
          </p>
          <Input
            label={
              <FormattedMessage id="admin/glovo-integration.modal.glovo-store-id.description" />
            }
            value={storeInfo.glovoStoreId}
            id={GLOVO_STORE_ID}
            onChange={handleChange}
            errorMessage={
              error &&
              !storeInfo.glovoStoreId && (
                <FormattedMessage id="admin/glovo-integration.inputs.error-message" />
              )
            }
          />
        </div>
      </div>
      <div className="flex justify-end mt8">
        <Button
          isLoading={saving}
          onClick={!store ? handleAddStore : handleEditStore}
          block
        >
          <FormattedMessage id="admin/glovo-integration.save" />
        </Button>
      </div>
    </Modal>
  )
}

export { StoreModal }
