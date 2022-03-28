import type { FC } from 'react'
import React from 'react'

import logo from './GlovoLogo.png'

interface Props {
  size?: number
}

const IconGlovo: FC<Props> = ({ size = 80 }) => {
  return <img src={logo} style={{ width: `${size}px` }} alt="Glovo logo" />
}

export { IconGlovo }
