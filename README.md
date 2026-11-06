# InfraTicket

Sistema de chamados de TI com dois ambientes: área do usuário para abertura de tickets e painel administrativo para gestão.

## Funcionalidades

**Área do Usuário**
- Formulário de abertura de chamado com dados do solicitante e descrição do problema
- Classificação automática de categoria e prioridade por palavras-chave
- Confirmação com número do ticket gerado

**Painel Admin**
- Recebimento automático dos tickets abertos
- Visualização de solicitante, descrição, categoria e prioridade
- Filtro por status (Aberto, Em atendimento, Resolvido)
- Indicadores de quantidade por status

## Stack

- HTML + CSS + JavaScript puro
- Persistência via `localStorage`
- Sem dependências externas

## Como rodar

```bash
python -m http.server 8000
# abra http://localhost:8000
```

## Autor

**João Vitor Cassiano** — [@joaocnds](https://github.com/joaocnds)
