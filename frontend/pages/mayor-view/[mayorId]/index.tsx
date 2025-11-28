import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import useAuthorized from '../../../hooks/useAuthorized';
import axios from '../../../lib/axios';
import Spinner from '../../../components/atoms/Spinner';
import { City } from '../../../types/city';
import CityPageLayout from '../../../components/organisms/CityPageLayout';
import MayorViewContent from '../../../components/organisms/MayorViewContent';
import LoadingOrError from '../../../components/molecules/LoadingOrError';
import {
  Message,
} from './styles';

export default function MayorViewPage() {
  const router = useRouter();
  const { mayorId } = router.query;
  const [city, setCity] = useState<City | null>(null);
  const [loading, setLoading] = useState(true);
  const canEdit = useAuthorized(['ADMIN']);

  useEffect(() => {
    if (mayorId) {
      axios.instance.get(`/cities/user/${mayorId}`)
        .then(response => {
          setCity(response.data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Failed to fetch city data', error);
          setLoading(false);
        });
    }
  }, [mayorId]);

  if (loading) {
    return (
      <CityPageLayout>
        <LoadingOrError loading message="Loading city…" />
      </CityPageLayout>
    );
  }

  if (!city) {
    return (
      <CityPageLayout>
        <LoadingOrError error message="City not found" />
      </CityPageLayout>
    );
  }

  return (
    <CityPageLayout>
      <MayorViewContent city={city} canEdit={canEdit} />
    </CityPageLayout>
  );
}
