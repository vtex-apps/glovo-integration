import type { FC } from 'react'
import React, { useEffect, useState } from 'react'
import { useMutation, useQuery } from 'react-apollo'
import { FormattedMessage } from 'react-intl'
import {
  EmptyState,
  Layout,
  PageBlock,
  PageHeader,
  Spinner,
} from 'vtex.styleguide'

import APP_SETTINGS from '../../graphql/appSettings.graphql'
import SAVE_APP_SETTINGS from '../../graphql/saveAppSettings.graphql'
import { Configuration } from './Configuration'
import { Stores } from './Stores'

const AdminPanel: FC = () => {
  const [settings, setSettings] = useState<AppConfig>({
    glovoToken: '',
    production: false,
    storesConfig: [],
    clientProfileData: {
      email: '',
      firstName: '',
      lastName: '',
      documentType: '',
      document: '',
      phone: '',
      corporateName: '',
    },
  })

  const [saveSettings] = useMutation(SAVE_APP_SETTINGS)

  const { loading, error, data } = useQuery(APP_SETTINGS, {
    variables: {
      version: process.env.VTEX_APP_VERSION,
    },
    ssr: false,
  })

  useEffect(() => {
    if (!data?.appSettings?.message || data.appSettings.message === '{}') {
      return
    }

    const parsedSettings = JSON.parse(data.appSettings.message)

    setSettings(parsedSettings)
  }, [data])

  const updateSettings = async (
    updatedSettings: AppConfig
  ): Promise<boolean> => {
    try {
      const response = await saveSettings({
        variables: {
          version: process.env.VTEX_APP_VERSION,
          settings: JSON.stringify(updatedSettings),
        },
      })

      if (!response.data.saveAppSettings) {
        throw new Error('Unable to save settings')
      }

      setSettings(updatedSettings)

      return true
    } catch (err) {
      console.error(err)

      return false
    }
  }

  if (error) {
    return null
  }

  return (
    <Layout
      fullWidth
      pageHeader={
        <PageHeader
          title={
            <FormattedMessage id="admin/glovo-integration.settings-title" />
          }
        />
      }
    >
      {loading ? (
        <EmptyState height={300}>
          <h5 className="t-heading-5">
            <FormattedMessage id="admin/glovo-integration.settings.loading" />
          </h5>
          <Spinner size={60} />
        </EmptyState>
      ) : (
        <PageBlock variation="aside">
          <div>
            <Stores
              settings={settings}
              setSettings={setSettings}
              saveSettings={updateSettings}
            />
          </div>
          <div>
            <Configuration
              settings={settings}
              setSettings={setSettings}
              saveSettings={updateSettings}
            />
          </div>
        </PageBlock>
      )}
    </Layout>
  )
}

export { AdminPanel }
