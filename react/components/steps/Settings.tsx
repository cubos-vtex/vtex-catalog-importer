import type { TabState } from '@vtex/admin-ui'
import {
  Button,
  Flex,
  IconArrowRight,
  Stack,
  csx,
  useToast,
} from '@vtex/admin-ui'
import { Form, TextInput, useFormState } from '@vtex/admin-ui-form'
import React from 'react'
import { useMutation } from 'react-apollo'
import { useIntl } from 'react-intl'
import type {
  AppSettingsInput,
  Mutation,
  MutationUpdateAppSettingsArgs,
} from 'ssesandbox04.catalog-importer'

import UPDATE_APP_SETTINGS_MUTATION from '../../graphql/updateAppSettings.graphql'
import messages from '../../messages'

type Props = {
  state: TabState
  settings?: AppSettingsInput
  setSettings: (settings: AppSettingsInput) => void
}

const Settings = (props: Props) => {
  const { formatMessage } = useIntl()
  const showToast = useToast()
  const { state, settings, setSettings } = props

  const form = useFormState<AppSettingsInput>({
    defaultValues: settings,
  })

  const [updateAppSettings, { loading: loadingUpdate }] = useMutation<
    Mutation,
    MutationUpdateAppSettingsArgs
  >(UPDATE_APP_SETTINGS_MUTATION, {
    notifyOnNetworkStatusChange: true,
    onError(error) {
      showToast({
        title: formatMessage(messages.settingsError),
        message: error.message,
        variant: 'critical',
      })
    },
  })

  const handleSubmit = (formData: AppSettingsInput) => {
    const { account, vtexAppKey, vtexAppToken } = formData

    if (!account || !vtexAppKey || !vtexAppToken) {
      showToast({
        title: formatMessage(messages.settingsError),
        message: formatMessage(messages.settingsMissingError),
        variant: 'critical',
      })

      return
    }

    updateAppSettings({ variables: { newSettings: formData } }).then(() => {
      setSettings({ ...formData })
      state.select('2')
    })
  }

  return (
    <Form state={form} onSubmit={handleSubmit}>
      <Stack space="$space-4" fluid>
        <TextInput
          label={formatMessage(messages.settingsComponentsLabel)}
          helpText={formatMessage(messages.settingsComponentsHelpText)}
          name={formatMessage(messages.settingsComponentsName)}
          state={form}
        />
        <TextInput
          label={formatMessage(messages.settingsComponentsLabel2)}
          helpText={formatMessage(messages.settingsComponentsHelpText2)}
          name={formatMessage(messages.settingsComponentsName2)}
          state={form}
        />
        <TextInput
          label={formatMessage(messages.settingsComponentsLabel3)}
          helpText={formatMessage(messages.settingsComponentsHelpText3)}
          name={formatMessage(messages.settingsComponentsName3)}
          state={form}
        />
      </Stack>
      <Flex justify="end" className={csx({ marginTop: '$space-4' })}>
        <Button
          type="submit"
          loading={loadingUpdate}
          disabled={loadingUpdate}
          icon={<IconArrowRight />}
          iconPosition="end"
        >
          {formatMessage(messages.nextLabel)}
        </Button>
      </Flex>
    </Form>
  )
}

export default Settings
