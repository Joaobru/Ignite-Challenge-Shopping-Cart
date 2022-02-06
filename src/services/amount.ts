import { api } from '../services/api';

export const getStock = async (id: number) => {
  const { data } = await api.get(`stock/${id}`);

  return data?.amount
}