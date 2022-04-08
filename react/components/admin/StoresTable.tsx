import type { ChangeEvent, Dispatch, SetStateAction } from 'react'
import React, { useEffect, useState } from 'react'
import { Table } from 'vtex.styleguide'
import { FormattedMessage } from 'react-intl'

import { countries } from '../../utils'
import type { AddOrEditStore, RemoveStore } from './Stores'

interface Props {
  items: StoreInfo[]
  addOrEditStore: AddOrEditStore
  setAddOrEditStore: Dispatch<SetStateAction<AddOrEditStore>>
  removeStore: RemoveStore
  setRemoveStore: Dispatch<SetStateAction<RemoveStore>>
}

const StoreTable = ({
  items,
  addOrEditStore,
  setAddOrEditStore,
  removeStore,
  setRemoveStore,
}: Props) => {
  const [tableLength, setTableLength] = useState(5)
  const [currentItemFrom, setCurrentItemFrom] = useState(1)
  const [currentItemTo, setCurrentItemTo] = useState(5)
  const [storesToDisplay, setStoresToDisplay] = useState<StoreInfo[]>([])

  useEffect(() => {
    setStoresToDisplay(items.slice(currentItemFrom - 1, currentItemTo))
  }, [currentItemFrom, currentItemTo, items, tableLength])

  const schema = {
    properties: {
      storeName: {
        title: <FormattedMessage id="admin/glovo-integration.store-name" />,
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
        cellRenderer: ({ cellData }: TableItem) => {
          const country = countries.find(({ value }) => value === cellData)

          return country?.label
        },
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

  const changePage = (itemFrom: number, itemTo: number) => {
    setCurrentItemFrom(itemFrom)
    setCurrentItemTo(itemTo)
    setStoresToDisplay(items.slice(itemFrom - 1, itemTo))
  }

  const handleNextClick = () => {
    const itemFrom = currentItemFrom + tableLength
    const itemTo = currentItemTo + tableLength

    changePage(itemFrom, itemTo)
  }

  const handlePrevClick = () => {
    let itemFrom = currentItemFrom - tableLength
    let itemTo = currentItemTo - tableLength

    if (itemFrom < 0) {
      itemFrom = 1
      itemTo = tableLength
    }

    changePage(itemFrom, itemTo)
  }

  const handleRowsChange = (_: ChangeEvent, value: string) => {
    const itemTo = currentItemFrom - 1 + parseInt(value, 10)

    setTableLength(parseInt(value, 10))
    setCurrentItemTo(itemTo)
  }

  return (
    <Table
      items={storesToDisplay}
      schema={schema}
      lineActions={lineActions}
      fullWidth
      pagination={{
        onNextClick: handleNextClick,
        onPrevClick: handlePrevClick,
        currentItemFrom,
        currentItemTo,
        onRowsChange: handleRowsChange,
        textShowRows: (
          <FormattedMessage id="admin/glovo-integration.table.show-rows" />
        ),
        textOf: <FormattedMessage id="admin/glovo-integration.table.of" />,
        totalItems: items.length,
        rowsOptions: [5, 10, 15, 25],
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
