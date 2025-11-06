import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Input from '../../atoms/Input';
import Button from '../../atoms/Button';
import Row from '../../atoms/Blocks';
import Spinner from '../../atoms/Spinner';
import Brand from '../../atoms/Brand';
import { useRouter } from 'next/router';
import axios from '../../../lib/axios';
import { Root, FormContainer, Title, ErrorMsg, RadioGroup, RadioLabel } from './styles';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    role: 'VIEWER',
    cityName: '',
    country: '',
    mayorId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [mayors, setMayors] = useState<any[]>([]);
  const [mayorsLoading, setMayorsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target as HTMLInputElement | HTMLSelectElement;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const role = e.target.value;
    setFormData((prev) => ({ ...prev, role, mayorId: role === 'VIEWER' ? prev.mayorId : '' }));
  };

  // Fetch mayors when the role is VIEWER so the user can pick one
  useEffect(() => {
    let mounted = true;
    async function fetchMayors() {
      setMayorsLoading(true);
      try {
        const res = await axios.instance.get('/public/mayors');
        if (mounted) setMayors(res.data || []);
      } catch (e) {
        console.error('Failed to load mayors for registration', e);
        if (mounted) setMayors([]);
      } finally {
        if (mounted) setMayorsLoading(false);
      }
    }

    if (formData.role === 'VIEWER') {
      fetchMayors();
    }

    return () => { mounted = false; };
  }, [formData.role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Ensure mayorId is sent as number when provided
      const payload = { ...formData, mayorId: formData.mayorId ? Number(formData.mayorId) : undefined };
      await axios.instance.post('/auth/register', payload);
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
            <div className="my-10">
              <label htmlFor="mayor-select">Select your Mayor</label>
              <div>
                {mayorsLoading ? (
                  <div>Loading mayors...</div>
                ) : (
                  <select
                    id="mayor-select"
                    name="mayorId"
                    value={formData.mayorId}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '8px', marginTop: 8 }}
                  >
                    <option value="">-- Select Mayor --</option>
                    {mayors.map((m) => (
                      <option key={m.id} value={String(m.id)}>{`${m.firstName} ${m.lastName}${m.username ? ` (${m.username})` : ''}`}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          )}

          <Row>
            <Input name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required autoComplete="new-password" />
            <Input name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required autoComplete="new-password" />
          </Row>
          <Input name="username" placeholder="Username" value={formData.username} onChange={handleChange} required autoComplete="new-password" />
          <Input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required autoComplete="new-password" />
          <Input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required autoComplete="new-password" />

          <Button type="submit" disabled={loading || (formData.role === 'VIEWER' && !formData.mayorId)} aria-busy={loading} style={{ width: '100%', marginTop: '16px' }}>
            {loading ? <Spinner size={16} /> : 'Register'}
          </Button>
        </form>
      </FormContainer>
    </Root>
  );
}