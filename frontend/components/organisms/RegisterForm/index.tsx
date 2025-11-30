import React, { useState, useEffect } from 'react';
import Input from '../../atoms/Input';
import { Row } from '../../atoms/Blocks';
import Spinner from '../../atoms/Spinner';
import Brand from '../../atoms/Brand';
import { useRouter } from 'next/router';
import { fetchMayors, registerUser, Mayor, RegisterPayload } from './api';
import { Root, FormContainer, Title, ErrorMsg, RadioGroup, RadioLabel, InnerContainer, MayorSelect, RadioInput, RadioText, FormLabel, MayorOption, LoadingText } from './styles';

type Role = 'VIEWER' | 'MAYOR';
type MayorType = 'NATIONAL' | 'CITY' | 'SUBURB';

interface RegisterFormState {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  role: Role;
  cityName: string;
  country: string;
  mayorId: string;
  mayorType: MayorType;
}

export default function RegisterForm() {
  const [formData, setFormData] = useState<RegisterFormState>({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    role: 'VIEWER',
    cityName: '',
    country: '',
    mayorId: '',
    mayorType: 'CITY',
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
    const role = event.target.value as Role;
    setFormData((prev) => ({
      ...prev,
      role,
      // clear mayorId for MAYOR role and ensure mayorType is set when registering a mayor
      mayorId: role === 'VIEWER' ? prev.mayorId : '',
      mayorType: role === 'MAYOR' ? prev.mayorType || 'CITY' : prev.mayorType,
    }));
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
      // Only include mayorType when registering as a mayor so viewer payloads don't contain it
      const { mayorType, ...rest } = formData as any;
      const payload: RegisterPayload = {
        ...rest,
        ...(formData.role === 'MAYOR' ? { mayorType } : {}),
        mayorId: formData.mayorId ? Number(formData.mayorId) : undefined,
      };
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

  /* --- small, focused subcomponents for clarity --- */
  function RoleSelector() {
    return (
      <RadioGroup role="radiogroup" aria-label="Register role">
        <RadioLabel>
          <RadioInput type="radio" name="role" value="VIEWER" checked={formData.role === 'VIEWER'} onChange={handleRoleChange} />
          <RadioText>Viewer</RadioText>
        </RadioLabel>
        <RadioLabel>
          <RadioInput type="radio" name="role" value="MAYOR" checked={formData.role === 'MAYOR'} onChange={handleRoleChange} />
          <RadioText>Mayor</RadioText>
        </RadioLabel>
      </RadioGroup>
    );
  }

  function MayorTypeSelector() {
    return (
      <RadioGroup aria-label="Mayor Type" role="radiogroup">
        <RadioLabel>
          <RadioInput type="radio" name="mayorType" value="NATIONAL" checked={formData.mayorType === 'NATIONAL'} onChange={handleChange} />
          <RadioText>National</RadioText>
        </RadioLabel>
        <RadioLabel>
          <RadioInput type="radio" name="mayorType" value="CITY" checked={formData.mayorType === 'CITY'} onChange={handleChange} />
          <RadioText>City</RadioText>
        </RadioLabel>
        <RadioLabel>
          <RadioInput type="radio" name="mayorType" value="SUBURB" checked={formData.mayorType === 'SUBURB'} onChange={handleChange} />
          <RadioText>Suburb</RadioText>
        </RadioLabel>
      </RadioGroup>
    );
  }

  function MayorSelectBlock() {
    function formatMayorName(mayor: Mayor) {
      return `${mayor.firstName} ${mayor.lastName}${mayor.username ? ` (${mayor.username})` : ''}`;
    }
    return (
      <InnerContainer>
        <FormLabel htmlFor="mayor-select">Select your Mayor</FormLabel>
        <InnerContainer>
            {mayorsLoading ? (
              <LoadingText>Loading mayors...</LoadingText>
            ) : (
              <MayorSelect id="mayor-select" name="mayorId" value={formData.mayorId} onChange={handleChange} required>
                <MayorOption value="">— Select a Mayor —</MayorOption>
                {mayors.map((mayor) => (
                  <MayorOption key={mayor.id} value={String(mayor.id)}>{formatMayorName(mayor)}</MayorOption>
                ))}
                </MayorSelect>
            )}
        </InnerContainer>
      </InnerContainer>
    );
  }

  return (
    <Root>
      <Brand />
      <FormContainer>
        <Title>Create an Account</Title>
        <form onSubmit={handleSubmit}>
          {error && <ErrorMsg role="alert">{error}</ErrorMsg>}
          <p> Register as:</p>

          <RoleSelector />

          {formData.role === 'MAYOR' && (
            <>
              <MayorTypeSelector />

              <Row>
                <Input name="cityName" placeholder="City Name" value={formData.cityName} onChange={handleChange} required />
                <Input name="country" placeholder="Country" value={formData.country} onChange={handleChange} required />
              </Row>
            </>
          )}

          {formData.role === 'VIEWER' && <MayorSelectBlock />}

          <Row>
            <Input name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required autoComplete="new-password" />
            <Input name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required autoComplete="new-password" />
          </Row>
          <Input name="username" placeholder="Username" value={formData.username} onChange={handleChange} required autoComplete="new-password" />
          <Input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required autoComplete="new-password" />
          <Input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required autoComplete="new-password" />

          <button type="submit" disabled={loading || (formData.role === 'VIEWER' && !formData.mayorId)} aria-busy={loading} style={{ width: '100%', padding: '12px', fontSize: '1rem', borderRadius: '4px', background: '#0070f3', color: '#fff', border: 'none', cursor: 'pointer' }}>
            {loading ? <Spinner size={16} /> : 'Register'}
          </button>
        </form>
      </FormContainer>
    </Root>
  );
}