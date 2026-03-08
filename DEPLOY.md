# Deploy (Netlify + Render)

## 1) Backend (Render)
- Crie um `Blueprint` no Render usando este repositório.
- O arquivo `render.yaml` já configura o serviço `consumacao-barbershop-api`.
- Após o deploy, copie a URL pública do backend (ex.: `https://consumacao-barbershop-api.onrender.com`).
- No Render, em `Environment`, ajuste `FRONTEND_URL` para a URL do seu site Netlify.

## 2) Frontend (Netlify)
- Em `Site settings -> Environment variables`, crie:
  - `NEXT_PUBLIC_API_BASE_URL` = URL pública do backend no Render.
- Faça um novo deploy do site.

## 3) Teste rápido
- Backend: `GET https://SEU_BACKEND/health` deve retornar `{ "ok": true }`.
- Login: no site Netlify, clique em `Acessar Painel`.
