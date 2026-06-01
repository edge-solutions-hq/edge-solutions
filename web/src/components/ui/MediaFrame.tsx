import Image, {type StaticImageData} from 'next/image';

import {cn} from '@/lib/cn';

type MediaFrameProps = {
  imageSrc: string | StaticImageData;
  imageAlt: string;
  outerClassName: string;
  chromeClassName?: string;
  imageFrameClassName?: string;
  imageClassName?: string;
  imagePriority?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
};

function BrowserChrome({className}: {className?: string}) {
  return (
    <div className={cn('flex items-center gap-2', className)} aria-hidden="true">
      <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
      <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
    </div>
  );
}

export function MediaFrame({
  imageSrc,
  imageAlt,
  outerClassName,
  chromeClassName,
  imageFrameClassName,
  imageClassName = 'h-auto w-full',
  imagePriority = false,
  width = 1400,
  height = 1000,
  sizes = '(min-width: 1280px) 34rem, (min-width: 1024px) 45vw, calc(100vw - 4rem)',
}: MediaFrameProps) {
  const image = (
    <Image
      src={imageSrc}
      alt={imageAlt}
      width={width}
      height={height}
      sizes={sizes}
      className={imageClassName}
      priority={imagePriority}
    />
  );

  return (
    <div className={outerClassName}>
      <BrowserChrome className={chromeClassName} />
      {imageFrameClassName ? (
        <div className={imageFrameClassName}>
          {image}
        </div>
      ) : image}
    </div>
  );
}
