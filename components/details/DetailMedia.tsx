type DetailMediaProps = {
  imageUrl?: string | null;
  alt: string;
  emptyLabel: string;
};

export default function DetailMedia({ imageUrl, alt, emptyLabel }: DetailMediaProps) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={imageUrl} alt={alt} className="h-full w-full object-cover" />
    );
  }

  return (
    <div className="flex h-full min-h-64 items-center justify-center bg-gradient-to-br from-night-900 via-night-800 to-night-700 px-6 py-10 text-center text-sm text-slate-300">
      {emptyLabel}
    </div>
  );
}
