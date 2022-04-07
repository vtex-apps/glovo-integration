import type { Dispatch, FC, SetStateAction } from 'react'
import React, { useState } from 'react'
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
  const [currentItemFrom] = useState(1)
  const [currentItemTo] = useState(items.length)

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

  const handleNextClick = () => {}
  const handlePrevClick = () => {}
  const handleRowsChange = () => {}

  return (
    <Table
      items={items}
      schema={schema}
      lineActions={lineActions}
      fullWidth
      pagination={{
        onNextClick: handleNextClick,
        onPrevClick: handlePrevClick,
        currentItemFrom,
        currentItemTo,
        onRowsChange: handleRowsChange,
        textShowRows: 'Show rows',
        textOf: 'of',
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
