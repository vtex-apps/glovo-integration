import type { FC } from 'react'
import React, { useEffect, useState } from 'react'
import { useMutation, useQuery } from 'react-apollo'
import type { InjectedIntlProps } from 'react-intl'
import { FormattedMessage } from 'react-intl'
import {
  ButtonWithIcon,
  Checkbox,
  Collapsible,
  InputPassword,
  Input,
  Layout,
  PageBlock,
  PageHeader,
  Table,
  Alert,
  ModalDialog,
  Button,
  Card,
} from 'vtex.styleguide'

import styles from './GlovoAdmin.css'
import Modal from './ModalGlovo'
import APP_SETTINGS from '../../graphql/appSettings.graphql'
import SAVE_APP_SETTINGS from '../../graphql/saveAppSettings.graphql'
import iconGlovo from '../../icons/GlovoLogo.png'
import IconAdd from '../../icons/IconAdd'
import IconDelete from '../../icons/IconDelete'
import IconEdit from '../../icons/IconEdit'
import type { SettingDataType, AffiliationType, TableItem } from '../../shared'
import {
  CORPORATE_NAME,
  DANGER,
  DOCUMENT,
  DOCUMENT_TYPE,
  EMAIL,
  FIRST_NAME,
  GLOVO_TOKEN,
  LAST_NAME,
  PHONE_NUMBER,
  PRIMARY,
  SECONDARY,
  SUCCESS,
  TYPE_EDIT,
  TYPE_NEW,
} from '../../constants'

