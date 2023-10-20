"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { Button, Slider } from "@/components/ui"
import {
  ClearProductQuantityButton,
  DecreaseProductQuantityButton,
  RequestReplanishmentButton,
} from "@/components/ui/Buttons"
import Image from "next/image"
import { formatCurrency } from "@/utils/currencyFormatter"
import { ICartProduct } from "@/interfaces/ICartProduct"
import { useEffect, useState } from "react"
import useUserStore from "@/store/user/userStore"
import useAnonymousCartStore from "@/store/user/anonymousCart"
import supabaseClient from "@/utils/supabaseClient"

export default function Product({ ...product }: ICartProduct) {
  const queryClient = useQueryClient()
  const userStore = useUserStore()
  const anonymousCart = useAnonymousCartStore()

  const [productQuantity, setProductQuantity] = useState(product.quantity || 0)

  useEffect(() => {
    setProductQuantity(product.quantity)
  }, [product.quantity])

  //Increase product quantity
  const {
    mutate: increaseProductQuantity,
    isPending: isPendingIncreaseProductQuantity,
    context: contextIncreaseProductQuantity,
  } = useMutation({
    mutationFn: async () => {
      /* logic to update cart_quantity in DB */
      //update cart quantity first
      const updated_cart_quantity: number | undefined = queryClient.getQueryData(["cart_quantity"])
      const updated_cart_products: ICartProduct[] | undefined = queryClient.getQueryData(["cart_products"])

      /* update cart_products and cart_quantity in DB */

      const { error: cart_quantity_error } = await supabaseClient
        .from("users_cart")
        .update({ cart_quantity: updated_cart_quantity })
        .eq("id", userStore.userId)
      if (cart_quantity_error) throw cart_quantity_error

      const { error: cart_products_error } = await supabaseClient
        .from("users_cart")
        .update({ cart_products: updated_cart_products })
        .eq("id", userStore.userId)
      if (cart_products_error) throw cart_products_error
    },
    onMutate: () => {
      /* logic to update cart_quantity optimistically */
      //update cart quantity first
      const cart_quantity: number | undefined = queryClient.getQueryData(["cart_quantity"])
      let updated_cart_quantity = cart_quantity
      if (productQuantity === product.on_stock) {
        return updated_cart_quantity
      } else if (updated_cart_quantity !== undefined) {
        updated_cart_quantity += 1
      }

      /* logic to update cart_products optimistically */

      const cart_products: ICartProduct[] | undefined = queryClient.getQueryData(["cart_products"])
      const updated_cart_products = cart_products
      if (productQuantity === 0) {
        //Add product in updated_cart_products if product.quantity === 0 to set it in future
        updated_cart_products?.push({ ...product, quantity: 1 })
        setProductQuantity(product.quantity + 1)
      } else if (productQuantity === product.on_stock) {
        updated_cart_products
      } else if (updated_cart_products !== undefined) {
        updated_cart_products[
          updated_cart_products.findIndex(productInCart => productInCart.id === product.id)
        ].quantity += 1
        setProductQuantity(productQuantity + 1)
      }

      /* update cart_products and cart_quantity optimistically */

      queryClient.setQueryData(["cart_quantity"], updated_cart_quantity)
      queryClient.setQueryData(["cart_products"], updated_cart_products)
      console.log(92, [updated_cart_quantity, updated_cart_products])
      return updated_cart_quantity
    },
    onError: () => {
      //I have no access to context - so I do rollback manually

      /* logic to rollback cart_quantity  */
      //update cart quantity first
      const cart_quantity: number | undefined = queryClient.getQueryData(["cart_quantity"])
      let previous_cart_quantity = cart_quantity
      if (productQuantity === product.on_stock) {
        return previous_cart_quantity
      } else if (previous_cart_quantity !== undefined) {
        previous_cart_quantity -= 1
      }

      /* logic to rollback cart_products */

      const cart_products: ICartProduct[] | undefined = queryClient.getQueryData(["cart_products"])
      const previous_cart_products = cart_products
      if (productQuantity - 1 === 0) {
        //leave products in array that !== product.id
        previous_cart_products?.filter(productInCart => productInCart.id !== product.id)
      } else if (productQuantity === product.on_stock) {
        previous_cart_products
      } else if (previous_cart_products !== undefined) {
        previous_cart_products[
          previous_cart_products.findIndex(productInCart => productInCart.id === product.id)
        ].quantity -= 1
        setProductQuantity(productQuantity - 1)
      }

      /* rollback cart_products and cart_quantity */

      queryClient.setQueryData(["cart_quantity"], previous_cart_quantity)
      queryClient.setQueryData(["cart_products"], previous_cart_products)
    },
  })

  return (
    <article className="flex flex-col tablet:flex-row justify-between border-t-[1px] border-b-[1px] border-solid border-gray-500">
      {product.img_url.length === 1 ? (
        <Image
          className="w-full tablet:aspect-video h-[300px] tablet:h-[175px] laptop:h-[200px] desktop:h-[250px] tablet:w-fit object-cover"
          src={product.img_url[0]}
          alt="image"
          width={480}
          height={360}
          priority
        />
      ) : (
        <Slider
          containerClassName="tablet:w-fit"
          className="h-[300px]"
          images={product.img_url}
          title={product.title}
        />
      )}
      <section className="flex flex-col justify-between gap-y-8 tablet:gap-y-0 w-full px-4 pt-2 pb-4">
        <section className="flex flex-col gap-y-4 tablet:gap-y-0 justify-between items-center tablet:items-start text-brand">
          <div className="flex flex-row gap-x-2 justify-between items-center w-full">
            <h1 className="text-2xl tablet:text-xl desktop:text-2xl">{product.title}</h1>
            <h1 className="text-2xl tablet:text-lg desktop:text-xl">{formatCurrency(product.price)}</h1>
          </div>
          <div className="flex flex-col">
            <p className="text-lg tablet:text-sm text-subTitle text-center tablet:text-start">{product.sub_title}</p>
            <p
              className={`text-lg tablet:text-sm text-subTitle text-center tablet:text-start
            ${product.on_stock === 0 && "text-warning"}`}>
              {product.on_stock === 0 ? "Out of stock" : `Left on stock:${product.on_stock}`}
            </p>
          </div>
        </section>

        <section className="min-h-[50px] flex flex-col tablet:flex-row gap-y-4 gap-x-4 justify-between">
          <div className={`flex flex-col justify-center ${productQuantity === 0 ? "hidden" : "flex"}`}>
            <h5
              className={`${
                isPendingIncreaseProductQuantity ? "animate-pulse" : ""
              } text-xl tablet:text-base laptop:text-lg text-center tablet:text-start`}>
              Quantity: <span>{productQuantity}</span>
            </h5>
            <h5 className="text-xl tablet:text-base laptop:text-lg text-center tablet:text-start flex flex-row justify-center tablet:justify-start">
              Sub-total:&nbsp;<p>{formatCurrency(productQuantity * product.price)}</p>
            </h5>
          </div>
          {product.on_stock === 0 ? (
            <div className="w-full flex flex-row justify-center tablet:justify-end items-end">
              <RequestReplanishmentButton />
            </div>
          ) : (
            <div
              className={`flex flex-row gap-x-2 justify-center tablet:justify-end items-end 
            ${productQuantity === 0 && "w-full"}`}>
              <Button
                className="min-w-[50px] max-h-[50px] laptop:w-fit text-2xl"
                variant="success-outline"
                onClick={() =>
                  userStore.isAuthenticated ? increaseProductQuantity() : anonymousCart.increaseProductQuantity(product)
                }>
                +
              </Button>
              <DecreaseProductQuantityButton product={product} />
              <ClearProductQuantityButton product={product} />
            </div>
          )}
        </section>
      </section>
    </article>
  )
}
