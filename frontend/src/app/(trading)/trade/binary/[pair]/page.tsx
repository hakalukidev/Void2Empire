interface PageProps {
  params: Promise<{ pair: string }>;
}

export default async function TradeBinaryPairPage({ params }: PageProps) {
  const { pair } = await params;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Pair: {pair}</h1>
      <p className="mt-2 text-sm text-muted-foreground">This screen is a placeholder pending implementation.</p>
    </div>
  );
}
