import type { FC } from 'react'
import React, { useState, useEffect } from 'react'
import type { InjectedIntlProps } from 'react-intl'
import { injectIntl } from 'react-intl'
import { formatIOMessage } from 'vtex.native-types'
import { Button, Input, Modal } from 'vtex.styleguide'
import { v4 as uuidv4 } from 'uuid'

import iconGlovo from '../icons/icon.png'
import { messageUI, NameFields } from '../shared'
import type { AffiliationType } from '../shared'

interface ModalGlovoProps {
  isOpen: boolean
  changeIsOpen: () => void
  type: string
  saveData: (settingBody: AffiliationType) => void
  editData: (settingBody: AffiliationType) => void
  affiliation: AffiliationType
}

const ModalGlovo: FC<ModalGlovoProps & InjectedIntlProps> = (props) => {
  const [idEdit, setIdEdit] = useState('')
  const [nameAffiliation, setNameAffiliation] = useState('')
  const [idAffiliation, setIdAffiliation] = useState('')
  const [salesChannel, setSalesChannel] = useState('')
  const [pickupPoints, setPickupPoints] = useState('')
  const [glovoId, setGlovoId] = useState('')

  const [msgError, setMsgError] = useState({
    id: '',
    affiliationName: '',
    storeId: '',
    salesChannel: '',
    pickupPoints: '',
    glovoId: '',
  })

  const changeValueInput = (e: { id: string; value: string }) => {
    if (e.id === NameFields.NAMEAFFILIATION) {
      setNameAffiliation(e.value)
      setMsgError({ ...msgError, affiliationName: '' })
    } else if (e.id === NameFields.IDAFFILIATION) {
      setIdAffiliation(e.value)
      setMsgError({ ...msgError, storeId: '' })
    } else if (e.id === NameFields.SALESCHANNEL) {
      setSalesChannel(e.value)
      setMsgError({ ...msgError, salesChannel: '' })
    } else if (e.id === NameFields.PICKUPPOINTS) {
      setPickupPoints(e.value)
      setMsgError({ ...msgError, pickupPoints: '' })
    } else {
      setGlovoId(e.value)
      setMsgError({ ...msgError, glovoId: '' })
    }
  }

  const dataModalSave = (idItem: string) => {
    return {
      id: idItem,
      nameAffiliation,
      idAffiliation,
      salesChannel,
      pickupPoints,
      glovoId,
    }
  }

  const validateInputs = () => {
    if (!nameAffiliation) {
      setMsgError({
        ...msgError,
        affiliationName: formatIOMessage({
          id: messageUI.fieldModalName.id,
          intl: props.intl,
        }).toString(),
      })
    } else if (!idAffiliation) {
      setMsgError({
        ...msgError,
        storeId: formatIOMessage({
          id: messageUI.fieldModalId.id,
          intl: props.intl,
        }).toString(),
      })
    } else if (!salesChannel) {
      setMsgError({
        ...msgError,
        salesChannel: formatIOMessage({
          id: messageUI.fieldModalSales.id,
          intl: props.intl,
        }).toString(),
      })
    } else if (!pickupPoints) {
      setMsgError({
        ...msgError,
        pickupPoints: formatIOMessage({
          id: messageUI.fieldModalPickup.id,
          intl: props.intl,
        }).toString(),
      })
    } else if (!glovoId) {
      setMsgError({
        ...msgError,
        glovoId: formatIOMessage({
          id: messageUI.fieldModalGlovo.id,
          intl: props.intl,
        }).toString(),
      })
    } else {
      // eslint-disable-next-line no-lonely-if
      if (props.type === NameFields.TYPENEW) {
        props.saveData(dataModalSave(uuidv4()))
      } else {
        props.editData(dataModalSave(idEdit))
      }
    }
  }

  useEffect(() => {
    if (props.type === NameFields.TYPENEW) {
      setNameAffiliation('')
      setSalesChannel('')
      setPickupPoints('')
      setGlovoId('')
      setIdAffiliation('')
    } else {
      setIdEdit(props.affiliation.id)
      setIdAffiliation(props.affiliation.idAffiliation)
      setNameAffiliation(props.affiliation.nameAffiliation)
      setSalesChannel(props.affiliation.salesChannel)
      setPickupPoints(props.affiliation.pickupPoints)
      setGlovoId(props.affiliation.glovoId)
    }
  }, [props])

  return (
    <Modal isOpen={props.isOpen} onClose={() => props.changeIsOpen()}>
      <div className="mt5">
        <img src={iconGlovo} style={{ width: '60px' }} alt="" />
        <div>
          <p>
            {formatIOMessage({
              id: messageUI.affiliationName.id,
              intl: props.intl,
            }).toString()}
          </p>
          <Input
            dataAttributes={{ 'hj-white-list': true }}
            label={formatIOMessage({
              id: messageUI.descriptionName.id,
              intl: props.intl,
            }).toString()}
            value={nameAffiliation}
            id={NameFields.NAMEAFFILIATION}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              changeValueInput({ id: e.target.id, value: e.target.value })
            }
            errorMessage={msgError.affiliationName}
          />
        </div>
        <div>
          <p>
            {formatIOMessage({
              id: messageUI.storeId.id,
              intl: props.intl,
            }).toString()}
          </p>
          <Input
            dataAttributes={{ 'hj-white-list': true }}
            label={formatIOMessage({
              id: messageUI.affiliateDescription.id,
              intl: props.intl,
            }).toString()}
            value={idAffiliation}
            id={NameFields.IDAFFILIATION}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              changeValueInput({ id: e.target.id, value: e.target.value })
            }
            errorMessage={msgError.storeId}
          />
        </div>
        <div>
          <p>
            {formatIOMessage({
              id: messageUI.salesModal.id,
              intl: props.intl,
            }).toString()}
          </p>
          <Input
            dataAttributes={{ 'hj-white-list': true }}
            label={formatIOMessage({
              id: messageUI.descriptionSales.id,
              intl: props.intl,
            }).toString()}
            value={salesChannel}
            id={NameFields.SALESCHANNEL}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              changeValueInput({ id: e.target.id, value: e.target.value })
            }
            errorMessage={msgError.salesChannel}
          />
        </div>
        <div>
          <p>
            {formatIOMessage({
              id: messageUI.pickupModal.id,
              intl: props.intl,
            }).toString()}
          </p>
          <Input
            dataAttributes={{ 'hj-white-list': true }}
            label={formatIOMessage({
              id: messageUI.pickupDescription.id,
              intl: props.intl,
            }).toString()}
            value={pickupPoints}
            id={NameFields.PICKUPPOINTS}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              changeValueInput({ id: e.target.id, value: e.target.value })
            }
            errorMessage={msgError.pickupPoints}
          />
        </div>
        <div>
          <p>
            {formatIOMessage({
              id: messageUI.glovoId.id,
              intl: props.intl,
            }).toString()}
          </p>
          <Input
            dataAttributes={{ 'hj-white-list': true }}
            label={formatIOMessage({
              id: messageUI.descriptionGlovoId.id,
              intl: props.intl,
            }).toString()}
            value={glovoId}
            id={NameFields.GLOVOID}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              changeValueInput({ id: e.target.id, value: e.target.value })
            }
            errorMessage={msgError.glovoId}
          />
        </div>
      </div>
      <div className="mt5" style={{ float: 'right' }}>
        <Button variation={NameFields.PRIMARY} onClick={() => validateInputs()}>
          {formatIOMessage({
            id: messageUI.save.id,
            intl: props.intl,
          }).toString()}
        </Button>
      </div>
    </Modal>
  )
}

export default injectIntl(ModalGlovo)
