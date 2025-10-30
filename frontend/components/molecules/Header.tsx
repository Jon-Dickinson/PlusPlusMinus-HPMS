import React from 'react'
import styled from 'styled-components'
import { useAuth } from '../../context/AuthContext'

const Wrap = styled.header`
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  box-shadow: 0 1px 4px rgba(15,23,42,0.06);
`

const Info = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`

export default function Header() {
  const { user, logout } = useAuth()
  return (
    <Wrap>
      <div>PlusPlusMinus</div>
      <Info>
        {user ? (
          <>
            <div>{user.name}</div>
            <div style={{ color: '#6B7280' }}>{user.roles?.map((r) => r.role.name).join(', ')}</div>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <div>Guest</div>
        )}
      </Info>
    </Wrap>
  )
}
