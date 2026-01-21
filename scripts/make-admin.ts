/**
 * Update User Role to ADMIN
 * Quick script for development
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Get all users
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true }
  })
  
  console.log('📋 Current users:')
  users.forEach((u, i) => {
    console.log(`  ${i + 1}. ${u.email} - ${u.name} [${u.role}]`)
  })
  
  if (users.length === 0) {
    console.log('❌ No users found!')
    return
  }
  
  // Update the most recent non-admin user to ADMIN
  const userToUpdate = users.find(u => u.role !== 'ADMIN') || users[0]
  
  console.log(`\n🔧 Updating ${userToUpdate.email} to ADMIN...`)
  
  await prisma.user.update({
    where: { id: userToUpdate.id },
    data: { role: 'ADMIN' }
  })
  
  console.log('✅ User updated successfully!')
  console.log(`   ${userToUpdate.email} is now ADMIN`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
