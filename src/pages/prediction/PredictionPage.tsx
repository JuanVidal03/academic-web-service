import { AppShell } from "@/components/app-shell";
import { PredictionForm } from "@/components/prediction-form";
import { PredictionResult, PredictionResultSkeleton } from "@/components/prediction-result";
import { useComparePrediction } from "@/hooks/use-predictions";

const PredictionPage = () => {
  const { mutate: compare, data, isPending } = useComparePrediction();

  return (
    <AppShell>
      <div>
        <h1 className="text-2xl font-semibold">Evaluar riesgo de desercion</h1>
        <p className="text-sm text-muted-foreground">
          El formulario viene con un estudiante de ejemplo. Ajusta los campos y calcula para
          ver qué dice cada modelo.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <PredictionForm onSubmit={(student) => compare(student)} isPending={isPending} />
        <div className="xl:sticky xl:top-6 xl:self-start">
          {isPending ? <PredictionResultSkeleton /> : null}
          {!isPending && data ? <PredictionResult result={data} /> : null}
          {!isPending && !data ? (
            <p className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
              Los resultados apareceran aqui.
            </p>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
};

export default PredictionPage;
