import Image, {type StaticImageData} from 'next/image';

import {cn} from '@/lib/cn';

type ProofMediaFrameProps = {
  imageSrc: string | StaticImageData;
  imageAlt: string;
  outerClassName: string;
  chromeClassName?: string;
  imageFrameClassName?: string;
  imageClassName?: string;
  width?: number;
  height?: number;
};

function ProofBrowserChrome({className}: {className?: string}) {
  return (
    <div className={cn('flex items-center gap-2', className)} aria-hidden="true">
      <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
      <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
    </div>
  );
}

export function ProofMediaFrame({
  imageSrc,
  imageAlt,
  outerClassName,
  chromeClassName,
  imageFrameClassName,
  imageClassName = 'h-auto w-full',
  width = 1400,
  height = 1000,
}: ProofMediaFrameProps) {
  const image = (
    <Image
      src={imageSrc}
      alt={imageAlt}
      width={width}
      height={height}
      className={imageClassName}
    />
  );

  return (
    <div className={outerClassName}>
      <ProofBrowserChrome className={chromeClassName} />
      {imageFrameClassName ? (
        <div className={imageFrameClassName}>
          {image}
        </div>
      ) : image}
    </div>
  );
}
