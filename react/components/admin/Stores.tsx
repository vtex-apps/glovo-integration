import type { FC } from 'react'
import React, { useState, Fragment } from 'react'
import { FormattedMessage } from 'react-intl'
import { ButtonWithIcon, ModalDialog, IconPlusLines } from 'vtex.styleguide'

import { IconGlovo } from '../../icons/IconGlovo'
import { StoreModal } from './StoreModal'
import type { AlertProps } from './AlertBanner'
import { AlertBanner } from './AlertBanner'
import type { SettingsSection } from '../../typings/settingsSections'
import { StoreTable } from './StoresTable'

interface ModifyStore {
  isOpen: boolean
  loading: boolean
}

export interface RemoveStore extends ModifyStore {
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

  const updateSettings = async (stores: StoreInfo[]) => {
    const successfulUpdate = await saveSettings({
      ...settings,
      stores,
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
    const updatedStores = [...settings.stores, store]

    updateSettings(updatedStores)

    setAddOrEditStore({
      ...addOrEditStore,
      isOpen: false,
    })
  }

  const handleEditStore = async (editedStore: StoreInfo) => {
    const filteredStores = settings.stores.filter(
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

    const updatedStores = settings.stores.filter(
      (store: StoreInfo) => store.id !== removeStore.storeId
    )

    if (updatedStores.length === settings.stores.length) {
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
        <div>
          <p className="f3 f3-ns fw3 gray">
            <FormattedMessage id="admin/glovo-integration.delete-store-dialog.title" />
          </p>
          <p>
            <FormattedMessage id="admin/glovo-integration.delete-store-dialog.subtitle" />
          </p>
        </div>
      </ModalDialog>

      <AlertBanner show={alert.show} type={alert.type} onClose={setAlert} />

      <div>
        <div className="flex justify-between items-center">
          <IconGlovo />
          <ButtonWithIcon
            icon={<IconPlusLines />}
            onClick={handleOpenStoreModal}
          >
            <FormattedMessage id="admin/glovo-integration.add-more" />
          </ButtonWithIcon>
        </div>

        <StoreTable
          items={settings.stores}
          addOrEditStore={addOrEditStore}
          setAddOrEditStore={setAddOrEditStore}
          removeStore={removeStore}
          setRemoveStore={setRemoveStore}
        />
      </div>
    </Fragment>
  )
}

export { Stores }
