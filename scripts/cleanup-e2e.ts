import { prisma } from "../src/lib/prisma";

async function main() {
  const testNim = "221360099";
  const mhs = await prisma.mahasiswa.findUnique({ where: { nim: testNim } });
  if (mhs) {
    await prisma.user.deleteMany({ where: { mahasiswa_id: mhs.id } });
    await prisma.mahasiswa.delete({ where: { nim: testNim } });
    console.log(`[cleanup-e2e] deleted test mahasiswa NIM ${testNim}`);
  } else {
    console.log(`[cleanup-e2e] NIM ${testNim} not found, nothing to clean`);
  }
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
