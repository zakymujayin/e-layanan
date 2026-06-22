import { prisma } from "@/lib/prisma";

export async function ProgressBar({ workflowDefinitionId, currentStepCode }: { workflowDefinitionId: number; currentStepCode: string | null }) {
  const steps = await prisma.workflowStep.findMany({
    where: { workflow_definition_id: workflowDefinitionId },
    orderBy: { step_order: "asc" },
  });

  const currentIndex = steps.findIndex((s) => s.step_code === currentStepCode);

  return (
    <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
      {steps.map((step, i) => {
        const isDone = i < currentIndex;
        const isCurrent = i === currentIndex;
        const dotColor = isDone
          ? "bg-green-500 ring-2 ring-green-200 dark:ring-green-900"
          : isCurrent
            ? "bg-amber-500 ring-2 ring-amber-200 dark:ring-amber-900 animate-pulse"
            : "bg-gray-300 dark:bg-gray-600";
        const lineColor = i < currentIndex ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600";
        return (
          <div key={step.id} className="flex items-center gap-1">
            <div
              className={`h-3 w-3 rounded-full shrink-0 ${dotColor}`}
              title={`${step.step_code}${isDone ? " (selesai)" : isCurrent ? " (sedang berlangsung)" : ""}`}
            />
            {i < steps.length - 1 && <div className={`h-0.5 w-6 rounded ${lineColor}`} />}
          </div>
        );
      })}
    </div>
  );
}
