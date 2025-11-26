import React from 'react'

export default function Card({title, children}){
  return (
    <article className="card">
      <h4>{title}</h4>
      <div>{children}</div>
    </article>
  )
}
