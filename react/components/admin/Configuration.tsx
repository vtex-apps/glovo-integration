import type { ChangeEvent, FC } from 'react'
import React, { Fragment, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { Button, Input, InputPassword, Toggle } from 'vtex.styleguide'

import {
  CORPORATE_NAME,
  DOCUMENT,
  DOCUMENT_TYPE,
  EMAIL,
  FIRST_NAME,
  GLOVO_TOKEN,
  LAST_NAME,
  PHONE_NUMBER,
  PRODUCTION,
} from '../../constants'
import { validateInputs } from '../../utils'
import type { AlertProps } from './AlertBanner'
import { AlertBanner } from './AlertBanner'
import type { SettingsSection } from '../../typings/settingsSections'

const Configuration: FC<SettingsSection> = ({
  settings,
  setSettings,
  saveSettings,
}) => {
  const [error, setError] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)
  const [alert, setAlert] = useState<AlertProps>({
    show: false,
    type: 'success',
  })

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    switch (e.target.id) {
      case GLOVO_TOKEN:
        setSettings({
          ...settings,
          glovoToken: e.target.value,
        })

        return

      case PRODUCTION:
        setSettings({
          ...settings,
          production: !settings.production,
        })

        return

      default:
        setSettings({
          ...settings,
          clientProfileData: {
            ...settings.clientProfileData,
            [e.target.id]: e.target.value,
          },
        })
    }
  }

  const handleSaveSettings = async () => {
    setSavingSettings(true)

    const validation = validateInputs({
      glovoToken: settings.glovoToken,
      clientProfileData: settings.clientProfileData,
    })

    if (!validation) {
      setError(true)
      setSavingSettings(false)

      return
    }

    setError(false)

    try {
      const succesfulUpdate = await saveSettings(settings)

      if (!succesfulUpdate) {
        throw new Error('Unable to save settings.')
      }

      setAlert({
        show: true,
        type: 'success',
      })
    } catch (err) {
      console.error(err)

      setAlert({
        show: true,
        type: 'error',
      })
    }

    setSavingSettings(false)
  }

  return (
    <Fragment>
      <AlertBanner show={alert.show} type={alert.type} onClose={setAlert} />
      {/* Integration settings */}
      <div>
        <h2>
          <FormattedMessage id="admin/glovo-integration.integration-settings.title" />
        </h2>
        <p className="i mt0 mb7 gray">
          <FormattedMessage id="admin/glovo-integration.integration-settings.subtitle" />
        </p>

        <div className="mt4">
          <p>
            <FormattedMessage id="admin/glovo-integration.integration-settings.glovo-token" />
          </p>
          <InputPassword
            id={GLOVO_TOKEN}
            value={settings.glovoToken}
            label={
              <FormattedMessage id="admin/glovo-integration.integration-settings.glovo-token.description" />
            }
            onChange={handleChange}
            errorMessage={
              error &&
              !settings.glovoToken && (
                <FormattedMessage id="admin/glovo-integration.inputs.error-message" />
              )
            }
          />
        </div>
        <div className="mt7">
          <p className="i mt0 gray">
            <FormattedMessage id="admin/glovo-integration.integration-settings.production.description" />
          </p>
          <Toggle
            checked={settings.production}
            id={PRODUCTION}
            label={
              <FormattedMessage id="admin/glovo-integration.integration-settings.production.label" />
            }
            name="production"
            value={settings.production}
            onChange={handleChange}
            semantic
          />
        </div>
      </div>

      {/* Client information */}
      <div className="mt8">
        <h2>
          <FormattedMessage id="admin/glovo-integration.client-info.title" />
        </h2>
        <p className="i mt0 mb7 gray">
          <FormattedMessage id="admin/glovo-integration.client-info.subtitle" />
        </p>
        <div className="mt4">
          <Input
            id={EMAIL}
            value={settings.clientProfileData.email}
            label={
              <FormattedMessage id="admin/glovo-integration.client-info.email" />
            }
            onChange={handleChange}
            errorMessage={
              error &&
              !settings.clientProfileData.email && (
                <FormattedMessage id="admin/glovo-integration.inputs.error-message" />
              )
            }
          />
          <div className="flex">
            <div className="w-50 pr5 pt5">
              <Input
                id={FIRST_NAME}
                value={settings.clientProfileData.firstName}
                label={
                  <FormattedMessage id="admin/glovo-integration.client-info.first-name" />
                }
                onChange={handleChange}
                errorMessage={
                  error &&
                  !settings.clientProfileData.firstName && (
                    <FormattedMessage id="admin/glovo-integration.inputs.error-message" />
                  )
                }
              />
            </div>
            <div className="w-50 pt5">
              <Input
                id={LAST_NAME}
                value={settings.clientProfileData.lastName}
                label={
                  <FormattedMessage id="admin/glovo-integration.client-info.last-name" />
                }
                onChange={handleChange}
                errorMessage={
                  error &&
                  !settings.clientProfileData.lastName && (
                    <FormattedMessage id="admin/glovo-integration.inputs.error-message" />
                  )
                }
              />
            </div>
          </div>
          <div className="flex">
            <div className="w-50 pr5 pt5">
              <Input
                id={DOCUMENT_TYPE}
                value={settings.clientProfileData.documentType}
                label={
                  <FormattedMessage id="admin/glovo-integration.client-info.document-type" />
                }
                onChange={handleChange}
                errorMessage={
                  error &&
                  !settings.clientProfileData.documentType && (
                    <FormattedMessage id="admin/glovo-integration.inputs.error-message" />
                  )
                }
              />
            </div>
            <div className="w-50 pt5">
              <Input
                id={DOCUMENT}
                value={settings.clientProfileData.document}
                label={
                  <FormattedMessage id="admin/glovo-integration.client-info.document" />
                }
                onChange={handleChange}
                errorMessage={
                  error &&
                  !settings.clientProfileData.document && (
                    <FormattedMessage id="admin/glovo-integration.inputs.error-message" />
                  )
                }
              />
            </div>
          </div>
          <div className="pt5">
            <Input
              id={PHONE_NUMBER}
              value={settings.clientProfileData.phone}
              label={
                <FormattedMessage id="admin/glovo-integration.client-info.phone-number" />
              }
              onChange={handleChange}
              errorMessage={
                error &&
                !settings.clientProfileData.phone && (
                  <FormattedMessage id="admin/glovo-integration.inputs.error-message" />
                )
              }
            />
          </div>
          <div className="pt5">
            <Input
              id={CORPORATE_NAME}
              value={settings.clientProfileData.corporateName}
              label={
                <FormattedMessage id="admin/glovo-integration.client-info.corporate-name" />
              }
              onChange={handleChange}
              errorMessage={
                error &&
                !settings.clientProfileData.corporateName && (
                  <FormattedMessage id="admin/glovo-integration.inputs.error-message" />
                )
              }
            />
          </div>
        </div>
        <div className="flex justify-end mt8">
          <Button isLoading={savingSettings} onClick={handleSaveSettings} block>
            {<FormattedMessage id="admin/glovo-integration.save" />}
          </Button>
        </div>
      </div>
    </Fragment>
  )
}

export { Configuration }
