import type { ChangeEvent, Dispatch, SetStateAction } from 'react'
import React, { useEffect, useState } from 'react'
import { Checkbox, Table } from 'vtex.styleguide'
import { FormattedMessage } from 'react-intl'

import type { AddOrEditStore, RemoveStore } from './Stores'
import { countriesMap } from '../../utils'
// import { Pagination } from './pagination'
// import { Filters } from './filters'

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
  const [storesToDisplay, setStoresToDisplay] = useState<StoreInfo[]>([])

  // Pagination state
  const [tableLength, setTableLength] = useState(5)
  const [currentItemFrom, setCurrentItemFrom] = useState(1)
  const [currentItemTo, setCurrentItemTo] = useState(5)

  // Filters state
  const [filterStatements, setFilterStatements] = useState<any[]>([])
  const [affiliatesFilters, setAffiliatesFilters] = useState<BooleanRecords>({})
  const [countriesFilters, setCountriesFilters] = useState<BooleanRecords>({})

  const schema = {
    properties: {
      storeName: {
        title: <FormattedMessage id="admin/glovo-integration.store-name" />,
      },
      sellerName: {
        title: <FormattedMessage id="admin/glovo-integration.seller-name" />,
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

  // Pagination
  useEffect(() => {
    setStoresToDisplay(stores.slice(currentItemFrom - 1, currentItemTo))
  }, [currentItemFrom, currentItemTo, setStoresToDisplay, stores, tableLength])

  const changePage = (from: number, to: number) => {
    setCurrentItemFrom(from)
    setCurrentItemTo(to)
    setStoresToDisplay(stores.slice(from - 1, to))
  }

  const handleNextClick = () => {
    const from = currentItemFrom + tableLength
    const to = currentItemTo + tableLength

    changePage(from, to)
  }

  const handlePrevClick = () => {
    let from = currentItemFrom - tableLength
    let to = currentItemTo - tableLength

    if (from < 0) {
      from = 1
      to = tableLength
    }

    changePage(from, to)
  }

  const handleRowsChange = (_: ChangeEvent, value: string) => {
    const to = currentItemFrom - 1 + parseInt(value, 10)

    setTableLength(parseInt(value, 10))
    setCurrentItemTo(to)
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

  const handleFiltersChange = (statements: Statement[] = []) => {
    let filteredByAffiliate: any[] = []
    let filteredByCountry: any[] = []

    statements.forEach((statement) => {
      if (statement) {
        switch (statement.subject) {
          case 'affiliate':
            if (!statement.object) return
            filteredByAffiliate = stores.filter(
              (store) => statement.object[store.affiliateId]
            )

            setStoresToDisplay(filteredByAffiliate)
            break

          case 'country':
            if (!statement.object) return
            filteredByCountry = stores.filter(
              (store) => statement.object[store.country]
            )

            setStoresToDisplay(filteredByCountry)
            break

          default:
            break
        }
      }
    })

    setFilterStatements(statements)
  }

  const renderFilterLabel = (statement: Statement) => {
    if (!statement) {
      return 'All'
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

    return `${isAllTrue ? 'All' : isAllFalse ? 'None' : `${trueKeysLabel}`}`
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
        moreOptionsLabel: '',
        alwaysVisibleFilters: ['affiliate', 'country'],
        clearAllFiltersButtonLabel: 'Clear all',
        subjectPlaceholder: 'more options',
        submitFilterLabel: 'Apply',
        options: {
          affiliate: {
            label: 'Affiliates',
            renderFilterLabel,
            verbs: [
              {
                label: 'Affiliate ID',
                value: '=',
                object: affiliatesSelector,
              },
            ],
          },
          country: {
            label: 'Country',
            renderFilterLabel,
            verbs: [
              {
                label: 'is',
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
        totalItems: stores.length,
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
