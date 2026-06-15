import 'dotenv/config'
import { PrismaClient, Role } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL não definida')
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function estimateReadingTimeMinutes(text) {
  const words = countWords(text)
  return Math.max(1, Math.ceil(words / 200))
}

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 12)
  const userPassword = await bcrypt.hash('user123', 12)

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
    create: {
      username: 'admin',
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  })

  const author = await prisma.user.upsert({
    where: { username: 'antonio' },
    update: {
      passwordHash: userPassword,
      role: Role.CONTRIBUTOR,
    },
    create: {
      username: 'antonio',
      passwordHash: userPassword,
      role: Role.CONTRIBUTOR,
    },
  })

  await prisma.articleTranslation.deleteMany()
  await prisma.article.deleteMany({
    where: {
      authorId: {
        in: [admin.id, author.id],
      },
    },
  })

  const article1 = await prisma.article.create({
    data: {
      tag: 'defi',
      cover: '/covers/defi-intro.jpg',
      published: true,
      views: 1240,
      defaultLocale: 'pt',
      featured: true,
      authorId: admin.id,
      translations: {
        create: [
          {
            locale: 'pt',
            title: 'O que é DeFi e por que isso importa',
            content: 'DeFi é um sistema financeiro descentralizado...',
            wordCount: 10,
            readingTimeMinutes: 1,
          },
          {
            locale: 'en',
            title: 'What DeFi Is and Why It Matters',
            content: 'DeFi is a decentralized financial system...',
            wordCount: 10,
            readingTimeMinutes: 1,
          },
        ],
      },
    },
  })

  console.log('Seed executada com sucesso')
  console.log({
    users: [admin.username, author.username],
    article: article1.tag,
  })
}

main()
  .catch((e) => {
    console.error('Erro ao executar seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
