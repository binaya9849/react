import React from 'react'

export default function Button({children, variant='primary', ...rest}){
  const cls = variant === 'outline' ? 'btn btn-outline' : 'btn btn-primary'
  return (
    <button className={cls} {...rest}>{children}</button>
  )
}
