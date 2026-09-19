# 🚀 Guia de Deploy no Portainer / Docker (NEXA CRM)

Este guia explica exatamente como rodar o NEXA CRM na sua VPS via Portainer sem nenhum conflito.

---

## 1. Por que parou de responder após a migração para a VPS?

Identificamos os 3 motivos técnicos exatos:
1. **WhatsApp Desconectado na Evolution API:** O WhatsApp da instância `agente-ia` sofreu desconexão (`device_removed`). Com isso, a Evolution ficou em estado `close` (fechada) e não recebia nem enviava mensagens até um novo escaneamento de QR Code.
2. **Webhook apontando para o endereço antigo:** A Evolution API envia as mensagens para uma URL de webhook. Na VPS, o webhook precisa apontar para o domínio ou IP onde o CRM está rodando (`https://seu-dominio/api/webhook`).
3. **Persistência de Dados (Volume no Docker):** Corrigimos o `Dockerfile` e o `docker-compose.yml` para criar o volume persistente `nexa_data:/app/data`, garantindo que contatos, histórico e configurações não sejam perdidos ao reiniciar o container.

---

## 2. Docker Compose para o Portainer (Stack)

Copie e cole este código diretamente na aba **Stacks -> Add Stack** no seu Portainer:

```yaml
version: '3.8'

services:
  nexa-crm:
    image: node:20-alpine
    container_name: nexa-crm
    restart: always
    working_dir: /app
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - GEMINI_API_KEY=SUA_CHAVE_GEMINI_AQUI
      - EVOLUTION_API_URL=https://api.makprojetosmake.com.br
      - EVOLUTION_API_KEY=b2efa885a71ee22edf72b597df1a0ce9
      - EVOLUTION_INSTANCE=agente-ia
      - SUPABASE_URL=https://pejcssjahomczedjzqzr.supabase.co/rest/v1/
      - SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlamNzc2phaG9tY3plZGp6cXpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTI1OTg2MiwiZXhwIjoyMTA0ODM1ODYyfQ.VYNhGfHlojrkA7c3TOGTppfzoxty-X9YWEeLiYu4hVw
    volumes:
      - nexa_crm_data:/app/data
    networks:
      - default

volumes:
  nexa_crm_data:
    name: nexa_crm_data

networks:
  default:
    name: nexa_network
```

---

## 3. Passo a Passo de Ativação

1. **Suba a Stack no Portainer** (ou use a imagem gerada pelo Dockerfile).
2. **Acesse o CRM** no navegador (ex: `http://IP_DA_SUA_VPS:3000` ou pelo seu subdomínio reverso no Nginx Proxy Manager).
3. **Vá na aba "WhatsApp & Evolution":**
   - Clique no botão **"Gravar Webhook Automaticamente na VPS"**. Ele vai configurar a Evolution API para enviar todas as mensagens diretamente para o seu novo endereço.
   - Clique em **"Conectar / Ver QR Code"** e leia o QR Code com o WhatsApp do seu celular (**Aparelhos Conectados -> Conectar um aparelho**).
4. **Pronto!** A Sofia atenderá áudios e textos automaticamente com transcrição e inteligência artificial.
