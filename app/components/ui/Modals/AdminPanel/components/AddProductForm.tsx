import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import axios from "axios"
import { useForm } from "react-hook-form"
import supabaseClient from "@/libs/supabaseClient"
import { stripe } from "@/libs/stripe"
import { ImageListType } from "react-images-uploading"
import ImageUploading from "react-images-uploading"
import slugify from "@sindresorhus/slugify"

import useUserStore from "@/store/user/userStore"
import { IFormDataAddProduct } from "@/interfaces/IFormDataAddProduct"
import { ProductInput } from "@/components/ui/Inputs/Validation"
import { Button } from "@/components/ui/Button"
import useDragging from "@/hooks/ui/useDragging"
import { twMerge } from "tailwind-merge"

export function AddProductForm() {
  const userStore = useUserStore()
  const { isDraggingg } = useDragging()

  const [isLoading, setIsLoading] = useState(false)
  const [responseMessage, setResponseMessage] = useState<React.ReactNode>(<p></p>)
  const [images, setImages] = useState<ImageListType>([])

  const dragZone = useRef<HTMLButtonElement | null>(null)

  async function createProduct(images: ImageListType, title: string, subTitle: string, price: number, onStock: number) {
    setIsLoading(true)
    try {
      //Check images length and is stripe mounted
      if (images.length > 0 && stripe) {
        const imagesArray = await Promise.all(
          images.map(async image => {
            if (image?.file && !!userStore.userId) {
              const { data, error } = await supabaseClient.storage
                .from("public")
                .upload(`${userStore.userId}/${slugify(image.file.name, { separator: "_" })}`, image.file, {
                  upsert: true,
                })
              if (error) throw error

              const response = supabaseClient.storage.from("public").getPublicUrl(data.path)
              return response.data.publicUrl
            }
          }),
        )
        //create product
        const priceResponse = await axios.post("/api/products", {
          images: imagesArray,
          title: title,
          subTitle: subTitle,
          price: price,
        })

        const updatedUserResponse = await supabaseClient
          .from("products")
          .insert({
            id: priceResponse.data.id,
            owner_id: userStore.userId,
            title: title,
            sub_title: subTitle,
            price: price,
            on_stock: onStock,
            img_url: imagesArray as string[],
          })
          .eq("user_id", userStore.userId)
        if (updatedUserResponse.error) throw updatedUserResponse.error
        displayResponseMessage(<p className="text-success">Product added</p>)
      } else {
        displayResponseMessage(<p className="text-danger">Upload the image</p>)
      }
    } catch (error) {
      console.log(94, "createProduct_error - ", error)
    } finally {
      setIsLoading(false)
    }
  }

  function displayResponseMessage(message: React.ReactNode) {
    setResponseMessage(message)
    setTimeout(() => {
      setResponseMessage(<p></p>)
    }, 5000)
  }

  const onChange = (imageList: ImageListType) => {
    setImages(imageList)
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormDataAddProduct>()

  const onSubmit = (data: IFormDataAddProduct) => {
    console.log(95, "images - ", images)
    if (images[0].file) {
      console.log(104, "slugify - ", slugify(images[0].file.name, { separator: "_" }))
    }
    createProduct(images, data.title, data.subTitle, data.price, data.onStock)
  }

  return (
    <div className="w-[50%] transition-all duration-1000">
      <ImageUploading multiple value={images} onChange={onChange} dataURLKey="data_url">
        {({ imageList, onImageUpload, onImageRemoveAll, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
          <div className="w-full flex flex-col items-center justify-center gap-y-4">
            <Button
              className={`${
                isDraggingg && "fixed inset-0 z-[101] !bg-[rgba(0,0,0,0.6)]"
              } image-upload w-full bg-transparent px-16 py-8 text-xl whitespace-nowrap`}
              ref={dragZone}
              onClick={onImageUpload}
              disabled={isLoading}
              {...dragProps}>
              <h1 className="pointer-events-none select-none">
                {isDragging ? "Drop files here" : "Click or Drop here"}
              </h1>
            </Button>
            &nbsp;
            {imageList.map((image, index) => (
              <div
                key={index}
                className="flex flex-col gap-y-4 overflow-hidden rounded-xl border-[1px] border-solid border-border-color">
                <Image
                  className="aspect-video min-w-[320px] object-cover"
                  src={image.data_url}
                  alt="iamge"
                  width={0}
                  height={0}
                />
                <div className="mb-4 flex flex-row items-center justify-center gap-x-4 px-4">
                  <Button onClick={() => onImageUpdate(index)} disabled={isLoading}>
                    Update
                  </Button>
                  <Button variant="danger-outline" onClick={() => onImageRemove(index)} disabled={isLoading}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            <Button
              className="w-full mb-4"
              variant="danger-outline"
              onClick={void onImageRemoveAll}
              disabled={isLoading}>
              Remove all images
            </Button>
          </div>
        )}
      </ImageUploading>
      <form className="flex flex-col gap-y-2" onSubmit={handleSubmit(onSubmit)}>
        <ProductInput
          className="border w-full py-1 px-2"
          id="title"
          register={register}
          errors={errors}
          disabled={isLoading}
          required
          placeholder="Product title"
        />
        <ProductInput
          className="border w-full py-1 px-2"
          id="subTitle"
          register={register}
          errors={errors}
          disabled={isLoading}
          required
          placeholder="Product description"
        />
        <ProductInput
          className="border w-full py-1 px-2"
          id="price"
          type="numeric"
          register={register}
          errors={errors}
          disabled={isLoading}
          required
          placeholder="Product price"
        />
        <ProductInput
          className="border w-full py-1 px-2"
          id="onStock"
          type="number"
          register={register}
          errors={errors}
          disabled={isLoading}
          required
          placeholder="Amount on stock"
        />
        <div className="text-center">{responseMessage}</div>
        <Button
          className={twMerge(`w-full mt-2`, isLoading && "opacity-50 cursor-default pointer-events-none")}
          disabled={isLoading}>
          Create product
        </Button>
      </form>
    </div>
  )
}
