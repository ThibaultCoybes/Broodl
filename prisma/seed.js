// prisma/seed.js - Version ES Module

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Création des utilisateurs...')
  
  // Hash pour les mots de passe
  const hashedPassword = await bcrypt.hash('password123', 12)
  
  // ===== CRÉER DES UTILISATEURS =====
  const alex = await prisma.user.create({
    data: {
      firstname: 'Alexandre',
      lastname: 'Dubois',
      username: 'alex',
      email: 'alex@test.com',
      password: hashedPassword,
      avatarUrl: '/avatars/alex.jpg'
    }
  })
  
  const marie = await prisma.user.create({
    data: {
      firstname: 'Marie',
      lastname: 'Lefevre',
      username: 'marie',
      email: 'marie@test.com',
      password: hashedPassword,
      avatarUrl: '/avatars/marie.jpg'
    }
  })
  
  const tom = await prisma.user.create({
    data: {
      firstname: 'Thomas',
      lastname: 'Martin',
      username: 'tom',
      email: 'tom@test.com',
      password: hashedPassword,
      avatarUrl: '/avatars/tom.jpg'
    }
  })
  
  console.log('✅ Utilisateurs créés:')
  console.log('👤 Alex:', alex.email)
  console.log('👤 Marie:', marie.email)
  console.log('👤 Tom:', tom.email)
  
  console.log('\n🔐 Mot de passe pour tous: password123')
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })