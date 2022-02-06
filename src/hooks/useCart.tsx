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

  useEffect(() => {
    console.log(cart, 'cart')
  }, [cart])



  const addProduct = async (productId: number, title: string, price: number, image: string) => {
    const amount = await getStock(productId);
    const isExists = cart.filter((item) => item.id === productId);

    try {
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
      return toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const updatedCart = cart.filter((product) => product.id !== productId)
      setCart(updatedCart)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart));

    } catch {
      return toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    const maxAmounted = await getStock(productId);

    if (amount <= maxAmounted) {
      try {
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
      } catch {
        return toast.error('Erro na alteração de quantidade do produto');
      }
    } else {
      return toast.error('Quantidade solicitada fora de estoque');
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
