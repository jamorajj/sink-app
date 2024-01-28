'use client';

import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { UploadButton, UploadFileResponse } from '@xixixao/uploadstuff/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import clsx from 'clsx';
import '@xixixao/uploadstuff/react/styles.css';
import { useRouter } from 'next/navigation';
import { getImageUrl } from '@/lib/utils';

const defaultErrorState = {
  title: '',
  imageA: '',
  imageB: '',
};

export default function CreatePage() {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const createThumbnail = useMutation(api.thumbnails.createThumbnail);
  const [imageA, setImageA] = useState('');
  const [imageB, setImageB] = useState('');
  const [errors, setErrors] = useState(defaultErrorState);
  const { toast } = useToast();
  const router = useRouter();

  return (
    <div className="pt-16">
      <h1 className="text-4xl font-bold mb-8">Create a thumbnail test</h1>

      <p className="text-lg max-w-md mb-8">
        Create your test so that other people can vote on their preferred
        thumbnail.
      </p>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const formData = new FormData(form);
          const title = formData.get('title') as string;

          let currentErrors = defaultErrorState;

          if (!title) {
            currentErrors = {
              ...currentErrors,
              title: 'Please fill in this required field',
            };
          }

          if (!imageA) {
            currentErrors = {
              ...currentErrors,
              imageA: 'Please fill in this required field',
            };
          }

          if (!imageB) {
            currentErrors = {
              ...currentErrors,
              imageB: 'Please fill in this required field',
            };
          }

          setErrors(currentErrors);

          if (!Object.values(currentErrors).every((v) => v === '')) {
            toast({
              title: 'Form Errors',
              description: 'Please fill all fields',
              variant: 'destructive',
            });
            return;
          }

          const thumbnailId = await createThumbnail({
            aImage: imageA,
            bImage: imageB,
            title,
          });

          router.push(`/thumbnails/${thumbnailId}`);
        }}
      >
        <div className="flex flex-col gap-4 mb-8">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            type="text"
            name="title"
            placeholder="Label your test image"
            className={clsx({
              'border border-red-500': errors.title,
            })}
          />

          {errors.title && <div className="text-red-500">{errors.title}</div>}
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div
            className={clsx('flex flex-col gap-4 rounded p-2', {
              'border border-red-500': errors.imageA,
            })}
          >
            <h2 className="text-2xl font-bold">Test image A</h2>

            {imageA && (
              <Image
                width="200"
                height="200"
                alt="Image Test A"
                src={getImageUrl(imageA)}
              />
            )}

            <UploadButton
              uploadUrl={generateUploadUrl}
              fileTypes={['image/*']}
              onUploadComplete={async (uploaded: UploadFileResponse[]) => {
                setImageA((uploaded[0].response as any).storageId);
              }}
              onUploadError={(error: unknown) => {
                // Do something with the error.
                alert(`ERROR! ${error}`);
              }}
            />

            {errors.imageA && (
              <div className="text-red-500">{errors.imageA}</div>
            )}
          </div>
          <div
            className={clsx('flex flex-col gap-4 rounded p-2', {
              'border border-red-500': errors.imageB,
            })}
          >
            <h2 className="text-2xl font-bold">Test image B</h2>

            {imageB && (
              <Image
                width="200"
                height="200"
                alt="Image Test B"
                src={getImageUrl(imageB)}
              />
            )}

            <UploadButton
              uploadUrl={generateUploadUrl}
              fileTypes={['image/*']}
              onUploadComplete={async (uploaded: UploadFileResponse[]) => {
                setImageB((uploaded[0].response as any).storageId);
              }}
              onUploadError={(error: unknown) => {
                // Do something with the error.
                alert(`ERROR! ${error}`);
              }}
            />

            {errors.imageB && (
              <div className="text-red-500">{errors.imageB}</div>
            )}
          </div>
        </div>

        <Button>Create Thumbnail Test</Button>
      </form>
    </div>
  );
}
