import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Input from '../../atoms/Input';
import { Row } from '../../atoms/Blocks';
import Spinner from '../../atoms/Spinner';
import Brand from '../../atoms/Brand';
import { useRouter } from 'next/router';
import { fetchMayors, registerUser, Mayor, RegisterPayload } from './api';
import { Root, FormContainer, Title, ErrorMsg, RadioGroup, RadioLabel, InnerContainer, MayorSelect, MayorSelectContainer, SubmitButton } from './styles';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    role: 'VIEWER' as 'VIEWER' | 'MAYOR',
    cityName: '',
    country: '',
    mayorId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [mayors, setMayors] = useState<Mayor[]>([]);
  const [mayorsLoading, setMayorsLoading] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target as HTMLInputElement | HTMLSelectElement;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const role = event.target.value as 'VIEWER' | 'MAYOR';
    setFormData((prev) => ({ ...prev, role, mayorId: role === 'VIEWER' ? prev.mayorId : '' }));
  };

  // Fetch mayors when the role is VIEWER so the user can pick one
  useEffect(() => {
    let mounted = true;
    async function fetchMayorsData() {
      setMayorsLoading(true);
      try {
        const mayorsData = await fetchMayors();
        if (mounted) setMayors(mayorsData);
      } catch (e) {
        console.error('Failed to load mayors for registration', e);
        if (mounted) setMayors([]);
      } finally {
        if (mounted) setMayorsLoading(false);
      }
    }

    if (formData.role === 'VIEWER') {
      fetchMayorsData();
    }

    return () => { mounted = false; };
  }, [formData.role]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Ensure mayorId is sent as number when provided
      const payload: RegisterPayload = { ...formData, mayorId: formData.mayorId ? Number(formData.mayorId) : undefined };
      await registerUser(payload);
      router.push('/');
    } catch (err) {
      const msg =
        (err &&
          (err as any).response &&
          (err as any).response.data &&
          ((err as any).response.data.error || (err as any).response.data.message)) ||
        (err instanceof Error ? err.message : 'Registration failed');
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Root>
      <Brand />
      <FormContainer>
        <Title>Create an Account</Title>
        <form onSubmit={handleSubmit}>
          {error && <ErrorMsg role="alert">{error}</ErrorMsg>}
          <p> Register as:</p>

          <RadioGroup>
            <RadioLabel>
              <input type="radio" name="role" value="VIEWER" checked={formData.role === 'VIEWER'} onChange={handleRoleChange} />
              <span>Viewer</span>
            </RadioLabel>
            <RadioLabel>
              <input type="radio" name="role" value="MAYOR" checked={formData.role === 'MAYOR'} onChange={handleRoleChange} />
              <span>Mayor</span>
            </RadioLabel>
          </RadioGroup>

          {formData.role === 'MAYOR' && (
            <Row>
              <Input name="cityName" placeholder="City Name" value={formData.cityName} onChange={handleChange} required />
              <Input name="country" placeholder="Country" value={formData.country} onChange={handleChange} required />
            </Row>
          )}

          {formData.role === 'VIEWER' && (
            <MayorSelectContainer>
              <label htmlFor="mayor-select">Select your Mayor</label>
              <InnerContainer>
                {mayorsLoading ? (
                  <div>Loading mayors...</div>
                ) : (
                  <MayorSelect
                    id="mayor-select"
                    name="mayorId"
                    value={formData.mayorId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Select Mayor --</option>
                    {mayors.map((m) => (
                      <option key={m.id} value={String(m.id)}>{`${m.firstName} ${m.lastName}${m.username ? ` (${m.username})` : ''}`}</option>
                    ))}
                  </MayorSelect>
                )}
              </InnerContainer>
            </MayorSelectContainer>
          )}

          <Row>
            <Input name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required autoComplete="new-password" />
            <Input name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required autoComplete="new-password" />
          </Row>
          <Input name="username" placeholder="Username" value={formData.username} onChange={handleChange} required autoComplete="new-password" />
          <Input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required autoComplete="new-password" />
          <Input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required autoComplete="new-password" />

          <SubmitButton type="submit" disabled={loading || (formData.role === 'VIEWER' && !formData.mayorId)} aria-busy={loading}>
            {loading ? <Spinner size={16} /> : 'Register'}
          </SubmitButton>
        </form>
      </FormContainer>
    </Root>
  );
}