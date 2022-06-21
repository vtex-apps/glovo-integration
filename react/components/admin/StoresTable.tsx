import type { ChangeEvent, Dispatch, SetStateAction } from 'react'
import React, { useEffect, useState } from 'react'
import { Checkbox, Table } from 'vtex.styleguide'
import { FormattedMessage, useIntl } from 'react-intl'

import type { AddOrEditStore, RemoveStore } from './Stores'
import { countriesMap } from '../../utils'

interface Props {
  stores: StoreInfo[]
  addOrEditStore: AddOrEditStore
  setAddOrEditStore: Dispatch<SetStateAction<AddOrEditStore>>
  removeStore: RemoveStore
  setRemoveStore: Dispatch<SetStateAction<RemoveStore>>
}

type BooleanRecords = Record<string, boolean>

type FilterSelectorEvent = {
  error: any
  onChange: any
  value: any
}

type Statement = {
  subject: string
  verb: string
  object: any
}

const StoreTable = ({
  stores,
  addOrEditStore,
  setAddOrEditStore,
  removeStore,
  setRemoveStore,
}: Props) => {
  // Pagination state
  const [storesToDisplay, setStoresToDisplay] = useState<StoreInfo[]>([])
  const [tableLength, setTableLength] = useState(5)
  const [currentItemFrom, setCurrentItemFrom] = useState(1)
  const [currentItemTo, setCurrentItemTo] = useState(5)
  const [totalItems, setTotalItems] = useState(0)

  // Filters state
  const [filteredStores, setFilteredStores] = useState<StoreInfo[]>([])
  const [filterStatements, setFilterStatements] = useState<Statement[]>([])
  const [affiliatesFilters, setAffiliatesFilters] = useState<BooleanRecords>({})
  const [countriesFilters, setCountriesFilters] = useState<BooleanRecords>({})

  const schema = {
    properties: {
      storeName: {
        title: <FormattedMessage id="admin/glovo-integration.store-name" />,
      },
      sellerName: {
        title: <FormattedMessage id="admin/glovo-integration.seller-name" />,
        width: 300,
      },
      affiliateId: {
        title: <FormattedMessage id="admin/glovo-integration.affiliate-id" />,
      },
      salesChannel: {
        title: <FormattedMessage id="admin/glovo-integration.sales-channel" />,
      },
      glovoStoreId: {
        title: <FormattedMessage id="admin/glovo-integration.glovo-store-id" />,
      },
      postalCode: {
        title: <FormattedMessage id="admin/glovo-integration.postal-code" />,
      },
      country: {
        title: <FormattedMessage id="admin/glovo-integration.country" />,
        cellRenderer: ({ cellData }: TableItem) =>
          countriesMap[cellData as string],
      },
    },
  }

  const lineActions = [
    {
      label: () => (
        <FormattedMessage id="admin/glovo-integration.table.edit-store" />
      ),
      onClick: ({ rowData: store }: TableItem) => {
        setAddOrEditStore({
          ...addOrEditStore,
          isOpen: true,
          store,
        })
      },
    },
    {
      label: () => (
        <FormattedMessage id="admin/glovo-integration.table.remove-store" />
      ),
      isDangerous: true,
      onClick: ({ rowData: { id } }: TableItem) => {
        setRemoveStore({
          ...removeStore,
          isOpen: true,
          storeId: id,
        })
      },
    },
  ]

  const intl = useIntl()

  // Pagination
  useEffect(() => {
    setFilteredStores(stores)
    setStoresToDisplay(stores.slice(currentItemFrom - 1, currentItemTo))
    setTotalItems(stores.length)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stores])

  const setTablePage = (
    from: number,
    to: number,
    storesInPage: StoreInfo[]
  ) => {
    setCurrentItemFrom(from)
    setCurrentItemTo(to)
    setStoresToDisplay(storesInPage.slice(from - 1, to))
  }

  const handleNextClick = () => {
    const from = currentItemFrom + tableLength
    const to = currentItemTo + tableLength

    setTablePage(from, to, filteredStores)
  }

  const handlePrevClick = () => {
    let from = currentItemFrom - tableLength
    let to = currentItemTo - tableLength

    if (from < 0) {
      from = 1
      to = tableLength
    }

    setTablePage(from, to, filteredStores)
  }

  const handleRowsChange = (_: ChangeEvent, value: string) => {
    const to = currentItemFrom - 1 + parseInt(value, 10)

    setTableLength(parseInt(value, 10))
    setCurrentItemTo(to)

    setTablePage(currentItemFrom, to, filteredStores)
  }

  // Filters
  useEffect(() => {
    const affiliatesForFilters: BooleanRecords = {}
    const countriesForFilters: BooleanRecords = {}

    for (const store of stores) {
      const { affiliateId, country } = store

      if (!(affiliateId in affiliatesForFilters)) {
        affiliatesForFilters[affiliateId] = true
      }

      if (!(country in countriesForFilters)) {
        countriesForFilters[country] = true
      }
    }

    setAffiliatesFilters(affiliatesForFilters)
    setCountriesFilters(countriesForFilters)
  }, [stores])

  const handleFiltersChange = async (statements: Statement[] = []) => {
    let storesToFilter: StoreInfo[] = stores.slice()

    statements.forEach((statement) => {
      if (statement) {
        switch (statement.subject) {
          case 'affiliate':
            if (!statement.object) return

            storesToFilter = storesToFilter.filter(
              (store) => statement.object[store.affiliateId]
            )
            break

          case 'country':
            if (!statement.object) return

            storesToFilter = storesToFilter.filter(
              (store) => statement.object[store.country]
            )
            break

          default:
            break
        }
      }
    })

    setFilteredStores(storesToFilter)
    setFilterStatements(statements)
    setTotalItems(storesToFilter.length)
    setTablePage(1, tableLength, storesToFilter)
  }

  const renderFilterLabel = (statement: Statement) => {
    if (!statement) {
      return intl.formatMessage({ id: 'admin/glovo-integration.table.all' })
    }

    const { object } = statement

    const keys = Object.keys(object) ?? []
    const isAllTrue = !keys.some((key) => !object[key])
    const isAllFalse = !keys.some((key) => object[key])
    const trueKeys = keys.filter((key) => object[key])

    let trueKeysLabel = ''

    trueKeys.forEach((key, i) => {
      trueKeysLabel += `${key}${i === trueKeys.length - 1 ? '' : ', '}`
    })

    return `${
      isAllTrue
        ? intl.formatMessage({ id: 'admin/glovo-integration.table.all' })
        : isAllFalse
        ? intl.formatMessage({ id: 'admin/glovo-integration.table.none' })
        : `${trueKeysLabel}`
    }`
  }

  const toggleCheckbox = (values: any, defaultValues: any, key: string) => {
    const updatedValues = {
      ...(values ?? defaultValues),
      [key]: values ? !values[key] : false,
    }

    return updatedValues
  }

  const affiliatesSelector = ({ onChange, value }: FilterSelectorEvent) => {
    return (
      <div>
        {Object.keys(affiliatesFilters).map((affiliate, i) => (
          <div className="mb2 ml2" key={`${affiliate}-${i}`}>
            <Checkbox
              checked={value ? value[affiliate] : affiliatesFilters[affiliate]}
              label={affiliate}
              onChange={() => {
                const updated = toggleCheckbox(
                  value,
                  affiliatesFilters,
                  affiliate
                )

                onChange(updated)
              }}
              value={affiliate}
            />
          </div>
        ))}
      </div>
    )
  }

  const countriesSelector = ({ onChange, value }: FilterSelectorEvent) => {
    return (
      <div>
        {Object.keys(countriesFilters).map((country, i) => (
          <div className="mb2 ml2" key={`${countriesMap[country]}-${i}`}>
            <Checkbox
              checked={value ? value[country] : countriesMap[country]}
              label={countriesMap[country]}
              onChange={() => {
                const updated = toggleCheckbox(value, countriesFilters, country)

                onChange(updated)
              }}
              value={country}
            />
          </div>
        ))}
      </div>
    )
  }

  return (
    <Table
      items={storesToDisplay}
      schema={schema}
      lineActions={lineActions}
      fullWidth
      filters={{
        statements: filterStatements,
        onChangeStatements: handleFiltersChange,
        moreOptionsLabel: (
          <FormattedMessage id="admin/glovo-integration.table.more-options" />
        ),
        alwaysVisibleFilters: ['affiliate', 'country'],
        clearAllFiltersButtonLabel: (
          <FormattedMessage id="admin/glovo-integration.table.clear-all" />
        ),
        submitFilterLabel: (
          <FormattedMessage id="admin/glovo-integration.table.apply" />
        ),
        options: {
          affiliate: {
            label: intl.formatMessage({
              id: 'admin/glovo-integration.affiliate-id',
            }),
            renderFilterLabel,
            verbs: [
              {
                value: '=',
                object: affiliatesSelector,
              },
            ],
          },
          country: {
            label: intl.formatMessage({
              id: 'admin/glovo-integration.country',
            }),
            renderFilterLabel,
            verbs: [
              {
                value: '=',
                object: countriesSelector,
              },
            ],
          },
        },
      }}
      pagination={{
        currentItemFrom,
        currentItemTo,
        totalItems,
        onNextClick: handleNextClick,
        onPrevClick: handlePrevClick,
        onRowsChange: handleRowsChange,
        textOf: <FormattedMessage id="admin/glovo-integration.table.of" />,
        textShowRows: (
          <FormattedMessage id="admin/glovo-integration.table.show-rows" />
        ),
        rowsOptions: [5, 10, 25],
      }}
      emptyStateLabel=""
      emptyStateChildren={
        <div className="">
          <h4 className="t-heading-4 pt8">
            <FormattedMessage id="admin/glovo-integration.table.empty" />
          </h4>
        </div>
      }
    />
  )
}

export { StoreTable }
