## Netlify Only (frontend + API)

Este projeto agora roda com:
- Frontend estatico (Next export)
- API em Netlify Functions (`/api/*`)
- Banco PostgreSQL externo (recomendado: Neon free)

### 1) Criar banco Postgres gratis
- Crie um projeto no Neon e copie a connection string.

### 2) Variaveis no Netlify
Em `Site settings -> Environment variables`, crie:
- `DATABASE_URL` = string do Neon
- `JWT_SECRET` = chave longa aleatoria

Opcional para primeiro deploy:
- `NETLIFY_NEXT_PLUGIN_SKIP` = `true`

### 3) Primeiro deploy
- Trigger deploy no Netlify.

### 4) Criar tabelas no banco
No terminal local, dentro de `frontend`, rode:
```bash
npm install
npm run prisma:push
```

Depois rode novo deploy no Netlify.

### 5) Teste
- `https://SEU_SITE.netlify.app/api/health` deve retornar `{ "ok": true }`.
- Login admin pela tela do painel.
