import React, { useState } from 'react';
import styled from 'styled-components';
import Input from '../atoms/Input';
import Button from '../atoms/Button';
import Row from '../atoms/Blocks';
import Spinner from '../atoms/Spinner';
import Brand from '../atoms/Brand';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import axios from '../../lib/axios';


const Root = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background-color: #ffffff;
   flex-direction: column;
`;


const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 40px;
  width: 100%;
  max-width: 500px;
`;


const Title = styled.h2`
  margin-bottom: 24px;
  text-align: center;
`;


const ErrorMsg = styled.div`
  color: #b91c1c;
  margin-bottom: 16px;
`;


const RadioGroup = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
    align-items: center;
`;


const RadioLabel = styled.label`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  height: 38px;
  padding-left:25px;


  input {
    position: absolute;
    top: 40%;
    left: 0;
    transform: translateY(-50%);
  }
`;


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
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, role: e.target.value }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);


    try {
      await axios.instance.post('/auth/register', formData);
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
          <Row>
            <Input name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
            <Input name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
          </Row>
          <Input name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
          <Input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <Input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
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


          <Button type="submit" disabled={loading} aria-busy={loading} style={{ width: '100%', marginTop: '16px' }}>
            {loading ? <Spinner size={16} /> : 'Register'}
          </Button>
        </form>
      </FormContainer>
    </Root>
  );
}
