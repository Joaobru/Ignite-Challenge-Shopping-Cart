import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getStock } from '../services/amount';
import { Product } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number, title: string, price: number, image: string) => Promise<void | React.ReactText>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number, title: string, price: number, image: string) => {
    try {
      const amount = await getStock(productId);
      const isExists = cart.filter((item) => item.id === productId);

      if (isExists.length > 0) {
        if (isExists[0]?.amount !== amount) {
          const updatedCart = cart.map((item) => {
            if (item.id === productId) {
              return {
                ...item,
                amount: item.amount += 1,
              }
            }
            return item
          })

          setCart(updatedCart)
          return localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart));
        } else {
          return toast.error('Quantidade solicitada fora de estoque');
        }
      }

      const payload = {
        id: productId,
        title,
        price,
        image,
        amount: 1
      }
      const updatedCart = [...cart, payload];

      setCart(updatedCart);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart));
    } catch {
      return toast.error('Erro na adi????o do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const isExists = cart.filter((product) => product.id === productId);
      if (isExists.length > 0) {
        const updatedCart = cart.filter((product) => product.id !== productId)
        setCart(updatedCart)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart));
      } else {
        return toast.error('Erro na remo????o do produto');
      }
    } catch {
      return toast.error('Erro na remo????o do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {

    try {
      const maxAmounted = await getStock(productId);

      if (amount <= maxAmounted && amount > 0) {
        const updatedCart = cart.map((product) => {
          if (product.id === productId) {
            return {
              ...product,
              amount,
            }
          }

          return product;
        });

        setCart(updatedCart);

        localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart));

      } else {
        return toast.error('Quantidade solicitada fora de estoque');
      }
    } catch {
      return toast.error('Erro na altera????o de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
