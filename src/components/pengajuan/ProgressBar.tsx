import { prisma } from "@/lib/prisma";

export async function ProgressBar({ workflowDefinitionId, currentStepCode }: { workflowDefinitionId: number; currentStepCode: string | null }) {
  const steps = await prisma.workflowStep.findMany({
    where: { workflow_definition_id: workflowDefinitionId },
    orderBy: { step_order: "asc" },
  });

  const currentIndex = steps.findIndex((s) => s.step_code === currentStepCode);

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => {
        const isDone = i < currentIndex;
        const isCurrent = i === currentIndex;
        const color = isDone ? "bg-green-500" : isCurrent ? "bg-amber-500" : "bg-gray-300";
        return (
          <div key={step.id} className="flex items-center gap-1">
            <div className={`h-3 w-3 rounded-full ${color}`} title={step.step_code} />
            {i < steps.length - 1 && <div className={`h-0.5 w-6 ${i < currentIndex ? "bg-green-500" : "bg-gray-300"}`} />}
          </div>
        );
      })}
    </div>
  );
}
