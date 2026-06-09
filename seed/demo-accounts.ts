import { db } from "@/lib/db"
import { randomBytes, scrypt } from "node:crypto"
import { promisify } from "node:util"

const scryptAsync = promisify(scrypt)

async function hashPassword(password: string): Promise<string> {
  const saltHex = randomBytes(16).toString("hex")
  const derivedKey = (await scryptAsync(
    password,
    saltHex,
    64,
  )) as Buffer
  return `${saltHex}:${derivedKey.toString("hex")}`
}

export async function seedDemoAccounts() {
  const existing = await db.user.findFirst({
    where: { email: "demo@safeready.app" },
  })
  if (existing) {
    console.log("Demo accounts already exist, skipping.")
    return
  }

  const [ownerPassword, staffPassword] = await Promise.all([
    hashPassword("Demo1234!"),
    hashPassword("Staff1234!"),
  ])

  const owner = await db.user.create({
    data: {
      name: "Alex Demo",
      email: "demo@safeready.app",
      emailVerified: true,
    },
  })

  const staff = await db.user.create({
    data: {
      name: "Jamie Staff",
      email: "staff@demo.safeready.app",
      emailVerified: true,
    },
  })

  await db.account.createMany({
    data: [
      {
        userId: owner.id,
        accountId: owner.id,
        providerId: "credential",
        password: ownerPassword,
      },
      {
        userId: staff.id,
        accountId: staff.id,
        providerId: "credential",
        password: staffPassword,
      },
    ],
  })

  const workspace = await db.workspace.findFirst({ where: { name: "Demo Salon" } })
  if (workspace) {
    await db.workspaceMember.createMany({
      data: [
        { workspaceId: workspace.id, userId: owner.id, role: "owner" },
        { workspaceId: workspace.id, userId: staff.id, role: "staff" },
      ],
    })
    console.log(`  Linked users to workspace "${workspace.name}".`)
  }

  console.log("Seeded demo accounts:")
  console.log("  Owner: demo@safeready.app / Demo1234!")
  console.log("  Staff: staff@demo.safeready.app / Staff1234!")
}
