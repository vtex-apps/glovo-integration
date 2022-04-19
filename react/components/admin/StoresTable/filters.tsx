import React, { useState } from 'react'
import { Checkbox } from 'vtex.styleguide'

import { countriesOptions } from '../../../utils'

type FilterSelectorEvent = {
  error: any
  onChange: any
  value: any
}

type BooleanRecords = Record<string, boolean>

const Filters = () => {
  const [filterStatements, setFilterStatements] = useState([])

  const handleFiltersChange = (statements = []) => {
    setFilterStatements(statements)
  }

  const toggleCheckbox = (values: any, defaultValues: any, key: string) => {
    const updatedValues = {
      ...(values ?? defaultValues),
      [key]: values ? !values[key] : false,
    }

    return updatedValues
  }

  const affiliatesSelector = ({ onChange, value }: FilterSelectorEvent) => {
    const affiliates: BooleanRecords = {
      GLV: true,
      ABC: true,
      XYZ: true,
      ...(value ?? {}),
    }

    return (
      <div>
        {Object.keys(affiliates).map((affiliate, i) => (
          <div className="mb2 ml2" key={`${affiliate}-${i}`}>
            <Checkbox
              checked={value ? value[affiliate] : affiliates[affiliate]}
              label={affiliate}
              onChange={() => {
                const updated = toggleCheckbox(value, affiliates, affiliate)

                onChange(updated)
              }}
              value={affiliate}
            />
          </div>
        ))}
      </div>
    )
  }

  const countriesSelector = () => {
    return (
      <div>
        {countriesOptions.map((country) => (
          <div className="mb2 ml2" key={country.value}>
            <Checkbox
              checked
              label={country.label}
              onChange={handleFiltersChange}
              value={country.value}
            />
          </div>
        ))}
      </div>
    )
  }

  return {
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
        renderFilterLabel: (statements: any) => {
          if (!statements) return 'All'

          const keys = statements.object ? Object.keys(statements.object) : []
          const isAllTrue = !keys.some((key) => !statements.object[key])
          const isAllFalse = !keys.some((key) => statements.object[key])
          const trueKeys = keys.filter((key) => statements.object[key])
          let trueKeysLabel = ''

          trueKeys.forEach((key, index) => {
            trueKeysLabel += `${key}${
              index === trueKeys.length - 1 ? '' : ', '
            }`
          })

          return `${
            isAllTrue ? 'All' : isAllFalse ? 'None' : `${trueKeysLabel}`
          }`
        },
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
        renderFilterLabel: () => 'All',
        verbs: [
          {
            label: 'is',
            value: '=',
            object: countriesSelector,
          },
        ],
      },
    },
  }
}

export { Filters }
