import type { FC } from 'react'
import React, { useEffect, useState } from 'react'
import { useMutation, useQuery } from 'react-apollo'
import type { InjectedIntlProps } from 'react-intl'
import { injectIntl } from 'react-intl'
import { formatIOMessage } from 'vtex.native-types'
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

import Modal from './components/ModalGlovo'
import APP_SETTINGS from './graphql/appSettings.graphql'
import SAVE_APP_SETTINGS from './graphql/saveAppSettings.graphql'
import iconGlovo from './icons/icon.png'
import IconAdd from './icons/IconAdd'
import IconDelete from './icons/IconDelete'
import IconEdit from './icons/IconEdit'
import { messageUI, NameFields } from './shared'
import type { SettingDataType, AffiliationType, TableItem } from './shared'

const GlovoAdmin: FC<InjectedIntlProps> = ({ intl }) => {
  const edit = <IconEdit />
  const deleteItem = <IconDelete />
  const add = <IconAdd />

  const [isOpen, setIsOpen] = useState(false)
  const [cards, setCards] = useState([])
  const [alertConfig, setAlertConfig] = useState(false)
  const [alertAff, setAlertAff] = useState(false)
  const [itemDelete, setItemDelete] = useState('')
  const [alertDialog, setAlertDialog] = useState(false)
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [typeModal, setTypeModal] = useState(NameFields.TYPENEW)
  const [fromMobile, setFromMobile] = useState(false)
  const [dataEdit, setDataEdit] = useState<AffiliationType>({
    id: '',
    nameAffiliation: '',
    idAffiliation: '',
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

  const [msgError, setMsgError] = useState({
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
    setTypeModal(NameFields.TYPENEW)
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

    const cardMoviles = parsedSettings.affiliation.map((affiliation: AffiliationType) => (
      <div key={affiliation.id} className='mb3'>
        <Card> 
          <div>
            <div><p><b>{formatIOMessage({
              id: messageUI.affiliationName.id,
              intl,
            }).toString()} :</b> {affiliation.nameAffiliation}</p></div>
            <div><p><b>{formatIOMessage({
              id: messageUI.salesChannel.id,
              intl,
            }).toString()} :</b> {affiliation.salesChannel}</p></div>
            <div><p><b>{formatIOMessage({
              id: messageUI.pickupPoints.id,
              intl,
            }).toString()} :</b> {affiliation.pickupPoints}</p></div>
            <div className='flex'>
              <div className='w-100'>
                <div style={{float:'right'}}>
                  <ButtonWithIcon
                    icon={edit}
                    variation={NameFields.SECONDARY}
                    onClick={() => {
                      const getItem = parsedSettings.affiliation.find(
                        (item: AffiliationType) => item.id === affiliation.id
                      )
        
                      setTypeModal(NameFields.TYPEDIT)
                      setIsOpenModal(true)
                      setFromMobile(true)
                      if (getItem) setDataEdit(getItem)
                    }}
                  />
                </div>
              </div>
              <div className='ml5'>
                <ButtonWithIcon
                  icon={deleteItem}
                  variation={NameFields.DANGER}
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
    ))

    setCards(cardMoviles)

  }, [data])

  const changeValueAdmin = (e: { id: string; value: string }) => {
    if (e.id === NameFields.GLOVOTOKEN) {
      setSettingsState({ ...settingsState, glovoToken: e.value })
      setMsgError({ ...msgError, token: '' })
    } else if (e.id === NameFields.EMAIL) {
      setSettingsState({ ...settingsState, email: e.value })
      setMsgError({ ...msgError, email: '' })
    } else if (e.id === NameFields.FIRSTNAME) {
      setSettingsState({ ...settingsState, firstName: e.value })
      setMsgError({ ...msgError, firstName: '' })
    } else if (e.id === NameFields.CORPORATENAME) {
      setSettingsState({ ...settingsState, corporateName: e.value })
      setMsgError({ ...msgError, corporateName: '' })
    } else if (e.id === NameFields.DOCUMENT) {
      setSettingsState({ ...settingsState, document: e.value })
      setMsgError({ ...msgError, document: '' })
    } else if (e.id === NameFields.LASTNAME) {
      setSettingsState({ ...settingsState, lastName: e.value })
      setMsgError({ ...msgError, lastName: '' })
    } else if (e.id === NameFields.PHONENUMBER) {
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
        token: formatIOMessage({
          id: messageUI.fieldToken.id,
          intl,
        }).toString(),
      })
    } else if (!settingsState.email) {
      setMsgError({
        ...msgError,
        email: formatIOMessage({
          id: messageUI.fieldEmail.id,
          intl,
        }).toString(),
      })
    } else if (!settingsState.firstName) {
      setMsgError({
        ...msgError,
        firstName: formatIOMessage({
          id: messageUI.fieldName.id,
          intl,
        }).toString(),
      })
    } else if (!settingsState.lastName) {
      setMsgError({
        ...msgError,
        lastName: formatIOMessage({
          id: messageUI.fieldLast.id,
          intl,
        }).toString(),
      })
    } else if (!settingsState.selectDocument) {
      setMsgError({
        ...msgError,
        typeDocument: formatIOMessage({
          id: messageUI.fieldDocumentType.id,
          intl,
        }).toString(),
      })
    } else if (!settingsState.document) {
      setMsgError({
        ...msgError,
        document: formatIOMessage({
          id: messageUI.fieldDocument.id,
          intl,
        }).toString(),
      })
    } else if (!settingsState.phoneNumber) {
      setMsgError({
        ...msgError,
        phoneNumber: formatIOMessage({
          id: messageUI.fieldNumber.id,
          intl,
        }).toString(),
      })
    } else if (!settingsState.corporateName) {
      setMsgError({
        ...msgError,
        corporateName: formatIOMessage({
          id: messageUI.fieldCorporate.id,
          intl,
        }).toString(),
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
      const validate = settingsState.affiliation.length !== dataSettings.affiliation.length
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

      if(fromMobile) setTimeout(() => window.location.reload(), 2000)
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
            icon={edit}
            variation={NameFields.SECONDARY}
            onClick={() => {
              const getItem = settingsState.affiliation.find(
                (item) => item.id === e.rowData.id
              )

              setTypeModal(NameFields.TYPEDIT)
              setIsOpenModal(true)
              setFromMobile(false)
              if (getItem) setDataEdit(getItem)
            }}
          />
        </div>
        <div>
          <ButtonWithIcon
            icon={deleteItem}
            variation={NameFields.DANGER}
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
        title: formatIOMessage({
          id: messageUI.affiliationName.id,
          intl,
        }).toString(),
      },
      salesChannel: {
        title: formatIOMessage({
          id: messageUI.salesChannel.id,
          intl,
        }).toString(),
      },
      pickupPoints: {
        title: formatIOMessage({
          id: messageUI.pickupPoints.id,
          intl,
        }).toString(),
      },
      actions: {
        title: formatIOMessage({
          id: messageUI.actions.id,
          intl,
        }).toString(),
        cellRenderer: (e: TableItem) => cellComponent(e),
      },
    },
  }

  const editData = (itemEdit: AffiliationType) => {
    const tempData = [...settingsState.affiliation]

    tempData.map((item) => {
      if (item.id === itemEdit.id) {
        item.nameAffiliation = itemEdit.nameAffiliation
        item.idAffiliation = itemEdit.idAffiliation
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
                icon={add}
                variation={NameFields.SECONDARY}
                onClick={() => {
                  setIsOpenModal(true)
                  setFromMobile(false)
                  setTypeModal(NameFields.TYPENEW)
                }}
              >
                {formatIOMessage({
                  id: messageUI.addMore.id,
                  intl,
                }).toString()}
              </ButtonWithIcon>
            </div>
            <ModalDialog
              centered
              confirmation={{
                onClick: () => deleteAffiliation(),
                label: formatIOMessage({
                  id: messageUI.dialogConfirmation.id,
                  intl,
                }).toString(),
                isDangerous: true,
              }}
              cancelation={{
                onClick: () => setAlertDialog(false),
                label: formatIOMessage({
                  id: messageUI.dialogCancel.id,
                  intl,
                }).toString(),
              }}
              isOpen={alertDialog}
              onClose={() => setAlertDialog(false)}
            >
              <div className="">
                <p className="f3 f3-ns fw3 gray">
                  {formatIOMessage({
                    id: messageUI.dialogTitle.id,
                    intl,
                  }).toString()}
                </p>
                <p>
                  {formatIOMessage({
                    id: messageUI.dialogSubtitle.id,
                    intl,
                  }).toString()}
                </p>
              </div>
            </ModalDialog>
            <div className="mb4">
              {alertAff ? (
                <div className="mb2">
                  <Alert
                    type={NameFields.SUCCESS}
                    onClose={() => {
                      setAlertAff(false)
                    }}
                  >
                    {formatIOMessage({
                      id: messageUI.alertSuccess.id,
                      intl,
                    }).toString()}
                  </Alert>
                </div>
              ) : (
                <div />
              )}
            </div>
            <Table schema={customSchema} items={settingsState.affiliation} fullWidth={true}/>
          </div>
        </PageBlock>
      </div>
      <div className={styles.cardMobile}>
        <div className='flex mb5'>
          <img src={iconGlovo} style={{ width: '80px' }} alt="" />
          <div className="mb5 mt5 w-100">
            <div style={{ float: 'right' ,marginRight: '10px' }}>
              <ButtonWithIcon
                variation={NameFields.PRIMARY}
                onClick={() => {
                  setIsOpenModal(true)
                  setFromMobile(true)
                  setTypeModal(NameFields.TYPENEW)
                }}
              >
                {formatIOMessage({
                  id: messageUI.addMore.id,
                  intl,
                }).toString()}
              </ButtonWithIcon>
            </div>
          </div>
        </div>
        <div className="mb4">
          {alertAff ? (
            <div className="mb2">
              <Alert
                type={NameFields.SUCCESS}
                onClose={() => {
                  setAlertAff(false)
                }}
              >
                {formatIOMessage({
                  id: messageUI.alertSuccess.id,
                  intl,
                }).toString()}
              </Alert>
            </div>
          ) : (
            <div />
          )}
        </div>
        {settingsState.affiliation.length <= 0 ? <Card> <p style={{textAlign: 'center'}}>{formatIOMessage({
                  id: messageUI.emptyData.id,
                  intl,
                }).toString()}</p> </Card> :cards}
      </div>
      <div className="mt4">
        <Collapsible
          header={
            <span className="c-action-primary hover-c-action-primary fw5">
              {formatIOMessage({
                id: messageUI.configuration.id,
                intl,
              }).toString()}
            </span>
          }
          onClick={() => setIsOpen(!isOpen)}
          isOpen={isOpen}
        >
          <div className="mb9 mt6">
            {alertConfig ? (
              <div className="mb2">
                <Alert
                  type={NameFields.SUCCESS}
                  onClose={() => {
                    setAlertConfig(false)
                  }}
                >
                  {formatIOMessage({
                    id: messageUI.alertSuccess.id,
                    intl,
                  }).toString()}
                </Alert>
              </div>
            ) : (
              <div />
            )}
            <PageBlock variation="half">
              <div style={{ height: '568px' }}>
                <h2>
                  {formatIOMessage({
                    id: messageUI.settings.id,
                    intl,
                  }).toString()}
                </h2>
                <p
                  style={{
                    color: '#979899',
                    marginTop: '0',
                    fontStyle: 'italic',
                  }}
                >
                  {formatIOMessage({
                    id: messageUI.integrationSettings.id,
                    intl,
                  }).toString()}
                </p>

                <div className="mt10">
                  <p>
                    {formatIOMessage({
                      id: messageUI.glovoToken.id,
                      intl,
                    }).toString()}
                  </p>
                  <InputPassword
                    id={NameFields.GLOVOTOKEN}
                    value={settingsState.glovoToken}
                    label={formatIOMessage({
                      id: messageUI.subtitleSettings.id,
                      intl,
                    }).toString()}
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
                    {formatIOMessage({
                      id: messageUI.infoSettings.id,
                      intl,
                    }).toString()}
                  </p>
                  <Checkbox
                    checked={settingsState.production}
                    id="option-0"
                    label={formatIOMessage({
                      id: messageUI.checkbox.id,
                      intl,
                    }).toString()}
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
                  {formatIOMessage({
                    id: messageUI.titleInformation.id,
                    intl,
                  }).toString()}
                </h2>
                <p
                  style={{
                    color: '#979899',
                    marginTop: '0',
                    fontStyle: 'italic',
                  }}
                >
                  {formatIOMessage({
                    id: messageUI.infoGlovo.id,
                    intl,
                  }).toString()}
                </p>
                <div className="mt7">
                  <Input
                    id={NameFields.EMAIL}
                    value={settingsState.email}
                    label={formatIOMessage({
                      id: messageUI.email.id,
                      intl,
                    }).toString()}
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
                        id={NameFields.FIRSTNAME}
                        value={settingsState.firstName}
                        label={formatIOMessage({
                          id: messageUI.firstName.id,
                          intl,
                        }).toString()}
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
                        id={NameFields.LASTNAME}
                        value={settingsState.lastName}
                        label={formatIOMessage({
                          id: messageUI.lastName.id,
                          intl,
                        }).toString()}
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
                        id={NameFields.TYPEDOCUMENT}
                        value={settingsState.selectDocument}
                        label={formatIOMessage({
                          id: messageUI.typeDocument.id,
                          intl,
                        }).toString()}
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
                        id={NameFields.DOCUMENT}
                        value={settingsState.document}
                        label={formatIOMessage({
                          id: messageUI.document.id,
                          intl,
                        }).toString()}
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
                      id={NameFields.PHONENUMBER}
                      value={settingsState.phoneNumber}
                      label={formatIOMessage({
                        id: messageUI.phoneNumber.id,
                        intl,
                      }).toString()}
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
                      id={NameFields.CORPORATENAME}
                      value={settingsState.corporateName}
                      label={formatIOMessage({
                        id: messageUI.corporateName.id,
                        intl,
                      }).toString()}
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
                    variation={NameFields.PRIMARY}
                    onClick={() => handleSaveSettings()}
                  >
                    {formatIOMessage({
                      id: messageUI.save.id,
                      intl,
                    }).toString()}
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

export default injectIntl(GlovoAdmin)