const AdminPanel: FC<InjectedIntlProps> = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [cards, setCards] = useState([])
  const [alertConfig, setAlertConfig] = useState(false)
  const [alertAff, setAlertAff] = useState(false)
  const [itemDelete, setItemDelete] = useState('')
  const [alertDialog, setAlertDialog] = useState(false)
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [typeModal, setTypeModal] = useState(TYPE_NEW)
  const [fromMobile, setFromMobile] = useState(false)
  const [dataEdit, setDataEdit] = useState<AffiliationType>({
    id: '',
    nameAffiliation: '',
    storeId: '',
    salesChannel: '',
    pickupPoints: '',
    glovoId: '',
  })

  const [settingsState, setSettingsState] = useState<SettingDataType>({
    glovoToken: '',
    production: false,
    email: '',
    firstName: '',
    lastName: '',
    selectDocument: '',
    document: '',
    phoneNumber: '',
    corporateName: '',
    affiliation: [],
  })

  const [saveSettings] = useMutation(SAVE_APP_SETTINGS)

  const [msgError, setMsgError] = useState<{ [key: string]: any }>({
    token: '',
    email: '',
    firstName: '',
    lastName: '',
    typeDocument: '',
    document: '',
    phoneNumber: '',
    corporateName: '',
  })

  const changeIsOpen = () => {
    setIsOpenModal(!isOpenModal)
    setTypeModal(TYPE_NEW)
  }

  const { data } = useQuery(APP_SETTINGS, {
    variables: {
      version: process.env.VTEX_APP_VERSION,
    },
    ssr: false,
  })

  useEffect(() => {
    if (!data?.appSettings?.message || data.appSettings.message === '{}') return
    const parsedSettings = JSON.parse(data.appSettings.message)

    setSettingsState(parsedSettings)

    const cardMoviles = parsedSettings.affiliation.map(
      (affiliation: AffiliationType) => (
        <div key={affiliation.id} className="mb3">
          <Card>
            <div>
              <div>
                <p>
                  <b>
                    <FormattedMessage id="admin/glovo-integration.store-name" />
                    :
                  </b>{' '}
                  {affiliation.nameAffiliation}
                </p>
              </div>
              <div>
                <p>
                  <b>
                    <FormattedMessage id="admin/glovo-integration.sales-channel" />
                    :
                  </b>{' '}
                  {affiliation.salesChannel}
                </p>
              </div>
              <div>
                <p>
                  <b>
                    <FormattedMessage id="admin/glovo-integration.postal-code" />
                    :
                  </b>{' '}
                  {affiliation.pickupPoints}
                </p>
              </div>
              <div className="flex">
                <div className="w-100">
                  <div style={{ float: 'right' }}>
                    <ButtonWithIcon
                      icon={<IconEdit />}
                      variation={SECONDARY}
                      onClick={() => {
                        const getItem = parsedSettings.affiliation.find(
                          (item: AffiliationType) => item.id === affiliation.id
                        )

                        setTypeModal(TYPE_EDIT)
                        setIsOpenModal(true)
                        setFromMobile(true)
                        if (getItem) setDataEdit(getItem)
                      }}
                    />
                  </div>
                </div>
                <div className="ml5">
                  <ButtonWithIcon
                    icon={<IconDelete />}
                    variation={DANGER}
                    onClick={() => {
                      setFromMobile(true)
                      setAlertDialog(true)
                      setItemDelete(affiliation.id)
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      )
    )

    setCards(cardMoviles)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const changeValueAdmin = (e: { id: string; value: string }) => {
    if (e.id === GLOVO_TOKEN) {
      setSettingsState({ ...settingsState, glovoToken: e.value })
      setMsgError({ ...msgError, token: '' })
    } else if (e.id === EMAIL) {
      setSettingsState({ ...settingsState, email: e.value })
      setMsgError({ ...msgError, email: '' })
    } else if (e.id === FIRST_NAME) {
      setSettingsState({ ...settingsState, firstName: e.value })
      setMsgError({ ...msgError, firstName: '' })
    } else if (e.id === CORPORATE_NAME) {
      setSettingsState({ ...settingsState, corporateName: e.value })
      setMsgError({ ...msgError, corporateName: '' })
    } else if (e.id === DOCUMENT) {
      setSettingsState({ ...settingsState, document: e.value })
      setMsgError({ ...msgError, document: '' })
    } else if (e.id === LAST_NAME) {
      setSettingsState({ ...settingsState, lastName: e.value })
      setMsgError({ ...msgError, lastName: '' })
    } else if (e.id === PHONE_NUMBER) {
      setSettingsState({ ...settingsState, phoneNumber: e.value })
      setMsgError({ ...msgError, phoneNumber: '' })
    } else {
      setSettingsState({ ...settingsState, selectDocument: e.value })
    }
  }

  const validateInputs = () => {
    let validate = false

    if (!settingsState.glovoToken) {
      setMsgError({
        ...msgError,
        token: (
          <FormattedMessage id="admin/glovo-integration.field.config.token" />
        ),
      })
    } else if (!settingsState.email) {
      setMsgError({
        ...msgError,
        email: (
          <FormattedMessage id="admin/glovo-integration.field.config.email" />
        ),
      })
    } else if (!settingsState.firstName) {
      setMsgError({
        ...msgError,
        firstName: (
          <FormattedMessage id="admin/glovo-integration.field.config.first-name" />
        ),
      })
    } else if (!settingsState.lastName) {
      setMsgError({
        ...msgError,
        lastName: (
          <FormattedMessage id="admin/glovo-integration.field.config.last-name" />
        ),
      })
    } else if (!settingsState.selectDocument) {
      setMsgError({
        ...msgError,
        typeDocument: (
          <FormattedMessage id="admin/glovo-integration.field.config.document-type" />
        ),
      })
    } else if (!settingsState.document) {
      setMsgError({
        ...msgError,
        document: (
          <FormattedMessage id="admin/glovo-integration.field.config.document" />
        ),
      })
    } else if (!settingsState.phoneNumber) {
      setMsgError({
        ...msgError,
        phoneNumber: (
          <FormattedMessage id="admin/glovo-integration.field.config.phone-number" />
        ),
      })
    } else if (!settingsState.corporateName) {
      setMsgError({
        ...msgError,
        corporateName: (
          <FormattedMessage id="admin/glovo-integration.field.config.corporate-name" />
        ),
      })
    } else {
      validate = true
    }

    return validate
  }

  const bodySettings = (affiliationData: AffiliationType[]) => {
    return {
      glovoToken: settingsState.glovoToken,
      production: settingsState.production,
      email: settingsState.email,
      firstName: settingsState.firstName,
      lastName: settingsState.lastName,
      selectDocument: settingsState.selectDocument,
      document: settingsState.document,
      phoneNumber: settingsState.phoneNumber,
      corporateName: settingsState.corporateName,
      affiliation: affiliationData,
    }
  }

  const saveData = async (dataSettings: SettingDataType) => {
    await saveSettings({
      variables: {
        version: process.env.VTEX_APP_VERSION,
        settings: JSON.stringify(dataSettings),
      },
    }).then(() => {
      const validate =
        settingsState.affiliation.length !== dataSettings.affiliation.length

      setSettingsState(dataSettings)
      setAlertDialog(false)
      if (isOpenModal || validate) {
        setAlertAff(true)
        setTimeout(() => setAlertAff(false), 5000)
      } else {
        setAlertConfig(true)
        setTimeout(() => setAlertConfig(false), 5000)
      }

      setIsOpenModal(false)

      if (fromMobile) setTimeout(() => window.location.reload(), 2000)
    })
  }

  const handleSaveSettings = async () => {
    const getValidate = validateInputs()

    if (getValidate) {
      const settingsGlovo = bodySettings(settingsState.affiliation)

      saveData(settingsGlovo)
    }
  }

  const getDataModal = (settingBody: AffiliationType) => {
    const dataAffiliation = [...settingsState.affiliation]

    dataAffiliation.push(settingBody)

    setSettingsState({ ...settingsState, affiliation: dataAffiliation })
    const settingsGlovo = bodySettings(dataAffiliation)

    saveData(settingsGlovo)
  }

  const cellComponent = (e: TableItem) => {
    return (
      <div className="flex">
        <div>
          <ButtonWithIcon
            icon={<IconEdit />}
            variation={SECONDARY}
            onClick={() => {
              const getItem = settingsState.affiliation.find(
                (item) => item.id === e.rowData.id
              )

              setTypeModal(TYPE_EDIT)
              setIsOpenModal(true)
              setFromMobile(false)
              if (getItem) setDataEdit(getItem)
            }}
          />
        </div>
        <div>
          <ButtonWithIcon
            icon={<IconDelete />}
            variation={DANGER}
            onClick={() => {
              setAlertDialog(true)
              setFromMobile(false)
              setItemDelete(e.rowData.id)
            }}
          />
        </div>
      </div>
    )
  }

  const deleteAffiliation = () => {
    const tempDataDelete = [...settingsState.affiliation]

    const newData = tempDataDelete.filter((item) => item.id !== itemDelete)

    const settingsGlovo = bodySettings(newData)

    saveData(settingsGlovo)
  }

  const customSchema = {
    properties: {
      nameAffiliation: {
        title: <FormattedMessage id="admin/glovo-integration.store-name" />,
      },
      salesChannel: {
        title: <FormattedMessage id="admin/glovo-integration.sales-channel" />,
      },
      pickupPoints: {
        title: <FormattedMessage id="admin/glovo-integration.postal-code" />,
      },
      actions: {
        title: <FormattedMessage id="admin/glovo-integration.table.actions" />,
        cellRenderer: (e: TableItem) => cellComponent(e),
      },
    },
  }

  const editData = (itemEdit: AffiliationType) => {
    const tempData = [...settingsState.affiliation]

    tempData.map((item) => {
      if (item.id === itemEdit.id) {
        item.nameAffiliation = itemEdit.nameAffiliation
        item.storeId = itemEdit.storeId
        item.salesChannel = itemEdit.salesChannel
        item.pickupPoints = itemEdit.pickupPoints
        item.glovoId = itemEdit.glovoId
      }

      return item
    })

    const settingsGlovo = bodySettings(tempData)

    saveData(settingsGlovo)
  }

  return (
    <Layout fullWidth pageHeader={<PageHeader title="Glovo Settings" />}>
      <Modal
        isOpen={isOpenModal}
        changeIsOpen={changeIsOpen}
        type={typeModal}
        saveData={getDataModal}
        editData={editData}
        affiliation={dataEdit}
      />
      <div className={styles.tableDesktop}>
        <PageBlock>
          <div style={{ height: '500px' }}>
            <img src={iconGlovo} style={{ width: '80px' }} alt="" />
            <div style={{ float: 'right' }} className="mb5">
              <ButtonWithIcon
                icon={<IconAdd />}
                variation={SECONDARY}
                onClick={() => {
                  setIsOpenModal(true)
                  setFromMobile(false)
                  setTypeModal(TYPE_NEW)
                }}
              >
                <FormattedMessage id="admin/glovo-integration.add-more" />
              </ButtonWithIcon>
            </div>
            <ModalDialog
              centered
              confirmation={{
                onClick: () => deleteAffiliation(),
                label: (
                  <FormattedMessage id="admin/glovo-integration.delete-store-dialog.confirmation" />
                ),
                isDangerous: true,
              }}
              cancelation={{
                onClick: () => setAlertDialog(false),
                label: (
                  <FormattedMessage id="admin/glovo-integration.delete-store-dialog.cancel" />
                ),
              }}
              isOpen={alertDialog}
              onClose={() => setAlertDialog(false)}
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
            <div className="mb4">
              {alertAff ? (
                <div className="mb2">
                  <Alert
                    type={SUCCESS}
                    onClose={() => {
                      setAlertAff(false)
                    }}
                  >
                    <FormattedMessage id="admin/glovo-integration.alert.success" />
                  </Alert>
                </div>
              ) : (
                <div />
              )}
            </div>
            <Table
              schema={customSchema}
              items={settingsState.affiliation}
              fullWidth
            />
          </div>
        </PageBlock>
      </div>
      <div className={styles.cardMobile}>
        <div className="flex mb5">
          <img src={iconGlovo} style={{ width: '80px' }} alt="" />
          <div className="mb5 mt5 w-100">
            <div style={{ float: 'right', marginRight: '10px' }}>
              <ButtonWithIcon
                variation={PRIMARY}
                onClick={() => {
                  setIsOpenModal(true)
                  setFromMobile(true)
                  setTypeModal(TYPE_NEW)
                }}
              >
                <FormattedMessage id="admin/glovo-integration.add-more" />
              </ButtonWithIcon>
            </div>
          </div>
        </div>
        <div className="mb4">
          {alertAff ? (
            <div className="mb2">
              <Alert
                type={SUCCESS}
                onClose={() => {
                  setAlertAff(false)
                }}
              >
                <FormattedMessage id="admin/glovo-integration.alert.success" />
              </Alert>
            </div>
          ) : (
            <div />
          )}
        </div>
        {settingsState.affiliation.length <= 0 ? (
          <Card>
            {' '}
            <p style={{ textAlign: 'center' }}>
              <FormattedMessage id="admin/glovo-integration.table.empty" />
            </p>{' '}
          </Card>
        ) : (
          cards
        )}
      </div>
      <div className="mt4">
        <Collapsible
          header={
            <span className="c-action-primary hover-c-action-primary fw5">
              <FormattedMessage id="admin/glovo-integration.collapsible.header" />
            </span>
          }
          onClick={() => setIsOpen(!isOpen)}
          isOpen={isOpen}
        >
          <div className="mb9 mt6">
            {alertConfig ? (
              <div className="mb2">
                <Alert
                  type={SUCCESS}
                  onClose={() => {
                    setAlertConfig(false)
                  }}
                >
                  <FormattedMessage id="admin/glovo-integration.alert.success" />
                  ,
                </Alert>
              </div>
            ) : (
              <div />
            )}
            <PageBlock variation="half">
              <div style={{ height: '568px' }}>
                <h2>
                  <FormattedMessage id="admin/glovo-integration.integration-settings.title" />
                </h2>
                <p
                  style={{
                    color: '#979899',
                    marginTop: '0',
                    fontStyle: 'italic',
                  }}
                >
                  <FormattedMessage id="admin/glovo-integration.integration-settings.subtitle" />
                </p>

                <div className="mt10">
                  <p>
                    <FormattedMessage id="admin/glovo-integration.integration-settings.glovo-token" />
                  </p>
                  <InputPassword
                    id={GLOVO_TOKEN}
                    value={settingsState.glovoToken}
                    label={
                      <FormattedMessage id="admin/glovo-integration.integration-settings.glovo-token.description" />
                    }
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      changeValueAdmin({
                        id: e.target.id,
                        value: e.target.value,
                      })
                    }
                    errorMessage={msgError.token}
                  />
                </div>
                <div className="mt7">
                  <p
                    style={{
                      color: '#979899',
                      marginTop: '0',
                      fontStyle: 'italic',
                    }}
                  >
                    <FormattedMessage id="admin/glovo-integration.integration-settings.production.description" />
                  </p>
                  <Checkbox
                    checked={settingsState.production}
                    id="option-0"
                    label={
                      <FormattedMessage id="admin/glovo-integration.integration-settings.production.label" />
                    }
                    name="production"
                    value="option-0"
                    onChange={() =>
                      setSettingsState({
                        ...settingsState,
                        production: !settingsState.production,
                      })
                    }
                  />
                </div>
              </div>
              <div style={{ height: '568px' }}>
                <h2>
                  <FormattedMessage id="admin/glovo-integration.client-info.title" />
                </h2>
                <p
                  style={{
                    color: '#979899',
                    marginTop: '0',
                    fontStyle: 'italic',
                  }}
                >
                  <FormattedMessage id="admin/glovo-integration.client-info.subtitle" />
                </p>
                <div className="mt7">
                  <Input
                    id={EMAIL}
                    value={settingsState.email}
                    label={
                      <FormattedMessage id="admin/glovo-integration.client-info.email" />
                    }
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      changeValueAdmin({
                        id: e.target.id,
                        value: e.target.value,
                      })
                    }
                    errorMessage={msgError.email}
                  />
                  <div className="flex">
                    <div className="w-50 pr5 pt5">
                      <Input
                        id={FIRST_NAME}
                        value={settingsState.firstName}
                        label={
                          <FormattedMessage id="admin/glovo-integration.client-info.first-name" />
                        }
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          changeValueAdmin({
                            id: e.target.id,
                            value: e.target.value,
                          })
                        }
                        errorMessage={msgError.firstName}
                      />
                    </div>
                    <div className="w-50 pt5">
                      <Input
                        id={LAST_NAME}
                        value={settingsState.lastName}
                        label={
                          <FormattedMessage id="admin/glovo-integration.client-info.last-name" />
                        }
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          changeValueAdmin({
                            id: e.target.id,
                            value: e.target.value,
                          })
                        }
                        errorMessage={msgError.lastName}
                      />
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-50 pr5 pt5">
                      <Input
                        id={DOCUMENT_TYPE}
                        value={settingsState.selectDocument}
                        label={
                          <FormattedMessage id="admin/glovo-integration.client-info.document-type" />
                        }
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          changeValueAdmin({
                            id: e.target.id,
                            value: e.target.value,
                          })
                        }
                        errorMessage={msgError.lastName}
                      />
                    </div>
                    <div className="w-50 pt5">
                      <Input
                        id={DOCUMENT}
                        value={settingsState.document}
                        label={
                          <FormattedMessage id="admin/glovo-integration.client-info.document" />
                        }
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          changeValueAdmin({
                            id: e.target.id,
                            value: e.target.value,
                          })
                        }
                        errorMessage={msgError.document}
                      />
                    </div>
                  </div>
                  <div className="pt5">
                    <Input
                      id={PHONE_NUMBER}
                      value={settingsState.phoneNumber}
                      label={
                        <FormattedMessage id="admin/glovo-integration.client-info.phone-number" />
                      }
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        changeValueAdmin({
                          id: e.target.id,
                          value: e.target.value,
                        })
                      }
                      errorMessage={msgError.phoneNumber}
                    />
                  </div>
                  <div className="pt5">
                    <Input
                      id={CORPORATE_NAME}
                      value={settingsState.corporateName}
                      label={
                        <FormattedMessage id="admin/glovo-integration.client-info.corporate-name" />
                      }
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        changeValueAdmin({
                          id: e.target.id,
                          value: e.target.value,
                        })
                      }
                      errorMessage={msgError.corporateName}
                    />
                  </div>
                </div>
                <div className="mt5" style={{ float: 'right' }}>
                  <Button
                    variation={PRIMARY}
                    onClick={() => handleSaveSettings()}
                  >
                    {<FormattedMessage id="admin/glovo-integration.save" />}
                  </Button>
                </div>
              </div>
            </PageBlock>
          </div>
        </Collapsible>
      </div>
    </Layout>
  )
}

export { AdminPanel }
