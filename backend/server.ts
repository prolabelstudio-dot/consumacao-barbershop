import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

dotenv.config();

/**
 * INITIALIZATION
 */
const app = express();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_keep_it_safe';
const PORT = process.env.PORT || 3001;
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.NEXT_PUBLIC_SITE_URL,
  process.env.URL,
  process.env.DEPLOY_PRIME_URL,
].filter(Boolean) as string[];

// Middlewares
app.use(compression());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin not allowed: ${origin}`));
  },
}));
app.use(express.json());

/**
 * TYPES
 */
interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

/**
 * AUTH MIDDLEWARE
 */
const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido ou expirado' });
    }
    req.user = decoded;
    next();
  });
};

/**
 * ROUTES
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({ ok: true });
});

// 1. LOGIN DIRETO (ADMIN)
app.post('/api/auth/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Busca ou cria o administrador master
    let user = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: "Lojista Master",
          phone: "admin",
          passwordHash: "managed_locally",
          role: "ADMIN"
        }
      });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, role: user.role }
    });
  } catch (error) {
    next(error);
  }
});

// 2. ADMIN: LISTAR CLIENTES
app.get('/api/admin/users', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: "Acesso negado" });

    const users = await prisma.user.findMany({
      where: { role: 'CLIENT' },
      select: {
        id: true,
        name: true,
        phone: true,
        totalPoints: true,
        currentTier: true,
        _count: { select: { transactions: true } }
      },
      orderBy: { totalPoints: 'desc' }
    });

    res.json(users);
  } catch (error) {
    next(error);
  }
});

// 3. ADMIN: CADASTRAR CLIENTE
app.post('/api/admin/register-client', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: "Acesso negado" });

    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: "Nome e Telefone são obrigatórios" });
    }

    const cleanedPhone = phone.replace(/\D/g, ''); // Remove caracteres não numéricos

    const existing = await prisma.user.findUnique({ where: { phone: cleanedPhone } });
    if (existing) {
      return res.status(400).json({ error: "Este telefone já está cadastrado" });
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        phone: cleanedPhone,
        passwordHash: "no_password_needed",
        role: "CLIENT"
      }
    });

    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    next(error);
  }
});

// 4. ADMIN: ADICIONAR PONTOS
app.post('/api/admin/add-points', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: "Acesso negado" });

    const { targetPhone, amountSpent, pointsEarned, description } = req.body;

    if (!targetPhone || pointsEarned === undefined) {
      return res.status(400).json({ error: "Telefone e pontos são obrigatórios" });
    }

    const targetUser = await prisma.user.findUnique({ where: { phone: targetPhone } });
    if (!targetUser) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    // Cálculo de Nível (Gamificação)
    const newTotalPoints = targetUser.totalPoints + Number(pointsEarned);
    let newTier = targetUser.currentTier;

    if (newTotalPoints >= 2000) newTier = "Viking";
    else if (newTotalPoints >= 500) newTier = "Lenhador";
    else newTier = "Recruta";

    // Transação Atômica: Atualiza usuário e cria registro de transação
    const [updatedUser, transaction] = await prisma.$transaction([
      prisma.user.update({
        where: { id: targetUser.id },
        data: { totalPoints: newTotalPoints, currentTier: newTier }
      }),
      prisma.transaction.create({
        data: {
          amountSpent: Number(amountSpent || 0),
          pointsEarned: Number(pointsEarned),
          description: description || "Consumo na barbearia",
          userId: targetUser.id,
          adminId: req.user?.id
        }
      })
    ]);

    res.json({
      success: true,
      transaction,
      newTotalPoints: updatedUser.totalPoints,
      newTier: updatedUser.currentTier
    });
  } catch (error) {
    next(error);
  }
});

// 5. ADMIN: ÚLTIMAS TRANSAÇÕES GERAIS
app.get('/api/admin/transactions', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: "Acesso negado" });

    const transactions = await prisma.transaction.findMany({
      take: 50,
      orderBy: { date: 'desc' },
      include: {
        user: { select: { name: true, phone: true } }
      }
    });

    res.json(transactions);
  } catch (error) {
    next(error);
  }
});

// 6. ADMIN: RESGATAR RECOMPENSA (SUBTRAI PONTOS)
app.post('/api/admin/redeem-reward', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: "Acesso negado" });

    const { targetPhone, description, pointsCost } = req.body;

    if (!targetPhone || pointsCost === undefined) {
      return res.status(400).json({ error: "Telefone e custo em pontos são obrigatórios" });
    }

    const targetUser = await prisma.user.findUnique({ where: { phone: targetPhone } });
    if (!targetUser) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    const cost = Number(pointsCost);
    if (targetUser.totalPoints < cost) {
      return res.status(400).json({ error: "Saldo de pontos insuficiente para este resgate" });
    }

    const newTotalPoints = targetUser.totalPoints - cost;

    // Recalcula Tier baseado no novo saldo
    let newTier = "Recruta";
    if (newTotalPoints >= 2000) newTier = "Viking";
    else if (newTotalPoints >= 500) newTier = "Lenhador";

    // Transação Atômica: Subtrai pontos e registra o resgate
    await prisma.$transaction([
      prisma.user.update({
        where: { id: targetUser.id },
        data: {
          totalPoints: newTotalPoints,
          currentTier: newTier
        }
      }),
      prisma.transaction.create({
        data: {
          amountSpent: 0,
          pointsEarned: -cost,
          description: description || "Resgate de Recompensa",
          userId: targetUser.id,
          adminId: req.user?.id
        }
      })
    ]);

    res.json({
      success: true,
      newTotalPoints,
      message: "Recompensa resgatada com sucesso."
    });
  } catch (error) {
    next(error);
  }
});

// 7. ADMIN: EXCLUIR CLIENTE
app.delete('/api/admin/users/:id', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: "Acesso negado" });

    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!id) return res.status(400).json({ error: "ID do cliente e obrigatorio" });

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true }
    });

    if (!targetUser || targetUser.role !== 'CLIENT') {
      return res.status(404).json({ error: "Cliente nao encontrado" });
    }

    await prisma.$transaction([
      prisma.transaction.deleteMany({ where: { userId: id } }),
      prisma.user.delete({ where: { id } })
    ]);

    res.json({ success: true, message: "Cliente excluido com sucesso." });
  } catch (error) {
    next(error);
  }
});

// 7. SAAS: CONFIGURAÇÃO LOCAL
app.get('/api/config', async (req: Request, res: Response) => {
  try {
    const config = await prisma.config.findFirst({ where: { id: 1 } });
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar configuração" });
  }
});

app.post('/api/config/activate', async (req: Request, res: Response) => {
  try {
    const { licenseKey, machineId } = req.body;
    const updated = await prisma.config.update({
      where: { id: 1 },
      data: {
        licenseKey,
        machineId,
        isActivated: true,
        activationDate: new Date()
      }
    });
    res.json({ success: true, config: updated });
  } catch (error) {
    res.status(500).json({ error: "Erro ao ativar licença" });
  }
});

// 8. SAAS: GESTÃO DE PRODUTOS E SERVIÇOS
app.get('/api/products', async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({ where: { active: true } });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar produtos" });
  }
});

app.post('/api/products', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: "Acesso negado" });
    const { name, price, category, pointsAward, stock } = req.body;
    const product = await prisma.product.create({
      data: {
        name,
        price: Number(price),
        category,
        pointsAward: Number(pointsAward),
        stock: Number(stock || 0)
      }
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Erro ao salvar produto" });
  }
});

/**
 * ERROR HANDLER
 */
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Critical Backend Error:", err);

  // Tratamento de erros específicos do Prisma
  if (err.code === 'P2002') {
    return res.status(400).json({ error: 'Já existe um registro com este dado único.' });
  }

  res.status(500).json({
    error: "Ocorreu um erro interno no servidor.",
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

/**
 * SERVER START
 */
app.listen(PORT, () => {
  console.log(`
  🚀 BARBER-POINTS BACKEND ATIVO
  ------------------------------------
  Porta:    ${PORT}
  Ambiente: ${process.env.NODE_ENV || 'development'}
  DB Type:  SQLite
  ------------------------------------
  `);
});

// Graceful Shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
