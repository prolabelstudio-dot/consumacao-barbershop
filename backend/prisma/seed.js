const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Inicializa Config
    const config = await prisma.config.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            shopName: "Minha Barbearia Premium",
            isActivated: false
        }
    });
    console.log('Config inicializada:', config);

    // Inicializa alguns serviços padrão
    const services = [
        { name: "Corte de Cabelo", price: 40, category: "Serviço", pointsAward: 10 },
        { name: "Barba", price: 25, category: "Serviço", pointsAward: 10 },
        { name: "Combo (Corte + Barba)", price: 60, category: "Serviço", pointsAward: 20 },
        { name: "Água", price: 5, category: "Produto", pointsAward: 0, stock: 50 },
        { name: "Cerveja", price: 10, category: "Produto", pointsAward: 0, stock: 24 }
    ];

    for (const s of services) {
        const existing = await prisma.product.findFirst({ where: { name: s.name } });
        if (existing) {
            await prisma.product.update({ where: { id: existing.id }, data: s });
        } else {
            await prisma.product.create({ data: s });
        }
    }
    console.log('Serviços e Produtos iniciais sincronizados.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
