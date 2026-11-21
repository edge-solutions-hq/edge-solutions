import Image, {type StaticImageData} from 'next/image';

import {WindowDots} from '@/components/ui/WindowChrome';

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
  return <WindowDots className={className} />;
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
