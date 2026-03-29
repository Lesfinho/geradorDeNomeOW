# ResenhaGenerator

Gerador de nomes para um grupo de amigos do Overwatch. Cada pessoa cadastra nomes no pool e sorteia nomes aleatórios para usar como gamertag.

## Features

- **Cadastro simples**: username + PIN de 4 dígitos (sem email/senha)
- **Pool global de nomes**: todos adicionam e sorteiam do mesmo pool
- **Limite de 12 caracteres** por nome
- **Sugestões via Markov Chain**: gera nomes novos baseados nos padrões existentes
- **Discord webhook**: notifica o grupo quando alguém registra, sorteia ou reseta PIN
- **GIFs de Roadhog**: fundo aleatório que muda a cada refresh

---

## Markov Chain — Como funciona

O gerador de sugestões (`src/markov.ts`) usa 3 estratégias que se alternam:

### 1. Markov Chain (bigram)
Analisa pares de caracteres dos nomes existentes e gera sequências que seguem os mesmos padrões.

- Olha 2 caracteres e prevê o próximo (ORDER = 2)
- Exemplo: se muitos nomes têm "ar" seguido de "p", ele tende a gerar nomes com "arp"
- Gera nomes de 3-12 caracteres

### 2. Detecção de Prefixo/Sufixo
Encontra partes de nomes que se repetem em 2+ entradas.

- Se "bobo" aparece como prefixo em "boboClaps" e "boboAim", ele detecta
- Combina prefixos conhecidos com fragmentos de outros nomes
- Funciona para sufixos também (ex: "yaoi" em "carpeYaoi", "fletaYaoi")

### 3. Couple Names (Misturador)
Pega dois nomes aleatórios e corta/junta em um ponto aleatório.

- "Carpe" + "Fleta" → "Carleta" ou "Flarpe"
- Bom para gerar nomes de casal/duo

### Mínimo de dados
As sugestões só ativam com **10+ nomes** no banco. Quanto mais nomes, melhores as sugestões.

### Como melhorar as sugestões
- Adicione mais nomes ao pool (mesmo que sejam sorteados depois)
- Use nomes com padrões consistentes (prefixos/sufixos comuns do grupo)
- O Markov aprende melhor com nomes de tamanho similar

---

## GIFs de Fundo — Como customizar

O arquivo `frontend/src/gifs.js` contém uma lista de URLs de GIFs do Roadhog.

### Para adicionar/trocar GIFs:
1. Vá em [Tenor](https://tenor.com) e busque "roadhog overwatch"
2. Clique no GIF que curtir
3. Clique com botão direito → "Copiar endereço da imagem" (ou "Copy image address")
4. Cole a URL no array `roadhogGifs` em `frontend/src/gifs.js`

### Formato da URL:
```
https://media1.tenor.com/m/XXXXX/roadhog.gif
```

### Dicas:
- Use GIFs de resolução média (não precisa de 4K, o overlay escurece)
- Evite GIFs muito curtos (parecem travados)
- O GIF é escolhido aleatoriamente a cada page load
- O overlay escuro (60% opacity) garante legibilidade do texto

---

## Como rodar localmente

```bash
# 1. PostgreSQL rodando em localhost:5432 com banco "nomegenerator"

# 2. Backend
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nomegenerator" npm run dev

# 3. Frontend (outro terminal)
cd frontend && npm run dev
```

## Variáveis de ambiente (Render)

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `DATABASE_URL` | Sim | Connection string do Neon com `?sslmode=require` |
| `GROUP_SECRET` | Não | Senha do grupo para resetar PIN (default: "resenha") |
| `DISCORD_WEBHOOK_URL` | Não | URL do webhook do Discord para notificações |
| `PORT` | Não | Porta do servidor (default: 8080, Render seta automaticamente) |
