import type { Handler } from "@netlify/functions";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

type JwtPayload = { id: string; role: string };

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_keep_it_safe";
const prisma = new PrismaClient();

const json = (statusCode: number, body: unknown) => ({
  statusCode,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

const parseBody = (raw: string | null) => {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const getPath = (rawPath: string) =>
  rawPath
    .replace(/^\/\.netlify\/functions\/api/, "")
    .replace(/^\/api/, "") || "/";

const getTokenPayload = (authHeader?: string): JwtPayload | null => {
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
};

export const handler: Handler = async (event) => {
  try {
    const method = event.httpMethod;
    const path = getPath(event.path || "/");
    const body = parseBody(event.body);

    if (method === "GET" && path === "/health") {
      return json(200, { ok: true });
    }

    if (method === "POST" && path === "/auth/login") {
      let user = await prisma.user.findFirst({ where: { role: "ADMIN" } });

      if (!user) {
        user = await prisma.user.create({
          data: {
            name: "Lojista Master",
            phone: "admin",
            passwordHash: "managed_locally",
            role: "ADMIN",
          },
        });
      }

      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
      return json(200, {
        success: true,
        token,
        user: { id: user.id, name: user.name, role: user.role },
      });
    }

    if (method === "GET" && path === "/products") {
      const products = await prisma.product.findMany({ where: { active: true } });
      return json(200, products);
    }

    if (method === "POST" && path === "/products") {
      const payload = getTokenPayload(event.headers.authorization || event.headers.Authorization);
      if (!payload) return json(401, { error: "Token nao fornecido" });
      if (payload.role !== "ADMIN") return json(403, { error: "Acesso negado" });

      const { name, price, category, pointsAward, stock } = body as Record<string, unknown>;
      const product = await prisma.product.create({
        data: {
          name: String(name || ""),
          price: Number(price || 0),
          category: String(category || "Servico"),
          pointsAward: Number(pointsAward || 10),
          stock: Number(stock || 0),
        },
      });
      return json(200, product);
    }

    if (path.startsWith("/admin")) {
      const payload = getTokenPayload(event.headers.authorization || event.headers.Authorization);
      if (!payload) return json(401, { error: "Token nao fornecido" });
      if (payload.role !== "ADMIN") return json(403, { error: "Acesso negado" });

      if (method === "GET" && path === "/admin/users") {
        const users = await prisma.user.findMany({
          where: { role: "CLIENT" },
          select: {
            id: true,
            name: true,
            phone: true,
            totalPoints: true,
            currentTier: true,
            _count: { select: { transactions: true } },
          },
          orderBy: { totalPoints: "desc" },
        });
        return json(200, users);
      }

      if (method === "POST" && path === "/admin/register-client") {
        const { name, phone } = body as Record<string, unknown>;
        const rawPhone = String(phone || "");
        const cleanPhone = rawPhone.replace(/\D/g, "");

        if (!name || !cleanPhone) {
          return json(400, { error: "Nome e Telefone sao obrigatorios" });
        }

        const existing = await prisma.user.findUnique({ where: { phone: cleanPhone } });
        if (existing) return json(400, { error: "Este telefone ja esta cadastrado" });

        const user = await prisma.user.create({
          data: {
            name: String(name),
            phone: cleanPhone,
            passwordHash: "no_password_needed",
            role: "CLIENT",
          },
        });
        return json(201, { success: true, user });
      }

      if (method === "POST" && path === "/admin/add-points") {
        const { targetPhone, amountSpent, pointsEarned, description } = body as Record<string, unknown>;
        if (!targetPhone || pointsEarned === undefined) {
          return json(400, { error: "Telefone e pontos sao obrigatorios" });
        }

        const target = await prisma.user.findUnique({ where: { phone: String(targetPhone) } });
        if (!target) return json(404, { error: "Cliente nao encontrado" });

        const earned = Number(pointsEarned);
        const newTotalPoints = target.totalPoints + earned;
        const newTier = newTotalPoints >= 2000 ? "Viking" : newTotalPoints >= 500 ? "Lenhador" : "Recruta";

        const [updatedUser, transaction] = await prisma.$transaction([
          prisma.user.update({
            where: { id: target.id },
            data: { totalPoints: newTotalPoints, currentTier: newTier },
          }),
          prisma.transaction.create({
            data: {
              amountSpent: Number(amountSpent || 0),
              pointsEarned: earned,
              description: String(description || "Consumo na barbearia"),
              userId: target.id,
              adminId: payload.id,
            },
          }),
        ]);

        return json(200, {
          success: true,
          transaction,
          newTotalPoints: updatedUser.totalPoints,
          newTier: updatedUser.currentTier,
        });
      }

      if (method === "POST" && path === "/admin/redeem-reward") {
        const { targetPhone, description, pointsCost } = body as Record<string, unknown>;
        if (!targetPhone || pointsCost === undefined) {
          return json(400, { error: "Telefone e custo em pontos sao obrigatorios" });
        }

        const target = await prisma.user.findUnique({ where: { phone: String(targetPhone) } });
        if (!target) return json(404, { error: "Cliente nao encontrado" });

        const cost = Number(pointsCost);
        if (target.totalPoints < cost) {
          return json(400, { error: "Saldo de pontos insuficiente para este resgate" });
        }

        const newTotalPoints = target.totalPoints - cost;
        const newTier = newTotalPoints >= 2000 ? "Viking" : newTotalPoints >= 500 ? "Lenhador" : "Recruta";

        await prisma.$transaction([
          prisma.user.update({
            where: { id: target.id },
            data: { totalPoints: newTotalPoints, currentTier: newTier },
          }),
          prisma.transaction.create({
            data: {
              amountSpent: 0,
              pointsEarned: -cost,
              description: String(description || "Resgate de Recompensa"),
              userId: target.id,
              adminId: payload.id,
            },
          }),
        ]);

        return json(200, {
          success: true,
          newTotalPoints,
          message: "Recompensa resgatada com sucesso.",
        });
      }

      if (method === "DELETE" && path.startsWith("/admin/users/")) {
        const id = path.replace("/admin/users/", "");
        if (!id) return json(400, { error: "ID do cliente e obrigatorio" });

        const target = await prisma.user.findUnique({
          where: { id },
          select: { id: true, role: true },
        });
        if (!target || target.role !== "CLIENT") return json(404, { error: "Cliente nao encontrado" });

        await prisma.$transaction([
          prisma.transaction.deleteMany({ where: { userId: id } }),
          prisma.user.delete({ where: { id } }),
        ]);

        return json(200, { success: true, message: "Cliente excluido com sucesso." });
      }
    }

    return json(404, { error: "Rota nao encontrada" });
  } catch (error) {
    console.error("API Function Error", error);
    return json(500, { error: "Erro interno no servidor" });
  }
};
