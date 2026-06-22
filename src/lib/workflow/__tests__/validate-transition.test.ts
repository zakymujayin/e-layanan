import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateTransition } from "../validate-transition";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    workflowStep: {
      findFirst: vi.fn(),
    },
  },
}));

describe("validateTransition", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns target status and step for a valid action", async () => {
    const mockStep = {
      id: 1,
      workflow_definition_id: 1,
      step_code: "submitted",
      step_order: 1,
      status_code: "pending_staff_prodi",
      actor_type: "staff_prodi",
      actor_condition: null,
      sla_days: null,
      sla_consequence: null,
      actions: [
        {
          id: 1,
          workflow_step_id: 1,
          action_code: "approve",
          target_status: "pending_kaprodi",
          requires_reason: false,
          requires_confirmation: false,
          label: "Setujui",
          actionConfig: null,
        },
      ],
    };

    vi.mocked(prisma.workflowStep.findFirst).mockResolvedValue(mockStep as any);

    const result = await validateTransition(1, "submitted", "approve");

    expect(result.targetStatus).toBe("pending_kaprodi");
    expect(result.step.actor_type).toBe("staff_prodi");
    expect(result.actionDef.action_code).toBe("approve");
    expect(prisma.workflowStep.findFirst).toHaveBeenCalledWith({
      where: { workflow_definition_id: 1, step_code: "submitted" },
      include: { actions: true },
    });
  });

  it("throws ERR_BUS_INVALID_ACTION when action is not allowed on current step", async () => {
    const mockStep = {
      id: 1,
      workflow_definition_id: 1,
      step_code: "submitted",
      step_order: 1,
      status_code: "pending_staff_prodi",
      actor_type: "staff_prodi",
      actor_condition: null,
      sla_days: null,
      sla_consequence: null,
      actions: [
        {
          id: 1,
          workflow_step_id: 1,
          action_code: "approve",
          target_status: "pending_kaprodi",
          requires_reason: false,
          requires_confirmation: false,
          label: "Setujui",
          actionConfig: null,
        },
      ],
    };

    vi.mocked(prisma.workflowStep.findFirst).mockResolvedValue(mockStep as any);

    await expect(validateTransition(1, "submitted", "reject")).rejects.toThrow(
      "ERR_BUS_INVALID_ACTION"
    );
  });

  it("throws ERR_BUS_INVALID_STATE_TRANSITION when current step is not found", async () => {
    vi.mocked(prisma.workflowStep.findFirst).mockResolvedValue(null);

    await expect(validateTransition(1, "nonexistent", "approve")).rejects.toThrow(
      "ERR_BUS_INVALID_STATE_TRANSITION"
    );
  });

  it("handles null current step code", async () => {
    const mockStep = {
      id: 1,
      workflow_definition_id: 1,
      step_code: null as string | null,
      step_order: 0,
      status_code: "draft",
      actor_type: "mahasiswa",
      actor_condition: null,
      sla_days: null,
      sla_consequence: null,
      actions: [
        {
          id: 1,
          workflow_step_id: 1,
          action_code: "submit",
          target_status: "submitted",
          requires_reason: false,
          requires_confirmation: false,
          label: "Ajukan",
          actionConfig: null,
        },
      ],
    };

    vi.mocked(prisma.workflowStep.findFirst).mockResolvedValue(mockStep as any);

    const result = await validateTransition(1, null, "submit");

    expect(result.targetStatus).toBe("submitted");
    expect(result.step.actor_type).toBe("mahasiswa");
  });
});
