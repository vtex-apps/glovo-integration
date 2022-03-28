import type { Dispatch, FC, SetStateAction } from 'react'
import React from 'react'
import { FormattedMessage } from 'react-intl'
import { Alert } from 'vtex.styleguide'

export interface AlertProps {
  show: boolean
  type: AlertType
}

interface Props extends AlertProps {
  onClose: Dispatch<SetStateAction<AlertProps>>
  autoClose?: number
}

const AlertBanner: FC<Props> = ({ show, type, onClose, autoClose = 5000 }) => {
  const handleClose = () => {
    onClose({
      show: false,
      type,
    })
  }

  if (!show) {
    return null
  }

  return (
    <div className="mb4">
      <Alert type={type} onClose={handleClose} autoClose={autoClose}>
        <FormattedMessage id={`admin/glovo-integration.alert.${type}`} />
      </Alert>
    </div>
  )
}

export { AlertBanner }
