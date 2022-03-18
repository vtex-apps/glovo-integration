import type { FC } from 'react'
import React, { useState, useEffect } from 'react'
import type { InjectedIntlProps } from 'react-intl'
import { injectIntl, FormattedMessage } from 'react-intl'
import { Button, Input, Modal } from 'vtex.styleguide'
import { v4 as uuidv4 } from 'uuid'

import iconGlovo from '../../icons/GlovoLogo.png'
import type { AffiliationType } from '../../shared'
import {
  GLOVO_STORE_ID,
  POSTAL_CODE,
  PRIMARY,
  SALES_CHANNEL,
  STORE_ID,
  STORE_NAME,
  TYPE_NEW,
} from '../../constants'

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
  const [storeId, setStoreId] = useState('')
  const [salesChannel, setSalesChannel] = useState('')
  const [pickupPoints, setPickupPoints] = useState('')
  const [glovoId, setGlovoId] = useState('')

  const [msgError, setMsgError] = useState<{ [key: string]: any }>({
    id: '',
    affiliationName: '',
    storeId: '',
    salesChannel: '',
    pickupPoints: '',
    glovoId: '',
  })

  const changeValueInput = (e: { id: string; value: string }) => {
    if (e.id === STORE_NAME) {
      setNameAffiliation(e.value)
      setMsgError({ ...msgError, affiliationName: '' })
    } else if (e.id === STORE_ID) {
      setStoreId(e.value)
      setMsgError({ ...msgError, storeId: '' })
    } else if (e.id === SALES_CHANNEL) {
      setSalesChannel(e.value)
      setMsgError({ ...msgError, salesChannel: '' })
    } else if (e.id === POSTAL_CODE) {
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
      storeId,
      salesChannel,
      pickupPoints,
      glovoId,
    }
  }

  const validateInputs = () => {
    if (!nameAffiliation) {
      setMsgError({
        ...msgError,
        affiliationName: (
          <FormattedMessage id="admin/glovo-integration.inputs.error-message" />
        ),
      })
    } else if (!storeId) {
      setMsgError({
        ...msgError,
        storeId: (
          <FormattedMessage id="admin/glovo-integration.inputs.error-message" />
        ),
      })
    } else if (!salesChannel) {
      setMsgError({
        ...msgError,
        salesChannel: (
          <FormattedMessage id="admin/glovo-integration.inputs.error-message" />
        ),
      })
    } else if (!pickupPoints) {
      setMsgError({
        ...msgError,
        pickupPoints: (
          <FormattedMessage id="admin/glovo-integration.inputs.error-message" />
        ),
      })
    } else if (!glovoId) {
      setMsgError({
        ...msgError,
        glovoId: (
          <FormattedMessage id="admin/glovo-integration.inputs.error-message" />
        ),
      })
    } else {
      // eslint-disable-next-line no-lonely-if
      if (props.type === TYPE_NEW) {
        props.saveData(dataModalSave(uuidv4()))
      } else {
        props.editData(dataModalSave(idEdit))
      }
    }
  }

  useEffect(() => {
    if (props.type === TYPE_NEW) {
      setNameAffiliation('')
      setSalesChannel('')
      setPickupPoints('')
      setGlovoId('')
      setStoreId('')
    } else {
      setIdEdit(props.affiliation.id)
      setStoreId(props.affiliation.storeId)
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
            <FormattedMessage id="admin/glovo-integration.store-name" />
          </p>
          <Input
            dataAttributes={{ 'hj-white-list': true }}
            label={
              <FormattedMessage id="admin/glovo-integration.modal.store-name.description" />
            }
            value={nameAffiliation}
            id={STORE_NAME}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              changeValueInput({ id: e.target.id, value: e.target.value })
            }
            errorMessage={msgError.affiliationName}
          />
        </div>
        <div>
          <p>{<FormattedMessage id="admin/glovo-integration.store-id" />}</p>
          <Input
            dataAttributes={{ 'hj-white-list': true }}
            label={
              <FormattedMessage id="admin/glovo-integration.modal.store-id.description" />
            }
            value={storeId}
            id={STORE_ID}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              changeValueInput({ id: e.target.id, value: e.target.value })
            }
            errorMessage={msgError.storeId}
          />
        </div>
        <div>
          <p>
            {<FormattedMessage id="admin/glovo-integration.sales-channel" />}
          </p>
          <Input
            dataAttributes={{ 'hj-white-list': true }}
            label={
              <FormattedMessage id="admin/glovo-integration.modal.sales-channel.description" />
            }
            value={salesChannel}
            id={SALES_CHANNEL}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              changeValueInput({ id: e.target.id, value: e.target.value })
            }
            errorMessage={msgError.salesChannel}
          />
        </div>
        <div>
          <p>{<FormattedMessage id="admin/glovo-integration.postal-code" />}</p>
          <Input
            dataAttributes={{ 'hj-white-list': true }}
            label={
              <FormattedMessage id="admin/glovo-integration.modal.postal-code.description" />
            }
            value={pickupPoints}
            id={POSTAL_CODE}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              changeValueInput({ id: e.target.id, value: e.target.value })
            }
            errorMessage={msgError.pickupPoints}
          />
        </div>
        <div>
          <p>
            {<FormattedMessage id="admin/glovo-integration.glovo-store-id" />}
          </p>
          <Input
            dataAttributes={{ 'hj-white-list': true }}
            label={
              <FormattedMessage id="admin/glovo-integration.modal.glovo-store-id.description" />
            }
            value={glovoId}
            id={GLOVO_STORE_ID}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              changeValueInput({ id: e.target.id, value: e.target.value })
            }
            errorMessage={msgError.glovoId}
          />
        </div>
      </div>
      <div className="mt5" style={{ float: 'right' }}>
        <Button variation={PRIMARY} onClick={() => validateInputs()}>
          {<FormattedMessage id="admin/glovo-integration.save" />}
        </Button>
      </div>
    </Modal>
  )
}

export default injectIntl(ModalGlovo)
