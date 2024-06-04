import {
  Button,
  Card,
  Center,
  Flex,
  IconArrowLeft,
  IconArrowLineDown,
  IconArrowRight,
  IconFaders,
  IconGear,
  IconListDashes,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  csx,
  useTabState,
  useToast,
} from '@vtex/admin-ui'
import React, { Suspense, lazy, useState } from 'react'
import { useQuery } from 'react-apollo'
import { useIntl } from 'react-intl'
import type { AppSettingsInput, Query } from 'ssesandbox04.catalog-importer'

import APP_SETTINGS_QUERY from '../graphql/appSettings.graphql'
import messages from '../messages'

const Settings = lazy(() => import('./steps/Settings'))
const CategoryTree = lazy(() => import('./steps/CategoryTree'))
const ImportOptions = lazy(() => import('./steps/ImportOptions'))
const StartProcessing = lazy(() => import('./steps/StartProcessing'))

const SuspenseFallback = () => (
  <Center>
    <Spinner />
  </Center>
)

const tabListTheme = csx({
  bg: '$secondary',
  '> [data-wrap="true"][data-space-inside="true"]': {
    flexFlow: 'column',
    '@tablet': { flexFlow: 'row' },
    '> button': {
      bg: '$secondary',
      width: '100%',
      marginLeft: 0,
      '@tablet': { width: 'auto' },
    },
  },
})

const tabPanelTheme = csx({ padding: '$space-4' })

export default function ImporterSteps() {
  const state = useTabState({
    selectOnMove: false,
    defaultActiveId: '1',
  })

  const { formatMessage } = useIntl()
  const showToast = useToast()
  const [settings, setSettings] = useState<AppSettingsInput>()
  const [checkedSecondStep, setCheckedSecondStep] = useState(false)
  const [checkedTreeOptions, setCheckedTreeOptions] = useState({})

  const { loading, refetch, error } = useQuery<Query>(APP_SETTINGS_QUERY, {
    notifyOnNetworkStatusChange: true,
    onError(e) {
      if (e.message.includes('500')) {
        setTimeout(() => refetch(), 500)

        return
      }

      showToast({
        message: `${formatMessage(messages.settingsError)}: ${formatMessage({
          id: e.graphQLErrors?.[0]?.message || e.message,
        })}`,
        variant: 'critical',
      })
    },
    onCompleted(data) {
      setSettings(data.appSettings)
    },
  })

  return (
    <Card>
      <TabList state={state} className={tabListTheme}>
        <Tab id="1">
          <Center>
            <IconGear className="mr1" size="small" />
            {formatMessage(messages.settingsLabel)}
          </Center>
        </Tab>
        <Tab disabled={state.activeId === '1'} id="2">
          <Center>
            <IconListDashes className="mr1" size="small" />
            {formatMessage(messages.categoriesLabel)}
          </Center>
        </Tab>
        <Tab disabled={state.activeId === '1' || state.activeId === '2'} id="3">
          <Center>
            <IconFaders className="mr1" size="small" />
            {formatMessage(messages.optionsLabel)}
          </Center>
        </Tab>
        <Tab
          disabled={
            state.activeId === '1' ||
            state.activeId === '2' ||
            state.activeId === '3'
          }
          id="4"
        >
          <Center>
            <IconArrowLineDown className="mr1" size="small" />
            {formatMessage(messages.startLabel)}
          </Center>
        </Tab>
      </TabList>
      <TabPanel
        state={state}
        id="1"
        hidden={state.activeId !== '1'}
        className={tabPanelTheme}
      >
        <Suspense fallback={<SuspenseFallback />}>
          {state.activeId === '1' &&
            (loading || error ? (
              <SuspenseFallback />
            ) : (
              settings && (
                <Settings
                  state={state}
                  settings={settings}
                  setSettings={setSettings}
                />
              )
            ))}
        </Suspense>
      </TabPanel>
      <TabPanel
        state={state}
        id="2"
        hidden={state.activeId !== '2'}
        className={tabPanelTheme}
      >
        <Suspense fallback={<SuspenseFallback />}>
          {state.activeId === '2' && (
            <CategoryTree
              state={state}
              settings={settings}
              setCheckedTreeOptions={setCheckedTreeOptions}
            />
          )}
        </Suspense>
      </TabPanel>
      <TabPanel state={state} id="3" className={tabPanelTheme}>
        <Suspense fallback={<Spinner />}>
          <ImportOptions setChecked={setCheckedSecondStep} />
        </Suspense>
        <Flex
          justify="space-between"
          className={csx({ marginTop: '$space-4' })}
        >
          <Button onClick={() => state.select('2')} icon={<IconArrowLeft />}>
            {formatMessage(messages.previousLabel)}
          </Button>
          <Button
            onClick={() => state.select('4')}
            icon={<IconArrowRight />}
            iconPosition="end"
            disabled={!checkedSecondStep}
          >
            {formatMessage(messages.nextLabel)}
          </Button>
        </Flex>
      </TabPanel>
      <TabPanel state={state} id="4" className={tabPanelTheme}>
        <Suspense fallback={<Spinner />}>
          <StartProcessing checkedTreeOptions={checkedTreeOptions} />
        </Suspense>
        <Flex
          justify="space-between"
          className={csx({ marginTop: '$space-4' })}
        >
          <Button onClick={() => state.select('3')} icon={<IconArrowLeft />}>
            {formatMessage(messages.previousLabel)}
          </Button>
          <Button icon={<IconArrowLineDown />}>
            {formatMessage(messages.startLabel)}
          </Button>
        </Flex>
      </TabPanel>
    </Card>
  )
}
