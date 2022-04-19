import type { ChangeEvent, Dispatch, SetStateAction } from 'react'
import React, { useEffect, useState } from 'react'
import { FormattedMessage } from 'react-intl'

interface Props {
  stores: StoreInfo[]
  setStoresToDisplay: Dispatch<SetStateAction<StoreInfo[]>>
}

const Pagination = ({ stores, setStoresToDisplay }: Props) => {
  const [tableLength, setTableLength] = useState(5)
  const [currentItemFrom, setCurrentItemFrom] = useState(1)
  const [currentItemTo, setCurrentItemTo] = useState(5)

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

  return {
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
  }
}

export { Pagination }
