const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Checking DB connection...");
    const userCount = await prisma.user.count();
    console.log(`Users: ${userCount}`);
    
    // Check if we can create a file asset (dummy)
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log("No users found. Cannot test FileAsset creation.");
      return;
    }
    
    const key = `test-upload-${Date.now()}`;
    console.log(`Creating test FileAsset with key: ${key} for user: ${user.id}`);
    
    const asset = await prisma.fileAsset.create({
      data: {
        userId: user.id,
        key: key,
        url: `/uploads/${key}`,
        mime: "image/png",
        size: 1024
      }
    });
    
    console.log("FileAsset created successfully:", asset);
    
    // Clean up
    await prisma.fileAsset.delete({
      where: { id: asset.id }
    });
    console.log("Test FileAsset deleted.");
    
  } catch (error) {
    console.error("DB Check Failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => console.log("Done"))
  .catch((e) => console.error(e));
