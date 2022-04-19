import type { Dispatch, SetStateAction } from 'react'
import React, { useState } from 'react'
import { Table } from 'vtex.styleguide'
import { FormattedMessage } from 'react-intl'

import type { AddOrEditStore, RemoveStore } from '../Stores'
import { countriesMap } from '../../../utils'
import { Pagination } from './pagination'
import { Filters } from './filters'

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
  const [storesToDisplay, setStoresToDisplay] = useState<StoreInfo[]>([])

  const schema = {
    properties: {
      storeName: {
        title: <FormattedMessage id="admin/glovo-integration.store-name" />,
      },
      sellerId: {
        title: <FormattedMessage id="admin/glovo-integration.seller-id" />,
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

  return (
    <>
      <Table
        items={storesToDisplay}
        schema={schema}
        lineActions={lineActions}
        fullWidth
        filters={Filters()}
        pagination={Pagination({
          stores: items,
          setStoresToDisplay,
        })}
        emptyStateLabel=""
        emptyStateChildren={
          <div className="">
            <h4 className="t-heading-4 pt8">
              <FormattedMessage id="admin/glovo-integration.table.empty" />
            </h4>
          </div>
        }
      />
    </>
  )
}

export { StoreTable }
