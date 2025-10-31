import React from 'react'
import Header from '../components/molecules/Header'
import styled from 'styled-components'

const Root = styled.div`
  position: relative;
  display: inline-flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`

const Dashboard = styled.div`
  position: relative;
  display: inline-flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  background-color: #ffffff;
`

export default function MainTemplate({ children }: { children: React.ReactNode }) {
  return (
    <Root>
      <Header />
      <Dashboard>{children}</Dashboard>
    </Root>
  )
}
