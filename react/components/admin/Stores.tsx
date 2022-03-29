import type { FC } from 'react'
import React, { useState, Fragment } from 'react'
import { FormattedMessage } from 'react-intl'
import { ButtonWithIcon, ModalDialog, PageBlock, Table } from 'vtex.styleguide'

import { SECONDARY } from '../../constants'
import { IconGlovo } from '../../icons/IconGlovo'
import { IconAdd } from '../../icons/IconAdd'
import { countries } from '../../utils'
import { StoreModal } from './StoreModal'
import type { AlertProps } from './AlertBanner'
import { AlertBanner } from './AlertBanner'
import type { SettingsSection } from '../../typings/settingsSections'

interface ModifyStore {
  isOpen: boolean
  loading: boolean
}

interface RemoveStore extends ModifyStore {
  storeId: string
}

export interface AddOrEditStore extends ModifyStore {
  store: StoreInfo | null
}

const Stores: FC<SettingsSection> = ({ settings, saveSettings }) => {
  const [addOrEditStore, setAddOrEditStore] = useState<AddOrEditStore>({
    isOpen: false,
    loading: false,
    store: null,
  })

  const [removeStore, setRemoveStore] = useState<RemoveStore>({
    isOpen: false,
    loading: false,
    storeId: '',
  })

  const [alert, setAlert] = useState<AlertProps>({
    show: false,
    type: 'success',
  })

  const handleOpenStoreModal = () => {
    setAddOrEditStore({
      ...addOrEditStore,
      isOpen: true,
      store: null,
    })
  }

  const handleCloseRemoveStoreDialog = () => {
    setRemoveStore({
      isOpen: false,
      loading: false,
      storeId: '',
    })
  }

  const updateSettings = async (storesConfig: StoreInfo[]) => {
    const successfulUpdate = await saveSettings({
      ...settings,
      storesConfig,
    })

    if (!successfulUpdate) {
      setAlert({
        show: true,
        type: 'error',
      })

      return
    }

    setAlert({
      show: true,
      type: 'success',
    })
  }

  const handleAddStore = async (store: StoreInfo) => {
    const updatedStores = [...settings.storesConfig, store]

    updateSettings(updatedStores)

    setAddOrEditStore({
      ...addOrEditStore,
      isOpen: false,
    })
  }

  const handleEditStore = async (editedStore: StoreInfo) => {
    const filteredStores = settings.storesConfig.filter(
      ({ id }: StoreInfo) => id !== editedStore.id
    )

    const updatedStores = [...filteredStores, editedStore]

    updateSettings(updatedStores)

    setAddOrEditStore({
      isOpen: false,
      loading: false,
      store: null,
    })
  }

  const handleRemoveStore = async () => {
    setRemoveStore({
      ...removeStore,
      loading: true,
    })

    const updatedStores = settings.storesConfig.filter(
      (store: StoreInfo) => store.id !== removeStore.storeId
    )

    if (updatedStores.length === settings.storesConfig.length) {
      setAlert({
        show: true,
        type: 'error',
      })
    }

    updateSettings(updatedStores)

    setRemoveStore({
      isOpen: false,
      loading: false,
      storeId: '',
    })
  }

  const schema = {
    properties: {
      storeName: {
        title: <FormattedMessage id="admin/glovo-integration.store-name" />,
      },
      affiliateId: {
        title: <FormattedMessage id="admin/glovo-integration.affiliate-id" />,
      },
      salesChannel: {
        title: <FormattedMessage id="admin/glovo-integration.sales-channel" />,
      },
      glovoStoreId: {
        title: <FormattedMessage id="admin/glovo-integration.glovo-store-id" />,
      },
      postalCode: {
        title: <FormattedMessage id="admin/glovo-integration.postal-code" />,
      },
      country: {
        title: <FormattedMessage id="admin/glovo-integration.country" />,
        cellRenderer: ({ cellData }: TableItem) => {
          const country = countries.find(({ value }) => value === cellData)

          return country?.label
        },
      },
    },
  }

  const lineActions = [
    {
      label: () => (
        <FormattedMessage id="admin/glovo-integration.table.edit-store" />
      ),
      onClick: ({ rowData: store }: TableItem) => {
        setAddOrEditStore({
          ...addOrEditStore,
          isOpen: true,
          store,
        })
      },
    },
    {
      label: () => (
        <FormattedMessage id="admin/glovo-integration.table.remove-store" />
      ),
      isDangerous: true,
      onClick: ({ rowData: { id } }: TableItem) => {
        setRemoveStore({
          ...removeStore,
          isOpen: true,
          storeId: id,
        })
      },
    },
  ]

  return (
    <Fragment>
      <StoreModal
        isOpen={addOrEditStore.isOpen}
        setIsOpen={setAddOrEditStore}
        saving={addOrEditStore.loading}
        store={addOrEditStore.store}
        addStore={handleAddStore}
        editStore={handleEditStore}
      />

      <ModalDialog
        centered
        loading={removeStore.loading}
        isOpen={removeStore.isOpen}
        onClose={handleCloseRemoveStoreDialog}
        confirmation={{
          onClick: handleRemoveStore,
          label: (
            <FormattedMessage id="admin/glovo-integration.delete-store-dialog.confirmation" />
          ),
          isDangerous: true,
        }}
        cancelation={{
          onClick: handleCloseRemoveStoreDialog,
          label: (
            <FormattedMessage id="admin/glovo-integration.delete-store-dialog.cancel" />
          ),
        }}
      >
        <div className="">
          <p className="f3 f3-ns fw3 gray">
            <FormattedMessage id="admin/glovo-integration.delete-store-dialog.title" />
          </p>
          <p>
            <FormattedMessage id="admin/glovo-integration.delete-store-dialog.subtitle" />
          </p>
        </div>
      </ModalDialog>

      <AlertBanner show={alert.show} type={alert.type} onClose={setAlert} />

      <PageBlock>
        <div style={{ minHeight: '300px' }}>
          <div className="flex justify-between items-center">
            <IconGlovo />
            <div className="mb5">
              <ButtonWithIcon
                icon={<IconAdd />}
                variation={SECONDARY}
                onClick={handleOpenStoreModal}
              >
                <FormattedMessage id="admin/glovo-integration.add-more" />
              </ButtonWithIcon>
            </div>
          </div>

          <Table
            schema={schema}
            items={settings.storesConfig}
            lineActions={lineActions}
            fullWidth
            emptyStateLabel=""
            emptyStateChildren={
              <div className="">
                <h4 className="t-heading-4 pt8">
                  <FormattedMessage id="admin/glovo-integration.table.empty" />
                </h4>
              </div>
            }
          />
        </div>
      </PageBlock>
    </Fragment>
  )
}

export { Stores }
