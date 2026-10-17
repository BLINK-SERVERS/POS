import { defineConfig } from "vitest/config";

// Config de pruebas. Cubre primero las funciones PURAS del dinero
// (fiscal.ts, metrics.ts, money.ts): son la lógica más delicada del POS
// y las más baratas de testear. Se ejecutan con `npm test`.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    reporters: ["default"],
  },
});
