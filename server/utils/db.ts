import mongoose from 'mongoose'

let isConnected = false

export async function connectMongoDB(): Promise<void> {
  if (isConnected) return

  try {
    await mongoose.connect(process.env.MONGODB_URL!, {
      dbName: 'challenge_together'
    })
    isConnected = true
    console.log('✅ MongoDB connecté')
  } catch (error) {
    console.error('❌ Erreur MongoDB:', error)
    throw error
  }
}
