import { prisma } from "@/lib/prisma";

export async function validateTransition(
  workflowDefinitionId: number,
  currentStepCode: string | null,
  action: string
) {
  const step = await prisma.workflowStep.findFirst({
    where: { workflow_definition_id: workflowDefinitionId, step_code: currentStepCode ?? undefined },
    include: { actions: true },
  });

  if (!step) {
    throw new Error("ERR_BUS_INVALID_STATE_TRANSITION: Step tidak ditemukan");
  }

  const validAction = step.actions.find((a) => a.action_code === action);
  if (!validAction) {
    throw new Error(`ERR_BUS_INVALID_STATE_TRANSITION: Action '${action}' tidak valid`);
  }

  return { step, actionDef: validAction, targetStatus: validAction.target_status };
}
