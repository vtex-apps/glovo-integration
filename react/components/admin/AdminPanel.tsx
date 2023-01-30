import React, { Fragment, useEffect, useState } from 'react'
import { useMutation, useQuery } from 'react-apollo'
import { FormattedMessage } from 'react-intl'
import {
  EmptyState,
  IconFailure,
  Layout,
  PageBlock,
  PageHeader,
  Spinner,
} from 'vtex.styleguide'

import GET_APP_SETTINGS from '../../graphql/getAppSettings.gql'
import SAVE_APP_SETTINGS from '../../graphql/saveAppSettings.gql'
import { IconGlovo } from '../../icons/IconGlovo'
import { Configuration } from './Configuration'
import { Stores } from './Stores'

interface QueryResponse {
  loading: boolean
  error: any
  data: {
    settings: AppSettings
  }
}

const AdminPanel = () => {
  const [settings, setSettings] = useState<AppSettings>({
    glovoToken: '',
    production: false,
    marketplace: false,
    minimumStock: 1,
    stores: [],
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

  const { loading, error, data }: QueryResponse = useQuery(GET_APP_SETTINGS, {
    ssr: false,
  })

  useEffect(() => {
    if (
      !data?.settings ||
      data?.settings.glovoToken === null ||
      data?.settings.production === null ||
      data?.settings.clientProfileData === null
    ) {
      return
    }

    setSettings(data.settings)
  }, [data])

  const updateSettings = async (
    updatedSettings: AppSettings
  ): Promise<boolean> => {
    try {
      const response = await saveSettings({
        variables: {
          settings: updatedSettings,
        },
      })

      if (!response.data.settingsUpdated) {
        throw new Error('Unable to save settings')
      }

      setSettings(updatedSettings)

      return true
    } catch (err) {
      console.error(err)

      return false
    }
  }

  return (
    <Layout
      fullWidth
      pageHeader={
        <PageHeader
          title={
            <div className="flex items-center">
              <div className="mr3">
                <IconGlovo />
              </div>
              <FormattedMessage id="admin/glovo-integration.settings-title" />
            </div>
          }
        />
      }
    >
      {loading ? (
        <EmptyState height={500}>
          <h5 className="t-heading-5">
            <FormattedMessage id="admin/glovo-integration.settings.loading" />
          </h5>
          <Spinner size={60} />
        </EmptyState>
      ) : error ? (
        <EmptyState height={500}>
          <h5 className="t-heading-5 gray mt0">
            <FormattedMessage id="admin/glovo-integration.settings.error" />
          </h5>
          <IconFailure size={60} />
        </EmptyState>
      ) : (
        <Fragment>
          <div className="mb7">
            <PageBlock>
              <Stores
                settings={settings}
                setSettings={setSettings}
                saveSettings={updateSettings}
              />
            </PageBlock>
          </div>
          <PageBlock>
            <Configuration
              settings={settings}
              setSettings={setSettings}
              saveSettings={updateSettings}
            />
          </PageBlock>
        </Fragment>
      )}
    </Layout>
  )
}

export { AdminPanel }
